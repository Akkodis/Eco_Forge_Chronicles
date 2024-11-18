import { ethers } from "hardhat";
import { saveContractAbiAndAddress } from "../utils/fileUtils";
import { progressBar, printPhaseHeader } from "../utils/logger";
import { assetConfig } from "../config/assetConfig";

export async function deployDevelopmentVault() {
    if (!assetConfig.shouldDeployDevelopmentVault) {
        console.log("DevelopmentVault deployment is skipped as per configuration.");
        return;
    }

    printPhaseHeader("Deploying DevelopmentVault");
    progressBar.update(10, { task: "Deploying DevelopmentVault" });

    const DevelopmentVault = await ethers.getContractFactory("DevelopmentVault");
    const devVault = await DevelopmentVault.deploy();
    await devVault.waitForDeployment();
    const devVaultAddress = await devVault.getAddress();

    console.log(`DevelopmentVault deployed at: ${devVaultAddress}`);
    await saveContractAbiAndAddress(devVault, "DevelopmentVault", "Vault");

    progressBar.update(100, { task: "DevelopmentVault Deployed" });
    progressBar.stop();
}

if (require.main === module) {
    deployDevelopmentVault()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("Deployment Error:", error);
            process.exit(1);
        });
}
