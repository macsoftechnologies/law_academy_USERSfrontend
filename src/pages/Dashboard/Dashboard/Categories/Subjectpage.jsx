import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import Loader from '../../../../components/common/Loader';
import { getSubjectsByLawForUser, getSubjectsByLaw } from '../../../../api/dashboard/dashboardApi';
import '../../../../styles/design-system.css';
import '../../../../styles/components.css';
import '../../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SubjectsPage() {
  const { lawId }   = useParams();
  const navigate    = useNavigate();
  const userId      = localStorage.getItem('userId');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const req = userId
      ? getSubjectsByLawForUser(lawId, userId)
      : getSubjectsByLaw(lawId);
    req
      .then(r => { if (r.statusCode === 200) setSubjects(r.data ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lawId]);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              Subjects <span className="page-section-count">{subjects.length}</span>
            </h1>
          </div>

          {loading ? <Loader /> : subjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>No subjects available</h3>
            </div>
          ) : (
            <div className="course-grid">
              {subjects.map(s => {
                const primaryPlan = s.availablePlans?.length
                  ? s.availablePlans.reduce((m, p) => Number(p.original_price) < Number(m.original_price) ? p : m, s.availablePlans[0])
                  : null;

                return (
                  <div key={s.subjectId} className="course-card">
                    <div
                      className="course-card-img"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/subject/${s.subjectId}`)}
                    >
                      {s.subject_image
                        ? <img src={`${BASE_URL}/${s.subject_image}`} alt={s.title} />
                        : <div className="course-card-img-placeholder">📚</div>}
                      {s.isEnrolled && (
                        <span className="course-card-enrolled-badge">
                          <span className="badge badge-success">✓ Enrolled</span>
                        </span>
                      )}
                    </div>
                    <div className="course-card-body">
                      <h3 className="course-card-title">{s.title}</h3>

                      {/* <div className="course-card-plan-area">
                        {s.isEnrolled
                          ? <div className="course-card-enrolled-info">
                              ✓ Expires: {s.expiry_date ? new Date(s.expiry_date).toLocaleDateString('en-IN') : '—'}
                            </div>
                          : primaryPlan && (
                            <span className="plan-chip">
                              {primaryPlan.strike_price && <del>₹{primaryPlan.strike_price}</del>}
                              {' '}₹{primaryPlan.original_price} <em>{primaryPlan.duration}</em>
                            </span>
                          )}
                      </div> */}

                      <div className="course-card-actions">
                        {s.isEnrolled ? (
                          /* Enrolled: Open → goes straight to lectures */
                          <button className="btn btn-gold btn-sm"
                            onClick={() => navigate(`/lectures/${s.subjectId}`)}>
                            Open →
                          </button>
                        ) : (
                          <>
                            {/* Buy Now → SubjectDetail (full details page with plans; EnrollModal only there) */}
                            {/* {primaryPlan && (
                              <button className="btn btn-gold btn-sm"
                                onClick={() => navigate(`/subject/${s.subjectId}`)}>
                                Buy Now
                              </button>
                            )} */}
                            {/* Explore More → next cards page = Lectures list */}
                            <button className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/lectures/${s.subjectId}`)}>
                              Explore More
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
