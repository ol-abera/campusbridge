export default function FieldError({ message }) {
  if (!message) return null;
  return <p role="alert" style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: 4 }}>{message}</p>;
}
