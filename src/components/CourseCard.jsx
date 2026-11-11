import { Link } from 'react-router-dom';
import { BookOpen, Clock } from 'lucide-react';

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="card card-hover"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
    >
      {/* A coloured header instead of a photo: always loads, works offline, no broken images. */}
      <div style={{ height: 84, background: 'linear-gradient(135deg, var(--teal-700), var(--teal-500))', color: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.15rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{course.category}</span>
        <BookOpen size={26} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div style={{ padding: '1rem 1.15rem 1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: 6 }}>
          <span className="badge badge-teal">{course.level}</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.975rem', fontWeight: 600, marginBottom: 4, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{course.instructor}</p>
        {course.duration && (
          <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} aria-hidden="true" /> {course.duration}
          </div>
        )}
      </div>
    </Link>
  );
}
