import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import useReducedMotion from '../../hooks/useReducedMotion';
import { markReady } from '../../utils/ready';

/**
 * "Ignition" preloader: a tachometer whose needle tracks REAL asset loading progress.
 * At 100% the needle hits the redline, the dial flashes, and the screen splits open.
 */
export default function Preloader() {
  const { progress, active } = useProgress();
  const [done, setDone] = useState(false);
  const [shown, setShown] = useState(0);
  const start = useRef(Date.now());
  const reduced = useReducedMotion();

  // Smooth the displayed progress so the needle sweeps rather than jumps
  useEffect(() => {
    let raf;
    const tick = () => {
      // If nothing is loading (e.g. a page without 3D), pretend-fill quickly
      const target = active || progress > 0 ? progress : Math.min(100, ((Date.now() - start.current) / 900) * 100);
      setShown((s) => {
        const next = s + (target - s) * 0.12;
        return Math.abs(target - next) < 0.3 ? target : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, active]);

  useEffect(() => {
    const minTime = reduced ? 300 : 1600;
    if (shown >= 99.5 && !active) {
      const wait = Math.max(0, minTime - (Date.now() - start.current));
      const t = setTimeout(() => setDone(true), wait + 350);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [shown, active, reduced]);

  // Let the rest of the site know the curtain is opening
  useEffect(() => {
    if (done) markReady();
  }, [done]);

  // Safety net: never block the site for more than 12 s
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 12000);
    return () => clearTimeout(t);
  }, []);

  // Dial geometry: 240° sweep
  const angle = -120 + (shown / 100) * 240;
  const ticks = Array.from({ length: 41 }, (_, i) => i);
  const redline = shown > 85;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center" exit={{ pointerEvents: 'none' }} role="status" aria-label={`Loading ${Math.round(shown)} percent`}>
          {/* Two halves that split apart on exit */}
          <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-void" exit={{ y: '-100%' }} transition={{ duration: 0.9, ease: [0.77, 0, 0.175, 1] }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-void" exit={{ y: '100%' }} transition={{ duration: 0.9, ease: [0.77, 0, 0.175, 1] }} />
          <motion.div className="absolute inset-x-0 top-1/2 h-px bg-racing" exit={{ scaleX: 0, opacity: 0 }} transition={{ duration: 0.5 }} />

          <motion.div className="relative flex flex-col items-center" exit={{ opacity: 0, scale: 1.15 }} transition={{ duration: 0.45 }}>
            <svg viewBox="0 0 220 220" className="h-56 w-56 sm:h-64 sm:w-64" aria-hidden="true">
              <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(255,255,255,0.06)" />
              {ticks.map((i) => {
                const a = ((-120 + i * 6) * Math.PI) / 180;
                const major = i % 5 === 0;
                const r1 = major ? 80 : 86;
                const isRed = i >= 34;
                const lit = i / 40 <= shown / 100;
                return (
                  <line
                    key={i}
                    x1={110 + Math.sin(a) * r1}
                    y1={110 - Math.cos(a) * r1}
                    x2={110 + Math.sin(a) * 94}
                    y2={110 - Math.cos(a) * 94}
                    stroke={isRed ? '#e10600' : lit ? '#f2f0ec' : 'rgba(255,255,255,0.18)'}
                    strokeWidth={major ? 2 : 1}
                  />
                );
              })}
              {[0, 2, 4, 6, 8].map((n, i) => {
                const a = ((-120 + i * 60) * Math.PI) / 180;
                return (
                  <text key={n} x={110 + Math.sin(a) * 66} y={114 - Math.cos(a) * 66} textAnchor="middle" className="fill-chrome font-mono" fontSize="9">
                    {n}
                  </text>
                );
              })}
              <g transform={`rotate(${angle} 110 110)`}>
                <line x1="110" y1="122" x2="110" y2="28" stroke="#e10600" strokeWidth="2.5" strokeLinecap="round" />
              </g>
              <circle cx="110" cy="110" r="7" fill="#141416" stroke="#e10600" />
              <text x="110" y="160" textAnchor="middle" className="fill-bone font-display" fontSize="22" fontWeight="600">
                {Math.round(shown)}
              </text>
              <text x="110" y="174" textAnchor="middle" className="fill-chrome font-mono" fontSize="6" letterSpacing="2">
                x1000 RPM
              </text>
            </svg>
            <motion.p
              className="mt-4 font-mono text-[11px] uppercase tracking-ultra"
              animate={{ color: redline ? '#e10600' : '#8d9096' }}
            >
              {redline ? 'Ignition' : 'Priming systems'}
            </motion.p>
            {redline && !reduced && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full"
                initial={{ boxShadow: '0 0 0 0 rgba(225,6,0,0.0)' }}
                animate={{ boxShadow: ['0 0 0 0 rgba(225,6,0,0.0)', '0 0 120px 30px rgba(225,6,0,0.35)', '0 0 0 0 rgba(225,6,0,0.0)'] }}
                transition={{ duration: 0.8 }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
