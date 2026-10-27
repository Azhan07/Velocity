import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { powerCurve } from '../../utils/curves';

const tooltipStyle = { background: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, fontSize: 12 };

/** Horsepower & torque vs RPM. Curves are generated (illustrative) — labelled in the UI. */
export default function PowerChart({ car }) {
  const data = powerCurve(car);
  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Power & torque</p>
          <p className="mt-1 text-sm text-chrome">Peak {car.hp.toLocaleString()} hp · {car.torque.toLocaleString()} Nm</p>
        </div>
        <span className="border border-amber-400/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-amber-200">Illustrative curve</span>
      </div>
      <div className="h-72 w-full" role="img" aria-label={`Illustrative power and torque curve for ${car.name}, peaking at ${car.hp} horsepower and ${car.torque} newton metres`}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 5, right: 0, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="hpFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#e10600" stopOpacity="0.45" />
                <stop offset="1" stopColor="#e10600" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="rpm" tick={{ fill: '#8d9096', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="rgba(255,255,255,0.1)" />
            <YAxis yAxisId="hp" tick={{ fill: '#8d9096', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
            <YAxis yAxisId="tq" orientation="right" tick={{ fill: '#8d9096', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `${v.toLocaleString()} rpm`} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#c9ccd1' }} />
            <Area yAxisId="hp" type="monotone" dataKey="hp" name="Power (hp)" stroke="#e10600" strokeWidth={2} fill="url(#hpFill)" animationDuration={1600} />
            <Line yAxisId="tq" type="monotone" dataKey="torque" name="Torque (Nm)" stroke="#c9ccd1" strokeWidth={1.5} dot={false} strokeDasharray="4 4" animationDuration={1600} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
