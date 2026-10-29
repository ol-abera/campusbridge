import { Link } from 'react-router-dom';
import { Star, Users, Clock, BookOpen } from 'lucide-react';

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="card card-interactive"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#f5f3ff' }}>
        <img
          src={course.image}
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="badge badge-lavender">{course.level}</span>
        </div>
      </div>

      <div style={{ padding: '1.15rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#8b5cf6' }}>{course.category}</span>
        </div>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            marginBottom: '0.35rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {course.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.85rem' }}>
          {course.instructor}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 'auto', fontSize: '0.8rem', color: '#6b7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={14} style={{ color: '#f59e0b' }} fill="#f59e0b" />
            {course.rating}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={14} />
            {course.students.toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} />
            {course.duration}
          </span>
        </div>
      </div>
    </Link>
  );
}
