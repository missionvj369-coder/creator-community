import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {PRODUCTS} from '../public/js/catalogue.js';
import {unit} from '../public/js/content.js';
import {retiredWritingRoute,independentRoute,RETIRED_WRITING_STUDIOS} from '../public/js/experience-flow.js';
import {normaliseSpace,validateBackup} from '../public/js/space-model.js';
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join('public',url),'utf8'))});
for(const route of ['#/studios','#/home/studios','#/guide','#/thread/old','#/threads',...RETIRED_WRITING_STUDIOS.flatMap(id=>['product','experience','browse','read'].map(p=>`#/${p}/${id}`))]){
 assert.ok(retiredWritingRoute(route),route);assert.equal(independentRoute(route),'#/home');
}
for(const route of ['#/home','#/product/clarity','#/browse/escape/20','#/ebooks','#/book/human-journey','#/wallpapers'])assert.ok(!retiredWritingRoute(route),route);
const assignment=/\b(?:write (?:down|your|one|three|five|a |the|what)|jot(?: down)?|(?:record|list|draw|sketch) (?:one|your|the|a )|journal (?:your|the)|pen and paper|\[describe the situation\])/i;
let count=0;
for(const product of PRODUCTS.filter(p=>p.kind==='sequence'))for(let i=0;i<product.count;i++){
 const content=await unit(product.id,i);assert.ok(!assignment.test(JSON.stringify(content)),`${product.id}:${i} still asks for writing`);count++;
 if(product.id==='escape')assert.ok(!content.blocks.some(b=>b.t==='prompt'),'The practice must work inside this app without composing an AI request');
}
for(const name of ['rewire','wallpapers','scenarios'])for(const item of JSON.parse(fs.readFileSync(`public/content/${name}.json`)))assert.ok(!assignment.test([item.action,item.cue].filter(Boolean).join(' ')),`${name}:${item.day||item.title}`);
for(const n of [9,19])assert.ok(!assignment.test(fs.readFileSync(`public/wallpapers/human-within-${String(n).padStart(2,'0')}.svg`,'utf8')));
// User-owned writing from an older version remains recoverable even though the
// active experience no longer asks anyone to create it.
const progress=normaliseSpace({notes:[{id:'prior',text:'My previous note',at:1}],immersive:{clarity:{idx:0,stage:2,note:'A previous reflection',at:1}},studios:{v:1,drafts:{},cards:[]},books:{'human-journey':{page:23,total:300}}});
const restored=validateBackup({app:'human-within',version:1,profile:{name:'Friend'},progress});
assert.equal(restored.space.notes[0].text,'My previous note');assert.equal(restored.space.immersive.clarity.note,'A previous reflection');assert.equal(restored.space.books['human-journey'].page,23);
console.log(`writing-free flow: ${count} units, real-life activities, wallpaper copy, retired links and preserved previous material passed`);
