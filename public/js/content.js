// Loads the extracted content and adapts every realm to ONE unit shape the reader understands:
// { realm, idx, kicker, title, lead, blocks[], motif, hue, words }
import { realmById } from './engine.js';
import { sentenceCase, titleCase, wordCount } from './ui.js';

const cache = {};
async function load(name) {
  if (!cache[name]) cache[name] = fetch(`/content/${name}.json`).then(r => { if (!r.ok) throw new Error(`Could not load ${name}`); return r.json(); });
  return cache[name];
}
const P = text => ({ t: 'p', text });
const CARD = (label, text, tone) => ({ t: 'card', label, text, tone });
const NOTE = (label, text) => ({ t: 'note', label, text });
const H = text => ({ t: 'h', text });

const BAND = {
  delta: { name: 'Delta', line: 'The slowest rhythm — the one of deep rest.', how: 'Let your eyes soften. There is nothing to do except let your breath get longer than your thoughts.' },
  theta: { name: 'Theta', line: 'The drifting rhythm between waking and dreaming.', how: 'Let images come and go. Follow the slow exhale all the way down.' },
  alpha: { name: 'Alpha', line: 'The relaxed, wakeful rhythm of calm attention.', how: 'Sit tall and loose. Rest your attention on the sound, and return to it each time you wander.' },
  beta: { name: 'Beta', line: 'The alert rhythm of focus and engagement.', how: 'Keep a gentle brightness in the face and chest. Breathe evenly and stay lightly awake.' },
  gamma: { name: 'Gamma', line: 'The fast rhythm of vivid, integrated attention.', how: 'Notice everything at once — sound, breath, body, room — without gripping any of it.' },
};

