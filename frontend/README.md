# Hot Potato frontend

Next.js 16 (pages router) + wagmi 3 / viem + Privy. Every number on the site is read from the
Game contract; there is no database.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # http://localhost:3000
```

`.env.local.example` lists every variable. `NEXT_PUBLIC_CHAIN` picks `robinhood`,
`robinhoodTestnet` (default) or `hardhat`; chain ids, RPCs and explorer links come from viem's
chain definitions (see `src/config/chain.ts`).

### Local chain

```bash
cd ../backend && npm run node          # terminal 1
cd ../backend && npm run deploy:local  # terminal 2
```

Then set `NEXT_PUBLIC_CHAIN=hardhat` and `NEXT_PUBLIC_GAME_ADDRESS` to `"HotPotato#Game"` from
`backend/ignition/deployments/chain-31337/deployed_addresses.json`.

## Scripts

| Script              | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Dev server (regenerates the typed ABI first)                        |
| `npm run build`     | Production build (regenerates the typed ABI first)                  |
| `npm run lint`      | ESLint 9 flat config (`eslint.config.mjs`)                          |
| `npm run typecheck` | `tsc --noEmit`                                                      |
| `npm run abi`       | `src/abi/Game.json` → `src/abi/gameAbi.ts` (`as const`, for typing) |

After a contract change, run `npm run export-abi` in `backend/` (it writes `src/abi/Game.json`),
then `npm run abi` here.

## Admin: starting a round

The round seed uses commit-reveal. **Generate & Download Seed** creates a 32-byte seed in the
browser, saves `{ chainId, game, round, seed, commitment }` to localStorage
(`hotpotato:seed:<chainId>:<game lowercased>:<round>`) and downloads the same JSON as
`round-<n>.json`; **Start Round** then sends `startGame(commitment)`. **Reveal Seed & Start Play** loads that
seed, checks it against `seedCommitment(round)` on chain and sends `endMinting(seed)`. If the
browser copy is gone, upload the JSON file (the backend's `backend/.seeds/.../round-<n>.json`
works too) or paste the seed hex. Without the seed the round can only be cancelled.

## Layout

- `src/config`: chain and wagmi config
- `src/lib`: contract helpers, error copy, seed handling
- `src/hooks`: reads (`useGame`, `usePlayer`, `useLeaderboard`, ...) and writes (`usePlayerActions`, `useAdminActions`)
- `src/pages/api/hand-image.ts`: serves a hand's SVG by traits, cached at the CDN
