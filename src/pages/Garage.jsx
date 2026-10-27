import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Pencil, Trash2, Wrench, Sparkles } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import CarCard from '../components/cars/CarCard';
import CarImage from '../components/cars/CarImage';
import DataNotice from '../components/ui/DataNotice';
import { useGarage } from '../context/GarageContext';
import { getCar } from '../data/cars';
import { calculateBuild } from '../utils/pricing';
import { formatPrice } from '../utils/format';

function EmptyState({ icon: Icon, title, text, to, cta }) {
  return (
    <div className="flex flex-col items-center gap-4 border border-dashed border-white/10 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10">
        <Icon size={20} className="text-racing" />
      </span>
      <p className="font-display text-lg uppercase">{title}</p>
      <p className="max-w-sm text-sm text-chrome">{text}</p>
      <Link to={to} className="btn-primary btn-sm mt-2">{cta}</Link>
    </div>
  );
}

function BuildCard({ build, onRemove, index }) {
  const car = getCar(build.carId);
  if (!car) return null;
  // Recalculate from current data so the price is always consistent with the option list
  const b = calculateBuild(car, build);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.06 } }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.35 } }}
      className="card grid overflow-hidden md:grid-cols-[1fr_1.3fr]"
    >
      <div className="relative aspect-[16/10] bg-[radial-gradient(ellipse_at_50%_85%,#202024_0%,#0b0b0c_70%)] md:aspect-auto">
        <CarImage paint={build.paint} angle="front" alt={`${car.name} in ${b.paint.name}`} className="absolute inset-0 h-full w-full object-contain p-4" />
      </div>
      <div className="flex flex-col p-6">
        <p className="eyebrow">{car.brand} · saved {new Date(build.updatedAt || build.createdAt).toLocaleDateString()}</p>
        <h3 className="mt-2 text-2xl font-semibold uppercase">{car.name}</h3>
        <dl className="mt-5 space-y-2 text-sm">
          {[
            ['Paint', b.paint.name, <span key="s" className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: b.paint.hex }} />],
            ['Wheels', b.wheel.name],
            ['Interior', b.interior.name],
          ].map(([k, v, sw]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-white/[0.05] pb-2">
              <dt className="text-chrome">{k}</dt>
              <dd>{sw}{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Estimated build</p>
            <p className="font-display text-2xl">{formatPrice(b.total)}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/configurator/${car.id}?build=${build.id}`} className="btn-ghost btn-sm" aria-label={`Edit ${car.name} build`}>
              <Pencil size={13} /> Edit
            </Link>
            <button type="button" onClick={() => onRemove(build.id)} className="btn-ghost btn-sm px-3 hover:border-racing hover:text-racing" aria-label={`Remove ${car.name} build`}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Garage() {
  const { favorites, clearFavorites, builds, removeBuild } = useGarage();
  const favCars = favorites.map(getCar).filter(Boolean);
  const total = builds.reduce((sum, b) => {
    const car = getCar(b.carId);
    return car ? sum + calculateBuild(car, b).total : sum;
  }, 0);

  return (
    <div className="container-v pb-10 pt-32 lg:pt-40">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="My garage" title="Your collection" as="h1">
          Favourites and saved builds live in this browser (LocalStorage) — no account needed.
        </SectionHeading>
        <dl className="flex gap-10">
          <div><dt className="eyebrow">Favourites</dt><dd className="stat-num mt-2">{favCars.length}</dd></div>
          <div><dt className="eyebrow">Builds</dt><dd className="stat-num mt-2">{builds.length}</dd></div>
          {builds.length > 0 && <div><dt className="eyebrow">Garage value</dt><dd className="mt-2 font-display text-2xl sm:text-3xl">{formatPrice(total)}</dd></div>}
        </dl>
      </div>

      {/* ===== Saved builds ===== */}
      <section className="mt-16" aria-labelledby="builds-title">
        <h2 id="builds-title" className="mb-6 flex items-center gap-3 text-xl font-semibold uppercase">
          <Wrench size={18} className="text-racing" /> Saved configurations
        </h2>
        {builds.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {builds.map((b, i) => <BuildCard key={b.id} build={b} index={i} onRemove={removeBuild} />)}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState icon={Sparkles} title="No builds yet" text="Design your first car in the 3D configurator and save it here." to="/configurator/velocity-vx1" cta="Start a build" />
        )}
      </section>

      {/* ===== Favourites ===== */}
      <section className="mt-20" aria-labelledby="favs-title">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="favs-title" className="flex items-center gap-3 text-xl font-semibold uppercase">
            <Heart size={18} className="text-racing" /> Favourite cars
          </h2>
          {favCars.length > 0 && (
            <button
              type="button"
              onClick={() => window.confirm('Remove all favourite cars?') && clearFavorites()}
              className="chip hover:border-racing hover:text-racing"
            >
              <Trash2 size={12} /> Clear favourites
            </button>
          )}
        </div>
        {favCars.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {favCars.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState icon={Heart} title="No favourites yet" text="Tap the heart on any car in the collection to keep it here." to="/explore" cta="Browse the collection" />
        )}
      </section>
      <DataNotice className="mt-10" />
    </div>
  );
}
