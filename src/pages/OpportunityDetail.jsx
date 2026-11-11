import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Banknote, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { getApplications, getOpportunityById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import SampleNotice from '../components/SampleNotice';

const formatDate = (yyyyMmDd, month = 'long') =>
  new Date(`${yyyyMmDd}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric' });

export default function OpportunityDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [opp, setOpp] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setExistingApplication(null);
    getOpportunityById(id)
      .then(async (res) => {
        if (cancelled) return;
        setOpp(res.data);
        if (isAuthenticated) {
          // Has this student already applied? A failure here is not fatal: the server still blocks duplicates.
          try {
            const apps = await getApplications();
            if (!cancelled) setExistingApplication(apps.data.find((a) => a.opportunityId === res.data.id) || null);
          } catch { /* ignore */ }
        }
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isAuthenticated, reloadKey]);

  if (loading) return <LoadingSpinner size="lg" text="Loading opportunity..." />;
  if (error || !opp) {
    const notFound = error?.status === 404;
    return (
      <div style={{ padding: '3rem 0' }}>
        <ErrorState
          title={notFound ? 'Opportunity not found' : 'Could not load this opportunity'}
          message={notFound ? 'This opportunity does not exist or may have been removed.' : error?.message}
          onRetry={notFound ? undefined : () => setReloadKey((k) => k + 1)}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/opportunities" className="btn btn-secondary btn-sm"><ArrowLeft size={16} /> Back to Opportunities</Link>
        </div>
      </div>
    );
  }

  const deadline = opp.deadline ? formatDate(opp.deadline) : null;

  let action;
  if (existingApplication) {
    action = (
      <>
        <p style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', gap: 6, alignItems: 'center' }}>
          <CheckCircle2 size={18} aria-hidden="true" /> You have applied
        </p>
        <Link to={`/applications/${existingApplication.id}`} className="btn btn-secondary" style={{ width: '100%' }}>View my application</Link>
      </>
    );
  } else if (opp.isClosed) {
    action = <button type="button" className="btn btn-secondary" style={{ width: '100%' }} disabled>Applications closed</button>;
  } else {
    action = (
      <>
        <Link to={`/apply/${opp.id}`} className="btn btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }}>Apply Now</Link>
        {!isAuthenticated && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>You will be asked to log in first.</p>}
      </>
    );
  }

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <Link to="/opportunities" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Opportunities
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="opp-detail-grid">
          <div style={{ minWidth: 0 }}>
            <SampleNotice what="opportunity details" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span className="badge badge-teal">{opp.type}</span>
              <span className="badge badge-amber">{opp.category}</span>
              {opp.isClosed && <span className="badge badge-stone">Closed</span>}
              {opp.tags?.map((t) => (
                <span key={t} className="badge" style={{ background: '#f3f4f6', color: 'var(--text-secondary)' }}>{t}</span>
              ))}
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', marginBottom: '0.4rem' }}>{opp.title}</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--teal-600)', fontWeight: 600, marginBottom: '1.25rem' }}>{opp.company}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', marginBottom: '1.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {opp.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} aria-hidden="true" /> {opp.location}</span>}
              {opp.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} aria-hidden="true" /> {opp.duration}</span>}
              {opp.stipend && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Banknote size={16} aria-hidden="true" /> {opp.stipend}</span>}
              {deadline && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} aria-hidden="true" /> Deadline: {deadline}</span>}
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>About this opportunity</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{opp.description}</p>
            </div>

            {opp.requirements?.length > 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Eligibility & requirements</h2>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {opp.requirements.map((req) => (
                    <li key={req} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--teal-600)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--stone-100), var(--stone-200))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Building2 size={28} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{opp.company}</h3>
              {opp.location && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{opp.location}</p>}
              {action}
              {deadline && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>Application deadline: {deadline}</p>}
            </div>
          </aside>
        </div>
      </div>

      <style>{`@media (min-width: 900px) { .opp-detail-grid { grid-template-columns: minmax(0, 1fr) 300px !important; } }`}</style>
    </div>
  );
}
