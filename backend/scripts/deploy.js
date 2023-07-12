const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

  const UNKNOWN = await hre.ethers.getContractFactory("UNKNOWN");
  const unknown = await UNKNOWN.deploy(4783);
  await unknown.deployed();

  // const InventoryManager = await hre.ethers.getContractFactory("InventoryManager");
  // const inventorymanager = await InventoryManager.deploy();
  // await inventorymanager.deployed();


  // const Backgrounds = await hre.ethers.getContractFactory("Backgrounds");
  // const backgrounds = await Backgrounds.deploy();
  // await backgrounds.deployed();

  // const Hands = await hre.ethers.getContractFactory("Hands");
  // const hands = await Hands.deploy();
  // await hands.deployed();

  // const Potato = await hre.ethers.getContractFactory("Potato");
  // const potato = await Potato.deploy();
  // await potato.deployed();

  console.log(`Main Contract was deployed to https://mumbai.polygonscan.com/address/${unknown.address}`);
  // console.log(
  //   `InventoryManager deployed to https://mumbai.polygonscan.com/address/${inventorymanager.address}`
  // );
  // console.log(
  //   `Backgrounds deployed to https://mumbai.polygonscan.com/address/${backgrounds.address}`
  // );
  // console.log(
  //   `Hands deployed to https://mumbai.polygonscan.com/address/${hands.address}`
  // );
  // console.log(
  //   `Potato deployed to https://mumbai.polygonscan.com/address/${potato.address}`
  // );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
