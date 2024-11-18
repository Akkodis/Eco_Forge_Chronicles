import { ethers } from "hardhat";
import { saveContractAbiAndAddress, readAssetConfig } from "../utils/fileUtils";
import { progressBar, printPhaseHeader } from "../utils/logger";
import { VerifyContractConfig } from "../utils/configInterfaces";
import { verifyContract } from "../utils/verificationUtils";

export async function deployProtocolContracts(): Promise<void> {
  const assetConfig = readAssetConfig();
  const { verifyContracts } = assetConfig;

  const contractsToVerify: VerifyContractConfig[] = [];

  printPhaseHeader("Deploying RandomNumberGenerator");
  progressBar.update(5, { task: "Deploying RandomNumberGenerator" });

  const RandomNumberGenerator = await ethers.getContractFactory("RandomNumberGenerator");
  const randomNumberGenerator = await RandomNumberGenerator.deploy();
  await randomNumberGenerator.waitForDeployment();
  const randomNumberGeneratorAddress = await randomNumberGenerator.getAddress();

  console.log(`RandomNumberGenerator deployed at address: ${randomNumberGeneratorAddress}`);
  await saveContractAbiAndAddress(randomNumberGenerator, "RandomNumberGenerator", "Protocol");

  contractsToVerify.push({
    name: "RandomNumberGenerator",
    address: randomNumberGeneratorAddress,
    constructorArguments: [],
  });

  progressBar.update(15, { task: "RandomNumberGenerator Deployed" });

  printPhaseHeader("Deploying AssetReservoir");
  progressBar.update(20, { task: "Deploying AssetReservoir" });

  const AssetReservoir = await ethers.getContractFactory("AssetReservoir");
  const assetReservoir = await AssetReservoir.deploy();
  await assetReservoir.waitForDeployment();
  const assetReservoirAddress = await assetReservoir.getAddress();

  console.log(`AssetReservoir deployed at address: ${assetReservoirAddress}`);
  await saveContractAbiAndAddress(assetReservoir, "AssetReservoir", "Protocol");

  contractsToVerify.push({
    name: "AssetReservoir",
    address: assetReservoirAddress,
    constructorArguments: [],
  });

  progressBar.update(30, { task: "AssetReservoir Deployed" });

  printPhaseHeader("Deploying SimpleIncentiveMechanism");
  progressBar.update(35, { task: "Deploying SimpleIncentiveMechanism" });

  const SimpleIncentiveMechanism = await ethers.getContractFactory("SimpleIncentiveMechanism");
  const simpleIncentiveMechanism = await SimpleIncentiveMechanism.deploy(
    randomNumberGeneratorAddress,
    assetReservoirAddress
  );
  await simpleIncentiveMechanism.waitForDeployment();
  const simpleIncentiveMechanismAddress = await simpleIncentiveMechanism.getAddress();

  console.log(`SimpleIncentiveMechanism deployed at address: ${simpleIncentiveMechanismAddress}`);
  await saveContractAbiAndAddress(simpleIncentiveMechanism, "SimpleIncentiveMechanism", "Protocol");

  contractsToVerify.push({
    name: "SimpleIncentiveMechanism",
    address: simpleIncentiveMechanismAddress,
    constructorArguments: [randomNumberGeneratorAddress, assetReservoirAddress],
  });

  progressBar.update(50, { task: "SimpleIncentiveMechanism Deployed" });

  printPhaseHeader("Deploying Marketplace");
  progressBar.update(55, { task: "Deploying Marketplace" });

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log(`Marketplace deployed at address: ${marketplaceAddress}`);
  await saveContractAbiAndAddress(marketplace, "Marketplace", "Protocol");

  contractsToVerify.push({
    name: "Marketplace",
    address: marketplaceAddress,
    constructorArguments: [],
  });

  progressBar.update(70, { task: "Marketplace Deployed" });

  if (verifyContracts) {
    printPhaseHeader("Verifying Deployed Protocol Contracts");
    progressBar.update(75, { task: "Starting verification" });

    for (let i = 0; i < contractsToVerify.length; i++) {
      const contract = contractsToVerify[i];
      const progressStep = 75 + i * 5;
      await verifyContract(contract, progressStep);
    }

    progressBar.update(100, { task: "Verification completed" });
  } else {
    console.log("Verification is disabled in the configuration. Skipping verification step.");
    progressBar.update(100, { task: "Verification skipped" });
  }

  console.log("All Protocol Contracts have been deployed successfully.");
}

if (require.main === module) {
  progressBar.start(100, 0, { task: "Starting Protocol Contracts Deployment" });

  deployProtocolContracts()
    .then(() => {
      progressBar.update(100, { task: "Protocol Contracts Deployed" });
      progressBar.stop();
      console.log("All Protocol Contracts have been deployed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      progressBar.stop();
      console.error("An error occurred during the deployment of Protocol Contracts:");
      console.error(error);
      process.exit(1);
    });
}
