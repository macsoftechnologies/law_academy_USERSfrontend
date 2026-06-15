import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollCourse, verifyCoupon, calculatePrice } from '../../api/enroll/enrollApi_addition';

export default function EnrollModal({ plan, courseTitle, enroll_type, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // stores { code, discount } just for UI or uses priceData
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [calculatingPrice, setCalculatingPrice] = useState(true);

  // Load initial price from API
  useEffect(() => {
    handleCalculatePrice('');
  }, [plan]);

  const handleCalculatePrice = async (couponToApply = '') => {
    try {
      setCalculatingPrice(true);
      setCouponError(null);
      const userStr = localStorage.getItem('user');
      const parsedUser = userStr ? JSON.parse(userStr) : {};
      const userId = localStorage.getItem('userId') || parsedUser?._id || parsedUser?.id;

      const payload = {
        userId: userId,
        course_title: courseTitle,
      };
      
      if (plan?.planId || plan?._id) {
        payload.planId = plan.planId || plan._id;
      }

      if (couponToApply) {
        payload.coupon_code = couponToApply;
      }

      const finalEnrollType = enroll_type || plan?.enroll_type;
      if (finalEnrollType) {
        payload.enroll_type = finalEnrollType;
      }

      const res = await calculatePrice(payload);

      if (res?.statusCode === 200 && res.data) {
        setPriceData(res.data);
        if (couponToApply) {
          if (res.data.coupon_applied) {
            setAppliedCoupon({ code: res.data.coupon_code, amount: res.data.discount_amount });
          } else {
            setCouponError('Invalid or expired coupon.');
            setAppliedCoupon(null);
          }
        } else {
          setAppliedCoupon(null);
        }
      } else {
        if (couponToApply) {
          setCouponError(res?.message || 'Failed to apply coupon.');
          setAppliedCoupon(null);
        } else {
          setError(res?.message || 'Failed to calculate price.');
        }
      }
    } catch (err) {
      if (couponToApply) {
        setCouponError(err?.response?.data?.message || 'Failed to apply coupon.');
        setAppliedCoupon(null);
      } else {
        setError(err?.response?.data?.message || 'Failed to calculate price from server.');
      }
      console.error(err);
    } finally {
      setCalculatingPrice(false);
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    handleCalculatePrice(''); // Recalculate without coupon
  };

  if (!plan) return null;

  const handleEnroll = async () => {
    setError('');
    setLoading(true);

    const finalEnrollType = enroll_type || plan?.enroll_type;
    const payload = {
      payment_id: 'TEST_TXN_000001', // static value for testing
      enroll_type: finalEnrollType,
      planId: plan.planId || plan._id || null,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      final_amount: priceData?.final_price || 0,
      course_title: courseTitle,
    };

    try {
      const res = await enrollCourse(payload);

      if (res?.statusCode === 200) {
        setSuccess(true);
        if (onSuccess) onSuccess(res.data);
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setError(res?.message || 'Enrollment failed. Please try again.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <div className="section-eyebrow" style={{ marginBottom: '.2rem' }}>Enrollment</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--navy)' }}>
              {courseTitle}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && !success && (
            <div style={{ padding: '0.8rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div className="result-icon">🎉</div>
              <h3 style={{ color: 'var(--navy)', marginBottom: '.4rem' }}>Enrolled Successfully!</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: '1rem' }}>
                You're now enrolled in <strong>{courseTitle}</strong>.<br />
                Head to your dashboard to start learning.
              </p>
              <button className="btn btn-gold" onClick={onClose}>Go to Dashboard</button>
            </div>
          ) : (
            <>
              {/* Single Subject Warning */}
              {(enroll_type === 'subject-wise' || plan?.enroll_type === 'subject-wise') && (
                <div style={{ padding: '0.8rem', background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d', borderRadius: 'var(--radius-md)', marginBottom: '1.1rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Please Note</strong>
                    You are purchasing <strong>only this single subject</strong>, not the full course.
                  </div>
                </div>
              )}

              {/* Plan summary */}
              <div style={{
                background: 'var(--cream)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                marginBottom: '1.1rem',
                position: 'relative'
              }}>
                {calculatingPrice && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)', zIndex: 10 }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--gold)' }}>Calculating...</span>
                  </div>
                )}
                {[
                  ['Plan', plan.duration],
                  ['Course Price', (
                    <>
                      {plan.strike_price && (
                        <del style={{ opacity: .6, marginRight: '.35rem', fontSize: '.85rem' }}>
                          ₹{plan.strike_price}
                        </del>
                      )}
                      <strong>₹{priceData?.original_price || plan.original_price}</strong>
                    </>
                  )],
                  ...(priceData?.handling_fee ? [['Handling Fee', `₹${priceData.handling_fee}`]] : []),
                  ...(priceData?.discount_amount > 0 ? [['Discount', <span style={{ color: 'green' }}>-₹{priceData.discount_amount}</span>]] : []),
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '.4rem 0',
                      borderBottom: '1px solid rgba(200,146,42,.15)'
                    }}
                  >
                    <span style={{ fontSize: '.82rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                      {label}
                    </span>
                    <span style={{ fontSize: '.88rem', color: 'var(--navy)', fontWeight: 600 }}>
                      {val}
                    </span>
                  </div>
                ))}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '.65rem',
                  marginTop: '.15rem'
                }}>
                  <span style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--navy)' }}>
                    Total
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--gold)' }}>
                    ₹{priceData?.final_price !== undefined ? priceData.final_price : (Number(plan.original_price) + Number(plan.handling_fee || 0))}
                  </span>
                </div>
              </div>

              {/* Coupon field */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.3rem' }}>Discount Coupon</label>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon || couponLoading || calculatingPrice}
                    style={{ flex: 1, padding: '.5rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}
                  />
                  {appliedCoupon ? (
                    <button className="btn btn-outline btn-sm" onClick={handleRemoveCoupon} style={{ color: 'var(--error)' }} disabled={calculatingPrice}>Remove</button>
                  ) : (
                    <button className="btn btn-gold btn-sm" onClick={() => {
                      if (!couponCode.trim()) return;
                      setCouponLoading(true);
                      handleCalculatePrice(couponCode);
                    }} disabled={couponLoading || calculatingPrice || !couponCode.trim()}>{couponLoading ? '...' : 'Apply'}</button>
                  )}
                </div>
                {couponError && <div style={{ color: 'var(--error)', fontSize: '.8rem', marginTop: '.3rem' }}>{couponError}</div>}
                {appliedCoupon && <div style={{ color: 'green', fontSize: '.85rem', marginTop: '.3rem' }}>✓ Applied: {appliedCoupon.code}</div>}
              </div>

              <div
                className="modal-footer"
                style={{ padding: 0, justifyContent: 'stretch', gap: '.65rem' }}
              >
                <button
                  className="btn btn-outline btn-full"
                  onClick={onClose}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-gold btn-full"
                  onClick={handleEnroll}
                  disabled={loading || calculatingPrice || !priceData}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Enrolling…' : 'Confirm Enrollment'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}