import { Link } from 'react-router-dom';
import {
  BookOpen,
  Briefcase,
  FileText,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Curated Courses',
    description: 'Discover high-quality courses across tech, design, business, and more — all free to explore.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: Briefcase,
    title: 'Real Opportunities',
    description: 'Browse internships and research roles from companies and labs that value student talent.',
    color: '#ec4899',
    bg: '#fdf2f8',
  },
  {
    icon: FileText,
    title: 'Easy Applications',
    description: 'Apply in minutes and track every application in one beautiful dashboard.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
];

const stats = [
  { value: '50+', label: 'Courses', icon: BookOpen },
  { value: '120+', label: 'Opportunities', icon: Briefcase },
  { value: '5k+', label: 'Students', icon: Users },
  { value: '4.8', label: 'Avg Rating', icon: Star },
];

export default function Landing() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '4rem 0 5rem',
          background: 'linear-gradient(160deg, #fefdfb 0%, #f5f3ff 40%, #fdf2f8 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -60,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,168,212,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.9rem',
              background: 'white',
              borderRadius: 999,
              border: '1px solid #ede9fe',
              boxShadow: '0 2px 8px rgba(139,92,246,0.08)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#7c3aed',
            }}
          >
            <Sparkles size={15} />
            Built for ambitious students
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Your bridge to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              academic excellence
            </span>{' '}
            & career growth
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#6b7280',
              maxWidth: 540,
              margin: '0 auto 2rem',
              lineHeight: 1.65,
            }}
          >
            Discover courses, land internships, and track applications — all in one beautiful platform designed for students like you.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center' }}>
            <Link to="/courses" className="btn btn-primary btn-lg">
              Explore Courses
              <ArrowRight size={18} />
            </Link>
            <Link to="/opportunities" className="btn btn-secondary btn-lg">
              Browse Internships
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1.25rem',
              maxWidth: 640,
              margin: '3.5rem auto 0',
            }}
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '1.15rem 0.75rem',
                  border: '1px solid #f3e8ff',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.06)',
                }}
              >
                <div style={{ color: '#a78bfa', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}>
                  <Icon size={20} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#374151' }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', marginBottom: '0.6rem' }}>
              Everything you need to succeed
            </h2>
            <p style={{ color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>
              From learning new skills to landing your dream internship — CampusBridge has you covered.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="card"
                style={{ padding: '1.75rem', textAlign: 'center' }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: bg,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.15rem',
                  }}
                >
                  <Icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.925rem', lineHeight: 1.6 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 0 5rem' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #ec4899 100%)',
              borderRadius: 24,
              padding: '3rem 2rem',
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <Zap size={32} style={{ marginBottom: '1rem', opacity: 0.9 }} />
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'white', marginBottom: '0.6rem' }}>
              Ready to take the next step?
            </h2>
            <p style={{ opacity: 0.9, maxWidth: 420, margin: '0 auto 1.5rem', fontSize: '1.05rem' }}>
              Join thousands of students already using CampusBridge to grow their skills and careers.
            </p>
            <Link
              to="/dashboard"
              className="btn"
              style={{
                background: 'white',
                color: '#7c3aed',
                fontWeight: 600,
                padding: '0.9rem 1.75rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
