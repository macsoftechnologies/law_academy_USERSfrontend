import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import Loader from '../../../components/common/Loader';
import { getMarksDashboardStats } from '../../../api/marksDashboard';
import ProgressRow from './ProgressRow';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

export default function PrelimsPrepDetail() {
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
      .catch(err => console.error('Failed to fetch prelims prep:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const course = stats?.courses?.[courseIndex] || {};
  const pp = course.prelimsPrep || {};
  const pyqs         = pp.pyqs;
  const grandTest    = pp.grandTest;
  const subjectMocks = pp.subjectMocks || {};

  const hasData = pyqs || grandTest || subjectMocks.civil || subjectMocks.criminal || subjectMocks.total != null;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate('/dashboard/marks')}>← Back to Marks Dashboard</button>

          <div className="page-section-head">
            <h1 className="page-section-title">📘 Prelims Prep</h1>
          </div>

          {loading ? <Loader /> : !stats ? (
            <div className="empty-state"><h3>No data available</h3></div>
          ) : !hasData ? (
            <div className="empty-state">
              <div className="empty-state-icon">📘</div>
              <h3>No prelims activity yet</h3>
              <p>Attempt a PYQ, grand test, or subject mock to start tracking your progress here.</p>
            </div>
          ) : (
            <div className="pp-wrap">

              {/* PYQs */}
              {pyqs && (
                <div className="card pp-card">
                  <div className="card-header">📑 PYQS</div>
                  <div className="card-body">
                    <div className="pp-subtitle">PYQs Modules</div>
                    <ProgressRow
                      label=""
                      completed={pyqs.completed || 0}
                      pending={pyqs.pending}
                      total={pyqs.total}
                      color="var(--navy)"
                    />
                  </div>
                </div>
              )}

              {/* Grand Test */}
              {grandTest && (
                <div className="card pp-card">
                  <div className="card-header">🏁 Grand Test</div>
                  <div className="card-body">
                    <div className="pp-subtitle">Grand Test Modules</div>
                    <ProgressRow
                      label=""
                      completed={grandTest.completed || 0}
                      pending={grandTest.pending}
                      total={grandTest.total}
                      color="var(--maroon)"
                    />
                  </div>
                </div>
              )}

              {/* Subject Wise Mocks */}
              {(subjectMocks.civil || subjectMocks.criminal || subjectMocks.total != null) && (
                <div className="card pp-card">
                  <div className="card-header">🧩 Subject Wise Mocks{subjectMocks.total != null ? ` - Total Mock Tests ${subjectMocks.total}` : ''}</div>
                  <div className="card-body">
                    {subjectMocks.civil && (
                      <>
                        <div className="pp-subtitle">Civil Laws</div>
                        <ProgressRow
                          label=""
                          completed={subjectMocks.civil.completed || 0}
                          pending={subjectMocks.civil.pending}
                          total={subjectMocks.civil.total}
                          color="var(--gold)"
                        />
                      </>
                    )}
                    {subjectMocks.criminal && (
                      <>
                        <div className="pp-subtitle">Criminal Laws</div>
                        <ProgressRow
                          label=""
                          completed={subjectMocks.criminal.completed || 0}
                          pending={subjectMocks.criminal.pending}
                          total={subjectMocks.criminal.total}
                          color="var(--maroon)"
                        />
                      </>
                    )}
                    {!subjectMocks.civil && !subjectMocks.criminal && (
                      <ProgressRow
                        label="Overall"
                        completed={subjectMocks.completed || 0}
                        pending={subjectMocks.pending}
                        total={subjectMocks.total}
                        color="var(--gold)"
                      />
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <style>{`
        .pp-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 640px;
          margin: 0 auto;
        }
        .pp-subtitle {
          font-size: .8rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: .25rem;
        }
      `}</style>
    </div>
  );
}