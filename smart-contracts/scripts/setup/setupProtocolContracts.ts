import { ethers } from "hardhat";
import { readDeployedContracts } from "../utils/fileUtils";
import { DeployedContracts } from "../utils/configInterfaces";
import { progressBar, printPhaseHeader } from "../utils/logger";
import { getAssetReservoirCapabilityValue } from "../utils/capabilityUtils";

export async function setupProtocolContracts() {
  printPhaseHeader("Setting Up Protocol Contracts");
  progressBar.update(60, { task: "Setting Up Protocol Contracts" });

  const contracts: DeployedContracts = readDeployedContracts();

  const marketplace = await ethers.getContractAt("Marketplace", contracts["Marketplace"].address);
  const simpleIncentiveMechanism = await ethers.getContractAt(
    "SimpleIncentiveMechanism",
    contracts["SimpleIncentiveMechanism"].address
  );
  const assetReservoir = await ethers.getContractAt("AssetReservoir", contracts["AssetReservoir"].address);

  printPhaseHeader("Setting Incentive Mechanism in Marketplace");
  progressBar.update(65, { task: "Setting Incentive Mechanism in Marketplace" });

  const txSetIncentiveMechanism = await marketplace.setIncentiveMechanism(simpleIncentiveMechanism.target);
  await txSetIncentiveMechanism.wait();

  progressBar.update(70, { task: "Incentive Mechanism Set in Marketplace" });
  console.log(`Set incentive mechanism in Marketplace to ${simpleIncentiveMechanism.target}`);

  printPhaseHeader("Assigning Capabilities in AssetReservoir");
  progressBar.update(75, { task: "Assigning Capabilities" });

  const dispenseRewardsCapability = getAssetReservoirCapabilityValue("CanDispenseRewards");
  const txAssignDispenseRewards = await assetReservoir.updateCoordinatorCapability(
    simpleIncentiveMechanism.target,
    dispenseRewardsCapability,
    true
  );
  await txAssignDispenseRewards.wait();

  progressBar.update(80, { task: "Capability Assigned in AssetReservoir" });
  console.log(
    `Assigned capability CanDispenseRewards to SimpleIncentiveMechanism (${simpleIncentiveMechanism.target}) in AssetReservoir`
  );

  printPhaseHeader("Authorizing Marketplace in SimpleIncentiveMechanism");
  progressBar.update(85, { task: "Authorizing Marketplace" });

  const txAuthorizeMarketplace = await simpleIncentiveMechanism.updateCoordinator(marketplace.target, true);
  await txAuthorizeMarketplace.wait();

  progressBar.update(90, { task: "Marketplace Authorized in SimpleIncentiveMechanism" });
  console.log(`Authorized Marketplace (${marketplace.target}) as a coordinator in SimpleIncentiveMechanism`);

  progressBar.update(100, { task: "Protocol Contracts Setup Completed" });
  progressBar.stop();
  console.log("Setup of Protocol Contracts completed successfully.");
}

if (require.main === module) {
  progressBar.start(100, 0, { task: "Starting Protocol Contracts Setup" });

  setupProtocolContracts()
    .then(() => {
      progressBar.stop();
      console.log("Protocol Contracts have been set up successfully.");
      process.exit(0);
    })
    .catch((error) => {
      progressBar.stop();
      console.error("An error occurred during the setup of Protocol Contracts:");
      console.error(error);
      process.exit(1);
    });
}
