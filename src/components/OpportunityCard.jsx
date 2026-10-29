import { Link } from 'react-router-dom';
import { MapPin, Clock, Banknote, Building2 } from 'lucide-react';

export default function OpportunityCard({ opportunity }) {
  const isUrgent = new Date(opportunity.deadline) - new Date() < 14 * 24 * 60 * 60 * 1000;

  return (
    <Link
      to={`/opportunities/${opportunity.id}`}
      className="card card-interactive"
      style={{ display: 'flex', flexDirection: 'column', padding: '1.35rem', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed',
            flexShrink: 0,
          }}
        >
          <Building2 size={22} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="badge badge-lavender">{opportunity.type}</span>
          {isUrgent && <span className="badge badge-warning">Closing soon</span>}
        </div>
      </div>

      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          marginBottom: '0.3rem',
          lineHeight: 1.35,
        }}
      >
        {opportunity.title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#8b5cf6', fontWeight: 500, marginBottom: '0.75rem' }}>
        {opportunity.company}
      </p>

      <p
        style={{
          fontSize: '0.85rem',
          color: '#6b7280',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.5,
        }}
      >
        {opportunity.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 'auto', fontSize: '0.8rem', color: '#6b7280' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={14} />
          {opportunity.location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={14} />
          {opportunity.duration}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Banknote size={14} />
          {opportunity.stipend}
        </span>
      </div>
    </Link>
  );
}
