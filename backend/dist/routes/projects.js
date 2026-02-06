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
const Project_1 = __importDefault(require("../models/Project"));
const auth_1 = require("../middleware/auth");
const redis_1 = require("../config/redis");
const mongoose_1 = require("mongoose");
const router = express_1.default.Router();
async function invalidateProjectCache() {
    try {
        await redis_1.redis.delPattern('projects:*');
    }
    catch (error) {
        console.warn('Failed to invalidate project cache:', error);
    }
}
router.get('/', async (_req, res) => {
    try {
        const page = parseInt(_req.query.page) || 1;
        const limit = parseInt(_req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const category = _req.query.category;
        const difficulty = _req.query.difficulty;
        const filter = {};
        if (category)
            filter.category = category;
        if (difficulty)
            filter.difficulty = difficulty;
        const cacheKey = `projects:${JSON.stringify(filter)}:${page}:${limit}`;
        try {
            const cached = await redis_1.redis.getJSON(cacheKey);
            if (cached) {
                return res.status(200).json({
                    success: true,
                    cached: true,
                    ...cached,
                });
            }
        }
        catch (redisError) {
            console.warn('Redis cache read failed:', redisError);
        }
        const projects = await Project_1.default.find(filter)
            .populate('lead', 'name avatar email')
            .populate('contributors', 'name avatar')
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Project_1.default.countDocuments(filter);
        const result = {
            count: projects.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: projects,
        };
        try {
            await redis_1.redis.setJSON(cacheKey, result, 900);
        }
        catch (redisError) {
            console.warn('Redis cache write failed:', redisError);
        }
        return res.status(200).json({
            success: true,
            cached: false,
            ...result,
        });
    }
    catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id)
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
    }
    catch (error) {
        console.error('Get project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/', auth_1.protect, [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    (0, express_validator_1.body)('githubUrl')
        .isURL()
        .withMessage('Please provide a valid GitHub URL'),
    (0, express_validator_1.body)('category')
        .isIn(['web', 'mobile', 'ai', 'security', 'devops', 'other'])
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
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.log('Creating project with data:', {
            ...req.body,
            lead: req.user.userId,
            createdBy: req.user.userId,
        });
        const project = new Project_1.default({
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
    }
    catch (error) {
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
});
router.put('/:id', auth_1.protect, [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    (0, express_validator_1.body)('githubUrl')
        .optional()
        .isURL()
        .withMessage('Please provide a valid GitHub URL'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['web', 'mobile', 'ai', 'security', 'devops', 'other'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['planning', 'development', 'completed', 'archived'])
        .withMessage('Invalid status'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        const project = await Project_1.default.findById(req.params.id);
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
        Object.keys(req.body).forEach(key => {
            if (key !== 'lead' && key !== 'contributors' && key !== 'createdBy') {
                project[key] = req.body[key];
            }
        });
        await project.save();
        await invalidateProjectCache();
        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project,
        });
    }
    catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/:id/contributors', auth_1.protect, async (req, res) => {
    try {
        const { userId } = req.body;
        const project = await Project_1.default.findById(req.params.id);
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
        const contributorId = mongoose_1.Types.ObjectId.createFromHexString(userId);
        if (!project.contributors.some((id) => id.equals(contributorId))) {
            project.contributors.push(contributorId);
            await project.save();
            const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
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
    }
    catch (error) {
        console.error('Add contributor error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }
        if (project.lead.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this project',
            });
        }
        await Project_1.default.findByIdAndDelete(req.params.id);
        await invalidateProjectCache();
        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/admin/clear-cache', auth_1.protect, (0, auth_1.restrictTo)('admin'), async (_req, res) => {
    try {
        await invalidateProjectCache();
        return res.status(200).json({
            success: true,
            message: 'Project cache cleared successfully',
        });
    }
    catch (error) {
        console.error('Clear cache error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear cache',
        });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map