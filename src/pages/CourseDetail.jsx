import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, CheckCircle2, User } from 'lucide-react';
import { getCourseById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import SampleNotice from '../components/SampleNotice';
import CourseLearning from '../components/CourseLearning';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCourseById(id)
      .then((res) => { if (!cancelled) setCourse(res.data); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, reloadKey]);

  if (loading) return <LoadingSpinner size="lg" text="Loading course..." />;
  if (error || !course) {
    const notFound = error?.status === 404;
    return (
      <div style={{ padding: '3rem 0' }}>
        <ErrorState
          title={notFound ? 'Course not found' : 'Could not load this course'}
          message={notFound ? 'This course does not exist or may have been removed.' : error?.message}
          onRetry={notFound ? undefined : () => setReloadKey((k) => k + 1)}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/courses" className="btn btn-secondary btn-sm"><ArrowLeft size={16} /> Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="course-detail-grid">
          <div style={{ minWidth: 0 }}>
            <SampleNotice what="course details" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-teal">{course.category}</span>
              <span className="badge badge-stone">{course.level}</span>
              {course.tags?.map((t) => (
                <span key={t} className="badge" style={{ background: '#f3f4f6', color: 'var(--text-secondary)' }}>{t}</span>
              ))}
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', marginBottom: '0.5rem' }}>{course.title}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={16} aria-hidden="true" /> Instructor: <strong style={{ color: 'var(--text)' }}>{course.instructor}</strong>
            </p>
            {course.duration && (
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
                <Clock size={16} aria-hidden="true" /> {course.duration}
              </p>
            )}

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>About this course</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{course.description}</p>
            </div>

            {course.syllabus?.length > 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={20} style={{ color: 'var(--teal-600)' }} aria-hidden="true" /> Topics covered
                </h2>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {course.syllabus.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <CourseLearning courseId={course.id} />
          </div>

          <aside>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Course details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div className="detail-row"><span>Level</span><strong>{course.level}</strong></div>
                <div className="detail-row"><span>Category</span><strong>{course.category}</strong></div>
                {course.duration && <div className="detail-row"><span>Duration</span><strong>{course.duration}</strong></div>}
              </div>
              <p className="muted-box" style={{ marginTop: '1.25rem' }}>
                Enrol to get assignments, submit your work, receive grades and earn points and badges. Certificates are not offered.
              </p>
              <Link to={`/opportunities?category=${encodeURIComponent(course.category)}`} className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                Related opportunities
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <style>{`@media (min-width: 900px) { .course-detail-grid { grid-template-columns: minmax(0, 1fr) 320px !important; } }`}</style>
    </div>
  );
}
