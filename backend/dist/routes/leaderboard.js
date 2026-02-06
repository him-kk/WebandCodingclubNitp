"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const redis_1 = require("../config/redis");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const cacheKey = `leaderboard:all:${page}:${limit}`;
        try {
            const cached = await redis_1.redis.getJSON(cacheKey);
            if (cached) {
                return res.status(200).json({
                    success: true,
                    cached: true,
                    ...cached,
                });
            }
        }
        catch (redisError) {
            console.warn('Redis cache read failed:', redisError);
        }
        const users = await User_1.default.find({ isActive: true })
            .select('name email points level badges streak avatar createdAt')
            .sort({ points: -1, createdAt: 1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.default.countDocuments({ isActive: true });
        const leaderboard = users.map((user, index) => ({
            rank: skip + index + 1,
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            points: user.points,
            level: user.level,
            badges: user.badges,
            streak: user.streak,
            createdAt: user.createdAt,
        }));
        const result = {
            count: leaderboard.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: leaderboard,
        };
        try {
            await redis_1.redis.setJSON(cacheKey, result, 300);
        }
        catch (redisError) {
            console.warn('Redis cache write failed:', redisError);
        }
        return res.status(200).json({
            success: true,
            cached: false,
            ...result,
        });
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/rank/:userId', auth_1.protect, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User_1.default.findById(userId).select('points name');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        const higherRankedCount = await User_1.default.countDocuments({
            isActive: true,
            $or: [
                { points: { $gt: user.points } },
                { points: user.points, _id: { $lt: userId } },
            ],
        });
        const rank = higherRankedCount + 1;
        const nearbyUsers = await User_1.default.find({ isActive: true })
            .select('name email points level badges streak avatar')
            .sort({ points: -1, _id: 1 })
            .limit(7)
            .skip(Math.max(0, rank - 4));
        const nearby = nearbyUsers.map((u, index) => ({
            rank: rank - 3 + index,
            ...u.toObject(),
            isCurrentUser: u._id.toString() === userId,
        }));
        return res.status(200).json({
            success: true,
            data: {
                userRank: rank,
                userPoints: user.points,
                nearby,
            },
        });
    }
    catch (error) {
        console.error('Get user rank error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/top/:count', async (req, res) => {
    try {
        const count = Math.min(parseInt(req.params.count) || 10, 50);
        const cacheKey = `leaderboard:top:${count}`;
        try {
            const cached = await redis_1.redis.getJSON(cacheKey);
            if (cached) {
                return res.status(200).json({
                    success: true,
                    cached: true,
                    data: cached,
                });
            }
        }
        catch (redisError) {
            console.warn('Redis cache read failed:', redisError);
        }
        const users = await User_1.default.find({ isActive: true })
            .select('name email points level badges streak avatar')
            .sort({ points: -1, createdAt: 1 })
            .limit(count);
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            ...user.toObject(),
        }));
        try {
            await redis_1.redis.setJSON(cacheKey, leaderboard, 300);
        }
        catch (redisError) {
            console.warn('Redis cache write failed:', redisError);
        }
        return res.status(200).json({
            success: true,
            cached: false,
            data: leaderboard,
        });
    }
    catch (error) {
        console.error('Get top users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/update-points', auth_1.protect, async (req, res) => {
    try {
        const { userId, points, action = 'add' } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        if (action === 'add') {
            user.addPoints(points);
        }
        else if (action === 'set') {
            user.points = points;
            user.updateLevel();
        }
        else if (action === 'subtract') {
            user.points = Math.max(0, user.points - points);
            user.updateLevel();
        }
        await user.save();
        try {
            await redis_1.redis.del('leaderboard:*');
        }
        catch (redisError) {
            console.warn('Redis cache clear failed:', redisError);
        }
        return res.status(200).json({
            success: true,
            message: 'Points updated successfully',
            data: {
                userId: user._id,
                name: user.name,
                points: user.points,
                level: user.level,
            },
        });
    }
    catch (error) {
        console.error('Update points error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=leaderboard.js.map