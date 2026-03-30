import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Wifi, Tv, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { usePaystack } from '../hooks/usePaystack';
import toast from 'react-hot-toast';

type Tab = 'airtime' | 'data' | 'cable';

const NETWORKS = ['mtn', 'airtel', 'glo', '9mobile'];
const CABLE_PROVIDERS = [
  { id: 'dstv', name: 'DSTV' },
  { id: 'gotv', name: 'GOtv' },
  { id: 'startimes', name: 'Startimes' },
];

const networkColors: Record<string, string> = {
  mtn: '#f59e0b', airtel: '#dc2626', glo: '#16a34a', '9mobile': '#059669',
};

export default function VTU() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pay } = usePaystack();
  const [tab, setTab] = useState<Tab>('airtime');

  // Airtime
  const [airtimeForm, setAirtimeForm] = useState({ network: 'mtn', phone: '', amount: '' });

  // Data
  const [dataForm, setDataForm] = useState({ network: 'mtn', phone: '', variationCode: '', amount: '' });
  const [dataPlans, setDataPlans] = useState<any[]>([]);

  // Cable
  const [cableForm, setCableForm] = useState({ provider: 'dstv', smartCard: '', variationCode: '', amount: '', phone: '' });
  const [cablePlans, setCablePlans] = useState<any[]>([]);
  const [smartCardName, setSmartCardName] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  useEffect(() => {
    if (tab === 'data' && dataPlans.length === 0) loadDataPlans('mtn');
  }, [tab]);

  const loadDataPlans = async (network: string) => {
    try {
      const { data } = await api.get(`/vtu/data-plans/${network}`);
      setDataPlans(data?.content?.variations || []);
    } catch { setDataPlans([]); }
  };

  const loadCablePlans = async (provider: string) => {
    try {
      const { data } = await api.get(`/vtu/cable-plans/${provider}`);
      setCablePlans(data?.content?.variations || []);
    } catch { setCablePlans([]); }
  };

  const verifySmartCard = async () => {
    try {
      const { data } = await api.post('/vtu/verify-smartcard', { serviceID: cableForm.provider, billersCode: cableForm.smartCard });
      setSmartCardName(data?.content?.Customer_Name || '');
      if (data?.content?.Customer_Name) toast.success(`Card: ${data.content.Customer_Name}`);
      else toast.error('Smart card not found');
    } catch { toast.error('Could not verify smart card'); }
  };

  const handlePay = (amount: number, onSuccess: () => void) => {
    if (!user) return;
    pay({
      email: user.email,
      amount,
      name: user.name,
      onSuccess: () => onSuccess(),
      onClose: () => toast('Payment cancelled'),
    });
  };

  const buyAirtime = () => {
    const amount = Number(airtimeForm.amount);
    if (!amount || !airtimeForm.phone) { toast.error('Fill in all fields'); return; }
    handlePay(amount, async () => {
      try {
        const { data } = await api.post('/vtu/airtime', airtimeForm);
        if (data?.code === '000') toast.success(`₦${amount} airtime sent to ${airtimeForm.phone}`);
        else toast.error(data?.response_description || 'Transaction failed');
      } catch { toast.error('Failed to process airtime'); }
    });
  };

  const buyData = () => {
    const amount = Number(dataForm.amount);
    if (!dataForm.variationCode || !dataForm.phone) { toast.error('Select a plan and enter phone number'); return; }
    handlePay(amount, async () => {
      try {
        const { data } = await api.post('/vtu/data', dataForm);
        if (data?.code === '000') toast.success('Data purchased successfully!');
        else toast.error(data?.response_description || 'Transaction failed');
      } catch { toast.error('Failed to process data purchase'); }
    });
  };

  const buyCable = () => {
    const amount = Number(cableForm.amount);
    if (!cableForm.variationCode || !cableForm.smartCard) { toast.error('Fill in all fields'); return; }
    handlePay(amount, async () => {
      try {
        const { data } = await api.post('/vtu/cable', cableForm);
        if (data?.code === '000') toast.success('Cable subscription successful!');
        else toast.error(data?.response_description || 'Transaction failed');
      } catch { toast.error('Failed to process cable subscription'); }
    });
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
      <h2 style={{ color: '#1a3fa8', margin: '0 0 20px', fontSize: '1.3rem' }}>Bills & Top-up</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
        {[
          { id: 'airtime', label: 'Airtime', icon: <Phone size={15} /> },
          { id: 'data', label: 'Data', icon: <Wifi size={15} /> },
          { id: 'cable', label: 'Cable TV', icon: <Tv size={15} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{ flex: 1, padding: '9px 4px', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: tab === t.id ? '#1a3fa8' : 'transparent', color: tab === t.id ? '#fff' : '#6b7280', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Airtime */}
      {tab === 'airtime' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {NETWORKS.map(n => (
              <button key={n} onClick={() => setAirtimeForm(f => ({ ...f, network: n }))} style={{ padding: '10px 4px', border: `2px solid ${airtimeForm.network === n ? networkColors[n] : '#e5e7eb'}`, borderRadius: 8, background: airtimeForm.network === n ? networkColors[n] + '20' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', color: networkColors[n], textTransform: 'uppercase' }}>
                {n}
              </button>
            ))}
          </div>
          <input placeholder="Phone number (e.g. 08012345678)" value={airtimeForm.phone} onChange={e => setAirtimeForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[100, 200, 500, 1000].map(a => (
              <button key={a} onClick={() => setAirtimeForm(f => ({ ...f, amount: String(a) }))} style={{ padding: 10, border: `2px solid ${airtimeForm.amount === String(a) ? '#1a3fa8' : '#e5e7eb'}`, borderRadius: 8, background: airtimeForm.amount === String(a) ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#1a3fa8' }}>
                ₦{a}
              </button>
            ))}
          </div>
          <input type="number" placeholder="Or enter amount" value={airtimeForm.amount} onChange={e => setAirtimeForm(f => ({ ...f, amount: e.target.value }))} style={inputStyle} />
          <button onClick={buyAirtime} style={btnStyle}>
            Buy Airtime <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Data */}
      {tab === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {NETWORKS.map(n => (
              <button key={n} onClick={() => { setDataForm(f => ({ ...f, network: n, variationCode: '', amount: '' })); loadDataPlans(n); }} style={{ padding: '10px 4px', border: `2px solid ${dataForm.network === n ? networkColors[n] : '#e5e7eb'}`, borderRadius: 8, background: dataForm.network === n ? networkColors[n] + '20' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', color: networkColors[n], textTransform: 'uppercase' }}>
                {n}
              </button>
            ))}
          </div>
          <input placeholder="Phone number" value={dataForm.phone} onChange={e => setDataForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
          <select value={dataForm.variationCode} onChange={e => { const plan = dataPlans.find(p => p.variation_code === e.target.value); setDataForm(f => ({ ...f, variationCode: e.target.value, amount: plan?.variation_amount || '' })); }} style={inputStyle}>
            <option value="">Select data plan</option>
            {dataPlans.map(p => <option key={p.variation_code} value={p.variation_code}>{p.name} - ₦{p.variation_amount}</option>)}
          </select>
          {dataForm.amount && <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 14px', color: '#1a3fa8', fontWeight: 700 }}>Total: ₦{Number(dataForm.amount).toLocaleString()}</div>}
          <button onClick={buyData} style={btnStyle}>Buy Data <ChevronRight size={16} /></button>
        </div>
      )}

      {/* Cable TV */}
      {tab === 'cable' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {CABLE_PROVIDERS.map(p => (
              <button key={p.id} onClick={() => { setCableForm(f => ({ ...f, provider: p.id, variationCode: '', amount: '' })); setSmartCardName(''); loadCablePlans(p.id); }} style={{ padding: 10, border: `2px solid ${cableForm.provider === p.id ? '#1a3fa8' : '#e5e7eb'}`, borderRadius: 8, background: cableForm.provider === p.id ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#1a3fa8' }}>
                {p.name}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Smart card / IUC number" value={cableForm.smartCard} onChange={e => { setCableForm(f => ({ ...f, smartCard: e.target.value })); setSmartCardName(''); }} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={verifySmartCard} style={{ padding: '10px 14px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Verify</button>
          </div>
          {smartCardName && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', color: '#166534', fontWeight: 600, fontSize: '0.9rem' }}>✓ {smartCardName}</div>}
          <select value={cableForm.variationCode} onChange={e => { const plan = cablePlans.find(p => p.variation_code === e.target.value); setCableForm(f => ({ ...f, variationCode: e.target.value, amount: plan?.variation_amount || '' })); }} style={inputStyle}>
            <option value="">Select package</option>
            {cablePlans.map(p => <option key={p.variation_code} value={p.variation_code}>{p.name} - ₦{p.variation_amount}</option>)}
          </select>
          <input placeholder="Phone number" value={cableForm.phone} onChange={e => setCableForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
          {cableForm.amount && <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 14px', color: '#1a3fa8', fontWeight: 700 }}>Total: ₦{Number(cableForm.amount).toLocaleString()}</div>}
          <button onClick={buyCable} style={btnStyle}>Subscribe <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { padding: '14px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '1rem', marginTop: 4 };
