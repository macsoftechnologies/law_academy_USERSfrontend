import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { getMainsQAList } from '../../api/mains/mainsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL  = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

const parseAttemptCount = (qa) => {
  if (qa == null) return 0;
  const value = qa.attempts ?? qa.attempts_count ?? qa.attempt_count ?? qa.attempt ?? qa.attemptNumber ?? qa.attempted ?? qa.attempted_count ?? qa.no_of_attempts ?? qa.user_attempts_count ?? qa.user_attempts ?? qa.attempts_list ?? qa.attempt_list ?? qa.attempt_history;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseInt(value, 10) || 0;
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return parseInt(value.count ?? value.total ?? value.length ?? 0, 10) || 0;
  return 0;
};

export default function MainsQAList() {
  const { mainsId, module_type } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const categoryLabel = state?.categoryLabel || module_type;
  const item          = state?.item || null;
  const isEnrolled    = state?.isEnrolled || false;

  const [qaList,  setQaList]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    getMainsQAList({ moduleId:mainsId, module:'mains', module_type, page, limit:PAGE_SIZE })
      .then(r=>{ if(r.statusCode===200){ setQaList(r.data??[]); setTotal(r.totalCount??r.data?.length??0); } })
      .catch(console.error).finally(()=>setLoading(false));
  }, [mainsId, module_type, page]);

  const iconFor = (mt) => mt==='MQA' ? '📝' : mt==='MET' ? '✍️' : '📋';

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          <div className="page-section-head">
            <h1 className="page-section-title">{categoryLabel} {!loading&&<span className="page-section-count">{total}</span>}</h1>
          </div>

          {loading ? <Loader /> : qaList.length===0 ? (
            <div className="empty-state"><div className="empty-state-icon">{iconFor(module_type)}</div><h3>No items available</h3></div>
          ) : (
            <>
              <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
                {qaList.map((qa,i) => {
                  const qaId = qa.qa_id || qa.mains_qa_id || qa.id || qa._id || i;
                  const isLocked = qa.isLocked ?? qa.is_locked ?? false;
                  const attempts = parseAttemptCount(qa);

                  return (
                    <div key={qaId} className="card" style={{ cursor:'pointer', opacity: isLocked ? 0.7 : 1 }}
                      onClick={() => {
                        if (isLocked) { navigate(`/mains/${mainsId}`, { state:{ item, scrollToBuy:true } }); return; }
                        navigate(`/mains/${mainsId}/qa/${module_type}/${qaId}`, { state:{ qa, item, module_type, categoryLabel, isEnrolled } });
                      }}>
                    <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:42, height:42, borderRadius:'var(--radius-md)', background:isLocked?'var(--gray-100)':'var(--gold-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>
                        {isLocked ? '🔒' : iconFor(module_type)}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'.9rem' }}>{qa.title || `${categoryLabel} ${i+1}`}</div>
                        {qa.question_count && <div style={{ fontSize:'.78rem', color:'var(--gray-400)', marginTop:'.1rem' }}>{qa.question_count} Questions</div>}
                        {attempts > 0 && <div style={{ fontSize:'.78rem', color:'var(--gray-500)', marginTop:'.25rem' }}>{attempts} Attempt{attempts > 1 ? 's' : ''}</div>}
                      </div>
                      <span style={{ color:isLocked?'var(--gray-300)':'var(--gold)' }}>{isLocked?'🔒':'→'}</span>
                    </div>
                   </div>
                  );
                })}
              </div>
              <Pagination page={page} totalPages={Math.ceil(total/PAGE_SIZE)} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
