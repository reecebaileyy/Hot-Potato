import hre from "hardhat";

async function main() {
  console.log("🔍 CHECKING VRF SUBSCRIPTION STATUS...\n");

  // VRF Handler address from deployment
  const VRF_HANDLER_ADDRESS = "0xA18E252a36AC16EE9f65c8a6da1D34ca3b6Ac874";
  
  // Get the wallet client
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`Using account: ${deployer.account.address}`);

  // Get the VRF Handler contract
  const vrfHandler = await hre.viem.getContractAt("VRFHandler", VRF_HANDLER_ADDRESS, {
    client: { wallet: deployer }
  });

  try {
    console.log("📊 VRF HANDLER CONFIGURATION:");
    const subscriptionId = await vrfHandler.read.subscriptionId();
    const keyHash = await vrfHandler.read.keyHash();
    const callbackGasLimit = await vrfHandler.read.callbackGasLimit();
    const requestConfirmations = await vrfHandler.read.requestConfirmations();
    
    console.log(`  Subscription ID: ${subscriptionId}`);
    console.log(`  Key Hash: ${keyHash}`);
    console.log(`  Callback Gas Limit: ${callbackGasLimit}`);
    console.log(`  Request Confirmations: ${requestConfirmations}`);

    console.log("\n🔍 DIAGNOSIS:");
    console.log("  The error 0x79bfd401 is likely caused by one of these VRF issues:");
    console.log("  1. ❌ VRF subscription has insufficient LINK tokens");
    console.log("  2. ❌ VRF subscription has insufficient ETH for gas");
    console.log("  3. ❌ VRF coordinator is experiencing issues");
    console.log("  4. ❌ Gas limit is too low for the VRF request");

    console.log("\n💡 SOLUTIONS:");
    console.log("  To fix this issue, you need to:");
    console.log("  1. 🌐 Go to Chainlink VRF Subscription Manager:");
    console.log("     https://vrf.chain.link/base-sepolia");
    console.log(`  2. 🔍 Find subscription ID: ${subscriptionId}`);
    console.log("  3. 💰 Add LINK tokens to the subscription");
    console.log("  4. ⛽ Add ETH to the subscription for gas");
    console.log("  5. 🔄 Try the endMinting function again");

    console.log("\n📋 STEP-BY-STEP INSTRUCTIONS:");
    console.log("  1. Visit: https://vrf.chain.link/base-sepolia");
    console.log("  2. Connect your wallet (same address as deployer)");
    console.log("  3. Find your subscription in the list");
    console.log("  4. Click 'Add funds' or 'Top up'");
    console.log("  5. Add at least 2-3 LINK tokens");
    console.log("  6. Add at least 0.1 ETH for gas");
    console.log("  7. Wait for confirmation");
    console.log("  8. Try endMinting again");

    console.log("\n⚠️  IMPORTANT NOTES:");
    console.log("  - You need LINK tokens on Base Sepolia testnet");
    console.log("  - You can get testnet LINK from Chainlink faucets");
    console.log("  - The subscription needs both LINK and ETH");
    console.log("  - This is a common issue with VRF deployments");

  } catch (error: any) {
    console.error("❌ Error checking VRF subscription:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
