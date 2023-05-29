const { prisma } = require('../../../lib/prisma');

export default async function handler(req, res) {
    try {
        const leaderboard = await prisma.leaderboard.findMany({
            orderBy: [
                {
                    wins: 'desc',
                },
                {
                    passes: 'desc',
                },
            ],
        });

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error fetching leaderboard data: ${error.message}` });
    }
}
