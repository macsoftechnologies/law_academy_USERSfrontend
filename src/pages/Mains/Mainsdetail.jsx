import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import EnrollModal from '../../components/common/EnrollModal';
import { getMainsDetail, getMainsTests } from '../../api/mains/mainsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MainsDetail() {
  const { mainsId }  = useParams();
  const navigate     = useNavigate();
  const { state }    = useLocation();
  const buyRef       = useRef(null);

  const passedItem  = state?.item || null;
  const scrollToBuy = state?.scrollToBuy || false;

  const [detail,       setDetail]       = useState(null);
  const [tests,        setTests]        = useState([]);
  const [detLoad,      setDetLoad]      = useState(true);
  const [tstLoad,      setTstLoad]      = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEnrolled,   setIsEnrolled]   = useState(passedItem?.isEnrolled||false);

  useEffect(() => {
    getMainsDetail(mainsId).then(r=>{ if(r.statusCode===200) setDetail(Array.isArray(r.data)?r.data[0]:r.data); }).catch(console.error).finally(()=>setDetLoad(false));
    getMainsTests(mainsId,1,50).then(r=>{ if(r.statusCode===200) setTests(r.data??[]); }).catch(console.error).finally(()=>setTstLoad(false));
  }, [mainsId]);

  useEffect(() => { if(scrollToBuy&&!detLoad&&buyRef.current) buyRef.current.scrollIntoView({behavior:'smooth',block:'start'}); }, [scrollToBuy,detLoad]);

  const item  = detail || passedItem;
  const plans = passedItem?.availablePlans || [];

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          {detLoad ? <Loader /> : !item ? (
            <div className="empty-state"><div className="empty-state-icon">⚖️</div><h3>Mains not found</h3></div>
          ) : (
            <>
              {/* Hero */}
              <div className="detail-hero" style={{ marginBottom:'1.5rem' }}>
                <div className="detail-hero-img">
                  {item.presentation_image ? <img src={`${BASE_URL}/${item.presentation_image}`} alt={item.title} /> : <div className="detail-hero-img-placeholder">⚖️</div>}
                </div>
                <div className="detail-hero-body">
                  <div className="detail-hero-tag"><span className="badge badge-navy">Mains</span></div>
                  <h1 className="detail-hero-title">{item.title}</h1>
                  {item.sub_title && <p className="detail-hero-sub">{item.sub_title}</p>}
                  {!isEnrolled && plans.length>0 && (
                    <div className="detail-hero-plans">
                      {plans.map(p=><span key={p.planId} className="plan-chip">{p.strike_price&&<del>₹{p.strike_price}</del>} ₹{p.original_price} <em>{p.duration}</em></span>)}
                    </div>
                  )}
                  <div className="detail-hero-actions">
                    {isEnrolled ? (
                      <button className="btn btn-primary" onClick={()=>navigate(`/mains/${mainsId}/categories`,{state:{item,isEnrolled:true}})}>Explore Course →</button>
                    ) : plans.length>0 ? (
                      <button className="btn btn-gold" onClick={()=>buyRef.current?.scrollIntoView({behavior:'smooth'})}>Buy Now</button>
                    ) : null}
                  </div>
                </div>
              </div>

              {item.about_course && (
                <div className="card" style={{ marginBottom:'1rem' }}>
                  <div className="card-header">About this Course</div>
                  <div className="card-body" style={{ color:'var(--gray-600)', lineHeight:1.8, fontSize:'.9rem' }}>{item.about_course}</div>
                </div>
              )}

              {item.course_points?.length>0 && (
                <div className="card" style={{ marginBottom:'1rem' }}>
                  <div className="card-header">What's Included</div>
                  <div className="card-body">
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'.5rem' }}>
                      {item.course_points.map((pt,i)=>(
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'.5rem', padding:'.5rem .75rem', background:'var(--success-bg)', borderRadius:'var(--radius-md)' }}>
                          <span style={{ color:'var(--success)', fontWeight:700 }}>✓</span>
                          <span style={{ fontSize:'.85rem', color:'var(--gray-700)' }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {item.terms_conditions && (
                <div className="card" style={{ marginBottom:'1rem' }}>
                  <div className="card-header">Terms & Conditions</div>
                  <div className="card-body" style={{ fontSize:'.85rem', color:'var(--gray-500)', lineHeight:1.8 }}>{item.terms_conditions}</div>
                </div>
              )}

              {/* Plans */}
              {!isEnrolled && plans.length>0 && (
                <div ref={buyRef} className="card" style={{ marginBottom:'1rem' }}>
                  <div className="card-header">Choose a Plan</div>
                  <div className="card-body">
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem' }}>
                      {plans.map(plan=>(
                        <div key={plan.planId} style={{ border:'2px solid var(--gray-200)', borderRadius:'var(--radius-lg)', padding:'1.1rem 1.25rem', minWidth:180, transition:'border-color .18s', cursor:'pointer' }}
                          onMouseOver={e=>e.currentTarget.style.borderColor='var(--gold)'}
                          onMouseOut={e=>e.currentTarget.style.borderColor='var(--gray-200)'}>
                          <div style={{ fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--gray-400)', marginBottom:'.35rem' }}>{plan.duration}</div>
                          {plan.strike_price&&<div style={{ fontSize:'.82rem', color:'var(--gray-400)' }}><del>₹{plan.strike_price}</del></div>}
                          <div style={{ fontSize:'1.5rem', fontWeight:900, color:'var(--navy)', margin:'.25rem 0 .6rem' }}>₹{plan.original_price}</div>
                          {plan.discount_percent&&<span className="badge badge-success" style={{ marginBottom:'.75rem', display:'inline-flex' }}>{plan.discount_percent}% OFF</span>}
                          <button className="btn btn-gold btn-sm btn-full" onClick={()=>setSelectedPlan(plan)}>Buy Now</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isEnrolled && (
                <div style={{ background:'var(--success-bg)', borderRadius:'var(--radius-lg)', padding:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'1rem' }}>
                  <span style={{ fontWeight:700, color:'var(--success)' }}>✓ You are enrolled in this course</span>
                  <button className="btn btn-primary btn-sm" onClick={()=>navigate(`/mains/${mainsId}/categories`,{state:{item,isEnrolled:true}})}>Explore Course →</button>
                </div>
              )}

              {/* Tests */}
              <div className="card">
                <div className="card-header">Tests {!tstLoad&&<span className="page-section-count" style={{ marginLeft:'.4rem' }}>{tests.length}</span>}</div>
                {tstLoad ? <div style={{ padding:'1.5rem' }}><Loader /></div>
                : tests.length===0 ? <div className="card-body"><div className="empty-state" style={{ padding:'2rem 0' }}><div className="empty-state-icon">📋</div><h3>No tests available</h3></div></div>
                : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem', padding:'1.25rem' }}>
                    {tests.map(test=>(
                      <div key={test.mains_test_id} className="course-card" style={{ cursor:'pointer' }} onClick={()=>navigate(`/mains/${mainsId}/test/${test.mains_test_id}`,{state:{test,isEnrolled}})}>
                        <div className="course-card-img">
                          {test.presentation_image ? <img src={`${BASE_URL}/${test.presentation_image}`} alt={test.title} /> : <div className="course-card-img-placeholder">📋</div>}
                        </div>
                        <div className="course-card-body">
                          <h3 className="course-card-title">{test.title}</h3>
                          <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'.5rem' }}>
                            {test.no_of_qs && <span className="badge badge-gray">📝 {test.no_of_qs} Qs</span>}
                            {test.no_of_subjects && <span className="badge badge-gray">📚 {test.no_of_subjects} Subjects</span>}
                          </div>
                          <button className="btn btn-outline btn-sm btn-full">{isEnrolled?'View Test →':'Buy to Access'}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {selectedPlan && <EnrollModal plan={selectedPlan} courseTitle={item?.title||'Mains Course'} enroll_type="mains" onClose={()=>setSelectedPlan(null)} onSuccess={()=>{ setSelectedPlan(null); setIsEnrolled(true); }} />}
        </div>
      </div>
    </div>
  );
}
