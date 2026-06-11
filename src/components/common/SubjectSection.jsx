import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubjects } from '../../api/dashboard/dashboardApi';
import Loader from '../../components/common/Loader';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SubjectSection({ subjects: propSubjects, title = "Subjects" }) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (propSubjects) {
      setSubjects(propSubjects);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSubjects(1, 10)
      .then(res => { if (res.statusCode === 200) setSubjects(res.data ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [propSubjects]);

  if (loading) return <Loader />;
  if (!subjects.length)
    return null; // Don't show empty state here to keep dashboard clean

  return (
    <div className="page-section">
      <div className="page-section-head">
        <h2 className="page-section-title">{title}</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/subject-laws/${subjects[0]?.subjectId || 'all'}`)}>View All →</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
        {subjects.slice(0, 5).map(s => (
          <div key={s.subjectId} className="course-card" style={{ display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div className="course-card-img" onClick={() => navigate(`/subject/${s.subjectId}`)}>
              {s.subject_image
                ? <img src={`${BASE_URL}/${s.subject_image}`} alt={s.title} onError={e => (e.currentTarget.src='https://via.placeholder.com/220x140?text=No+Image')} />
                : <div className="course-card-img-placeholder">📚</div>}
            </div>
            <div className="course-card-body">
              <h3 className="course-card-title">{s.title}</h3>
              {s.categoryId?.[0]?.tag_text && <p className="course-card-sub">{s.categoryId[0].tag_text}</p>}
              <div className="course-card-actions">
                <button
  className="btn btn-primary btn-sm"
  onClick={() => navigate(`/subject/${s.subjectId}`)}
>
  View Subject
</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
