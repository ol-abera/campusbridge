import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { getOpportunityApplications, setApplicationStatus } from '../services/api';
import useLoad from '../hooks/useLoad';
import { formatDateTime } from '../utils/format';
import { statusClass } from '../components/ApplicationCard';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function CoordinatorApplicants() {
  const { id } = useParams();
  const state = useLoad(() => getOpportunityApplications(id), [id]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function setStatus(appId, status) {
    setBusyId(appId); setError('');
    try { await setApplicationStatus(appId, status); state.reload(); }
    catch (err) { setError(err.message); state.reload(); }
    finally { setBusyId(null); }
  }

  return (
    <PageShell title={state.data?.opportunity.title || 'Applicants'} subtitle={state.data?.opportunity.company} back={{ to: '/coordinator', label: 'My opportunities' }}>
      <Alert>{error}</Alert>
      <AsyncView state={state} loadingText="Loading applicants...">
        {({ data }) => data.length === 0 ? (
          <EmptyState icon={Users} title="No applicants yet" description="Students who apply will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.map((a) => (
              <div key={a.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <div>
                    <strong>{a.fullName}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.university}{a.yearOfStudy ? ` · ${a.yearOfStudy}` : ''}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.email}{a.phone ? ` · ${a.phone}` : ''} · applied {formatDateTime(a.submittedAt)}</div>
                  </div>
                  <span className={`badge ${statusClass[a.status] || 'badge-teal'}`} style={{ alignSelf: 'flex-start' }}>{a.status}</span>
                </div>
                <p className="pre-wrap" style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.92rem' }}>{a.coverLetter}</p>
                {a.portfolioUrl && <a href={a.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', overflowWrap: 'anywhere' }}>{a.portfolioUrl}</a>}
                {a.status === 'Withdrawn' ? (
                  <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)' }}>The student withdrew this application.</p>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                    {['Under Review', 'Accepted', 'Rejected'].map((s) => (
                      <button key={s} type="button" className={`btn btn-sm ${s === 'Accepted' ? 'btn-primary' : 'btn-secondary'}`}
                        disabled={busyId === a.id || a.status === s} onClick={() => setStatus(a.id, s)}>
                        {s === 'Under Review' ? 'Mark under review' : s === 'Accepted' ? 'Accept' : 'Reject'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AsyncView>
    </PageShell>
  );
}
