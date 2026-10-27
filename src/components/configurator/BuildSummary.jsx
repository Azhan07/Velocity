import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Save } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import Counter from '../ui/Counter';

/** Live configuration summary + price breakdown. The total "rolls" to each new value. */
export default function BuildSummary({ car, build, onReset, onSave, editing }) {
  return (
    <section aria-labelledby="summary-title" className="border-t border-white/[0.06] py-7">
      <h2 id="summary-title" className="mb-5 font-display text-sm font-semibold uppercase tracking-wide">
        <span className="mr-3 font-mono text-[10px] text-racing">04</span>Your build
      </h2>
      <dl className="space-y-2.5 text-sm">
        {build.lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-4">
            <dt className="text-chrome">{l.label}</dt>
            <dd className="font-mono text-silver">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={l.value} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="inline-block">
                  {l.value ? formatPrice(l.value) : '—'}
                </motion.span>
              </AnimatePresence>
            </dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
          <dt className="text-chrome">Options total</dt>
          <dd className="font-mono">{formatPrice(build.options)}</dd>
        </div>
      </dl>
      <div className="mt-6 flex items-end justify-between border border-white/[0.07] bg-carbon p-5" aria-live="polite">
        <div>
          <p className="eyebrow">Estimated total</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-chrome/70">{car.name} · illustrative</p>
        </div>
        <p className="font-display text-2xl font-semibold tabular-nums sm:text-3xl">
          <Counter key={build.total} from={build.total - build.options} value={build.total} prefix="$" duration={0.8} />
        </p>
      </div>
      <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
        <button type="button" onClick={onReset} className="btn-ghost btn-sm" aria-label="Reset configuration">
          <RotateCcw size={13} /> Reset
        </button>
        <button type="button" onClick={onSave} className="btn-primary btn-sm sweep">
          <Save size={13} /> {editing ? 'Update saved build' : 'Save to garage'}
        </button>
      </div>
    </section>
  );
}
