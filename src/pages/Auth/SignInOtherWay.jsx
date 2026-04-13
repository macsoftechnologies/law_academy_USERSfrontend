import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAnotherWay } from '../../api/auth/loginAnotherWay';
import { AuthLeft } from './LoginPage';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/auth.css';

export default function SignInOtherWay() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLd] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSend = async () => {
    if (!phone.trim() || !/^\d{10}$/.test(phone)) { setError('Enter a valid 10-digit phone number'); return; }
    setError(''); setLd(true); setToast(null);
    try {
      const res = await loginAnotherWay({ mobile_number: phone });
      if (res.statusCode === 200) {
        setToast({ type:'success', msg:'OTP sent!' });
        setTimeout(() => navigate('/otpverify', { state:{ phone, userId:res.data?.userId } }), 1000);
      } else {
        setToast({ type:'error', msg: res.message || 'Failed to send OTP' });
      }
    } catch (err) {
      setToast({ type:'error', msg: err.message || 'Something went wrong' });
    } finally { setLd(false); }
  };

  return (
    <div className="auth-page">
      <AuthLeft
        tag="Quick Sign In"
        title={<>Sign In with <em>OTP</em></>}
        sub="Enter your registered phone number and we'll send you a one-time password to login instantly."
        stats={[['Instant','OTP Login'],['Secure','Access'],['No','Password']]}
      />
      <div className="auth-right">
        <div className="auth-card">
          {/* <div className="auth-illus">📱</div> */}
          <div className="auth-body">
            <button className="auth-back" onClick={()=>navigate('/login')}>← Back to Login</button>
            <h2>Sign In with OTP</h2>
            <p className="auth-sub">Enter your registered phone number</p>
            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
            <div className="field">
              <label>Phone Number</label>
              <input type="tel" placeholder="10-digit phone number" value={phone}
                onChange={e=>{ setPhone(e.target.value); setError(''); }} />
              {error && <span className="field-error">{error}</span>}
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop:'.5rem' }} onClick={handleSend} disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
            <p className="auth-footer">Sign in with password? <span onClick={()=>navigate('/login')}>Login</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
