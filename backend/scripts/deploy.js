const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Backgrounds
  const Backgrounds = await ethers.getContractFactory("Backgrounds");
  const backgrounds = await Backgrounds.deploy();
  await backgrounds.waitForDeployment();
  console.log("Backgrounds deployed to:", await backgrounds.getAddress());

  // Deploy Hands
  const Hands = await ethers.getContractFactory("Hands");
  const hands = await Hands.deploy();
  await hands.waitForDeployment();
  console.log("Hands deployed to:", await hands.getAddress());

  // Deploy Potato
  const Potato = await ethers.getContractFactory("Potato");
  const potato = await Potato.deploy();
  await potato.waitForDeployment();
  console.log("Potato deployed to:", await potato.getAddress());

  // Deploy InventoryManager
  const InventoryManager = await ethers.getContractFactory("InventoryManager");
  const inventoryManager = await InventoryManager.deploy();
  await inventoryManager.waitForDeployment();
  console.log("InventoryManager deployed to:", await inventoryManager.getAddress());

  // Set backgrounds, hands, and potatoes
  await inventoryManager.setBackgrounds(20, await backgrounds.getAddress());
  console.log("Backgrounds set in InventoryManager");

  await inventoryManager.setHands(41, await hands.getAddress());
  console.log("Hands set in InventoryManager");

  await inventoryManager.setPotatoes(1, await potato.getAddress());
  console.log("Potatoes set in InventoryManager");

  // Deploy UNKNOWN (your main contract)
  const UNKNOWN = await ethers.getContractFactory("UNKNOWN");
  console.log("Deploying UNKNOWN...");
  const unknown = await upgrades.deployProxy(UNKNOWN, ["TEST", "MTT", deployer.address], { initializer: "initialize" });
  await unknown.waitForDeployment();
  console.log("UNKNOWN deployed to:", await unknown.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
