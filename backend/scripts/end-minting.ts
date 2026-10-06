/**
 * Closes minting and starts play by revealing the seed saved by `start-round`.
 *
 *   npx hardhat run scripts/end-minting.ts --network robinhoodTestnet
 */
import { connectGame, loadSeed, stateName } from "./lib.js";

const { game, chainId, address, publicClient } = await connectGame();

const state = Number(await game.read.state());
if (state !== 1) throw new Error(`Game is ${stateName(state)}; it must be Minting`);

const round = (await game.read.currentRound()) as bigint;
const { seed, commitment } = loadSeed(chainId, address, round);
const onChain = await game.read.seedCommitment([round]);
if (onChain !== commitment) {
  throw new Error(`Seed file commitment ${commitment} does not match on-chain ${onChain}`);
}

const hash = await game.write.endMinting([seed]);
await publicClient.waitForTransactionReceipt({ hash });
const info = (await game.read.getGameInfo()) as { activeHands: bigint; activeWallets: bigint; potatoHolder: string };
console.log(
  `Round ${round} started (tx ${hash}): ${info.activeHands} hands, ${info.activeWallets} wallets, potato with ${info.potatoHolder}`,
);
