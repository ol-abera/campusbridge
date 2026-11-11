import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOpportunity } from '../services/api';
import PageShell from '../components/PageShell';
import FieldError from '../components/FieldError';
import Alert from '../components/Alert';

const TYPES = ['Internship', 'Scholarship', 'Research Opportunity'];
const EMPTY = { title: '', company: '', type: 'Internship', category: '', location: '', duration: '', stipend: '', deadline: '', description: '', requirements: '', tags: '' };

export default function CoordinatorNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setErrors((p) => ({ ...p, [e.target.name]: '' })); };

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    const found = {};
    if (form.title.trim().length < 3) found.title = 'Title must be at least 3 characters.';
    if (form.company.trim().length < 2) found.company = 'Organisation is required.';
    if (form.category.trim().length < 2) found.category = 'Category is required (for example Technology).';
    if (!form.deadline) found.deadline = 'Deadline is required.';
    if (form.description.trim().length < 20) found.description = 'Description must be at least 20 characters.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await createOpportunity(form);
      navigate('/coordinator');
    } catch (err) {
      setError(err.message); if (err.fieldErrors) setErrors(err.fieldErrors);
    } finally { setBusy(false); }
  }

  const field = (name, label, props = {}) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" value={form[name]} onChange={change} {...props} />
      <FieldError message={errors[name]} />
    </div>
  );

  return (
    <PageShell title="Post an opportunity" subtitle="Students will see it on the Opportunities page straight away." back={{ to: '/coordinator', label: 'My opportunities' }} maxWidth={760}>
      <form onSubmit={submit} noValidate className="card" style={{ padding: '1.5rem' }}>
        <Alert>{error}</Alert>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 14 }}>
          {field('title', 'Title *')}
          {field('company', 'Organisation *')}
          <div>
            <label className="label" htmlFor="type">Type *</label>
            <select id="type" name="type" className="input" value={form.type} onChange={change}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            <FieldError message={errors.type} />
          </div>
          {field('category', 'Category *', { placeholder: 'e.g. Technology' })}
          {field('location', 'Location', { placeholder: 'e.g. Jimma · On-site' })}
          {field('duration', 'Duration', { placeholder: 'e.g. 3 months' })}
          {field('stipend', 'Stipend / support', { placeholder: 'e.g. ETB 5,000/month' })}
          {field('deadline', 'Application deadline *', { type: 'date' })}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label" htmlFor="description">Description *</label>
          <textarea id="description" name="description" className="input textarea" rows={5} value={form.description} onChange={change} />
          <FieldError message={errors.description} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 18 }}>
          <div>
            <label className="label" htmlFor="requirements">Requirements (one per line)</label>
            <textarea id="requirements" name="requirements" className="input textarea" rows={4} value={form.requirements} onChange={change} />
            <FieldError message={errors.requirements} />
          </div>
          <div>
            <label className="label" htmlFor="tags">Tags (one per line)</label>
            <textarea id="tags" name="tags" className="input textarea" rows={4} value={form.tags} onChange={change} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Posting...' : 'Post opportunity'}</button>
          <Link to="/coordinator" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </PageShell>
  );
}
