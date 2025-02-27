import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("Please set your PRIVATE_KEY in a .env file");
}

const WASP_LOCAL_PRIVATE_KEY = process.env.WASP_LOCAL_PRIVATE_KEY;

const config: HardhatUserConfig = {
  networks: {
    hardhat: {},

    hardhat_node: {
      url: "http://127.0.0.1:8545/",
      //accounts: [PRIVATE_KEY]
    },
    local_geth: {
      url: "http://127.0.0.1:8545/",
      accounts:[PRIVATE_KEY]
    },
    local_wasp: {
      url: "http://127.0.0.1:8545/",
      accounts:[WASP_LOCAL_PRIVATE_KEY]
    },
    shimmer_evm_testnet: {
      url:"https://json-rpc.evm.testnet.shimmer.network",
      accounts: [PRIVATE_KEY]
    },
    iota_evm_testnet: {
      url:"https://json-rpc.evm.testnet.iotaledger.net",
      accounts: [PRIVATE_KEY]
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800
      }
    }
  }
};

export default config;
