import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS, SITUATIONS, TOOLS } from '../public/js/catalogue.js';
import { unit } from '../public/js/content.js';
const root=path.resolve('public');
const json=name=>JSON.parse(fs.readFileSync(path.join(root,'content',name+'.json'),'utf8'));
// Exercise every extracted content unit, including the final index in each path.
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url.replace(/^\//,'')),'utf8'))});
assert.equal(PRODUCTS.length,15);assert.equal(new Set(PRODUCTS.map(p=>p.id)).size,15);
let units=0;
for(const p of PRODUCTS){
  if(p.kind==='experience'){assert.ok(fs.statSync(path.join(root,'realms',p.file)).size>1000);continue;}
  for(let i=0;i<p.count;i++){const u=await unit(p.id,i);assert.ok(u.title.trim(),`${p.id}:${i} needs a title`);assert.ok(u.blocks.length,`${p.id}:${i} needs content`);units++;}
}
assert.equal(units,375);
const scenarios=json('scenarios');assert.equal(scenarios.length,105);assert.equal(new Set(scenarios.map(s=>s.title)).size,105);
for(const category of ['Study','Work','Relationships','Daily life','Online'])assert.equal(scenarios.filter(s=>s.category===category).length,21);
for(const s of scenarios){assert.ok(s.action.length>40);assert.ok(s.lesson>=0&&s.lesson<21);}
for(const s of SITUATIONS){for(const id of s.products)assert.ok(PRODUCTS.some(p=>p.id===id));}
const books=json('books');assert.equal(books.length,6);
for(const b of books){assert.equal(fs.statSync(path.join(root,b.file)).size,b.bytes);if(b.cover)assert.ok(fs.statSync(path.join(root,b.cover)).size>1000);}
for(const t of TOOLS.filter(t=>t.file))assert.ok(fs.statSync(path.join(root,t.file)).size>1000);
const wallpapers=json('wallpapers');assert.equal(wallpapers.length,30);
for(const w of wallpapers){
 const png=fs.readFileSync(path.join(root,w.file));assert.ok(png.length>20000);assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),1080);assert.equal(png.readUInt32BE(20),2340);
 assert.ok(fs.statSync(path.join(root,w.thumb)).size>1000);
}
assert.ok(fs.statSync(path.join(root,'wallpapers/human-within-all-30.zip')).size>100000);
console.log(`catalogue: 15 products, ${units} content units, 105 situations, 6 eBooks, and all 30 wallpaper originals passed`);
// The performance fix must retain every referenced asset and all offline downloads.
for(const b of books){
 const reader=fs.readFileSync(path.join(root,b.file),'utf8');assert.ok(reader.length<1500000,`${b.id} reader must not contain every bitmap`);
 assert.ok(!/data:image\/[a-z+]+;base64,/.test(reader),`${b.id} must load picture assets as needed`);
 for(const m of reader.matchAll(/\/assets\/books\/([a-f0-9]{20}\.[a-zA-Z0-9]+)/g))assert.ok(fs.statSync(path.join(root,'assets/books',m[1])).size>0,`${b.id}: missing ${m[1]}`);
 assert.ok(fs.statSync(path.join(root,b.download)).size>1000,`${b.id}: missing offline reader`);
}
assert.equal(new Set(wallpapers.map(w=>w.design)).size,30,'each wallpaper must have its own artwork concept');
console.log('assets: lightweight readers, every artwork/font, all offline book packs, and 30 individual wallpaper designs passed');
