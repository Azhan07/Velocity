import { getPaint, getWheel, getInterior } from '../data/cars';

/**
 * Calculates a build price from a car + selected option ids.
 * Returns a line-by-line breakdown so the UI can show every cost.
 */
export function calculateBuild(car, { paint, wheel, interior }) {
  const p = getPaint(paint);
  const w = getWheel(wheel);
  const i = getInterior(interior);
  const lines = [
    { label: 'Base price', value: car.price },
    { label: `Paint — ${p.name}`, value: p.price },
    { label: `Wheels — ${w.name}`, value: w.price },
    { label: `Interior — ${i.name}`, value: i.price },
  ];
  const options = p.price + w.price + i.price;
  return { lines, options, total: car.price + options, paint: p, wheel: w, interior: i };
}
