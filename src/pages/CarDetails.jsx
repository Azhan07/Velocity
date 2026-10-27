import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, GitCompare, Check } from 'lucide-react';
import CarCanvas from '../components/three/CarCanvas';
import CarModel from '../components/three/CarModel';
import StudioLights from '../components/three/StudioLights';
import Floor from '../components/three/Floor';
import CameraController from '../components/three/CameraController';
import Speedometer from '../components/performance/Speedometer';
import PowerChart from '../components/performance/PowerChart';
import CarCard from '../components/cars/CarCard';
import Counter from '../components/ui/Counter';
import DataNotice from '../components/ui/DataNotice';
import { cars, getCar, getPaint, interiors, paints, wheels } from '../data/cars';
import { useGarage } from '../context/GarageContext';
import { formatPrice } from '../utils/format';
import useReducedMotion from '../hooks/useReducedMotion';
import NotFound from './NotFound';

export default function CarDetails() {
  const { id } = useParams();
  const car = getCar(id);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, setCompareSlot } = useGarage();
  const reduced = useReducedMotion();

  if (!car) return <NotFound message="That car is not in the collection." />;

  const fav = isFavorite(car.id);
  const similar = cars.filter((c) => c.id !== car.id && (c.category === car.category || c.brand === car.brand)).slice(0, 3);

  const compareWith = () => {
    setCompareSlot(0, car.id);
    navigate('/performance#compare-title');
  };

  const specs = [
    { label: 'Horsepower', value: car.hp, unit: 'hp' },
    { label: 'Torque', value: car.torque, unit: 'Nm' },
    { label: '0–100 km/h', value: car.zeroTo100, unit: 's', decimals: 1 },
    { label: 'Top speed', value: car.topSpeed, unit: 'km/h' },
  ];

  return (
    <div>
      {/* ===== 3D hero ===== */}
      <section className="relative h-[86vh] min-h-[560px]">
        <CarCanvas className="absolute inset-0" fallbackColor={getPaint(car.defaultPaint).hex} camera={{ position: [5, 1.4, 6] }}>
          <color attach="background" args={['#060606']} />
          <fog attach="fog" args={['#060606', 10, 26]} />
          <StudioLights preset="studio" />
          <spotLight position={[0, 7, 2]} angle={0.5} penumbra={1} intensity={60} />
          <CarModel paint={car.defaultPaint} />
          <Floor />
          <CameraController view="front" autoRotate reduced={reduced} />
        </CarCanvas>
        <div className="vignette pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-void to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-10">
          <div className="container-v flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="eyebrow-red">
                {car.brand} · {car.year} · {car.category}
              </motion.p>
              <h1 className="mt-3 overflow-hidden text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
                <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ delay: 0.45, duration: 1, ease: [0.77, 0, 0.175, 1] }}>
                  {car.name}
                </motion.span>
              </h1>
              <p className="mt-3 max-w-md text-silver">{car.tagline}</p>
            </div>
            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => toggleFavorite(car.id)} aria-pressed={fav} className="btn-ghost btn-sm">
                <Heart size={14} className={fav ? 'fill-racing text-racing' : ''} /> {fav ? 'Saved' : 'Favourite'}
              </button>
              <button type="button" onClick={compareWith} className="btn-ghost btn-sm">
                <GitCompare size={14} /> Compare
              </button>
              <Link to={`/configurator/${car.id}`} className="btn-primary btn-sm sweep">
                Configure <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Key specs ===== */}
      <section className="container-v">
        <dl className="grid grid-cols-2 border-y border-white/[0.06] lg:grid-cols-4">
          {specs.map((s, i) => (
            <div key={s.label} className={`py-8 ${i % 2 ? 'pl-6' : 'pr-6'} lg:px-8 ${i ? 'lg:border-l lg:border-white/[0.06]' : 'lg:pl-0'}`}>
              <dt className="eyebrow">{s.label}</dt>
              <dd className="mt-3 flex items-baseline gap-2">
                <Counter value={s.value} decimals={s.decimals || 0} className="stat-num" />
                <span className="font-mono text-xs text-chrome">{s.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center justify-between gap-4 py-5">
          <p className="font-display text-2xl">
            From {formatPrice(car.price)} <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-chrome">estimated</span>
          </p>
          <DataNotice />
        </div>
      </section>

      {/* ===== Story + technical ===== */}
      <section className="container-v mt-16 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow mb-4">Overview</p>
          <p className="text-xl leading-relaxed text-bone sm:text-2xl">{car.description}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {car.highlights.map((h) => <span key={h} className="chip">{h}</span>)}
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {[
            ['Engine', car.engine],
            ['Engine type', car.engineType],
            ['Transmission', car.transmission],
            ['Drivetrain', car.drivetrain],
            ['Kerb weight', `${car.weight.toLocaleString()} kg`],
            ['Redline', `${car.redline.toLocaleString()} rpm`],
            ['Power-to-weight', `${Math.round((car.hp / car.weight) * 1000)} hp / tonne`],
            ['Model year', car.year],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-white/[0.06] py-4">
              <dt className="text-sm text-chrome">{k}</dt>
              <dd className="text-right text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ===== Exterior / interior / options ===== */}
      <section className="container-v mt-20 grid gap-5 md:grid-cols-3">
        {[
          ['Exterior', car.exterior],
          ['Interior', car.interior],
        ].map(([title, list]) => (
          <div key={title} className="card p-6">
            <p className="eyebrow mb-5">{title}</p>
            <ul className="space-y-3">
              {list.map((x) => (
                <li key={x} className="flex gap-3 text-sm text-silver"><Check size={15} className="mt-0.5 shrink-0 text-racing" />{x}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="card p-6">
          <p className="eyebrow mb-5">Customisation</p>
          <p className="mb-2 text-xs uppercase tracking-wider text-chrome">Paint</p>
          <div className="mb-4 flex gap-2">
            {paints.map((p) => <span key={p.id} title={p.name} className="h-6 w-6 rounded-full border border-white/10" style={{ background: p.hex }} />)}
          </div>
          <p className="mb-1 text-xs uppercase tracking-wider text-chrome">Wheels</p>
          <p className="mb-4 text-sm text-silver">{wheels.map((w) => w.name).join(' · ')}</p>
          <p className="mb-1 text-xs uppercase tracking-wider text-chrome">Interior</p>
          <p className="text-sm text-silver">{interiors.map((w) => w.name).join(' · ')}</p>
          <Link to={`/configurator/${car.id}`} className="btn-primary btn-sm mt-6 w-full">Open configurator</Link>
        </div>
      </section>

      {/* ===== Performance ===== */}
      <section className="container-v mt-20" aria-labelledby="perf-title">
        <h2 id="perf-title" className="mb-6 text-2xl font-semibold uppercase">Performance</h2>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Speedometer car={car} />
          <PowerChart car={car} />
        </div>
      </section>

      {similar.length > 0 && (
        <section className="container-v mt-24">
          <h2 className="mb-6 text-2xl font-semibold uppercase">You may also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
