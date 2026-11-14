/** The opening runs itself. Only real video endings advance the video chapters. */
export const OPENING_CHAPTERS = Object.freeze([
 {id:'reveal',kind:'reveal',label:'An opening',duration:12000},
 {id:'voice-1',kind:'video',label:'A shared humanity',src:'/videos/welcome-flow.mp4',offset:0,poster:'/videos/intro-1.webp',duration:25008},
 {id:'voice-2',kind:'video',label:'A little room to be human',src:'/videos/welcome-flow.mp4',offset:25.008,poster:'/videos/intro-2.webp',duration:18230},
 {id:'voice-3',kind:'video',label:'A welcome, just as you are',src:'/videos/welcome-flow.mp4',offset:43.238,poster:'/videos/intro-3.webp',duration:23820}

]);
export const OPENING_DURATION=OPENING_CHAPTERS.reduce((n,c)=>n+c.duration,0);
export function openingVideoIndex(seconds){const time=Number.isFinite(seconds)?Math.max(0,seconds):0,clips=OPENING_CHAPTERS.filter(c=>c.kind==='video');let index=0;for(let i=1;i<clips.length;i++)if(time>=clips[i].offset)index=i;return index;}
export const OPENING_CUES=Object.freeze({reveal:[{at:2200,title:'Human Within',text:'A quieter world begins within.'}]});
export const GROUNDING_CHAPTERS=Object.freeze([
 {
  "id": "welcome",
  "kind": "welcome",
  "label": "Welcome in",
  "duration": 15000
 },
 {
  "id": "settle",
  "kind": "garden",
  "label": "Settle",
  "scene": 0,
  "duration": 30000
 },
 {
  "id": "follow",
  "kind": "garden",
  "label": "Follow",
  "scene": 1,
  "duration": 30000
 },
 {
  "id": "notice",
  "kind": "garden",
  "label": "Notice",
  "scene": 2,
  "duration": 30000
 },
 {
  "id": "return",
  "kind": "return",
  "label": "Take this pace with you",
  "scene": 2,
  "duration": 11000
 }
]);
export const GROUNDING_DURATION=GROUNDING_CHAPTERS.reduce((n,c)=>n+c.duration,0);
const GROUNDING_CUES=Object.freeze({
 "welcome": [
  {
   "at": 500,
   "title": "Welcome, just as you are.",
   "text": "For the next little while, nothing needs to be solved. Just let this moment be here.",
   "spoken": "Welcome to Human Within. For the next little while, nothing needs to be solved. Just let this moment be here."
  }
 ],
 "settle": [
  {
   "at": 0,
   "title": "Let the day wait.",
   "text": "Let your hands soften. If it feels comfortable, let your shoulders settle."
  },
  {
   "at": 14500,
   "title": "Something is holding you.",
   "text": "Notice where your body meets the chair, the bed, or the ground."
  }
 ],
 "follow": [
  {
   "at": 0,
   "title": "Just follow the light.",
   "stillTitle": "Rest with the light.",
   "text": "Rest your eyes wherever they feel comfortable. Follow the little light, or let your gaze be still."
  },
  {
   "at": 16000,
   "title": "There is nowhere to get to.",
   "text": "Let your breathing find its own pace. No counting. No holding. Simply notice one breath."
  }
 ],
 "notice": [
  {
   "at": 0,
   "title": "Here, for a moment.",
   "text": "Notice one ordinary thing around you. A colour. A texture. A quiet sound."
  },
  {
   "at": 15500,
   "title": "Let that be enough.",
   "text": "You do not need to make this moment feel any particular way. Let it be as it is."
  }
 ],
 "return": [
  {
   "at": 0,
   "title": "Take this pace with you.",
   "text": "A little more room. A little less rush. Welcome inside.",
   "spoken": "You can carry this pace with you. A little more room. A little less rush. Welcome inside."
  }
 ]
});
export function openingCue(chapterId,elapsed){const list=OPENING_CUES[chapterId]||GROUNDING_CUES[chapterId]||[];return [...list].reverse().find(c=>elapsed>=c.at)||null;}
export function createOpeningTimeline({grounding=false}={}){
 const chapters=grounding?GROUNDING_CHAPTERS:OPENING_CHAPTERS,duration=grounding?GROUNDING_DURATION:OPENING_DURATION;
 let index=0,elapsed=0,last=null,paused=false,complete=false,stall=0,failed=false;
 const snapshot=()=>({index,chapter:chapters[index],elapsed,paused,complete,failed,progress:Math.min(1,(chapters.slice(0,index).reduce((n,c)=>n+c.duration,0)+elapsed)/duration)});
 function next(now){if(complete)return snapshot();if(index===chapters.length-1){complete=true;elapsed=chapters[index].duration;}else{index++;elapsed=0;failed=false;stall=0;}last=now;return snapshot();}
 return {
  snapshot,
  tick(now,visible=true){const dt=last===null?0:Math.max(0,Math.min(2000,now-last));last=now;if(paused||!visible||complete)return snapshot();const chapter=chapters[index];if(chapter.kind==='video'&&!failed){stall+=dt;if(stall>=20000){failed=true;stall=0;}return snapshot();}if(failed){stall+=dt;if(stall>=4000)return next(now);return snapshot();}elapsed=Math.min(chapter.duration,elapsed+dt);return elapsed>=chapter.duration?next(now):snapshot();},
  pause(now){this.tick(now);paused=true;return snapshot();},
  resume(now){paused=false;last=now;return snapshot();},
  mediaTime(id,seconds){if(!complete&&chapters[index].id===id&&chapters[index].kind==='video'&&Number.isFinite(seconds)){const nextTime=Math.min(chapters[index].duration,Math.max(0,seconds*1000));if(nextTime>elapsed){elapsed=nextTime;stall=0;}}return snapshot();},
  mediaEnded(id,now){if(!complete&&!paused&&chapters[index].kind==='video'&&chapters[index].id===id)return next(now);return snapshot();},
  mediaFailed(id){if(!complete&&!failed&&chapters[index].kind==='video'&&chapters[index].id===id){failed=true;stall=0;}return snapshot();}
 };
}
