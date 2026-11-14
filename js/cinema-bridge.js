import {cinemaSound} from './cinema-sound.js?v=18214deeb83d6066';
import {h,icon} from './ui.js?v=18214deeb83d6066';
import {openSoundSettings} from './cinema-controls.js?v=18214deeb83d6066';
let bus=cinemaSound;
try{if(parent!==window&&parent.location.origin===location.origin&&parent.HumanCinemaAudio)bus=parent.HumanCinemaAudio;}catch{}
if(bus===cinemaSound)bus.install();
const id=document.documentElement.dataset.cinemaProduct||'home',owner=`frame-${id}-${Date.now()}`;let cleanups=[];
window.HumanCinema={
 async start(){bus.setScene(id);bus.resume(owner);return bus.enable();},
 pause(){bus.hold(owner);},resume(){bus.resume(owner);if(bus.enabled&&bus.ctx?.state==='suspended')bus.ctx.resume().catch(()=>{});},stop(){bus.mute();},toggle(){return bus.toggle();},
 get enabled(){return bus.enabled;},get preferences(){return bus.prefs;},tune(){bus.cue('page');},level(value){bus.setLocalLevel(value);},
 registerNative(context,gain){const off=bus.attachNative(context,gain,owner+'-native');cleanups.push(off);bus.enable();return off;},
 registerMedia(media,options={}){const off=bus.attachMedia(media,owner+'-media',options);cleanups.push(off);return off;},
 subscribe(fn){const off=bus.subscribe(fn);cleanups.push(off);return off;},
 settings(){if(bus!==cinemaSound&&parent.HumanCinemaSettings)parent.HumanCinemaSettings();else openSoundSettings();},
 cue(name){bus.cue(name);}
};
cleanups.push(bus.subscribe(state=>window.dispatchEvent(new CustomEvent('human-cinema-state',{detail:state}))));
addEventListener('pagehide',()=>{for(const off of cleanups)off();cleanups=[];bus.resume(owner);},{once:true});
document.documentElement.classList.add('cinema-embedded');dispatchEvent(new Event('human-cinema-ready'));dispatchEvent(new CustomEvent('human-cinema-state',{detail:bus.snapshot()}));

const home=h('a',{class:'cinema-home',href:'/#/home','aria-label':'Home',onclick:e=>{if(parent!==window&&parent.HumanCinemaHome){e.preventDefault();parent.HumanCinemaHome();}}},icon('home',17),'Home');
const mute=h('button',{class:'cinema-mute',type:'button','data-sound-toggle':'true',onclick:()=>bus.toggle()});
const paintMute=s=>{mute.replaceChildren(icon(s.enabled&&s.unlocked?'sound':'mute',17),document.createTextNode(s.enabled&&s.unlocked?'Sound on':'Muted'));mute.setAttribute('aria-label',s.enabled&&s.unlocked?'Mute all sound':'Unmute sound');mute.setAttribute('aria-pressed',String(s.enabled&&s.unlocked));};
const tools=h('nav',{class:'cinema-fullscreen-tools','aria-label':'App controls'},home,mute);document.body.append(tools);
const toolsVisibility=()=>{tools.hidden=parent!==window&&!document.fullscreenElement;};document.addEventListener('fullscreenchange',toolsVisibility);toolsVisibility();paintMute(bus.snapshot());cleanups.push(bus.subscribe(paintMute));
