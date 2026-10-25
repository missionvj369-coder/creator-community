import { h, mount, icon, emblem, toast } from '../ui.js';
import * as E from '../engine.js';
import * as S from '../store.js';
import { introSteps } from '../content.js';
import { speak, silence, drone } from '../audio.js';
import { humanError } from './today.js';

/* ───────── Welcome → name → intent → length → ritual ───────── */
export function renderOnboarding(root, ctx, startAt = 0) {
  const form = { name: '', intents: [], length: 'steady' }; let step = startAt;
  const steps = [welcome, nameStep, intentStep, lengthStep];
  const paint = () => { ctx.setHue([250, 200, 280, 160][step] || 230); mount(root, h('div', { class: 'onboard' }, h('div', { class: 'ob-dots', 'aria-hidden': 'true' }, steps.map((_, i) => h('i', { class: i <= step ? 'on' : '' }))), steps[step]())); (root.querySelector('input,button.primary') || root).focus?.(); };
  const next = () => { step++; paint(); };

  function welcome() {
    return h('div', { class: 'center rise ob-card' }, h('div', { class: 'bigstar' }, emblem('galaxy', 250, 'welcome', 200), h('div', { class: 'pulse' })),
      h('p', { class: 'eyebrow' }, 'Human Within · One humanity'), h('h1', { class: 'display xl' }, 'One gate a day.'),
      h('p', { class: 'lede' }, 'A daily path of calm, clarity and belonging. Each day opens one thing — and what you do today shapes what opens tomorrow.'),
      h('div', { class: 'row-center' }, h('button', { class: 'btn primary big primary', onclick: next }, 'Begin', icon('arrow', 20))),
      h('div', { class: 'row-center small-links' }, h('button', { class: 'link', onclick: () => ctx.go('#/welcome') }, 'Watch a welcome message'), S.state.mode === 'api' && h('button', { class: 'link', onclick: restoreSheet }, 'I already have an ID')));
  }
  function nameStep() {
    const i = h('input', { type: 'text', maxlength: 40, placeholder: 'Your first name', 'aria-label': 'Your name', autocomplete: 'given-name', value: form.name, onkeydown: e => e.key === 'Enter' && go() });
    const go = () => { form.name = i.value.trim(); if (!form.name) { toast('A name — any name — is enough.'); return i.focus(); } next(); };
    return h('div', { class: 'center rise ob-card' }, h('p', { class: 'eyebrow' }, 'First'), h('h1', { class: 'display' }, 'What shall we call you?'), h('p', { class: 'lede' }, 'No email, no password. Just a name, so the path can speak to you.'), i, h('div', { class: 'row-center' }, h('button', { class: 'btn primary', onclick: go }, 'Continue', icon('arrow', 18))));
  }
  function intentStep() {
    const chips = E.INTENTS.map(t => h('button', { class: 'chip big', 'aria-pressed': 'false', onclick: e => { const on = form.intents.includes(t.id); form.intents = on ? form.intents.filter(x => x !== t.id) : [...form.intents, t.id].slice(-3); chips.forEach((c, k) => { const a = form.intents.includes(E.INTENTS[k].id); c.classList.toggle('on', a); c.setAttribute('aria-pressed', String(a)); }); } }, t.label));
    return h('div', { class: 'center rise ob-card' }, h('p', { class: 'eyebrow' }, 'Your reason'), h('h1', { class: 'display' }, 'What are you here for?'), h('p', { class: 'lede' }, 'Choose up to three. Your gates will lean toward them.'), h('div', { class: 'chips center-chips' }, chips), h('div', { class: 'row-center' }, h('button', { class: 'btn primary', onclick: next }, form.intents.length ? 'Continue' : 'Continue', icon('arrow', 18))));
  }
  function lengthStep() {
    const btns = Object.entries(E.GATE_LENGTHS).map(([id, g]) => h('button', { class: `seg big ${form.length === id ? 'on' : ''}`, 'aria-pressed': String(form.length === id), onclick: () => { form.length = id; btns.forEach((b, k) => { const a = Object.keys(E.GATE_LENGTHS)[k] === id; b.classList.toggle('on', a); b.setAttribute('aria-pressed', String(a)); }); } }, h('b', {}, g.label), h('span', {}, `about ${g.mins} minutes`), h('em', {}, g.n === 1 ? 'one step and a seal' : `${g.n} steps and a seal`)));
    const go = h('button', { class: 'btn primary big', onclick: async () => { go.disabled = true; try { await S.start(form); ctx.go('#/arrive'); } catch (e) { toast(humanError(e)); go.disabled = false; } } }, 'Open my first gate', icon('arrow', 20));
    return h('div', { class: 'center rise ob-card' }, h('p', { class: 'eyebrow' }, 'Your rhythm'), h('h1', { class: 'display' }, 'How much time can you give?'), h('p', { class: 'lede' }, 'Small and daily beats big and rare. You can change this any time.'), h('div', { class: 'segs big' }, btns), h('div', { class: 'row-center' }, go));
  }
  function restoreSheet() {
    import('../ui.js').then(({ sheet }) => {
      const id = h('input', { type: 'text', placeholder: 'UGT-XXXX-XXXX', 'aria-label': 'Universal ID', autocapitalize: 'characters', autofocus: true }); const pin = h('input', { type: 'password', placeholder: 'Passphrase', 'aria-label': 'Passphrase' });
      const go = h('button', { class: 'btn primary wide', onclick: async () => { go.disabled = true; try { await S.restore(id.value.trim(), pin.value); sh.close(); ctx.go('#/today'); } catch (e) { toast(humanError(e)); go.disabled = false; } } }, 'Continue my path');
      const sh = sheet(h('div', { class: 'center' }, h('h2', { class: 'display sm' }, 'Welcome back'), h('p', { class: 'lede' }, 'Enter the Universal ID and passphrase you set on your other device.'), h('div', { class: 'stack' }, id, pin, go)), { label: 'Restore your path' });
    });
  }
  paint();
}

