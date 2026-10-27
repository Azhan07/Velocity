import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, CheckCircle2, Sun, Camera } from 'lucide-react';
import CarCanvas from '../components/three/CarCanvas';
import ConfiguratorScene from '../components/three/ConfiguratorScene';
import { VIEWS } from '../components/three/CameraController';
import { LIGHTING } from '../components/three/StudioLights';
import ColorSelector from '../components/configurator/ColorSelector';
import WheelSelector from '../components/configurator/WheelSelector';
import InteriorSelector from '../components/configurator/InteriorSelector';
import BuildSummary from '../components/configurator/BuildSummary';
import DataNotice from '../components/ui/DataNotice';
import { carLabel, cars, getCar, getPaint } from '../data/cars';
import { calculateBuild } from '../utils/pricing';
import { useGarage } from '../context/GarageContext';
import useReducedMotion from '../hooks/useReducedMotion';
import NotFound from './NotFound';

const DEFAULTS = (car) => ({ paint: car.defaultPaint, wheel: 'standard', interior: 'black' });

export default function Configurator() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const car = getCar(id);
  const { builds, saveBuild } = useGarage();
  const reduced = useReducedMotion();

  // Editing an existing saved build? (/configurator/:id?build=<buildId>)
  const editId = params.get('build');
  const existing = builds.find((b) => b.id === editId);

  const [config, setConfig] = useState(() => (existing ? { paint: existing.paint, wheel: existing.wheel, interior: existing.interior } : car ? DEFAULTS(car) : null));
  const [view, setView] = useState('front');
  const [lighting, setLighting] = useState('studio');
  const [resetKey, setResetKey] = useState(0);
  const [caps, setCaps] = useState({ paint: true, wheels: true, interior: true });
  const [toast, setToast] = useState(null);

  // Reset when switching to a different car
  useEffect(() => {
    if (car && !existing) setConfig(DEFAULTS(car));
  }, [car?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  const onCapabilities = useCallback((c) => setCaps(c), []);
  const build = useMemo(() => (car && config ? calculateBuild(car, config) : null), [car, config]);

  if (!car) return <NotFound message="That car is not in the collection." />;

  // Smart camera: each option group moves the camera to the part being changed
  const update = (key, value, focus) => {
    setConfig((c) => ({ ...c, [key]: value }));
    if (focus) setView(focus);
  };

  const reset = () => {
    setConfig(DEFAULTS(car));
    setView('front');
    setResetKey((k) => k + 1);
  };

  const save = () => {
    const savedId = saveBuild({
      id: existing?.id,
      carId: car.id,
      ...config,
      total: build.total,
    });
    setToast({ updated: !!existing, id: savedId });
    if (!existing) navigate(`/configurator/${car.id}?build=${savedId}`, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col pt-16 lg:h-screen lg:flex-row lg:pt-20">
      {/* ===== 3D stage ===== */}
      <div className="relative h-[52vh] shrink-0 lg:h-auto lg:flex-1">
        <CarCanvas className="absolute inset-0" fallbackColor={getPaint(config.paint).hex}>
          <ConfiguratorScene {...config} view={view} resetKey={resetKey} lighting={lighting} reduced={reduced} onCapabilities={onCapabilities} />
        </CarCanvas>

        <div className="pointer-events-none absolute left-0 top-0 p-5 lg:p-8">
          <p className="eyebrow">Configurator</p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-4xl">{car.name}</h1>
          <label className="pointer-events-auto mt-3 block">
            <span className="sr-only">Choose a car</span>
            <select value={car.id} onChange={(e) => navigate(`/configurator/${e.target.value}`)} className="field w-auto py-2 pr-8 text-xs">
              {cars.map((c) => (
                <option key={c.id} value={c.id}>{carLabel(c)}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Camera + lighting controls */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-gradient-to-t from-void via-void/70 to-transparent p-4 pt-12 lg:p-6 lg:pt-16">
          <span className="sr-only">Camera view</span>
          <Camera size={14} className="text-chrome" aria-hidden="true" />
          {Object.entries(VIEWS).map(([k, v]) => (
            <button key={k} type="button" onClick={() => setView(k)} aria-pressed={view === k} className={`chip ${view === k ? 'chip-active' : ''}`} disabled={k === 'interior' && !caps.interior}>
              {v.label}
            </button>
          ))}
          <button type="button" onClick={() => setResetKey((k) => k + 1)} className="chip" aria-label="Reset camera">
            <RotateCcw size={12} />
          </button>
          <span className="mx-1 hidden h-4 w-px bg-white/15 sm:block" />
          <Sun size={14} className="text-chrome" aria-hidden="true" />
          {LIGHTING.map((l) => (
            <button key={l.id} type="button" onClick={() => setLighting(l.id)} aria-pressed={lighting === l.id} className={`chip ${lighting === l.id ? 'chip-active' : ''}`}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Options panel ===== */}
      <aside className="w-full border-l border-white/[0.06] bg-carbon px-5 pb-10 sm:px-8 lg:w-[440px] lg:overflow-y-auto" aria-label="Configuration options">
        <div className="pt-6">
          <DataNotice text="Option prices are illustrative" />
          <p className="mt-3 text-sm text-chrome">Drag to rotate · scroll or pinch to zoom. The camera moves to each part you change.</p>
        </div>
        <ColorSelector value={config.paint} onChange={(v) => update('paint', v, 'front')} supported={caps.paint} />
        <WheelSelector value={config.wheel} onChange={(v) => update('wheel', v, 'side')} supported={caps.wheels} />
        <InteriorSelector value={config.interior} onChange={(v) => update('interior', v, 'interior')} supported={caps.interior} />
        <BuildSummary car={car} build={build} onReset={reset} onSave={save} editing={!!existing} />
      </aside>

      {/* Saved toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-4 bottom-6 z-50 mx-auto flex w-fit items-center gap-4 border border-white/10 bg-graphite px-5 py-4 shadow-2xl"
          >
            <CheckCircle2 size={18} className="text-racing" />
            <span className="text-sm">{toast.updated ? 'Build updated' : 'Build saved to your garage'}</span>
            <Link to="/garage" className="font-mono text-[10px] uppercase tracking-[0.2em] text-racing hover:underline">
              Open garage
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
