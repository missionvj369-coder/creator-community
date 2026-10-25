import { h, mount, icon, emblem, sheet, toast, prettyDate, svgEl } from '../ui.js';
import * as E from '../engine.js';
import * as S from '../store.js';
import { state, act } from '../store.js';
import { drone } from '../audio.js';
import { humanError } from './today.js';

let showAll = false;

function bars(data) {
  const W = 340, H = 110, max = Math.max(5, ...data.map(d => d.minutes)); const bw = W / data.length;
  const s = data.map((d, i) => { const bh = Math.max(d.minutes ? 4 : 2, (d.minutes / max) * (H - 24)); return `<g><rect x="${(i * bw + 4).toFixed(1)}" y="${(H - 16 - bh).toFixed(1)}" width="${(bw - 8).toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="${d.minutes ? 'hsl(var(--hue) 85% 70%)' : 'rgba(255,255,255,.12)'}"><title>${prettyDate(d.date)} — ${d.minutes} min</title></rect><text x="${(i * bw + bw / 2).toFixed(1)}" y="${H - 3}" text-anchor="middle" font-size="9" fill="#f5f1ea" opacity=".5">${d.date.slice(8)}</text></g>`; }).join('');
  return svgEl(`<svg viewBox="0 0 ${W} ${H}" class="barsvg" role="img" aria-label="Minutes per day, last 14 days">${s}</svg>`);
}

