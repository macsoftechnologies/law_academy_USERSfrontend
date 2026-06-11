import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../../../components/layout/DashboardHeader";
import Loader from "../../../components/common/Loader";
import EnrollModal from "../../../components/common/EnrollModal";
import { getGuestLectureDetails, getUserCourses } from "../../../api/dashboard/dashboardApi";
import "../../../styles/design-system.css";
import "../../../styles/components.css";
import "../../../styles/layout.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export default function GuestLectureBuy() {
  const { lectureId } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
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
          const lecture = Array.isArray(res.data) ? res.data[0] : res.data;
          setDetail({
            ...lecture,
            isLocked: normalizeGuestLectureLock(lecture),
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load guest lecture for purchase:", err);
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
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div className="empty-state">
              <div className="empty-state-icon">🎤</div>
              <h3>Guest lecture not found</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availablePlans = detail.availablePlans || [];
  const selectedPlanTitle = selectedPlan?.duration || "Select a plan";

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="page-section-head">
            <h1 className="page-section-title">Buy Guest Lecture</h1>
          </div>

          <div className="card" style={{ marginBottom: "1rem", padding: "1.25rem"  }}>
            {detail.presentation_image && (
              <img
                src={`${BASE_URL}/${detail.presentation_image}`}
                alt={detail.title}
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  objectFit: "cover",
                  marginBottom: "1rem",
                }}
              />
            )}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1rem" }}>
              <span className="badge badge-gold">Guest Lecture</span>
              <span className={`badge ${detail.isLocked ? "badge-danger" : "badge-success"}`}>
                {detail.isLocked ? "🔒 Locked" : "🔓 Unlocked"}
              </span>
            </div>

            <h2 style={{ marginBottom: "0.75rem" }}>{detail.title}</h2>
            {detail.author && (
              <p style={{ marginBottom: "0.5rem", color: "var(--gray-700)", fontWeight: 600 }}>
                Speaker: {detail.author}
              </p>
            )}
            {detail.duration && (
              <p style={{ marginBottom: "0.75rem" }}>Duration: {detail.duration}</p>
            )}
            {detail.about_lecture && (
              <div style={{ marginBottom: "1rem" }}>
                <h3>About Lecture</h3>
                <p>{detail.about_lecture}</p>
              </div>
            )}
            {detail.about_class && (
              <div>
                <h3>About Class</h3>
                <p>{detail.about_class}</p>
              </div>
            )}
          </div>

          {detail.isLocked ? (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <div className="card-header">Choose a plan</div>
              <div className="card-body">
                {!hasFullCourse ? (
                  <div style={{
                    margin: "10px 0",
                    padding: "16px",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "12px",
                    color: "#b91c1c",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "1.3rem" }}>🔒</span>
                    <span>Purchase a <strong>Full Course</strong> to unlock this guest lecture.</span>
                  </div>
                ) : availablePlans.length === 0 ? (
                  <div className="card-body" style={{ color: "var(--gray-500)", padding: 0 }}>
                    No plans available for this lecture yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "0.85rem" }}>
                      {availablePlans.map((plan) => (
                        <div
                          key={plan.planId || plan.id || plan.original_price}
                        className="plan-chip"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          alignItems: "center",
                          padding: "0.9rem 1rem",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: "14px",
                          background: selectedPlan === plan ? "rgba(255, 223, 134, 0.25)" : "#fff",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--navy)" }}>
                            ₹{plan.original_price}
                            {plan.strike_price && (
                              <del style={{ marginLeft: "0.55rem", opacity: 0.6 }}>
                                ₹{plan.strike_price}
                              </del>
                            )}
                          </div>
                          <div style={{ fontSize: ".88rem", color: "var(--gray-600)" }}>
                            {plan.duration}
                          </div>
                        </div>
                        <button
                          className="btn btn-gold btn-sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedPlan(plan);
                            setShowEnrollModal(false);
                          }}
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: "1rem"}}>
              <div className="card-body" style={{ color: "var(--success)" }}>
                <p>This lecture is already unlocked. You may return to the lecture page to watch it.</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/guest-lecture/${lectureId}`)}
                >
                  Open Lecture
                </button>
              </div>
            </div>
          )}

          {detail.isLocked && availablePlans.length > 0 && hasFullCourse && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <div className="card-body" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <strong>Selected plan:</strong>
                <span>{selectedPlan ? `${selectedPlan.duration} - ₹${selectedPlan.original_price}` : selectedPlanTitle}</span>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!selectedPlan}
                  onClick={() => selectedPlan && setShowEnrollModal(true)}
                >
                  {selectedPlan ? "Proceed to enroll" : "Choose a plan"}
                </button>
              </div>
            </div>
          )}

          {selectedPlan && showEnrollModal && (
            <EnrollModal
              plan={selectedPlan}
              courseTitle={detail.title || "Guest Lecture"}
              enroll_type="guest-lecture"
              onClose={() => setShowEnrollModal(false)}
              onSuccess={() => {
                setShowEnrollModal(false);
                setSelectedPlan(null);
                setDetail((prev) => (prev ? { ...prev, isLocked: false } : prev));
                navigate(`/guest-lecture/${lectureId}`);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
