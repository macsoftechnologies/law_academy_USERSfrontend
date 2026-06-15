import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import { getCartList, removeFromCart } from '../../../api/cart';
import { useCartWishlist } from '../../../context/CartWishlistContext';
import EnrollModal from '../../../components/common/EnrollModal';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Cart() {
  const navigate = useNavigate();
  const { refresh } = useCartWishlist();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const userId = localStorage.getItem('userId') || user?._id || user?.id;

  useEffect(() => {
    if (userId) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await getCartList(userId);
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (cartItemId) => {
    if (!window.confirm("Are you sure you want to remove this item from your cart?")) return;
    try {
      await removeFromCart(userId, cartItemId);
      setCart(c => c.filter(i => i.cartItemId !== cartItemId));
      refresh();
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item.");
    }
  };

  const subtotal = cart.reduce((s, i) => {
    const price = parseInt(i.plan?.original_price || 0, 10);
    return s + price;
  }, 0);

  const handlingFee = cart.reduce((s, i) => {
    const fee = parseInt(i.plan?.handling_fee || 0, 10);
    return s + fee;
  }, 0);

  const total = subtotal + handlingFee;

  const cartPlan = useMemo(() => ({
    original_price: subtotal,
    handling_fee: handlingFee,
    duration: `${cart.length} Course(s)`,
    planId: cart.length > 0 ? (cart[0].plan?.planId || cart[0].plan?._id) : null,
    enroll_type: cart.length > 0 ? (cart[0].enroll_type || cart[0].course_type || cart[0].plan?.enroll_type) : null
  }), [subtotal, handlingFee, cart.length, cart]);

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

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Loading cart...</div>
          ) : cart.length === 0 ? (
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
  const originalPrice = parseInt(item.plan?.strike_price || item.plan?.original_price || 0, 10);
  const price = parseInt(item.plan?.original_price || 0, 10);

  return (
    <div key={item.cartItemId} className="card">
      <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,var(--navy),var(--navy-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden' }}>
          {item.courseDetails?.presentation_image ? (
            <img src={`${BASE_URL}/${item.courseDetails.presentation_image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : '📚'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', marginBottom: '.15rem' }}>{item.courseDetails?.title || 'Course'}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', textTransform: 'capitalize' }}>{item.enroll_type.replace('-', ' ')} - {item.plan?.duration}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>₹{price.toLocaleString('en-IN')}</div>
          {originalPrice > price && (
            <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>₹{originalPrice.toLocaleString('en-IN')}</div>
          )}
        </div>
        <button onClick={() => remove(item.cartItemId)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0 }} title="Remove">🗑</button>
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
                    {handlingFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', color: 'var(--gray-600)' }}>
                        <span>Handling Fee</span>
                        <span>₹{handlingFee.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div style={{ height: 1, background: 'var(--gray-100)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-gold btn-lg btn-full" 
                    style={{ marginTop: '1rem' }}
                    onClick={() => setShowEnroll(true)}
                  >
                    Proceed to Checkout →
                  </button>
                  <p style={{ fontSize: '.72rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '.6rem' }}>Secure checkout • GST included</p>
                </div>
              </div>
            </div>
          )}

          {showEnroll && (
            <EnrollModal
              plan={cartPlan}
              courseTitle={
                cart.length > 0
                  ? (
                      cart[0].courseDetails?.title ||
                      cart[0].plan?.courseDetails?.title ||
                      localStorage.getItem(`cart_title_${cart[0].course_id}`) ||
                      'Course'
                    )
                  : 'Course'
              }
              enroll_type={cartPlan.enroll_type}
              onClose={() => setShowEnroll(false)}
              onSuccess={async () => {
                // Remove the enrolled item from backend cart
                if (cart.length > 0 && cart[0].cartItemId) {
                  try {
                    await removeFromCart(userId, cart[0].cartItemId);
                  } catch (e) {
                    console.error('Failed to remove cart item after enrollment:', e);
                  }
                }
                setCart([]);
                refresh();
                setShowEnroll(false);
                navigate('/dashboard');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
