const { redisClient } = require("../config/redis");

const createRateLimiter = ({ prefix, limit, windowSeconds }) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const key = `rl:${prefix}:${ip}`;

      const requests = await redisClient.incr(key);

      if (requests === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      const ttl = await redisClient.ttl(key);

      if (requests > limit) {
        res.set("Retry-After", ttl);
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfter: ttl
        });
      }

      next();
    } catch (error) {
      console.error("[rate-limit] Error:", error);
      // Fail open if Redis has issues
      next();
    }
  };
};

module.exports = createRateLimiter;