/* ───────── The arrival ritual: twenty-one breaths, one statement each ───────── */
export async function renderRitual(root, ctx) {
  const steps = await introSteps(); ctx.setHue(215); let i = 0, auto = true, timer = null, voice = !!S.state.doc?.prefs?.voice;
  const txt = h('p', { class: 'ritual-text', 'aria-live': 'polite' }); const count = h('div', { class: 'ritual-count mono' }); const orb = h('div', { class: 'ritual-orb' }, h('i'), h('i'), h('i'));
  const skip = h('button', { class: 'link', onclick: end }, 'Skip'); const autoBtn = h('button', { class: 'chip on', 'aria-pressed': 'true', onclick: () => { auto = !auto; autoBtn.classList.toggle('on', auto); autoBtn.setAttribute('aria-pressed', String(auto)); auto ? schedule() : clearTimeout(timer); } }, 'Auto-flow');
  const voiceBtn = h('button', { class: `chip ${voice ? 'on' : ''}`, 'aria-pressed': String(voice), onclick: () => { voice = !voice; voiceBtn.classList.toggle('on', voice); voiceBtn.setAttribute('aria-pressed', String(voice)); voice ? speak(steps[i], true) : silence(); } }, icon('sound', 16), 'Voice');
  const soundBtn = h('button', { class: `chip ${drone.on ? 'on' : ''}`, 'aria-pressed': String(drone.on), onclick: () => { ctx.toggleSound(); soundBtn.classList.toggle('on', drone.on); soundBtn.setAttribute('aria-pressed', String(drone.on)); } }, 'Soft sound');
  const prev = h('button', { class: 'icon-btn', 'aria-label': 'Previous', onclick: () => go(i - 1) }, icon('back', 22)); const nxt = h('button', { class: 'icon-btn', 'aria-label': 'Next', onclick: () => go(i + 1) }, icon('arrow', 22));
  const wrap = h('div', { class: 'ritual' }, h('header', { class: 'reader-top' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: end }, icon('close', 22)), h('div', { class: 'reader-kick' }, 'Arrival'), skip), h('div', { class: 'ritual-mid center' }, orb, txt, count), h('div', { class: 'ritual-foot' }, h('div', { class: 'row-center' }, prev, nxt), h('div', { class: 'row-center' }, autoBtn, voiceBtn, soundBtn)));
  wrap.addEventListener('ugt:leave', () => { clearTimeout(timer); silence(); }); mount(root, wrap);
  function show() { txt.classList.remove('in'); void txt.offsetWidth; txt.textContent = steps[i]; txt.classList.add('in'); count.textContent = `${String(i + 1).padStart(2, '0')} / ${steps.length}`; speak(steps[i], voice); }
  function schedule() { clearTimeout(timer); if (auto) timer = setTimeout(() => { if (!wrap.isConnected) return; i < steps.length - 1 ? go(i + 1) : finishUp(); }, 6500 + Math.min(4000, steps[i].length * 45)); }
  function go(n) { if (n < 0) n = 0; if (n >= steps.length) return finishUp(); i = n; show(); schedule(); }
  function finishUp() { clearTimeout(timer); mount(wrap.querySelector('.ritual-mid'), h('div', { class: 'center rise' }, h('h1', { class: 'display' }, 'Welcome back to yourself.'), h('p', { class: 'lede' }, 'Your first gate is ready.'), h('button', { class: 'btn primary big', onclick: end }, 'Enter', icon('arrow', 20)))); wrap.querySelector('.ritual-foot').remove(); }
  function end() { clearTimeout(timer); silence(); ctx.go('#/today'); }
  show(); schedule();
}

/* ───────── Welcome messages (the three video clips) ───────── */
export function renderWelcomeVideos(root, ctx) {
  const clips = ['/videos/intro-1.mp4', '/videos/intro-2.mp4', '/videos/intro-3.mp4']; let i = 0; ctx.setHue(250);
  const v = h('video', { playsinline: true, controls: true, preload: 'metadata', 'aria-label': 'Welcome message' }); const lab = h('div', { class: 'reader-kick' });
  const err = h('p', { class: 'fine center', hidden: true }, 'This clip could not be played on your device.');
  const seg = h('div', { class: 'vseg' }, clips.map((_, k) => h('button', { 'aria-label': `Message ${k + 1}`, onclick: () => load(k) }, '')));
  function load(k) { i = k; v.src = clips[k]; v.load(); lab.textContent = `Welcome message ${k + 1} of ${clips.length}`; [...seg.children].forEach((b, n) => b.classList.toggle('on', n === k)); err.hidden = true; v.play().catch(() => {}); }
  v.addEventListener('ended', () => (i < clips.length - 1 ? load(i + 1) : null)); v.addEventListener('error', () => (err.hidden = false));
  const wrap = h('div', { class: 'reader' }, h('header', { class: 'reader-top' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: () => ctx.close() }, icon('close', 22)), lab), h('div', { class: 'video-stage' }, v, seg, err));
  wrap.addEventListener('ugt:leave', () => { v.pause(); v.removeAttribute('src'); v.load(); }); mount(root, wrap); load(0);
}
