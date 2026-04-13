import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import Loader from '../../../../components/common/Loader';
import { getSubcategoryDetails, getLawsBySubcategory } from '../../../../api/dashboard/dashboardApi';
import '../../../../styles/design-system.css';
import '../../../../styles/components.css';
import '../../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SubcategoryDetail() {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSubcategoryDetails(subcategoryId),
      getLawsBySubcategory(subcategoryId),
    ]).then(([sRes, lRes]) => {
      if (sRes.statusCode === 200) setSub(Array.isArray(sRes.data) ? sRes.data[0] : sRes.data);
      if (lRes.statusCode === 200) setLaws(lRes.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [subcategoryId]);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {loading ? <Loader /> : (
            <>
              {/* ── Course title strip ── */}
              {sub && (
                <div className="page-section-head" style={{ marginBottom: '1.25rem' }}>
                  <h2 className="page-section-title">{sub.title}</h2>
                </div>
              )}

              {/* ── Law Cards ── */}
              {laws.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">⚖️</div>
                  <h3>No laws available yet</h3>
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
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/subjects/${l.lawId}`)}>
                            Explore Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}