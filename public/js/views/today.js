import { h, mount, icon, emblem, toast, greeting, countdown, mmss, $ } from '../ui.js';
import * as E from '../engine.js';
import { state, act, nowMs } from '../store.js';
import { unit } from '../content.js';

export const ROLE = { settle: 'Arrive', learn: 'Understand', practice: 'Practise' };
export const unitLabel = (r, idx) => `${r.unit} ${idx + 1} of ${r.count}`;
export const humanError = e => (e && e.message) || 'Something went wrong.';
const MOOD_MOTIF = { heavy: 'ocean', scattered: 'orbit', steady: 'tree', bright: 'galaxy' };

export function renderToday(root, ctx) {
  const v = state.view, doc = state.doc;
  ctx.setHue(v.gateSealed ? 42 : { dawn: 22, day: 195, dusk: 300, night: 236 }[ctx.sky]);
  if (v.needsCheckin) return mount(root, checkin(v, doc, ctx));
  if (v.gateSealed) return mount(root, sealed(v, doc, ctx));
  mount(root, gate(v, doc, ctx));
}

/* ───────── 1. How are you arriving? ───────── */
function checkin(v, doc, ctx) {
  const carried = v.gate && !v.gate.complete;
  return h('section', { class: 'page narrow rise' },
    h('p', { class: 'eyebrow' }, carried ? 'Your gate waited for you' : `Day ${v.pathDay}`),
    h('h1', { class: 'display' }, `${greeting(v.hour)}, ${doc.name}.`),
    h('p', { class: 'lede' }, carried ? 'Nothing was lost while you were away. Tell me how you are arriving, and I will re-shape what is left.' : 'Before anything opens, take a breath. How are you arriving today? This shapes the gate we build for you.'),
    h('div', { class: 'moods', role: 'group', 'aria-label': 'How are you arriving' },
      E.MOODS.map(m => h('button', { class: 'mood', onclick: async e => {
        const b = e.currentTarget; b.classList.add('chosen'); document.querySelectorAll('.mood').forEach(x => (x.disabled = true));
        try { await act('gate/open', { mood: m.id }); ctx.render(); } catch (er) { toast(humanError(er)); document.querySelectorAll('.mood').forEach(x => (x.disabled = false)); b.classList.remove('chosen'); }
      } }, emblem(MOOD_MOTIF[m.id], { heavy: 236, scattered: 280, steady: 160, bright: 40 }[m.id], m.id, 64), h('span', { class: 'mood-t' }, m.label), h('span', { class: 'mood-h' }, m.hint)))),
    v.stats.streak > 0 && h('p', { class: 'fine center' }, `${v.stats.streak}-day streak · ${v.stats.daysDone} days walked`));
}

/* ───────── 2. The gate ───────── */
function gate(v, doc, ctx) {
  const g = v.gate; const units = g.stations.filter(s => s.type === 'unit'); const left = units.filter(s => !s.done).length;
  const next = g.stations.find(s => !s.done); const mins = E.GATE_LENGTHS[doc.length].mins;
  const live = h('span', { class: 'mono' }, countdown(v.nextOpenAt - nowMs()));
  const tick = setInterval(() => { if (!live.isConnected) return clearInterval(tick); const ms = v.nextOpenAt - nowMs(); if (ms <= 0) { clearInterval(tick); ctx.refresh(); } else live.textContent = countdown(ms); }, 1000);
  return h('section', { class: 'page rise' },
    h('div', { class: 'gate-head' },
      h('div', {}, h('p', { class: 'eyebrow' }, `Day ${v.pathDay} · ${E.MOODS.find(m => m.id === g.mood)?.label || ''}`), h('h1', { class: 'display' }, left ? 'Today’s Gate' : 'Everything is lived.'),
        h('p', { class: 'lede' }, left ? `${units.length} ${units.length === 1 ? 'station' : 'stations'} and a seal · about ${mins} minutes. One thing opens at a time.` : 'One last step: seal the day.')),
      left > 0 && h('button', { class: 'btn ghost', onclick: async () => { try { await act('gate/shuffle'); ctx.render(); toast('Flow shuffled'); } catch (e) { toast(humanError(e)); } }, disabled: (g.rerolls || 0) >= 5, title: 'Re-roll the stations you have not yet lived' }, icon('shuffle', 18), 'Shuffle')),
    h('ol', { class: 'stations' }, g.stations.map(s => (s.type === 'unit' ? unitStation(s, s === next, doc, ctx) : sealStation(s, left === 0, ctx)))),
    invite(g, doc, ctx),
    h('p', { class: 'fine center' }, 'The next gate opens in ', live, ' — and it will be shaped by what you do today.'));
}
function unitStation(s, isNext, doc, ctx) {
  const r = E.realmById(s.realm); const el = h('li', { class: `station ${s.done ? 'done' : ''} ${isNext ? 'next' : ''}`, style: { '--h': r.hue } });
  const title = h('span', { class: 'st-title' }, s.done ? '…' : 'Sealed — reveal when you are ready');
  if (s.done) unit(s.realm, s.idx).then(u => (title.textContent = u.title));
  const go = () => ctx.go(s.realm === 'protocol' ? `#/session/${s.idx}` : `#/read/${s.realm}/${s.idx}`);
  el.append(h('span', { class: 'node', 'aria-hidden': 'true' }, s.done ? icon('check', 16) : icon('sparkle', 16)),
    h('button', { class: 'st-card', onclick: go, 'aria-label': `${ROLE[s.role]}: ${r.title}${s.done ? ', lived' : ''}` },
      emblem(r.id, r.hue, `${r.id}${s.idx}`, 64), h('span', { class: 'st-body' }, h('span', { class: 'st-role' }, ROLE[s.role], ' · ', unitLabel(r, s.idx)), h('span', { class: 'st-name' }, r.title), title),
      h('span', { class: 'st-go' }, h('span', { class: 'st-go-t' }, s.done ? `${Math.max(1, Math.round((s.seconds || 0) / 60))} min` : isNext ? 'Begin' : 'Open'), !s.done && icon('arrow', 18))));
  return el;
}
function sealStation(s, ready, ctx) {
  let after = null; const note = h('textarea', { rows: 2, maxlength: 400, placeholder: 'One line to carry into tomorrow (optional)…', 'aria-label': 'One line to carry' });
  const btn = h('button', { class: 'btn primary wide', disabled: true, onclick: async () => { btn.disabled = true; try { await act('seal', { after, note: note.value }); ctx.render(); } catch (e) { toast(humanError(e)); btn.disabled = false; } } }, 'Seal today');
  const chips = E.AFTER.map(a => h('button', { class: 'chip', 'aria-pressed': 'false', onclick: ev => { after = a.id; chips.forEach(c => { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); }); ev.currentTarget.classList.add('on'); ev.currentTarget.setAttribute('aria-pressed', 'true'); btn.disabled = false; } }, a.label));
  return h('li', { class: `station seal ${ready ? 'next' : 'locked'}` }, h('span', { class: 'node', 'aria-hidden': 'true' }, icon(ready ? 'star' : 'lock', 16)),
    h('div', { class: 'st-card static' }, h('span', { class: 'st-body' }, h('span', { class: 'st-role' }, 'Seal'), h('span', { class: 'st-name' }, 'Close the gate'), ready
      ? h('div', { class: 'seal-form' }, h('p', { class: 'fine' }, 'How do you leave?'), h('div', { class: 'chips' }, chips), note, btn)
      : h('span', { class: 'st-title' }, 'Opens when every station above is lived.'))));
}
function invite(g, doc, ctx) {
  if (!g.invite || g.invite.done) return null; const r = E.realmById(g.invite.realm); if (!r) return null;
  return h('div', { class: 'invite', style: { '--h': r.hue } }, emblem(r.id, r.hue, 'inv' + r.id, 72), h('div', {}, h('p', { class: 'eyebrow' }, 'An invitation'), h('h3', {}, r.title), h('p', { class: 'fine' }, r.tagline)),
    h('button', { class: 'btn ghost', onclick: () => ctx.go(`#/world/${r.id}`) }, 'Enter', icon('arrow', 18)));
}

/* ───────── 3. Gate sealed — and tomorrow's reveal ───────── */
function sealed(v, doc, ctx) {
  const t = v.teaser; const live = h('span', { class: 'mono big' }, countdown(v.nextOpenAt - nowMs()));
  const tick = setInterval(() => { if (!live.isConnected) return clearInterval(tick); const ms = v.nextOpenAt - nowMs(); if (ms <= 0) { clearInterval(tick); ctx.refresh(); } else live.textContent = countdown(ms); }, 1000);
  const star = h('div', { class: 'bigstar', 'aria-hidden': 'true' }, emblem('galaxy', 42, `day${v.gate.day}`, 190), h('div', { class: 'pulse' }));
  const lived = v.gate.stations.filter(s => s.type === 'unit');
  return h('section', { class: 'page narrow center rise' }, star,
    h('p', { class: 'eyebrow' }, `Day ${v.gate.day} · sealed`), h('h1', { class: 'display' }, 'The gate is closed.'),
    h('p', { class: 'lede' }, v.stats.streak > 1 ? `${v.stats.streak} days in a row. ` : '', `${lived.length} ${lived.length === 1 ? 'thing' : 'things'} lived, ${v.stats.totalMinutes} minutes walked in all.`),
    h('div', { class: 'tomorrow' }, h('div', { class: 'seal-ring' }, icon('lock', 28)), h('p', { class: 'eyebrow' }, 'Tomorrow, sealed until midnight'), live,
      t && h('p', { class: 'teaser' }, t.line), t && t.lean.length > 0 && h('p', { class: 'fine' }, 'Tomorrow leans toward ', t.lean.map((id, i) => [i ? ' and ' : '', h('strong', {}, E.realmById(id).title)])), t && h('p', { class: 'fine faint' }, 'The exact gate is built when you arrive — from how you feel then.')),
    invite(v.gate, doc, ctx), h('div', { class: 'row-center' }, h('button', { class: 'btn ghost', onclick: () => ctx.go('#/realms') }, 'Wander the realms'), h('button', { class: 'btn ghost', onclick: () => ctx.go('#/path') }, 'See your path')));
}
