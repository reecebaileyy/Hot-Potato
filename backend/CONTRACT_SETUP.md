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
- **Game Contract**: `0x1fB69dDc3C0CA3af33400294893b7e99b8f224dF`
- **Inventory Manager**: `0xB8F01a17081d5c6A762EC6a1cE203a3E0Fe8e024`
- **Backgrounds Contract**: `0x31B56FBCB9cfb54c3015B5EaF106f1Ca49d09166`
- **Hands Contract**: `0xbA3f05d94b38265525680DAc5286BA0CF77f6fA7`
- **Potatoes Contract**: `0xB79074E0Fd3694dc7d5b963497F6f9be8af17123`
- **VRFHandler Contract**: `0x06D44ba41d0689137419279889357166D82A4d19`

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
