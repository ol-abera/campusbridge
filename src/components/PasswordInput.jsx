import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Password field with a show/hide button.
export default function PasswordInput({ id, name, value, onChange, placeholder, autoComplete, invalid = false }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className="input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        style={{ paddingRight: 42 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: 6, display: 'flex', color: 'var(--stone-500)', borderRadius: 6 }}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
