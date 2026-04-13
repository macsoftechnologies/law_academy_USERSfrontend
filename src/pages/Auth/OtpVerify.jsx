import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyUser } from '../../api/auth/verify';
import { AuthLeft } from './LoginPage';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/auth.css';

export default function OtpVerify() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone  = state?.phone  || sessionStorage.getItem('otpPhone');
  const userId = state?.userId || sessionStorage.getItem('otpUserId');
  const [otp, setOtp] = useState(['','','','','']);
  const [error, setError] = useState('');
  const [loading, setLoad] = useState(false);
  const [resent, setResent] = useState(false);
  const refs = [useRef(),useRef(),useRef(),useRef(),useRef()];

  useEffect(() => {
    if (state?.userId) {
      sessionStorage.setItem('otpUserId', state.userId);
      sessionStorage.setItem('otpPhone', state.phone);
    }
  }, [state]);

  const handleChange = (i,val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next); setError('');
    if (val && i < 4) refs[i+1].current.focus();
  };
  const handleKey = (i,e) => { if (e.key==='Backspace' && !otp[i] && i>0) refs[i-1].current.focus(); };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (otp.join('').length < 5) { setError('Enter all 5 digits'); return; }
    setLoad(true); setError('');
    try {
      const res = await verifyUser({ userId, otp: otp.join('') });
      if (res.statusCode === 200) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.data.userId);
        localStorage.setItem('user', JSON.stringify(res.data));
        localStorage.setItem('isLoggedIn','true');
        sessionStorage.clear();
        navigate('/dashboard');
      } else {
        setError(res.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally { setLoad(false); }
  };

  const handleResend = () => {
    setOtp(['','','','','']); setError(''); setResent(true);
    setTimeout(()=>setResent(false),3000);
    refs[0].current.focus();
  };

  return (
    <div className="auth-page">
      <AuthLeft
        tag="OTP Verification"
        title={<>One Step <em>Away</em></>}
        sub="We have sent a 5-digit OTP to your registered mobile number. Enter it below to verify."
        stats={[['5-Digit','OTP Code'],['Secure','Verification'],['Instant','Access']]}
      />
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-illus">🔐</div>
          <div className="auth-body">
            <button className="auth-back" onClick={()=>navigate('/login')}>← Back</button>
            <h2>Verify Your Number</h2>
            <p className="auth-sub">We sent a 5-digit OTP to <strong>{phone}</strong></p>
            {resent && <div className="toast success">OTP resent successfully!</div>}
            {error  && <div className="toast error">{error}</div>}
            <form onSubmit={handleVerify} noValidate>
              <div className="otp-row">
                {otp.map((v,i) => (
                  <input key={i} ref={refs[i]} className={`otp-box ${v?'filled':''}`}
                    type="text" inputMode="numeric" maxLength={1} value={v}
                    onChange={e=>handleChange(i,e.target.value)}
                    onKeyDown={e=>handleKey(i,e)} />
                ))}
              </div>
              <p className="otp-resend">Haven't got the SMS? <span onClick={handleResend}>Resend OTP</span></p>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
