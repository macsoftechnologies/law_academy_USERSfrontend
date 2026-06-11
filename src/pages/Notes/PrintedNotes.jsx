import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getPrintedNotes, addNoteOrder } from '../../api/notes/notesApi';
import { getUserAddresses, addAddress, updateAddress, deleteAddress } from '../../api/Profile/profileApi';
import api from "../../api/axios"; 
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const EMPTY_ADDR = { full_name: '', address: '', city: '', region: '', zip_code: '', country: 'India' };

// ── Helpers ──────────────────────────────────────────────────────────────
const verifyCoupon = async (code) => {
  const res = await api.get(`/coupons?page=1&limit=100`);
  if (res.data?.statusCode === 200) {
    const coupon = res.data.data.find(
      c => c.coupon_code.toUpperCase() === code.toUpperCase() && 
      c.status.toLowerCase() === 'active'
    );
    return coupon || null;
  }
  return null;
};

// ── Address Form Component ──────────────────────────────────────────────
function AddressForm({ initial = EMPTY_ADDR, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inputStyle = {
    width: '100%', padding: '.5rem .7rem',
    border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
    fontSize: '.875rem', boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: '.75rem', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '.2rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
      {[
        { k: 'full_name',  label: 'Full Name *',   placeholder: 'Your full name' },
        { k: 'address',    label: 'Address *',      placeholder: 'Street / Colony' },
        { k: 'city',       label: 'City *',          placeholder: 'City' },
        { k: 'region',     label: 'State / Region *',placeholder: 'State' },
        { k: 'zip_code',   label: 'PIN Code *',      placeholder: '000000' },
        { k: 'country',    label: 'Country',         placeholder: 'India' },
      ].map(({ k, label, placeholder }) => (
        <div key={k}>
          <label style={labelStyle}>{label}</label>
          <input
            type="text"
            placeholder={placeholder}
            value={form[k]}
            onChange={set(k)}
            style={inputStyle}
          />
        </div>
      ))}
      <div style={{ display: 'flex', gap: '.65rem', marginTop: '.25rem' }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel} disabled={saving}>Cancel</button>
        <button
          className="btn btn-gold"
          style={{ flex: 1 }}
          disabled={saving || !form.full_name.trim() || !form.address.trim() || !form.city.trim() || !form.zip_code.trim()}
          onClick={() => onSave(form)}
        >
          {saving ? 'Saving…' : 'Save Address'}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────
export default function PrintedNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Order modal state
  const [orderNote, setOrderNote] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [payMethod, setPayMethod] = useState('card');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [addrView, setAddrView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    getPrintedNotes()
      .then(r => { if (r?.statusCode === 200) setNotes(Array.isArray(r.data) ? r.data : []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openOrderModal = (note) => {
    setOrderNote(note);
    setOrderDone(null);
    setOrderError(null);
    setAddrError(null);
    setAddrView('list');
    setSelectedAddrId(null);
    setAddrLoading(true);
    
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError(null);

    getUserAddresses()
      .then(r => {
        const list = Array.isArray(r?.data) ? r.data : [];
        setAddresses(list);
        if (list.length > 0) setSelectedAddrId(list[0].address_id || list[0].id || list[0]._id);
      })
      .catch(() => setAddresses([]))
      .finally(() => setAddrLoading(false));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const coupon = await verifyCoupon(couponCode);
      if (coupon) {
        setAppliedCoupon(coupon);
        setCouponError(null);
      } else {
        setCouponError('Invalid or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to verify coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSaveNewAddress = async (form) => {
    setAddrSaving(true);
    setAddrError(null);
    try {
      const res = await addAddress(form);
      if (res?.statusCode === 200) {
        const r2 = await getUserAddresses();
        const list = Array.isArray(r2?.data) ? r2.data : [];
        setAddresses(list);
        const newId = res.data?.address_id || res.data?.id || (list.length && (list[list.length - 1].address_id || list[list.length - 1].id));
        if (newId) setSelectedAddrId(newId);
        setAddrView('list');
      } else {
        setAddrError(res?.message || 'Failed to add address.');
      }
    } catch {
      setAddrError('Failed to add address. Please try again.');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleUpdateAddress = async (form) => {
    setAddrSaving(true);
    setAddrError(null);
    try {
      const res = await updateAddress({ address_id: editingAddr.address_id || editingAddr.id, ...form });
      if (res?.statusCode === 200) {
        const r2 = await getUserAddresses();
        const list = Array.isArray(r2?.data) ? r2.data : [];
        setAddresses(list);
        setAddrView('list');
        setEditingAddr(null);
      } else {
        setAddrError(res?.message || 'Failed to update address.');
      }
    } catch {
      setAddrError('Failed to update address.');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (addr) => {
    const id = addr.address_id || addr.id;
    try {
      await deleteAddress(id);
      const updated = addresses.filter(a => (a.address_id || a.id) !== id);
      setAddresses(updated);
      if (selectedAddrId === id) setSelectedAddrId(updated[0]?.address_id || updated[0]?.id || null);
    } catch {
      setAddrError('Failed to delete address.');
    }
  };

  const handleOrder = async () => {
    if (!orderNote || !selectedAddrId) return;
    setOrdering(true);
    setOrderError(null);
    try {
      const res = await addNoteOrder({
        notes_id:      orderNote.notes_id,
        address_id:     selectedAddrId,
        payment_id:     `PAY-${Date.now()}`,
        coupon_id:      appliedCoupon ? appliedCoupon.couponId : null,
        coupon_code:    appliedCoupon ? appliedCoupon.coupon_code : null,
        final_amount:   finalPrice,
        payment_method: payMethod,
      });
      if (res?.statusCode === 200) {
        setOrderDone(res.data?.order_id || 'success');
      } else {
        setOrderError(res?.message || 'Order failed. Please try again.');
      }
    } catch {
      setOrderError('Order failed. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const plan = orderNote?.availablePlans?.[0] || null;
  const originalPrice = plan ? parseFloat(plan.original_price || 0) : 0;
  const strikePrice = plan ? parseFloat(plan.strike_price || 0) : 0;
  const handlingFee = plan ? parseFloat(plan.handling_fee || 0) : 0;
  
  const discount = appliedCoupon ? parseFloat(appliedCoupon.offer_amount || 0) : 0;
  const finalPrice = Math.max(0, (originalPrice + handlingFee) - discount);

  const labelStyle = { fontSize: '.75rem', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '.2rem' };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              🖨 Printed Notes
              {!loading && <span className="page-section-count">{notes.length}</span>}
            </h1>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/notes/orders')} style={{ fontWeight: 600 }}>
              📦 My Orders
            </button>
          </div>

          {loading ? <Loader /> : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🖨</div>
              <h3>No printed notes available</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '.875rem' }}>Printed notes will appear here once available.</p>
              <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/notes')}>
                View Digital Notes →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notes.map(note => {
                const imgSrc   = note.presentation_image ? `${BASE_URL}/${note.presentation_image}` : null;
                const itemPlan = note.availablePlans?.[0] || null;

                return (
                  <div key={note.notes_id} className="card">
                    <div className="card-body" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', padding: '1.25rem' }}>
                      <div style={{ width: 90, height: 110, flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {imgSrc
                          ? <img src={imgSrc} alt={note.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '2rem' }}>🖨</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '.3rem' }}>
                          <span className="badge badge-navy" style={{ fontSize: '.65rem' }}>🖨 Print Available</span>
                          {itemPlan ? (
                            <>
                              <span className="badge badge-gold" style={{ fontSize: '.65rem', fontWeight: 'bold' }}>₹{itemPlan.original_price}</span>
                              {itemPlan.strike_price && (
                                <span style={{ fontSize: '.75rem', textDecoration: 'line-through', color: 'var(--gray-400)' }}>₹{itemPlan.strike_price}</span>
                              )}
                              {itemPlan.discount_percent && (
                                <span style={{ fontSize: '.7rem', color: 'green', fontWeight: 600 }}>({itemPlan.discount_percent}% Off)</span>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '.75rem', color: 'var(--error)' }}>Price Unavailable</span>
                          )}
                        </div>
                        <h3 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem', margin: '0 0 .2rem' }}>{note.title}</h3>
                        {note.sub_title && (
                          <p style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginBottom: '.5rem' }}>{note.sub_title}</p>
                        )}
                        
                        {note.about_book?.sections?.length > 0 && (
                          <div style={{ marginBottom: '.75rem' }}>
                            {note.about_book.sections.slice(0, 1).map((sec, si) => (
                              <div key={si}>
                                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.15rem' }}>{sec.title}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem' }}>
                                  {sec.topics?.slice(0, 3).map((t, ti) => (
                                    <span key={ti} style={{ fontSize: '.65rem', background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '.15rem .45rem', borderRadius: 'var(--radius-full)' }}>{t}</span>
                                  ))}
                                  {sec.topics?.length > 3 && <span style={{ fontSize: '.65rem', color: 'var(--gray-400)' }}>+{sec.topics.length - 3} more</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <button 
  className="btn btn-gold btn-sm" 
  onClick={() => openOrderModal(note)}
>
  📦 Order Now
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

      {/* ── Order Modal ─────────────────────────────────────────────────────── */}
      {orderNote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', maxWidth: 500, width: '93%', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>

            {orderDone ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>✅</div>
                <h3 style={{ color: 'var(--navy)', marginBottom: '.4rem' }}>Order Placed!</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: '1rem' }}>
                  Order ID: <strong>{orderDone}</strong><br />
                  Your printed notes will be delivered soon.
                </p>
                {appliedCoupon && (
                  <div style={{ fontSize: '.85rem', color: 'var(--gray-600)', marginBottom: '.6rem' }}>
                    Coupon Applied: <strong>{appliedCoupon.coupon_code}</strong> (₹{appliedCoupon.offer_amount} off)
                  </div>
                )}
                <button className="btn btn-gold" onClick={() => setOrderNote(null)}>Done</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '.25rem' }}>
                  Order: {orderNote.title}
                </h3>
                <p style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                  Complete your shipping and payment details.
                </p>

                {/* ── Address Section ── */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--navy)' }}>📦 Shipping Address</span>
                    {addrView === 'list' && (
                      <button className="btn btn-outline btn-sm" onClick={() => { setAddrView('add'); setAddrError(null); }}>+ Add New</button>
                    )}
                  </div>
                  {addrError && <div style={{ color: 'var(--error)', fontSize: '.78rem', marginBottom: '.5rem' }}>⚠ {addrError}</div>}

                  {addrView === 'add' && <AddressForm onSave={handleSaveNewAddress} onCancel={() => setAddrView('list')} saving={addrSaving} />}
                  {addrView === 'edit' && editingAddr && (
                    <AddressForm 
                      initial={editingAddr} 
                      onSave={handleUpdateAddress} 
                      onCancel={() => { setAddrView('list'); setEditingAddr(null); }} 
                      saving={addrSaving} 
                    />
                  )}

                  {addrView === 'list' && (
                    addrLoading ? <div style={{ textAlign: 'center', fontSize: '.85rem' }}>Loading addresses…</div> : 
                    addresses.length === 0 ? <div className="card" style={{ padding: '1rem', textAlign: 'center', fontSize: '.82rem' }}>No addresses found. Add one to continue.</div> :
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      {addresses.map((addr) => {
                        const id = addr.address_id || addr.id || addr._id;
                        const isActive = selectedAddrId === id;
                        return (
                          <div 
                            key={id} 
                            onClick={() => setSelectedAddrId(id)}
                            style={{ 
                              border: `2px solid ${isActive ? 'var(--navy)' : 'var(--gray-200)'}`, 
                              borderRadius: 'var(--radius-md)', padding: '.7rem .9rem', cursor: 'pointer',
                              background: isActive ? 'rgba(212, 175, 55, 0.05)' : 'white'
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{addr.full_name} {isActive && '✓'}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{addr.address}, {addr.city}, {addr.zip_code}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Coupon Section ── */}
                {addrView === 'list' && (
                  <div style={{ marginBottom: '1.1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <label style={labelStyle}>Discount Coupon</label>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <input
                        type="text"
                        placeholder="Enter code (e.g. LAW)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={appliedCoupon || couponLoading}
                        style={{ flex: 1, padding: '.5rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.875rem' }}
                      />
                      {appliedCoupon ? (
                        <button className="btn btn-outline btn-sm" onClick={() => {setAppliedCoupon(null); setCouponCode('');}} style={{ color: 'var(--error)' }}>Remove</button>
                      ) : (
                        <button className="btn btn-gold btn-sm" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>{couponLoading ? '...' : 'Apply'}</button>
                      )}
                    </div>
                    {couponError && <div style={{ color: 'var(--error)', fontSize: '.7rem', marginTop: '.3rem' }}>{couponError}</div>}
                    {appliedCoupon && <div style={{ color: 'green', fontSize: '.75rem', marginTop: '.3rem', fontWeight: 600 }}>✓ Applied: ₹{appliedCoupon.offer_amount} off!</div>}
                  </div>
                )}

                {/* ── Summary & Payment ── */}
                {addrView === 'list' && (
                  <>
                    <div style={{ marginBottom: '1.1rem', borderTop: '1px solid var(--gray-100)', paddingTop: '.75rem' }}>
                      {strikePrice > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                          <span>M.R.P:</span> <span>₹{strikePrice}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                        <span>Price:</span> <span>₹{originalPrice}</span>
                      </div>
                      {handlingFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                          <span>Handling Fee:</span> <span>+ ₹{handlingFee}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: 'green' }}>
                          <span>Coupon Discount:</span> <span>- ₹{discount}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginTop: '.4rem' }}>
                        <span>Final Amount:</span> <span>₹{finalPrice}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.1rem' }}>
                      <label style={labelStyle}>Payment Method</label>
                      <select
                        value={payMethod}
                        onChange={e => setPayMethod(e.target.value)}
                        style={{ width: '100%', padding: '.55rem .75rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.875rem' }}
                      >
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="cod">Cash on Delivery</option>
                      </select>
                    </div>

                    {orderError && <div style={{ color: 'var(--error)', fontSize: '.8rem', marginBottom: '.5rem' }}>⚠ {orderError}</div>}

                    <div style={{ display: 'flex', gap: '.75rem' }}>
                      <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setOrderNote(null)}>Cancel</button>
                      <button className="btn btn-gold" style={{ flex: 1 }} disabled={!selectedAddrId || ordering} onClick={handleOrder}>
                        {ordering ? 'Placing…' : 'Place Order'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}