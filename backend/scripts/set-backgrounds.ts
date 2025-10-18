import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🎨 Setting Backgrounds contract in InventoryManager...");

  // Read deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../ignition/deployments/chain-84532/deployed_addresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  const inventoryManagerAddress = deployedAddresses["HotPotatoModule#InventoryContract"];
  const backgroundsContractAddress = deployedAddresses["HotPotatoModule#BackgroundsContract"];

  console.log(`Inventory Manager: ${inventoryManagerAddress}`);
  console.log(`Backgrounds Contract: ${backgroundsContractAddress}`);

  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Set Backgrounds contract in InventoryManager (20 backgrounds)
  const InventoryManagerContract = await hre.viem.getContractAt("InventoryManager", inventoryManagerAddress, {
    client: { wallet: deployer }
  });
  
  try {
    const tx = await InventoryManagerContract.write.setBackgrounds([20, backgroundsContractAddress]);
    console.log("✅ Backgrounds contract set successfully! (20 backgrounds)");
  } catch (error) {
    console.log("❌ Error setting Backgrounds:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });