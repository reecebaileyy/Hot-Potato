// lib/redis.js

const Redis = require("ioredis");

let client;

if (!client) {
    client = new Redis();

    client.connect()
        .then(() => console.log('Connected to Redis'))
        .catch(err => console.error('Failed to connect to Redis', err));
        
    client.on('error', (err) => console.error('Redis error', err));
    client.on('connect', () => console.log('Redis connected'));
    client.on('end', () => console.log('Redis connection closed'));
}

module.exports = client;
