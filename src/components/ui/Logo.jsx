import { motion } from 'framer-motion';

/** Animated VELOCITY wordmark — letters slide up one by one, the V mark draws itself. */
export default function Logo({ animate = true, className = '' }) {
  const letters = 'VELOCITY'.split('');
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="VELOCITY">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <motion.path
          d="M4 7h6l6 14 6-14h6L19 27h-6z"
          fill="none"
          stroke="#e10600"
          strokeWidth="1.6"
          initial={animate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1] }}
        />
        <motion.path
          d="M4 7h6l6 14 6-14h6L19 27h-6z"
          fill="#e10600"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        />
      </svg>
      <span className="flex overflow-hidden font-display text-[15px] font-semibold tracking-[0.32em]" aria-hidden="true">
        {letters.map((l, i) => (
          <motion.span
            key={i}
            initial={animate ? { y: '110%' } : false}
            animate={{ y: 0 }}
            transition={{ delay: 0.25 + i * 0.05, duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
            className="inline-block"
          >
            {l}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
