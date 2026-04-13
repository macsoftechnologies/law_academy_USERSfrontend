import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import DashboardHeader from "../../../../components/layout/DashboardHeader";
import Loader from "../../../../components/common/Loader";
import { getSubjects } from "../../../../api/dashboard/dashboardApi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SubjectLawTabs() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLaw, setActiveLaw] = useState("");

  useEffect(() => {
    setLoading(true);

    // get all subjects
    getSubjects(1, 100)
      .then((res) => {
        if (res.statusCode === 200) {
          const data = res.data ?? [];
          setSubjects(data);

          const current = data.find(
            (s) => String(s.subjectId) === String(subjectId)
          );

          const firstLaw =
            current?.law_id?.[0]?.title ||
            data?.[0]?.law_id?.[0]?.title ||
            "";

          setActiveLaw(firstLaw);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subjectId]);

  const groupedByLaw = useMemo(() => {
    const grouped = {};

    subjects.forEach((subject) => {
      const lawTitle = subject?.law_id?.[0]?.title || "Others";

      if (!grouped[lawTitle]) grouped[lawTitle] = [];
      grouped[lawTitle].push(subject);
    });

    return grouped;
  }, [subjects]);

  const lawTabs = Object.keys(groupedByLaw);

  if (loading) return <Loader />;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <h1 className="page-section-title">Subjects by Law</h1>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              margin: "20px 0",
              flexWrap: "wrap",
            }}
          >
            {lawTabs.map((law) => (
              <button
                key={law}
                className={`btn btn-sm ${
                  activeLaw === law ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setActiveLaw(law)}
              >
                ⚖️ {law}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="course-grid">
            {groupedByLaw[activeLaw]?.map((subject) => (
              <div key={subject.subjectId} className="course-card">
                <div
                  className="course-card-img"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/lectures/${subject.subjectId}`)
                  }
                >
                  {subject.subject_image ? (
                    <img
                      src={`${BASE_URL}/${subject.subject_image}`}
                      alt={subject.title}
                    />
                  ) : (
                    <div className="course-card-img-placeholder">📚</div>
                  )}
                </div>

                <div className="course-card-body">
                  <h3 className="course-card-title">{subject.title}</h3>

                  <div className="course-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate(`/lectures/${subject.subjectId}`)
                      }
                    >
                      Open Lectures
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}