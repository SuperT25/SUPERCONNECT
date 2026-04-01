import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Wrench, Car, Sparkles, Hammer, Paintbrush, Smartphone, Monitor, ShoppingBag, Shield, Wind, Flame, Truck, Laptop } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../types';

const categoryIcons: Record<string, React.ReactElement> = {
  Plumber: <Wrench size={26} />,
  Electrician: <Zap size={26} />,
  Mechanic: <Car size={26} />,
  Cleaner: <Sparkles size={26} />,
  Carpenter: <Hammer size={26} />,
  Painter: <Paintbrush size={26} />,
  'Generator Technician': <Flame size={26} />,
  'AC Technician': <Wind size={26} />,
  Welder: <Hammer size={26} />,
  Bricklayer: <Hammer size={26} />,
  'Security Guard': <Shield size={26} />,
  Driver: <Truck size={26} />,
  'Phone Repair Technician': <Smartphone size={26} />,
  'Computer Repair Technician': <Monitor size={26} />,
  'Phone Seller': <ShoppingBag size={26} />,
  'Computer Seller': <Laptop size={26} />,
};

export default function Home() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?category=${search}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <style>{`
        .hero { background: linear-gradient(135deg, #1a3fa8 0%, #2563eb 100%); color: #fff; padding: 48px 16px 56px; text-align: center; }
        .hero h1 { font-size: 2rem; font-weight: 800; margin: 0; }
        .hero p { font-size: 1rem; margin-top: 8px; opacity: 0.9; }
        @media(min-width:640px){ .hero h1{font-size:2.8rem} .hero p{font-size:1.1rem} }
        .search-form { margin-top: 24px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; padding: 0 8px; }
        .search-input { padding: 12px 16px; border-radius: 8px; border: none; width: 100%; max-width: 340px; font-size: 1rem; outline: none; }
        .search-btn { padding: 12px 20px; background: #f97316; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 1rem; white-space: nowrap; }
        .categories { max-width: 900px; margin: 32px auto; padding: 0 16px; }
        .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media(min-width:480px){ .cat-grid { grid-template-columns: repeat(4, 1fr); } }
        @media(min-width:640px){ .cat-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; } }
        .cat-card { background: #fff; border-radius: 12px; padding: 16px 8px; text-align: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; transition: transform 0.15s; }
        .cat-card:hover { transform: translateY(-3px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .cat-label { font-size: 0.78rem; font-weight: 600; color: #374151; margin-top: 6px; }
        .how-section { background: #fff; padding: 36px 16px; margin-top: 16px; }
        .how-grid { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 800px; margin: 20px auto 0; }
        @media(min-width:640px){ .how-grid { grid-template-columns: repeat(3, 1fr); } }
        .how-step { text-align: center; padding: 16px; }
        .step-num { width: 44px; height: 44px; border-radius: 50%; background: #1a3fa8; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; margin: 0 auto 10px; }
      `}</style>

      {/* Hero */}
      <div className="hero">
        <h1><span style={{color:'#fff'}}>Super</span><span style={{color:'#f97316'}}>Connect</span></h1>
        <p>Find trusted local service providers near you</p>
        <form onSubmit={handleSearch} className="search-form">
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plumber, electrician..." />
          <button type="submit" className="search-btn"><Search size={18} /> Search</button>
        </form>
      </div>

      {/* Categories */}
      <div className="categories">
        <h2 style={{ textAlign: 'center', color: '#1a3fa8', marginBottom: 16, fontSize: '1.3rem' }}>Browse by Service</h2>
        <div className="cat-grid">
          {SERVICE_CATEGORIES.map(cat => (
            <div key={cat} className="cat-card" onClick={() => navigate(`/search?category=${cat}`)}>
              <div style={{ color: '#1a3fa8' }}>{categoryIcons[cat] || <Wrench size={26} />}</div>
              <div className="cat-label">{cat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="how-section">
        <h2 style={{ textAlign: 'center', color: '#1a3fa8', margin: 0, fontSize: '1.3rem' }}>How SuperConnect Works</h2>
        <div className="how-grid">
          {[
            { step: '1', title: 'Search', desc: 'Find a service provider in your area' },
            { step: '2', title: 'Book & Pay', desc: 'Schedule a time and pay securely with Paystack' },
            { step: '3', title: 'Get it done', desc: 'Provider comes to you and gets the job done' },
          ].map(item => (
            <div key={item.step} className="how-step">
              <div className="step-num">{item.step}</div>
              <h3 style={{ margin: '0 0 6px', color: '#111', fontSize: '1rem' }}>{item.title}</h3>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.88rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
