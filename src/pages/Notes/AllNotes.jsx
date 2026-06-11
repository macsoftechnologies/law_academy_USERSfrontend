import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import CartWishlistActions from '../../components/common/CartWishlistActions';
import { getNotes } from '../../api/notes/notesApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

export default function AllNotes() {
  const navigate = useNavigate();
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Civil Laws');

  useEffect(() => {
    setLoading(true);
    getNotes(1, 100)
      .then(r => {
        if (r.statusCode === 200) {
          setAllNotes(r.data ?? []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Civil Laws', 'Criminal Laws'];

  const filteredNotes = allNotes.filter(note => {
    let rawTitle = note?.about_book?.sections?.[0]?.title?.trim()?.toLowerCase() || "";
    let mappedCategory = 'Civil Laws'; // Default fallback just in case
    
    if (rawTitle.includes('criminal')) mappedCategory = 'Criminal Laws';
    else if (rawTitle.includes('civil')) mappedCategory = 'Civil Laws';

    return mappedCategory === activeCategory;
  });

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          
          <div className="page-section-head" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem' 
          }}>
            <h1 className="page-section-title" style={{ margin: 0 }}>
              📚 Digital Notes
              {!loading && <span className="page-section-count">{allNotes.length}</span>}
            </h1>

            <button 
              className="btn btn-gold" 
              onClick={() => navigate('/notes/printed')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>🖨️</span>
              <span>Printed Notes</span>
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : allNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No digital notes available</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '.875rem' }}>
                Your enrolled notes will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'Civil Laws' ? '📜 ' : cat === 'Criminal Laws' ? '🚨 ' : ''}{cat}
                  </button>
                ))}
              </div>

              {filteredNotes.length === 0 ? (
                <div className="empty-state" style={{ marginTop: '2rem' }}>
                  <div className="empty-state-icon">🔍</div>
                  <h3>No notes found for this category</h3>
                </div>
              ) : (
                <div className="course-grid">
                  {filteredNotes.map(note => {
                    const lowestPlan = note.availablePlans?.length
                    ? note.availablePlans.reduce((m, p) => p.original_price < m.original_price ? p : m, note.availablePlans[0])
                    : null;

                  return (
                    <div key={note.notes_id} className="course-card">
                      <div className="course-card-img">
                        {note.presentation_image
                          ? <img src={`${BASE_URL}/${note.presentation_image}`} alt={note.title} />
                          : <div className="course-card-img-placeholder">📄</div>}
                        
                        <div className="course-card-enrolled-badge">
                          {note.isEnrolled && <span className="badge badge-success">✓ Enrolled</span>}
                          {note.isPrintAvail && (
                            <span className="badge badge-navy" style={{ marginLeft: 4 }}>
                              🖨 Print Avail.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="course-card-body">
                        <h3 className="course-card-title">{note.title}</h3>
                        {note.sub_title && <p className="course-card-sub">{note.sub_title}</p>}
                        
                        <div className="course-card-plan-area">
                          {note.isEnrolled
                            ? <div className="course-card-enrolled-info" style={{ fontSize: '.75rem' }}>
                                ✓ Expires: {note.expiry_date ? new Date(note.expiry_date).toLocaleDateString('en-IN') : '—'}
                              </div>
                            : lowestPlan && (
                                <span className="plan-chip">
                                  {lowestPlan.strike_price && <del>₹{lowestPlan.strike_price}</del>}
                                  ₹{lowestPlan.original_price} <em>{lowestPlan.duration}</em>
                                </span>
                              )}
                        </div>

                        <div className="course-card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {!note.isEnrolled && note.availablePlans?.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                              <CartWishlistActions 
                                courseId={note.notes_id} 
                                enrollType="notes" 
                                planId={lowestPlan?.planId} 
                                isEnrolled={note.isEnrolled} 
                              />
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            {!note.isEnrolled && note.availablePlans?.length > 0 && (
                              <button 
                                className="btn btn-gold btn-sm" style={{ flex: 1 }}
                                onClick={() => navigate(`/notes/${note.notes_id}`, { state: { note, scrollToBuy: true } })}
                              >
                                Buy Now
                              </button>
                            )}
                            <button 
                              className="btn btn-outline btn-sm" style={{ flex: 1 }}
                              onClick={() => navigate(`/notes/${note.notes_id}`, { state: { note } })}
                            >
                              {note.isEnrolled ? 'Continue →' : 'Explore →'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}