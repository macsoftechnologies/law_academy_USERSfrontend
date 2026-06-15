import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/formatDate';
import { getUserTestAttempts, getPrelimsResult } from '../../api/prelims/prelimsApi';
import { updateMarksProgress } from '../../api/marksDashboard';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';
import './exam.css';

export default function ExamResult() {
  const { prelimsId, testId, attemptId } = useParams();
  const { state } = useLocation();
  const navigate  = useNavigate();

  const [activeTab,       setActiveTab]       = useState('result');
  const [pastAttempts,    setPastAttempts]    = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  const initExamState = () => {
    if (state) return state;
    const cached = sessionStorage.getItem(`mocktest_${testId}`);
    return cached ? JSON.parse(cached) : {};
  };
  const [examState] = useState(initExamState);

  const {
    answers      = {},
    questions    = [],
    auto         = false,
    test,
    item,
    categoryLabel,
    module_type,
    prelimes_test_id,
  } = examState;

  const [backendResult, setBackendResult] = useState(examState?.result || null);
  const [loadingResult, setLoadingResult] = useState(!examState?.result && attemptId && attemptId !== 'no-id');
  const progressSent = useRef(false);

  useEffect(() => {
    if (!examState?.result && attemptId && attemptId !== 'no-id') {
      getPrelimsResult({ attemptId })
        .then(r => {
           if (r.statusCode === 200) setBackendResult(r.data);
        })
        .finally(() => setLoadingResult(false));
    }
  }, [examState, attemptId]);

  // Fire update-progress once when exam result is shown
  useEffect(() => {
    if (progressSent.current) return;
    const userId = localStorage.getItem('userId');
    if (!userId || !prelimsId) return;
    progressSent.current = true;
    const itemId = testId || prelimes_test_id || item?._id || null;
    updateMarksProgress(userId, prelimsId, itemId, 'prelimes', 'civil', true).catch(() => {});
  }, [prelimsId, testId, prelimes_test_id, item]);

  if (loadingResult) return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <Loader />
        </div>
      </div>
    </div>
  );

  const currentTestId =
    prelimes_test_id ||
    test?.prelimes_test_id ||
    test?.id ||
    test?._id ||
    null;

  // ── Score: Strictly use backend result ──────────
  let correct = 0, wrong = 0, skipped = 0, total = 0, score = 0, percentage = 0;

  if (backendResult) {
    const scoreStr = typeof backendResult.score === 'string' && backendResult.score.includes('/')
      ? backendResult.score : null;
    const [parsedCorrect, parsedTotal] = scoreStr
      ? scoreStr.split('/').map(n => parseInt(n.trim(), 10))
      : [null, null];

    total      = backendResult.total_questions ?? parsedTotal ?? (test?.no_of_qos ? parseInt(test.no_of_qos, 10) : questions.length);
    correct    = backendResult.correct_answers  ?? backendResult.correct_count  ?? backendResult.correct  ?? parsedCorrect ?? 0;
    wrong      = backendResult.wrong_answers    ?? backendResult.wrong_count    ?? backendResult.wrong    ?? 0;
    skipped    = backendResult.skipped          ?? backendResult.unattempted    ?? backendResult.skipped_count ?? (total - correct - wrong);
    score      = correct;
    percentage = backendResult.percentage ?? backendResult.score_percentage ?? 0;
  }

  // "Questions Attempted" = answered questions (total - skipped), consistent with backend
  const attempted = total - skipped;

  const now = new Date();

  const getRank = () => {
    const label = backendResult?.status ?? backendResult?.rank_label ?? backendResult?.rank ?? backendResult?.label ?? null;
    if (!label) return null;
    if (/excell?ent|pass/i.test(label)) return { label, color: '#16a34a', bg: '#dcfce7', icon: '✅' };
    if (/good/i.test(label))       return { label, color: '#2563eb', bg: '#dbeafe', icon: '🎯' };
    if (/average/i.test(label))    return { label, color: '#d97706', bg: '#fef3c7', icon: '📈' };
    if (/fail/i.test(label))       return { label, color: '#dc2626', bg: '#fee2e2', icon: '❌' };
    return { label, color: 'var(--navy)', bg: 'var(--gray-100)', icon: '📚' };
  };
  const rank = getRank();

  const typeLabel = { QZ: 'Quiz', SMT: 'Subject Mock Test', GT: 'Grand Test', PQA: 'Previous Year' };

  const loadAttempts = async () => {
    if (pastAttempts.length) { setActiveTab('attempts'); return; }
    setActiveTab('attempts');
    setAttemptsLoading(true);
    try {
      if (currentTestId) {
        const r = await getUserTestAttempts(currentTestId);
        if (r?.statusCode === 200 && r?.data) {
          const allAttempts = Array.isArray(r.data) ? r.data : [];
          setPastAttempts(allAttempts);
        }
      }
    } catch {
      // silently fail — empty state shown
    } finally {
      setAttemptsLoading(false);
    }
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

            <div className="result-hero">
              {auto && <div className="result-auto-badge">⏰ Time's up — Auto submitted</div>}
              {rank && (
                <div className="result-rank-badge" style={{ background: rank.bg, color: rank.color }}>
                  <span>{rank.icon}</span> {rank.label}
                </div>
              )}
              <h1 className="result-title">Test Completed!</h1>
              <p className="result-subtitle">{test?.title || categoryLabel} · {typeLabel[module_type] || module_type}</p>
              <div className="result-date">{formatDateTime(now)}</div>

              <div className="result-score-wrap">
                <div className="result-score-circle" style={{ '--pct': percentage, '--color': rank?.color || 'var(--navy)' }}>
                  <div className="result-score-inner">
                    <span className="result-score-num">{score}</span>
                    <span className="result-score-total">/{total}</span>
                    <span className="result-score-pct">{percentage}%</span>
                  </div>
                </div>
              </div>

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
                <div className="result-stat" style={{ borderLeft: '1px solid var(--gray-200)', paddingLeft: '1rem' }}>
                  <span className="rs-icon">📊</span>
                  <span className="rs-val" style={{ color: 'var(--navy)' }}>{percentage}%</span>
                  <span className="rs-label">Score</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button className="btn btn-secondary" onClick={() => {
                if (module_type === 'SMT') {
                  const subjectId = test?.mocktest_subject_id || item?.mocktest_subject_id || item?._id;
                  if (subjectId) {
                    navigate(`/prelims/smt/${subjectId}`, { state: { subject: item, isEnrolled: true } });
                    return;
                  }
                } else if (['QZ', 'GT', 'PQA'].includes(module_type)) {
                  navigate(`/prelims/${prelimsId}/qa/${module_type}`, { state: { item, isEnrolled: true } });
                  return;
                }
                navigate('/prelims');
              }}>← Back to Tests</button>
              <button className="btn btn-secondary" onClick={loadAttempts}>📊 All Attempts</button>
              <button className="btn btn-primary" onClick={handleRetake}>🔄 Retake Test</button>
            </div>

            <div style={{ display: 'flex', gap: '.5rem', borderBottom: '2px solid var(--gray-200)', marginBottom: '1rem' }}>
              {[
                { id: 'result',   label: 'This Attempt' },
                { id: 'attempts', label: 'Attempt History' },
                ...(questions.length > 0 ? [{ id: 'review',   label: 'Question Review' }] : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => tab.id === 'attempts' ? loadAttempts() : setActiveTab(tab.id)}
                  style={{
                    padding: '.6rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
                    fontWeight: activeTab === tab.id ? 800 : 500,
                    color: activeTab === tab.id ? 'var(--navy)' : 'var(--gray-500)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--navy)' : '2px solid transparent',
                    marginBottom: '-2px', fontSize: '.875rem', transition: 'all .15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: This Attempt */}
            {activeTab === 'result' && (
              <div className="result-review">
                <h2 className="result-review-title">Performance Summary</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Questions Attempted', value: () => `${attempted} / ${total}`, icon: '📝' },
                    { label: 'Correct Answers',      value: () => correct,                   icon: '✅', color: '#16a34a' },
                    { label: 'Wrong Answers',         value: () => wrong,                    icon: '❌', color: '#dc2626' },
                    { label: 'Skipped',               value: () => skipped,                  icon: '⏭', color: 'var(--gray-500)' },
                    { label: 'Score (%)',              value: () => `${percentage}%`,         icon: '📊', color: rank?.color || 'var(--navy)' },
                    { label: 'Marks Obtained',         value: () => `${correct} / ${total}`, icon: '🏅' },
                  ].map((s, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center' }}>
                      <div className="card-body" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '1.4rem', marginBottom: '.3rem' }}>{s.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: s.color || 'var(--navy)' }}>{s.value()}</div>
                        <div style={{ fontSize: '.73rem', color: 'var(--gray-500)', marginTop: '.15rem' }}>{s.label}</div>
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
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Loading attempts…</div>
                ) : pastAttempts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No past attempts found</h3>
                    <p style={{ color: 'var(--gray-500)', fontSize: '.875rem' }}>This is your first attempt or attempts couldn't be loaded.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    {pastAttempts.map((attempt, i) => {
                      // Exact field names from API:
                      // attempt.attemptNumber, attempt.submittedAt, attempt.prelimes_attempt_id
                      // attempt.result  → nested object with score data
                      // attempt.answers → [{isCorrect, selectedAnswer, ...}]
                      // attempt.testInfo → test metadata

                      const attNum = attempt.attemptNumber ?? attempt.attempt_number ?? attempt.attempt_no ?? (i + 1);
                      const submittedAt = attempt.submittedAt ?? attempt.submitted_at ?? attempt.createdAt;

                      // Nested result object — where the score lives
                      const res = attempt.result ?? {};

                      // Score string e.g. "1/4" may be on result or attempt
                      const rawScore = res.score ?? attempt.score ?? res.result ?? null;
                      const scoreStr = typeof rawScore === 'string' && rawScore.includes('/')
                        ? rawScore : null;
                      const [parsedCorrect, parsedTotal] = scoreStr
                        ? scoreStr.split('/').map(n => parseInt(n.trim(), 10))
                        : [null, null];

                      // Total questions — from result, testInfo, score string, or current test
                      const attTotal = res.total_questions
                        ?? (attempt.testInfo?.no_of_qos ? parseInt(attempt.testInfo.no_of_qos, 10) : null)
                        ?? parsedTotal
                        ?? total;

                      // Correct — from result fields OR parse score string OR count from answers array
                      let attCorrect = res.correct_answers ?? res.correct_count ?? res.correct
                        ?? attempt.correct_answers ?? parsedCorrect ?? null;

                      // Most reliable: count directly from answers[].isCorrect
                      if (attCorrect === null && Array.isArray(attempt.answers)) {
                        attCorrect = attempt.answers.filter(a => a.isCorrect === true).length;
                      }
                      attCorrect = attCorrect ?? 0;

                      // Wrong — from result or count answers where isCorrect===false AND answered
                      let attWrong = res.wrong_answers ?? res.wrong_count ?? res.wrong
                        ?? attempt.wrong_answers ?? null;
                      if (attWrong === null && Array.isArray(attempt.answers)) {
                        attWrong = attempt.answers.filter(a => a.isCorrect === false && a.selectedAnswer != null).length;
                      }
                      attWrong = attWrong ?? 0;

                      const rawPct = res.percentage ?? res.score_percentage ?? attempt.percentage;
                      const pct = rawPct != null ? (typeof rawPct === 'string' ? parseInt(rawPct, 10) || 0 : Math.round(rawPct)) : 0;

                      const rankC = pct >= 90 ? '#16a34a' : pct >= 75 ? '#2563eb' : pct >= 60 ? '#d97706' : '#dc2626';
                      return (
                        <div key={attempt.prelimes_attempt_id ?? attempt.attempt_id ?? attempt._id ?? i} className="card" style={{ border: '1.5px solid var(--gray-200)' }}>
                          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--navy)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.9rem', flexShrink: 0 }}>
                              #{attNum}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>Attempt {attNum}</div>
                              <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginTop: '.15rem' }}>
                                {submittedAt
                                  ? new Date(submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : '—'}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1rem' }}>{attCorrect}</div>
                                <div style={{ fontSize: '.68rem', color: 'var(--gray-500)' }}>Correct</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1rem' }}>{attWrong}</div>
                                <div style={{ fontSize: '.68rem', color: 'var(--gray-500)' }}>Wrong</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, color: rankC, fontSize: '1rem' }}>{pct}%</div>
                                <div style={{ fontSize: '.68rem', color: 'var(--gray-500)' }}>Score</div>
                              </div>
                            </div>
                            { (res.status || attempt.status) && (
                              <span style={{ 
                                fontSize: '.75rem', fontWeight: 700, padding: '.2rem .6rem', borderRadius: 'var(--radius-full)', 
                                background: /pass/i.test(res.status || attempt.status) ? '#dcfce7' : /fail/i.test(res.status || attempt.status) ? '#fee2e2' : 'var(--gray-100)', 
                                color: /pass/i.test(res.status || attempt.status) ? '#16a34a' : /fail/i.test(res.status || attempt.status) ? '#dc2626' : 'var(--navy)'
                              }}>
                                {res.status || attempt.status}
                              </span>
                            )}
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
                  <p style={{ color: 'var(--gray-500)', fontSize: '.875rem' }}>Question details not available.</p>
                ) : (
                  <div className="result-q-list">
                    {questions.map((q, idx) => {
                      const qNum       = q.question_number ?? (idx + 1);
                      const correctIdx = q.correctAnswer != null ? q.correctAnswer - 1 : q.correct;
                      const userAns    = answers[qNum];
                      const isCorrect  = userAns === correctIdx;
                      const isSkipped  = userAns === undefined || userAns === null;
                      const status     = isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong';

                      return (
                        <div key={q.questionId || q.id || idx} className={`result-q-item ${status}`}>
                          <div className="result-q-top">
                            <span className={`result-q-badge ${status}`}>
                              {status === 'correct' ? '✅ Correct' : status === 'wrong' ? '❌ Wrong' : '⏭ Skipped'}
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
                                  <span className="result-opt-label">{String.fromCharCode(65 + i)}</span>
                                  <span className="result-opt-text">{opt}</span>
                                  {i === correctIdx && <span className="result-opt-tag correct">✓ Correct</span>}
                                  {i === userAns && !isCorrect && <span className="result-opt-tag wrong">✗ Your Answer</span>}
                                </div>
                              );
                            })}
                          </div>
                          {q.summary?.length > 0 && (
                            <div style={{ marginTop: '.85rem', padding: '.75rem', background: 'rgba(255,255,255,.8)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--gold)', fontSize: '.82rem', color: 'var(--gray-700)', lineHeight: 1.65 }}>
                              <strong style={{ color: 'var(--navy)', display: 'block', marginBottom: '.3rem' }}>💡 Explanation</strong>
                              {q.summary.map((s, si) => <p key={si} style={{ margin: '0 0 .35rem 0' }}>{s}</p>)}
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