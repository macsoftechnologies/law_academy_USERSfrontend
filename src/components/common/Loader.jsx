export default function Loader({ size = 'md', color = 'navy', className = '' }) {
  const sizeClass  = size  === 'sm'   ? 'spinner-sm'   : '';
  const colorClass = color === 'gold' ? 'spinner-gold' : '';
  return (
    <div className={`loader-wrap ${className}`}>
      <div className={`spinner ${sizeClass} ${colorClass}`} />
    </div>
  );
}
