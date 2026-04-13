import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getMains } from '../../api/mains/mainsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const STATIC_CARDS = [
  { label:'Mains Question & Answers', module_type:'MQA', icon:'📝' },
  { label:'Mains Essay & Translation', module_type:'MET', icon:'✍️' },
  { label:'Mains Test Series',         module_type:'MTS', icon:'🏆' },
];

export default function MainsCategories() {
  const navigate    = useNavigate();
  const { mainsId } = useParams();
  const { state }   = useLocation();
  const passedItem  = state?.item || null;
  const [isEnrolled,setIsEnrolled]= useState(state?.isEnrolled??false);
  const [item,      setItem]      = useState(passedItem);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getMains(1,100).then(r=>{ if(r.statusCode===200){ const m=(r.data??[]).find(x=>x.mains_id===mainsId); if(m){ setIsEnrolled(m.isEnrolled||false); setItem(prev=>prev||m); } } }).catch(console.error).finally(()=>setLoading(false));
  }, [mainsId]);

  const handleClick = (card) => {
    if (!isEnrolled) { navigate(`/mains/${mainsId}`,{state:{item:passedItem,scrollToBuy:true}}); return; }
    if (card.module_type==='MTS') { navigate(`/mains/${mainsId}/test-series`,{state:{item,isEnrolled:true}}); return; }
    navigate(`/mains/${mainsId}/qa/${card.module_type}`,{state:{categoryLabel:card.label,moduleId:mainsId,module:'mains',module_type:card.module_type,isEnrolled,item}});
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          <div style={{ marginBottom:'1.25rem' }}>
            <span className="badge badge-navy" style={{ marginBottom:'.5rem' }}>Mains</span>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.3rem,2vw,1.7rem)', color:'var(--navy)' }}>{item?.title||'Mains Course'}</h1>
            {!isEnrolled && <div className="toast warning" style={{ marginTop:'.75rem', width:'fit-content' }}>⚠ Enroll to access all content</div>}
          </div>
          {loading ? <Loader /> : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem' }}>
              {STATIC_CARDS.map((card,i) => (
                <div key={i} className="card" style={{ cursor:'pointer', border:'2px solid transparent', transition:'border-color .18s' }}
                  onClick={()=>handleClick(card)}
                  onMouseOver={e=>e.currentTarget.style.borderColor='var(--gold)'}
                  onMouseOut={e=>e.currentTarget.style.borderColor='transparent'}>
                  <div className="card-body" style={{ textAlign:'center', padding:'2rem 1.25rem' }}>
                    <div style={{ fontSize:'2.8rem', marginBottom:'.85rem' }}>{card.icon}</div>
                    <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'.95rem', marginBottom:'.35rem' }}>{card.label}</div>
                    {!isEnrolled && <div style={{ fontSize:'.72rem', color:'var(--gray-400)' }}>🔒 Enroll to access</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
