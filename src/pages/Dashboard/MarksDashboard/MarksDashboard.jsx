import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import Loader from '../../../components/common/Loader';
import { getMarksDashboardStats, updateMarksGoal } from '../../../api/marksDashboard';
import useToast from '../../../hooks/useToast';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

export default function MarksDashboard() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingGoal, setUpdatingGoal] = useState(false);

  const [studyGoalInput, setStudyGoalInput] = useState('');
  const [mcqGoalInput, setMcqGoalInput] = useState('');

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const userId = localStorage.getItem('userId') || user?._id || user?.id;

  const fetchStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getMarksDashboardStats(userId);
      if (res?.data) {
        setStats(res.data);
        if (res.data.goalTracker) {
          setStudyGoalInput(res.data.goalTracker.studyTimeGoalMinutes || '');
          setMcqGoalInput(res.data.goalTracker.mcqGoalCount || '');
        }
      }
    } catch (err) {
      console.error("Failed to fetch marks dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const handleUpdateGoal = async () => {
    if (!userId) return;
    try {
      setUpdatingGoal(true);
      await updateMarksGoal(userId, 0, 0, Number(studyGoalInput), Number(mcqGoalInput));
      showToast('success', 'Goal updated successfully!');
      fetchStats();
    } catch (err) {
      showToast('error', 'Failed to update goal: ' + (err.message || ''));
    } finally {
      setUpdatingGoal(false);
    }
  };

  const renderProgressBar = (label, current, max) => {
    const safeMax = max > 0 ? max : 1;
    const percent = Math.min(100, Math.round((current / safeMax) * 100));
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--navy)', fontWeight: 600, marginBottom: '.3rem' }}>
          <span>{label}</span>
          <span>{current} / {max} ({percent}%)</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${percent}%`, height: '100%', background: 'var(--gold)' }} />
        </div>
      </div>
    );
  };

  const renderProgressObj = (obj, title) => {
    if (!obj) return null;
    return (
      <div style={{ padding: '.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--navy)', marginBottom: '.5rem' }}>{title}</div>
        {obj.total !== undefined ? renderProgressBar('Total', obj.completed || 0, obj.total) : renderProgressBar('Progress', obj.completed || 0, (obj.completed || 0) + (obj.pending || 0))}
        {obj.civil !== undefined && obj.civil.total !== undefined && renderProgressBar('Civil', obj.civil.completed || 0, obj.civil.total)}
        {obj.criminal !== undefined && obj.criminal.total !== undefined && renderProgressBar('Criminal', obj.criminal.completed || 0, obj.criminal.total)}
      </div>
    );
  };

  return (
    <div className="dash-shell">
      <ToastContainer />
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          
          <div className="page-section-head">
            <h1 className="page-section-title">📊 Marks & Analytics Dashboard</h1>
          </div>

          {loading ? <Loader /> : !stats ? (
            <div className="empty-state"><h3>No data available</h3></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Header Stats & Goals */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                
                {/* Overall Score */}
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>🏆</div>
                    <div style={{ fontSize: '.9rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Overall Score</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--navy)', fontWeight: 800 }}>{stats.overallScore}</div>
                  </div>
                </div>

                {/* Goal Tracker */}
                <div className="card">
                  <div className="card-header">🎯 Goal Tracker</div>
                  <div className="card-body">
                    {stats.goalTracker ? (
                      <>
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--navy)', color: 'var(--cream)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '.75rem', opacity: 0.8, marginBottom: '.2rem' }}>Current Goal</div>
                          <div style={{ fontWeight: 600, fontSize: '1rem' }}>{stats.goalTracker.goal}</div>
                          <div style={{ fontSize: '.85rem', color: 'var(--gold-light)', marginTop: '.4rem' }}>{stats.goalTracker.progress}</div>
                        </div>

                        {renderProgressBar('Study Time (Mins)', stats.goalTracker.studyTimeProgressMinutes, stats.goalTracker.studyTimeGoalMinutes)}
                        {renderProgressBar('MCQs Completed', stats.goalTracker.mcqProgressCount, stats.goalTracker.mcqGoalCount)}

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1rem' }}>
                          <div style={{ fontSize: '.8rem', fontWeight: 600, marginBottom: '.5rem', color: 'var(--navy)' }}>Update Goals</div>
                          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                            <input type="number" className="field input" placeholder="Study Mins" value={studyGoalInput} onChange={e => setStudyGoalInput(e.target.value)} style={{ padding: '.4rem .6rem', width: '100px' }} />
                            <input type="number" className="field input" placeholder="MCQs" value={mcqGoalInput} onChange={e => setMcqGoalInput(e.target.value)} style={{ padding: '.4rem .6rem', width: '100px' }} />
                            <button className="btn btn-gold btn-sm" onClick={handleUpdateGoal} disabled={updatingGoal}>{updatingGoal ? '...' : 'Update'}</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: 'var(--gray-500)', fontSize: '.85rem' }}>No goals set.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Progress */}
              <h2 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginTop: '1rem', marginBottom: '.5rem' }}>Course Progress</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                {stats.courses?.map((c, i) => (
                  <div key={i} className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.1rem', color: 'var(--navy)', fontWeight: 700 }}>{c.courseOverview?.courseName || 'Course'}</span>
                        <span style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>Joined: {c.courseOverview?.joinedOn || '-'} | Last Activity: {c.courseOverview?.lastActivity || '-'}</span>
                      </div>
                      <span className="badge badge-navy">Subjects: {c.courseOverview?.subjectsCompleted || '0/0'}</span>
                    </div>

                    <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      
                      {/* Overall Subject Progress */}
                      <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', marginBottom: '1rem' }}>Overall Progress</div>
                        {renderProgressBar('JCJ Full Course', c.subjectProgress?.jcjCourseProgress || 0, 100)}
                        {renderProgressBar('Prelims Prep', c.subjectProgress?.prelimsProgress || 0, 100)}
                        {renderProgressBar('Mains Prep', c.subjectProgress?.mainsProgress || 0, 100)}
                      </div>

                      {/* Study Analysis */}
                      <div style={{ padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', marginBottom: '1rem' }}>Study Analysis</div>
                        <div style={{ flex: 1 }}>
                          {renderProgressObj(c.studyAnalysis?.videoLessons, "🎥 Video Lessons")}
                          {renderProgressObj(c.studyAnalysis?.shortNotes, "📝 Short Notes")}
                        </div>
                        <button className="btn btn-navy btn-sm" style={{ marginTop: '1rem', width: '100%' }} onClick={() => navigate(`/dashboard/marks/study-analysis/${i}`)}>Explore Study Analysis</button>
                      </div>

                      {/* Prelims & Mains Prep */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', marginBottom: '1rem' }}>Prelims Prep</div>
                          <div style={{ flex: 1 }}>
                            {renderProgressObj(c.prelimsPrep?.pyqs, "Previous Year Questions")}
                            {renderProgressObj(c.prelimsPrep?.grandTest, "Grand Tests")}
                            {renderProgressObj(c.prelimsPrep?.subjectMocks, "Subject Mocks")}
                          </div>
                          <button className="btn btn-navy btn-sm" style={{ marginTop: '1rem', width: '100%' }} onClick={() => navigate(`/dashboard/marks/prelims-prep/${i}`)}>Explore Prelims Prep</button>
                        </div>

                        <div style={{ padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', marginBottom: '1rem' }}>Mains Prep</div>
                          <div style={{ flex: 1 }}>
                            {renderProgressObj(c.mainsPrep?.mainsQA?.pdf, "Mains Q&A (PDF)")}
                            {renderProgressObj(c.mainsPrep?.mainsQA?.video, "Mains Q&A (Video)")}
                            {renderProgressObj(c.mainsPrep?.mainsTestSeries, "Test Series")}
                          </div>
                          <button className="btn btn-navy btn-sm" style={{ marginTop: '1rem', width: '100%' }} onClick={() => navigate(`/dashboard/marks/mains-prep/${i}`)}>Explore Mains Prep</button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
