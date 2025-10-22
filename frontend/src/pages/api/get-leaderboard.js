// Path: frontend\src\pages\api\get-leaderboard.js
const { prisma } = require('../../../lib/prisma');
const { getRedisClient } = require('../../../lib/redis');

const CACHE_KEY = 'leaderboard:all';
const CACHE_TTL = 30; // 30 seconds

export default async function handler(req, res) {
    try {
        let Leaderboard = null;
        let fromCache = false;

        // Try to get from Redis cache if enabled
        if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
            try {
                const redis = await getRedisClient();
                const cached = await redis.get(CACHE_KEY);
                
                if (cached) {
                    Leaderboard = JSON.parse(cached);
                    fromCache = true;
                    console.log('Leaderboard served from cache');
                }
            } catch (redisError) {
                console.error('Redis error (falling back to DB):', redisError);
            }
        }

        // If not in cache, fetch from database
        if (!Leaderboard) {
            Leaderboard = await prisma.leaderboard.findMany({
                orderBy: [
                    {
                        wins: 'desc',
                    },
                    {
                        passes: 'desc',
                    },
                ],
            });

            // Cache the result if Redis is enabled
            if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
                try {
                    const redis = await getRedisClient();
                    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(Leaderboard));
                    console.log('Leaderboard cached');
                } catch (redisError) {
                    console.error('Redis caching error:', redisError);
                }
            }
        }

        // Set Cache-Control headers
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');

        res.status(200).json({ Leaderboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error fetching leaderboard data: ${error.message}` });
    }
}