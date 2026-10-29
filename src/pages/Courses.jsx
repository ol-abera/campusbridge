import { useEffect, useState, useCallback } from 'react';
import { getCourses } from '../services/api';
import { categories, levels } from '../data/mockData';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { BookOpen } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCourses({ search, category, level });
      setCourses(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [search, category, level]);

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', marginBottom: '0.35rem' }}>
            Explore Courses
          </h1>
          <p style={{ color: '#6b7280' }}>
            Level up your skills with carefully curated courses.
          </p>
        </div>

        {/* Filters */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem',
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search courses, instructors, or topics..."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <FilterChips
              label="Category"
              options={categories.filter((c) =>
                ['All', 'Computer Science', 'Design', 'Data Science', 'Mobile Development', 'Business'].includes(c)
              )}
              value={category}
              onChange={setCategory}
            />
            <FilterChips
              label="Level"
              options={levels}
              value={level}
              onChange={setLevel}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner size="lg" text="Finding the best courses..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCourses} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.15rem' }}>
              Showing <strong style={{ color: '#374151' }}>{courses.length}</strong> course{courses.length !== 1 ? 's' : ''}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.35rem',
              }}
            >
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
