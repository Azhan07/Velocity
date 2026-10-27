import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Logo from '../ui/Logo';
import { NAV_LINKS } from './Navbar';
import { DATA_NOTICE } from '../../data/cars';

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/[0.06] bg-carbon">
      {/* Giant outlined wordmark */}
      <div className="pointer-events-none select-none overflow-hidden whitespace-nowrap pt-10" aria-hidden="true">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((k) => (
            <span key={k} className="text-outline pr-12 font-display text-[18vw] font-black uppercase leading-none tracking-tighter">
              Velocity — Engineered to defy —&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="container-v grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo animate={false} />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-chrome">
            A cinematic concept experience. Feel the machine. Control the experience.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-5">Navigate</p>
          <ul className="space-y-3">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="group inline-flex items-center gap-1 text-sm text-silver hover:text-bone">
                  {l.label}
                  <ArrowUpRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5">Notes</p>
          <p className="text-sm leading-relaxed text-chrome">{DATA_NOTICE}</p>
          <p className="mt-4 text-sm leading-relaxed text-chrome">
            Reference 3D model: “Ferrari 458 Italia” by vicent091036 (via the three.js examples). Engine sound is synthesised in your browser.
          </p>
        </div>
      </div>
      <div className="container-v flex flex-col gap-2 border-t border-white/[0.06] py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-chrome sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Velocity Concept Studio</span>
        <span>Built with React · Three.js · GSAP</span>
      </div>
    </footer>
  );
}
