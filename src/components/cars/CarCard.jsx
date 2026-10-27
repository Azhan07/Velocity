import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { Heart, Eye, ArrowUpRight } from 'lucide-react';
import CarImage from './CarImage';
import { useGarage } from '../../context/GarageContext';
import { formatPriceShort } from '../../utils/format';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Collection card with a 3D tilt that follows the pointer and a moving light glare.
 * Hovering swaps the front 3/4 render for the side profile (image transition).
 */
export default function CarCard({ car, index = 0, onQuickView, layout = 'grid' }) {
  const { isFavorite, toggleFavorite } = useGarage();
  const fav = isFavorite(car.id);
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(500px circle at ${gx}% ${gy}%, rgba(255,255,255,0.09), transparent 45%)`;

  const onMove = (e) => {
    if (reduced || e.pointerType === 'touch') return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 10);
    rx.set(-(py - 0.5) * 8);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const wide = layout === 'gallery';

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={`group card overflow-hidden ${wide ? 'grid md:grid-cols-[1.5fr_1fr]' : 'flex flex-col'}`}
    >
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />

      {/* Image stage */}
      <div className={`relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_80%,#1d1d20_0%,#0b0b0c_70%)] ${wide ? 'aspect-[16/9] md:aspect-auto md:min-h-[320px]' : 'aspect-[16/10]'}`}>
        <span className="absolute left-4 top-4 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-chrome">
          {String(index + 1).padStart(2, '0')} · {car.category}
        </span>
        <div className="absolute inset-x-6 bottom-[18%] h-px bg-gradient-to-r from-transparent via-racing/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <CarImage
          paint={car.defaultPaint}
          angle="front"
          alt={`${car.brand} ${car.name} studio render`}
          className="absolute inset-0 h-full w-full object-contain p-4 transition-all duration-700 ease-cine group-hover:scale-105 group-hover:opacity-0"
        />
        <CarImage
          paint={car.defaultPaint}
          angle="side"
          alt=""
          className="absolute inset-0 h-full w-full translate-x-8 object-contain p-4 opacity-0 transition-all duration-700 ease-cine group-hover:translate-x-0 group-hover:opacity-100"
        />
        <button
          type="button"
          onClick={() => toggleFavorite(car.id)}
          aria-pressed={fav}
          aria-label={fav ? `Remove ${car.name} from favourites` : `Add ${car.name} to favourites`}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center border border-white/10 bg-void/60 backdrop-blur transition-colors hover:border-racing"
        >
          <motion.span key={String(fav)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
            <Heart size={15} className={fav ? 'fill-racing text-racing' : 'text-bone'} />
          </motion.span>
        </button>
      </div>

      {/* Info */}
      <div className="relative z-20 flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{car.brand} · {car.year}</p>
            <h3 className="mt-2 text-xl font-semibold uppercase tracking-tight sm:text-2xl">{car.name}</h3>
          </div>
          <p className="whitespace-nowrap font-display text-lg text-bone">{formatPriceShort(car.price)}</p>
        </div>
        {wide && <p className="mt-4 text-sm leading-relaxed text-silver">{car.description}</p>}
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4">
          {[
            [car.hp.toLocaleString(), 'hp'],
            [`${car.zeroTo100}s`, '0–100'],
            [car.topSpeed, 'km/h'],
          ].map(([v, l]) => (
            <div key={l}>
              <dd className="font-display text-base font-semibold">{v}</dd>
              <dt className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-chrome">{l}</dt>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link to={`/cars/${car.id}`} className="btn-ghost btn-sm flex-1" data-cursor="View">
            Details <ArrowUpRight size={13} />
          </Link>
          <Link to={`/configurator/${car.id}`} className="btn-primary btn-sm flex-1" data-cursor="Build">
            Configure
          </Link>
          {onQuickView && (
            <button type="button" onClick={() => onQuickView(car)} className="btn-ghost btn-sm px-3" aria-label={`Quick view ${car.name}`}>
              <Eye size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
