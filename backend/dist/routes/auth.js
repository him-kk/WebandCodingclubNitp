"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const redis_1 = require("../config/redis");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const { name, email, password } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
        }
        const user = new User_1.default({
            name,
            email,
            password,
        });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        await redis_1.redis.setJSON(`session:${user._id}`, {
            userId: user._id,
            email: user.email,
            role: user.role,
        }, 604800);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points,
                level: user.level,
                badges: user.badges,
                streak: user.streak,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .exists()
        .withMessage('Password is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        user.lastLogin = new Date();
        await user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        await redis_1.redis.setJSON(`session:${user._id}`, {
            userId: user._id,
            email: user.email,
            role: user.role,
        }, 604800);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES || '7') * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points,
                level: user.level,
                badges: user.badges,
                streak: user.streak,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
});
router.post('/logout', auth_1.protect, async (req, res) => {
    try {
        const userId = req.user.userId;
        await redis_1.redis.del(`session:${userId}`);
        res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout',
        });
    }
});
router.get('/me', auth_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.userId).select('-__v');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points,
                level: user.level,
                badges: user.badges,
                streak: user.streak,
                avatar: user.avatar,
                github: user.github,
                linkedin: user.linkedin,
                twitter: user.twitter,
                bio: user.bio,
                skills: user.skills,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const session = await redis_1.redis.getJSON(`session:${decoded.userId}`);
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Session expired',
            });
        }
        const newToken = jsonwebtoken_1.default.sign({ userId: decoded.userId, email: decoded.email, role: decoded.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.status(200).json({
            success: true,
            token: newToken,
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map