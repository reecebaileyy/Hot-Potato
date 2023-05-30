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

        // Set Cache-Control headers
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');

        res.status(200).json({ Leaderboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error fetching leaderboard data: ${error.message}` });
    }
}
