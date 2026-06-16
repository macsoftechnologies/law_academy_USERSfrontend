import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getNoteOrders } from '../../api/notes/notesApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const STATUS_STYLES = {
  delivered:  { color: '#16a34a', bg: '#dcfce7' },
  pending:    { color: '#d97706', bg: '#fef9c3' },
  processing: { color: '#2563eb', bg: '#dbeafe' },
  shipped:    { color: '#7c3aed', bg: '#ede9fe' },
  cancelled:  { color: '#dc2626', bg: '#fee2e2' },
};
const st = (s) => STATUS_STYLES[s?.toLowerCase()] || { color: 'var(--gray-500)', bg: 'var(--gray-100)' };

const Row = ({ label, value }) => value ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '.1rem' }}>
    <span style={{ fontSize: '.65rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>{label}</span>
    <span style={{ fontSize: '.82rem', color: 'var(--navy)', fontWeight: 600 }}>{value}</span>
  </div>
) : null;

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNoteOrders()
      .then(r => { if (r?.statusCode === 200) setOrders(Array.isArray(r.data) ? r.data : []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              📦 My Printed Note Orders
              {!loading && <span className="page-section-count">{orders.length}</span>}
            </h1>
          </div>

          {loading ? <Loader /> : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No orders yet</h3>
              <p>You haven't ordered any printed notes yet.</p>
              <button className="btn btn-gold" style={{ marginTop: '1rem' }} onClick={() => navigate('/notes/printed')}>
                Browse Printed Notes
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => {
                const note   = order.notes_id?.[0] || {};
                const addr   = order.address_id?.[0] || null;
                const imgSrc = note.presentation_image ? `${BASE_URL}/${note.presentation_image}` : null;
                const date   = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—';
                const s = st(order.status);

                return (
                  <div key={order._id} className="card">
                    <div className="card-body" style={{ padding: '1.25rem' }}>

                      {/* ── Status bar across top ── */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--gray-100)' }}>
                        <span style={{ fontSize: '.75rem', fontFamily: 'monospace', color: 'var(--gray-500)' }}>
                          #{order.order_id || order._id}
                        </span>
                        <span style={{ background: s.bg, color: s.color, fontSize: '.7rem', fontWeight: 800, padding: '.2rem .6rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                          ● {order.status || 'Pending'}
                        </span>
                      </div>

                      {/* ── Main 2-col layout: LEFT image+title | RIGHT all details ── */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>

                        {/* LEFT — image + note info */}
                        <div style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start' }}>
                          <div style={{ width: 64, height: 80, flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {imgSrc
                              ? <img src={imgSrc} alt={note.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                              : null}
                            <span style={{ fontSize: '1.4rem', display: imgSrc ? 'none' : 'flex' }}>🖨</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h4 style={{ margin: '0 0 .25rem', fontSize: '.95rem', color: 'var(--navy)', fontWeight: 800, lineHeight: 1.3 }}>
                              {note.title || '—'}
                            </h4>
                            {note.sub_title && (
                              <p style={{ fontSize: '.75rem', color: 'var(--gray-500)', margin: '0 0 .6rem', lineHeight: 1.4 }}>{note.sub_title}</p>
                            )}
                            <div style={{ fontSize: '.72rem', color: 'var(--gray-400)' }}>📅 {date}</div>
                          </div>
                        </div>

                        {/* RIGHT — all details in a 2-col sub-grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem .5rem', padding: '.85rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--gold)' }}>
                          <Row label="Amount" value={order.final_amount != null ? `₹${order.final_amount}` : null} />
                          <Row label="Payment" value={order.payment_method?.toUpperCase()} />
                          <Row label="Coupon" value={order.coupon_code || null} />
                          <Row label="Date" value={date} />
<Row label="Plan Price"    value={order.planId?.[0]?.original_price ? `₹${order.planId[0].original_price}` : null} />
  {/* <Row label="Duration"      value={order.planId?.[0]?.duration || null} /> */}
  <Row label="Handling Fee"  value={order.planId?.[0]?.handling_fee ? `₹${order.planId[0].handling_fee}` : null} />
  <Row label="Discount"      value={order.planId?.[0]?.discount_percent ? `${order.planId[0].discount_percent}% Off` : null} />
                          {/* Address — spans full width */}
                          {addr && (
                            <div style={{ gridColumn: '1 / -1', paddingTop: '.5rem', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '.1rem' }}>
                              <span style={{ fontSize: '.65rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, marginBottom: '.2rem' }}>
                                📦 Shipping Address
                              </span>
                              <span style={{ fontSize: '.82rem', color: 'var(--navy)', fontWeight: 700 }}>{addr.full_name}</span>
                              <span style={{ fontSize: '.78rem', color: 'var(--gray-600)' }}>{addr.address}</span>
                              <span style={{ fontSize: '.78rem', color: 'var(--gray-600)' }}>
                                {addr.city}{addr.region ? `, ${addr.region}` : ''} — {addr.zip_code}
                              </span>
                              <span style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{addr.country}</span>
                            </div>
                          )}
                        </div>

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