// The latest user action wins, even when media.play() resolves much later.
export class PlaybackIntent {
 constructor(media){this.media=media;this.revision=0;this.desired=false;this.closed=false;this.pending=false;}
 async play(){
  if(this.closed)return false;
  const revision=++this.revision;this.desired=true;this.pending=true;
  try{
   await this.media.play();
   if(this.closed||!this.desired){this.media.pause();return false;}
   return revision===this.revision;
  }catch(error){
   if(this.closed||!this.desired||revision!==this.revision)return false;
   this.desired=false;throw error;
  }finally{if(revision===this.revision)this.pending=false;}
 }
 pause(){this.revision++;this.desired=false;this.pending=false;this.media.pause();}
 close(){if(this.closed)return;this.closed=true;this.pause();}
}

export function restoreMediaPosition(media,seconds){
 const position=Math.max(0,Number(seconds)||0);
 let cancelled=false;
 const seek=()=>{if(cancelled)return;try{media.currentTime=Number.isFinite(media.duration)?Math.min(position,media.duration):position;}catch{}};
 if(media.readyState>=1)seek();else media.addEventListener('loadedmetadata',seek,{once:true});
 return()=>{cancelled=true;media.removeEventListener('loadedmetadata',seek);};
}

export function createSessionClock(duration,initial=0){
 let elapsed=Math.max(0,Math.min(duration,initial)),running=false,stamp=null;
 const snapshot=()=>({elapsed,running,remaining:Math.max(0,duration-elapsed)});
 function tick(now,active=true){if(running&&active&&stamp!==null)elapsed=Math.min(duration,elapsed+Math.max(0,(now-stamp)/1000));stamp=now;return snapshot();}
 return {snapshot,tick,start(now){running=elapsed<duration;stamp=now;return snapshot();},pause(now){tick(now);running=false;return snapshot();},resume(now){running=elapsed<duration;stamp=now;return snapshot();}};
}
