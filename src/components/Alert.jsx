const styles = {
  error: { background: '#fef2f2', color: '#b91c1c' },
  success: { background: '#ecfdf5', color: '#047857' },
  info: { background: '#fffbeb', color: '#92400e' },
};

export default function Alert({ type = 'error', children, style }) {
  if (!children) return null;
  return (
    <div role={type === 'error' ? 'alert' : 'status'} style={{ ...styles[type], padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}
