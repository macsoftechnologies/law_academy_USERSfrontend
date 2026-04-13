import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import Loader from '../../../../components/common/Loader';
import { getCategories } from '../../../../api/dashboard/dashboardApi';
import '../../../../styles/design-system.css';
import '../../../../styles/components.css';
import '../../../../styles/layout.css';
import lecimg from '../../../../assets/icons/guestlect.png';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AllCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(r => { if (r.statusCode === 200) setCategories(r.data ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allItems = [
    ...categories,
    {
      categoryId: 'guest',
      category_name: 'Guest Lecturers',
      tag_text: 'Guiding Hand of the Court',
      presentation_file: lecimg,
      isStatic: true,
    }
  ];

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="page-section-head">
            <h1 className="page-section-title">
              All Categories {!loading && <span className="page-section-count">{allItems.length}</span>}
            </h1>
          </div>

          {loading ? <Loader /> : allItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <h3>No categories available</h3>
            </div>
          ) : (
            <div className="course-grid">
              {allItems.map(c => (
                <div key={c.categoryId} className="course-card">
                  <div
                    className="course-card-img"
                    style={{ cursor: 'pointer' }}
                    onClick={() => c.categoryId === 'guest' ? navigate('/guest-lectures') : navigate(`/category/${c.categoryId}`)}
                  >
                    {c.presentation_file
                      ? <img src={c.isStatic ? c.presentation_file : `${BASE_URL}/${c.presentation_file}`} alt={c.category_name} />
                      : <div className="course-card-img-placeholder">📂</div>}
                  </div>
                  <div className="course-card-body">
                    <h3 className="course-card-title">{c.category_name}</h3>
                    {c.tag_text && <p className="course-card-sub">{c.tag_text}</p>}
                    <div className="course-card-actions">
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => c.categoryId === 'guest' ? navigate('/guest-lectures') : navigate(`/category/${c.categoryId}`)}
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
