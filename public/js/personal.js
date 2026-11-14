import { state, mutateSpace, act, exportData, importData } from './store.js';
import { normaliseSpace, summaryOf, sessionRecord } from './space-model.js';
import { independentProgress } from './experience-flow.js';
import { migrateDailyPlan } from './daily-plan-model.js';
export const space=()=>normaliseSpace(state.doc?.space);
export const summary=()=>summaryOf(space(),Date.now(),state.doc?.tz||'UTC');
export const isSaved=route=>space().saved.some(x=>x.route===route);
export function toggleSaved(item){let saved;mutateSpace(s=>{const found=s.saved.some(x=>x.route===item.route);s.saved=found?s.saved.filter(x=>x.route!==item.route):[...s.saved,{...item,at:Date.now()}];saved=!found;return s;});return saved;}
export function rememberItem(item){mutateSpace(s=>({...s,recent:item}));}
export function addNote(text){if(!String(text).trim())return;mutateSpace(s=>({...s,notes:[...s.notes,{id:crypto.randomUUID?.()||String(Date.now()),text:String(text).trim().slice(0,800),at:Date.now()}]}));}
export function removeNote(id){mutateSpace(s=>({...s,notes:s.notes.filter(n=>n.id!==id)}));}
export function updateBook(id,progress){mutateSpace(s=>{s.books[id]={page:progress.page,total:progress.total,label:progress.label||'',at:Date.now()};return s;});}
export function downloaded(day){mutateSpace(s=>({...s,wallpapers:[...new Set([...s.wallpapers,day])]}));}
export function setPreferences(patch){mutateSpace(s=>({...s,...patch}));applyPreferences();}
export function applyPreferences(){document.documentElement.dataset.motion=space().motion;}
export function trackActivity(item){
  const id=crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,start=Date.now();let elapsed=0,last=performance.now(),closed=false,completed=false,visible=!document.hidden,tracking=true;
  const sample=()=>{const now=performance.now();if(visible&&tracking)elapsed+=Math.min(5000,now-last);last=now;};
  const visibility=()=>{sample();visible=!document.hidden;last=performance.now();};document.addEventListener('visibilitychange',visibility);
  const checkpoint=()=>{sample();if(elapsed<1000&&!completed)return;mutateSpace(s=>sessionRecord(s,{...item,id,at:start,seconds:Math.round(elapsed/1000),completed}));};
  const timer=setInterval(checkpoint,5000);
  function finish(done=false,outcome=null){if(closed)return;sample();completed=done;closed=true;clearInterval(timer);document.removeEventListener('visibilitychange',visibility);mutateSpace(s=>sessionRecord(s,{...item,id,at:start,seconds:Math.round(elapsed/1000),completed,outcome}));}
  return {finish,pause(){sample();tracking=false;},resume(){sample();tracking=true;},seconds:()=>{sample();return Math.floor(elapsed/1000);},id};
}
export async function saveProfile(name,intents,minutes,tone){await act('profile',{name,intents});setPreferences({minutes,tone});}
export async function downloadBackup(){const data=await exportData();const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Human_Within_Backup.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export { importData };

export function preferredMoments(){const map={calm:'racing',clarity:'focus',meaning:'meaning',belonging:'alone',habits:'stuck'};return [...new Set([...(state.doc?.intents||[]).map(id=>map[id]),'racing','focus','sleep','alone'].filter(Boolean))];}
export function sequenceProgress(id,total){
 const s=space(),carried=s.dailyPlan.initialized?s.dailyPlan:migrateDailyPlan(state.doc);return independentProgress(s.sessions,carried,id,total);
}
