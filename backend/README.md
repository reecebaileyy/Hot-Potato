# Hot Potato contracts

Solidity contracts, tests, deploy module and operator scripts for Hot Potato on
[Robinhood Chain](https://docs.robinhood.com/chain/).

## How a round works

1. **Minting.** The owner runs `start-round`, which picks a secret seed, saves it locally and
   commits its hash on chain (`startGame(commitment)`). Players call `mintHand(quantity)` at the
   configured price and per-wallet cap.
2. **Play.** The owner runs `end-minting`, which reveals the seed (`endMinting(seed)`). Every hand
   ever minted joins the round, hand traits for the new mints are rolled from the seed, and a
   random hand gets the potato with a burning fuse.
3. **Passing.** The potato holder calls `passPotato(toTokenId)` to hand it to any active hand owned
   by someone else. Passing does not reset the fuse; the fuse gets shorter as passes accumulate.
4. **Explosion.** When the fuse runs out anyone can call `checkExplosion()` (the keeper bot does
   this automatically). The hand holding the potato is out for the round; a random active hand gets
   the potato and a fresh fuse. A late `passPotato` also explodes.
5. **End.** When one wallet is left it wins. The pot is split 40% winner, 10% project, 30% team
   (two wallets), 20% charity, and everyone claims with `withdraw()`.

Hands can't be transferred while a round is in play. Stats (`successfulPasses`, `failedPasses`,
`totalWins`, `hallOfFame`, `getLeaderboard`) live on chain, so no database is needed.

### Randomness

Robinhood Chain has no VRF oracle and `block.prevrandao` is a constant there, so the game uses an
operator commit-reveal scheme (`CommitRevealRandomness.sol`): the seed hash is committed before
anyone mints, every mint mixes entropy into the round, and the seed is revealed to start play.
The operator can't change the seed after committing; players can't predict it before the reveal.
Keep the seed files in `.seeds/` safe until the reveal: without the seed, a round can only be
cancelled (`cancelRound()`, its pot rolls over).

## Setup

```bash
npm install
cp .env.example .env   # fill in DEPLOYER_PRIVATE_KEY and the RPC URLs
npm run build
npm test
```

Hardhat 3 downloads `solc` 0.8.28 on first build. If that download is blocked, grab the binary
from https://github.com/ethereum/solidity/releases and set `SOLC_PATH=/path/to/solc`.

## Deploy

```bash
# Local node (chain 31337)
npm run node                 # in one terminal
npm run deploy:local         # deploys and writes ignition/deployments/chain-31337/deployed_addresses.json
npm run simulate -- --network localhost   # plays a whole round with the node's accounts

# Robinhood Chain testnet (chain 46630)
npm run deploy:testnet
npm run verify:testnet       # Blockscout verification

# Robinhood Chain mainnet (chain 4663)
npm run deploy:mainnet
npm run verify:mainnet
```

Payees, mint price and fuse timing are Ignition parameters; edit
`ignition/parameters/robinhoodTestnet.json` / `robinhood.json` (add `owner`, `projectWallet`,
`teamWallet1`, `teamWallet2`, `charityWallet` there for mainnet). Mint price and fuse timing can
also be changed later with `setMintConfig` / `setFuseConfig` between rounds.

## Running a game

All scripts take `-- --network <name>` and read the Game address from the Ignition deployment for
that chain (override with `GAME_ADDRESS`).

```bash
npm run status -- --network robinhoodTestnet
npm run start-round -- --network robinhoodTestnet   # commit seed, open minting
npm run end-minting -- --network robinhoodTestnet   # reveal seed, start play
npm run keeper -- --network robinhoodTestnet        # long-running: detonates when the fuse runs out
```

The frontend's admin panel can do the same (it stores seeds in the browser and downloads them as
JSON, in the same format as `.seeds/`), so either tool can start or end a round.

## Layout

- `contracts/Game.sol` – the game (ERC721A + round logic + payouts)
- `contracts/CommitRevealRandomness.sol` – per-round randomness
- `contracts/InventoryManager.sol`, `contracts/Inventory.sol` – onchain SVG art and metadata
- `ignition/modules/HotPotato.ts` – deployment
- `scripts/` – operator scripts (`keeper`, `start-round`, `end-minting`, `status`, `simulate-round`, `export-abi`)
- `test/` – Hardhat + viem tests (`npm test`)

After changing `Game.sol`, run `npm run build && npm run export-abi` to refresh
`frontend/src/abi/Game.json`.
