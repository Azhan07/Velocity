import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Wrap any button/link: it gently "pulls" toward the mouse pointer when hovered.
 * Disabled for reduced-motion users and on touch screens (no hover there).
 */
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });

  const onMove = (e) => {
    if (reduced || e.pointerType === 'touch') return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}
