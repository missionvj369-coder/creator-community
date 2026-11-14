import {ArrivalVoice} from './arrival-voice.js?v=18214deeb83d6066';
import {cinemaSound} from './cinema-sound.js?v=18214deeb83d6066';
let manifest;
const recordings=()=>manifest??=(fetch('/cinema/audio/opening-voices.json').then(r=>{if(!r.ok)throw Error('Voice unavailable');return r.json();}).catch(e=>{manifest=null;throw e;}));
let serial=0;

// Recorded guidance first; device narration is available if a recording fails.
export class RecordedArrivalVoice {
 constructor({onStatus=()=>{},bus=cinemaSound,media=new Audio(),loadRecordings=recordings,fallback=new ArrivalVoice({onStatus})}={}){
  Object.assign(this,{onStatus,bus,audio:media,loadRecordings,fallback});
  this.audio.preload='auto';this.owner=`opening-voice-${++serial}`;
  this.enabled=false;this.closed=false;this.paused=false;this.epoch=0;this.text='';this.usingFallback=false;
  this.off=bus.subscribe(()=>this.level());
  this.audio.onended=()=>{bus.duck(this.owner,false);onStatus('ready');};
  this.audio.onerror=()=>this.useFallback(this.epoch);
 }
 level(){this.audio.volume=this.bus.prefs.volume*this.bus.prefs.voiceLevel;this.audio.muted=!this.bus.enabled;}
 setEnabled(value){this.enabled=!!value;this.fallback.setEnabled(this.enabled);if(!this.enabled)this.cancel();}
 current(epoch){return !this.closed&&this.enabled&&epoch===this.epoch;}
 useFallback(epoch){
  if(!this.current(epoch)||this.paused||!this.text||this.usingFallback)return;
  this.usingFallback=true;this.audio.pause();this.bus.duck(this.owner,false);this.fallback.speak(this.text);
 }
 async play(epoch){
  if(!this.current(epoch)||this.paused)return;
  this.level();this.bus.duck(this.owner,true);
  try{await this.audio.play();if(this.current(epoch)&&!this.paused)this.onStatus('speaking');}
  catch{if(this.current(epoch))this.useFallback(epoch);}
 }
 speak(text){
  if(this.closed||!this.enabled||this.paused)return false;
  this.cancel();this.text=text;const epoch=this.epoch;this.level();
  this.loadRecordings().then(all=>{
   if(!this.current(epoch))return;
   const item=Object.values(all).find(x=>x.text===text);
   if(!item){this.useFallback(epoch);return;}
   this.audio.src=item.file;this.play(epoch);
  }).catch(()=>this.useFallback(epoch));
  return true;
 }
 pause(){this.paused=true;this.audio.pause();this.fallback.pause();this.bus.duck(this.owner,false);}
 resume(){
  if(this.closed)return;const wasPaused=this.paused;this.paused=false;this.fallback.resume();
  if(wasPaused&&this.enabled&&!this.usingFallback&&this.audio.src&&!this.audio.ended)this.play(this.epoch);
 }
 cancel(){this.epoch++;this.text='';this.usingFallback=false;this.audio.pause();this.audio.removeAttribute('src');this.fallback.cancel();this.bus.duck(this.owner,false);}
 close(){if(this.closed)return;this.closed=true;this.cancel();this.off();this.fallback.close();this.audio.load();}
}
