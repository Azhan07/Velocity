import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import CarModel from './CarModel';
import StudioLights from './StudioLights';
import Floor from './Floor';
import { onReady } from '../../utils/ready';

/**
 * Camera "keyframes" for the scroll story, written as an orbit around the car:
 *   az = angle around the car (0 = front), el = height angle, r = distance.
 * Interpolating angles (instead of positions) makes the camera ORBIT smoothly
 * instead of flying through the car.
 */
export const SHOTS = [
  { az: 38, el: 9, r: 7.8, target: [-1.3, 0.55, 0.6], light: '#e10600' }, // hero (car framed right of the headline)
  { az: 16, el: 4, r: 4.3, target: [0.35, 0.5, 1.5], light: '#dfe8ff' }, // headlights
  { az: 90, el: 3, r: 6.9, target: [0, 0.5, 0], light: '#ffb27a' }, // profile
  { az: 200, el: 15, r: 6.4, target: [0, 0.55, -0.3], light: '#e10600' }, // rear
  { az: 310, el: 58, r: 8.4, target: [0, 0, 0], light: '#3f6bff' }, // overhead
];

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function sampleShot(progress) {
  const seg = Math.min(SHOTS.length - 2, Math.floor(progress * (SHOTS.length - 1)));
  const local = smooth(Math.min(1, Math.max(0, progress * (SHOTS.length - 1) - seg)));
  const a = SHOTS[seg];
  const b = SHOTS[seg + 1];
  return {
    az: lerp(a.az, b.az, local),
    el: lerp(a.el, b.el, local),
    r: lerp(a.r, b.r, local),
    target: a.target.map((v, i) => lerp(v, b.target[i], local)),
    lightA: a.light,
    lightB: b.light,
    mix: local,
  };
}

/** Light streaks racing along the floor while the car "drives" in */
function SpeedStreaks({ speedRef }) {
  const group = useRef();
  const streaks = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        x: (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random() * 5),
        z: -20 + Math.random() * 40,
        len: 1 + Math.random() * 4,
        y: 0.01 + Math.random() * 0.02,
      })),
    []
  );
  useFrame((_, dt) => {
    const s = speedRef.current;
    if (!group.current) return;
    group.current.children.forEach((m, i) => {
      const st = streaks[i];
      st.z += s * dt * 1.4;
      if (st.z > 20) st.z -= 40;
      m.position.set(st.x, st.y, st.z);
      m.scale.z = st.len * (0.3 + Math.min(1, s / 20) * 2);
      m.material.opacity = Math.min(0.7, s / 18);
    });
  });
  return (
    <group ref={group}>
      {streaks.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.02, 0.005, 1]} />
          <meshBasicMaterial color={i % 4 === 0 ? '#ff2a1f' : '#ffffff'} transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The homepage 3D scene.
 * progressRef: 0..1 scroll progress (set by GSAP ScrollTrigger — no React re-renders)
 * pointerRef:  -1..1 mouse position for parallax
 */
