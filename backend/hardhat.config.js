require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

console.log("Private Key:", process.env.PRIVATE_KEY); // Debugging line
console.log("Infura URL:", process.env.INFURA_URL); //

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "blast_sepolia",
  networks: {
    hardhat: {
    },
    blast_sepolia: {
      url: process.env.INFURA_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./@Allcontracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  etherscan: {
    apiKey: process.env.API_KEY
  }
}