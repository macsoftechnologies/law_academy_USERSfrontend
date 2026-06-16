import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';

import { getQADetails } from '../../api/qaApi';

import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

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



/** Render PDF inside page */
const toInPagePdf = (url) => {
  if (!url) return null;

  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
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
              <div className="empty-state-icon">📄</div>
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
                    <div className="card-header">🎥 Video Lecture</div>
                    {isLocked() ? (
                      <div style={{ padding: '1rem' }}>🔒 Enroll to watch the video</div>
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

                <div style={{ display: 'flex', gap: '.85rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.72rem' }}>{qa.module}</div>
                    <h1>{qa.title}</h1>
                  </div>
                  <span className="badge badge-navy">{qa.module_type}</span>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {SECTION_KEYS.map(section => {
                    const value = qa[section.key];
                    if (!value) return null;

                    if (isLocked() && section.key !== 'question') {
                      return (
                        <div key={section.key} className="card">
                          <div>{section.label}</div>
                          <div>🔒 Enroll to view this section</div>
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
                    <div className="card-header">
                      📄 PDF Material
                      {!isLocked() && (
                        <button onClick={() => setShowPdf(v => !v)}>
                          {showPdf ? 'Hide ▲' : 'View ▼'}
                        </button>
                      )}
                    </div>

                    {showPdf && !isLocked() && (
                      <iframe
                        src={toInPagePdf(qa.pdf_url)}
                        style={{ width: '100%', height: 600 }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card">
                  <div className="card-header">📘 Details</div>
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