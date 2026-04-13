export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>← Prev</button>
      {pages.map(n => (
        <button
          key={n}
          className={`page-btn ${page === n ? 'active' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button className="page-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}
