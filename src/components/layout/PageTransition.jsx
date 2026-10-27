import { motion } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * "Pit-lane wipe" page transition:
 * a black panel with a red leading edge sweeps across the screen and reveals the new page.
 * Framer Motion owns this element only — GSAP never touches it (no animation conflicts).
 */
export default function PageTransition({ children }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        // Opacity only (no transform) so GSAP "pin" and CSS "sticky" keep working inside pages
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
      >
        {children}
      </motion.div>

      {/* Sweeping curtain */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] bg-void"
        initial={{ x: '0%' }}
        animate={{ x: '105%' }}
        exit={{ x: '0%' }}
        transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
        style={{ originX: 0 }}
      >
        <span className="absolute inset-y-0 left-0 w-[3px] bg-racing shadow-[0_0_30px_6px_rgba(225,6,0,0.6)]" />
        <span className="absolute inset-0 speedlines opacity-60" />
      </motion.div>
    </>
  );
}
