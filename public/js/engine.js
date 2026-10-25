// UGT Path — shared engine. Runs in the browser (offline mode) AND on the Node server.
// Pure functions over a plain "doc" object. No DOM, no I/O.

/* ───────────────────────────── Realms (the old "products", now with headings) ───────────────────────────── */
export const REALMS = [
  // Daily sequences — each reveals ONE unit per day, and only after the previous one was lived.
  { id: 'protocol', kind: 'sequence', title: 'Sound Reset', tagline: 'Twenty-one sound sessions for a quiet listening break.', unit: 'Session', role: 'settle', hue: 188, count: 21, minSeconds: 150, seconds: 180 },
  { id: 'clarity', kind: 'sequence', title: 'Clarity', tagline: 'A morning and an evening affirmation for thirty days.', unit: 'Day', role: 'settle', hue: 168, count: 30, minSeconds: 20 },
  { id: 'awakening', kind: 'sequence', title: 'Sixty-Six Days of Awakening', tagline: 'One question, one affirmation, one practice — voices from every tradition.', unit: 'Day', role: 'learn', hue: 268, count: 66, minSeconds: 25 },
  { id: 'onegod', kind: 'sequence', title: 'One God, One Voice', tagline: 'Thirty-two messages on the oneness beneath every name.', unit: 'Voice', role: 'learn', hue: 42, count: 32, minSeconds: 25 },
  { id: 'journey', kind: 'sequence', title: 'The Human Journey', tagline: 'From the first light to a shared future — one chapter a day.', unit: 'Chapter', role: 'learn', hue: 222, count: 55, minSeconds: 40 },
  { id: 'thoughts', kind: 'sequence', title: 'ONE', tagline: 'Ninety-nine thoughts in an ever-widening circle of belonging.', unit: 'Thought', role: 'learn', hue: 330, count: 99, minSeconds: 15 },
  { id: 'escape', kind: 'sequence', title: 'Matrix Escape', tagline: 'A truth to see and a prompt to test it — for the age of urgency.', unit: 'Lesson', role: 'practice', hue: 28, count: 21, minSeconds: 25 },
  { id: 'loop', kind: 'sequence', title: 'The Loop', tagline: 'Twenty-one days of greater choice: notice, reveal, respond, practise.', unit: 'Day', role: 'practice', hue: 152, count: 21, minSeconds: 40 },
  { id: 'rewire', kind: 'sequence', title: 'Rewire', tagline: 'A daily wallpaper ritual — a cue you carry in your pocket.', unit: 'Day', role: 'practice', hue: 300, count: 30, minSeconds: 15 },
  // Experiences — immersive worlds that open as the path deepens.
  { id: 'sleep', kind: 'experience', title: 'Twenty Minutes Down', tagline: 'A guided breathing and pink-noise wind-down for sleep.', file: 'sleep.html', role: 'settle', hue: 236, unlockAfter: 0, minSeconds: 120, when: 'evening' },
  { id: 'passage', kind: 'experience', title: 'The Passage', tagline: 'A ten-minute audiovisual voyage through seven worlds.', file: 'passage.html', role: 'settle', hue: 196, unlockAfter: 3, minSeconds: 150 },
  { id: 'frequency', kind: 'experience', title: 'Frequency Playground', tagline: 'Ninety-nine moments to play, tune and feel.', file: 'frequency.html', role: 'practice', hue: 54, unlockAfter: 5, minSeconds: 120 },
  { id: 'mirror', kind: 'experience', title: 'The Human Mirror', tagline: 'Fourteen worlds that show you to yourself.', file: 'mirror.html', role: 'learn', hue: 205, unlockAfter: 7, minSeconds: 150 },
  { id: 'mirror2', kind: 'experience', title: 'The Mirror, Reimagined', tagline: 'The same mirror — a new act, a new light.', file: 'mirror-reimagined.html', role: 'learn', hue: 14, unlockAfter: 10, minSeconds: 150 },
  { id: 'sanctuary', kind: 'experience', title: 'The Human Sanctuary', tagline: 'Fourteen scenes of quiet, built to be stayed in.', file: 'sanctuary.html', role: 'settle', hue: 150, unlockAfter: 14, minSeconds: 150 },
];
export const realmById = id => REALMS.find(r => r.id === id);
export const SEQUENCES = REALMS.filter(r => r.kind === 'sequence');
export const EXPERIENCES = REALMS.filter(r => r.kind === 'experience');

