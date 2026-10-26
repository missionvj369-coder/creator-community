import assert from 'node:assert/strict';
import * as E from '../public/js/engine.js';
const tz = 'Asia/Kolkata'; const H = 3600e3, D = 86400e3;
let now = Date.UTC(2026, 9, 25, 4, 0); // 09:30 IST
const doc = E.newDoc({ id: 'UGT-TEST-0001', name: 'Asha', tz, intents: ['calm'], length: 'steady', now });
// 1. check-in builds a gate
assert.equal(E.viewOf(doc, now).needsCheckin, true);
E.openGate(doc, 'heavy', now);
let g = doc.gate; assert.equal(g.stations.filter(s => s.type === 'unit').length, 2); assert.equal(g.stations.at(-1).type, 'seal');
assert.ok(g.stations.some(s => s.role === 'settle'), 'heavy mood must include a settling station');
// 2. cannot seal before living the units; cannot rush; cannot skip ahead
assert.throws(() => E.sealDay(doc, { after: 'lighter' }, now), /Finish the stations/);
const u1 = g.stations[0];
assert.throws(() => E.completeUnit(doc, { realm: u1.realm, idx: u1.idx, seconds: 1 }, now), /Stay a little longer/);
assert.throws(() => E.completeUnit(doc, { realm: u1.realm, idx: u1.idx + 1, seconds: 999 }, now), /not open yet/);
// 3. live both units
for (const s of g.stations.filter(s => s.type === 'unit')) E.completeUnit(doc, { realm: s.realm, idx: s.idx, seconds: 200, note: 'noticed' }, now);
// 4. ONE chapter per day per realm: same realm cannot open twice in a day
assert.throws(() => E.completeUnit(doc, { realm: u1.realm, idx: 1, seconds: 999 }, now), /tomorrow/);
E.sealDay(doc, { after: 'lighter', note: 'good' }, now);
let v = E.viewOf(doc, now); assert.equal(v.gateSealed, true); assert.ok(v.teaser.line.length > 10); assert.equal(doc.daysDone.length, 1); assert.equal(v.stats.streak, 1);
// 5. next day reveals the NEXT unit of the realms lived today
now += D; v = E.viewOf(doc, now); assert.equal(v.needsCheckin, true); assert.equal(v.gateSealed, false);
const prev = g.stations.filter(s => s.type === 'unit').map(s => s.realm + ':' + s.idx);
E.openGate(doc, 'bright', now); const g2 = doc.gate; assert.equal(g2.day, 2);
for (const s of g2.stations.filter(s => s.type === 'unit')) { assert.ok(!prev.includes(s.realm + ':' + s.idx)); assert.equal(s.idx, doc.ptr[s.realm]); }
// 6. missing a day does not skip the path; streak resets but progress waits
E.completeUnit(doc, { realm: g2.stations[0].realm, idx: g2.stations[0].idx, seconds: 300 }, now);
now += 3 * D; v = E.viewOf(doc, now); assert.equal(v.stats.streak, 0); assert.equal(v.needsCheckin, true);
E.openGate(doc, 'steady', now); assert.equal(doc.gate.day, 2, 'unfinished gate is carried, not skipped'); assert.ok(doc.gate.carried);
assert.ok(doc.gate.stations.some(s => s.done), 'lived stations stay lived');
// 7. shuffle re-rolls only unlived stations and is limited
const before = doc.gate.stations.filter(s => !s.done && s.type === 'unit').map(s => s.realm).join();
E.shuffleGate(doc, now); assert.equal(doc.gate.stations.filter(s => s.done).length, 1);
for (let i = 0; i < 4; i++) E.shuffleGate(doc, now); assert.throws(() => E.shuffleGate(doc, now), /shuffled a lot/);
// 8. experiences unlock with days done
assert.throws(() => E.completeExperience(doc, { realm: 'passage', seconds: 999 }, now), /opens as your path deepens/);
E.completeExperience(doc, { realm: 'sleep', seconds: 300 }, now); assert.equal(doc.exp.sleep.sessions, 1);
// 9. time helpers across zones
assert.equal(E.dateKey(Date.UTC(2026, 9, 25, 20, 0), 'Asia/Kolkata'), '2026-10-26');
assert.equal(E.dateKey(Date.UTC(2026, 9, 25, 20, 0), 'America/Los_Angeles'), '2026-10-25');
const nm = E.nextMidnight(Date.UTC(2026, 9, 25, 4, 0), 'Asia/Kolkata'); assert.equal(E.dateKey(nm, 'Asia/Kolkata'), '2026-10-26'); assert.equal(E.dateKey(nm - 1, 'Asia/Kolkata'), '2026-10-25');
// 10. unit counts match content files
import fs from 'node:fs';
const map = { protocol: 'protocol', clarity: 'clarity', awakening: 'awakening', onegod: 'onegod', thoughts: 'oneThoughts', escape: 'p3truths', loop: 'loop', rewire: 'rewire' };
for (const [id, f] of Object.entries(map)) assert.equal(JSON.parse(fs.readFileSync(`public/content/${f}.json`)).length, E.realmById(id).count, id);
assert.equal(['journey1', 'journey2', 'journey3'].reduce((a, f) => a + JSON.parse(fs.readFileSync(`public/content/${f}.json`)).length, 0), E.realmById('journey').count);
console.log('engine: all assertions passed');
