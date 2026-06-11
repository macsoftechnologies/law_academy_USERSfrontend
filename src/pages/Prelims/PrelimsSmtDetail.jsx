/**
 * PrelimsSmtDetail
 * ─────────────────
 * After user selects a subject on PrelimsSubjectSelect, this page shows
 * all mock tests for that subject.
 *
 * API flow:
 *  1. POST /prelimes/mocktestsubjectdetails  { mocktest_subject_id }
 *  2. If lawId present → POST /prelimes/subjectmocktestbylaw { lawId }
 *  3. Fallback → GET /prelimes-tests?test_type=SMT&mocktest_subject_id=…
 *
 * Each test card navigates: /prelims/:prelimsId/exam-terms (same as GT/QZ).
 * prelimsId is read from the test object itself (test.prelimes_id).
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import {
  getMocktestSubjectDetails,
  getSubjectMocktestByLaw,
  getSmtTests,
  getUserTestAttempts,
} from '../../api/prelims/prelimsApi';
import CategoryBuyModal from '../../components/common/CategoryBuyModal';
import { formatDate } from '../../utils/formatDate';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const parseAttemptCount = (t) => {
  const v =
    t?.attempt_number ?? t?.attempts ?? t?.attempts_count ??
    t?.attempt_count  ?? t?.user_attempts_count ?? t?.user_attempts ??
    t?.no_of_attempts ?? 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseInt(v, 10) || 0;
  if (Array.isArray(v)) return v.length;
  return 0;
};

const getEmbeddedAttempts = (t) => {
  if (!t) return -1;
  const fields = [
    'attempts', 'attempts_count', 'attempt_count',
    'user_attempts_count', 'user_attempts', 'no_of_attempts',
    'attempted', 'attempted_count', 'attempt', 'attemptNumber',
  ];
  for (const f of fields) {
    if (t[f] != null) return parseAttemptCount({ [f]: t[f] });
  }
  return -1;
};

const normalizeAttemptResponse = (response) => {
  if (!response || response.statusCode !== 200) return 0;
  const payload = response.data;
  if (Array.isArray(payload)) return payload.length;
  if (payload == null) return 0;
  if (Array.isArray(payload.attempts)) return payload.attempts.length;
  if (Array.isArray(payload.data)) return payload.data.length;
  if (typeof payload.count === 'number') return payload.count;
  if (typeof payload.totalCount === 'number') return payload.totalCount;
  if (typeof payload.totalCount === 'string') return parseInt(payload.totalCount, 10) || 0;
  return 0;
};

const getTestId = (t) => t?.prelimes_test_id || t?.mocktest_subject_id || t?.id || t?._id;

export default function PrelimsSmtDetail() {
  const { subjectId } = useParams();
  const navigate      = useNavigate();
  const { state }     = useLocation();

  const passedSubject = state?.subject || null;
  const isEnrolled    = state?.isEnrolled ?? false;

  const [subjectMeta, setSubjectMeta] = useState(passedSubject);
  const [tests,       setTests]       = useState([]);
  const [attemptCounts, setAttemptCounts] = useState({});
  const [loading,     setLoading]     = useState(true);
  const [showBuyModal,  setShowBuyModal]  = useState(false);

  const loadAttemptCounts = async (testList) => {
    const counts = {};
    const chunkSize = 5;
    for (let i = 0; i < testList.length; i += chunkSize) {
      const chunk = testList.slice(i, i + chunkSize);
      await Promise.allSettled(chunk.map(async (test) => {
        const testId = getTestId(test);
        if (!testId) return;
        try {
          const res = await getUserTestAttempts(testId);
          counts[testId] = normalizeAttemptResponse(res);
        } catch {
          counts[testId] = 0;
        }
      }));
      // Update state progressively
      setAttemptCounts(prev => ({ ...prev, ...counts }));
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Step 1 — subject detail
        let meta = passedSubject;
        try {
          const r = await getMocktestSubjectDetails(subjectId);
          if (r?.statusCode === 200) {
            meta = Array.isArray(r.data) ? r.data[0] : r.data;
            setSubjectMeta(meta);
          }
        } catch { /* keep passedSubject */ }

        // Step 2a — tests by law
        const lawId = meta?.lawId || meta?.law_id;
        if (lawId) {
          try {
            const r2 = await getSubjectMocktestByLaw(lawId);
            if (r2?.statusCode === 200 && Array.isArray(r2.data) && r2.data.length > 0) {
              const filtered = r2.data.filter(t =>
                !t.mocktest_subject_id || t.mocktest_subject_id === subjectId
              );
              const result = filtered.length ? filtered : r2.data;
              setTests(result);
              await loadAttemptCounts(result);
              return;
            }
          } catch { /* fall through */ }
        }

        // Step 2b — fallback
        const r3 = await getSmtTests({ mocktest_subject_id: subjectId });
        if (r3?.statusCode === 200) {
          const data = Array.isArray(r3.data) ? r3.data : [];
          setTests(data);
          await loadAttemptCounts(data);
        }
      } catch (err) {
        console.error('PrelimsSmtDetail load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subjectId]);

  const handleStartTest = (test) => {
    const prelimsId = test.prelimes_id || test.prelimes_test_id || subjectMeta?.prelimes_id || 'smt';
    const testId    = test.prelimes_test_id || test.mocktest_subject_id || test.id || test._id;

    navigate(`/prelims/${prelimsId}/exam-terms`, {
      state: {
        test,
        item:                subjectMeta,
        isEnrolled,
        module_type:         'SMT',
        categoryLabel:       subjectMeta?.title || 'Subject Wise Mock Test',
        prelimsId,
        prelimes_test_id:    testId,
        mocktest_subject_id: subjectId,
      },
    });
  };

  const subjectName = subjectMeta?.title || subjectMeta?.name || subjectMeta?.subject_name || 'Subject Mock Tests';
  const subjectImg  = subjectMeta?.presentation_image
    ? `${BASE_URL}/${subjectMeta.presentation_image}` : null;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {/* ── Subject Hero ─────────────────────────────────────────── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-navy" style={{ marginBottom: '.5rem' }}>Subject Wise Mock Tests</span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.3rem,2vw,1.7rem)',
              color: 'var(--navy)', margin: '.25rem 0 .5rem',
            }}>
              {subjectName}
            </h1>
            {(subjectMeta?.no_of_qos || subjectMeta?.duration) && (
              <p style={{ fontSize: '.82rem', color: 'var(--gray-500)', margin: 0 }}>
                {subjectMeta.no_of_qos && `${subjectMeta.no_of_qos} Questions · `}
                {subjectMeta.duration && `${subjectMeta.duration} mins per test`}
              </p>
            )}
          </div>

          {loading ? <Loader /> : tests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No tests available</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '.875rem' }}>
                Tests for this subject will appear here once available.
              </p>
            </div>
          ) : (
            /* ── Test Cards — same course-grid design as other pages ── */
            <div className="course-grid">
              {tests.map((test, i) => {
                const testId    = getTestId(test) || i;
                const prelimsId = test.prelimes_id || test.prelimes_test_id || subjectMeta?.prelimes_id || 'smt';
                const title     = test.title || `Test ${i + 1}`;
                const questions = test.no_of_qos ?? test.no_of_questions ?? null;
                const duration  = test.duration ?? null;
                const attempts  = attemptCounts[testId] ?? 0;
                const rawLocked = test.isLocked ?? false;
                const locked    = !isEnrolled || !!rawLocked;
                const imgSrc    = test.presentation_image
                  ? `${BASE_URL}/${test.presentation_image}`
                  : subjectImg;   // fall back to subject image

                return (
                  <div key={testId} className="course-card" style={{ opacity: locked ? 0.65 : 1 }}>

                    {/* ── Card image — big, just like other pages ── */}
                    <div className="course-card-img">
                      {imgSrc
                        ? <img src={imgSrc} alt={title} />
                        : <div className="course-card-img-placeholder">📝</div>}

                      {/* Attempt badge overlay */}
                      {attempts > 0 && (
                        <span
                          className="course-card-enrolled-badge"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Attempt image badge clicked!', { prelimsId, testId, test, subjectMeta });
                            navigate(`/prelims/${prelimsId}/test/${testId}/attempts`, {
                              state: {
                                test,
                                item: subjectMeta,
                                categoryLabel: subjectName,
                                module_type: 'SMT',
                                prelimsId,
                                isEnrolled,
                              }
                            });
                          }}
                          style={{ cursor: isEnrolled ? 'pointer' : 'default' }}
                        >
                          <span className="badge badge-navy">
                            {attempts} Attempt{attempts !== 1 ? 's' : ''}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* ── Card body ── */}
                    <div className="course-card-body">
                      <h3 className="course-card-title">{title}</h3>

                      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                        {questions && (
                          <span style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>
                            📝 {questions} Qs
                          </span>
                        )}
                        {duration && (
                          <span style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>
                            ⏱ {duration} min
                          </span>
                        )}
                      </div>

                      {/* Attempt status chip */}
                      <div className="course-card-plan-area">
                        {attempts > 0 ? (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Attempt body button clicked!', { prelimsId, testId, test, subjectMeta });
                              navigate(`/prelims/${prelimsId}/test/${testId}/attempts`, {
                                state: {
                                  test,
                                  item: subjectMeta,
                                  categoryLabel: subjectName,
                                  module_type: 'SMT',
                                  prelimsId,
                                  isEnrolled,
                                }
                              });
                            }}
                            style={{
                              padding: '.25rem .75rem', fontSize: '.75rem', borderRadius: 'var(--radius-full)',
                              borderColor: 'var(--gold)', color: 'var(--gold)', fontWeight: 700
                            }}
                          >
                            {attempts} Attempt{attempts !== 1 ? 's' : ''} →
                          </button>
                        ) : (
                          <span style={{
                            fontSize: '.75rem', fontWeight: 700, padding: '.25rem .65rem',
                            borderRadius: 'var(--radius-full)', background: 'var(--gray-100)', color: 'var(--gray-500)',
                          }}>
                            Not Attempted
                          </span>
                        )}
                      </div>

                      <div className="course-card-actions">
                        {locked ? (
                            <button
                              className="btn btn-gold btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowBuyModal(true);
                              }}
                            >
                              Buy Now
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                              <button
                                className="btn btn-gold btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartTest(test);
                                }}
                                style={{ flex: attempts > 0 ? 1 : undefined, width: attempts > 0 ? undefined : '100%' }}
                              >
                                {attempts > 0 ? '▶ Retake' : '▶ Start'}
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/dashboard/marks');
                                }}
                                style={{ flex: 1, padding: '0.25rem', borderColor: 'var(--gold)', color: 'var(--gold)' }}
                              >
                                📊 Marks
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showBuyModal && (
            <CategoryBuyModal 
              categoryName={subjectMeta?.title || 'Subject Mock Tests'} 
              onClose={() => setShowBuyModal(false)}
              onProceed={() => {
                setShowBuyModal(false);
                const pId = subjectMeta?.prelimes_id || 'smt';
                navigate(`/prelims/${pId}`, { state: { item: subjectMeta, scrollToBuy: true } });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
