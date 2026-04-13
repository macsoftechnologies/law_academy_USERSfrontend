import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimReferral } from '../../api/auth/claimReferral';
import { AuthLeft } from './LoginPage';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/auth.css';

export default function ReferralScreen() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLd] = useState(false);
  const [toast, setToast] = useState(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const myCode = user?.referral_code || '';

  const handleClaim = async () => {
    if (!code.trim()) { setToast({ type:'error', msg:'Enter a referral code' }); return; }
    setLd(true);
    try {
      const res = await claimReferral({ referral_code: code.trim() });
      if (res.statusCode === 200) {
        setToast({ type:'success', msg:'Referral claimed successfully!' });
        setTimeout(()=>navigate('/dashboard'),1500);
      } else {
        setToast({ type:'error', msg: res.message || 'Invalid referral code' });
      }
    } catch (err) {
      setToast({ type:'error', msg: err.message || 'Something went wrong' });
    } finally { setLd(false); }
  };

  return (
    <div className="auth-page">
      <AuthLeft
        tag="Refer & Earn"
        title={<>Share & <em>Earn Together</em></>}
        sub="Invite your friends and earn exciting rewards when they join and enroll in courses."
        stats={[['Earn','Rewards'],['Share','Codes'],['Win','Together']]}
      />
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-illus">🎁</div>
          <div className="auth-body">
            <h2>Referral Program</h2>
            <p className="auth-sub">Claim a referral or share your code</p>
            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

            {myCode && (
              <div style={{ marginBottom:'1.5rem' }}>
                <p style={{ fontSize:'.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--gray-500)', marginBottom:'.5rem' }}>Your Referral Code</p>
                <div className="referral-code-wrap">
                  <div className="referral-code">{myCode}</div>
                </div>
              </div>
            )}

            <div className="field">
              <label>Enter a Referral Code</label>
              <input type="text" placeholder="e.g. MAKA2024" value={code}
                onChange={e=>setCode(e.target.value.toUpperCase())}
                style={{ textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700 }} />
            </div>
            <button className="btn btn-gold btn-full" style={{ marginTop:'.5rem' }} onClick={handleClaim} disabled={loading}>
              {loading ? 'Claiming…' : 'Claim Referral'}
            </button>
            <button className="btn btn-ghost btn-full" style={{ marginTop:'.5rem' }} onClick={()=>navigate('/dashboard')}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
