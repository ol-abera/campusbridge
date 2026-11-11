import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', style = {} }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <Search
        size={17}
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--stone-400)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="search"
        aria-label={placeholder}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: 38, paddingRight: value ? 36 : 12 }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            padding: 4,
            borderRadius: 4,
            color: 'var(--stone-400)',
            display: 'flex',
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
