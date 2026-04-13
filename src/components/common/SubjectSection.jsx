import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubjects } from '../../api/dashboard/dashboardApi';
import Loader from '../../components/common/Loader';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SubjectSection() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    getSubjects(1, 10)
      .then(res => { if (res.statusCode === 200) setSubjects(res.data ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!subjects.length)
    return <div className="empty-state"><div className="empty-state-icon">📚</div><h3>No subjects available</h3></div>;

  return (
    <div className="page-section">
      <div className="page-section-head">
        <h2 className="page-section-title">Subjects</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subjects')}>View All →</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
        {subjects.slice(0, 5).map(s => (
          <div key={s.subjectId} className="course-card" style={{ display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div className="course-card-img" onClick={() => navigate(`/subject-laws/${s.subjectId}`)}>
              {s.subject_image
                ? <img src={`${BASE_URL}/${s.subject_image}`} alt={s.title} onError={e => (e.currentTarget.src='https://via.placeholder.com/220x140?text=No+Image')} />
                : <div className="course-card-img-placeholder">📚</div>}
            </div>
            <div className="course-card-body">
              <h3 className="course-card-title">{s.title}</h3>
              {s.categoryId?.[0]?.tag_text && <p className="course-card-sub">{s.categoryId[0].tag_text}</p>}
              <div className="course-card-actions">
                {/* Buy Now → SubjectDetail which has the enroll flow */}
                {/* <button className="btn btn-gold btn-sm" onClick={() => navigate(`/subject/${s.subjectId}`)}>Buy Now</button> */}
                {/* Explore More → Subcategory of the first linked subcategory */}
                <button
  className="btn btn-primary btn-sm"
  onClick={() => navigate(`/subject-laws/${s.subjectId}`)}
>
  View All
</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
