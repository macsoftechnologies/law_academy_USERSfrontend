import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import Loader from '../../../../components/common/Loader';
import { getLectureDetail } from '../../../../api/dashboard/dashboardApi';
import '../../../../styles/design-system.css';
import '../../../../styles/components.css';
import '../../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** YouTube watch/share → embed URL (plays inside iframe, not on youtube.com) */
const toYouTubeEmbed = url => {
  if (!url) return null;
  try {
    const u = new URL(url);
    // https://www.youtube.com/watch?v=ID  OR  https://youtu.be/ID
    const v = u.searchParams.get('v') || (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null);
    if (v) return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1`;
  } catch {}
  // already an embed URL or other video — return as-is so iframe can try
  return url;
};

/** Wrap any PDF URL in Google Docs Viewer so it renders inside the page */
const toInPagePdf = url => {
  if (!url) return null;
  // If already a data-URL or blob, use directly
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
};

export default function LectureDetails() {
  const { lectureId } = useParams();
  const navigate      = useNavigate();
  const [detail,   setDetail]  = useState(null);
  const [loading,  setLoading] = useState(true);
  const [showPdf,  setShowPdf] = useState(false);

  useEffect(() => {
    getLectureDetail(lectureId)
      .then(r => { if (r.statusCode === 200) setDetail(Array.isArray(r.data) ? r.data[0] : r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lectureId]);

  const embedUrl  = toYouTubeEmbed(detail?.video_url);
  const pdfUrl    = toInPagePdf(detail?.notes_pdf_url);

  // Resolve nested populated objects
  const sub = detail ? (Array.isArray(detail.subjectId)      ? detail.subjectId[0]      : null) : null;
  const law = detail ? (Array.isArray(detail.lawId)          ? detail.lawId[0]          : null) : null;
  const sc  = detail ? (Array.isArray(detail.subcategory_id) ? detail.subcategory_id[0] : null) : null;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {loading ? <Loader /> : !detail ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎬</div>
              <h3>Lecture not found</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>

              {/* ════════════════ LEFT COLUMN ════════════════ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* ── In-page video player (never opens YouTube externally) ── */}
                {embedUrl && (
                  <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: '#000', aspectRatio: '16/9', boxShadow: 'var(--shadow-lg)' }}>
                    <iframe
                      src={embedUrl}
                      title={detail.title}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* ── Title card ── */}
                <div className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.85rem', marginBottom: '.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.15rem' }}>
                          Lecture {detail.lecture_no}
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem,2vw,1.5rem)', color: 'var(--navy)', lineHeight: 1.3 }}>
                          {detail.title}
                        </h1>
                        {detail.author && (
                          <div style={{ fontSize: '.82rem', color: 'var(--gray-500)', marginTop: '.25rem' }}>By {detail.author}</div>
                        )}
                      </div>
                      <span className="badge badge-navy">Lecture</span>
                    </div>
                    {detail.description && (
                      <p style={{ fontSize: '.875rem', color: 'var(--gray-600)', lineHeight: 1.8 }}>{detail.description}</p>
                    )}
                  </div>
                </div>

                {/* ── In-page PDF viewer for lecture notes (never opens external tab) ── */}
                {pdfUrl && (
                  <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📄 Lecture Notes</span>
                      <button className="btn btn-outline btn-sm" onClick={() => setShowPdf(v => !v)}>
                        {showPdf ? 'Hide Notes ▲' : 'View Notes ▼'}
                      </button>
                    </div>
                    {showPdf && (
                      <div style={{ height: 620, background: '#f5f5f5', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
                        <iframe
                          src={pdfUrl}
                          title="Lecture Notes"
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ════════════════ RIGHT SIDEBAR ════════════════ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 'calc(var(--header-h, 64px) + 1.5rem)' }}>

                {/* Subject card */}
                {sub && (
                  <div className="card">
                    <div className="card-header">📚 Subject</div>
                    <div className="card-body">
                      {sub.subject_image && (
                        <img src={`${BASE_URL}/${sub.subject_image}`} alt={sub.title}
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '.75rem' }} />
                      )}
                      <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '.5rem' }}>{sub.title}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                        {/* Explore More → lectures cards list (next page of cards) */}
                        <button className="btn btn-gold btn-sm btn-full"
                          onClick={() => navigate(`/lectures/${sub.subjectId ?? subjectId}`)}>
                          All Lectures →
                        </button>
                        {/* Details → SubjectDetail */}
                        <button className="btn btn-outline btn-sm btn-full"
                          onClick={() => navigate(`/subject/${sub.subjectId ?? subjectId}`)}>
                          Subject Details →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Law card */}
                {law && (
                  <div className="card">
                    <div className="card-header">⚖️ Law</div>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      {law.law_image && (
                        <img src={`${BASE_URL}/${law.law_image}`} alt={law.title}
                          style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.875rem' }}>{law.title}</div>
                        {/* Explore → subjects cards */}
                        <button className="btn btn-ghost btn-sm" style={{ padding: '.2rem 0', fontSize: '.75rem' }}
                          onClick={() => navigate(`/subjects/${law.lawId}`)}>
                          View Subjects →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course (subcategory) card */}
                {sc && typeof sc === 'object' && (
                  <div className="card">
                    <div className="card-header">🎓 Course</div>
                    <div className="card-body">
                      {sc.presentation_image && (
                        <img src={`${BASE_URL}/${sc.presentation_image}`} alt={sc.title}
                          style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '.75rem' }} />
                      )}
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem', marginBottom: '.5rem' }}>{sc.title}</div>
                      <div style={{ display: 'flex', gap: '.5rem', flexDirection: 'column' }}>
                        {/* Buy Now → SubcategoryDetail (full details + plans → EnrollModal there) */}
                        <button className="btn btn-gold btn-sm btn-full"
                          onClick={() => navigate(`/subcategory/${sc.subcategory_id}`)}>
                          Buy Now
                        </button>
                        {/* Explore More → next cards page = SubcategoryDetail law cards */}
                        <button className="btn btn-outline btn-sm btn-full"
                          onClick={() => navigate(`/subcategory/${sc.subcategory_id}`)}>
                          Explore More →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
