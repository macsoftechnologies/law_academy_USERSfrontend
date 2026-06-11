import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCombos } from '../../api/combo/comboApi';
import CartWishlistActions from '../../components/common/CartWishlistActions';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const COMBO_EMOJIS = ['🏆', '📚', '⚖️', '🎓', '📜', '🔏'];

export default function ComboSection() {
  const navigate = useNavigate();
  const [combos,  setCombos]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCombos(1, 10)
      .then(r => {
        if (r?.statusCode === 200) {
          setCombos(Array.isArray(r.data) ? r.data : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-section">
      <div className="page-section-head">
        <h2 className="page-section-title">Combo Courses</h2>
      </div>
      <div style={{ color: 'var(--gray-400)', fontSize: '.875rem', padding: '1rem 0' }}>Loading…</div>
    </div>
  );

  if (!combos.length) return null;

  return (
    <div className="page-section">
      <div className="page-section-head">
        <h2 className="page-section-title">Combo Courses</h2>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/combos')}
          style={{ marginLeft: 'auto' }}
        >
          View All →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.1rem' }}>
        {/* FIX: Using .slice(0, 4) ensures only the first 4 items are displayed in this dashboard section */}
        {combos.slice(0, 4).map((item, i) => {
          const comboId    = item.combo_id || item.id || item._id;
          const title      = item.title || item.name || `Combo ${i + 1}`;
          const subtitle   = item.description || item.sub_title || '';
          const emoji      = COMBO_EMOJIS[i % COMBO_EMOJIS.length];
          const imgSrc     = item.presentation_image
            ? `${BASE_URL}/${item.presentation_image}`
            : null;
          const isEnrolled = item.isEnrolled ?? false;

          const lowestPlan = item.availablePlans?.length
            ? item.availablePlans.reduce(
                (m, p) => (p.original_price < m.original_price ? p : m),
                item.availablePlans[0]
              )
            : null;
          const price    = lowestPlan?.original_price ?? item.price ?? null;
          const strike   = lowestPlan?.strike_price   ?? item.strike_price ?? null;
          const discount = lowestPlan?.discount_percent ?? item.discount_percent ?? null;

          return (
            <div
              key={comboId || i}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/combos/${comboId}`, { state: { combo: item } })}
            >
              {/* Thumbnail */}
              <div style={{
                height: 160,
                overflow: 'hidden',
                background: 'var(--gray-100)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                position: 'relative',
              }}>
                {imgSrc
                  ? <img src={imgSrc} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : emoji}
                {isEnrolled && (
                  <span className="badge badge-success" style={{ position: 'absolute', top: 8, right: 8 }}>
                    ✓ Enrolled
                  </span>
                )}
              </div>

              <div className="card-body">
                <h3 style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '.2rem' }}>
                  {title}
                </h3>
                {subtitle && (
                  <p style={{
                    fontSize: '.78rem', color: 'var(--gray-500)',
                    marginBottom: '.4rem',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {subtitle}
                  </p>
                )}

                {/* Enrolled info */}
                {isEnrolled ? (
                  <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginBottom: '.5rem' }}>
                    ✓ Expires:{' '}
                    {item.expiry_date
                      ? new Date(item.expiry_date).toLocaleDateString('en-IN')
                      : '—'}
                  </div>
                ) : price != null ? (
                  <div style={{ fontSize: '.82rem', marginBottom: '.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--gold)', marginRight: '.4rem' }}>₹{price}</span>
                    {strike && (
                      <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)', marginRight: '.4rem' }}>₹{strike}</span>
                    )}
                    {discount && <span style={{ color: 'var(--green-500)' }}>{discount}% off</span>}
                  </div>
                ) : null}

                <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {!isEnrolled && price != null && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }} onClick={e => e.stopPropagation()}>
                      <CartWishlistActions 
                        courseId={comboId} 
                        enrollType="combination" 
                        planId={lowestPlan?.planId || lowestPlan?.plan_id} 
                        isEnrolled={isEnrolled} 
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    {!isEnrolled && price != null && (
                      <button
                        className="btn btn-gold btn-sm" style={{ flex: 1 }}
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/combos/${comboId}`, { state: { combo: item, scrollToBuy: true } });
                        }}
                      >
                        Buy Now
                      </button>
                    )}
                    <button
                      className="btn btn-outline btn-sm" style={{ flex: 1 }}
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/combos/${comboId}`, { state: { combo: item } });
                      }}
                    >
                      {isEnrolled ? 'Continue →' : 'Explore →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}