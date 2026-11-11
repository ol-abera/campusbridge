export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const isLg = size === 'lg';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: isLg ? '3.5rem 1rem' : '2rem 1rem',
      }}
    >
      <div className={`spinner ${isLg ? 'spinner-lg' : ''}`} />
      {text && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{text}</p>
      )}
    </div>
  );
}
