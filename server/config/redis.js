const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on("error", (err) => {
  console.error("[redis] Error:", err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("[redis] Connected to Redis");
  } catch (error) {
    console.error("[redis] Failed to connect to Redis, using in-memory fallback:", error);
  }
};

// In-Memory Fallback Cache to ensure auth works even if Redis is not configured or fails
const memoryCache = new Map();

const cacheSet = async (key, value, options) => {
  if (redisClient.isOpen) {
    try {
      return await redisClient.set(key, value, options);
    } catch (err) {
      console.error("[redis] set error, falling back to memory:", err);
    }
  }
  memoryCache.set(key, value);
  if (options && options.EX) {
    setTimeout(() => {
      memoryCache.delete(key);
    }, options.EX * 1000);
  }
};

const cacheGet = async (key) => {
  if (redisClient.isOpen) {
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.error("[redis] get error, falling back to memory:", err);
    }
  }
  return memoryCache.get(key) || null;
};

const cacheDel = async (key) => {
  if (redisClient.isOpen) {
    try {
      return await redisClient.del(key);
    } catch (err) {
      console.error("[redis] del error, falling back to memory:", err);
    }
  }
  memoryCache.delete(key);
};

const cacheIncr = async (key) => {
  if (redisClient.isOpen) {
    try {
      return await redisClient.incr(key);
    } catch (err) {
      console.error("[redis] incr error, falling back to memory:", err);
    }
  }
  const current = parseInt(memoryCache.get(key) || "0", 10);
  const nextVal = current + 1;
  memoryCache.set(key, nextVal.toString());
  return nextVal;
};

const cacheExpire = async (key, seconds) => {
  if (redisClient.isOpen) {
    try {
      return await redisClient.expire(key, seconds);
    } catch (err) {
      console.error("[redis] expire error, falling back to memory:", err);
    }
  }
  setTimeout(() => {
    memoryCache.delete(key);
  }, seconds * 1000);
};

const cacheTtl = async (key) => {
  if (redisClient.isOpen) {
    try {
      return await redisClient.ttl(key);
    } catch (err) {
      console.error("[redis] ttl error, falling back to memory:", err);
    }
  }
  return 60;
};

module.exports = {
  redisClient,
  connectRedis,
  cacheSet,
  cacheGet,
  cacheDel,
  cacheIncr,
  cacheExpire,
  cacheTtl
};
