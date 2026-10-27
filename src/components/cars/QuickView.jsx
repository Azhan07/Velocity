import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import CarImage from './CarImage';
import DataNotice from '../ui/DataNotice';
import { useGarage } from '../../context/GarageContext';
import { formatPrice } from '../../utils/format';

/** Quick-view modal. Closes with Esc or a backdrop click; focus moves into the dialog. */
export default function QuickView({ car, onClose }) {
  const { isFavorite, toggleFavorite } = useGarage();
  const closeBtn = useRef(null);

  useEffect(() => {
    if (!car) return undefined;
    const prev = document.activeElement;
    closeBtn.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [car, onClose]);

  return (
    <AnimatePresence>
      {car && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qv-title"
            className="relative z-10 grid max-h-[92vh] w-full max-w-4xl overflow-y-auto border border-white/10 bg-graphite md:grid-cols-[1.2fr_1fr]"
            initial={{ y: 60, opacity: 0, clipPath: 'inset(10% 0 10% 0)' }}
            animate={{ y: 0, opacity: 1, clipPath: 'inset(0% 0 0% 0)' }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[16/11] bg-[radial-gradient(ellipse_at_50%_80%,#202024_0%,#0b0b0c_70%)] md:aspect-auto">
              <CarImage paint={car.defaultPaint} angle="front" alt={`${car.name} render`} className="absolute inset-0 h-full w-full object-contain p-6" loading="eager" />
            </div>
            <div className="p-6 sm:p-8">
              <button ref={closeBtn} type="button" onClick={onClose} className="absolute right-3 top-3 border border-white/10 bg-void/60 p-2 hover:border-white/40" aria-label="Close quick view">
                <X size={16} />
              </button>
              <p className="eyebrow">{car.brand} · {car.year} · {car.category}</p>
              <h2 id="qv-title" className="mt-2 text-3xl font-black uppercase">{car.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-silver">{car.description}</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/[0.06] pt-5 text-sm">
                {[
                  ['Engine', car.engine],
                  ['Power', `${car.hp.toLocaleString()} hp`],
                  ['Torque', `${car.torque.toLocaleString()} Nm`],
                  ['0–100 km/h', `${car.zeroTo100} s`],
                  ['Top speed', `${car.topSpeed} km/h`],
                  ['Drivetrain', car.drivetrain],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="eyebrow">{k}</dt>
                    <dd className="mt-1">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 font-display text-2xl">{formatPrice(car.price)}</p>
              <DataNotice className="mt-2" text="Illustrative figures" />
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={`/cars/${car.id}`} className="btn-ghost btn-sm">Full details</Link>
                <Link to={`/configurator/${car.id}`} className="btn-primary btn-sm">Configure</Link>
                <button type="button" onClick={() => toggleFavorite(car.id)} className="btn-ghost btn-sm px-3" aria-pressed={isFavorite(car.id)} aria-label="Toggle favourite">
                  <Heart size={14} className={isFavorite(car.id) ? 'fill-racing text-racing' : ''} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
