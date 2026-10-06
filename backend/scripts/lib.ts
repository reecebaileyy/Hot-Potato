import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { network } from "hardhat";
import {
  keccak256,
  encodeAbiParameters,
  type Address,
  type Hex,
} from "viem";

const here = path.dirname(fileURLToPath(import.meta.url));
export const backendRoot = path.resolve(here, "..");

/** Resolves the Game address from GAME_ADDRESS or the Ignition deployment for this chain. */
export async function connectGame() {
  const connection = await network.create();
  const { viem } = connection;
  const publicClient = await viem.getPublicClient();
  const [wallet] = await viem.getWalletClients();
  const chainId = await publicClient.getChainId();

  let address = process.env.GAME_ADDRESS as Address | undefined;
  if (!address) {
    const file = path.join(backendRoot, "ignition", "deployments", `chain-${chainId}`, "deployed_addresses.json");
    if (!existsSync(file)) {
      throw new Error(`No GAME_ADDRESS set and no Ignition deployment found at ${file}`);
    }
    const deployed = JSON.parse(readFileSync(file, "utf8")) as Record<string, Address>;
    address = deployed["HotPotato#Game"];
    if (!address) throw new Error(`HotPotato#Game missing from ${file}`);
  }

  const game = await viem.getContractAt("Game", address, { client: { wallet } });
  return { connection, viem, publicClient, wallet, chainId, game, address };
}

export function computeCommitment(seed: Hex): Hex {
  return keccak256(encodeAbiParameters([{ type: "bytes32" }], [seed]));
}

/** Seeds are kept per chain and contract so they can't be mixed up between deployments. */
export function seedFilePath(chainId: number, game: Address, round: bigint): string {
  const dir = path.join(backendRoot, ".seeds", `chain-${chainId}`, game.toLowerCase());
  mkdirSync(dir, { recursive: true });
  return path.join(dir, `round-${round}.json`);
}

export function saveSeed(chainId: number, game: Address, round: bigint, seed: Hex, commitment: Hex) {
  const file = seedFilePath(chainId, game, round);
  if (existsSync(file)) throw new Error(`Seed file already exists: ${file}`);
  writeFileSync(file, JSON.stringify({ chainId, game, round: round.toString(), seed, commitment }, null, 2));
  return file;
}

export function loadSeed(chainId: number, game: Address, round: bigint): { seed: Hex; commitment: Hex } {
  const file = seedFilePath(chainId, game, round);
  if (!existsSync(file)) throw new Error(`No seed file for round ${round}: ${file}`);
  return JSON.parse(readFileSync(file, "utf8"));
}

export const STATE_NAMES = ["Queued", "Minting", "Playing", "Paused", "FinalRound", "Ended"] as const;

export function stateName(state: number): string {
  return STATE_NAMES[state] ?? `Unknown(${state})`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
