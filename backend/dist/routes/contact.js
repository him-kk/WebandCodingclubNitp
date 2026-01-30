"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const redis_1 = require("../config/redis");
const router = express_1.default.Router();
router.post('/', [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters'),
    (0, express_validator_1.body)('subject')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Subject cannot exceed 100 characters'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const { name, email, subject, message } = req.body;
        const ip = req.ip || 'unknown';
        const rateLimitKey = `contact:${ip}`;
        const requestCount = await redis_1.redis.get(rateLimitKey) || '0';
        if (parseInt(requestCount) >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Too many messages. Please try again later.',
            });
        }
        const messageId = Date.now().toString();
        const messageData = {
            id: messageId,
            name,
            email,
            subject: subject || 'General Inquiry',
            message,
            ip,
            timestamp: new Date(),
            status: 'new',
        };
        await redis_1.redis.setJSON(`contact:${messageId}`, messageData, 86400 * 30);
        await redis_1.redis.incr(rateLimitKey);
        await redis_1.redis.set(rateLimitKey, parseInt(requestCount) + 1, 3600);
        res.status(201).json({
            success: true,
            message: 'Message sent successfully! We will get back to you soon.',
            data: {
                messageId,
                name,
                email,
                timestamp: messageData.timestamp,
            },
        });
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/', async (req, res) => {
    try {
        const messageKeys = await redis_1.redis.get('contact:*');
        res.status(200).json({
            success: true,
            data: [],
        });
    }
    catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/newsletter', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Name cannot exceed 50 characters'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const { email, name } = req.body;
        const existing = await redis_1.redis.get(`newsletter:${email}`);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Email already subscribed',
            });
        }
        const subscription = {
            email,
            name: name || '',
            subscribedAt: new Date(),
            isActive: true,
        };
        await redis_1.redis.setJSON(`newsletter:${email}`, subscription, 0);
        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter!',
        });
    }
    catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map