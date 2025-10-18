# Contract Setup Scripts

This document describes the npm commands available for setting up your deployed Hot Potato game contracts.

## Available Commands

### Main Setup Command
```bash
npm run setup-contracts
```
**Description**: Runs all contract setup operations in sequence. This is the recommended command to use after deploying contracts.

**What it does**:
1. Sets the InventoryManager address in the Game contract
2. Sets the Backgrounds contract (20 backgrounds) in the InventoryManager
3. Sets the Hands contract (41 hands) in the InventoryManager  
4. Sets the Potatoes contract (1 potato) in the InventoryManager

### Individual Setup Commands

#### Set InventoryManager in Game Contract
```bash
npm run set-inventory-manager
```
**Description**: Sets the InventoryManager contract address in the Game contract.

#### Set Backgrounds Contract
```bash
npm run set-backgrounds
```
**Description**: Sets the Backgrounds contract address in the InventoryManager (20 backgrounds).

#### Set Hands Contract
```bash
npm run set-hands
```
**Description**: Sets the Hands contract address in the InventoryManager (41 hands).

#### Set Potatoes Contract
```bash
npm run set-potatoes
```
**Description**: Sets the Potatoes contract address in the InventoryManager (1 potato).

## Contract Addresses

The scripts automatically read the deployed contract addresses from:
`backend/ignition/deployments/chain-84532/deployed_addresses.json`

Current deployed addresses:
- **Game Contract**: `0xD89A2aE68A3696D42327D75C02095b632D1B8f53`
- **Inventory Manager**: `0x687EAfD1A7350D3F98295Bc9D6835bf73E43E752`
- **Backgrounds Contract**: `0x354Cf062BF681dD256518e9980422E142B8C2Fe1`
- **Hands Contract**: `0xEa302520bf70acBf895D15771412484ec4144daF`
- **Potatoes Contract**: `0x16c561050a56610Ca0dd107014e549EB2803EC75`

## Usage Instructions

1. **After deploying contracts**: Run `npm run setup-contracts` to configure all contracts
2. **For individual operations**: Use the specific commands if you need to update only certain contracts
3. **Network**: All commands run on the Base Sepolia network (`baseSepolia`)

## Technical Details

- **Framework**: Uses Hardhat with Viem for contract interactions
- **Network**: Base Sepolia (Chain ID: 84532)
- **Scripts Location**: `backend/scripts/`
- **Configuration**: Reads from deployed addresses JSON file automatically

## Error Handling

The scripts include error handling and will:
- Show success messages when operations complete
- Display warning messages if contracts are already configured
- Provide error details if something goes wrong

## Verification

After running the setup scripts, you can verify the contracts are properly configured by:
1. Checking the contract state on Base Sepolia explorer
2. Running contract read functions to confirm the addresses are set correctly
3. Testing the game functionality in your frontend application
