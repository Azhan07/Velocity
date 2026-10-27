import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SectionHeading from '../components/ui/SectionHeading';
import Speedometer from '../components/performance/Speedometer';
import PowerChart from '../components/performance/PowerChart';
import CompareTool from '../components/performance/CompareTool';
import DataNotice from '../components/ui/DataNotice';
import { carLabel, cars } from '../data/cars';

const tooltipStyle = { background: '#141416', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, fontSize: 12 };
const BOARDS = [
  { key: 'hp', label: 'Horsepower', unit: 'hp', sort: (a, b) => b.hp - a.hp },
  { key: 'zeroTo100', label: '0–100 km/h', unit: 's', sort: (a, b) => a.zeroTo100 - b.zeroTo100 },
  { key: 'topSpeed', label: 'Top speed', unit: 'km/h', sort: (a, b) => b.topSpeed - a.topSpeed },
  { key: 'torque', label: 'Torque', unit: 'Nm', sort: (a, b) => b.torque - a.torque },
];

export default function Performance() {
  const [carId, setCarId] = useState(cars[0].id);
  const [board, setBoard] = useState(BOARDS[0]);
  const car = cars.find((c) => c.id === carId);
  const ranked = [...cars].sort(board.sort).map((c) => ({ name: c.name, value: c[board.key], id: c.id }));

  return (
    <div className="pb-10 pt-32 lg:pt-40">
      <div className="container-v">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow="Performance lab" title="Numbers that move you" as="h1">
            Launch simulations, power curves, leaderboards and head-to-head comparisons for the whole collection.
          </SectionHeading>
          <DataNotice />
        </div>

        {/* ===== Lab: single car ===== */}
        <section className="mt-16" aria-labelledby="lab-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="lab-title" className="text-xl font-semibold uppercase">01 · The lab</h2>
            <label className="flex items-center gap-3">
              <span className="eyebrow">Car</span>
              <select value={carId} onChange={(e) => setCarId(e.target.value)} className="field w-auto py-2.5">
                {cars.map((c) => <option key={c.id} value={c.id}>{carLabel(c)}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Speedometer car={car} />
            <PowerChart car={car} />
          </div>
        </section>

        {/* ===== Leaderboard ===== */}
        <section className="mt-24" aria-labelledby="board-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="board-title" className="text-xl font-semibold uppercase">02 · Leaderboard</h2>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Leaderboard metric">
              {BOARDS.map((b) => (
                <button key={b.key} type="button" onClick={() => setBoard(b)} aria-pressed={board.key === b.key} className={`chip ${board.key === b.key ? 'chip-active' : ''}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <div className="h-[420px]" role="img" aria-label={`Leaderboard by ${board.label}. Leader: ${ranked[0].name} with ${ranked[0].value} ${board.unit}`}>
              <ResponsiveContainer>
                <BarChart data={ranked} layout="vertical" margin={{ top: 0, right: 24, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#8d9096', fontSize: 10 }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#c9ccd1', fontSize: 11 }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v) => [`${v} ${board.unit}`, board.label]} />
                  <Bar dataKey="value" animationDuration={1100} barSize={18}>
                    {ranked.map((r, i) => <Cell key={r.id} fill={i === 0 ? '#e10600' : r.id === carId ? '#f2f0ec' : '#3a3b40'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ===== Compare ===== */}
        <section className="mt-24" aria-labelledby="compare-title">
          <h2 id="compare-title" className="mb-6 text-xl font-semibold uppercase">03 · Head to head</h2>
          <CompareTool />
        </section>
      </div>
    </div>
  );
}
