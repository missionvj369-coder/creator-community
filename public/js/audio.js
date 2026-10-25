// Web Audio — everything starts only from a user gesture, fades in/out, and stays quiet.
let ctx = null;
function ac() { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; }

/** Soft ambient pad (a perfect fifth over a low root). Toggle from the header. */
export const drone = (() => {
  let nodes = null;
  return {
    get on() { return !!nodes; },
    start(root = 144) {
      const a = ac(); if (!a || nodes) return; const master = a.createGain(); master.gain.value = 0; master.connect(a.destination);
      const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(master);
      const oscs = [[root, 0.5], [root * 1.5, 0.28], [root * 2, 0.16], [root * 3.01, 0.05]].map(([f, g], i) => { const o = a.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; const gn = a.createGain(); gn.gain.value = g; o.connect(gn).connect(lp); o.start(); return o; });
      const lfo = a.createOscillator(); lfo.frequency.value = 0.07; const lg = a.createGain(); lg.gain.value = 260; lfo.connect(lg).connect(lp.frequency); lfo.start();
      master.gain.linearRampToValueAtTime(0.05, a.currentTime + 3); nodes = { master, oscs, lfo };
    },
    stop() {
      if (!nodes) return; const a = ctx; const { master, oscs, lfo } = nodes; nodes = null; master.gain.cancelScheduledValues(a.currentTime); master.gain.setTargetAtTime(0, a.currentTime, 0.4);
      setTimeout(() => { oscs.forEach(o => o.stop()); lfo.stop(); master.disconnect(); }, 1800);
    },
  };
})();

/** A binaural session: L = carrier − beat/2, R = carrier + beat/2. Optional tremolo, soft noise, slow pan. */
export class BinauralSession {
  constructor(p) { this.p = p; this.n = null; }
  start() {
    const a = ac(); if (!a) return false; const { c, f, w = 'sine', am = 0, nz = 0, sp = 0 } = this.p; const master = a.createGain(); master.gain.value = 0; master.connect(a.destination);
    const mk = (freq, pan) => { const o = a.createOscillator(); o.type = ['sine', 'triangle', 'sawtooth', 'square'].includes(w) ? w : 'sine'; o.frequency.value = freq; const g = a.createGain(); g.gain.value = w === 'sine' ? 0.5 : 0.18; const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.max(600, c * 3); const p = a.createStereoPanner ? a.createStereoPanner() : null; if (p) p.pan.value = pan; o.connect(lp).connect(g); (p ? g.connect(p).connect(master) : g.connect(master)); o.start(); return { o, p }; };
    const L = mk(c - f / 2, -1), R = mk(c + f / 2, 1); const extra = [];
    if (am > 0) { const lfo = a.createOscillator(); lfo.frequency.value = Math.min(am, 14); const lg = a.createGain(); lg.gain.value = 0.12; lfo.connect(lg).connect(master.gain); lfo.start(); extra.push(lfo); }
    if (nz > 0) { const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = buf.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < d.length; i++) { const wn = Math.random() * 2 - 1; b0 = 0.99765 * b0 + wn * 0.099046; b1 = 0.963 * b1 + wn * 0.2965164; b2 = 0.57 * b2 + wn * 1.0526913; d[i] = (b0 + b1 + b2 + wn * 0.1848) * 0.11; } const src = a.createBufferSource(); src.buffer = buf; src.loop = true; const g = a.createGain(); g.gain.value = Math.min(1.2, nz * 9); src.connect(g).connect(master); src.start(); extra.push(src); }
    if (sp > 0 && L.p && R.p) { const lfo = a.createOscillator(); lfo.frequency.value = sp * 0.25; const lg = a.createGain(); lg.gain.value = 0.25; lfo.connect(lg); lg.connect(L.p.pan); lg.connect(R.p.pan); lfo.start(); extra.push(lfo); }
    master.gain.linearRampToValueAtTime(0.16, a.currentTime + 4); this.n = { master, L, R, extra }; return true;
  }
  stop() {
    if (!this.n) return; const a = ctx; const { master, L, R, extra } = this.n; this.n = null; master.gain.cancelScheduledValues(a.currentTime); master.gain.setValueAtTime(master.gain.value, a.currentTime); master.gain.linearRampToValueAtTime(0, a.currentTime + 1.5);
    setTimeout(() => { try { L.o.stop(); R.o.stop(); extra.forEach(n => n.stop()); master.disconnect(); } catch { /* already stopped */ } }, 1700);
  }
}
export const speak = (text, on) => { if (!on || !('speechSynthesis' in window)) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.82; u.pitch = 0.95; u.volume = 0.9; speechSynthesis.speak(u); } catch { /* unsupported */ } };
export const silence = () => { try { speechSynthesis.cancel(); } catch { /* none */ } };
