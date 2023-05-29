// pages/api/update-passes.js
const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
    const { address } = req.body;

    try {
        const existingPlayer = await prisma.leaderboard.findUnique({
            where: { address: address },
        });

        if (existingPlayer) {
            console.log(`Updating fails for existing player ${address}`);
            await prisma.leaderboard.updateMany({
                where: { address: address },
                data: {
                    fails: {
                        increment: 1
                    },
                },
            });

        } else {
            console.log(`Creating new player ${address} with initial fails`);
            await prisma.leaderboard.create({
                data: {
                    address: address,
                    passes: 0,
                    fails: 1, // initial value, adjust as needed
                    wins: 0
                },
            });

        }

        res.status(200).json({ message: `Updated successful passes for ${address}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error updating successful passes: ${error.message}` });
    }
}
