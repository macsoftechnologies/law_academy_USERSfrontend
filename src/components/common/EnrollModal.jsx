import { useState } from 'react';
import { enrollCourse } from '../../api/enroll/enrollApi_addition';

export default function EnrollModal({ plan, courseTitle, enroll_type = 'subject-wise', onClose }) {
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [apiRequest, setApiRequest] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  if (!plan) return null;
  const total = Number(plan.original_price) + Number(plan.handling_fee || 0);

  const handleEnroll = async () => {
    if (!paymentId.trim()) {
      setError('Please enter a payment / transaction ID.');
      return;
    }

    setError('');
    setLoading(true);

    const payload = { payment_id: paymentId.trim(), enroll_type, planId: plan.planId };
    const userId = localStorage.getItem('userId');
    const requestBody = { userId, ...payload };
    setApiRequest(requestBody); // show request in modal

    try {
      const res = await enrollCourse(payload);
      setApiResponse(res); // show response in modal

      if (res.statusCode === 200) {
        setSuccess(true);
      } else {
        setError(res.message || 'Enrollment failed. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
      setApiResponse(err?.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <div className="section-eyebrow" style={{ marginBottom: '.2rem' }}>Enrollment</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--navy)' }}>{courseTitle}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div className="result-icon">🎉</div>
              <h3>Enrolled Successfully!</h3>
            </div>
          ) : (
            <>
              {/* Plan summary */}
              <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '1.1rem', marginBottom: '1.1rem' }}>
                {[['Plan', plan.duration],
                  ['Course Price', <>
                    {plan.strike_price && <del style={{ opacity: .6, marginRight: '.35rem', fontSize: '.85rem' }}>₹{plan.strike_price}</del>}
                    <strong>₹{plan.original_price}</strong>
                  </>],
                  ...(plan.handling_fee ? [['Handling Fee', `₹${plan.handling_fee}`]] : []),
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.4rem 0', borderBottom: '1px solid rgba(200,146,42,.15)' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--gray-500)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: '.88rem', color: 'var(--navy)', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '.65rem', marginTop: '.15rem' }}>
                  <span style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--navy)' }}>Total</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--gold)' }}>₹{total}</span>
                </div>
              </div>

              {/* Payment ID */}
              <div className="field" style={{ marginBottom: '1rem' }}>
                <label>Payment / Transaction ID</label>
                <input
                  type="text"
                  placeholder="Enter UTR or transaction reference"
                  value={paymentId}
                  onChange={e => { setPaymentId(e.target.value); setError(''); }}
                />
                {error && <span className="field-error">{error}</span>}
              </div>

              <div className="modal-footer" style={{ padding: 0, justifyContent: 'stretch', gap: '.65rem' }}>
                <button className="btn btn-outline btn-full" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                <button className="btn btn-gold btn-full" onClick={handleEnroll} disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Enrolling…' : 'Confirm Enrollment'}
                </button>
              </div>
            </>
          )}

          {/* Debug: show sent request */}
          {apiRequest && (
            <div style={{ marginTop: '1rem', background: '#f3f3f3', padding: '.5rem', borderRadius: '.25rem', fontSize: '.75rem', overflowX: 'auto' }}>
              <strong>Request Sent:</strong>
              <pre>{JSON.stringify(apiRequest, null, 2)}</pre>
            </div>
          )}

          {/* Debug: show API response */}
          {apiResponse && (
            <div style={{ marginTop: '1rem', background: '#e6f7ff', padding: '.5rem', borderRadius: '.25rem', fontSize: '.75rem', overflowX: 'auto' }}>
              <strong>Response Received:</strong>
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}