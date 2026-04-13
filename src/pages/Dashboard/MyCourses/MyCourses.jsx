import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../../components/layout/DashboardHeader";
import Loader from "../../../components/common/Loader";
import { getUserCourses } from "../../../api/dashboard/dashboardApi";
import "../../../styles/design-system.css";
import "../../../styles/components.css";
import "../../../styles/layout.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TABS = ["All", "Active", "Completed"];

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    getUserCourses(userId)
      .then((res) => {
        if (res.statusCode === 200) {
          const mapped = (res.data || []).map((item) => {
            const isExpired = new Date(item.expiry_date).getTime() < Date.now();
            return {
              id: item.enroll_id,
              courseId: item.course_id,
              title:
                item.courseDetails?.title ||
                item.courseDetails?.sub_title ||
                "Course",
              subtitle: item.courseDetails?.sub_title || "",
              image: item.courseDetails?.presentation_image || "",
              status: isExpired ? "Completed" : "Active",
              enrolled: formatDate(item.enroll_date),
              expiry: formatDate(item.expiry_date),
              enrollType: item.enroll_type,
              raw: item,
            };
          });

          setCourses(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = useMemo(() => {
    return courses.filter(
      (c) =>
        (tab === "All" || c.status === tab) &&
        c.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, tab, search]);

  const handleContinue = (course) => {
    console.log("Continuing course:", course);
    navigate(`/enrollment/${course.id}`, { state: { course } });
  };

  if (loading) return <Loader />;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              🎓 My Courses
              <span className="page-section-count">{courses.length}</span>
            </h1>

            <input
              className="field input"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: ".55rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--gray-200)",
                width: 220,
              }}
            />
          </div>

          {/* Tabs */}
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
                <span className="tab-badge">
                  {t === "All"
                    ? courses.length
                    : courses.filter((c) => c.status === t).length}
                </span>
              </button>
            ))}
          </div>

          {!filtered.length ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🎓</div>
                <h3>No courses found</h3>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
                gap: "1rem",
              }}
            >
              {filtered.map((course) => (
                <div key={course.id} className="card">
                  <div className="card-body">
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "var(--gray-100)",
                          flexShrink: 0,
                        }}
                      >
                        {course.image ? (
                          <img
                            src={`${BASE_URL}/${course.image}`}
                            alt={course.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              display: "grid",
                              placeItems: "center",
                              height: "100%",
                            }}
                          >
                            📚
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--navy)",
                          }}
                        >
                          {course.title}
                        </div>

                        <div
                          style={{
                            fontSize: ".75rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {course.subtitle}
                        </div>
                      </div>

                      <span
                        className={`badge ${
                          course.status === "Active"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: ".75rem",
                        color: "var(--gray-500)",
                      }}
                    >
                      <span>Enrolled: {course.enrolled}</span>
                      <span>Expires: {course.expiry}</span>
                    </div>

                    <button
                      className="btn btn-primary btn-sm btn-full"
                      style={{ marginTop: "1rem" }}
                      onClick={() => handleContinue(course)}
                    >
                      ▶ Continue Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}