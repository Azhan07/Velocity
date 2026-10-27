/**
 * Generates ILLUSTRATIVE power & torque curves from a car's peak figures.
 * Real dyno curves are not available for concept cars, so we draw a plausible
 * shape: torque builds, plateaus, then fades; power = torque × rpm.
 * Electric cars get a flat-torque-then-falling shape. Charts label this clearly.
 */
export function powerCurve(car, points = 18) {
  const electric = car.engineType === 'Electric';
  const max = car.redline;
  const raw = [];
  for (let i = 0; i <= points; i++) {
    const rpm = Math.round(1000 + ((max - 1000) * i) / points);
    const x = (rpm - 1000) / (max - 1000); // 0..1
    let tq;
    if (electric) tq = x < 0.35 ? 1 : 1 - (x - 0.35) * 1.05;
    else tq = x < 0.45 ? 0.62 + x * 0.85 : 1 - (x - 0.45) * 0.55;
    raw.push({ rpm, tq: Math.max(0.2, Math.min(1, tq)) });
  }
  // power ∝ torque × rpm, then scale so the peak equals the quoted hp
  const pw = raw.map((p) => p.tq * p.rpm);
  const peakPw = Math.max(...pw);
  return raw.map((p, i) => ({
    rpm: p.rpm,
    torque: Math.round(p.tq * car.torque),
    hp: Math.round((pw[i] / peakPw) * car.hp),
  }));
}

/** Rough illustrative speed-vs-time curve for a launch (0 → top speed). */
export function accelerationCurve(car, seconds = 12) {
  // Calibrated so speed reaches 100 km/h at the quoted 0–100 time
  const k = -Math.log(1 - 100 / car.topSpeed) / car.zeroTo100;
  return Array.from({ length: seconds * 2 + 1 }, (_, i) => {
    const t = i / 2;
    return { t, speed: Math.round(car.topSpeed * (1 - Math.exp(-k * t))) };
  });
}

/** Speed at time t (seconds) using the same model — used by the speedometer simulation. */
export function speedAt(car, t) {
  const k = -Math.log(1 - 100 / car.topSpeed) / car.zeroTo100;
  return car.topSpeed * (1 - Math.exp(-k * t));
}
