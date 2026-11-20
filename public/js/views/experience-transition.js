import {discoveryMeta} from '../discovery-meta.js';
import {cinemaSound} from '../cinema-sound.js';
import { h, mount, icon, svgEl } from '../ui.js';
import { productById, art } from '../catalogue.js';
import { EXPERIENCE_CHAPTERS, chapterFor, experienceNeighbours, EXPERIENCE_INVITATIONS } from '../experience-flow.js';
import { experienceIdentity, experiencePoster } from '../experience-identity.js';

export function flowBreadcrumbs(id){
  const chapter=chapterFor(id);
  return h('nav',{class:'flow-breadcrumbs','aria-label':'The experience path'},EXPERIENCE_CHAPTERS.map((c,i)=>h('a',{href:`#/home/${c.id}`,class:c===chapter?'current':'','aria-current':c===chapter?'step':null},h('span',{},String(i+1).padStart(2,'0')),c.word)));
}
export function experienceLinks(id){
  const {previous,next}=experienceNeighbours(id);
  const link=(target,label)=>target&&h('a',{href:`#/product/${target}`},label);
  return h('nav',{class:'media-journey','aria-label':'Continue exploring'},
    link(previous,previous&&`Back to ${productById(previous).title}`),
    link(next,next&&`Explore next · ${productById(next).title}`),
    h('a',{href:'#/home'},'All experiences'));
}

export function productBridge(id){
  const {previous,next}=experienceNeighbours(id),r=productById(next),p=productById(previous);
  return h('section',{class:'product-bridge'},h('div',{class:'bridge-copy'},h('p',{class:'eyebrow'},r?'A NATURAL NEXT STEP':'THE PATH LEAVES ROOM FOR YOU'),h('h2',{},r?EXPERIENCE_INVITATIONS[r.id]:'Return whenever you need a little space.'),h('p',{},'These are invitations. Every experience is open, and your own pace is enough.')),
    h('div',{class:'bridge-links'},r&&h('a',{class:'bridge-next',href:`#/product/${r.id}`,style:{'--tile':r.color,'--tile-ink':r.ink}},h('span',{class:'bridge-art','aria-hidden':'true',style:{'--bridge-page':experienceIdentity(r.id)?.page||r.color}},svgEl(experiencePoster(r.id)||art(r.art,r.color,r.ink,r.id))),h('span',{},h('small',{},'Explore next'),h('strong',{},r.title)),icon('arrow',20)),p&&h('a',{class:'quiet-link',href:`#/product/${p.id}`},icon('back',16),p.title),h('a',{class:'quiet-link',href:`#/home/${chapterFor(id)?.id||'stillness'}`},'All experiences',icon('arrow',16))));
}
export function renderExperienceTransition(root,{id,title,nextPractice},ctx){
  cinemaSound.cue('complete');const current=productById(id),next=productById(experienceNeighbours(id).next),discovery=discoveryMeta(id),world=experienceIdentity(id)||(discovery?{...discovery,rgb:discovery.accent.slice(1).match(/../g).map(x=>parseInt(x,16)).join(',')}:null);ctx.setHue(current?.hue||160);
  const page=h('section',{class:`experience-rest ${world?'premium-rest':''}`,style:world?{'--world-page':world.page,'--world-accent':world.accent,'--world-rgb':world.rgb}:{}},h('div',{class:'rest-art','aria-hidden':'true'},svgEl(experiencePoster(id)||art(current.art,current.color,current.ink,current.id))),h('p',{class:'eyebrow'},current.title),h('h1',{class:'display'},'Let that stay',h('br'),h('em',{},'with you.')),h('p',{class:'lede'},title?`“${title}” has a place in your space. You can stay with this experience or follow another thread.`:'There is nothing else you need to complete. Stay here a moment, return to this world, or follow another thread.'),
    nextPractice&&h('a',{class:'btn primary',href:nextPractice.to},'Continue this experience',icon('arrow',18)),
    next&&h('a',{class:`rest-next ${nextPractice?'':'primary-next'}`,href:`#/product/${next.id}`},h('span',{},h('small',{},'A gentle next invitation'),h('strong',{},next.title)),icon('arrow',21)),
    h('div',{class:'rest-actions'},h('a',{class:'quiet-link',href:`#/product/${id}`},'Back to this experience'),h('a',{class:'quiet-link',href:`#/home/${chapterFor(id)?.id||'stillness'}`},'Return to all experiences',icon('arrow',16))));
  mount(root,page);page.querySelector('h1').setAttribute('tabindex','-1');page.querySelector('h1').focus({preventScroll:true});
}
