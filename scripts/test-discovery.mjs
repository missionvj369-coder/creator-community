import assert from 'node:assert/strict';
import {webmSize,muxCreationWebM} from '../public/js/discovery-video.js';
import {CinemaSound} from '../public/js/cinema-sound.js';
import {PRODUCTS,art} from '../public/js/catalogue.js';
import {DISCOVERY_IDS,WONDER_SCENES,UNSEEN_SCENES,CREATION_STYLES,CREATION_ASPECTS} from '../public/js/discovery-meta.js';
import {normaliseCreation,normaliseExplorations,keepCreation,appendGesture,fallingPosition,pendulumOffset,waveValue,magneticField,createDiscoveryClock,chooseVideoType,animatedCreationSVG} from '../public/js/discovery-model.js';
import {normaliseSpace,validateBackup} from '../public/js/space-model.js';
import {arrivalDestination} from '../public/js/arrival-model.js';
import {retiredWritingRoute,experienceNeighbours} from '../public/js/experience-flow.js';
import {sceneForRoute,CINEMA_SCENES} from '../public/js/cinema-model.js';
assert.deepEqual(PRODUCTS.filter(x=>x.kind==='discovery').map(x=>x.id),DISCOVERY_IDS);
assert.equal(PRODUCTS.length,18);assert.equal(experienceNeighbours('sleep').next,'wonder-engine');assert.equal(experienceNeighbours('creation-field').next,null);
for(const id of DISCOVERY_IDS){assert.equal(sceneForRoute('#/product/'+id),id);assert(!retiredWritingRoute('#/product/'+id));assert.equal(arrivalDestination('#/product/'+id),'#/product/'+id);assert(art('',null,null,id).includes('<svg'));assert(CINEMA_SCENES[id].score);}
assert.equal(new Set(DISCOVERY_IDS.map(x=>CINEMA_SCENES[x].score)).size,3);assert.equal(arrivalDestination('#/discover'),'#/discover');
for(const id of ['mind-unfold','human-bridge','possibility-studio'])assert(retiredWritingRoute('#/product/'+id));
const empty=normaliseExplorations(null);assert.deepEqual(normaliseExplorations(empty),empty);assert.equal(empty.wonder.scene,'contrast');assert.equal(empty.unseen.scene,'starlight');
const malformed=normaliseExplorations({wonder:{scene:'fake',values:{contrast:Infinity,fall:-2},seen:['contrast','bad','contrast'],paused:true},creation:{style:'fake',palette:'__proto__',aspect:'constructor',seed:Infinity,phase:NaN,strokes:Array.from({length:50},()=>Array.from({length:150},()=>[-10,100,8]))},gallery:[{id:'1234567890123',at:Infinity,art:null},{id:'../../oops'}]});
assert.deepEqual(normaliseExplorations(malformed),malformed);assert.deepEqual(malformed.wonder.seen,['contrast']);assert.equal(malformed.creation.strokes.length,24);assert.equal(malformed.creation.strokes[0].length,96);assert.deepEqual(malformed.creation.strokes[0][0],[0,1,1]);assert.equal(malformed.creation.palette,'aurora');assert.equal(malformed.creation.aspect,'portrait');assert.equal(malformed.gallery.length,1);assert(Number.isFinite(malformed.gallery[0].at));
assert.deepEqual(normaliseCreation({strokes:[null,[[NaN,2],[.12,.43,.5]],[]]}).strokes,[[[.12,.43,.5]]]);
let collection=keepCreation({},appendGesture({},[[.2,.3],[.8,.7]]),1700000000000);const stable=collection.id;assert.equal(collection.state.gallery.length,1);
collection=keepCreation(collection.state,{...collection.state.creation,phase:3.4},1700000000100);assert.equal(collection.id,stable,'another format export keeps one copy of the composition');
for(let i=0;i<7;i++)collection=keepCreation(collection.state,{seed:100+i,style:CREATION_STYLES[i%3].id},1700000001000+i);
assert.equal(collection.state.gallery.length,4);assert.equal(new Set(collection.state.gallery.map(x=>x.id)).size,4);
for(const entry of collection.state.gallery)assert.equal(arrivalDestination('#/product/creation-field/'+entry.id),'#/product/creation-field/'+entry.id);
const progress=normaliseSpace({explorations:collection.state,books:{'human-journey':{page:23,total:300}},bodyAtlas:{index:9,visited:[9]},notes:[{id:'old',text:'Kept thought',at:1}],studios:{cards:[]}});
const restored=validateBackup({app:'human-within',version:1,profile:{name:'Friend'},progress});assert.deepEqual(restored.space.explorations,collection.state);assert.equal(restored.space.books['human-journey'].page,23);assert.equal(restored.space.bodyAtlas.index,9);assert.equal(restored.space.notes[0].text,'Kept thought');
for(let t=0;t<1;t+=.05){assert.equal(fallingPosition(t,0,true),fallingPosition(t,0,false));assert(fallingPosition(t,1,true)<=fallingPosition(t,1,false));}
assert(fallingPosition(.65,1,true)<fallingPosition(.65,1,false));
for(let i=0;i<14;i++){assert(Math.abs(pendulumOffset(i,0))<1e-12);assert(Math.abs(pendulumOffset(i,60))<1e-12);}
for(let i=0;i<25;i++){const x=i/24;assert(Math.abs(waveValue(x,.4,3)-waveValue(1-x,.4,3))<1e-12);assert(Math.abs(waveValue(x,.4,3))<=1);assert(magneticField(x-.5,.1,2).every(Number.isFinite));}
const a=magneticField(1,0,0),b=magneticField(0,1,Math.PI/2);assert(Math.abs(a[0]-b[1])<1e-9);
const clock=createDiscoveryClock(3);clock.tick(1000);clock.tick(1100);assert.equal(clock.time,3.1);clock.pause();clock.tick(100000);assert.equal(clock.time,3.1);clock.resume();clock.tick(200000);clock.tick(200100);assert.equal(clock.time,3.2);clock.seek(0);clock.tick(300000);assert.equal(clock.time,0);clock.tick(400000);assert.equal(clock.time,1,'late timer callbacks advance by at most one second; pause/resume still excludes hidden time');
assert.equal(chooseVideoType(null),null);assert.equal(chooseVideoType({isTypeSupported:x=>x==='video/webm;codecs=vp8'}),'video/webm;codecs=vp8');assert.equal(chooseVideoType({isTypeSupported:()=>false}),null);
const vectors=CREATION_STYLES.map(x=>animatedCreationSVG({style:x.id,strokes:[[[.2,.3],[.6,.8]]]}));assert.equal(new Set(vectors).size,3);for(const svg of vectors){assert(!/NaN|undefined|<script|onload/.test(svg));assert(svg.includes('dur="6s"'));}
for(const aspect of Object.keys(CREATION_ASPECTS))assert(animatedCreationSVG({aspect}).includes(`width="${CREATION_ASPECTS[aspect].width}"`));
assert.equal(WONDER_SCENES.length,5);assert.equal(UNSEEN_SCENES.length,3);for(const s of UNSEEN_SCENES)assert.match(s.label,/ILLUSTRAT/);
console.log('discovery: 18 active experiences, 8 experiments/worlds, bounded gestures, exact composition backups, stable 4-item gallery, real physics invariants, pause/resume clock, video formats and 3 distinct animated vector fallbacks passed');

