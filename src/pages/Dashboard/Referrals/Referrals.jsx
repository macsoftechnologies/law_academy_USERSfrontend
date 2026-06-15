import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import Loader from '../../../components/common/Loader';
import { getReferralStats, convertToCoupon } from '../../../api/referrals';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

export default function Referrals() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [couponCopiedIndex, setCouponCopiedIndex] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Convert to coupon state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertAmount, setConvertAmount] = useState('');
  const [convertError, setConvertError] = useState('');
  const [convertLoading, setConvertLoading] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState('');
  const [toast, setToast] = useState(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const refCode = user?.referral_code || '';
  const refLink = refCode ? `${window.location.origin}/register?ref=${refCode}` : '';

  const userId = localStorage.getItem('userId') || user?._id || user?.id;

  const fetchStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getReferralStats(userId);
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch referral stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const handleConvert = async () => {
    const amt = Number(convertAmount);
    if (!amt || amt <= 0) {
      setConvertError("Please enter a valid amount.");
      return;
    }
    if (amt > (stats?.earningsRemaining || 0)) {
      setConvertError(`Insufficient balance. Max available: ₹${stats?.earningsRemaining || 0}`);
      return;
    }
    try {
      setConvertError('');
      setConvertLoading(true);
      const res = await convertToCoupon(userId, amt);
      setShowConvertModal(false);
      setConvertAmount('');
      
      if (res?.statusCode === 200 || res?.success) {
        const code = res?.data?.coupon?.coupon_code || res?.data?.claim?.coupon_code || res?.data?.coupon_code || res?.coupon_code || 'COUPON_GENERATED';
        setGeneratedCoupon(code);
        fetchStats();
      } else {
        setToast({ type: 'error', msg: res?.message || "Failed to convert to coupon" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setShowConvertModal(false);
      setToast({ type: 'error', msg: err?.response?.data?.message || err?.message || "Failed to convert to coupon" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setConvertLoading(false);
    }
  };

  const copyCoupon = (text, index) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCouponCopiedIndex(index);
      setTimeout(() => setCouponCopiedIndex(null), 2000);
    });
  };

  const copy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const copyLink = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); });
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          
          {loading ? <Loader /> : (
            <>

          {/* Hero Banner */}
          <div style={{ background: 'linear-gradient(135deg,var(--navy) 0%,var(--navy-mid) 60%,var(--navy-light) 100%)', borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(200,146,42,.15)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(200,146,42,.1)' }} />
            <div style={{ fontSize: '3rem', marginBottom: '.5rem', position: 'relative' }}>🎁</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,2rem)', color: 'var(--cream)', marginBottom: '.4rem', position: 'relative' }}>Refer & Earn</h1>
            <p style={{ fontSize: '.9rem', color: 'rgba(255,247,224,.7)', maxWidth: 420, marginBottom: '1.5rem', position: 'relative' }}>
              Invite your friends to Rao's Law Academy
 and earn <strong style={{ color: 'var(--gold-light)' }}></strong> for every friend who purchases a course.
            </p>

            {/* Referral code */}
            {refCode ? (
              <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', backdropFilter: 'blur(8px)', width: '100%', maxWidth: 420, position: 'relative' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.7rem', color: 'rgba(255,247,224,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.2rem' }}>Your Referral Code</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold-light)', letterSpacing: '.1em' }}>{refCode}</div>
                </div>
                <button className="btn btn-gold btn-sm" onClick={() => copy(refCode)}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', backdropFilter: 'blur(8px)', width: '100%', maxWidth: 420, position: 'relative' }}>
                <div style={{ flex: 1, color: 'rgba(255,247,224,.8)', fontSize: '.9rem' }}>
                  You don't have a referral code yet.
                </div>
              </div>
            )}
          </div>
          
          {toast && (
            <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? 'var(--error)' : 'var(--success)', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-md)', zIndex: 1000, fontWeight: 600 }}>
              {toast.msg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[
                  { icon: '👥', label: 'Total Referred', value: stats?.myReferralsCount || 0 },
                  { icon: '✅', label: 'Converted',      value: stats?.successfulReferralsCount || 0 },
                  { icon: '💰', label: 'Total Earned',   value: `₹${stats?.totalEarned || 0}` },
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

              {/* Earnings Breakdown */}
              <div className="card">
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginBottom: '.2rem' }}>Balance Remaining</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--navy)', fontWeight: 800 }}>₹{stats?.earningsRemaining || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginBottom: '.2rem' }}>Already Claimed</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gray-400)', fontWeight: 800 }}>₹{stats?.earningsClaimed || 0}</div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    disabled={(stats?.earningsRemaining || 0) <= 0}
                    onClick={() => { setConvertError(''); setConvertAmount(''); setShowConvertModal(true); }}
                  >
                    Convert to Coupon
                  </button>
                </div>
              </div>

              {/* Referral history */}
              <div className="card">
                <div className="card-header">Referral History</div>
                {(!stats?.referrals || stats.referrals.length === 0) ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>No referrals yet</h3>
                    <p>Share your code and start earning!</p>
                  </div>
                ) : stats.referrals.map((r, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--navy)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.85rem', flexShrink: 0 }}>
                        {r.referredName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--navy)' }}>{r.referredName || 'User'}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--gray-400)' }}>{r.referredEmail || ''}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--gray-400)' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</div>
                      </div>
                      <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: 'var(--radius-full)', background: r.amount ? 'var(--success-bg)' : 'var(--gold-pale)', color: r.amount ? 'var(--success)' : 'var(--maroon)' }}>
                        {r.amount ? 'Purchased' : 'Signed Up'}
                      </span>
                      <div style={{ fontWeight: 800, fontSize: '.9rem', color: r.amount ? 'var(--success)' : 'var(--gray-400)', minWidth: 55, textAlign: 'right' }}>
                        {r.amount ? `+₹${r.amount}` : '—'}
                      </div>
                    </div>
                    {i < stats.referrals.length - 1 && <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 1.25rem' }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* My Coupons */}
              <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>My Active Coupons</span>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, background: 'var(--gold-pale)', color: 'var(--maroon)', padding: '.1rem .5rem', borderRadius: 'var(--radius-full)' }}>{stats?.claims?.length || 0}</span>
                </div>
                <div className="card-body">
                  {(!stats?.claims || stats.claims.length === 0) ? (
                    <div style={{ fontSize: '.85rem', color: 'var(--gray-500)', textAlign: 'center', padding: '1rem 0' }}>
                      Convert your earnings to get coupons.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      {stats.claims.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)', padding: '.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                          <div>
                            <div style={{ fontFamily: 'monospace', fontSize: '.9rem', fontWeight: 800, color: 'var(--navy)' }}>{c.coupon_code}</div>
                            <div style={{ fontSize: '.7rem', color: 'var(--success)', fontWeight: 600 }}>₹{c.amount || 0} OFF</div>
                          </div>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '.25rem .5rem', fontSize: '.7rem', minWidth: 52, transition: 'background .2s', background: couponCopiedIndex === i ? 'var(--success-bg)' : undefined, color: couponCopiedIndex === i ? 'var(--success)' : undefined }}
                            onClick={() => copyCoupon(c.coupon_code, i)}
                          >
                            {couponCopiedIndex === i ? '✅ Copied' : 'Copy'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Share panel */}
              <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
                <div className="card-header">Share Your Link</div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {refLink ? (
                  <>
                    <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '.65rem .85rem', fontSize: '.75rem', color: 'var(--gray-600)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{refLink}</div>
                    <button
                      className="btn btn-full"
                      onClick={() => copyLink(refLink)}
                      style={{
                        background: linkCopied ? 'var(--success, #16a34a)' : 'var(--navy)',
                        color: 'white',
                        border: 'none',
                        transition: 'background .3s',
                        fontWeight: 700,
                      }}
                    >
                      {linkCopied ? '✅ Link Copied!' : '📋 Copy Referral Link'}
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: '.85rem', color: 'var(--gray-500)', textAlign: 'center' }}>No referral link available.</div>
                )}
                {/* <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--gray-400)' }}>or share via</div> */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                  {/* <button className="btn btn-outline btn-sm" onClick={() => window.open(`https://wa.me/?text=Join Rao's Law Academy
! Use my referral link: ${refLink}`)}>WhatsApp</button>
                  <button className="btn btn-outline btn-sm" onClick={() => window.open(`https://t.me/share/url?url=${refLink}`)}>Telegram</button> */}
                </div>

                <div style={{ marginTop: '.25rem', background: 'var(--gold-pale)', borderRadius: 'var(--radius-md)', padding: '.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--maroon)', marginBottom: '.4rem' }}>How it works</div>
                  {['Share your unique code or link', 'Friend signs up using your link', 'Friend makes their first purchase', 'You earn credits to your wallet'].map((s, i) => (
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
            </>
          )}
        </div>
      </div>

      {showConvertModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal" style={{ width: '400px', maxWidth: '90%' }}>
            <h3>Convert to Coupon</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
              Enter the amount you wish to convert. Max available: <strong>₹{stats?.earningsRemaining || 0}</strong>
            </p>
            <input 
              type="number" 
              className="field input" 
              placeholder="Amount (e.g. 500)"
              value={convertAmount}
              onChange={e => { setConvertAmount(e.target.value); setConvertError(''); }}
              style={{ marginBottom: convertError ? '.5rem' : '1.5rem' }}
              min={1}
              max={stats?.earningsRemaining || 0}
            />
            {convertError && (
              <div style={{ color: 'var(--error, #dc2626)', fontSize: '.8rem', fontWeight: 600, marginBottom: '1rem', background: 'rgba(220,38,38,.08)', borderRadius: 'var(--radius-sm)', padding: '.4rem .75rem' }}>
                ⚠️ {convertError}
              </div>
            )}
            <div className="logout-actions">
              <button className="cancel-btn" onClick={() => { setShowConvertModal(false); setConvertError(''); }} disabled={convertLoading}>Cancel</button>
              <button className="confirm-btn" onClick={handleConvert} disabled={convertLoading || !convertAmount}>
                {convertLoading ? 'Converting...' : 'Convert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Coupon Modal */}
      {generatedCoupon && (
        <div className="logout-modal-overlay">
          <div className="logout-modal" style={{ width: '400px', maxWidth: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3>Coupon Generated!</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
              Your earnings have been successfully converted into a discount coupon.
            </p>
            <div style={{ background: 'var(--gray-50)', border: '2px dashed var(--gold)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)', letterSpacing: '2px' }}>
                {generatedCoupon}
              </div>
            </div>
            <button className="btn btn-gold btn-full" onClick={() => {
              copy(generatedCoupon);
              setGeneratedCoupon('');
            }}>
              📋 Copy & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}