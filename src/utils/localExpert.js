import { cars, DATA_NOTICE } from '../data/cars';

/**
 * LOCAL "car expert" — a small rule-based assistant used when the AI server is offline.
 * It only answers from the dataset, so it can never invent specifications.
 */
const fmtPrice = (n) => (n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n / 1000)}K`);
const fullName = (c) => (c.name.startsWith(c.brand) ? c.name : `${c.brand} ${c.name}`);
const line = (c) => `${fullName(c)} — ${c.hp.toLocaleString()} hp, ${c.torque.toLocaleString()} Nm, 0–100 in ${c.zeroTo100} s, ${c.topSpeed} km/h, ${fmtPrice(c.price)}`;

const escape = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasWord = (text, word) => new RegExp(`(^|[^a-z0-9])${escape(word)}($|[^a-z0-9])`).test(text);

/** Finds which cars a question mentions, by full name first, then by a distinctive first word. */
function findCars(text) {
  const t = text.toLowerCase();
  let found = cars.filter((c) => hasWord(t, c.name.toLowerCase()));
  // "Sabre 9 Track" also contains "Sabre 9" — keep only the longest match
  found = found.filter((c) => !found.some((o) => o !== c && o.name.toLowerCase().includes(c.name.toLowerCase())));
  if (found.length) return found;
  const seen = new Set();
  return cars.filter((c) => {
    const first = c.name.toLowerCase().split(' ')[0];
    if (first.length < 2 || seen.has(first) || !hasWord(t, first)) return false;
    seen.add(first);
    return true;
  });
}

export function answerLocal(question, contextCarId) {
  const q = question.toLowerCase();
  let mentioned = findCars(q);
  if (!mentioned.length && contextCarId && /this|it\b|its\b/.test(q)) mentioned = cars.filter((c) => c.id === contextCarId);

  const best = (key, dir = 'max') => [...cars].sort((a, b) => (dir === 'max' ? b[key] - a[key] : a[key] - b[key]))[0];

  // Concept explanations
  if (/horsepower/.test(q) && /torque/.test(q) && /(difference|explain|vs|versus|what)/.test(q)) {
    return 'Torque is the twisting force the engine makes — it is what you feel pushing you into the seat, especially at low revs. Horsepower is how fast that work is done: power = torque × rpm. High torque gives instant shove; high horsepower lets the car keep accelerating at high speed. Electric cars, like the Aurion E9 (2,300 Nm), deliver peak torque from 0 rpm, which is why they launch so hard.';
  }

  // Compare two named cars
  if (mentioned.length >= 2 || /compare|vs|versus/.test(q)) {
    if (mentioned.length >= 2) {
      const [a, b] = mentioned;
      const faster = a.zeroTo100 < b.zeroTo100 ? a : b;
      const stronger = a.hp > b.hp ? a : b;
      const verdict = stronger === faster ? `The ${stronger.name} is both more powerful and quicker to 100 km/h.` : `The ${stronger.name} has more power, while the ${faster.name} is quicker to 100 km/h.`;
      return `${line(a)}.\n${line(b)}.\n\n${verdict} Open the Performance lab to see them side by side.`;
    }
    return 'Tell me two car names to compare — for example “Compare VX-1 Apex and Aurion E9”.';
  }

  // Superlatives
  if (/(most|highest|biggest).*(power|horsepower|hp)|most powerful/.test(q)) {
    const c = best('hp');
    return `The most powerful car in the collection is the ${line(c)}.`;
  }
  if (/(most|highest).*torque/.test(q)) return `Most torque: ${line(best('torque'))}.`;
  if (/(fastest|quickest).*(0|accel|launch|100)|quickest|best acceleration/.test(q)) return `Quickest to 100 km/h: ${line(best('zeroTo100', 'min'))}.`;
  if (/top speed|fastest/.test(q)) return `Highest top speed: ${line(best('topSpeed'))}.`;
  if (/cheapest|least expensive|lowest price|affordable/.test(q)) return `Most affordable: ${line(best('price', 'min'))}.`;
  if (/most expensive|priciest/.test(q)) return `Most expensive: ${line(best('price'))}.`;
  if (/lightest/.test(q)) return `Lightest: ${fullName(best('weight', 'min'))} at ${best('weight', 'min').weight} kg.`;

  // Features of a specific car
  if (mentioned.length === 1) {
    const c = mentioned[0];
    return `${fullName(c)} (${c.year}, ${c.category}). ${c.description}\n\nSpecs: ${c.engine}, ${c.transmission}, ${c.drivetrain}. ${line(c)}.\nExterior: ${c.exterior.join(', ')}.\nInterior: ${c.interior.join(', ')}.`;
  }

  // Use-case questions
  if (/weekend|fun|canyon|mountain/.test(q)) {
    const picks = cars.filter((c) => c.weight < 1650 && c.hp > 550).sort((a, b) => a.weight - b.weight).slice(0, 3);
    return `For weekend driving I’d look at light, responsive cars:\n${picks.map((c) => `• ${line(c)}`).join('\n')}`;
  }
  if (/daily|every ?day|commute|practical/.test(q)) {
    const picks = cars.filter((c) => c.highlights.some((h) => /daily|practical|comfort|quiet/i.test(h)));
    return `Most usable day to day:\n${picks.map((c) => `• ${line(c)}`).join('\n')}`;
  }
  if (/track|circuit|lap/.test(q)) {
    const picks = cars.filter((c) => c.category === 'Track');
    return `Built for the track:\n${picks.map((c) => `• ${line(c)}`).join('\n')}`;
  }
  if (/electric|ev\b/.test(q)) {
    return `Electric models:\n${cars.filter((c) => c.engineType === 'Electric').map((c) => `• ${line(c)}`).join('\n')}`;
  }

  return `I can answer questions about the ${cars.length} cars in the VELOCITY collection — try “Which car has the highest horsepower?”, “Compare Kestrel RS and Sabre 9”, or “Explain horsepower vs torque”. (${DATA_NOTICE})`;
}
