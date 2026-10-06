/**
 * Opens a new round for minting.
 *
 * Generates a random secret seed, stores it under backend/.seeds/ (git-ignored) and commits its
 * hash on chain. Keep that file: `end-minting` needs it to start play.
 *
 *   npx hardhat run scripts/start-round.ts --network robinhoodTestnet
 */
import { randomBytes } from "node:crypto";
import { toHex, type Hex } from "viem";
import { connectGame, computeCommitment, saveSeed, stateName } from "./lib.js";

const { game, chainId, address, publicClient } = await connectGame();

const state = Number(await game.read.state());
if (state !== 0 && state !== 5) {
  throw new Error(`Game is ${stateName(state)}; it must be Queued or Ended to start a round`);
}

const nextRound = ((await game.read.currentRound()) as bigint) + 1n;
const seed = toHex(randomBytes(32)) as Hex;
const commitment = computeCommitment(seed);
const file = saveSeed(chainId, address, nextRound, seed, commitment);

console.log(`Round ${nextRound}: seed saved to ${file}`);
const hash = await game.write.startGame([commitment]);
await publicClient.waitForTransactionReceipt({ hash });
console.log(`Minting open for round ${nextRound} (tx ${hash})`);