export const MOODS = [
  { id: 'heavy', label: 'Heavy', hint: 'Weighed down, tired, or tense' },
  { id: 'scattered', label: 'Scattered', hint: 'Busy mind, hard to land' },
  { id: 'steady', label: 'Steady', hint: 'Okay — ready to go deeper' },
  { id: 'bright', label: 'Bright', hint: 'Open, energised, curious' },
];
export const AFTER = [
  { id: 'lighter', label: 'Lighter' }, { id: 'same', label: 'About the same' }, { id: 'clearer', label: 'Clearer' }, { id: 'moved', label: 'Moved' },
];
export const INTENTS = [
  { id: 'calm', label: 'Calm my mind', boost: ['protocol', 'clarity', 'sleep', 'passage', 'sanctuary'] },
  { id: 'clarity', label: 'Think more clearly', boost: ['loop', 'escape', 'rewire', 'mirror'] },
  { id: 'meaning', label: 'Find meaning', boost: ['awakening', 'onegod', 'thoughts', 'mirror2'] },
  { id: 'belonging', label: 'Feel one with others', boost: ['journey', 'thoughts', 'onegod', 'sanctuary'] },
  { id: 'habits', label: 'Change a habit', boost: ['rewire', 'loop', 'frequency'] },
];
export const GATE_LENGTHS = { quick: { n: 1, label: 'Quick', mins: 5 }, steady: { n: 2, label: 'Steady', mins: 12 }, deep: { n: 3, label: 'Deep', mins: 20 } };
const ROLE_ORDER = { settle: 0, learn: 1, practice: 2 };
const MOOD_WEIGHTS = {
  heavy: { settle: 3.2, learn: 1.4, practice: 0.7 },
  scattered: { settle: 2.2, practice: 2.4, learn: 1.0 },
  steady: { settle: 1.0, practice: 1.6, learn: 2.4 },
  bright: { settle: 0.7, practice: 2.3, learn: 2.1 },
};

/* ───────────────────────────── Errors ───────────────────────────── */
export class EngineError extends Error {
  constructor(code, message, status = 400) { super(message || code); this.code = code; this.status = status; }
}
const MESSAGES = {
  not_open: 'That one is not open yet — finish the one before it first.',
  sealed_until_tomorrow: 'You already opened this today. The next one reveals tomorrow.',
  too_fast: 'Stay a little longer with it — it counts when you have really been here.',
  gate_incomplete: 'Finish the stations above first, then seal the day.',
  locked: 'This world opens as your path deepens.',
};
const err = (code, status) => new EngineError(code, MESSAGES[code] || code, status);

/* ───────────────────────────── Time (timezone-aware, no libs) ───────────────────────────── */
const fmtCache = new Map();
function fmt(tz) {
  if (!fmtCache.has(tz)) {
    try { fmtCache.set(tz, new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })); }
    catch { return fmt('UTC'); }
  }
  return fmtCache.get(tz);
}
function parts(ms, tz) {
  const o = {}; for (const p of fmt(tz).formatToParts(new Date(ms))) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
}
export const pad2 = n => String(n).padStart(2, '0');
export const dateKey = (ms, tz) => { const p = parts(ms, tz); return `${p.y}-${pad2(p.m)}-${pad2(p.d)}`; };
export const hourLocal = (ms, tz) => parts(ms, tz).h;
const keyToUTC = k => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
export const addDays = (k, n) => { const t = new Date(keyToUTC(k) + n * 86400000); return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`; };
export const daysBetween = (a, b) => Math.round((keyToUTC(b) - keyToUTC(a)) / 86400000);
function tzOffsetMs(ms, tz) { const p = parts(ms, tz); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000; }
/** The instant the next local day begins. */
export function nextMidnight(ms, tz) {
  const g = keyToUTC(addDays(dateKey(ms, tz), 1));
  let t = g - tzOffsetMs(g, tz); t = g - tzOffsetMs(t, tz); return t;
}
export const clockNow = doc => Date.now() + ((doc.dev && doc.dev.offsetMs) || 0);

/* ───────────────────────────── Seeded randomness (the "shuffle") ───────────────────────────── */
function hash(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; }; }
export function rng(seed) { let a = hash(String(seed))(); return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ───────────────────────────── Document ───────────────────────────── */
export function newDoc({ id, name, tz = 'UTC', intents = [], length = 'steady', now = Date.now() }) {
  return {
    v: 1, id, name: String(name || 'Friend').slice(0, 40), tz, intents: intents.filter(i => INTENTS.some(x => x.id === i)).slice(0, 3),
    length: GATE_LENGTHS[length] ? length : 'steady', createdAt: now, seed: Math.floor(Math.random() * 1e9), pathDay: 1,
    ptr: Object.fromEntries(SEQUENCES.map(r => [r.id, 0])), lastDone: {}, units: {}, gate: null, moodDate: null,
    daysDone: [], bestStreak: 0, days: {}, reflections: [], moods: [], exp: {}, log: [], prefs: { sound: false, voice: false }, onboarded: false, dev: { offsetMs: 0 },
  };
}
const day = (doc, key) => (doc.days[key] ||= { seconds: 0, units: 0, exps: 0 });
function pushLog(doc, e) { doc.log.push(e); if (doc.log.length > 800) doc.log.splice(0, doc.log.length - 800); }
const gateMinutes = doc => GATE_LENGTHS[doc.length].mins;

export function streakOf(doc, now) {
  const today = dateKey(now, doc.tz); const set = new Set(doc.daysDone);
  let k = set.has(today) ? today : addDays(today, -1); let n = 0;
  while (set.has(k)) { n++; k = addDays(k, -1); }
  return n;
}
export const totalUnits = doc => Object.keys(doc.units).length;
export const experienceUnlocked = (doc, r) => doc.daysDone.length >= r.unlockAfter;

/* ───────────────────────────── The adaptive planner ───────────────────────────── */
function engagement(doc, realmId) {
  // How long the person actually stays with a realm vs. what it asks. 0..1
  const recs = Object.entries(doc.units).filter(([k]) => k.startsWith(realmId + ':')).map(([, v]) => v).slice(-3);
  if (!recs.length) return 0.5; const r = realmById(realmId);
  const avg = recs.reduce((a, b) => a + b.seconds, 0) / recs.length; return Math.max(0, Math.min(1, avg / (r.minSeconds * 3)));
}
function scoreRealm(doc, r, mood, today, rand) {
  const w = (MOOD_WEIGHTS[mood] || MOOD_WEIGHTS.steady)[r.role];
  const last = doc.lastDone[r.id]; const gap = last ? Math.min(5, daysBetween(last, today)) : 5;
  const intent = doc.intents.some(i => INTENTS.find(x => x.id === i)?.boost.includes(r.id)) ? 1.1 : 0;
  return w + gap * 0.45 + intent + engagement(doc, r.id) * 0.8 + rand() * 1.4;
}
function planUnits(doc, mood, today, n, salt, exclude = []) {
  const rand = rng(`${doc.seed}|${today}|${doc.pathDay}|${salt}`);
  const cands = SEQUENCES.filter(r => doc.ptr[r.id] < r.count && doc.lastDone[r.id] !== today && !exclude.includes(r.id))
    .map(r => ({ r, s: scoreRealm(doc, r, mood, today, rand) })).sort((a, b) => b.s - a.s);
  const picks = cands.slice(0, n).map(c => c.r);
  if (mood === 'heavy' && n > 0 && picks.length && !picks.some(p => p.role === 'settle')) {
    const settle = cands.find(c => c.r.role === 'settle'); if (settle) picks[picks.length - 1] = settle.r;
  }
  return picks.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
}
function pickInvite(doc, mood, now, today) {
  const hr = hourLocal(now, doc.tz); const rand = rng(`${doc.seed}|inv|${today}`);
  const c = EXPERIENCES.filter(r => experienceUnlocked(doc, r) && !((doc.exp[r.id] || {}).last === today))
    .map(r => {
      let s = rand() * 1.5; if (r.when === 'evening') s += (hr >= 19 || hr < 4) ? 4 : -2;
      if (mood === 'heavy' && r.role === 'settle') s += 1.5; if (mood === 'bright' && r.role !== 'settle') s += 1;
      if (doc.intents.some(i => INTENTS.find(x => x.id === i)?.boost.includes(r.id))) s += 1;
      s -= Math.min(3, (doc.exp[r.id] || {}).sessions || 0) * 0.6; return { r, s };
    }).sort((a, b) => b.s - a.s);
  return c.length ? { realm: c[0].r.id } : null;
}
const unitStation = r => ({ id: `u:${r.id}`, type: 'unit', realm: r.id, role: r.role, done: false });
const bindIdx = (doc, st) => ({ ...st, idx: doc.ptr[st.realm] });

/** First open of a local day: take the mood, build (or refresh) today's gate. */
export function openGate(doc, mood, now) {
  if (!MOODS.some(m => m.id === mood)) mood = 'steady';
  const today = dateKey(now, doc.tz); const g = doc.gate;
  doc.moods.push({ date: today, before: mood }); if (doc.moods.length > 400) doc.moods.shift();
  pushLog(doc, { t: now, date: today, type: 'mood', mood });
  doc.moodDate = today; day(doc, today);
  const n = GATE_LENGTHS[doc.length].n;
  if (!g || (g.complete && g.date < today)) {
    if (g && g.complete) doc.pathDay += 1;
    const units = planUnits(doc, mood, today, n, 'open');
    doc.gate = { day: doc.pathDay, date: today, mood, complete: false, rerolls: 0, openedAt: now, stations: [...units.map(r => bindIdx(doc, unitStation(r))), { id: 'seal', type: 'seal', done: false }], invite: pickInvite(doc, mood, now, today) };
  } else if (!g.complete) {
    // Carried over: keep what is already lived, re-plan the rest around today's mood.
    for (const s of g.stations) if (s.type === 'unit' && !s.done && doc.ptr[s.realm] > s.idx) { s.done = true; }
    const kept = g.stations.filter(s => s.type === 'unit' && s.done);
    const need = Math.max(0, n - kept.length);
    const units = planUnits(doc, mood, today, need, 'carry', kept.map(s => s.realm));
    doc.gate = { ...g, mood, carried: true, date: today, stations: [...kept, ...units.map(r => bindIdx(doc, unitStation(r))), { id: 'seal', type: 'seal', done: false }], invite: pickInvite(doc, mood, now, today) };
  }
  return doc;
}

/** Re-roll the stations you have not yet lived. */
export function shuffleGate(doc, now) {
  const g = doc.gate; const today = dateKey(now, doc.tz);
  if (!g || g.complete || g.date !== today) throw new EngineError('no_gate', 'There is no open gate to shuffle.');
  if ((g.rerolls || 0) >= 5) throw new EngineError('shuffle_limit', 'You have shuffled a lot today — trust this flow, or pick any realm yourself.');
  const kept = g.stations.filter(s => s.type === 'unit' && s.done);
  const open = g.stations.filter(s => s.type === 'unit' && !s.done);
  g.rerolls = (g.rerolls || 0) + 1; doc.seed = (doc.seed + 7919) % 1e9;
  const units = planUnits(doc, g.mood, today, open.length, `shuf${g.rerolls}`, [...kept.map(s => s.realm), ...open.map(s => s.realm)]);
  const fallback = planUnits(doc, g.mood, today, open.length, `shuf${g.rerolls}b`, kept.map(s => s.realm));
  const chosen = (units.length === open.length ? units : fallback).sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  g.stations = [...kept, ...chosen.map(r => bindIdx(doc, unitStation(r))), g.stations.find(s => s.type === 'seal')];
  g.stations.sort((a, b) => (a.type === 'seal') - (b.type === 'seal'));
  pushLog(doc, { t: now, date: today, type: 'shuffle' });
  return doc;
}

/* ───────────────────────────── Activity ───────────────────────────── */
export function completeUnit(doc, { realm, idx, seconds = 0, note = '' }, now) {
  const r = realmById(realm); if (!r || r.kind !== 'sequence') throw new EngineError('bad_realm', 'Unknown realm.');
  const today = dateKey(now, doc.tz); seconds = Math.max(0, Math.min(3600, Math.round(+seconds || 0)));
  if (!Number.isInteger(idx) || idx !== doc.ptr[r.id]) throw err('not_open');
  if (doc.lastDone[r.id] === today) throw err('sealed_until_tomorrow');
  if (seconds < r.minSeconds) throw err('too_fast');
  doc.units[`${r.id}:${idx}`] = { date: today, seconds, at: now };
  doc.ptr[r.id] = idx + 1; doc.lastDone[r.id] = today;
  const d = day(doc, today); d.units += 1; d.seconds += seconds;
  pushLog(doc, { t: now, date: today, type: 'unit', realm, idx, seconds });
  if (note && String(note).trim()) addReflection(doc, { realm, idx, text: note }, now);
  const st = doc.gate && doc.gate.stations.find(s => s.type === 'unit' && s.realm === realm && s.idx === idx);
  if (st) { st.done = true; st.seconds = seconds; }
  return doc;
}
export function addReflection(doc, { realm = null, idx = null, text, mood = null }, now) {
  text = String(text || '').trim().slice(0, 1200); if (!text) return doc;
  doc.reflections.push({ id: `${now.toString(36)}${doc.reflections.length}`, date: dateKey(now, doc.tz), realm, idx, text, mood, at: now });
  if (doc.reflections.length > 500) doc.reflections.shift(); return doc;
}
export function completeExperience(doc, { realm, seconds = 0 }, now) {
  const r = realmById(realm); if (!r || r.kind !== 'experience') throw new EngineError('bad_realm', 'Unknown world.');
  if (!experienceUnlocked(doc, r)) throw err('locked', 403);
  seconds = Math.max(0, Math.min(7200, Math.round(+seconds || 0))); if (seconds < r.minSeconds) throw err('too_fast');
  const today = dateKey(now, doc.tz); const e = (doc.exp[realm] ||= { sessions: 0, seconds: 0 });
  const first = e.last !== today; e.sessions += 1; e.seconds += seconds; e.last = today;
  const d = day(doc, today); d.seconds += seconds; if (first) d.exps += 1;
  pushLog(doc, { t: now, date: today, type: 'experience', realm, seconds });
  if (doc.gate && doc.gate.invite && doc.gate.invite.realm === realm) doc.gate.invite.done = true;
  return doc;
}
/** Time spent that did not (yet) complete anything — still counted as presence. */
export function logTime(doc, { realm = null, seconds = 0 }, now) {
  seconds = Math.max(0, Math.min(3600, Math.round(+seconds || 0))); if (!seconds) return doc;
  const today = dateKey(now, doc.tz); day(doc, today).seconds += seconds; pushLog(doc, { t: now, date: today, type: 'time', realm, seconds }); return doc;
}
/** Closing the day. Requires every unit station to be lived. */
export function sealDay(doc, { after = 'same', note = '' }, now) {
  const g = doc.gate; const today = dateKey(now, doc.tz);
  if (!g || g.date !== today) throw new EngineError('no_gate', 'Open today’s gate first.');
  if (g.complete) return doc;
  if (g.stations.some(s => s.type === 'unit' && !s.done)) throw err('gate_incomplete');
  if (!AFTER.some(a => a.id === after)) after = 'same';
  g.stations.find(s => s.type === 'seal').done = true; g.complete = true; g.sealedAt = now; g.after = after;
  const m = [...doc.moods].reverse().find(x => x.date === today && !x.after); if (m) m.after = after;
  if (!doc.daysDone.includes(today)) doc.daysDone.push(today);
  if (note && String(note).trim()) addReflection(doc, { text: note, mood: after }, now);
  doc.bestStreak = Math.max(doc.bestStreak, streakOf(doc, now));
  pushLog(doc, { t: now, date: today, type: 'seal', after });
  return doc;
}

/* ───────────────────────────── Views (what the UI needs) ───────────────────────────── */
export function realmStatus(doc, r, now) {
  const today = dateKey(now, doc.tz);
  if (r.kind === 'experience') {
    const unlocked = experienceUnlocked(doc, r); const e = doc.exp[r.id] || {};
    return { id: r.id, unlocked, need: Math.max(0, r.unlockAfter - doc.daysDone.length), sessions: e.sessions || 0, doneToday: e.last === today };
  }
  const ptr = doc.ptr[r.id]; const doneToday = doc.lastDone[r.id] === today;
  return { id: r.id, ptr, count: r.count, doneToday, finished: ptr >= r.count, openIdx: ptr < r.count && !doneToday ? ptr : null };
}
export function insights(doc, now) {
  const today = dateKey(now, doc.tz); const bars = [];
  for (let i = 13; i >= 0; i--) { const k = addDays(today, -i); const d = doc.days[k] || { seconds: 0 }; bars.push({ date: k, minutes: Math.round(d.seconds / 6) / 10 }); }
  const totalSeconds = Object.values(doc.days).reduce((a, d) => a + d.seconds, 0);
  const lift = doc.moods.filter(m => m.after).reduce((a, m) => a + (['lighter', 'clearer', 'moved'].includes(m.after) ? 1 : 0), 0);
  const sealed = doc.moods.filter(m => m.after).length;
  return { bars, totalMinutes: Math.round(totalSeconds / 60), units: totalUnits(doc), reflections: doc.reflections.length, streak: streakOf(doc, now), best: Math.max(doc.bestStreak, streakOf(doc, now)), daysDone: doc.daysDone.length, liftRate: sealed ? Math.round((lift / sealed) * 100) : null };
}
/** What the sealed gate says about tomorrow — shaped by what you actually did. */
export function tomorrowTeaser(doc, now) {
  const g = doc.gate; if (!g || !g.complete) return null;
  const today = dateKey(now, doc.tz); const secs = (doc.days[today] || {}).seconds || 0; const mins = Math.max(1, Math.round(secs / 60));
  const after = g.after; const mood = g.mood;
  const nextMood = after === 'lighter' || after === 'clearer' ? 'steady' : after === 'moved' ? 'bright' : mood;
  const probe = JSON.parse(JSON.stringify(doc)); probe.pathDay += 1;
  const tm = addDays(today, 1);
  const lean = planUnits(probe, nextMood, tm, Math.min(2, GATE_LENGTHS[doc.length].n + (secs > gateMinutes(doc) * 60 * 1.2 ? 1 : 0)), 'tease').map(r => r.id);
  let line;
  if (mood === 'heavy' && (after === 'lighter' || after === 'clearer')) line = `You arrived heavy and left ${after}. Tomorrow keeps the gentleness and asks for one step more.`;
  else if (after === 'moved') line = 'Something moved in you today. Tomorrow opens a little wider.';
  else if (secs > gateMinutes(doc) * 60 * 1.2) line = `You stayed ${mins} minutes today — deeper than planned. Tomorrow's gate opens one layer further.`;
  else if (mood === 'scattered') line = 'You came in scattered and finished anyway. Tomorrow leans toward grounding and small, clear actions.';
  else line = 'You kept your word to yourself today. Tomorrow builds on exactly that.';
  return { line, lean, minutes: mins };
}
export function viewOf(doc, now) {
  const today = dateKey(now, doc.tz); const g = doc.gate;
  if (g && !g.complete) for (const s of g.stations) if (s.type === 'unit' && !s.done && doc.ptr[s.realm] > s.idx) s.done = true;
  const gateToday = !!g && g.date === today;
  return {
    today, now, tz: doc.tz, hour: hourLocal(now, doc.tz), nextOpenAt: nextMidnight(now, doc.tz), pathDay: gateToday || (g && !g.complete) ? g.day : doc.pathDay + (g && g.complete ? 1 : 0),
    needsCheckin: doc.moodDate !== today, gate: g, gateSealed: !!(g && g.complete && g.date === today),
    teaser: g && g.complete && g.date === today ? tomorrowTeaser(doc, now) : null,
    realms: Object.fromEntries(REALMS.map(r => [r.id, realmStatus(doc, r, now)])), stats: insights(doc, now),
  };
}
export function publicDoc(doc) { const { ...d } = doc; delete d.pin; return d; }
