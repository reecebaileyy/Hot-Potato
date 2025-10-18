import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("✋ Setting Hands contract in InventoryManager...");

  // Read deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../ignition/deployments/chain-84532/deployed_addresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  const inventoryManagerAddress = deployedAddresses["HotPotatoModule#InventoryContract"];
  const handsContractAddress = deployedAddresses["HotPotatoModule#HandsContract"];

  console.log(`Inventory Manager: ${inventoryManagerAddress}`);
  console.log(`Hands Contract: ${handsContractAddress}`);

  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Set Hands contract in InventoryManager (41 hands)
  const InventoryManagerContract = await hre.viem.getContractAt("InventoryManager", inventoryManagerAddress, {
    client: { wallet: deployer }
  });
  
  try {
    const tx = await InventoryManagerContract.write.setHands([41, handsContractAddress]);
    console.log("✅ Hands contract set successfully! (41 hands)");
  } catch (error) {
    console.log("❌ Error setting Hands:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });