import { h, mount, icon, $ } from './ui.js';
import * as S from './store.js';
import { setAura } from './aura.js';
import { drone, silence } from './audio.js';
import { renderToday } from './views/today.js';
import { renderPath } from './views/path.js';
import { renderYou } from './views/you.js';
import { renderReader } from './views/reader.js';
import { renderSession } from './views/session.js';
import { renderWorld } from './views/world.js';
import { renderOnboarding, renderRitual, renderWelcomeVideos } from './views/onboarding.js';
import { renderHome, renderProducts, renderProduct, renderSituations, renderSituation } from './views/hub.js';
import { renderBooks, renderTools, renderBook, renderTool, renderEmbed } from './views/library.js';
import { renderWallpapers } from './views/wallpapers.js';
import { productById } from './catalogue.js';
import { renderMoment, chooseMoment } from './views/moment.js';
import { applyPreferences } from './personal.js';
import { renderGuideHome, renderGuide, renderJourney } from './views/guide.js';
import { renderCollection } from './views/collection.js';

const TABS=[['home','Home','home'],['journey','My journey','path'],['library','Library','book'],['you','You','you']];
let lastTab='#/home',token=0;
const main=()=>$('#main'),overlay=()=>$('#overlay'),chrome=()=>$('#chrome');
const ctx={sky:'day',go:to=>{if(location.hash===to)route();else location.hash=to;},close:fallback=>{leaveOverlay();location.hash=typeof fallback==='string'?fallback:lastTab;},render:()=>route(),refresh:async()=>{try{await S.refresh();}catch{}route();},setHue:hue=>setAura(hue,0),toggleSound(){if(drone.on)drone.stop();else drone.start();paintHeader();}};
function leaveOverlay(){overlay()?.firstElementChild?.dispatchEvent(new Event('ugt:leave'));silence();}
function paintHeader(){
  const seg=location.hash.split('/')[1]||'home',act=['products','product','ebooks','wallpapers','tools','realms'].includes(seg)?'library':['guide','thread','path','today'].includes(seg)?'journey':seg;
  mount($('#nav'),TABS.map(([id,label,ic])=>h('a',{href:`#/${id}`,class:`nav-i ${act===id?'on':''}`,'aria-current':act===id?'page':null},icon(ic,22),h('span',{},label))));
  mount($('#extra-nav'),[['moment','A brief pause','sparkle']].map(([id,label,ic])=>h('a',{href:`#/${id}`,class:`nav-i ${act===id?'on':''}`,'aria-current':act===id?'page':null},icon(ic,20),h('span',{},label))));
  const label={home:'One thing at a time',journey:'Your living journey',guide:'Your next useful move',thread:'Your living thread',library:'The supporting library',products:'The experience collection',ebooks:'The reading room',wallpapers:'The pocket gallery',you:'Your space',today:'Your daily flow',path:'Your journey',tools:'More ways to explore',situations:'Meet your moment',product:'The experience collection',situation:'Meet your moment'}[seg]||'Human Within';$('#top-label').textContent=label;
  mount($('#top-actions'),h('a',{href:'#/guide',class:'icon-btn','aria-label':'Continue my guided journey'},icon('path',20)),h('button',{class:'icon-btn','aria-label':drone.on?'Turn ambient sound off':'Turn ambient sound on','aria-pressed':String(drone.on),onclick:()=>ctx.toggleSound()},icon(drone.on?'sound':'mute',20)));
}
async function route(){
  const my=++token,[,seg,a,b]=location.hash.split('/'),root=overlay();main()?.firstElementChild?.dispatchEvent(new Event('ugt:leave'));leaveOverlay();if(!S.state.ready)return;const c={...ctx,isCurrent:()=>my===token};
  const showOverlay=on=>{root.hidden=!on;main().inert=on;chrome().hidden=on;document.body.classList.toggle('in-experience',on);if(!on)mount(root);};
  try{
    if(!S.state.doc){showOverlay(true);return renderOnboarding(root,c);}
    ctx.sky='day';document.body.dataset.sky='day';
    applyPreferences();
    if(seg==='moment'&&a){showOverlay(true);return renderMoment(root,{id:a},c);}
    if(seg==='welcome'){showOverlay(true);return renderWelcomeVideos(root,c);}
    if(seg==='arrive'){showOverlay(true);return renderRitual(root,c);}
    if(seg==='onboarding'){showOverlay(true);return renderOnboarding(root,c);}
    if(seg==='read'||seg==='browse'){showOverlay(true);mount(root,loading());await renderReader(root,{realm:a,idx:+b,browse:true},c);return;}
    if(seg==='session'||seg==='listen'){showOverlay(true);mount(root,loading());await renderSession(root,{idx:+a,browse:true},c);return;}
    if(seg==='world'){showOverlay(true);return renderWorld(root,{realm:a},c);}
    if(seg==='book'){showOverlay(true);mount(root,loading());await renderBook(root,{id:a},c);return;}
    if(seg==='tool'){showOverlay(true);return renderTool(root,{id:a},c);}
    if(seg==='experience'){
      const r=productById(a);if(!r||r.kind!=='experience')throw Error('Experience not found');showOverlay(true);drone.stop();return renderEmbed(root,{title:r.title,file:`/realms/${r.file}?embedded=1`,download:r.file,route:`#/experience/${r.id}`,kind:'Experience',back:'#/products'},c);
    }
    showOverlay(false);const tab=seg==='realms'?'products':seg||'home';lastTab=`#/${tab}${a?'/'+a:''}`;paintHeader();window.scrollTo(0,0);
    if(tab==='guide'||tab==='thread')return renderGuide(main(),{id:tab==='thread'?a:null},c);
    if(tab==='product')return await renderProduct(main(),{id:a},c);
    if(tab==='situation')return renderSituation(main(),{id:a},c);
    const views={home:renderGuideHome,journey:renderJourney,library:renderCollection,products:renderProducts,ebooks:renderBooks,wallpapers:renderWallpapers,tools:renderTools,situations:renderSituations,moment:chooseMoment,today:renderGuideHome,path:renderJourney,you:renderYou};await(views[tab]||renderGuideHome)(main(),c);
  }catch(e){console.error(e);if(my!==token)return;showOverlay(true);mount(root,h('div',{class:'reader celebrate'},h('div',{class:'center blocked'},h('h1',{class:'display'},'Let’s try that again.'),h('p',{class:'lede'},'This page could not load. Your saved progress is still here.'),h('button',{class:'btn primary',onclick:()=>{location.hash='#/home';route();}},'Back to home'))));}
}
function loading(){return h('div',{class:'reader celebrate'},h('div',{class:'center blocked',role:'status'},h('i',{class:'loading-orbit'}),h('p',{class:'fine'},'Opening your space…')));}
async function start(){
  try{
    await S.boot();if(!S.state.doc)await S.start({name:'Friend',intents:[],length:'quick'});$('#boot')?.remove();addEventListener('hashchange',route);if(!location.hash||location.hash==='#')location.hash='#/home';await route();
    document.addEventListener('visibilitychange',async()=>{if(!document.hidden&&S.state.doc){try{await S.refresh();}catch{}}});addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.sheet-back')&&!overlay().hidden)ctx.close();});
  }catch(e){$('#boot')?.remove();mount(main(),h('div',{class:'empty-state'},h('h1',{class:'display'},'Your space is taking a moment.'),h('p',{},'Refresh to try again.'),h('button',{class:'btn primary',onclick:()=>location.reload()},'Refresh')));console.error(e);}
}
start();
