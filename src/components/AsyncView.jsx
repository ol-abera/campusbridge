import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';

// Shows a spinner while loading and an error with "Try again" if loading failed; otherwise the children.
export default function AsyncView({ state, loadingText = 'Loading...', children }) {
  if (state.loading) return <LoadingSpinner size="lg" text={loadingText} />;
  if (state.error) {
    return <ErrorState title="Could not load this page" message={state.error.message} onRetry={state.error.status === 403 || state.error.status === 404 ? undefined : state.reload} />;
  }
  return children(state.data);
}
