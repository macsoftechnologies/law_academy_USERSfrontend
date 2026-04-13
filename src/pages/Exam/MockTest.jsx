import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getQuizQuestion } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';
import './exam.css';

export default function MockTest() {
  const navigate = useNavigate();
  const { prelimsId, testId } = useParams();
  const { state }             = useLocation();

  const test          = state?.test          || null;
  const item          = state?.item          || null;
  const isEnrolled    = state?.isEnrolled    || false;
  const categoryLabel = state?.categoryLabel || 'Test';
  const module_type   = state?.module_type   || 'QZ';

  const declaredTotal    = parseInt(test?.no_of_qos || '10', 10);
  const durationMins     = parseInt(test?.duration  || '30', 10);
  const TOTAL_SECS       = durationMins * 60;
  const prelimes_test_id = testId || test?.prelimes_test_id;

  const [cache,       setCache]       = useState({});
  const [realTotal,   setRealTotal]   = useState(null);        // null = probe not yet complete
  const [current,     setCurrent]     = useState(1);
  const [qLoading,    setQLoading]    = useState(true);
  const [fetchError,  setFetchError]  = useState(null);
  const [answers,     setAnswers]     = useState({});
  const [flagged,     setFlagged]     = useState(new Set());
  const [secs,        setSecs]        = useState(TOTAL_SECS);
  const [showConfirm, setShowConfirm] = useState(false);

  const timerRef    = useRef(null);
  const fetchingRef = useRef(new Set());
  const cacheRef    = useRef({});  // mirror of cache readable inside async callbacks

  const updateCache = (qNum, data) => {
    cacheRef.current = { ...cacheRef.current, [qNum]: data };
    setCache(prev => ({ ...prev, [qNum]: data }));
  };

  // ── Fetch one question ─────────────────────────────────────────────────────
  // Returns 'ok' | 'not_found', throws on network error
  const fetchQuestion = useCallback(async (qNum) => {
    if (cacheRef.current[qNum]) return 'ok';

    // If already in-flight, wait for it to finish
    if (fetchingRef.current.has(qNum)) {
      await new Promise(res => {
        const iv = setInterval(() => {
          if (!fetchingRef.current.has(qNum)) { clearInterval(iv); res(); }
        }, 80);
      });
      return cacheRef.current[qNum] ? 'ok' : 'not_found';
    }

    fetchingRef.current.add(qNum);
    try {
      const r = await getQuizQuestion({ prelimes_test_id, question_number: qNum });
      if (!r.data || r.statusCode !== 200) return 'not_found';

      updateCache(qNum, r.data);

      // If the API returns the real total directly, use it immediately
      if (r.data.total_questions && typeof r.data.total_questions === 'number') {
        setRealTotal(r.data.total_questions);
      }

      return 'ok';
    } catch (err) {
      console.error(`Failed Q${qNum}:`, err);
      throw err;
    } finally {
      fetchingRef.current.delete(qNum);
    }
  }, [prelimes_test_id]);

  // ── Binary search: find highest question number that exists ───────────────
  const probeRealTotal = useCallback(async (lo, hi) => {
    if (lo >= hi) return lo;
    const mid = Math.ceil((lo + hi) / 2);
    try {
      const status = await fetchQuestion(mid);
      if (status === 'ok') {
        return probeRealTotal(mid, hi);      // mid exists → go higher
      } else {
        return probeRealTotal(lo, mid - 1);  // mid missing → go lower
      }
    } catch {
      return probeRealTotal(lo, mid - 1);
    }
  }, [fetchQuestion]);

  // ── Mount: load Q1, then probe real total in background ───────────────────
  useEffect(() => {
    if (!test) { navigate(-1); return; }

    const init = async () => {
      try {
        const status = await fetchQuestion(1);
        if (status === 'not_found') {
          setFetchError('No questions found for this test.');
          setRealTotal(0);
          return;
        }

        // Q1 ready — stop showing loader immediately
        setQLoading(false);

        // Binary search runs in background; grid updates when it resolves
        const actual = await probeRealTotal(1, declaredTotal);
        setRealTotal(actual);

        // Prefetch Q2 after probe
        if (actual >= 2) fetchQuestion(2).catch(() => {});

      } catch {
        setFetchError('Failed to load question 1. Please go back and try again.');
        setRealTotal(declaredTotal); // fallback so UI is not blank
      } finally {
        setQLoading(false);
      }
    };

    init();

    timerRef.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); goToResult(true); return 0; }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // ── When current changes: fetch if not cached, prefetch next ──────────────
  useEffect(() => {
    if (!prelimes_test_id || current === 1) return; // Q1 handled in init

    if (!cacheRef.current[current]) {
      setQLoading(true);
      setFetchError(null);
      fetchQuestion(current)
        .then(status => {
          if (status === 'not_found') setCurrent(prev => Math.max(1, prev - 1));
        })
        .catch(() => setFetchError(`Failed to load Q${current}. Please retry.`))
        .finally(() => setQLoading(false));
    } else {
      setQLoading(false);
    }

    const next = current + 1;
    if (realTotal !== null && next <= realTotal) {
      fetchQuestion(next).catch(() => {});
    }
  }, [current]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isExpiring = secs <= 300;

  const selectAnswer = (qNum, optIdx) =>
    setAnswers(prev => ({ ...prev, [qNum]: optIdx }));

  const clearAnswer = (qNum) =>
    setAnswers(prev => { const n = { ...prev }; delete n[qNum]; return n; });

  const toggleFlag = (qNum) =>
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(qNum) ? next.delete(qNum) : next.add(qNum);
      return next;
    });

  const goToResult = (auto) => {
    clearInterval(timerRef.current);
    const questions = Object.values(cacheRef.current).sort((a, b) => a.question_number - b.question_number);
    navigate(`/prelims/${prelimsId}/exam-result`, {
      state: { answers, questions, auto, test, item, categoryLabel, module_type, prelimsId, prelimes_test_id }
    });
  };

  const navigateTo = (qNum) => {
    if (qNum < 1 || (realTotal !== null && qNum > realTotal)) return;
    setCurrent(qNum);
  };

  const getStatus = (qNum) => {
    if (qNum === current)                                  return 'current';
    if (answers[qNum] !== undefined && flagged.has(qNum)) return 'answered-flagged';
    if (answers[qNum] !== undefined)                       return 'answered';
    if (flagged.has(qNum))                                 return 'flagged';
    return 'unattempted';
  };

  // Show declared count until probe finishes (prevents blank grid)
  const displayTotal = realTotal ?? declaredTotal;
  const answered     = Object.keys(answers).length;
  const unattempted  = displayTotal - answered;
  const q            = cache[current];

  const TYPE_LABELS = { QZ: 'QUIZ', SMT: 'MOCK TEST', GT: 'GRAND TEST', PQA: 'PREV. YEAR' };

  if (!test) return null;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">

        {/* ── Top Bar ── */}
        <div className="exam-topbar">
          <div className="exam-topbar-title">
            <span className="exam-topbar-badge">{TYPE_LABELS[module_type] || 'EXAM'}</span>
            <span className="exam-topbar-name">{test.title || categoryLabel}</span>
          </div>
          <div className={`exam-timer ${isExpiring ? 'expiring' : ''}`}>
            <span className="exam-timer-icon">⏱</span>
            <span className="exam-timer-val">{formatTime(secs)}</span>
          </div>
          <button className="btn btn-primary exam-submit-btn" onClick={() => setShowConfirm(true)}>
            Submit Test
          </button>
        </div>

        <div className="exam-shell">

          {/* ── Sidebar Navigator ── */}
          <aside className="exam-sidebar">
            <div className="exam-sidebar-head">
              <div className="exam-sidebar-title">
                Questions
                {/* Subtle spinner while probe is running */}
                {realTotal === null && (
                  <span style={{ fontSize: '.7rem', color: 'var(--gray-400)', marginLeft: '.4rem' }}>…</span>
                )}
              </div>
              <div className="exam-sidebar-stats">
                <span className="stat-pill answered">{answered} Answered</span>
                <span className="stat-pill unattempted">{unattempted} Left</span>
                {flagged.size > 0 && <span className="stat-pill flagged">{flagged.size} Flagged</span>}
              </div>
            </div>

            {/* Grid renders displayTotal — switches from declared → real once probe finishes */}
            <div className="exam-q-grid">
              {Array.from({ length: displayTotal }, (_, i) => {
                const qNum = i + 1;
                return (
                  <button
                    key={qNum}
                    className={`exam-q-btn ${getStatus(qNum)}`}
                    onClick={() => navigateTo(qNum)}
                    title={`Question ${qNum}`}
                  >
                    {qNum}
                    {flagged.has(qNum) && <span className="q-flag-dot" />}
                  </button>
                );
              })}
            </div>

            <div className="exam-legend">
              <div className="legend-item"><span className="legend-dot answered" />Answered</div>
              <div className="legend-item"><span className="legend-dot unattempted" />Not Answered</div>
              <div className="legend-item"><span className="legend-dot flagged" />Flagged</div>
              <div className="legend-item"><span className="legend-dot current" />Current</div>
            </div>
          </aside>

          {/* ── Question Area ── */}
          <main className="exam-main">
            {qLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: '1rem' }}>
                <Loader />
                <span style={{ fontSize: '.875rem', color: 'var(--gray-500)' }}>Loading Question {current}…</span>
              </div>
            ) : fetchError ? (
              <div className="empty-state">
                <div className="empty-state-icon">⚠️</div>
                <h3 style={{ color: 'var(--error)' }}>{fetchError}</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setFetchError(null);
                    setQLoading(true);
                    fetchQuestion(current)
                      .then(status => {
                        if (status === 'not_found') setFetchError(`Question ${current} does not exist.`);
                      })
                      .catch(() => setFetchError(`Failed to load Q${current}. Please retry.`))
                      .finally(() => setQLoading(false));
                  }}
                >
                  🔄 Retry
                </button>
              </div>
            ) : q ? (
              <div className="exam-q-card">
                <div className="exam-q-header">
                  <div className="exam-q-num">
                    Q{current}
                    <span className="exam-q-of">/ {realTotal ?? '…'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    {q.marks != null && (
                      <span style={{
                        fontSize: '.72rem', fontWeight: 700,
                        background: 'var(--gold-pale)', color: 'var(--navy)',
                        padding: '.2rem .55rem', borderRadius: 'var(--radius-full)'
                      }}>
                        {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      className={`exam-flag-btn ${flagged.has(current) ? 'active' : ''}`}
                      onClick={() => toggleFlag(current)}
                    >
                      {flagged.has(current) ? '🚩 Flagged' : '⚑ Flag'}
                    </button>
                  </div>
                </div>

                <p className="exam-q-text">{q.question}</p>

                <div className="exam-options">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`exam-option ${answers[current] === i ? 'selected' : ''}`}
                      onClick={() => selectAnswer(current, i)}
                    >
                      <span className="exam-option-label">{String.fromCharCode(65 + i)}</span>
                      <span className="exam-option-text">{opt}</span>
                    </button>
                  ))}
                </div>

                <div className="exam-q-nav">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigateTo(current - 1)}
                    disabled={current === 1}
                  >
                    ← Previous
                  </button>

                  {answers[current] !== undefined && (
                    <button className="exam-clear-btn" onClick={() => clearAnswer(current)}>
                      Clear Answer
                    </button>
                  )}

                  {(realTotal === null || current < realTotal) ? (
                    <button className="btn btn-primary" onClick={() => navigateTo(current + 1)}>
                      Next →
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setShowConfirm(true)}>
                      Submit Test ✓
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showConfirm && (
        <div className="exam-modal-overlay">
          <div className="exam-modal">
            <div className="exam-modal-icon">📋</div>
            <h3>Submit Test?</h3>
            <p>You're about to submit your test. This action cannot be undone.</p>
            <div className="exam-modal-stats">
              <div className="modal-stat">
                <span className="modal-stat-val answered">{answered}</span>
                <span className="modal-stat-label">Answered</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-val unattempted">{unattempted}</span>
                <span className="modal-stat-label">Unattempted</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-val flagged">{flagged.size}</span>
                <span className="modal-stat-label">Flagged</span>
              </div>
            </div>
            {unattempted > 0 && (
              <div className="exam-modal-warn">
                ⚠️ {unattempted} unattempted question{unattempted > 1 ? 's' : ''}. Are you sure?
              </div>
            )}
            <div className="exam-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Review More</button>
              <button className="btn btn-primary" onClick={() => goToResult(false)}>Submit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}