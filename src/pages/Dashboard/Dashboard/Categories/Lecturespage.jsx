import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import Loader from '../../../../components/common/Loader';
import EnrollModal from '../../../../components/common/EnrollModal';
import {
  getLecturesBySubject,
  getSubjectDetails,
  getSubjectsByLawForUser
} from '../../../../api/dashboard/dashboardApi';

import '../../../../styles/design-system.css';
import '../../../../styles/components.css';
import '../../../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LecturesPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [lectures, setLectures] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (!subjectId) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        console.log("👉 SUBJECT ID:", subjectId);
        console.log("👉 USER ID:", userId);

        // ✅ Fetch lectures
        const lecturesRes = await getLecturesBySubject(subjectId, userId);

        console.log("📦 LECTURES RESPONSE:", lecturesRes);

        setLectures(
          Array.isArray(lecturesRes?.data)
            ? lecturesRes.data
            : []
        );

        // ✅ Fetch subject details
        try {
          const subjectRes = await getSubjectDetails(subjectId);

          console.log("📦 SUBJECT RESPONSE:", subjectRes);

          const base = Array.isArray(subjectRes)
            ? subjectRes[0]
            : subjectRes;

          if (!base) return;

          const lawId = Array.isArray(base?.law_id)
            ? base.law_id[0]?.lawId
            : base?.law_id;

          if (userId && lawId) {
            try {
              const userSubjects = await getSubjectsByLawForUser(lawId, userId);

              const match = (userSubjects || []).find(
                s => s.subjectId === subjectId
              );

              if (match) {
  const mergedSubject = {
    ...base,
    ...match,
    availablePlans:
      base?.availablePlans?.length
        ? base.availablePlans
        : match?.availablePlans || []
  };

  console.log("✅ MERGED SUBJECT:", mergedSubject);
  setSubject(mergedSubject);
  return;
}
            } catch (err) {
              console.error("❌ USER SUBJECT ERROR:", err);
            }
          }

          setSubject(base);
        } catch (err) {
          console.error("❌ SUBJECT API FAILED:", err);
        }

      } catch (err) {
        console.error("❌ LECTURES API FAILED:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, userId]);

  const primaryPlan = subject?.availablePlans?.length
    ? subject.availablePlans.reduce(
        (m, p) =>
          Number(p.original_price) < Number(m.original_price) ? p : m,
        subject.availablePlans[0]
      )
    : null;

  return (
    <div className="dash-shell">
      <DashboardHeader />

      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          {/* ✅ Subject header */}
          {subject && (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div
                className="card-body"
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                {subject.subject_image && (
                  <img
                    src={`${BASE_URL}/${subject.subject_image}`}
                    alt={subject.title}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      color: 'var(--navy)',
                      marginBottom: '.2rem'
                    }}
                  >
                    {subject.title}
                  </h1>

                  {subject.isEnrolled ? (
                    <span className="badge badge-success">
                      ✓ Enrolled · Expires{' '}
                      {subject.expiry_date
                        ? new Date(subject.expiry_date).toLocaleDateString('en-IN')
                        : '—'}
                    </span>
                  ) : (
                    primaryPlan && (
                      <span className="plan-chip">
                        {primaryPlan.strike_price && (
                          <del>₹{primaryPlan.strike_price}</del>
                        )}{' '}
                        ₹{primaryPlan.original_price}{' '}
                        <em>{primaryPlan.duration}</em>
                      </span>
                    )
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '.5rem',
                    flexShrink: 0
                  }}
                >
                  {!subject.isEnrolled && primaryPlan && (
                    <button
                      className="btn btn-gold btn-sm"
                      onClick={() => setSelectedPlan(primaryPlan)}
                    >
                      Buy Now
                    </button>
                  )}

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/subject/${subject.subjectId}`)}
                  >
                    Details →
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="page-section-head">
            <h2 className="page-section-title">
              Lectures{' '}
              <span className="page-section-count">{lectures.length}</span>
            </h2>
          </div>

          {loading ? (
            <Loader />
          ) : lectures.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎬</div>
              <h3>No lectures available</h3>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '.6rem'
              }}
            >
              {lectures.map((l, i) => {
                const locked = l.isLocked === true;

                return (
                  <div
                    key={l.lectureId || i}
                    className="card"
                    style={{
                      cursor: locked ? 'default' : 'pointer',
                      opacity: locked ? 0.75 : 1
                    }}
                    onClick={() =>
                      !locked && navigate(`/lecture/${l.lectureId}`)
                    }
                  >
                    <div
                      className="card-body"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-md)',
                          background: locked
                            ? 'var(--gray-200)'
                            : 'var(--gold-pale)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '.85rem',
                          fontWeight: 800,
                          color: locked
                            ? 'var(--gray-400)'
                            : 'var(--maroon)',
                          flexShrink: 0
                        }}
                      >
                        {locked ? '🔒' : `L${l.lecture_no ?? i + 1}`}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: 'var(--navy)',
                            fontSize: '.9rem',
                            marginBottom: '.15rem'
                          }}
                        >
                          {l.title}
                        </div>

                        {l.author && (
                          <div
                            style={{
                              fontSize: '.75rem',
                              color: 'var(--gray-400)'
                            }}
                          >
                            By {l.author}
                          </div>
                        )}

                        {l.description && (
                          <div
                            style={{
                              fontSize: '.78rem',
                              color: 'var(--gray-500)',
                              marginTop: '.2rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {l.description}
                          </div>
                        )}
                      </div>

                      {locked ? (
                        <button
                          className="btn btn-gold btn-sm"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedPlan(primaryPlan);
                          }}
                        >
                          Buy Now
                        </button>
                      ) : (
                        <span className="play-icon">▶</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal inside JSX */}
      {selectedPlan && (
        <EnrollModal
          plan={selectedPlan}
          courseTitle={subject?.title}
          enroll_type="subject-wise"
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}