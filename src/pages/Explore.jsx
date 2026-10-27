import { useCallback, useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';
import CarFilters, { DEFAULT_FILTERS } from '../components/cars/CarFilters';
import CarGrid from '../components/cars/CarGrid';
import QuickView from '../components/cars/QuickView';
import SectionHeading from '../components/ui/SectionHeading';
import DataNotice from '../components/ui/DataNotice';
import { cars } from '../data/cars';
import { useGarage } from '../context/GarageContext';

export default function Explore() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [layout, setLayout] = useState('grid');
  const [quick, setQuick] = useState(null);
  const { favorites } = useGarage();

  // Derive the visible list from the full dataset + current filters (no duplicated state)
  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const list = cars.filter(
      (c) =>
        (!q || `${c.brand} ${c.name}`.toLowerCase().includes(q)) &&
        (filters.brand === 'all' || c.brand === filters.brand) &&
        (filters.category === 'all' || c.category === filters.category) &&
        c.hp >= filters.minHp &&
        c.price <= filters.maxPrice &&
        (!filters.favoritesOnly || favorites.includes(c.id))
    );
    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'hp-desc': (a, b) => b.hp - a.hp,
      'hp-asc': (a, b) => a.hp - b.hp,
    };
    return sorters[filters.sort] ? [...list].sort(sorters[filters.sort]) : list;
  }, [filters, favorites]);

  const closeQuick = useCallback(() => setQuick(null), []);

  return (
    <div className="container-v pb-10 pt-32 lg:pt-40">
      <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="Virtual garage" title="The collection" as="h1">
          Ten concept machines across five disciplines. Filter, compare, favourite, and step into any of them.
        </SectionHeading>
        <DataNotice />
      </div>

      <CarFilters filters={filters} setFilters={setFilters} layout={layout} setLayout={setLayout} count={results.length} />

      <div className="mt-10">
        {results.length ? (
          <CarGrid cars={results} layout={layout} onQuickView={setQuick} />
        ) : (
          <div className="flex flex-col items-center gap-4 border border-dashed border-white/10 py-24 text-center">
            <SearchX size={28} className="text-chrome" />
            <p className="font-display text-xl uppercase">No cars match</p>
            <p className="max-w-sm text-sm text-chrome">Try widening the price or power range, or clear the filters.</p>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
          </div>
        )}
      </div>

      <QuickView car={quick} onClose={closeQuick} />
    </div>
  );
}
