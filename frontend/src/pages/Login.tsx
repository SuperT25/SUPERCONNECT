import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'provider') navigate('/dashboard/provider');
      else navigate('/dashboard/customer');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 420, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#1a3fa8', margin: '0 0 8px' }}>SuperConnect</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 28 }}>Sign in to your account</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={inputStyle} />
          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <Link to="/forgot-password" style={{ color: '#1a3fa8', fontSize: '0.85rem' }}>Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#1a3fa8', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { padding: 14, background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: 4 };
