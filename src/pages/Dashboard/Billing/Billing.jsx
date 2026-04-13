import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const TABS = ['All', 'Paid', 'Pending', 'Refunded'];

const MOCK_PAYMENTS = [
  { id: 'INV-2025031', course: 'Constitutional Law – Complete Series', amount: 4999, status: 'Paid',     date: '18 Mar 2025', method: 'UPI',      txn: 'TXN8823991' },
  { id: 'INV-2025028', course: 'IPC & Criminal Law Mastery',          amount: 3499, status: 'Paid',     date: '5 Nov 2024',  method: 'Card',     txn: 'TXN7734821' },
  { id: 'INV-2025035', course: 'CPC Civil Procedure Code',            amount: 2999, status: 'Pending',  date: '20 Feb 2025', method: 'Netbanking',txn: 'TXN9901122' },
  { id: 'INV-2024019', course: 'Evidence Act Deep Dive',              amount: 2499, status: 'Refunded', date: '1 Aug 2023',  method: 'UPI',      txn: 'TXN5511038' },
  { id: 'INV-2025041', course: 'Jurisprudence & Legal Theory',        amount: 1999, status: 'Paid',     date: '3 Mar 2025',  method: 'Card',     txn: 'TXN2291047' },
];

function statusStyle(s) {
  if (s === 'Paid')     return { bg: 'var(--success-bg)', color: 'var(--success)' };
  if (s === 'Pending')  return { bg: 'var(--warning-bg)', color: 'var(--warning)' };
  if (s === 'Refunded') return { bg: 'var(--error-bg)',   color: 'var(--error)'   };
  return {};
}

export default function Billing() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');

  const filtered = MOCK_PAYMENTS.filter(p => tab === 'All' || p.status === tab);
  const totalSpent = MOCK_PAYMENTS.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">💳 Billing & Payments</h1>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Spent',       value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💸', color: 'var(--navy)' },
              { label: 'Paid Orders',        value: MOCK_PAYMENTS.filter(p => p.status === 'Paid').length,     icon: '✅', color: 'var(--success)' },
              { label: 'Pending',            value: MOCK_PAYMENTS.filter(p => p.status === 'Pending').length,  icon: '⏳', color: 'var(--warning)' },
              { label: 'Refunds',            value: MOCK_PAYMENTS.filter(p => p.status === 'Refunded').length, icon: '↩️', color: 'var(--error)'   },
            ].map(s => (
              <div key={s.label} className="card">
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                  <div style={{ fontSize: '1.6rem' }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginTop: '.15rem' }}>{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tabs">
            {TABS.map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}
                <span className="tab-badge">{t === 'All' ? MOCK_PAYMENTS.length : MOCK_PAYMENTS.filter(p => p.status === t).length}</span>
              </button>
            ))}
          </div>

          <div className="card">
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 0.7fr 0.8fr 0.8fr auto', gap: '1rem', padding: '.75rem 1.25rem', borderBottom: '1px solid var(--gray-100)', fontSize: '.73rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              <span>Invoice</span><span>Course</span><span>Amount</span><span>Status</span><span>Date</span><span>Action</span>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🧾</div>
                <h3>No transactions</h3>
                <p>Your payment history will appear here.</p>
              </div>
            ) : filtered.map((p, i) => {
              const ss = statusStyle(p.status);
              return (
                <div key={p.id}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 0.7fr 0.8fr 0.8fr auto', gap: '1rem', padding: '.9rem 1.25rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--navy)' }}>{p.id}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--gray-400)' }}>{p.method}</div>
                    </div>
                    <div style={{ fontSize: '.855rem', color: 'var(--gray-700)', lineHeight: 1.3 }}>{p.course}</div>
                    <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--navy)' }}>₹{p.amount.toLocaleString('en-IN')}</div>
                    <div><span style={{ ...ss, fontSize: '.72rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: 'var(--radius-full)' }}>{p.status}</span></div>
                    <div style={{ fontSize: '.78rem', color: 'var(--gray-500)' }}>{p.date}</div>
                    <button className="btn btn-outline btn-sm">📄 Receipt</button>
                  </div>
                  {i < filtered.length - 1 && <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 1.25rem' }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
