import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { getTestAttempts } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';
import './exam.css';

export default function ExamResult() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const [activeTab,     setActiveTab]     = useState('result');   // 'result' | 'attempts' | 'review'
  const [pastAttempts,  setPastAttempts]  = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  useEffect(() => {
    if (!state?.questions) navigate('/prelims');
  }, [state, navigate]);

  if (!state?.questions) return null;

  const {
    answers      = {},
    questions,
    auto         = false,
    test,
    item,
    categoryLabel,
    module_type,
    prelimsId,
    prelimes_test_id,
  } = state;

  // Score computation
  let correct = 0, wrong = 0, skipped = 0;
  const totalInSet = questions.length;

  questions.forEach((q, idx) => {
    const qNum    = q.question_number ?? (idx + 1);
    const userAns = answers[qNum];
    // API: correctAnswer is 1-indexed; options array is 0-indexed
    const correctIdx = (q.correctAnswer != null ? q.correctAnswer - 1 : q.correct);
    if (userAns === undefined)        skipped++;
    else if (userAns === correctIdx)  correct++;
    else                              wrong++;
  });

  const total      = test?.no_of_qos ? parseInt(test.no_of_qos, 10) : totalInSet;
  const score      = correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const now        = new Date();

  const getRank = () => {
    if (percentage >= 90) return { label:'Excellent',         color:'#16a34a', bg:'#dcfce7', icon:'🏆' };
    if (percentage >= 75) return { label:'Good',              color:'#2563eb', bg:'#dbeafe', icon:'🎯' };
    if (percentage >= 60) return { label:'Average',           color:'#d97706', bg:'#fef3c7', icon:'📈' };
    return                       { label:'Needs Improvement', color:'#dc2626', bg:'#fee2e2', icon:'📚' };
  };
  const rank = getRank();

  const typeLabel = { QZ:'Quiz', SMT:'Subject Mock Test', GT:'Grand Test', PQA:'Previous Year' };

  // Load past attempts
  const loadAttempts = async () => {
    if (!prelimes_test_id || pastAttempts.length) { setActiveTab('attempts'); return; }
    setActiveTab('attempts');
    setAttemptsLoading(true);
    try {
      const r = await getTestAttempts({ prelimes_test_id });
      if (r.statusCode === 200) setPastAttempts(r.data ?? []);
    } catch (e) { console.error(e); }
    finally { setAttemptsLoading(false); }
  };

  const handleRetake = () => {
    navigate(`/prelims/${prelimsId}/exam-terms`, {
      state: { test, item, isEnrolled: true, categoryLabel, prelimsId, module_type }
    });
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <div className="result-shell">

            {/* Hero Card */}
            <div className="result-hero">
              {auto && <div className="result-auto-badge">⏰ Time's up — Auto submitted</div>}
              <div className="result-rank-badge" style={{ background: rank.bg, color: rank.color }}>
                <span>{rank.icon}</span> {rank.label}
              </div>
              <h1 className="result-title">Test Completed!</h1>
              <p className="result-subtitle">{test?.title || categoryLabel} · {typeLabel[module_type] || module_type}</p>
              <div className="result-date">
                {now.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })} &nbsp;·&nbsp;
                {now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
              </div>

              {/* Score Circle */}
              <div className="result-score-wrap">
                <div className="result-score-circle" style={{ '--pct': percentage, '--color': rank.color }}>
                  <div className="result-score-inner">
                    <span className="result-score-num">{score}</span>
                    <span className="result-score-total">/{total}</span>
                    <span className="result-score-pct">{percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="result-stats-row">
                <div className="result-stat correct">
                  <span className="rs-icon">✅</span>
                  <span className="rs-val">{correct}</span>
                  <span className="rs-label">Correct</span>
                </div>
                <div className="result-stat wrong">
                  <span className="rs-icon">❌</span>
                  <span className="rs-val">{wrong}</span>
                  <span className="rs-label">Wrong</span>
                </div>
                <div className="result-stat skipped">
                  <span className="rs-icon">⏭</span>
                  <span className="rs-val">{skipped}</span>
                  <span className="rs-label">Skipped</span>
                </div>
                <div className="result-stat" style={{ borderLeft:'1px solid var(--gray-200)', paddingLeft:'1rem' }}>
                  <span className="rs-icon">📊</span>
                  <span className="rs-val" style={{ color:'var(--navy)' }}>{percentage}%</span>
                  <span className="rs-label">Score</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="result-actions">
              <button className="btn btn-secondary" onClick={() => navigate(-3)}>← Back to Tests</button>
              <button className="btn btn-secondary" onClick={loadAttempts}>📊 All Attempts</button>
              <button className="btn btn-primary" onClick={handleRetake}>🔄 Retake Test</button>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', gap:'.5rem', borderBottom:'2px solid var(--gray-200)', marginBottom:'1rem' }}>
              {[
                { id:'result',   label:'This Attempt' },
                { id:'attempts', label:'Attempt History' },
                { id:'review',   label:'Question Review' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => tab.id === 'attempts' ? loadAttempts() : setActiveTab(tab.id)}
                  style={{
                    padding:'.6rem 1.1rem', border:'none', background:'none', cursor:'pointer',
                    fontWeight: activeTab === tab.id ? 800 : 500,
                    color: activeTab === tab.id ? 'var(--navy)' : 'var(--gray-500)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--navy)' : '2px solid transparent',
                    marginBottom:'-2px', fontSize:'.875rem', transition:'all .15s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: This Attempt Summary */}
            {activeTab === 'result' && (
              <div className="result-review">
                <h2 className="result-review-title">Performance Summary</h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'1rem' }}>
                  {[
                    { label:'Questions Attempted', value: answered => `${Object.keys(answers).length} / ${total}`, icon:'📝' },
                    { label:'Correct Answers',     value: () => correct,   icon:'✅', color:'#16a34a' },
                    { label:'Wrong Answers',        value: () => wrong,    icon:'❌', color:'#dc2626' },
                    { label:'Skipped',              value: () => skipped,  icon:'⏭', color:'var(--gray-500)' },
                    { label:'Score (%)',             value: () => `${percentage}%`, icon:'📊', color: rank.color },
                    { label:'Marks Obtained',        value: () => `${correct} / ${total}`, icon:'🏅' },
                  ].map((s, i) => (
                    <div key={i} className="card" style={{ textAlign:'center' }}>
                      <div className="card-body" style={{ padding:'1rem' }}>
                        <div style={{ fontSize:'1.4rem', marginBottom:'.3rem' }}>{s.icon}</div>
                        <div style={{ fontWeight:800, fontSize:'1.1rem', color: s.color || 'var(--navy)' }}>{s.value()}</div>
                        <div style={{ fontSize:'.73rem', color:'var(--gray-500)', marginTop:'.15rem' }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Attempt History */}
            {activeTab === 'attempts' && (
              <div className="result-review">
                <h2 className="result-review-title">Attempt History</h2>
                {attemptsLoading ? (
                  <div style={{ textAlign:'center', padding:'2rem', color:'var(--gray-500)' }}>Loading attempts…</div>
                ) : pastAttempts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No past attempts found</h3>
                    <p style={{ color:'var(--gray-500)', fontSize:'.875rem' }}>This is your first attempt or attempts couldn't be loaded.</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                    {pastAttempts.map((attempt, i) => {
                      const pct = attempt.percentage ?? Math.round(((attempt.correct_answers ?? 0) / (attempt.total_questions ?? total)) * 100);
                      const rankC = pct >= 90 ? '#16a34a' : pct >= 75 ? '#2563eb' : pct >= 60 ? '#d97706' : '#dc2626';
                      return (
                        <div key={attempt.attempt_id || i} className="card" style={{ border:'1.5px solid var(--gray-200)' }}>
                          <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                            <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--navy)', color:'var(--white)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'.9rem', flexShrink:0 }}>
                              #{i+1}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'.9rem' }}>Attempt {i+1}</div>
                              <div style={{ fontSize:'.75rem', color:'var(--gray-500)', marginTop:'.15rem' }}>
                                {attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                              </div>
                            </div>
                            <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
                              <div style={{ textAlign:'center' }}>
                                <div style={{ fontWeight:800, color:'#16a34a', fontSize:'1rem' }}>{attempt.correct_answers ?? '—'}</div>
                                <div style={{ fontSize:'.68rem', color:'var(--gray-500)' }}>Correct</div>
                              </div>
                              <div style={{ textAlign:'center' }}>
                                <div style={{ fontWeight:800, color:'#dc2626', fontSize:'1rem' }}>{attempt.wrong_answers ?? '—'}</div>
                                <div style={{ fontSize:'.68rem', color:'var(--gray-500)' }}>Wrong</div>
                              </div>
                              <div style={{ textAlign:'center' }}>
                                <div style={{ fontWeight:800, color: rankC, fontSize:'1rem' }}>{pct}%</div>
                                <div style={{ fontSize:'.68rem', color:'var(--gray-500)' }}>Score</div>
                              </div>
                            </div>
                            <span style={{ fontSize:'.75rem', fontWeight:700, padding:'.2rem .6rem', borderRadius:'var(--radius-full)', background: pct >= 60 ? '#dcfce7' : '#fee2e2', color: pct >= 60 ? '#16a34a' : '#dc2626' }}>
                              {pct >= 60 ? '✓ Pass' : '✗ Fail'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Question Review */}
            {activeTab === 'review' && (
              <div className="result-review">
                <h2 className="result-review-title">Detailed Question Review</h2>
                {questions.length === 0 ? (
                  <p style={{ color:'var(--gray-500)', fontSize:'.875rem' }}>Question details not available.</p>
                ) : (
                  <div className="result-q-list">
                    {questions.map((q, idx) => {
                      const qNum       = q.question_number ?? (idx + 1);
                      const correctIdx = q.correctAnswer != null ? q.correctAnswer - 1 : q.correct;
                      const userAns    = answers[qNum];
                      const isCorrect  = userAns === correctIdx;
                      const isSkipped  = userAns === undefined;
                      const status     = isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong';

                      return (
                        <div key={q.questionId || q.id || idx} className={`result-q-item ${status}`}>
                          <div className="result-q-top">
                            <span className={`result-q-badge ${status}`}>
                              {status==='correct' ? '✅ Correct' : status==='wrong' ? '❌ Wrong' : '⏭ Skipped'}
                            </span>
                            <span className="result-q-num">Q{qNum}</span>
                          </div>
                          <p className="result-q-text">{q.question}</p>
                          <div className="result-q-options">
                            {q.options.map((opt, i) => {
                              let cls = 'result-opt';
                              if (i === correctIdx)             cls += ' correct-ans';
                              if (i === userAns && !isCorrect) cls += ' wrong-ans';
                              return (
                                <div key={i} className={cls}>
                                  <span className="result-opt-label">{String.fromCharCode(65+i)}</span>
                                  <span className="result-opt-text">{opt}</span>
                                  {i === correctIdx && <span className="result-opt-tag correct">✓ Correct</span>}
                                  {i === userAns && !isCorrect && <span className="result-opt-tag wrong">✗ Your Answer</span>}
                                </div>
                              );
                            })}
                          </div>

                          {/* Summary / Explanation */}
                          {q.summary?.length > 0 && (
                            <div style={{ marginTop:'.85rem', padding:'.75rem', background:'rgba(255,255,255,.8)', borderRadius:'var(--radius-md)', borderLeft:'3px solid var(--gold)', fontSize:'.82rem', color:'var(--gray-700)', lineHeight:1.65 }}>
                              <strong style={{ color:'var(--navy)', display:'block', marginBottom:'.3rem' }}>💡 Explanation</strong>
                              {q.summary.map((s, si) => <p key={si} style={{ margin:'0 0 .35rem 0' }}>{s}</p>)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}