import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, UserCircle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/api';

const publicLinks = [
  { to: '/courses', label: 'Courses' },
  { to: '/opportunities', label: 'Opportunities' },
];
// What each kind of account sees in the menu.
const roleLinks = {
  student: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/my-learning', label: 'My learning' },
    { to: '/courses', label: 'Courses' },
    { to: '/opportunities', label: 'Opportunities' },
    { to: '/applications', label: 'Applications' },
    { to: '/profile', label: 'Profile' },
  ],
  instructor: [
    { to: '/instructor', label: 'My courses' },
    { to: '/courses', label: 'Course catalogue' },
    { to: '/profile', label: 'Profile' },
  ],
  coordinator: [
    { to: '/coordinator', label: 'My opportunities' },
    { to: '/opportunities', label: 'All opportunities' },
    { to: '/profile', label: 'Profile' },
  ],
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';

  // Close the mobile menu whenever the page changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  const links = isAuthenticated ? (roleLinks[user?.role] || roleLinks.student) : publicLinks;

  // Number of unread notifications, refreshed on every page change and when the Notifications page changes them.
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) { setUnread(0); return undefined; }
    let cancelled = false;
    const load = () => getNotifications().then((r) => { if (!cancelled) setUnread(r.unread); }).catch(() => {});
    load();
    window.addEventListener('campusbridge:notifications', load);
    return () => { cancelled = true; window.removeEventListener('campusbridge:notifications', load); };
  }, [isAuthenticated, pathname]);

  const bell = (
    <NavLink to="/notifications" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'} style={{ position: 'relative', display: 'inline-flex', padding: 6, color: 'var(--text-secondary)' }}>
      <Bell size={20} aria-hidden="true" />
      {unread > 0 && <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: -2, minWidth: 16, height: 16, borderRadius: 8, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{unread > 9 ? '9+' : unread}</span>}
    </NavLink>
  );
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  const linkStyle = ({ isActive }) => ({
    padding: '0.4rem 0.75rem',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
    borderRadius: 'var(--radius)',
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: isHome ? 'rgba(250,250,249,.94)' : 'rgba(255,255,255,.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 60, gap: 12 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#0F766E" />
            <path d="M8 12.5L16 8l8 4.5v7L16 24l-8-4.5v-7z" stroke="#fff" strokeWidth="1.75" strokeLinejoin="round" />
            <path d="M16 8v16M8 12.5l8 4.5 8-4.5" stroke="#fff" strokeWidth="1.75" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem', color: 'var(--text)', letterSpacing: '-.02em' }}>CampusBridge</span>
        </Link>

        <nav className="nav-desktop" aria-label="Main" style={{ alignItems: 'center', gap: 2 }}>
          {links.map(({ to, label }) => <NavLink key={to} to={to} style={linkStyle}>{label}</NavLink>)}
        </nav>

        <div className="nav-desktop" style={{ alignItems: 'center', gap: 8 }}>
          {isAuthenticated ? (
            <>
              {bell}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 160 }}>
                <UserCircle size={18} aria-hidden="true" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Hi, {firstName}</span>
              </span>
              <button type="button" onClick={handleLogout} className="btn btn-primary btn-sm"><LogOut size={15} /> Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>

        <button className="nav-mobile-btn" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} style={{ padding: 6, color: 'var(--stone-600)', borderRadius: 6 }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '.75rem 1.25rem 1.25rem' }}>
          {isAuthenticated && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0 0.75rem 0.5rem' }}>Signed in as {user?.fullName}</p>
          )}
          <nav aria-label="Mobile" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {links.map(({ to, label }) => <NavLink key={to} to={to} style={linkStyle}>{label}</NavLink>)}
            {isAuthenticated && <NavLink to="/notifications" style={linkStyle}>Notifications{unread ? ` (${unread})` : ''}</NavLink>}
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {isAuthenticated ? (
              <button type="button" className="btn btn-primary" onClick={handleLogout}>Log out</button>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Log in</Link>
                <Link to="/register" className="btn btn-primary">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
      <style>{`@media (min-width:1100px){.nav-desktop{display:flex!important}.nav-mobile-btn{display:none!important}} @media (max-width:1099px){.nav-desktop{display:none!important}.nav-mobile-btn{display:flex!important}}`}</style>
    </header>
  );
}
