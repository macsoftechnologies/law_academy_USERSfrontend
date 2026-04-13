import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth/login';
import Loader from '../../components/common/Loader';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/auth.css';
import logo from "../../assets/images/rla.png"

function validate(f) {
  const e = {};

  if (!f.email.trim()) e.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = 'Enter a valid email';

  if (!f.phone.trim()) e.phone = 'Phone is required';
  else if (!/^\d+$/.test(f.phone)) e.phone = 'Enter a valid number';

  if (!f.password.trim()) e.password = 'Password is required';
  else if (f.password.length < 6) e.password = 'Minimum 6 characters';

  return e;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ email: '', phone: '', password: '' });
  const [errors, setErr] = useState({});
  const [showPw, setShow] = useState(false);
  const [loading, setLd] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    setErr((p) => ({ ...p, [k]: '' }));
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    const errs = validate(f);

    if (Object.keys(errs).length) {
      setErr(errs);
      return;
    }

    setLd(true);
    setToast(null);

    try {
      const data = await loginUser({
        email: f.email,
        mobile_number: f.phone,
        password: f.password,
      });

      if (data.statusCode === 200) {
        setToast({
          type: 'success',
          msg: data.message || 'OTP sent successfully!',
        });

        setTimeout(() => {
          navigate('/otpverify', {
            state: {
              phone: f.phone,
              mode: 'otp-login',
              userId: data.data.userId,
            },
          });
        }, 1200);
      } else {
        setToast({
          type: 'error',
          msg: data.message || 'Login failed',
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        msg: err.message || 'Something went wrong',
      });
    } finally {
      setLd(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthLeft />

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-body">
            <h2>Welcome Back</h2>
            <p className="auth-sub">Login to access your account</p>

            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

            <form onSubmit={handleLogin} noValidate>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={f.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={f.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={f.password}
                    onChange={(e) => set('password', e.target.value)}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShow((p) => !p)}
                  >
                    {showPw ? '🔓' : '🔒'}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="forgot-row">
                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => navigate('/forgotpassword')}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>

            <div className="auth-divider">Sign in another way</div>

            <button
              className="btn btn-outline btn-full"
              onClick={() => navigate('/signinotherway')}
            >
              Sign In with OTP
            </button>

            <p className="auth-footer">
              Don't have an account?{' '}
              <span onClick={() => navigate('/register')}>Sign Up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLeft() {
  return (
    <div className="auth-left">
      <div className="al-ring al-ring-1" />
      <div className="al-ring al-ring-2" />
      <div className="al-ring al-ring-3" />

      <div className="al-logo">
        <img
          src={logo}
          alt="Rao's Law Academy logo"
          className="login-logo-img"
        />
      </div>

      <div className="al-bottom">
        2026 Rao's law academy. All rights reserved.
      </div>
    </div>
  );
}