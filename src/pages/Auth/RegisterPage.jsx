import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/auth/register';
import { AuthLeft } from './LoginPage';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/auth.css';

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!f.email.trim()) e.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = 'Enter a valid email';
  if (!f.phone.trim()) e.phone = 'Phone is required';
  else if (!/^\d{10}$/.test(f.phone)) e.phone = 'Enter valid 10-digit number';
  if (!f.password.trim()) e.password = 'Password is required';
  else if (f.password.length < 6) e.password = 'Minimum 6 characters';
  if (f.password !== f.confirm) e.confirm = 'Passwords do not match';
  if (!f.agreed) e.agreed = 'Please accept to continue';
  return e;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name:'', email:'', phone:'', password:'', confirm:'', agreed:false });
  const [errors, setErr] = useState({});
  const [showPw, setShow] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLd] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k,v) => { setF(p=>({...p,[k]:v})); setErr(p=>({...p,[k]:''})); };

  const handleSignup = async (e) => {
    e?.preventDefault();
    const errs = validate(f);
    if (Object.keys(errs).length) { setErr(errs); return; }
    setLd(true);
    try {
      const res = await registerUser({ name:f.name, email:f.email, mobile_number:f.phone, password:f.password });
      if (res.statusCode === 200 && res.data?.userId) {
        navigate('/otpverify', { state:{ phone:f.phone, mode:'register', userId:res.data.userId } });
      } else {
        setToast({ type:'error', msg: res.message || 'Registration failed' });
      }
    } catch (err) {
      setToast({ type:'error', msg: err.message || 'Something went wrong' });
    } finally { setLd(false); }
  };

  return (
    <div className="auth-page">
      <AuthLeft
        tag="Join Rao's Law Academy"
        title={<>Start Your <em>Learning Journey</em></>}
        sub="Create your account and get instant access to hundreds of expert-led courses designed for real-world success."
        stats={[['Free','Sign Up'],['500+','Courses'],['50K+','Learners']]}
      />
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-body" style={{ paddingTop:'1.5rem' }}>
            <button className="auth-back" onClick={()=>navigate('/login')}>← Back to Login</button>
            <h2>Create Account</h2>
            <p className="auth-sub">Fill in your details to get started</p>
            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
            <form onSubmit={handleSignup} noValidate>
              <div className="field">
                <label>Full Name</label>
                <input type="text" placeholder="Your full name" value={f.name} onChange={e=>set('name',e.target.value)} />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="field">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={f.email} onChange={e=>set('email',e.target.value)} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input type="tel" placeholder="10-digit number" value={f.phone} onChange={e=>set('phone',e.target.value)} />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input type={showPw?'text':'password'} placeholder="Min. 6 characters" value={f.password} onChange={e=>set('password',e.target.value)} />
                  <button type="button" className="eye-btn" onClick={()=>setShow(p=>!p)}>{showPw?'🔓':'🔒'}</button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <div className="pw-wrap">
                  <input type={showCf?'text':'password'} placeholder="Re-enter password" value={f.confirm} onChange={e=>set('confirm',e.target.value)} />
                  <button type="button" className="eye-btn" onClick={()=>setShowCf(p=>!p)}>{showCf?'🔓':'🔒'}</button>
                </div>
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>
              <label className="checkbox-row">
                <input type="checkbox" checked={f.agreed} onChange={e=>set('agreed',e.target.checked)} />
                <span>I agree to the <span style={{color:'var(--navy)',fontWeight:700,cursor:'pointer'}}>Terms & Conditions</span> and <span style={{color:'var(--navy)',fontWeight:700,cursor:'pointer'}}>Privacy Policy</span></span>
              </label>
              {errors.agreed && <span className="field-error">{errors.agreed}</span>}
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>
            <p className="auth-footer">Already have an account? <span onClick={()=>navigate('/login')}>Login</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
