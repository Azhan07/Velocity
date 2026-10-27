import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { cars } from '../../data/cars';
import CarImage from '../cars/CarImage';
import SectionHeading from '../ui/SectionHeading';
import { formatPriceShort } from '../../utils/format';
import useReducedMotion from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Horizontal "pit lane" gallery: on desktop, vertical scrolling moves the cards sideways
 * (GSAP pin + scrub). On mobile/reduced-motion it becomes a normal swipeable row.
 */
export default function FeaturedCars() {
  const section = useRef(null);
  const track = useRef(null);
  const reduced = useReducedMotion();
  const featured = cars.slice(0, 6);

  useEffect(() => {
    if (reduced) return undefined;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const distance = () => track.current.scrollWidth - window.innerWidth + 96;
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
      // Each card's image drifts slightly slower than the card (parallax)
      track.current.querySelectorAll('[data-parallax]').forEach((img) => {
        gsap.fromTo(img, { xPercent: 12 }, { xPercent: -12, ease: 'none', scrollTrigger: { trigger: img, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <section ref={section} className="relative overflow-hidden bg-void py-20 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0">
      <div className="container-v mb-12 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading index="05" eyebrow="The collection" title="Ten machines. One obsession." />
        <Link to="/explore" className="btn-ghost self-start lg:self-auto">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div ref={track} className="flex snap-x gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:overflow-visible lg:px-12">
        {featured.map((car, i) => (
          <Link
            key={car.id}
            to={`/cars/${car.id}`}
            data-cursor="View"
            className="group relative w-[82vw] shrink-0 snap-start overflow-hidden border border-white/[0.06] bg-graphite sm:w-[60vw] lg:w-[38vw]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(ellipse_at_50%_85%,#202024_0%,#0b0b0c_70%)]">
              <span className="absolute left-5 top-5 font-display text-6xl font-black text-white/[0.05]">{String(i + 1).padStart(2, '0')}</span>
              <div data-parallax className="absolute inset-0">
                <CarImage paint={car.defaultPaint} angle={i % 2 ? 'side' : 'front'} alt={`${car.name} render`} className="h-full w-full object-contain p-6 transition-transform duration-700 ease-cine group-hover:scale-[1.06]" />
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 p-6">
              <div>
                <p className="eyebrow">{car.brand} · {car.category}</p>
                <h3 className="mt-2 text-2xl font-semibold uppercase">{car.name}</h3>
                <p className="mt-1 text-sm text-chrome">{car.tagline}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl">{car.hp.toLocaleString()}<span className="ml-1 text-xs text-chrome">hp</span></p>
                <p className="mt-1 font-mono text-[10px] text-chrome">{formatPriceShort(car.price)}</p>
              </div>
            </div>
            <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-racing transition-transform duration-500 ease-cine group-hover:scale-x-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