const sound=new CinemaSound({storage:()=>({getItem(){return null;}})}),notes=[];
const gain={gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;},disconnect(){}};
sound.ctx={currentTime:8,state:'running',createGain:()=>gain,createOscillator(){const n={frequency:{value:0},connect(){return gain;},start(t){this.startAt=t;},stop(t){this.stopAt=t;},disconnect(){}};notes.push(n);return n;}};sound.effects={};
assert.equal(sound.note(),false);sound.prefs.enabled=true;assert.equal(sound.note(999999),true);assert.equal(notes[0].frequency.value,1200);assert(Math.abs(notes[0].stopAt-notes[0].startAt-.42)<1e-9);
sound.prefs.effects=false;assert.equal(sound.note(),false);sound.prefs.effects=true;sound.hidden=true;assert.equal(sound.note(),false);sound.hidden=false;sound.holds.add('pause');assert.equal(sound.note(),false);assert.equal(notes.length,1);console.log('discovery touch sound: gesture-only context, finite notes, effect toggle, hidden tab and pause hold respected');

assert.deepEqual([...webmSize(126)],[254]);assert.deepEqual([...webmSize(127)],[64,127]);assert.throws(()=>muxCreationWebM([],{width:720,height:900}));
const webm=muxCreationWebM([{data:new Uint8Array([1,2,3]),timestamp:0,key:true},{data:new Uint8Array([4,5]),timestamp:33333,key:false}],{width:720,height:900});assert.equal(Buffer.from(webm.subarray(0,4)).toString('hex'),'1a45dfa3');assert(Buffer.from(webm).includes(Buffer.from('V_VP8')));assert(Buffer.from(webm).includes(Buffer.from('The Creation Field')));console.log('video: EBML size boundary, required first keyframe, VP8 track and writer metadata passed');
