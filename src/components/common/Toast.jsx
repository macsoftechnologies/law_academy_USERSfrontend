export default function Toast({ type = 'info', msg, children }) {
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  return (
    <div className={`toast ${type}`}>
      <span>{icons[type]}</span>
      <span>{msg || children}</span>
    </div>
  );
}
