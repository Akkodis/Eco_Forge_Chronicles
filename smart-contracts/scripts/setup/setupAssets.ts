import { ethers } from "hardhat";
import { readAssetConfig, readDeployedContracts } from "../utils/fileUtils";
import { DeployedContracts } from "../utils/configInterfaces";
import { progressBar, printPhaseHeader } from "../utils/logger";
import {
    ERC20RegisterOnlyToken,
    ERC20DeployAndRegisterToken,
    ERC721RegisterOnlyToken,
} from "../utils/configInterfaces";

export async function setupAssets(): Promise<void> {
    printPhaseHeader("Setting Up Assets");
    progressBar.start(100, 0, { task: "Initializing Asset Setup" });

    const assetConfig = readAssetConfig();
    const { assets } = assetConfig;
    const { ERC20Tokens, ERC721Tokens } = assets;

    const deployedContracts: DeployedContracts = readDeployedContracts();
    const marketplaceAddress = deployedContracts["Marketplace"]?.address;

    if (!marketplaceAddress) {
        throw new Error("Marketplace address not found. Please deploy protocol contracts first.");
    }

    const marketplace = await ethers.getContractAt("Marketplace", marketplaceAddress);

    const allERC20Tokens = [
        ...ERC20Tokens.PaymentTokens.deployAndRegister,
        ...ERC20Tokens.PaymentTokens.registerOnly,
        ...ERC20Tokens.SimpleTokens.deployAndRegister,
        ...ERC20Tokens.SimpleTokens.registerOnly,
    ];

    for (const [index, token] of allERC20Tokens.entries()) {
        const tokenAddress = deployedContracts[token.name]?.address || (token as ERC20RegisterOnlyToken).address;
        if (!tokenAddress) {
            console.error(`Address for token ${token.name} not found.`);
            continue;
        }

        const isPaymentToken =
            ERC20Tokens.PaymentTokens.deployAndRegister.some((t) => t.name === token.name) ||
            ERC20Tokens.PaymentTokens.registerOnly.some((t) => t.name === token.name);
        const triggersIncentive = (token as ERC20DeployAndRegisterToken).triggersIncentive || false;

        printPhaseHeader(`Registering ERC20 Token: ${token.name}`);
        progressBar.update(5 + index * 10, { task: `Registering ERC20 Token ${token.name}` });

        try {
            if (isPaymentToken) {
                await marketplace.setPaymentTokenAllowed(tokenAddress, true, triggersIncentive);
                console.log(
                    `ERC20 Payment Token (${token.name}) registered with triggersIncentive=${triggersIncentive}`
                );
            } else {
                await marketplace.setAssetAllowed(tokenAddress, true);
                console.log(`ERC20 Asset Token (${token.name}) registered.`);
            }
            progressBar.update(15 + index * 10, { task: `ERC20 Token ${token.name} registered` });
        } catch (error) {
            console.error(`Error registering ERC20 Token (${token.name}):`, error);
            progressBar.update(15 + index * 10, { task: `ERC20 Token ${token.name} registration failed` });
        }
    }

    const allERC721Tokens = [
        ...ERC721Tokens.RedeemableTokens.deployAndRegister,
        ...ERC721Tokens.RedeemableTokens.registerOnly,
        ...ERC721Tokens.SimpleTokens.deployAndRegister,
        ...ERC721Tokens.SimpleTokens.registerOnly,
    ];

    for (const [index, nft] of allERC721Tokens.entries()) {
        const nftAddress = deployedContracts[nft.name]?.address || (nft as ERC721RegisterOnlyToken).address;
        if (!nftAddress) {
            console.error(`Address for NFT ${nft.name} not found.`);
            continue;
        }

        printPhaseHeader(`Registering ERC721 Token: ${nft.name}`);
        progressBar.update(45 + index * 10, { task: `Registering ERC721 Token ${nft.name}` });

        try {
            await marketplace.setAssetAllowed(nftAddress, true);
            console.log(`ERC721 Token (${nft.name}) registered.`);
            progressBar.update(55 + index * 10, { task: `ERC721 Token ${nft.name} registered` });
        } catch (error) {
            console.error(`Error registering ERC721 Token (${nft.name}):`, error);
            progressBar.update(55 + index * 10, { task: `ERC721 Token ${nft.name} registration failed` });
        }
    }

    console.log("All assets have been successfully registered.");
    progressBar.update(85, { task: "Assets registration completed" });

    console.log("Asset Setup completed.");
    progressBar.update(100, { task: "Asset Setup completed" });
    progressBar.stop();
}

if (require.main === module) {
    setupAssets()
        .then(() => process.exit(0))
        .catch((error) => {
            progressBar.stop();
            console.error("An error occurred during asset setup:");
            console.error(error);
            process.exit(1);
        });
}
