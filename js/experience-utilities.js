import {h,icon} from './ui.js?v=18214deeb83d6066';
import {soundToggleButton,pruneSoundControls} from './cinema-controls.js?v=18214deeb83d6066';

// The same two actions stay available while a room opens, plays, pauses or ends.
export function installExperienceUtilities(root,{onHome}){
 const decorate=()=>{
  pruneSoundControls();const page=root.firstElementChild;if(!page||page.dataset.roomUtilities)return;
  page.dataset.roomUtilities='true';let header=page.querySelector('header');
  if(!header){header=h('header',{class:'experience-utility-header'});page.prepend(header);}
  header.classList.add('has-room-utilities');
  const home=h('a',{class:'app-home',href:'#/home','aria-label':'Home',title:'Home',onclick:e=>{e.preventDefault();onHome();}},icon('home',18),h('span',{},'Home'));
  const back=header.querySelector(':scope > .immersion-back,:scope > .body-back,:scope > button[aria-label="Back to the reading room"],:scope > button[aria-label="Back"],:scope > button[aria-label="Close"],:scope > .room-player-brand');
  if(back)back.replaceWith(home);else header.prepend(home);
  const actions=header.querySelector('.immersion-actions,nav')||header;
  if(!actions.querySelector('[data-sound-toggle]'))actions.append(soundToggleButton());
  if(header.classList.contains('embed-bar')){
   const more=h('details',{class:'app-more'},h('summary',{'aria-label':'More options',title:'More options'},h('span',{'aria-hidden':'true'},'•••'))),menu=h('div',{class:'app-more-menu'});
   for(const item of [...header.querySelectorAll(':scope > .icon-btn')]){const label=item.getAttribute('aria-label')||item.title;if(!label)continue;item.append(h('span',{},label==='Open original reader in a new tab'?'Open original':label));menu.append(item);}
   more.append(menu);header.append(more);more.addEventListener('click',e=>{if(e.target.closest('button,a'))more.open=false;});more.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();more.open=false;more.querySelector('summary').focus();}});
  }
 };
 const observer=new MutationObserver(decorate);observer.observe(root,{childList:true});decorate();return()=>observer.disconnect();
}
