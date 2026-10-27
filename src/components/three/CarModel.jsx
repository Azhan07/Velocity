import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getInterior, getPaint, getWheel } from '../../data/cars';

export const MODEL_URL = '/models/ferrari.glb';
export const DRACO_PATH = '/draco/'; // decoder files are served locally from /public/draco

/**
 * The realistic 3D car.
 *
 * HOW CUSTOMISATION WORKS
 * The GLB file has separately named parts ("body", "rim_fl", "leather", "glass" ...).
 * We give each group of parts its own material, so changing the paint only touches
 * the "body" mesh — glass, tyres, lights and trim never change colour.
 *
 * If a future model is missing those names, `onCapabilities` reports which options
 * are NOT supported, and the configurator disables them instead of pretending.
 *
 * Animated values (wheel spin, headlight glow) come in as refs, so they can change
 * 60 times a second WITHOUT re-rendering React.
 */
export default function CarModel({
  paint = 'racing-red',
  wheel = 'standard',
  interior = 'black',
  spinRef, // { current: radians per second }
  lightsRef, // { current: 0..1 headlight intensity }
  onCapabilities,
  shadow = true,
  ...props
}) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);
  const aoMap = useLoader(THREE.TextureLoader, '/models/ferrari_ao.png');

  // Clone so several viewers (or pages) never share/overwrite each other's materials.
  const model = useMemo(() => scene.clone(true), [scene]);

  // One material per "group" of parts.
  const mats = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({
        color: '#c10b0b', metalness: 0.6, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.03,
      }),
      rim: new THREE.MeshStandardMaterial({ color: '#b9bcc2', metalness: 1, roughness: 0.28 }),
      caliper: new THREE.MeshStandardMaterial({ color: '#3a3b3f', metalness: 0.6, roughness: 0.4 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#0d0f12', metalness: 0.2, roughness: 0.02, transparent: true, opacity: 0.45, clearcoat: 1,
      }),
      leather: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.55, metalness: 0.05 }),
      trim: new THREE.MeshStandardMaterial({ color: '#1c1c1c', roughness: 0.5, metalness: 0.1 }),
      panel: new THREE.MeshStandardMaterial({ color: '#0e0e0f', roughness: 0.7 }),
      carbon: new THREE.MeshStandardMaterial({ color: '#1b1c20', metalness: 0.4, roughness: 0.32 }),
      carpet: new THREE.MeshStandardMaterial({ color: '#111113', roughness: 0.95 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#d9dce1', metalness: 1, roughness: 0.12 }),
      caps: new THREE.MeshStandardMaterial({ color: '#1a1a1c', metalness: 0.9, roughness: 0.3 }),
      headlights: new THREE.MeshStandardMaterial({
        color: '#ffffff', emissive: '#e8f1ff', emissiveIntensity: 0, roughness: 0.1, metalness: 0.2,
      }),
      tail: new THREE.MeshStandardMaterial({ color: '#4a0000', emissive: '#ff1a0a', emissiveIntensity: 0.4, roughness: 0.2 }),
    }),
    []
  );

  // Collect part references once and assign materials.
  const parts = useMemo(() => {
    const found = { body: false, rims: 0, leather: false, glass: false, wheels: [] };
    model.traverse((o) => {
      if (o.name?.startsWith('wheel_')) found.wheels.push(o);
      if (!o.isMesh) return;
      o.castShadow = false;
      o.receiveShadow = false;
      // GLTFLoader makes duplicate names unique ("brake", "brake_1" …) — strip that suffix
      const n = o.name.replace(/_\d+$/, '');
      if (n === 'body') { o.material = mats.body; found.body = true; }
      else if (n.startsWith('rim_')) { o.material = mats.rim; found.rims += 1; }
      else if (n === 'wheel') o.material = mats.rim; // the spoke face of each wheel
      else if (n === 'brake') o.material = mats.caliper;
      else if (n === 'glass') { o.material = mats.glass; found.glass = true; }
      else if (n === 'leather' || n === 'steering_leather') { o.material = mats.leather; found.leather = true; }
      else if (n === 'trim' || n === 'steering_trim') o.material = mats.trim;
      else if (n === 'interior_dark') o.material = mats.panel;
      // De-badge: neutralise the yellow centre caps & blue badge for our concept look
      else if (n === 'centre' || n === 'yellow_trim' || n === 'steering_centre' || n === 'blue') o.material = mats.caps;
      else if (n === 'chrome' || n === 'metal') o.material = mats.chrome;
      else if (n.startsWith('carbon') || n === 'steering_carbon') o.material = mats.carbon;
      else if (n === 'carpet') o.material = mats.carpet;
      else if (n === 'lights') o.material = mats.headlights;
      else if (n === 'lights_red') o.material = mats.tail;
    });
    return found;
  }, [model, mats]);

  // Tell the parent which customisations this model genuinely supports.
  useEffect(() => {
    onCapabilities?.({ paint: parts.body, wheels: parts.rims >= 4, interior: parts.leather });
  }, [parts, onCapabilities]);

  // Target colours — the actual colour eases toward these every frame (smooth paint morph).
  const target = useRef({
    body: new THREE.Color(), rim: new THREE.Color(), caliper: new THREE.Color(),
    leather: new THREE.Color(), trim: new THREE.Color(), panel: new THREE.Color(),
    bodyMetal: 0.6, bodyRough: 0.22, rimMetal: 1, rimRough: 0.3,
  });

  useEffect(() => {
    const p = getPaint(paint);
    const t = target.current;
    t.body.set(p.hex); t.bodyMetal = p.metalness; t.bodyRough = p.roughness;
  }, [paint]);

  useEffect(() => {
    const w = getWheel(wheel);
    const t = target.current;
    t.rim.set(w.hex); t.rimMetal = w.metalness; t.rimRough = w.roughness;
    t.caliper.set(w.accent || '#3a3b3f');
  }, [wheel]);

  useEffect(() => {
    const i = getInterior(interior);
    const t = target.current;
    t.leather.set(i.leather); t.trim.set(i.trim); t.panel.set(i.panel);
  }, [interior]);

  // Snap to the initial colours on first mount (no fade-in from red)
  const first = useRef(true);
  useFrame((_, delta) => {
    const t = target.current;
    const k = first.current ? 1 : 1 - Math.exp(-delta * 3.2);
    first.current = false;
    mats.body.color.lerp(t.body, k);
    mats.body.metalness += (t.bodyMetal - mats.body.metalness) * k;
    mats.body.roughness += (t.bodyRough - mats.body.roughness) * k;
    mats.rim.color.lerp(t.rim, k);
    mats.rim.metalness += (t.rimMetal - mats.rim.metalness) * k;
    mats.rim.roughness += (t.rimRough - mats.rim.roughness) * k;
    mats.caliper.color.lerp(t.caliper, k);
    mats.leather.color.lerp(t.leather, k);
    mats.trim.color.lerp(t.trim, k);
    mats.panel.color.lerp(t.panel, k);

    const spin = spinRef?.current || 0;
    if (spin) for (const w of parts.wheels) w.rotation.x -= spin * delta;

    const glow = lightsRef ? lightsRef.current : 1;
    mats.headlights.emissiveIntensity = glow * 3.2;
    mats.tail.emissiveIntensity = 0.3 + glow * 1.6;
  });

  return (
    <group {...props}>
      {/* The source model faces -Z; we turn it so the nose points +Z (toward the default camera) */}
      <group rotation-y={Math.PI}>
      <primitive object={model} />
      {shadow && (
        // Baked ambient-occlusion "contact shadow" that ships with the model — cheap & realistic.
        <mesh rotation-x={-Math.PI / 2} position-y={0.002} renderOrder={2}>
          <planeGeometry args={[0.655 * 4, 1.3 * 4]} />
          <meshBasicMaterial map={aoMap} blending={THREE.MultiplyBlending} toneMapped={false} transparent premultipliedAlpha />
        </mesh>
      )}
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL, DRACO_PATH);
