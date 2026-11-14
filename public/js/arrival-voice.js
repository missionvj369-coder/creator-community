import {cinemaSound} from './cinema-sound.js';
/** Device narration: no credentials, remote generation, or recording of the visitor. */
export function chooseArrivalVoice(voices=[]){
 const english=voices.filter(v=>/^en(?:-|_)/i.test(v.lang)||v.lang==='en');
 const score=v=>(/Samantha|Serena|Aria|Jenny|Sonia|Libby|Google UK English Female|Karen|Moira|Ava|Natural/i.test(v.name)?20:0)+(/en-(GB|US)/i.test(v.lang)?3:0)+(v.localService?1:0);
 return english.sort((a,b)=>score(b)-score(a))[0]||null;
}
export class ArrivalVoice{
 constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,onStatus=()=>{}}={}){this.synth=synth;this.Utterance=Utterance;this.onStatus=onStatus;this.closed=false;this.enabled=false;this.paused=false;this.epoch=0;this.utterance=null;this.voices=[];this.load=()=>{try{this.voices=this.synth?.getVoices()||[];}catch{this.voices=[];}};this.load();this.synth?.addEventListener?.('voiceschanged',this.load);}
 get supported(){return !!(this.synth&&this.Utterance);}
 setEnabled(enabled){this.enabled=!!enabled;if(!this.enabled)this.cancel();}
 speak(text){
  this.cancel();if(!text||!this.enabled||this.paused||this.closed)return false;
  if(!this.supported){this.onStatus('unavailable');return false;}
  try{this.load();const token=this.epoch,u=new this.Utterance(text),voice=chooseArrivalVoice(this.voices);u.lang=voice?.lang||'en-US';if(voice)u.voice=voice;u.rate=.79;u.pitch=1;u.volume=cinemaSound.prefs.volume*cinemaSound.prefs.voiceLevel;u.onstart=()=>{if(token===this.epoch)this.onStatus('speaking');};u.onend=()=>{if(token===this.epoch){this.utterance=null;this.onStatus('ready');}};u.onerror=e=>{if(token===this.epoch&&!['canceled','interrupted'].includes(e.error)){this.utterance=null;this.onStatus('unavailable');}};this.utterance=u;this.synth.speak(u);return true;}catch{this.onStatus('unavailable');return false;}
 }
 cancel(){this.epoch++;this.utterance=null;try{this.synth?.cancel();}catch{}}
 pause(){if(this.paused)return;this.paused=true;try{this.synth?.pause();}catch{}}
 resume(){if(!this.paused)return;this.paused=false;try{this.synth?.resume();}catch{}}
 close(){if(this.closed)return;this.closed=true;this.cancel();if(this.paused){try{this.synth?.resume();}catch{}}this.synth?.removeEventListener?.('voiceschanged',this.load);}
}
