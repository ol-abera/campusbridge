import { useEffect, useState } from 'react';

// Loads data when the page opens (and again when `deps` change or reload() is called).
// Returns { data, loading, error, reload }. Ignores answers that arrive after the page was left.
export default function useLoad(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [key, setKey] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((error) => { if (!cancelled) setState({ data: null, loading: false, error }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, key]);
  return { ...state, reload: () => setKey((k) => k + 1) };
}
