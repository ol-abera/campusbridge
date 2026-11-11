export default function FilterChips({ options, value, onChange, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderRadius: 6,
                border: `1px solid ${active ? 'var(--teal-600)' : 'var(--border)'}`,
                background: active ? 'var(--teal-50)' : 'var(--surface)',
                color: active ? 'var(--teal-800)' : 'var(--text-secondary)',
                transition: 'all 140ms',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
