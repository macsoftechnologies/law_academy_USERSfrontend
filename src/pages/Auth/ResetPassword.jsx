import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLeft } from './LoginPage';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/auth.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [f, setF] = useState({ password:'', confirm:'' });
  const [errors, setErr] = useState({});
  const [showPw, setShow] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLd] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k,v) => { setF(p=>({...p,[k]:v})); setErr(p=>({...p,[k]:''})); };
  const validate = () => {
    const e = {};
    if (!f.password.trim()) e.password = 'Password is required';
    else if (f.password.length < 6) e.password = 'Minimum 6 characters';
    if (f.password !== f.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleUpdate = (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErr(errs); return; }
    setLd(true);
    setTimeout(() => { setLd(false); setResult('success'); }, 1300);
  };

  if (result === 'success') return (
    <div className="auth-page">
      <AuthLeft tag="Password Reset" title={<>All <em>Done!</em></>} sub="Your password has been reset. You can now login with your new password." />
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-body">
            <div className="result-screen">
              <div className="result-icon">✅</div>
              <h3>Password Updated!</h3>
              <p>Your password has been reset. Please login with your new credentials.</p>
              <button className="btn btn-primary btn-full" onClick={()=>navigate('/login')}>Back to Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <AuthLeft tag="Reset Password" title={<>Set a New <em>Password</em></>} sub="Choose a strong password to keep your account secure." />
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-illus">🔒</div>
          <div className="auth-body">
            <h2>Reset Password</h2>
            <p className="auth-sub">Create a new password for your account</p>
            <form onSubmit={handleUpdate} noValidate>
              <div className="field">
                <label>New Password</label>
                <div className="pw-wrap">
                  <input type={showPw?'text':'password'} placeholder="Min. 6 characters" value={f.password} onChange={e=>set('password',e.target.value)} />
                  <button type="button" className="eye-btn" onClick={()=>setShow(p=>!p)}>{showPw?'🔓':'🔒'}</button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <div className="pw-wrap">
                  <input type={showCf?'text':'password'} placeholder="Re-enter new password" value={f.confirm} onChange={e=>set('confirm',e.target.value)} />
                  <button type="button" className="eye-btn" onClick={()=>setShowCf(p=>!p)}>{showCf?'🔓':'🔒'}</button>
                </div>
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
