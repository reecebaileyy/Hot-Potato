import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

/**
 * Deploys the art contracts, the InventoryManager and the Game, then wires them together.
 *
 * Parameters (override with `--parameters ignition/parameters/<network>.json`):
 *   owner, projectWallet, teamWallet1, teamWallet2, charityWallet: addresses (default: deployer)
 *   mintPrice (wei), maxPerWallet, maxPerRound
 *   fuseInitial, fuseDecreaseEvery, fuseDecreaseBy, fuseMinimum (seconds / passes)
 */
export default buildModule("HotPotato", (m) => {
  const deployer = m.getAccount(0);

  const owner = m.getParameter("owner", deployer);
  const projectWallet = m.getParameter("projectWallet", deployer);
  const teamWallet1 = m.getParameter("teamWallet1", deployer);
  const teamWallet2 = m.getParameter("teamWallet2", deployer);
  const charityWallet = m.getParameter("charityWallet", deployer);

  const mintPrice = m.getParameter("mintPrice", parseEther("0.01"));
  const maxPerWallet = m.getParameter("maxPerWallet", 3);
  const maxPerRound = m.getParameter("maxPerRound", 10_000);

  const fuseInitial = m.getParameter("fuseInitial", 60);
  const fuseDecreaseEvery = m.getParameter("fuseDecreaseEvery", 10);
  const fuseDecreaseBy = m.getParameter("fuseDecreaseBy", 5);
  const fuseMinimum = m.getParameter("fuseMinimum", 15);

  const backgrounds = m.contract("Backgrounds");
  const hands = m.contract("Hands");
  const potato = m.contract("Potato");
  const inventory = m.contract("InventoryManager");

  m.call(inventory, "setBackgrounds", [20, backgrounds]);
  m.call(inventory, "setHands", [41, hands]);
  m.call(inventory, "setPotatoes", [1, potato]);

  const game = m.contract("Game", [
    "Hot Potato",
    "POTATO",
    owner,
    inventory,
    [projectWallet, teamWallet1, teamWallet2, charityWallet],
    { price: mintPrice, maxPerWallet, maxPerRound },
    {
      initial: fuseInitial,
      decreaseEvery: fuseDecreaseEvery,
      decreaseBy: fuseDecreaseBy,
      minimum: fuseMinimum,
    },
  ]);

  return { game, inventory, backgrounds, hands, potato };
});
