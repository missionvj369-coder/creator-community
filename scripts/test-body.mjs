import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {bodyAtlasData,extractBookArray} from './build-body-atlas.mjs';
import {BODY_CHAPTERS,BODY_PARTS,BODY_VISUALS,normaliseBodyAtlas,ReadingFlow,discoverySeconds} from '../public/js/body-model.js';
import {bodyFigure,mechanismSVG,BODY_MECHANISMS} from '../public/js/body-art.js';
import {normaliseSpace,validateBackup} from '../public/js/space-model.js';
const original=extractBookArray(fs.readFileSync('public/books/body-you-live-in.html','utf8'),'PAGES'),facts=original.filter(p=>p.kind==='fact');
const data=JSON.parse(fs.readFileSync('public/content/body-atlas.json','utf8'));
assert.deepEqual(data,bodyAtlasData());assert.equal(facts.length,99);assert.equal(data.totalPages,164);assert.equal(data.author,'neoXhuman');
for(let i=0;i<99;i++){assert.equal(data.facts[i].id,i+1);assert.equal(data.facts[i].title,facts[i].title);assert.equal(data.facts[i].text,facts[i].text);assert.equal(data.facts[i].page,facts[i].number);assert.equal(data.facts[i].chapter,facts[i].chapter);assert.ok(BODY_MECHANISMS[data.facts[i].visual]);}
assert.equal(Object.keys(BODY_VISUALS).length,99);assert.equal(BODY_CHAPTERS.length,12);let end=-1;
for(const c of BODY_CHAPTERS){assert.equal(c.start,end+1);assert.ok(c.end>=c.start);for(let i=c.start;i<=c.end;i++)assert.equal(data.facts[i].chapter,BODY_CHAPTERS.indexOf(c));end=c.end;}assert.equal(end,98);
assert.equal(BODY_PARTS.length,21);for(const p of BODY_PARTS){assert.ok(Number.isInteger(p.index)&&p.index>=0&&p.index<99);assert.equal(BODY_CHAPTERS[data.facts[p.index].chapter].region,p.region);if(p.visual)assert.ok(BODY_MECHANISMS[p.visual]);}
const keys=Object.keys(BODY_MECHANISMS);assert.equal(keys.length,38);const svgs=keys.map(mechanismSVG);assert.equal(new Set(svgs).size,38);
for(const svg of svgs){assert.match(svg,/<animateMotion/);assert.doesNotMatch(svg,/NaN|undefined|Infinity|<script|foreignObject/);}
assert.match(mechanismSVG('missing'),/data-mechanism="cell"/);const poster=bodyFigure('whole',{staticArt:true});assert.doesNotMatch(poster,/animateMotion/);
const parse=spawnSync('python3',['-c','import json,sys,xml.etree.ElementTree as E\nfor svg in json.load(sys.stdin): E.fromstring(svg)\nprint("All 40 SVGs are valid XML")'],{input:JSON.stringify([...svgs,bodyFigure(),poster]),encoding:'utf8'});assert.equal(parse.status,0,parse.stderr);
assert.deepEqual(normaliseBodyAtlas(),{index:0,visited:[],at:0});assert.deepEqual(normaliseBodyAtlas({index:103,visited:[-1,0,98,98,99,1.5],at:-1}),{index:98,visited:[0,98],at:0});
const state=normaliseSpace({bodyAtlas:{index:49,visited:[0,49]},books:{'body-you-live-in':{page:76,total:164}},notes:[{id:'n',text:'Wonder stays.'}]});
const restored=validateBackup({app:'human-within',version:1,profile:{name:'Reader'},progress:state});assert.equal(restored.space.bodyAtlas.index,49);assert.equal(restored.space.books['body-you-live-in'].page,76);assert.equal(restored.space.books['body-you-live-in'].total,164);assert.equal(restored.space.notes[0].text,'Wonder stays.');
let advances=0;const flow=new ReadingFlow({onAdvance:()=>advances++});flow.reset(5);flow.tick(2);assert.equal(flow.elapsed,0);flow.play();flow.tick(50);assert.equal(flow.elapsed,2);flow.pause();flow.tick(2);assert.equal(flow.elapsed,2);flow.play();flow.tick(2);flow.tick(2,{blocked:true});assert.equal(flow.elapsed,5);assert.equal(advances,0);flow.tick(.1);flow.tick(1);assert.equal(advances,1);flow.reset(2);flow.play();flow.dispose();flow.tick(2);assert.equal(advances,1);
let index=0,finished=false,tour;const next=()=>{if(index===98)finished=true;else{index++;tour.reset(discoverySeconds(data.facts[index].text));tour.play();}};tour=new ReadingFlow({onAdvance:next});tour.reset(discoverySeconds(data.facts[0].text));tour.play();for(let n=0;n<10000&&!finished;n++)tour.tick(1);assert.equal(index,98);assert.ok(finished,'The complete tour must reach its quiet ending');
for(const name of ['frequency','sanctuary','passage','sleep']){const source=fs.readFileSync(`public/realms/${name}.html`,'utf8');for(const script of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1],{filename:name});}
console.log('body: complete original 99 discoveries, 12 chapters, 21 entrances, 38 animated diagrams, XML, tour timing, pause, narration hold and backup migration passed');
