import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const MOCK_REFERRALS = [
  { name: 'Arun Kumar',   date: '12 Mar 2025', status: 'Purchased', earned: 250 },
  { name: 'Priya Sharma', date: '5 Mar 2025',  status: 'Signed Up', earned: 0   },
  { name: 'Raj Patel',    date: '20 Feb 2025', status: 'Purchased', earned: 250 },
];

export default function Referrals() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const refCode = user?.referral_code || 'MAKA-REF123';
  const refLink = `${window.location.origin}/register?ref=${refCode}`;

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const totalEarned = MOCK_REFERRALS.reduce((s, r) => s + r.earned, 0);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {/* Hero Banner */}
          <div style={{ background: 'linear-gradient(135deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%)', borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(200,146,42,.15)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(200,146,42,.1)' }} />
            <div style={{ fontSize: '3rem', marginBottom: '.5rem', position: 'relative' }}>🎁</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,2rem)', color: 'var(--cream)', marginBottom: '.4rem', position: 'relative' }}>Refer & Earn</h1>
            <p style={{ fontSize: '.9rem', color: 'rgba(255,247,224,.7)', maxWidth: 420, marginBottom: '1.5rem', position: 'relative' }}>
              Invite your friends to Rao's Law Academy and earn <strong style={{ color: 'var(--gold-light)' }}>₹250</strong> for every friend who purchases a course.
            </p>

            {/* Referral code */}
            <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', backdropFilter: 'blur(8px)', width: '100%', maxWidth: 420, position: 'relative' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,247,224,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.2rem' }}>Your Referral Code</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold-light)', letterSpacing: '.1em' }}>{refCode}</div>
              </div>
              <button className="btn btn-gold btn-sm" onClick={() => copy(refCode)}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[
                  { icon: '👥', label: 'Total Referred', value: MOCK_REFERRALS.length },
                  { icon: '✅', label: 'Converted',      value: MOCK_REFERRALS.filter(r => r.status === 'Purchased').length },
                  { icon: '💰', label: 'Total Earned',   value: `₹${totalEarned}` },
                ].map(s => (
                  <div key={s.label} className="card">
                    <div className="card-body" style={{ textAlign: 'center', padding: '1.25rem' }}>
                      <div style={{ fontSize: '1.6rem', marginBottom: '.3rem' }}>{s.icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--navy)', fontWeight: 800 }}>{s.value}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginTop: '.1rem' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Referral history */}
              <div className="card">
                <div className="card-header">Referral History</div>
                {MOCK_REFERRALS.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>No referrals yet</h3>
                    <p>Share your code and start earning!</p>
                  </div>
                ) : MOCK_REFERRALS.map((r, i) => (
                  <div key={r.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--navy)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.85rem', flexShrink: 0 }}>
                        {r.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--navy)' }}>{r.name}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{r.date}</div>
                      </div>
                      <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: 'var(--radius-full)', background: r.status === 'Purchased' ? 'var(--success-bg)' : 'var(--gold-pale)', color: r.status === 'Purchased' ? 'var(--success)' : 'var(--maroon)' }}>
                        {r.status}
                      </span>
                      <div style={{ fontWeight: 800, fontSize: '.9rem', color: r.earned ? 'var(--success)' : 'var(--gray-400)', minWidth: 55, textAlign: 'right' }}>
                        {r.earned ? `+₹${r.earned}` : '—'}
                      </div>
                    </div>
                    {i < MOCK_REFERRALS.length - 1 && <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 1.25rem' }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Share panel */}
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
              <div className="card-header">Share Your Link</div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '.65rem .85rem', fontSize: '.75rem', color: 'var(--gray-600)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{refLink}</div>
                <button className="btn btn-primary btn-full" onClick={() => copy(refLink)}>📋 Copy Referral Link</button>
                <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--gray-400)' }}>or share via</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => window.open(`https://wa.me/?text=Join Rao's Law Academy! Use my referral link: ${refLink}`)}>WhatsApp</button>
                  <button className="btn btn-outline btn-sm" onClick={() => window.open(`https://t.me/share/url?url=${refLink}`)}>Telegram</button>
                </div>

                <div style={{ marginTop: '.25rem', background: 'var(--gold-pale)', borderRadius: 'var(--radius-md)', padding: '.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--maroon)', marginBottom: '.4rem' }}>How it works</div>
                  {['Share your unique code or link', 'Friend signs up using your link', 'Friend makes their first purchase', 'You earn ₹250 credited to your wallet'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '.5rem', fontSize: '.78rem', color: 'var(--maroon)', marginBottom: '.25rem', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
