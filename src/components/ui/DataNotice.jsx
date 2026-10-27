import { Info } from 'lucide-react';
import { DATA_NOTICE } from '../../data/cars';

/** Small label reminding users that specs and prices are illustrative. */
export default function DataNotice({ className = '', text = DATA_NOTICE }) {
  return (
    <p className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-chrome ${className}`}>
      <Info size={12} className="shrink-0 text-racing" aria-hidden="true" />
      {text}
    </p>
  );
}
