import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Volume2, VolumeX, X, Heart } from 'lucide-react';
import Logo from '../ui/Logo';
import { useSound } from '../../context/SoundContext';
import { useGarage } from '../../context/GarageContext';

export const NAV_LINKS = [
  { to: '/explore', label: 'Collection' },
  { to: '/showroom', label: 'Showroom' },
  { to: '/performance', label: 'Performance' },
  { to: '/advisor', label: 'Advisor' },
  { to: '/garage', label: 'Garage' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { enabled, toggle } = useSound();
  const { favorites, builds } = useGarage();
  const location = useLocation();

  // Close the mobile menu when the route changes
  useEffect(() => setOpen(false), [location.pathname]);

  // Solid background after scrolling; hide when scrolling down, show when scrolling up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  const garageCount = favorites.length + builds.length;

  return (
    <>
      <a href="#main" className="sr-only z-[90] bg-racing px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden && !open ? -90 : 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled || open ? 'border-b border-white/[0.06] bg-void/85 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <nav className="container-v flex h-16 items-center justify-between lg:h-20" aria-label="Main">
          <Link to="/" aria-label="VELOCITY home" className="relative z-10">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className="group relative block px-4 py-2">
                  {({ isActive }) => (
                    <>
                      <span className={`font-mono text-[11px] uppercase tracking-[0.24em] transition-colors ${isActive ? 'text-bone' : 'text-chrome group-hover:text-bone'}`}>
                        {l.label}
                        {l.to === '/garage' && garageCount > 0 && (
                          <span className="ml-1.5 text-racing">{garageCount}</span>
                        )}
                      </span>
                      {isActive && (
                        <motion.span layoutId="nav-active" className="absolute inset-x-4 -bottom-0.5 h-px bg-racing" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="relative z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-pressed={enabled}
              aria-label={enabled ? 'Turn engine sound off' : 'Turn engine sound on'}
              className="group flex items-center gap-2 border border-white/10 px-3 py-2 transition-colors hover:border-white/40"
            >
              {enabled ? <Volume2 size={15} className="text-racing" /> : <VolumeX size={15} className="text-chrome" />}
              {/* Little live equaliser bars */}
              <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    className={`w-[2px] ${enabled ? 'bg-racing' : 'bg-chrome/50'}`}
                    animate={enabled ? { height: ['30%', '100%', '45%', '80%', '30%'] } : { height: '30%' }}
                    transition={enabled ? { duration: 0.9, repeat: Infinity, delay: i * 0.12 } : { duration: 0.3 }}
                  />
                ))}
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-chrome sm:inline">Sound</span>
            </button>
            <Link to="/garage" className="border border-white/10 p-2.5 transition-colors hover:border-white/40 lg:hidden" aria-label={`Garage, ${garageCount} saved items`}>
              <Heart size={15} />
            </Link>
            <button
              type="button"
              className="border border-white/10 p-2.5 lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-void pt-24 lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
          >
            <ul className="container-v flex flex-col">
              {[{ to: '/', label: 'Home' }, ...NAV_LINKS].map((l, i) => (
                <motion.li
                  key={l.to}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
                  className="border-b border-white/[0.06]"
                >
                  <NavLink to={l.to} end className="flex items-baseline justify-between py-5">
                    {({ isActive }) => (
                      <>
                        <span className={`font-display text-3xl font-semibold uppercase ${isActive ? 'text-racing' : 'text-bone'}`}>{l.label}</span>
                        <span className="font-mono text-[10px] text-chrome">0{i + 1}</span>
                      </>
                    )}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
            <p className="container-v mt-auto pb-10 font-mono text-[10px] uppercase tracking-ultra text-chrome">Feel the machine. Control the experience.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
