import { REALMS } from './engine.js?v=18214deeb83d6066';

// One ordered activity per active course or daily ritual. Books never enter this list.
export const DAILY_STAGES = [
  { id:'morning', name:'Begin gently', when:'Morning', description:'Settle, choose an intention, and carry it into the day.', icon:'today' },
  { id:'day', name:'Meet your day', when:'Daytime', description:'Learn something, notice a pattern, and try a useful response.', icon:'path' },
  { id:'evening', name:'Come back to quiet', when:'Evening', description:'Reflect, explore, and let the day soften.', icon:'moon' }
];
const order = [
  ['protocol','morning'],['clarity','morning'],['rewire','morning'],['awakening','morning'],['onegod','morning'],
  ['journey','day'],['thoughts','day'],['loop','day'],['escape','day'],['frequency','day'],
  ['mirror','evening'],['mirror2','evening'],['passage','evening'],['sanctuary','evening'],['sleep','evening']
];
export const DAILY_PROGRAMS = order.map(([id,stage])=>{
  const r=REALMS.find(r=>r.id===id);
  return { ...r, stage, length:r.kind==='sequence'?r.count:null, minimum:r.id==='protocol'?r.seconds:r.minSeconds };
});
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const integer=(v,max=36500)=>Number.isFinite(Number(v))?Math.min(max,Math.max(0,Math.floor(Number(v)))):0;
const date=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v))?String(v):'';
const noteText=v=>String(v??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,600);
export function validZone(zone){try{new Intl.DateTimeFormat('en',{timeZone:zone}).format(0);return zone;}catch{return 'UTC';}}
export function dailyDate(now=Date.now(),zone='UTC'){
  const p=new Intl.DateTimeFormat('en',{timeZone:validZone(zone),year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get=k=>p.find(x=>x.type===k).value;return `${get('year')}-${get('month')}-${get('day')}`;
}
export function normaliseDailyPlan(input={}){
  const p=object(input),items=object(p.items),d=object(p.draft);
  const result={v:1,initialized:p.initialized===true,startedAt:integer(p.startedAt,Number.MAX_SAFE_INTEGER),timeZone:validZone(p.timeZone||'UTC'),
    items:Object.fromEntries(DAILY_PROGRAMS.map(r=>{const x=object(items[r.id]),completed=integer(x.completed,r.length||36500);return [r.id,{completed,imported:Math.min(completed,integer(x.imported)),lastOn:date(x.lastOn),seconds:integer(x.seconds,Number.MAX_SAFE_INTEGER)}];})),
    activityDays:integer(p.activityDays),lastActivityOn:date(p.lastActivityOn),finishedDays:integer(p.finishedDays),lastFinishedOn:date(p.lastFinishedOn),
    history:(Array.isArray(p.history)?p.history:[]).filter(x=>date(x?.date)).map(x=>({date:x.date,steps:integer(x.steps,15)})).slice(-120),draft:null};
  const r=DAILY_PROGRAMS.find(r=>r.id===d.id);
  if(r&&integer(d.idx)===result.items[r.id].completed&&(!r.length||d.idx<r.length))result.draft={id:r.id,idx:integer(d.idx),seconds:integer(d.seconds,86400),note:noteText(d.note)};
  return result;
}
export function migrateDailyPlan(doc,now=Date.now()){
  const p=normaliseDailyPlan(doc?.space?.dailyPlan);if(p.initialized)return p;
  p.initialized=true;p.startedAt=now;p.timeZone=validZone(doc?.tz||'UTC');
  const sessions=Array.isArray(doc?.space?.sessions)?doc.space.sessions:[];
  for(const r of DAILY_PROGRAMS.filter(r=>r.length)){
    const prefix=r.id==='protocol'?'#/listen/':`#/browse/${r.id}/`;
    const records=sessions.filter(x=>x.completed&&x.route?.startsWith(prefix)&&/^\d+$/.test(x.route.slice(prefix.length)));
    const completed=new Set(records.map(x=>Number(x.route.slice(prefix.length))));let contiguous=0;
    while(completed.has(contiguous)&&contiguous<r.length)contiguous++;
    const count=Math.min(r.length,Math.max(contiguous,integer(doc?.ptr?.[r.id],r.length))),item=p.items[r.id];
    item.completed=count;item.imported=count;
    const last=records.filter(x=>Number(x.route.slice(prefix.length))<count).map(x=>dailyDate(x.at,p.timeZone));
    item.lastOn=[date(doc?.lastDone?.[r.id]),...last].sort().at(-1)||'';
  }
  return p;
}
export function planForDay(input,now=Date.now(),zone='UTC'){
  const p=normaliseDailyPlan(input),today=dailyDate(now,p.initialized?p.timeZone:zone);
  const items=DAILY_PROGRAMS.flatMap(r=>{
    const x=p.items[r.id],done=x.lastOn===today;
    if(r.length&&x.completed>=r.length&&!done)return [];
    return [{...r,idx:done?Math.max(0,x.completed-1):x.completed,completed:x.completed,done,finished:!!r.length&&x.completed>=r.length}];
  });
  const next=items.find(x=>!x.done)||null;
  return {date:today,items,next,done:items.filter(x=>x.done).length,total:items.length,complete:!next,
    finished:DAILY_PROGRAMS.filter(r=>r.length&&p.items[r.id].completed>=r.length),
    minimumSeconds:items.filter(x=>!x.done).reduce((sum,r)=>sum+r.minimum,0),
    draft:next&&p.draft?.id===next.id&&p.draft.idx===next.idx?p.draft:null};
}
export function checkpointDaily(input,{id,idx,seconds,note},now=Date.now()){
  const p=normaliseDailyPlan(input),day=planForDay(p,now);if(day.next?.id!==id||day.next.idx!==idx)return p;
  const old=p.draft?.id===id&&p.draft.idx===idx?p.draft.seconds:0;
  p.draft={id,idx,seconds:Math.max(old,integer(seconds,86400)),note:note===undefined?p.draft?.note||'':noteText(note)};return p;
}
export function completeDaily(input,{id,idx,day:expectedDay,seconds},now=Date.now()){
  const p=normaliseDailyPlan(input),day=planForDay(p,now),r=DAILY_PROGRAMS.find(x=>x.id===id);
  if(!r)throw Error('This activity is not part of your daily journey.');
  if(expectedDay!==day.date)throw Error('A new day has begun. Return to your day to continue with the current plan.');
  const x=p.items[id];
  if(x.lastOn===day.date&&idx===x.completed-1)return p; // duplicate tap / second tab
  if(x.lastOn>=day.date)throw Error('This activity is already kept for this day.');
  if(day.next?.id!==id||day.next.idx!==idx)throw Error('Your place has changed. Continue with the next activity in your day.');
  if(integer(seconds,86400)<r.minimum)throw Error('Stay with this activity a little longer before continuing.');
  x.completed++;x.lastOn=day.date;x.seconds+=integer(seconds,86400);p.draft=null;
  if(p.lastActivityOn!==day.date){p.activityDays++;p.lastActivityOn=day.date;}
  if(planForDay(p,now).complete&&p.lastFinishedOn!==day.date){p.finishedDays++;p.lastFinishedOn=day.date;p.history.push({date:day.date,steps:day.total});}
  return normaliseDailyPlan(p);
}
export function dailyTotals(input){
  const p=normaliseDailyPlan(input),items=Object.values(p.items);
  return {completed:items.reduce((n,x)=>n+x.completed-x.imported,0),seconds:items.reduce((n,x)=>n+x.seconds,0),days:p.activityDays,finishedDays:p.finishedDays};
}
