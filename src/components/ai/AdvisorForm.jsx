import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { categories } from '../../data/cars';
import { FEATURES, PRIORITIES, STYLES } from '../../utils/localAdvisor';
import { formatPriceShort } from '../../utils/format';

export const DEFAULT_PREFS = { budget: 500000, category: 'any', style: 'weekend', priority: 'acceleration', features: [] };

function ChoiceGroup({ legend, step, options, value, onChange, multi = false }) {
  const isOn = (id) => (multi ? value.includes(id) : value === id);
  const toggle = (id) => (multi ? onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]) : onChange(id));
  return (
    <fieldset className="border-t border-white/[0.06] py-6">
      <legend className="mb-4 font-display text-sm font-semibold uppercase">
        <span className="mr-3 font-mono text-[10px] text-racing">{step}</span>
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.id} type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={isOn(o.id)} onClick={() => toggle(o.id)} className={`chip ${isOn(o.id) ? 'chip-active' : ''}`}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Five quick questions about the buyer. */
export default function AdvisorForm({ onSubmit, loading }) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const set = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(prefs);
      }}
      className="card p-6 sm:p-8"
    >
      <fieldset className="pb-6">
        <legend className="mb-4 flex w-full items-baseline justify-between font-display text-sm font-semibold uppercase">
          <span><span className="mr-3 font-mono text-[10px] text-racing">01</span>Budget</span>
          <span className="font-display text-2xl normal-case">{formatPriceShort(prefs.budget)}</span>
        </legend>
        <label>
          <span className="sr-only">Maximum budget in US dollars</span>
          <input type="range" min="150000" max="3000000" step="25000" value={prefs.budget} onChange={(e) => set('budget')(Number(e.target.value))} className="w-full" />
        </label>
        <div className="mt-1 flex justify-between font-mono text-[9px] text-chrome"><span>$150K</span><span>$3M</span></div>
      </fieldset>
      <ChoiceGroup legend="Category" step="02" options={[{ id: 'any', label: 'Any' }, ...categories.map((c) => ({ id: c, label: c }))]} value={prefs.category} onChange={set('category')} />
      <ChoiceGroup legend="Driving style" step="03" options={STYLES} value={prefs.style} onChange={set('style')} />
      <ChoiceGroup legend="Top priority" step="04" options={PRIORITIES} value={prefs.priority} onChange={set('priority')} />
      <ChoiceGroup legend="Preferred features" step="05" options={FEATURES} value={prefs.features} onChange={set('features')} multi />
      <button type="submit" disabled={loading} className="btn-primary sweep mt-4 w-full disabled:opacity-60">
        <Sparkles size={14} /> {loading ? 'Finding your match…' : 'Find my car'}
      </button>
    </form>
  );
}
