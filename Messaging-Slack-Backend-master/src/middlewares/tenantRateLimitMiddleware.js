import Redis from 'ioredis';
import redisConfig from '../config/redisConfig.js';

let client;
function getClient() {
  if (!client) {
    client = new Redis(redisConfig);
    client.on('error', (err) => console.warn('[tenantRateLimit] Redis error:', err.message));
  }
  return client;
}

function tenantRateLimit({ windowSeconds = 60, maxRequests = 100 } = {}) {
  return async (req, res, next) => {
    const workspaceId = req.ctx?.workspaceId;
    if (!workspaceId) return next();

    const key = `ratelimit:workspace:${workspaceId}:${req.baseUrl}${req.path}`;
    try {
      const redis = getClient();
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }
      if (count > maxRequests) {
        return res.status(429).json({
          success: false,
          message: `This workspace has exceeded ${maxRequests} requests per ${windowSeconds}s on this endpoint. Try again shortly.`,
        });
      }
      return next();
    } catch (err) {
      console.warn('[tenantRateLimit] Redis unavailable, allowing request:', err.message);
      return next();
    }
  };
}

export default tenantRateLimit;
