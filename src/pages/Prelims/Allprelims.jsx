import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { getPrelims } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

export default function AllPrelims() {
  const navigate = useNavigate();
  const [prelims, setPrelims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    getPrelims(page, PAGE_SIZE)
      .then(r=>{ if(r.statusCode===200){ setPrelims(r.data??[]); setTotal(r.totalCount??r.data?.length??0); } })
      .catch(console.error).finally(()=>setLoading(false));
  }, [page]);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>
          <div className="page-section-head">
            <h1 className="page-section-title">Prelims {!loading&&<span className="page-section-count">{total}</span>}</h1>
          </div>

          {loading ? <Loader /> : prelims.length===0 ? (
            <div className="empty-state"><div className="empty-state-icon">📝</div><h3>No prelims available</h3></div>
          ) : (
            <>
              <div className="course-grid">
                {prelims.map(item => {
                  const primaryPlan = item.availablePlans?.length
                    ? item.availablePlans.reduce((m,p)=>p.original_price<m.original_price?p:m, item.availablePlans[0])
                    : null;
                  return (
                    <div key={item.prelimes_id} className="course-card">
                      <div className="course-card-img">
                        {item.presentation_image
                          ? <img src={`${BASE_URL}/${item.presentation_image}`} alt={item.title} />
                          : <div className="course-card-img-placeholder">📝</div>}
                        {item.isEnrolled && <span className="course-card-enrolled-badge"><span className="badge badge-success">✓ Enrolled</span></span>}
                      </div>
                      <div className="course-card-body">
                        <h3 className="course-card-title">{item.title}</h3>
                        {item.sub_title && <p className="course-card-sub">{item.sub_title}</p>}
                        <div className="course-card-plan-area">
                          {item.isEnrolled
                            ? <div className="course-card-enrolled-info">✓ Expires: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-IN') : '—'}</div>
                            : primaryPlan && <span className="plan-chip">{primaryPlan.strike_price&&<del>₹{primaryPlan.strike_price}</del>} ₹{primaryPlan.original_price} <em>{primaryPlan.duration}</em></span>}
                        </div>
                        <div className="course-card-actions">
                          {!item.isEnrolled && primaryPlan && (
                            <button className="btn btn-gold btn-sm" onClick={()=>navigate(`/prelims/${item.prelimes_id}`,{state:{item,scrollToBuy:true}})}>Buy Now</button>
                          )}
                          <button className="btn btn-outline btn-sm"
                            onClick={()=>item.isEnrolled
                              ? navigate(`/prelims/${item.prelimes_id}/categories`,{state:{item,isEnrolled:true}})
                              : navigate(`/prelims/${item.prelimes_id}`,{state:{item}})}>
                            {item.isEnrolled ? 'Continue →' : 'Explore →'}
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
