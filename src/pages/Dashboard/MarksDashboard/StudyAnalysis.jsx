import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import Loader from '../../../components/common/Loader';
import { getMarksDashboardStats } from '../../../api/marksDashboard';
import ProgressRow from './ProgressRow';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

export default function StudyAnalysis() {
  const navigate = useNavigate();
  const { courseIndex } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const userId = localStorage.getItem('userId') || user?._id || user?.id;

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getMarksDashboardStats(userId)
      .then(res => { if (res?.data) setStats(res.data); })
      .catch(err => console.error('Failed to fetch study analysis:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const course = stats?.courses?.[courseIndex] || {};
  const courseName = course.courseOverview?.courseName || 'Course';
  const joinedOn   = course.courseOverview?.joinedOn || '-';
  const lastActivity = course.courseOverview?.lastActivity || '-';
  const sa = course.studyAnalysis || {};
  const videoLessons = sa.videoLessons || {};
  const shortNotes   = sa.shortNotes || {};

  const renderSubjectGroup = (title, icon, data) => {
    if (!data || (data.civil == null && data.criminal == null && data.total == null)) return null;
    return (
      <div className="card sa-card">
        <div className="card-header">{icon} {title}{data.total != null ? ` - ${data.total}` : ''}</div>
        <div className="card-body">
          {data.civil != null && (
            <>
              <div className="sa-law-label">Civil laws</div>
              <ProgressRow
                label=""
                completed={data.civil.completed || 0}
                pending={data.civil.pending}
                total={data.civil.total}
                color="var(--gold)"
              />
            </>
          )}
          {data.criminal != null && (
            <>
              <div className="sa-law-label">Criminal laws</div>
              <ProgressRow
                label=""
                completed={data.criminal.completed || 0}
                pending={data.criminal.pending}
                total={data.criminal.total}
                color="var(--maroon)"
              />
            </>
          )}
          {data.civil == null && data.criminal == null && (
            <ProgressRow
              label="Overall"
              completed={data.completed || 0}
              pending={data.pending}
              total={data.total}
              color="var(--gold)"
            />
          )}
        </div>
      </div>
    );
  };

  const hasData = videoLessons.civil || videoLessons.criminal || videoLessons.total != null
    || shortNotes.civil || shortNotes.criminal || shortNotes.total != null;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate('/dashboard/marks')}>← Back to Marks Dashboard</button>

          <div className="page-section-head">
            <h1 className="page-section-title">🎥 Study Analysis</h1>
          </div>

          {loading ? <Loader /> : !stats ? (
            <div className="empty-state"><h3>No data available</h3></div>
          ) : (
            <div className="sa-wrap">

              {/* Course summary header */}
              <div className="card sa-summary">
                <div className="card-body sa-summary-body">
                  <div className="sa-summary-icon">📖</div>
                  <div>
                    <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gray-500)', marginBottom: '.2rem' }}>
                      Course
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '.35rem' }}>
                      {courseName}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--gray-500)' }}>
                      Joined on: {joinedOn} &nbsp;•&nbsp; Last Activity: {lastActivity}
                    </div>
                  </div>
                </div>
              </div>

              {hasData ? (
                <div className="sa-grid">
                  {renderSubjectGroup('Total Video Lessons', '🎥', videoLessons)}
                  {renderSubjectGroup('Total Short Notes', '📝', shortNotes)}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🎥</div>
                  <h3>No study activity yet</h3>
                  <p>Watch a lecture or open lecture notes to start tracking your progress here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sa-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 880px;
          margin: 0 auto;
        }
        .sa-summary-body {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .sa-summary-icon {
          font-size: 2.25rem;
          flex-shrink: 0;
        }
        .sa-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .sa-law-label {
          font-size: .8rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: .25rem;
        }
        @media (max-width: 768px) {
          .sa-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}