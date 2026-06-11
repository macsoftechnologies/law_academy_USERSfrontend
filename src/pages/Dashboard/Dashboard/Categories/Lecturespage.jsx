import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../../components/layout/DashboardHeader';
import Loader from '../../../../components/common/Loader';
import EnrollModal from '../../../../components/common/EnrollModal';
import CartWishlistActions from '../../../../components/common/CartWishlistActions';
import {
  getLecturesBySubject,
  getSubjectDetails,
  getSubjectsByLawForUser,
  getUserCourses,
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

        const lecturesRes = await getLecturesBySubject(subjectId, userId);
        const lectureList = Array.isArray(lecturesRes?.data) ? lecturesRes.data : [];

        console.log("📦 LECTURES RESPONSE:", lecturesRes);
        setLectures(lectureList);

        try {
          const subjectRes = await getSubjectDetails(subjectId);
          console.log("📦 SUBJECT RESPONSE:", subjectRes);

          const base = subjectRes?.data || null;
          if (!base) return;

          const normalizeId = id => String(id ?? '').trim();
          const currentId = normalizeId(subjectId);
          const findMatchingSubject = s => {
            const candidate = normalizeId(s?.subjectId ?? s?.subject_id);
            return candidate === currentId;
          };

          const lawId = Array.isArray(base?.law_id)
            ? base.law_id[0]?.lawId
            : base?.law_id;

          const subcategoryId = Array.isArray(base?.subcategory_id)
            ? base.subcategory_id[0]?.subcategory_id ?? base.subcategory_id[0]
            : base?.subcategory_id;

          const lecturesFullyUnlocked = lectureList.length > 0
            && lectureList.every(l => l.isLocked !== true);

          let mergedSubject = { ...base };
          let matchedUserSubject = null;
          let userCourses = [];
          const validTypes = ['subcategory-wise', 'full-course', 'subject-wise'];

          if (userId && lawId) {
            try {
              const userSubjectsRes = await getSubjectsByLawForUser(lawId, userId);
              const userSubjects = Array.isArray(userSubjectsRes?.data)
                ? userSubjectsRes.data
                : [];

              matchedUserSubject = userSubjects.find(findMatchingSubject);
              if (matchedUserSubject) {
                mergedSubject = {
                  ...mergedSubject,
                  ...matchedUserSubject,
                  availablePlans:
                    base?.availablePlans?.length
                      ? base.availablePlans
                      : matchedUserSubject?.availablePlans || []
                };
              }
            } catch (err) {
              console.error("❌ USER SUBJECT ERROR:", err);
            }
          }

          if (userId) {
            try {
              const coursesRes = await getUserCourses(userId);
              if (coursesRes?.statusCode === 200 && Array.isArray(coursesRes.data)) {
                userCourses = coursesRes.data;
              }
            } catch (err) {
              console.error("❌ USER COURSES ERROR:", err);
            }
          }

          const hasCourseAccess = userCourses.some(course => {
            const courseId = normalizeId(course?.course_id);
            return validTypes.includes(course?.enroll_type)
              && (courseId === normalizeId(subcategoryId) || courseId === currentId);
          });

          mergedSubject = {
            ...mergedSubject,
            isEnrolled: Boolean(
              matchedUserSubject?.isEnrolled
              || base?.isEnrolled
              || lecturesFullyUnlocked
              || hasCourseAccess
            ),
            expiry_date: mergedSubject?.expiry_date
              || userCourses.find(course => {
                const courseId = normalizeId(course?.course_id);
                return validTypes.includes(course?.enroll_type)
                  && (courseId === normalizeId(subcategoryId) || courseId === currentId);
              })?.expiry_date
          };

          console.log("✅ MERGED SUBJECT:", mergedSubject);
          setSubject(mergedSubject);
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
                    flexDirection: 'column',
                    gap: '.5rem',
                    flexShrink: 0
                  }}
                >
                  {!subject.isEnrolled && primaryPlan && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                      <CartWishlistActions 
                        courseId={subject.subjectId || subjectId} 
                        enrollType="subject-wise" 
                        planId={primaryPlan.planId || primaryPlan.plan_id} 
                        isEnrolled={subject.isEnrolled} 
                        hideCart={true}
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!subject.isEnrolled && primaryPlan && (
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => navigate(`/subject/${subject.subjectId}`)}
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
                // const locked = l.isLocked === true;
                const locked = !subject?.isEnrolled && l.isLocked === true;

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
                            navigate(`/subject/${subject?.subjectId}`);
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

      {/* Buy now redirects to subject details so users can select the correct plan and year. */}

    </div>
  );
}