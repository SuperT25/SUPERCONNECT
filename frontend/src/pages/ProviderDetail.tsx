import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Clock, CheckCircle, CreditCard } from 'lucide-react';
import api from '../api';
import type { Provider } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePaystack } from '../hooks/usePaystack';
import toast from 'react-hot-toast';

export default function ProviderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pay } = usePaystack();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({ description: '', scheduledDate: '', address: '', hours: 1 });

  useEffect(() => {
    api.get(`/providers/${id}`).then(r => setProvider(r.data)).catch(() => navigate('/search'));
  }, [id]);

  const totalAmount = provider ? provider.hourlyRate * form.hours : 0;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (totalAmount <= 0) {
      toast.error('Provider has not set a rate yet');
      return;
    }

    setPaying(true);
    pay({
      email: user.email || 'customer@superconnect.ng',
      amount: totalAmount,
      name: user.name,
      subaccountCode: provider?.paystackSubaccountCode || undefined,
      onSuccess: async (reference) => {
        try {
          await api.post('/bookings', {
            provider: id,
            service: provider?.category,
            description: form.description,
            scheduledDate: form.scheduledDate,
            address: form.address,
            totalAmount,
            paymentReference: reference,
          });
          toast.success('Booking confirmed and payment successful!');
          setShowBooking(false);
          navigate('/dashboard/customer');
        } catch {
          toast.error('Payment received but booking failed. Contact support.');
        } finally {
          setPaying(false);
        }
      },
      onClose: () => {
        setPaying(false);
        toast('Payment cancelled');
      },
    });
  };

  if (!provider) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: '0 0 6px', color: '#111' }}>{provider.user?.name}</h2>
            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>{provider.category}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem' }}>
              <Star size={18} fill="#f59e0b" /> {provider.rating.toFixed(1)}
              <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.85rem' }}>({provider.totalReviews} reviews)</span>
            </div>
            <div style={{ color: '#1a3fa8', fontWeight: 700, fontSize: '1.2rem', marginTop: 4 }}>₦{provider.hourlyRate.toLocaleString()}/hr</div>
          </div>
        </div>

        <p style={{ color: '#4b5563', marginTop: 16, lineHeight: 1.6 }}>{provider.bio}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16, fontSize: '0.9rem', color: '#6b7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} color="#1a3fa8" /> {provider.city}, {provider.state}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} color="#1a3fa8" /> {provider.yearsOfExperience} years experience</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={16} color="#1a3fa8" /> {provider.user?.phone}</span>
        </div>

        {provider.skills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4 style={{ margin: '0 0 10px', color: '#374151' }}>Skills</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {provider.skills.map(s => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#1e40af', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem' }}>
                  <CheckCircle size={13} /> {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, background: provider.isAvailable ? '#dbeafe' : '#fee2e2', color: provider.isAvailable ? '#1e40af' : '#dc2626' }}>
            {provider.isAvailable ? 'Available Now' : 'Currently Busy'}
          </span>
        </div>

        <button
          onClick={() => { if (!user) navigate('/login'); else setShowBooking(true); }}
          style={{ marginTop: 24, width: '100%', padding: '14px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Book {provider.user?.name}
        </button>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
            <h3 style={{ margin: '0 0 4px', color: '#111' }}>Book {provider.user?.name}</h3>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '0.9rem' }}>Rate: ₦{provider.hourlyRate.toLocaleString()}/hr</p>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <textarea
                placeholder="Describe the job (e.g. fix leaking pipe in kitchen)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required rows={3} style={inputStyle}
              />
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                required style={inputStyle}
              />
              <input
                placeholder="Your address"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                required style={inputStyle}
              />
              <div>
                <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>Estimated hours</label>
                <input
                  type="number" min={1} max={24}
                  value={form.hours}
                  onChange={e => setForm({ ...form, hours: Number(e.target.value) })}
                  style={{ ...inputStyle, marginTop: 6 }}
                />
              </div>

              {/* Total */}
              <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151', fontWeight: 600 }}>Total</span>
                <span style={{ color: '#1a3fa8', fontWeight: 800, fontSize: '1.1rem' }}>₦{totalAmount.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowBooking(false)} style={{ flex: 1, padding: 12, border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={paying} style={{ flex: 1, padding: 12, background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <CreditCard size={16} /> {paying ? 'Processing...' : `Pay ₦${totalAmount.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db',
  fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box',
};
