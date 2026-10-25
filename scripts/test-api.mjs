import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ugt-')); const PORT = 3900 + Math.floor(Math.random() * 90);
const srv = spawn('node', ['server.js'], { env: { ...process.env, PORT, DATA_DIR: dir }, stdio: 'pipe' });
await new Promise(r => srv.stdout.on('data', d => String(d).includes('running') && r()));
const base = `http://localhost:${PORT}`; let token;
const call = async (m, p, b) => { const r = await fetch(base + p, { method: m, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, j: await r.json() }; };
try {
  assert.equal((await call('GET', '/api/me')).s, 401);
  let r = await call('POST', '/api/auth/start', { name: 'Test', intents: ['calm'], length: 'steady', tz: 'Asia/Kolkata' }); assert.equal(r.s, 201); token = r.j.token; const id = r.j.id; assert.match(id, /^UGT-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  assert.equal(r.j.view.needsCheckin, true);
  r = await call('POST', '/api/gate/open', { mood: 'scattered' }); assert.equal(r.s, 200); const units = r.j.view.gate.stations.filter(s => s.type === 'unit'); assert.equal(units.length, 2);
  r = await call('POST', '/api/unit/complete', { realm: units[0].realm, idx: units[0].idx, seconds: 2 }); assert.equal(r.s, 400); assert.equal(r.j.code, 'too_fast');
  r = await call('POST', '/api/seal', { after: 'same' }); assert.equal(r.j.code, 'gate_incomplete');
  for (const u of units) { r = await call('POST', '/api/unit/complete', { realm: u.realm, idx: u.idx, seconds: 400, note: 'hello <b>x</b>' }); assert.equal(r.s, 200); }
  r = await call('POST', '/api/unit/complete', { realm: units[0].realm, idx: units[0].idx + 1, seconds: 400 }); assert.equal(r.j.code, 'sealed_until_tomorrow');
  r = await call('POST', '/api/seal', { after: 'lighter', note: 'ok' }); assert.equal(r.j.view.gateSealed, true); assert.ok(r.j.view.teaser);
  // next day via time travel (dev mode)
  r = await call('POST', '/api/dev/advance', { days: 1 }); assert.equal(r.j.view.needsCheckin, true);
  r = await call('POST', '/api/gate/open', { mood: 'bright' }); assert.equal(r.j.view.gate.day, 2);
  for (const s of r.j.view.gate.stations.filter(s => s.type === 'unit')) assert.ok(s.idx >= 1 || !units.some(u => u.realm === s.realm));
  assert.equal((await call('POST', '/api/experience/complete', { realm: 'passage', seconds: 999 })).s, 403);
  assert.equal((await call('POST', '/api/experience/complete', { realm: 'sleep', seconds: 300 })).s, 200);
  // passphrase + restore on a "second device"
  assert.equal((await call('POST', '/api/pin', { pin: 'abc' })).s, 400);
  assert.equal((await call('POST', '/api/pin', { pin: 'open sesame' })).s, 200);
  const t1 = token; token = null; assert.equal((await call('POST', '/api/auth/restore', { id, pin: 'wrong' })).s, 401);
  r = await call('POST', '/api/auth/restore', { id, pin: 'open sesame' }); assert.equal(r.s, 200); token = r.j.token; assert.notEqual(token, t1); assert.equal(r.j.doc.name, 'Test');
  // reflections are stored as text, never executed
  assert.ok(r.j.doc.reflections.some(x => x.text.includes('<b>x</b>')));
  // persistence across a restart
  await new Promise(res => setTimeout(res, 600)); srv.kill('SIGTERM'); await new Promise(res => srv.on('exit', res));
  const db = JSON.parse(fs.readFileSync(path.join(dir, 'db.json'), 'utf8')); assert.ok(db.users[id]); assert.equal(db.users[id].doc.daysDone.length, 1);
  assert.ok(!JSON.stringify(db).includes('open sesame'), 'passphrase is never stored in clear');
  console.log('api: all assertions passed');
} catch (e) { console.error(e); srv.kill(); process.exit(1); }
