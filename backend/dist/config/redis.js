"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
let redisClient;
const connectRedis = async () => {
    try {
        redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            password: process.env.REDIS_PASSWORD || undefined,
        });
        redisClient.on('error', (err) => {
            console.error(' Redis Client Error:', err);
        });
        redisClient.on('connect', () => {
            console.log(' Redis client connecting...');
        });
        redisClient.on('ready', () => {
            console.log(' Redis client connected and ready');
        });
        redisClient.on('end', () => {
            console.log(' Redis client disconnected');
        });
        await redisClient.connect();
        console.log(' Redis connected successfully');
    }
    catch (error) {
        console.error(' Redis connection error:', error);
        if (process.env.NODE_ENV === 'production') {
            throw error;
        }
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
exports.redis = {
    async set(key, value, expireInSeconds) {
        if (!redisClient?.isReady)
            return null;
        try {
            if (expireInSeconds) {
                return await redisClient.setEx(key, expireInSeconds, value);
            }
            return await redisClient.set(key, value);
        }
        catch (error) {
            console.error('Redis set error:', error);
            return null;
        }
    },
    async get(key) {
        if (!redisClient?.isReady)
            return null;
        try {
            return await redisClient.get(key);
        }
        catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    },
    async del(key) {
        if (!redisClient?.isReady)
            return 0;
        try {
            return await redisClient.del(key);
        }
        catch (error) {
            console.error('Redis del error:', error);
            return 0;
        }
    },
    async exists(key) {
        if (!redisClient?.isReady)
            return false;
        try {
            return await redisClient.exists(key);
        }
        catch (error) {
            console.error('Redis exists error:', error);
            return false;
        }
    },
    async hSet(key, field, value) {
        if (!redisClient?.isReady)
            return 0;
        try {
            return await redisClient.hSet(key, field, value);
        }
        catch (error) {
            console.error('Redis hSet error:', error);
            return 0;
        }
    },
    async hGet(key, field) {
        if (!redisClient?.isReady)
            return null;
        try {
            return await redisClient.hGet(key, field);
        }
        catch (error) {
            console.error('Redis hGet error:', error);
            return null;
        }
    },
    async hGetAll(key) {
        if (!redisClient?.isReady)
            return {};
        try {
            return await redisClient.hGetAll(key);
        }
        catch (error) {
            console.error('Redis hGetAll error:', error);
            return {};
        }
    },
    async setJSON(key, data, expireInSeconds) {
        if (!redisClient?.isReady)
            return null;
        try {
            const jsonString = JSON.stringify(data);
            if (expireInSeconds) {
                return await redisClient.setEx(key, expireInSeconds, jsonString);
            }
            return await redisClient.set(key, jsonString);
        }
        catch (error) {
            console.error('Redis setJSON error:', error);
            return null;
        }
    },
    async getJSON(key) {
        if (!redisClient?.isReady)
            return null;
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Redis getJSON error:', error);
            return null;
        }
    },
    async incr(key) {
        if (!redisClient?.isReady)
            return 0;
        try {
            return await redisClient.incr(key);
        }
        catch (error) {
            console.error('Redis incr error:', error);
            return 0;
        }
    },
    async decr(key) {
        if (!redisClient?.isReady)
            return 0;
        try {
            return await redisClient.decr(key);
        }
        catch (error) {
            console.error('Redis decr error:', error);
            return 0;
        }
    },
};
exports.default = exports.redis;
//# sourceMappingURL=redis.js.map