import './cinema-bridge.js';
import {PlaybackIntent,restoreMediaPosition} from './playback-intent.js';
const $=id=>document.getElementById(id),bus=window.HumanCinema,KEY='human.within.sleep.position.v1';
const voice=new Audio('/meditation/night-20.mp3'),tail=new Audio('/cinema/audio/sleep-tail-20.m4a');voice.preload='metadata';tail.preload='metadata';
const flows=[new PlaybackIntent(voice),new PlaybackIntent(tail)];
let active=voice,part=0,started=false,starting=false,paused=false,ended=false,closed=false,cues=[],timer=null,releases=[],cancelSeek=()=>{},lastKnown=0,lastSaved=0;
const readPosition=()=>{try{const s=JSON.parse(localStorage.getItem(KEY));return Number.isFinite(s?.seconds)&&s.seconds>2&&s.seconds<2399?s.seconds:0;}catch{return 0;}};
const setVolume=()=>{for(const media of [voice,tail]){media.volume=bus.preferences.volume;media.muted=!bus.enabled;}};
const elapsed=()=>Math.min(2400,(part?1200:0)+active.currentTime);
function savePosition(){const seconds=started?elapsed():lastKnown;if(seconds>2&&seconds<2399)try{localStorage.setItem(KEY,JSON.stringify({seconds,at:Date.now()}));}catch{}}
function clearPosition(){try{localStorage.removeItem(KEY);}catch{}}
function paintControls(){const b=$('sleep-pause');b.textContent=paused?'Resume':'Pause';b.setAttribute('aria-label',paused?'Resume sleep session':'Pause sleep session');b.setAttribute('aria-pressed',String(paused));}
function paint(){if(!started||ended||closed)return;const t=elapsed();lastKnown=t;if(Math.abs(t-lastSaved)>=5){savePosition();lastSaved=t;}
 if(part===0){const cue=[...cues].reverse().find(c=>c.at<=t);if(cue)$('cap').textContent=cue.text;}else $('cap').textContent='Nothing more to follow. You can stay at rest.';
 if(part===0&&t>30&&tail.preload!=='auto'){tail.preload='auto';tail.load();}
 const breath=.5+.5*Math.sin(t*Math.PI/5.8);$('orb').style.transform=`scale(${.8+breath*.12})`;$('orb').style.opacity=part?'0':String(Math.max(.04,.28*(1-t/1200)));}
async function begin({restart=false}={}){
 if(closed||starting||started&&!ended)return;starting=true;ended=false;const saved=restart?0:readPosition();if(restart)clearPosition();part=saved>=1200?1:0;active=part?tail:voice;lastKnown=saved;
 cancelSeek();cancelSeek=restoreMediaPosition(active,saved-part*1200);bus.pause();
 for(const release of releases)release();releases=[bus.registerMedia(voice,{background:true}),bus.registerMedia(tail,{background:true}),bus.subscribe(setVolume)];
 $('go').disabled=true;$('go').textContent='Preparing your quiet…';
 try{bus.start();bus.pause();setVolume();if(!await flows[part].play()||closed)return;started=true;paused=false;$('intro').style.display='none';$('outro').style.display='none';$('stage').style.display='block';$('cap').style.opacity='1';paintControls();clearInterval(timer);timer=setInterval(paint,500);paint();}
 catch{if(closed)return;bus.pause();$('go').textContent='Try sound again';$('go').disabled=false;for(const release of releases)release();releases=[];started=false;}
 finally{starting=false;if(!closed)$('go').disabled=false;}
}
async function togglePause(){if(!started||ended||closed)return;
 if(flows[part].desired){paused=true;flows[part].pause();savePosition();paintControls();return;}
 paused=false;paintControls();try{if(active.error){active.load();cancelSeek();cancelSeek=restoreMediaPosition(active,Math.max(0,lastKnown-part*1200));}if(!await flows[part].play()||closed)return;paint();}
 catch{if(closed)return;paused=true;$('cap').textContent='Audio is not ready. Tap Resume to try again.';paintControls();}}
function finish(early=false){if(ended||closed)return;if(early)savePosition();else clearPosition();lastKnown=elapsed();ended=true;started=false;clearInterval(timer);flows.forEach(f=>f.pause());bus.pause();$('stage').style.display='none';$('outro').style.display='block';$('outro').querySelector('p').textContent=early?'The sound has stopped. Stay here as long as you like.':'The sound has faded to silence. There is nothing else to do.';for(const release of releases)release();releases=[];bus.pause();}
voice.addEventListener('ended',async()=>{if(!started||ended||closed)return;const continuePlaying=!paused&&flows[0].desired;part=1;active=tail;cancelSeek();cancelSeek=restoreMediaPosition(tail,0);if(!continuePlaying){paused=true;paintControls();return;}try{if(await flows[1].play()&&!closed){paused=false;paintControls();paint();}}catch{paused=true;$('cap').textContent='Tap Resume for the quiet music.';paintControls();}});
tail.addEventListener('ended',()=>finish(false));
for(const [i,media]of [voice,tail].entries()){
 media.addEventListener('pause',()=>{if(started&&!ended&&!closed&&part===i&&media.paused&&!media.ended&&!flows[i].pending){paused=true;flows[i].pause();savePosition();paintControls();}});
 media.addEventListener('error',()=>{if(started&&!closed&&part===i){paused=true;flows[i].pause();$('cap').textContent='Audio was interrupted. Your place is held. Tap Resume to try again.';paintControls();}});
}
const saved=readPosition();if(saved){$('go').textContent=`Continue · ${String(Math.floor(saved/60)).padStart(2,'0')}:${String(Math.floor(saved%60)).padStart(2,'0')}`;const restart=document.createElement('button');restart.textContent='Start from the beginning';restart.className='sleep-restart';restart.onclick=()=>begin({restart:true});$('go').after(restart);}
$('go').onclick=()=>begin();$('again').onclick=()=>{ended=true;started=false;begin({restart:true});};$('sleep-pause').onclick=togglePause;$('end').onclick=()=>finish(true);
fetch('/content/meditation/session.json').then(r=>r.json()).then(s=>{cues=s.sessions.night.cues;}).catch(()=>{});
addEventListener('pagehide',()=>{savePosition();closed=true;clearInterval(timer);cancelSeek();flows.forEach(f=>f.close());for(const release of releases)release();},{once:true});
