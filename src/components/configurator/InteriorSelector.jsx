import OptionGroup from './OptionGroup';
import { interiors } from '../../data/cars';

function InteriorSwatch({ o }) {
  return (
    <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-white/10" aria-hidden="true">
      <span className="h-full w-1/2" style={{ background: o.leather }} />
      <span className="flex h-full w-1/2 flex-col">
        <span className="h-1/2" style={{ background: o.trim }} />
        <span className="h-1/2" style={{ background: o.panel }} />
      </span>
    </span>
  );
}

export default function InteriorSelector({ value, onChange, supported }) {
  return (
    <OptionGroup
      title="Interior"
      step="03"
      options={interiors}
      value={value}
      onChange={onChange}
      renderSwatch={(o) => <InteriorSwatch o={o} />}
      supported={supported}
      unsupportedText="This model has no separate interior materials, so cabin themes cannot be shown."
    />
  );
}
