"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const redis_1 = require("../config/redis");
const router = express_1.default.Router();
const roadmaps = [
    {
        id: 'full-stack',
        title: 'Full Stack Developer',
        description: 'Complete path to becoming a full-stack developer',
        duration: '15 weeks',
        difficulty: 'Intermediate',
        steps: [
            { id: 1, title: 'HTML & CSS Basics', description: 'Learn the building blocks of web', duration: '2 weeks', completed: false },
            { id: 2, title: 'JavaScript Fundamentals', description: 'Master JS core concepts', duration: '3 weeks', completed: false },
            { id: 3, title: 'React & Modern Frontend', description: 'Build modern UIs', duration: '4 weeks', completed: false },
            { id: 4, title: 'Backend with Node.js', description: 'Server-side development', duration: '3 weeks', completed: false },
            { id: 5, title: 'Database & DevOps', description: 'Data and deployment', duration: '3 weeks', completed: false },
        ],
    },
    {
        id: 'ai-ml',
        title: 'AI/ML Engineer',
        description: 'Path to becoming an AI/ML specialist',
        duration: '16 weeks',
        difficulty: 'Advanced',
        steps: [
            { id: 1, title: 'Python & Math', description: 'Core programming and statistics', duration: '3 weeks', completed: false },
            { id: 2, title: 'Machine Learning Basics', description: 'Supervised learning', duration: '4 weeks', completed: false },
            { id: 3, title: 'Deep Learning', description: 'Neural networks with PyTorch', duration: '5 weeks', completed: false },
            { id: 4, title: 'Computer Vision', description: 'Image processing and CNNs', duration: '4 weeks', completed: false },
        ],
    },
    {
        id: 'mobile-dev',
        title: 'Mobile Developer',
        description: 'Learn to build mobile applications',
        duration: '12 weeks',
        difficulty: 'Intermediate',
        steps: [
            { id: 1, title: 'React Native Basics', description: 'Mobile app fundamentals', duration: '3 weeks', completed: false },
            { id: 2, title: 'State Management', description: 'Redux and Context API', duration: '2 weeks', completed: false },
            { id: 3, title: 'Native Features', description: 'Camera, GPS, Push Notifications', duration: '3 weeks', completed: false },
            { id: 4, title: 'Backend Integration', description: 'APIs and databases', duration: '2 weeks', completed: false },
            { id: 5, title: 'Publishing Apps', description: 'App Store and Play Store', duration: '2 weeks', completed: false },
        ],
    },
];
const tutorials = [
    { id: 1, title: 'Build a REST API with Node.js', author: 'Alex Chen', duration: '45 min', category: 'Backend', difficulty: 'Intermediate', url: '#' },
    { id: 2, title: 'React Hooks Deep Dive', author: 'Sarah Williams', duration: '1h 20m', category: 'Frontend', difficulty: 'Advanced', url: '#' },
    { id: 3, title: 'Python for Beginners', author: 'Kevin Park', duration: '2h', category: 'Programming', difficulty: 'Beginner', url: '#' },
    { id: 4, title: 'Docker Containerization', author: 'Marcus Johnson', duration: '55 min', category: 'DevOps', difficulty: 'Intermediate', url: '#' },
    { id: 5, title: 'Git & GitHub Masterclass', author: 'Emma Rodriguez', duration: '1h 30m', category: 'Version Control', difficulty: 'Beginner', url: '#' },
    { id: 6, title: 'Machine Learning Fundamentals', author: 'Priya Sharma', duration: '3h', category: 'AI/ML', difficulty: 'Intermediate', url: '#' },
];
const blogPosts = [
    {
        id: 1,
        title: 'The Future of Web Development in 2026',
        excerpt: 'Exploring the latest trends including AI-powered development, WebAssembly, and edge computing...',
        author: 'Alex Chen',
        date: '2026-01-10',
        readTime: '8 min read',
        category: 'Trends',
        image: '/blog-1.jpg',
    },
    {
        id: 2,
        title: 'Building Scalable Microservices Architecture',
        excerpt: 'A comprehensive guide to designing and implementing microservices that can handle millions of requests...',
        author: 'Sarah Williams',
        date: '2026-01-08',
        readTime: '12 min read',
        category: 'Backend',
        image: '/blog-2.jpg',
    },
    {
        id: 3,
        title: 'AI Ethics in Software Development',
        excerpt: 'Understanding the ethical implications of AI and how to build responsible machine learning systems...',
        author: 'Priya Sharma',
        date: '2026-01-05',
        readTime: '6 min read',
        category: 'AI/ML',
        image: '/blog-3.jpg',
    },
];
router.get('/roadmaps', async (req, res) => {
    try {
        const cacheKey = 'roadmaps:all';
        const cached = await redis_1.redis.getJSON(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                cached: true,
                data: cached,
            });
        }
        await redis_1.redis.setJSON(cacheKey, roadmaps, 3600);
        res.status(200).json({
            success: true,
            cached: false,
            data: roadmaps,
        });
    }
    catch (error) {
        console.error('Get roadmaps error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/roadmaps/:id', async (req, res) => {
    try {
        const roadmap = roadmaps.find(r => r.id === req.params.id);
        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found',
            });
        }
        res.status(200).json({
            success: true,
            data: roadmap,
        });
    }
    catch (error) {
        console.error('Get roadmap error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/tutorials', async (req, res) => {
    try {
        const category = req.query.category;
        const difficulty = req.query.difficulty;
        let filteredTutorials = tutorials;
        if (category) {
            filteredTutorials = filteredTutorials.filter(t => t.category === category);
        }
        if (difficulty) {
            filteredTutorials = filteredTutorials.filter(t => t.difficulty === difficulty);
        }
        res.status(200).json({
            success: true,
            count: filteredTutorials.length,
            data: filteredTutorials,
        });
    }
    catch (error) {
        console.error('Get tutorials error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/blog', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        let filteredPosts = blogPosts;
        if (category) {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
        res.status(200).json({
            success: true,
            count: paginatedPosts.length,
            total: filteredPosts.length,
            page,
            pages: Math.ceil(filteredPosts.length / limit),
            data: paginatedPosts,
        });
    }
    catch (error) {
        console.error('Get blog posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/roadmaps/:roadmapId/steps/:stepId/complete', auth_1.protect, async (req, res) => {
    try {
        const { roadmapId, stepId } = req.params;
        const userId = req.user.userId;
        const progressKey = `progress:${userId}:${roadmapId}`;
        const progress = await redis_1.redis.getJSON(progressKey) || { completedSteps: [] };
        if (!progress.completedSteps.includes(stepId)) {
            progress.completedSteps.push(stepId);
            await redis_1.redis.setJSON(progressKey, progress, 86400 * 30);
            const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
            const user = await User.findById(userId);
            if (user) {
                user.addPoints(50);
                await user.save();
            }
        }
        res.status(200).json({
            success: true,
            message: 'Step marked as complete',
            data: progress,
        });
    }
    catch (error) {
        console.error('Complete step error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/roadmaps/:roadmapId/progress', auth_1.protect, async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const userId = req.user.userId;
        const progressKey = `progress:${userId}:${roadmapId}`;
        const progress = await redis_1.redis.getJSON(progressKey) || { completedSteps: [] };
        const roadmap = roadmaps.find(r => r.id === roadmapId);
        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found',
            });
        }
        const totalSteps = roadmap.steps.length;
        const completedSteps = progress.completedSteps.length;
        const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
        res.status(200).json({
            success: true,
            data: {
                roadmap: roadmap.id,
                completedSteps: progress.completedSteps,
                totalSteps,
                completionPercentage,
            },
        });
    }
    catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=resources.js.map