import hre from "hardhat";

async function main() {
  console.log("⏳ MONITORING VRF REQUEST STATUS...\n");

  // Contract address
  const GAME_ADDRESS = "0x7Bfa203a115421a08bE6E27bEcb495D3cb4003B9";
  
  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Get the contract
  const game = await hre.viem.getContractAt("Game", GAME_ADDRESS, {
    client: { wallet: deployer }
  });

  try {
    console.log("📊 CURRENT STATE:");
    const gameState = await game.read.getGameState();
    const activeTokensLength = await game.read.getActiveTokens();
    const potatoTokenId = await game.read.potatoTokenId();
    
    console.log(`  Game State: ${gameState}`);
    console.log(`  Active Tokens: ${activeTokensLength}`);
    console.log(`  Potato Token ID: ${potatoTokenId}`);

    if (gameState === "Minting") {
      console.log("\n⏳ VRF REQUEST STATUS:");
      console.log("  The endMinting transaction was sent successfully!");
      console.log("  The game is waiting for Chainlink VRF to fulfill the randomness request.");
      console.log("  This typically takes 1-3 minutes on Base Sepolia.");
      
      console.log("\n🔄 WHAT HAPPENS NEXT:");
      console.log("  1. Chainlink VRF generates random number");
      console.log("  2. VRF coordinator calls onRandomWords()");
      console.log("  3. Potato gets assigned to random token");
      console.log("  4. Game state changes from 'Minting' to 'Playing'");
      console.log("  5. Explosion timer starts");
      
      console.log("\n💡 MONITORING:");
      console.log("  You can monitor the VRF subscription here:");
      console.log("  https://vrf.chain.link/base-sepolia/subscription/78673229480145255509508114948932881804799032944497392483080445829768349089996");
      console.log("  Look for recent requests and their fulfillment status.");
      
      console.log("\n⏰ EXPECTED TIMELINE:");
      console.log("  - VRF request sent: ✅ (just happened)");
      console.log("  - VRF fulfillment: ⏳ (1-3 minutes)");
      console.log("  - Game state change: ⏳ (after fulfillment)");
      
    } else if (gameState === "Playing") {
      console.log("\n🎉 SUCCESS!");
      console.log("  The VRF request has been fulfilled!");
      console.log("  The game state has changed to 'Playing'");
      console.log(`  Potato is assigned to token ID: ${potatoTokenId}`);
      
    } else {
      console.log(`\n❓ UNEXPECTED STATE: ${gameState}`);
      console.log("  The game is in an unexpected state.");
    }

  } catch (error: any) {
    console.error("❌ Error monitoring VRF request:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
