import { recommendLocal } from './localAdvisor';
import { answerLocal } from './localExpert';
import { getCar } from '../data/cars';

/**
 * Frontend AI client. It ONLY talks to our own server (/api/...).
 * The server holds the API key — the browser never sees it.
 * If the server or AI service is unavailable, we fall back to the local engines.
 */
async function post(url, body, timeoutMs = 25000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function getRecommendations(prefs) {
  try {
    const data = await post('/api/advisor', prefs);
    // Keep only ids that really exist in our dataset (protects against invented cars)
    const recs = (data.recommendations || []).filter((r) => getCar(r.id)).slice(0, 3);
    if (!recs.length) throw new Error('Empty AI response');
    return { source: 'ai', recommendations: recs };
  } catch (err) {
    return { source: 'local', recommendations: recommendLocal(prefs), note: err.message };
  }
}

export async function askExpert(messages, contextCarId) {
  try {
    const data = await post('/api/expert', { messages, contextCarId });
    if (!data.reply) throw new Error('Empty AI response');
    return { source: 'ai', reply: data.reply };
  } catch (err) {
    const last = messages[messages.length - 1]?.content || '';
    return { source: 'local', reply: answerLocal(last, contextCarId), note: err.message };
  }
}
