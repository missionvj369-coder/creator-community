import {h,icon,sheet} from './ui.js';
import {cinemaSound} from './cinema-sound.js';
const soundButtons=new Set();
function paintSoundButton(button,s=cinemaSound.snapshot()){
 const starting=s.enabled&&s.status==='starting',audible=s.enabled&&(s.unlocked||starting);
 button.setAttribute('aria-pressed',String(audible));button.setAttribute('aria-label',audible?'Mute all sound':'Unmute sound');button.title=audible?'Mute all sound':'Unmute sound';
 button.dataset.muted=String(!audible);button.replaceChildren(icon(audible?'sound':'mute',18),h('span',{},starting?'Starting…':audible?'Sound on':'Muted'));
}
cinemaSound.subscribe(s=>{for(const button of soundButtons){if(!button.isConnected){soundButtons.delete(button);continue;}paintSoundButton(button,s);}});
export function pruneSoundControls(){for(const button of soundButtons)if(!button.isConnected)soundButtons.delete(button);}
export function soundToggleButton(className='app-sound-toggle'){
 const button=h('button',{class:className,type:'button','data-sound-toggle':'true',onclick:()=>{if(cinemaSound.enabled&&(cinemaSound.snapshot().unlocked||cinemaSound.status==='starting'))cinemaSound.mute();else cinemaSound.enable();}});soundButtons.add(button);paintSoundButton(button);return button;
}
export function openSoundSettings(){
 const p=cinemaSound.snapshot(),status=h('p',{class:'cinema-sound-status',role:'status'}),toggles={};
 const toggle=(key,label,note)=>{const b=h('button',{class:'cinema-setting','aria-pressed':String(p[key]),onclick:async()=>{if(key==='enabled'){if(cinemaSound.enabled&&(cinemaSound.snapshot().unlocked||cinemaSound.status==='starting'))cinemaSound.mute();else await cinemaSound.enable();}else cinemaSound.configure({[key]:!cinemaSound.prefs[key]});}},h('span',{},h('strong',{},label),h('small',{},note)),h('i',{'aria-hidden':'true'}));toggles[key]=b;return b;};
 const range=(key,label)=>h('label',{class:'cinema-level'},h('span',{},label),h('input',{type:'range',min:0,max:100,value:Math.round(p[key]*100),'aria-label':label,oninput:e=>cinemaSound.configure({[key]:+e.target.value/100})}));
 const panel=h('section',{class:'cinema-sound-panel'},h('p',{class:'eyebrow'},'THE SOUND OF HUMAN WITHIN'),h('h2',{},'Make room for sound.'),h('p',{},'Original stereo scores, soft transitions and a voice with room to breathe.'),status,toggle('enabled','Sound','One control for the whole app.'),range('volume','Master volume'),toggle('music','Music','A distinct score for every experience.'),range('musicLevel','Music level'),toggle('guidance','Welcome guidance','A short spoken welcome on entering an experience.'),range('voiceLevel','Guidance level'),toggle('effects','Soft sound effects','Quiet entrances, page turns and completions.'),h('p',{class:'cinema-headphones'},'Headphones reveal the stereo detail. Start at a comfortable volume. Narrated practices keep their recorded voice and music together.'),h('a',{href:'/cinema/audio/CREDITS.txt',target:'_blank',rel:'noopener',class:'cinema-credits'},'Soundtrack and voice credits'));
 const paint=s=>{for(const [key,b]of Object.entries(toggles))b.setAttribute('aria-pressed',String(s[key]));status.textContent=s.status==='unavailable'?'Sound could not start. Tap Sound to try again.':!s.enabled?'Sound is off.':!s.unlocked?'Tap Sound to begin.':s.held?'Session audio · the background score is resting.':`${s.name} · ${s.mood}`;};
 const off=cinemaSound.subscribe(paint),dialog=sheet(panel,{label:'Sound settings',onClose:off});dialog.el.classList.add('cinema-sound-dialog');paint(p);return dialog;
}
export function soundSettingsButton(className='icon-btn'){return h('button',{class:className,'aria-label':'Sound settings',title:'Sound settings',onclick:openSoundSettings},icon('sliders',19));}
