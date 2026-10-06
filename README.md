# Hot Potato

An onchain game of pass-or-explode on [Robinhood Chain](https://docs.robinhood.com/chain/).

Every player mints a pair of hands (an NFT with fully onchain art). When a round starts, one hand
gets the potato and a fuse starts burning. Whoever holds the potato passes it to another player's
hand before the fuse runs out; when it does, the hand holding it is out and the potato jumps to a
random survivor. The last wallet standing wins 40% of the round's mint pot.

- [`backend/`](backend/README.md): Solidity contracts, tests, deploy module and the keeper bot.
- [`frontend/`](frontend/README.md): Next.js app (play, leaderboard, admin panel).

## Quick start (local)

```bash
# 1. contracts on a local node
cd backend && npm install
npm run node                 # terminal 1
npm run deploy:local         # terminal 2
npm run keeper -- --network localhost

# 2. frontend against it
cd ../frontend && npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_CHAIN=hardhat, NEXT_PUBLIC_GAME_ADDRESS from backend/ignition/deployments/chain-31337/deployed_addresses.json
npm run dev
```

## Networks

| | Chain ID | RPC | Explorer |
|---|---|---|---|
| Robinhood Chain | 4663 | https://rpc.mainnet.chain.robinhood.com | https://robinhoodchain.blockscout.com |
| Robinhood Chain testnet | 46630 | https://rpc.testnet.chain.robinhood.com | https://explorer.testnet.chain.robinhood.com |

Deployment addresses are recorded under `backend/ignition/deployments/chain-<id>/deployed_addresses.json`.
