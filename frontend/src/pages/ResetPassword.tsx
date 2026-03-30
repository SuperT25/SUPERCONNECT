import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#dc2626' }}>Invalid reset link.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 420, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#1a3fa8', margin: '0 0 8px' }}>Set New Password</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 24, fontSize: '0.9rem' }}>Enter your new password below</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { padding: 14, background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700, cursor: 'pointer' };
