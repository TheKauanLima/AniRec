const redis = require('redis');

const client = redis.createClient(
{
  socket:
  {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

client.on('connect', () =>
{
  console.log('✅ Redis connected');
});

client.on('error', (err) =>
{
  console.error('❌ Redis error:', err);
});

// Connect to Redis
(async () =>
{
  await client.connect();
})();

module.exports = client;
