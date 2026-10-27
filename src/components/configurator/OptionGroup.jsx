import { motion } from 'framer-motion';
import { Check, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../../utils/format';

/**
 * Generic option list used by the paint / wheel / interior selectors.
 * Renders as a radio group so it works with the keyboard (arrow keys + Tab).
 * When `supported` is false the options are disabled and an honest message is shown.
 */
export default function OptionGroup({ title, step, options, value, onChange, renderSwatch, supported = true, unsupportedText }) {
  return (
    <fieldset className="border-t border-white/[0.06] py-7" disabled={!supported}>
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-baseline justify-between" aria-hidden="true">
        <p className="font-display text-sm font-semibold uppercase tracking-wide">
          <span className="mr-3 font-mono text-[10px] text-racing">{step}</span>
          {title}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-chrome">{options.find((o) => o.id === value)?.name}</p>
      </div>

      {!supported && (
        <p className="mb-4 flex items-start gap-2 border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {unsupportedText}
        </p>
      )}

      <div className={`grid gap-2 ${renderSwatch === 'circle' ? 'grid-cols-5' : 'grid-cols-1'}`} role="radiogroup" aria-label={title}>
        {options.map((o) => {
          const active = o.id === value;
          if (renderSwatch === 'circle') {
            return (
              <label key={o.id} className={`group flex cursor-pointer flex-col items-center gap-2 ${!supported ? 'opacity-40' : ''}`}>
                <input type="radio" name={title} value={o.id} checked={active} onChange={() => onChange(o.id)} className="peer sr-only" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-racing sm:h-14 sm:w-14">
                  <span className="h-[80%] w-[80%] rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(255,255,255,0.25)] transition-transform duration-300 group-hover:scale-105" style={{ background: o.hex }} />
                  {active && (
                    <motion.span layoutId={`${title}-ring`} className="absolute inset-0 rounded-full border-2 border-racing" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </span>
                <span className="text-center font-mono text-[9px] uppercase leading-tight tracking-[0.12em] text-chrome">{o.name}</span>
              </label>
            );
          }
          return (
            <label key={o.id} className={`relative flex cursor-pointer items-center gap-4 border p-3.5 transition-colors ${active ? 'border-racing/70 bg-racing/[0.06]' : 'border-white/[0.07] hover:border-white/25'} ${!supported ? 'opacity-40' : ''}`}>
              <input type="radio" name={title} value={o.id} checked={active} onChange={() => onChange(o.id)} className="peer sr-only" />
              <span className="pointer-events-none absolute inset-0 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-racing" />
              {renderSwatch?.(o)}
              <span className="flex-1">
                <span className="block text-sm font-medium">{o.name}</span>
                <span className="block text-xs text-chrome">{o.description}</span>
              </span>
              <span className="font-mono text-[11px] text-silver">{o.price ? `+${formatPrice(o.price)}` : 'Included'}</span>
              {active && <Check size={14} className="text-racing" aria-hidden="true" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
