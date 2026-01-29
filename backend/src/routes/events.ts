// import express, { Request, Response } from 'express';
// import { body, validationResult } from 'express-validator';
// import { Types } from 'mongoose';
// import Event from '../models/Event';
// import { protect, restrictTo } from '../middleware/auth';
// import { redis } from '../config/redis';

// const router = express.Router();

// // Helper function to invalidate all event caches
// async function invalidateEventCache(): Promise<void> {
//   try {
//     // Delete all event-related cache keys using pattern matching
//     await redis.delPattern('events:*');
//   } catch (error) {
//     console.warn('Failed to invalidate event cache:', error);
//   }
// }

// // Get all events
// router.get('/', async (_req: Request, res: Response) => {
//   try {
//     const page = parseInt(_req.query.page as string) || 1;
//     const limit = parseInt(_req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;
//     const category = _req.query.category as string;
//     const status = _req.query.status as string;

//     const filter: any = {};
//     if (category) filter.category = category;
//     if (status) filter.status = status;

//     const cacheKey = `events:${JSON.stringify(filter)}:${page}:${limit}`;

//     try {
//       const cached = await redis.getJSON(cacheKey);
//       if (cached) {
//         return res.status(200).json({
//           success: true,
//           cached: true,
//           ...cached,
//         });
//       }
//     } catch (redisError) {
//       console.warn('Redis cache read failed:', redisError);
//     }

//     const events = await Event.find(filter)
//       .populate('createdBy', 'name email')
//       .populate('attendees', 'name avatar')
//       .select('-__v')
//       .sort({ date: 1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Event.countDocuments(filter);

//     const result = {
//       count: events.length,
//       total,
//       page,
//       pages: Math.ceil(total / limit),
//       data: events,
//     };

//     try {
//       await redis.setJSON(cacheKey, result, 600); // Cache for 10 minutes
//     } catch (redisError) {
//       console.warn('Redis cache write failed:', redisError);
//     }

//     return res.status(200).json({
//       success: true,
//       cached: false,
//       ...result,
//     });
//   } catch (error) {
//     console.error('Get events error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// });

// // Get single event
// router.get('/:id', async (req: Request, res: Response) => {
//   try {
//     const event = await Event.findById(req.params.id)
//       .populate('createdBy', 'name email avatar')
//       .populate('attendees', 'name avatar email');

//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: event,
//     });
//   } catch (error) {
//     console.error('Get event error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// });

// // Create event (admin/lead only)
// router.post('/', protect, restrictTo('admin', 'lead','Coordinator','President'), [
//   body('title')
//     .trim()
//     .isLength({ min: 3, max: 100 })
//     .withMessage('Title must be between 3 and 100 characters'),
//   body('description')
//     .trim()
//     .isLength({ min: 10, max: 1000 })
//     .withMessage('Description must be between 10 and 1000 characters'),
//   body('date')
//     .isISO8601()
//     .withMessage('Please provide a valid date'),
//   body('time')
//     .notEmpty()
//     .withMessage('Time is required'),
//   body('location')
//     .notEmpty()
//     .withMessage('Location is required'),
//   body('category')
//     .isIn(['workshop', 'hackathon', 'competition', 'meetup', 'webinar'])
//     .withMessage('Invalid category'),
// ], async (req: Request, res: Response) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         errors: errors.array(),
//       });
//     }

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Unauthorized',
//       });
//     }

//     const event = new Event({
//       ...req.body,
//       createdBy: req.user.userId,
//     });

//     await event.save();
    
//     // Invalidate cache
//     await invalidateEventCache();

//     return res.status(201).json({
//       success: true,
//       message: 'Event created successfully',
//       data: event,
//     });
//   } catch (error) {
//     console.error('Create event error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// });

// // Update event (admin/lead only)
// router.put('/:id', protect, restrictTo('admin', 'lead','Coordinator','President'), [
//   body('title')
//     .optional()
//     .trim()
//     .isLength({ min: 3, max: 100 })
//     .withMessage('Title must be between 3 and 100 characters'),
//   body('description')
//     .optional()
//     .trim()
//     .isLength({ min: 10, max: 1000 })
//     .withMessage('Description must be between 10 and 1000 characters'),
//   body('date')
//     .optional()
//     .isISO8601()
//     .withMessage('Please provide a valid date'),
//   body('category')
//     .optional()
//     .isIn(['workshop', 'hackathon', 'competition', 'meetup', 'webinar'])
//     .withMessage('Invalid category'),
//   body('status')
//     .optional()
//     .isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
//     .withMessage('Invalid status'),
// ], async (req: Request, res: Response) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         errors: errors.array(),
//       });
//     }

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Unauthorized',
//       });
//     }

