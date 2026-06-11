import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import { getWishlistList, removeFromWishlist } from '../../../api/wishlist';
import { moveFromWishlistToCart } from '../../../api/cart';
import { getPlansByCourseId } from '../../../api/plans';
import { useCartWishlist } from '../../../context/CartWishlistContext';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Wishlist() {
  const navigate = useNavigate();
  const { refresh } = useCartWishlist();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState(null);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState(null);
  const [fetchedPlans, setFetchedPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const userId = localStorage.getItem('userId') || user?._id || user?.id;

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await getWishlistList(userId);
      if (res?.data) {
        setList(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (wishlistItemId) => {
    try {
      await removeFromWishlist(userId, wishlistItemId);
      setList(l => l.filter(i => i.wishlistItemId !== wishlistItemId));
      refresh();
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove from wishlist.");
    }
  };

  const handleMoveToCart = async (wishlistItemId, planId) => {
    if (!planId) {
      alert('Plan ID is missing for this item.');
      return;
    }
    try {
      setMovingId(wishlistItemId);
      await moveFromWishlistToCart(userId, wishlistItemId, planId);
      // Remove from wishlist locally after successful move
      setList(l => l.filter(i => i.wishlistItemId !== wishlistItemId));
      refresh();
      alert('Item moved to cart successfully!');
    } catch (err) {
      console.error("Failed to move to cart:", err);
      alert("Failed to move to cart. " + (err.message || ''));
    } finally {
      setMovingId(null);
    }
  };

  const handleOpenPlanModal = async (item) => {
    setSelectedWishlistItem(item);
    setFetchingPlans(true);
    setFetchedPlans([]);
    try {
      const courseId = item.course_id || item.courseDetails?._id || item.courseDetails?.course_id || item.courseDetails?.subject_id || item.courseDetails?.combo_id;
      const res = await getPlansByCourseId(courseId);
      if (res?.data) {
        setFetchedPlans(res.data);
      } else if (Array.isArray(res)) {
        setFetchedPlans(res);
      } else {
        setFetchedPlans([]);
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setFetchedPlans([]);
    } finally {
      setFetchingPlans(false);
    }
  };

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
              <button className="btn btn-gold btn-sm" onClick={() => navigate('/dashboard/cart')}>🛒 Go to Cart</button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Loading wishlist...</div>
          ) : list.length === 0 ? (
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
                const originalPrice = parseInt(c.plan?.strike_price || c.plan?.original_price || 0, 10);
                const price = parseInt(c.plan?.original_price || 0, 10);
                const disc = originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;
                const isMoving = movingId === c.wishlistItemId;

                return (
                  <div key={c.wishlistItemId} className="course-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div className="course-card-img" style={{ height: '160px', position: 'relative' }}>
                      {c.courseDetails?.presentation_image ? (
                        <img src={`${BASE_URL}/${c.courseDetails.presentation_image}`} alt={c.courseDetails?.title || 'Course'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="course-card-img-placeholder" style={{ fontSize: '3rem' }}>📚</div>
                      )}
                      
                      {/* Remove Button Overlay */}
                      <button 
                        onClick={() => remove(c.wishlistItemId)} 
                        style={{ 
                          position: 'absolute', top: '10px', right: '10px', 
                          background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', 
                          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          color: '#e63946', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          transition: 'transform 0.2s', zIndex: 2
                        }} 
                        title="Remove from Wishlist"
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <span style={{ marginTop: '2px' }}>🗑</span>
                      </button>
                    </div>
                    
                    <div className="course-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, padding: '1.25rem' }}>
                      <span className="badge badge-navy" style={{ alignSelf: 'flex-start', fontSize: '0.65rem', padding: '0.2rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {c.enroll_type.replace('-', ' ')}
                      </span>
                      
                      <h3 className="course-card-title" style={{ fontSize: '1.05rem', lineHeight: '1.4', marginBottom: 'auto', fontWeight: '700', color: 'var(--navy)' }}>
                        {c.courseDetails?.title || 'Course'}
                      </h3>
                      
                      <div style={{ marginTop: '0.75rem' }}>
                        <button 
                          className="btn btn-gold btn-full" 
                          disabled={isMoving}
                          onClick={() => handleOpenPlanModal(c)}
                          style={{ padding: '0.6rem', fontWeight: 'bold' }}
                        >
                          {isMoving ? 'Moving...' : '🛒 Move to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Plan Selection Modal */}
      {selectedWishlistItem && (
        console.log("DEBUG WISHLIST ITEM:", selectedWishlistItem),
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Select a Plan</h3>
              <button onClick={() => setSelectedWishlistItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--gray-500)' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {fetchingPlans ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Loading plans...</div>
              ) : fetchedPlans.length > 0 ? (
                fetchedPlans.map(plan => (
                  <div 
                    key={plan.planId || plan._id} 
                    style={{ border: '1px solid var(--gray-200)', padding: '1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => {
                      handleMoveToCart(selectedWishlistItem.wishlistItemId, plan.planId || plan._id);
                      setSelectedWishlistItem(null);
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '.9rem' }}>{plan.duration}</div>
                      {plan.strike_price && <del style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>₹{plan.strike_price}</del>}
                    </div>
                    <div style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.1rem' }}>₹{plan.original_price}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--gray-500)', fontSize: '.9rem', textAlign: 'center', padding: '1rem' }}>
                  No plans available for this course.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
