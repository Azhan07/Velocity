import { useState } from 'react';
import { CarSilhouette } from '../three/CarFallback';
import { getPaint } from '../../data/cars';

/**
 * Studio render of a car (pre-rendered WebP images of our 3D model, in /public/images/cars).
 * `angle` = 'front' | 'side'. Falls back to an SVG silhouette if the image is missing.
 */
export const carImageSrc = (paint, angle = 'front') => `/images/cars/${paint}-${angle}.webp`;

export default function CarImage({ paint, angle = 'front', alt, className = '', loading = 'lazy' }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <CarSilhouette color={getPaint(paint).hex} className={className} />;
  return (
    <img
      src={carImageSrc(paint, angle)}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
