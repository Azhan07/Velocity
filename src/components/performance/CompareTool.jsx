import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { carLabel, cars, getCar } from '../../data/cars';
import { useGarage } from '../../context/GarageContext';
import { formatPrice } from '../../utils/format';
import CarImage from '../cars/CarImage';
import { AccelCompare, RadarCompare } from './ComparisonChart';
import DataNotice from '../ui/DataNotice';

/** Metrics to compare. `better` says which direction wins. */
const METRICS = [
  { key: 'hp', label: 'Horsepower', unit: 'hp', better: 'high' },
  { key: 'torque', label: 'Torque', unit: 'Nm', better: 'high' },
  { key: 'zeroTo100', label: '0–100 km/h', unit: 's', better: 'low', decimals: 1 },
  { key: 'topSpeed', label: 'Top speed', unit: 'km/h', better: 'high' },
  { key: 'price', label: 'Estimated price', unit: '', better: 'low', money: true },
];

function CompareBar({ metric, a, b }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });
  const va = a[metric.key];
  const vb = b[metric.key];
  const max = Math.max(va, vb);
  // For "lower is better" metrics invert the bar so the longer bar is still the better car
  const width = (v) => (metric.better === 'high' ? v / max : Math.min(va, vb) / v) * 100;
  const winner = va === vb ? null : (metric.better === 'high' ? va > vb : va < vb) ? 0 : 1;
  const fmt = (v) => (metric.money ? formatPrice(v) : `${v.toLocaleString('en-US', { minimumFractionDigits: metric.decimals || 0 })} ${metric.unit}`);
  const diff = metric.money ? formatPrice(Math.abs(va - vb)) : `${Math.abs(va - vb).toLocaleString('en-US', { maximumFractionDigits: metric.decimals || 0 })} ${metric.unit}`;

  return (
    <div ref={ref} className="border-t border-white/[0.06] py-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="eyebrow">{metric.label}</p>
        <p className="font-mono text-[10px] text-chrome">{winner === null ? 'Tie' : `Δ ${diff}`}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[va, vb].map((v, i) => (
          <div key={i} className={i === 0 ? 'text-right' : ''}>
            <p className={`mb-2 font-display text-lg ${winner === i ? 'text-bone' : 'text-chrome'}`}>
              {winner === i && <Trophy size={13} className="mx-1 inline text-racing" aria-label="better" />}
              {fmt(v)}
            </p>
            <div className={`flex h-1.5 bg-white/[0.06] ${i === 0 ? 'justify-end' : ''}`}>
              <motion.div
                className={i === 0 ? 'bg-racing' : 'bg-silver'}
                initial={{ width: 0 }}
                animate={{ width: inView ? `${width(v)}%` : 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompareTool() {
  const { compare, setCompareSlot } = useGarage();
  const pair = compare.map((id, i) => getCar(id) || cars[i]);

  return (
    <div>
      {/* Selectors */}
      <div className="grid gap-4 md:grid-cols-2">
        {pair.map((car, slot) => (
          <div key={slot} className={`card overflow-hidden ${slot === 0 ? 'border-t-2 border-t-racing' : 'border-t-2 border-t-silver'}`}>
            <div className="relative aspect-[16/8] bg-[radial-gradient(ellipse_at_50%_85%,#202024_0%,#0b0b0c_70%)]">
              <motion.div key={car.id} initial={{ opacity: 0, x: slot === 0 ? -40 : 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
                <CarImage paint={car.defaultPaint} angle="side" alt={`${car.name} side view`} className={`h-full w-full object-contain p-4 ${slot === 1 ? '-scale-x-100' : ''}`} />
              </motion.div>
            </div>
            <div className="p-5">
              <label className="block">
                <span className="eyebrow mb-2 block">{slot === 0 ? 'Car A' : 'Car B'}</span>
                <select value={car.id} onChange={(e) => setCompareSlot(slot, e.target.value)} className="field">
                  {cars.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === pair[1 - slot].id}>
                      {carLabel(c)}
                    </option>
                  ))}
                </select>
              </label>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="eyebrow">Engine</dt><dd className="mt-1 text-silver">{car.engine}</dd></div>
                <div><dt className="eyebrow">Drivetrain</dt><dd className="mt-1 text-silver">{car.drivetrain} · {car.transmission}</dd></div>
              </dl>
              <Link to={`/cars/${car.id}`} className="btn-ghost btn-sm mt-5 w-full">
                Open details <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="grid grid-cols-2 gap-3 pb-3 font-display text-sm uppercase">
            <p className="text-right text-racing">{pair[0].name}</p>
            <p className="text-silver">{pair[1].name}</p>
          </div>
          {METRICS.map((m) => <CompareBar key={m.key} metric={m} a={pair[0]} b={pair[1]} />)}
          <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] py-5 text-sm">
            <p className="text-right text-silver">{pair[0].engineType} · {pair[0].drivetrain}</p>
            <p className="text-silver">{pair[1].engineType} · {pair[1].drivetrain}</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <p className="eyebrow mb-2">Performance fingerprint</p>
            <p className="mb-2 text-xs text-chrome">Each axis scored against the best car in the collection.</p>
            <RadarCompare cars={pair} />
          </div>
          <div className="card p-6">
            <p className="eyebrow mb-2">Speed over time</p>
            <p className="mb-2 text-xs text-chrome">Modelled from the quoted 0–100 and top speed — illustrative.</p>
            <AccelCompare cars={pair} />
          </div>
        </div>
      </div>
      <DataNotice className="mt-6" />
    </div>
  );
}
