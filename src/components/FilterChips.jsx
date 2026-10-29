export default function FilterChips({ options, value, onChange, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {label && (
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {label}
        </span>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                borderRadius: 999,
                border: `1.5px solid ${active ? '#a78bfa' : '#e5e7eb'}`,
                background: active ? '#f5f3ff' : 'white',
                color: active ? '#7c3aed' : '#4b5563',
                transition: 'all 180ms',
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
