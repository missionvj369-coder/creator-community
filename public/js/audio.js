import {cinemaSound} from './cinema-sound.js';
// Web Audio — everything starts only from a user gesture, fades in/out, and stays quiet.
let ctx = null,nativeCounter=0;
function ac() { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; }

export const drone={get on(){return cinemaSound.enabled;},start(){return cinemaSound.enable();},stop(){cinemaSound.mute();}};

/** A binaural session: L = carrier − beat/2, R = carrier + beat/2. Optional tremolo, soft noise, slow pan. */
export class BinauralSession {
  constructor(p) { this.p = p; this.n = null; this.paused=false; }
  start() {
    if(this.n)return this.resume();
    const a = ac(); if (!a) return false; const { c, f, w = 'sine', am = 0, nz = 0, sp = 0 } = this.p; const master = a.createGain(); master.gain.value = 0;const output=a.createGain();output.gain.value=0;const transport=a.createGain();transport.gain.value=1;master.connect(transport).connect(output).connect(a.destination);const release=cinemaSound.attachNative(a,output,`binaural-${++nativeCounter}`);cinemaSound.enable();
    const mk = (freq, pan) => { const o = a.createOscillator(); o.type = ['sine', 'triangle', 'sawtooth', 'square'].includes(w) ? w : 'sine'; o.frequency.value = freq; const g = a.createGain(); g.gain.value = w === 'sine' ? 0.5 : 0.18; const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.max(600, c * 3); const p = a.createStereoPanner ? a.createStereoPanner() : null; if (p) p.pan.value = pan; o.connect(lp).connect(g); (p ? g.connect(p).connect(master) : g.connect(master)); o.start(); return { o, p }; };
    const L = mk(c - f / 2, -1), R = mk(c + f / 2, 1); const extra = [];
    if (am > 0) { const lfo = a.createOscillator(); lfo.frequency.value = Math.min(am, 14); const lg = a.createGain(); lg.gain.value = 0.12; lfo.connect(lg).connect(master.gain); lfo.start(); extra.push(lfo); }
    if (nz > 0) { const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = buf.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < d.length; i++) { const wn = Math.random() * 2 - 1; b0 = 0.99765 * b0 + wn * 0.099046; b1 = 0.963 * b1 + wn * 0.2965164; b2 = 0.57 * b2 + wn * 1.0526913; d[i] = (b0 + b1 + b2 + wn * 0.1848) * 0.11; } const src = a.createBufferSource(); src.buffer = buf; src.loop = true; const g = a.createGain(); g.gain.value = Math.min(1.2, nz * 9); src.connect(g).connect(master); src.start(); extra.push(src); }
    if (sp > 0 && L.p && R.p) { const lfo = a.createOscillator(); lfo.frequency.value = sp * 0.25; const lg = a.createGain(); lg.gain.value = 0.25; lfo.connect(lg); lg.connect(L.p.pan); lg.connect(R.p.pan); lfo.start(); extra.push(lfo); }
    master.gain.linearRampToValueAtTime(0.16, a.currentTime + 4); this.paused=false;this.n = { master, L, R, extra,output,transport,release }; return true;
  }
  pause(){if(!this.n||this.paused)return;this.paused=true;const p=this.n.transport.gain;p.cancelScheduledValues(ctx.currentTime);p.setTargetAtTime(0,ctx.currentTime,.012);}
  resume(){if(!this.n)return this.start();ac();this.paused=false;const p=this.n.transport.gain;p.cancelScheduledValues(ctx.currentTime);p.setTargetAtTime(1,ctx.currentTime,.035);return true;}
  get active(){return !!this.n&&!this.paused&&ctx?.state==='running';}
  stop() {
    if(!this.n)return;const a=ctx,{master,L,R,extra,output,transport,release}=this.n;this.n=null;this.paused=true;
    transport.gain.cancelScheduledValues(a.currentTime);transport.gain.setTargetAtTime(0,a.currentTime,.025);
    setTimeout(()=>{try{L.o.stop();R.o.stop();extra.forEach(n=>n.stop());master.disconnect();transport.disconnect();output.disconnect();}catch{}finally{release();}},150);
  }
}
export const speak = (text, on) => {if(on)cinemaSound.enable(); if (!on || !('speechSynthesis' in window)) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.82; u.pitch = 0.95; u.volume=cinemaSound.prefs.volume*cinemaSound.prefs.voiceLevel;cinemaSound.stopVoice();cinemaSound.duck('speak',true);u.onend=u.onerror=()=>cinemaSound.duck('speak',false); speechSynthesis.speak(u); } catch { /* unsupported */ } };
export const silence = () => {cinemaSound.duck('speak',false); try { speechSynthesis.cancel(); } catch { /* none */ } };
