import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Bot, User, Trash2, AlertCircle } from 'lucide-react';
import { askExpert } from '../../utils/aiClient';

const SUGGESTIONS = [
  'Which car has the highest horsepower?',
  'Compare VX-1 Apex and Aurion E9',
  'Which model is suitable for weekend driving?',
  'Explain the difference between horsepower and torque',
  'What are the main features of the Monarch V12?',
];

const WELCOME = {
  role: 'assistant',
  content: 'Hi — I’m the VELOCITY car expert. Ask me about any car in the collection, or about how performance works.',
};

/** Chat UI for the AI car expert. Uses the server AI when available, otherwise the local engine. */
export default function ExpertChat({ contextCarId, compact = false }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);
  const scroller = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setError(null);
    setInput('');
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setLoading(true);
    try {
      // Don't send the canned welcome message to the server
      const res = await askExpert(next.filter((m) => m !== WELCOME), contextCarId);
      setSource(res.source);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply, source: res.source }]);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`flex h-full flex-col ${compact ? '' : 'card'}`}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulseRed rounded-full bg-racing" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver">Car expert</p>
          {source && (
            <span className="border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-chrome">
              {source === 'ai' ? 'AI' : 'Offline mode'}
            </span>
          )}
        </div>
        <button type="button" onClick={() => { setMessages([WELCOME]); setSource(null); }} className="p-1.5 text-chrome hover:text-bone" aria-label="Clear conversation">
          <Trash2 size={14} />
        </button>
      </div>

      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite" aria-label="Conversation">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center border ${m.role === 'user' ? 'border-white/15' : 'border-racing/50 text-racing'}`} aria-hidden="true">
                {m.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </span>
              <p className={`max-w-[82%] whitespace-pre-line px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-steel text-bone' : 'border border-white/[0.06] bg-carbon text-silver'}`}>
                <span className="sr-only">{m.role === 'user' ? 'You: ' : 'Expert: '}</span>
                {m.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-3" role="status">
            <span className="flex h-7 w-7 items-center justify-center border border-racing/50 text-racing"><Bot size={13} /></span>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-chrome" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} />
              ))}
            </span>
            <span className="sr-only">Thinking…</span>
          </div>
        )}
        {error && (
          <p className="flex items-center gap-2 text-xs text-racing" role="alert"><AlertCircle size={13} /> {error}</p>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="flex gap-2 overflow-x-auto px-5 pb-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => send(s)} className="chip shrink-0 normal-case tracking-normal">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t border-white/[0.06] p-3"
      >
        <label className="flex-1">
          <span className="sr-only">Ask the car expert</span>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about any car…" className="field py-2.5" maxLength={500} />
        </label>
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary btn-sm px-4 disabled:opacity-40" aria-label="Send question">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
