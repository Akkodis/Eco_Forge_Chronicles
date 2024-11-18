import { run } from "hardhat";
import { VerifyContractConfig } from "./configInterfaces";
import { progressBar } from "./logger";

export async function verifyContract(
    contract: VerifyContractConfig,
    progressStep: number
): Promise<void> {
    try {
        await run("verify:verify", {
            address: contract.address,
            constructorArguments: contract.constructorArguments,
        });

        progressBar.stop();

        console.log(`${contract.name} successfully verified at address ${contract.address}.`);

        progressBar.start(100, progressStep, { task: `Verified ${contract.name}` });
    } catch (error: any) {
        const errorMessage = error.message || error;
        if (errorMessage.toLowerCase().includes("already verified")) {
            progressBar.stop();

            console.log(`${contract.name} is already verified.`);

            progressBar.start(100, progressStep, { task: `Verified ${contract.name}` });
        } else {
            progressBar.stop();

            console.error(`Verification of ${contract.name} failed:`, errorMessage);

            progressBar.start(100, progressStep, { task: `Verification of ${contract.name} failed` });
        }
    }
}
