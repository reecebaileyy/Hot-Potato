import hre from "hardhat";

async function main() {
  console.log("🔍 DIAGNOSING CONTRACT STATE...\n");

  // Contract address from deployment
  const CONTRACT_ADDRESS = "0x1fB69dDc3C0CA3af33400294893b7e99b8f224dF";
  
  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Get the contract
  const game = await hre.viem.getContractAt("Game", CONTRACT_ADDRESS, {
    client: { wallet: deployer }
  });

  try {
    // Check basic contract state
    console.log("📊 CONTRACT STATE:");
    const gameState = await game.read.getGameState();
    console.log(`  Game State: ${gameState}`);
    
    const currentGeneration = await game.read.currentGeneration();
    console.log(`  Current Generation: ${currentGeneration}`);
    
    const roundMints = await game.read.roundMints();
    console.log(`  Round Mints: ${roundMints}`);
    
    const activeAddresses = await game.read.activeAddresses();
    console.log(`  Active Addresses: ${activeAddresses}`);

    // Check VRF Handler
    console.log("\n🎲 VRF HANDLER:");
    const vrfHandlerAddress = await game.read.vrfHandler();
    console.log(`  VRF Handler Address: ${vrfHandlerAddress}`);
    
    if (vrfHandlerAddress !== "0x0000000000000000000000000000000000000000") {
      const vrfHandler = await hre.viem.getContractAt("VRFHandler", vrfHandlerAddress, {
        client: { wallet: deployer }
      });
      
      const subscriptionId = await vrfHandler.read.subscriptionId();
      console.log(`  Subscription ID: ${subscriptionId}`);
      
      const keyHash = await vrfHandler.read.keyHash();
      console.log(`  Key Hash: ${keyHash}`);
      
      const callbackGasLimit = await vrfHandler.read.callbackGasLimit();
      console.log(`  Callback Gas Limit: ${callbackGasLimit}`);
    } else {
      console.log("  ❌ VRF Handler not set!");
    }

    // Check active tokens (this is likely the issue)
    console.log("\n🎯 ACTIVE TOKENS:");
    const activeTokensLength = await game.read.getActiveTokens();
    console.log(`  Active Tokens Length: ${activeTokensLength}`);
    
    if (activeTokensLength > 0) {
      console.log("  ✅ Active tokens exist");
      
      // Get first few active tokens
      const maxTokensToCheck = Math.min(5, Number(activeTokensLength));
      for (let i = 0; i < maxTokensToCheck; i++) {
        try {
          const tokenId = await game.read.activeTokens([BigInt(i)]);
          const isActive = await game.read._isTokenActive([tokenId]);
          console.log(`    Token ${i}: ID=${tokenId}, Active=${isActive}`);
        } catch (error) {
          console.log(`    Token ${i}: Error reading token`);
        }
      }
    } else {
      console.log("  ❌ NO ACTIVE TOKENS - This is likely causing the revert!");
      console.log("  💡 Solution: Mint some tokens before calling endMinting()");
    }

    // Check owner
    console.log("\n👑 OWNER:");
    const owner = await game.read.owner();
    console.log(`  Owner: ${owner}`);
    console.log(`  Deployer: ${deployer.account.address}`);
    console.log(`  Is Deployer Owner: ${owner.toLowerCase() === deployer.account.address.toLowerCase()}`);

    // Check total supply
    console.log("\n📈 TOKEN SUPPLY:");
    const totalSupply = await game.read.totalSupply();
    console.log(`  Total Supply: ${totalSupply}`);

    // Check if we can call endMinting
    console.log("\n🔧 END MINTING CHECK:");
    if (gameState === "Minting") {
      console.log("  ✅ Game is in Minting state");
      
      if (activeTokensLength === 0n) {
        console.log("  ❌ Cannot end minting - no active tokens!");
        console.log("  💡 You need to mint at least one token before ending minting");
        console.log("  💡 The error occurs because: currentRandomWord % activeTokens.length causes division by zero");
      } else {
        console.log("  ✅ Should be able to end minting");
      }
    } else {
      console.log(`  ❌ Game is not in Minting state (current: ${gameState})`);
    }

    // Additional checks
    console.log("\n🔍 ADDITIONAL DIAGNOSTICS:");
    try {
      const potatoTokenId = await game.read.potatoTokenId();
      console.log(`  Current Potato Token ID: ${potatoTokenId}`);
    } catch (error) {
      console.log("  Could not read potatoTokenId");
    }

    try {
      const price = await game.read._price();
      console.log(`  Mint Price: ${price} wei`);
    } catch (error) {
      console.log("  Could not read mint price");
    }

  } catch (error) {
    console.error("❌ Error diagnosing contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });