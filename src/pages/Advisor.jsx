import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Cpu, WifiOff } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import AdvisorForm from '../components/ai/AdvisorForm';
import ExpertChat from '../components/ai/ExpertChat';
import CarImage from '../components/cars/CarImage';
import DataNotice from '../components/ui/DataNotice';
import { getCar } from '../data/cars';
import { getRecommendations } from '../utils/aiClient';
import { formatPrice } from '../utils/format';

function MatchRing({ value }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14" role="img" aria-label={`${value}% match`}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <motion.circle
        cx="28" cy="28" r={r} fill="none" stroke="#e10600" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} transform="rotate(-90 28 28)"
      />
      <text x="28" y="32" textAnchor="middle" fontSize="12" className="fill-bone font-display">{value}</text>
    </svg>
  );
}

export default function Advisor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (prefs) => {
    setLoading(true);
    setResult(null);
    const res = await getRecommendations(prefs);
    setResult(res);
    setLoading(false);
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return (
    <div className="container-v pb-10 pt-32 lg:pt-40">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow="Advisor" title="Find your machine" as="h1">
          Answer five questions and get three matches from the collection — each with the reasons it fits you. Works offline too.
        </SectionHeading>
        <DataNotice />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <AdvisorForm onSubmit={submit} loading={loading} />

        <div id="results" className="scroll-mt-28">
          {!result && !loading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 border border-dashed border-white/10 p-10 text-center">
              <Cpu size={26} className="text-racing" />
              <p className="font-display uppercase">Your matches appear here</p>
              <p className="max-w-xs text-sm text-chrome">Adjust the answers and press “Find my car”.</p>
            </div>
          )}
          {loading && (
            <div className="space-y-4" role="status" aria-label="Loading recommendations">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card h-40 overflow-hidden">
                  <div className="h-full w-1/2 animate-scan bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                </div>
              ))}
            </div>
          )}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-chrome">
                  {result.source === 'ai' ? <><Cpu size={12} className="text-racing" /> AI recommendations</> : <><WifiOff size={12} /> Offline recommendations (local engine)</>}
                </p>
                {result.recommendations.map((r, i) => {
                  const car = getCar(r.id);
                  return (
                    <motion.article
                      key={r.id}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className={`card grid overflow-hidden sm:grid-cols-[180px_1fr] ${i === 0 ? 'border-racing/40' : ''}`}
                    >
                      <div className="relative aspect-[16/10] bg-[radial-gradient(ellipse_at_50%_85%,#202024_0%,#0b0b0c_70%)] sm:aspect-auto">
                        {i === 0 && <span className="absolute left-2 top-2 z-10 bg-racing px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em]">Best match</span>}
                        <CarImage paint={car.defaultPaint} angle="front" alt={`${car.name} render`} className="absolute inset-0 h-full w-full object-contain p-3" />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="eyebrow">{car.brand} · {car.category}</p>
                            <h3 className="mt-1 text-xl font-semibold uppercase">{car.name}</h3>
                          </div>
                          {r.match && <MatchRing value={Math.round(r.match)} />}
                        </div>
                        <ul className="mt-3 space-y-1.5 text-sm text-silver">
                          {(r.reasons || []).map((x) => <li key={x} className="flex gap-2"><span className="text-racing">—</span>{x}</li>)}
                        </ul>
                        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-chrome">
                          <div><dt className="sr-only">Power</dt><dd>{car.hp} hp</dd></div>
                          <div><dt className="sr-only">0-100</dt><dd>{car.zeroTo100}s 0–100</dd></div>
                          <div><dt className="sr-only">Top speed</dt><dd>{car.topSpeed} km/h</dd></div>
                          <div><dt className="sr-only">Price</dt><dd>{formatPrice(car.price)}</dd></div>
                        </dl>
                        <div className="mt-4 flex gap-2">
                          <Link to={`/cars/${car.id}`} className="btn-ghost btn-sm">Details <ArrowUpRight size={12} /></Link>
                          <Link to={`/configurator/${car.id}`} className="btn-primary btn-sm">Configure</Link>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="mt-24" aria-labelledby="expert-title">
        <SectionHeading eyebrow="Car expert" title="Ask anything">
          Questions about the collection or how performance works. Answers come only from our dataset.
        </SectionHeading>
        <div className="mt-8 h-[560px]">
          <ExpertChat />
        </div>
      </section>
    </div>
  );
}
