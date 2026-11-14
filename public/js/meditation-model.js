export const MEDITATION_PRESETS=Object.freeze({
 arrival:{id:'arrival',duration:300,session:'arrival',ending:'day',title:'A gentle arrival',label:'5 minutes · return to your day'},
 night5:{id:'night5',duration:300,session:'night',ending:'night',title:'A quiet goodnight',label:'5 minutes · stay at rest'},
 night20:{id:'night20',duration:1200,session:'night',ending:'night',title:'More time for rest',label:'20 minutes · stay at rest'}
});
const bounded=(v,max)=>Math.max(0,Math.min(max,Number(v)||0));
export function normaliseMeditation(value={}){
 const v=value&&typeof value==='object'?value:{},choice=MEDITATION_PRESETS[v.choice]?v.choice:'arrival';let last=null;
 if(v.last&&MEDITATION_PRESETS[v.last.preset]){const p=MEDITATION_PRESETS[v.last.preset],l=v.last;last={preset:p.id,elapsed:bounded(l.elapsed,p.duration),listened:bounded(l.listened,p.duration),at:bounded(l.at,Number.MAX_SAFE_INTEGER),startedAt:bounded(l.startedAt,Number.MAX_SAFE_INTEGER),recordId:String(l.recordId||'').replace(/[^a-zA-Z0-9-]/g,'').slice(0,90),completed:!!l.completed};}
 return {choice,last,feeling:['settled','same','uncomfortable'].includes(v.feeling)?v.feeling:null};
}
export function meditationCue(session,elapsed){return [...(session?.cues||[])].reverse().find(c=>c.at<=elapsed)||session?.cues?.[0]||null;}
export function meditationPhase(elapsed,ending='day'){
 return elapsed<45?'settle':elapsed<117?'breathe':elapsed<143?'eyes':elapsed<238?'body':elapsed<280||ending==='night'?'rest':'return';
}
/** Media time is the authority for audio playback. A jump is never credited as listening. */
export function createMeditationClock(duration,{elapsed=0,listened=0}={}){
 let state='ready',position=bounded(elapsed,duration),credit=bounded(listened,duration),stamp=null,media=position;
 const snapshot=()=>({state,elapsed:position,listened:credit,duration,remaining:Math.max(0,duration-position),ended:state==='ended',completed:state==='ended'&&credit>=duration-2});
 return {snapshot,
  start(now){if(state==='ended')return snapshot();state='playing';stamp=now;media=position;return snapshot();},
  tickAudio(seconds,now,isPlaying=true){const next=bounded(seconds,duration),wall=stamp===null?0:Math.max(0,(now-stamp)/1000),advance=next-media;if(state==='playing'&&isPlaying&&advance>=0&&advance<=wall+1)credit=Math.min(duration,credit+advance);position=next;media=next;stamp=now;return snapshot();},
  tickVisual(now,visible=true){if(state==='playing'&&visible&&stamp!==null){const step=Math.max(0,Math.min(1,(now-stamp)/1000));position=Math.min(duration,position+step);credit=Math.min(duration,credit+step);media=position;}stamp=now;return snapshot();},
  pause(now){if(state==='playing')state='paused';stamp=now;return snapshot();},
  resume(now){if(state==='paused'||state==='ready'){state='playing';stamp=now;media=position;}return snapshot();},
  finish(){position=duration;state='ended';return snapshot();}
 };
}
export const bedtimeClipGain=(elapsed,duration)=>duration===300?Math.max(0,Math.min(1,(duration-elapsed)/7)):1;
