const { prisma } = require('../../../lib/prisma');
const { getRedisClient } = require('../../../lib/redis');
const { ethers } = require('ethers');
const GameArtifact = require('../../abi/Game.json');

const CONTRACT_ADDRESS = '0x050Bd2067828D5e94a3E90Be05949C6798b2c176';
const ABI = GameArtifact.abi;
const CACHE_TTL = 3600; // 1 hour

export default async function handler(req, res) {
  const { tokenId } = req.query;

  if (!tokenId) {
    return res.status(400).json({ error: 'tokenId parameter is required' });
  }

  const tokenIdNum = parseInt(tokenId, 10);
  if (isNaN(tokenIdNum)) {
    return res.status(400).json({ error: 'Invalid tokenId' });
  }

  try {
    let imageString = null;
    let fromCache = false;
    const redisKey = `token_image:${tokenIdNum}`;

    // 1. Try Redis cache first (fastest)
    if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
      try {
        const redis = await getRedisClient();
        const cached = await redis.get(redisKey);
        
        if (cached) {
          imageString = cached;
          fromCache = true;
          console.log(`Token ${tokenIdNum} image served from Redis cache`);
        }
      } catch (redisError) {
        console.error('Redis error (falling back to DB):', redisError);
      }
    }

    // 2. Try MongoDB cache if not in Redis
    if (!imageString) {
      try {
        const dbCache = await prisma.tokenImage.findUnique({
          where: { tokenId: tokenIdNum },
        });

        if (dbCache && dbCache.imageString) {
          imageString = dbCache.imageString;
          fromCache = true;
          console.log(`Token ${tokenIdNum} image served from MongoDB cache`);

          // Warm up Redis cache
          if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
            try {
              const redis = await getRedisClient();
              await redis.setex(redisKey, CACHE_TTL, imageString);
              console.log(`Token ${tokenIdNum} cached in Redis`);
            } catch (redisError) {
              console.error('Redis caching error:', redisError);
            }
          }
        }
      } catch (dbError) {
        console.error('MongoDB cache error:', dbError);
      }
    }

    // 3. Fetch from blockchain if not in cache
    if (!imageString) {
      console.log(`Token ${tokenIdNum} not in cache, fetching from blockchain...`);
      
      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.ALCHEMY_URL || process.env.NEXT_PUBLIC_ALCHEMY_URL
        );
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        imageString = await contract.getImageString(tokenIdNum);
        console.log(`Token ${tokenIdNum} fetched from blockchain`);

        // Cache in MongoDB
        try {
          await prisma.tokenImage.upsert({
            where: { tokenId: tokenIdNum },
            update: {
              imageString: imageString,
              updatedAt: new Date(),
            },
            create: {
              tokenId: tokenIdNum,
              imageString: imageString,
            },
          });
          console.log(`Token ${tokenIdNum} cached in MongoDB`);
        } catch (dbError) {
          console.error('MongoDB caching error:', dbError);
        }

        // Cache in Redis
        if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
          try {
            const redis = await getRedisClient();
            await redis.setex(redisKey, CACHE_TTL, imageString);
            console.log(`Token ${tokenIdNum} cached in Redis`);
          } catch (redisError) {
            console.error('Redis caching error:', redisError);
          }
        }
      } catch (blockchainError) {
        console.error('Blockchain fetch error:', blockchainError);
        return res.status(500).json({ 
          error: 'Failed to fetch token image from blockchain',
          details: blockchainError.message 
        });
      }
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate');
    res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');

    res.status(200).json({
      tokenId: tokenIdNum,
      imageString,
      cached: fromCache,
    });
  } catch (error) {
    console.error('Error in get-token-image:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

