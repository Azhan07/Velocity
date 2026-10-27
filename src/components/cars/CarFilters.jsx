import { Search, LayoutGrid, Rows3, X, Heart } from 'lucide-react';
import { brands, categories } from '../../data/cars';
import { formatPriceShort } from '../../utils/format';

export const PRICE_MAX = 3000000;
export const HP_MAX = 2000;

export const DEFAULT_FILTERS = {
  query: '',
  brand: 'all',
  category: 'all',
  minHp: 0,
  maxPrice: PRICE_MAX,
  sort: 'featured',
  favoritesOnly: false,
};

/** Search, filter, sort and layout controls for the collection page. */
export default function CarFilters({ filters, setFilters, layout, setLayout, count }) {
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.type === 'range' ? Number(e.target.value) : e.target.value }));
  const dirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search by car name</span>
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-chrome" />
          <input type="search" value={filters.query} onChange={set('query')} placeholder="Search by name or brand…" className="field pl-11" />
        </label>
        <label>
          <span className="sr-only">Sort</span>
          <select value={filters.sort} onChange={set('sort')} className="field md:w-56">
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="hp-desc">Horsepower: high → low</option>
            <option value="hp-asc">Horsepower: low → high</option>
          </select>
        </label>
        <div className="flex gap-1" role="group" aria-label="Layout">
          <button type="button" onClick={() => setLayout('grid')} aria-pressed={layout === 'grid'} className={`chip px-3.5 ${layout === 'grid' ? 'chip-active' : ''}`} aria-label="Grid layout">
            <LayoutGrid size={15} />
          </button>
          <button type="button" onClick={() => setLayout('gallery')} aria-pressed={layout === 'gallery'} className={`chip px-3.5 ${layout === 'gallery' ? 'chip-active' : ''}`} aria-label="Gallery layout">
            <Rows3 size={15} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 border-y border-white/[0.06] py-5 md:grid-cols-[1fr_1fr_1.2fr_1.2fr]">
        <label className="block">
          <span className="eyebrow mb-2 block">Brand</span>
          <select value={filters.brand} onChange={set('brand')} className="field py-2.5">
            <option value="all">All brands</option>
            {brands.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block">Category</span>
          <select value={filters.category} onChange={set('category')} className="field py-2.5">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow mb-2 flex justify-between"><span>Min power</span><span className="text-bone">{filters.minHp} hp</span></span>
          <input type="range" min="0" max={HP_MAX} step="50" value={filters.minHp} onChange={set('minHp')} className="mt-3 w-full" />
        </label>
        <label className="block">
          <span className="eyebrow mb-2 flex justify-between"><span>Max price</span><span className="text-bone">{formatPriceShort(filters.maxPrice)}</span></span>
          <input type="range" min="150000" max={PRICE_MAX} step="50000" value={filters.maxPrice} onChange={set('maxPrice')} className="mt-3 w-full" />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setFilters((f) => ({ ...f, favoritesOnly: !f.favoritesOnly }))} aria-pressed={filters.favoritesOnly} className={`chip ${filters.favoritesOnly ? 'chip-active' : ''}`}>
            <Heart size={12} className={filters.favoritesOnly ? 'fill-racing text-racing' : ''} /> Favourites only
          </button>
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setFilters((f) => ({ ...f, category: f.category === c ? 'all' : c }))} aria-pressed={filters.category === c} className={`chip ${filters.category === c ? 'chip-active' : ''}`}>
              {c}
            </button>
          ))}
          {dirty && (
            <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="chip text-racing">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-chrome" aria-live="polite">
          {count} {count === 1 ? 'car' : 'cars'}
        </p>
      </div>
    </div>
  );
}
