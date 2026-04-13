export default function Button({
  variant = 'primary',
  size = '',
  full = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = ''
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${full ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <><span className="spinner spinner-sm" style={{borderTopColor:'currentColor',margin:'0 .3rem 0 0'}}/> Loading…</> : children}
    </button>
  );
}
