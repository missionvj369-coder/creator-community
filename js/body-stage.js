import {h,mount,svgEl} from './ui.js?v=18214deeb83d6066';
import {mechanismSVG} from './body-art.js?v=18214deeb83d6066';
import {processFor,processStepAt} from './body-processes.js?v=18214deeb83d6066';

const focusable=new Set(['balance','neuron','reflex','brainFlow','eye','heart','vessels','marrow','clot','lungs','alveoli','gut','pancreas','liver','nephron','urinary','bone','joint','muscle','skin','lymph','immune','hormones','uterus','fertilisation','placenta','sleep','nutrition']);
const closeByDefault=new Set(['brainFlow','eye','heart','vessels','clot','lungs','alveoli','gut','pancreas','liver','nephron','urinary','lymph','immune','hormones','uterus','fertilisation','placenta','sleep','nutrition']);
export function createBodyStage({onSelect=()=>{},onInteract=()=>{}}={}){
 let viewer=null,closed=false,kind='cell',mode='anatomy',focused=false,whole=false,moving=true,sliced=false,expanded=false,step=0,elapsed=0,playing=false,last=performance.now();
 const status=h('span',{class:'anatomy-load',role:'status'},'Preparing reference anatomy…');
 const source=h('span',{class:'anatomy-source'},'HUMAN REFERENCE ATLAS · REFERENCE ANATOMY');
 const host=h('div',{class:'anatomy-host'},h('img',{class:'anatomy-poster',src:'/anatomy/reference-body.webp',alt:'Reference human body with brain, heart, lungs, digestive and urinary organs.'}));
 const process=h('section',{class:'body-function-panel','aria-label':'How this system works'});
 const filmCaption=h('div',{class:'anatomy-film-caption','aria-hidden':'true'},h('span',{},'THE LIVING BOOK'),h('h2',{},'The world within you.'));
 const anatomyButton=h('button',{'aria-pressed':'true',onclick:()=>setMode('anatomy')},'Anatomy');
 const processButton=h('button',{'aria-pressed':'false',onclick:()=>setMode('process')},'How it works');
 const expandButton=h('button',{class:'anatomy-expand','aria-pressed':'false','aria-label':'Enter cinema view',onclick:()=>{interact();expanded=!expanded;updateExpanded();updateViewer();}},'Cinema view');
 const focusButton=h('button',{'aria-pressed':'false',onclick:()=>{interact();focused=!focused;whole=false;updateViewer();}},'Focus organ');
 const wholeButton=h('button',{'aria-pressed':'false',onclick:()=>{interact();whole=!whole;focused=false;updateViewer();}},'Full body');
 const sliceButton=h('button',{'aria-pressed':'false',disabled:true,onclick:()=>{interact();sliced=!sliced;sliceButton.setAttribute('aria-pressed',String(sliced));viewer?.setSlice(sliced);}},'Look inside');
 const skin=h('input',{type:'range',min:0,max:70,value:19,'aria-label':'Skin visibility',oninput:e=>{interact();viewer?.setSkin(+e.target.value/100);}});
 const orientation=h('div',{class:'anatomy-orientation'},h('button',{'aria-label':'Turn the body left',onclick:()=>viewer?.turn(-1)},'↶'),h('button',{'aria-label':'View the body from the front',onclick:()=>viewer?.face(false)},'Front'),h('button',{'aria-label':'View the body from the back',onclick:()=>viewer?.face(true)},'Back'),h('button',{'aria-label':'Turn the body right',onclick:()=>viewer?.turn(1)},'↷'));
 const el=h('section',{class:'body-scene reference-stage',dataset:{visual:'anatomy'}},h('div',{class:'body-visual-tabs','aria-label':'Choose a visual presentation'},anatomyButton,processButton,expandButton),host,filmCaption,process,h('div',{class:'anatomy-toolbar'},focusButton,wholeButton,sliceButton,h('label',{},'Skin',skin)),orientation,h('div',{class:'anatomy-caption'},source,status));
 import('./body-viewer.js?v=18214deeb83d6066').then(async({createAnatomyViewer})=>{
  if(closed)return;
  const instance=await createAnatomyViewer(host,{onSelect,onInteract:interact,onReady:({source:credit,type,software})=>{
   source.textContent=credit==='BodyParts3D'?'BODYPARTS3D · REFERENCE ANATOMY':'HUMAN REFERENCE ATLAS · REFERENCE ANATOMY';
   status.textContent=type==='uterus'?'Separate female reference view':type==='lymph'?'Lymph node · magnified view':kind==='muscle'?'Skeleton context · muscle function in How it works':software?'Lightweight 3D · drag to turn':'Drag to turn · pinch to zoom';
  },onError:error=>{console.warn('Anatomy renderer:',error);status.textContent='Reference image · explore How it works';}});
  if(closed){instance.destroy();return;}viewer=instance;updateViewer();
 }).catch(error=>{console.warn('Anatomy module:',error);status.textContent='Reference image · explore How it works';});
 function interact(){pause();onInteract();}
 function updateExpanded(){const page=el.closest('.body-atlas');page?.classList.toggle('anatomy-expanded',expanded);page?.setAttribute('data-visual',mode);el.dataset.cinema=String(expanded);expandButton.textContent=expanded?'Read & explore':'Cinema view';expandButton.setAttribute('aria-pressed',String(expanded));expandButton.setAttribute('aria-label',expanded?'Return to reading view':'Enter cinema view');}
 function updateViewer(){
  const liveHeart=mode==='process'&&kind==='heart',separate=['uterus','fertilisation','placenta','lymph'].includes(kind);focusButton.disabled=!focusable.has(kind)||separate;wholeButton.disabled=separate;focusButton.textContent=focused?'Body context':'Focus organ';focusButton.setAttribute('aria-pressed',String(focused));wholeButton.textContent=whole?'Upper body':'Full body';wholeButton.setAttribute('aria-pressed',String(whole));sliceButton.disabled=!focused;
  viewer?.setState({kind,focused:liveHeart||focused,whole,cinema:expanded,moving:moving&&(mode==='anatomy'||liveHeart)});viewer?.setSlice(liveHeart||sliced);viewer?.setStep(liveHeart?step:null);
 }
 function setMode(next){interact();mode=next;elapsed=0;step=0;playing=mode==='process'&&moving;el.dataset.visual=mode;anatomyButton.setAttribute('aria-pressed',String(mode==='anatomy'));processButton.setAttribute('aria-pressed',String(mode==='process'));updateExpanded();paint();updateViewer();}
 function paint(){
  if(host.parentElement!==el)el.insertBefore(host,process);
  const spec=processFor(kind),current=spec.steps[step],liveHeart=mode==='process'&&kind==='heart';
  let art;
  if(liveHeart)art=h('div',{class:'body-function-art real-organ','aria-label':'Reference heart chambers and valves. The current route is highlighted in gold.'});
  else{const svg=svgEl(mechanismSVG(kind));svg.setAttribute('aria-label',`${spec.title}. ${current.label}. ${current.text}`);art=h('div',{class:'body-function-art'},svg);}
  mount(process,h('div',{class:'body-function-title'},h('p',{class:'body-eyebrow'},liveHeart?'INSIDE THE REFERENCE HEART':'FOLLOW THE PROCESS'),h('h2',{},spec.title)),art,
   h('nav',{class:'body-function-steps','aria-label':'Process steps'},spec.steps.map((s,i)=>h('button',{'aria-current':step===i?'step':null,'aria-label':`Step ${i+1}: ${s.label}`,onclick:()=>{interact();step=i;elapsed=i*6;paint();}},h('span',{},String(i+1).padStart(2,'0')),s.label))),
   h('div',{class:'body-function-copy',role:'status'},h('span',{},`STEP ${step+1} OF ${spec.steps.length}`),h('h3',{},current.label),h('p',{},current.text)),
   h('div',{class:'body-function-controls'},h('button',{disabled:step===0,onclick:()=>{interact();step--;elapsed=step*6;paint();}},'← Previous step'),h('button',{'aria-label':playing?'Pause the process':'Play the process',onclick:()=>{const was=playing;interact();if(step===spec.steps.length-1&&!was){step=0;elapsed=0;}playing=!was;paint();}},playing?'Pause':step===spec.steps.length-1?'Replay':'Play'),h('button',{disabled:step===spec.steps.length-1,onclick:()=>{interact();step++;elapsed=step*6;paint();}},'Next step →')),
   h('p',{class:'body-function-note'},liveHeart?'Reference anatomy · route highlights and timing are illustrative':'Illustrative sequence · timings are not measurements'));
  if(liveHeart){art.append(host);viewer?.setStep(step);}
  for(const svg of process.querySelectorAll('svg'))try{moving&&playing?svg.unpauseAnimations?.():svg.pauseAnimations?.();}catch{}
 }
 function pause(){if(playing){playing=false;paint();}}
 const timer=setInterval(()=>{const now=performance.now(),dt=Math.min(1,(now-last)/1000);last=now;if(closed||document.hidden||mode!=='process'||!playing)return;elapsed+=dt;const count=processFor(kind).steps.length,next=processStepAt(elapsed,count);if(next!==step){step=next;paint();}if(elapsed>=count*6){playing=false;paint();}},250);
 const visibility=()=>{if(document.hidden)pause();updateViewer();};document.addEventListener('visibilitychange',visibility);
 paint();
 return {el,pause,update({kind:next,moving:motion,title,chapter}={}){
  if(motion!==undefined){moving=motion;if(!moving)pause();}
  if(next&&next!==kind){kind=next;focused=closeByDefault.has(kind);whole=false;sliced=false;step=0;elapsed=0;playing=mode==='process'&&moving;sliceButton.setAttribute('aria-pressed','false');viewer?.setSlice(false);paint();}
  if(title)filmCaption.querySelector('h2').textContent=title;if(chapter)filmCaption.querySelector('span').textContent=chapter;updateViewer();updateExpanded();
 },destroy(){if(closed)return;closed=true;clearInterval(timer);document.removeEventListener('visibilitychange',visibility);viewer?.destroy();}};
}
