"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const redis_1 = require("../config/redis");
const router = express_1.default.Router();
router.get('/', auth_1.protect, (0, auth_1.restrictTo)('admin', 'President', 'Coordinator'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = await User_1.default.find({ isActive: true })
            .select('-__v')
            .sort({ points: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.default.countDocuments({ isActive: true });
        return res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: users,
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/profile', auth_1.protect, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const user = await User_1.default.findById(req.user.userId).select('-__v');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.put('/profile', auth_1.protect, [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    (0, express_validator_1.body)('github').optional().isURL().withMessage('Please provide a valid GitHub URL'),
    (0, express_validator_1.body)('linkedin').optional().isURL().withMessage('Please provide a valid LinkedIn URL'),
    (0, express_validator_1.body)('twitter').optional().isURL().withMessage('Please provide a valid Twitter URL'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { name, bio, github, linkedin, twitter, skills } = req.body;
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (name)
            user.name = name;
        if (bio !== undefined)
            user.bio = bio;
        if (github)
            user.github = github;
        if (linkedin)
            user.linkedin = linkedin;
        if (twitter)
            user.twitter = twitter;
        if (skills)
            user.skills = skills;
        await user.save();
        try {
            await redis_1.redis.setJSON(`user:${user._id}`, {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points,
                level: user.level,
            }, 3600);
        }
        catch (redisError) {
            console.warn('Redis cache failed:', redisError);
        }
        return res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-__v');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/points', auth_1.protect, (0, auth_1.restrictTo)('admin', 'Coordinator', 'President'), async (req, res) => {
    try {
        const { userId, points, reason } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.addPoints(points);
        await user.save();
        return res.status(200).json({
            success: true,
            message: `Added ${points} points to ${user.name}`,
            data: { userId: user._id, name: user.name, points: user.points, level: user.level, reason },
        });
    }
    catch (error) {
        console.error('Add points error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/leaderboard/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const cacheKey = `leaderboard:top:${limit}`;
        try {
            const cached = await redis_1.redis.getJSON(cacheKey);
            if (cached) {
                return res.status(200).json({ success: true, cached: true, data: cached });
            }
        }
        catch (redisError) {
            console.warn('Redis cache read failed:', redisError);
        }
        const users = await User_1.default.find({ isActive: true })
            .select('name email points level badges streak avatar')
            .sort({ points: -1, createdAt: 1 })
            .limit(limit);
        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            id: user._id,
            name: user.name,
            email: user.email,
            points: user.points,
            level: user.level,
            badges: user.badges,
            streak: user.streak,
            avatar: user.avatar,
        }));
        try {
            await redis_1.redis.setJSON(cacheKey, leaderboard, 300);
        }
        catch (redisError) {
            console.warn('Redis cache write failed:', redisError);
        }
        return res.status(200).json({ success: true, cached: false, data: leaderboard });
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map