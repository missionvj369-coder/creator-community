// A guided loop with transparent suggestions using the person's choices and reports.
export const SIGNALS=[
 {id:'overloaded',label:'Too much in my head',short:'Overloaded',method:'untangle',description:'Separate what happened from what you are carrying.'},
 {id:'stuck',label:'I keep putting something off',short:'Stuck',method:'step',description:'Find a beginning small enough for today.'},
 {id:'deciding',label:'I have a choice to make',short:'At a crossroads',method:'choice',description:'Compare what matters and test what you can.'},
 {id:'connection',label:'Something between me and someone',short:'A conversation',method:'conversation',description:'Turn what matters into words you can use.'},
 {id:'depleted',label:'I have very little to give',short:'Low capacity',method:'step',description:'Make room for a small, practical act of care.'}
];
export const DOMAINS=[['work','Work or learning'],['people','Relationships'],['self','My inner life'],['daily','Everyday life']];
export const METHODS={
 untangle:{name:'Untangle',verb:'Find the useful thread',description:'A fact, a thought, and the part you can influence.',icon:'realms'},
 choice:{name:'Choice Lab',verb:'Make room for a choice',description:'Two options. Your priorities. A small way to learn.',icon:'path'},
 conversation:{name:'Conversation Studio',verb:'Find your words',description:'What happened, what you need, and one clear request.',icon:'you'},
 step:{name:'Small Step',verb:'Make the beginning smaller',description:'Build an action around the energy you actually have.',icon:'sparkle'}
};
export const STAGES=['signal','work','plan','live','review','done'];
export const STAGE_LABELS={signal:'Understand',work:'Make space',plan:'Choose a step',live:'Try it in life',review:'Notice',done:'Keep the learning'};
const txt=(v,n=600)=>String(v??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,n);
const num=(v,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(Number(v))?Math.max(0,Math.min(max,Number(v))):0;
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const pick=(v,values,fallback)=>values.includes(v)?v:fallback;
const KEYS=['fact','story','influence','need','optionA','optionB','priority','unknown','choice','observation','feeling','request','tone','script','task','tiny','care'];
export function normaliseThread(input){
 const t=obj(input),c=obj(t.checkin),w=obj(t.work),p=obj(t.plan),r=obj(t.review);
 const id=txt(t.id,90);if(!/^[a-zA-Z0-9-]+$/.test(id))return null;
 return {id,parentId:txt(t.parentId,90),createdAt:num(t.createdAt),updatedAt:num(t.updatedAt),closedAt:num(t.closedAt),stage:pick(t.stage,STAGES,'signal'),seconds:num(t.seconds,86400),
 checkin:{signal:pick(c.signal,SIGNALS.map(s=>s.id),''),domain:pick(c.domain,DOMAINS.map(d=>d[0]),''),capacity:pick(c.capacity,['low','steady','ready'],''),minutes:[2,5,10].includes(+c.minutes)?+c.minutes:2,topic:txt(c.topic,180),cursor:Math.floor(num(c.cursor,1))},
 method:pick(t.method,Object.keys(METHODS),''),work:{...Object.fromEntries(KEYS.map(k=>[k,txt(w[k],k==='script'?3000:600)])),cursor:Math.floor(num(w.cursor,2)),reversible:pick(w.reversible,['yes','no','unsure'],''),aFit:num(w.aFit,5),aDoable:num(w.aDoable,5),bFit:num(w.bFit,5),bDoable:num(w.bDoable,5)},
 plan:{action:txt(p.action,280),cue:txt(p.cue,240),friction:txt(p.friction,240),fallback:txt(p.fallback,240),minutes:[1,2,5,10].includes(+p.minutes)?+p.minutes:2,startedAt:num(p.startedAt)},
 review:{attempted:pick(r.attempted,['yes','no'],''),outcome:pick(r.outcome,['helped','same','harder'],''),barrier:txt(r.barrier,120),observation:txt(r.observation,600)}};
}
export function normaliseJourney(input={}){
 const j=obj(input),seen=new Set();const threads=(Array.isArray(j.threads)?j.threads:[]).map(normaliseThread).filter(t=>t&&!seen.has(t.id)&&seen.add(t.id)).slice(-100);
 return {v:1,activeId:threads.some(t=>t.id===j.activeId&&t.stage!=='done')?j.activeId:null,threads};
}
export function createThread({id,now=Date.now(),minutes=2,parent=null}={}){
 const t=normaliseThread({id,createdAt:now,updatedAt:now,stage:'signal',checkin:{minutes},parentId:parent?.id});if(!t)throw Error('A valid thread ID is required.');
 if(parent){t.checkin={...parent.checkin,cursor:0};if(parent.review.outcome==='helped'){t.method=parent.method;t.work={...parent.work,cursor:0};t.plan={...parent.plan,startedAt:0};}else{t.method=parent.review.attempted==='no'?parent.method:'';t.work={...parent.work,cursor:0};t.plan={...parent.plan,action:parent.plan.fallback||parent.plan.action,startedAt:0};}}
 return t;
}
export function recommendMethod(thread,journey={}){
 const t=normaliseThread(thread),s=SIGNALS.find(x=>x.id===t?.checkin.signal);if(!t||!s)return {method:'untangle',reason:'Start by naming what is happening.'};
 if(t.checkin.capacity==='low'&&s.id!=='connection')return {method:'step',reason:'You chose low capacity. Start with something manageable before asking more of yourself.'};
 const parent=normaliseJourney(journey).threads.find(x=>x.id===t.parentId&&x.stage==='done');
 if(parent?.review.attempted==='yes'&&parent.review.outcome!=='helped'){const method=parent.method==='untangle'?'step':'untangle';return {method,reason:`You reported that ${METHODS[parent.method]?.name||'the last approach'} ${parent.review.outcome==='harder'?'felt harder':'did not bring a clear shift'}. Try ${METHODS[method].name} as a different doorway.`};}
 const related=normaliseJourney(journey).threads.filter(x=>x.stage==='done'&&x.checkin.signal===s.id&&x.checkin.capacity===t.checkin.capacity&&x.review.attempted==='yes');
 const counts=Object.keys(METHODS).map(method=>({method,items:related.filter(x=>x.method===method)})).map(x=>({...x,helped:x.items.filter(t=>t.review.outcome==='helped').length}));
 const learned=counts.filter(x=>x.items.length>=3&&x.helped/x.items.length>=2/3).sort((a,b)=>b.helped/b.items.length-a.helped/a.items.length)[0];
 if(learned)return {method:learned.method,reason:`In ${learned.helped} of ${learned.items.length} similar situations, you reported that ${METHODS[learned.method].name} helped. You can choose another route.`};
 return {method:s.method,reason:s.description};
}
export function stageError(thread,stage=thread.stage){
 const t=normaliseThread(thread);if(!t)return 'This thread could not be read.';const {checkin:c,work:w,plan:p,review:r}=t;
 if(stage==='signal'&&(!c.signal||!c.domain||!c.capacity||!c.topic))return 'Choose what is happening, where it belongs, your capacity, and a few words about the situation.';
 if(stage==='work'){
 if(!t.method)return 'Choose a way to work with this.';
 if(t.method==='untangle'&&(!w.fact||!w.influence))return 'Add what you know happened and one thing within your influence.';
 if(t.method==='choice'&&(!w.optionA||!w.optionB||!w.priority||!w.reversible||!w.choice||!w.aFit||!w.aDoable||!w.bFit||!w.bDoable))return 'Add both options, your priority, your ratings, and the next direction you want to explore.';
 if(t.method==='conversation'&&(!w.observation||!w.need||!w.request))return 'Add a specific observation, what you need, and one request.';
 if(t.method==='step'&&(!w.task||!w.tiny))return 'Name what needs attention and a smaller version you could try.';
 }
 if(stage==='plan'&&(!p.action||!p.cue||!p.fallback))return 'Add one action, when you will try it, and an easier fallback.';
 if(stage==='review'&&(!r.attempted||(r.attempted==='yes'&&!r.outcome)||(r.attempted==='no'&&!r.barrier)))return 'Tell us whether you tried it, then choose what happened.';return '';
}
export function advanceThread(thread,now=Date.now()){
 const t=normaliseThread(thread),error=stageError(t);if(error)throw Error(error);if(t.stage==='live')throw Error('Choose whether you tried the step before reflecting.');if(t.stage==='done')return t;
 t.stage=STAGES[STAGES.indexOf(t.stage)+1];t.updatedAt=now;if(t.stage==='live')t.plan.startedAt=now;if(t.stage==='done')t.closedAt=now;return t;
}
export function draftScript(work){const w=obj(work),fact=txt(w.observation),need=txt(w.need),request=txt(w.request),feeling=txt(w.feeling);if(w.tone==='direct')return `I want to talk about this: ${fact}\n\n${feeling?`I feel ${feeling}. `:''}What matters to me is ${need}.\n\nMy request is: ${request}`;return `Could we make a little space to talk? I noticed: ${fact}\n\n${feeling?`I have been feeling ${feeling}. `:''}I would like us to make room for ${need}.\n\nWould you be open to this: ${request}`;}
export function suggestAction(thread){const t=normaliseThread(thread),w=t.work;if(t.method==='untangle')return w.influence;if(t.method==='conversation')return 'Choose a suitable time and ask if we can talk for a few minutes.';if(t.method==='choice'){if(w.choice==='learn'||w.reversible!=='yes')return w.unknown?`Find out: ${w.unknown}`:'Write one question whose answer would help me choose, then find who or what could answer it.';return `Try a small version of: ${w.choice==='a'?w.optionA:w.optionB}`;}return w.tiny;}
export function suggestFallback(thread){const t=normaliseThread(thread);return ({untangle:'Write down the first part of my action; leave the rest for later.',choice:'Write one question I need answered before the next step.',conversation:'Keep my draft and choose a better time to ask.',step:t.checkin.signal==='depleted'?'Make one small adjustment for comfort where I am.':'Set out the first thing I need, without doing the whole task.'})[t.method]||'Make my step smaller and choose another time.';}
export function nextMove(thread){const r=thread.review;if(r.attempted==='no')return {title:'Make the doorway smaller.',text:`Your step did not happen${r.barrier?`: ${r.barrier.toLowerCase()}`:'.'}. Keep the useful intention and try the easier version.`,label:'Build a smaller attempt',kind:'smaller'};if(r.outcome==='helped')return {title:'Keep what worked.',text:'You noticed a useful shift. You can reuse this approach in the same situation, or start with something new.',label:'Use what worked again',kind:'repeat'};return {title:r.outcome==='harder'?'Give yourself a different route.':'A result is something to learn from.',text:'This attempt did not give you the shift you wanted. Change the approach or reduce the demand, using what you noticed.',label:'Try a different route',kind:'different'};}
export function insightsOf(journey){const j=normaliseJourney(journey),reviewed=j.threads.filter(t=>t.stage==='done'),attempts=reviewed.filter(t=>t.review.attempted==='yes');const methods=Object.entries(METHODS).map(([id,m])=>{const records=attempts.filter(t=>t.method===id);return {id,name:m.name,attempts:records.length,helped:records.filter(t=>t.review.outcome==='helped').length,same:records.filter(t=>t.review.outcome==='same').length,harder:records.filter(t=>t.review.outcome==='harder').length};});return {reviewed:reviewed.length,attempted:attempts.length,helped:attempts.filter(t=>t.review.outcome==='helped').length,blocked:reviewed.filter(t=>t.review.attempted==='no').length,methods,ready:attempts.length>=3,latest:reviewed.at(-1)||null};}
export function supportFor(thread){const t=normaliseThread(thread),id=t.checkin.signal;return ({overloaded:{moment:'racing',product:'clarity',line:'A short grounding pause before the next step.'},stuck:{moment:'stuck',product:'loop',line:'A little perspective on familiar loops.'},deciding:{moment:'meaning',product:'mirror',line:'Make room to listen to what matters.'},connection:{moment:'alone',product:'thoughts',line:'A reflection on connection and other people.'},depleted:{moment:'tired',product:'sanctuary',line:'A quiet place to pause.'}})[id]||{moment:'focus',product:'clarity',line:'A little space before you continue.'};}
export function pocketText(thread){const t=normaliseThread(thread);return `HUMAN WITHIN — MY POCKET PLAN\n\n${t.checkin.topic}\n\nMY NEXT STEP\n${t.plan.action}\n\nWHEN\n${t.plan.cue}\n\nROOM TO BEGIN\nAbout ${t.plan.minutes} minute${t.plan.minutes===1?'':'s'}\n\nIF IT IS TOO MUCH\n${t.plan.fallback}\n${t.plan.friction?`\nI MAY RUN INTO\n${t.plan.friction}\n`:''}${t.method==='conversation'?`\nWORDS TO TAKE WITH ME\n${t.work.script||draftScript(t.work)}\n`:''}\nAFTERWARDS\nReturn to Human Within and notice what changed.\n`;}
