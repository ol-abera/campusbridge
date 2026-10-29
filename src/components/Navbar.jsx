import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, LayoutDashboard, BookOpen, Briefcase, FileText } from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { to: '/applications', label: 'Applications', icon: FileText },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: isLanding ? 'rgba(254, 253, 251, 0.85)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(196, 181, 253, 0.25)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            <GraduationCap size={22} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.25rem',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CampusBridge
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', gap: '0.25rem' }} className="desktop-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: 10,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive ? '#7c3aed' : '#4b5563',
                background: isActive ? '#f5f3ff' : 'transparent',
                transition: 'all 200ms',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div style={{ display: 'none', gap: '0.75rem' }} className="desktop-cta">
          <Link to="/courses" className="btn btn-secondary btn-sm">
            Explore Courses
          </Link>
          <Link to="/opportunities" className="btn btn-primary btn-sm">
            Find Internships
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{
            display: 'flex',
            padding: 8,
            borderRadius: 10,
            color: '#6b7280',
          }}
          className="mobile-toggle"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            borderTop: '1px solid #ede9fe',
            background: 'white',
            padding: '1rem 1.25rem 1.5rem',
            animation: 'fadeInUp 0.25s ease-out',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  fontWeight: 500,
                  color: isActive ? '#7c3aed' : '#374151',
                  background: isActive ? '#f5f3ff' : 'transparent',
                })}
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
            <Link to="/courses" className="btn btn-secondary" onClick={() => setMobileOpen(false)}>
              Explore Courses
            </Link>
            <Link to="/opportunities" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
              Find Internships
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-cta { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
