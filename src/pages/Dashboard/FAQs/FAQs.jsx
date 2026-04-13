import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const CATEGORIES = ['All', 'Courses', 'Payments', 'Technical', 'Account'];

const FAQS = [
  { id: 1, q: 'How long do I have access to a course after purchasing?',   a: 'Once you purchase a course, you get access for 1 year from the date of purchase. After that, you can renew at a discounted rate.', cat: 'Courses'   },
  { id: 2, q: 'Can I download course materials for offline use?',           a: 'Yes! Notes and resources attached to a course can be downloaded from the My Downloads section in your profile.',                           cat: 'Courses'   },
  { id: 3, q: 'What payment methods are accepted?',                         a: 'We accept UPI, Credit/Debit Cards, Net Banking, and popular wallets. All transactions are secured by industry-standard encryption.',           cat: 'Payments'  },
  { id: 4, q: 'Is GST included in the course price?',                       a: 'Yes, all prices displayed on the platform are inclusive of 18% GST. Your invoice will reflect the tax breakdown.',                            cat: 'Payments'  },
  { id: 5, q: 'What is the refund policy?',                                  a: 'We offer a 7-day no-questions-asked refund policy from the date of purchase, provided less than 20% of the course has been consumed.',         cat: 'Payments'  },
  { id: 6, q: 'The video is buffering or not playing. What do I do?',        a: 'Try refreshing the page, clearing your browser cache, or switching to a different browser. If the issue persists, contact our support team.',  cat: 'Technical' },
  { id: 7, q: 'Can I access courses on mobile devices?',                    a: 'Absolutely. Our platform is fully responsive and works on iOS and Android browsers. A dedicated app is coming soon!',                          cat: 'Technical' },
  { id: 8, q: 'How do I change my registered email address?',               a: 'You can update your email from Profile → Personal Info. A verification link will be sent to your new email to confirm the change.',           cat: 'Account'   },
  { id: 9, q: 'I forgot my password. How do I reset it?',                   a: 'Click on "Forgot Password" on the login page and enter your registered email. You\'ll receive a link to reset your password.',                 cat: 'Account'   },
  { id:10, q: 'How do I refer a friend and earn rewards?',                  a: 'Go to Refer & Earn in the menu, copy your unique referral link, and share it. You earn credits when your friend makes their first purchase.',  cat: 'Account'   },
];

export default function FAQs() {
  const navigate = useNavigate();
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const visible = FAQS.filter(f =>
    (cat === 'All' || f.cat === cat) &&
    (f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {/* Hero */}
          <div style={{ background: 'linear-gradient(135deg,var(--navy),var(--navy-mid))', borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>❓</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,1.9rem)', color: 'var(--cream)', marginBottom: '.5rem' }}>Frequently Asked Questions</h1>
            <p style={{ fontSize: '.875rem', color: 'rgba(255,247,224,.65)', marginBottom: '1.25rem' }}>Find answers to the most common questions</p>
            <input
              style={{ width: '100%', maxWidth: 480, padding: '.72rem 1.1rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '.9rem', fontFamily: 'var(--font-body)', outline: 'none' }}
              placeholder="Search FAQs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="tabs">
            {CATEGORIES.map(c => (
              <button key={c} className={`tab-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try a different keyword or category.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {visible.map(f => (
                <div key={f.id} className="card" style={{ cursor: 'pointer', overflow: 'visible' }} onClick={() => setOpen(open === f.id ? null : f.id)}>
                  <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', lineHeight: 1.4 }}>{f.q}</div>
                      <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: open === f.id ? 'var(--navy)' : 'var(--gray-100)', color: open === f.id ? 'var(--cream)' : 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, transition: 'all .18s' }}>
                        {open === f.id ? '▲' : '▼'}
                      </div>
                    </div>
                    {open === f.id && (
                      <div style={{ marginTop: '.85rem', paddingTop: '.85rem', borderTop: '1px solid var(--gray-100)', fontSize: '.875rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                        {f.a}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still need help */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy)', marginBottom: '.25rem' }}>Still have questions?</div>
                <div style={{ fontSize: '.875rem', color: 'var(--gray-500)' }}>Our support team is happy to help you out.</div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard/help')}>📬 Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
