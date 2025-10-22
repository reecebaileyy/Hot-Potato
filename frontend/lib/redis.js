// lib/redis.js

const Redis = require("ioredis");

let redisClient = null;

// Function to get or create Redis client
async function getRedisClient() {
  // If Redis is not enabled, throw error
  if (!process.env.REDIS_URL && process.env.USE_REDIS !== 'true') {
    throw new Error('Redis is not configured');
  }

  // If client already exists and is connected, return it
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  // Create new client
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    }
  });

  // Handle connection events
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });

  redisClient.on('ready', () => {
    console.log('Redis Client Ready');
  });

  return redisClient;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
});

process.on('SIGTERM', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
});

module.exports = { getRedisClient };
