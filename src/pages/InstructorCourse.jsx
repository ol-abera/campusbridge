import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createAssignment, getCourseAssignments, getCourseById } from '../services/api';
import useLoad from '../hooks/useLoad';
import { formatDate } from '../utils/format';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import FieldError from '../components/FieldError';
import Alert from '../components/Alert';

const EMPTY = { title: '', description: '', dueDate: '', maxPoints: '100' };

export default function InstructorCourse() {
  const { id } = useParams();
  const state = useLoad(async () => ({ course: (await getCourseById(id)).data, assignments: (await getCourseAssignments(id)).data }), [id]);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setErrors((p) => ({ ...p, [e.target.name]: '' })); };

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError(''); setOk('');
    const found = {};
    if (form.title.trim().length < 3) found.title = 'Title must be at least 3 characters.';
    if (form.description.trim().length < 10) found.description = 'Description must be at least 10 characters.';
    const pts = Number(form.maxPoints);
    if (!Number.isInteger(pts) || pts < 1 || pts > 1000) found.maxPoints = 'Points must be a whole number from 1 to 1000.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await createAssignment(id, { ...form, maxPoints: pts });
      setForm(EMPTY); setOk('Assignment created. Enrolled students were notified.'); state.reload();
    } catch (err) {
      setError(err.message); if (err.fieldErrors) setErrors(err.fieldErrors);
    } finally { setBusy(false); }
  }

  return (
    <PageShell title={state.data?.course.title || 'Course'} subtitle="Assignments and submissions" back={{ to: '/instructor', label: 'My courses' }}>
      <AsyncView state={state}>
        {({ assignments }) => (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '2rem' }}>
              {assignments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No assignments yet. Create the first one below.</p>}
              {assignments.map((a) => (
                <Link key={a.id} to={`/instructor/assignments/${a.id}`} className="card card-hover" style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.maxPoints} points{a.dueDate ? ` · due ${formatDate(a.dueDate)}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{a.submissionCount} submitted</span>
                    {a.pendingCount > 0 && <span className="badge badge-warning">{a.pendingCount} to grade</span>}
                  </div>
                </Link>
              ))}
            </div>

            <form onSubmit={submit} noValidate className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Create an assignment</h2>
              <Alert>{error}</Alert>
              <Alert type="success">{ok}</Alert>
              <div style={{ marginBottom: 14 }}>
                <label className="label" htmlFor="title">Title *</label>
                <input id="title" name="title" className="input" value={form.title} onChange={change} />
                <FieldError message={errors.title} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label" htmlFor="description">Instructions *</label>
                <textarea id="description" name="description" className="input textarea" rows={5} value={form.description} onChange={change} />
                <FieldError message={errors.description} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div>
                  <label className="label" htmlFor="dueDate">Due date</label>
                  <input id="dueDate" name="dueDate" type="date" className="input" value={form.dueDate} onChange={change} />
                  <FieldError message={errors.dueDate} />
                </div>
                <div>
                  <label className="label" htmlFor="maxPoints">Maximum points</label>
                  <input id="maxPoints" name="maxPoints" type="number" min="1" max="1000" className="input" value={form.maxPoints} onChange={change} />
                  <FieldError message={errors.maxPoints} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating...' : 'Create assignment'}</button>
            </form>
          </>
        )}
      </AsyncView>
    </PageShell>
  );
}
