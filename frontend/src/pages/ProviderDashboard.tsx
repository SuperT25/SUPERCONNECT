import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Phone, MessageCircle } from 'lucide-react';
import api from '../api';
import type { Booking, Provider } from '../types';
import { SERVICE_CATEGORIES } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fef9c3', color: '#854d0e' },
  accepted: { bg: '#dbeafe', color: '#1e40af' },
  'in-progress': { bg: '#ede9fe', color: '#5b21b6' },
  completed: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Provider | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ category: '', bio: '', skills: '', hourlyRate: '', yearsOfExperience: '', address: '', isAvailable: true });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [bookRes, provRes] = await Promise.allSettled([
        api.get('/bookings/provider'),
        api.get('/providers').then(r => r.data.find((p: Provider) => p.user?._id === user?.id))
      ]);
      if (bookRes.status === 'fulfilled') setBookings(bookRes.value.data);
      if (provRes.status === 'fulfilled' && provRes.value) {
        setProfile(provRes.value);
        const p = provRes.value;
        setProfileForm({ category: p.category, bio: p.bio, skills: p.skills.join(', '), hourlyRate: String(p.hourlyRate), yearsOfExperience: String(p.yearsOfExperience), address: p.address, isAvailable: p.isAvailable });
      }
    } catch {}
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...profileForm, skills: profileForm.skills.split(',').map(s => s.trim()), hourlyRate: Number(profileForm.hourlyRate), yearsOfExperience: Number(profileForm.yearsOfExperience) };
      if (profile) {
        await api.put(`/providers/${profile._id}`, payload);
      } else {
        await api.post('/providers', { ...payload, state: '', city: '' });
      }
      toast.success('Profile saved!');
      setShowProfileForm(false);
      fetchData();
    } catch {
      toast.error('Failed to save profile');
    }
  };

  const earnings = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
      <style>{`
        .pdash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
        .pdash-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-card { background: #fff; border-radius: 10px; padding: 14px 10px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; }
        .stat-val { font-size: 1.3rem; font-weight: 800; color: #1a3fa8; }
        .stat-label { font-size: 0.75rem; color: #6b7280; margin-top: 2px; }
        .booking-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; margin-bottom: 12px; }
        .booking-top { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .booking-meta { font-size: 0.82rem; color: #6b7280; }
        .booking-meta div { display: flex; align-items: center; gap: 4px; margin-top: 3px; }
        .action-btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
      `}</style>

      <div className="pdash-header">
        <div>
          <h2 style={{ margin: 0, color: '#1a3fa8', fontSize: '1.3rem' }}>Provider Dashboard</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{user?.name}</p>
        </div>
        <div className="pdash-btns">
          <button onClick={() => setShowProfileForm(true)} style={{ padding: '8px 14px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            {profile ? 'Edit Profile' : 'Setup Profile'}
          </button>
          <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{bookings.length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{bookings.filter(b => b.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">₦{(earnings / 1000).toFixed(0)}k</div>
          <div className="stat-label">Earnings</div>
        </div>
      </div>

      {!profile && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10, padding: 14, marginBottom: 16, color: '#854d0e', fontSize: '0.9rem' }}>
          Set up your provider profile so customers can find and book you.
        </div>
      )}

      <h3 style={{ color: '#374151', marginBottom: 12, fontSize: '1rem' }}>Bookings</h3>

      {bookings.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No bookings yet. Set up your profile to get started.</p>}

      {bookings.map(b => {
        const sc = statusColors[b.status] || statusColors.pending;
        const customer = b.customer as any;
        return (
          <div key={b._id} className="booking-card">
            <div className="booking-top">
              <div>
                <h4 style={{ margin: '0 0 6px', color: '#111', fontSize: '0.95rem' }}>{b.service}</h4>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{b.status}</span>
              </div>
              <div className="booking-meta">
                <div><Calendar size={13} /> {new Date(b.scheduledDate).toLocaleDateString()}</div>
                <div><MapPin size={13} /> {b.address}</div>
                {customer?.phone && <div><Phone size={13} /> {customer.phone}</div>}
                {b.totalAmount > 0 && <div style={{ color: '#1a3fa8', fontWeight: 700 }}>₦{b.totalAmount.toLocaleString()}</div>}
              </div>
            </div>
            {b.description && <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: '0.85rem' }}>{b.description}</p>}
            <div className="action-btns">
              {b.status === 'pending' && <>
                <button onClick={() => updateStatus(b._id, 'accepted')} style={actionBtn('#1a3fa8')}>Accept</button>
                <button onClick={() => updateStatus(b._id, 'cancelled')} style={actionBtn('#dc2626')}>Decline</button>
              </>}
              {b.status === 'accepted' && <button onClick={() => updateStatus(b._id, 'in-progress')} style={actionBtn('#7c3aed')}>Start Job</button>}
              {b.status === 'in-progress' && <button onClick={() => updateStatus(b._id, 'completed')} style={actionBtn('#059669')}>Mark Complete</button>}
              <button onClick={() => navigate(`/chat/${b._id}`)} style={{ ...actionBtn('#1a3fa8'), background: '#f0f4ff', color: '#1a3fa8', border: '1px solid #dbeafe', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <MessageCircle size={13} /> Chat
              </button>
            </div>
          </div>
        );
      })}

      {/* Profile Modal */}
      {showProfileForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, margin: 'auto' }}>
            <h3 style={{ margin: '0 0 16px' }}>Provider Profile</h3>
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select value={profileForm.category} onChange={e => setProfileForm({ ...profileForm, category: e.target.value })} required style={inputStyle}>
                <option value="">Select your service category</option>
                {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea placeholder="Bio (describe your experience)" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} style={inputStyle} />
              <input placeholder="Skills (comma separated)" value={profileForm.skills} onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Hourly rate (₦)" value={profileForm.hourlyRate} onChange={e => setProfileForm({ ...profileForm, hourlyRate: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Years of experience" value={profileForm.yearsOfExperience} onChange={e => setProfileForm({ ...profileForm, yearsOfExperience: e.target.value })} style={inputStyle} />
              <input placeholder="Address" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} style={inputStyle} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: '#374151' }}>
                <input type="checkbox" checked={profileForm.isAvailable} onChange={e => setProfileForm({ ...profileForm, isAvailable: e.target.checked })} />
                Available for bookings
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowProfileForm(false)} style={{ flex: 1, padding: 12, border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const actionBtn = (bg: string): React.CSSProperties => ({ padding: '6px 14px', background: bg, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' });
const inputStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
