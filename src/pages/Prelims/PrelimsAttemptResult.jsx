import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getPrelimsResult } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

export default function PrelimsAttemptResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    getPrelimsResult({ attemptId })
      .then(r => { if (r?.data) setResult(Array.isArray(r.data) ? r.data[0] : r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [attemptId]);

  const getRank = (pct) => {
    if (pct >= 90) return { label:'Excellent',         color:'#16a34a', bg:'#dcfce7', icon:'🏆' };
    if (pct >= 75) return { label:'Good',              color:'#2563eb', bg:'#dbeafe', icon:'🎯' };
    if (pct >= 60) return { label:'Average',           color:'#d97706', bg:'#fef3c7', icon:'📈' };
    return                { label:'Needs Improvement', color:'#dc2626', bg:'#fee2e2', icon:'📚' };
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {loading ? <Loader /> : !result ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>Result not found</h3>
              <p style={{ color:'var(--gray-500)', fontSize:'.875rem' }}>This attempt may not exist or has been removed.</p>
            </div>
          ) : (() => {
            const total   = result.total_questions ?? 0;
            const correct = result.correct_answers ?? 0;
            const wrong   = result.wrong_answers   ?? 0;
            const skipped = result.skipped         ?? (total - correct - wrong);
            const pct     = result.percentage ?? (total > 0 ? Math.round((correct / total) * 100) : 0);
            const rank    = getRank(pct);

            return (
              <div className="result-shell">
                <div className="result-hero">
                  <div className="result-rank-badge" style={{ background: rank.bg, color: rank.color }}>
                    <span>{rank.icon}</span> {rank.label}
                  </div>
                  <h1 className="result-title">Attempt Result</h1>

                  {result.test_title && (
                    <p className="result-subtitle">{result.test_title}</p>
                  )}

                  {result.createdAt && (
                    <div className="result-date">
                      {new Date(result.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}
                      &nbsp;·&nbsp;
                      {new Date(result.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  )}

                  {/* Score Circle */}
                  <div className="result-score-wrap">
                    <div className="result-score-circle" style={{ '--pct': pct, '--color': rank.color }}>
                      <div className="result-score-inner">
                        <span className="result-score-num">{correct}</span>
                        <span className="result-score-total">/{total}</span>
                        <span className="result-score-pct">{pct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="result-stats-row">
                    <div className="result-stat correct">
                      <span className="rs-icon">✅</span>
                      <span className="rs-val">{correct}</span>
                      <span className="rs-label">Correct</span>
                    </div>
                    <div className="result-stat wrong">
                      <span className="rs-icon">❌</span>
                      <span className="rs-val">{wrong}</span>
                      <span className="rs-label">Wrong</span>
                    </div>
                    <div className="result-stat skipped">
                      <span className="rs-icon">⏭</span>
                      <span className="rs-val">{skipped}</span>
                      <span className="rs-label">Skipped</span>
                    </div>
                    <div className="result-stat" style={{ borderLeft:'1px solid var(--gray-200)', paddingLeft:'1rem' }}>
                      <span className="rs-icon">📊</span>
                      <span className="rs-val" style={{ color:'var(--navy)' }}>{pct}%</span>
                      <span className="rs-label">Score</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                {result.status && (
                  <div style={{ textAlign:'center', marginTop:'1rem' }}>
                    <span style={{
                      display:'inline-block', padding:'.4rem 1.2rem',
                      borderRadius:'var(--radius-full)', fontWeight:700, fontSize:'.85rem',
                      background: result.status === 'submitted' ? '#dcfce7' : 'var(--gray-100)',
                      color:      result.status === 'submitted' ? '#16a34a' : 'var(--gray-600)',
                    }}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
