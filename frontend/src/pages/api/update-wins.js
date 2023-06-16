// pages/api/update-passes.js
const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
    const { address } = req.body;

    try {
        await prisma.leaderboard.upsert({
            where: { address: address },
            update: {
                wins: {
                    increment: 1
                },
            },
            create: {
                address: address,
                passes: 0,
                fails: 0,
                wins: 1,  // initial value, adjust as needed
            },
        });

        console.log("Completed upsert")

        res.status(200).json({ message: `Updated Total Wins for ${address}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error updating Total Wins: ${error.message}` });
    }
}
