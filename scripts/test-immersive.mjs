import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { IMMERSIVE_WORLDS, immersiveStages, immersiveText, normaliseImmersive, immersiveDraft } from '../public/js/immersive-model.js';
import { worldGeometry, worldPoster } from '../public/js/immersive-world.js';
import { PRODUCTS } from '../public/js/catalogue.js';
import { unit } from '../public/js/content.js';
import { normaliseSpace, validateBackup } from '../public/js/space-model.js';

let failOnce=true;
globalThis.fetch=async url=>{if(url==='/content/clarity.json'&&failOnce){failOnce=false;throw Error('temporary connection loss');}return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join('public',url.replace(/^\//,'')),'utf8'))};};
await assert.rejects(()=>unit('clarity',0),/temporary connection loss/);assert((await unit('clarity',0)).title,'a temporary content failure must allow retry');
const ids=Object.keys(IMMERSIVE_WORLDS);assert.equal(ids.length,7);assert.equal(new Set(ids.map(id=>IMMERSIVE_WORLDS[id].world)).size,7);
const values=blocks=>blocks.flatMap(b=>[b.label,b.text,...(b.items||[]).flatMap(x=>[x.label,x.text,x.extra,x.cite])]).filter(x=>typeof x==='string'&&x.length).sort();
let count=0;
for(const id of ids){
  const product=PRODUCTS.find(p=>p.id===id);assert(product);
  for(let i=0;i<product.count;i++){
    const u=await unit(id,i),stages=immersiveStages(u);assert(stages.length>=2);assert.equal(stages[0].title,u.title);assert.equal(stages[0].lead,u.lead||'');
    assert.deepEqual(values(stages.flatMap(s=>s.blocks)),values(u.blocks),`${id}:${i} must retain every original heading, paragraph, prompt, verse, citation, note and practice`);
    assert(immersiveText(u).includes(u.title));count++;
  }
  for(const charge of [0,1,8]){const g=worldGeometry(IMMERSIVE_WORLDS[id].world,10,charge,5);for(const line of g.lines)for(const p of line.points)assert(p.length===3&&p.every(Number.isFinite));for(const p of g.nodes)assert(p.every(Number.isFinite));}
  const poster=worldPoster(id);assert(poster.startsWith('<svg'));assert(poster.length<90000);assert(!/NaN|undefined|Infinity/.test(poster));
}
assert.equal(count,324);assert.equal(new Set(ids.map(worldPoster)).size,7);assert.equal(worldGeometry('constellation').nodes.length,99);
const draft={loop:{idx:4,stage:3,note:'  Keep this unfinished thought.  ',at:Date.UTC(2026,10,6)},clarity:{idx:999,stage:-1,note:'x'.repeat(900)},unknown:{idx:1}};
const clean=normaliseImmersive(draft);assert.equal(clean.loop.note,draft.loop.note);assert.equal(clean.clarity.idx,29);assert.equal(clean.clarity.stage,0);assert.equal(clean.clarity.note.length,800);assert(!clean.unknown);
const previous={dailyPlan:{startedAt:100,draft:{id:'clarity',idx:2,note:'A reflection from the retired reader.'}}};
assert.equal(immersiveDraft(previous,'clarity').note,previous.dailyPlan.draft.note);assert.equal(immersiveDraft(previous,'clarity',new Set([2])),null,'a finished legacy draft must not reopen after completion');assert.equal(immersiveDraft({immersive:clean,...previous},'clarity').idx,29,'a current draft takes precedence over retired data');
const stored=normaliseSpace({immersive:clean,books:{'human-journey':{page:27,total:300}},notes:[{id:'kept',text:'A thought already kept.',at:1}]});
const restored=validateBackup({app:'human-within',version:1,profile:{name:'Asha'},progress:stored});assert.deepEqual(restored.space.immersive,clean);assert.equal(restored.space.books['human-journey'].page,27);assert.equal(restored.space.notes[0].text,'A thought already kept.');
console.log('immersive: 7 distinct worlds, all 324 adapted chapters preserved exactly, finite visual geometry, 99 constellation lights, safe partial-stage/reflection drafts and ebook-safe backups passed');
