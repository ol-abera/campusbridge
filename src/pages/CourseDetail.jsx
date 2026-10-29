import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  BookOpen,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { getCourseById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getCourseById(id);
        setCourse(res.data);
      } catch (err) {
        setError(err.message || 'Course not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" text="Loading course..." />;
  if (error || !course) {
    return (
      <div style={{ padding: '3rem 0' }}>
        <ErrorState
          title="Course not found"
          message={error || 'This course may have been removed.'}
          onRetry={() => window.location.reload()}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/courses" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <Link
          to="/courses"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#7c3aed',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
          }}
          className="course-detail-grid"
        >
          {/* Main content */}
          <div>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: '1.5rem', aspectRatio: '21/9', background: '#f5f3ff' }}>
              <img
                src={course.image}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-lavender">{course.category}</span>
              <span className="badge badge-blue">{course.level}</span>
              {course.tags?.map((t) => (
                <span key={t} className="badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>
                  {t}
                </span>
              ))}
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', marginBottom: '0.5rem' }}>
              {course.title}
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.25rem' }}>
              Taught by <strong style={{ color: '#374151' }}>{course.instructor}</strong>
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginBottom: '1.75rem',
                fontSize: '0.9rem',
                color: '#6b7280',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={16} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                {course.rating} ({course.reviews} reviews)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} />
                {course.students.toLocaleString()} students
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} />
                {course.duration}
              </span>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>About this course</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.7 }}>{course.description}</p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} style={{ color: '#8b5cf6' }} />
                What you'll learn
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {course.syllabus?.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#374151' }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div
              className="card"
              style={{
                padding: '1.5rem',
                position: 'sticky',
                top: 90,
              }}
            >
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#7c3aed',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {course.price}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}>
                Enroll Now
              </button>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
                Free access · Learn at your own pace
              </p>
              <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '1.25rem 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: '#4b5563' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Level</span>
                  <strong>{course.level}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Duration</span>
                  <strong>{course.duration}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Students</span>
                  <strong>{course.students.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rating</span>
                  <strong>{course.rating} ★</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .course-detail-grid {
            grid-template-columns: 1fr 320px !important;
          }
        }
      `}</style>
    </div>
  );
}
