#!/usr/bin/env node
// UGT Path — zero-dependency full-stack server (Node >= 18).
//   npm start            → http://localhost:3000
//   PORT=8080 npm start  → custom port
//   DATA_DIR=/var/ugt    → where the database lives
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as E from './public/js/engine.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const portArg = process.argv.indexOf('--port');
const PORT = +process.env.PORT || (portArg >= 0 ? +process.argv[portArg + 1] : 0) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const DEV = process.env.NODE_ENV !== 'production';
const DB_FILE = path.join(DATA_DIR, 'db.json');

/* ───────────── Database: one JSON file, atomic writes, debounced ───────────── */
fs.mkdirSync(DATA_DIR, { recursive: true });
let db = { users: {}, sessions: {} };
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); db.users ||= {}; db.sessions ||= {}; } catch { /* first run */ }
let saveTimer = null, saving = false, dirty = false;
function save() { dirty = true; if (saveTimer) return; saveTimer = setTimeout(flush, 250); }
function flush() {
  saveTimer = null; if (saving || !dirty) return; saving = true; dirty = false;
  const tmp = DB_FILE + '.tmp';
  fs.writeFile(tmp, JSON.stringify(db), err => {
    if (!err) fs.rename(tmp, DB_FILE, () => { saving = false; if (dirty) save(); }); else { saving = false; console.error('db write failed', err.message); }
  });
}
function flushSync() { if (!dirty) return; try { fs.writeFileSync(DB_FILE, JSON.stringify(db)); dirty = false; } catch (e) { console.error(e.message); } }
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { flushSync(); process.exit(0); });
process.on('exit', flushSync);

/* ───────────── Helpers ───────────── */
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const rid = n => crypto.randomBytes(n).toString('hex');
const newUGTId = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const pick = () => Array.from({ length: 4 }, () => a[crypto.randomInt(a.length)]).join(''); return `UGT-${pick()}-${pick()}`; };
function hashPin(pin, salt = rid(8)) { return { salt, hash: crypto.scryptSync(String(pin), salt, 32).toString('hex') }; }
function checkPin(pin, rec) { if (!rec) return false; const h = crypto.scryptSync(String(pin), rec.salt, 32); const b = Buffer.from(rec.hash, 'hex'); return b.length === h.length && crypto.timingSafeEqual(h, b); }
const cleanText = (s, n) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);

const buckets = new Map();
function limited(ip, key, max, windowMs) {
  const k = `${ip}|${key}`; const now = Date.now(); const b = (buckets.get(k) || []).filter(t => now - t < windowMs);
  b.push(now); buckets.set(k, b); return b.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of buckets) if (!v.some(t => now - t < 120000)) buckets.delete(k); }, 60000).unref();

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.otf':'font/otf', '.ttf':'font/ttf', '.woff2':'font/woff2', '.zip':'application/zip' };
const SEC_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'SAMEORIGIN', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' };

