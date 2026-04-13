import { useLocation, useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

export default function MainsResult() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const result    = state?.result;
  const subject   = state?.subject;
  const attemptNo = state?.attempt_no;

  if (!result) return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          <div className="empty-state"><div className="empty-state-icon">📊</div><h3>Result not found</h3></div>
        </div>
      </div>
    </div>
  );

  const pct          = Math.round(result.overall_percentage ?? 0);
  const circumference = 2*Math.PI*54;
  const dashOffset   = circumference - (pct/100)*circumference;
  const scoreColor   = pct>=60 ? 'var(--success)' : pct>=40 ? 'var(--warning)' : 'var(--error)';

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>

          {/* Header card */}
          <div className="card" style={{ marginBottom:'1.25rem' }}>
            <div className="card-body" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem', padding:'1.75rem 2rem' }}>
              <div>
                <span className="badge badge-navy" style={{ marginBottom:'.5rem' }}>Attempt {attemptNo}</span>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.2rem,2vw,1.6rem)', color:'var(--navy)', marginBottom:'.5rem' }}>{subject?.title}</h1>
                <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                  {result.date_of_submission && <span style={{ fontSize:'.82rem', color:'var(--gray-500)' }}>📅 Submitted: {result.date_of_submission}</span>}
                  {result.date_of_evaluation && <span style={{ fontSize:'.82rem', color:'var(--gray-500)' }}>✅ Evaluated: {result.date_of_evaluation}</span>}
                </div>
              </div>

              {/* Score ring */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="54" fill="none" stroke="var(--gray-200)" strokeWidth="10" />
                  <circle cx="64" cy="64" r="54" fill="none" stroke={scoreColor} strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 64 64)" />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'1.5rem', fontWeight:900, color:scoreColor, lineHeight:1 }}>{result.marks_scored}</span>
                  <span style={{ fontSize:'.78rem', color:'var(--gray-400)', fontWeight:600 }}>{pct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {result.feedback && (
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              <div className="card-header">📝 Feedback</div>
              <div className="card-body" style={{ color:'var(--gray-600)', lineHeight:1.8, fontSize:'.9rem' }}>{result.feedback}</div>
            </div>
          )}

          {/* Strengths & Improvements */}
          {(result.strengths?.length>0 || result.to_improve?.length>0) && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1rem' }}>
              {result.strengths?.length>0 && (
                <div className="card">
                  <div className="card-header" style={{ color:'var(--success)' }}>💪 Strengths</div>
                  <div className="card-body">
                    <ul style={{ paddingLeft:'1rem', display:'flex', flexDirection:'column', gap:'.5rem' }}>
                      {result.strengths.map((s,i) => (
                        <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'.5rem', fontSize:'.88rem', color:'var(--gray-700)' }}>
                          <span style={{ color:'var(--success)', fontWeight:700, flexShrink:0 }}>✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {result.to_improve?.length>0 && (
                <div className="card">
                  <div className="card-header" style={{ color:'var(--warning)' }}>🎯 Areas to Improve</div>
                  <div className="card-body">
                    <ul style={{ paddingLeft:'1rem', display:'flex', flexDirection:'column', gap:'.5rem' }}>
                      {result.to_improve.map((s,i) => (
                        <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'.5rem', fontSize:'.88rem', color:'var(--gray-700)' }}>
                          <span style={{ color:'var(--warning)', fontWeight:700, flexShrink:0 }}>→</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
