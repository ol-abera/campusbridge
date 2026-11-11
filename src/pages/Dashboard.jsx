import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Briefcase, FileText } from 'lucide-react';
import { getCourses, getOpportunities, getApplications } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import CourseCard from '../components/CourseCard';
import OpportunityCard from '../components/OpportunityCard';
import { statusClass } from '../components/ApplicationCard';
import { ROLE_HOME } from '../utils/format';

function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [stats, setStats] = useState({ courses: 0, opportunities: 0, applications: 0 });
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [featuredOpps, setFeaturedOpps] = useState([]);
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [coursesRes, oppsRes, appsRes] = await Promise.all([
          getCourses(),
          getOpportunities(),
          getApplications(),
        ]);
        if (cancelled) return;
        setStats({
          courses: coursesRes.total || coursesRes.data?.length || 0,
          opportunities: oppsRes.total || oppsRes.data?.length || 0,
          applications: appsRes.total || appsRes.data?.length || 0,
        });
        setFeaturedCourses((coursesRes.data || []).slice(0, 3));
        setFeaturedOpps((oppsRes.data || []).slice(0, 3));
        setRecentApps((appsRes.data || []).slice(0, 3));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load your dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your dashboard..." />;
  }
  if (error) {
    return <div style={{ padding: '3rem 0' }}><ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} /></div>;
  }

  const quickLinks = [
    { to: '/courses', icon: BookOpen, title: 'Courses', desc: `${stats.courses} available` },
    { to: '/opportunities', icon: Briefcase, title: 'Opportunities', desc: `${stats.opportunities} listed` },
    { to: '/applications', icon: FileText, title: 'Applications', desc: `${stats.applications} submitted` },
  ];

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <div style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', marginBottom: 4 }}>Welcome, {user?.fullName?.split(' ')[0] || 'student'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your overview of courses, opportunities, and applications.
            </p>
          </div>
          <Link to="/profile" className="btn btn-secondary btn-sm">
            My profile
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: '2.25rem',
          }}
        >
          {quickLinks.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="card card-hover"
              style={{
                padding: '1.1rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'var(--teal-50)',
                  color: 'var(--teal-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--stone-400)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>

        <section style={{ marginBottom: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Courses</h2>
            <Link to="/courses" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {featuredCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Featured opportunities</h2>
            <Link to="/opportunities" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {featuredOpps.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Recent applications</h2>
            <Link to="/applications" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={15} />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: '0.9rem' }}>
                You have not submitted any applications yet.
              </p>
              <Link to="/opportunities" className="btn btn-primary btn-sm">
                Browse opportunities
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentApps.map((app) => (
                <Link key={app.id} to={`/applications/${app.id}`} className="card card-hover" style={{ padding: '0.9rem 1.15rem', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.positionTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.company}</div>
                    </div>
                    <span className={`badge ${statusClass[app.status] || 'badge-teal'}`}>{app.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Students see this page; instructors and coordinators are sent to their own dashboard.
export default function Dashboard() {
  const { user } = useAuth();
  if (user.role !== 'student') return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <StudentDashboard />;
}
