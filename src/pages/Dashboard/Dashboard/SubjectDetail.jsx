import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import Loader from '../../../components/common/Loader';
import EnrollModal from '../../../components/common/EnrollModal';
import { getSubjectDetails, getSubjectsByLawForUser } from '../../../api/dashboard/dashboardApi';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate      = useNavigate();
  const userId        = localStorage.getItem('userId');
  const [detail,       setDetail]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null); // triggers EnrollModal

  useEffect(() => {
    setLoading(true);
    getSubjectDetails(subjectId)
      .then(async r => {
        if (r.statusCode !== 200) return;
        const base = Array.isArray(r.data) ? r.data[0] : r.data;
        const lawId = Array.isArray(base?.law_id) ? base.law_id[0]?.lawId : base?.law_id;
        if (userId && lawId) {
          try {
            const uRes = await getSubjectsByLawForUser(lawId, userId);
            if (uRes.statusCode === 200) {
              const match = (uRes.data ?? []).find(s => s.subjectId === subjectId);
              if (match) { setDetail({ ...base, ...match }); return; }
            }
          } catch {}
        }
        setDetail(base);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subjectId]);

  const law  = Array.isArray(detail?.law_id)          ? detail.law_id[0]          : null;
  const sc   = Array.isArray(detail?.subcategory_id)  ? detail.subcategory_id[0]  : null;
  const subcatId = sc?.subcategory_id ?? (typeof detail?.subcategory_id === 'string' ? detail.subcategory_id : null);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {loading ? <Loader /> : !detail ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>Subject not found</h3>
            </div>
          ) : (
            <>
              {/* ── Hero ── */}
              <div className="detail-hero" style={{ marginBottom: '1.25rem' }}>
                <div className="detail-hero-img">
                  {detail.subject_image
                    ? <img src={`${BASE_URL}/${detail.subject_image}`} alt={detail.title} />
                    : <div className="detail-hero-img-placeholder">📚</div>}
                </div>
                <div className="detail-hero-body">
                  <div className="detail-hero-tag"><span className="badge badge-navy">Subject</span></div>
                  <h1 className="detail-hero-title">{detail.title}</h1>

                  {/* All available plans shown as chips */}
                  {detail.availablePlans?.length > 0 && (
                    <div className="detail-hero-plans">
                      {detail.availablePlans.map(p => (
                        <span key={p.planId} className="plan-chip">
                          {p.strike_price && <del>₹{p.strike_price}</del>}
                          {' '}₹{p.original_price} <em>{p.duration}</em>
                          {p.discount_percent && ` · ${p.discount_percent}% off`}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="detail-hero-actions">
                    {detail.isEnrolled ? (
                      <>
                        <span className="badge badge-success" style={{ padding: '.45rem .85rem', fontSize: '.82rem' }}>
                          ✓ Enrolled · Expires {detail.expiry_date ? new Date(detail.expiry_date).toLocaleDateString('en-IN') : '—'}
                        </span>
                        <button className="btn btn-primary"
                          onClick={() => navigate(`/lectures/${detail.subjectId}`)}>
                          ▶ Continue Learning
                        </button>
                      </>
                    ) : detail.availablePlans?.length > 0 ? (
                      <>
                        {/* Each plan gets its own Buy Now button → EnrollModal appears HERE */}
                        {detail.availablePlans.map(p => (
                          <button key={p.planId} className="btn btn-gold"
                            onClick={() => setSelectedPlan(p)}>
                            Buy Now · ₹{p.original_price}
                          </button>
                        ))}
                        {/* Explore More → next cards page = lectures list */}
                        <button className="btn btn-outline"
                          onClick={() => navigate(`/lectures/${detail.subjectId}`)}>
                          Explore More →
                        </button>
                      </>
                    ) : (
                      /* No plans → just show Explore More */
                      <button className="btn btn-outline"
                        onClick={() => navigate(`/lectures/${detail.subjectId}`)}>
                        Explore More →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Remaining duration ── */}
              {detail.isEnrolled && detail.remaining_duration != null && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📅</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{detail.remaining_duration} days remaining</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>
                        Expires {new Date(detail.expiry_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <button className="btn btn-gold btn-sm" style={{ marginLeft: 'auto' }}
                      onClick={() => navigate(`/lectures/${detail.subjectId}`)}>
                      ▶ Start Learning
                    </button>
                  </div>
                </div>
              )}

              {/* ── Part of Course ── */}
              {sc && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-header">🎓 Part of Course</div>
                  <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {sc.presentation_image && (
                      <img src={`${BASE_URL}/${sc.presentation_image}`} alt={sc.title}
                        style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '.2rem' }}>{sc.title}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>
                        {sc.about_course?.split('\n')[0]}
                      </div>
                    </div>
                    {/* Explore More → subcategory detail (law cards) */}
                    <button className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/subcategory/${sc.subcategory_id}`)}>
                      Explore More →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Law context ── */}
              {law && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-header">⚖️ Law</div>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                    {law.law_image && (
                      <img src={`${BASE_URL}/${law.law_image}`} alt={law.title}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                    )}
                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.875rem' }}>{law.title}</div>
                    {/* Explore → subjects cards for this law */}
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}
                      onClick={() => navigate(`/subjects/${law.lawId}`)}>
                      All Subjects →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Go to Lectures CTA if enrolled ── */}
              {detail.isEnrolled && (
                <div style={{ textAlign: 'center', marginTop: '.5rem' }}>
                  <button className="btn btn-gold"
                    onClick={() => navigate(`/lectures/${detail.subjectId}`)}>
                    ▶ Go to Lectures
                  </button>
                </div>
              )}
            </>
          )}

          {/* EnrollModal — ONLY appears on this detail page when a plan's Buy Now is clicked */}
          {selectedPlan && (
            <EnrollModal
              plan={selectedPlan}
              courseTitle={detail?.title}
              enroll_type="subject-wise"
              onClose={() => setSelectedPlan(null)}
              onSuccess={() => { setSelectedPlan(null); navigate(0); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
