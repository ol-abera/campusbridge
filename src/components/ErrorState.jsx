import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load the data. Please try again.',
  onRetry,
}) {
  return (
    <div className="state-block">
      <div className="state-icon error">
        <AlertTriangle size={28} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 340, marginBottom: onRetry ? 16 : 0 }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}
