import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Setting up contract configurations...");

  // Read deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../ignition/deployments/chain-84532/deployed_addresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  const gameContractAddress = deployedAddresses["HotPotatoModule#GameContract"];
  const inventoryManagerAddress = deployedAddresses["HotPotatoModule#InventoryContract"];
  const backgroundsContractAddress = deployedAddresses["HotPotatoModule#BackgroundsContract"];
  const handsContractAddress = deployedAddresses["HotPotatoModule#HandsContract"];
  const potatoesContractAddress = deployedAddresses["HotPotatoModule#PotatoContract"];

  console.log("📋 Contract Addresses:");
  console.log(`Game Contract: ${gameContractAddress}`);
  console.log(`Inventory Manager: ${inventoryManagerAddress}`);
  console.log(`Backgrounds Contract: ${backgroundsContractAddress}`);
  console.log(`Hands Contract: ${handsContractAddress}`);
  console.log(`Potatoes Contract: ${potatoesContractAddress}`);

  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`\n🔑 Using account: ${deployer.account.address}`);

  // 1. Set InventoryManager in Game contract
  console.log("\n1️⃣ Setting InventoryManager in Game contract...");
  const GameContract = await hre.viem.getContractAt("Game", gameContractAddress, {
    client: { wallet: deployer }
  });
  
  try {
    const tx1 = await GameContract.write.setInventoryManager([inventoryManagerAddress]);
    console.log("✅ InventoryManager set in Game contract");
  } catch (error) {
    console.log("⚠️ InventoryManager might already be set or error occurred:", error);
  }

  // 2. Set Backgrounds contract in InventoryManager (20 backgrounds)
  console.log("\n2️⃣ Setting Backgrounds contract in InventoryManager...");
  const InventoryManagerContract = await hre.viem.getContractAt("InventoryManager", inventoryManagerAddress, {
    client: { wallet: deployer }
  });
  
  try {
    const tx2 = await InventoryManagerContract.write.setBackgrounds([20, backgroundsContractAddress]);
    console.log("✅ Backgrounds contract set (20 backgrounds)");
  } catch (error) {
    console.log("⚠️ Backgrounds might already be set or error occurred:", error);
  }

  // 3. Set Hands contract in InventoryManager (41 hands)
  console.log("\n3️⃣ Setting Hands contract in InventoryManager...");
  
  try {
    const tx3 = await InventoryManagerContract.write.setHands([41, handsContractAddress]);
    console.log("✅ Hands contract set (41 hands)");
  } catch (error) {
    console.log("⚠️ Hands might already be set or error occurred:", error);
  }

  // 4. Set Potatoes contract in InventoryManager (1 potato)
  console.log("\n4️⃣ Setting Potatoes contract in InventoryManager...");
  
  try {
    const tx4 = await InventoryManagerContract.write.setPotatoes([1, potatoesContractAddress]);
    console.log("✅ Potatoes contract set (1 potato)");
  } catch (error) {
    console.log("⚠️ Potatoes might already be set or error occurred:", error);
  }

  console.log("\n🎉 Contract setup completed!");
  console.log("\n📊 Summary:");
  console.log(`- Game contract now points to InventoryManager: ${inventoryManagerAddress}`);
  console.log(`- InventoryManager has 20 backgrounds from: ${backgroundsContractAddress}`);
  console.log(`- InventoryManager has 41 hands from: ${handsContractAddress}`);
  console.log(`- InventoryManager has 1 potato from: ${potatoesContractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });