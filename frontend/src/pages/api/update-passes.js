// pages/api/update-passes.js
const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
    const { address } = req.body;

    try {
        await prisma.leaderboard.upsert({
            where: { address: address },
            update: {
                passes: {
                    increment: 1
                },
            },
            create: {
                address: address,
                passes: 1,
                fails: 0,
                wins: 0,  // initial value, adjust as needed
            },
        });

        console.log("Completed upsert")

        res.status(200).json({ message: `Updated successful passes for ${address}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error updating successful passes: ${error.message}` });
    }
}
