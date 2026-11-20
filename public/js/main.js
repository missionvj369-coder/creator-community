import {enabled,legacyMediaRoutes,loadSiteSettings,siteSettings} from './launch-catalogue.js';
import {cinemaSound} from './cinema-sound.js';
import {sceneForRoute} from './cinema-model.js';
import {soundSettingsButton,soundToggleButton} from './cinema-controls.js';
import {installExperienceUtilities} from './experience-utilities.js';
import {installCinemaPresentation} from './cinema-presentation.js';
import { h, mount, icon, $ } from './ui.js';
import * as S from './store.js';
import { setAura } from './aura.js';
import { drone, silence } from './audio.js';
import { productById } from './catalogue.js';
import { applyPreferences } from './personal.js';
import { renderArrival } from './views/arrival.js';
import { retiredWritingRoute, independentRoute } from './experience-flow.js';
import { createArrivalVisit, arrivalDestination } from './arrival-model.js';
import { immersiveWorld } from './immersive-model.js';

const loaders={
 you:()=>import('./views/you.js'),reader:()=>import('./views/reader.js'),session:()=>import('./views/session.js'),world:()=>import('./views/world.js'),onboarding:()=>import('./views/onboarding.js'),hub:()=>import('./views/hub.js'),library:()=>import('./views/library.js'),wallpapers:()=>import('./views/wallpapers.js'),moment:()=>import('./views/moment.js'),meditation:()=>import('./views/meditation.js'),experiences:()=>import('./views/experiences.js'),immersive:()=>import('./views/immersive.js'),body:()=>import('./views/body.js'),media:()=>import('./views/media.js')
};
const viewCache=new Map();
function viewModule(name){if(!viewCache.has(name)){const request=loaders[name]().catch(error=>{viewCache.delete(name);throw error;});viewCache.set(name,request);}return viewCache.get(name);}
async function drawView(name,exportName,root,args,context){const module=await viewModule(name);if(!context.isCurrent())return;return module[exportName](root,...args,context);}
function goHome(){arrivalVisit.admit();leaveOverlay();if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});ctx.go('#/home');}

