import { Router, Response } from 'express';
import { getBanks, resolveAccount, createSubaccount } from '../services/paystack';
import Provider from '../models/Provider';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Nigerian banks list
router.get('/banks', async (_req, res: Response) => {
  try {
    const result = await getBanks();
    res.json(result.data || []);
  } catch {
    res.status(500).json({ message: 'Failed to fetch banks' });
  }
});

// Resolve account number
router.post('/resolve-account', protect, async (req, res: Response) => {
  try {
    const { accountNumber, bankCode } = req.body;
    const result = await resolveAccount(accountNumber, bankCode);
    if (!result.status) return res.status(400).json({ message: result.message || 'Could not resolve account' });
    res.json(result.data);
  } catch {
    res.status(500).json({ message: 'Failed to resolve account' });
  }
});

// Setup provider bank account & create Paystack subaccount
router.post('/setup-bank', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { bankCode, bankName, accountNumber, accountName } = req.body;

    // Find provider by user ID
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) return res.status(404).json({ message: 'Provider profile not found. Please set up your profile first.' });

    let subaccountCode = '';
    try {
      const result = await createSubaccount({
        business_name: accountName,
        settlement_bank: bankCode,
        account_number: accountNumber,
        percentage_charge: 10,
      });
      if (result.status) subaccountCode = result.data.subaccount_code;
    } catch (err) {
      console.log('Subaccount creation failed, saving bank details only:', err);
    }

    await Provider.findByIdAndUpdate(provider._id, {
      bankName,
      accountNumber,
      accountName,
      paystackSubaccountCode: subaccountCode,
    });

    res.json({ subaccountCode, message: 'Bank account saved successfully' });
  } catch (err) {
    console.error('Bank setup error:', err);
    res.status(500).json({ message: 'Failed to save bank account' });
  }
});

export default router;
