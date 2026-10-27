import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import CarModel from './CarModel';
import StudioLights, { LIGHTING } from './StudioLights';
import Floor from './Floor';
import CameraController from './CameraController';

/** Ceiling of light bars that gives the showroom its architectural look */
function LightBars({ color = '#ffffff' }) {
  return (
    <group position={[0, 4.2, 0]}>
      {[-3, -1.5, 0, 1.5, 3].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.06, 0.02, 9]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Back wall panels that glow softly — gives depth behind the car */
function BackWall({ accent }) {
  return (
    <group position={[0, 0, -8]}>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[(i - 4) * 1.8, 2, 0]}>
          <planeGeometry args={[1.6, 4]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.06, 0.05]}>
        <planeGeometry args={[16, 0.04]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Showroom scene. Changing `car` plays a "turntable swap": the old car spins and sinks
 * through the floor while the new one rises — done with refs inside useFrame.
 */
export default function ShowroomScene({ paint, carKey, view, resetKey, lighting = 'studio', autoRotate, reduced, mobile }) {
  const turntable = useRef();
  const swap = useRef({ t: 1, from: carKey });
  const env = LIGHTING.find((l) => l.id === lighting) || LIGHTING[0];
  const accent = lighting === 'night' ? '#2f7bff' : lighting === 'sunset' ? '#ff9b4a' : '#e10600';

  useEffect(() => {
    if (swap.current.from !== carKey) {
      swap.current = { t: reduced ? 1 : 0, from: carKey };
    }
  }, [carKey, reduced]);

  useFrame((_, dt) => {
    const s = swap.current;
    if (!turntable.current) return;
    if (s.t < 1) {
      s.t = Math.min(1, s.t + dt / 1.4);
      // Rise from below with a 360° spin, easing out
      const e = 1 - Math.pow(1 - s.t, 4);
      turntable.current.position.y = (1 - e) * -1.6;
      turntable.current.rotation.y = (1 - e) * Math.PI * 2;
    } else {
      turntable.current.position.y = 0;
    }
  });

  return (
    <>
      <color attach="background" args={[env.bg]} />
      <fog attach="fog" args={[env.bg, 10, 28]} />
      <StudioLights preset={lighting} />
      <spotLight position={[0, 7, 0]} angle={0.5} penumbra={1} intensity={70} color={lighting === 'sunset' ? '#ffc58f' : '#ffffff'} />
      <group ref={turntable}>
        <CarModel paint={paint} />
      </group>
      <Floor ring color={lighting === 'night' ? '#07080d' : '#0a0a0b'} />
      <LightBars color={lighting === 'sunset' ? '#ffd2a1' : '#ffffff'} />
      <BackWall accent={accent} />
      {!reduced && <Sparkles count={mobile ? 20 : 50} scale={[12, 5, 12]} position={[0, 2.5, 0]} size={1.6} speed={0.2} opacity={0.35} />}
      <CameraController view={view} resetKey={resetKey} autoRotate={autoRotate} reduced={reduced} />
    </>
  );
}
