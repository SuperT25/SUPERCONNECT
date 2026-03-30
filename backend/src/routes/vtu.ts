import { Router, Response } from 'express';
import https from 'https';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

const vtpassRequest = (path: string, data?: object): Promise<any> => {
  const email = process.env.VTPASS_EMAIL || '';
  const password = process.env.VTPASS_PASSWORD || '';
  const auth = Buffer.from(`${email}:${password}`).toString('base64');
  const baseUrl = process.env.VTPASS_BASE_URL || 'https://sandbox.vtpass.com/api';
  const url = new URL(baseUrl + path);

  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: data ? 'POST' : 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(responseData)); }
        catch { reject(new Error('Invalid response')); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

const generateRequestId = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${Math.floor(Math.random()*10000)}`;
};

// Buy Airtime
router.post('/airtime', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { network, phone, amount } = req.body;
    const serviceIDs: Record<string, string> = { mtn: 'mtn', airtel: 'airtel', glo: 'glo', '9mobile': 'etisalat' };
    const result = await vtpassRequest('/pay', {
      request_id: generateRequestId(),
      serviceID: serviceIDs[network] || network,
      amount,
      phone,
    });
    res.json(result);
  } catch (err) {
    console.error('Airtime error:', err);
    res.status(500).json({ message: 'Failed to process airtime' });
  }
});

// Get data plans
router.get('/data-plans/:network', async (req, res: Response) => {
  try {
    const serviceIDs: Record<string, string> = { mtn: 'mtn-data', airtel: 'airtel-data', glo: 'glo-data', '9mobile': 'etisalat-data' };
    const serviceID = serviceIDs[req.params.network] || `${req.params.network}-data`;
    const result = await vtpassRequest(`/service-variations?serviceID=${serviceID}`);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Failed to fetch data plans' });
  }
});

// Buy Data
router.post('/data', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { network, phone, variationCode, amount } = req.body;
    const serviceIDs: Record<string, string> = { mtn: 'mtn-data', airtel: 'airtel-data', glo: 'glo-data', '9mobile': 'etisalat-data' };
    const result = await vtpassRequest('/pay', {
      request_id: generateRequestId(),
      serviceID: serviceIDs[network] || `${network}-data`,
      billersCode: phone,
      variation_code: variationCode,
      amount,
      phone,
    });
    res.json(result);
  } catch (err) {
    console.error('Data error:', err);
    res.status(500).json({ message: 'Failed to process data purchase' });
  }
});

// Get cable TV plans
router.get('/cable-plans/:provider', async (req, res: Response) => {
  try {
    const result = await vtpassRequest(`/service-variations?serviceID=${req.params.provider}`);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Failed to fetch cable plans' });
  }
});

// Verify smart card
router.post('/verify-smartcard', protect, async (req, res: Response) => {
  try {
    const { serviceID, billersCode } = req.body;
    const result = await vtpassRequest('/merchant-verify', { serviceID, billersCode });
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Failed to verify smart card' });
  }
});

// Pay Cable TV
router.post('/cable', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { provider, smartCard, variationCode, amount, phone } = req.body;
    const result = await vtpassRequest('/pay', {
      request_id: generateRequestId(),
      serviceID: provider,
      billersCode: smartCard,
      variation_code: variationCode,
      amount,
      phone,
      subscription_type: 'change',
    });
    res.json(result);
  } catch (err) {
    console.error('Cable error:', err);
    res.status(500).json({ message: 'Failed to process cable subscription' });
  }
});

export default router;
