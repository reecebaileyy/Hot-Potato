const express = require('express');
const { prisma } = require('./lib/prisma');
const ABI = require('./abi/UNKNOWN.json');
const ethers = require('ethers');

const app = express();
const port = process.env.PORT || 3001; // Different port to avoid conflicts

// Initialize provider with connection pooling
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL, undefined, {
  polling: true,
  pollingInterval: 4000,
});

let contract = new ethers.Contract('0xb6f6CE3AD79c658645682169C0584664cfEc7908', ABI, provider);

// Add connection error handling
provider.on('error', (error) => {
  console.error('Provider connection error:', error);
});

contract.on('PlayerWon', async (player, event) => {
    try {
        await prisma.leaderboard.upsert({
            where: { address: player },
            update: {
                wins: {
                    increment: 1
                },
            },
            create: {
                address: player,
                passes: 0,
                fails: 0,
                wins: 1, 
            },
        });

        console.log("Completed upsert for winner:", player);

    } catch (error) {
        console.error('Error updating wins', error);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        contract: contract.address 
    });
});

app.get('/', (req, res) => {
    res.status(200).send('Server is ready and listening for PlayerWon events');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Listening for PlayerWon events on contract: ${contract.address}`);
});
