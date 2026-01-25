import express, { Request, Response } from 'express';
import User from '../models/User';
import { redis } from '../config/redis';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get full leaderboard
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const cacheKey = `leaderboard:all:${page}:${limit}`;
    
    try {
      const cached = await redis.getJSON(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          ...cached,
        });
      }
    } catch (redisError) {
      console.warn('Redis cache read failed:', redisError);
    }

    const users = await User.find({ isActive: true })
      .select('name email points level badges streak avatar createdAt')
      .sort({ points: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isActive: true });

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
      await redis.setJSON(cacheKey, result, 300);
    } catch (redisError) {
      console.warn('Redis cache write failed:', redisError);
    }

    return res.status(200).json({
      success: true,
      cached: false,
      ...result,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get user rank
router.get('/rank/:userId', protect, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('points name');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const higherRankedCount = await User.countDocuments({
      isActive: true,
      $or: [
        { points: { $gt: user.points } },
        { points: user.points, _id: { $lt: userId } },
      ],
    });

    const rank = higherRankedCount + 1;

    const nearbyUsers = await User.find({ isActive: true })
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
  } catch (error) {
    console.error('Get user rank error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get top users
router.get('/top/:count', async (req: Request, res: Response) => {
  try {
    const count = Math.min(parseInt(req.params.count) || 10, 50);

    const cacheKey = `leaderboard:top:${count}`;
    
    try {
      const cached = await redis.getJSON(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          data: cached,
        });
      }
    } catch (redisError) {
      console.warn('Redis cache read failed:', redisError);
    }

    const users = await User.find({ isActive: true })
      .select('name email points level badges streak avatar')
      .sort({ points: -1, createdAt: 1 })
      .limit(count);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
    }));

    try {
      await redis.setJSON(cacheKey, leaderboard, 300);
    } catch (redisError) {
      console.warn('Redis cache write failed:', redisError);
    }

    return res.status(200).json({
      success: true,
      cached: false,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Get top users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Update user points (admin only)
router.post('/update-points', protect, async (req: Request, res: Response) => {
  try {
    const { userId, points, action = 'add' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (action === 'add') {
      user.addPoints(points);
    } else if (action === 'set') {
      user.points = points;
      user.updateLevel();
    } else if (action === 'subtract') {
      user.points = Math.max(0, user.points - points);
      user.updateLevel();
    }

    await user.save();

    try {
      await redis.del('leaderboard:*');
    } catch (redisError) {
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
  } catch (error) {
    console.error('Update points error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;