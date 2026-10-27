import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * A precision "reticle" cursor: a small red dot plus a lagging ring that expands
 * over links and buttons. Only shown on devices with a real mouse.
 * Animated with requestAnimationFrame + refs (no React re-render per mouse move).
 */
export default function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches && !reduced);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return undefined;
    document.documentElement.classList.add('cursor-none-all');
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let hover = 0;
    let target = 0;
    let raf;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const el = e.target.closest?.('a, button, [role="button"], input, select, textarea, label, [data-cursor]');
      target = el ? 1 : 0;
      const text = el?.getAttribute?.('data-cursor') || '';
      if (label.current && label.current.textContent !== text) label.current.textContent = text;
    };
    const onDown = () => ring.current && (ring.current.style.scale = '0.8');
    const onUp = () => ring.current && (ring.current.style.scale = '1');

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      hover += (target - hover) * 0.15;
      const size = 34 + hover * 30;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x - size / 2}px, ${ringPos.y - size / 2}px, 0)`;
        ring.current.style.width = ring.current.style.height = `${size}px`;
        ring.current.style.borderColor = `rgba(225, 6, 0, ${0.35 + hover * 0.65})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.classList.remove('cursor-none-all');
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={dot} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-racing" />
      <div ref={ring} className="absolute left-0 top-0 flex items-center justify-center rounded-full border transition-[scale] duration-150">
        <span ref={label} className="font-mono text-[8px] uppercase tracking-[0.2em] text-bone" />
      </div>
    </div>
  );
}
