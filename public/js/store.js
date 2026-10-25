// The store speaks to the Node server when it is there, and falls back to the very same engine
// running in the browser (localStorage) when the app is opened as static files or the server is away.
import * as E from './engine.js';

const TOKEN_KEY = 'ugt.token.v2', LOCAL_KEY = 'ugt.local.v2';
const listeners = new Set();
export const state = { mode: 'api', ready: false, dev: false, id: null, hasPin: false, doc: null, view: null, offline: false };
export const subscribe = fn => (listeners.add(fn), () => listeners.delete(fn));
const emit = () => listeners.forEach(fn => fn(state));
const tzNow = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } };

function fail(code, message, status) { return Object.assign(new Error(message), { code, status }); }
const mem = {};
const ls = { get: k => { try { return localStorage.getItem(k); } catch { return mem[k] ?? null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { mem[k] = v; } }, del: k => { try { localStorage.removeItem(k); } catch { delete mem[k]; } } };

/* ───────── API backend ───────── */
async function call(method, path, body) {
  const token = ls.get(TOKEN_KEY);
  const res = await fetch(path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = {}; try { data = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok || data.ok === false) throw fail(data.code || (res.status === 401 ? 'unauthorized' : 'error'), data.error || `Request failed (${res.status})`, res.status);
  return data;
}

/* ───────── Local backend (same rules, same engine) ───────── */
const local = {
  load() { try { return JSON.parse(ls.get(LOCAL_KEY) || 'null'); } catch { return null; } },
  save(doc) { ls.set(LOCAL_KEY, JSON.stringify(doc)); },
  reply(doc) { const now = E.clockNow(doc); return { ok: true, id: doc.id, hasPin: false, doc: E.publicDoc(doc), view: E.viewOf(doc, now) }; },
  act(name, b) {
    const doc = this.load(); if (!doc) throw fail('unauthorized', 'Please begin first.', 401); const now = E.clockNow(doc);
    switch (name) {
      case 'gate/open': E.openGate(doc, b.mood, now); break;
      case 'gate/shuffle': E.shuffleGate(doc, now); break;
      case 'unit/complete': E.completeUnit(doc, { realm: b.realm, idx: b.idx, seconds: b.seconds, note: (b.note || '').slice(0, 1200) }, now); break;
      case 'experience/complete': E.completeExperience(doc, { realm: b.realm, seconds: b.seconds }, now); break;
      case 'time': E.logTime(doc, { realm: b.realm || null, seconds: b.seconds }, now); break;
      case 'reflection': E.addReflection(doc, { realm: b.realm || null, idx: Number.isInteger(b.idx) ? b.idx : null, text: b.text }, now); break;
      case 'seal': E.sealDay(doc, { after: b.after, note: b.note }, now); break;
      case 'profile':
        if (b.name !== undefined) doc.name = String(b.name).trim().slice(0, 40) || doc.name;
        if (Array.isArray(b.intents)) doc.intents = b.intents.filter(i => E.INTENTS.some(x => x.id === i)).slice(0, 3);
        if (E.GATE_LENGTHS[b.length]) doc.length = b.length; if (b.prefs) doc.prefs = { sound: !!b.prefs.sound, voice: !!b.prefs.voice }; break;
      case 'dev/advance': doc.dev = { offsetMs: ((doc.dev && doc.dev.offsetMs) || 0) + Math.max(-1, Math.min(30, Math.round(+b.days || 0))) * 86400000 }; break;
      case 'dev/reset-time': doc.dev = { offsetMs: 0 }; break;
      default: throw fail('bad_action', 'Unknown action');
    }
    this.save(doc); return this.reply(doc);
  },
};

function apply(data) { state.id = data.id; state.hasPin = !!data.hasPin; state.doc = data.doc; state.view = data.view; emit(); return data; }

/** Boot: find out if a server is there, resume a session if we have one. */
export async function boot() {
  try {
    const cfg = await fetch('/api/config').then(r => (r.ok ? r.json() : Promise.reject())); state.mode = 'api'; state.dev = !!cfg.dev;
    if (ls.get(TOKEN_KEY)) { try { apply(await call('GET', '/api/me')); } catch (e) { if (e.code === 'unauthorized') ls.del(TOKEN_KEY); else throw e; } }
  } catch {
    state.mode = 'local'; state.dev = /^(localhost|127\.|\[::1\]|)$/.test(location.hostname);
    const doc = local.load(); if (doc) apply(local.reply(doc));
  }
  state.ready = true; emit(); return state;
}

export async function start({ name, intents, length }) {
  if (state.mode === 'api') { const d = await call('POST', '/api/auth/start', { name, intents, length, tz: tzNow() }); ls.set(TOKEN_KEY, d.token); return apply(d); }
  const id = `UGT-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const doc = E.newDoc({ id, name, tz: tzNow(), intents, length }); doc.onboarded = true; local.save(doc); return apply(local.reply(doc));
}
export async function restore(id, pin) {
  if (state.mode !== 'api') throw fail('offline', 'Restoring from another device needs the server.');
  const d = await call('POST', '/api/auth/restore', { id, pin }); ls.set(TOKEN_KEY, d.token); return apply(d);
}
export async function act(name, body = {}) {
  try {
    const d = state.mode === 'api' ? await call('POST', `/api/${name}`, body) : local.act(name, body); state.offline = false; return apply(d);
  } catch (e) {
    if (state.mode === 'api' && !e.status) { state.offline = true; emit(); throw fail('network', 'Can’t reach the server right now — your progress is safe, try again in a moment.'); }
    throw e;
  }
}
export async function setPin(pin) { const d = await call('POST', '/api/pin', { pin }); return apply(d); }
export async function exportData() { return state.mode === 'api' ? (await call('GET', '/api/export')).export : state.doc; }
export async function signOut(deleteAll) {
  if (deleteAll) { try { if (state.mode === 'api') await call('DELETE', '/api/me'); } catch { /* already gone */ } ls.del(LOCAL_KEY); }
  ls.del(TOKEN_KEY); state.doc = null; state.view = null; state.id = null; emit();
}
/** Fire-and-forget presence beacon (time spent that did not complete anything). */
export function beacon(realm, seconds) {
  if (seconds < 5 || !state.doc) return;
  if (state.mode === 'api') { const token = ls.get(TOKEN_KEY); try { fetch('/api/time', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ realm, seconds }) }).then(r => r.json()).then(d => d.ok && apply(d)).catch(() => {}); } catch { /* ignore */ } }
  else { try { apply(local.act('time', { realm, seconds })); } catch { /* ignore */ } }
}
export const nowMs = () => (state.doc ? E.clockNow(state.doc) : Date.now());
export async function refresh() { return state.mode === 'api' ? apply(await call('GET', '/api/me')) : apply(local.reply(local.load())); }
