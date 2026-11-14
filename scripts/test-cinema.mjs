import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {CINEMA_SCENES,sceneForRoute,normaliseSound,scoreLevel} from '../public/js/cinema-model.js';
import {CinemaSound} from '../public/js/cinema-sound.js';
import {RecordedArrivalVoice} from '../public/js/recorded-arrival-voice.js';
import {normaliseSpace,validateBackup} from '../public/js/space-model.js';
const ids=['protocol','frequency','sanctuary','journey','mirror','mirror2','loop','escape','thoughts','awakening','onegod','passage','clarity','rewire','sleep'];
assert.equal(new Set(ids.map(id=>CINEMA_SCENES[id].score)).size,15);
for(const id of ids){assert.equal(sceneForRoute('#/product/'+id),id);assert.equal(sceneForRoute('#/experience/'+id),id);}
assert.equal(sceneForRoute('#/experience/know-your-body'),'body');assert.equal(sceneForRoute('#/book/human-journey'),'ebooks');assert.equal(sceneForRoute('#/listen/0'),'protocol');assert.equal(sceneForRoute('#/meditate/night20'),'arrival');
assert.equal(normaliseSound(null).enabled,false);assert.equal(normaliseSound({volume:9}).volume,1);assert.equal(normaliseSound({volume:-3}).volume,0);assert.equal(scoreLevel(normaliseSound({enabled:true}),{held:true}),0);
const m=JSON.parse(fs.readFileSync('public/cinema/audio/manifest.json')),v=JSON.parse(fs.readFileSync('public/cinema/audio/voices.json'));
assert.equal(Object.keys(m.scores).length,22);assert.equal(Object.keys(v).length,20);assert.equal(Object.keys(m.cues).length,4);
const opening=JSON.parse(fs.readFileSync('public/cinema/audio/opening-voices.json')),timing=JSON.parse(fs.readFileSync('content-source/cinema/opening-voice-timing.json'));
assert.equal(Object.keys(opening).length,9);
for(const cue of timing){const recording=opening[cue.name];assert.equal(recording.text,cue.text);const next=timing.find(x=>x.chapter===cue.chapter&&x.at>cue.at);assert.ok(cue.at+recording.duration*1000<(next?.at??cue.chapterDuration),'recorded cues need room to finish before the next cue or chapter');}
assert.equal(m.longForm['sleep-tail-20'].duration,1200);
for(const asset of [...Object.values(m.scores),...Object.values(m.cues),...Object.values(v),...Object.values(opening),...Object.values(m.longForm)]){const bytes=fs.readFileSync('public'+asset.file);assert.equal(bytes.length,asset.bytes);assert.ok(bytes.length<25*1024*1024);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);assert.ok(asset.duration>0);}
for(const id of ids){assert.ok(m.scores[CINEMA_SCENES[id].score]);assert.ok(v[id]);}
const progress=normaliseSpace({cinemaSound:{enabled:true,volume:.3,music:false,guidance:false}});const restored=validateBackup({app:'human-within',version:1,profile:{name:'Reader'},progress});assert.equal(restored.space.cinemaSound.volume,.3);assert.equal(restored.space.cinemaSound.music,false);
// Stateful audio contracts: no autoplay, real crossfades, stale request cancellation,
// global mute during native sessions, reversible ducking and independent hold owners.
let factories=0;const scheduled=[],created=[],store=new Map();
const parameter=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(x){this.value=x;}});
const node=()=>({gain:parameter(),connect(){return this;},disconnect(){}});
const context={state:'suspended',currentTime:0,destination:{},async resume(){this.state='running';},createGain:node,createDynamicsCompressor(){const n=node();for(const key of ['threshold','knee','ratio','attack','release'])n[key]=parameter();return n;},createBufferSource(){const s=node();s.start=()=>{s.started=true;};s.stop=()=>{s.stopped=true;};created.push(s);return s;},async decodeAudioData(){return {length:48000,numberOfChannels:2};}};
const fetcher=async path=>({ok:true,json:async()=>path.endsWith('voices.json')?v:m,arrayBuffer:async()=>new ArrayBuffer(8)});
const flush=async()=>{for(let i=0;i<24;i++)await Promise.resolve();};
const sound=new CinemaSound({factory:()=>{factories++;return context;},storage:()=>({getItem:k=>store.get(k),setItem:(k,x)=>store.set(k,x)}),fetcher,schedule:(fn,ms)=>scheduled.push({fn,ms})});
assert.equal(factories,0);await sound.setScene('loop');assert.equal(factories,0,'routes cannot create an AudioContext');assert.equal(await sound.enable(),true);assert.equal(factories,1);await flush();sound.stopVoice();assert.equal(sound.layers.filter(x=>x.active).length,1);const first=sound.layers[0];
await sound.setScene('clarity');sound.stopVoice();assert.equal(sound.layers.filter(x=>x.active).length,1);assert.equal(first.active,false);assert.ok(scheduled.some(x=>x.ms>=2500),'score changes need a real crossfade');
const normal=sound.music.gain.value;sound.duck('voice');assert.ok(sound.music.gain.value<normal*.3);sound.duck('voice',false);assert.equal(sound.music.gain.value,normal);
sound.hold('video');sound.hold('practice');assert.equal(sound.music.gain.value,0);sound.resume('video');assert.equal(sound.music.gain.value,0,'another audio owner must keep its hold');sound.resume('practice');assert.ok(sound.music.gain.value>0);
const output=node(),release=sound.attachNative(context,output,'tone');assert.equal(sound.music.gain.value,0);sound.mute();assert.equal(output.gain.value,0,'the app mute must reach native tone sessions');assert.equal(sound.master.gain.value,0);await sound.enable();assert.ok(output.gain.value>0);release();release();
sound.configure({music:false});assert.equal(sound.music.gain.value,0);sound.configure({volume:.21});assert.equal(sound.prefs.volume,.21);assert.equal(JSON.parse([...store.values()][0]).volume,.21);
let resolveFetch;const delayed=new CinemaSound({factory:()=>context,storage:()=>({getItem(){return null;},setItem(){}}),fetcher:async path=>path.endsWith('manifest.json')?{ok:true,json:async()=>m}:new Promise(r=>resolveFetch=r),schedule:()=>{}});const enabling=delayed.enable();for(let i=0;i<8&&!resolveFetch;i++)await Promise.resolve();assert.equal(await enabling,true,'sound unlock must not wait for score downloads');delayed.mute();resolveFetch({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});await enabling;await flush();assert.equal(delayed.layers.filter(x=>x.active).length,0,'a late decoded score must not override mute');
// A slow recorded cue must not restart after pause, cancellation or navigation.
let pendingRecording,spoken=[],unsubscribed=0;
const media={src:'',ended:false,plays:0,pauses:0,volume:0,muted:true,async play(){this.plays++;},pause(){this.pauses++;},removeAttribute(){this.src='';},load(){}};
const fallback={setEnabled(){},speak(text){spoken.push(text);},pause(){},resume(){},cancel(){},close(){}};
const bus={prefs:{volume:.5,voiceLevel:.8},enabled:true,duck(){},subscribe(){return()=>unsubscribed++;}};
const guide=new RecordedArrivalVoice({bus,media,fallback,loadRecordings:()=>new Promise(r=>pendingRecording=r)});
guide.setEnabled(true);guide.speak('A');guide.cancel();pendingRecording({a:{text:'A',file:'/a.m4a'}});await flush();assert.equal(media.plays,0);
guide.speak('B');guide.pause();pendingRecording({b:{text:'B',file:'/b.m4a'}});await flush();assert.equal(media.plays,0);guide.resume();await flush();assert.equal(media.plays,1);assert.equal(media.volume,.4);
guide.speak('C');guide.close();pendingRecording({c:{text:'C',file:'/c.m4a'}});await flush();assert.equal(media.plays,1);assert.equal(unsubscribed,1);guide.close();assert.equal(unsubscribed,1);
let rejectPlay;const raceMedia={...media,plays:0,play(){this.plays++;return this.plays===1?new Promise((_,reject)=>rejectPlay=reject):Promise.resolve();}};
const race=new RecordedArrivalVoice({bus,media:raceMedia,fallback,loadRecordings:async()=>({a:{text:'A',file:'/a.m4a'},b:{text:'B',file:'/b.m4a'}})});
race.setEnabled(true);race.speak('A');await flush();race.speak('B');await flush();rejectPlay(Error('Old play interrupted'));await flush();assert.deepEqual(spoken,[],'an old play rejection must not invoke the new cue fallback');assert.equal(raceMedia.src,'/b.m4a');race.close();
for(const name of ['sanctuary','mirror','mirror-reimagined','passage','sleep','frequency']){const source=fs.readFileSync(`public/realms/${name}.html`,'utf8');assert.match(source,/cinema-bridge\.js/);assert.match(source,/cinema-embedded\.css/);for(const script of source.matchAll(/<script\b(?![^>]*type="module")[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1],{filename:name});}
console.log('cinema: 15 distinct product scores, 22 mastered scores, 29 voice clips, 20-minute night tail, cue windows, hashes, backup settings, gesture gating, crossfades, ducking, native-session mute and recorded-voice cancellation passed');
