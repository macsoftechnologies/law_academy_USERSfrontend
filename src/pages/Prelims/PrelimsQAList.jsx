import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import CategoryBuyModal from '../../components/common/CategoryBuyModal';
import { getQAList, getPrelimsTests, getUserTestAttempts } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const PAGE_SIZE = 10;

// FIX: Unified attempt count parser — handles all possible API response shapes
const parseAttemptCount = (value) => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseInt(value, 10) || 0;
  if (Array.isArray(value))     return value.length;
  if (typeof value === 'object') {
    // handle nested { count, total, length } shapes
    const n = value.count ?? value.total ?? value.length ?? 0;
    return parseInt(n, 10) || 0;
  }
  return 0;
};

// FIX: Extract attempt count from a test object — check all known field names
// NOTE: 'attempt_number' is intentionally excluded — it is per-attempt metadata
// (e.g. "this is attempt #1") and equals 0 for un-attempted tests, which would
// wrongly signal "0 attempts found" and skip the API call entirely.
const getEmbeddedAttempts = (t) => {
  if (t == null) return -1; // -1 = not present
  const fields = [
    'attempts', 'attempts_count', 'attempt_count',
    'user_attempts_count', 'user_attempts', 'no_of_attempts',
    'attempted', 'attempted_count', 'attempt', 'attemptNumber',
  ];
  for (const f of fields) {
    if (t[f] != null) return parseAttemptCount(t[f]);
  }
  return -1; // not embedded
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

const EXAM_TYPES = ['QZ', 'SMT', 'GT'];

export default function PrelimsQAList() {
  const { prelimsId, module_type } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const categoryLabel       = state?.categoryLabel || module_type;
  const item                = state?.item          || null;
  const isEnrolled          = state?.isEnrolled    || false;
  const test_type           = state?.test_type     || null;
  const mocktest_subject_id = state?.mocktest_subject_id || null;

  const normalizedType = module_type === 'Quiz' ? 'QZ' : module_type;
  const resolvedType   = test_type || normalizedType;

  const [qaList,        setQaList]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(state?.page || 1);
  const [total,         setTotal]         = useState(0);
  const [attemptCounts, setAttemptCounts] = useState({}); // { testId: count }
  const [showBuyModal,  setShowBuyModal]  = useState(false);

  const isExamType = EXAM_TYPES.includes(resolvedType);

  useEffect(() => {
    setLoading(true);

    if (isExamType) {
      const params = { prelimsId, page, limit: PAGE_SIZE, test_type: resolvedType };
      if (resolvedType === 'SMT' && mocktest_subject_id) {
        params.mocktest_subject_id = mocktest_subject_id;
      }
      getPrelimsTests(params)
        .then(async r => {
          if (r.statusCode === 200) {
            const list = r.data ?? [];
            setQaList(list);
            setTotal(r.totalCount ?? list.length ?? 0);

            // FIX: Fetch attempt counts via user_attempts API for every test.
            // Only skip the API call if the count is already reliably embedded (>= 0).
            const counts = {};
            const chunkSize = 5;
            for (let i = 0; i < list.length; i += chunkSize) {
              const chunk = list.slice(i, i + chunkSize);
              await Promise.allSettled(
                chunk.map(async (t) => {
                  const testId = t.prelimes_test_id || t.id || t._id;
                  if (!testId) return;

                  try {
                    const ar = await getUserTestAttempts(testId);
                    counts[testId] = normalizeAttemptResponse(ar);
                  } catch {
                    counts[testId] = 0;
                  }
                })
              );
              setAttemptCounts(prev => ({ ...prev, ...counts }));
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      getQAList({ moduleId: prelimsId, module: 'prelimes', module_type, page, limit: PAGE_SIZE })
        .then(r => {
          if (r.statusCode === 200) {
            setQaList(r.data ?? []);
            setTotal(r.totalCount ?? r.data?.length ?? 0);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [prelimsId, module_type, page, resolvedType]);

  const handleItemClick = (qa) => {
    const isLocked = qa.isLocked ?? qa.is_locked ?? false;

    if (!isEnrolled) {
      navigate(`/prelims/${prelimsId}`, { state: { item, scrollToBuy: true } });
      return;
    }

    if (isExamType) {
      const testId = qa.prelimes_test_id || qa.id || qa._id;
      navigate(`/prelims/${prelimsId}/exam-terms`, {
        state: {
          test: qa,
          item,
          isEnrolled,
          isLocked,
          categoryLabel,
          prelimsId,
          module_type: resolvedType,
          mocktest_subject_id,
        }
      });
    } else {
      const qaId = qa.qa_id || qa.prelimes_test_id || qa.id || qa._id;
      navigate(`/prelims/${prelimsId}/qa/${module_type}/${qaId}`, {
        state: { qa, item, module_type, categoryLabel, isEnrolled, isLocked }
      });
    }
  };

  const getIcon = () => {
    if (resolvedType === 'QZ')  return '❓';
    if (resolvedType === 'GT')  return '🏆';
    if (resolvedType === 'SMT') return '📝';
    return '📋';
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              {categoryLabel} {!loading && <span className="page-section-count">{total}</span>}
            </h1>
          </div>

          {loading ? <Loader /> : qaList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No items available</h3>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {qaList.map((qa, i) => {
                  const qaId           = qa.qa_id || qa.prelimes_test_id || qa.id || qa._id || i;
                  const testId         = qa.prelimes_test_id || qa.id || qa._id;
                  const isLocked       = qa.isLocked ?? qa.is_locked ?? false;
                  const title          = qa.title || `${categoryLabel} ${i + 1}`;
                  const question_count = qa.no_of_qos ?? qa.question_count;
                  const duration       = qa.duration;

                  // FIX: resolve attempt count — embedded value OR API-fetched count
                  const attempts = attemptCounts[testId] ?? 0;
                  console.debug('PrelimsQAList: item attempt', { qaId, testId, attempts });

                  return (
                    <div
                      key={qaId}
                      className="card"
                      style={{ cursor: 'pointer', opacity: isLocked ? 0.7 : 1 }}
                      onClick={() => handleItemClick(qa)}
                    >
                      <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 'var(--radius-md)',
                          background: isLocked ? 'var(--gray-200)' : 'var(--gold-pale)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.1rem', flexShrink: 0,
                        }}>
                          {isLocked ? '🔒' : getIcon()}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>{title}</div>
                          <div style={{ display: 'flex', gap: '.75rem', marginTop: '.2rem', flexWrap: 'wrap' }}>
                            {question_count && (
                              <span style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>📝 {question_count} Questions</span>
                            )}
                            {duration && (
                              <span style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>⏱ {duration} mins</span>
                            )}
                          </div>
                        </div>

                        {/* Attempt count badge — click to view full attempt history */}
                        {isExamType && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                            <div
                              style={{ textAlign: 'center' }}
                              onClick={attempts > 0 ? (e) => {
                                e.stopPropagation(); // don't trigger the card's handleItemClick
                                const testId = qa.prelimes_test_id || qa.id || qa._id;
                                navigate(`/prelims/${prelimsId}/test/${testId}/attempts`, {
                                  state: { test: qa, item, categoryLabel, module_type: resolvedType, prelimsId }
                                });
                              } : undefined}
                            >
                              <div style={{
                                background: attempts > 0 ? 'var(--gold-pale)' : 'var(--gray-100)',
                                color: attempts > 0 ? 'var(--navy)' : 'var(--gray-500)',
                                borderRadius: 'var(--radius-md)', padding: '.35rem .75rem',
                                fontSize: '.75rem', fontWeight: 700, minWidth: 60,
                                cursor: attempts > 0 ? 'pointer' : 'default',
                                border: attempts > 0 ? '1px solid var(--gold)' : '1px solid transparent',
                                transition: 'opacity .15s',
                              }}>
                                {attempts > 0 ? `${attempts} Attempt${attempts > 1 ? 's' : ''} →` : 'Not Attempted'}
                              </div>
                            </div>
                            
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/dashboard/marks');
                              }}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderColor: 'var(--gold)', color: 'var(--gold)', width: '100%' }}
                            >
                              📊 Marks
                            </button>
                          </div>
                        )}

                        {!isEnrolled ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <button
                              className="btn btn-gold btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowBuyModal(true);
                              }}
                            >
                              Buy Now
                            </button>
                            <span style={{ fontSize: '0.65rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                              Unlocks full category
                            </span>
                          </div>
                        ) : isLocked ? (
                          <span style={{ color: 'var(--gray-400)', fontSize: '1rem', flexShrink: 0 }}>
                            🔒
                          </span>
                        ) : (
                          <span style={{ color: 'var(--gold)', fontSize: '1rem', flexShrink: 0 }}>
                            {isExamType ? '▶' : '→'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onChange={setPage} />
            </>
          )}

          {showBuyModal && (
            <CategoryBuyModal 
              categoryName={categoryLabel || item?.title} 
              onClose={() => setShowBuyModal(false)}
              onProceed={() => {
                setShowBuyModal(false);
                navigate(`/prelims/${prelimsId}`, { state: { item, scrollToBuy: true } });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}