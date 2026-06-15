/**
 * Shared progress bar row used across the Marks Dashboard and its
 * drill-down pages (Study Analysis, Prelims Prep, Mains Prep).
 *
 * Renders a label, a horizontal progress track, and a
 * "Completed-X  Pending-Y" caption beneath it — matching the
 * reference design.
 */
export default function ProgressRow({ label, completed = 0, pending = 0, total, color = 'var(--gold)', icon }) {
  const safeTotal = total != null ? total : (completed + pending);
  const safePending = total != null ? Math.max(0, total - completed) : pending;
  const denom = safeTotal > 0 ? safeTotal : 1;
  const percent = Math.min(100, Math.round((completed / denom) * 100));

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '.4rem' }}>
        <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
          {icon && <span>{icon}</span>}{label}
        </span>
        <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--navy)' }}>{percent}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, transition: 'width .4s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.3rem', fontSize: '.72rem', color: 'var(--gray-500)', fontWeight: 600 }}>
        <span>Completed-{completed}</span>
        <span>Pending-{safePending}</span>
      </div>
    </div>
  );
}