import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Wifi, Tv, Zap, GraduationCap, Clock, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { usePaystack } from '../hooks/usePaystack';
import toast from 'react-hot-toast';

type Tab = 'airtime' | 'data' | 'cable' | 'electricity' | 'education' | 'history';

type AirtimeForm = { network: string; phone: string; amount: string };
type DataForm = { network: string; phone: string; variationCode: string; amount: string };
type CableForm = { provider: string; smartCard: string; variationCode: string; amount: string; phone: string };
type ElecForm = { serviceID: string; meterNumber: string; variationType: string; amount: string; phone: string };
type EduForm = { serviceID: string; variationCode: string; amount: string; phone: string; billersCode: string };
type VtuPlan = { variation_code: string; name: string; variation_amount: string };
type VtuHistory = { type: string; details: string; phone: string; createdAt: string; amount: number; status: string };

const NETWORKS = ['mtn', 'airtel', 'glo', '9mobile'];
const CABLE_PROVIDERS = [
  { id: 'dstv', name: 'DSTV' },
  { id: 'gotv', name: 'GOtv' },
  { id: 'startimes', name: 'Startimes' },
];
const ELECTRICITY_PROVIDERS = [
  { id: 'ikeja-electric', name: 'Ikeja Electric' },
  { id: 'eko-electric', name: 'Eko Electric' },
  { id: 'kano-electric', name: 'Kano Electric' },
  { id: 'phed', name: 'PHED' },
  { id: 'aedc', name: 'AEDC' },
  { id: 'enugu-electric', name: 'Enugu Electric' },
  { id: 'ibadan-electric', name: 'Ibadan Electric' },
];
const EDU_SERVICES = [
  { id: 'waec', name: 'WAEC' },
  { id: 'waec-registration', name: 'WAEC Registration' },
  { id: 'jamb', name: 'JAMB' },
];
const networkColors: Record<string, string> = {
  mtn: '#f59e0b', airtel: '#dc2626', glo: '#16a34a', '9mobile': '#059669',
};

