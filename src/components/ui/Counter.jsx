import { useEffect, useRef } from 'react';
import { animate, useInView } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Number that counts up when it scrolls into view.
 * Writes straight into the DOM node, so counting does not re-render React.
 */
export default function Counter({ value, decimals = 0, duration = 1.6, prefix = '', suffix = '', className = '', from = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const fmt = (v) => `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
    if (!inView || reduced) {
      node.textContent = fmt(inView || reduced ? value : from);
      return undefined;
    }
    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (node.textContent = fmt(v)),
    });
    return () => controls.stop();
  }, [inView, value, decimals, duration, prefix, suffix, reduced, from]);

  // Initial text keeps the element measurable (and readable without JS animation).
  // React won't touch it again unless `from` changes, so our direct DOM writes are safe.
  const initial = `${prefix}${(reduced ? value : from).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  return <span ref={ref} className={className}>{initial}</span>;
}
