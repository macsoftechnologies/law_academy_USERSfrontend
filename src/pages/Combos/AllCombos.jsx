import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import CartWishlistActions from '../../components/common/CartWishlistActions';
import { getCombos } from '../../api/combo/comboApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;
const COMBO_EMOJIS = ['🏆', '📚', '⚖️', '🎓', '📜', '🔏'];

export default function AllCombos() {
  const navigate = useNavigate();
  const [combos,  setCombos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    getCombos(page, PAGE_SIZE)
      .then(r => {
        if (r?.statusCode === 200) {
          setCombos(Array.isArray(r.data) ? r.data : []);
          setTotal(r.totalCount ?? r.total ?? r.data?.length ?? 0);
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
              Combo Courses {!loading && <span className="page-section-count">{total}</span>}
            </h1>
          </div>

          {loading ? <Loader /> : combos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No combo courses available</h3>
            </div>
          ) : (
            <>
              <div className="course-grid">
                {combos.map((item, i) => {
                  const comboId    = item.combo_id || item.id || item._id;
                  const title      = item.title || item.name || `Combo ${i + 1}`;
                  const subtitle   = item.sub_title || item.subtitle || '';
                  const emoji      = COMBO_EMOJIS[i % COMBO_EMOJIS.length];
                  const imgSrc     = item.presentation_image ? `${BASE_URL}/${item.presentation_image}` : null;
                  const isEnrolled = item.isEnrolled ?? false;

                  const lowestPlan = item.availablePlans?.length
                    ? item.availablePlans.reduce((m, p) => p.original_price < m.original_price ? p : m, item.availablePlans[0])
                    : null;
                  const price    = lowestPlan?.original_price ?? item.price ?? item.original_price ?? null;
                  const strike   = lowestPlan?.strike_price   ?? item.strike_price ?? null;
                  const discount = lowestPlan?.discount_percent ?? item.discount_percent ?? null;

                  return (
                    <div key={comboId || i} className="course-card">
                      <div className="course-card-img">
                        {imgSrc
                          ? <img src={imgSrc} alt={title} />
                          : <div className="course-card-img-placeholder" style={{ fontSize: '2.5rem' }}>{emoji}</div>}
                        {isEnrolled && (
                          <span className="course-card-enrolled-badge">
                            <span className="badge badge-success">✓ Enrolled</span>
                          </span>
                        )}
                      </div>
                      <div className="course-card-body">
                        <h3 className="course-card-title">{title}</h3>
                        {subtitle && <p className="course-card-sub">{subtitle}</p>}
                        <div className="course-card-plan-area">
                          {isEnrolled ? (
                            <div className="course-card-enrolled-info">
                              ✓ Expires: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-IN') : '—'}
                            </div>
                          ) : price != null ? (
                            <span className="plan-chip">
                              {strike && <del>₹{strike}</del>}
                              ₹{price}
                              {discount && <span className="plan-discount">{discount}% off</span>}
                            </span>
                          ) : null}
                        </div>
                        <div className="course-card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {!isEnrolled && price != null && (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                              <CartWishlistActions 
                                courseId={comboId} 
                                enrollType="combination" 
                                planId={lowestPlan?.planId || lowestPlan?.plan_id} 
                                isEnrolled={isEnrolled} 
                                courseTitle={title}
                              />
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            {!isEnrolled && price != null && (
                              <button
                                className="btn btn-gold btn-sm" style={{ flex: 1 }}
                                onClick={() => navigate(`/combos/${comboId}`, { state: { combo: item, scrollToBuy: true } })}
                              >
                                Buy Now
                              </button>
                            )}
                            <button
                              className="btn btn-outline btn-sm" style={{ flex: 1 }}
                              onClick={() => navigate(`/combos/${comboId}`, { state: { combo: item } })}
                            >
                              {isEnrolled ? 'Continue →' : 'Explore →'}
                            </button>
                          </div>
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
