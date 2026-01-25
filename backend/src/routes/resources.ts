import express, { Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { redis } from '../config/redis';

const router = express.Router();

/* ----------  static data  ---------- */
const roadmaps = [
  {
    id: 'full-stack',
    title: 'Full Stack Developer',
    description: 'Complete path to becoming a full-stack developer',
    duration: '15 weeks',
    difficulty: 'Intermediate',
    steps: [
      { id: '1', title: 'HTML & CSS Basics', description: 'Learn the building blocks of web', duration: '2 weeks', completed: false },
      { id: '2', title: 'JavaScript Fundamentals', description: 'Master JS core concepts', duration: '3 weeks', completed: false },
      { id: '3', title: 'React & Modern Frontend', description: 'Build modern UIs', duration: '4 weeks', completed: false },
      { id: '4', title: 'Backend with Node.js', description: 'Server-side development', duration: '3 weeks', completed: false },
      { id: '5', title: 'Database & DevOps', description: 'Data and deployment', duration: '3 weeks', completed: false },
    ],
  },
  {
    id: 'ai-ml',
    title: 'AI/ML Engineer',
    description: 'Path to becoming an AI/ML specialist',
    duration: '16 weeks',
    difficulty: 'Advanced',
    steps: [
      { id: '1', title: 'Python & Math', description: 'Core programming and statistics', duration: '3 weeks', completed: false },
      { id: '2', title: 'Machine Learning Basics', description: 'Supervised learning', duration: '4 weeks', completed: false },
      { id: '3', title: 'Deep Learning', description: 'Neural networks with PyTorch', duration: '5 weeks', completed: false },
      { id: '4', title: 'Computer Vision', description: 'Image processing and CNNs', duration: '4 weeks', completed: false },
    ],
  },
  {
    id: 'mobile-dev',
    title: 'Mobile Developer',
    description: 'Learn to build mobile applications',
    duration: '12 weeks',
    difficulty: 'Intermediate',
    steps: [
      { id: '1', title: 'React Native Basics', description: 'Mobile app fundamentals', duration: '3 weeks', completed: false },
      { id: '2', title: 'State Management', description: 'Redux and Context API', duration: '2 weeks', completed: false },
      { id: '3', title: 'Native Features', description: 'Camera, GPS, Push Notifications', duration: '3 weeks', completed: false },
      { id: '4', title: 'Backend Integration', description: 'APIs and databases', duration: '2 weeks', completed: false },
      { id: '5', title: 'Publishing Apps', description: 'App Store and Play Store', duration: '2 weeks', completed: false },
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

/* ----------  routes  ---------- */

// Get all roadmaps
router.get('/roadmaps', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'roadmaps:all';
    
    try {
      const cached = await redis.getJSON(cacheKey);
      if (cached) {
        return res.status(200).json({ success: true, cached: true, data: cached });
      }
    } catch (redisError) {
      console.warn('Redis cache read failed:', redisError);
    }

    try {
      await redis.setJSON(cacheKey, roadmaps, 3600);
    } catch (redisError) {
      console.warn('Redis cache write failed:', redisError);
    }

    return res.status(200).json({ success: true, cached: false, data: roadmaps });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single roadmap
router.get('/roadmaps/:id', async (req: Request, res: Response) => {
  try {
    const roadmap = roadmaps.find((r) => r.id === req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    return res.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    console.error('Get roadmap error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all tutorials
router.get('/tutorials', async (_req: Request, res: Response) => {
  try {
    const category = _req.query.category as string;
    const difficulty = _req.query.difficulty as string;
    let filtered = tutorials;
    if (category) filtered = filtered.filter((t) => t.category === category);
    if (difficulty) filtered = filtered.filter((t) => t.difficulty === difficulty);
    return res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('Get tutorials error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all blog posts
router.get('/blog', async (_req: Request, res: Response) => {
  try {
    const page = parseInt(_req.query.page as string) || 1;
    const limit = parseInt(_req.query.limit as string) || 10;
    const category = _req.query.category as string;
    let filtered = blogPosts;
    if (category) filtered = filtered.filter((p) => p.category === category);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    return res.status(200).json({
      success: true,
      count: paginated.length,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit),
      data: paginated,
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark roadmap step as complete
router.post('/roadmaps/:roadmapId/steps/:stepId/complete', protect, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { roadmapId, stepId } = req.params;
    const userId = req.user.userId;

    const progressKey = `progress:${userId}:${roadmapId}`;
    const progress = (await redis.getJSON(progressKey)) || { completedSteps: [] };

    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
      
      try {
        await redis.setJSON(progressKey, progress, 86400 * 30);
      } catch (redisError) {
        console.warn('Redis save failed:', redisError);
      }

      const User = (await import('../models/User')).default;
      const user = await User.findById(userId);
      if (user) {
        user.addPoints(50);
        await user.save();
      }
    }

    return res.status(200).json({ success: true, message: 'Step marked as complete', data: progress });
  } catch (error) {
    console.error('Complete step error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's roadmap progress
router.get('/roadmaps/:roadmapId/progress', protect, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { roadmapId } = req.params;
    const userId = req.user.userId;

    const progressKey = `progress:${userId}:${roadmapId}`;
    let progress;
    
    try {
      progress = (await redis.getJSON(progressKey)) || { completedSteps: [] };
    } catch (redisError) {
      console.warn('Redis read failed:', redisError);
      progress = { completedSteps: [] };
    }

    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const total = roadmap.steps.length;
    const completed = progress.completedSteps.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        roadmap: roadmap.id,
        completedSteps: progress.completedSteps,
        totalSteps: total,
        completionPercentage: percentage,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;