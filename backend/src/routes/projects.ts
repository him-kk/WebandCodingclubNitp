
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project';
import { protect, restrictTo } from '../middleware/auth';
import { redis } from '../config/redis';
import { Types } from 'mongoose';

const router = express.Router();

// Helper function to invalidate all project caches
async function invalidateProjectCache(): Promise<void> {
  try {
    await redis.delPattern('projects:*');
  } catch (error) {
    console.warn('Failed to invalidate project cache:', error);
  }
}

// Get all projects
router.get('/', async (_req: Request, res: Response) => {
  try {
    const page = parseInt(_req.query.page as string) || 1;
    const limit = parseInt(_req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = _req.query.category as string;
    const difficulty = _req.query.difficulty as string;

    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const cacheKey = `projects:${JSON.stringify(filter)}:${page}:${limit}`;

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

    const projects = await Project.find(filter)
      .populate('lead', 'name avatar email')
      .populate('contributors', 'name avatar')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(filter);

    const result = {
      count: projects.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: projects,
    };

    try {
      await redis.setJSON(cacheKey, result, 900);
    } catch (redisError) {
      console.warn('Redis cache write failed:', redisError);
    }

    return res.status(200).json({
      success: true,
      cached: false,
      ...result,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('lead', 'name avatar email github')
      .populate('contributors', 'name avatar email github');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Create project (authenticated users)
router.post(
  '/',
  protect,
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('githubUrl')
      .isURL()
      .withMessage('Please provide a valid GitHub URL'),
    body('category')
      .isIn(['web', 'mobile', 'ai', 'security', 'devops', 'other'])
      .withMessage('Invalid category'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Log the incoming data for debugging
      console.log('Creating project with data:', {
        ...req.body,
        lead: req.user.userId,
        createdBy: req.user.userId,
      });

      const project = new Project({
        ...req.body,
        lead: req.user.userId,
        createdBy: req.user.userId,
      });

      await project.save();

      await invalidateProjectCache();

      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (error: any) {
      console.error('Create project error:', error);
      console.error('Error details:', error.message);
      if (error.name === 'ValidationError') {
        console.error('Validation errors:', error.errors);
      }
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }
);

// Update project
router.put('/:id', protect, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
  body('category')
    .optional()
    .isIn(['web', 'mobile', 'ai', 'security', 'devops', 'other'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['planning', 'development', 'completed', 'archived'])
    .withMessage('Invalid status'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (project.lead.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'lead' && key !== 'contributors' && key !== 'createdBy') {
        (project as any)[key] = req.body[key];
      }
    });

    await project.save();

    await invalidateProjectCache();

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Add contributor to project
router.post('/:id/contributors', protect, async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (project.lead.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const contributorId = Types.ObjectId.createFromHexString(userId);

    if (!project.contributors.some((id) => id.equals(contributorId))) {
      project.contributors.push(contributorId);
      await project.save();

      const User = (await import('../models/User')).default;
      const contributor = await User.findById(contributorId);
      if (contributor) {
        contributor.addPoints(25);
        await contributor.save();
      }
    }

    await invalidateProjectCache();

    return res.status(200).json({
      success: true,
      message: 'Contributor added successfully',
      data: project,
    });
  } catch (error) {
    console.error('Add contributor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Delete project (admin or project lead)
router.delete('/:id', protect, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Only admin or project lead can delete
    if (project.lead.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    await invalidateProjectCache();

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Admin route: Clear project cache manually
router.post('/admin/clear-cache', protect, restrictTo('admin'), async (_req: Request, res: Response) => {
  try {
    await invalidateProjectCache();
    return res.status(200).json({
      success: true,
      message: 'Project cache cleared successfully',
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
    });
  }
});

export default router;