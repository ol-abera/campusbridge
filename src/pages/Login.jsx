import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import Alert from '../components/Alert';

export default function Login() {
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      // GuestRoute sees the new session and redirects to the page the visitor wanted.
    } catch (err) {
      setError(err.message || 'Could not log in. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="page-enter" style={{ padding: '3rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Log in</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          {location.state?.from ? 'Please log in to continue.' : 'Access your dashboard and applications.'}
        </p>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }} noValidate>
          <Alert>{error}</Alert>
          <div style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" autoComplete="email" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label" htmlFor="password">Password</label>
            <PasswordInput id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Signing in...' : 'Log in'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No account? <Link to="/register" state={location.state} style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link></p>
      </div>
    </div>
  );
}
