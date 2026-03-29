import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { NIGERIAN_STATES } from '../types';
import toast from 'react-hot-toast';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer', state: '', city: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      toast.success('Account created successfully!');
      navigate(data.user.role === 'provider' ? '/dashboard/provider' : '/dashboard/customer');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 460, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#1a3fa8', margin: '0 0 8px' }}>Join SuperConnect</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 24 }}>Create your account</p>

        {/* Role Toggle */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 4, marginBottom: 20 }}>
          {['customer', 'provider'].map(r => (
            <button key={r} type="button" onClick={() => set('role', r)}
              style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', background: form.role === r ? '#1a3fa8' : 'transparent', color: form.role === r ? '#fff' : '#6b7280', transition: 'all 0.2s' }}>
              {r === 'customer' ? 'I need a service' : 'I provide services'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required style={inputStyle} />
          <input type="email" placeholder="Email address" value={form.email} onChange={e => set('email', e.target.value)} required style={inputStyle} />
          <input placeholder="Phone number (e.g. 08012345678)" value={form.phone} onChange={e => set('phone', e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={form.password} onChange={e => set('password', e.target.value)} required style={inputStyle} />
          <select value={form.state} onChange={e => set('state', e.target.value)} required style={inputStyle}>
            <option value="">Select State</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input placeholder="City / LGA" value={form.city} onChange={e => set('city', e.target.value)} required style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#1a3fa8', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { padding: 14, background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: 4 };