export default function VTU() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pay } = usePaystack();
  const [tab, setTab] = useState<Tab>('airtime');

  const [airtimeForm, setAirtimeForm] = useState<AirtimeForm>({ network: 'mtn', phone: '', amount: '' });
  const [dataForm, setDataForm] = useState<DataForm>({ network: 'mtn', phone: '', variationCode: '', amount: '' });
  const [dataPlans, setDataPlans] = useState<VtuPlan[]>([]);
  const [cableForm, setCableForm] = useState<CableForm>({ provider: 'dstv', smartCard: '', variationCode: '', amount: '', phone: '' });
  const [cablePlans, setCablePlans] = useState<VtuPlan[]>([]);
  const [smartCardName, setSmartCardName] = useState('');
  const [elecForm, setElecForm] = useState<ElecForm>({ serviceID: 'ikeja-electric', meterNumber: '', variationType: 'prepaid', amount: '', phone: '' });
  const [meterName, setMeterName] = useState('');
  const [eduForm, setEduForm] = useState<EduForm>({ serviceID: 'waec', variationCode: '', amount: '', phone: '', billersCode: '' });
  const [eduPlans, setEduPlans] = useState<VtuPlan[]>([]);
  const [history, setHistory] = useState<VtuHistory[]>([]);

  useEffect(() => { if (!user) navigate('/login'); }, [user]);

  useEffect(() => {
    if (tab === 'data' && dataPlans.length === 0) loadDataPlans('mtn');
    if (tab === 'cable' && cablePlans.length === 0) loadCablePlans('dstv');
    if (tab === 'education' && eduPlans.length === 0) loadEduPlans('waec');
    if (tab === 'history') loadHistory();
  }, [tab]);

  const loadDataPlans = async (network: string) => {
    try { const { data } = await api.get(`/vtu/data-plans/${network}`); setDataPlans(data?.content?.variations || []); } catch { setDataPlans([]); }
  };
  const loadCablePlans = async (provider: string) => {
    try { const { data } = await api.get(`/vtu/cable-plans/${provider}`); setCablePlans(data?.content?.variations || []); } catch { setCablePlans([]); }
  };
  const loadEduPlans = async (serviceID: string) => {
    try { const { data } = await api.get(`/vtu/edu-plans/${serviceID}`); setEduPlans(data?.content?.variations || []); } catch { setEduPlans([]); }
  };
  const loadHistory = async () => {
    try { const { data } = await api.get('/vtu/history'); setHistory(data); } catch {}
  };

  const verifySmartCard = async () => {
    try {
      const { data } = await api.post('/vtu/verify-smartcard', { serviceID: cableForm.provider, billersCode: cableForm.smartCard });
      setSmartCardName(data?.content?.Customer_Name || '');
      if (data?.content?.Customer_Name) toast.success(`Card: ${data.content.Customer_Name}`);
      else toast.error('Smart card not found');
    } catch { toast.error('Could not verify smart card'); }
  };

  const verifyMeter = async () => {
    try {
      const { data } = await api.post('/vtu/verify-meter', { serviceID: elecForm.serviceID, billersCode: elecForm.meterNumber, type: elecForm.variationType });
      setMeterName(data?.content?.Customer_Name || '');
      if (data?.content?.Customer_Name) toast.success(`Meter: ${data.content.Customer_Name}`);
      else toast.error('Meter number not found');
    } catch { toast.error('Could not verify meter'); }
  };

  const handlePay = (amount: number, onSuccess: () => void) => {
    if (!user) return;
    pay({ email: user.email, amount, name: user.name, onSuccess: () => onSuccess(), onClose: () => toast('Payment cancelled') });
  };

  const buyAirtime = () => {
    const amount = Number(airtimeForm.amount);
    if (!amount || !airtimeForm.phone) { toast.error('Fill in all fields'); return; }
    handlePay(amount, async () => {
      try {
        const { data } = await api.post('/vtu/airtime', airtimeForm);
        if (data?.code === '000') toast.success(`₦${amount} airtime sent!`);
        else toast.error(data?.response_description || 'Transaction failed');
      } catch { toast.error('Failed'); }
    });
  };

  const buyData = () => {
    const amount = Number(dataForm.amount);
    if (!dataForm.variationCode || !dataForm.phone) { toast.error('Select a plan and enter phone'); return; }
    handlePay(amount, async () => {
      try {
        const { data } = await api.post('/vtu/data', dataForm);
        if (data?.code === '000') toast.success('Data purchased!');
        else toast.error(data?.response_description || 'Transaction failed');
      } catch { toast.error('Failed'); }
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
      } catch { toast.error('Failed'); }
    });
  };

  const buyElectricity = () => {
    const amount = Number(elecForm.amount);
    if (!elecForm.meterNumber || !amount) { toast.error('Fill in all fields'); return; }
    handlePay(amount, async () => {
      try {
        const { data } = await api.post('/vtu/electricity', elecForm);
        if (data?.code === '000') toast.success(`Token: ${data?.purchased_code || 'Check your meter'}`);
        else toast.error(data?.response_description || 'Transaction failed');
      } catch { toast.error('Failed'); }
    });
  };

  const buyEducation = () => {
    const amount = Number(eduForm.amount);
    if (!eduForm.variationCode || !eduForm.phone) { toast.error('Fill in all fields'); return; }
    handlePay(amount, async () => {
      try {
        const { data } = await api.post('/vtu/education', eduForm);
        if (data?.code === '000') toast.success('Education payment successful!');
        else toast.error(data?.response_description || 'Transaction failed');
      } catch { toast.error('Failed'); }
    });
  };

  const tabs = [
    { id: 'airtime', label: 'Airtime', icon: <Phone size={14} /> },
    { id: 'data', label: 'Data', icon: <Wifi size={14} /> },
    { id: 'cable', label: 'Cable', icon: <Tv size={14} /> },
    { id: 'electricity', label: 'Electric', icon: <Zap size={14} /> },
    { id: 'education', label: 'Edu', icon: <GraduationCap size={14} /> },
    { id: 'history', label: 'History', icon: <Clock size={14} /> },
  ];

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
      <h2 style={{ color: '#1a3fa8', margin: '0 0 16px', fontSize: '1.3rem' }}>Bills & Top-up</h2>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 20, gap: 3 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{ padding: '8px 2px', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: tab === t.id ? '#1a3fa8' : 'transparent', color: tab === t.id ? '#fff' : '#6b7280', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Airtime */}
      {tab === 'airtime' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {NETWORKS.map(n => (
              <button key={n} onClick={() => setAirtimeForm(f => ({ ...f, network: n }))} style={{ padding: '10px 4px', border: `2px solid ${airtimeForm.network === n ? networkColors[n] : '#e5e7eb'}`, borderRadius: 8, background: airtimeForm.network === n ? networkColors[n] + '20' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', color: networkColors[n], textTransform: 'uppercase' }}>{n}</button>
            ))}
          </div>
          <input placeholder="Phone number" value={airtimeForm.phone} onChange={e => setAirtimeForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[100, 200, 500, 1000].map(a => (
              <button key={a} onClick={() => setAirtimeForm(f => ({ ...f, amount: String(a) }))} style={{ padding: 10, border: `2px solid ${airtimeForm.amount === String(a) ? '#1a3fa8' : '#e5e7eb'}`, borderRadius: 8, background: airtimeForm.amount === String(a) ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#1a3fa8' }}>₦{a}</button>
            ))}
          </div>
          <input type="number" placeholder="Or enter amount" value={airtimeForm.amount} onChange={e => setAirtimeForm(f => ({ ...f, amount: e.target.value }))} style={inputStyle} />
          <button onClick={buyAirtime} style={btnStyle}>Buy Airtime <ChevronRight size={16} /></button>
        </div>
      )}

      {/* Data */}
      {tab === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {NETWORKS.map(n => (
              <button key={n} onClick={() => { setDataForm(f => ({ ...f, network: n, variationCode: '', amount: '' })); loadDataPlans(n); }} style={{ padding: '10px 4px', border: `2px solid ${dataForm.network === n ? networkColors[n] : '#e5e7eb'}`, borderRadius: 8, background: dataForm.network === n ? networkColors[n] + '20' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', color: networkColors[n], textTransform: 'uppercase' }}>{n}</button>
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
              <button key={p.id} onClick={() => { setCableForm(f => ({ ...f, provider: p.id, variationCode: '', amount: '' })); setSmartCardName(''); loadCablePlans(p.id); }} style={{ padding: 10, border: `2px solid ${cableForm.provider === p.id ? '#1a3fa8' : '#e5e7eb'}`, borderRadius: 8, background: cableForm.provider === p.id ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#1a3fa8' }}>{p.name}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Smart card / IUC number" value={cableForm.smartCard} onChange={e => { setCableForm(f => ({ ...f, smartCard: e.target.value })); setSmartCardName(''); }} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={verifySmartCard} style={{ padding: '10px 14px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Verify</button>
          </div>
          {smartCardName && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', color: '#166534', fontWeight: 600 }}>✓ {smartCardName}</div>}
          <select value={cableForm.variationCode} onChange={e => { const plan = cablePlans.find(p => p.variation_code === e.target.value); setCableForm(f => ({ ...f, variationCode: e.target.value, amount: plan?.variation_amount || '' })); }} style={inputStyle}>
            <option value="">Select package</option>
            {cablePlans.map(p => <option key={p.variation_code} value={p.variation_code}>{p.name} - ₦{p.variation_amount}</option>)}
          </select>
          <input placeholder="Phone number" value={cableForm.phone} onChange={e => setCableForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
          {cableForm.amount && <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 14px', color: '#1a3fa8', fontWeight: 700 }}>Total: ₦{Number(cableForm.amount).toLocaleString()}</div>}
          <button onClick={buyCable} style={btnStyle}>Subscribe <ChevronRight size={16} /></button>
        </div>
      )}

      {/* Electricity */}
      {tab === 'electricity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <select value={elecForm.serviceID} onChange={e => setElecForm(f => ({ ...f, serviceID: e.target.value }))} style={inputStyle}>
            {ELECTRICITY_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            {['prepaid', 'postpaid'].map(t => (
              <button key={t} onClick={() => setElecForm(f => ({ ...f, variationType: t }))} style={{ flex: 1, padding: 10, border: `2px solid ${elecForm.variationType === t ? '#1a3fa8' : '#e5e7eb'}`, borderRadius: 8, background: elecForm.variationType === t ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#1a3fa8', textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Meter number" value={elecForm.meterNumber} onChange={e => { setElecForm(f => ({ ...f, meterNumber: e.target.value })); setMeterName(''); }} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={verifyMeter} style={{ padding: '10px 14px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Verify</button>
          </div>
          {meterName && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', color: '#166534', fontWeight: 600 }}>✓ {meterName}</div>}
          <input type="number" placeholder="Amount (min ₦500)" value={elecForm.amount} onChange={e => setElecForm(f => ({ ...f, amount: e.target.value }))} style={inputStyle} />
          <input placeholder="Phone number" value={elecForm.phone} onChange={e => setElecForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
          <button onClick={buyElectricity} style={btnStyle}>Pay Electricity <ChevronRight size={16} /></button>
        </div>
      )}

      {/* Education */}
      {tab === 'education' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {EDU_SERVICES.map(s => (
              <button key={s.id} onClick={() => { setEduForm(f => ({ ...f, serviceID: s.id, variationCode: '', amount: '' })); loadEduPlans(s.id); }} style={{ padding: 10, border: `2px solid ${eduForm.serviceID === s.id ? '#1a3fa8' : '#e5e7eb'}`, borderRadius: 8, background: eduForm.serviceID === s.id ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', color: '#1a3fa8' }}>{s.name}</button>
            ))}
          </div>
          <select value={eduForm.variationCode} onChange={e => { const plan = eduPlans.find(p => p.variation_code === e.target.value); setEduForm(f => ({ ...f, variationCode: e.target.value, amount: plan?.variation_amount || '' })); }} style={inputStyle}>
            <option value="">Select plan</option>
            {eduPlans.map(p => <option key={p.variation_code} value={p.variation_code}>{p.name} - ₦{p.variation_amount}</option>)}
          </select>
          <input placeholder="Phone number" value={eduForm.phone} onChange={e => setEduForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
          {eduForm.serviceID === 'jamb' && <input placeholder="JAMB Registration Number" value={eduForm.billersCode} onChange={e => setEduForm(f => ({ ...f, billersCode: e.target.value }))} style={inputStyle} />}
          {eduForm.amount && <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 14px', color: '#1a3fa8', fontWeight: 700 }}>Total: ₦{Number(eduForm.amount).toLocaleString()}</div>}
          <button onClick={buyEducation} style={btnStyle}>Pay <ChevronRight size={16} /></button>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div>
          {history.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No transactions yet</p>}
          {history.map((t, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#111', fontSize: '0.9rem' }}>{t.type} — {t.details}</div>
                <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: 2 }}>{t.phone} · {new Date(t.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#1a3fa8' }}>₦{t.amount?.toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: t.status === 'success' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{t.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { padding: '14px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '1rem', marginTop: 4 };
