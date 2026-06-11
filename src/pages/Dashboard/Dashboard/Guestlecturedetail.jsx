import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../../../components/layout/DashboardHeader";
import Loader from "../../../components/common/Loader";
import { getGuestLectureDetails, getUserCourses } from "../../../api/dashboard/dashboardApi";
import "../../../styles/design-system.css";
import "../../../styles/components.css";
import "../../../styles/layout.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* =========================
   VIDEO URL HANDLER
========================= */
function getEmbedUrl(url) {
  if (!url) return "";

  // YouTube
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Short YouTube
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Vimeo
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
}

const normalizeGuestLectureLock = (lecture) => {
  if (lecture?.isLocked !== undefined) {
    if (typeof lecture.isLocked === "boolean") return lecture.isLocked;
    return String(lecture.isLocked).toLowerCase() === "true";
  }

  if (lecture?.locked !== undefined) {
    if (typeof lecture.locked === "boolean") return lecture.locked;
    return String(lecture.locked).toLowerCase() === "true";
  }

  return true;
};

export default function GuestLectureDetail() {
  const { lectureId } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasFullCourse, setHasFullCourse] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      getUserCourses(userId).then(res => {
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          const hasFull = res.data.some(course => course.enroll_type === 'full-course');
          setHasFullCourse(hasFull);
        }
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);

    if (!lectureId) {
      setLoading(false);
      return;
    }

    getGuestLectureDetails(lectureId)
      .then((res) => {
        if (res.statusCode === 200) {
          const lecture = Array.isArray(res.data)
            ? res.data[0]
            : res.data;
          setDetail({
            ...lecture,
            isLocked: normalizeGuestLectureLock(lecture),
          });
        }
      })
      .catch((err) => {
        console.error(
          "Guest lecture details failed:",
          err
        );
      })
      .finally(() => setLoading(false));
  }, [lectureId]);

  if (loading) return <Loader />;

  if (!detail) {
    return (
      <div className="dash-shell">
        <DashboardHeader />
        <div className="dash-main">
          <div className="dash-content">
            <h3>Lecture not found</h3>
          </div>
        </div>
      </div>
    );
  }

  const embeddedUrl = getEmbedUrl(detail.video_url);

  return (
    <div className="dash-shell">
      <DashboardHeader />

      <div className="dash-main">
        <div className="dash-content">
          {/* Back */}
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          {/* MAIN PREMIUM LAYOUT */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "30px",
              marginTop: "20px",
              alignItems: "start",
            }}
          >
            {/* LEFT SIDE */}
            <div>
              {/* VIDEO OR LOCKED THUMBNAIL */}
              {!detail.isLocked && detail.video_url ? (
                <div
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,0.12)",
                    marginBottom: "25px",
                  }}
                >
                  {embeddedUrl.includes("youtube") ||
                  embeddedUrl.includes("vimeo") ? (
                    <iframe
                      width="100%"
                      height="460"
                      src={embeddedUrl}
                      title={detail.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      width="100%"
                      height="460"
                      controls
                    >
                      <source
                        src={detail.video_url}
                      />
                    </video>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    position: "relative",
                    borderRadius: "16px",
                    overflow: "hidden",
                    marginBottom: "25px",
                  }}
                >
                  <img
                    src={`${BASE_URL}/${detail.presentation_image}`}
                    alt={detail.title}
                    style={{
                      width: "100%",
                      height: "460px",
                      objectFit: "cover",
                      filter: "brightness(0.65)",
                    }}
                  />

                  {/* overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#fff",
                      fontSize: "22px",
                      fontWeight: 700,
                      textAlign: "center",
                      padding: "0 20px"
                    }}
                  >
                    🔒 Enroll to Watch Full Lecture

                    {hasFullCourse ? (
                      <button
                        className="buy-btn"
                        style={{
                          marginTop: "16px",
                        }}
                        onClick={() =>
                          navigate(
                            `/guest-lecture-buy/${lectureId}`
                          )
                        }
                      >
                        Buy Full Access
                      </button>
                    ) : (
                      <div style={{ 
                        marginTop: "20px", 
                        padding: "12px 20px", 
                        background: "rgba(0, 0, 0, 0.75)", 
                        border: "1px solid rgba(255, 255, 255, 0.2)", 
                        borderRadius: "12px", 
                        color: "#fff", 
                        fontSize: "0.95rem", 
                        fontWeight: 500, 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px" 
                      }}>
                        <span style={{ fontSize: "1.2rem", color: "#fca5a5" }}>🔒</span>
                        <span>Purchase a <strong>Full Course</strong> to unlock.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DETAILS */}
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "15px",
                  }}
                >
                  <span className="badge badge-gold">
                    Guest Lecture
                  </span>

                  <span
                    className={`badge ${
                      detail.isLocked
                        ? "badge-danger"
                        : "badge-success"
                    }`}
                  >
                    {detail.isLocked
                      ? "🔒 Locked"
                      : "🔓 Unlocked"}
                  </span>
                </div>

                <h1 className="detail-hero-title">
                  {detail.title}
                </h1>

                {detail.author && (
                  <p
                    style={{
                      fontSize: ".95rem",
                      color: "var(--gray-600)",
                      fontWeight: 600,
                      marginTop: "8px",
                    }}
                  >
                    👨‍🏫 Speaker: {detail.author}
                  </p>
                )}

                {detail.duration && (
                  <p
                    style={{
                      marginTop: "10px",
                      fontWeight: 500,
                    }}
                  >
                    ⏱ Duration: {detail.duration}
                  </p>
                )}

                {detail.about_lecture && (
                  <div style={{ marginTop: "25px" }}>
                    <h3>About Lecture</h3>
                    <p>{detail.about_lecture}</p>
                  </div>
                )}

                {detail.about_class && (
                  <div style={{ marginTop: "25px" }}>
                    <h3>About Class</h3>
                    <p>{detail.about_class}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE STICKY CARD */}
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.08)",
                position: "sticky",
                top: "20px",
              }}
            >
              {detail.presentation_image && (
                <img
                  src={`${BASE_URL}/${detail.presentation_image}`}
                  alt={detail.title}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    marginBottom: "15px",
                  }}
                />
              )}

              <h3>{detail.title}</h3>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: ".9rem",
                  color: "#555",
                }}
              >
                {detail.about_class}
              </p>

              <div style={{ marginTop: "20px" }}>
                {detail.isLocked ? (
                  hasFullCourse ? (
                    <button
                      className="buy-btn"
                      style={{ width: "100%" }}
                      onClick={() =>
                        navigate(
                          `/guest-lecture-buy/${lectureId}`
                        )
                      }
                    >
                      🔒 Buy Full Lecture
                    </button>
                  ) : (
                    <div style={{
                      marginTop: "10px",
                      padding: "12px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "10px",
                      color: "#b91c1c",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      lineHeight: 1.5
                    }}>
                      <span style={{ fontSize: "1.2rem", marginTop: "-2px" }}>🔒</span>
                      <span>Purchase a <strong>Full Course</strong> to unlock this lecture content.</span>
                    </div>
                  )
                ) : (
                  <button
                    className="view-btn"
                    style={{ width: "100%" }}
                  >
                    ✅ Already Enrolled
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}