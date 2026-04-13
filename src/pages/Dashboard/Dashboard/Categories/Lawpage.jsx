import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import Loader from '../../../../components/common/Loader';
import { getLawsBySubcategory } from '../../../../api/dashboard/dashboardApi';
import '../../../../styles/design-system.css';
import '../../../../styles/components.css';
import '../../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LawsPage() {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [laws, setLaws]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLawsBySubcategory(subcategoryId)
      .then(r => { if (r.statusCode === 200) setLaws(r.data ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subcategoryId]);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              Laws <span className="page-section-count">{laws.length}</span>
            </h1>
          </div>

          {loading ? <Loader /> : laws.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚖️</div>
              <h3>No laws available</h3>
            </div>
          ) : (
            <div className="course-grid">
              {laws.map(l => (
                <div key={l.lawId} className="course-card">
                  <div
                    className="course-card-img"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/subjects/${l.lawId}`)}
                  >
                    {l.law_image
                      ? <img src={`${BASE_URL}/${l.law_image}`} alt={l.title} />
                      : <div className="course-card-img-placeholder">⚖️</div>}
                  </div>
                  <div className="course-card-body">
                    <h3 className="course-card-title">{l.title}</h3>
                    {l.description && <p className="course-card-sub">{l.description}</p>}
                    <div className="course-card-actions">
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => navigate(`/subjects/${l.lawId}`)}
                      >
                        Explore Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
