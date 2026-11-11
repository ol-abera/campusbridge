import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Briefcase, FileCheck } from 'lucide-react';
import { getCourses, getOpportunities, getStats } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import SampleNotice from '../components/SampleNotice';

const steps = [
  {
    num: '01',
    title: 'Discover',
    text: 'Search and filter courses and opportunities by category, type and level.',
  },
  {
    num: '02',
    title: 'Apply',
    text: 'Submit an application with a simple form and track it from your account.',
  },
  {
    num: '03',
    title: 'Grow',
    text: 'Build skills, gain experience, and take the next step in your academic and professional path.',
  },
];

export default function Landing() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [featuredOpps, setFeaturedOpps] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  // Featured items and numbers come from the database through the API (nothing is hardcoded here).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getOpportunities(), getCourses(), getStats()])
      .then(([opps, courses, statsRes]) => {
        if (cancelled) return;
        setFeaturedOpps((opps.data || []).filter((o) => !o.isClosed).slice(0, 3));
        setFeaturedCourses((courses.data || []).slice(0, 3));
        setStats(statsRes.data);
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load featured content.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/opportunities?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/opportunities');
    }
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="home-hero__copy">
            <p className="home-hero__eyebrow">
              <span className="home-hero__eyebrow-dot" />
              For students building what comes next
            </p>

            <h1 className="home-hero__title">
              Your next opportunity
              <span> starts here.</span>
            </h1>

            <p className="home-hero__description">
              Find practical courses, internships, scholarships, and experiences that help
              turn what you are learning into what you can do.
            </p>

            <form onSubmit={handleSearch} className="home-hero__search">
              <div className="home-hero__search-field">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try “web development” or “internship”"
                  aria-label="Search opportunities"
                />
              </div>
              <button type="submit" className="btn btn-primary home-hero__search-button">
                Search
              </button>
            </form>

            <div className="home-hero__actions">
              <Link to="/opportunities" className="btn btn-primary btn-lg">
                Browse opportunities <ArrowRight size={16} />
              </Link>
              <Link to="/courses" className="home-hero__text-link">
                Explore courses
              </Link>
            </div>

            <p className="home-hero__note">
              Built for university students in South West Ethiopia and beyond.
            </p>
          </div>

          <div className="home-hero__visual">
            {!heroImageFailed && <img
              className="home-hero__photo"
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85"
              alt="University students studying and working together around a table"
              fetchpriority="high"
              onError={() => setHeroImageFailed(true)}
            />}
            <div className="home-hero__photo-shade" />
            <div className="home-hero__image-caption">
              <span className="home-hero__caption-kicker">Make your next move</span>
              <span className="home-hero__caption-title">Learn. Apply. Grow.</span>
            </div>
            <div className="home-hero__floating-note">
              <span className="home-hero__floating-icon">
                <Briefcase size={18} />
              </span>
              <span>
                <strong>Find your next step</strong>
                <small>Courses and opportunities in one place</small>
              </span>
            </div>
            <span className="home-hero__image-index">01 / DISCOVER</span>
          </div>
        </div>
      </section>

      {/* Real numbers from the database (shown only once they have loaded) */}
      {stats && (
        <section aria-label="Platform overview" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem 3rem', padding: '1.25rem 1rem' }}>
            {[
              [stats.openOpportunities, stats.openOpportunities === 1 ? 'open opportunity' : 'open opportunities'],
              [stats.courses, stats.courses === 1 ? 'course listed' : 'courses listed'],
            ].map(([n, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--primary)' }}>{n}</strong>{' '}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured opportunities */}
      <section style={{ padding: '3.5rem 0', background: 'var(--surface)' }}>
        <div className="container">
          <SampleNotice what="opportunities and courses on this page" />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Open opportunities</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Opportunities that are still open for applications
              </p>
            </div>
            <Link
              to="/opportunities"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
              }}
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading opportunities..." />
          ) : error ? (
            <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
          ) : featuredOpps.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>There are no open opportunities right now. Please check back soon.</p>
          ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {featuredOpps.map((opp, i) => (
              <Link
                key={opp.id}
                to={`/opportunities/${opp.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 16,
                  padding: '1.15rem 1.25rem',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  transition: 'background 150ms',
                  alignItems: 'center',
                }}
                className="opp-row"
              >
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.975rem' }}>{opp.title}</span>
                    <span className="badge badge-teal">{opp.type}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {opp.company} · {opp.location}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{opp.stipend}</span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '3.5rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>How CampusBridge works</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 480 }}>
            A straightforward path from discovery to application.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {steps.map((s) => (
              <div key={s.num}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    color: 'var(--teal-600)',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  {s.num}
                </span>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section style={{ padding: '3.5rem 0', background: 'var(--stone-100)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Learn something useful</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Courses to help you build practical skills
              </p>
            </div>
            <Link
              to="/courses"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
              }}
            >
              All courses <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading courses..." />
          ) : error ? null : featuredCourses.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>There are no courses yet. Please check back soon.</p>
          ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {featuredCourses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="card card-hover"
                style={{ padding: '1.25rem', display: 'block' }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <span className="badge badge-stone">{c.level}</span>
                  <span className="badge badge-stone">{c.duration}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, marginBottom: 6, lineHeight: 1.35 }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.instructor}</p>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Why use CampusBridge</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              { icon: BookOpen, title: 'Courses', text: 'Browse courses in technology, design, data, business and more.' },
              { icon: Briefcase, title: 'Internships & scholarships', text: 'Internship, scholarship and research opportunities posted by organisations.' },
              { icon: FileCheck, title: 'Tracking', text: 'See every application you submitted, with its status, in one place.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} style={{ display: 'flex', gap: 14 }}>
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
                <div>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 0 4rem' }}>
        <div className="container">
          <div
            style={{
              background: 'var(--teal-800)',
              color: 'white',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 1.75rem',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
                color: 'white',
                marginBottom: 8,
              }}
            >
              Start building your path
            </h2>
            <p style={{ opacity: 0.85, maxWidth: 400, margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              Create an account to apply for opportunities and keep track of your applications in one place.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <Link
                to="/register"
                className="btn"
                style={{ background: 'white', color: 'var(--teal-800)', fontWeight: 600 }}
              >
                Create account
              </Link>
              <Link
                to="/opportunities"
                className="btn"
                style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.35)' }}
              >
                Browse without signing up
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .opp-row:hover {
          background: var(--stone-50);
        }
      `}</style>
    </div>
  );
}
