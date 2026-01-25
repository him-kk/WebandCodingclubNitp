
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { redis } from '../config/redis';

const router = express.Router();

// Contact form submission
router.post(
  '/',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters'),
    body('subject')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Subject cannot exceed 100 characters'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { name, email, subject, message } = req.body;

      // Rate limiting - max 5 messages per hour per IP
      const ip = req.ip || 'unknown';
      const rateLimitKey = `contact:${ip}`;
      const requestCount = (await redis.get(rateLimitKey)) || '0';

      if (parseInt(requestCount, 10) >= 5) {
        res.status(429).json({
          success: false,
          message: 'Too many messages. Please try again later.',
        });
        return;
      }

      // Store contact message
      const messageId = Date.now().toString();
      const messageData = {
        id: messageId,
        name,
        email,
        subject: subject || 'General Inquiry',
        message,
        ip,
        timestamp: new Date(),
        status: 'new',
      };

      await redis.setJSON(`contact:${messageId}`, messageData, 86400 * 30); // 30 days

      // Update rate limit
      const newCount = parseInt(requestCount, 10) + 1;
      await redis.set(rateLimitKey, newCount.toString(), 3600); // 1 hour

      res.status(201).json({
        success: true,
        message: 'Message sent successfully! We will get back to you soon.',
        data: {
          messageId,
          name,
          email,
          timestamp: messageData.timestamp,
        },
      });
      return;
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
      return;
    }
  }
);

// Get all contact messages (admin only)
router.get(
  '/',
  async (_req: Request, res: Response): Promise<void> => {
    try {
      /*
        NOTE:
        redis.get('contact:*') does NOT work as a wildcard.
        Use SCAN or maintain a list/set of IDs in production.
      */
      res.status(200).json({ success: true, data: [] });
      return;
    } catch (error) {
      console.error('Get contact messages error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
      return;
    }
  }
);

// Newsletter subscription
router.post(
  '/newsletter',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { email, name } = req.body;

      // Check if already subscribed
      const existing = await redis.get(`newsletter:${email}`);
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'Email already subscribed',
        });
        return;
      }

      // Store subscription
      const subscription = {
        email,
        name: name || '',
        subscribedAt: new Date(),
        isActive: true,
      };

      await redis.setJSON(`newsletter:${email}`, subscription, 0); // No expiration

      res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter!',
      });
      return;
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
      return;
    }
  }
);

export default router;
