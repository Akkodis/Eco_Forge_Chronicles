import * as fs from "fs";
import * as path from "path";
import { ethers } from "hardhat";
import { AssetConfig, DeployedContracts } from "./configInterfaces";
import { assetConfig } from "../config/assetConfig";

export function readAssetConfig(): AssetConfig {
    return assetConfig;
}

export function getContractsPath(): string {
    return path.join(__dirname, '..', 'output', 'deployedContracts', 'contracts.json');
}

export function readDeployedContracts(): DeployedContracts {
    const contractsPath = getContractsPath();
    if (!fs.existsSync(contractsPath)) {
        throw new Error(`Contracts file not found at ${contractsPath}. Please run the deployment script first.`);
    }
    const data = fs.readFileSync(contractsPath, 'utf8');
    return JSON.parse(data).contracts;
}

export async function saveContractAbiAndAddress(contract: any, name: string, info?: string): Promise<void> {
    const outputDir = path.join(__dirname, '..', 'output', 'deployedContracts');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created directory: ${outputDir}`);
    }

    const dataFilename = path.join(outputDir, 'contracts.json');
    let data: { contracts: DeployedContracts } = { contracts: {} };

    if (fs.existsSync(dataFilename)) {
        const existingData = fs.readFileSync(dataFilename, 'utf8');
        try {
            data = JSON.parse(existingData);
            console.log(`Loaded existing contracts from ${dataFilename}.`);
        } catch (error) {
            console.error(`Error parsing ${dataFilename}:`, error);
            data = { contracts: {} };
        }
    }

    const abi = contract.interface.format("json");
    const contractAddress = await contract.getAddress();

    data.contracts[name] = {
        address: contractAddress,
        abi: abi,
        info: info
    };

    fs.writeFileSync(dataFilename, JSON.stringify(data, null, 2));
    console.log(`${name} ABI and address saved to ${dataFilename}.`);
}
