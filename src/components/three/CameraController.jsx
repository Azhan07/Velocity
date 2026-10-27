import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { gsap } from 'gsap';

/** Preset camera positions used by the showroom & configurator. */
export const VIEWS = {
  front: { label: 'Front ¾', position: [3.9, 1.25, 5.6], target: [0, 0.5, 0] },
  side: { label: 'Profile', position: [7, 0.85, 0.2], target: [0, 0.5, 0] },
  rear: { label: 'Rear ¾', position: [-3.8, 1.5, -5.6], target: [0, 0.5, 0] },
  top: { label: 'Top', position: [0.01, 8.5, 0.8], target: [0, 0, 0] },
  // Interior: the orbit target sits 10 cm in front of the driver's eyes, so dragging feels like looking around
  interior: { label: 'Interior', position: [0.32, 1.0, -0.12], target: [0.32, 0.985, -0.02], interior: true },
};

/**
 * Orbit controls (drag to rotate, scroll/pinch to zoom) + smooth GSAP camera moves
 * whenever `view` or `resetKey` changes.
 */
export default function CameraController({ view = 'front', resetKey = 0, autoRotate = false, reduced = false, minDistance = 3.2, maxDistance = 11 }) {
  const controls = useRef();
  const { camera } = useThree();

  useEffect(() => {
    const v = VIEWS[view] || VIEWS.front;
    const c = controls.current;
    if (!c) return undefined;
    const isInterior = !!v.interior;
    // Free the zoom limits during the flight (otherwise OrbitControls would clamp the
    // camera mid-move), then lock in limits for the destination when it arrives:
    // tiny distances inside the cabin, a framed range outside.
    c.minDistance = 0.01;
    c.maxDistance = 50;
    const lockLimits = () => {
      c.minDistance = isInterior ? 0.05 : minDistance;
      c.maxDistance = isInterior ? 0.35 : maxDistance;
    };

    const duration = reduced ? 0 : 1.6;
    const tl = gsap.timeline({
      onUpdate: () => {
        camera.updateProjectionMatrix();
        c.update();
      },
      onComplete: lockLimits,
    });
    // Wider lens inside the cockpit, longer "portrait" lens outside
    tl.to(camera, { fov: isInterior ? 68 : 32, duration, ease: 'power2.inOut' }, 0);
    tl.to(camera.position, { x: v.position[0], y: v.position[1], z: v.position[2], duration, ease: 'power3.inOut' }, 0);
    tl.to(c.target, { x: v.target[0], y: v.target[1], z: v.target[2], duration, ease: 'power3.inOut' }, 0);
    return () => tl.kill();
  }, [view, resetKey, camera, reduced, minDistance, maxDistance]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      minPolarAngle={0.15}
      maxPolarAngle={view === 'interior' ? Math.PI * 0.75 : Math.PI / 2.08}
      autoRotate={autoRotate && !reduced && view !== 'interior'}
      autoRotateSpeed={0.6}
      rotateSpeed={view === 'interior' ? -0.35 : 0.7}
    />
  );
}