export function renderYou(root, ctx) {
  const v = state.view, doc = state.doc, st = v.stats; ctx.setHue(280);
  const stat = (n, l) => h('div', { class: 'stat' }, h('b', {}, String(n)), h('span', {}, l));
  const nameIn = h('input', { type: 'text', value: doc.name, maxlength: 40, 'aria-label': 'Your name', autocomplete: 'given-name' });
  const reflections = [...doc.reflections].reverse(); const list = showAll ? reflections : reflections.slice(0, 5);
  const seg = Object.entries(E.GATE_LENGTHS).map(([id, g]) => h('button', { class: `seg ${doc.length === id ? 'on' : ''}`, 'aria-pressed': String(doc.length === id), onclick: async () => { try { await act('profile', { length: id }); toast(`Gate length: ${g.label}`); ctx.render(); } catch (e) { toast(humanError(e)); } } }, h('b', {}, g.label), h('span', {}, `~${g.mins} min`)));
  const intents = E.INTENTS.map(i => { const on = doc.intents.includes(i.id); return h('button', { class: `chip ${on ? 'on' : ''}`, 'aria-pressed': String(on), onclick: async () => { let next = on ? doc.intents.filter(x => x !== i.id) : [...doc.intents, i.id].slice(-3); try { await act('profile', { intents: next }); ctx.render(); } catch (e) { toast(humanError(e)); } } }, i.label); });
  const pin = h('input', { type: 'password', placeholder: 'Choose a passphrase (4+ characters)', 'aria-label': 'Passphrase', autocomplete: 'new-password', minlength: 4 });
  mount(root, h('section', { class: 'page rise' },
    h('div', { class: 'profile' }, emblem('mirror', 280, doc.name, 96), h('div', {}, h('p', { class: 'eyebrow' }, 'You'), h('h1', { class: 'display sm' }, doc.name), h('button', { class: 'idchip', onclick: async () => { try { await navigator.clipboard.writeText(S.state.id); toast('ID copied'); } catch { toast(S.state.id); } }, 'aria-label': 'Copy your app ID' }, h('span', { class: 'mono' }, S.state.id), icon('copy', 15)))),
    h('div', { class: 'stats' }, stat(st.daysDone, 'days sealed'), stat(`${st.streak}`, `streak · best ${st.best}`), stat(st.totalMinutes, 'minutes'), stat(st.reflections, 'reflections')),
    h('div', { class: 'card' }, h('h3', {}, 'Last 14 days'), bars(st.bars), st.liftRate != null && h('p', { class: 'fine' }, `You left lighter, clearer or moved on ${st.liftRate}% of the days you sealed.`)),
    h('div', { class: 'card' }, h('h3', {}, 'Reflections'), list.length ? h('ul', { class: 'reflist' }, list.map(r => h('li', {}, h('span', { class: 'fine' }, prettyDate(r.date), r.realm && E.realmById(r.realm) ? ` · ${E.realmById(r.realm).title}` : ''), h('p', {}, r.text)))) : h('p', { class: 'fine' }, 'The one-line notes you write when you seal a step or a day will gather here.'), reflections.length > 5 && h('button', { class: 'btn ghost small', onclick: () => { showAll = !showAll; ctx.render(); } }, showAll ? 'Show fewer' : `Show all ${reflections.length}`)),
    h('div', { class: 'card' }, h('h3', {}, 'Make it yours'),
      h('label', { class: 'field' }, h('span', {}, 'Name'), h('div', { class: 'inline' }, nameIn, h('button', { class: 'btn ghost small', onclick: async () => { try { await act('profile', { name: nameIn.value }); toast('Saved'); ctx.render(); } catch (e) { toast(humanError(e)); } } }, 'Save'))),
      h('div', { class: 'field' }, h('span', {}, 'Daily gate length'), h('div', { class: 'segs' }, seg)), h('div', { class: 'field' }, h('span', {}, 'What are you here for? (up to three)'), h('div', { class: 'chips' }, intents)),
      h('div', { class: 'field' }, h('span', {}, 'Sound & voice'), h('div', { class: 'chips' },
        h('button', { class: `chip ${drone.on ? 'on' : ''}`, 'aria-pressed': String(drone.on), onclick: () => { ctx.toggleSound(); ctx.render(); } }, icon(drone.on ? 'sound' : 'mute', 16), drone.on ? 'Ambient sound on' : 'Ambient sound off'),
        h('button', { class: 'chip', onclick: () => ctx.go('#/arrive') }, 'Replay the arrival ritual'), h('button', { class: 'chip', onclick: () => ctx.go('#/welcome') }, 'Welcome messages')))),
    state.mode === 'api' && h('div', { class: 'card' }, h('h3', {}, 'Take your path to another device'), h('p', { class: 'fine' }, `Your app ID is ${S.state.id}. ${S.state.hasPin ? 'A passphrase is set — use ID + passphrase on any device to continue.' : 'Set a passphrase, then sign in anywhere with your ID.'}`),
      h('div', { class: 'inline' }, pin, h('button', { class: 'btn ghost small', onclick: async () => { try { await S.setPin(pin.value); pin.value = ''; toast('Passphrase saved'); ctx.render(); } catch (e) { toast(humanError(e)); } } }, S.state.hasPin ? 'Change' : 'Set'))),
    state.mode === 'local' && h('div', { class: 'card' }, h('h3', {}, 'Saved on this device'), h('p', { class: 'fine' }, 'Your progress stays in this browser. Export a backup before switching devices.')),
    h('div', { class: 'card' }, h('h3', {}, 'Your data'), h('div', { class: 'chips' },
      h('button', { class: 'chip', onclick: async () => { try { const data = await S.exportData(); const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })), download: 'human-within-progress.json' }); document.body.append(a); a.click(); a.remove(); } catch (e) { toast(humanError(e)); } } }, icon('download', 16), 'Export'),
      h('button', { class: 'chip', onclick: async () => { await S.signOut(false); location.hash = '#/welcome'; location.reload(); } }, 'Sign out of this device'),
      h('button', { class: 'chip danger', onclick: () => confirmDelete(ctx) }, 'Delete everything'))),
    state.dev && h('div', { class: 'card dev' }, h('h3', {}, 'Preview tomorrow'), h('p', { class: 'fine' }, `Time travel to see how the next day reveals. Clock offset: ${Math.round(((doc.dev || {}).offsetMs || 0) / 86400000)} day(s).`), h('div', { class: 'chips' },
      h('button', { class: 'chip', onclick: async () => { await act('dev/advance', { days: 1 }); toast('It is now the next day'); ctx.go('#/today'); } }, 'Jump one day ahead'), h('button', { class: 'chip', onclick: async () => { await act('dev/reset-time'); ctx.render(); toast('Clock reset'); } }, 'Reset clock')))));
}
function confirmDelete(ctx) {
  const sh = sheet(h('div', { class: 'center' }, h('h2', { class: 'display sm' }, 'Delete everything?'), h('p', { class: 'lede' }, 'This erases your path, reflections and ID — on this device and the server. It cannot be undone.'), h('div', { class: 'row-center' }, h('button', { class: 'btn ghost', onclick: () => sh.close(), autofocus: true }, 'Keep my path'), h('button', { class: 'btn danger', onclick: async () => { await S.signOut(true); sh.close(); location.hash = '#/welcome'; location.reload(); } }, 'Delete'))), { label: 'Confirm deletion' });
}
