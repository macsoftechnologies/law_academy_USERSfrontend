import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/layout.css';
import logo from "../../assets/images/rla.png"

const NAV = [
  { id:'overview', label:'Dashboard', path:'/dashboard' },
  { id:'notes',    label:'Notes',     path:'/notes'     },
  { id:'prelims',  label:'Prelims',   path:'/prelims'   },
  { id:'mains',    label:'Mains',     path:'/mains'     },
];

const MENU = [
  { icon:'👤', label:'Profile',            path:'/dashboard/profile',   action: null },
  { icon:'🎓', label:'My Courses',         path:'/dashboard/my-courses',action: null },
  { icon:'⬇️', label:'My Downloads',       path:'/dashboard/downloads', action: null },
  { icon:'💳', label:'Billing & Payments', path:'/dashboard/payments',  action: null },
  { icon:'❤️', label:'Wishlist',           path:'/dashboard/wishlist',  action: null },
  { icon:'🛒', label:'My Cart',            path:'/dashboard/cart',      action: null },
  { icon:'❓', label:'FAQs',               path:'/dashboard/faqs',      action: null },
  { icon:'🌙', label:'Dark Mode',          path: null,                  action:'darkmode' },
  { icon:'❓', label:'Help Center',        path:'/dashboard/help',      action: null },
  { icon:'🎁', label:'Refer & Earn',       path:'/dashboard/referrals', action: null },
  { icon:'📋', label:'Terms & Conditions', path:'/dashboard/terms',     action: null },
  { icon:'🔒', label:'Privacy Policy',     path:'/dashboard/privacy',   action: null },
];

const initials = (name='') => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?';

export default function DashboardHeader() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [dropOpen,   setDropOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [darkMode,   setDarkMode]   = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(p => !p);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const name = user?.name || 'User';
  const ini  = initials(name);

  const active = p => {
    if (p==='/notes')   return location.pathname.startsWith('/notes');
    if (p==='/prelims') return location.pathname.startsWith('/prelims');
    if (p==='/mains')   return location.pathname.startsWith('/mains');
    return location.pathname === p;
  };

  const doLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <>
      <header className="dh-header">
        {/* <div className="dh-logo" onClick={() => navigate('/dashboard')}>
          Rao's <span>Law Academy</span>
        </div> */}
        <div className="dh-logo" onClick={() => navigate('/dashboard')}>
  <img src={logo} alt="Rao's Law Academy" className="dh-logo-img" />
</div>

        <nav className="dh-nav">
          {NAV.map(n => (
            <div key={n.id} className={`dh-nav-item ${active(n.path)?'active':''}`}
              onClick={() => navigate(n.path)}>
              {n.label}
            </div>
          ))}
        </nav>

        <div className="dh-right">
          <button className="dh-notif-btn">
            🔔<span className="dh-notif-dot" />
          </button>

          <div className="dh-avatar-wrap" onClick={() => { setDropOpen(p=>!p); setMobileOpen(false); }}>
            <div className="dh-avatar">{ini}</div>
            <div className="dh-avatar-info">
              <span className="dh-avatar-name">{name}</span>
              <span className="dh-avatar-role">{user?.role || 'Student'}</span>
            </div>
            <span className="dh-chevron">{dropOpen ? '▲' : '▼'}</span>
          </div>

          <button className="dh-hamburger" onClick={() => { setMobileOpen(p=>!p); setDropOpen(false); }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {dropOpen && (
          <>
            <div className="dh-dropdown-overlay" onClick={() => setDropOpen(false)} />
            <div className="dh-dropdown">
              <div className="dh-dropdown-user">
                <div className="dh-dropdown-avatar">{ini}</div>
                <div>
                  <div className="dh-dropdown-name">{name}</div>
                  <div className="dh-dropdown-email">{user?.email || ''}</div>
                  {user?.referral_code && <div className="dh-dropdown-ref">{user.referral_code}</div>}
                </div>
              </div>
              <div className="dh-dropdown-divider" />
              <div className="dh-dropdown-scroll">
                {MENU.map(m => (
                  <div key={m.label} className={`dh-dropdown-item ${m.path && active(m.path)?'active':''}`}
                    onClick={() => {
                      if (m.action === 'darkmode') { toggleDarkMode(); }
                      else { navigate(m.path); setDropOpen(false); }
                    }}>
                    <span>{m.action === 'darkmode' ? (darkMode ? '☀️' : '🌙') : m.icon}</span>
                    {m.action === 'darkmode' ? (darkMode ? 'Light Mode' : 'Dark Mode') : m.label}
                    {m.action === 'darkmode' && (
                      <span style={{ marginLeft:'auto', fontSize:'.7rem', background: darkMode ? 'var(--gold-pale)' : 'var(--gray-100)', color: darkMode ? 'var(--maroon)' : 'var(--gray-500)', padding:'.1rem .5rem', borderRadius:'var(--radius-full)', fontWeight:700 }}>
                        {darkMode ? 'ON' : 'OFF'}
                      </span>
                    )}
                  </div>
                ))}
                <div className="dh-dropdown-divider" />
                <div className="dh-dropdown-item logout"
                  onClick={() => { setDropOpen(false); setShowLogout(true); }}>
                  <span>🚪</span> Logout
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {mobileOpen && (
        <div className="dh-mobile-menu">
          {NAV.map(n => (
            <div key={n.id} className={`dh-mobile-item ${active(n.path)?'active':''}`}
              onClick={() => { navigate(n.path); setMobileOpen(false); }}>
              {n.label}
            </div>
          ))}
          <div className="dh-dropdown-divider" />
          <div className="dh-dropdown-scroll">
            {MENU.map(m => (
              <div key={m.label} className={`dh-mobile-item ${m.path && active(m.path)?'active':''}`}
                onClick={() => {
                  if (m.action === 'darkmode') { toggleDarkMode(); }
                  else { navigate(m.path); setMobileOpen(false); }
                }}>
                <span>{m.action === 'darkmode' ? (darkMode ? '☀️' : '🌙') : m.icon}</span>
                {m.action === 'darkmode' ? (darkMode ? 'Light Mode' : 'Dark Mode') : m.label}
              </div>
            ))}
            <div className="dh-dropdown-divider" />
            <div className="dh-mobile-item logout"
              onClick={() => { setMobileOpen(false); setShowLogout(true); }}>
              <span>🚪</span> Logout
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="logout-actions">
              <button className="cancel-btn"  onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="confirm-btn" onClick={doLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
