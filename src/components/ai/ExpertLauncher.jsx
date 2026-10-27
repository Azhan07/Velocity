import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import ExpertChat from './ExpertChat';

/** Small floating button that opens the car-expert chat in a side panel. */
export default function ExpertLauncher() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const contextCarId = pathname.match(/^\/(?:cars|configurator)\/([^/]+)/)?.[1];

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="expert-panel"
        aria-label={open ? 'Close car expert' : 'Ask the car expert'}
        className="fixed bottom-5 right-5 z-[55] flex h-12 items-center gap-2 border border-white/10 bg-graphite/90 px-4 backdrop-blur transition-colors hover:border-racing"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        {open ? <X size={16} /> : <MessageCircle size={16} className="text-racing" />}
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] sm:inline">{open ? 'Close' : 'Ask expert'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="expert-panel"
            role="dialog"
            aria-label="Car expert chat"
            className="fixed bottom-20 right-3 z-[55] h-[min(560px,72vh)] w-[min(400px,calc(100vw-24px))] border border-white/10 bg-graphite shadow-2xl sm:right-5"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ExpertChat contextCarId={contextCarId} compact />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
