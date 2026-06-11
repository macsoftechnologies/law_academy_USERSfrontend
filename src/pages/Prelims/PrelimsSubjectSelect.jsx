import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { getMocktestSubjects } from '../../api/prelims/prelimsApi';
import { formatDate } from '../../utils/formatDate';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

export default function PrelimsSubjectSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const passedItem = state?.item || null;
  const isEnrolled = state?.isEnrolled ?? false;

  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeCategory, setActiveCategory] = useState('Civil Laws');

  useEffect(() => {
    setLoading(true);
    getMocktestSubjects(1, 100)
      .then(r => {
        if (r?.statusCode === 200) {
          setSubjects(Array.isArray(r.data) ? r.data : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Civil Laws', 'Criminal Laws'];

  const filteredSubjects = subjects.filter(subject => {
    let rawTitle = subject?.law?.title?.trim()?.toLowerCase() || "";
    let mappedCategory = 'Civil Laws'; // Default fallback
    
    if (rawTitle.includes('criminal')) mappedCategory = 'Criminal Laws';
    else if (rawTitle.includes('civil')) mappedCategory = 'Civil Laws';

    return mappedCategory === activeCategory;
  });

  const handleSubjectClick = (subject) => {
    const subjectId = subject.mocktest_subject_id || subject.id || subject._id;
    navigate(`/prelims/smt/${subjectId}`, {
      state: { subject, passedItem, isEnrolled },
    });
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              Subject Wise Mock Tests
              {!loading && <span className="page-section-count">{subjects.length}</span>}
            </h1>
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: '1.25rem' }}>
            Select a subject to view its mock tests
          </p>

          {loading ? <Loader /> : subjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No subjects available</h3>
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'Civil Laws' ? '📜 ' : cat === 'Criminal Laws' ? '🚨 ' : ''}{cat}
                  </button>
                ))}
              </div>

              {filteredSubjects.length === 0 ? (
                <div className="empty-state" style={{ marginTop: '2rem' }}>
                  <div className="empty-state-icon">🔍</div>
                  <h3>No subjects found for this category</h3>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  {filteredSubjects.map((subject, i) => {
                    const subjectId = subject.mocktest_subject_id || subject.id || subject._id || i;
                  const name = subject.name || subject.title || subject.subject_name || `Subject ${i + 1}`;
                  const count = subject.test_count ?? subject.no_of_tests ?? null;
                  const imgSrc = subject.presentation_image
                    ? `${BASE_URL}/${subject.presentation_image}` : null;

                  return (
                    <div
                      key={subjectId}
                      className="card"
                      style={{ cursor: 'pointer', border: '2px solid transparent', transition: 'border-color .18s' }}
                      onClick={() => handleSubjectClick(subject)}
                      onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = 'transparent')}
                    >
                      <div className="card-body" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
                        {imgSrc
                          ? <img src={imgSrc} alt={name} style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'cover', marginBottom: '.75rem' }} />
                          : <div style={{ fontSize: '2.2rem', marginBottom: '.75rem' }}>📝</div>}
                        <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.95rem', marginBottom: '.3rem' }}>{name}</div>
                        {count != null && (
                          <div style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{count} Test{count !== 1 ? 's' : ''}</div>
                        )}
                        <div style={{ marginTop: '.75rem', fontSize: '.82rem', fontWeight: 700, color: 'var(--gold)' }}>View Tests →</div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
