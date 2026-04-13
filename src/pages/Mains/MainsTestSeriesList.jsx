import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getMainsTests, getMainsSubjectTests, getMainsTestAttempts } from '../../api/mains/mainsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const STATUS_STYLES = {
  result:    { bg:'var(--success-bg)', color:'var(--success)',  label:'Result Available' },
  evaluated: { bg:'var(--success-bg)', color:'var(--success)',  label:'Evaluated'        },
  submitted: { bg:'var(--info-bg)',    color:'var(--info)',     label:'Submitted'        },
  pending:   { bg:'var(--warning-bg)', color:'var(--warning)',  label:'Pending'          },
};

export default function MainsTestSeriesList() {
  const { mainsId }  = useParams();
  const navigate     = useNavigate();
  const { state }    = useLocation();
  const item         = state?.item || null;
  const isEnrolled   = state?.isEnrolled || false;

  const [tests,      setTests]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [subjects,   setSubjects]   = useState([]);
  const [attempts,   setAttempts]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('subjects');
  const [subLoad,    setSubLoad]    = useState(false);
  const [attLoad,    setAttLoad]    = useState(false);
  const [attFetched, setAttFetched] = useState(false);
  const [termsModal, setTermsModal] = useState(null);
  const [accepted,   setAccepted]   = useState(false);

  useEffect(() => {
    setLoading(true);
    getMainsTests(mainsId, 1, 50)
      .then(r => {
        if (r.statusCode===200) {
          setTests(r.data??[]);
          if (r.data?.length) loadSubjects(r.data[0].mains_test_id);
        }
      })
      .catch(console.error).finally(() => setLoading(false));
  }, [mainsId]);

  const loadSubjects = (testId) => {
    setActiveTest(testId);
    setSubLoad(true);
    setAttFetched(false);
    setAttempts(null);
    getMainsSubjectTests(testId, 1, 50)
      .then(r => { if (r.statusCode===200) setSubjects(r.data??[]); })
      .catch(console.error).finally(() => setSubLoad(false));
  };

  const loadAttempts = (testId) => {
    if (attFetched) return;
    setAttLoad(true);
    getMainsTestAttempts(testId)
      .then(r => { if (r.statusCode===200) setAttempts(r.data); })
      .catch(console.error).finally(() => { setAttLoad(false); setAttFetched(true); });
  };

  const allAttempts = attempts?.attempts?.flatMap(a => a.subjects.map(s => ({ ...s, attempt_no:a.attempt_no }))) || [];

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div style={{ marginBottom:'1.25rem' }}>
            <span className="badge badge-navy" style={{ marginBottom:'.5rem' }}>Test Series</span>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.3rem,2vw,1.7rem)', color:'var(--navy)' }}>{item?.title || 'Mains Test Series'}</h1>
          </div>

          {loading ? <Loader /> : tests.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No test series available</h3></div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'1.5rem', alignItems:'start' }}>

              {/* Tests sidebar */}
              <div className="card" style={{ position:'sticky', top:'calc(var(--header-h) + 1.5rem)' }}>
                <div className="card-header">Tests</div>
                <div style={{ padding:'.35rem' }}>
                  {tests.map(t => (
                    <button key={t.mains_test_id}
                      onClick={() => { setActiveTab('subjects'); loadSubjects(t.mains_test_id); }}
                      style={{ display:'flex', alignItems:'center', gap:'.65rem', width:'100%', padding:'.65rem .85rem', borderRadius:'var(--radius-md)', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'.845rem', fontWeight:600, background: activeTest===t.mains_test_id ? 'var(--navy)' : 'transparent', color: activeTest===t.mains_test_id ? 'var(--cream)' : 'var(--gray-600)', transition:'all .18s', textAlign:'left', marginBottom:'.15rem' }}>
                      <span>📋</span>
                      <span style={{ flex:1 }}>{t.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                {activeTest && (
                  <>
                    <div className="tabs" style={{ marginBottom:'1.25rem' }}>
                      <button className={`tab-btn ${activeTab==='subjects'?'active':''}`} onClick={() => setActiveTab('subjects')}>
                        📋 Subjects {!subLoad && <span className="tab-badge">{subjects.length}</span>}
                      </button>
                      <button className={`tab-btn ${activeTab==='attempts'?'active':''}`}
                        onClick={() => { setActiveTab('attempts'); loadAttempts(activeTest); }}>
                        📊 My Attempts
                      </button>
                    </div>

                    {activeTab === 'subjects' && (
                      subLoad ? <Loader /> : subjects.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No subjects available</h3></div>
                      ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
                          {subjects.map(sub => (
                            <div key={sub.mains_subject_test_id} className="card">
                              <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1.25rem', flexWrap:'wrap' }}>
                                <div style={{ flex:1 }}>
                                  <h3 style={{ fontWeight:700, color:'var(--navy)', marginBottom:'.4rem' }}>{sub.title}</h3>
                                  <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
                                    {sub.no_of_qos && <span className="badge badge-gray">📝 {sub.no_of_qos} Qs</span>}
                                    {sub.duration   && <span className="badge badge-gray">⏱ {sub.duration}</span>}
                                    {sub.marks      && <span className="badge badge-gray">🏆 {sub.marks} Marks</span>}
                                  </div>
                                </div>
                                <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                                  {isEnrolled ? (
                                    <>
                                      {sub.question_paper_file && (
                                        <a href={sub.question_paper_file} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">📄 Paper</a>
                                      )}
                                      <button className="btn btn-primary btn-sm" onClick={() => { setTermsModal(sub); setAccepted(false); }}>
                                        Start Test
                                      </button>
                                    </>
                                  ) : (
                                    <span className="badge badge-gray">🔒 Enroll to access</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {activeTab === 'attempts' && (
                      attLoad ? <Loader /> : allAttempts.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No attempts yet</h3></div>
                      ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                          {attempts?.attempts?.map(group => (
                            <div key={group.attempt_no}>
                              <div style={{ fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)', marginBottom:'.5rem' }}>
                                Attempt {group.attempt_no}
                              </div>
                              <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                                {group.subjects.map(sub => {
                                  const st = STATUS_STYLES[sub.status] || STATUS_STYLES.pending;
                                  return (
                                    <div key={sub.mains_subject_test_id} className="card">
                                      <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                                        <div style={{ flex:1 }}>
                                          <h3 style={{ fontWeight:700, color:'var(--navy)', marginBottom:'.3rem' }}>{sub.title}</h3>
                                          <div style={{ display:'flex', gap:'.4rem' }}>
                                            {sub.no_of_qos && <span className="badge badge-gray">📝 {sub.no_of_qos} Qs</span>}
                                          </div>
                                        </div>
                                        <div style={{ display:'flex', alignItems:'center', gap:'.75rem', flexWrap:'wrap' }}>
                                          <span className="badge" style={{ background:st.bg, color:st.color }}>{st.label}</span>
                                          {sub.result && (
                                            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--navy)' }}>
                                              {sub.result.marks_scored}
                                              <span style={{ fontSize:'.72rem', color:'var(--gray-400)', marginLeft:'.25rem' }}>/ {sub.result.overall_percentage?.toFixed(0)}%</span>
                                            </div>
                                          )}
                                          {sub.result && (
                                            <button className="btn btn-outline btn-sm"
                                              onClick={() => navigate(`/mains/${mainsId}/test/${activeTest}/result/${sub.result.mains_result_id}`, { state:{ result:sub.result, subject:sub, attempt_no:group.attempt_no } })}>
                                              View Result
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      {termsModal && (
        <div className="modal-overlay" onClick={() => setTermsModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start Test — Important Note</h3>
              <button className="modal-close" onClick={() => setTermsModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <ol style={{ paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'.65rem', color:'var(--gray-700)', fontSize:'.875rem', lineHeight:1.7 }}>
                <li>Are you sure you want to start <strong>{termsModal.title}</strong>?</li>
                <li>Once the test begins, you must complete it within <strong>{termsModal.duration || '3 Hours'}</strong>.</li>
                <li>After submission, you'll get 15 minutes grace to scan, convert to PDF, and upload your answer sheets.</li>
                <li>Once started, the test cannot be paused or restarted.</li>
              </ol>
              <label className="checkbox-row" style={{ marginTop:'1.25rem' }}>
                <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
                <span>I accept the Terms &amp; Conditions</span>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setTermsModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={!accepted}
                onClick={() => {
                  setTermsModal(null);
                  navigate(`/mains/${mainsId}/test/${activeTest}/attempt/${termsModal.mains_subject_test_id}`, {
                    state: { subject:termsModal, isEnrolled, testTitle: tests.find(t=>t.mains_test_id===activeTest)?.title }
                  });
                }}>
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
