import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getCourses } from '../services/api';
import useFilterOptions from '../hooks/useFilterOptions';
import useUrlFilters from '../hooks/useUrlFilters';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import SampleNotice from '../components/SampleNotice';

export default function Courses() {
  const { values, setValue, clearAll, isFiltered } = useUrlFilters(['search', 'category', 'level']);
  const { search, category, level } = values;
  const options = useFilterOptions();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const res = await getCourses({ search, category, level });
        if (!cancelled) setCourses(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load courses');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, category, level, reloadKey]);

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', marginBottom: '0.35rem' }}>Explore Courses</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse learning opportunities to build skills that support your studies and career.</p>
        </div>

        <SampleNotice what="courses" />

        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <SearchBar value={search} onChange={(v) => setValue('search', v)} placeholder="Search courses, instructors, or topics..." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <FilterChips label="Category" options={['All', ...options.courseCategories]} value={category} onChange={(v) => setValue('category', v)} />
            <FilterChips label="Level" options={['All', ...options.courseLevels]} value={level} onChange={(v) => setValue('level', v)} />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Finding courses..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description={isFiltered ? 'Nothing matches your search or filters. Try removing some of them.' : 'There are no courses yet. Please check back later.'}
            action={isFiltered ? <button type="button" className="btn btn-secondary btn-sm" onClick={clearAll}>Clear search and filters</button> : null}
          />
        ) : (
          <>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.15rem' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{courses.length}</strong> course{courses.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.35rem' }}>
              {courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
