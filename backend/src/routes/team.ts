import express, { Request, Response } from 'express';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();


router.get('/', async (_req: Request, res: Response) => {
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

    const teamMembers = await User.find({
      role: { $in: roleHierarchy },
      isActive: true,
    }).select('name email role avatar bio skills github linkedin twitter contributions projects');

    const sortedMembers = teamMembers.sort(
      (a, b) => roleHierarchy.indexOf(a.role) - roleHierarchy.indexOf(b.role)
    );

    return res.status(200).json({
      success: true,
      count: sortedMembers.length,
      data: sortedMembers,
    });
  } catch (error) {
    console.error('Get team error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Get team member by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member || !['lead', 'admin', 'President', 'Vice-President', 'Secretary' , 'Joint Secretary', 'Coordinator'].includes(member.role)) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    console.error('Get team member error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update team member (admin only)
router.put('/:id', protect, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const { role, bio, skills } = req.body;

    if (role && ['member', 'lead', 'admin'].includes(role)) member.role = role;
    if (bio !== undefined) member.bio = bio;
    if (skills) member.skills = skills;

    await member.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Team member updated successfully', 
      data: member 
    });
  } catch (error) {
    console.error('Update team member error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;