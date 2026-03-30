import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <nav style={{ background: 'linear-gradient(135deg, #1a3fa8 0%, #2563eb 100%)', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <Link to="/" onClick={close} style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', textDecoration: 'none' }}>
          <span style={{ color: '#fff' }}>Super</span><span style={{ color: '#f97316' }}>Connect</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="desktop-nav">
          <style>{`@media(max-width:600px){.desktop-nav{display:none!important}}.mobile-nav-btn{display:none}@media(max-width:600px){.mobile-nav-btn{display:flex!important}}`}</style>
          <Link to="/search" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Find Services</Link>
          <Link to="/bills" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Bills</Link>
          {user ? (
            <>
              <Link to={user.role === 'provider' ? '/dashboard/provider' : '/dashboard/customer'} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Dashboard</Link>
              <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>Login</Link>
              <Link to="/register" style={{ padding: '6px 14px', background: '#f97316', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="mobile-nav-btn" style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{ position: 'fixed', top: 56, left: 0, right: 0, background: '#1a3fa8', zIndex: 49, padding: '12px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {[
            { to: '/search', label: 'Find Services' },
            { to: '/bills', label: 'Bills & Top-up' },
            ...(user ? [
              { to: user.role === 'provider' ? '/dashboard/provider' : '/dashboard/customer', label: 'Dashboard' },
            ] : [
              { to: '/login', label: 'Login' },
              { to: '/register', label: 'Register' },
            ]),
          ].map(item => (
            <Link key={item.to} to={item.to} onClick={close} style={{ display: 'block', padding: '14px 20px', color: '#fff', textDecoration: 'none', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {item.label}
            </Link>
          ))}
          {user && (
            <button onClick={() => { logout(); navigate('/'); close(); }} style={{ display: 'block', width: '100%', padding: '14px 20px', color: '#fca5a5', background: 'none', border: 'none', textAlign: 'left', fontSize: '1rem', cursor: 'pointer' }}>
              Logout
            </button>
          )}
        </div>
      )}
    </>
  );
}
