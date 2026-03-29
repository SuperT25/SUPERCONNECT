import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';
import api from '../api';
import type { Provider } from '../types';
import { SERVICE_CATEGORIES, NIGERIAN_STATES } from '../types';

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(params.get('category') || '');
  const [state, setState] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (category) q.set('category', category);
      if (state) q.set('state', state);
      const { data } = await api.get(`/providers?${q}`);
      setProviders(data);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, [category, state]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
      <style>{`
        .filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-select { padding: 10px 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 0.9rem; background: #fff; cursor: pointer; outline: none; flex: 1; min-width: 140px; }
        .provider-card { background: #fff; border-radius: 12px; padding: 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; margin-bottom: 12px; transition: all 0.2s; }
        .provider-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-2px); }
        .provider-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
        .provider-meta { display: flex; gap: 12px; font-size: 0.82rem; color: #6b7280; flex-wrap: wrap; margin-top: 8px; }
      `}</style>

      <h2 style={{ color: '#1a3fa8', margin: '0 0 16px', fontSize: '1.3rem' }}>Find a Service Provider</h2>

      <div className="filter-row">
        <select value={category} onChange={e => setCategory(e.target.value)} className="filter-select">
          <option value="">All Services</option>
          {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={state} onChange={e => setState(e.target.value)} className="filter-select">
          <option value="">All States</option>
          {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>Loading providers...</p>}

      {!loading && providers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
          <p style={{ fontSize: '1rem' }}>No providers found. Try a different filter.</p>
        </div>
      )}

      {providers.map(p => (
        <div key={p._id} className="provider-card" onClick={() => navigate(`/provider/${p._id}`)}>
          <div className="provider-header">
            <div>
              <h3 style={{ margin: '0 0 6px', color: '#111', fontSize: '1rem' }}>{p.user?.name}</h3>
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{p.category}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>
                <Star size={14} fill="#f59e0b" /> {p.rating.toFixed(1)}
                <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.78rem' }}>({p.totalReviews})</span>
              </div>
              <div style={{ color: '#1a3fa8', fontWeight: 700, marginTop: 2, fontSize: '0.95rem' }}>₦{p.hourlyRate.toLocaleString()}/hr</div>
            </div>
          </div>
          {p.bio && <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: '0.85rem', lineHeight: 1.5 }}>{p.bio.slice(0, 100)}{p.bio.length > 100 ? '...' : ''}</p>}
          <div className="provider-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {p.city}, {p.state}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {p.yearsOfExperience} yrs exp</span>
            <span style={{ color: p.isAvailable ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{p.isAvailable ? '● Available' : '● Busy'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
