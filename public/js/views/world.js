import { h, mount, icon, emblem, toast, mmss } from '../ui.js';
import * as E from '../engine.js';
import { state, act, beacon } from '../store.js';
import { humanError } from './today.js';

export function renderWorld(root, { realm }, ctx) {
  const r = E.realmById(realm); const back = h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: () => ctx.close() }, icon('close', 22));
  if (!r || r.kind !== 'experience') return mount(root, h('div', { class: 'reader celebrate' }, h('header', { class: 'reader-top' }, back), h('div', { class: 'center blocked' }, h('h1', { class: 'display' }, 'Not found'))));
  ctx.setHue(r.hue); const st = state.view.realms[realm];
  if (!st.unlocked) return mount(root, h('div', { class: 'reader celebrate', style: { '--h': r.hue } }, h('header', { class: 'reader-top' }, back), h('div', { class: 'center rise blocked' }, emblem(r.id, r.hue, 'w' + r.id, 150), h('div', { class: 'seal-ring' }, icon('lock', 28)), h('h1', { class: 'display' }, r.title), h('p', { class: 'lede' }, `This world opens after ${r.unlockAfter} sealed ${r.unlockAfter === 1 ? 'day' : 'days'} on your path — ${st.need} to go.`), h('button', { class: 'btn ghost', onclick: () => ctx.close() }, 'Back'))));

  let seconds = 0, done = false; const timeEl = h('span', { class: 'mono chip-time' }, '0:00');
  const finishBtn = h('button', { class: 'btn primary small', hidden: true, onclick: () => complete() }, icon('check', 16), 'Finish');
  const frame = h('iframe', { class: 'world-frame', src: `/realms/${r.file}?embedded=1`, title: r.title, allow: 'autoplay; fullscreen; accelerometer; gyroscope', loading: 'eager' });
  const wrap = h('div', { class: 'world', style: { '--h': r.hue } }, h('header', { class: 'world-bar' }, back, h('div', { class: 'world-title' }, r.title), timeEl, finishBtn), frame);
  mount(root, wrap);
  const timer = setInterval(() => { if (!wrap.isConnected) return clearInterval(timer); if (document.hidden || done) return; seconds++; timeEl.textContent = mmss(seconds).replace(/^0/, ''); if (seconds >= r.minSeconds && finishBtn.hidden) { finishBtn.hidden = false; toast('This visit now counts — finish whenever you are ready.'); } }, 1000);
  wrap.addEventListener('ugt:leave', async () => {
    clearInterval(timer); if (done) return; done = true;
    if (seconds >= r.minSeconds) { try { await act('experience/complete', { realm, seconds }); toast(`${r.title} — visit counted`); } catch { beacon(realm, seconds); } } else beacon(realm, seconds);
  });
  async function complete() { finishBtn.disabled = true; ctx.close(); }
}
