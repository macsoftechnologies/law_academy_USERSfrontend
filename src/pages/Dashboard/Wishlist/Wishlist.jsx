import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const MOCK_WISHLIST = [
  { id: 1, title: 'Specific Relief Act – Deep Dive',    category: 'Civil Law',   price: 2999, originalPrice: 4499, icon: '⚖️', rating: 4.8, students: 1240 },
  { id: 2, title: 'Transfer of Property Act',           category: 'Property Law', price: 3499, originalPrice: 5000, icon: '🏠', rating: 4.7, students: 890  },
  { id: 3, title: 'Hindu Personal Law – Full Course',   category: 'Personal Law', price: 2499, originalPrice: 3999, icon: '📿', rating: 4.9, students: 2100 },
  { id: 4, title: 'Constitutional Remedies & Writs',    category: 'Law',          price: 1999, originalPrice: 2999, icon: '🛡️', rating: 4.6, students: 670  },
];

export default function Wishlist() {
  const navigate = useNavigate();
  const [list, setList] = useState(MOCK_WISHLIST);

  const remove = id => setList(l => l.filter(i => i.id !== id));

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              ❤️ Wishlist
              <span className="page-section-count">{list.length}</span>
            </h1>
            {list.length > 0 && (
              <button className="btn btn-gold btn-sm">🛒 Add All to Cart</button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">💔</div>
                <h3>Your wishlist is empty</h3>
                <p>Save courses you love and come back to them anytime.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '.5rem' }} onClick={() => navigate('/dashboard')}>Explore Courses</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
              {list.map(c => {
                const disc = Math.round((1 - c.price / c.originalPrice) * 100);
                return (
                  <div key={c.id} className="card">
                    <div className="card-body">
                      <div style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,var(--navy),var(--navy-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                          {c.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--navy)', lineHeight: 1.3, marginBottom: '.2rem' }}>{c.title}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{c.category}</div>
                        </div>
                        <button onClick={() => remove(c.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0 }} title="Remove">🗑</button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', margin: '.85rem 0 .35rem', fontSize: '.75rem', color: 'var(--gray-500)' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ {c.rating}</span>
                        <span>•</span>
                        <span>{c.students.toLocaleString()} students</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem', marginBottom: '.85rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)' }}>₹{c.price.toLocaleString('en-IN')}</span>
                        <span style={{ fontSize: '.8rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>₹{c.originalPrice.toLocaleString('en-IN')}</span>
                        <span style={{ fontSize: '.72rem', fontWeight: 700, background: 'var(--gold-pale)', color: 'var(--maroon)', padding: '.1rem .4rem', borderRadius: 'var(--radius-sm)' }}>{disc}% OFF</span>
                      </div>

                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>🛒 Add to Cart</button>
                        <button className="btn btn-gold btn-sm" style={{ flex: 1 }}>Buy Now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
