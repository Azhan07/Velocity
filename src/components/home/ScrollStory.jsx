import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * The four story chapters that scroll over the pinned 3D car.
 * Each chapter is one screen tall; GSAP reveals the [data-reveal] elements
 * and counts up the [data-count] numbers in sync with the camera.
 */
export const CHAPTERS = [
  {
    id: 'light',
    index: '01',
    eyebrow: 'Laser matrix optics',
    title: 'Eyes of the machine.',
    text: 'Eighty-four individually addressable LEDs paint the road ahead and carve shadows around oncoming traffic. Light, engineered.',
    stats: [
      { value: 600, suffix: ' m', label: 'High-beam reach' },
      { value: 84, label: 'LED segments' },
    ],
    side: 'left',
  },
  {
    id: 'air',
    index: '02',
    eyebrow: 'Aerodynamics',
    title: 'Shaped by air.',
    text: 'Every surface is a decision. Underbody tunnels and an active wing generate grip at speed without ruining the silhouette.',
    stats: [
      { value: 0.29, decimals: 2, label: 'Drag coefficient' },
      { value: 860, suffix: ' kg', label: 'Downforce @ 250' },
    ],
    side: 'right',
  },
  {
    id: 'power',
    index: '03',
    eyebrow: 'Hybrid powertrain',
    title: 'Fire behind you.',
    text: 'A twin-turbo V8 and three electric motors deliver instant torque to all four wheels. Push the throttle — the horizon arrives.',
    stats: [
      { value: 1214, label: 'Horsepower' },
      { value: 2.3, decimals: 1, suffix: ' s', label: '0–100 km/h' },
      { value: 402, suffix: ' km/h', label: 'Top speed' },
    ],
    side: 'left',
  },
  {
    id: 'control',
    index: '04',
    eyebrow: 'Your build',
    title: 'Total control.',
    text: 'Paint, wheels, cabin. Configure your VX-1 in real-time 3D and save it to your garage.',
    cta: true,
    side: 'right',
  },
];

export default function ScrollStory() {
  return (
    <>
      {CHAPTERS.map((c) => (
        <section
          key={c.id}
          data-chapter={c.id}
          className="relative flex h-screen min-h-[620px] items-center"
          aria-labelledby={`ch-${c.id}`}
        >
          <div className={`container-v flex ${c.side === 'right' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-md">
              <p data-reveal className="eyebrow mb-5 flex items-center gap-3">
                <span className="text-racing">{c.index}</span>
                <span className="h-px w-8 bg-white/25" />
                {c.eyebrow}
              </p>
              <h2 id={`ch-${c.id}`} className="text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl">
                <span className="mask">
                  <span data-reveal-title>{c.title}</span>
                </span>
              </h2>
              <p data-reveal className="mt-6 text-base leading-relaxed text-silver">
                {c.text}
              </p>
              {c.stats && (
                <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-white/10 pt-6">
                  {c.stats.map((s) => (
                    <div key={s.label} data-reveal>
                      <dd
                        className="stat-num"
                        data-count={s.value}
                        data-decimals={s.decimals || 0}
                        data-suffix={s.suffix || ''}
                      >
                        {s.value.toLocaleString('en-US', { minimumFractionDigits: s.decimals || 0 })}
                        {s.suffix}
                      </dd>
                      <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-chrome">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              )}
              {c.cta && (
                <div data-reveal className="mt-10 flex flex-wrap gap-3">
                  <Link to="/configurator/velocity-vx1" className="btn-primary sweep" data-cursor="Build">
                    Configure yours <ArrowRight size={14} />
                  </Link>
                  <Link to="/cars/velocity-vx1" className="btn-ghost">Full specs</Link>
                </div>
              )}
              <p data-reveal className="mt-8 font-mono text-[9px] uppercase tracking-[0.2em] text-chrome/70">
                Concept figures · illustrative
              </p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
