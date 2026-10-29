import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load the data. Please try again.',
  onRetry,
}) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <AlertTriangle size={36} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: '#374151' }}>{title}</h3>
      <p style={{ color: '#6b7280', fontSize: '0.95rem', maxWidth: 360, marginBottom: onRetry ? '1.25rem' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}
