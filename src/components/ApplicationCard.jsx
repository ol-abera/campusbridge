import { Link } from 'react-router-dom';
import { Calendar, Building2, ChevronRight } from 'lucide-react';

const statusStyles = {
  Submitted: { bg: '#dbeafe', color: '#1d4ed8' },
  'Under Review': { bg: '#fef3c7', color: '#b45309' },
  Accepted: { bg: '#d1fae5', color: '#047857' },
  Rejected: { bg: '#fee2e2', color: '#b91c1c' },
  Withdrawn: { bg: '#f3f4f6', color: '#4b5563' },
};

export default function ApplicationCard({ application }) {
  const status = statusStyles[application.status] || statusStyles.Submitted;
  const date = new Date(application.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.35rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 200ms',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #fce7f3, #ede9fe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a78bfa',
          flexShrink: 0,
        }}
      >
        <Building2 size={22} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {application.positionTitle || application.title}
          </h3>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: 999,
              background: status.bg,
              color: status.color,
            }}
          >
            {application.status}
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.3rem' }}>
          {application.company}
        </p>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={13} />
          Applied {date}
        </span>
      </div>

      <ChevronRight size={20} style={{ color: '#c4b5fd', flexShrink: 0 }} />
    </div>
  );
}
