import { network } from "hardhat";
import { keccak256, encodeAbiParameters, parseEther, type Hex, type Address } from "viem";

export const PRICE = parseEther("0.01");

export interface FuseConfig {
  initial: number;
  decreaseEvery: number;
  decreaseBy: number;
  minimum: number;
}

export interface MintConfig {
  price: bigint;
  maxPerWallet: number;
  maxPerRound: number;
}

export const DEFAULT_FUSE: FuseConfig = {
  initial: 60,
  decreaseEvery: 10,
  decreaseBy: 5,
  minimum: 15,
};

export const DEFAULT_MINT: MintConfig = {
  price: PRICE,
  maxPerWallet: 3,
  maxPerRound: 10_000,
};

export function seedFor(round: number): Hex {
  return keccak256(encodeAbiParameters([{ type: "string" }, { type: "uint256" }], [`seed`, BigInt(round)]));
}

export function commitmentFor(seed: Hex): Hex {
  return keccak256(encodeAbiParameters([{ type: "bytes32" }], [seed]));
}

export async function deployGame(overrides: { mint?: MintConfig; fuse?: FuseConfig } = {}) {
  const connection = await network.create();
  const { viem, networkHelpers } = connection;
  const [owner, project, team1, team2, charity, ...players] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const backgrounds = await viem.deployContract("Backgrounds");
  const hands = await viem.deployContract("Hands");
  const potato = await viem.deployContract("Potato");
  const inventory = await viem.deployContract("InventoryManager");
  await inventory.write.setBackgrounds([20, backgrounds.address]);
  await inventory.write.setHands([41, hands.address]);
  await inventory.write.setPotatoes([1, potato.address]);

  const game = await viem.deployContract("Game", [
    "Hot Potato",
    "POTATO",
    owner.account.address,
    inventory.address,
    [project.account.address, team1.account.address, team2.account.address, charity.account.address],
    overrides.mint ?? DEFAULT_MINT,
    overrides.fuse ?? DEFAULT_FUSE,
  ]);

  const as = (client: (typeof players)[number]) =>
    viem.getContractAt("Game", game.address, { client: { wallet: client } });

  return {
    connection,
    viem,
    networkHelpers,
    publicClient,
    game,
    inventory,
    owner,
    project,
    team1,
    team2,
    charity,
    players,
    as,
  };
}

export type Fixture = Awaited<ReturnType<typeof deployGame>>;

/** Opens a round, mints `handsPerPlayer` hands for each listed player, and reveals the seed. */
export async function playRound(
  f: Fixture,
  playerClients: Fixture["players"],
  handsPerPlayer = 1,
  round = 1,
) {
  const seed = seedFor(round);
  await f.game.write.startGame([commitmentFor(seed)]);
  for (const p of playerClients) {
    const g = await f.as(p);
    await g.write.mintHand([BigInt(handsPerPlayer)], { value: PRICE * BigInt(handsPerPlayer) });
  }
  await f.game.write.endMinting([seed]);
  return seed;
}

export async function holderClient(f: Fixture): Promise<Fixture["players"][number]> {
  const holder = (await f.game.read.potatoHolder()) as Address;
  const all = [f.owner, ...f.players];
  const client = all.find((c) => c.account.address.toLowerCase() === holder.toLowerCase());
  if (!client) throw new Error(`no wallet client for holder ${holder}`);
  return client;
}

/** Finds an active token owned by someone other than `exclude`. */
export async function activeTokenNotOwnedBy(f: Fixture, exclude: Address): Promise<bigint> {
  const ids = (await f.game.read.getActiveTokenIds()) as bigint[];
  for (const id of ids) {
    const o = (await f.game.read.ownerOf([id])) as Address;
    if (o.toLowerCase() !== exclude.toLowerCase()) return id;
  }
  throw new Error("no active token owned by another player");
}

export async function explodeUntilEnded(f: Fixture, maxIterations = 200) {
  for (let i = 0; i < maxIterations; i++) {
    const state = await f.game.read.state();
    if (state === 5) return; // Ended
    const secondsLeft = Number(await f.game.read.getExplosionTime());
    if (secondsLeft > 0) await f.networkHelpers.time.increase(secondsLeft + 1);
    await f.game.write.checkExplosion();
  }
  throw new Error("round did not end");
}
