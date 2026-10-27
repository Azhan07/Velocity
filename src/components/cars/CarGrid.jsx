import { AnimatePresence, LayoutGroup } from 'framer-motion';
import CarCard from './CarCard';

/** Animated grid — cards slide into their new positions when filters/sorting change. */
export default function CarGrid({ cars, layout, onQuickView }) {
  return (
    <LayoutGroup>
      <div className={layout === 'gallery' ? 'grid gap-6' : 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3'}>
        <AnimatePresence mode="popLayout">
          {cars.map((car, i) => (
            <CarCard key={car.id} car={car} index={i} layout={layout} onQuickView={onQuickView} />
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
