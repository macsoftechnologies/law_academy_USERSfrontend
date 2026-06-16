import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import EnrollModal from '../../components/common/EnrollModal';
import CartWishlistActions from '../../components/common/CartWishlistActions';
import { getComboContent, getComboPreview, getCombos } from '../../api/combo/comboApi';
import { updateMarksProgress } from '../../api/marksDashboard';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** YouTube watch/share → embed URL (plays inside iframe) */
const toYouTubeEmbed = url => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const v = u.searchParams.get('v') || (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null);
    if (v) return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1`;
  } catch {}
  return url;
};





const getNumberProp = (item, keys) => {
  if (!item) return 0;
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'number' && value >= 0) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
};

const getComboPreviewStats = (laws, item) => {
  const lawCount = laws.length;
  const subjectCount = laws.reduce((sum, law) => sum + (law.subjects?.length || 0), 0);
  const lectureCount = laws.reduce((sum, law) => sum + (law.subjects?.reduce((s, sub) => s + (sub.lectures?.length || 0), 0) || 0), 0);
  const noteCount = laws.reduce((sum, law) => sum + (law.subjects?.reduce((s, sub) => s + (sub.notes?.length || 0), 0) || 0), 0);

  return {
    lawCount: lawCount || getNumberProp(item, ['no_of_laws', 'laws_count', 'law_count']),
    subjectCount: subjectCount || getNumberProp(item, ['no_of_subjects', 'subjects_count', 'subject_count']),
    lectureCount: lectureCount || getNumberProp(item, ['no_of_lectures', 'lectures_count', 'lecture_count']),
    noteCount: noteCount || getNumberProp(item, ['no_of_notes', 'notes_count', 'note_count']),
  };
};

export default function ComboDetail() {
  const { comboId }   = useParams();
  const navigate      = useNavigate();
  const { state }     = useLocation();
  const buyRef        = useRef(null);

  const passedCombo = state?.combo || null;
  const scrollToBuy = state?.scrollToBuy || false;

  const [content,      setContent]      = useState(null);
  const [listItem,     setListItem]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEnrolled,   setIsEnrolled]   = useState(passedCombo?.isEnrolled ?? false);
  const [plans,        setPlans]        = useState(passedCombo?.availablePlans ?? []);
  const [showModal,    setShowModal]    = useState(false);

  // Accordion state: openLaw = law index, openSubject = "li-si" string, activeVideo = lecture._id, activePdf = note._id
  const [openLaw,     setOpenLaw]     = useState(0);      // open first law by default
  const [openSubject, setOpenSubject] = useState('0-0'); // open first subject by default
  const [activeVideo, setActiveVideo] = useState(null);
  const [activePdf,   setActivePdf]   = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const listRes = await getCombos(1, 100);
        let enrolled = passedCombo?.isEnrolled ?? false;
        let foundItem = passedCombo;
        if (listRes?.statusCode === 200) {
          const match = (listRes.data ?? []).find(c =>
            String(c.combo_id || c.id || c._id) === String(comboId)
          );
          if (match) {
            foundItem = match;
            enrolled = match.isEnrolled ?? enrolled;
            setListItem(match);
            setIsEnrolled(match.isEnrolled ?? false);
            setPlans(match.availablePlans ?? []);
          }
        }

        const contentRes = enrolled ? await getComboContent(comboId) : await getComboPreview(comboId);
        if (contentRes?.statusCode === 200) {
          setContent(Array.isArray(contentRes.data) ? contentRes.data[0] : contentRes.data);
        } else if (foundItem) {
          setContent(foundItem);
        }
      } catch {
        if (passedCombo) {
          setIsEnrolled(passedCombo.isEnrolled ?? false);
          setPlans(passedCombo.availablePlans ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [comboId]);

  useEffect(() => {
    if (scrollToBuy && !loading && buyRef.current) {
      buyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToBuy, loading]);

  const item        = listItem || passedCombo;
  const title       = content?.title || item?.title || 'Combo Course';
  const description = content?.description || item?.description || '';
  const imgSrc      = item?.presentation_image ? `${BASE_URL}/${item.presentation_image}` : null;
  const laws        = content?.laws ?? [];
  const courseLocked = !isEnrolled;

  const comboStats = getComboPreviewStats(laws, item);
  const previewSubjects = laws.flatMap((law, li) =>
    (law.subjects ?? []).slice(0, 2).map((subject, si) => ({
      key: `${li}-${si}`,
      lawTitle: law.title || law.law_name || `Law ${li + 1}`,
      subjectTitle: subject.title || subject.name || `Subject ${si + 1}`,
      lectureCount: (subject.lectures?.length || 0),
      noteCount: (subject.notes?.length || 0),
    }))
  ).slice(0, 4);

  const handleNotesScrollEnd = (note, law) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !note) return;
    const courseId = comboId;
    updateMarksProgress(userId, courseId, note._id, 'notes', law?.title || law?.law_name || 'civil', true).catch(() => {});
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {loading ? <Loader /> : (
            <>
              {/* ── Hero ─────────────────────────────────────────────── */}
              <div className="detail-hero" style={{ marginBottom: '1.5rem' }}>
                <div className="detail-hero-img">
                  {imgSrc
                    ? <img src={imgSrc} alt={title} />
                    : <div className="detail-hero-img-placeholder">📦</div>}
                </div>
                <div className="detail-hero-body">
                  <div className="detail-hero-tag">
                    <span className="badge badge-navy">Combo Course</span>
                  </div>
                  <h1 className="detail-hero-title">{title}</h1>
                  {description && (
                    <p className="detail-hero-sub" style={{ fontSize: '.875rem', lineHeight: 1.6 }}>
                      {description}
                    </p>
                  )}
                  {isEnrolled ? (
                    <div style={{ marginTop: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <span className="badge badge-success" style={{ fontSize: '.85rem', padding: '.4rem .85rem' }}>
                        ✓ Enrolled
                      </span>
                      {item?.expiry_date && (
                        <span style={{ fontSize: '.78rem', color: 'var(--gray-500)' }}>
                          Expires: {new Date(item.expiry_date).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  ) : plans.length > 0 && (
                    <>
                      <div className="detail-hero-plans">
                        {plans.map(p => (
                          <span key={p.planId || p.plan_id} className="plan-chip">
                            {p.strike_price && <del>₹{p.strike_price}</del>}
                            {' '}₹{p.original_price} <em>{p.duration}</em>
                          </span>
                        ))}
                      </div>
                      <div className="detail-hero-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button className="btn btn-gold" onClick={() => buyRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                          Buy Now
                        </button>
                        <CartWishlistActions 
                          courseId={comboId} 
                          enrollType="combination" 
                          planId={plans[0]?.planId || plans[0]?.plan_id} 
                          isEnrolled={isEnrolled} 
                          hideCart={true}
                          courseTitle={title}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {courseLocked && (
                <div className="toast warning" style={{ marginBottom: '1rem' }}>
                  🔒 Enroll to unlock the full combo content.
                </div>
              )}

              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                    What’s Inside
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '.85rem', borderRadius: '14px', background: 'var(--gray-50)' }}>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginBottom: '.35rem' }}>Laws</div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{comboStats.lawCount}</div>
                    </div>
                    <div style={{ padding: '.85rem', borderRadius: '14px', background: 'var(--gray-50)' }}>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginBottom: '.35rem' }}>Subjects</div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{comboStats.subjectCount}</div>
                    </div>
                    <div style={{ padding: '.85rem', borderRadius: '14px', background: 'var(--gray-50)' }}>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginBottom: '.35rem' }}>Lectures</div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{comboStats.lectureCount}</div>
                    </div>
                    <div style={{ padding: '.85rem', borderRadius: '14px', background: 'var(--gray-50)' }}>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginBottom: '.35rem' }}>Notes</div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{comboStats.noteCount}</div>
                    </div>
                  </div>

                  {previewSubjects.length > 0 ? (
                    <div>
                      <div style={{ marginBottom: '.75rem', fontSize: '.85rem', fontWeight: 700, color: 'var(--gray-600)' }}>
                        Preview subjects included in this combo
                      </div>
                      <div style={{ display: 'grid', gap: '.75rem' }}>
                        {previewSubjects.map(subject => (
                          <div key={subject.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem', borderRadius: '14px', background: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{subject.subjectTitle}</div>
                              <div style={{ fontSize: '.78rem', color: 'var(--gray-500)' }}>{subject.lawTitle}</div>
                            </div>
                            <div style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>
                              {subject.lectureCount} lectures · {subject.noteCount} notes
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: 'var(--gray-600)', lineHeight: 1.7 }}>
                      This combo includes multiple laws, subjects, lectures and notes. Enroll to view the full locked curriculum.
                    </p>
                  )}
                </div>
              </div>

              {/* ── Course Content: Laws → Subjects → Lectures / Notes ── */}
              {laws.length > 0 && (
                <div className="card" style={{ marginBottom: '1.25rem' }}>
                  <div className="card-body">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                      Course Content
                    </h2>

                    {laws.map((law, li) => {
                      const lawOpen     = openLaw === li;
                      const subjectList = law.subjects ?? [];

                      return (
                        <div key={law.lawId || li} style={{ marginBottom: '.6rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>

                          {/* Law row */}
                          <button
                            onClick={() => {
                              setOpenLaw(lawOpen ? null : li);
                              setOpenSubject(null);
                              setActiveVideo(null);
                              setActivePdf(null);
                            }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between', padding: '.85rem 1rem',
                              background: lawOpen ? 'var(--gold-pale)' : 'var(--gray-50)',
                              border: 'none', cursor: 'pointer', textAlign: 'left',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                              {law.law_image
                                ? <img src={`${BASE_URL}/${law.law_image}`} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                                : <span style={{ fontSize: '1.2rem' }}>⚖️</span>}
                              <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.9rem' }}>{law.title}</span>
                              <span style={{ fontSize: '.72rem', color: 'var(--gray-500)' }}>
                                {subjectList.length} Subject{subjectList.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <span style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>{lawOpen ? '▲' : '▼'}</span>
                          </button>

                          {/* Subjects */}
                          {lawOpen && (
                            <div style={{ padding: '.5rem .75rem .75rem' }}>
                              {subjectList.map((subject, si) => {
                                const subjKey  = `${li}-${si}`;
                                const subjOpen = openSubject === subjKey;
                                const lectures = subject.lectures ?? [];
                                const notes    = subject.notes ?? [];

                                return (
                                  <div key={subject.subjectId || si} style={{ marginBottom: '.45rem', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>

                                    {/* Subject row */}
                                    <button
                                      onClick={() => {
                                        setOpenSubject(subjOpen ? null : subjKey);
                                        setActiveVideo(null);
                                        setActivePdf(null);
                                      }}
                                      style={{
                                        width: '100%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between', padding: '.65rem .85rem',
                                        background: subjOpen ? 'var(--gray-50)' : 'var(--white)',
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                        {subject.subject_image
                                          ? <img src={`${BASE_URL}/${subject.subject_image}`} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                                          : <span style={{ fontSize: '1rem' }}>📘</span>}
                                        <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '.85rem' }}>{subject.title}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                        {lectures.length > 0 && <span style={{ fontSize: '.7rem', color: 'var(--gray-500)' }}>🎬 {lectures.length}</span>}
                                        {notes.length > 0 && <span style={{ fontSize: '.7rem', color: 'var(--gray-500)' }}>📄 {notes.length}</span>}
                                        <span style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{subjOpen ? '▲' : '▼'}</span>
                                      </div>
                                    </button>

                                    {/* Lectures + Notes list */}
                                    {subjOpen && (
                                      <div style={{ padding: '.5rem .85rem .7rem', background: 'var(--gray-50)' }}>

                                        {/* ── Lectures ── */}
                                        {lectures.length > 0 && (
                                          <>
                                            <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem' }}>
                                              Lectures
                                            </div>
                                            {lectures.map((lec, li2) => {
                                              const lecId        = lec._id || `${subjKey}-lec-${li2}`;
                                              const isPlaying    = activeVideo === lecId;
                                              const embedUrl     = toYouTubeEmbed(lec.video_url);
                                              const lockedLecture = courseLocked || !embedUrl;

                                              return (
                                                <div key={lecId} style={{ marginBottom: '.5rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: lockedLecture ? 'var(--gray-100)' : 'var(--white)' }}>
                                                  {/* Lecture row */}
                                                  <button
                                                    onClick={() => {
                                                      if (lockedLecture) return;
                                                      setActiveVideo(isPlaying ? null : lecId);
                                                      setActivePdf(null);
                                                    }}
                                                    style={{
                                                      width: '100%', display: 'flex', alignItems: 'center',
                                                      gap: '.6rem', padding: '.5rem .7rem',
                                                      background: isPlaying ? 'var(--gold-pale)' : 'var(--white)',
                                                      border: 'none', cursor: lockedLecture ? 'not-allowed' : 'pointer', textAlign: 'left',
                                                    }}
                                                  >
                                                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                                                      {lockedLecture ? '🔒' : isPlaying ? '⏸' : '▶️'}
                                                    </span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                      <div style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {lec.title || `Lecture ${li2 + 1}`}
                                                      </div>
                                                      {lec.description && !isPlaying && (
                                                        <div style={{ fontSize: '.7rem', color: 'var(--gray-500)', marginTop: '.1rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                          {lec.description}
                                                        </div>
                                                      )}
                                                    </div>
                                                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: lockedLecture ? 'var(--gray-400)' : 'var(--gold)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                      {lockedLecture ? 'Locked' : isPlaying ? 'Close ▲' : 'Watch ▼'}
                                                    </span>
                                                  </button>

                                                  {/* Inline video player */}
                                                  {isPlaying && embedUrl && (
                                                    <div style={{ aspectRatio: '16/9', background: '#000' }}>
                                                      <iframe
                                                        src={embedUrl}
                                                        title={lec.title || 'Lecture'}
                                                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </>
                                        )}

                                        {/* ── Notes (PDF view-only, no download) ── */}
                                        {notes.length > 0 && (
                                          <>
                                            <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '.55rem 0 .4rem' }}>
                                              Notes
                                            </div>
                                            {notes.map((note, ni) => {
                                              const locked   = courseLocked;
                                              const noteId   = note._id || `${subjKey}-note-${ni}`;
                                              const isPdfOpen = activePdf === noteId;
                                              const pdfUrl   = !locked ? note.pdf_url : null;

                                              return (
                                                <div key={noteId} style={{ marginBottom: '.4rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: locked ? 'var(--gray-100)' : 'var(--white)', opacity: locked ? 0.7 : 1 }}>
                                                  {/* Note row */}
                                                  <button
                                                    onClick={() => {
                                                      if (locked || !pdfUrl) return;
                                                      const opening = !isPdfOpen;
                                                      setActivePdf(opening ? noteId : null);
                                                      setActiveVideo(null);
                                                      if (opening) handleNotesScrollEnd(note, law);
                                                    }}
                                                    style={{
                                                      width: '100%', display: 'flex', alignItems: 'center',
                                                      gap: '.6rem', padding: '.5rem .7rem',
                                                      background: isPdfOpen ? 'var(--gold-pale)' : 'transparent',
                                                      border: 'none', cursor: locked ? 'not-allowed' : 'pointer', textAlign: 'left',
                                                    }}
                                                  >
                                                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                                                      {locked ? '🔒' : isPdfOpen ? '📖' : '📄'}
                                                    </span>
                                                    <span style={{ flex: 1, fontWeight: 600, fontSize: '.8rem', color: 'var(--navy)' }}>
                                                      {note.title || `Note ${ni + 1}`}
                                                    </span>
                                                    {!locked && pdfUrl && (
                                                      <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--gold)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                        {isPdfOpen ? 'Close ▲' : 'View ▼'}
                                                      </span>
                                                    )}
                                                    {locked && (
                                                      <span style={{ fontSize: '.7rem', color: 'var(--gray-400)', flexShrink: 0 }}>Locked</span>
                                                    )}
                                                  </button>

                                                  {/* Inline PDF viewer — view only, no download */}
                                                  {isPdfOpen && pdfUrl && (
                                                    <div style={{ height: 600, background: '#f5f5f5' }}>
                                                      <iframe
                                                        src={pdfUrl}
                                                        title={note.title || 'Note'}
                                                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </>
                                        )}

                                        {lectures.length === 0 && notes.length === 0 && (
                                          <div style={{ fontSize: '.8rem', color: 'var(--gray-400)', padding: '.4rem 0' }}>
                                            No content available yet.
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Buy Section ──────────────────────────────────────── */}
              {!isEnrolled && plans.length > 0 && (
                <div ref={buyRef} className="card" style={{ marginBottom: '1.25rem' }}>
                  <div className="card-body">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '.75rem' }}>
                      Choose a Plan
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1rem' }}>
                      {plans.map(plan => {
                        const pid  = plan.planId || plan.plan_id;
                        const isSel = (selectedPlan?.planId || selectedPlan?.plan_id) === pid;
                        return (
                          <div
                            key={pid}
                            onClick={() => setSelectedPlan(plan)}
                            style={{
                              border: `2px solid ${isSel ? 'var(--gold)' : 'var(--gray-200)'}`,
                              borderRadius: 'var(--radius-lg)', padding: '.85rem 1.2rem',
                              cursor: 'pointer', minWidth: 140,
                              background: isSel ? 'var(--gold-pale)' : 'var(--white)',
                            }}
                          >
                            <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem' }}>₹{plan.original_price}</div>
                            {plan.strike_price && <div style={{ textDecoration: 'line-through', color: 'var(--gray-400)', fontSize: '.8rem' }}>₹{plan.strike_price}</div>}
                            <div style={{ fontSize: '.78rem', color: 'var(--gray-500)', marginTop: '.2rem' }}>{plan.duration}</div>
                            {plan.discount_percent && <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--green-500)' }}>{plan.discount_percent}% off</div>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <button className="btn btn-gold" disabled={!selectedPlan} onClick={() => selectedPlan && setShowModal(true)}>
                        {selectedPlan ? `Enroll for ₹${selectedPlan.original_price}` : 'Select a Plan'}
                      </button>
                      <CartWishlistActions 
                        courseId={comboId} 
                        enrollType="full-course" 
                        planId={selectedPlan?.planId || selectedPlan?.plan_id} 
                        isEnrolled={isEnrolled} 
                        hideWishlist={true}
                        courseTitle={title}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && selectedPlan && item && (
        <EnrollModal
          item={{ ...item, combo_id: comboId }}
          plan={selectedPlan}
          enroll_type="combination"
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setIsEnrolled(true); }}
        />
      )}
    </div>
  );
}
