import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CarModel from './CarModel';
import StudioLights from './StudioLights';
import Floor from './Floor';
import CameraController from './CameraController';
import { getPaint } from '../../data/cars';

/** A ring of light that ripples across the floor in the new colour whenever paint changes. */
function PaintRipple({ paint, reduced }) {
  const ring = useRef();
  const state = useRef({ t: 1 });
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced || !ring.current) return;
    ring.current.material.color.set(getPaint(paint).hex).multiplyScalar(2.2);
    state.current.t = 0;
  }, [paint, reduced]);

  useFrame((_, dt) => {
    const s = state.current;
    if (!ring.current) return;
    if (s.t < 1) s.t = Math.min(1, s.t + dt / 1.3);
    const e = 1 - Math.pow(1 - s.t, 3);
    ring.current.scale.setScalar(0.5 + e * 9);
    ring.current.material.opacity = (1 - s.t) * 0.9;
  });

  return (
    <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.006}>
      <ringGeometry args={[0.48, 0.5, 96]} />
      <meshBasicMaterial transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function ConfiguratorScene({ paint, wheel, interior, view, resetKey, lighting, reduced, onCapabilities }) {
  const bg = lighting === 'night' ? '#04050a' : lighting === 'sunset' ? '#0b0604' : '#070707';
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 10, 26]} />
      <StudioLights preset={lighting} />
      <spotLight position={[2, 7, 3]} angle={0.5} penumbra={1} intensity={60} />
      <CarModel paint={paint} wheel={wheel} interior={interior} onCapabilities={onCapabilities} />
      <Floor />
      <PaintRipple paint={paint} reduced={reduced} />
      <CameraController view={view} resetKey={resetKey} reduced={reduced} />
    </>
  );
}
