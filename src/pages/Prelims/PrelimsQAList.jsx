import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { getQAList, getPrelimsTests } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const PAGE_SIZE = 10;

// Test types that use the full exam flow (Terms → Instructions → MockTest)
const EXAM_TYPES = ['QZ', 'SMT', 'GT'];

export default function PrelimsQAList() {
  const { prelimsId, module_type } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const categoryLabel        = state?.categoryLabel || module_type;
  const item                 = state?.item          || null;
  const isEnrolled           = state?.isEnrolled    || false;
  const test_type            = state?.test_type     || null;
  const mocktest_subject_id  = state?.mocktest_subject_id || null;

  const [qaList,  setQaList]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(state?.page || 1);
  const [total,   setTotal]   = useState(0);

  // Resolved type for API (QZ for quizzes, or module_type)
  const resolvedType = test_type || module_type;
  const isExamType   = EXAM_TYPES.includes(resolvedType);

  useEffect(() => {
    setLoading(true);

    if (isExamType) {
      const params = { prelimsId, page, limit: PAGE_SIZE, test_type: resolvedType };
      if (resolvedType === 'SMT' && mocktest_subject_id) {
        params.mocktest_subject_id = mocktest_subject_id;
      }
      getPrelimsTests(params)
        .then(r => {
          if (r.statusCode === 200) {
            setQaList(r.data ?? []);
            setTotal(r.totalCount ?? r.data?.length ?? 0);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      getQAList({ moduleId: prelimsId, module: 'prelimes', module_type, page, limit: PAGE_SIZE })
        .then(r => {
          if (r.statusCode === 200) {
            setQaList(r.data ?? []);
            setTotal(r.totalCount ?? r.data?.length ?? 0);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [prelimsId, module_type, page, resolvedType]);

  const handleItemClick = (qa) => {
    if (qa.isLocked) {
      navigate(`/prelims/${prelimsId}`, { state: { item, scrollToBuy: true } });
      return;
    }

    if (isExamType) {
      // Route through Terms → Instructions → Exam
      navigate(`/prelims/${prelimsId}/exam-terms`, {
        state: {
          test: qa,
          item,
          isEnrolled,
          categoryLabel,
          prelimsId,
          module_type: resolvedType,
          mocktest_subject_id,
        }
      });
    } else {
      // PQA — go to QA detail
      navigate(`/prelims/${prelimsId}/qa/${module_type}/${qa.qa_id}`, {
        state: { qa, item, module_type, categoryLabel, isEnrolled }
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
              <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
                {qaList.map((qa, i) => {
                  const isLocked      = qa.isLocked ?? false;
                  const title         = qa.title || `${categoryLabel} ${i+1}`;
                  const question_count = qa.no_of_qos || qa.question_count;
                  const duration      = qa.duration;
                  const attempts      = qa.attempts_count;

                  return (
                    <div
                      key={qa.qa_id || qa.prelimes_test_id || i}
                      className="card"
                      style={{ cursor:'pointer', opacity: isLocked ? 0.7 : 1 }}
                      onClick={() => handleItemClick(qa)}
                    >
                      <div className="card-body" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                        {/* Icon */}
                        <div style={{
                          width:40, height:40, borderRadius:'var(--radius-md)',
                          background: isLocked ? 'var(--gray-200)' : 'var(--gold-pale)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:'1.1rem', flexShrink:0
                        }}>
                          {isLocked ? '🔒' : getIcon()}
                        </div>

                        {/* Title + meta */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'.9rem' }}>{title}</div>
                          <div style={{ display:'flex', gap:'.75rem', marginTop:'.2rem', flexWrap:'wrap' }}>
                            {question_count && (
                              <span style={{ fontSize:'.75rem', color:'var(--gray-500)' }}>📝 {question_count} Questions</span>
                            )}
                            {duration && (
                              <span style={{ fontSize:'.75rem', color:'var(--gray-500)' }}>⏱ {duration} mins</span>
                            )}
                          </div>
                        </div>

                        {/* Attempts badge */}
                        {isExamType && attempts !== undefined && (
                          <div style={{ textAlign:'center', flexShrink:0 }}>
                            <div style={{
                              background: attempts > 0 ? 'var(--gold-pale)' : 'var(--gray-100)',
                              color: attempts > 0 ? 'var(--navy)' : 'var(--gray-500)',
                              borderRadius:'var(--radius-md)', padding:'.35rem .75rem',
                              fontSize:'.75rem', fontWeight:700, minWidth:60
                            }}>
                              {attempts > 0 ? `${attempts} Attempt${attempts > 1 ? 's' : ''}` : 'Not Attempted'}
                            </div>
                          </div>
                        )}

                        <span style={{ color: isLocked ? 'var(--gray-400)' : 'var(--gold)', fontSize:'1rem', flexShrink:0 }}>
                          {isLocked ? '🔒' : isExamType ? '▶' : '→'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}