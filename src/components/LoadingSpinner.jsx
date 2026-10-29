export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const isLg = size === 'lg';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: isLg ? '4rem 1rem' : '2rem 1rem',
      }}
    >
      <div className={`spinner ${isLg ? 'spinner-lg' : ''}`} />
      {text && (
        <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>{text}</p>
      )}
    </div>
  );
}
