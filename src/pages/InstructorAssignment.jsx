import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { getAssignmentSubmissions, gradeSubmission } from '../services/api';
import useLoad from '../hooks/useLoad';
import { formatDateTime } from '../utils/format';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

function GradeForm({ submission, maxPoints, onSaved }) {
  const [grade, setGrade] = useState(submission.grade ?? '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    const n = Number(grade);
    if (grade === '' || !Number.isInteger(n) || n < 0 || n > maxPoints) { setError(`Grade must be a whole number from 0 to ${maxPoints}.`); return; }
    setBusy(true);
    try { await gradeSubmission(submission.id, { grade: n, feedback }); onSaved(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} noValidate style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
      <Alert>{error}</Alert>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label className="label" htmlFor={`g${submission.id}`}>Grade (/{maxPoints})</label>
          <input id={`g${submission.id}`} type="number" min="0" max={maxPoints} className="input" value={grade} onChange={(e) => setGrade(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor={`f${submission.id}`}>Feedback</label>
          <input id={`f${submission.id}`} className="input" value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={1000} />
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving...' : submission.grade === null ? 'Save grade' : 'Update grade'}</button>
    </form>
  );
}

export default function InstructorAssignment() {
  const { id } = useParams();
  const state = useLoad(() => getAssignmentSubmissions(id), [id]);
  return (
    <PageShell title={state.data?.assignment.title || 'Submissions'} subtitle="Review each submission, then grade it and leave feedback." back={{ to: '/instructor', label: 'My courses' }}>
      <AsyncView state={state} loadingText="Loading submissions...">
        {({ assignment, data }) => data.length === 0 ? (
          <EmptyState icon={Inbox} title="No submissions yet" description="Submitted work will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.map((s) => (
              <div key={s.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <div><strong>{s.studentName}</strong><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.studentEmail} · {formatDateTime(s.submittedAt)}</div></div>
                  {s.grade === null ? <span className="badge badge-warning">Needs grading</span> : <span className="badge badge-success">{s.grade}/{assignment.maxPoints}</span>}
                </div>
                <p className="pre-wrap" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.content}</p>
                {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, overflowWrap: 'anywhere', fontSize: '0.9rem' }}>{s.link}</a>}
                <GradeForm key={`${s.id}-${s.grade}`} submission={s} maxPoints={assignment.maxPoints} onSaved={state.reload} />
              </div>
            ))}
          </div>
        )}
      </AsyncView>
    </PageShell>
  );
}
