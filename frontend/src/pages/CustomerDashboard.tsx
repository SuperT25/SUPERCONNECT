import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Star, Search, MessageCircle } from 'lucide-react';
import api from '../api';
import type { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fef9c3', color: '#854d0e' },
  accepted: { bg: '#dbeafe', color: '#1e40af' },
  'in-progress': { bg: '#ede9fe', color: '#5b21b6' },
  completed: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewForm, setReviewForm] = useState<{ id: string; rating: number; review: string } | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/bookings/my').then(r => setBookings(r.data)).catch(() => {});
  }, [user]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm) return;
    try {
      await api.patch(`/bookings/${reviewForm.id}/review`, { rating: reviewForm.rating, review: reviewForm.review });
      toast.success('Review submitted!');
      setReviewForm(null);
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
      <style>{`
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .dash-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .booking-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; margin-bottom: 12px; }
        .booking-top { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .booking-meta { font-size: 0.82rem; color: #6b7280; }
        .booking-meta div { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
      `}</style>

      <div className="dash-header">
        <div>
          <h2 style={{ margin: 0, color: '#1a3fa8', fontSize: '1.3rem' }}>My Bookings</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Welcome, {user?.name}</p>
        </div>
        <div className="dash-actions">
          <button onClick={() => navigate('/search')} style={{ padding: '8px 14px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={14} /> Find Services
          </button>
          <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
        </div>
      </div>

      {bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
          <p style={{ fontSize: '1rem' }}>No bookings yet.</p>
          <button onClick={() => navigate('/search')} style={{ marginTop: 12, padding: '10px 20px', background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Find a Provider</button>
        </div>
      )}

      {bookings.map(b => {
        const sc = statusColors[b.status] || statusColors.pending;
        return (
          <div key={b._id} className="booking-card">
            <div className="booking-top">
              <div>
                <h4 style={{ margin: '0 0 6px', color: '#111', fontSize: '0.95rem' }}>{b.service} — {b.provider?.user?.name}</h4>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{b.status}</span>
              </div>
              <div className="booking-meta">
                <div><Calendar size={13} /> {new Date(b.scheduledDate).toLocaleDateString()}</div>
                <div><MapPin size={13} /> {b.address}</div>
                {b.totalAmount > 0 && <div style={{ color: '#1a3fa8', fontWeight: 700 }}>₦{b.totalAmount.toLocaleString()} paid</div>}
              </div>
            </div>
            {b.description && <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: '0.85rem' }}>{b.description}</p>}
            {b.status === 'completed' && !b.rating && (
              <button onClick={() => setReviewForm({ id: b._id, rating: 5, review: '' })}
                style={{ marginTop: 10, padding: '7px 14px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                Leave a Review
              </button>
            )}
            <button onClick={() => navigate(`/chat/${b._id}`)}
              style={{ marginTop: 10, marginLeft: b.status === 'completed' && !b.rating ? 8 : 0, padding: '7px 14px', background: '#f0f4ff', color: '#1a3fa8', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <MessageCircle size={14} /> Chat
            </button>
            {b.rating && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: '0.85rem' }}>
                <Star size={13} fill="#f59e0b" /> {b.rating}/5 — {b.review}
              </div>
            )}
          </div>
        );
      })}

      {/* Review Modal */}
      {reviewForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 16px' }}>Leave a Review</h3>
            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} style={inputStyle}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
              <textarea placeholder="Write your review..." value={reviewForm.review} onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })} rows={3} style={inputStyle} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setReviewForm(null)} style={{ flex: 1, padding: 12, border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
