"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Event_1 = __importDefault(require("../models/Event"));
const Project_1 = __importDefault(require("../models/Project"));
const User_1 = __importDefault(require("../models/User"));
const redis_1 = require("../config/redis");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('admin', 'Coordinator', 'President'));
router.get('/events', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const events = await Event_1.default.find()
            .populate('createdBy', 'name email')
            .populate('attendees', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Event_1.default.countDocuments();
        return res.json({
            success: true,
            count: events.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: events,
        });
    }
    catch (error) {
        console.error('Get events error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/events', [
    (0, express_validator_1.body)('title').trim().isLength({ min: 3, max: 100 }),
    (0, express_validator_1.body)('description').trim().isLength({ min: 10, max: 1000 }),
    (0, express_validator_1.body)('date').isISO8601(),
    (0, express_validator_1.body)('time').notEmpty(),
    (0, express_validator_1.body)('location').notEmpty(),
    (0, express_validator_1.body)('category').isIn(['workshop', 'hackathon', 'competition', 'meetup', 'webinar']),
    (0, express_validator_1.body)('maxAttendees').isInt({ min: 1 }),
    (0, express_validator_1.body)('points').isInt({ min: 0 }),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const event = new Event_1.default({
            ...req.body,
            createdBy: req.user?.userId,
        });
        await event.save();
        await redis_1.redis.del('events:*');
        return res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event,
        });
    }
    catch (error) {
        console.error('Create event error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.put('/events/:id', async (req, res) => {
    try {
        const event = await Event_1.default.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        await redis_1.redis.del('events:*');
        return res.json({
            success: true,
            message: 'Event updated successfully',
            data: event,
        });
    }
    catch (error) {
        console.error('Update event error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.delete('/events/:id', async (req, res) => {
    try {
        const event = await Event_1.default.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        await redis_1.redis.del('events:*');
        return res.json({
            success: true,
            message: 'Event deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete event error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/projects', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const projects = await Project_1.default.find()
            .populate('lead', 'name email')
            .populate('contributors', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Project_1.default.countDocuments();
        return res.json({
            success: true,
            count: projects.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: projects,
        });
    }
    catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.put('/projects/:id', async (req, res) => {
    try {
        const project = await Project_1.default.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true, runValidators: true });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        await redis_1.redis.del('projects:*');
        return res.json({
            success: true,
            message: 'Project updated successfully',
            data: project,
        });
    }
    catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.delete('/projects/:id', async (req, res) => {
    try {
        const project = await Project_1.default.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        await redis_1.redis.del('projects:*');
        return res.json({
            success: true,
            message: 'Project deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const users = await User_1.default.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.default.countDocuments();
        return res.json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: users,
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['member', 'lead', 'admin', 'Coordinator', 'President'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.json({
            success: true,
            message: 'User role updated successfully',
            data: user,
        });
    }
    catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.put('/users/:id/points', async (req, res) => {
    try {
        const { points, action } = req.body;
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (action === 'add') {
            user.addPoints(points);
        }
        else if (action === 'set') {
            user.points = points;
            user.updateLevel();
        }
        else if (action === 'subtract') {
            user.points = Math.max(0, user.points - points);
            user.updateLevel();
        }
        await user.save();
        await redis_1.redis.del('leaderboard:*');
        return res.json({
            success: true,
            message: 'User points updated successfully',
            data: user,
        });
    }
    catch (error) {
        console.error('Update user points error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalEvents, totalProjects, activeUsers, upcomingEvents,] = await Promise.all([
            User_1.default.countDocuments(),
            Event_1.default.countDocuments(),
            Project_1.default.countDocuments(),
            User_1.default.countDocuments({ isActive: true }),
            Event_1.default.countDocuments({ date: { $gte: new Date() }, status: 'upcoming' }),
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
    }
    catch (error) {
        console.error('Get stats error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map