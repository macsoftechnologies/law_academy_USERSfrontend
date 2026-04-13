import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const TOPICS = ['Technical Issue', 'Payment Problem', 'Course Access', 'Account Issue', 'Other'];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!topic || !message.trim()) return alert('Please select a topic and describe your issue.');
    setSubmitted(true);
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">❓ Help Center</h1>
          </div>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { icon: '❓', label: 'FAQs',              desc: 'Browse common questions',  action: () => navigate('/dashboard/faqs') },
              { icon: '📧', label: 'Email Support',      desc: 'support@makaslaw.in',      action: () => window.open('mailto:support@makaslaw.in') },
              { icon: '📞', label: 'Call Us',             desc: '+91 98765 43210',          action: () => window.open('tel:+919876543210') },
              { icon: '💬', label: 'WhatsApp',            desc: 'Chat with our team',       action: () => window.open('https://wa.me/919876543210') },
            ].map(q => (
              <div key={q.label} className="card" style={{ cursor: 'pointer' }} onClick={q.action}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                  <div style={{ fontSize: '1.8rem' }}>{q.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--navy)' }}>{q.label}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{q.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
            <div className="card">
              <div className="card-header">📬 Raise a Support Ticket</div>
              <div className="card-body">
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>✅</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy)', marginBottom: '.35rem' }}>Ticket Submitted!</div>
                    <div style={{ fontSize: '.875rem', color: 'var(--gray-500)', marginBottom: '1.25rem' }}>Our team will respond within 24 hours on your registered email.</div>
                    <button className="btn btn-outline btn-sm" onClick={() => { setSubmitted(false); setTopic(''); setMessage(''); }}>Submit Another</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div className="field">
                      <label>Topic *</label>
                      <select value={topic} onChange={e => setTopic(e.target.value)} style={{ padding: '.72rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.9rem', fontFamily: 'var(--font-body)', background: 'var(--white)', color: topic ? 'var(--gray-800)' : 'var(--gray-400)' }}>
                        <option value="">Select a topic…</option>
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Describe Your Issue *</label>
                      <textarea
                        rows={6}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Please describe the issue in detail. Include any error messages, steps to reproduce, and what you expected to happen…"
                        style={{ padding: '.72rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.9rem', fontFamily: 'var(--font-body)', resize: 'vertical', background: 'var(--white)', color: 'var(--gray-800)' }}
                      />
                    </div>
                    <button className="btn btn-primary btn-full" onClick={handleSubmit}>Submit Ticket →</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card">
                <div className="card-header">⏱ Support Hours</div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', fontSize: '.875rem' }}>
                  {[
                    { day: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
                    { day: 'Saturday',         time: '10:00 AM – 5:00 PM' },
                    { day: 'Sunday',            time: 'Closed' },
                  ].map(r => (
                    <div key={r.day} style={{ display: 'flex', justifyContent: 'space-between', color: r.time === 'Closed' ? 'var(--error)' : 'var(--gray-700)' }}>
                      <span style={{ color: 'var(--gray-500)' }}>{r.day}</span>
                      <span style={{ fontWeight: 600 }}>{r.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">📌 Quick Tips</div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', fontSize: '.82rem', color: 'var(--gray-600)' }}>
                  <div>• Clear browser cache if videos don't load</div>
                  <div>• Check your spam folder for emails from us</div>
                  <div>• Use the latest version of Chrome or Firefox</div>
                  <div>• Keep your transaction ID ready for payment queries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
