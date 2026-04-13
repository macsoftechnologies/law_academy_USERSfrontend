export default function Input({ label, error, hint, icon, type = 'text', ...props }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {icon ? (
        <div className="field-icon-wrap">
          <input type={type} {...props} />
          <span className="field-icon">{icon}</span>
        </div>
      ) : (
        <input type={type} {...props} />
      )}
      {error && <span className="field-error">{error}</span>}
      {hint  && <span className="field-hint">{hint}</span>}
    </div>
  );
}
