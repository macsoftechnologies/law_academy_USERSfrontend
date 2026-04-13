import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const TABS = ['All', 'Notes', 'Resources'];

const MOCK_DOWNLOADS = [
  { id: 1, name: 'Constitutional Law – Module 1 Notes', type: 'Notes',     size: '2.4 MB', date: '18 Mar 2025', ext: 'PDF', icon: '📄' },
  { id: 2, name: 'IPC Quick Reference Sheet',           type: 'Notes',     size: '890 KB', date: '10 Mar 2025', ext: 'PDF', icon: '📄' },
  { id: 3, name: 'CPC Civil Procedure Flowcharts',      type: 'Resources', size: '1.1 MB', date: '5 Mar 2025',  ext: 'PDF', icon: '🗂' },
  { id: 4, name: 'Evidence Act Summary – All Sections', type: 'Notes',     size: '3.2 MB', date: '28 Feb 2025', ext: 'PDF', icon: '📄' },
  { id: 5, name: 'Legal Maxims Handbook',               type: 'Resources', size: '760 KB', date: '14 Feb 2025', ext: 'PDF', icon: '📚' },
  { id: 6, name: 'Prelims Practice Questions Set A',    type: 'Resources', size: '1.8 MB', date: '2 Feb 2025',  ext: 'PDF', icon: '📝' },
];

export default function MyDownloads() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_DOWNLOADS.filter(d =>
    (tab === 'All' || d.type === tab) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div className="page-section-head">
            <h1 className="page-section-title">
              ⬇️ My Downloads
              <span className="page-section-count">{MOCK_DOWNLOADS.length}</span>
            </h1>
            <input
              style={{ padding: '.55rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--gray-200)', fontSize: '.875rem', width: 220, background: 'var(--white)', fontFamily: 'var(--font-body)' }}
              placeholder="Search downloads…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="tabs">
            {TABS.map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}
                <span className="tab-badge">{t === 'All' ? MOCK_DOWNLOADS.length : MOCK_DOWNLOADS.filter(d => d.type === t).length}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📂</div>
                <h3>No downloads found</h3>
                <p>Files you download from courses will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              {filtered.map((d, i) => (
                <div key={d.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      {d.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--navy)', marginBottom: '.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', display: 'flex', gap: '.75rem' }}>
                        <span>{d.type}</span>
                        <span>•</span>
                        <span>{d.size}</span>
                        <span>•</span>
                        <span>{d.date}</span>
                      </div>
                    </div>
                    <span style={{ background: 'var(--navy)', color: 'var(--cream)', fontSize: '.65rem', fontWeight: 800, padding: '.15rem .5rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>{d.ext}</span>
                    <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>⬇ Download</button>
                  </div>
                  {i < filtered.length - 1 && <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 1.25rem' }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
