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
// Wall-clock moment the current fuse is due. The on-chain view only moves when a block is mined,
// so on a quiet chain (or a local node) we also count down ourselves and just try the call.
let dueAt = Infinity;
let trackedExplosionTime = 0n;

for (;;) {
  try {
    const state = Number(await game.read.state());
    if (state !== lastState) {
      log(`state: ${stateName(state)}`);
      lastState = state;
    }
    const live = state === 2 || state === 4;
    if (!live) {
      dueAt = Infinity;
      trackedExplosionTime = 0n;
      await sleep(pollMs);
      continue;
    }

    const explosionTime = (await game.read.explosionTime()) as bigint;
    const secondsLeft = Number(await game.read.getExplosionTime());
    if (explosionTime !== trackedExplosionTime) {
      trackedExplosionTime = explosionTime;
      dueAt = Date.now() + secondsLeft * 1000;
    }

    if (secondsLeft === 0 || Date.now() >= dueAt) {
      try {
        const hash = await game.write.checkExplosion();
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        log(`exploded (tx ${hash}, gas ${receipt.gasUsed})`);
        continue;
      } catch (err) {
        // FuseStillBurning: the chain clock is behind our clock; try again shortly.
        // Anything else (someone else detonated first, state changed) resolves on the next read.
        log(`checkExplosion not accepted yet: ${firstLine(err)}`);
        await sleep(1000);
        continue;
      }
    }
    await sleep(Math.min(pollMs, Math.max(250, dueAt - Date.now())));
  } catch (err) {
    log(`rpc error: ${firstLine(err)}`);
    await sleep(pollMs);
  }
}

function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function firstLine(err: unknown): string {
  return String((err as Error)?.message ?? err).split("\n")[0];
}
