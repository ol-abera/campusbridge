import { useEffect, useState } from 'react';
import { getFilterOptions } from '../services/api';

// Loads the real category/level/type values from the database for the filter chips.
// If the request fails the chips simply show "All" (the list itself will show its own error).
export default function useFilterOptions() {
  const [options, setOptions] = useState({ courseCategories: [], courseLevels: [], opportunityCategories: [], opportunityTypes: [] });
  useEffect(() => {
    let cancelled = false;
    getFilterOptions().then((res) => { if (!cancelled) setOptions(res); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return options;
}
