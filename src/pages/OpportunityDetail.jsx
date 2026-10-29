import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { getOpportunityById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getOpportunityById(id);
        setOpp(res.data);
      } catch (err) {
        setError(err.message || 'Opportunity not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" text="Loading opportunity..." />;
  if (error || !opp) {
    return (
      <div style={{ padding: '3rem 0' }}>
        <ErrorState title="Not found" message={error} onRetry={() => window.location.reload()} />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/opportunities" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const deadline = new Date(opp.deadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <Link
          to="/opportunities"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#7c3aed',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Opportunities
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
          }}
          className="opp-detail-grid"
        >
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span className="badge badge-lavender">{opp.type}</span>
              <span className="badge badge-pink">{opp.category}</span>
              {opp.tags?.map((t) => (
                <span key={t} className="badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>
                  {t}
                </span>
              ))}
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', marginBottom: '0.4rem' }}>
              {opp.title}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#8b5cf6', fontWeight: 600, marginBottom: '1.25rem' }}>
              {opp.company}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginBottom: '1.75rem',
                fontSize: '0.9rem',
                color: '#6b7280',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} /> {opp.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> {opp.duration}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Banknote size={16} /> {opp.stipend}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} /> Deadline: {deadline}
              </span>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>About the role</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.7 }}>{opp.description}</p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Requirements</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {opp.requirements?.map((req) => (
                  <li key={req} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#374151' }}>
                    <CheckCircle2 size={18} style={{ color: '#8b5cf6', flexShrink: 0, marginTop: 2 }} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 90 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed',
                  marginBottom: '1rem',
                }}
              >
                <Building2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{opp.company}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.25rem' }}>
                {opp.location}
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '0.75rem' }}
                onClick={() => navigate(`/apply/${opp.id}`)}
              >
                Apply Now
              </button>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
                Application deadline: {deadline}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .opp-detail-grid {
            grid-template-columns: 1fr 300px !important;
          }
        }
      `}</style>
    </div>
  );
}