const builders = {
  async protocol(i) {
    const d = (await load('protocol'))[i]; const b = BAND[d.b];
    return { kicker: `${b.name} · ${d.f} Hz beat · ${d.c} Hz carrier`, title: d.n, lead: b.line, session: d, blocks: [
      CARD('How to sit with it', `${b.how} Three minutes, eyes soft or closed.`), P('Headphones are best — the effect is made of a slightly different tone in each ear. Keep the volume low and comfortable.'),
      NOTE('A gentle note', 'Binaural beats may help some people relax; they are not medical treatment. If you feel dizzy or unwell, stop. Never use while driving.')], motif: 'protocol', words: 90 };
  },
  async clarity(i) {
    const d = (await load('clarity'))[i];
    return { kicker: `Day ${i + 1} of 30`, title: d[0], lead: 'A morning to begin with, an evening to close with.', blocks: [
      H('Morning'), CARD('Affirmation', d[1], 'sun'), CARD('Practice', d[3]), H('Evening'), CARD('Affirmation', d[2], 'moon'), CARD('Reflect', d[4])], motif: 'clarity', words: 80 };
  },
  async awakening(i) {
    const d = (await load('awakening'))[i];
    return { kicker: `Day ${d.num} of 66`, title: titleCase(d.title), lead: d.question, blocks: [CARD('Affirmation', d.affirmation, 'sun'), CARD('Practice', d.practice),
      H('Voices across traditions'), { t: 'verses', items: [{ cite: 'Jesus', text: d.jesus }, { cite: 'Krishna', text: d.krishna }, { cite: 'Buddha', text: d.buddha }, { cite: 'Quran', text: d.quran }].map(v => ({ ...v, text: v.text.replace(/^\\?"|\\?"$/g, '').replace(/^"|"$/g, '') })) }], motif: 'awakening', words: 120 };
  },
  async onegod(i) {
    const d = (await load('onegod'))[i];
    return { kicker: `Voice ${d.num} of 32`, title: d.title, lead: '', blocks: [{ t: 'voice', text: sentenceCase(d.message) }, H('Scripture'), { t: 'verses', items: [{ cite: 'Bible', text: d.bible }, { cite: 'Quran', text: d.quran }, { cite: 'Gita', text: d.gita }] }, CARD('Live it today', sentenceCase(d.action))], motif: 'onegod', words: 130 };
  },
  async journey(i) {
    const [a, b, c] = await Promise.all([load('journey1'), load('journey2'), load('journey3')]);
    if (i < a.length) { const d = a[i];
      return { kicker: `Part I · Origins — ${d.era}`, title: d.title, lead: d.sub, blocks: [NOTE('When', d.time), ...d.body.map(P)], motif: d.visual, words: wordCount(d.body.join(' ')) }; }
    i -= a.length;
    if (i < b.length) { const d = b[i];
      return { kicker: `Part II · The Loop — ${d.stage} · ${d.age}`, title: d.title, lead: d.lead, blocks: [...d.body.map(P), d.insight && CARD('Insight', d.insight, 'sun'), d.time && NOTE('Time', d.time), d.gentle && NOTE('A gentle note', d.gentle)].filter(Boolean), motif: d.scene, words: wordCount(d.body.join(' ') + d.insight) }; }
    i -= b.length; const d = c[i];
    return { kicker: `Part III · The Awakening — ${d.part}`, title: d.title, lead: d.subtitle, blocks: [P(d.lead), ...d.sections.flatMap(([hd, tx]) => [H(hd), P(tx)]), CARD('Reflect', d.reflection, 'moon'), NOTE('The evidence', d.evidence)], motif: 'mind', words: wordCount(d.lead + d.sections.map(s => s[1]).join(' ')) };
  },
  async thoughts(i) {
    const [t, ch, br] = await Promise.all([load('oneThoughts'), load('oneChapters'), load('oneBridges')]); const d = t[i]; const c = Math.floor(i / 11);
    const last = i % 11 === 10;
    return { kicker: `${ch[c]} · ${(i % 11) + 1} of 11`, title: d[0], lead: d[1], blocks: [CARD('Try this', d[2]), last && br[c] && NOTE('The bridge', br[c])].filter(Boolean), motif: ['thoughts', 'connection', 'community', 'care', 'tree', 'planet', 'stars', 'ocean', 'cosmos'][c], words: 60 };
  },
  async escape(i) {
    const [tr, pr] = await Promise.all([load('p3truths'), load('p3prompts')]);
    return { kicker: `Lesson ${i + 1} of 21`, title: tr[i].title, lead: tr[i].body, blocks: [H('Test it'), { t: 'prompt', label: pr[i].title, text: pr[i].prompt }, NOTE('How to use', 'Copy the prompt into any AI assistant (or write the answers by hand). Replace the [bracketed part] with your real situation.')], motif: 'escape', words: 100 };
  },
  async loop(i) {
    const d = (await load('loop'))[i];
    return { kicker: `Day ${i + 1} of 21 — ${d[1]}`, title: d[0], lead: d[2], blocks: [
      { t: 'steps', items: [
        { label: 'Recognise', text: `The thought that shows up: “${d[3]}”`, extra: `The loop: ${d[5]}` },
        { label: 'Reveal', text: `Where it comes from — ${d[6]}.`, extra: `Technique: ${d[10]}` },
        { label: 'Another response', text: d[4] },
        { label: 'Practise', text: d[7] },
        { label: 'Take it into life', text: d[8], extra: `If–then plan: ${d[9]}` }] },
      NOTE('Honest note', 'These are everyday psychology ideas to experiment with — observations, not a diagnosis or treatment.')], motif: ['habit', 'who', 'cbt', 'plan', 'context'].indexOf(d[11]) >= 0 ? ['loop', 'mirror', 'mind', 'work', 'city'][['habit', 'who', 'cbt', 'plan', 'context'].indexOf(d[11])] : 'loop', words: 140 };
  },
  async rewire(i) {
    const d = (await load('rewire'))[i];
    return { kicker: `Day ${d.day} of 30 — ${d.category}`, title: d.title, lead: d.cue, category: d.category, blocks: [{ t: 'wallpaper' }, CARD('Why this image', d.explanation), CARD('Today’s action', d.action)], motif: `rewire${i}`, words: 50 };
  },
};

/** Every unit title — used for the revealed history lists. */
const titleCache = {};
export async function titlesOf(realmId) {
  if (titleCache[realmId]) return titleCache[realmId];
  const r = realmById(realmId); const out = [];
  for (let i = 0; i < r.count; i++) out.push((await unit(realmId, i)).title);
  return (titleCache[realmId] = out);
}
export async function unit(realmId, idx) {
  const r = realmById(realmId); const u = await builders[realmId](idx);
  const hue = (r.hue + (idx * 7) % 40 - 20 + 360) % 360;
  return { realm: realmId, idx, hue, ...u, est: Math.max(r.minSeconds, Math.round((u.words || 80) / 3.6)) };
}
export const journeyPart = i => (i < 21 ? 'Part I · Origins' : i < 43 ? 'Part II · The Loop' : 'Part III · The Awakening');
export async function introSteps() { return load('introSteps'); }
