const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
    const { transaction } = req.body;
    const address = transaction.from;

    try {
        const existingPlayer = await prisma.leaderboard.findUnique({
            where: { address: address },
        });

        if (existingPlayer) {
            await prisma.leaderboard.updateMany({
                where: { address: address },
                data: {
                    wins: {
                        increment: 1
                    },
                },
            });
        } else {
            await prisma.leaderboard.create({
                data: {
                    address: address,
                    passes: 0,
                    wins: 1,  // initial value, adjust as needed
                },
            });
        }

        res.status(200).json({ message: `Updated wins for ${address}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error updating wins: ${error.message}` });
    }
}