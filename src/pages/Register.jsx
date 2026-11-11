import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import FieldError from '../components/FieldError';
import Alert from '../components/Alert';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Same rules as the backend (backend/src/utils/validate.js) so the student gets instant feedback.
function validate(form) {
  const errors = {};
  if (form.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (form.university.trim().length < 2) errors.university = 'Enter your university.';
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (new TextEncoder().encode(form.password).length > 72) errors.password = 'Password is too long (72 bytes maximum).';
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) errors.password = 'Password must contain at least one letter and one number.';
  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export default function Register() {
  const location = useLocation();
  const { register, startSession } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', university: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const result = await register({ fullName: form.fullName.trim(), email: form.email.trim(), university: form.university.trim(), password: form.password });
      setSuccess(true);
      // Short pause so the student sees the success message, then log them in.
      // GuestRoute then moves them to the page they wanted (or the dashboard).
      setTimeout(() => startSession(result), 1200);
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
      if (err.fieldErrors) setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="page-enter" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <CheckCircle2 size={44} style={{ color: 'var(--success)', marginBottom: 12 }} />
        <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Account created</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to CampusBridge. Taking you to your dashboard...</p>
      </div>
    );
  }

  const field = (name, label, props = {}) => (
    <div style={{ marginBottom: 14 }}>
      <label className="label" htmlFor={name}>{label} *</label>
      <input id={name} name={name} className="input" value={form[name]} onChange={handleChange} aria-invalid={Boolean(errors[name]) || undefined} {...props} />
      <FieldError message={errors[name]} />
    </div>
  );

  return (
    <div className="page-enter" style={{ padding: '3rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Create your account</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Create an account to apply for opportunities and track your applications.</p>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }} noValidate>
          <Alert>{error}</Alert>
          {field('fullName', 'Full name', { placeholder: 'Abebe Kebede', autoComplete: 'name' })}
          {field('email', 'Email', { type: 'email', placeholder: 'you@university.edu', autoComplete: 'email' })}
          {field('university', 'University', { placeholder: 'e.g. Mizan-Tepi University' })}
          <div style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="password">Password *</label>
            <PasswordInput id="password" name="password" value={form.password} onChange={handleChange} placeholder="8+ characters, letter and number" autoComplete="new-password" invalid={Boolean(errors.password)} />
            <FieldError message={errors.password} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label" htmlFor="confirmPassword">Confirm password *</label>
            <PasswordInput id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" autoComplete="new-password" invalid={Boolean(errors.confirmPassword)} />
            <FieldError message={errors.confirmPassword} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Creating account...' : 'Sign up'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Already have an account? <Link to="/login" state={location.state} style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link></p>
      </div>
    </div>
  );
}
