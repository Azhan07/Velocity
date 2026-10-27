/**
 * 2D fallback shown when WebGL is unavailable or the 3D model fails to load.
 * An original SVG silhouette (not a copy of any real car), tinted with the paint colour.
 */
export function CarSilhouette({ color = '#c10b0b', className = '' }) {
  return (
    <svg viewBox="0 0 640 220" className={className} role="img" aria-label="Supercar silhouette">
      <defs>
        <linearGradient id="sil-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="sil-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#1b1e24" />
          <stop offset="1" stopColor="#3a414c" />
        </linearGradient>
        <radialGradient id="sil-shadow">
          <stop offset="0" stopColor="#000" stopOpacity="0.8" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="320" cy="188" rx="290" ry="18" fill="url(#sil-shadow)" />
      <path
        d="M40 160 C40 140 60 128 92 122 L180 108 C220 80 270 62 330 60 C390 58 430 70 470 96 L560 112 C590 118 606 134 606 152 L606 162 C606 170 600 174 590 174 L520 174 C516 140 470 128 452 160 L452 174 L200 174 C196 140 150 128 132 160 L132 174 L56 174 C46 174 40 170 40 160 Z"
        fill="url(#sil-body)"
      />
      <path d="M200 106 C236 82 276 72 326 72 C372 72 404 80 436 98 L300 104 Z" fill="url(#sil-glass)" />
      <path d="M560 128 L598 136" stroke="#f5f7ff" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 140 L74 136" stroke="#ff2a1f" strokeWidth="4" strokeLinecap="round" />
      {[166, 486].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="166" r="36" fill="#0b0b0c" />
          <circle cx={cx} cy="166" r="24" fill="none" stroke="#9da2a8" strokeWidth="5" />
          <circle cx={cx} cy="166" r="6" fill="#9da2a8" />
        </g>
      ))}
    </svg>
  );
}

export default function CarFallback({ color, message }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6 text-center">
      <CarSilhouette color={color} className="w-full max-w-xl" />
      {message && <p className="max-w-sm font-mono text-[11px] uppercase tracking-[0.2em] text-chrome">{message}</p>}
    </div>
  );
}
