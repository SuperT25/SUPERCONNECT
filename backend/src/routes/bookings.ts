import { Router, Response } from 'express';
import Booking from '../models/Booking';
import Provider from '../models/Provider';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Create booking
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.create({ ...req.body, customer: req.userId });
    res.status(201).json(booking);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my bookings (customer)
router.get('/my', protect, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ customer: req.userId })
      .populate('provider')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for provider
router.get('/provider', protect, async (req: AuthRequest, res: Response) => {
  try {
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

    const bookings = await Booking.find({ provider: provider._id })
      .populate('customer', 'name phone email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.patch('/:id/status', protect, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = req.body.status;
    await booking.save();
    res.json(booking);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a review
router.patch('/:id/review', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, customer: req.userId, status: 'completed' },
      { rating, review },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found or not completed' });

    // Update provider average rating
    const allBookings = await Booking.find({ provider: booking.provider, rating: { $exists: true } });
    const avg = allBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / allBookings.length;
    await Provider.findByIdAndUpdate(booking.provider, { rating: avg, totalReviews: allBookings.length });

    res.json(booking);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
