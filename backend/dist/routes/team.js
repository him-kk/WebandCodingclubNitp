"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        const roleHierarchy = [
            'President',
            'Vice-President',
            'Secretary',
            'Joint Secretary',
            'Coordinator',
            'Lead',
            'Member',
            'Admin'
        ];
        const teamMembers = await User_1.default.find({
            role: { $in: roleHierarchy },
            isActive: true,
        }).select('name email role avatar bio skills github linkedin twitter contributions projects');
        const sortedMembers = teamMembers.sort((a, b) => roleHierarchy.indexOf(a.role) - roleHierarchy.indexOf(b.role));
        return res.status(200).json({
            success: true,
            count: sortedMembers.length,
            data: sortedMembers,
        });
    }
    catch (error) {
        console.error('Get team error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const member = await User_1.default.findById(req.params.id);
        if (!member || !['lead', 'admin', 'President', 'Vice-President', 'Secretary', 'Joint Secretary', 'Coordinator'].includes(member.role)) {
            return res.status(404).json({ success: false, message: 'Team member not found' });
        }
        return res.status(200).json({ success: true, data: member });
    }
    catch (error) {
        console.error('Get team member error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.put('/:id', auth_1.protect, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const member = await User_1.default.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        const { role, bio, skills } = req.body;
        if (role && ['member', 'lead', 'admin'].includes(role))
            member.role = role;
        if (bio !== undefined)
            member.bio = bio;
        if (skills)
            member.skills = skills;
        await member.save();
        return res.status(200).json({
            success: true,
            message: 'Team member updated successfully',
            data: member
        });
    }
    catch (error) {
        console.error('Update team member error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=team.js.map