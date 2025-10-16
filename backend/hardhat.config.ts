import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-contract-sizer";
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.RPC_URL) {
  throw new Error("❌ Missing RPC_URL in .env");
}
if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ Missing PRIVATE_KEY in .env");
}
if (!process.env.BASESCAN_API_KEY) {
  throw new Error("❌ Missing BASESCAN_API_KEY in .env");
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
    {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 25, // 👈 optimize for smaller bytecode
        },
        metadata: {
          bytecodeHash: "none", // removes metadata hash to save bytes
        },
      },
    },
    {
      version: "0.8.28",
      settings: {
        optimizer: {
          enabled: true,
          runs: 25,
        },
        metadata: {
          bytecodeHash: "none",
        },
      },
    },
    {
      version: "0.8.7",
      settings: {
        optimizer: {
          enabled: true,
          runs: 25,
        },
        metadata: {
          bytecodeHash: "none",
        },
      },
    },
  ],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  paths: {
    sources: "./@Allcontracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    baseSepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY!,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=84532",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
