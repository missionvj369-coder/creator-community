import {cinemaSound} from '../cinema-sound.js?v=18214deeb83d6066';
import {soundSettingsButton} from '../cinema-controls.js?v=18214deeb83d6066';
import { h, mount, icon } from '../ui.js?v=18214deeb83d6066';
import { renderMeditation } from './meditation.js?v=18214deeb83d6066';
import { OPENING_CHAPTERS, GROUNDING_CHAPTERS, openingCue, createOpeningTimeline } from '../opening-model.js?v=18214deeb83d6066';
import { ArrivalSound } from '../arrival-sound.js?v=18214deeb83d6066';
import { RecordedArrivalVoice as ArrivalVoice } from '../recorded-arrival-voice.js?v=18214deeb83d6066';
import { createArrivalGarden } from '../arrival-garden.js?v=18214deeb83d6066';
import { createOpeningLight } from '../opening-light.js?v=18214deeb83d6066';

export function renderArrival(root,{onEnter,onMore,reduced=false,skipWelcome=false,preset='arrival',resume=false,groundingOnly=false,audioEnabled=false}={}){
 if(skipWelcome)return renderMeditationBeforeArrival(root,{onEnter,onMore,reduced,preset,resume});
 let meditation=null;
 const timeline=createOpeningTimeline({grounding:groundingOnly}),sound=new ArrivalSound();
 let disposed=false,entered=false,wantsSound=!!audioEnabled,visible=!document.hidden,still=reduced||matchMedia('(prefers-reduced-motion: reduce)').matches,chapterId='',cueKey='',lastFailure=false,mediaAttempt=0,voiceStatus='ready';
 const lightCanvas=h('canvas',{class:'opening-light','aria-hidden':'true'}),gardenCanvas=h('canvas',{class:'arrival-garden','aria-hidden':'true'});
 const soundLabel=h('span',{},'Enable sound & voice'),pauseLabel=h('span',{},'Pause'),motionLabel=h('span',{},still?'Still visuals':'Less movement');
 const soundButton=h('button',{class:'opening-control opening-sound',type:'button','aria-pressed':'false','aria-label':'Enable sound and voice',onclick:async()=>{wantsSound=!wantsSound;if(wantsSound)await cinemaSound.enable();else cinemaSound.mute();syncAudio(true);paintControls();}},icon('sound',16),soundLabel);
 const pauseButton=h('button',{class:'opening-control',type:'button','aria-label':'Pause opening',onclick:()=>{const s=timeline.snapshot();s.paused?timeline.resume(performance.now()):timeline.pause(performance.now());syncMedia();syncAudio();paintControls();}},icon('pause',16),pauseLabel);
 const motionButton=h('button',{class:'opening-control',type:'button','aria-pressed':String(still),'aria-label':still?'Use gently moving visuals':'Use still visuals',onclick:()=>{still=!still;paintControls();paintCue(false);}},icon('realms',16),motionLabel);
 const reveal=h('section',{class:'opening-reveal','aria-labelledby':'opening-title'},h('p',{class:'opening-overline'},'BEFORE THE WORLD ASKS ANYTHING OF YOU'),h('h1',{id:'opening-title',class:'opening-name',tabindex:'-1'},h('span',{},'Human'),h('em',{},'Within')),h('p',{class:'opening-subtitle'},'A quieter world begins within.'),h('div',{class:'opening-seal','aria-hidden':'true'},h('i'),h('span',{},'ONE HUMANITY. MANY WAYS.')));
 const video=h('video',{class:'opening-film',playsinline:true,preload:'auto',muted:true,disablepictureinpicture:true,'aria-label':'Welcome message 1 of 3'});video.muted=true;video.defaultMuted=true;
 const gardenRegion=h('div',{class:'opening-garden-visual','aria-hidden':'true',hidden:true},gardenCanvas);
 const backdrop=h('div',{class:'opening-video-backdrop','aria-hidden':'true'}),clipCount=h('p',{class:'opening-video-count'}),clipTitle=h('h1',{class:'opening-video-title'});
 const videoError=h('p',{class:'opening-video-error',role:'status',hidden:true},'This message could not play here. Your quiet arrival will continue.');
 const videoStage=h('section',{class:'opening-video-stage',hidden:true,'aria-label':'Three welcome messages'},h('div',{class:'opening-video-heading'},clipCount,clipTitle),h('div',{class:'opening-film-frame'},video,h('div',{class:'opening-film-edge','aria-hidden':'true'})),h('div',{class:'opening-film-caption'},h('span',{},'FROM ONE HUMAN TO ANOTHER'),h('div',{class:'opening-clip-dots','aria-label':'Three welcome messages'},[1,2,3].map(i=>h('i',{'aria-hidden':'true'})))),videoError);
 const kicker=h('p',{class:'arrival-kicker'}),title=h('h1',{class:'opening-guide-title',tabindex:'-1'}),cue=h('p',{class:'arrival-cue'});
 const guidance=h('section',{class:'opening-guidance',hidden:true,'aria-live':'polite','aria-atomic':'true'},kicker,title,cue);
 const status=h('p',{class:'opening-status',role:'status'}),note=h('p',{class:'opening-note'},'One tap for sound. Everything else flows on its own.');
 const stages=h('div',{class:'opening-stages','aria-label':'Opening progress'},(groundingOnly?['Settle','Follow','Notice']:['Opening','Welcome','Meditate']).map(label=>h('div',{},h('i',{},h('b')),h('span',{},label))));
 const wrap=h('div',{class:'arrival-space opening-space',role:'main','aria-label':groundingOnly?'Automatic quiet arrival':'Human Within opening'},lightCanvas,backdrop,
  h('header',{class:'arrival-header'},h('div',{class:'arrival-brand'},h('img',{src:'/assets/mark.svg',alt:'',width:29,height:29}),h('span',{},'human ',h('b',{},'within'))),h('button',{class:'arrival-enter',type:'button','aria-label':groundingOnly?'Skip quiet arrival and enter the app':'Skip welcome and begin meditation',onclick:groundingOnly?enter:beginMeditation},groundingOnly?'Go inside':'Begin meditation',icon('arrow',16))),
  h('div',{class:'opening-stage'},reveal,videoStage,guidance,gardenRegion),
  h('footer',{class:'opening-footer'},status,h('div',{class:'opening-controls'},soundButton,pauseButton,motionButton),note,stages));
 mount(root,wrap);
 const garden=createArrivalGarden(gardenCanvas,{reduced:still}),light=createOpeningLight(lightCanvas,{reduced:still});
 const voice=new ArrivalVoice({onStatus:s=>{voiceStatus=s;paintStatus();}});
 const timer=setInterval(update,200);
 const mediaListeners={ended:()=>{if(disposed)return;const s=timeline.snapshot();if(s.chapter.kind==='video'&&video.dataset.chapter===s.chapter.id&&!s.paused&&visible){timeline.mediaEnded(s.chapter.id,performance.now());update();}},timeupdate:()=>{if(disposed||!video.dataset.chapter)return;const s=timeline.snapshot(),local=video.currentTime-(s.chapter.offset||0);timeline.mediaTime(s.chapter.id,local);if(local*1000>=s.chapter.duration&&!s.paused){timeline.mediaEnded(s.chapter.id,performance.now());update();}},error:()=>{if(!disposed&&video.dataset.chapter){timeline.mediaFailed(video.dataset.chapter);update();}}};
 Object.entries(mediaListeners).forEach(([event,fn])=>video.addEventListener(event,fn));
 function enter(){if(meditation)return meditation.enter();if(entered)return;entered=true;destroy();onEnter?.();}
 function beginMeditation(){if(meditation||entered)return;destroy();meditation=renderMeditationBeforeArrival(root,{onEnter,onMore,reduced:still,preset:'arrival',autoStart:true,audioEnabled:wantsSound});}
 function paintStatus(){if(disposed)return;if(wantsSound&&voiceStatus==='unavailable'&&!timeline.snapshot().paused&&visible)soundLabel.textContent='Sound on';status.textContent=wantsSound&&voiceStatus==='unavailable'&&timeline.snapshot().chapter.kind!=='video'?'Voice isn’t available on this device. Follow the words and soft sound.':'';}
 function paintControls(){if(disposed)return;const s=timeline.snapshot(),paused=s.paused||!visible;
  wrap.classList.toggle('opening-still',still);wrap.classList.toggle('opening-paused',paused);wrap.classList.toggle('opening-audible',wantsSound);
  soundButton.setAttribute('aria-pressed',String(wantsSound));soundButton.setAttribute('aria-label',wantsSound?'Mute sound and voice':'Enable sound and voice');mount(soundButton,icon(wantsSound?'sound':'mute',16),soundLabel);soundLabel.textContent=wantsSound?paused?'Sound paused':voiceStatus==='unavailable'?'Sound on':'Sound & voice on':'Enable sound & voice';
  pauseButton.setAttribute('aria-label',s.paused?'Resume opening':'Pause opening');mount(pauseButton,icon(s.paused?'play':'pause',16),pauseLabel);pauseLabel.textContent=s.paused?'Resume':'Pause';
  motionButton.setAttribute('aria-pressed',String(still));motionButton.setAttribute('aria-label',still?'Use gently moving visuals':'Use still visuals');motionLabel.textContent=still?'Still visuals':'Less movement';
  light.set({elapsed:s.chapter.id==='reveal'?s.elapsed:12000,still,paused,active:s.chapter.kind==='reveal'});garden.set({scene:s.chapter.scene||0,gentle:still,paused,active:!['reveal','video'].includes(s.chapter.kind)});
  note.textContent=s.paused?'Your moment is paused. Resume whenever you like.':wantsSound?'Nothing to do. Just let the journey unfold.':'One tap for sound. Everything else flows on its own.';
  paintStatus();
 }
 function currentCue(){const s=timeline.snapshot();return openingCue(s.chapter.id,s.elapsed);}
 function paintCue(narrate=true){const s=timeline.snapshot(),c=currentCue();if(!c)return;const key=`${s.chapter.id}:${c.at}`;if(key===cueKey&&narrate)return;cueKey=key;
  if(s.chapter.kind!=='reveal'){title.textContent=still&&c.stillTitle?c.stillTitle:c.title;cue.textContent=c.text;kicker.textContent=s.chapter.kind==='welcome'?'THERE IS NOTHING TO GET RIGHT':s.chapter.kind==='return'?'WELCOME INSIDE':s.chapter.label.toUpperCase();guidance.dataset.cue=key;guidance.classList.remove('words-enter');void guidance.offsetWidth;guidance.classList.add('words-enter');}
  if(narrate&&wantsSound&&!s.paused&&visible)voice.speak(c.spoken||(s.chapter.kind==='reveal'?`${c.title}. ${c.text}`:c.text));
 }
 function syncAudio(replay=false){if(disposed)return;const s=timeline.snapshot(),active=wantsSound&&!s.paused&&visible;
  voice.setEnabled(wantsSound);video.muted=!wantsSound;video.volume=cinemaSound.prefs.volume;
  if(!active){sound.pause();if(!wantsSound)voice.cancel();else voice.pause();return;}
  voice.resume();
  if(s.chapter.kind==='video'){sound.pause();voice.cancel();video.muted=!wantsSound;return;}
  sound.start().then(ok=>{if(disposed||!wantsSound||timeline.snapshot().paused||!visible||timeline.snapshot().chapter.kind==='video')sound.pause();else if(!ok){status.textContent='Ambient sound could not start here. The visual journey continues.';}});
  if(replay){const c=currentCue();if(c)voice.speak(c.spoken||(s.chapter.kind==='reveal'?`${c.title}. ${c.text}`:c.text));}
 }
 async function playVideo(){const attempt=++mediaAttempt,s=timeline.snapshot();if(disposed||!visible||s.paused||s.failed||s.chapter.kind!=='video')return;video.muted=!wantsSound;video.volume=cinemaSound.prefs.volume;
  try{await video.play();}catch(e){if(disposed||attempt!==mediaAttempt||timeline.snapshot().chapter.id!==s.chapter.id)return;if(!video.muted){video.muted=true;try{await video.play();status.textContent='This browser needs a tap on sound to hear the video.';return;}catch{}}timeline.mediaFailed(s.chapter.id);update();}
 }
 function syncMedia(){const s=timeline.snapshot();if(s.chapter.kind==='video'){video.muted=!wantsSound;if(s.paused||!visible||s.failed){mediaAttempt++;video.pause();}else if(video.ended){timeline.mediaEnded(s.chapter.id,performance.now());update();}else if(video.paused)playVideo();}else video.pause();}
 function changeChapter(s){chapterId=s.chapter.id;cueKey='';lastFailure=false;voice.cancel();wrap.dataset.chapter=chapterId;wrap.dataset.kind=s.chapter.kind;
  reveal.hidden=s.chapter.kind!=='reveal';videoStage.hidden=s.chapter.kind!=='video';guidance.hidden=['reveal','video'].includes(s.chapter.kind);backdrop.hidden=s.chapter.kind!=='video';gardenRegion.hidden=guidance.hidden;videoError.hidden=true;
  if(s.chapter.kind==='video'){
   if(s.chapter.id==='voice-1'){video.classList.remove('clip-enter');void video.offsetWidth;video.classList.add('clip-enter');}
   const n=OPENING_CHAPTERS.filter(c=>c.kind==='video').findIndex(c=>c.id===s.chapter.id);clipCount.textContent=`A WELCOME · ${String(n+1).padStart(2,'0')} / 03`;clipTitle.textContent=s.chapter.label;
   [...wrap.querySelector('.opening-clip-dots').children].forEach((dot,i)=>dot.classList.toggle('on',i===n));
   backdrop.style.backgroundImage=`url("${s.chapter.poster}")`;video.dataset.chapter=chapterId;video.poster=s.chapter.poster;video.setAttribute('aria-label',`Welcome message ${n+1} of 3`);if(video.dataset.asset!==s.chapter.src){video.src=s.chapter.src;video.dataset.asset=s.chapter.src;video.load();}
  }else{mediaAttempt++;video.pause();video.removeAttribute('src');delete video.dataset.chapter;video.load();}
  paintControls();syncMedia();syncAudio();
 }
 function update(){if(disposed)return;const s=timeline.tick(performance.now(),visible);if(s.complete){groundingOnly?enter():beginMeditation();return;}if(chapterId!==s.chapter.id)changeChapter(s);if(s.failed&&!lastFailure){lastFailure=true;videoError.hidden=false;syncMedia();}paintCue();wrap.classList.toggle('opening-departing',s.chapter.kind==='return'&&s.elapsed>9500);light.set({elapsed:s.chapter.id==='reveal'?s.elapsed:12000});
  const chapters=groundingOnly?GROUNDING_CHAPTERS:OPENING_CHAPTERS,group=groundingOnly?s.index<2?0:s.index===2?1:2:s.index===0?0:s.index<=3?1:2,starts=groundingOnly?[0,2,3]:[0,1,4],ends=groundingOnly?[2,3,5]:[1,4,4],start=starts[group],end=ends[group],duration=chapters.slice(start,end).reduce((n,c)=>n+c.duration,0),passed=chapters.slice(start,s.index).reduce((n,c)=>n+c.duration,0)+s.elapsed;
  [...stages.children].forEach((el,i)=>{el.classList.toggle('on',i===group);el.setAttribute('aria-current',i===group?'step':'false');el.style.setProperty('--part',i<group?'100%':i>group?'0%':`${Math.min(100,passed/duration*100)}%`);});
 }
 function visibility(){timeline.tick(performance.now(),visible);visible=!document.hidden;timeline.tick(performance.now(),visible);syncMedia();syncAudio();paintControls();}
 const unwatchCinema=cinemaSound.subscribe(s=>{video.volume=s.volume;if(wantsSound!==s.enabled){wantsSound=s.enabled;syncAudio(false);paintControls();}});
 function destroy(){if(disposed)return;disposed=true;unwatchCinema();clearInterval(timer);mediaAttempt++;video.pause();Object.entries(mediaListeners).forEach(([event,fn])=>video.removeEventListener(event,fn));for(const v of [video]){v.removeAttribute('src');v.load();}garden.destroy();light.destroy();voice.close();sound.close();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',destroy);}
 wrap.addEventListener('ugt:leave',destroy);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',destroy);
 update();
 // One decoded film keeps the three messages continuous.
 if(!groundingOnly){video.src=OPENING_CHAPTERS[1].src;video.dataset.asset=video.src.includes('welcome-flow')?OPENING_CHAPTERS[1].src:'';video.load();}
 return {enter,destroy(){destroy();meditation?.destroy();}};
}

/** Every intentional meditation exit passes through the quiet arrival before app entry. */
function renderMeditationBeforeArrival(root,{onEnter,onMore,reduced=false,preset='arrival',resume=false,autoStart=false,audioEnabled=false}={}){
 let meditation=null,grounding=null,disposed=false;
 function continueGently(settings={}){
  if(disposed||grounding)return;
  grounding=renderArrival(root,{onEnter,onMore,groundingOnly:true,reduced:settings.still??reduced,audioEnabled:settings.audioEnabled??false});
 }
 meditation=renderMeditation(root,{onEnter:continueGently,onMore,reduced,preset,resume,autoStart,audioEnabled,onDayComplete:autoStart?continueGently:null});
 return {enter(){if(disposed)return;(grounding||meditation)?.enter();},destroy(){if(disposed)return;disposed=true;meditation?.destroy();grounding?.destroy();}};
}
