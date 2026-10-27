import OptionGroup from './OptionGroup';
import { wheels } from '../../data/cars';

/** Tiny wheel icon tinted with the rim colour */
function WheelSwatch({ o }) {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#0b0b0c" />
      <circle cx="20" cy="20" r="14" fill="none" stroke={o.hex} strokeWidth="3" />
      {Array.from({ length: o.id === 'forged' ? 5 : 10 }, (_, i) => {
        const n = o.id === 'forged' ? 5 : 10;
        const a = (i / n) * Math.PI * 2;
        return <line key={i} x1={20 + Math.cos(a) * 4} y1={20 + Math.sin(a) * 4} x2={20 + Math.cos(a) * 13} y2={20 + Math.sin(a) * 13} stroke={o.hex} strokeWidth={o.id === 'forged' ? 3 : 1.5} />;
      })}
      {o.accent && <path d="M8 26 A14 14 0 0 1 8 14" stroke={o.accent} strokeWidth="3" fill="none" />}
      <circle cx="20" cy="20" r="3" fill={o.hex} />
    </svg>
  );
}

export default function WheelSelector({ value, onChange, supported }) {
  return (
    <OptionGroup
      title="Wheels"
      step="02"
      options={wheels}
      value={value}
      onChange={onChange}
      renderSwatch={(o) => <WheelSwatch o={o} />}
      supported={supported}
      unsupportedText="This model's rims are not separate parts, so wheel styles cannot be shown."
    />
  );
}
