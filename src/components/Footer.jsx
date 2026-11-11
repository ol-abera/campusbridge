import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME } from '../utils/format';
import { CONTACT_EMAIL } from '../config';

const headingStyle = { fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 12 };
const linkStyle = { fontSize: '0.875rem', color: 'var(--text-secondary)' };
const columnStyle = { display: 'flex', flexDirection: 'column', gap: 8 };

export default function Footer() {
  const { isAuthenticated, user } = useAuth();

  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '3rem 0 1.5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#0F766E" />
                <path d="M8 12.5L16 8l8 4.5v7L16 24l-8-4.5v-7z" stroke="#fff" strokeWidth="1.75" strokeLinejoin="round" />
                <path d="M16 8v16M8 12.5l8 4.5 8-4.5" stroke="#fff" strokeWidth="1.75" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}>CampusBridge</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your bridge to academic excellence and career opportunities for university students in South West Ethiopia and beyond.
            </p>
          </div>

          <div>
            <h4 style={headingStyle}>Explore</h4>
            <div style={columnStyle}>
              <Link to="/courses" style={linkStyle}>Courses</Link>
              <Link to="/opportunities" style={linkStyle}>Opportunities</Link>
              {isAuthenticated && user?.role === 'student' && <Link to="/applications" style={linkStyle}>My applications</Link>}
            </div>
          </div>

          <div>
            <h4 style={headingStyle}>Account</h4>
            <div style={columnStyle}>
              {isAuthenticated ? (
                <>
                  <Link to={ROLE_HOME[user?.role] || '/dashboard'} style={linkStyle}>Dashboard</Link>
                  <Link to="/profile" style={linkStyle}>Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/login" style={linkStyle}>Log in</Link>
                  <Link to="/register" style={linkStyle}>Sign up</Link>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 style={headingStyle}>Contact</h4>
            <div style={columnStyle}>
              {CONTACT_EMAIL ? (
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ ...linkStyle, display: 'inline-flex', alignItems: 'center', gap: 6, overflowWrap: 'anywhere' }}>
                  <Mail size={14} aria-hidden="true" /> {CONTACT_EMAIL}
                </a>
              ) : (
                <span style={linkStyle}>Contact details coming soon.</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} CampusBridge. A university student project.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ethiopia</p>
        </div>
      </div>
    </footer>
  );
}