function send(res, status, body, headers = {}) { res.writeHead(status, { ...SEC_HEADERS, ...headers }); res.end(body); }
const json = (res, status, obj) => send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 65536) { reject(Object.assign(new Error('Body too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { if (!chunks.length) return resolve({}); try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}

/* ───────────── Auth ───────────── */
function authed(req) {
  const h = req.headers.authorization || ''; const t = h.startsWith('Bearer ') ? h.slice(7) : ''; if (!t) return null;
  const uid = db.sessions[sha(t)]; return uid && db.users[uid] ? db.users[uid] : null;
}
function issue(user) { const token = rid(24); db.sessions[sha(token)] = user.id; save(); return token; }
const client = user => { const d = E.publicDoc(user.doc); return { id: user.id, hasPin: !!user.pin, doc: d }; };
const reply = (user, now, extra = {}) => ({ ok: true, ...client(user), view: E.viewOf(user.doc, now), ...extra });

/* ───────────── API ───────────── */
async function api(req, res, url) {
  const ip = req.socket.remoteAddress || '?'; const route = `${req.method} ${url.pathname}`;
  if (route === 'GET /api/health') return json(res, 200, { ok: true, users: Object.keys(db.users).length, time: Date.now() });
  if (route === 'GET /api/config') return json(res, 200, { ok: true, dev: DEV, realms: E.REALMS.length, version: 1 });

  if (route === 'POST /api/auth/start') {
    if (limited(ip, 'start', 12, 60000)) return json(res, 429, { ok: false, error: 'Too many attempts. Please wait a minute.' });
    const b = await readBody(req); let id; do id = newUGTId(); while (db.users[id]);
    const now = Date.now(); const tz = cleanText(b.tz, 60) || 'UTC';
    const doc = E.newDoc({ id, name: cleanText(b.name, 40) || 'Friend', tz, intents: Array.isArray(b.intents) ? b.intents : [], length: b.length, now });
    doc.onboarded = true; const user = { id, doc, createdAt: now }; db.users[id] = user; const token = issue(user);
    return json(res, 201, { ...reply(user, now), token });
  }
  if (route === 'POST /api/auth/restore') {
    if (limited(ip, 'restore', 8, 60000)) return json(res, 429, { ok: false, error: 'Too many attempts. Please wait a minute.' });
    const b = await readBody(req); const user = db.users[cleanText(b.id, 20).toUpperCase()];
    if (!user || !user.pin || !checkPin(cleanText(b.pin, 32), user.pin)) return json(res, 401, { ok: false, error: 'That ID and passphrase do not match.' });
    const now = E.clockNow(user.doc); return json(res, 200, { ...reply(user, now), token: issue(user) });
  }

  const user = authed(req); if (!user) return json(res, 401, { ok: false, error: 'Please sign in.' });
  const doc = user.doc; const now = E.clockNow(doc); const body = req.method === 'GET' ? {} : await readBody(req);
  const commit = (extra) => { save(); return json(res, 200, reply(user, E.clockNow(doc), extra)); };

  switch (route) {
    case 'GET /api/me': return json(res, 200, reply(user, now));
    case 'POST /api/gate/open': E.openGate(doc, body.mood, now); return commit();
    case 'POST /api/gate/shuffle': E.shuffleGate(doc, now); return commit();
    case 'POST /api/unit/complete': E.completeUnit(doc, { realm: cleanText(body.realm, 20), idx: body.idx, seconds: body.seconds, note: cleanText(body.note, 1200) }, now); return commit();
    case 'POST /api/experience/complete': E.completeExperience(doc, { realm: cleanText(body.realm, 20), seconds: body.seconds }, now); return commit();
    case 'POST /api/time': E.logTime(doc, { realm: cleanText(body.realm, 20) || null, seconds: body.seconds }, now); return commit();
    case 'POST /api/reflection': E.addReflection(doc, { realm: cleanText(body.realm, 20) || null, idx: Number.isInteger(body.idx) ? body.idx : null, text: cleanText(body.text, 1200) }, now); return commit();
    case 'POST /api/seal': E.sealDay(doc, { after: cleanText(body.after, 12), note: cleanText(body.note, 1200) }, now); return commit();
    case 'POST /api/profile': {
      if (body.name !== undefined) doc.name = cleanText(body.name, 40) || doc.name;
      if (Array.isArray(body.intents)) doc.intents = body.intents.filter(i => E.INTENTS.some(x => x.id === i)).slice(0, 3);
      if (E.GATE_LENGTHS[body.length]) doc.length = body.length;
      if (body.prefs && typeof body.prefs === 'object') doc.prefs = { sound: !!body.prefs.sound, voice: !!body.prefs.voice };
      if (typeof body.tz === 'string' && body.tz.length < 60) doc.tz = body.tz;
      return commit();
    }
    case 'POST /api/pin': {
      const pin = cleanText(body.pin, 32); if (pin.length < 4) return json(res, 400, { ok: false, error: 'Use at least 4 characters.' });
      user.pin = hashPin(pin); return commit();
    }
    case 'POST /api/dev/advance': {
      if (!DEV) return json(res, 403, { ok: false, error: 'Disabled in production.' });
      const n = Math.max(-1, Math.min(30, Math.round(+body.days || 0))); doc.dev = { offsetMs: ((doc.dev && doc.dev.offsetMs) || 0) + n * 86400000 }; return commit();
    }
    case 'POST /api/dev/reset-time': { doc.dev = { offsetMs: 0 }; return commit(); }
    case 'DELETE /api/me': { for (const k of Object.keys(db.sessions)) if (db.sessions[k] === user.id) delete db.sessions[k]; delete db.users[user.id]; save(); return json(res, 200, { ok: true }); }
    case 'GET /api/export': return json(res, 200, { ok: true, export: E.publicDoc(doc) });
    default: return json(res, 404, { ok: false, error: 'Not found' });
  }
}

/* ───────────── Static files ───────────── */
const gzCache = new Map();
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname); if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep) && file !== PUBLIC) return send(res, 403, 'Forbidden');
  fs.stat(file, (e, st) => {
    if (e || !st.isFile()) { // SPA fallback for extension-less routes
      if (!path.extname(rel)) return serveStatic(req, res, new URL('/index.html', 'http://x'));
      return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
    }
    const ext = path.extname(file).toLowerCase(); const type = MIME[ext] || 'application/octet-stream';
    const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const cache = file.includes(path.sep+'assets'+path.sep+'books'+path.sep) ? 'public, max-age=31536000, immutable' : ext === '.mp4' || ext === '.webp' || ext === '.png' ? 'public, max-age=86400' : 'no-cache';
    if (req.headers['if-none-match'] === etag) return send(res, 304, '', { ETag: etag, 'Cache-Control': cache });
    const range = req.headers.range;
    if (range && ext === '.mp4') {
      const m = /bytes=(\d*)-(\d*)/.exec(range); let start = m && m[1] ? +m[1] : 0; let end = m && m[2] ? +m[2] : st.size - 1;
      if (start >= st.size || end >= st.size || start > end) { return send(res, 416, '', { 'Content-Range': `bytes */${st.size}` }); }
      res.writeHead(206, { ...SEC_HEADERS, 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': cache });
      return req.method === 'HEAD' ? res.end() : fs.createReadStream(file, { start, end }).pipe(res);
    }
    const compressible = /^(text\/|application\/json|image\/svg)/.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    const h = { ...SEC_HEADERS, 'Content-Type': type, ETag: etag, 'Cache-Control': cache, 'Accept-Ranges': 'bytes' };
    if (compressible) {
      const key = file + etag; let buf = gzCache.get(key);
      if (!buf) { buf = zlib.gzipSync(fs.readFileSync(file)); if (gzCache.size > 200) gzCache.clear(); gzCache.set(key, buf); }
      res.writeHead(200, { ...h, 'Content-Encoding': 'gzip', 'Content-Length': buf.length, Vary: 'Accept-Encoding' }); return req.method === 'HEAD' ? res.end() : res.end(buf);
    }
    res.writeHead(200, { ...h, 'Content-Length': st.size }); if (req.method === 'HEAD') return res.end(); fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    return serveStatic(req, res, url);
  } catch (e) {
    if (e instanceof E.EngineError) return json(res, e.status || 400, { ok: false, code: e.code, error: e.message });
    const status = e.status || 500; if (status === 500) console.error(e);
    return json(res, status, { ok: false, error: status === 500 ? 'Something went wrong on our side.' : e.message });
  }
});
server.listen(PORT, () => console.log(`\n  Human Within is running → http://localhost:${PORT}\n  data: ${DB_FILE}${DEV ? '  (dev mode: time-travel enabled)' : ''}\n`));
export { server };
