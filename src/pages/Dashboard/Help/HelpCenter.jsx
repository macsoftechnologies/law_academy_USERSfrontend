import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import {
  createTicket,
  getMyTickets,
  getTicketDetails,
  addMessage,
  scheduleCallback,
  markMessagesRead,
} from '../../../api/helpApi';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const STATUS_COLORS = {
  pending:    { bg: '#fff7e6', color: '#b45309', label: '⏳ Pending' },
  open:       { bg: '#eff6ff', color: '#1d4ed8', label: '🟢 Open' },
  resolved:   { bg: '#f0fdf4', color: '#15803d', label: '✅ Resolved' },
  closed:     { bg: '#f3f4f6', color: '#6b7280', label: '⛔ Closed' },
};

const STATUS_BADGE = (status) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      padding: '.2rem .65rem', borderRadius: 999,
      background: s.bg, color: s.color,
      fontSize: '.72rem', fontWeight: 700,
    }}>{s.label}</span>
  );
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// ─── View: List ────────────────────────────────────────────────────────────────
function TicketList({ onSelect, onCreate }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  const load = async (status) => {
    setLoading(true);
    try {
      const res = await getMyTickets({ status: status || undefined });
      console.log('Tickets API raw response →', res);
      // Handle multiple possible response shapes
      const list =
        res?.data?.tickets ||
        res?.data?.data?.tickets ||
        res?.data?.data ||
        res?.tickets ||
        res?.data ||
        [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load tickets:', e);
      setTickets([]);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(filter); }, [filter]);

  return (
    <>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {['', 'pending', 'open', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-gold btn-sm" onClick={onCreate}>+ New Ticket</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading tickets…</div>
      ) : tickets.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state-icon">🎫</div>
            <h3>No tickets yet</h3>
            <p>Raise a support ticket and we'll get back to you within 24 hours.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '.5rem' }} onClick={onCreate}>Raise a Ticket</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {tickets.map(t => (
            <div key={t.ticketId || t._id} className="card" style={{ cursor: 'pointer' }} onClick={() => onSelect(t.ticketId || t._id)}>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>
                  {t.ticket_type === 'course' ? '🎓' : '🛠️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', marginBottom: '.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>
                    {t.ticket_type === 'course' ? 'Course Issue' : 'Support'} · {fmtDate(t.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
                  {STATUS_BADGE(t.status)}
                  <span style={{ color: 'var(--gray-400)', fontSize: '1.1rem' }}>›</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── View: Create ───────────────────────────────────────────────────────────────
function CreateTicket({ onBack, onCreated }) {
  const [type,    setType]    = useState('course');
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async () => {
    if (!title.trim() || !desc.trim()) return setError('Please fill in all fields.');
    setLoading(true); setError('');
    try {
      const res = await createTicket({ title, description: desc, ticket_type: type });
      if (res?.statusCode === 200 || res?.data?.ticketId) {
        onCreated(res?.data?.ticketId);
      } else {
        setError(res?.message || 'Failed to create ticket.');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="card">
      <div className="card-header">📬 Raise a Support Ticket</div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* Ticket type */}
        <div>
          <label style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--gray-600)', display: 'block', marginBottom: '.5rem' }}>Ticket Type *</label>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            {[
              { val: 'course',  icon: '🎓', label: 'Course Issue' },
              { val: 'support', icon: '🛠️', label: 'General Support' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setType(opt.val)}
                style={{
                  flex: 1, padding: '.75rem', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${type === opt.val ? 'var(--gold)' : 'var(--gray-200)'}`,
                  background: type === opt.val ? 'var(--gold-pale)' : 'var(--white)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '.85rem', color: 'var(--navy)',
                  display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center',
                }}
              >
                <span>{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="field">
          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={type === 'course' ? 'e.g. Cannot access Module 3 videos' : 'e.g. Payment not reflecting'}
            style={{ padding: '.72rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.9rem', fontFamily: 'var(--font-body)', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Description */}
        <div className="field">
          <label>Describe Your Issue *</label>
          <textarea
            rows={5}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Please describe the issue in detail. Include any error messages, steps to reproduce, and what you expected to happen…"
            style={{ padding: '.72rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.9rem', fontFamily: 'var(--font-body)', resize: 'vertical', width: '100%', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--gray-800)' }}
          />
        </div>

        {error && <div className="toast error" style={{ padding: '.6rem 1rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={onBack}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Ticket →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View: Ticket Detail + Conversation ────────────────────────────────────────
function TicketDetail({ ticketId, onBack }) {
  const [ticket,    setTicket]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [msg,       setMsg]       = useState('');
  const [sending,   setSending]   = useState(false);
  const [showSched, setShowSched] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedLoading, setSchedLoading] = useState(false);
  const [schedSuccess, setSchedSuccess] = useState('');
  const [error,     setError]     = useState('');
  const bottomRef = useRef(null);
  const userId = localStorage.getItem('userId');

  const load = async () => {
    try {
      const res = await getTicketDetails(ticketId);
      setTicket(res?.data || res);
      await markMessagesRead(ticketId).catch(() => {});
    } catch { setError('Failed to load ticket.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [ticketId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket]);

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await addMessage(ticketId, msg);
      setMsg('');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to send message.');
    } finally { setSending(false); }
  };

  const submitSchedule = async () => {
    if (!schedDate) return;
    setSchedLoading(true);
    try {
      await scheduleCallback(ticketId, new Date(schedDate).toISOString());
      setSchedSuccess('Callback scheduled successfully!');
      setShowSched(false);
      setSchedDate('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to schedule callback.');
    } finally { setSchedLoading(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading ticket…</div>;
  if (error && !ticket) return <div className="toast error">{error}</div>;

  const conversation = ticket?.conversation || ticket?.messages || [];
  const isClosed = ticket?.status === 'closed' || ticket?.status === 'resolved';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>

      {/* ── Conversation panel ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💬 Conversation</span>
          {STATUS_BADGE(ticket?.status)}
        </div>
        <div className="card-body" style={{ flex: 1 }}>
          {/* Ticket info */}
          <div style={{ padding: '.85rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', borderLeft: '3px solid var(--gold)' }}>
            <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)', marginBottom: '.25rem' }}>{ticket?.title}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginBottom: '.4rem' }}>{ticket?.description}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--gray-400)' }}>
              {ticket?.ticket_type === 'course' ? '🎓 Course Issue' : '🛠️ Support'} · Raised on {fmtDate(ticket?.createdAt)}
            </div>
          </div>

          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', minHeight: 200, maxHeight: 400, overflowY: 'auto', paddingRight: '.25rem', marginBottom: '1rem' }}>
            {conversation.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem', fontSize: '.85rem' }}>
                No messages yet. Send a message below to start the conversation.
              </div>
            ) : (
              conversation.map((m, i) => {
                const isMe = m.senderId === userId || m.sender === 'student';
                return (
                  <div key={m._id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '78%', padding: '.6rem .9rem',
                      borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isMe ? 'var(--navy)' : 'var(--gray-100)',
                      color: isMe ? 'var(--white)' : 'var(--gray-800)',
                      fontSize: '.85rem', lineHeight: 1.5,
                    }}>
                      {m.message || m.text}
                    </div>
                    <div style={{ fontSize: '.68rem', color: 'var(--gray-400)', marginTop: '.2rem' }}>
                      {isMe ? 'You' : 'Support Team'} · {fmtDate(m.createdAt || m.timestamp)}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          {!isClosed ? (
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-end' }}>
              <textarea
                rows={2}
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type your message… (Enter to send)"
                style={{ flex: 1, padding: '.65rem .9rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.875rem', fontFamily: 'var(--font-body)', resize: 'none' }}
              />
              <button className="btn btn-primary btn-sm" onClick={send} disabled={sending || !msg.trim()} style={{ height: 44 }}>
                {sending ? '…' : '↑ Send'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '.82rem', color: 'var(--gray-500)' }}>
              This ticket is {ticket?.status}. <button style={{ background: 'none', border: 'none', color: 'var(--navy)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={onBack}>Raise a new ticket</button>
            </div>
          )}
          {error && <div className="toast error" style={{ marginTop: '.5rem', fontSize: '.82rem' }}>{error}</div>}
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Ticket info card */}
        <div className="card">
          <div className="card-header">🎫 Ticket Info</div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', fontSize: '.82rem' }}>
            {[
              { label: 'Ticket ID',  value: ticket?.ticketId || '—' },
              { label: 'Type',       value: ticket?.ticket_type === 'course' ? '🎓 Course' : '🛠️ Support' },
              { label: 'Status',     value: STATUS_BADGE(ticket?.status) },
              { label: 'Raised On',  value: fmtDate(ticket?.createdAt) },
              { label: 'Updated',    value: fmtDate(ticket?.updatedAt) },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem' }}>
                <span style={{ color: 'var(--gray-500)', flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--navy)', textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule callback */}
        {!isClosed && (
          <div className="card">
            <div className="card-header">📞 Schedule a Callback</div>
            <div className="card-body">
              {schedSuccess && <div className="toast success" style={{ marginBottom: '.75rem', fontSize: '.8rem' }}>{schedSuccess}</div>}
              {!showSched ? (
                <button className="btn btn-outline btn-full btn-sm" onClick={() => setShowSched(true)}>Request Callback</button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  <input
                    type="datetime-local"
                    value={schedDate}
                    onChange={e => setSchedDate(e.target.value)}
                    style={{ padding: '.65rem .9rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '.85rem', fontFamily: 'var(--font-body)' }}
                  />
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowSched(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={submitSchedule} disabled={schedLoading || !schedDate}>
                      {schedLoading ? 'Scheduling…' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Main Help Center Page ──────────────────────────────────────────────────────
export default function HelpCenter() {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
  const [activeTicketId, setActiveTicketId] = useState(null);

  const openDetail = async (id) => {
    setActiveTicketId(id);
    setView('detail');
  };

  const handleCreated = (ticketId) => {
    if (ticketId) openDetail(ticketId);
    else setView('list');
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => {
            if (view === 'list') navigate(-1);
            else setView('list');
          }}>← Back</button>

          <div className="page-section-head" style={{ marginBottom: '1rem' }}>
            <h1 className="page-section-title">❓ Help Center</h1>
          </div>

          {/* Conditional views */}
          {view === 'list' && (
            <TicketList onSelect={openDetail} onCreate={() => setView('create')} />
          )}

          {view === 'create' && (
            <CreateTicket onBack={() => setView('list')} onCreated={handleCreated} />
          )}

          {view === 'detail' && activeTicketId && (
            <TicketDetail ticketId={activeTicketId} onBack={() => setView('list')} />
          )}
        </div>
      </div>
    </div>
  );
}
