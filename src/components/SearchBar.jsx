import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  style = {},
}) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af',
          pointerEvents: 'none',
        }}
      />
      <input
        type="search"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: 42, paddingRight: value ? 40 : 16 }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            padding: 4,
            borderRadius: 6,
            color: '#9ca3af',
            display: 'flex',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
