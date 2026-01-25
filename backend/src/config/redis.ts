import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient>;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      console.error(' Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      console.log(' Redis client connected and ready');
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis client disconnected');
    });

    await redisClient.connect();
    console.log(' Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    // Don't throw error in development, just log it
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

export const getRedisClient = () => {
  return redisClient;
};

// Redis helper functions
export const redis = {
  // Set key with expiration (in seconds)
  async set(key: string, value: string, expireInSeconds?: number) {
    if (!redisClient?.isReady) return null;
    try {
      if (expireInSeconds) {
        return await redisClient.setEx(key, expireInSeconds, value);
      }
      return await redisClient.set(key, value);
    } catch (error) {
      console.error('Redis set error:', error);
      return null;
    }
  },

  // Get key
  async get(key: string) {
    if (!redisClient?.isReady) return null;
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  // Delete key
  async del(key: string) {
    if (!redisClient?.isReady) return 0;
    try {
      return await redisClient.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
      return 0;
    }
  },

  // Delete multiple keys by pattern (e.g., 'events:*')
  async delPattern(pattern: string) {
    if (!redisClient?.isReady) return 0;
    try {
      const keys = [];
      // Use SCAN to find all matching keys (safer than KEYS in production)
      for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keys.push(key);
      }
      
      if (keys.length === 0) {
        console.log(`No keys found matching pattern: ${pattern}`);
        return 0;
      }

      // Delete all matching keys
      const deleted = await redisClient.del(keys);
      console.log(` Deleted ${deleted} keys matching pattern: ${pattern}`);
      return deleted;
    } catch (error) {
      console.error('Redis delPattern error:', error);
      return 0;
    }
  },

  // Flush entire database (use with caution!)
  async flushDB() {
    if (!redisClient?.isReady) return false;
    try {
      await redisClient.flushDb();
      console.log('Redis database flushed');
      return true;
    } catch (error) {
      console.error('Redis flushDB error:', error);
      return false;
    }
  },

  // Flush all databases (use with extreme caution!)
  async flushAll() {
    if (!redisClient?.isReady) return false;
    try {
      await redisClient.flushAll();
      console.log('All Redis databases flushed');
      return true;
    } catch (error) {
      console.error('Redis flushAll error:', error);
      return false;
    }
  },

  // Get all keys matching a pattern (use sparingly in production)
  async keys(pattern: string) {
    if (!redisClient?.isReady) return [];
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    if (!redisClient?.isReady) return false;
    try {
      const result: number = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  },

  // Set hash field
  async hSet(key: string, field: string, value: string) {
    if (!redisClient?.isReady) return 0;
    try {
      return await redisClient.hSet(key, field, value);
    } catch (error) {
      console.error('Redis hSet error:', error);
      return 0;
    }
  },

  // Get hash field
  async hGet(key: string, field: string) {
    if (!redisClient?.isReady) return null;
    try {
      return await redisClient.hGet(key, field);
    } catch (error) {
      console.error('Redis hGet error:', error);
      return null;
    }
  },

  // Get all hash fields
  async hGetAll(key: string) {
    if (!redisClient?.isReady) return {};
    try {
      return await redisClient.hGetAll(key);
    } catch (error) {
      console.error('Redis hGetAll error:', error);
      return {};
    }
  },

  // Set JSON data
  async setJSON(key: string, data: any, expireInSeconds?: number) {
    if (!redisClient?.isReady) return null;
    try {
      const jsonString = JSON.stringify(data);
      if (expireInSeconds) {
        return await redisClient.setEx(key, expireInSeconds, jsonString);
      }
      return await redisClient.set(key, jsonString);
    } catch (error) {
      console.error('Redis setJSON error:', error);
      return null;
    }
  },

  // Get JSON data
  async getJSON(key: string) {
    if (!redisClient?.isReady) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis getJSON error:', error);
      return null;
    }
  },

  // Increment counter
  async incr(key: string) {
    if (!redisClient?.isReady) return 0;
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      return 0;
    }
  },

  // Decrement counter
  async decr(key: string) {
    if (!redisClient?.isReady) return 0;
    try {
      return await redisClient.decr(key);
    } catch (error) {
      console.error('Redis decr error:', error);
      return 0;
    }
  },

  // Set expiration on existing key
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!redisClient?.isReady) return false;
    try {
      const result: boolean = await redisClient.expire(key, seconds);
      return result === true;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  },

  // Get time to live for a key
  async ttl(key: string): Promise<number> {
    if (!redisClient?.isReady) return -1;
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -1;
    }
  },
};

export default redis;