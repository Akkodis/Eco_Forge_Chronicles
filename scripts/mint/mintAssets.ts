import { ethers } from "hardhat";
import { readAssetConfig, readDeployedContracts } from "../utils/fileUtils";
import { progressBar, printPhaseHeader } from "../utils/logger";
import {
    ERC20DeployAndRegisterToken,
    ERC721DeployAndRegisterToken,
    DeployedContracts
} from "../utils/configInterfaces";

/**
 * Type guard to determine if a token is an ERC20 token.
 * @param token The token to check.
 * @returns True if the token is an ERC20 token, false otherwise.
 */
function isERC20DeployAndRegisterToken(token: ERC20DeployAndRegisterToken | ERC721DeployAndRegisterToken): token is ERC20DeployAndRegisterToken {
    return token.contractType === "ERC20EcoBound" || token.contractType === "ERC20Simple";
}

/**
 * Mints assets to the DevelopmentVault.
 */
export async function mintAssets(): Promise<void> {
    printPhaseHeader("Minting Assets to DevelopmentVault");
    progressBar.start(100, 0, { task: "Initializing asset minting" });

    const [deployer] = await ethers.getSigners();
    const assetConfig = readAssetConfig();

    const deployedContracts: DeployedContracts = readDeployedContracts();
    const developmentVaultAddress = deployedContracts["DevelopmentVault"]?.address;

    if (!developmentVaultAddress) {
        throw new Error("DevelopmentVault address not found. Please deploy the DevelopmentVault first.");
    }

    progressBar.update(10, { task: "Fetched DevelopmentVault address" });

    const { ERC20Tokens, ERC721Tokens } = assetConfig.assets;

    const allTokensToMint: (ERC20DeployAndRegisterToken | ERC721DeployAndRegisterToken)[] = [
        ...ERC20Tokens.PaymentTokens.deployAndRegister.filter(token => token.shouldMint),
        ...ERC20Tokens.SimpleTokens.deployAndRegister.filter(token => token.shouldMint),
        ...ERC721Tokens.RedeemableTokens.deployAndRegister.filter(token => token.shouldMint),
        ...ERC721Tokens.SimpleTokens.deployAndRegister.filter(token => token.shouldMint),
    ];

    const tokensCount = allTokensToMint.length;
    const progressIncrement = 90 / (tokensCount * 2);

    let currentProgress = 10;

    for (const tokenToMint of allTokensToMint) {
        printPhaseHeader(`Minting ${tokenToMint.name} to DevelopmentVault`);

        currentProgress += progressIncrement;
        progressBar.update(currentProgress, { task: `Minting ${tokenToMint.name}` });

        const tokenAddress = deployedContracts[tokenToMint.name]?.address;
        if (!tokenAddress) {
            console.error(`Address for token ${tokenToMint.name} not found in deployed contracts.`);
            continue;
        }

        try {
            if (isERC20DeployAndRegisterToken(tokenToMint)) {
                const tokenContract = await ethers.getContractAt(tokenToMint.contractType, tokenAddress, deployer);
                let tx;

                if (tokenToMint.contractType === "ERC20EcoBound") {
                    const amount = ethers.parseUnits(tokenToMint.maxSupply, 18);
                    tx = await tokenContract.mint(developmentVaultAddress, amount, "0x");
                } else {
                    const amount = ethers.parseUnits(tokenToMint.maxSupply, 18);
                    tx = await tokenContract.mint(developmentVaultAddress, amount);
                }

                await tx.wait();
                console.log(`Minted ${tokenToMint.maxSupply} ${tokenToMint.symbol} to DevelopmentVault.`);
            } else if (tokenToMint.contractType === "ERC721Redeemable" || tokenToMint.contractType === "ERC721Simple") {
                const tokenContract = await ethers.getContractAt(tokenToMint.contractType, tokenAddress, deployer);

                const erc721Token = tokenToMint as ERC721DeployAndRegisterToken;

                if (!erc721Token.totalSupply || erc721Token.totalSupply <= 0) {
                    console.error(`Invalid totalSupply for ERC721 token ${erc721Token.name}.`);
                    continue;
                }

                const batchSize = 50;
                let tokensRemaining = erc721Token.totalSupply;
                let batchNumber = 1;

                while (tokensRemaining > 0) {
                    const tokensToMint = tokensRemaining > batchSize ? batchSize : tokensRemaining;
                    console.log(`Minting batch ${batchNumber} of ${erc721Token.name}, tokens: ${tokensToMint}`);

                    let tx;

                    if (tokenToMint.contractType === "ERC721Redeemable" || tokenToMint.contractType === "ERC721Simple") {
                        tx = await tokenContract.batchMint(developmentVaultAddress, tokensToMint);
                    } else {
                        console.error(`Unsupported contract type for batch minting: ${tokenToMint.contractType}`);
                        break;
                    }

                    await tx.wait();
                    console.log(`Minted batch ${batchNumber} of ${erc721Token.name}, tokens: ${tokensToMint}`);

                    tokensRemaining -= tokensToMint;
                    batchNumber++;
                }

                console.log(`Minted total of ${erc721Token.totalSupply} tokens of ${erc721Token.symbol} to DevelopmentVault.`);
            } else {
                console.error(`Unsupported contract type: ${tokenToMint.contractType}`);
                continue;
            }

            currentProgress += progressIncrement;
            progressBar.update(currentProgress, { task: `Minted ${tokenToMint.name}` });
        } catch (error) {
            console.error(`Error minting ${tokenToMint.name}:`, error);
            currentProgress += progressIncrement;
            progressBar.update(currentProgress, { task: `Minting ${tokenToMint.name} failed` });
        }
    }

    progressBar.update(100, { task: "Minting completed" });
    progressBar.stop();
    console.log("Asset minting to DevelopmentVault completed successfully.");
}

if (require.main === module) {
    mintAssets()
        .then(() => process.exit(0))
        .catch((error) => {
            progressBar.stop();
            console.error("An error occurred during asset minting:");
            console.error(error);
            process.exit(1);
        });
}
