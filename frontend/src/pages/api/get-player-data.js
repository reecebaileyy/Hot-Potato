const { prisma } = require('../../../lib/prisma');
const { getRedisClient } = require('../../../lib/redis');

const CACHE_TTL = 30; // 30 seconds

export default async function handler(req, res) {
  const { address } = req.query;
  console.log(`address: ${address}`)

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  try {
    let playerData = null;
    let fromCache = false;
    const cacheKey = `player:${address}`;

    // Try to get from Redis cache if enabled
    if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
      try {
        const redis = await getRedisClient();
        const cached = await redis.get(cacheKey);
        
        if (cached) {
          playerData = JSON.parse(cached);
          fromCache = true;
          console.log(`Player data for ${address} served from cache`);
        }
      } catch (redisError) {
        console.error('Redis error (falling back to DB):', redisError);
      }
    }

    // If not in cache, fetch from database
    if (!playerData) {
      console.log('Before findUnique')
      playerData = await prisma.leaderboard.findUnique({
        where: { address: address },
      });
      console.log('After findUnique')

      // Cache the result if Redis is enabled (even for null results)
      if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
        try {
          const redis = await getRedisClient();
          await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(playerData));
          console.log(`Player data for ${address} cached`);
        } catch (redisError) {
          console.error('Redis caching error:', redisError);
        }
      }
    }

    console.log(`${address} playerData: ${JSON.stringify(playerData)}`);

    // Set Cache-Control headers
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');

    if (!playerData) {
      console.log('playerData is null')
      res.status(404).json({ error: `No data found for address` });
    } else {
      res.status(200).json(playerData);
    }
  } catch (error) {
    console.error('Inside catch block')
    console.error(error);
    res.status(500).json({ error: `Error fetching data for address ${address}: ${error.message}` });
  }
}
