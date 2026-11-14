import { h, mount, icon, sheet, toast } from '../ui.js';

import { space, downloaded } from '../personal.js';
import { productBridge } from './experience-transition.js';
let wallpaperPromise;
const collection=()=>wallpaperPromise||(wallpaperPromise=fetch('/content/wallpapers.json').then(r=>{if(!r.ok)throw Error('Wallpapers could not load');return r.json();}).catch(e=>{wallpaperPromise=null;throw e;}));
const saved=()=>space().wallpapers;
const mark=id=>downloaded(id);
export function wallpaperPath(day){return `/wallpapers/human-within-${String(day).padStart(2,'0')}.png`;}
export async function saveWallpaper(w){
  const a=h('a',{href:w.file||wallpaperPath(w.day),download:`human-within-day-${String(w.day).padStart(2,'0')}.png`});document.body.append(a);a.click();a.remove();mark(w.day);
}
export async function renderWallpapers(root,ctx){
  ctx.setHue(290);let filter='All colours',query='';const grid=h('div',{class:'wallpaper-grid'}),chips=h('div',{class:'chips scroll'}),count=h('p',{class:'results-count',role:'status'});
  const input=h('input',{class:'catalogue-search',type:'search',placeholder:'Find a reminder: focus, pause, connection…','aria-label':'Search wallpapers',oninput:e=>{query=e.target.value;paint();}});
  const hero=h('div',{class:'wallpaper-studio-hero'},h('div',{},h('p',{class:'eyebrow'},'THE POCKET GALLERY'),h('h1',{class:'display'},'A kinder kind',h('br'),h('em',{},'of screen time.')),h('p',{class:'lede'},'Thirty individual artworks. Thirty useful reminders. Choose the one you want to carry with you today.'),h('a',{class:'btn primary',href:'/wallpapers/human-within-all-30.zip',download:'human-within-all-30.zip'},icon('download',18),'Download all 30'),h('p',{class:'wallpaper-spec'},'1080 × 2340 px · PNG · no sign-up')),
    h('div',{class:'studio-phones','aria-hidden':'true'},h('img',{src:'/wallpapers/thumb-01.webp',alt:''}),h('img',{src:'/wallpapers/thumb-03.webp',alt:''}),h('img',{src:'/wallpapers/thumb-08.webp',alt:''})));
  const page=h('section',{class:'page hub-page rise'},h('a',{class:'back-link',href:'#/product/rewire'},icon('back',17),'Back to Rewire'),hero,h('div',{class:'download-tip'},icon('download',20),h('p',{},'Download your favourite, then set it from your phone’s Photos or wallpaper settings. On iPhone, open the full-size image and use Share or Save to Photos.')),h('div',{class:'search-wrap'},icon('search',20),input),chips,count,grid,productBridge('rewire'));mount(root,page);let all=[];
  const colours=['All colours','Lavender','Sage','Apricot','Sky','Rose','Midnight'];
  function paint() {
    mount(chips, colours.map(c => h('button', {
      class: `chip ${filter === c ? 'on' : ''}`, 'aria-pressed': String(filter === c),
      onclick: () => { filter = c; paint(); }
    }, c)));
    const list = all.filter(w => (filter === 'All colours' || w.palette === filter) && `${w.title} ${w.cue} ${w.category}`.toLowerCase().includes(query.toLowerCase()));
    count.textContent = `${list.length} of 30 wallpapers · every day is available`;
    const downloaded = saved();
    const cards = list.map(w => {
      const image = h('button', { class:'wallpaper-preview', onclick:()=>preview(w,paint,list), 'aria-label':`Preview day ${w.day}: ${w.title}`, style:{background:w.background} },
        h('img', {src:w.thumb,alt:`Day ${w.day}: ${w.cue}`,loading:'lazy',decoding:'async'}),
        h('span', {class:'wallpaper-day'}, `DAY ${String(w.day).padStart(2,'0')}`),
        downloaded.includes(w.day) && h('span', {class:'wallpaper-saved'},icon('check',15),'Chosen'));
      const download = h('button', {class:'icon-btn','aria-label':`Download wallpaper ${w.day}`,onclick:()=>{saveWallpaper(w);toast('Download started · choose Open image if your phone shows a preview.');paint();}},icon('download',20));
      const caption = h('div', {class:'wallpaper-caption'}, h('div',{},h('p',{class:'product-group'},w.palette+' · '+w.category),h('h3',{},w.title)),download);
      return h('article',{class:'wallpaper-card'},image,caption);
    });
    mount(grid, cards.length ? cards : h('p',{class:'empty-state'},'No wallpapers match. Try another colour or word.'));
  }
  try{all=await collection();if(page.isConnected)paint();}catch{mount(grid,h('p',{class:'fine'},'The gallery could not load. Refresh to try again.'));}
}
function preview(initial,onSave,list){
 let index=list.findIndex(x=>x.day===initial.day),w=initial;const content=h('div',{class:'wallpaper-dialog'}),status=h('p',{class:'fine',role:'status'});let sh;
 const key=e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}};
 sh=sheet(content,{label:`Wallpaper preview: ${w.title}`,onClose:()=>document.removeEventListener('keydown',key)});document.addEventListener('keydown',key);
 function move(direction){if(!list[index+direction])return;index+=direction;w=list[index];status.textContent='';paint();sh.el.scrollTop=0;content.querySelector(direction>0?'[data-next]':'[data-previous]')?.focus();}
 function paint(){
  sh.el.setAttribute('aria-label',`Wallpaper preview: ${w.title}`);
  const prev=h('button',{'data-previous':'',disabled:index===0,onclick:()=>move(-1),'aria-label':'Previous wallpaper'},'← Back'),next=h('button',{'data-next':'',disabled:index===list.length-1,onclick:()=>move(1),'aria-label':'Next wallpaper'},'Next →');
  mount(content,h('div',{class:'wallpaper-preview-nav'},prev,h('span',{},`${index+1} / ${list.length}`),next),h('img',{src:w.file,alt:w.cue}),h('div',{class:'wallpaper-dialog-copy'},h('p',{class:'eyebrow'},`DAY ${w.day} · ${w.palette}`),h('h2',{class:'display sm'},w.title),h('p',{class:'lede'},w.cue),h('p',{},w.explanation),h('div',{class:'small-action'},h('b',{},'Take it into your day'),h('p',{},w.action)),h('div',{class:'stack'},h('a',{class:'btn primary',href:w.file,download:`human-within-day-${String(w.day).padStart(2,'0')}.png`,onclick:()=>{mark(w.day);status.textContent='Download started. If your phone opens the image, use its Save Image or Share option.';onSave();}},icon('download',18),'Download PNG'),h('a',{class:'btn ghost',href:w.file,target:'_blank',rel:'noopener'},icon('external',18),'Open full-size image'),navigator.canShare&&h('button',{class:'btn ghost',onclick:async()=>{try{const fileUrl=w.file,day=w.day,title=w.title,r=await fetch(fileUrl);if(!r.ok)throw Error();const file=new File([await r.blob()],`human-within-${day}.png`,{type:'image/png'});if(navigator.canShare({files:[file]})){await navigator.share({files:[file],title});mark(day);onSave();}else status.textContent='Use Download PNG or Open full-size image on this device.';}catch(e){if(e.name!=='AbortError')status.textContent='Use Download PNG or Open full-size image on this device.';}}},icon('share',18),'Share / save to phone')),status));
 }
 paint();
}
