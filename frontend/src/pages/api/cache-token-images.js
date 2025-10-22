const { prisma } = require('../../../lib/prisma');
const { getRedisClient } = require('../../../lib/redis');
const { ethers } = require('ethers');
const GameArtifact = require('../../abi/Game.json');

const CONTRACT_ADDRESS = '0x050Bd2067828D5e94a3E90Be05949C6798b2c176';
const ABI = GameArtifact.abi;
const CACHE_TTL = 3600; // 1 hour
const BATCH_SIZE = 10; // Process 10 tokens at a time

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tokenIds, forceRefresh } = req.body;

  if (!tokenIds || !Array.isArray(tokenIds)) {
    return res.status(400).json({ error: 'tokenIds array is required' });
  }

  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.ALCHEMY_URL || process.env.NEXT_PUBLIC_ALCHEMY_URL
    );
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const results = {
      cached: 0,
      fetched: 0,
      failed: 0,
      total: tokenIds.length,
    };

    // Process tokens in batches to avoid overwhelming the system
    for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
      const batch = tokenIds.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (tokenId) => {
        const tokenIdNum = parseInt(tokenId, 10);
        if (isNaN(tokenIdNum)) {
          results.failed++;
          return;
        }

        try {
          // Check if already cached (unless force refresh)
          if (!forceRefresh) {
            const existing = await prisma.tokenImage.findUnique({
              where: { tokenId: tokenIdNum },
            });

            if (existing) {
              results.cached++;
              console.log(`Token ${tokenIdNum} already cached, skipping`);
              return;
            }
          }

          // Fetch from blockchain
          const imageString = await contract.getImageString(tokenIdNum);
          
          // Cache in MongoDB
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

          // Cache in Redis
          if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
            try {
              const redis = await getRedisClient();
              const redisKey = `token_image:${tokenIdNum}`;
              await redis.setex(redisKey, CACHE_TTL, imageString);
            } catch (redisError) {
              console.error(`Redis caching error for token ${tokenIdNum}:`, redisError);
            }
          }

          results.fetched++;
          console.log(`Token ${tokenIdNum} cached successfully`);
        } catch (error) {
          console.error(`Error caching token ${tokenIdNum}:`, error);
          results.failed++;
        }
      }));

      // Small delay between batches
      if (i + BATCH_SIZE < tokenIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.status(200).json({
      success: true,
      results,
      message: `Processed ${results.total} tokens: ${results.fetched} fetched, ${results.cached} already cached, ${results.failed} failed`,
    });
  } catch (error) {
    console.error('Error in cache-token-images:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}

