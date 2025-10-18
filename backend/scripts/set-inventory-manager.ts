import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🎮 Setting InventoryManager in Game contract...");

  // Read deployed addresses
  const deployedAddressesPath = path.join(__dirname, "../ignition/deployments/chain-84532/deployed_addresses.json");
  const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));

  const gameContractAddress = deployedAddresses["HotPotatoModule#GameContract"];
  const inventoryManagerAddress = deployedAddresses["HotPotatoModule#InventoryContract"];

  console.log(`Game Contract: ${gameContractAddress}`);
  console.log(`Inventory Manager: ${inventoryManagerAddress}`);

  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Set InventoryManager in Game contract
  const GameContract = await hre.viem.getContractAt("Game", gameContractAddress, {
    client: { wallet: deployer }
  });
  
  try {
    const tx = await GameContract.write.setInventoryManager([inventoryManagerAddress]);
    console.log("✅ InventoryManager set in Game contract successfully!");
  } catch (error) {
    console.log("❌ Error setting InventoryManager:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });