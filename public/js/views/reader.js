import { h, mount, icon, emblem, svgEl, toast, countdown, mmss, prettyDate } from '../ui.js';
import { wallpaperSVG, downloadWallpaper } from '../ui.js';
import * as E from '../engine.js';
import { state, act, beacon, nowMs } from '../store.js';
import { unit, journeyPart } from '../content.js';
import { unitLabel, humanError } from './today.js';
import { speak, silence } from '../audio.js';
import { remember } from './library.js';
import { trackActivity } from '../personal.js';

/** Where does the flow lead after finishing something? */
export function nextStep() {
  const g = state.view && state.view.gate; if (!g || g.complete || g.date !== state.view.today) return null;
  const s = g.stations.find(x => !x.done); if (!s) return null;
  if (s.type === 'seal') return { label: 'Seal the day', to: '#/today' };
  const r = E.realmById(s.realm); return { label: `Next: ${r.title}`, to: s.realm === 'protocol' ? `#/session/${s.idx}` : `#/read/${s.realm}/${s.idx}` };
}

export async function renderReader(root, { realm, idx, browse = false }, ctx) {
  const r = E.realmById(realm); const st = state.view.realms[realm];
  if (!r || r.kind !== 'sequence' || !Number.isInteger(idx) || idx < 0 || idx >= r.count) return mount(root, blocked('Not found', 'We could not find that page.', ctx));
  ctx.setHue(r.hue);
  const mode = browse ? 'browse' : idx < st.ptr ? 'review' : idx === st.ptr && !st.doneToday ? 'open' : idx === st.ptr ? 'tomorrow' : 'locked';
  if (mode === 'locked') return mount(root, blocked('Not yet', `This one is sealed. ${r.unit} ${st.ptr + 1} comes first — each ${r.unit.toLowerCase()} opens only after the one before it has been lived.`, ctx, r));
  if (mode === 'tomorrow') {
    const live = h('span', { class: 'mono big' }, countdown(state.view.nextOpenAt - nowMs())); const t = setInterval(() => { if (!live.isConnected) return clearInterval(t); live.textContent = countdown(state.view.nextOpenAt - nowMs()); }, 1000);
    return mount(root, blocked('Sealed until tomorrow', `You have already opened ${r.title} today. One ${r.unit.toLowerCase()} a day lets it land.`, ctx, r, live));
  }
  const u = await unit(realm, idx); if(ctx.isCurrent&&!ctx.isCurrent())return; ctx.setHue(u.hue);
  if(browse) remember(`#/browse/${realm}/${idx}`,u.title,'Practice');
  const activity=browse?trackActivity({route:`#/browse/${realm}/${idx}`,title:u.title,kind:'Practice'}):null;
  const doneRec = state.doc.units[`${realm}:${idx}`];
  const scroller = h('div', { class: 'reader-scroll' }); const bar = h('div', { class: 'reader-progress' }, h('i'));
  const top = h('header', { class: 'reader-top' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: () => ctx.close() }, icon('close', 22)), h('div', { class: 'reader-kick' }, u.kicker.split(' — ')[0]), listenBtn(u), bar);
  const wrap = h('div', { class: 'reader', style: { '--h': u.hue } }, top, scroller);
  mount(root, wrap);

  let seconds = 0, depth = 0, revealed = mode !== 'open', timer = null, done = false;
  const need = Math.max(r.minSeconds, Math.min(90, Math.round(u.est * 0.5)));
  const note = h('textarea', { rows: 2, maxlength: 600, placeholder: 'One line to carry from this (optional)…', 'aria-label': 'Your reflection' });
  const ring = h('div', { class: 'dwell-ring' }); const hint = h('span', { class: 'dwell-hint' }); const finish = h('button', { class: 'btn primary', disabled: true }, mode === 'review' ? 'Done' : `Seal this ${r.unit.toLowerCase()}`);
  const dock = browse ? h('div',{class:'browse-dock'},h('a',{class:'icon-btn','aria-label':'Back to collection',href:`#/product/${realm}`},icon('back',19)),h('span',{class:'fine'},`${idx+1} / ${r.count}`),h('button',{class:'btn primary',onclick:()=>{activity?.finish(true);remember(idx+1<r.count?`#/browse/${realm}/${idx+1}`:`#/product/${realm}`,r.title,'Practice');toast('A little moment, kept in your space.');ctx.close(`#/product/${realm}`);}},'Done for now',icon('check',16)),idx+1<r.count&&h('a',{class:'icon-btn','aria-label':'Next practice',href:`#/browse/${realm}/${idx+1}`,onclick:()=>activity?.finish(true)},icon('arrow',19))) : h('div', { class: 'dock' }, ring, hint, finish);


  const body = h('article', { class: 'reader-body' },
    h('div', { class: 'reader-art' }, emblem(u.motif, u.hue, `${realm}${idx}`, 156)),
    h('p', { class: 'eyebrow' }, u.kicker), h('h1', { class: 'display' }, u.title), u.lead && h('p', { class: 'lead' }, u.lead),
    ...u.blocks.map(b => block(b, u)), mode === 'open' && h('div', { class: 'reflect-box' }, h('label', {}, 'Carry it with you'), note),
    mode === 'review' && doneRec && h('p', { class: 'fine center' }, `You lived this on ${prettyDate(doneRec.date)}.`), h('div', { class: 'spacer' }));

  function measure() { const el = scroller; depth = el.scrollHeight <= el.clientHeight + 24 ? 1 : (el.scrollTop + el.clientHeight) / el.scrollHeight; bar.firstChild.style.width = Math.round(Math.min(1, depth) * 100) + '%'; update(); }
  function update() {
    if (browse) return;
    if (mode === 'review') { finish.disabled = false; hint.textContent = 'Revisiting what you have already lived'; return; }
    const pct = Math.min(1, seconds / need); ring.style.setProperty('--p', pct); const ok = seconds >= need && depth >= 0.85;
    finish.disabled = !ok || done; hint.textContent = ok ? 'Ready — seal it when it has landed.' : seconds < need ? `Stay a moment · ${mmss(need - seconds)}` : 'Read to the end';
    dock.classList.toggle('ready', ok);
  }
  scroller.addEventListener('scroll', measure, { passive: true });
  const startDwell = () => { if (revealed && mode === 'open') { setTimeout(measure, 80); timer = setInterval(() => { if (!wrap.isConnected) return stop(); if (!document.hidden) { seconds++; update(); } }, 1000); } };
  const stop = () => { activity?.finish(false);clearInterval(timer); silence(); if (!done && mode === 'open' && seconds >= 5) beacon(realm, seconds); wrap.dispatchEvent(new Event('x')); };
  wrap.addEventListener('ugt:leave', stop);

  finish.addEventListener('click', async () => {
    if (mode === 'review') return ctx.close();
    finish.disabled = true; done = true; clearInterval(timer);
    try { await act('unit/complete', { realm, idx, seconds, note: note.value }); celebrate(); } catch (e) { done = false; toast(humanError(e)); update(); }
  });
  function celebrate() {
    silence(); const n = nextStep(); const left = r.count - state.view.realms[realm].ptr;
    const msg = left > 0 ? `${r.unit} ${idx + 2} of ${r.count} will open tomorrow.` : `You have walked all of ${r.title}.`;
    mount(root, h('div', { class: 'reader celebrate', style: { '--h': u.hue } }, h('div', { class: 'center rise' }, h('div', { class: 'bigstar' }, emblem(u.motif, u.hue, `${realm}${idx}`, 190), h('div', { class: 'pulse' })),
      h('p', { class: 'eyebrow' }, 'Lived'), h('h1', { class: 'display' }, u.title), h('p', { class: 'lede' }, msg),
      h('div', { class: 'row-center' }, n ? h('button', { class: 'btn primary', onclick: () => ctx.go(n.to) }, n.label, icon('arrow', 18)) : h('button', { class: 'btn primary', onclick: () => ctx.close() }, 'Back to today'), n && h('button', { class: 'btn ghost', onclick: () => ctx.close() }, 'Back to today')))));
  }

  if (mode === 'open') {
    scroller.append(sealScreen(u, r, () => { revealed = true; sealer.remove(); scroller.append(body, dock); body.classList.add('reveal'); startDwell(); measure(); }));
    var sealer = scroller.firstChild;
  } else { scroller.append(body, dock); measure(); }
}

function sealScreen(u, r, onReveal) {
  let t = null; const ring = h('div', { class: 'hold-ring' }); let fired = false;
  const go = () => { if (fired) return; fired = true; onReveal(); };
  const btn = h('button', { class: 'hold', 'aria-label': `Hold to reveal today’s ${r.unit.toLowerCase()} — or press Enter`, onpointerdown: e => { e.preventDefault(); btn.classList.add('holding'); t = setTimeout(go, 900); }, onpointerup: () => { clearTimeout(t); btn.classList.remove('holding'); }, onpointerleave: () => { clearTimeout(t); btn.classList.remove('holding'); }, onpointercancel: () => { clearTimeout(t); btn.classList.remove('holding'); }, onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }, oncontextmenu: e => e.preventDefault() }, ring, emblem(u.motif, u.hue, `${u.realm}${u.idx}`, 150));
  return h('div', { class: 'seal-screen center' }, h('p', { class: 'eyebrow' }, r.title, ' · ', unitLabel(r, u.idx)), h('h1', { class: 'display' }, 'Sealed'), btn, h('p', { class: 'lede' }, 'Take a breath. Press and hold to break the seal.'), h('p', { class: 'fine faint' }, 'Keyboard: press Enter'));
}
function blocked(title, text, ctx, r, extra) {
  return h('div', { class: 'reader celebrate', style: { '--h': r ? r.hue : 220 } }, h('header', { class: 'reader-top' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: () => ctx.close() }, icon('close', 22))),
    h('div', { class: 'center rise blocked' }, r && emblem(r.id, r.hue, 'lock' + r.id, 140), h('div', { class: 'seal-ring' }, icon('lock', 28)), h('h1', { class: 'display' }, title), h('p', { class: 'lede' }, text), extra, h('button', { class: 'btn ghost', onclick: () => ctx.close() }, 'Back')));
}
function listenBtn(u) {
  let on = false; const b = h('button', { class: 'icon-btn', 'aria-label': 'Read aloud', 'aria-pressed': 'false', onclick: () => { on = !on; b.setAttribute('aria-pressed', on); b.classList.toggle('on', on); if (!on) return silence(); const txt = [u.title, u.lead, ...u.blocks.map(bl => bl.text || (bl.items || []).map(i => i.text || i.label).join('. '))].filter(Boolean).join('. '); speak(txt, true); } }, icon('sound', 20)); return b;
}
function block(b, u) {
  switch (b.t) {
    case 'p': return h('p', { class: 'p' }, b.text);
    case 'h': return h('h2', { class: 'sub' }, b.text);
    case 'note': return h('p', { class: 'note' }, b.label && h('strong', {}, b.label + ' · '), b.text);
    case 'card': return h('div', { class: `rcard ${b.tone || ''}` }, h('div', { class: 'eyebrow' }, b.label), h('p', {}, b.text));
    case 'voice': return h('blockquote', { class: 'voice' }, b.text);
    case 'verses': return h('div', { class: 'verses' }, b.items.map(v => h('figure', {}, h('blockquote', {}, v.text), h('figcaption', {}, v.cite))));
    case 'prompt': return h('div', { class: 'rcard prompt' }, h('div', { class: 'eyebrow' }, b.label), h('p', {}, b.text), h('button', { class: 'btn ghost small', onclick: async e => { try { await navigator.clipboard.writeText(b.text); toast('Prompt copied'); } catch { const ta = h('textarea'); ta.value = b.text; document.body.append(ta); ta.select(); try { document.execCommand('copy'); toast('Prompt copied'); } catch { toast('Select the text to copy it'); } ta.remove(); } } }, icon('copy', 16), 'Copy prompt'));
    case 'steps': return h('ol', { class: 'steps' }, b.items.map((s, i) => h('li', {}, h('span', { class: 'step-n' }, i + 1), h('div', {}, h('div', { class: 'eyebrow' }, s.label), h('p', {}, s.text), s.extra && h('p', { class: 'fine' }, s.extra)))));
    case 'wallpaper': { const file=`/wallpapers/human-within-${String(u.idx+1).padStart(2,'0')}.png`;const box = h('div', { class: 'wallpaper' },h('img',{src:file,alt:u.lead,style:{width:'100%',maxWidth:'260px',height:'auto'}}));
      return h('div', { class: 'wp-wrap' }, box, h('a', { class: 'btn primary',href:file,download:`human-within-day-${u.idx+1}.png` }, icon('download', 18), 'Download wallpaper'),h('a',{class:'text-link',href:'#/wallpapers'},'See all 30 wallpapers',icon('arrow',17))); }
    default: return null;
  }
}
