import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { protect, restrictTo } from '../middleware/auth';
import Event from '../models/Event';
import Project from '../models/Project';
import User from '../models/User';
import { redis } from '../config/redis';

const router = express.Router();

// Protect all admin routes - only admin and lead roles
router.use(protect);
router.use(restrictTo('admin', 'Coordinator','President'));

/* ==================== EVENTS MANAGEMENT ==================== */

// Get all events (with pagination)
router.get('/events', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments();

    return res.json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create event
router.post('/events', [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('date').isISO8601(),
  body('time').notEmpty(),
  body('location').notEmpty(),
  body('category').isIn(['workshop', 'hackathon', 'competition', 'meetup', 'webinar']),
  body('maxAttendees').isInt({ min: 1 }),
  body('points').isInt({ min: 0 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const event = new Event({
      ...req.body,
      createdBy: req.user?.userId,
    });

    await event.save();
    await redis.del('events:*');

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update event
router.put('/events/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await redis.del('events:*');

    return res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete event
router.delete('/events/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await redis.del('events:*');

    return res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ==================== PROJECTS MANAGEMENT ==================== */

// Get all projects
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const projects = await Project.find()
      .populate('lead', 'name email')
      .populate('contributors', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments();

    return res.json({
      success: true,
      count: projects.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update project
router.put('/projects/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await redis.del('projects:*');

    return res.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete project
router.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await redis.del('projects:*');

    return res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ==================== USERS MANAGEMENT ==================== */

// Get all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    return res.json({
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

// Update user role
router.put('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!['member', 'lead', 'admin','Coordinator','President'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user points
router.put('/users/:id/points', async (req: Request, res: Response) => {
  try {
    const { points, action } = req.body; // action: 'add' | 'subtract' | 'set'

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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
    await redis.del('leaderboard:*');

    return res.json({
      success: true,
      message: 'User points updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user points error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ==================== DASHBOARD STATS ==================== */

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalProjects,
      activeUsers,
      upcomingEvents,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Project.countDocuments(),
      User.countDocuments({ isActive: true }),
      Event.countDocuments({ date: { $gte: new Date() }, status: 'upcoming' }),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalEvents,
        totalProjects,
        activeUsers,
        upcomingEvents,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;