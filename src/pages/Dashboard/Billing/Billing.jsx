import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import Loader from '../../../components/common/Loader';
import {
  getUserBillings,
  getBillingDetails,
  getInvoiceUrl
} from '../../../api/billing/billingApi';
import { formatDate } from '../../../utils/formatDate';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const TABS = ['All', 'active', 'pending', 'failed', 'refunded'];

const TAB_LABELS = {
  All: 'All',
  active: 'Active',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded'
};

function statusStyle(s = '') {
  const k = s.toLowerCase();
  if (k === 'active' || k === 'paid') {
    return { background: 'var(--success-bg)', color: 'var(--success)' };
  }
  if (k === 'pending') {
    return { background: 'var(--warning-bg)', color: 'var(--warning)' };
  }
  if (k === 'failed') {
    return { background: 'var(--error-bg)', color: 'var(--error)' };
  }
  if (k === 'refunded') {
    return { background: '#f3e8ff', color: '#7c3aed' };
  }
  return { background: 'var(--gray-100)', color: 'var(--gray-500)' };
}

const pick = (obj, ...keys) => {
  for (const k of keys) {
    if (obj?.[k] != null && obj[k] !== '') return obj[k];
  }
  return null;
};

function DetailModal({ billing, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const billingId = billing.billing_id || billing.id || billing._id;

  useEffect(() => {
    getBillingDetails(billingId)
      .then((r) => { if (r?.statusCode === 200) setDetail(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [billingId]);

  const info = { ...billing, ...(detail || {}) };
  const invoiceUrl = getInvoiceUrl(billingId);
  const status = pick(info, 'status', 'billing_status', 'payment_status') || 'unknown';

  const rows = [
    { label: 'Billing ID', value: billingId },
    { label: 'Course / Item', value: pick(info, 'course_title', 'title', 'course', 'item_name', 'product_name') || info.courseDetails?.title },
    { label: 'Amount', value: info.amount ? `₹${Number(info.amount).toLocaleString('en-IN')}` : null },
    { label: 'Discount', value: info.discount ? `₹${Number(info.discount).toLocaleString('en-IN')}` : null },
    { label: 'Total Paid', value: info.total_paid ? `₹${Number(info.total_paid).toLocaleString('en-IN')}` : null },
    { label: 'Status', value: status },
    { label: 'Payment Method', value: pick(info, 'payment_method', 'paymentMethod') },
    { label: 'Transaction ID', value: pick(info, 'transaction_id', 'payment_id', 'txn_id', 'razorpay_payment_id', 'stripe_payment_id') },
    { label: 'Order ID', value: pick(info, 'order_id', 'razorpay_order_id') },
    { label: 'Date', value: formatDate(pick(info, 'createdAt', 'created_at', 'date', 'payment_date')) }
  ].filter((r) => r.value != null && r.value !== '—');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', maxWidth: 540, width: '92%', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', margin: 0 }}>Billing Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
        </div>
        {loading ? <Loader /> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem', marginBottom: '1.25rem' }}>
              {rows.map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '.65rem .85rem' }}>
                  <div style={{ fontSize: '.65rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>{label}</div>
                  <div style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--navy)', wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>
            <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>📄 Download Invoice</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function Billing() {
  const navigate = useNavigate();
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState({ total_spent: 0, paid: 0, pending: 0, failed: 0, refunded: 0 });

  // EXACT SYNCED GRID DEFINITION
  const GRID_LAYOUT = '1.2fr 2.5fr 1fr 1fr 1.2fr 1.8fr';

  useEffect(() => { fetchBillings(tab); }, [tab]);

  const fetchBillings = async (status) => {
    setLoading(true);
    try {
      const r = await getUserBillings(status === 'All' ? '' : status);
      if (r?.statusCode === 200) {
        const billingData = Array.isArray(r.data) ? r.data : Array.isArray(r.data?.billings) ? r.data.billings : [];
        setBillings(billingData);
        if (r.data?.summary) {
          setSummary(r.data.summary);
        } else {
          const getCount = (s) => billingData.filter(b => (pick(b, 'status', 'billing_status', 'payment_status') || '').toLowerCase() === s).length;
          setSummary({ total_spent: 0, paid: getCount('paid'), pending: getCount('pending'), failed: getCount('failed'), refunded: getCount('refunded') });
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="page-section-head">
            <h1 className="page-section-title">💳 Billing & Payments</h1>
          </div>

          <div className="tabs" style={{ marginBottom: '1rem' }}>
            {TABS.map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {TAB_LABELS[t]} <span className="tab-badge">{t === 'All' ? billings.length : summary[t] || 0}</span>
              </button>
            ))}
          </div>

          {loading ? <Loader /> : billings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧾</div>
              <h3>No transactions yet</h3>
            </div>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: GRID_LAYOUT,
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--gray-100)',
                background: 'var(--gray-50)',
                fontWeight: 700,
                fontSize: '.7rem',
                color: 'var(--gray-400)',
                textTransform: 'uppercase',
                letterSpacing: '.05em'
              }}>
                <span>Billing ID</span>
                <span>Course</span>
                <span style={{ textAlign: 'center' }}>Amount</span>
                <span style={{ textAlign: 'center' }}>Status</span>
                <span style={{ textAlign: 'center' }}>Date</span>
                <span style={{ textAlign: 'right' }}>Action</span>
              </div>

              {billings.map((b, i) => {
                const billingId = b.billing_id || b.id || b._id;
                const status = pick(b, 'status', 'billing_status', 'payment_status') || 'unknown';
                const amount = Number(b.amount) || 0;
                const course = pick(b, 'course_title', 'title', 'course', 'item_name', 'product_name') || b.courseDetails?.title || '—';
                const dateStr = formatDate(pick(b, 'createdAt', 'created_at', 'date', 'payment_date') || '');

                return (
                  <div key={billingId || i}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: GRID_LAYOUT,
                      gap: '1rem',
                      padding: '1.25rem',
                      alignItems: 'center'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--navy)' }}>
                        {billingId ? billingId.slice(0, 8) + '...' : '—'}
                      </div>

                      <div style={{ fontSize: '.85rem', color: 'var(--gray-700)' }}>
                        {course}
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--navy)', textAlign: 'center' }}>
                        {amount > 0 ? `₹${amount.toLocaleString('en-IN')}` : '—'}
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <span style={{ ...statusStyle(status), fontSize: '.7rem', fontWeight: 700, padding: '.25rem .6rem', borderRadius: 'var(--radius-full)' }}>
                          {status}
                        </span>
                      </div>

                      <div style={{ fontSize: '.8rem', color: 'var(--gray-500)', textAlign: 'center' }}>
                        {dateStr}
                      </div>

                      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'end' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(b)}>📄 Details</button>
                        <a href={getInvoiceUrl(billingId)} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm" style={{ textDecoration: 'none' }}>⬇ Invoice</a>
                      </div>
                    </div>
                    {i < billings.length - 1 && <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 1.25rem' }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {selected && <DetailModal billing={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}