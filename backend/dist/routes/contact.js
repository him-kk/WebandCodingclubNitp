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
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { name, email, subject, message } = req.body;
        const ip = req.ip || 'unknown';
        const rateLimitKey = `contact:${ip}`;
        const requestCount = (await redis_1.redis.get(rateLimitKey)) || '0';
        if (parseInt(requestCount, 10) >= 5) {
            res.status(429).json({
                success: false,
                message: 'Too many messages. Please try again later.',
            });
            return;
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
        const newCount = parseInt(requestCount, 10) + 1;
        await redis_1.redis.set(rateLimitKey, newCount.toString(), 3600);
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
        return;
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
        return;
    }
});
router.get('/', async (_req, res) => {
    try {
        res.status(200).json({ success: true, data: [] });
        return;
    }
    catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
        return;
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
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { email, name } = req.body;
        const existing = await redis_1.redis.get(`newsletter:${email}`);
        if (existing) {
            res.status(409).json({
                success: false,
                message: 'Email already subscribed',
            });
            return;
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
        return;
    }
    catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
        return;
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map