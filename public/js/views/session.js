import { h, mount, icon, emblem, toast, mmss, countdown } from '../ui.js';
import * as E from '../engine.js';
import { state, act, beacon, nowMs } from '../store.js';
import { unit } from '../content.js';
import { BinauralSession, drone } from '../audio.js';
import { humanError, unitLabel } from './today.js';
import { nextStep } from './reader.js';
import { remember } from './library.js';
import { trackActivity } from '../personal.js';

const BAND_HUE = { delta: 236, theta: 214, alpha: 188, beta: 44, gamma: 326 };
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const IN = 5, OUT = 6.5; // seconds — a slow ~5 breaths per minute

export async function renderSession(root, { idx, browse = false }, ctx) {
  const r = E.realmById('protocol'); const st = state.view.realms.protocol;
  const mode = browse ? 'browse' : idx < st.ptr ? 'review' : idx === st.ptr && !st.doneToday ? 'open' : idx === st.ptr ? 'tomorrow' : 'locked';
  const back = h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: () => ctx.close() }, icon('close', 22));
  if (!Number.isInteger(idx) || idx < 0 || idx >= r.count || mode === 'locked' || mode === 'tomorrow') {
    const msg = mode === 'tomorrow' ? 'You have already done today’s session. One a day lets the nervous system consolidate.' : 'Each session opens only after the one before it has been lived.';
    return mount(root, h('div', { class: 'reader celebrate' }, h('header', { class: 'reader-top' }, back), h('div', { class: 'center rise blocked' }, h('div', { class: 'seal-ring' }, icon('lock', 28)), h('h1', { class: 'display' }, mode === 'tomorrow' ? 'Sealed until tomorrow' : 'Not yet'), h('p', { class: 'lede' }, msg), h('button', { class: 'btn ghost', onclick: () => ctx.close() }, 'Back'))));
  }
  const u = await unit('protocol', idx); if(ctx.isCurrent&&!ctx.isCurrent())return; const d = u.session; const hue = BAND_HUE[d.b]; ctx.setHue(hue);
  if(browse)remember(`#/listen/${idx}`,u.title,'Sound session');
  let activity=null;
  const total = r.seconds; let elapsed = 0, running = false, timer = null, raf = 0, done = false, sess = null;
  const canvas = h('canvas', { class: 'orb', 'aria-hidden': 'true' }); const phase = h('div', { class: 'phase', 'aria-live': 'polite' }, 'Ready'); const clock = h('div', { class: 'clock mono' }, mmss(total));
  const startBtn = h('button', { class: 'btn primary big', onclick: begin }, icon('play', 20), mode === 'review' ? 'Replay (no credit)' : 'Begin · 3 minutes');
  const pauseBtn = h('button', { class: 'btn ghost', onclick: toggle, hidden: true }, icon('pause', 18), 'Pause'); const endBtn = h('button', { class: 'btn ghost', onclick: endEarly, hidden: true }, 'End');
  const intro = h('div', { class: 'session-intro center rise' }, emblem('protocol', hue, `s${idx}`, 120), h('p', { class: 'eyebrow' }, unitLabel(r, idx), ' · ', u.kicker), h('h1', { class: 'display' }, u.title), h('p', { class: 'lede' }, u.lead),
    ...u.blocks.map(b => b.t === 'card' ? h('div', { class: 'rcard' }, h('div', { class: 'eyebrow' }, b.label), h('p', {}, b.text)) : b.t === 'note' ? h('p', { class: 'note' }, h('strong', {}, b.label + ' · '), b.text) : h('p', { class: 'p headphones' }, icon('headphones', 20), b.text)));
  const stage = h('div', { class: 'session-stage' }, canvas, h('div', { class: 'session-over' }, phase, clock), h('div', { class: 'row-center' }, pauseBtn, endBtn));
  const wrap = h('div', { class: 'reader session', style: { '--h': hue } }, h('header', { class: 'reader-top' }, back, h('div', { class: 'reader-kick' }, u.title)), h('div', { class: 'session-body' }, intro, stage, h('div', { class: 'row-center' }, startBtn)));
  stage.hidden = true; mount(root, wrap);
  wrap.addEventListener('ugt:leave', () => { activity?.finish(false);cleanup(); if (!done && mode === 'open' && elapsed >= 5) beacon('protocol', elapsed); });

  function begin() {
    drone.stop();
    activity=trackActivity({route:`#/listen/${idx}`,title:u.title,kind:'Sound session'});
    intro.hidden = true; stage.hidden = false; startBtn.hidden = true; pauseBtn.hidden = false; endBtn.hidden = false; running = true;
    sess = new BinauralSession(d); sess.start(); phase.textContent = 'Breathe in'; draw(); timer = setInterval(tick, 1000);
  }
  function toggle() { running = !running; pauseBtn.replaceChildren(icon(running ? 'pause' : 'play', 18), running ? 'Pause' : 'Resume'); if (running) { sess = new BinauralSession(d); sess.start(); } else sess && sess.stop(); phase.textContent = running ? 'Breathe in' : 'Paused'; }
  function tick() { if (!wrap.isConnected) return cleanup(); if (!running || document.hidden) return; elapsed++; clock.textContent = mmss(Math.max(0, total - elapsed)); if (elapsed >= total) finish(); }
  function cleanup() { clearInterval(timer); cancelAnimationFrame(raf); sess && sess.stop(); }
  async function endEarly() { if (mode === 'open' && elapsed >= r.minSeconds) return finish(); cleanup(); if (mode === 'open') beacon('protocol', elapsed); done = true; ctx.close(); }
  async function finish() {
    if (done) return; done = true; activity?.finish(true);remember(idx+1<r.count?`#/listen/${idx+1}`:'#/product/protocol',r.title,'Sound session');cleanup(); let ok = true;
    if (mode === 'open') { try { await act('unit/complete', { realm: 'protocol', idx, seconds: elapsed }); } catch (e) { ok = false; toast(humanError(e)); } }
    const n = ok && mode === 'open' ? nextStep() : null;
    mount(root, h('div', { class: 'reader celebrate', style: { '--h': hue } }, h('div', { class: 'center rise' }, h('div', { class: 'bigstar' }, emblem('protocol', hue, `s${idx}`, 190), h('div', { class: 'pulse' })), h('p', { class: 'eyebrow' }, 'Session complete'), h('h1', { class: 'display' }, 'Stay here a breath longer.'),
      h('p', { class: 'lede' }, mode === 'open' ? idx+1<r.count ? `Session ${idx + 2} of ${r.count} opens tomorrow.` : 'You have completed every sound session.' : browse ? 'Come back to these sessions whenever you like.' : 'Revisiting never uses up a day.'),
      h('div', { class: 'row-center' }, n ? h('button', { class: 'btn primary', onclick: () => ctx.go(n.to) }, n.label, icon('arrow', 18)) : h('button', { class: 'btn primary', onclick: () => ctx.close('#/product/protocol') }, 'Back to collection'), n && h('button', { class: 'btn ghost', onclick: () => ctx.close('#/product/protocol') }, 'Back to collection')))));
  }
  function draw() {
    const c = canvas.getContext('2d'); const dpr = Math.min(devicePixelRatio || 1, 2); const t0 = performance.now();
    const loop = now => {
      if (!canvas.isConnected) return; const w = canvas.clientWidth, hgt = canvas.clientHeight; if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = hgt * dpr; }
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, hgt); const cx = w / 2, cy = hgt / 2, base = Math.min(w, hgt) * 0.3;
      const t = running ? (now - t0) / 1000 : 0; const cyc = t % (IN + OUT); const f = reduce.matches ? 0.5 : cyc < IN ? 0.5 - 0.5 * Math.cos((cyc / IN) * Math.PI) : 0.5 + 0.5 * Math.cos(((cyc - IN) / OUT) * Math.PI);
      if (running) { const txt = cyc < IN ? 'Breathe in' : 'Breathe out'; if (phase.textContent !== txt) phase.textContent = txt; }
      const R = base * (0.55 + 0.45 * f);
      for (let i = 4; i >= 0; i--) { const rr = R * (1 + i * 0.28); c.beginPath(); c.arc(cx, cy, rr, 0, 6.283); c.strokeStyle = `hsla(${hue + i * 6},85%,${70 - i * 6}%,${0.5 - i * 0.09})`; c.lineWidth = 1.5; c.stroke(); }
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `hsla(${hue},90%,78%,.95)`); g.addColorStop(1, `hsla(${hue},85%,45%,.15)`); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.fill();
      if (!reduce.matches) raf = requestAnimationFrame(loop);
    }; raf = requestAnimationFrame(loop);
  }
}
