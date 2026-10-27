import { Component, Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import CarFallback from './CarFallback';
import { hasWebGL, useIsMobile } from '../../hooks/useDevice';

/** Catches errors thrown while loading/rendering 3D (e.g. model 404) and shows the fallback. */
class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.warn('[VELOCITY] 3D scene failed, showing 2D fallback:', error);
  }
  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}

/** Loading overlay with real progress from the Three.js loading manager. */
export function LoadingOverlay() {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative h-px w-48 overflow-hidden bg-white/10">
        <div className="absolute inset-y-0 left-0 bg-racing transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-ultra text-chrome">
        Loading model {Math.round(progress)}%
      </span>
    </div>
  );
}

/**
 * Shared wrapper for every 3D view:
 *  - checks WebGL support (fallback image if missing)
 *  - catches load errors (fallback image)
 *  - shows loading progress
 *  - lowers pixel ratio on phones for smooth frame rates
 */
export default function CarCanvas({ children, camera, fallbackColor, className = '', overlay = true, ...rest }) {
  const [webgl] = useState(hasWebGL);
  const mobile = useIsMobile();
  const fallback = (
    <CarFallback color={fallbackColor} message="3D view unavailable on this device — showing a 2D preview." />
  );

  if (!webgl) return <div className={className}>{fallback}</div>;

  return (
    <div className={className}>
      <div className="relative h-full w-full">
      <ThreeErrorBoundary fallback={fallback}>
        <Canvas
          dpr={mobile ? [1, 1.25] : [1, 1.75]}
          camera={{ fov: 32, near: 0.1, far: 100, position: [5, 1.6, 6], ...camera }}
          gl={{ antialias: !mobile, powerPreference: 'high-performance', alpha: false }}
          {...rest}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
        {overlay && <LoadingOverlay />}
      </ThreeErrorBoundary>
      </div>
    </div>
  );
}
