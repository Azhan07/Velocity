import { Environment, Lightformer } from '@react-three/drei';

/**
 * Lighting environments built from "Lightformers" — glowing panels that the car
 * paint reflects. They are generated in the browser, so NO large HDR file is
 * downloaded (faster loading, works offline).
 */
export const LIGHTING = [
  { id: 'studio', name: 'Studio', bg: '#060606' },
  { id: 'night', name: 'Night City', bg: '#04050a' },
  { id: 'sunset', name: 'Golden Hour', bg: '#0b0604' },
];

function StudioRig() {
  return (
    <>
      <Lightformer form="rect" intensity={2.4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
      {[-6, -2, 2, 6].map((x) => (
        <Lightformer key={x} form="rect" intensity={1.2} position={[x, 4, -2]} rotation-x={Math.PI / 2} scale={[1, 6, 1]} />
      ))}
      <Lightformer form="rect" intensity={1.4} position={[-6, 1.5, 0]} rotation-y={Math.PI / 2} scale={[12, 1.2, 1]} />
      <Lightformer form="rect" intensity={1.4} position={[6, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[12, 1.2, 1]} />
      <Lightformer form="ring" color="#e10600" intensity={1.6} position={[0, 2, -9]} scale={4} />
    </>
  );
}

function NightRig() {
  return (
    <>
      <Lightformer form="rect" intensity={0.8} color="#7d8dff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 2, 1]} />
      <Lightformer form="rect" intensity={3} color="#ff2a1f" position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 0.25, 1]} />
      <Lightformer form="rect" intensity={3} color="#2f7bff" position={[7, 1, -2]} rotation-y={-Math.PI / 2} scale={[8, 0.25, 1]} />
      <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, 0.6, 8]} scale={[16, 0.12, 1]} />
      <Lightformer form="circle" intensity={2} color="#b04dff" position={[3, 3, -8]} scale={2} />
    </>
  );
}

function SunsetRig() {
  return (
    <>
      <Lightformer form="rect" intensity={3.5} color="#ff9b4a" position={[-8, 2, -4]} rotation-y={Math.PI / 3} scale={[10, 4, 1]} />
      <Lightformer form="rect" intensity={1} color="#ffd9b0" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#5468a8" position={[8, 2, 4]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} />
    </>
  );
}

export default function StudioLights({ preset = 'studio' }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      {/* key="..." forces the env-map to re-bake when the preset changes */}
      <Environment key={preset} resolution={256} frames={1}>
        <color attach="background" args={['#000000']} />
        {preset === 'night' ? <NightRig /> : preset === 'sunset' ? <SunsetRig /> : <StudioRig />}
      </Environment>
    </>
  );
}
