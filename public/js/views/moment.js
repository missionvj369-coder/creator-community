import { h, mount, icon, svgEl } from '../ui.js';
import { SITUATIONS, situationById, productById, art } from '../catalogue.js';
import { space, trackActivity, rememberItem, preferredMoments } from '../personal.js';
export function renderMoment(root,{id},ctx){
  const chosen=situationById(id);
  if(!chosen)return chooseMoment(root,ctx);
  const minutes=space().minutes,s=chosen;let step=0,started=false,activity=null,timer=null,remaining=minutes*60,ended=false,outcome=null;
  ctx.setHue(160);
  const content=h('div',{class:'moment-content'}),dots=h('div',{class:'moment-steps','aria-label':'Three small steps'}),clock=h('span',{class:'moment-clock'},`${minutes}:00`);
  const wrap=h('div',{class:'moment-experience',style:{'--tile':s.color,'--tile-ink':s.ink}},h('header',{class:'moment-header'},h('button',{class:'icon-btn','aria-label':'Back to home',onclick:()=>ctx.go('#/home')},icon('back',21)),h('span',{},'YOUR MOMENT · '+s.label.toUpperCase()),clock),h('div',{class:'moment-stage'},h('div',{class:'moment-illustration','aria-hidden':'true'},svgEl(art(s.icon,s.color,s.ink,s.id))),content),dots);
  mount(root,wrap);
  const leave=()=>{clearInterval(timer);if(!ended)activity?.finish(false);};wrap.addEventListener('ugt:leave',leave);
  function paint(){
    mount(dots,[0,1,2].map(n=>h('span',{class:n<=step?'on':''},h('i'),['Arrive','Try','Carry'][n])));
    if(!started){mount(content,h('p',{class:'eyebrow'},s.label),h('h1',{class:'display'},s.title),h('p',{class:'lede'},s.intro),h('p',{class:'moment-description'},`Three small steps. About ${minutes} minutes. Go at your own pace.`),h('button',{class:'btn primary',onclick:begin},'Begin this moment',icon('arrow',18)));return;}
    const steps=[{title:'Arrive as you are.',text:'Let your hands soften. Notice the support beneath you and one ordinary detail around you. There is nothing you have to get right.'},{title:s.label+'.',text:s.action},{title:'Take one small thing with you.',text:carry(s.id)}];const current=steps[step];
    mount(content,h('p',{class:'eyebrow'},`0${step+1} / 03 · ${['ARRIVE','TRY','CARRY'][step]}`),h('h1',{class:'display'},current.title),h('p',{class:'moment-instruction'},current.text),h('div',{class:'moment-buttons'},step>0&&h('button',{class:'btn ghost',onclick:()=>{step--;paint();}},'Back'),h('button',{class:'btn primary',onclick:()=>{if(step<2){step++;paint();}else finish();}},step<2?'I’m ready':'Keep this moment',icon(step<2?'arrow':'check',18))),h('p',{class:'moment-permission'},'Your pace matters more than the timer.'));
  }
  function begin(){started=true;rememberItem({route:`#/moment/${s.id}`,title:s.label,kind:'Moment'});activity=trackActivity({route:`#/moment/${s.id}`,title:s.label,kind:'Moment'});timer=setInterval(()=>{if(!wrap.isConnected)return clearInterval(timer);if(document.hidden)return;remaining=Math.max(0,minutes*60-activity.seconds());clock.textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;},1000);paint();}
  function finish(){clearInterval(timer);ended=true;activity.finish(true);const r=productById(s.products[0]);
    mount(content,h('p',{class:'eyebrow'},'YOU MADE A LITTLE SPACE'),h('h1',{class:'display'},'Small can be enough.'),h('p',{class:'lede'},'Take the useful part into your day. You can return whenever you need another moment.'),h('div',{class:'moment-buttons'},h('a',{class:'btn primary',href:'#/home'},'Back to my day',icon('check',18)),h('a',{class:'quiet-link',href:`#/product/${r.id}`},`Explore ${r.title}`,icon('arrow',16))));mount(dots,h('span',{class:'moment-complete'},icon('check',17),'Saved in your space'));
  }
  paint();
}
export function chooseMoment(root,ctx){
 ctx.setHue(160);let expanded=false;
 const ids=preferredMoments(),ordered=[...SITUATIONS].sort((a,b)=>(ids.includes(a.id)?ids.indexOf(a.id):99)-(ids.includes(b.id)?ids.indexOf(b.id):99));
 const grid=h('div',{class:'moment-choice-grid'}),more=h('button',{class:'quiet-link more-moments','aria-expanded':'false',onclick:()=>{expanded=!expanded;paint();}});
 function paint(){mount(grid,(expanded?ordered:ordered.slice(0,4)).map(s=>h('a',{class:'moment-choice',href:`#/moment/${s.id}`,style:{'--tile':s.color,'--tile-ink':s.ink}},h('div',{class:'moment-choice-art'},svgEl(art(s.icon,s.color,s.ink,s.id))),h('div',{},h('h2',{},s.label),h('p',{},s.title)),icon('arrow',18))));more.setAttribute('aria-expanded',String(expanded));more.replaceChildren(expanded?'Show fewer choices':'More situations',icon('arrow',16));}
 mount(root,h('section',{class:'page hub-page moment-picker rise'},h('a',{class:'back-link',href:'#/home'},icon('back',16),'Home'),h('div',{class:'page-intro'},h('p',{class:'eyebrow'},'START WITH WHAT YOU NEED'),h('h1',{class:'display'},'One useful moment.'),h('p',{class:'lede'},'Choose what feels close. We’ll take it one step at a time.')),grid,more));paint();
}

const carry=id=>({focus:'Before the next task, close one competing tab. Give the first small step a clear place to begin.',sleep:'Choose one thing that can wait until tomorrow. Let this be a point where the day can soften.',alone:'Let one small act of connection be enough: a hello, a kind message, or a few minutes in a welcoming place.',parent:'Bring curiosity to one ordinary exchange with your child. Listen for the experience behind the behaviour.',ai:'Before your next request, write the result you actually need in one plain sentence.',stuck:'Choose one familiar cue and one slightly different response. Make that response easy to try.',comparison:'Name one action that matters even if nobody sees it. Let that be your next step.',morning:'Choose one useful thing for today. Leave room for the day to unfold around it.',body:'Let one ordinary sensation remind you to meet a need: comfort, movement, food, water, or rest.',meaning:'Keep the question that interested you. A question can stay open while you live your day.',tired:'Meet the small need you noticed. Rest and care can be ordinary parts of the day.',racing:'When the next thought pulls at you, feel your feet and return to one thing you can see.'}[id]||'Choose one small part of this moment to carry into the next ordinary thing you do.');
