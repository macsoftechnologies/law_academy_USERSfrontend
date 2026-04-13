import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import EnrollModal from '../../components/common/EnrollModal';
import { getNotesDetail, getSubjectNotes } from '../../api/notes/notesApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Render PDF in-page via Google Docs viewer
const toPdfViewer = url => {
  if (!url) return null;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
};

export default function NoteDetailPage() {
  const { notesId } = useParams();
  const navigate    = useNavigate();
  const { state }   = useLocation();
  const buyRef      = useRef(null);

  const passedNote  = state?.note || null;
  const scrollToBuy = state?.scrollToBuy || false;

  const [detail,       setDetail]       = useState(null);
  const [subjectNotes, setSubjectNotes] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [snLoading,    setSnLoading]    = useState(true);
  const [enrollModal,  setEnrollModal]  = useState(null);
  // Track which subject-note is being viewed in-page
  const [openPdfUrl,   setOpenPdfUrl]   = useState(null);

  useEffect(() => {
    getNotesDetail(notesId)
      .then(r => { if (r.statusCode === 200) setDetail(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    getSubjectNotes(1, 50)
      .then(r => {
        if (r.statusCode === 200)
          setSubjectNotes((r.data ?? []).filter(sn => sn.notes_id?.[0]?.notes_id === notesId));
      })
      .catch(console.error)
      .finally(() => setSnLoading(false));
  }, [notesId]);

  useEffect(() => {
    if (scrollToBuy && !loading && buyRef.current)
      buyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scrollToBuy, loading]);

  const note = detail || passedNote;
  const availablePlans = passedNote?.availablePlans || [];
  const isEnrolled = note?.isEnrolled || false;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {loading ? <Loader /> : !note ? (
            <div className="empty-state"><div className="empty-state-icon">📄</div><h3>Note not found</h3></div>
          ) : (
            <>
              {/* Hero */}
              <div className="detail-hero" style={{ marginBottom: '1.5rem' }}>
                <div className="detail-hero-img">
                  {note.presentation_image
                    ? <img src={`${BASE_URL}/${note.presentation_image}`} alt={note.title} />
                    : <div className="detail-hero-img-placeholder">📄</div>}
                </div>
                <div className="detail-hero-body">
                  <div className="detail-hero-tag">
                    <span className="badge badge-navy">Notes</span>
                    {note.isPrintAvail && <span className="badge badge-gold" style={{ marginLeft: '.4rem' }}>🖨 Print Available</span>}
                  </div>
                  <h1 className="detail-hero-title">{note.title}</h1>
                  {note.sub_title && <p className="detail-hero-sub">{note.sub_title}</p>}
                  {isEnrolled ? (
                    <span className="badge badge-success" style={{ padding: '.45rem .85rem', fontSize: '.82rem' }}>
                      ✓ Enrolled — Expires: {note?.expiry_date ? new Date(note.expiry_date).toLocaleDateString('en-IN') : '—'}
                    </span>
                  ) : availablePlans.length > 0 && (
                    <div className="detail-hero-plans">
                      {availablePlans.map(p => (
                        <span key={p.planId} className="plan-chip">
                          {p.strike_price && <del>₹{p.strike_price}</del>} ₹{p.original_price} <em>{p.duration}</em>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* About */}
              {note.about_book?.description && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-header">About this Book</div>
                  <div className="card-body" style={{ color: 'var(--gray-600)', lineHeight: 1.8, fontSize: '.9rem' }}>
                    {note.about_book.description}
                  </div>
                </div>
              )}

              {/* Buy / Plan section — EnrollModal is triggered here */}
              {!isEnrolled && availablePlans.length > 0 && (
                <div ref={buyRef} className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-header">Choose a Plan</div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {availablePlans.map(plan => (
                        <div key={plan.planId}
                          style={{ border: '2px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', minWidth: 200, cursor: 'pointer', transition: 'border-color .18s' }}
                          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                          onMouseOut={e  => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                        >
                          <div style={{ fontSize: '.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gray-400)', marginBottom: '.4rem' }}>
                            {plan.duration}
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '.5rem' }}>₹{plan.original_price}</div>
                          {plan.strike_price && (
                            <div style={{ fontSize: '.82rem', color: 'var(--gray-400)', marginBottom: '.75rem' }}>
                              <del>₹{plan.strike_price}</del>
                              {plan.discount_percent && <span className="badge badge-success" style={{ marginLeft: '.35rem' }}>{plan.discount_percent}% off</span>}
                            </div>
                          )}
                          <button className="btn btn-gold btn-sm btn-full"
                            onClick={() => setEnrollModal({ plan, title: note.title })}>
                            Enroll Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Notes — open PDF in-page */}
              {!snLoading && subjectNotes.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    Subject Notes <span className="page-section-count" style={{ marginLeft: '.4rem' }}>{subjectNotes.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {subjectNotes.map((sn, i) => (
                      <div key={i} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.85rem 1.25rem' }}>
                          {/* Icon */}
                          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, background: sn.isLocked ? 'var(--gray-200)' : 'var(--gold-pale)' }}>
                            {sn.isLocked ? '🔒' : '📑'}
                          </div>
                          {/* Title */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '.875rem' }}>{sn.title || `Subject Note ${i + 1}`}</div>
                            {sn.law && <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{sn.law}</div>}
                          </div>
                          {/* View in-page — no external link */}
                          {!sn.isLocked && sn.pdf_url && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setOpenPdfUrl(openPdfUrl === sn.pdf_url ? null : sn.pdf_url)}
                            >
                              {openPdfUrl === sn.pdf_url ? 'Close' : 'View →'}
                            </button>
                          )}
                        </div>
                        {/* In-page PDF iframe */}
                        {openPdfUrl === sn.pdf_url && !sn.isLocked && (
                          <div style={{ height: 600, background: '#f5f5f5', borderTop: '1px solid var(--gray-100)' }}>
                            <iframe
                              src={toPdfViewer(sn.pdf_url)}
                              title={sn.title || 'Subject Note'}
                              style={{ width: '100%', height: '100%', border: 'none' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {enrollModal && (
            <EnrollModal
              plan={enrollModal.plan}
              courseTitle={enrollModal.title}
              enroll_type="notes-wise"
              onClose={() => setEnrollModal(null)}
              onSuccess={data => {
                setDetail(prev => prev ? { ...prev, isEnrolled: true, expiry_date: data?.expiry_date } : prev);
                setSubjectNotes(prev => prev.map(sn => ({ ...sn, isLocked: false })));
                setEnrollModal(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
