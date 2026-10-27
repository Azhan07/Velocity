import { CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { accelerationCurve } from '../../utils/curves';
import { cars as allCars } from '../../data/cars';

const tooltipStyle = { background: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, fontSize: 12 };
const COLORS = ['#e10600', '#c9ccd1'];

/** Scores each car 0–100 against the best value in the whole collection. */
function score(car) {
  const max = (k) => Math.max(...allCars.map((c) => c[k]));
  const min = (k) => Math.min(...allCars.map((c) => c[k]));
  return {
    Power: Math.round((car.hp / max('hp')) * 100),
    Torque: Math.round((car.torque / max('torque')) * 100),
    'Top speed': Math.round((car.topSpeed / max('topSpeed')) * 100),
    Launch: Math.round((min('zeroTo100') / car.zeroTo100) * 100),
    Lightness: Math.round((min('weight') / car.weight) * 100),
    Value: Math.round((min('price') / car.price) * 100),
  };
}

/** Radar "performance fingerprint" for 1–2 cars */
export function RadarCompare({ cars }) {
  const scores = cars.map(score);
  const data = Object.keys(scores[0]).map((k) => {
    const row = { metric: k };
    cars.forEach((c, i) => (row[c.name] = scores[i][k]));
    return row;
  });
  return (
    <div className="h-80 w-full" role="img" aria-label={`Radar chart comparing ${cars.map((c) => c.name).join(' and ')}`}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#8d9096', fontSize: 10 }} />
          {cars.map((c, i) => (
            <Radar key={c.id} name={c.name} dataKey={c.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={i === 0 ? 0.28 : 0.12} animationDuration={1200} />
          ))}
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Speed vs time — who pulls away first? (illustrative model from quoted figures) */
export function AccelCompare({ cars }) {
  const curves = cars.map((c) => accelerationCurve(c, 12));
  const data = curves[0].map((p, i) => {
    const row = { t: p.t };
    cars.forEach((c, j) => (row[c.name] = curves[j][i].speed));
    return row;
  });
  return (
    <div className="h-72 w-full" role="img" aria-label="Illustrative speed over time comparison">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="t" tick={{ fill: '#8d9096', fontSize: 10 }} tickFormatter={(v) => `${v}s`} stroke="rgba(255,255,255,0.1)" />
          <YAxis tick={{ fill: '#8d9096', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" unit="" />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `${v} s`} formatter={(v) => `${v} km/h`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {cars.map((c, i) => (
            <Line key={c.id} type="monotone" dataKey={c.name} stroke={COLORS[i]} strokeWidth={2} dot={false} animationDuration={1500} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
