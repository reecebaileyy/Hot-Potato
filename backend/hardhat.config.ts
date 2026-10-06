import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

const SOLC_VERSION = "0.8.28";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: SOLC_VERSION,
        // Optional: point at a local solc binary when binaries.soliditylang.org is unreachable.
        ...(process.env.SOLC_PATH ? { path: process.env.SOLC_PATH } : {}),
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "cancun",
        },
      },
    },
  },
  chainDescriptors: {
    4663: {
      name: "Robinhood Chain",
      chainType: "generic",
      blockExplorers: {
        blockscout: {
          name: "Robinhood Chain Explorer",
          url: "https://robinhoodchain.blockscout.com",
          apiUrl: "https://robinhoodchain.blockscout.com/api",
        },
      },
    },
    46630: {
      name: "Robinhood Chain Testnet",
      chainType: "generic",
      blockExplorers: {
        blockscout: {
          name: "Robinhood Chain Testnet Explorer",
          url: "https://explorer.testnet.chain.robinhood.com",
          apiUrl: "https://explorer.testnet.chain.robinhood.com/api",
        },
      },
    },
  },
  networks: {
    // In-process simulated chain used by `hardhat test`; the scale test needs 50 accounts.
    default: {
      type: "edr-simulated",
      chainType: "generic",
      accounts: { count: 50 },
    },
    robinhoodTestnet: {
      type: "http",
      chainType: "generic",
      chainId: 46630,
      url: configVariable("ROBINHOOD_TESTNET_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
    robinhood: {
      type: "http",
      chainType: "generic",
      chainId: 4663,
      url: configVariable("ROBINHOOD_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
  },
});
