import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🥔 Setting Potatoes contract in InventoryManager...");

  // Read deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../ignition/deployments/chain-84532/deployed_addresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  const inventoryManagerAddress = deployedAddresses["HotPotatoModule#InventoryContract"];
  const potatoesContractAddress = deployedAddresses["HotPotatoModule#PotatoContract"];

  console.log(`Inventory Manager: ${inventoryManagerAddress}`);
  console.log(`Potatoes Contract: ${potatoesContractAddress}`);

  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Set Potatoes contract in InventoryManager (1 potato)
  const InventoryManagerContract = await hre.viem.getContractAt("InventoryManager", inventoryManagerAddress, {
    client: { wallet: deployer }
  });
  
  try {
    const tx = await InventoryManagerContract.write.setPotatoes([1, potatoesContractAddress]);
    console.log("✅ Potatoes contract set successfully! (1 potato)");
  } catch (error) {
    console.log("❌ Error setting Potatoes:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });