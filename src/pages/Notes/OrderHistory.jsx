import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getNoteOrders } from '../../api/notes/notesApi';
import '../../styles/design-system.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: Ensure your getNoteOrders function sends the userId from localStorage
    getNoteOrders()
      .then(r => {
        if (r?.statusCode === 200) {
          setOrders(Array.isArray(r.data) ? r.data : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'var(--success)';
      case 'pending': return 'var(--warning)'; // or #f39c12
      case 'cancelled': return 'var(--error)';
      default: return 'var(--gray-500)';
    }
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">📦 My Printed Note Orders</h1>
          </div>

          {loading ? <Loader /> : orders.length === 0 ? (
            <div className="empty-state">
              <h3>No orders found</h3>
              <p>You haven't ordered any printed notes yet.</p>
              <button className="btn btn-gold" onClick={() => navigate('/printed-notes')}>
                Browse Printed Notes
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => {
                // Handling the Array structure from your API
                const note = order.notes_id?.[0] || {}; 
                const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                });

                return (
                  <div key={order._id} className="card">
                    <div className="card-body" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '.75rem' }}>
                        <div>
                          <div style={{ fontSize: '.7rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Order ID</div>
                          <div style={{ fontSize: '.85rem', fontWeight: 700 }}>#{order.order_id?.split('-')[0]}...</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '.7rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Status</div>
                          <div style={{ fontSize: '.85rem', fontWeight: 700, color: getStatusColor(order.status) }}>
                            ● {order.status?.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <img 
                          src={`${BASE_URL}/${note.presentation_image}`} 
                          alt={note.title} 
                          style={{ width: 60, height: 75, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          onError={(e) => e.target.src = 'https://via.placeholder.com/60x75?text=Note'}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '.95rem', color: 'var(--navy)' }}>{note.title}</h4>
                          <p style={{ fontSize: '.8rem', color: 'var(--gray-500)', margin: '.2rem 0' }}>{note.sub_title}</p>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                            <span style={{ fontSize: '.75rem' }}>📅 Ordered: <strong>{date}</strong></span>
                            <span style={{ fontSize: '.75rem' }}>💳 Method: <strong>{order.payment_method?.toUpperCase()}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}