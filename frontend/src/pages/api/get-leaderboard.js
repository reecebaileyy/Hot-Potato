const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
    try {
        const Leaderboard = await prisma.Leaderboard.findMany({
            orderBy: [
                {
                    wins: 'desc',
                },
                {
                    passes: 'desc',
                },
            ],
        });

        res.status(200).json({ Leaderboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error fetching leaderboard data: ${error.message}` });
    }
}
