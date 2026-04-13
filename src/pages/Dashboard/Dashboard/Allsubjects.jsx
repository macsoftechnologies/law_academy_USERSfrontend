import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import Loader from '../../../components/common/Loader';
import Pagination from '../../../components/common/Pagination';
import { getSubjects } from '../../../api/dashboard/dashboardApi';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 12;

export default function AllSubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  useEffect(() => {
    setLoading(true);
    getSubjects(page, PAGE_SIZE)
      .then(r => {
        if (r.statusCode === 200) {
          setSubjects(r.data ?? []);
          setTotal(r.totalCount ?? r.data?.length ?? 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="page-section-head">
            <h1 className="page-section-title">
              All Subjects
              {!loading && <span className="page-section-count">{total}</span>}
            </h1>
          </div>

          {loading ? <Loader /> : subjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>No subjects available</h3>
            </div>
          ) : (
            <>
              <div className="course-grid">
                {subjects.map(s => {
                  const law = Array.isArray(s.law_id) ? s.law_id[0] : null;

                  return (
                    <div key={s.subjectId} className="course-card">
                      <div className="course-card-img" style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/subject-laws/${s.subjectId}`)}>
                        {/* API field: subject_image */}
                        {s.subject_image
                          ? <img src={`${BASE_URL}/${s.subject_image}`} alt={s.title} />
                          : <div className="course-card-img-placeholder">📚</div>}
                      </div>
                      <div className="course-card-body">
                        <h3 className="course-card-title">{s.title}</h3>
                        {/* {law && (
                          <div style={{ marginBottom: '.4rem' }}>
                            <span className="badge badge-navy" style={{ fontSize: '.72rem' }}>⚖️ {law.title}</span>
                          </div>
                        )} */}
                        <div className="course-card-actions">
                          {/* Explore More → Lecture cards listing (next level) */}
                          <button className="btn btn-primary btn-sm"
                           onClick={() => navigate(`/subject-laws/${s.subjectId}`)}>
                            View All
                          </button>
                          {/* Details → SubjectDetail (full info + Buy Now) */}
                          {/* <button className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/subject/${s.subjectId}`)}>
                            Buy Now
                          </button> */}
                        </div>
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
