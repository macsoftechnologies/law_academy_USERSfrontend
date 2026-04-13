export default function Avatar({ name = '', size = 38, variant = 'navy', className = '' }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const bg = variant === 'gold' ? 'var(--gold)' : 'var(--navy)';
  const color = variant === 'gold' ? 'var(--maroon)' : 'var(--cream)';
  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        borderRadius: 8,
        background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: size * .32, flexShrink: 0
      }}
    >
      {initials}
    </div>
  );
}
