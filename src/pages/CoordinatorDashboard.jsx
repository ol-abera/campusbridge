import { Link } from 'react-router-dom';
import { Briefcase, Plus } from 'lucide-react';
import { getCoordinatorOpportunities } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useLoad from '../hooks/useLoad';
import { formatDate } from '../utils/format';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import EmptyState from '../components/EmptyState';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const state = useLoad(() => getCoordinatorOpportunities().then((r) => r.data));
  const postButton = <Link to="/coordinator/new" className="btn btn-primary btn-sm"><Plus size={16} /> Post an opportunity</Link>;
  return (
    <PageShell title={`Welcome, ${user.fullName.split(' ')[0]}`} subtitle="Opportunities you posted and the students who applied." action={postButton}>
      <AsyncView state={state} loadingText="Loading your opportunities...">
        {(list) => list.length === 0 ? (
          <EmptyState icon={Briefcase} title="You have not posted anything yet" description="Post an internship, scholarship or research opportunity for students to find." action={postButton} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((o) => (
              <Link key={o.id} to={`/coordinator/opportunities/${o.id}`} className="card card-hover" style={{ padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className="badge badge-teal">{o.type}</span>
                    {o.isClosed && <span className="badge badge-stone">Closed</span>}
                  </div>
                  <div style={{ fontWeight: 600 }}>{o.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.company} · deadline {formatDate(o.deadline)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>{o.applicants}</strong> applicants</span>
                  {o.awaitingReview > 0 && <span className="badge badge-warning">{o.awaitingReview} new</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </AsyncView>
    </PageShell>
  );
}
