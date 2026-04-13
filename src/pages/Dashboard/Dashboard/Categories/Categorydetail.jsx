import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import Loader from '../../../../components/common/Loader';
import { getCategoryDetails, getSubcategoriesByUser } from '../../../../api/dashboard/dashboardApi';
import '../../../../styles/design-system.css';
import '../../../../styles/components.css';
import '../../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Fetch category details + user-specific subcategories
    Promise.all([
      getCategoryDetails(categoryId),
      userId ? getSubcategoriesByUser(userId, categoryId) : Promise.resolve({ statusCode: 200, data: [] })
    ])
      .then(([catRes, subRes]) => {
        if (catRes.statusCode === 200) setCategory(catRes.data);
        if (subRes.statusCode === 200) setSubcategories(subRes.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryId, userId]);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {loading ? (
            <Loader />
          ) : (
            <>
              {/* Category hero banner */}
              {category && (
                <div
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    height: 240,
                    marginBottom: '1.5rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  {category.presentation_file ? (
                    <img
                      src={`${BASE_URL}/${category.presentation_file}`}
                      alt={category.category_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#0f2355' }} />
                  )}

                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,35,85,.85) 0%, rgba(15,35,85,.3) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '1.5rem 2rem' }}>
                    <span className="badge badge-gold" style={{ marginBottom: '.5rem' }}>Category</span>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,2.5vw,2rem)', color: 'var(--cream)', lineHeight: 1.2 }}>
                      {category.category_name}
                    </h1>
                    {category.tag_text && <p style={{ color: 'rgba(255,247,224,.7)', fontSize: '.9rem', marginTop: '.3rem' }}>{category.tag_text}</p>}
                  </div>
                </div>
              )}

              <div className="page-section-head">
                <h2 className="page-section-title">Courses <span className="page-section-count">{subcategories.length}</span></h2>
              </div>

              {subcategories.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📘</div>
                  <h3>No courses available yet</h3>
                </div>
              ) : (
                <div className="course-grid">
                  {subcategories.map(sub => {
                    const primaryPlan = sub.availablePlans?.length
                      ? sub.availablePlans.reduce((m, p) => Number(p.original_price) < Number(m.original_price) ? p : m, sub.availablePlans[0])
                      : null;

                    return (
                      <div key={sub.subcategory_id} className="course-card">
                        <div
                          className="course-card-img"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/subcategory/${sub.subcategory_id}`)}
                        >
                          {sub.presentation_image
                            ? <img src={`${BASE_URL}/${sub.presentation_image}`} alt={sub.title} />
                            : <div className="course-card-img-placeholder">📘</div>}
                          {sub.isEnrolled && (
                            <span className="course-card-enrolled-badge">
                              <span className="badge badge-success">✓ Enrolled</span>
                            </span>
                          )}
                        </div>

                        <div className="course-card-body">
                          <h3 className="course-card-title">{sub.title}</h3>

                          <div className="course-card-plan-area">
                            {sub.isEnrolled
                              ? <div className="course-card-enrolled-info">
                                  ✓ Expires: {sub.expiry_date ? new Date(sub.expiry_date).toLocaleDateString('en-IN') : '—'}
                                </div>
                              : primaryPlan && (
                                <span className="plan-chip">
                                  {primaryPlan.strike_price && <del>₹{primaryPlan.strike_price}</del>}
                                  {' '}₹{primaryPlan.original_price} <em>{primaryPlan.duration}</em>
                                </span>
                              )}
                          </div>

                          <div className="course-card-actions">
                            {sub.isEnrolled ? (
                              <button className="btn btn-gold btn-sm" onClick={() => navigate(`/subcategory/${sub.subcategory_id}`)}>
                                Open →
                              </button>
                            ) : (
                              <>
                                {primaryPlan && (
                                  <button className="btn btn-outline btn-sm"
  onClick={() => navigate(`/subcategory/${sub.subcategory_id}/checkout`, { state: { sub } })}>
  Buy Now
</button>
                                )}
                                <button className="btn btn-primary btn-sm"
  onClick={() => navigate(`/subcategory/${sub.subcategory_id}`)}>
  View Details
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}