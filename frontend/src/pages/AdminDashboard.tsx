import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, BookOpen, TrendingUp, Trash2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Stats { totalUsers: number; totalProviders: number; totalBookings: number; totalRevenue: number; }
interface UserItem { _id: string; name: string; email: string; phone: string; role: string; state: string; city: string; createdAt: string; }
interface ProviderItem { _id: string; user: { name: string; email: string }; category: string; rating: number; totalReviews: number; isAvailable: boolean; hourlyRate: number; }
interface BookingItem { _id: string; service: string; status: string; totalAmount: number; scheduledDate: string; customer: { name: string; email: string }; provider: { user: { name: string } }; }

type Tab = 'overview' | 'users' | 'providers' | 'bookings';

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fef9c3', color: '#854d0e' },
  accepted: { bg: '#dbeafe', color: '#1e40af' },
  'in-progress': { bg: '#ede9fe', color: '#5b21b6' },
  completed: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    loadStats();
  }, [user]);

  useEffect(() => {
    if (tab === 'users' && users.length === 0) loadUsers();
    if (tab === 'providers' && providers.length === 0) loadProviders();
    if (tab === 'bookings' && bookings.length === 0) loadBookings();
  }, [tab]);

  const loadStats = () => api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  const loadUsers = () => api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
  const loadProviders = () => api.get('/admin/providers').then(r => setProviders(r.data)).catch(() => {});
  const loadBookings = () => api.get('/admin/bookings').then(r => setBookings(r.data)).catch(() => {});

  const deleteProvider = async (id: string) => {
    if (!confirm('Remove this provider?')) return;
    try {
      await api.delete(`/admin/providers/${id}`);
      toast.success('Provider removed');
      setProviders(p => p.filter(x => x._id !== id));
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(u => u.filter(x => x._id !== id));
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 16px' }}>
      <style>{`
        .admin-tabs { display: flex; gap: 4px; background: #f3f4f6; borderRadius: 10px; padding: 4px; margin-bottom: 24px; flex-wrap: wrap; }
        .admin-tab { flex: 1; min-width: 80px; padding: 8px 12px; border: none; border-radius: 7px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
        .admin-tab.active { background: #1a3fa8; color: #fff; }
        .admin-tab:not(.active) { background: transparent; color: #6b7280; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        @media(min-width:640px){ .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .stat-box { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; }
        .stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .stat-val { font-size: 1.5rem; font-weight: 800; color: #111; }
        .stat-lbl { font-size: 0.78rem; color: #6b7280; margin-top: 2px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 10px 12px; font-size: 0.78rem; color: #6b7280; border-bottom: 2px solid #e5e7eb; font-weight: 600; text-transform: uppercase; }
        .data-table td { padding: 12px; font-size: 0.85rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
        .data-table tr:hover td { background: #f9fafb; }
        .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; overflow-x: auto; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a3fa8', fontSize: '1.3rem' }}>Admin Dashboard</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.85rem' }}>SuperConnect Control Panel</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {(['overview', 'users', 'providers', 'bookings'] as Tab[]).map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div className="stats-grid">
          {[
            { icon: <Users size={18} color="#1a3fa8" />, bg: '#eff6ff', val: stats.totalUsers, label: 'Total Users' },
            { icon: <Briefcase size={18} color="#7c3aed" />, bg: '#f5f3ff', val: stats.totalProviders, label: 'Providers' },
            { icon: <BookOpen size={18} color="#059669" />, bg: '#f0fdf4', val: stats.totalBookings, label: 'Bookings' },
            { icon: <TrendingUp size={18} color="#f97316" />, bg: '#fff7ed', val: `₦${(stats.totalRevenue / 1000).toFixed(0)}k`, label: 'Revenue' },
          ].map((s, i) => (
            <div key={i} className="stat-box">
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: u.role === 'admin' ? '#fef9c3' : u.role === 'provider' ? '#dbeafe' : '#f3f4f6', color: u.role === 'admin' ? '#854d0e' : u.role === 'provider' ? '#1e40af' : '#374151' }}>{u.role}</span></td>
                  <td>{u.city}, {u.state}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button onClick={() => deleteUser(u._id, u.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Providers */}
      {tab === 'providers' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Rate</th><th>Rating</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.user?.name}</td>
                  <td>{p.category}</td>
                  <td>₦{p.hourlyRate?.toLocaleString()}/hr</td>
                  <td>⭐ {p.rating?.toFixed(1)} ({p.totalReviews})</td>
                  <td><span style={{ color: p.isAvailable ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>{p.isAvailable ? 'Available' : 'Busy'}</span></td>
                  <td>
                    <button onClick={() => deleteProvider(p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Service</th><th>Customer</th><th>Provider</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const sc = statusColors[b.status] || statusColors.pending;
                return (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 600 }}>{b.service}</td>
                    <td>{b.customer?.name}</td>
                    <td>{b.provider?.user?.name}</td>
                    <td style={{ color: '#1a3fa8', fontWeight: 600 }}>₦{b.totalAmount?.toLocaleString()}</td>
                    <td><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{b.status}</span></td>
                    <td>{new Date(b.scheduledDate).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
