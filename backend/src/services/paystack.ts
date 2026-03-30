import https from 'https';

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

const paystackRequest = (method: string, path: string, data?: object): Promise<any> => {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(responseData)); }
        catch { reject(new Error('Invalid JSON response')); }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

// Get list of banks
export const getBanks = () => paystackRequest('GET', '/bank?currency=NGN&country=nigeria');

// Resolve account number
export const resolveAccount = (accountNumber: string, bankCode: string) =>
  paystackRequest('GET', `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);

// Create subaccount for provider
export const createSubaccount = (data: {
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: number;
}) => paystackRequest('POST', '/subaccount', data);
