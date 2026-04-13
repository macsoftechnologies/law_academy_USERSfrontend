import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { getNotes } from '../../api/notes/notesApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

export default function AllNotes() {
  const navigate = useNavigate();
  const [allNotes, setAllNotes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [activeTab,setActiveTab]= useState('notes');

  useEffect(() => {
    setLoading(true);
    getNotes(page, PAGE_SIZE)
      .then(r=>{ if(r.statusCode===200){ setAllNotes(r.data??[]); setTotal(r.totalCount??r.total??r.data?.length??0); } })
      .catch(console.error).finally(()=>setLoading(false));
  }, [page]);

  const regular = allNotes.filter(n=>!n.isPrintAvail);
  const printed = allNotes.filter(n=> n.isPrintAvail);
  const visible = activeTab==='notes' ? regular : printed;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          <div className="page-section-head">
            <h1 className="page-section-title">Notes</h1>
          </div>

          <div className="tabs">
            <button className={`tab-btn ${activeTab==='notes'?'active':''}`} onClick={()=>setActiveTab('notes')}>
              📚 Notes {!loading && <span className="tab-badge">{regular.length}</span>}
            </button>
            <button className={`tab-btn ${activeTab==='printed'?'active':''}`} onClick={()=>setActiveTab('printed')}>
              🖨 Printed {!loading && <span className="tab-badge">{printed.length}</span>}
            </button>
          </div>

          {loading ? <Loader /> : visible.length===0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>{activeTab==='notes'?'No notes available':'No printed notes available'}</h3>
            </div>
          ) : (
            <>
              <div className="course-grid">
                {visible.map(note => {
                  const lowestPlan = note.availablePlans?.length
                    ? note.availablePlans.reduce((m,p)=>p.original_price<m.original_price?p:m, note.availablePlans[0])
                    : null;
                  return (
                    <div key={note.notes_id} className="course-card">
                      <div className="course-card-img">
                        {note.presentation_image
                          ? <img src={`${BASE_URL}/${note.presentation_image}`} alt={note.title} />
                          : <div className="course-card-img-placeholder">📄</div>}
                        <span className="course-card-enrolled-badge">
                          {note.isEnrolled && <span className="badge badge-success">✓ Enrolled</span>}
                          {note.isPrintAvail && <span className="badge badge-navy" style={{ marginLeft:4 }}>🖨 Print</span>}
                        </span>
                      </div>
                      <div className="course-card-body">
                        <h3 className="course-card-title">{note.title}</h3>
                        {note.sub_title && <p className="course-card-sub">{note.sub_title}</p>}
                        <div className="course-card-plan-area">
                          {note.isEnrolled
                            ? <div className="course-card-enrolled-info">✓ Expires: {note.expiry_date ? new Date(note.expiry_date).toLocaleDateString('en-IN') : '—'}</div>
                            : lowestPlan && (
                                <span className="plan-chip">
                                  {lowestPlan.strike_price && <del>₹{lowestPlan.strike_price}</del>}
                                  ₹{lowestPlan.original_price} <em>{lowestPlan.duration}</em>
                                  {lowestPlan.discount_percent && <span className="plan-discount">{lowestPlan.discount_percent}% off</span>}
                                </span>
                              )}
                        </div>
                        <div className="course-card-actions">
                          {!note.isEnrolled && note.availablePlans?.length>0 && (
                            <button className="btn btn-gold btn-sm"
                              onClick={()=>navigate(`/notes/${note.notes_id}`,{state:{note,scrollToBuy:true}})}>
                              Buy Now
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm"
                            onClick={()=>navigate(`/notes/${note.notes_id}`,{state:{note}})}>
                            {note.isEnrolled ? 'Continue →' : 'Explore →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination page={page} totalPages={Math.ceil(total/PAGE_SIZE)} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
