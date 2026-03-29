import { Router, Response } from 'express';
import Message from '../models/Message';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Get messages for a booking
router.get('/:bookingId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await Message.find({ booking: req.params.bookingId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
