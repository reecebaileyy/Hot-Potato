/**
 * Keeper bot: detonates the potato whenever its fuse has run out, so rounds keep moving even when
 * nobody has the site open. Safe to run from any funded wallet; it only calls `checkExplosion`.
 *
 *   npx hardhat run scripts/keeper.ts --network robinhoodTestnet
 *
 * Env: KEEPER_POLL_MS (default 3000).
 */
import { connectGame, sleep, stateName } from "./lib.js";

const { game, publicClient } = await connectGame();
const pollMs = Number(process.env.KEEPER_POLL_MS ?? 3000);

console.log(`Keeper watching ${game.address}, polling every ${pollMs}ms`);
let lastState = -1;

for (;;) {
  try {
    const state = Number(await game.read.state());
    if (state !== lastState) {
      console.log(`[${new Date().toISOString()}] state: ${stateName(state)}`);
      lastState = state;
    }
    const live = state === 2 || state === 4;
    if (live) {
      const secondsLeft = Number(await game.read.getExplosionTime());
      if (secondsLeft === 0) {
        const hash = await game.write.checkExplosion();
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`[${new Date().toISOString()}] exploded (tx ${hash}, gas ${receipt.gasUsed})`);
        continue;
      }
      await sleep(Math.min(pollMs, secondsLeft * 1000));
      continue;
    }
  } catch (err) {
    // A revert here usually means someone else detonated first; keep going.
    console.error(`[${new Date().toISOString()}] ${(err as Error).message.split("\n")[0]}`);
  }
  await sleep(pollMs);
}
