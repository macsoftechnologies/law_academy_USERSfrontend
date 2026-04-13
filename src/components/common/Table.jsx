export default function Table({ columns = [], rows = [], emptyText = 'No data available.' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length} style={{ textAlign:'center', color:'var(--gray-400)', padding:'2rem' }}>{emptyText}</td></tr>
            : rows.map((row, i) => (
                <tr key={i}>{columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}</tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
