import {encodeCreationVideo} from './discovery-video.js?v=18214deeb83d6066';
import {createDiscoveryClock,normaliseCreation,chooseVideoType,animatedCreationSVG} from './discovery-model.js?v=18214deeb83d6066';
import {CREATION_ASPECTS} from './discovery-meta.js?v=18214deeb83d6066';
import {renderWonder,renderUnseen,renderCreation} from './discovery-canvas.js?v=18214deeb83d6066';
export function createDiscoveryStage(canvas,read,onFrame=()=>{}){
 const g=canvas.getContext('2d',{alpha:false}),clock=createDiscoveryClock(),cache=new Map();let width=1,height=1,dpr=1,frame=0,closed=false,lastPaint=-100;
 const render=()=>{if(closed||!g)return;g.setTransform(dpr,0,0,dpr,0,0);const s=read();if(s.kind==='creation')renderCreation(g,width,height,s.art,clock.time,s.live);else if(s.kind==='unseen')renderUnseen(g,width,height,{...s,time:clock.time},cache);else renderWonder(g,width,height,{...s,time:clock.time},cache);};
 const tick=now=>{frame=0;if(closed||clock.paused)return;clock.tick(now);if(now-lastPaint>=1000/30){render();lastPaint=now;onFrame(clock.time);}if(!closed&&!clock.paused)frame=requestAnimationFrame(tick);};
 const resize=()=>{if(closed)return;const rect=canvas.parentElement.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(window.devicePixelRatio||1,1.65,Math.sqrt(1500000/(width*height)));canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);render();};
 const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();clock.pause();
 return {clock,get available(){return !!g;},draw:render,play(){if(closed||!g)return;clock.resume();if(!frame)frame=requestAnimationFrame(tick);},pause(){clock.pause();cancelAnimationFrame(frame);frame=0;render();},seek(value){clock.seek(value);render();},dispose(){if(closed)return;closed=true;clock.pause();cancelAnimationFrame(frame);observer.disconnect();cache.clear();}};
}
export function creationImage(art,phase=0){
 const a=normaliseCreation(art),size=CREATION_ASPECTS[a.aspect],canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;const g=canvas.getContext('2d',{alpha:false});if(!g)return Promise.reject(Error('Image export is unavailable.'));renderCreation(g,size.width,size.height,a,phase);return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?.size?resolve(blob):reject(Error('The image could not be created.')),'image/png'));
}
function recordedCreationLoop(art,onProgress=()=>{}){
 const a=normaliseCreation(art),type=chooseVideoType(globalThis.MediaRecorder),size=CREATION_ASPECTS[a.aspect];let recorder=null,stream=null,frame=0,timer=0,settled=false,cancelled=false,resolveTask;
 const finish=result=>{if(settled)return;settled=true;clearTimeout(timer);cancelAnimationFrame(frame);stream?.getTracks().forEach(t=>t.stop());resolveTask(result);};
 const svg=()=>({blob:new Blob([animatedCreationSVG(a)],{type:'image/svg+xml;charset=utf-8'}),extension:'svg',fallback:true});
 const promise=new Promise(resolve=>{resolveTask=resolve;
  const canvas=document.createElement('canvas');if(!type||typeof canvas.captureStream!=='function'){finish(svg());return;}
  const ratio=size.height/size.width;canvas.width=a.aspect==='wide'?1280:720;canvas.height=Math.round(canvas.width*ratio);const g=canvas.getContext('2d',{alpha:false});if(!g){finish(svg());return;}
  try{
   renderCreation(g,canvas.width,canvas.height,a,a.phase);stream=canvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:5000000});const chunks=[];
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   recorder.onerror=()=>finish(cancelled?{cancelled:true}:svg());
   recorder.onstop=()=>{if(cancelled){finish({cancelled:true});return;}const blob=new Blob(chunks,{type:recorder.mimeType||type});finish(blob.size?{blob,extension:type.startsWith('video/mp4')?'mp4':'webm',fallback:false}:svg());};
   recorder.start(150);const start=performance.now();
   const draw=now=>{if(settled||cancelled)return;const elapsed=(now-start)/1000;renderCreation(g,canvas.width,canvas.height,a,a.phase+Math.min(6,elapsed));onProgress(Math.min(1,elapsed/6));if(elapsed>=6){timer=setTimeout(()=>{if(!settled&&recorder.state!=='inactive')recorder.stop();},120);}else frame=requestAnimationFrame(draw);};
   frame=requestAnimationFrame(draw);timer=setTimeout(()=>{if(!settled){try{if(recorder.state!=='inactive')recorder.stop();else finish(svg());}catch{finish(svg());}}},9000);
  }catch{finish(svg());}
 });
 return {promise,cancel(){if(settled)return;cancelled=true;try{if(recorder&&recorder.state!=='inactive')recorder.stop();}catch{}finish({cancelled:true});}};
}
export function downloadCreation(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000);}

export function creationLoop(art,onProgress=()=>{}){
 const a=normaliseCreation(art),size=CREATION_ASPECTS[a.aspect];let cancelled=false,recording=null;
 const promise=(async()=>{
  const canvas=document.createElement('canvas');canvas.width=a.aspect==='wide'?1280:720;canvas.height=Math.round(canvas.width*size.height/size.width);const g=canvas.getContext('2d',{alpha:false});
  if(g){const result=await encodeCreationVideo(canvas,time=>renderCreation(g,canvas.width,canvas.height,a,a.phase+time),onProgress,()=>cancelled);if(cancelled)return {cancelled:true};if(result)return result;}
  if(cancelled)return {cancelled:true};recording=recordedCreationLoop(a,onProgress);return recording.promise;
 })();
 return {promise,cancel(){cancelled=true;recording?.cancel();}};
}
