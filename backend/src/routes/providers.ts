import { Router, Response } from 'express';
import Provider from '../models/Provider';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all providers (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, state, city } = req.query;
    const filter: Record<string, string> = {};
    if (category) filter.category = category as string;
    if (state) filter.state = state as string;
    if (city) filter.city = city as string;

    const providers = await Provider.find(filter).populate('user', 'name phone email');
    res.json(providers);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single provider
router.get('/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('user', 'name phone email');
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json(provider);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create provider profile
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await Provider.findOne({ user: req.userId });
    if (existing) return res.status(400).json({ message: 'Provider profile already exists' });

    // Pull state/city from user if not provided
    const User = (await import('../models/User')).default;
    const user = await User.findById(req.userId);
    const state = req.body.state || user?.state || 'Lagos';
    const city = req.body.city || user?.city || 'Lagos';

    const provider = await Provider.create({ ...req.body, state, city, user: req.userId });
    res.status(201).json(provider);
  } catch (err) {
    console.error('Provider create error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update provider profile
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const provider = await Provider.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!provider) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json(provider);
  } catch (err) {
    console.error('Provider update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
