import hre from "hardhat";

async function main() {
  console.log("🔍 ADVANCED VRF DIAGNOSTICS...\n");

  // Contract addresses
  const GAME_ADDRESS = "0x050Bd2067828D5e94a3E90Be05949C6798b2c176";
  const VRF_HANDLER_ADDRESS = "0xA18E252a36AC16EE9f65c8a6da1D34ca3b6Ac874";
  
  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Get contracts
  const game = await hre.viem.getContractAt("Game", GAME_ADDRESS, {
    client: { wallet: deployer }
  });

  const vrfHandler = await hre.viem.getContractAt("VRFHandler", VRF_HANDLER_ADDRESS, {
    client: { wallet: deployer }
  });

  try {
    console.log("📊 CURRENT STATE:");
    const gameState = await game.read.getGameState();
    const activeTokensLength = await game.read.getActiveTokens();
    console.log(`  Game State: ${gameState}`);
    console.log(`  Active Tokens: ${activeTokensLength}`);

    console.log("\n🎲 VRF CONFIGURATION:");
    const subscriptionId = await vrfHandler.read.subscriptionId();
    const keyHash = await vrfHandler.read.keyHash();
    const callbackGasLimit = await vrfHandler.read.callbackGasLimit();
    const requestConfirmations = await vrfHandler.read.requestConfirmations();
    
    console.log(`  Subscription ID: ${subscriptionId}`);
    console.log(`  Key Hash: ${keyHash}`);
    console.log(`  Callback Gas Limit: ${callbackGasLimit}`);
    console.log(`  Request Confirmations: ${requestConfirmations}`);

    console.log("\n🧪 TESTING VRF REQUEST DIRECTLY...");
    
    // Try to call the VRF request directly to see if it's a VRF issue
    try {
      console.log("  Attempting direct VRF request...");
      const tx = await vrfHandler.write.requestRandomness([true]);
      console.log(`  ✅ VRF request successful: ${tx}`);
      
      // Wait for confirmation
      const receipt = await hre.viem.waitForTransactionReceipt({ hash: tx });
      console.log(`  ✅ Transaction confirmed in block: ${receipt.blockNumber}`);
      
    } catch (vrfError: any) {
      console.log(`  ❌ Direct VRF request failed: ${vrfError.message}`);
      
      if (vrfError.message.includes("0x79bfd401")) {
        console.log("\n🔍 VRF ERROR ANALYSIS:");
        console.log("  The error 0x79bfd401 is coming from the VRF coordinator.");
        console.log("  This suggests one of these issues:");
        console.log("  1. Subscription doesn't have enough LINK tokens");
        console.log("  2. Subscription doesn't have enough ETH for gas");
        console.log("  3. Subscription is not properly configured");
        console.log("  4. VRF coordinator is having issues");
        
        console.log("\n💡 NEXT STEPS:");
        console.log("  1. Check your VRF subscription balance:");
        console.log(`     https://vrf.chain.link/base-sepolia/subscription/${subscriptionId}`);
        console.log("  2. Ensure you have both LINK and ETH in the subscription");
        console.log("  3. Try increasing the gas limit in your transaction");
        console.log("  4. Check if the VRF coordinator is operational");
      }
    }

    console.log("\n🔧 TESTING WITH HIGHER GAS LIMIT...");
    
    // Try endMinting with a higher gas limit
    try {
      console.log("  Attempting endMinting with higher gas limit...");
      const tx = await game.write.endMinting({
        gas: 5000000n // Higher gas limit
      });
      console.log(`  ✅ EndMinting successful: ${tx}`);
      
    } catch (gasError: any) {
      console.log(`  ❌ EndMinting with higher gas failed: ${gasError.message}`);
      
      if (gasError.message.includes("0x79bfd401")) {
        console.log("\n🔍 GAS LIMIT ANALYSIS:");
        console.log("  Even with higher gas limit, the same error occurs.");
        console.log("  This confirms it's a VRF subscription issue, not a gas issue.");
      }
    }

    console.log("\n🌐 VRF SUBSCRIPTION CHECK:");
    console.log("  Please manually check your VRF subscription:");
    console.log(`  URL: https://vrf.chain.link/base-sepolia/subscription/${subscriptionId}`);
    console.log("  Look for:");
    console.log("  - LINK token balance (should be > 0)");
    console.log("  - ETH balance (should be > 0)");
    console.log("  - Subscription status (should be active)");
    console.log("  - Recent requests (should show any failed requests)");

    console.log("\n🔄 ALTERNATIVE SOLUTIONS:");
    console.log("  If VRF subscription is properly funded:");
    console.log("  1. Try creating a new VRF subscription");
    console.log("  2. Update the VRF handler with new subscription ID");
    console.log("  3. Check if there are any pending VRF requests");
    console.log("  4. Try using a different VRF coordinator");

  } catch (error: any) {
    console.error("❌ Error during diagnostics:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
