import { Link } from 'react-router-dom';
import { GraduationCap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        background: 'linear-gradient(180deg, #faf8f5 0%, #f5f3ff 100%)',
        borderTop: '1px solid #ede9fe',
        padding: '3rem 0 1.5rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <GraduationCap size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#6d28d9' }}>
                CampusBridge
              </span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 280 }}>
              Empowering students to discover courses, internships, and opportunities that shape their future.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Explore
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/courses" style={{ color: '#6b7280', fontSize: '0.9rem' }}>Courses</Link>
              <Link to="/opportunities" style={{ color: '#6b7280', fontSize: '0.9rem' }}>Opportunities</Link>
              <Link to="/applications" style={{ color: '#6b7280', fontSize: '0.9rem' }}>My Applications</Link>
              <Link to="/dashboard" style={{ color: '#6b7280', fontSize: '0.9rem' }}>Dashboard</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Help Center</span>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Contact Us</span>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Privacy Policy</span>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Terms of Service</span>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} CampusBridge. All rights reserved.
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Made with <Heart size={14} style={{ color: '#f9a8d4' }} fill="#f9a8d4" /> for students
          </p>
        </div>
      </div>
    </footer>
  );
}
