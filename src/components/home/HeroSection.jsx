import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Magnetic from '../ui/Magnetic';

/**
 * Hero text layer that sits on top of the 3D car.
 * GSAP (in Home.jsx) animates the elements marked with data-hero.
 */
const HeroSection = forwardRef(function HeroSection(_, ref) {
  const words = ['ENGINEERED', 'TO', 'DEFY.'];
  return (
    <div ref={ref} className="relative flex h-screen min-h-[640px] flex-col justify-end pb-14 sm:pb-20">
      <div className="container-v">
        <p data-hero="eyebrow" className="eyebrow-red mb-6 flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 animate-pulseRed rounded-full bg-racing" />
          VX-1 Apex · 2027 concept
        </p>

        <h1 className="max-w-[14ch] text-[13vw] font-black uppercase leading-[0.86] tracking-[-0.03em] sm:text-[9vw] lg:text-[7.4vw]">
          {words.map((w, i) => (
            <span key={w} className="mask mr-[0.22em]">
              <span data-hero="word" className={i === 2 ? 'text-racing' : ''}>
                {w}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p data-hero="sub" className="max-w-md text-base leading-relaxed text-silver sm:text-lg">
              Discover the next generation of automotive performance.
            </p>
            <div data-hero="cta" className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <Link to="/explore" className="btn-primary sweep" data-cursor="Go">
                  Explore the Collection <ArrowRight size={14} />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link to="/showroom" className="btn-ghost sweep" data-cursor="Enter">
                  Enter the Showroom
                </Link>
              </Magnetic>
            </div>
          </div>

          {/* Mini spec readout */}
          <dl data-hero="specs" className="grid grid-cols-3 gap-6 border-l border-white/10 pl-6 sm:gap-10">
            {[
              ['1,214', 'hp'],
              ['2.3', 's · 0–100'],
              ['402', 'km/h'],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-xl font-semibold sm:text-2xl">{v}</dd>
                <dd className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-chrome">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-hero="scroll" className="mt-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-ultra text-chrome">
          <ChevronDown size={14} className="animate-bounce" /> Scroll to start the engine
        </div>
      </div>
    </div>
  );
});

export default HeroSection;
