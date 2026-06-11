import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getUserTestAttempts, getPrelimsResult } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

// Parse "1/4" score string → { correct: 1, total: 4 }
const parseScoreString = (score) => {
  if (typeof score === 'string' && score.includes('/')) {
    const [c, t] = score.split('/').map(n => parseInt(n.trim(), 10));
    return { correct: isNaN(c) ? 0 : c, total: isNaN(t) ? 0 : t };
  }
  return { correct: null, total: null };
};

// Parse percentage which may come as "25%" string or number
const parsePct = (raw, correct, total) => {
  if (raw != null) return typeof raw === 'string' ? parseInt(raw, 10) || 0 : raw;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
};

const getRankColor = (pct) =>
  pct >= 90 ? '#16a34a' : pct >= 75 ? '#2563eb' : pct >= 60 ? '#d97706' : '#dc2626';

export default function TestAttemptHistory() {
  const { prelimsId, testId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const test         = state?.test         || null;
  const item         = state?.item         || null;
  const categoryLabel = state?.categoryLabel || 'Test';
  const module_type  = state?.module_type  || null;

  const [attempts, setAttempts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [resolvedTest, setResolvedTest] = useState(test);
  const [resolvedCategory, setResolvedCategory] = useState(categoryLabel);

  // Per-attempt detail loading (when user clicks an attempt row)
  const [expandedId,     setExpandedId]     = useState(null);
  const [detailLoading,  setDetailLoading]  = useState(false);
  const [detailData,     setDetailData]     = useState({}); // { [attemptId]: resultObj }

  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    getUserTestAttempts(testId)
      .then(r => {
        if (r?.statusCode === 200) {
          const arr = Array.isArray(r.data) ? r.data : [];
          setAttempts(arr);
          if (!resolvedTest && arr.length > 0 && arr[0].testInfo) {
            setResolvedTest(arr[0].testInfo);
            setResolvedCategory(arr[0].testInfo.title || categoryLabel);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [testId]);

  const handleAttemptClick = async (attempt) => {
    const id = attempt.prelimes_attempt_id || attempt.attempt_id || attempt.id;
    if (!id) return;

    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    // If we already loaded this detail, don't refetch
    if (detailData[id]) return;

    setDetailLoading(true);
    try {
      const r = await getPrelimsResult({ attemptId: id });
      if (r?.statusCode === 200) {
        const d = Array.isArray(r.data) ? r.data[0] : r.data;
        setDetailData(prev => ({ ...prev, [id]: d }));
      }
    } catch {
      // silently fail — attempt row still visible without expanded detail
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRetake = () => {
    navigate(`/prelims/${prelimsId}/exam-terms`, {
      state: { test: resolvedTest, item, isEnrolled: true, categoryLabel: resolvedCategory, prelimsId, module_type }
    });
  };

  const exportAttempts = () => {
    const userId = localStorage.getItem('userId');
    const url = `https://api.raoslawacademy.com/prelimes-tests/user_attempts/export?userId=${userId}&testId=${testId}&format=csv`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `prelims_attempts_${testId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head" style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-navy" style={{ marginBottom: '.5rem', display: 'inline-block' }}>
              Attempt History
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem,2vw,1.5rem)', color: 'var(--navy)', margin: 0 }}>
                {resolvedTest?.title || resolvedCategory}
              </h1>
              {!loading && attempts.length > 0 && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={exportAttempts}
                  title="Export to CSV"
                >
                  📥 Export CSV
                </button>
              )}
            </div>
            {!loading && (
              <p style={{ fontSize: '.83rem', color: 'var(--gray-500)', marginTop: '.25rem' }}>
                {attempts.length} attempt{attempts.length !== 1 ? 's' : ''} recorded
              </p>
            )}
          </div>

          {loading ? <Loader /> : attempts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No attempts yet</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '.875rem' }}>
                You haven't attempted this test yet.
              </p>
              {resolvedTest && (
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleRetake}>
                  Start Test →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {attempts.map((attempt, i) => {
                const id          = attempt.prelimes_attempt_id || attempt.attempt_id || attempt.id || i;
                const attNum      = attempt.attempt_number ?? attempt.attempt_no ?? (i + 1);
                const submittedAt = attempt.submitted_at ?? attempt.createdAt ?? attempt.created_at;
                const status      = attempt.status ?? 'submitted';

                // Parse score from string "1/4" or separate fields
                const { correct: parsedCorrect, total: parsedTotal } = parseScoreString(attempt.score);
                const attTotal   = attempt.total_questions ?? parsedTotal ?? 0;
                const attCorrect = attempt.correct_answers ?? attempt.correct_count ?? attempt.correct ?? parsedCorrect ?? 0;
                const attWrong   = attempt.wrong_answers   ?? attempt.wrong_count   ?? attempt.wrong   ?? 0;
                const attSkipped = attempt.skipped ?? attempt.unattempted ?? 0;
                const pct        = attempt.percentage ?? attempt.score_percentage ?? 0;
                const rankC      = getRankColor(pct);

                const isExpanded  = expandedId === id;
                const detail      = detailData[id];
                const isPending   = isExpanded && detailLoading && !detail;

                // Use detail data if expanded + loaded, else use list data
                const dispCorrect = detail
                  ? (detail.correct_answers ?? detail.correct_count ?? detail.correct ?? parsedCorrect ?? attCorrect)
                  : attCorrect;
                const dispWrong   = detail
                  ? (detail.wrong_answers ?? detail.wrong_count ?? detail.wrong ?? attWrong)
                  : attWrong;
                const dispSkipped = detail
                  ? (detail.skipped ?? detail.unattempted ?? attSkipped)
                  : attSkipped;
                const dispPct     = detail
                  ? (detail.percentage ?? detail.score_percentage ?? pct)
                  : pct;
                const dispRankC   = getRankColor(dispPct);

                return (
                  <div
                    key={id}
                    className="card"
                    style={{
                      border: isExpanded ? '2px solid var(--gold)' : '1.5px solid var(--gray-200)',
                      cursor: 'pointer',
                      transition: 'border-color .15s',
                    }}
                    onClick={() => handleAttemptClick(attempt)}
                  >
                    {/* ── Summary Row ── */}
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Attempt number bubble */}
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--navy)', color: 'var(--white)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '.9rem', flexShrink: 0,
                      }}>
                        #{attNum}
                      </div>

                      {/* Title + date */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>
                          Attempt {attNum}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginTop: '.15rem' }}>
                          {submittedAt
                            ? new Date(submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                          {status && (
                            <span style={{
                              marginLeft: '.5rem',
                              padding: '.1rem .45rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '.68rem', fontWeight: 700,
                              background: status === 'submitted' ? '#dcfce7' : '#fef3c7',
                              color: status === 'submitted' ? '#16a34a' : '#92400e',
                            }}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats: correct / wrong / score */}
                      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
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

                      { attempt.status && (
                        <span style={{
                          fontSize: '.75rem', fontWeight: 700, padding: '.2rem .6rem',
                          borderRadius: 'var(--radius-full)',
                          background: /pass/i.test(attempt.status) ? '#dcfce7' : /fail/i.test(attempt.status) ? '#fee2e2' : 'var(--gray-100)',
                          color: /pass/i.test(attempt.status) ? '#16a34a' : /fail/i.test(attempt.status) ? '#dc2626' : 'var(--navy)',
                          flexShrink: 0,
                        }}>
                          {attempt.status}
                        </span>
                      )}

                      <span style={{ color: 'var(--gray-400)', fontSize: '.8rem', flexShrink: 0, transition: 'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        ▼
                      </span>
                    </div>

                    {/* ── Expanded Detail ── */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--gray-100)', padding: '1rem 1.25rem' }}>
                        {isPending ? (
                          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--gray-500)', fontSize: '.85rem' }}>
                            Loading result…
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '.75rem' }}>
                            {[
                              { label: 'Correct',   value: dispCorrect,                       icon: '✅', color: '#16a34a' },
                              { label: 'Wrong',     value: dispWrong,                          icon: '❌', color: '#dc2626' },
                              { label: 'Skipped',   value: dispSkipped >= 0 ? dispSkipped : '—', icon: '⏭', color: 'var(--gray-500)' },
                              { label: 'Score',     value: `${dispPct}%`,                      icon: '📊', color: dispRankC },
                              { label: 'Marks',     value: `${dispCorrect}/${attTotal || '—'}`, icon: '🏅' },
                            ].map((s) => (
                              <div key={s.label} className="card" style={{ border: '1px solid var(--gray-100)' }}>
                                <div className="card-body" style={{ padding: '.75rem', textAlign: 'center' }}>
                                  <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                                  <div style={{ fontWeight: 800, fontSize: '1rem', color: s.color || 'var(--navy)', marginTop: '.2rem' }}>
                                    {s.value}
                                  </div>
                                  <div style={{ fontSize: '.68rem', color: 'var(--gray-500)', marginTop: '.1rem' }}>{s.label}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Retake button at bottom */}
              {resolvedTest && (
                <div style={{ textAlign: 'center', marginTop: '.5rem' }}>
                  <button className="btn btn-primary" onClick={handleRetake}>
                    🔄 Retake Test
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
