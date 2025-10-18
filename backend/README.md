## Prerequisites

Before you begin, make sure you have:

- [Node.js](https://nodejs.org/) (v22 or newer)
- [npm](https://www.npmjs.com/)
- A [Etherscan API Key](https://etherscan.io/myapikey)
- A funded wallet (with Base Sepolia ETH for gas)
- [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/) RPC endpoint

---

## Environment Setup
Make sure you are in Backend folder and run this in terminal:
```bash
npm i
```

Then copy over the environment variables and fill them in with your own:
```bash
cp .env.example .env
```

After this run these comands to deploy:
```bash
npx hardhat compile
npm run deploy
npm run verify (optional)
```
Then Navigate to the basescan Inventory Manager Contract to set the trait count:
```bash
setBackgrounds(20, 0x123)
setHands(41, 0xabc)
setPotatoes(1, 0x000) 
```




