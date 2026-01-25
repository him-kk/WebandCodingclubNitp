
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { protect, restrictTo } from '../middleware/auth';
import { redis } from '../config/redis';

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, restrictTo('admin','President','Coordinator'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-__v')
      .sort({ points: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isActive: true });

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', protect, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const user = await User.findById(req.user.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('github').optional().isURL().withMessage('Please provide a valid GitHub URL'),
  body('linkedin').optional().isURL().withMessage('Please provide a valid LinkedIn URL'),
  body('twitter').optional().isURL().withMessage('Please provide a valid Twitter URL'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { name, bio, github, linkedin, twitter, skills } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (github) user.github = github;
    if (linkedin) user.linkedin = linkedin;
    if (twitter) user.twitter = twitter;
    if (skills) user.skills = skills;

    await user.save();

    try {
      await redis.setJSON(`user:${user._id}`, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
      }, 3600);
    } catch (redisError) {
      console.warn('Redis cache failed:', redisError);
    }

    return res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add points to user
router.post('/points', protect, restrictTo('admin', 'Coordinator','President'), async (req: Request, res: Response) => {
  try {
    const { userId, points, reason } = req.body;
    const user = await User.findById(userId);
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
  } catch (error) {
    console.error('Add points error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard/top', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cacheKey = `leaderboard:top:${limit}`;
    
    try {
      const cached = await redis.getJSON(cacheKey);
      if (cached) {
        return res.status(200).json({ success: true, cached: true, data: cached });
      }
    } catch (redisError) {
      console.warn('Redis cache read failed:', redisError);
    }

    const users = await User.find({ isActive: true })
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
      await redis.setJSON(cacheKey, leaderboard, 300);
    } catch (redisError) {
      console.warn('Redis cache write failed:', redisError);
    }

    return res.status(200).json({ success: true, cached: false, data: leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;