export default function HeroScene({ progressRef, pointerRef, reduced = false, mobile = false, paint = 'racing-red' }) {
  const { camera } = useThree();
  const car = useRef();
  const keyLight = useRef();
  const sweep = useRef();
  const spinRef = useRef(0);
  const lightsRef = useRef(reduced ? 1 : 0);
  const speedRef = useRef(0);
  const intro = useRef({ started: reduced, t: reduced ? 99 : 0 });
  const look = useMemo(() => new THREE.Vector3(), []);
  const aim = useMemo(() => new THREE.Vector3(), []);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);

  // Start the entrance once the preloader opens
  useEffect(() => onReady(() => (intro.current.started = true)), []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const it = intro.current;

    // ---- 1. Entrance: car rolls in from the dark, wheels spinning, then settles ----
    if (it.started && it.t < 99) it.t += d;
    const DURATION = 3.2;
    const k = Math.min(1, it.started ? it.t / DURATION : 0);
    const ease = 1 - Math.pow(1 - k, 3); // easeOutCubic
    const z = reduced ? 0 : lerp(-16, 0, ease);
    if (car.current) car.current.position.z = z;
    const velocity = reduced ? 0 : (16 * 3 * Math.pow(1 - k, 2)) / DURATION; // derivative of the ease
    speedRef.current = velocity;
    spinRef.current = velocity / 0.34; // wheel radius ≈ 0.34 m

    // Headlights flicker on as it arrives
    if (!reduced) {
      const t = it.t;
      lightsRef.current = t < 0.5 ? 0 : t < 0.6 ? 1 : t < 0.7 ? 0.1 : t < 0.85 ? 1 : t < 0.95 ? 0.3 : Math.min(1, 0.3 + (t - 0.95) * 3);
    }

    // ---- 2. Scroll-driven camera orbit ----
    let p = progressRef.current || 0;
    if (reduced) {
      // Reduced motion: hard cuts between shots instead of continuous movement
      p = Math.round(p * (SHOTS.length - 1)) / (SHOTS.length - 1);
    }
    const shot = sampleShot(p);
    const px = reduced ? 0 : pointerRef.current.x;
    const py = reduced ? 0 : pointerRef.current.y;
    const az = THREE.MathUtils.degToRad(shot.az + px * 6);
    const el = THREE.MathUtils.degToRad(Math.max(1, shot.el + py * 3));
    const r = shot.r * (mobile ? 1.45 : 1) + (reduced ? 0 : (1 - ease) * 1.5);

    const tx = shot.target[0];
    const ty = shot.target[1];
    const tz = shot.target[2] + z * 0.35; // follow the car a little during the entrance
    const cx = tx + Math.sin(az) * Math.cos(el) * r;
    const cy = ty + Math.sin(el) * r;
    const cz = tz + Math.cos(az) * Math.cos(el) * r;

    const damp = reduced ? 1 : 1 - Math.exp(-d * 4);
    camera.position.x += (cx - camera.position.x) * damp;
    camera.position.y += (cy - camera.position.y) * damp;
    camera.position.z += (cz - camera.position.z) * damp;
    look.lerp(aim.set(tx, ty, tz), damp);
    camera.lookAt(look);

    // ---- 3. Section lighting colour blends with the scroll ----
    if (keyLight.current) {
      colA.set(shot.lightA);
      colB.set(shot.lightB);
      keyLight.current.color.copy(colA.lerp(colB, shot.mix));
    }

    // ---- 4. A light that sweeps over the body every few seconds (reflection streak) ----
    if (sweep.current && !reduced) {
      const s = (state.clock.elapsedTime % 6) / 6;
      sweep.current.position.set(lerp(-6, 6, s), 2.2, lerp(3, -3, s));
      sweep.current.intensity = Math.sin(s * Math.PI) * 30;
    }
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 9, 26]} />
      <StudioLights preset="studio" />
      <spotLight ref={keyLight} position={[-4, 5, -4]} angle={0.6} penumbra={1} intensity={60} color="#e10600" />
      <pointLight ref={sweep} position={[0, 2, 0]} intensity={0} distance={8} color="#ffffff" />
      <group ref={car}>
        <CarModel paint={paint} spinRef={spinRef} lightsRef={lightsRef} />
      </group>
      <Floor />
      {!reduced && <SpeedStreaks speedRef={speedRef} />}
      {!reduced && (
        <>
          <Sparkles count={mobile ? 30 : 70} scale={[14, 4, 14]} position={[0, 2, 0]} size={2} speed={0.25} opacity={0.5} color="#ffffff" />
          <Sparkles count={mobile ? 12 : 28} scale={[10, 3, 10]} position={[0, 1.5, 0]} size={3} speed={0.35} opacity={0.6} color="#ff3b2f" />
        </>
      )}
    </>
  );
}
