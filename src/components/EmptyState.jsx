import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'Check back later or try adjusting your filters.',
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={36} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: '#374151' }}>{title}</h3>
      <p style={{ color: '#6b7280', fontSize: '0.95rem', maxWidth: 360, marginBottom: action ? '1.25rem' : 0 }}>
        {description}
      </p>
      {action}
    </div>
  );
}
