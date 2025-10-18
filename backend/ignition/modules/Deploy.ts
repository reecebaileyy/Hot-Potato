// ignition/modules/Deploy.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HotPotatoModule = buildModule("HotPotatoModule", (m) => {
  console.log("\n==================== 🌶️ HOT POTATO DEPLOYMENT ====================\n");

  // Deploy Game
  const game = m.contract(
    "Game",
    ["78673229480145255509508114948932881804799032944497392483080445829768349089996"],
    { id: "GameContract" }
  );

  // Deploy VRFHandler (and link Game)
  const vrfHandler = m.contract(
    "VRFHandler",
    [
      "78673229480145255509508114948932881804799032944497392483080445829768349089996",
      "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71",
      game,
    ],
    { id: "VRFHandlerContract" }
  );

  // Link the VRFHandler to Game — don't return it
  m.call(game, "setVRFHandler", [vrfHandler]);

  // Other supporting contracts
  const inventoryManager = m.contract("InventoryManager", [], { id: "InventoryContract" });
  const backgrounds = m.contract("Backgrounds", [], { id: "BackgroundsContract" });
  const hands = m.contract("Hands", [], { id: "HandsContract" });
  const potato = m.contract("Potato", [], { id: "PotatoContract" });

  console.log("📦 Declared contracts for deployment:");
  console.log("  - Game");
  console.log("  - VRFHandler");
  console.log("  - InventoryManager");
  console.log("  - Backgrounds");
  console.log("  - Hands");
  console.log("  - Potato");

  // ✅ Only return contract futures
  return {
    game,
    vrfHandler,
    inventoryManager,
    backgrounds,
    hands,
    potato,
  };
});

export default HotPotatoModule;
