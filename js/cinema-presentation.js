import {cinemaSound} from './cinema-sound.js?v=18214deeb83d6066';
import {openSoundSettings} from './cinema-controls.js?v=18214deeb83d6066';
export function installCinemaPresentation(){
 document.documentElement.dataset.cinema='on';window.HumanCinemaSettings=openSoundSettings;
 const decorate=()=>{for(const el of document.querySelectorAll('.experience-hero,.reading-room-intro,.profile-welcome,.wallpaper-studio-hero,.product-detail-hero,.still-room-feature,.experience-rest'))el.classList.add('cinema-frame');};
 const observer=new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length))decorate();});observer.observe(document.getElementById('app'),{subtree:true,childList:true});decorate();
 document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#/"]');if(link&&link.hash!==location.hash)cinemaSound.cue('enter');});
}
