import { Link } from 'react-router-dom';
import { Award, BookOpen, Lock, Trophy } from 'lucide-react';
import { getProgress } from '../services/api';
import useLoad from '../hooks/useLoad';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

export default function MyLearning() {
  const state = useLoad(() => getProgress().then((r) => r.data));
  return (
    <PageShell
      title="My learning"
      subtitle="Your courses, progress, points and badges."
      action={<Link to="/leaderboard" className="btn btn-secondary btn-sm"><Trophy size={16} /> Leaderboard</Link>}
    >
      <AsyncView state={state} loadingText="Loading your progress...">
        {(p) => (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '1.75rem' }}>
              {[['Points', p.points], ['Courses', p.courses.length], ['Submissions', p.submissions], ['Applications', p.applications]].map(([label, value]) => (
                <div key={label} className="card" style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Badges</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: '2rem' }}>
              {p.badges.map((b) => (
                <div key={b.id} className="card" style={{ padding: '1rem', opacity: b.earned ? 1 : 0.55 }} aria-label={`${b.name}: ${b.earned ? 'earned' : 'locked'}`}>
                  <div style={{ color: b.earned ? 'var(--teal-700)' : 'var(--stone-400)', marginBottom: 6 }}>
                    {b.earned ? <Award size={24} aria-hidden="true" /> : <Lock size={24} aria-hidden="true" />}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{b.description}</div>
                  <div style={{ fontSize: '0.72rem', marginTop: 6, fontWeight: 600, color: b.earned ? 'var(--success)' : 'var(--text-muted)' }}>{b.earned ? 'Earned' : 'Locked'}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>My courses</h2>
            {p.courses.length === 0 ? (
              <EmptyState icon={BookOpen} title="You have not enrolled in a course yet" description="Enrol in a course to get assignments, track your progress and earn points."
                action={<Link to="/courses" className="btn btn-primary btn-sm">Browse courses</Link>} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {p.courses.map((c) => (
                  <Link key={c.id} to={`/courses/${c.id}`} className="card card-hover" style={{ padding: '1.1rem 1.2rem', display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                      <strong>{c.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.points} points</span>
                    </div>
                    <ProgressBar percent={c.percent} label={`${c.title} progress`} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      {c.totalAssignments === 0 ? 'No assignments yet' : `${c.submitted} of ${c.totalAssignments} assignments submitted (${c.percent}%), ${c.graded} graded`}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </AsyncView>
    </PageShell>
  );
}
