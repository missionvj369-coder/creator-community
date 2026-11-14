import {normaliseStudios} from './studio-model.js?v=18214deeb83d6066';
import {normaliseExplorations} from './discovery-model.js?v=18214deeb83d6066';
import {normaliseSound} from './cinema-model.js?v=18214deeb83d6066';
import { normaliseBodyAtlas } from './body-model.js?v=18214deeb83d6066';
import { normaliseRetiredDrafts } from './retired-drafts.js?v=18214deeb83d6066';
import { normaliseMeditation } from './meditation-model.js?v=18214deeb83d6066';
import { normaliseJourney } from './journey-model.js?v=18214deeb83d6066';
import { normaliseDailyPlan, dailyTotals } from './daily-plan-model.js?v=18214deeb83d6066';
import { normaliseImmersive } from './immersive-model.js?v=18214deeb83d6066';
// Device-only wellbeing state. Pure functions; the store owns persistence.
const safeNumber=(v,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(Number(v))?Math.max(0,Math.min(max,Number(v))):0;
const clean=(v,n=300)=>String(v??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,n);
export const TONES=['sage','lilac','clay','sky','rose'];
export function normaliseSpace(input={}){
  const s=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  return {v:1,cinemaSound:s.cinemaSound&&typeof s.cinemaSound==='object'?normaliseSound(s.cinemaSound):null,minutes:[2,5,10].includes(+s.minutes)?+s.minutes:2,tone:TONES.includes(s.tone)?s.tone:'sage',
    motion:s.motion==='reduced'?'reduced':'full',
    saved:Array.isArray(s.saved)?s.saved.filter(x=>x&&/^#\/(meditate|product|book|tool|experience)\/[a-z0-9-]+$/.test(x.route)).map(x=>({route:x.route,title:clean(x.title,120),kind:clean(x.kind,30),at:safeNumber(x.at)})).slice(0,150):[],
    sessions:Array.isArray(s.sessions)?s.sessions.filter(x=>x&&x.id&&/^#\/(atlas|meditate|thread|moment|product|book|tool|experience|browse|listen|read|session|world|daily)\/[a-z0-9-]+(?:\/\d+)?$/.test(x.route)).map(x=>({id:clean(x.id,90),route:clean(x.route,140),title:clean(x.title,140),kind:clean(x.kind,40),seconds:safeNumber(x.seconds,86400),completed:!!x.completed,at:safeNumber(x.at),outcome:['lighter','clearer','same','moved'].includes(x.outcome)?x.outcome:null})).slice(-600):[],
    books:s.books&&typeof s.books==='object'?Object.fromEntries(Object.entries(s.books).filter(([id,b])=>/^[a-z0-9-]+$/.test(id)&&b&&typeof b==='object').map(([id,b])=>[id,{page:Math.min(Math.max(1,Math.round(safeNumber(b.page,10000))),Math.max(1,Math.round(safeNumber(b.total,10000)))),total:Math.max(1,Math.round(safeNumber(b.total,10000))),label:clean(b.label,180),at:safeNumber(b.at)}])):{},
    notes:Array.isArray(s.notes)?s.notes.filter(x=>x&&clean(x.text)).map(x=>({id:clean(x.id,90),text:clean(x.text,800),at:safeNumber(x.at)})).slice(-200):[],
    explorations:normaliseExplorations(s.explorations),studios:normaliseStudios(s.studios),bodyAtlas:normaliseBodyAtlas(s.bodyAtlas),immersive:normaliseImmersive(s.immersive),dailyPlan:normaliseDailyPlan(s.dailyPlan),journey:normaliseJourney(s.journey),atlas:normaliseRetiredDrafts(s.atlas),meditation:normaliseMeditation(s.meditation),
    wallpapers:Array.isArray(s.wallpapers)?[...new Set(s.wallpapers.filter(n=>Number.isInteger(n)&&n>=1&&n<=30))]:[],recent:s.recent&&/^#\//.test(s.recent.route)&&!/^#\/(atlas|chapter)\//.test(s.recent.route)?{route:clean(s.recent.route,140),title:clean(s.recent.title,140),kind:clean(s.recent.kind,40)}:null};
}
export function sessionRecord(space,record){
  const s=normaliseSpace(space),r=normaliseSpace({sessions:[record]}).sessions[0];
  if(!r)return s;
  const existing=s.sessions.findIndex(x=>x.id===r.id);
  if(existing<0)s.sessions.push(r);else s.sessions[existing]={...r,seconds:Math.max(s.sessions[existing].seconds,r.seconds),completed:s.sessions[existing].completed||r.completed};
  return normaliseSpace(s);
}
export function summaryOf(space,now=Date.now(),tz='UTC'){
  const s=normaliseSpace(space);const key=at=>new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
  const visible=s.sessions.filter(x=>!x.route.startsWith('#/atlas/')),complete=visible.filter(x=>x.completed),seconds=visible.reduce((n,x)=>n+x.seconds,0),today=key(now),days=new Set(complete.map(x=>key(x.at)));
  const daily=dailyTotals(s.dailyPlan),dailyVisits=visible.filter(x=>x.route.startsWith('#/daily/')),dailySeconds=dailyVisits.reduce((n,x)=>n+x.seconds,0),dailyCompleted=complete.filter(x=>x.route.startsWith('#/daily/')).length;
  const actualSeconds=seconds-dailySeconds+Math.max(dailySeconds,daily.seconds);
  return {completed:complete.length-dailyCompleted+daily.completed,seconds:actualSeconds,minutes:Math.floor(actualSeconds/60),days:Math.max(days.size,daily.days),today:complete.filter(x=>key(x.at)===today).length,books:Object.entries(s.books).filter(([id,x])=>!id.startsWith('book-')&&x.page>1).length,saved:s.saved.length,wallpapers:s.wallpapers.length};
}
export function validateBackup(input){
  if(!input||typeof input!=='object'||input.app!=='human-within'||input.version!==1||!input.profile||!input.progress)throw Error('Choose a Human Within backup file.');
  if(!['string','undefined'].includes(typeof input.profile.name)||String(input.profile.name||'').length>40)throw Error('This backup has an invalid profile.');
  const p=input.progress;if(p.v!==1||!Array.isArray(p.sessions)||!Array.isArray(p.saved)||!p.books||typeof p.books!=='object')throw Error('This backup is incomplete.');
  if(p.sessions.length>600||p.saved.length>150||JSON.stringify(input).length>5000000)throw Error('This backup is too large.');
  const bookKeys=['neoXhuman.body.illustrated.v2','neoxhuman.growingmind.reader.2026.v1','switch-off-flipbook-2026-page','human-simple-v3','human.within.sleep.position.v1'];
  const readerState=Object.fromEntries(Object.entries(input.readerState||{}).filter(([k,v])=>(bookKeys.includes(k)||k.startsWith('ugt.how-to-work-with-me.')||k.startsWith('astralyon.how-to-work-with-me.')||k.startsWith('hj-single-')||k.startsWith('human-journey'))&&typeof v==='string'&&v.length<100000));
  return {name:clean(input.profile.name,40),intents:Array.isArray(input.profile.intents)?input.profile.intents.filter(x=>['calm','clarity','meaning','belonging','habits'].includes(x)).slice(0,3):[],space:normaliseSpace(p),readerState};
}
