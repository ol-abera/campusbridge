import { Link } from 'react-router-dom';
import { Calendar, Building2, ChevronRight } from 'lucide-react';

export const statusClass = {
  Submitted: 'badge-teal',
  'Under Review': 'badge-warning',
  Accepted: 'badge-success',
  Rejected: 'badge-error',
  Withdrawn: 'badge-stone',
};

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function ApplicationCard({ application }) {
  return (
    <Link
      to={`/applications/${application.id}`}
      className="card card-hover"
      style={{ padding: '1.1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 8, background: 'var(--stone-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-500)', flexShrink: 0 }}>
        <Building2 size={20} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{application.positionTitle}</span>
          <span className={`badge ${statusClass[application.status] || 'badge-teal'}`}>{application.status}</span>
        </div>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{application.company}</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={12} aria-hidden="true" /> Applied {formatDateTime(application.submittedAt)}
        </span>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--stone-400)', flexShrink: 0 }} aria-hidden="true" />
    </Link>
  );
}