const TABS=[['home','Home','realms'],['discover','Media','sparkle'],['ebooks','Ebooks','book'],['you','Your space','you']];
let lastTab='#/home',token=0,arrivalController=null;
const arrivalVisit=createArrivalVisit(()=>sessionStorage);
const main=()=>$('#main'),overlay=()=>$('#overlay'),chrome=()=>$('#chrome');
const ctx={sky:'day',go:to=>{if(location.hash===to)route();else location.hash=to;},close:fallback=>ctx.go(typeof fallback==='string'?fallback:lastTab),render:()=>route(),refresh:async()=>{try{await S.refresh();}catch{}route();},setHue:hue=>setAura(hue,0),async toggleSound(){await cinemaSound.toggle();paintHeader();}};
function leaveOverlay(){arrivalController?.destroy();overlay()?.firstElementChild?.dispatchEvent(new Event('ugt:leave'));arrivalController=null;document.body.classList.remove('arrival-visible');silence();}
function paintHeader(){
  const seg=location.hash.split('/')[1]||'home',act=seg==='library'?'ebooks':['products','product','wallpapers','tools','realms','daily','today','journey','path','guide','thread'].includes(seg)?'home':seg;
  mount($('#nav'),TABS.map(([id,label,ic])=>h('a',{href:`#/${id}`,class:`nav-i ${act===id?'on':''}`,'aria-current':act===id?'page':null},icon(ic,22),h('span',{},label))));
  mount($('#extra-nav'),[['meditate','The Still Room','moon'],['arrive','Replay the welcome','sparkle']].map(([id,label,ic])=>h('a',{href:`#/${id}`,class:`nav-i ${act===id?'on':''}`,'aria-current':act===id?'page':null},icon(ic,20),h('span',{},label))));
  const label={discover:'A little wonder awaits',studios:'The living studios',meditate:'The Still Room',home:'A world within you',guide:'Your next useful move',thread:'Your living thread',library:'The reading room',products:'A world within you',ebooks:'The reading room',wallpapers:'The pocket gallery',you:'Your space',tools:'More ways to explore',situations:'Meet your moment',product:'A little further within',situation:'Meet your moment'}[seg]||'Human Within';$('#top-label').textContent=label;
  mount($('#top-actions'),h('a',{href:'#/meditate',class:'icon-btn','aria-label':'Return to the Still Room'},icon('sparkle',20)),soundToggleButton('app-sound-toggle chrome-sound-toggle'),soundSettingsButton());
}
async function route(){
  const my=++token,[,seg,a,b]=location.hash.split('/'),root=overlay();main()?.firstElementChild?.dispatchEvent(new Event('ugt:leave'));leaveOverlay();if(!S.state.ready)return;const c={...ctx,isCurrent:()=>my===token};cinemaSound.setScene(sceneForRoute(location.hash),{intro:['product','experience'].includes(seg)});document.body.dataset.cinemaScene=sceneForRoute(location.hash);
  const showOverlay=on=>{root.hidden=!on;main().inert=on;main().hidden=on;main().setAttribute('aria-hidden',String(on));chrome().hidden=on;document.body.classList.toggle('in-experience',on);if($('.skip'))$('.skip').hidden=on;if(!on)mount(root);};
  const room=async(name,fn,args=[])=>{showOverlay(true);mount(root,loading());return await drawView(name,fn,root,args,c);};
  try{
    if(retiredWritingRoute(location.hash)){ctx.go('#/home');return;}
    applyPreferences();if(S.state.doc?.space?.cinemaSound&&JSON.stringify(S.state.doc.space.cinemaSound)!==JSON.stringify(cinemaSound.prefs))cinemaSound.configure(S.state.doc.space.cinemaSound);
    if(['product','experience'].includes(seg)&&Object.hasOwn(legacyMediaRoutes,a)){
      ctx.go(`#/product/${legacyMediaRoutes[a]}`);
      return;
    }
    if(seg==='support'&&a)return await room('media','renderSupport',[{order:a}]);
    const feature=['product','experience','read','browse','world'].includes(seg)
      ?a==='know-your-body'?'ebooks':a
      :({book:'ebooks',library:'ebooks',ebooks:'ebooks',meditate:'meditate',listen:'protocol',session:'protocol',wallpapers:'rewire',support:'support'})[seg];
    const book=seg==='book'?a:seg==='experience'&&a==='know-your-body'?'body-you-live-in':null;
    if((feature&&!enabled(feature))||(book&&!enabled('ebook:'+book))){
      showOverlay(true);
      mount(root,h('section',{class:'media-room'},h('h1',{},'This feature is currently unavailable'),h('a',{href:'#/home'},'Return home')));
      return;
    }
    if(!enabled('welcome')&&!arrivalVisit.admitted)arrivalVisit.admit();
    if(!arrivalVisit.admitted||(seg==='arrive'&&enabled('welcome'))||(seg==='meditate'&&a)){
      const direct=seg==='meditate'&&a;const destination=direct?'#/home':arrivalDestination(seg==='arrive'?lastTab:location.hash);
      showOverlay(true);document.body.classList.add('arrival-visible');cinemaSound.setScene('arrival');
      arrivalController=renderArrival(root,{reduced:document.documentElement.dataset.motion==='reduced',skipWelcome:!!direct,preset:direct?a:'arrival',resume:direct&&a==='resume',onEnter:()=>{arrivalVisit.admit();ctx.go(destination);},onMore:()=>{arrivalVisit.admit();ctx.go('#/meditate');}});
      return;
    }
    if(!S.state.doc)return await room('onboarding','renderOnboarding');
    ctx.sky='day';document.body.dataset.sky='day';
    applyPreferences();
    if(seg==='daily'){ctx.go(independentRoute(location.hash,S.state.doc.space?.dailyPlan));return;}
    if(['products','realms','tools','today','journey','path'].includes(seg)){ctx.go('#/home');return;}
    if(seg==='library'){ctx.go('#/ebooks');return;}
    if(seg==='moment'&&a)return await room('moment','renderMoment',[{id:a}]);
    if(seg==='welcome'&&!enabled('welcome')){ctx.go('#/home');return;}
    if(seg==='welcome')return await room('onboarding','renderWelcomeVideos');
    if(seg==='onboarding')return await room('onboarding','renderOnboarding');
    if(['product','experience'].includes(seg)&&productById(a)?.kind==='media')return await room('media','renderMedia',[{id:a}]);
    if(seg==='support')return await room('media','renderSupport',[{}]);
    if(seg==='product'&&immersiveWorld(a))return await room('immersive','renderImmersive',[{id:a}]);
    if(seg==='read'||seg==='browse')return await (immersiveWorld(a)?room('immersive','renderImmersive',[{id:a,idx:+b}]):room('reader','renderReader',[{realm:a,idx:+b,browse:true}]));
    if(seg==='session'||seg==='listen')return await room('session','renderSession',[{idx:+a,browse:true}]);
    if(seg==='world')return await room('world','renderWorld',[{realm:a}]);
    if(seg==='book')return await room('library','renderBook',[{id:a,page:b===undefined?null:Number(b)}]);
    if(seg==='tool')return await room('library','renderTool',[{id:a}]);
    if(seg==='experience'){
      if(a==='know-your-body')return await room('body','renderBody',[{}]);
      const r=productById(a);if(!r||r.kind!=='experience')throw Error('Experience not found');return await room('library','renderEmbed',[{productId:r.id,title:r.title,file:`/realms/${r.file}?embedded=1`,download:r.file,route:`#/experience/${r.id}`,kind:'Experience',back:`#/product/${r.id}`}]);
    }
    showOverlay(false);const tab=seg==='realms'?'products':seg||'home';lastTab=`#/${tab}${a?'/'+a:''}`;paintHeader();window.scrollTo(0,0);
    if(tab==='product')return await drawView('hub','renderProduct',main(),[{id:a}],c);
    if(tab==='situation')return await drawView('hub','renderSituation',main(),[{id:a}],c);
    if(tab==='atlas'||tab==='chapter'){ctx.go('#/library');return;}
    const views={discover:['experiences','renderDiscover'],meditate:['meditation','renderMeditationHub'],home:['experiences','renderExperiences',{chapter:a}],library:['library','renderBooks'],ebooks:['library','renderBooks'],wallpapers:['wallpapers','renderWallpapers'],situations:['hub','renderSituations'],moment:['moment','chooseMoment'],you:['you','renderYou']};const [module,view,args]=views[tab]||views.home;
    mount(main(),h('section',{class:'page hub-page room-page-loading',role:'status'},h('p',{class:'eyebrow'},'HUMAN WITHIN'),h('h1',{class:'display'},'A little space',h('em',{},'is opening.')),h('i',{class:'loading-orbit'})));
    return await drawView(module,view,main(),args?[args]:[],c);
  }catch(e){console.error(e);if(my!==token)return;showOverlay(true);mount(root,h('div',{class:'reader celebrate'},h('div',{class:'center blocked'},h('h1',{class:'display'},'Let’s try that again.'),h('p',{class:'lede'},'This page could not load. Your saved progress is still here.'),h('button',{class:'btn primary',onclick:()=>{location.hash='#/home';route();}},'Back to home'))));}
}
function loading(){return h('section',{class:'room-loading',role:'status'},h('div',{},h('p',{class:'eyebrow'},'HUMAN WITHIN'),h('h1',{},'A moment within.'),h('i',{class:'loading-orbit'}),h('p',{},'Opening your experience…')));}
let navigationTransition=null;
function navigate(){
  const [,segment,chapter]=location.hash.split('/');
  const existing=document.querySelector('.experiences-page');
  if(segment==='home'&&existing&&!document.body.classList.contains('in-experience')){
    const target=chapter?document.getElementById(`chapter-${chapter}`):null;
    if(!chapter||target){lastTab=location.hash;const behavior=document.documentElement.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';if(target)target.scrollIntoView({behavior,block:'start'});else window.scrollTo({top:0,behavior});return;}
  }
  if(document.startViewTransition&&document.documentElement.dataset.motion!=='reduced'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){navigationTransition?.skipTransition?.();navigationTransition=document.startViewTransition(()=>{route();});navigationTransition.ready.catch(()=>{});navigationTransition.finished.catch(()=>{});}else route();
}
async function start(){
  try{
    await Promise.all([S.boot(),loadSiteSettings()]);document.title=siteSettings().title;if(S.state.doc?.space?.cinemaSound)cinemaSound.configure(S.state.doc.space.cinemaSound);let soundSignature=JSON.stringify(cinemaSound.prefs);cinemaSound.install();installCinemaPresentation();installExperienceUtilities(overlay(),{onHome:goHome});window.HumanCinemaHome=goHome;cinemaSound.subscribe(()=>{const current=JSON.stringify(cinemaSound.prefs);if(current!==soundSignature&&S.state.doc){soundSignature=current;S.mutateSpace(s=>({...s,cinemaSound:{...cinemaSound.prefs}}));}});if(!S.state.doc)await S.start({name:'Friend',intents:[],length:'quick'});$('#boot')?.remove();addEventListener('hashchange',navigate);addEventListener('pageshow',e=>{if(e.persisted)route();});if(!location.hash||location.hash==='#')history.replaceState(null,'','#/home');await route();
    const warm=e=>{const href=e.target.closest?.('a[href^="#/"]')?.getAttribute('href');if(!href)return;const [,segment,id]=href.split('/'),name=['product','experience'].includes(segment)&&productById(id)?.kind==='media'?'media':segment==='experience'?(id==='know-your-body'?'body':'library'):segment==='product'?(immersiveWorld(id)?'immersive':'hub'):segment==='book'||segment==='ebooks'?'library':segment==='listen'||segment==='session'?'session':['home','discover'].includes(segment)?'experiences':segment==='you'?'you':null;if(name)viewModule(name).catch(()=>{});};
    document.addEventListener('pointerover',warm,{passive:true});document.addEventListener('focusin',warm);setTimeout(()=>viewModule('experiences').catch(()=>{}),1200);
    document.addEventListener('visibilitychange',async()=>{if(!document.hidden&&S.state.doc){try{await S.refresh();}catch{}}});addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.sheet-back')&&!overlay().hidden){if(arrivalController)arrivalController.enter();else ctx.close();}});
  }catch(e){$('#boot')?.remove();mount(main(),h('div',{class:'empty-state'},h('h1',{class:'display'},'Your space is taking a moment.'),h('p',{},'Refresh to try again.'),h('button',{class:'btn primary',onclick:()=>location.reload()},'Refresh')));console.error(e);}
}
start();
