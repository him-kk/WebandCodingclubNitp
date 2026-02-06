"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("../middleware/auth");
const redis_1 = require("../config/redis");
const router = express_1.default.Router();
const knowledgeBase = {
    events: {
        upcoming: [
            { title: 'Code Wars', date: 'Feb 15, 2026', time: '7:00 PM', location: 'Tech Hall A' },
            { title: 'AI Workshop', date: 'Mar 1, 2026', time: '2:00 PM', location: 'Innovation Lab' },
            { title: 'Hackathon 2026', date: 'Apr 10, 2026', time: '10:00 AM', location: 'Main Auditorium' },
        ],
    },
    roadmaps: {
        'full-stack': [
            'HTML & CSS Basics (2 weeks)',
            'JavaScript Fundamentals (3 weeks)',
            'React & Modern Frontend (4 weeks)',
            'Backend with Node.js (3 weeks)',
            'Database & DevOps (3 weeks)',
        ],
        'ai-ml': [
            'Python & Math (3 weeks)',
            'Machine Learning Basics (4 weeks)',
            'Deep Learning with PyTorch (5 weeks)',
            'Computer Vision (4 weeks)',
        ],
    },
    projects: [
        'Neural Vision AI - Computer vision system',
        'CodeCollab IDE - Real-time code editor',
        'CyberSec Suite - Security toolkit',
        'Personal Finance Tracker',
        'AI-powered Code Reviewer',
    ],
    membership: {
        benefits: [
            'Access to exclusive workshops and events',
            'Collaborate on real-world projects',
            'Network with like-minded developers',
            'Get mentorship from industry experts',
            'Build your portfolio',
        ],
        howToJoin: [
            'Fill out the contact form on our website',
            'Join our Discord community',
            'Attend an orientation session',
            'Start contributing to projects!',
        ],
    },
    points: {
        howToEarn: [
            'Contributing code (50-500 pts)',
            'Attending events (100-300 pts)',
            'Helping others (25-100 pts)',
            'Winning hackathons (1000+ pts)',
            'Mentoring new members (200 pts)',
        ],
    },
};
const understandIntent = (message) => {
    const m = message.toLowerCase();
    if (m.includes('event') || m.includes('workshop') || m.includes('hackathon'))
        return { intent: 'events', confidence: 0.9 };
    if (m.includes('learn') || m.includes('roadmap') || m.includes('tutorial'))
        return { intent: 'learning', confidence: 0.9 };
    if (m.includes('project') || m.includes('idea'))
        return { intent: 'projects', confidence: 0.9 };
    if (m.includes('join') || m.includes('member') || m.includes('sign up'))
        return { intent: 'membership', confidence: 0.9 };
    if (m.includes('point') || m.includes('leaderboard') || m.includes('rank'))
        return { intent: 'points', confidence: 0.9 };
    if (m.includes('hello') || m.includes('hi') || m.includes('hey'))
        return { intent: 'greeting', confidence: 0.9 };
    if (m.includes('help'))
        return { intent: 'help', confidence: 0.9 };
    if (m.includes('created you') || m.includes('creator') || m.includes('made you') || m.includes('who built you') || m.includes('developer'))
        return { intent: 'creator', confidence: 0.9 };
    return { intent: 'general', confidence: 0.5 };
};
const generateResponse = (intent) => {
    switch (intent) {
        case 'greeting':
            return `Hello! 👋 I'm WebBot, the AI assistant for Web and Coding Club.`;
        case 'events':
            return knowledgeBase.events.upcoming
                .map(e => `• ${e.title} - ${e.date} (${e.location})`)
                .join('\n');
        case 'learning':
            return `🚀 Full Stack:\n${knowledgeBase.roadmaps['full-stack'].join('\n')}`;
        case 'projects':
            return knowledgeBase.projects.join('\n');
        case 'membership':
            return knowledgeBase.membership.benefits.join('\n');
        case 'points':
            return knowledgeBase.points.howToEarn.join('\n');
        case 'help':
            return 'Ask me about events, projects, learning paths or membership!';
        case 'creator':
            return 'I was created by Himanshu Tiwari 🚀';
        default:
            return 'How can I help you today?';
    }
};
const getHistoryKey = (userId) => `chat:${userId}:history`;
const getRateKey = (userId) => `ai_rate_limit:${userId}`;
router.post('/message', (0, express_validator_1.body)('message').trim().isLength({ min: 1, max: 1000 }), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { message } = req.body;
        const userId = req.user?.userId || 'anonymous';
        const history = (await redis_1.redis.getJSON(getHistoryKey(userId))) || [];
        history.push({ role: 'user', message, timestamp: new Date() });
        const { intent } = understandIntent(message);
        const reply = generateResponse(intent);
        history.push({ role: 'bot', message: reply, timestamp: new Date() });
        await redis_1.redis.setJSON(getHistoryKey(userId), history, 86400);
        res.json({ success: true, data: { message: reply, intent } });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
        return;
    }
});
router.get('/history', auth_1.protect, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const history = (await redis_1.redis.getJSON(getHistoryKey(req.user.userId))) || [];
        res.json({ success: true, data: history });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
        return;
    }
});
router.delete('/history', auth_1.protect, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        await redis_1.redis.del(getHistoryKey(req.user.userId));
        res.json({ success: true, message: 'Chat history cleared' });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
        return;
    }
});
router.post('/ai', auth_1.protect, (0, express_validator_1.body)('message').trim().isLength({ min: 1, max: 1000 }), async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (!process.env.OPENAI_API_KEY) {
            res.status(501).json({ success: false, message: 'AI not configured' });
            return;
        }
        const userId = req.user.userId;
        const rateKey = getRateKey(userId);
        const requests = Number(await redis_1.redis.get(rateKey)) || 0;
        if (requests >= 50) {
            res.status(429).json({ success: false, message: 'Rate limit exceeded' });
            return;
        }
        const completion = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: req.body.message }],
        }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
        await redis_1.redis.set(rateKey, String(requests + 1), 3600);
        res.json({ success: true, data: completion.data.choices[0].message.content });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'AI error' });
        return;
    }
});
exports.default = router;
//# sourceMappingURL=chatbot.js.map