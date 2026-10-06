/**
 * Plays a full round with the local accounts. Meant for a local node or a testnet where the
 * deployer controls several funded wallets (it uses the first `SIM_PLAYERS` wallet clients).
 *
 *   npx hardhat run scripts/simulate-round.ts --network localhost
 *
 * On the local node the fuse is advanced with evm_increaseTime; on a real network it waits.
 */
import { randomBytes } from "node:crypto";
import { toHex, type Address, type Hex } from "viem";
import { connectGame, computeCommitment, sleep, stateName } from "./lib.js";

const { game, viem, publicClient, connection } = await connectGame();
const wallets = await viem.getWalletClients();
const playerCount = Math.min(Number(process.env.SIM_PLAYERS ?? 4), wallets.length - 1);
const players = wallets.slice(1, 1 + playerCount);
const isLocal = (await publicClient.getChainId()) === 31337;

const as = (w: (typeof wallets)[number]) => viem.getContractAt("Game", game.address, { client: { wallet: w } });
const wait = (hash: Promise<Hex> | Hex) => publicClient.waitForTransactionReceipt({ hash: hash as Hex });

let state = Number(await game.read.state());
if (state === 1) {
  throw new Error("Round is already minting; run end-minting.ts with the saved seed instead.");
}
if (state === 0 || state === 5) {
  const seed = toHex(randomBytes(32)) as Hex;
  await wait(await game.write.startGame([computeCommitment(seed)]));
  const [price] = (await game.read.mintConfig()) as readonly [bigint, number, number];
  for (const p of players) {
    const g = await as(p);
    await wait(await g.write.mintHand([2n], { value: price * 2n }));
    console.log(`${p.account.address} minted 2 hands`);
  }
  await wait(await game.write.endMinting([seed]));
  console.log("Play started");
}

for (let step = 0; step < 500; step++) {
  state = Number(await game.read.state());
  if (state === 5) break;
  if (state !== 2 && state !== 4) throw new Error(`Unexpected state ${stateName(state)}`);

  const holder = (await game.read.potatoHolder()) as Address;
  const holderWallet = wallets.find((w) => w.account.address.toLowerCase() === holder.toLowerCase());
  const secondsLeft = Number(await game.read.getExplosionTime());

  // Pass a few times, then let it blow up.
  if (holderWallet && step % 3 !== 2 && secondsLeft > 2) {
    const ids = (await game.read.getActiveTokenIds()) as bigint[];
    let target: bigint | undefined;
    for (const id of ids) {
      const o = (await game.read.ownerOf([id])) as Address;
      if (o.toLowerCase() !== holder.toLowerCase()) {
        target = id;
        break;
      }
    }
    if (target !== undefined) {
      const g = await as(holderWallet);
      await wait(await g.write.passPotato([target]));
      console.log(`${holder} passed the potato to token ${target}`);
      continue;
    }
  }

  if (secondsLeft > 0) {
    if (isLocal) {
      await connection.networkHelpers.time.increase(secondsLeft + 1);
    } else {
      console.log(`waiting ${secondsLeft}s for the fuse`);
      await sleep((secondsLeft + 1) * 1000);
    }
  }
  await wait(await game.write.checkExplosion());
  const info = (await game.read.getGameInfo()) as { activeHands: bigint; activeWallets: bigint };
  console.log(`BOOM: ${info.activeHands} hands and ${info.activeWallets} wallets left (${stateName(Number(await game.read.state()))})`);
}

const round = (await game.read.currentRound()) as bigint;
const winner = (await game.read.hallOfFame([round])) as Address;
console.log(`Round ${round} winner: ${winner}, prize ${await game.read.rewards([winner])} wei`);
