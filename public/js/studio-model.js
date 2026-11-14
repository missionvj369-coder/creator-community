import {STUDIO_IDS} from './studio-meta.js';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const text=(v,n=500)=>String(v??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,n);
const num=(v,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(Number(v))?Math.max(0,Math.min(max,Number(v))):0;
const pick=(v,choices,fallback='')=>choices.includes(v)?v:fallback;
export const STUDIO_STEPS={
 'mind-unfold':['Arrive','Put it down','Give it a place','One useful move','Your clarity map'],
 'human-bridge':['Arrive','Who & why','What happened','What matters','Rehearse','Your conversation card'],
 'possibility-studio':['Arrive','The possibilities','Your priorities','See the trade-offs','A small experiment','Your possibility card']
};
export const THOUGHT_LANES=[
 {id:'now',name:'A step I can take',short:'Act',note:'Something you can influence with a small action.'},
 {id:'later',name:'Room to leave it',short:'Let rest',note:'Something you choose not to work on right now.'},
 {id:'learn',name:'Something to find out',short:'Learn',note:'A question that needs information, rather than another guess.'},
 {id:'support',name:'Something to share',short:'Ask',note:'Something to bring to a person you trust or a suitable source of help.'}
];
export const STUDIO_VALUES=['Care','Stability','Freedom','Learning','Connection','Creativity','Contribution','Rest'];
export function splitThoughts(input,previous=[]){
 const seen=new Set(),used=new Set(previous.map(t=>t.id));let serial=0;
 return String(input).split(/\n/).map(s=>text(s,200)).filter(s=>s&&!seen.has(s.toLowerCase())&&seen.add(s.toLowerCase())).slice(0,12).map(s=>{const old=previous.find(t=>t.text===s);let id=old?.id;if(!id){do{id=`thought-${++serial}`;}while(used.has(id));used.add(id);}return {id,text:s,lane:pick(old?.lane,THOUGHT_LANES.map(x=>x.id))};});
}
export function normaliseStudioDraft(kind,input={}){
 const d=object(input),id=/^[a-zA-Z0-9-]{1,90}$/.test(d.id)?d.id:'';
 const base={id,step:Math.floor(num(d.step,(STUDIO_STEPS[kind]?.length||1)-1)),createdAt:num(d.createdAt),updatedAt:num(d.updatedAt),savedAt:num(d.savedAt),example:d.example===true};
 if(kind==='mind-unfold'){
  const reserved=new Set((Array.isArray(d.thoughts)?d.thoughts:[]).map(t=>t?.id)),seen=new Set();let serial=0;const safeId=t=>{if(/^[a-z0-9-]{1,40}$/.test(t.id)&&!seen.has(t.id)){seen.add(t.id);return t.id;}let id;do{id=`thought-${++serial}`;}while(seen.has(id)||reserved.has(id));seen.add(id);return id;};const thoughts=(Array.isArray(d.thoughts)?d.thoughts:[]).filter(t=>t&&text(t.text,200)).slice(0,12).map((t,i)=>({id:safeId(t),text:text(t.text,200),lane:pick(t.lane,THOUGHT_LANES.map(x=>x.id))}));
  return {...base,input:text(d.input,2600),thoughts,cursor:Math.floor(num(d.cursor,Math.max(0,thoughts.length-1))),focus:thoughts.some(t=>t.id===d.focus)?d.focus:'',action:text(d.action,280),cue:text(d.cue,180)};
 }
 if(kind==='human-bridge')return {...base,person:text(d.person,80),intention:pick(d.intention,['request','boundary','repair'],'request'),tone:pick(d.tone,['warm','clear','firm'],'warm'),observation:text(d.observation,240),impact:text(d.impact,200),need:text(d.need,180),request:text(d.request,240),branch:pick(d.branch,['open','defensive','not-now']),move:pick(d.move,['listen','restate','pause']),reply:text(d.reply,500),timing:text(d.timing,180)};
 const values=[],seen=new Set();for(const v of Array.isArray(d.values)?d.values:[]){const label=text(v?.label,35);if(!label||seen.has(label.toLowerCase()))continue;seen.add(label.toLowerCase());values.push({label,weight:Math.max(1,Math.round(num(v.weight,5)))});if(values.length===3)break;}
 const ratings={};for(const key of ['a','b','c'])ratings[key]=values.map((_,i)=>{const r=d.ratings?.[key]?.[i];return r!==null&&r!==''&&r!==undefined&&Number.isFinite(Number(r))?Math.round(num(r,5)):null;});
 return {...base,question:text(d.question,180),options:{a:text(d.options?.a,100),b:text(d.options?.b,100),c:text(d.options?.c,100)},values,ratings,chosen:pick(d.chosen,['a','b','c']),unknown:text(d.unknown,240),experiment:text(d.experiment,280),cue:text(d.cue,180),limit:text(d.limit,200),attempted:pick(d.attempted,['yes','not-yet']),learning:text(d.learning,600)};
}
export function normaliseStudios(input={}){
 const s=object(input),drafts={};for(const id of STUDIO_IDS)if(object(s.drafts)[id]?.id)drafts[id]=normaliseStudioDraft(id,s.drafts[id]);
 const seen=new Set(),cards=(Array.isArray(s.cards)?s.cards:[]).filter(c=>STUDIO_IDS.includes(c?.kind)&&c?.draft?.id).map(c=>({kind:c.kind,draft:normaliseStudioDraft(c.kind,c.draft)})).filter(c=>c.draft.id&&c.draft.savedAt&&!seen.has(c.draft.id)&&seen.add(c.draft.id)).slice(-100);
 return {v:1,drafts,cards};
}
export function studioIssues(kind,input,step=input.step){
 const d=normaliseStudioDraft(kind,input),issues={};const need=(key,value,label)=>{if(!value?.trim())issues[key]=label;};
 if(kind==='mind-unfold'){
  if(step===1){need('input',d.input,'Put down at least one thought, one per line.');const lines=String(input.input||'').split(/\n/).map(s=>s.trim()).filter(Boolean);if(new Set(lines.map(s=>s.toLowerCase())).size>12)issues.input='Keep up to twelve thoughts in this map. You can make another map for the rest.';else if(lines.some(s=>s.length>200))issues.input='Keep each thought to 200 characters, so it has a clear place in your map.';}
  if(step===2&&(!d.thoughts.length||d.thoughts.some(t=>!t.lane)))issues.lanes='Give each thought a place. You can change it later.';
  if(step===3){if(!d.focus)issues.focus='Choose one thought to work with.';need('action',d.action,'Choose one small move, including a deliberate pause if that fits.');need('cue',d.cue,'Give your next move a time or a simple cue.');}
 }else if(kind==='human-bridge'){
  if(step===1)need('person',d.person,'Who is this conversation with? A relationship is enough; no name is needed.');
  if(step===2){need('observation',d.observation,'Describe one specific thing that happened.');need('impact',d.impact,'Describe its effect on you.');}
  if(step===3){need('need',d.need,'Name what matters to you.');need('request',d.request,'Write a specific request or boundary in your own words.');}
  if(step===4){if(!d.branch)issues.branch='Choose a possible reply to practise with.';if(!d.move)issues.move='Choose a next move, including a pause if that fits.';need('reply',d.reply,'Keep or edit the practice reply so it sounds like you.');}
 }else{
  if(step===1){need('question',d.question,'Name the choice you want to explore.');need('option-a',d.options.a,'Give the first path a name.');need('option-b',d.options.b,'Give the second path a name.');const seen=new Set();for(const [key,label]of Object.entries(d.options)){if(label&&seen.has(label.toLowerCase()))issues['option-'+key]='Give each possibility a different name.';seen.add(label.toLowerCase());}}
  if(step===2&&!d.values.length)issues.values='Choose at least one priority; up to three is enough.';
  if(step===4){if(!d.chosen||!d.options[d.chosen])issues.chosen='Choose the path you want to learn more about.';need('unknown',d.unknown,'Name one thing the experiment could help you learn.');need('experiment',d.experiment,'Make the experiment a small, concrete action.');need('cue',d.cue,'Choose a time or a simple cue to begin.');need('limit',d.limit,'Set a limit, so this stays a small experiment.');}
 }
 return issues;
}
export function reachableStudioStep(kind,draft){for(let i=1;i<draft.step;i++)if(Object.keys(studioIssues(kind,draft,i)).length)return i;return draft.step;}
export function remapStudioValues(input,next){const d=normaliseStudioDraft('possibility-studio',input),result=normaliseStudioDraft('possibility-studio',{...d,values:next});for(const key of ['a','b','c'])result.ratings[key]=result.values.map(v=>{const i=d.values.findIndex(old=>old.label===v.label);return i<0?null:d.ratings[key][i];});return result;}
export function comparePossibilities(input){
 const d=normaliseStudioDraft('possibility-studio',input),total=d.values.reduce((n,v)=>n+v.weight,0);
 const options=Object.entries(d.options).filter(([,label])=>label).map(([id,label])=>{let sum=0,known=0;d.values.forEach((v,i)=>{const r=d.ratings[id][i];if(r!==null){sum+=v.weight*r;known+=v.weight;}});return {id,label,score:known?Math.round(sum/known*20):null,coverage:total?known/total:0};});
 const complete=!!total&&options.length>=2&&options.every(o=>o.coverage===1),sorted=[...options].sort((a,b)=>(b.score??-1)-(a.score??-1));
 return {options,complete,leader:complete&&sorted[0].score>sorted[1].score?sorted[0].id:null,tied:complete&&sorted[0].score===sorted[1].score};
}
const sentence=s=>{const value=String(s||'').trim();return value?/[.!?]$/.test(value)?value:value+'.':'';};
export function bridgeOpening(input){
 const d=normaliseStudioDraft('human-bridge',input),intent=d.intention==='repair'?'I’d like to talk about what happened and see what can be repaired. ':d.intention==='boundary'?'I want to express a limit I need. ':'',start=d.tone==='warm'?'I care about how we get along. ':d.tone==='firm'?'I want to be clear about something important to me. ':'';
 return `${start}${intent}When ${d.observation.replace(/[.!?]+$/,'')}, ${sentence(d.impact)} What matters to me is ${sentence(d.need)} ${sentence(d.request)}`.trim();
}
export const BRIDGE_REPLIES={open:'“I hadn’t understood it that way. Tell me more.”',defensive:'“That isn’t how I see it.”','not-now':'“I can’t talk about this right now.”'};
export function bridgeResponse(input,move=input.move){
 const d=normaliseStudioDraft('human-bridge',input);
 if(move==='pause')return d.branch==='not-now'?'Okay. We can pause. Is there a better time, if you want to talk?':'I’d like to pause here. We can decide later whether to return to this.';
 if(move==='listen')return d.branch==='not-now'?'I hear that now isn’t a good time. What would work better for you?':'I want to understand your view. What feels different from your side?';
 return `We may see it differently. What I’m asking is: ${sentence(d.request)} Is that something we can discuss?`;
}
export function keepStudioCard(studios,kind,draft,now=Date.now()){
 if(!STUDIO_IDS.includes(kind))throw Error('Choose a real studio.');
 const s=normaliseStudios(studios),d=normaliseStudioDraft(kind,{...draft,savedAt:now,updatedAt:now});
 for(let step=1;step<STUDIO_STEPS[kind].length-1;step++)if(Object.keys(studioIssues(kind,d,step)).length)throw Error('Finish the useful parts of your card before saving.');
 if(!d.id)throw Error('A card needs an identity.');
 return normaliseStudios({...s,drafts:{...s.drafts,[kind]:d},cards:[...s.cards.filter(c=>c.draft.id!==d.id),{kind,draft:d}]});
}
export function studioCardText(kind,input){
 const d=normaliseStudioDraft(kind,input);
 if(kind==='mind-unfold')return `HUMAN WITHIN · MIND UNFOLD\n\n${THOUGHT_LANES.map(l=>l.name.toUpperCase()+'\n'+(d.thoughts.filter(t=>t.lane===l.id).map(t=>'• '+t.text).join('\n')||'Nothing here right now.')).join('\n\n')}\n\nONE USEFUL MOVE\n${d.action}\n\nWHEN\n${d.cue}\n`;
 if(kind==='human-bridge')return `HUMAN WITHIN · HUMAN BRIDGE\n\nWITH\n${d.person}\n\nMY OPENING\n${bridgeOpening(d)}\n\nA SCRIPTED POSSIBILITY TO PRACTISE\n${BRIDGE_REPLIES[d.branch]||''}\n\nMY NEXT LINE\n${d.reply}\n\nA TIME THAT FITS\n${d.timing||'Choose a suitable time together.'}\n\nThese are practice words, not a prediction of another person.\n`;
 const comparison=comparePossibilities(d);
 return `HUMAN WITHIN · POSSIBILITY STUDIO\n\nMY QUESTION\n${d.question}\n\nWHAT MATTERS\n${d.values.map(v=>`${v.label} · importance ${v.weight}/5`).join('\n')}\n\nMY OWN RATINGS\n${comparison.options.map(o=>`${o.label}: ${o.score===null?'Unknown':o.score+'/100'} · ${Math.round(o.coverage*100)}% of priorities rated`).join('\n')}\nScores reflect only my ratings and weights, not predictions or recommendations.\n\nTHE PATH I WANT TO EXPLORE\n${d.options[d.chosen]||''}\n\nWHAT I WANT TO LEARN\n${d.unknown}\n\nMY SMALL EXPERIMENT\n${d.experiment}\n\nWHEN\n${d.cue}\n\nMY LIMIT\n${d.limit}\n\nAFTER TRYING\n${d.attempted==='yes'?'Tried':d.attempted==='not-yet'?'Not yet':'Not reviewed'}\n${d.learning}\n`;
}
export const STUDIO_EXAMPLES={
 'mind-unfold':{input:'I keep thinking about the unfinished presentation.\nI don’t know when my friend is free.\nI need a quiet evening.\nI want to ask for help with the weekend plans.'},
 'human-bridge':{person:'A teammate',intention:'request',observation:'the meeting time changes at the last minute',impact:'I find it hard to plan my work',need:'enough notice to prepare',request:'Could we agree changes a day ahead when possible?'},
 'possibility-studio':{question:'How could I make room for a creative project?',options:{a:'A short weekend session',b:'Ten minutes on three evenings',c:'A shared session with a friend'},values:[{label:'Creativity',weight:5},{label:'Rest',weight:4},{label:'Connection',weight:2}]}
};
