/**
 * VELOCITY API server (Express).
 *
 * Why a server? AI API keys must stay secret. The browser calls /api/advisor and
 * /api/expert on THIS server, and only this server talks to the AI provider using
 * the key from the .env file. The key is never sent to the browser.
 *
 * Without ANTHROPIC_API_KEY the endpoints return 503 and the frontend automatically
 * uses its local (offline) recommendation and expert engines.
 *
 * In production (`npm run build` then `npm run serve`) it also serves the built site.
 */
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cars, DATA_NOTICE } from '../src/data/cars.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5050;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.AI_MODEL || 'claude-sonnet-5-5';

app.use(express.json({ limit: '50kb' }));

// Compact dataset given to the model as its ONLY source of truth
const DATASET = cars.map(({ id, name, brand, year, category, price, hp, torque, zeroTo100, topSpeed, engine, transmission, drivetrain, weight, highlights, exterior, interior }) => ({
  id, name, brand, year, category, priceUSD: price, hp, torqueNm: torque, zeroTo100s: zeroTo100, topSpeedKmh: topSpeed, engine, transmission, drivetrain, weightKg: weight, highlights, exterior, interior,
}));

/** Minimal call to the Anthropic Messages API using built-in fetch (Node 18+). */
async function callClaude({ system, messages, maxTokens = 700 }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI provider error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
}

const requireKey = (req, res, next) => {
  if (!API_KEY) return res.status(503).json({ error: 'AI not configured — using local fallback.' });
  return next();
};

app.get('/api/health', (req, res) => res.json({ ok: true, ai: Boolean(API_KEY), model: API_KEY ? MODEL : null }));

/* ---------------- AI Car Advisor ---------------- */
app.post('/api/advisor', requireKey, async (req, res) => {
  const { budget, category, style, priority, features = [] } = req.body || {};
  if (typeof budget !== 'number' || budget <= 0) return res.status(400).json({ error: 'Invalid budget' });

  const system = `You are the VELOCITY car advisor. Recommend cars ONLY from this dataset (JSON):
${JSON.stringify(DATASET)}
${DATA_NOTICE}
Rules:
- Pick exactly 3 cars by their "id". Never invent cars or specifications.
- Each reason must cite real values from the dataset and explain the fit in 1–2 short sentences.
- Respond with JSON only, no markdown: {"recommendations":[{"id":"...","match":0-100,"reasons":["...","..."]}]}`;

  const user = `Budget: $${budget}. Preferred category: ${category || 'any'}. Driving style: ${style}. Top priority: ${priority}. Wanted features: ${features.join(', ') || 'none'}.`;

  try {
    const text = await callClaude({ system, messages: [{ role: 'user', content: user }], maxTokens: 600 });
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const valid = (json.recommendations || []).filter((r) => DATASET.some((c) => c.id === r.id));
    if (!valid.length) throw new Error('No valid recommendations');
    res.json({ recommendations: valid.slice(0, 3) });
  } catch (err) {
    console.error('[advisor]', err.message);
    res.status(502).json({ error: 'AI request failed' });
  }
});

/* ---------------- AI Car Expert ---------------- */
app.post('/api/expert', requireKey, async (req, res) => {
  const { messages = [], contextCarId } = req.body || {};
  // Only pass through the last 10 turns, plain text, valid roles
  const history = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!history.length || history[history.length - 1].role !== 'user') return res.status(400).json({ error: 'No question' });
  while (history[0]?.role !== 'user') history.shift();

  const system = `You are the VELOCITY Car Expert, a concise, friendly automotive assistant on a luxury supercar website.
Use ONLY this dataset for any car specification (JSON):
${JSON.stringify(DATASET)}
${DATA_NOTICE}
Rules:
- Never invent specifications, cars or prices. If something is not in the dataset, say you don't have that information.
- General automotive concepts (e.g. horsepower vs torque) may be explained from general knowledge.
- Keep answers under 120 words, plain text, no markdown headings. Use short bullet lines (•) for lists.
${contextCarId ? `- The user is currently viewing car id "${contextCarId}"; "this car" refers to it.` : ''}`;

  try {
    const reply = await callClaude({ system, messages: history, maxTokens: 500 });
    res.json({ reply });
  } catch (err) {
    console.error('[expert]', err.message);
    res.status(502).json({ error: 'AI request failed' });
  }
});

/* ---------------- Production: serve the built React app ---------------- */
if (process.env.NODE_ENV === 'production') {
  const buildDir = path.join(__dirname, '..', 'build');
  app.use(express.static(buildDir, { maxAge: '7d', index: false }));
  app.get('*', (req, res) => res.sendFile(path.join(buildDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`VELOCITY API on http://localhost:${PORT}  (AI ${API_KEY ? `enabled · ${MODEL}` : 'disabled → local fallback'})`);
});
