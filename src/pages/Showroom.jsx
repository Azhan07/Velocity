import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Pause, Play, ArrowUpRight } from 'lucide-react';
import CarCanvas from '../components/three/CarCanvas';
import ShowroomScene from '../components/three/ShowroomScene';
import { LIGHTING } from '../components/three/StudioLights';
import { VIEWS } from '../components/three/CameraController';
import DataNotice from '../components/ui/DataNotice';
import { cars, getPaint } from '../data/cars';
import { formatPrice } from '../utils/format';
import useReducedMotion from '../hooks/useReducedMotion';
import { useIsMobile } from '../hooks/useDevice';
import { engine } from '../utils/engineSound';

export default function Showroom() {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState('front');
  const [lighting, setLighting] = useState('studio');
  const [resetKey, setResetKey] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const car = cars[index];

  const go = (dir) => {
    setIndex((i) => (i + dir + cars.length) % cars.length);
    engine.rev(); // only audible if sound is switched on
  };

  return (
    <div className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      <CarCanvas className="absolute inset-0" camera={{ position: [6, 1.5, 7] }} fallbackColor={getPaint(car.defaultPaint).hex}>
        <ShowroomScene
          paint={car.defaultPaint}
          carKey={car.id}
          view={view}
          resetKey={resetKey}
          lighting={lighting}
          autoRotate={autoRotate}
          reduced={reduced}
          mobile={mobile}
        />
      </CarCanvas>
      <div className="vignette pointer-events-none absolute inset-0" />

      {/* Car name — slides like a departure board when switching */}
      <div className="pointer-events-none absolute inset-x-0 top-20 lg:top-28">
        <div className="container-v">
          <p className="eyebrow mb-3">Virtual showroom · {String(index + 1).padStart(2, '0')} / {cars.length}</p>
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={car.id} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}>
                <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">{car.name}</h1>
                <p className="mt-3 text-silver">{car.brand} · {car.tagline}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void via-void/80 to-transparent pb-6 pt-16">
        <div className="container-v flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-6">
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} className="btn-ghost btn-sm px-3" aria-label="Previous car"><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => go(1)} className="btn-ghost btn-sm px-3" aria-label="Next car"><ChevronRight size={16} /></button>
            </div>
            <dl className="hidden gap-8 sm:flex">
              {[[car.hp.toLocaleString(), 'hp'], [`${car.zeroTo100}s`, '0–100'], [car.topSpeed, 'km/h'], [formatPrice(car.price), 'from']].map(([v, l]) => (
                <div key={l}>
                  <dd className="font-display text-lg">{v}</dd>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-chrome">{l}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Camera view" className="flex flex-wrap gap-1">
              {Object.entries(VIEWS)
                .filter(([k]) => k !== 'interior')
                .map(([k, v]) => (
                  <button key={k} type="button" onClick={() => setView(k)} aria-pressed={view === k} className={`chip ${view === k ? 'chip-active' : ''}`}>
                    {v.label}
                  </button>
                ))}
            </div>
            <div role="group" aria-label="Lighting environment" className="flex flex-wrap gap-1">
              {LIGHTING.map((l) => (
                <button key={l.id} type="button" onClick={() => setLighting(l.id)} aria-pressed={lighting === l.id} className={`chip ${lighting === l.id ? 'chip-active' : ''}`}>
                  {l.name}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setAutoRotate((a) => !a)} className="chip" aria-label={autoRotate ? 'Pause auto-rotate' : 'Start auto-rotate'}>
              {autoRotate ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button type="button" onClick={() => { setView('front'); setResetKey((k) => k + 1); }} className="chip" aria-label="Reset camera">
              <RotateCcw size={12} />
            </button>
            <Link to={`/cars/${car.id}`} className="btn-primary btn-sm">
              Details <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
        <div className="container-v mt-4 flex flex-wrap items-center justify-between gap-2">
          <DataNotice />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chrome">Drag to orbit · Scroll / pinch to zoom</p>
        </div>
      </div>
    </div>
  );
}
