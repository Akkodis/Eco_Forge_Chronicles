import { ethers } from "hardhat";
import {
    saveContractAbiAndAddress,
    readAssetConfig,
    readDeployedContracts,
} from "../utils/fileUtils";
import { DeployedContracts, VerifyContractConfig } from "../utils/configInterfaces";
import { progressBar, printPhaseHeader } from "../utils/logger";
import {
    ERC20DeployAndRegisterToken,
    ERC721DeployAndRegisterToken,
} from "../utils/configInterfaces";
import { verifyContract } from "../utils/verificationUtils";

type ERC20EcoBoundDeployArgs = [string, string, string, boolean, boolean, bigint];
type ERC20SimpleDeployArgs = [string, string, bigint];
type ERC721SimpleDeployArgs = [string, string, string];
type ERC721RedeemableDeployArgs = [string, string, string, string];

async function deployTokens(
    tokens: (ERC20DeployAndRegisterToken | ERC721DeployAndRegisterToken)[],
    contractsToVerify: VerifyContractConfig[],
    deployedContracts: DeployedContracts
) {
    for (const [index, token] of tokens.entries()) {
        const contractType = token.contractType;
        const header = `Deploying ${contractType}: ${token.name}`;
        printPhaseHeader(header);

        const TokenFactory = await ethers.getContractFactory(contractType);

        let deployArgs: any[];

        switch (contractType) {
            case "ERC20EcoBound":
                const ecoBoundToken = token as ERC20DeployAndRegisterToken;
                const maxSupplyEco = ethers.parseUnits(ecoBoundToken.maxSupply, 18);
                deployArgs = [
                    ecoBoundToken.name,
                    ecoBoundToken.symbol,
                    ecoBoundToken.tokenURI || "",
                    ecoBoundToken.ecoBound,
                    ecoBoundToken.releasable || false,
                    maxSupplyEco,
                ] as ERC20EcoBoundDeployArgs;
                break;
            case "ERC20Simple":
                const simpleToken = token as ERC20DeployAndRegisterToken;
                const maxSupplySimple = ethers.parseUnits(simpleToken.maxSupply, 18);
                deployArgs = [simpleToken.name, simpleToken.symbol, maxSupplySimple] as ERC20SimpleDeployArgs;
                break;
            case "ERC721Simple":
                const erc721SimpleToken = token as ERC721DeployAndRegisterToken;
                deployArgs = [erc721SimpleToken.name, erc721SimpleToken.symbol, erc721SimpleToken.baseURI || ""] as ERC721SimpleDeployArgs;
                break;
            case "ERC721Redeemable":
                const erc721RedeemableToken = token as ERC721DeployAndRegisterToken;
                const redemptionContractAddress = deployedContracts["SimpleIncentiveMechanism"]?.address;

                if (!redemptionContractAddress) {
                    throw new Error(`SimpleIncentiveMechanism address not found. Ensure it is deployed before deploying ${token.name}`);
                }

                if (!erc721RedeemableToken.baseURI) {
                    throw new Error(`baseURI is required for ERC721Redeemable token: ${token.name}`);
                }

                deployArgs = [
                    erc721RedeemableToken.name,
                    erc721RedeemableToken.symbol,
                    redemptionContractAddress,
                    erc721RedeemableToken.baseURI
                ] as ERC721RedeemableDeployArgs;
                break;
            default:
                console.error(`Unknown contract type: ${contractType}`);
                continue;
        }

        console.log(`\nDeploy Args for ${contractType}:`, deployArgs);

        try {
            const deployedToken = await TokenFactory.deploy(...deployArgs);
            await deployedToken.waitForDeployment();
            const deployedAddress = await deployedToken.getAddress();

            console.log(`${contractType} (${token.name}) deployed at address: ${deployedAddress}`);
            await saveContractAbiAndAddress(deployedToken, token.name, contractType);

            contractsToVerify.push({
                name: token.name,
                address: deployedAddress.toString(),
                constructorArguments: deployArgs,
            });

            progressBar.update(20 + index * 10, { task: `${contractType} ${token.name} deployed` });
        } catch (error) {
            console.error(`Error deploying ${contractType} (${token.name}):`, error);
            progressBar.update(20 + index * 10, { task: `${contractType} ${token.name} Deployment failed` });
        }
    }
}

export async function deployAssets(): Promise<void> {
    printPhaseHeader("Deploying Assets");
    progressBar.start(100, 0, { task: "Initializing asset deployment" });

    const assetConfig = readAssetConfig();
    const { verifyContracts, assets } = assetConfig;

    const deployedContracts: DeployedContracts = readDeployedContracts();

    const contractsToVerify: VerifyContractConfig[] = [];

    const { ERC20Tokens, ERC721Tokens } = assets;

    const allERC20DeployTokens = [
        ...ERC20Tokens.PaymentTokens.deployAndRegister,
        ...ERC20Tokens.SimpleTokens.deployAndRegister,
    ];

    await deployTokens(allERC20DeployTokens, contractsToVerify, deployedContracts);

    const allERC721DeployTokens = [
        ...ERC721Tokens.RedeemableTokens.deployAndRegister,
        ...ERC721Tokens.SimpleTokens.deployAndRegister,
    ];

    await deployTokens(allERC721DeployTokens, contractsToVerify, deployedContracts);

    console.log("All tokens have been successfully deployed.");
    progressBar.update(50, { task: "All tokens deployed" });

    if (verifyContracts) {
        printPhaseHeader("Verifying Deployed Assets");
        progressBar.update(55, { task: "Starting verification" });

        for (const [i, contract] of contractsToVerify.entries()) {
            const progressStep = 55 + i + 1;
            await verifyContract(contract, progressStep);
        }

        progressBar.update(80, { task: "Verification completed" });
    } else {
        console.log("Verification is disabled in the configuration. Skipping verification step.");
        progressBar.update(80, { task: "Verification skipped" });
    }

    progressBar.update(100, { task: "Asset deployment completed" });
    progressBar.stop();
    console.log("Asset deployment and verification completed successfully.");
}

if (require.main === module) {
    deployAssets()
        .then(() => process.exit(0))
        .catch((error) => {
            progressBar.stop();
            console.error("An error occurred during asset deployment:");
            console.error(error);
            process.exit(1);
        });
}