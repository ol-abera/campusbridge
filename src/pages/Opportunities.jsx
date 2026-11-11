import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { getOpportunities } from '../services/api';
import useFilterOptions from '../hooks/useFilterOptions';
import useUrlFilters from '../hooks/useUrlFilters';
import OpportunityCard from '../components/OpportunityCard';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import SampleNotice from '../components/SampleNotice';

export default function Opportunities() {
  const { values, setValue, clearAll, isFiltered } = useUrlFilters(['search', 'category', 'type']);
  const { search, category, type } = values;
  const options = useFilterOptions();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Wait 300 ms after the last keystroke so we do not call the API on every letter.
    const timer = setTimeout(async () => {
      try {
        const res = await getOpportunities({ search, category, type });
        if (!cancelled) setItems(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load opportunities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, category, type, reloadKey]);

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', marginBottom: '0.35rem' }}>Internships, Scholarships & Opportunities</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find internships, scholarships and research roles that match your skills and ambitions.</p>
        </div>

        <SampleNotice what="opportunities" />

        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <SearchBar value={search} onChange={(v) => setValue('search', v)} placeholder="Search by title, company, or keyword..." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <FilterChips label="Category" options={['All', ...options.opportunityCategories]} value={category} onChange={(v) => setValue('category', v)} />
            <FilterChips label="Type" options={['All', ...options.opportunityTypes]} value={type} onChange={(v) => setValue('type', v)} />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Searching opportunities..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No opportunities found"
            description={isFiltered ? 'Nothing matches your search or filters. Try removing some of them.' : 'There are no opportunities yet. Please check back later.'}
            action={isFiltered ? <button type="button" className="btn btn-secondary btn-sm" onClick={clearAll}>Clear search and filters</button> : null}
          />
        ) : (
          <>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.15rem' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{items.length}</strong> opportunit{items.length !== 1 ? 'ies' : 'y'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.35rem' }}>
              {items.map((item) => <OpportunityCard key={item.id} opportunity={item} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
