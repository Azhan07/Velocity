/**
 * Synthesised engine sound using the Web Audio API.
 *
 * Why synthesised? Real engine recordings are usually copyrighted and heavy to download.
 * Instead we build a V8-style rumble from oscillators + noise + a filter. It is a
 * creative effect, not a recording of a real car. It never autoplays — the browser
 * only allows audio after the user clicks the sound toggle.
 */
class EngineSound {
  ctx = null;
  nodes = null;
  rpm = 900;
  running = false;

  start() {
    if (this.running) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = this.ctx || new AudioCtx();
    const ctx = this.ctx;
    ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.6);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 6;

    // Distortion gives the oscillators a gritty, mechanical edge
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = (i / 512) - 1;
      curve[i] = Math.tanh(x * 3.2);
    }
    shaper.curve = curve;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    const sub = ctx.createOscillator();
    sub.type = 'sine';

    const g1 = ctx.createGain(); g1.gain.value = 0.5;
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    const gs = ctx.createGain(); gs.gain.value = 0.6;

    // "Firing pulse" — amplitude modulation creates the burble between cylinders
    const lfo = ctx.createOscillator();
    lfo.type = 'triangle';
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;
    const pulse = ctx.createGain();
    pulse.gain.value = 0.65;
    lfo.connect(lfoGain).connect(pulse.gain);

    osc1.connect(g1).connect(shaper);
    osc2.connect(g2).connect(shaper);
    sub.connect(gs).connect(filter);
    shaper.connect(filter);
    filter.connect(pulse).connect(master).connect(ctx.destination);

    [osc1, osc2, sub, lfo].forEach((o) => o.start());
    this.nodes = { master, filter, osc1, osc2, sub, lfo };
    this.running = true;
    this.setRPM(this.rpm, 0);
  }

  /** rpm: roughly 800–9000 */
  setRPM(rpm, glide = 0.12) {
    this.rpm = rpm;
    if (!this.running) return;
    const t = this.ctx.currentTime;
    const firing = (rpm / 60) * 4; // V8: 4 firings per revolution
    const { osc1, osc2, sub, lfo, filter } = this.nodes;
    osc1.frequency.setTargetAtTime(firing / 2, t, glide);
    osc2.frequency.setTargetAtTime(firing, t, glide);
    sub.frequency.setTargetAtTime(firing / 4, t, glide);
    lfo.frequency.setTargetAtTime(firing / 8, t, glide);
    filter.frequency.setTargetAtTime(400 + rpm * 0.35, t, glide);
  }

  /** A quick throttle blip */
  rev() {
    if (!this.running) return;
    this.setRPM(7200, 0.08);
    setTimeout(() => this.setRPM(900, 0.35), 380);
  }

  stop() {
    if (!this.running) return;
    const { master, osc1, osc2, sub, lfo } = this.nodes;
    const t = this.ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(0, t, 0.15);
    setTimeout(() => [osc1, osc2, sub, lfo].forEach((o) => { try { o.stop(); } catch { /* already stopped */ } }), 700);
    this.running = false;
  }
}

export const engine = new EngineSound();
