import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock } from 'lucide-react';
import { getAssignment, submitAssignment } from '../services/api';
import useLoad from '../hooks/useLoad';
import { formatDate, formatDateTime } from '../utils/format';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import FieldError from '../components/FieldError';
import Alert from '../components/Alert';

function SubmitForm({ assignmentId, onDone }) {
  const [form, setForm] = useState({ content: '', link: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    const found = {};
    if (form.content.trim().length < 20) found.content = 'Your answer must be at least 20 characters.';
    if (form.link.trim() && !/^https?:\/\/\S+$/i.test(form.link.trim())) found.link = 'Enter a full link starting with http:// or https://';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await submitAssignment(assignmentId, form);
      onDone();
    } catch (err) {
      setError(err.message);
      if (err.fieldErrors) setErrors((p) => ({ ...p, ...err.fieldErrors }));
      if (err.status === 409) onDone();
    } finally {
      setBusy(false);
    }
  }
  const change = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setErrors((p) => ({ ...p, [e.target.name]: '' })); };

  return (
    <form onSubmit={handleSubmit} noValidate className="card" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Your submission</h2>
      <Alert>{error}</Alert>
      <div style={{ marginBottom: 14 }}>
        <label className="label" htmlFor="content">Your answer *</label>
        <textarea id="content" name="content" className="input textarea" rows={7} value={form.content} onChange={change} placeholder="Explain what you did and what you learned..." />
        <FieldError message={errors.content} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label className="label" htmlFor="link">Link to your work (optional)</label>
        <input id="link" name="link" className="input" value={form.link} onChange={change} placeholder="https://github.com/you/project" />
        <FieldError message={errors.link} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Submitting...' : 'Submit assignment'}</button>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>You can submit once, so check your work first.</p>
    </form>
  );
}

export default function AssignmentDetail() {
  const { id } = useParams();
  const state = useLoad(() => getAssignment(id).then((r) => r.data), [id]);
  return (
    <AsyncView state={state} loadingText="Loading assignment...">
      {(a) => (
        <PageShell title={a.title} subtitle={a.courseTitle} maxWidth={760} back={{ to: `/courses/${a.courseId}`, label: 'Back to course' }}>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              <span>{a.maxPoints} points</span>
              {a.dueDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={15} aria-hidden="true" /> Due {formatDate(a.dueDate)}{a.isOverdue ? ' (passed)' : ''}</span>}
            </div>
            <p className="pre-wrap" style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{a.description}</p>
          </div>

          {a.submission ? (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} aria-hidden="true" /> Submitted
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>{formatDateTime(a.submission.submittedAt)}</p>
              <p className="pre-wrap" style={{ lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 10 }}>{a.submission.content}</p>
              {a.submission.link && <a href={a.submission.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, overflowWrap: 'anywhere' }}>{a.submission.link}</a>}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {a.submission.grade === null ? (
                  <span className="badge badge-warning">Awaiting grading</span>
                ) : (
                  <>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{a.submission.grade} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {a.maxPoints}</span></div>
                    {a.submission.feedback && <p style={{ marginTop: 6, color: 'var(--text-secondary)' }}><strong>Feedback:</strong> {a.submission.feedback}</p>}
                  </>
                )}
              </div>
            </div>
          ) : a.isOverdue ? (
            <Alert type="info">The due date for this assignment has passed, so submissions are closed.</Alert>
          ) : (
            <SubmitForm assignmentId={a.id} onDone={state.reload} />
          )}
        </PageShell>
      )}
    </AsyncView>
  );
}
