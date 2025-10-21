import hre from "hardhat";

async function main() {
  console.log("🧪 TESTING END MINTING FUNCTION...\n");

  // Contract address from deployment
  const CONTRACT_ADDRESS = "0x050Bd2067828D5e94a3E90Be05949C6798b2c176";
  
  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Get the contract
  const game = await hre.viem.getContractAt("Game", CONTRACT_ADDRESS, {
    client: { wallet: deployer }
  });

  try {
    console.log("📊 PRE-TRANSACTION STATE:");
    const gameState = await game.read.getGameState();
    const activeTokensLength = await game.read.getActiveTokens();
    console.log(`  Game State: ${gameState}`);
    console.log(`  Active Tokens: ${activeTokensLength}`);

    console.log("\n🚀 ATTEMPTING END MINTING...");
    
    // Try to call endMinting with higher gas limit for VRF request
    const tx = await game.write.endMinting({
      gas: 5000000n // Higher gas limit for VRF request
    });
    console.log(`✅ Transaction sent: ${tx}`);
    
    // Wait for confirmation
    const receipt = await hre.viem.waitForTransactionReceipt({ hash: tx });
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`✅ Gas used: ${receipt.gasUsed}`);
    
    console.log("\n📊 POST-TRANSACTION STATE:");
    const newGameState = await game.read.getGameState();
    console.log(`  New Game State: ${newGameState}`);

  } catch (error: any) {
    console.error("❌ Transaction failed:");
    console.error(`  Error: ${error.message}`);
    
    if (error.message.includes("0x79bfd401")) {
      console.log("\n🔍 ANALYSIS:");
      console.log("  This is the unknown error signature we've been seeing.");
      console.log("  The error occurs in the VRF request, not in the contract logic.");
      console.log("  Possible causes:");
      console.log("    1. VRF subscription doesn't have enough LINK tokens");
      console.log("    2. VRF subscription doesn't have enough ETH for gas");
      console.log("    3. VRF coordinator is having issues");
      console.log("    4. Gas limit too low for the VRF request");
    }
    
    // Try to get more details about the revert
    if (error.cause) {
      console.log(`\n🔍 DETAILED ERROR:`);
      console.log(`  Cause: ${error.cause}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
