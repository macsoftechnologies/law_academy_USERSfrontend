import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

export default function MainsTestAttempt() {
  const { mainsId, testId, subjectTestId } = useParams();
  const navigate   = useNavigate();
  const { state }  = useLocation();
  const subject    = state?.subject || null;
  const isEnrolled = state?.isEnrolled || false;

  const parseDuration = (dur='') => {
    const h = dur.match(/(\d+)\s*[Hh]our/)?.[1] || 3;
    const m = dur.match(/(\d+)\s*[Mm]in/)?.[1]  || 0;
    return (parseInt(h)*3600)+(parseInt(m)*60);
  };

  const TOTAL_SECS = parseDuration(subject?.duration);
  const [secs,      setSecs]      = useState(TOTAL_SECS);
  const [file,      setFile]      = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting,setSubmitting]= useState(false);
  const timerRef = useRef(null);
  const now      = new Date();

  useEffect(() => {
    timerRef.current = setInterval(()=>{
      setSecs(s=>{ if(s<=1){ clearInterval(timerRef.current); return 0; } return s-1; });
    }, 1000);
    return ()=>clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const h  = String(Math.floor(s/3600)).padStart(2,'0');
    const m  = String(Math.floor((s%3600)/60)).padStart(2,'0');
    const sc = String(s%60).padStart(2,'0');
    return `${h}:${m}:${sc}`;
  };

  const isExpiring = secs<=900;

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    await new Promise(r=>setTimeout(r,800));
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <div style={{ maxWidth:520, margin:'3rem auto', textAlign:'center' }}>
            <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎉</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:'var(--navy)', marginBottom:'.5rem' }}>Submitted Successfully!</h2>
            <p style={{ color:'var(--gray-500)', marginBottom:'1.5rem', lineHeight:1.8 }}>Your responses have been submitted. Answers are evaluated within 48hrs.</p>
            <div style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.25rem', marginBottom:'1.5rem', textAlign:'left' }}>
              {[['Exam', subject?.title],['Date', now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})],['Time', now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'.5rem 0', borderBottom:'1px solid var(--gray-100)' }}>
                  <span style={{ color:'var(--gray-500)', fontSize:'.85rem' }}>{l}</span>
                  <strong style={{ color:'var(--navy)', fontSize:'.9rem' }}>{v}</strong>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={()=>navigate(`/mains/${mainsId}/test-series`,{state:{isEnrolled:true}})}>Go to Test Series</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">

          {/* Breadcrumb */}
          <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
            <span className="badge badge-navy">{state?.testTitle||'Mains Test'}</span>
            <span style={{ color:'var(--gray-400)' }}>›</span>
            <span className="badge badge-gold">{subject?.title}</span>
          </div>

          {/* Timer */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'1rem' }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--navy)' }}>{subject?.title||'Test Attempt'}</h1>
            <div style={{ background:isExpiring?'var(--error-bg)':'var(--navy)', color:isExpiring?'var(--error)':'var(--cream)', padding:'.55rem 1.1rem', borderRadius:'var(--radius-lg)', fontWeight:800, fontSize:'1rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
              🕐 {formatTime(secs)}
            </div>
          </div>

          {isExpiring && secs>0 && (
            <div className="toast warning" style={{ marginBottom:'1rem' }}>⚠️ Less than 15 minutes remaining. Submit your answers soon!</div>
          )}
          {secs===0 && (
            <div className="toast error" style={{ marginBottom:'1rem' }}>⏰ Time's up! Please submit your answers immediately.</div>
          )}

          {/* Question paper */}
          <div className="card" style={{ marginBottom:'1.25rem' }}>
            <div className="card-header" style={{ display:'flex', justifyContent:'space-between' }}>
              <span>Question Paper</span>
              {subject?.max_marks && <span className="badge badge-gold">Max Marks: {subject.max_marks}</span>}
            </div>
            <div style={{ height:500 }}>
              {subject?.question_paper_file ? (
                <iframe src={subject.question_paper_file} title="Question Paper" style={{ width:'100%', height:'100%', border:'none' }} />
              ) : (
                <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'.75rem', color:'var(--gray-400)' }}>
                  <span style={{ fontSize:'3rem' }}>📄</span>
                  <p>Question paper will be displayed here</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload */}
          <div className="card" style={{ marginBottom:'1.25rem' }}>
            <div className="card-header">Upload Answer Script</div>
            <div className="card-body">
              <label style={{ display:'flex', alignItems:'center', gap:'.85rem', padding:'1.25rem', border:'2px dashed var(--gray-300)', borderRadius:'var(--radius-lg)', cursor:'pointer', transition:'border-color .18s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--navy)'}
                onMouseOut={e=>e.currentTarget.style.borderColor='var(--gray-300)'}>
                <span style={{ fontSize:'2rem' }}>{file ? '✅' : '⬆️'}</span>
                <div>
                  <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'.9rem' }}>{file ? file.name : 'Click to upload your answer script'}</div>
                  <div style={{ fontSize:'.78rem', color:'var(--gray-400)', marginTop:'.2rem' }}>PDF, JPG, or PNG accepted</div>
                </div>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:'none' }} onChange={e=>setFile(e.target.files?.[0]||null)} />
              </label>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <button className="btn btn-primary" style={{ minWidth:160, padding:'.8rem 2rem', fontSize:'1rem' }}
              disabled={!file||submitting||secs===0} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : '✓ Submit Answers'}
            </button>
            <p style={{ fontSize:'.8rem', color:'var(--gray-400)' }}>Ensure all answers are uploaded before submitting</p>
          </div>

        </div>
      </div>
    </div>
  );
}
