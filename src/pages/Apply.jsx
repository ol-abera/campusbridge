import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, CalendarX } from 'lucide-react';
import { getApplications, getOpportunityById, submitApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { YEARS_OF_STUDY } from '../config';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import FieldError from '../components/FieldError';
import Alert from '../components/Alert';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s()-]{0,20}$/;

function validate(form) {
  const errs = {};
  if (form.fullName.trim().length < 2) errs.fullName = 'Full name is required.';
  if (!form.email.trim()) errs.email = 'Email is required.';
  else if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address.';
  if (!PHONE_RE.test(form.phone.trim())) errs.phone = 'Phone can only contain digits, spaces, + ( ) and -, up to 20 characters.';
  if (form.university.trim().length < 2) errs.university = 'University is required.';
  if (!form.coverLetter.trim()) errs.coverLetter = 'Cover letter is required.';
  else if (form.coverLetter.trim().length < 50) errs.coverLetter = 'Please write at least 50 characters.';
  if (form.portfolioUrl.trim() && !/^https?:\/\/\S+$/i.test(form.portfolioUrl.trim())) errs.portfolioUrl = 'Enter a full link starting with http:// or https://';
  return errs;
}

export default function Apply() {
  const { id } = useParams();
  const { user } = useAuth();
  const [opp, setOpp] = useState(null);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [reloadKey, setReloadKey] = useState(0);
  const submitLock = useRef(false); // blocks a second submit before React has re-rendered the disabled button

  // The form starts pre-filled from the student's profile; they can still edit anything.
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    university: user?.university || '',
    yearOfStudy: user?.yearOfStudy || '',
    coverLetter: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([getOpportunityById(id), getApplications()])
      .then(([oppRes, appsRes]) => {
        if (cancelled) return;
        setOpp(oppRes.data);
        setExisting(appsRes.data.find((a) => a.opportunityId === oppRes.data.id) || null);
      })
      .catch((err) => { if (!cancelled) setLoadError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, reloadKey]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitLock.current) return;
    setSubmitError('');
    const errs = validate(form);
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    submitLock.current = true;
    setSubmitting(true);
    try {
      // Only the opportunity id is sent. The server looks up the real title and company itself.
      const res = await submitApplication({ opportunityId: opp.id, ...form });
      setSuccess(res.data);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please try again.');
      if (err.fieldErrors) setFormErrors((prev) => ({ ...prev, ...err.fieldErrors }));
      if (err.status === 409) setExisting({ id: err.extra?.applicationId });
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  const backLink = (
    <Link to={`/opportunities/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)', marginBottom: '1.5rem' }}>
      <ArrowLeft size={16} /> Back to opportunity
    </Link>
  );

  if (loading) return <LoadingSpinner size="lg" text="Loading application form..." />;

  if (loadError || !opp) {
    const notFound = loadError?.status === 404;
    return (
      <div style={{ padding: '3rem 0' }}>
        <ErrorState
          title={notFound ? 'Opportunity not found' : 'Could not load the application form'}
          message={notFound ? 'This opportunity does not exist or may have been removed.' : loadError?.message}
          onRetry={notFound ? undefined : () => setReloadKey((k) => k + 1)}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/opportunities" className="btn btn-secondary btn-sm"><ArrowLeft size={16} /> Back to Opportunities</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-enter" style={{ padding: '3rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 520, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#059669' }}>
            <CheckCircle2 size={40} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Application submitted</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your application for <strong>{success.positionTitle}</strong> at <strong>{success.company}</strong> has been saved to your account.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/applications/${success.id}`} className="btn btn-primary">View application</Link>
            <Link to="/applications" className="btn btn-secondary">All my applications</Link>
            <Link to="/opportunities" className="btn btn-secondary">Browse more</Link>
          </div>
        </div>
      </div>
    );
  }

  // Already applied (found when the page loaded, or reported by the server on submit).
  if (existing) {
    return (
      <div className="page-enter" style={{ padding: '3rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 520, textAlign: 'center' }}>
          <CheckCircle2 size={44} style={{ color: 'var(--success)', marginBottom: 12 }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>You have already applied</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You already submitted an application for <strong>{opp.title}</strong>. Each opportunity can only be applied to once.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {existing.id && <Link to={`/applications/${existing.id}`} className="btn btn-primary">View application</Link>}
            <Link to="/opportunities" className="btn btn-secondary">Browse more</Link>
          </div>
        </div>
      </div>
    );
  }

  if (opp.isClosed) {
    return (
      <div className="page-enter" style={{ padding: '3rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 520, textAlign: 'center' }}>
          <CalendarX size={44} style={{ color: 'var(--stone-500)', marginBottom: 12 }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Applications are closed</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The deadline for <strong>{opp.title}</strong> has passed.</p>
          <Link to="/opportunities" className="btn btn-primary">Browse other opportunities</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        {backLink}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Apply for {opp.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>{[opp.company, opp.location].filter(Boolean).join(' · ')}</p>

          <Alert>{submitError}</Alert>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label className="label" htmlFor="fullName">Full Name *</label>
              <input id="fullName" name="fullName" className="input" value={form.fullName} onChange={handleChange} autoComplete="name" />
              <FieldError message={formErrors.fullName} />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" className="input" value={form.email} onChange={handleChange} autoComplete="email" />
                <FieldError message={formErrors.email} />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" className="input" value={form.phone} onChange={handleChange} placeholder="+251 9xx xxx xxx" autoComplete="tel" />
                <FieldError message={formErrors.phone} />
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="university">University *</label>
                <input id="university" name="university" className="input" value={form.university} onChange={handleChange} />
                <FieldError message={formErrors.university} />
              </div>
              <div>
                <label className="label" htmlFor="yearOfStudy">Year of Study</label>
                <select id="yearOfStudy" name="yearOfStudy" className="input" value={form.yearOfStudy} onChange={handleChange}>
                  <option value="">Select...</option>
                  {YEARS_OF_STUDY.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="portfolioUrl">Portfolio / LinkedIn / GitHub (optional)</label>
              <input id="portfolioUrl" name="portfolioUrl" className="input" value={form.portfolioUrl} onChange={handleChange} placeholder="https://..." />
              <FieldError message={formErrors.portfolioUrl} />
            </div>

            <div>
              <label className="label" htmlFor="coverLetter">Cover letter: why are you a good fit? *</label>
              <textarea id="coverLetter" name="coverLetter" className="input textarea" value={form.coverLetter} onChange={handleChange} placeholder="Tell them about yourself, your relevant experience, and why you are interested in this opportunity..." rows={6} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <FieldError message={formErrors.coverLetter} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{form.coverLetter.trim().length} / 50 minimum</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '0.5rem' }}>
              {submitting ? (<><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting...</>) : (<><Send size={18} /> Submit Application</>)}
            </button>
          </form>
        </div>
      </div>
      <style>{`@media (max-width: 600px) { .form-row { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
