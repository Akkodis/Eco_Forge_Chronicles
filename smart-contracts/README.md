
# Eco Forge Chronicles - Smart Contracts

This project contains smart contracts and deployment scripts for the **Eco Forge Chronicles** project. It includes a modular and extensible **Marketplace** contract and **ERC20 Eco-Bound Tokens**, which can be used as a payment method in the marketplace.

## Project Structure

```
Eco Forge Chronicles
├── contracts
│   ├── ERC20
│   │   ├── ERC20EcoBound.sol             # ERC20 Eco-Bound Token Contract
│   │   └── ERC20Simple.sol               # ERC20 Simple Token Contract
│   ├── ERC721
│   │   ├── ERC721Redeemable.sol          # ERC721 Redeemable Token Contract
│   │   ├── ERC721Simple.sol              # ERC721 Simple Token Contract
│   │   └── ERC721TopDownComposable.sol   # ERC721 Top-Down Composable Token Contract
│   ├── interfaces                        # Interface files for modularity
│   │   ├── IAssetReservoir.sol
│   │   ├── IERC998ERC721TopDown.sol
│   │   ├── IIncentiveMechanism.sol
│   │   ├── IKYCVerification.sol
│   │   ├── IRandomNumberGenerator.sol
│   │   └── IRedeemable.sol
│   ├── utils
│   │   ├── DevelopmentVault.sol          # Development Vault Contract
│   │   ├── KYCVerification.sol           # KYC Verification Contract
│   │   └── RandomNumberGenerator.sol     # Random Number Generator Contract 
│   ├── AssetReservoir.sol                # Asset Reservoir Contract
│   ├── EtherealEruption.sol              # Ethereal Eruption Contract
│   ├── Marketplace.sol                   # Marketplace Contract
│   └── SimpleIncentiveMechanism.sol      # Simple Incentive Mechanism Contract
├── scripts
│   ├── config
│   │   └── assetConfig.ts                 # Configuration for assets
│   ├── deploy
│   │   └── deployAssets.ts                # Script to deploy assets
│   ├── mint
│   ├── setup
│   │   ├── setupAssets.ts                 # Script to set up assets
│   │   └── setupProtocolContracts.ts      # Script to set up protocol contracts
│   └── utils
│       ├── capabilityUtils.ts             # Capability utilities
│       ├── configInterfaces.ts            # Configuration interfaces
│       ├── configValidation.ts            # Configuration validation
│       ├── fileUtils.ts                   # File utilities
│       ├── logger.ts                      # Logger utility
│       └── verificationUtils.ts           # Verification utilities
├── .env                                 # Environment variables (contains private keys)
├── hardhat.config.ts                    # Hardhat configuration for Solidity, network settings
├── package.json                         # Project dependencies and scripts
├── README.md                            # This file
└── tsconfig.json                        # TypeScript configuration
```

## Prerequisites

Ensure you have the following installed before running the project:

- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/)
- [Hardhat](https://hardhat.org/getting-started/)

To install the project dependencies, run:

```bash
yarn install
```

### Environment Variables

Create a `.env` file in the root directory and add your environment variables:

```
DEPLOYER_PRIVATE_KEY=your_private_key
```

### Configuration

The `scripts/config/assetConfig.ts` file contains the configuration for deployments, such as token names, symbols, and other settings. You can customize this file according to your requirements.

## Deploying the Contracts

The project includes several scripts for deploying contracts:

1. **Deploy Assets:**  
   This script deploys the ERC20 and ERC721 tokens defined in the `assetConfig.ts` file and registers them in the marketplace.

2. **Setup Protocol Contracts:**  
   This script deploys the core protocol contracts like `RandomNumberGenerator`, `AssetReservoir`, `SimpleIncentiveMechanism`, and `Marketplace`, and sets up their interconnections.

3. **Setup Assets:**  
   This script sets up the deployed assets, such as registering them in the marketplace.

### Deploying the Protocol Contracts

To deploy the protocol contracts, run:

```bash
yarn deployProtocolContracts
```

This deploys the core protocol contracts.

### Deploying the Assets

To deploy and register the assets, run:

```bash
yarn deployAssets
```

This script will:

- Deploy the ERC20 and ERC721 tokens defined in the `assetConfig.ts`.
- Register them in the `Marketplace` contract.

### Setting Up the Protocol Contracts and Assets

After deploying, set up the protocol contracts and assets by running:

```bash
yarn setupProtocolContracts
yarn setupAssets
```

Alternatively, you can combine these steps into a single script or sequence as needed.

## Interacting with the Contracts

### ABI and Contract Addresses

After deploying, the contract ABIs and addresses are saved in the relevant scripts' output directories. You can locate them based on the deployment scripts used. Typically, they might be saved in a file such as `scripts/deploy/assets.json` or similar.

You can use these files to get the ABI and address for interacting with the deployed contracts via a frontend or other scripts.

### Registering New Assets

If you need to register additional ERC20 or ERC721 tokens in the marketplace, ensure the addresses are saved in your configuration, then interact with the marketplace contract's `setAssetAllowed` or `setPaymentTokenAllowed` function:

```typescript
const marketplace = await ethers.getContractAt("Marketplace", marketplaceAddress);
await marketplace.setAssetAllowed(tokenAddress, true);
```

## Verifying Contracts

If `verifyContracts` is set to `true` in your configuration, contracts will be automatically verified after deployment.

You can manually verify contracts using Hardhat's built-in verification feature:

```bash
npx hardhat verify --network <network-name> <contract-address> <constructor-args>
```

## License

This project is licensed under the **APACHE 2.0 License**.

## Troubleshooting

### Common Errors

1. **Contract Address Not Found**:
   - Ensure the contract ABI and address are correctly saved after deployment.
   - Make sure you are referencing the correct contract name in the configuration files.

2. **Contract Verification Fails**:
   - Ensure the correct API key is set in your `.env` file.
   - Ensure you are deploying on a network supported by Etherscan or the respective block explorer.

3. **Invalid Contract Target**:
   - This error can occur if the address in your configuration is empty or incorrect. Ensure the Marketplace or other contracts are deployed and their addresses are properly saved.

### Additional Steps

- **Check Deployment Scripts:**  
  Verify that the deployment scripts are executing correctly and saving the contract addresses and ABIs in the expected locations.

- **Ensure Correct Configuration:**  
  Double-check the configuration files (`assetConfig.ts`, etc.) to ensure all required settings are properly defined.

- **Logging and Debugging:**  
  Utilize the logger utility (`scripts/utils/logger.ts`) to capture and review logs during deployment and setup processes.

If you encounter issues not covered here, please consult the project's issue tracker or reach out to the maintainers for further assistance.
