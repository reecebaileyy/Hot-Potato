// pages/api/update-passes.js
const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
    const { address } = req.body;

    try {
        console.log("address: ", address)
        const existingPlayer = await prisma.Leaderboard.findUnique({
            where: { address: address },
        });

        if (existingPlayer) {
            await prisma.Leaderboard.updateMany({
                where: { address: address },
                data: {
                    passes: {
                        increment: 1
                    },
                },
            });
            console.log("Completed updateMany")

        } else {
            await prisma.Leaderboard.create({
                data: {
                    address: address,
                    passes: 1,
                    wins: 0,  // initial value, adjust as needed
                },
            });

        }

        res.status(200).json({ message: `Updated successful passes for ${address}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error updating successful passes: ${error.message}` });
    }
}