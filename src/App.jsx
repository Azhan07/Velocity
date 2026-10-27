import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageTransition from './components/layout/PageTransition';
import Preloader from './components/layout/Preloader';
import CustomCursor from './components/ui/CustomCursor';
import ExpertLauncher from './components/ai/ExpertLauncher';

// Pages are lazy-loaded: each page's code (and its 3D/chart libraries) downloads only when visited.
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const Configurator = lazy(() => import('./pages/Configurator'));
const Performance = lazy(() => import('./pages/Performance'));
const Garage = lazy(() => import('./pages/Garage'));
const Advisor = lazy(() => import('./pages/Advisor'));
const Showroom = lazy(() => import('./pages/Showroom'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status">
      <div className="relative h-px w-40 overflow-hidden bg-white/10">
        <div className="absolute inset-y-0 w-1/2 animate-scan bg-racing" />
      </div>
      <span className="sr-only">Loading page</span>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  // Scroll to top on every page change (or to #section when the link has a hash)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!location.hash) return undefined;
    const t = setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' }), 1200);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  const hideFooter = location.pathname.startsWith('/configurator') || location.pathname === '/showroom';

  return (
    <>
      <Preloader />
      <div className="grain" aria-hidden="true" />
      <CustomCursor />
      <Navbar />
      <main id="main">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
              <Route path="/cars/:id" element={<PageTransition><CarDetails /></PageTransition>} />
              <Route path="/configurator/:id" element={<PageTransition><Configurator /></PageTransition>} />
              <Route path="/performance" element={<PageTransition><Performance /></PageTransition>} />
              <Route path="/garage" element={<PageTransition><Garage /></PageTransition>} />
              <Route path="/advisor" element={<PageTransition><Advisor /></PageTransition>} />
              <Route path="/showroom" element={<PageTransition><Showroom /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
      {location.pathname !== '/advisor' && location.pathname !== '/showroom' && <ExpertLauncher />}
    </>
  );
}
