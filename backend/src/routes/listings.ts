import { Router, Response } from 'express';
import Listing from '../models/Listing';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { category, type, state, condition } = req.query;
    const filter: Record<string, any> = { isAvailable: true };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (state) filter.state = state;
    if (condition) filter.condition = condition;
    const listings = await Listing.find(filter).populate('seller', 'name phone').sort({ createdAt: -1 });
    res.json(listings);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('seller', 'name phone');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create listing
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Listing.create({ ...req.body, seller: req.userId });
    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update listing
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Listing.findOneAndUpdate({ _id: req.params.id, seller: req.userId }, req.body, { new: true });
    if (!listing) return res.status(404).json({ message: 'Not found' });
    res.json(listing);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete listing
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    await Listing.findOneAndDelete({ _id: req.params.id, seller: req.userId });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// My listings
router.get('/my/listings', protect, async (req: AuthRequest, res: Response) => {
  try {
    const listings = await Listing.find({ seller: req.userId }).sort({ createdAt: -1 });
    res.json(listings);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
