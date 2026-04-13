import { useState, useEffect } from 'react';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import PersonalInfo from './tabs/PersonalInfo';
import EducationalInfo from './tabs/EducationalInfo';
import IdProofs from './tabs/IdProofs';
import Loader from '../../../components/common/Loader';
import { getUserDetails } from '../../../api/Profile/profileApi';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const TABS = [
  { id:'personal',    label:'Personal Info',   icon:'👤' },
  { id:'educational', label:'Education',        icon:'🎓' },
  { id:'idproofs',    label:'ID Proofs',        icon:'🪪' },
];

const initials = (name='') => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [details,   setDetails]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const userId = localStorage.getItem('userId');

  const fetchDetails = async () => {
    try {
      const res = await getUserDetails(userId);
      if (res.statusCode===200 && res.data?.length>0) setDetails(res.data[0]);
    } catch(err){ console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDetails(); }, []);

  const ini  = initials(details?.name||'');
  const name = details?.name || 'User';

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          {loading ? <Loader /> : (
            <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.5rem', alignItems:'start' }}>

              {/* Left card */}
              <div className="card" style={{ position:'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
                <div className="card-body" style={{ textAlign:'center', paddingTop:'1.75rem' }}>
                  <div style={{ position:'relative', display:'inline-block', marginBottom:'1rem' }}>
                    <div style={{ width:80, height:80, borderRadius:'var(--radius-lg)', background:'linear-gradient(135deg,var(--navy),var(--navy-mid))', color:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', fontWeight:800, margin:'0 auto' }}>
                      {ini}
                    </div>
                    <button style={{ position:'absolute', bottom:-4, right:-4, width:26, height:26, borderRadius:'50%', background:'var(--gold)', border:'2px solid var(--white)', color:'var(--white)', fontSize:'.7rem', cursor:'pointer' }}>✏️</button>
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--navy)', marginBottom:'.2rem' }}>{name}</div>
                  <div style={{ fontSize:'.78rem', color:'var(--gray-400)', marginBottom:'.5rem' }}>{details?.role||'Student'}</div>
                  {details?.referral_code && (
                    <div style={{ display:'inline-block', background:'var(--gold-pale)', color:'var(--maroon)', fontSize:'.72rem', fontWeight:700, padding:'.2rem .65rem', borderRadius:'var(--radius-full)', letterSpacing:'.06em' }}>
                      {details.referral_code}
                    </div>
                  )}
                  <div style={{ marginTop:'1.25rem', display:'flex', flexDirection:'column', gap:'.25rem' }}>
                    {TABS.map(t => (
                      <button key={t.id}
                        onClick={()=>setActiveTab(t.id)}
                        style={{ display:'flex', alignItems:'center', gap:'.65rem', padding:'.65rem .9rem', borderRadius:'var(--radius-md)', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'.855rem', fontWeight:600, background: activeTab===t.id ? 'var(--navy)' : 'transparent', color: activeTab===t.id ? 'var(--cream)' : 'var(--gray-600)', transition:'all .18s', textAlign:'left', width:'100%' }}>
                        <span>{t.icon}</span>
                        <span style={{ flex:1 }}>{t.label}</span>
                        <span style={{ fontSize:'.7rem', opacity:.6 }}>›</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right content */}
              <div className="card">
                <div className="card-body" style={{ padding:'1.5rem' }}>
                  {activeTab==='personal'    && <PersonalInfo    details={details}                          onRefetch={fetchDetails} />}
                  {activeTab==='educational' && <EducationalInfo certificates={details?.certificates||[]}   onRefetch={fetchDetails} />}
                  {activeTab==='idproofs'    && <IdProofs        idProofs={details?.idProofs||[]}           onRefetch={fetchDetails} />}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
