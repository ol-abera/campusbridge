import { Info } from 'lucide-react';
import { SHOW_SAMPLE_DATA_NOTICE } from '../config';

// Honest labelling: the listings that ship with the project are demonstration data.
export default function SampleNotice({ what = 'listings' }) {
  if (!SHOW_SAMPLE_DATA_NOTICE) return null;
  return (
    <p style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--stone-100)', borderRadius: 8, padding: '0.55rem 0.8rem', marginBottom: '1.25rem' }}>
      <Info size={15} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
      <span>The {what} shown here are sample data for demonstration. They are not real offers.</span>
    </p>
  );
}
