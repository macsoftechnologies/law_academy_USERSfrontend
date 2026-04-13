import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import EnrollModal from '../../../../components/common/EnrollModal';
import '../../../../styles/design-system.css';
import '../../../../styles/components.css';
import '../../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SubcategoryCheckout() {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const sub = state?.sub;

  const [enrollModal, setEnrollModal] = useState(null);

  // Guard: if someone opens this URL directly without navigation state
  if (!sub) {
    navigate(-1);
    return null;
  }

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {/* ── Hero ── */}
          <div className="detail-hero" style={{ marginBottom: '1.5rem' }}>
            <div className="detail-hero-img">
              {sub.presentation_image
                ? <img src={`${BASE_URL}/${sub.presentation_image}`} alt={sub.title} />
                : <div className="detail-hero-img-placeholder">📘</div>}
            </div>
            <div className="detail-hero-body">
              <span className="badge badge-navy">Course</span>
              <h1 className="detail-hero-title">{sub.title}</h1>
              {sub.about_course && (
                <p style={{
                  fontSize: '.875rem',
                  color: 'var(--gray-600)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  marginTop: '.5rem'
                }}>
                  {sub.about_course}
                </p>
              )}
            </div>
          </div>

          {/* ── Plans ── */}
          {sub.availablePlans?.length > 0 ? (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header">💳 Choose a Plan</div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {sub.availablePlans.map(p => (
                  <div key={p.planId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '.85rem 1rem',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '.4rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{p.original_price}</span>
                        {p.strike_price && (
                          <del style={{ fontSize: '.82rem', color: 'var(--gray-400)' }}>₹{p.strike_price}</del>
                        )}
                        {p.discount_percent && (
                          <span className="badge badge-success" style={{ fontSize: '.72rem' }}>
                            {p.discount_percent}% off
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginTop: '.2rem' }}>
                        {p.duration}
                        {p.handling_fee && ` · ₹${p.handling_fee} handling fee`}
                      </div>
                    </div>
                    <button
                      className="btn btn-gold"
                      onClick={() => setEnrollModal({ plan: p, title: sub.title })}
                    >
                      Enroll Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-body" style={{ color: 'var(--gray-500)', fontSize: '.875rem' }}>
                No plans available for this course yet.
              </div>
            </div>
          )}

          {/* ── Terms & Conditions ── */}
          {sub.terms_conditions && (
            <div className="card">
              <div className="card-header">📋 Terms & Conditions</div>
              <div className="card-body" style={{
                fontSize: '.875rem',
                color: 'var(--gray-600)',
                lineHeight: 1.8,
                whiteSpace: 'pre-line'
              }}>
                {sub.terms_conditions}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Enroll Modal ── */}
      {enrollModal && (
        <EnrollModal
          plan={enrollModal.plan}
          courseTitle={enrollModal.title}
          enroll_type="subcategory-wise"
          onClose={() => setEnrollModal(null)}
          onSuccess={() => {
            setEnrollModal(null);
            navigate(`/subcategory/${subcategoryId}`, { replace: true });
          }}
        />
      )}
    </div>
  );
}