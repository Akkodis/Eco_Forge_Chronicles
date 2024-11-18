import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const SHIMMER_EVM_TESTNET_RPC_URL = "https://json-rpc.evm.testnet.shimmer.network/";
const SHIMMER_EVM_MAINNET_RPC_URL = "https://json-rpc.evm.shimmer.network/";
const IOTA_EVM_TESTNET_RPC_URL = "https://json-rpc.evm.testnet.iotaledger.net/";
const IOTA_EVM_MAINNET_RPC_URL = "https://json-rpc.evm.iotaledger.net/";

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const IOTA_EVM_TESTNET_API_KEY = process.env.IOTA_EVM_TESTNET_API_KEY || "empty";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "paris",
    },
  },
  networks: {
    shimmerEVMtestnet: {
      url: SHIMMER_EVM_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    shimmerEVMMainnet: {
      url: SHIMMER_EVM_MAINNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    iotaEVMtestnet: {
      url: IOTA_EVM_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    iotaEVMMainnet: {
      url: IOTA_EVM_MAINNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      'iota-evm-testnet': IOTA_EVM_TESTNET_API_KEY,
    },
    customChains: [
      {
        network: "iota-evm-testnet",
        chainId: 1075,
        urls: {
          apiURL: "https://explorer.evm.testnet.iotaledger.net/api",
          browserURL: "https://explorer.evm.testnet.iotaledger.net"
        }
      }
    ]
  }
};

export default config;