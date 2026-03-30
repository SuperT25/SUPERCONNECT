import { Router, Response } from 'express';
import User from '../models/User';
import Provider from '../models/Provider';
import Booking from '../models/Booking';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

const adminOnly = (req: AuthRequest, res: Response, next: Function) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
};

// Stats overview
router.get('/stats', protect, adminOnly, async (_req, res: Response) => {
  try {
    const [totalUsers, totalProviders, totalBookings, bookings] = await Promise.all([
      User.countDocuments(),
      Provider.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ status: 'completed' }),
    ]);
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    res.json({ totalUsers, totalProviders, totalBookings, totalRevenue });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', protect, adminOnly, async (_req, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all providers
router.get('/providers', protect, adminOnly, async (_req, res: Response) => {
  try {
    const providers = await Provider.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(providers);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings
router.get('/bookings', protect, adminOnly, async (_req, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', protect, adminOnly, async (req, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete provider
router.delete('/providers/:id', protect, adminOnly, async (req, res: Response) => {
  try {
    await Provider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Provider removed' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.patch('/users/:id/role', protect, adminOnly, async (req, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all messages for a booking (admin)
router.get('/chats/:bookingId', protect, adminOnly, async (req, res: Response) => {
  try {
    const Message = (await import('../models/Message')).default;
    const messages = await Message.find({ booking: req.params.bookingId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
