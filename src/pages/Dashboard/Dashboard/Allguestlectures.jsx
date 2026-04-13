import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../../components/layout/DashboardHeader";
import Loader from "../../../components/common/Loader";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import { getGuestLectures } from "../../../api/dashboard/dashboardApi";
import "../../../styles/design-system.css";
import "../../../styles/components.css";
import "../../../styles/layout.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 12;

export default function AllGuestLectures() {
  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);

    getGuestLectures(page, PAGE_SIZE)
      .then((res) => {
        if (res.statusCode === 200) {
          setLectures(res.data ?? []);
          setTotal(
            res.totalCount ??
              res.data?.length ??
              0
          );
        }
      })
      .catch((err) => {
        console.error(
          "Failed to fetch guest lectures:",
          err
        );
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="dash-shell">
      <DashboardHeader />

      <div className="dash-main">
        <div className="dash-content">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              Guest Lectures
              {!loading && (
                <span className="page-section-count">
                  {total}
                </span>
              )}
            </h1>
          </div>

          {loading ? (
            <Loader />
          ) : lectures.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎤</div>
              <h3>No guest lectures available</h3>
            </div>
          ) : (
            <>
              <div className="course-grid">
                {lectures.map((lecture) => (
                  <div
                    key={lecture.guest_lecture_id}
                    className="course-card"
                  >
                    {/* IMAGE */}
                    <div className="course-card-img">
                      {lecture.presentation_image ? (
                        <img
                          src={`${BASE_URL}/${lecture.presentation_image}`}
                          alt={lecture.title}
                        />
                      ) : (
                        <div className="course-card-img-placeholder">
                          🎤
                        </div>
                      )}
                    </div>

                    {/* BODY */}
                    <div className="course-card-body">
                      {/* badge */}
                      <div
                        style={{
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          className={`badge ${
                            lecture.isLocked
                              ? "badge-danger"
                              : "badge-success"
                          }`}
                        >
                          {lecture.isLocked
                            ? "🔒 Locked"
                            : "🔓 Unlocked"}
                        </span>
                      </div>

                      <h3 className="course-card-title">
                        {lecture.title}
                      </h3>

                      {lecture.author && (
                        <p className="course-card-sub">
                          {lecture.author}
                        </p>
                      )}

                      {/* ACTION BUTTONS */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "15px",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* preview / continue */}
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/guest-lecture/${lecture.guest_lecture_id}`
                            )
                          }
                        >
                          {lecture.isLocked
                            ? "Preview"
                            : "Continue"}
                        </Button>

                        {/* buy only if locked */}
                        {lecture.isLocked && (
                          <Button
                            variant="primary"
                            onClick={() =>
                              navigate(
                                `/guest-lecture-buy/${lecture.guest_lecture_id}`
                              )
                            }
                          >
                            Buy Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={Math.ceil(
                  total / PAGE_SIZE
                )}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}