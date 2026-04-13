import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLeft } from './LoginPage';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!value.trim()) { setError('Email or Phone is required'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/otpverify', { state:{ userId:25, type:'reset' } });
    }, 1200);
  };

  return (
    <div className="auth-page">
      <AuthLeft
        tag="Forgot Password"
        title={<>Recover Your <em>Account</em></>}
        sub="Enter your registered email or phone number to receive an OTP."
      />
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-illus">🔑</div>
          <div className="auth-body">
            <button className="auth-back" onClick={()=>navigate('/login')}>← Back to Login</button>
            <h2>Forgot Password?</h2>
            <p className="auth-sub">Enter your email or phone to reset your password</p>
            <div className="field">
              <label>Email or Phone Number</label>
              <input type="text" placeholder="Enter email or 10-digit phone" value={value}
                onChange={e=>{ setValue(e.target.value); setError(''); }} />
              {error && <span className="field-error">{error}</span>}
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop:'.5rem' }} onClick={handleSendOtp} disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
            <p className="auth-footer">Remembered it? <span onClick={()=>navigate('/login')}>Login</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
