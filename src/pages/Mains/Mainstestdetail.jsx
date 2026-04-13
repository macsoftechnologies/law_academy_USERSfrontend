import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getMainsTestDetail, getMainsSubjectTests, getMainsTestAttempts } from '../../api/mains/mainsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const STATUS = {
  result:    { bg:'var(--success-bg)', color:'var(--success)', label:'Result Available' },
  evaluated: { bg:'var(--success-bg)', color:'var(--success)', label:'Evaluated'        },
  submitted: { bg:'var(--info-bg)',    color:'var(--info)',    label:'Submitted'         },
  pending:   { bg:'var(--warning-bg)', color:'var(--warning)', label:'Pending'          },
};

export default function MainsTestDetail() {
  const { mainsId, testId } = useParams();
  const navigate            = useNavigate();
  const { state }           = useLocation();
  const isEnrolled          = state?.isEnrolled || false;

  const [detail,     setDetail]     = useState(null);
  const [subjects,   setSubjects]   = useState([]);
  const [attempts,   setAttempts]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('subjects');
  const [detLoad,    setDetLoad]    = useState(true);
  const [subLoad,    setSubLoad]    = useState(true);
  const [attLoad,    setAttLoad]    = useState(false);
  const [attFetched, setAttFetched] = useState(false);
  const [termsModal, setTermsModal] = useState(null);
  const [accepted,   setAccepted]   = useState(false);

  useEffect(() => {
    getMainsTestDetail(testId).then(r=>{ if(r.statusCode===200) setDetail(Array.isArray(r.data)?r.data[0]:r.data); }).catch(console.error).finally(()=>setDetLoad(false));
    getMainsSubjectTests(testId,1,50).then(r=>{ if(r.statusCode===200) setSubjects(r.data??[]); }).catch(console.error).finally(()=>setSubLoad(false));
  }, [testId]);

  useEffect(() => {
    if (activeTab!=='attempts'||attFetched) return;
    setAttLoad(true);
    getMainsTestAttempts(testId).then(r=>{ if(r.statusCode===200) setAttempts(r.data); }).catch(console.error).finally(()=>{ setAttLoad(false); setAttFetched(true); });
  }, [activeTab, attFetched, testId]);

  const test        = detail || state?.test;
  const allAttempts = attempts?.attempts?.flatMap(a=>a.subjects.map(s=>({...s, attempt_no:a.attempt_no})))||[];

  const handleStartAttempt = (subject) => {
    if (!isEnrolled) { navigate(`/mains/${mainsId}`,{state:{scrollToBuy:true}}); return; }
    setTermsModal(subject); setAccepted(false);
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          {detLoad ? <Loader /> : (
            <>
              {test && (
                <div className="detail-hero" style={{ marginBottom:'1.5rem' }}>
                  <div className="detail-hero-img">
                    {test.presentation_image ? <img src={`${BASE_URL}/${test.presentation_image}`} alt={test.title} /> : <div className="detail-hero-img-placeholder">📋</div>}
                  </div>
                  <div className="detail-hero-body">
                    <div className="detail-hero-tag"><span className="badge badge-navy">Mains Test</span></div>
                    <h1 className="detail-hero-title">{test.title}</h1>
                    {test.sub_title && <p className="detail-hero-sub">{test.sub_title}</p>}
                    <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                      {test.no_of_qs      && <span className="badge badge-gray">📝 {test.no_of_qs} Questions</span>}
                      {test.no_of_subjects && <span className="badge badge-gray">📚 {test.no_of_subjects} Subjects</span>}
                      {test.duration      && <span className="badge badge-gray">⏱ {test.duration}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="tabs" style={{ marginBottom:'1.25rem' }}>
                <button className={`tab-btn ${activeTab==='subjects'?'active':''}`} onClick={()=>setActiveTab('subjects')}>📚 Subjects</button>
                <button className={`tab-btn ${activeTab==='attempts'?'active':''}`} onClick={()=>setActiveTab('attempts')}>📋 My Attempts</button>
              </div>

              {activeTab==='subjects' && (
                subLoad ? <Loader /> : subjects.length===0 ? (
                  <div className="empty-state"><div className="empty-state-icon">📚</div><h3>No subjects available</h3></div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                    {subjects.map((sub,i) => (
                      <div key={sub.subject_test_id||i} className="card">
                        <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                          <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'var(--gold-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>📄</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'.9rem' }}>{sub.title}</div>
                            <div style={{ display:'flex', gap:'.4rem', marginTop:'.3rem', flexWrap:'wrap' }}>
                              {sub.no_of_qs  && <span className="badge badge-gray">📝 {sub.no_of_qs} Qs</span>}
                              {sub.duration  && <span className="badge badge-gray">⏱ {sub.duration}</span>}
                              {sub.max_marks && <span className="badge badge-gray">🏆 {sub.max_marks} Marks</span>}
                            </div>
                          </div>
                          <button className="btn btn-primary btn-sm" onClick={()=>handleStartAttempt(sub)}>
                            {isEnrolled ? 'Start Attempt →' : '🔒 Enroll to Attempt'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab==='attempts' && (
                attLoad ? <Loader /> : allAttempts.length===0 ? (
                  <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No attempts yet</h3><p>Start a subject test to see your attempts here.</p></div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
                    {allAttempts.map((a,i) => {
                      const st = STATUS[a.status]||STATUS.pending;
                      return (
                        <div key={i} className="card">
                          <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'.9rem' }}>{a.title}</div>
                              <div style={{ fontSize:'.78rem', color:'var(--gray-400)', marginTop:'.2rem' }}>Attempt #{a.attempt_no}</div>
                            </div>
                            <span style={{ background:st.bg, color:st.color, padding:'.3rem .7rem', borderRadius:'var(--radius-full)', fontSize:'.75rem', fontWeight:700 }}>{st.label}</span>
                            {(a.status==='result'||a.status==='evaluated') && (
                              <button className="btn btn-outline btn-sm" onClick={()=>navigate(`/mains/${mainsId}/test/${testId}/result/${a.result_id}`,{state:{result:a,subject:a,attempt_no:a.attempt_no}})}>View Result</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}

          {/* Terms modal */}
          {termsModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Terms & Instructions</h3>
                  <button className="modal-close" onClick={()=>setTermsModal(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <ul style={{ paddingLeft:'1.2rem', color:'var(--gray-600)', fontSize:'.88rem', lineHeight:2 }}>
                    <li>Write your answer clearly in the provided space.</li>
                    <li>You have {termsModal.duration||'3 Hours'} to complete this test.</li>
                    <li>Upload your answer sheet as a PDF or image before submitting.</li>
                    <li>Ensure stable internet before starting.</li>
                    <li>Once submitted, answers cannot be changed.</li>
                  </ul>
                  <label className="checkbox-row" style={{ marginTop:'1rem' }}>
                    <input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} />
                    <span>I have read and agree to the terms and instructions</span>
                  </label>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={()=>setTermsModal(null)}>Cancel</button>
                  <button className="btn btn-primary" disabled={!accepted}
                    onClick={()=>{ setTermsModal(null); navigate(`/mains/${mainsId}/test/${testId}/attempt/${termsModal.subject_test_id}`,{state:{subject:termsModal,isEnrolled}}); }}>
                    Start Test →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
