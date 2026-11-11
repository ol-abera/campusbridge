import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// The common frame for the new pages: optional back link, title, subtitle and an action button on the right.
export default function PageShell({ title, subtitle, action, back, maxWidth = 900, children }) {
  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth }}>
        {back && (
          <Link to={back.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)', marginBottom: '1.25rem' }}>
            <ArrowLeft size={16} aria-hidden="true" /> {back.label}
          </Link>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', marginBottom: subtitle ? '0.3rem' : 0 }}>{title}</h1>
            {subtitle && <p style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
