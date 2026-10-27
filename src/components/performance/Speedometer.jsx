import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { speedAt } from '../../utils/curves';
import { engine } from '../../utils/engineSound';
import useReducedMotion from '../../hooks/useReducedMotion';

const START = -135; // dial angles in degrees
const SWEEP = 270;

function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function arc(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/**
 * Dashboard-style launch SIMULATION.
 * Press "Launch" to replay an illustrative 0–100 km/h run in real time using the
 * car's quoted figures. It is an animation — it does NOT measure any real vehicle.
 *
 * The animation writes to SVG nodes via refs inside requestAnimationFrame,
 * so React doesn't re-render 60 times a second.
 */
export default function Speedometer({ car }) {
  const needle = useRef(null);
  const speedText = useRef(null);
  const rpmBar = useRef(null);
  const gearText = useRef(null);
  const timeText = useRef(null);
  const shiftLights = useRef([]);
  const raf = useRef(0);
  const [state, setState] = useState('idle'); // idle | running | done
  const [result, setResult] = useState(null);
  const reduced = useReducedMotion();
  const maxDial = Math.ceil((car.topSpeed + 20) / 50) * 50;
  const gears = car.engineType === 'Electric' ? 1 : 7;

  const draw = (speed, rpmFrac, gear, t) => {
    const deg = START + (Math.min(speed, maxDial) / maxDial) * SWEEP;
    needle.current?.setAttribute('transform', `rotate(${deg} 150 150)`);
    if (speedText.current) speedText.current.textContent = Math.round(speed);
    if (rpmBar.current) rpmBar.current.style.transform = `scaleX(${rpmFrac})`;
    if (gearText.current) gearText.current.textContent = gears === 1 ? 'D' : gear;
    if (timeText.current) timeText.current.textContent = `${t.toFixed(2)} s`;
    shiftLights.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = rpmFrac > 0.55 + i * 0.08 ? 1 : 0.12;
    });
  };

  const reset = () => {
    cancelAnimationFrame(raf.current);
    setState('idle');
    setResult(null);
    draw(0, 0.08, 'N', 0);
    engine.setRPM(900, 0.3);
  };

  useEffect(() => {
    reset();
    return () => cancelAnimationFrame(raf.current);
  }, [car.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const launch = () => {
    cancelAnimationFrame(raf.current);
    setState('running');
    setResult(null);
    if (reduced) {
      // Reduced motion: jump straight to the result
      draw(100, 0.8, gears === 1 ? 'D' : 2, car.zeroTo100);
      setResult(car.zeroTo100);
      setState('done');
      return;
    }
    const begin = performance.now();
    const runFor = car.zeroTo100 + 1.4; // run a little past 100 km/h
    let hit = false;
    const tick = (now) => {
      const t = (now - begin) / 1000;
      const speed = speedAt(car, t);
      // Fake gear changes: each gear covers an equal speed band
      const band = car.topSpeed / gears;
      const gear = Math.min(gears, Math.floor(speed / band) + 1);
      const inGear = (speed - (gear - 1) * band) / band;
      const rpmFrac = gears === 1 ? speed / car.topSpeed : 0.35 + inGear * 0.62;
      draw(speed, Math.min(1, rpmFrac), gear, t);
      engine.setRPM(1000 + rpmFrac * (Math.min(car.redline, 9000) - 1000), 0.04);
      if (!hit && speed >= 100) {
        hit = true;
        setResult(t);
      }
      if (t < runFor) raf.current = requestAnimationFrame(tick);
      else {
        setState('done');
        engine.setRPM(900, 0.5);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  const majors = Array.from({ length: maxDial / 50 + 1 }, (_, i) => i * 50);

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Launch simulator</p>
          <p className="mt-1 text-sm text-chrome">Replays the quoted 0–100 km/h time in real time.</p>
        </div>
        <span className="border border-amber-400/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-amber-200">Simulation</span>
      </div>

      <svg viewBox="0 0 300 260" className="mx-auto w-full max-w-sm" role="img" aria-label={`Speedometer simulation for ${car.name}, scale 0 to ${maxDial} km/h`}>
        <path d={arc(150, 150, 120, START, START + SWEEP)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <path d={arc(150, 150, 120, START + SWEEP * 0.82, START + SWEEP)} fill="none" stroke="#e10600" strokeOpacity="0.6" strokeWidth="10" />
        {majors.map((v) => {
          const deg = START + (v / maxDial) * SWEEP;
          const [x1, y1] = polar(150, 150, 104, deg);
          const [x2, y2] = polar(150, 150, 114, deg);
          const [tx, ty] = polar(150, 150, 88, deg);
          return (
            <g key={v}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9ccd1" strokeWidth="1.5" />
              {v % 100 === 0 && (
                <text x={tx} y={ty + 3} textAnchor="middle" fontSize="9" className="fill-chrome font-mono">{v}</text>
              )}
            </g>
          );
        })}
        <g ref={needle} transform={`rotate(${START} 150 150)`}>
          <line x1="150" y1="165" x2="150" y2="42" stroke="#e10600" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="150" cy="150" r="9" fill="#141416" stroke="#e10600" strokeWidth="1.5" />
        <text ref={speedText} x="150" y="205" textAnchor="middle" fontSize="34" fontWeight="600" className="fill-bone font-display">0</text>
        <text x="150" y="222" textAnchor="middle" fontSize="8" letterSpacing="2" className="fill-chrome font-mono">KM/H</text>
      </svg>

      {/* RPM strip + shift lights */}
      <div className="mt-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} ref={(el) => (shiftLights.current[i] = el)} className={`h-2 w-5 transition-opacity duration-75 ${i < 2 ? 'bg-emerald-400' : i < 4 ? 'bg-amber-400' : 'bg-racing'}`} style={{ opacity: 0.12 }} />
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chrome">
            Gear <span ref={gearText} className="ml-1 font-display text-base text-bone">N</span>
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden bg-white/[0.06]">
          <div ref={rpmBar} className="h-full origin-left bg-gradient-to-r from-chrome via-bone to-racing" style={{ transform: 'scaleX(0.08)' }} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[9px] text-chrome"><span>RPM</span><span>{car.redline.toLocaleString()} redline</span></div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-5">
        <div aria-live="polite">
          <p className="eyebrow">Timer</p>
          <p ref={timeText} className="font-display text-2xl tabular-nums">0.00 s</p>
          {result && <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-racing">100 km/h in {result.toFixed(2)} s</p>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="btn-ghost btn-sm px-3" aria-label="Reset simulation"><RotateCcw size={14} /></button>
          <button type="button" onClick={launch} disabled={state === 'running'} className="btn-primary btn-sm disabled:opacity-50">
            <Play size={13} /> {state === 'done' ? 'Again' : 'Launch'}
          </button>
        </div>
      </div>
    </div>
  );
}
