export default function ProgressBar({ percent = 0, label }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}
      style={{ height: 8, background: 'var(--stone-200)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${p}%`, height: '100%', background: 'var(--teal-600)', borderRadius: 999, transition: 'width 300ms' }} />
    </div>
  );
}
