/**
 * Prints the current game state.
 *
 *   npx hardhat run scripts/status.ts --network robinhoodTestnet
 */
import { formatEther } from "viem";
import { connectGame, stateName } from "./lib.js";

const { game, chainId, address } = await connectGame();
const info = (await game.read.getGameInfo()) as {
  state: number;
  round: bigint;
  potatoTokenId: bigint;
  potatoHolder: string;
  secondsLeft: bigint;
  activeHands: bigint;
  activeWallets: bigint;
  roundPasses: bigint;
  pot: bigint;
  mintPrice: bigint;
  maxPerWallet: bigint;
  mintedThisRound: bigint;
  totalMinted: bigint;
  seedRevealed: boolean;
};

console.log(`Game ${address} on chain ${chainId}`);
console.log(`  state:          ${stateName(info.state)} (round ${info.round})`);
console.log(`  pot:            ${formatEther(info.pot)} ETH`);
console.log(`  mint price:     ${formatEther(info.mintPrice)} ETH (max ${info.maxPerWallet}/wallet)`);
console.log(`  minted:         ${info.mintedThisRound} this round, ${info.totalMinted} total`);
console.log(`  active:         ${info.activeHands} hands across ${info.activeWallets} wallets`);
console.log(`  passes:         ${info.roundPasses}`);
console.log(`  potato:         token ${info.potatoTokenId} held by ${info.potatoHolder}`);
console.log(`  fuse:           ${info.secondsLeft}s left`);
console.log(`  seed revealed:  ${info.seedRevealed}`);
