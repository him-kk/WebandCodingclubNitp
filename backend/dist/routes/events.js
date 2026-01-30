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
const express_validator_1 = require("express-validator");
const Event_1 = __importDefault(require("../models/Event"));
const auth_1 = require("../middleware/auth");
const redis_1 = require("../config/redis");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const status = req.query.status;
        const filter = {};
        if (category)
            filter.category = category;
        if (status)
            filter.status = status;
        const cacheKey = `events:${JSON.stringify(filter)}:${page}:${limit}`;
        const cached = await redis_1.redis.getJSON(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                cached: true,
                ...cached,
            });
        }
        const events = await Event_1.default.find(filter)
            .populate('createdBy', 'name email')
            .populate('attendees', 'name avatar')
            .select('-__v')
            .sort({ date: 1 })
            .skip(skip)
            .limit(limit);
        const total = await Event_1.default.countDocuments(filter);
        const result = {
            count: events.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: events,
        };
        await redis_1.redis.setJSON(cacheKey, result, 600);
        res.status(200).json({
            success: true,
            cached: false,
            ...result,
        });
    }
    catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const event = await Event_1.default.findById(req.params.id)
            .populate('createdBy', 'name email avatar')
            .populate('attendees', 'name avatar email');
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }
        res.status(200).json({
            success: true,
            data: event,
        });
    }
    catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/', auth_1.protect, (0, auth_1.restrictTo)('admin', 'lead'), [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    (0, express_validator_1.body)('date')
        .isISO8601()
        .withMessage('Please provide a valid date'),
    (0, express_validator_1.body)('time')
        .notEmpty()
        .withMessage('Time is required'),
    (0, express_validator_1.body)('location')
        .notEmpty()
        .withMessage('Location is required'),
    (0, express_validator_1.body)('category')
        .isIn(['workshop', 'hackathon', 'competition', 'meetup', 'webinar'])
        .withMessage('Invalid category'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const event = new Event_1.default({
            ...req.body,
            createdBy: req.user.userId,
        });
        await event.save();
        await redis_1.redis.del('events:*');
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event,
        });
    }
    catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/:id/register', auth_1.protect, async (req, res) => {
    try {
        const event = await Event_1.default.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }
        if (event.attendees.length >= event.maxAttendees) {
            return res.status(400).json({
                success: false,
                message: 'Event is full',
            });
        }
        if (event.attendees.includes(req.user.userId)) {
            return res.status(400).json({
                success: false,
                message: 'Already registered for this event',
            });
        }
        event.attendees.push(req.user.userId);
        await event.save();
        const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
        const user = await User.findById(req.user.userId);
        if (user) {
            user.addPoints(event.points);
            await user.save();
        }
        await redis_1.redis.del('events:*');
        await redis_1.redis.del(`leaderboard:*`);
        res.status(200).json({
            success: true,
            message: 'Successfully registered for event',
            data: {
                eventId: event._id,
                pointsEarned: event.points,
                totalPoints: user?.points,
            },
        });
    }
    catch (error) {
        console.error('Register for event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/upcoming/next', async (req, res) => {
    try {
        const events = await Event_1.default.find({
            date: { $gte: new Date() },
            status: 'upcoming',
        })
            .populate('createdBy', 'name avatar')
            .select('-__v')
            .sort({ date: 1 })
            .limit(3);
        res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    }
    catch (error) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map