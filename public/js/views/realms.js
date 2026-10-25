import { h, mount, icon, emblem, sheet, toast, prettyDate, svgEl } from '../ui.js';
import * as E from '../engine.js';
import { state } from '../store.js';
import { titlesOf, journeyPart } from '../content.js';
import { ROLE } from './today.js';

let filter = 'all';
const FILTERS = [['all', 'Everything'], ['seq', 'Daily paths'], ['exp', 'Worlds'], ['settle', 'Arrive'], ['learn', 'Understand'], ['practice', 'Practise']];
const pass = r => filter === 'all' || (filter === 'seq' && r.kind === 'sequence') || (filter === 'exp' && r.kind === 'experience') || r.role === filter;

const ring = (p, hue) => svgEl(`<svg class="pring" viewBox="0 0 36 36" width="44" height="44" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="3"/><circle cx="18" cy="18" r="15" fill="none" stroke="hsl(${hue} 85% 70%)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(p * 94.2).toFixed(1)} 94.2" transform="rotate(-90 18 18)"/></svg>`);
export const target = r => (r.kind === 'experience' ? `#/world/${r.id}` : r.id === 'protocol' ? `#/session/${state.view.realms.protocol.ptr}` : `#/read/${r.id}/${state.view.realms[r.id].ptr}`);

function status(r) {
  const s = state.view.realms[r.id];
  if (r.kind === 'experience') return !s.unlocked ? { t: `Opens in ${s.need} ${s.need === 1 ? 'day' : 'days'}`, k: 'locked' } : { t: s.sessions ? `Visited ${s.sessions}×` : 'Open — enter any time', k: 'open' };
  if (s.finished) return { t: 'Complete', k: 'done' }; if (s.doneToday) return { t: 'Next opens tomorrow', k: 'wait' };
  return { t: `${r.unit} ${s.ptr + 1} is ready`, k: 'open' };
}

export function renderRealms(root, ctx) {
  ctx.setHue(260);
  const grid = h('div', { class: 'grid' }); const chips = h('div', { class: 'chips scroll', role: 'group', 'aria-label': 'Filter realms' });
  const paint = () => {
    mount(chips, FILTERS.map(([id, label]) => h('button', { class: `chip ${filter === id ? 'on' : ''}`, 'aria-pressed': String(filter === id), onclick: () => { filter = id; paint(); } }, label)));
    mount(grid, E.REALMS.filter(pass).map(r => {
      const s = state.view.realms[r.id]; const st = status(r);
      return h('button', { class: `realm ${st.k}`, style: { '--h': r.hue }, onclick: () => open(r, ctx), 'aria-label': `${r.title}. ${st.t}` },
        h('div', { class: 'realm-art' }, emblem(r.id, r.hue, r.id, 92), r.kind === 'sequence' ? ring(s.ptr / r.count, r.hue) : st.k === 'locked' ? h('span', { class: 'lockbadge' }, icon('lock', 16)) : null),
        h('div', { class: 'realm-t' }, h('span', { class: 'realm-role' }, ROLE[r.role], ' · ', r.kind === 'sequence' ? 'Daily path' : 'World'), h('h3', {}, r.title), h('p', {}, r.tagline)),
        h('div', { class: 'realm-s' }, r.kind === 'sequence' ? h('span', { class: 'mono' }, `${s.ptr}/${r.count}`) : null, h('span', { class: `pill ${st.k}` }, st.t)));
    }));
  };
  paint();
  mount(root, h('section', { class: 'page rise' }, h('p', { class: 'eyebrow' }, 'Everything the path holds'), h('h1', { class: 'display' }, 'Realms'),
    h('p', { class: 'lede' }, 'Daily paths reveal one step at a time, and only once you have lived the one before. Worlds open as your days add up. Your gate will weave them together — or you can wander.'),
    h('div', { class: 'toolbar' }, chips, h('button', { class: 'btn ghost', onclick: () => surprise(ctx) }, icon('shuffle', 18), 'Surprise me')), grid));
}
function surprise(ctx) {
  const pool = E.REALMS.filter(r => { const s = state.view.realms[r.id]; return r.kind === 'experience' ? s.unlocked : s.openIdx != null; });
  if (!pool.length) return toast('Everything open has been lived today. Rest well — more reveals tomorrow.');
  const r = pool[Math.floor(Math.random() * pool.length)]; toast(`Today’s surprise: ${r.title}`); setTimeout(() => ctx.go(target(r)), 450);
}

function open(r, ctx) {
  const s = state.view.realms[r.id]; const st = status(r); const hist = h('div', { class: 'hist' });
  const cta = r.kind === 'experience'
    ? (s.unlocked ? h('button', { class: 'btn primary wide', onclick: () => { sh.close(); ctx.go(target(r)); } }, 'Enter this world', icon('arrow', 18)) : h('p', { class: 'note' }, `Opens after ${r.unlockAfter} sealed days — ${s.need} more.`))
    : s.finished ? h('p', { class: 'note' }, 'You have walked all of it. Revisit any step below.') : s.doneToday ? h('p', { class: 'note' }, `You opened ${r.unit.toLowerCase()} ${s.ptr} today. The next one reveals tomorrow.`)
      : h('button', { class: 'btn primary wide', onclick: () => { sh.close(); ctx.go(target(r)); } }, `Open ${r.unit.toLowerCase()} ${s.ptr + 1}`, icon('arrow', 18));
  const body = h('div', { class: 'realm-sheet', style: { '--h': r.hue } }, emblem(r.id, r.hue, r.id, 120), h('p', { class: 'eyebrow' }, ROLE[r.role], ' · ', r.kind === 'sequence' ? `${r.count} ${r.unit.toLowerCase()}s, one a day` : 'An immersive world'), h('h2', { class: 'display sm' }, r.title), h('p', { class: 'lede' }, r.tagline),
    r.kind === 'sequence' && h('div', { class: 'bar' }, h('i', { style: { width: `${(s.ptr / r.count) * 100}%` } })), r.kind === 'sequence' && h('p', { class: 'fine' }, `${s.ptr} of ${r.count} lived`), cta, hist);
  const sh = sheet(body, { label: r.title });
  if (r.kind === 'sequence' && s.ptr > 0) {
    hist.append(h('h3', { class: 'sub' }, 'Already lived'));
    titlesOf(r.id).then(ts => { let lastPart = ''; for (let i = 0; i < s.ptr; i++) { if (r.id === 'journey') { const p = journeyPart(i); if (p !== lastPart) { hist.append(h('p', { class: 'eyebrow part' }, p)); lastPart = p; } } const rec = state.doc.units[`${r.id}:${i}`]; hist.append(h('button', { class: 'hist-row', onclick: () => { sh.close(); ctx.go(r.id === 'protocol' ? `#/session/${i}` : `#/read/${r.id}/${i}`); } }, h('span', { class: 'mono' }, String(i + 1).padStart(2, '0')), h('span', {}, ts[i]), h('span', { class: 'fine' }, rec ? prettyDate(rec.date) : ''))); } });
  }
  if (r.kind === 'sequence' && s.ptr < r.count) hist.append(h('p', { class: 'fine faint sealedline' }, `${r.count - s.ptr - (s.doneToday ? 0 : 1)} more, sealed until their day.`));
}
