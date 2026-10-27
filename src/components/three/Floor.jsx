import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Glossy showroom floor with a soft radial fade so its edge disappears into the dark.
 * Uses a canvas-generated texture — no image download needed.
 */
export default function Floor({ color = '#0a0a0b', radius = 14, ring = true }) {
  const alphaMap = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.55, '#888');
    grad.addColorStop(1, '#000');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
        <circleGeometry args={[radius, 64]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.32} transparent alphaMap={alphaMap} />
      </mesh>
      {ring && (
        // Thin glowing turntable ring
        <mesh rotation-x={-Math.PI / 2} position-y={0.004}>
          <ringGeometry args={[3.35, 3.38, 128]} />
          <meshBasicMaterial color="#e10600" transparent opacity={0.55} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
