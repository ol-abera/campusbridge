import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getApplicationById, withdrawApplication } from '../services/api';
import Alert from '../components/Alert';
import { statusClass } from '../components/ApplicationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const formatFull = (iso) =>
  new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getApplicationById(id)
      .then((res) => { if (!cancelled) setApp(res.data); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, reloadKey]);

  async function withdraw() {
    setBusy(true); setActionError('');
    try { await withdrawApplication(id); setConfirming(false); setReloadKey((k) => k + 1); }
    catch (err) { setActionError(err.message); setConfirming(false); setReloadKey((k) => k + 1); }
    finally { setBusy(false); }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading application..." />;
  if (error || !app) {
    const notFound = error?.status === 404;
    return (
      <div style={{ padding: '3rem 0' }}>
        <ErrorState
          title={notFound ? 'Application not found' : 'Could not load this application'}
          message={notFound ? 'This application does not exist, or it belongs to a different account.' : error?.message}
          onRetry={notFound ? undefined : () => setReloadKey((k) => k + 1)}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/applications" className="btn btn-secondary btn-sm"><ArrowLeft size={16} /> Back to applications</Link>
        </div>
      </div>
    );
  }

  const rows = [
    ['Full name', app.fullName],
    ['Email', app.email],
    ['Phone', app.phone],
    ['University', app.university],
    ['Year of study', app.yearOfStudy],
  ].filter(([, v]) => v);

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <Link to="/applications" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to applications
        </Link>

        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <h1 style={{ fontSize: '1.5rem' }}>{app.positionTitle}</h1>
            <span className={`badge ${statusClass[app.status] || 'badge-teal'}`}>{app.status}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{app.company}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Submitted {formatFull(app.submittedAt)}</p>
          <Link to={`/opportunities/${app.opportunityId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
            View opportunity <ExternalLink size={14} aria-hidden="true" />
          </Link>
          {app.updatedAt && new Date(app.updatedAt) - new Date(app.submittedAt) > 1000 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 10 }}>Status last updated {formatFull(app.updatedAt)}</p>
          )}
          <Alert style={{ marginTop: 12, marginBottom: 0 }}>{actionError}</Alert>
          {['Submitted', 'Under Review'].includes(app.status) && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {confirming ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem' }}>Withdraw this application? You cannot apply again to this opportunity.</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={withdraw} disabled={busy}>{busy ? 'Withdrawing...' : 'Yes, withdraw'}</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Keep it</button>
                </div>
              ) : (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirming(true)}>Withdraw application</button>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Details you submitted</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            {rows.map(([label, value]) => (
              <div key={label} className="detail-row" style={{ color: 'var(--text-secondary)' }}>
                <span>{label}</span><strong style={{ color: 'var(--text)', overflowWrap: 'anywhere' }}>{value}</strong>
              </div>
            ))}
            {app.portfolioUrl && (
              <div className="detail-row" style={{ color: 'var(--text-secondary)' }}>
                <span>Link</span>
                <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, overflowWrap: 'anywhere', textAlign: 'right' }}>{app.portfolioUrl}</a>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Cover letter</h2>
          <p className="pre-wrap" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{app.coverLetter}</p>
        </div>
      </div>
    </div>
  );
}
