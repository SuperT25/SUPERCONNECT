import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 420, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#1a3fa8', margin: '0 0 8px' }}>Forgot Password</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 24, fontSize: '0.9rem' }}>Enter your email and we'll send you a reset link</p>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📧</div>
            <p style={{ color: '#374151', fontWeight: 600 }}>Check your email</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>We sent a password reset link to <strong>{email}</strong></p>
            <Link to="/login" style={{ display: 'inline-block', marginTop: 20, color: '#1a3fa8', fontWeight: 600 }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
              <Link to="/login" style={{ color: '#1a3fa8', fontWeight: 600 }}>Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { padding: 14, background: '#1a3fa8', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700, cursor: 'pointer' };
