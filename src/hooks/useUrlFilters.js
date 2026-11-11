import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// Keeps search/filter values in the page address (?search=python&category=Design)
// so links can be shared, the back button works, and the homepage search can pre-fill them.
export default function useUrlFilters(keys) {
  const [params, setParams] = useSearchParams();
  const values = Object.fromEntries(keys.map((k) => [k, params.get(k) || (k === 'search' ? '' : 'All')]));

  const setValue = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === 'All') next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });
  }, [setParams]);

  const clearAll = useCallback(() => setParams({}, { replace: true }), [setParams]);
  const isFiltered = keys.some((k) => values[k] && values[k] !== 'All');
  return { values, setValue, clearAll, isFiltered };
}
