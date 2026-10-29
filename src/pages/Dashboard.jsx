import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Briefcase,
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { getCourses, getOpportunities, getApplications } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CourseCard from '../components/CourseCard';
import OpportunityCard from '../components/OpportunityCard';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, opportunities: 0, applications: 0 });
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [featuredOpps, setFeaturedOpps] = useState([]);
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [coursesRes, oppsRes, appsRes] = await Promise.all([
          getCourses(),
          getOpportunities(),
          getApplications(),
        ]);
        setStats({
          courses: coursesRes.total || coursesRes.data?.length || 0,
          opportunities: oppsRes.total || oppsRes.data?.length || 0,
          applications: appsRes.total || appsRes.data?.length || 0,
        });
        setFeaturedCourses((coursesRes.data || []).slice(0, 3));
        setFeaturedOpps((oppsRes.data || []).slice(0, 3));
        setRecentApps((appsRes.data || []).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your dashboard..." />;
  }

  const quickLinks = [
    {
      to: '/courses',
      icon: BookOpen,
      title: 'Browse Courses',
      desc: `${stats.courses} available`,
      gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
      iconColor: '#7c3aed',
    },
    {
      to: '/opportunities',
      icon: Briefcase,
      title: 'Find Internships',
      desc: `${stats.opportunities} open roles`,
      gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
      iconColor: '#db2777',
    },
    {
      to: '/applications',
      icon: FileText,
      title: 'My Applications',
      desc: `${stats.applications} submitted`,
      gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      iconColor: '#2563eb',
    },
  ];

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Welcome */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', marginBottom: '0.35rem' }}>
            Welcome back 👋
          </h1>
          <p style={{ color: '#6b7280' }}>
            Here's what's happening on CampusBridge today.
          </p>
        </div>

        {/* Quick links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {quickLinks.map(({ to, icon: Icon, title, desc, gradient, iconColor }) => (
            <Link
              key={to}
              to={to}
              className="card card-interactive"
              style={{
                padding: '1.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconColor,
                  flexShrink: 0,
                }}
              >
                <Icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{desc}</div>
              </div>
              <ArrowRight size={18} style={{ color: '#c4b5fd' }} />
            </Link>
          ))}
        </div>

        {/* Featured Courses */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: '#8b5cf6' }} />
              Popular Courses
            </h2>
            <Link to="/courses" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {featuredCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>

        {/* Featured Opportunities */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} style={{ color: '#ec4899' }} />
              Featured Opportunities
            </h2>
            <Link to="/opportunities" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {featuredOpps.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        </section>

        {/* Recent Applications */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} style={{ color: '#3b82f6' }} />
              Recent Applications
            </h2>
            <Link to="/applications" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div
              className="card"
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280',
              }}
            >
              <p style={{ marginBottom: '1rem' }}>You haven't submitted any applications yet.</p>
              <Link to="/opportunities" className="btn btn-primary btn-sm">
                Browse Opportunities
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentApps.map((app) => (
                <div key={app.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{app.positionTitle || app.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{app.company}</div>
                    </div>
                    <span className="badge badge-blue">{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
