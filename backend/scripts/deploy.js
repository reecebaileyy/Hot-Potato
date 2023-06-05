// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

  // const UNKNOWN = await hre.ethers.getContractFactory("UNKNOWN");
  // const unknown = await UNKNOWN.deploy(4783);
  // await unknown.deployed();

  const InventoryManager = await hre.ethers.getContractFactory("InventoryManager");
  const inventorymanager = await InventoryManager.deploy();
  await inventorymanager.deployed();


  // const Uniques = await hre.ethers.getContractFactory("Uniques");
  // const uniques = await Uniques.deploy();
  // await uniques.deployed();

  // const Offhands = await hre.ethers.getContractFactory("Offhands");
  // const offhands = await Offhands.deploy();
  // await offhands.deployed();

  // const Mainhands = await hre.ethers.getContractFactory("Mainhands");
  // const mainhands = await Mainhands.deploy();
  // await mainhands.deployed();

  // const Helms = await hre.ethers.getContractFactory("Helms");
  // const helms = await Helms.deploy();
  // await helms.deployed();

  // const Bodies = await hre.ethers.getContractFactory("Bodies");
  // const bodies = await Bodies.deploy();
  // await bodies.deployed();

  // console.log(`Main Contract was deployed to https://mumbai.polygonscan.com/${unknown.address}`);
  console.log(
    `InventoryManager deployed to https://mumbai.polygonscan.com/${inventorymanager.address}`
  );
  // console.log(
  //   `uniques deployed to https://mumbai.polygonscan.com/${uniques.address}`
  // );
  // console.log(
  //   `offhands deployed to https://mumbai.polygonscan.com/${offhands.address}`
  // );
  // console.log(
  //   `mainhands deployed to https://mumbai.polygonscan.com/${mainhands.address}`
  // );
  // console.log(
  //   `helms deployed to https://mumbai.polygonscan.com/${helms.address}`
  // );
  // console.log(
  //   `bodies deployed to https://mumbai.polygonscan.com/${bodies.address}`
  // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
