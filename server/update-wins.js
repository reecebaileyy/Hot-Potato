const express = require('express');
const { PrismaClient } = require('@prisma/client'); 
const ABI = require('./abi/UNKNOWN.json');
const ethers = require('ethers');

const prisma = new PrismaClient();  
const app = express();
const port = process.env.PORT || 3000;

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);

let contract = new ethers.Contract('0xb6f6CE3AD79c658645682169C0584664cfEc7908', ABI, provider);

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

        console.log("Completed upsert")

    } catch (error) {
        console.error('Error updating successful passes', error);
    }
});

app.get('/', (req, res) => {
    res.status(200).send('Server is ready and listening for SuccessfulPass events');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
