import { useEffect, useState, useCallback } from 'react';
import { getOpportunities } from '../services/api';
import { categories, opportunityTypes } from '../data/mockData';
import OpportunityCard from '../components/OpportunityCard';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { Briefcase } from 'lucide-react';

export default function Opportunities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOpportunities({ search, category, type });
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [search, category, type]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const oppCategories = ['All', 'Technology', 'Data Science', 'Design', 'Marketing', 'Research'];

  return (
    <div className="page-enter" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', marginBottom: '0.35rem' }}>
            Internships & Opportunities
          </h1>
          <p style={{ color: '#6b7280' }}>
            Find roles that match your skills and ambitions.
          </p>
        </div>

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
            placeholder="Search by title, company, or keyword..."
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
              options={oppCategories}
              value={category}
              onChange={setCategory}
            />
            <FilterChips
              label="Type"
              options={opportunityTypes}
              value={type}
              onChange={setType}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Searching opportunities..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No opportunities found"
            description="Try different filters or check back later for new postings."
          />
        ) : (
          <>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.15rem' }}>
              Showing <strong style={{ color: '#374151' }}>{items.length}</strong> opportunit{items.length !== 1 ? 'ies' : 'y'}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.35rem',
              }}
            >
              {items.map((item) => (
                <OpportunityCard key={item.id} opportunity={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
