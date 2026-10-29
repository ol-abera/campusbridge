import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { getOpportunityById, submitApplication } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    yearOfStudy: '',
    coverLetter: '',
    portfolioUrl: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getOpportunityById(id);
        setOpp(res.data);
      } catch (err) {
        setError(err.message || 'Opportunity not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.university.trim()) errs.university = 'University is required';
    if (!form.coverLetter.trim()) errs.coverLetter = 'Cover letter is required';
    else if (form.coverLetter.trim().length < 50) errs.coverLetter = 'Please write at least 50 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        opportunityId: id,
        positionTitle: opp.title,
        company: opp.company,
        ...form,
      };
      const res = await submitApplication(payload);
      if (res.success) {
        setSuccess(res);
      } else {
        setError(res.message || 'Submission failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading application form..." />;
  if (error && !opp) {
    return (
      <div style={{ padding: '3rem 0' }}>
        <ErrorState message={error} />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/opportunities" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-enter" style={{ padding: '3rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 520, textAlign: 'center' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#059669',
            }}
          >
            <CheckCircle2 size={40} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Application Submitted!</h1>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            Your application for <strong>{opp?.title}</strong> at <strong>{opp?.company}</strong> has been received.
          </p>
          {success.mock && (
            <p
              style={{
                fontSize: '0.85rem',
                color: '#b45309',
                background: '#fef3c7',
                padding: '0.6rem 1rem',
                borderRadius: 10,
                marginBottom: '1.5rem',
              }}
            >
              Demo mode: this application is stored only for this session and is not saved to a real server.
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/applications" className="btn btn-primary">
              View My Applications
            </Link>
            <Link to="/opportunities" className="btn btn-secondary">
              Browse More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <Link
          to={`/opportunities/${id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#7c3aed',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to opportunity
        </Link>

        <div className="card" style={{ padding: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Apply for {opp?.title}</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.75rem' }}>
            {opp?.company} · {opp?.location}
          </p>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: 10,
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label className="label" htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                className="input"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
              {formErrors.fullName && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{formErrors.fullName}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row">
              <div>
                <label className="label" htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@university.edu"
                />
                {formErrors.email && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{formErrors.email}</p>}
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  className="input"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+251 9xx xxx xxx"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row">
              <div>
                <label className="label" htmlFor="university">University *</label>
                <input
                  id="university"
                  name="university"
                  className="input"
                  value={form.university}
                  onChange={handleChange}
                  placeholder="Your university"
                />
                {formErrors.university && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{formErrors.university}</p>}
              </div>
              <div>
                <label className="label" htmlFor="yearOfStudy">Year of Study</label>
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  className="input"
                  value={form.yearOfStudy}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="portfolioUrl">Portfolio / LinkedIn / GitHub (optional)</label>
              <input
                id="portfolioUrl"
                name="portfolioUrl"
                className="input"
                value={form.portfolioUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="label" htmlFor="coverLetter">Cover Letter / Why are you a good fit? *</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                className="input textarea"
                value={form.coverLetter}
                onChange={handleChange}
                placeholder="Tell us about yourself, your relevant experience, and why you're excited about this opportunity..."
                rows={6}
              />
              {formErrors.coverLetter && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{formErrors.coverLetter}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ marginTop: '0.5rem' }}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Application
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
