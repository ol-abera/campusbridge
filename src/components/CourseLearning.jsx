import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, GraduationCap } from 'lucide-react';
import { enrollInCourse, getCourseAssignments, getEnrollment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useLoad from '../hooks/useLoad';
import { formatDate } from '../utils/format';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

// Enrolment and assignments for one course, shown on the course page. What you see depends on your role.
export default function CourseLearning({ courseId }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const status = useLoad(() => (isAuthenticated ? getEnrollment(courseId) : Promise.resolve({ enrolled: false, manages: false })), [courseId, isAuthenticated]);
  const showList = status.data && (status.data.enrolled || status.data.manages);
  const list = useLoad(() => (showList ? getCourseAssignments(courseId).then((r) => r.data) : Promise.resolve([])), [courseId, showList]);

  async function enrol() {
    setBusy(true); setError('');
    try { await enrollInCourse(courseId); } catch (err) { if (err.status !== 409) setError(err.message); }
    setBusy(false);
    status.reload();
  }

  const box = { padding: '1.5rem', marginTop: '1.5rem' };
  if (status.loading) return <div className="card" style={box}><LoadingSpinner text="Checking enrolment..." /></div>;
  if (status.error) return <div className="card" style={box}><Alert>{status.error.message}</Alert></div>;

  if (!isAuthenticated) {
    return (
      <div className="card" style={box}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: 6 }}>Learn on CampusBridge</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>Log in as a student to enrol, complete assignments and earn points.</p>
        <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary btn-sm">Log in to enrol</Link>
      </div>
    );
  }
  if (user.role === 'coordinator') return null;
  if (user.role === 'instructor' && !status.data.manages) return null;
  if (user.role === 'instructor') {
    return (
      <div className="card" style={box}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: 6 }}>You teach this course</h2>
        <Link to={`/instructor/courses/${courseId}`} className="btn btn-primary btn-sm"><ClipboardList size={16} /> Manage assignments</Link>
      </div>
    );
  }

  if (!status.data.enrolled) {
    return (
      <div className="card" style={box}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: 6 }}>Enrol in this course</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>Enrol to see the assignments, submit your work, get graded and earn points.</p>
        <Alert>{error}</Alert>
        <button type="button" className="btn btn-primary btn-sm" onClick={enrol} disabled={busy}><GraduationCap size={16} /> {busy ? 'Enrolling...' : 'Enrol now'}</button>
      </div>
    );
  }

  return (
    <div className="card" style={box}>
      <h2 style={{ fontSize: '1.15rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={20} style={{ color: 'var(--teal-600)' }} aria-hidden="true" /> Assignments</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, marginBottom: 12 }}>You are enrolled. <Link to="/my-learning" style={{ color: 'var(--primary)' }}>See my progress</Link></p>
      {list.loading ? <LoadingSpinner text="Loading assignments..." /> : list.error ? <Alert>{list.error.message}</Alert> : list.data.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No assignments have been posted yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.data.map((a) => (
            <Link key={a.id} to={`/assignments/${a.id}`} className="card card-hover" style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{a.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.maxPoints} points{a.dueDate ? ` · due ${formatDate(a.dueDate)}` : ''}</div>
              </div>
              {a.submission
                ? (a.submission.grade === null ? <span className="badge badge-warning">Submitted</span> : <span className="badge badge-success">{a.submission.grade}/{a.maxPoints}</span>)
                : a.isOverdue ? <span className="badge badge-stone">Closed</span> : <span className="badge badge-teal">To do</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
