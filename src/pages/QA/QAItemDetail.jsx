import { FileText, Video, Lock, BookOpen } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';

import { getQADetails } from '../../api/qaApi';

import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';
import WishlistIcon from '../../components/common/WishlistIcon';

/** Convert video URLs into embed URLs */
const toVideoEmbed = (url) => {
  if (!url) return null;

  try {
    const u = new URL(url);

    const youtubeId =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be')
        ? u.pathname.slice(1)
        : null);

    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
    }

    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];

      if (id) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }

    if (url.includes('/embed/')) {
      return url;
    }
  } catch (e) {
    console.error('Video parse error:', e);
  }

  return url;
};





const SECTION_KEYS = [
  { key: 'question', label: 'Question' },
  { key: 'answer', label: 'Answer' },
  { key: 'solution', label: 'Solution' },
  { key: 'explanation', label: 'Explanation' },
  { key: 'essay', label: 'Essay' },
  { key: 'translation', label: 'Translation' },
  { key: 'description', label: 'Description' },
];

export default function QAItemDetail() {
  const navigate = useNavigate();

  const { prelimsId, mainsId, module_type, qa_id } = useParams();
  const { state } = useLocation();

  const isEnrolled = state?.isEnrolled || false;
  const incomingLocked = state?.isLocked ?? null;

  const [qa, setQa] = useState(state?.qa || null);
  const [loading, setLoading] = useState(!state?.qa);
  const [error, setError] = useState(null);
  const [showPdf, setShowPdf] = useState(false);

  const categoryLabel =
    state?.categoryLabel ||
    module_type ||
    'QA Item';

  const courseRoot =
    prelimsId
      ? `/prelims/${prelimsId}`
      : mainsId
      ? `/mains/${mainsId}`
      : '/';

  useEffect(() => {
    if (qa) return;

    const load = async () => {
      setLoading(true);

      try {
        const res = await getQADetails({ qa_id });

        const payload =
          res?.statusCode === 200
            ? (res.data ?? res)
            : res?.data ?? res;

        if (res?.statusCode === 200 && payload) {
          setQa(Array.isArray(payload) ? payload[0] : payload);
        } else {
          setError('Unable to load details.');
        }
      } catch (e) {
        console.error('QA detail load error:', e);
        setError('Unable to load details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [qa, qa_id]);

  const isLocked = () => {
    const qLocked = incomingLocked ?? qa?.isLocked ?? qa?.is_locked ?? false;
    return !!(qLocked && !isEnrolled);
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((item, idx) => <p key={idx}>{item}</p>);
    }
    return <p>{value}</p>;
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />

      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="page-section-head">
            <h1 className="page-section-title">{categoryLabel}</h1>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
              <Loader />
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <h3>{error}</h3>
              <button className="btn btn-secondary" onClick={() => navigate(courseRoot)}>
                Back to list
              </button>
            </div>
          ) : !qa ? (
            <div className="empty-state">
              <div className="empty-state-icon">{<FileText size={18} color="#64748b" />}</div>
              <h3>No item found</h3>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                gap: '1.25rem',
                alignItems: 'start'
              }}
            >
              {/* LEFT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {qa?.presentation_image && (
                  <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: '#000' }}>
                    <img
                      src={qa.presentation_image}
                      alt={qa.title}
                      style={{ width: '100%', maxHeight: '380px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {qa?.video_url && (
                  <div className="card">
                    <div className="card-header">{<Video size={18} color="#6366f1" />} Video Lecture</div>
                    {isLocked() ? (
                      <div style={{ padding: '1rem' }}>{<Lock size={18} color="#dc2626" />} Enroll to watch the video</div>
                    ) : (
                      <div style={{ aspectRatio: '16/9', background: '#000' }}>
                        <iframe
                          src={toVideoEmbed(qa.video_url)}
                          title={qa.title}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.72rem' }}>{qa.module}</div>
                    <h1>{qa.title}</h1>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Connect to backend API once available
                      alert("Wishlist feature for videos coming soon!");
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: '0', transition: 'transform 0.2s', marginTop: '5px' }}
                    title="Add Video to Wishlist"
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {<WishlistIcon size={18} color="var(--navy)" />}
                  </button>
                  <span className="badge badge-navy" style={{ marginTop: '10px' }}>{qa.module_type}</span>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {SECTION_KEYS.map(section => {
                    const value = qa[section.key];
                    if (!value) return null;

                    if (isLocked() && section.key !== 'question') {
                      return (
                        <div key={section.key} className="card">
                          <div>{section.label}</div>
                          <div>{<Lock size={18} color="#dc2626" />} Enroll to view this section</div>
                        </div>
                      );
                    }

                    return (
                      <div key={section.key} className="card">
                        <div>{section.label}</div>
                        <div>{renderValue(value)}</div>
                      </div>
                    );
                  })}
                </div>

                {/* PDF */}
                {qa?.pdf_url && (
                  <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{<FileText size={18} color="#64748b" />} PDF Material</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!isLocked() && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert("Wishlist feature for notes coming soon!");
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.2rem', transition: 'transform 0.2s' }}
                            title="Add Note to Wishlist"
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            {<WishlistIcon size={18} color="var(--navy)" />}
                          </button>
                        )}
                        {!isLocked() && (
                          <button className="btn btn-outline btn-sm" onClick={() => setShowPdf(v => !v)}>
                            {showPdf ? 'Hide ▲' : 'View ▼'}
                          </button>
                        )}
                      </div>
                    </div>

                    {showPdf && !isLocked() && (
                      <iframe
                        src={qa.pdf_url}
                        style={{ width: '100%', height: 600 }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card">
                  <div className="card-header">{<BookOpen size={18} color="#3b82f6" />} Details</div>
                  <div className="card-body">
                    <div>Questions: {qa.no_of_qs}</div>
                    <div>Duration: {qa.duration}</div>
                    <div>Status: {qa.isLocked ? 'Locked' : 'Unlocked'}</div>
                    <div>Created: {new Date(qa.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}