//     const event = await Event.findById(req.params.id);
    
//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found',
//       });
//     }

//     // Update fields
//     Object.keys(req.body).forEach(key => {
//       if (key !== 'createdBy' && key !== 'attendees') {
//         (event as any)[key] = req.body[key];
//       }
//     });

//     await event.save();

//     // Invalidate cache
//     await invalidateEventCache();

//     return res.status(200).json({
//       success: true,
//       message: 'Event updated successfully',
//       data: event,
//     });
//   } catch (error) {
//     console.error('Update event error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// });

// // Delete event (admin only)
// router.delete('/:id', protect, restrictTo('admin','President','Coordinator'), async (req: Request, res: Response) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Unauthorized',
//       });
//     }

//     const event = await Event.findById(req.params.id);
    
//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found',
//       });
//     }

//     await Event.findByIdAndDelete(req.params.id);

//     // Invalidate cache
//     await invalidateEventCache();

//     return res.status(200).json({
//       success: true,
//       message: 'Event deleted successfully',
//     });
//   } catch (error) {
//     console.error('Delete event error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// });

// // Register for event
// router.post('/:id/register', protect, async (req: Request, res: Response) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found',
//       });
//     }

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Unauthorized',
//       });
//     }

//     if (event.attendees.length >= event.maxAttendees) {
//       return res.status(400).json({
//         success: false,
//         message: 'Event is full',
//       });
//     }

//     const userId = Types.ObjectId.createFromHexString(req.user.userId);
//     if (event.attendees.some(id => id.equals(userId))) {
//       return res.status(400).json({
//         success: false,
//         message: 'Already registered for this event',
//       });
//     }

//     event.attendees.push(userId);
//     await event.save();

//     const User = (await import('../models/User')).default;
//     const user = await User.findById(userId);
//     if (user) {
//       user.addPoints(event.points);
//       await user.save();
//     }

//     // Invalidate cache
//     await invalidateEventCache();

//     return res.status(200).json({
//       success: true,
//       message: 'Successfully registered for event',
//       data: {
//         eventId: event._id,
//         pointsEarned: event.points,
//         totalPoints: user?.points,
//       },
//     });
//   } catch (error) {
//     console.error('Register for event error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// });

// // Unregister from event
// router.post('/:id/unregister', protect, async (req: Request, res: Response) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found',
//       });
//     }

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Unauthorized',
//       });
//     }

//     const userId = Types.ObjectId.createFromHexString(req.user.userId);
//     const attendeeIndex = event.attendees.findIndex(id => id.equals(userId));
    
//     if (attendeeIndex === -1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Not registered for this event',
//       });
//     }

//     event.attendees.splice(attendeeIndex, 1);
//     await event.save();

//     const User = (await import('../models/User')).default;
//     const user = await User.findById(userId);
//     if (user && user.points >= event.points) {
//       user.points -= event.points;
//       await user.save();
//     }

//     // Invalidate cache
//     await invalidateEventCache();

//     return res.status(200).json({
//       success: true,
//       message: 'Successfully unregistered from event',
//     });
//   } catch (error) {
//     console.error('Unregister from event error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// });

// // Get upcoming events
// router.get('/upcoming/next', async (_req: Request, res: Response) => {
//   try {
//     const events = await Event.find({
//       date: { $gte: new Date() },
//       status: 'upcoming',
//     })
//       .populate('createdBy', 'name avatar')
//       .select('-__v')
//       .sort({ date: 1 })
//       .limit(3);

//     return res.status(200).json({
//       success: true,
//       count: events.length,
//       data: events,
//     });
//   } catch (error) {
//     console.error('Get upcoming events error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// });

// // Admin route: Clear event cache manually
// router.post('/admin/clear-cache', protect, restrictTo('admin','Coordinator','President'), async (_req: Request, res: Response) => {
//   try {
//     await invalidateEventCache();
//     return res.status(200).json({
//       success: true,
//       message: 'Event cache cleared successfully',
//     });
//   } catch (error) {
//     console.error('Clear cache error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to clear cache',
//     });
//   }
// });

// // Admin route: View cache stats
// router.get('/admin/cache-stats', protect, restrictTo('admin','Coordinator','President'), async (_req: Request, res: Response) => {
//   try {
//     const keys = await redis.keys('events:*');
//     const stats = {
//       totalCacheKeys: keys.length,
//       cacheKeys: keys.slice(0, 10), // Show first 10
//     };
    
