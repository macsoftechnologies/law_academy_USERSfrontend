import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const INITIAL_CART = [
  { id: 1, title: 'Constitutional Law – Complete Series', category: 'Law',      price: 4999, originalPrice: 6999, icon: '⚖️' },
  { id: 2, title: 'IPC & Criminal Law Mastery',          category: 'Criminal', price: 3499, originalPrice: 4999, icon: '🔒' },
];

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(INITIAL_CART);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const remove = id => setCart(c => c.filter(i => i.id !== id));
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total    = subtotal - discount;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'MAKA10') setCouponApplied(true);
    else alert('Invalid coupon code');
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              🛒 My Cart
              <span className="page-section-count">{cart.length}</span>
            </h1>
          </div>

          {cart.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add courses to your cart to checkout.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '.5rem' }} onClick={() => navigate('/dashboard')}>Browse Courses</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {cart.map(item => {
                  const disc = Math.round((1 - item.price / item.originalPrice) * 100);
                  return (
                    <div key={item.id} className="card">
                      <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,var(--navy),var(--navy-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', marginBottom: '.15rem' }}>{item.title}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{item.category}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>₹{item.price.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>₹{item.originalPrice.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '.68rem', color: 'var(--success)', fontWeight: 700 }}>{disc}% OFF</div>
                        </div>
                        <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0 }}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
                <div className="card-header">Order Summary</div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', color: 'var(--gray-600)' }}>
                      <span>Subtotal ({cart.length} items)</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {couponApplied && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', color: 'var(--success)' }}>
                        <span>Coupon Discount (10%)</span>
                        <span>- ₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div style={{ height: 1, background: 'var(--gray-100)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Coupon */}
                  {!couponApplied ? (
                    <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
                      <input
                        style={{ flex: 1, padding: '.55rem .85rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.82rem', fontFamily: 'var(--font-body)', background: 'var(--white)' }}
                        placeholder="Coupon code"
                        value={coupon}
                        onChange={e => setCoupon(e.target.value)}
                      />
                      <button className="btn btn-outline btn-sm" onClick={applyCoupon}>Apply</button>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--success-bg)', color: 'var(--success)', fontSize: '.8rem', fontWeight: 600, padding: '.5rem .85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center' }}>
                      ✅ MAKA10 applied — 10% off!
                    </div>
                  )}

                  <button className="btn btn-gold btn-lg btn-full">Proceed to Checkout →</button>
                  <p style={{ fontSize: '.72rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '.6rem' }}>Secure checkout • GST included</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
