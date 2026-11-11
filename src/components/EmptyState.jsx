import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'Check back later or try adjusting your filters.',
  action,
}) {
  return (
    <div className="state-block">
      <div className="state-icon">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 340, marginBottom: action ? 16 : 0 }}>
        {description}
      </p>
      {action}
    </div>
  );
}
