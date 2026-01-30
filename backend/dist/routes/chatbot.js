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
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('event') || lowerMessage.includes('workshop') || lowerMessage.includes('hackathon')) {
        return { intent: 'events', confidence: 0.9 };
    }
    if (lowerMessage.includes('learn') || lowerMessage.includes('roadmap') || lowerMessage.includes('tutorial')) {
        return { intent: 'learning', confidence: 0.9 };
    }
    if (lowerMessage.includes('project') || lowerMessage.includes('idea')) {
        return { intent: 'projects', confidence: 0.9 };
    }
    if (lowerMessage.includes('join') || lowerMessage.includes('member') || lowerMessage.includes('sign up')) {
        return { intent: 'membership', confidence: 0.9 };
    }
    if (lowerMessage.includes('point') || lowerMessage.includes('leaderboard') || lowerMessage.includes('rank')) {
        return { intent: 'points', confidence: 0.9 };
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return { intent: 'greeting', confidence: 0.9 };
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        return { intent: 'help', confidence: 0.9 };
    }
    return { intent: 'general', confidence: 0.5 };
};
const generateResponse = (intent, userMessage) => {
    switch (intent) {
        case 'greeting':
            return `Hello! 👋 I'm WebBot, the AI assistant for Web and Coding Club. I'm here to help you with:

• Info about upcoming events and workshops
• Learning path recommendations and roadmaps
• Project ideas and resources
• Club membership details and benefits
• Points and leaderboard information

What would you like to know about?`;
        case 'events':
            const eventsList = knowledgeBase.events.upcoming
                .map(event => `• ${event.title} - ${event.date} at ${event.time} (${event.location})`)
                .join('\n');
            return `Here are our upcoming events at Web and Coding Club:\n\n${eventsList}\n\nYou can register for any event on our Events page! Would you like more details about any specific event?`;
        case 'learning':
            return `We have structured learning roadmaps to help you become a better developer!\n\n🚀 **Full Stack Developer Roadmap:**\n${knowledgeBase.roadmaps['full-stack'].map(step => `• ${step}`).join('\n')}\n\n🤖 **AI/ML Engineer Roadmap:**\n${knowledgeBase.roadmaps['ai-ml'].map(step => `• ${step}`).join('\n')}\n\nWhich path interests you more? I can provide detailed resources for either track!`;
        case 'projects':
            return `Here are some exciting project ideas you can work on at our club:\n\n${knowledgeBase.projects.map(project => `• ${project}`).join('\n')}\n\nThese are just suggestions! You can also propose your own project idea. Would you like more details about any specific project?`;
        case 'membership':
            return `Joining Web and Coding Club is easy and free! Here's what you get:\n\n**Benefits:**\n${knowledgeBase.membership.benefits.map(benefit => `• ${benefit}`).join('\n')}\n\n**How to Join:**\n${knowledgeBase.membership.howToJoin.map(step => `• ${step}`).join('\n')}\n\nReady to start your coding journey with us?`;
        case 'points':
            return `Our leaderboard is gamified to make learning fun! Here's how to earn points:\n\n${knowledgeBase.points.howToEarn.map(method => `• ${method}`).join('\n')}\n\nCheck out the Live Leaderboard to see your current rank and compete with other members! 🏆`;
        case 'help':
            return `I can help you with many things! Here are some examples of what you can ask me:\n\n• "What events are coming up?"\n• "Show me the full-stack roadmap"\n• "Give me project ideas"\n• "How do I join the club?"\n• "How can I earn points?"\n• "What is this club about?"\n\nFeel free to ask me anything about Web and Coding Club!`;
        default:
            const generalResponses = [
                "That's a great question! I'd be happy to help you learn more about Web and Coding Club. You can ask me about upcoming events, learning resources, project ideas, or membership details. What interests you most?",
                "I'm here to help! I can provide information about our events, learning roadmaps, projects, and how to get involved with the club. What would you like to know?",
                "Thanks for your question! As your AI assistant, I can help you explore all that Web and Coding Club has to offer. Feel free to ask about events, tutorials, or joining our community!",
            ];
            return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
};
router.post('/message', auth_1.protect, [
    (0, express_validator_1.body)('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const { message } = req.body;
        const userId = req.user.userId;
        const conversationKey = `chat:${userId}:history`;
        const history = await redis_1.redis.getJSON(conversationKey) || [];
        history.push({
            role: 'user',
            message,
            timestamp: new Date(),
        });
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        const { intent } = understandIntent(message);
        const botResponse = generateResponse(intent, message);
        history.push({
            role: 'bot',
            message: botResponse,
            timestamp: new Date(),
        });
        await redis_1.redis.setJSON(conversationKey, history, 86400);
        res.status(200).json({
            success: true,
            data: {
                message: botResponse,
                intent,
                timestamp: new Date(),
            },
        });
    }
    catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/history', auth_1.protect, async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversationKey = `chat:${userId}:history`;
        const history = await redis_1.redis.getJSON(conversationKey) || [];
        res.status(200).json({
            success: true,
            data: history,
        });
    }
    catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.delete('/history', auth_1.protect, async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversationKey = `chat:${userId}:history`;
        await redis_1.redis.del(conversationKey);
        res.status(200).json({
            success: true,
            message: 'Chat history cleared',
        });
    }
    catch (error) {
        console.error('Clear chat history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/ai', auth_1.protect, [
    (0, express_validator_1.body)('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const { message } = req.body;
        if (!process.env.OPENAI_API_KEY) {
            return res.status(501).json({
                success: false,
                message: 'AI service not configured',
            });
        }
        const userId = req.user.userId;
        const rateLimitKey = `ai_rate_limit:${userId}`;
        const requestCount = await redis_1.redis.get(rateLimitKey) || '0';
        if (parseInt(requestCount) >= 50) {
            return res.status(429).json({
                success: false,
                message: 'AI request limit reached. Please try again later.',
            });
        }
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant for Web and Coding Club. You help members with coding questions, project ideas, learning resources, and club information. Be friendly, concise, and helpful.',
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
            max_tokens: 500,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        const aiResponse = response.data.choices[0].message.content;
        await redis_1.redis.incr(rateLimitKey);
        await redis_1.redis.set(rateLimitKey, parseInt(requestCount) + 1, 3600);
        res.status(200).json({
            success: true,
            data: {
                message: aiResponse,
                model: 'gpt-3.5-turbo',
                timestamp: new Date(),
            },
        });
    }
    catch (error) {
        console.error('AI chat error:', error);
        if (axios_1.default.isAxiosError(error) && error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                message: 'AI service is busy. Please try again later.',
            });
        }
        res.status(500).json({
            success: false,
            message: 'AI service temporarily unavailable',
        });
    }
});
exports.default = router;
//# sourceMappingURL=chatbot.js.map