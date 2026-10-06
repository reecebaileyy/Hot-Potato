// Copies the Game ABI into the frontend so the two stay in sync.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifact = JSON.parse(readFileSync(path.join(root, "artifacts/contracts/Game.sol/Game.json"), "utf8"));
const out = path.resolve(root, "../frontend/src/abi/Game.json");
writeFileSync(out, JSON.stringify(artifact.abi, null, 2) + "\n");
console.log(`wrote ${artifact.abi.length} ABI entries to ${out}`);
