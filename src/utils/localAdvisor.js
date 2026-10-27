import { cars } from '../data/cars';

/**
 * LOCAL recommendation engine — works with no internet and no API key.
 * Every car gets points for matching the user's answers; the top 3 win.
 * Reasons are built only from real dataset values, so nothing is invented.
 */
export const STYLES = [
  { id: 'daily', label: 'Daily driving' },
  { id: 'weekend', label: 'Weekend canyon runs' },
  { id: 'track', label: 'Track days' },
  { id: 'touring', label: 'Long-distance touring' },
];

export const PRIORITIES = [
  { id: 'acceleration', label: 'Acceleration' },
  { id: 'topSpeed', label: 'Top speed' },
  { id: 'power', label: 'Raw power' },
  { id: 'value', label: 'Value for money' },
  { id: 'comfort', label: 'Comfort' },
];

export const FEATURES = [
  { id: 'electric', label: 'Electric' },
  { id: 'awd', label: 'All-wheel drive' },
  { id: 'manual', label: 'Manual gearbox' },
  { id: 'nat-asp', label: 'Naturally aspirated' },
  { id: 'lightweight', label: 'Lightweight' },
  { id: 'open-top', label: 'Open-top' },
  { id: 'practical', label: '2+2 / practical' },
];

const has = {
  electric: (c) => c.engineType === 'Electric',
  awd: (c) => c.drivetrain === 'AWD',
  manual: (c) => /manual/i.test(c.transmission),
  'nat-asp': (c) => /naturally aspirated/i.test(c.engine),
  lightweight: (c) => c.weight < 1450,
  'open-top': (c) => /spyder|soft top|roof/i.test(`${c.name} ${c.exterior.join(' ')}`),
  practical: (c) => /2\+2|four|4 full|practical|daily/i.test(`${c.interior.join(' ')} ${c.highlights.join(' ')}`),
};

export function recommendLocal(prefs) {
  const { budget, category, style, priority, features = [] } = prefs;
  const max = (k) => Math.max(...cars.map((c) => c[k]));
  const min = (k) => Math.min(...cars.map((c) => c[k]));

  const scored = cars.map((c) => {
    let score = 0;
    const reasons = [];

    // Budget is the strongest factor
    if (c.price <= budget) {
      score += 30;
      reasons.push(`Fits your ${budget >= 1e6 ? `$${(budget / 1e6).toFixed(1)}M` : `$${Math.round(budget / 1000)}K`} budget at ${c.price >= 1e6 ? `$${(c.price / 1e6).toFixed(2)}M` : `$${Math.round(c.price / 1000)}K`}.`);
    } else {
      score -= 40 * (c.price / budget - 1);
    }

    if (category !== 'any' && c.category === category) {
      score += 18;
      reasons.push(`It is a ${c.category.toLowerCase()}, the category you asked for.`);
    }

    // Driving style
    const styleFit = {
      daily: c.highlights.some((h) => /daily|practical|comfort|quiet/i.test(h)) || c.category === 'Grand Tourer',
      weekend: c.weight < 1650 && c.hp > 550,
      track: c.category === 'Track' || c.weight < 1450,
      touring: c.category === 'Grand Tourer' || /touring|comfort|range/i.test(c.highlights.join(' ')),
    }[style];
    if (styleFit) {
      score += 15;
      reasons.push({
        daily: 'It is one of the more usable, comfortable cars in the collection.',
        weekend: `${c.hp} hp in a ${c.weight} kg car is ideal for spirited weekend roads.`,
        track: `At ${c.weight} kg with a ${c.transmission.toLowerCase()}, it is built for lap times.`,
        touring: 'Its grand-touring setup suits long distances.',
      }[style]);
    }

    // Priority
    const pr = {
      acceleration: (min('zeroTo100') / c.zeroTo100) * 20,
      topSpeed: (c.topSpeed / max('topSpeed')) * 20,
      power: (c.hp / max('hp')) * 20,
      value: (c.hp / c.price / Math.max(...cars.map((x) => x.hp / x.price))) * 20,
      comfort: c.category === 'Grand Tourer' ? 20 : c.category === 'Track' ? 2 : 10,
    }[priority];
    score += pr || 0;
    if (priority === 'acceleration') reasons.push(`0–100 km/h in ${c.zeroTo100} s.`);
    if (priority === 'topSpeed') reasons.push(`Top speed of ${c.topSpeed} km/h.`);
    if (priority === 'power') reasons.push(`${c.hp.toLocaleString()} hp and ${c.torque.toLocaleString()} Nm.`);
    if (priority === 'value') reasons.push(`${Math.round(c.hp / (c.price / 100000))} hp per $100K — strong value.`);

    // Features
    features.forEach((f) => {
      if (has[f]?.(c)) {
        score += 8;
        reasons.push(`Has the ${FEATURES.find((x) => x.id === f).label.toLowerCase()} you wanted.`);
      }
    });

    return { car: c, score, reasons: reasons.slice(0, 4) };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s, i) => ({ id: s.car.id, match: Math.max(40, Math.min(98, Math.round(60 + s.score / 3) - i * 3)), reasons: s.reasons }));
}
