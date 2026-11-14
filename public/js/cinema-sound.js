import {cinemaScene,normaliseSound,scoreLevel} from './cinema-model.js';
const STORAGE_KEY='human.within.cinema.sound.v1';
export class CinemaSound {
 constructor({factory=()=>{const C=window.AudioContext||window.webkitAudioContext;return C?new C({latencyHint:'playback'}):null;},storage=()=>localStorage,fetcher=(...args)=>fetch(...args),schedule=(fn,ms)=>setTimeout(fn,ms)}={}){
  this.factory=factory;this.storage=storage;this.fetcher=fetcher;this.schedule=schedule;this.prefs=normaliseSound();try{this.prefs=normaliseSound(JSON.parse(storage().getItem(STORAGE_KEY)||'{}'));}catch{}
  this.ctx=null;this.scene='home';this.hidden=false;this.holds=new Set();this.ducks=new Set();this.listeners=new Set();this.buffers=new Map();this.pending=new Map();this.layers=[];this.revision=0;this.voiceRevision=0;this.voice=null;this.introduced=new Set();this.localLevel=1;this.status='quiet';this.manifest=null;this.voiceManifest=null;this.installed=false;this.enabling=null;this.enableRevision=0;this.enablingRevision=0;
 }
 get enabled(){return this.prefs.enabled;}
 snapshot(){return {...this.prefs,scene:this.scene,name:cinemaScene(this.scene).name,mood:cinemaScene(this.scene).mood,status:this.status,unlocked:!!this.ctx&&this.ctx.state==='running',held:!!this.holds.size};}
 subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 emit(){const state=this.snapshot();for(const fn of this.listeners)try{fn(state);}catch{}}
 configure(values,{persist=true}={}){
  const old=this.prefs;this.prefs=normaliseSound({...old,...values});if(persist)try{this.storage().setItem(STORAGE_KEY,JSON.stringify(this.prefs));}catch{}
  if(!this.prefs.enabled){this.enableRevision++;try{if(typeof window!=='undefined')window.speechSynthesis?.cancel();}catch{}this.revision++;this.stopVoice();this.stopLayers(.35);}else{if(old.guidance&&!this.prefs.guidance)this.stopVoice();if(old.music&&!this.prefs.music){this.revision++;this.stopLayers(.35);}}
  this.mix();this.emit();if(this.prefs.enabled&&this.ctx&&!this.holds.size&&(!old.music&&this.prefs.music))this.startScore();
 }
 async enable(){
  if(this.enabling&&this.enabled&&this.enablingRevision===this.enableRevision)return this.enabling;
  const revision=++this.enableRevision;this.enablingRevision=revision;this.status='starting';this.configure({enabled:true});
  const task=(async()=>{try{
   if(!this.ctx){const a=this.factory();if(!a)throw Error('Audio unavailable');this.ctx=a;this.master=a.createGain();this.master.gain.value=0;this.music=a.createGain();this.voiceBus=a.createGain();this.effects=a.createGain();const limiter=a.createDynamicsCompressor();limiter.threshold.value=-4;limiter.knee.value=6;limiter.ratio.value=5;limiter.attack.value=.003;limiter.release.value=.3;this.music.connect(this.master);this.voiceBus.connect(this.master);this.effects.connect(this.master);this.master.connect(limiter).connect(a.destination);}
   await this.ctx.resume();if(revision!==this.enableRevision||!this.enabled)return false;
   if(this.ctx.state&&this.ctx.state!=='running')throw Error('Audio locked');
   this.status='ready';this.mix();this.emit();this.startScore();this.intro(this.scene);return true;
  }catch{if(revision===this.enableRevision){this.status='unavailable';this.emit();}return false;}})();
  this.enabling=task;try{return await task;}finally{if(this.enabling===task)this.enabling=null;}
 }
 mute(){this.status='quiet';this.configure({enabled:false});}
 async toggle(){if(this.enabled&&(this.ctx?.state==='running'||this.status==='starting')){this.mute();return false;}return this.enable();}
 async assets(){if(!this.manifest)this.manifest=(async()=>{const r=await this.fetcher('/cinema/audio/manifest.json');if(!r.ok)throw Error('Sound library unavailable');return r.json();})();try{return await this.manifest;}catch(e){this.manifest=null;throw e;}}
 async buffer(file){
  if(this.buffers.has(file)){const b=this.buffers.get(file);this.buffers.delete(file);this.buffers.set(file,b);return b;}if(this.pending.has(file))return this.pending.get(file);
  const request=(async()=>{const r=await this.fetcher(file);if(!r.ok)throw Error('Sound unavailable');const b=await this.ctx.decodeAudioData(await r.arrayBuffer());this.buffers.set(file,b);let bytes=[...this.buffers.values()].reduce((n,b)=>n+b.length*b.numberOfChannels*4,0);while(this.buffers.size>1&&bytes>64*1024*1024){const first=this.buffers.keys().next().value;const old=this.buffers.get(first);bytes-=old.length*old.numberOfChannels*4;this.buffers.delete(first);}return b;})();this.pending.set(file,request);try{return await request;}finally{this.pending.delete(file);}
 }
 ramp(parameter,value,seconds=.5){if(!this.ctx||!parameter)return;const now=this.ctx.currentTime;parameter.cancelScheduledValues(now);parameter.setTargetAtTime(value,now,Math.max(.012,seconds/3));}
 mix(){if(!this.ctx)return;this.ramp(this.master.gain,this.enabled&&!this.hidden?this.prefs.volume:0,.2);this.ramp(this.music.gain,scoreLevel(this.prefs,{hidden:this.hidden,held:!!this.holds.size,ducked:!!this.ducks.size})*this.localLevel,.65);this.ramp(this.voiceBus.gain,this.prefs.voiceLevel,.15);this.ramp(this.effects.gain,this.prefs.effects?.24:0,.15);}
 async setScene(id,{intro=false}={}){const changed=this.scene!==id;if(changed){this.scene=id;this.localLevel=1;this.holds.clear();this.stopVoice();}this.emit();if(this.enabled&&this.ctx){await this.startScore();if(intro&&changed)this.intro(id);}}
 async startScore(){
  if(!this.enabled||!this.ctx||this.hidden||this.holds.size||!this.prefs.music)return false;const score=cinemaScene(this.scene).score;
  if(this.layers.some(l=>l.active&&l.score===score)){this.mix();return true;}const revision=++this.revision;this.status='loading';this.emit();
  try{const m=await this.assets(),asset=m.scores[score];if(!asset)throw Error('Missing score');const buffer=await this.buffer(asset.file);if(revision!==this.revision||!this.enabled||this.hidden||this.holds.size||!this.prefs.music)return false;
   const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain).connect(this.music);this.stopLayers(2.6);this.layers.push({source,gain,score,active:true});source.start();this.ramp(gain.gain,1,2.6);this.status='playing';this.mix();this.emit();return true;
  }catch{if(revision===this.revision){this.status='unavailable';this.emit();}return false;}
 }
 stopLayers(seconds=1){for(const layer of this.layers){if(!layer.active)continue;layer.active=false;this.ramp(layer.gain.gain,0,seconds);this.schedule(()=>{try{layer.source.stop();layer.source.disconnect();layer.gain.disconnect();}catch{}this.layers=this.layers.filter(l=>l!==layer);},seconds*1000+80);}}
 hold(owner){if(this.holds.has(owner))return;this.holds.add(owner);this.revision++;this.stopVoice();this.mix();this.emit();}
 resume(owner){if(!this.holds.delete(owner))return;this.mix();if(!this.holds.size&&this.enabled&&this.ctx)this.startScore();this.emit();}
 duck(owner,on=true){const changed=on?!this.ducks.has(owner):this.ducks.has(owner);if(!changed)return;on?this.ducks.add(owner):this.ducks.delete(owner);this.mix();}
 setLocalLevel(value){this.localLevel=Math.max(0,Math.min(1,Number(value)||0));this.mix();}
 async cue(name='page'){if(!this.enabled||!this.prefs.effects||!this.ctx||this.hidden||this.holds.size)return;try{const m=await this.assets(),asset=m.cues[name];if(!asset)return;const b=await this.buffer(asset.file);if(!this.enabled||!this.prefs.effects||this.hidden||this.holds.size)return;const s=this.ctx.createBufferSource();s.buffer=b;s.connect(this.effects);s.onended=()=>s.disconnect();s.start();}catch{}}
 note(frequency=440){
  if(!this.enabled||!this.prefs.effects||!this.ctx||this.ctx.state!=='running'||this.hidden||this.holds.size)return false;
  const now=this.ctx.currentTime,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type='sine';osc.frequency.value=Math.max(110,Math.min(1200,Number(frequency)||440));gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.08,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.38);osc.connect(gain).connect(this.effects);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(now);osc.stop(now+.42);return true;
 }
 async intro(id){
  if(!this.prefs.guidance||this.introduced.has(id)||!this.enabled||!this.ctx||this.hidden||this.holds.size)return;const revision=++this.voiceRevision;
  try{if(!this.voiceManifest){const r=await this.fetcher('/cinema/audio/voices.json');if(!r.ok)return;this.voiceManifest=await r.json();}const asset=this.voiceManifest[id];if(!asset)return;const b=await this.buffer(asset.file);if(revision!==this.voiceRevision||!this.enabled||!this.prefs.guidance||this.hidden||this.holds.size)return;
   this.stopVoice(false);const source=this.ctx.createBufferSource();source.buffer=b;source.connect(this.voiceBus);this.voice=source;this.introduced.add(id);this.duck('recorded',true);source.onended=()=>{if(this.voice===source){this.voice=null;this.duck('recorded',false);}source.disconnect();};source.start(this.ctx.currentTime+.3);
  }catch{}
 }
 stopVoice(invalidate=true){if(invalidate)this.voiceRevision++;const source=this.voice;this.voice=null;if(source)try{source.stop();}catch{}this.duck('recorded',false);}
 attachNative(context,output,owner){this.hold(owner);const apply=()=>{const now=context.currentTime;output.gain.cancelScheduledValues(now);output.gain.setTargetAtTime(this.enabled&&!this.hidden?this.prefs.volume:0,now,.06);};apply();const off=this.subscribe(apply);let released=false;return()=>{if(released)return;released=true;off();this.resume(owner);};}
 attachMedia(media,owner,{background=false,level=()=>1}={}){this.hold(owner);const apply=()=>{media.volume=Math.max(0,Math.min(1,this.prefs.volume*level()));media.muted=!this.enabled||(!background&&this.hidden);};apply();const off=this.subscribe(apply);let released=false;return()=>{if(released)return;released=true;off();this.resume(owner);};}
 install(){if(this.installed||typeof document==='undefined')return;this.installed=true;
  document.addEventListener('visibilitychange',()=>{this.hidden=document.hidden;if(this.hidden){this.revision++;this.stopVoice();}this.mix();this.emit();if(!this.hidden&&this.enabled&&this.ctx)this.startScore();});
  const unlock=e=>{if(e.target?.closest?.('[data-sound-toggle],.cinema-sound-panel,.opening-sound,.room-controls'))return;if(this.enabled&&(!this.ctx||this.ctx.state==='suspended'))this.enable();};document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true});
  this.speechTimer=setInterval(()=>{let speaking=false;try{speaking=!!window.speechSynthesis?.speaking;}catch{}this.duck('device-voice',speaking);},200);
 }
}
export const cinemaSound=new CinemaSound();
if(typeof window!=='undefined')window.HumanCinemaAudio=cinemaSound;
