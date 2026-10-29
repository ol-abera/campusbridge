import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { getApplications } from '../services/api';
import ApplicationCard from '../components/ApplicationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getApplications();
      setApps(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', marginBottom: '0.35rem' }}>
              My Applications
            </h1>
            <p style={{ color: '#6b7280' }}>
              Track the status of your submitted applications.
            </p>
          </div>
          <Link to="/opportunities" className="btn btn-primary btn-sm">
            <Plus size={16} />
            Apply to more
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading applications..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : apps.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="When you apply to internships or opportunities, they will appear here so you can track their progress."
            action={
              <Link to="/opportunities" className="btn btn-primary btn-sm">
                Browse Opportunities
              </Link>
            }
          />
        ) : (
          <>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
              {apps.length} application{apps.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {apps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: '#9ca3af',
                marginTop: '1.5rem',
                textAlign: 'center',
              }}
            >
              Applications in demo mode are stored only for this browser session.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
