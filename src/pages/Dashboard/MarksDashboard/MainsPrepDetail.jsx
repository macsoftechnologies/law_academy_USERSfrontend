import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import Loader from '../../../components/common/Loader';
import { getMarksDashboardStats } from '../../../api/marksDashboard';
import ProgressRow from './ProgressRow';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

export default function MainsPrepDetail() {
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
      .catch(err => console.error('Failed to fetch mains prep:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const course = stats?.courses?.[courseIndex] || {};
  const mp = course.mainsPrep || {};
  const mainsQA      = mp.mainsQA || {};
  const essayTrans   = mp.essayTranslation || {};
  const testSeries   = mp.mainsTestSeries || {};

  const hasData = mainsQA.pdf || mainsQA.video
    || essayTrans.pdf || essayTrans.video
    || testSeries.civil || testSeries.criminal || testSeries.essayTranslation || testSeries.total != null;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate('/dashboard/marks')}>← Back to Marks Dashboard</button>

          <div className="page-section-head">
            <h1 className="page-section-title">✍️ Mains Prep</h1>
          </div>

          {loading ? <Loader /> : !stats ? (
            <div className="empty-state"><h3>No data available</h3></div>
          ) : !hasData ? (
            <div className="empty-state">
              <div className="empty-state-icon">✍️</div>
              <h3>No mains activity yet</h3>
              <p>Open mains Q&amp;A material or submit a mains test to start tracking your progress here.</p>
            </div>
          ) : (
            <div className="mp-wrap">

              {/* Mains Q&A */}
              {(mainsQA.pdf || mainsQA.video) && (
                <div className="card mp-card">
                  <div className="card-header">💬 Mains Q &amp; A</div>
                  <div className="card-body">
                    {mainsQA.pdf && (
                      <>
                        <div className="mp-subtitle">📄 PDFs</div>
                        <ProgressRow
                          label=""
                          completed={mainsQA.pdf.completed || 0}
                          pending={mainsQA.pdf.pending}
                          total={mainsQA.pdf.total}
                          color="var(--navy)"
                        />
                      </>
                    )}
                    {mainsQA.video && (
                      <>
                        <div className="mp-subtitle">🎬 Videos</div>
                        <ProgressRow
                          label=""
                          completed={mainsQA.video.completed || 0}
                          pending={mainsQA.video.pending}
                          total={mainsQA.video.total}
                          color="var(--navy-light)"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Essay & Translation */}
              {(essayTrans.pdf || essayTrans.video) && (
                <div className="card mp-card">
                  <div className="card-header">📝 Essay &amp; Translation</div>
                  <div className="card-body">
                    {essayTrans.pdf && (
                      <>
                        <div className="mp-subtitle">📄 PDFs</div>
                        <ProgressRow
                          label=""
                          completed={essayTrans.pdf.completed || 0}
                          pending={essayTrans.pdf.pending}
                          total={essayTrans.pdf.total}
                          color="var(--maroon)"
                        />
                      </>
                    )}
                    {essayTrans.video && (
                      <>
                        <div className="mp-subtitle">🎬 Videos</div>
                        <ProgressRow
                          label=""
                          completed={essayTrans.video.completed || 0}
                          pending={essayTrans.video.pending}
                          total={essayTrans.video.total}
                          color="var(--maroon)"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Mains Test Series */}
              {(testSeries.civil || testSeries.criminal || testSeries.essayTranslation || testSeries.total != null) && (
                <div className="card mp-card">
                  <div className="card-header">🧪 Mains Test Series</div>
                  <div className="card-body">
                    <div className="mp-subtitle">Mains Test Series</div>
                    <ProgressRow
                      label=""
                      completed={testSeries.completed || 0}
                      pending={testSeries.pending}
                      total={testSeries.total}
                      color="var(--gold)"
                    />
                    {testSeries.criminal && (
                      <>
                        <div className="mp-subtitle">Criminal Laws</div>
                        <ProgressRow
                          label=""
                          completed={testSeries.criminal.completed || 0}
                          pending={testSeries.criminal.pending}
                          total={testSeries.criminal.total}
                          color="var(--gold)"
                        />
                      </>
                    )}
                    {testSeries.civil && (
                      <>
                        <div className="mp-subtitle">Civil Laws</div>
                        <ProgressRow
                          label=""
                          completed={testSeries.civil.completed || 0}
                          pending={testSeries.civil.pending}
                          total={testSeries.civil.total}
                          color="var(--gold)"
                        />
                      </>
                    )}
                    {testSeries.essayTranslation && (
                      <>
                        <div className="mp-subtitle">Essay &amp; Translation</div>
                        <ProgressRow
                          label=""
                          completed={testSeries.essayTranslation.completed || 0}
                          pending={testSeries.essayTranslation.pending}
                          total={testSeries.essayTranslation.total}
                          color="var(--gold)"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <style>{`
        .mp-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 640px;
          margin: 0 auto;
        }
        .mp-subtitle {
          font-size: .8rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: .25rem;
          margin-top: .5rem;
        }
        .mp-subtitle:first-child { margin-top: 0; }
      `}</style>
    </div>
  );
}