//     return res.status(200).json({
//       success: true,
//       data: stats,
//     });
//   } catch (error) {
//     console.error('Cache stats error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to get cache stats',
//     });
//   }
// });

// export default router;
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Types } from 'mongoose';
import Event from '../models/Event';
import { protect, restrictTo } from '../middleware/auth';
import { redis } from '../config/redis';

const router = express.Router();

// Helper function to invalidate all event caches
async function invalidateEventCache(): Promise<void> {
  try {
    await redis.delPattern('events:*');
  } catch (error) {
    console.warn('Failed to invalidate event cache:', error);
  }
}

// Get all events
router.get('/', async (_req: Request, res: Response) => {
  try {
    const page = parseInt(_req.query.page as string) || 1;
    const limit = parseInt(_req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = _req.query.category as string;
    const status = _req.query.status as string;

    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const cacheKey = `events:${JSON.stringify(filter)}:${page}:${limit}`;

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

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name avatar')
      .select('-__v')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    const result = {
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: events,
    };

    try {
      await redis.setJSON(cacheKey, result, 600);
    } catch (redisError) {
      console.warn('Redis cache write failed:', redisError);
    }

    return res.status(200).json({
      success: true,
      cached: false,
      ...result,
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get single event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('attendees', 'name avatar email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Create event (admin/lead only)
router.post('/', protect, restrictTo('admin', 'lead','Coordinator','President'), [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .notEmpty()
    .withMessage('Time is required'),
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  body('category')
    .isIn(['workshop', 'hackathon', 'competition', 'meetup', 'webinar'])
    .withMessage('Invalid category'),
  body('registrationLink')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL for registration link'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const event = new Event({
      ...req.body,
      createdBy: req.user.userId,
    });

    await event.save();
    
    await invalidateEventCache();

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Update event (admin/lead only)
router.put('/:id', protect, restrictTo('admin', 'lead','Coordinator','President'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('category')
    .optional()
    .isIn(['workshop', 'hackathon', 'competition', 'meetup', 'webinar'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('registrationLink')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL for registration link'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy' && key !== 'attendees') {
        (event as any)[key] = req.body[key];
      }
    });

    await event.save();

    await invalidateEventCache();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Delete event (admin only)
router.delete('/:id', protect, restrictTo('admin','President','Coordinator'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    await invalidateEventCache();

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Register for event
router.post('/:id/register', protect, async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full',
      });
    }

    const userId = Types.ObjectId.createFromHexString(req.user.userId);
    if (event.attendees.some(id => id.equals(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event',
      });
    }

    event.attendees.push(userId);
    await event.save();

    const User = (await import('../models/User')).default;
    const user = await User.findById(userId);
    if (user) {
      user.addPoints(event.points);
      await user.save();
    }

    await invalidateEventCache();

    return res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        eventId: event._id,
        pointsEarned: event.points,
        totalPoints: user?.points,
      },
    });
  } catch (error) {
    console.error('Register for event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Unregister from event
router.post('/:id/unregister', protect, async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const userId = Types.ObjectId.createFromHexString(req.user.userId);
    const attendeeIndex = event.attendees.findIndex(id => id.equals(userId));
    
    if (attendeeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event',
      });
    }

    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    const User = (await import('../models/User')).default;
    const user = await User.findById(userId);
    if (user && user.points >= event.points) {
      user.points -= event.points;
      await user.save();
    }

    await invalidateEventCache();

    return res.status(200).json({
      success: true,
      message: 'Successfully unregistered from event',
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get upcoming events
router.get('/upcoming/next', async (_req: Request, res: Response) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
      status: 'upcoming',
    })
      .populate('createdBy', 'name avatar')
      .select('-__v')
      .sort({ date: 1 })
      .limit(3);

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Admin route: Clear event cache manually
router.post('/admin/clear-cache', protect, restrictTo('admin','Coordinator','President'), async (_req: Request, res: Response) => {
  try {
    await invalidateEventCache();
    return res.status(200).json({
      success: true,
      message: 'Event cache cleared successfully',
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
    });
  }
});

// Admin route: View cache stats
router.get('/admin/cache-stats', protect, restrictTo('admin','Coordinator','President'), async (_req: Request, res: Response) => {
  try {
    const keys = await redis.keys('events:*');
    const stats = {
      totalCacheKeys: keys.length,
      cacheKeys: keys.slice(0, 10),
    };
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
    });
  }
});

export default router;