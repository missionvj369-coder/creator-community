import { h, mount, icon, svgEl, emblem } from '../ui.js';
import * as E from '../engine.js';
import { state } from '../store.js';

function rand(seed) { let a = 0; for (const c of String(seed)) a = (Math.imul(a, 33) + c.charCodeAt(0)) | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function sky(doc) {
  const keys = Object.keys(doc.units); const W = 360, H = 220; let s = `<svg viewBox="0 0 ${W} ${H}" class="skysvg" role="img" aria-label="${keys.length} stars lit, one for every step you have lived"><defs><filter id="gl"><feGaussianBlur stdDeviation="2.6"/></filter></defs>`;
  const rnd = rand('sky' + doc.id); for (let i = 0; i < 70; i++) s += `<circle cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * H).toFixed(1)}" r="${(0.4 + rnd() * 0.7).toFixed(2)}" fill="#fff" opacity="${(0.12 + rnd() * 0.25).toFixed(2)}"/>`;
  const pts = keys.map(k => { const [realm, idx] = k.split(':'); const r = E.realmById(realm); const g = rand(k); const u = doc.units[k]; return { x: 18 + g() * (W - 36), y: 16 + g() * (H - 32), hue: r ? r.hue : 200, size: 1.8 + Math.min(3, u.seconds / 120), k }; });
  // gentle constellation lines between nearest neighbours of the same realm
  const byRealm = {}; pts.forEach(p => (byRealm[p.k.split(':')[0]] ||= []).push(p));
  for (const list of Object.values(byRealm)) for (let i = 1; i < list.length; i++) s += `<line x1="${list[i - 1].x.toFixed(1)}" y1="${list[i - 1].y.toFixed(1)}" x2="${list[i].x.toFixed(1)}" y2="${list[i].y.toFixed(1)}" stroke="hsl(${list[i].hue} 80% 75%)" stroke-opacity=".28" stroke-width=".7"/>`;
  for (const p of pts) s += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(p.size * 2.3).toFixed(1)}" fill="hsl(${p.hue} 90% 65%)" opacity=".45" filter="url(#gl)"/><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.size.toFixed(1)}" fill="hsl(${p.hue} 95% 88%)"><title>${E.realmById(p.k.split(':')[0])?.title} — ${E.realmById(p.k.split(':')[0])?.unit} ${+p.k.split(':')[1] + 1}</title></circle>`;
  return svgEl(s + '</svg>');
}
function trail(v, doc) {
  const done = doc.daysDone.length; const total = Math.max(21, Math.ceil((done + 8) / 7) * 7); const W = 360, STEP = 78, TOP = 56; const H = TOP + total * STEP + 40;
  const pos = i => ({ x: 180 + Math.sin(i * 0.9) * 112, y: TOP + (total - i) * STEP }); // day 1 at the bottom, climbing upward
  const miles = Object.fromEntries(E.EXPERIENCES.filter(r => r.unlockAfter > 0).map(r => [r.unlockAfter, r]));
  let d = ''; for (let i = 1; i <= total; i++) { const p = pos(i); if (i === 1) d += `M ${p.x} ${p.y + 46}`; const q = i === 1 ? { x: 180, y: p.y + 46 } : pos(i - 1); const midY = (q.y + p.y) / 2; d += ` C ${q.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`; }
  const gateDay = v.gateSealed ? done : done + 1; let s = `<svg viewBox="0 0 ${W} ${H}" class="trailsvg" role="img" aria-label="Your path: ${done} days walked"><path d="${d}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/>`;
  // lit portion
  let dl = ''; for (let i = 1; i <= Math.min(done, total); i++) { const p = pos(i); if (i === 1) dl += `M ${p.x} ${p.y + 46}`; const q = i === 1 ? { x: 180, y: p.y + 46 } : pos(i - 1); const midY = (q.y + p.y) / 2; dl += ` C ${q.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`; }
  if (dl) s += `<path d="${dl}" fill="none" stroke="hsl(var(--hue) 90% 72%)" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>`;
  for (let i = 1; i <= total; i++) {
    const p = pos(i); const isDone = i <= done; const isToday = i === gateDay && !v.gateSealed; const m = miles[i - 1] || null;
    s += `<g transform="translate(${p.x} ${p.y})">`;
    if (isToday) s += `<circle r="22" fill="hsl(var(--hue) 90% 65%)" opacity=".18" class="pulse-c"/>`;
    s += `<circle r="${isToday ? 15 : 12}" fill="${isDone ? 'hsl(var(--hue) 90% 70%)' : isToday ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.05)'}" stroke="${isDone ? 'none' : isToday ? 'hsl(var(--hue) 90% 75%)' : 'rgba(255,255,255,.2)'}" stroke-width="1.6"/>`;
    s += `<text y="4.5" text-anchor="middle" font-size="12" font-weight="700" fill="${isDone ? '#0b1020' : '#f5f1ea'}" opacity="${isDone || isToday ? 1 : 0.5}">${isDone ? '✓' : i}</text>`;
    if (m) { const left = p.x > 180; s += `<g transform="translate(${left ? -22 : 22} 0)"><text x="0" y="-2" text-anchor="${left ? 'end' : 'start'}" font-size="11" fill="hsl(${m.hue} 90% 80%)" font-weight="700">${m.title}</text><text x="0" y="12" text-anchor="${left ? 'end' : 'start'}" font-size="10" fill="#f5f1ea" opacity=".6">${i <= done + 0 ? 'opened' : 'opens after day ' + (i - 1)}</text></g>`; }
    s += '</g>';
  }
  const el = svgEl(s + '</svg>'); el.dataset.focus = (pos(Math.min(gateDay, total)).y / H).toFixed(4); return el;
}

export function renderPath(root, ctx) {
  const v = state.view, doc = state.doc; ctx.setHue(210); const st = v.stats;
  const next = E.EXPERIENCES.filter(r => !state.view.realms[r.id].unlocked).sort((a, b) => a.unlockAfter - b.unlockAfter)[0];
  mount(root, h('section', { class: 'page rise' }, h('p', { class: 'eyebrow' }, 'Your path'), h('h1', { class: 'display' }, `${st.daysDone} ${st.daysDone === 1 ? 'day' : 'days'} walked.`),
    h('p', { class: 'lede' }, st.streak > 0 ? `${st.streak}-day streak · best ${st.best}. ` : 'Every sealed day lights the way. ', 'Miss a day and nothing is lost — the path simply waits for you.'),
    h('div', { class: 'card sky' }, h('div', { class: 'sky-head' }, h('h3', {}, 'Your sky'), h('span', { class: 'fine' }, `${st.units} ${st.units === 1 ? 'star' : 'stars'} · one for every step lived`)), st.units ? sky(doc) : h('p', { class: 'fine center pad' }, 'Your sky is dark — for now. Each step you live lights one star.')),
    next && h('div', { class: 'card next-world', style: { '--h': next.hue } }, emblem(next.id, next.hue, 'nw' + next.id, 64), h('div', {}, h('p', { class: 'eyebrow' }, 'Next to open'), h('h3', {}, next.title), h('p', { class: 'fine' }, `After ${next.unlockAfter} sealed days — ${state.view.realms[next.id].need} to go.`)), h('div', { class: 'bar' }, h('i', { style: { width: `${Math.min(100, (st.daysDone / next.unlockAfter) * 100)}%` } }))),
    h('div', { class: 'card trail' }, h('h3', {}, 'The winding road'), (() => { const tr = trail(v, doc); const sc = h('div', { class: 'trail-scroll' }, tr); requestAnimationFrame(() => { sc.scrollTop = Math.max(0, tr.clientHeight * +tr.dataset.focus - sc.clientHeight * 0.55); }); return sc; })())));
}
