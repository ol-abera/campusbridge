import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { getInstructorCourses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useLoad from '../hooks/useLoad';
import PageShell from '../components/PageShell';
import AsyncView from '../components/AsyncView';
import EmptyState from '../components/EmptyState';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const state = useLoad(() => getInstructorCourses().then((r) => r.data));
  return (
    <PageShell title={`Welcome, ${user.fullName.split(' ')[0]}`} subtitle="Your courses, enrolled students and submissions waiting for grading.">
      <AsyncView state={state} loadingText="Loading your courses...">
        {(courses) => courses.length === 0 ? (
          <EmptyState icon={BookOpen} title="You are not teaching any course yet" description="Courses are assigned to instructors by an administrator." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {courses.map((c) => (
              <Link key={c.id} to={`/instructor/courses/${c.id}`} className="card card-hover" style={{ padding: '1.25rem', display: 'block' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-teal">{c.category}</span><span className="badge badge-stone">{c.level}</span>
                </div>
                <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>{c.title}</h2>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span><strong>{c.students}</strong> students</span>
                  <span><strong>{c.assignments}</strong> assignments</span>
                  {c.pendingSubmissions > 0 && <span className="badge badge-warning">{c.pendingSubmissions} to grade</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </AsyncView>
    </PageShell>
  );
}
