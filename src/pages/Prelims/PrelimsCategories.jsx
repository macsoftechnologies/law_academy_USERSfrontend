import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getPrelimsDetail } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const COURSE_POINTS = ['Previous Year Questions','Subject wise Mock Tests','Grand Tests','Quizzes'];
const ICONS = ['📋','📝','🏆','❓'];
const MODULE_MAP = { 'previous year questions':'PQA', 'subject wise mock tests':'SMT', 'grand tests':'GT', 'quizzes':'Quiz' };

export default function PrelimsCategories() {
  const { prelimsId } = useParams();
  const navigate      = useNavigate();
  const { state }     = useLocation();
  const passedItem    = state?.item || null;
  const isEnrolled    = state?.isEnrolled || false;
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrelimsDetail(prelimsId)
      .then(r => { 
        if(r.statusCode===200) setDetail(Array.isArray(r.data)?r.data[0]:r.data); 
      })
      .catch(console.error)
      .finally(()=>setLoading(false));
  }, [prelimsId]);

  const item = detail || passedItem;

  const handleExplore = (label) => {
    if (!isEnrolled) {
      navigate(`/prelims/${prelimsId}`, { state: { item: passedItem, scrollToBuy: true } });
      return;
    }

    const lowerLabel = label.trim().toLowerCase();

    if (lowerLabel === 'quizzes') {
      // Redirect quizzes to tests page
      navigate(`/prelims/${prelimsId}/tests`, {
        state: { item, isEnrolled, test_type: 'QZ', page: 1, limit: 10, categoryLabel: label }
      });
      return;
    }

    const module_type = MODULE_MAP[lowerLabel];
    if (!module_type) return;

    navigate(`/prelims/${prelimsId}/qa/${module_type}`, { state: { item, isEnrolled, categoryLabel: label } });
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          <div style={{ marginBottom:'1.25rem' }}>
            <span className="badge badge-navy" style={{ marginBottom:'.5rem' }}>Prelims</span>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.3rem,2vw,1.7rem)', color:'var(--navy)' }}>{item?.title||'Prelims Course'}</h1>
            {!isEnrolled && <div className="toast warning" style={{ marginTop:'.75rem', width:'fit-content' }}>⚠ Enroll to access all content</div>}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
            {COURSE_POINTS.map((label,i) => (
              <div key={i} className="card" style={{ cursor:'pointer', border:'2px solid transparent', transition:'border-color .18s' }}
                onClick={()=>handleExplore(label)}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--gold)'}
                onMouseOut={e=>e.currentTarget.style.borderColor='transparent'}>
                <div className="card-body" style={{ textAlign:'center', padding:'1.75rem 1.25rem' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'.75rem' }}>{ICONS[i]}</div>
                  <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'.95rem', marginBottom:'.35rem' }}>{label}</div>
                  {!isEnrolled && <div style={{ fontSize:'.72rem', color:'var(--gray-400)' }}>🔒 Enroll to access</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}