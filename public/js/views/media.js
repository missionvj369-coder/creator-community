import {h,mount} from '../ui.js';
import {cinemaSound} from '../cinema-sound.js';
import {enabled,mediaProducts,siteSettings} from '../launch-catalogue.js';

import {experienceLinks} from './experience-transition.js';

function header(title){
  return h('header',{class:'media-header'},h('a',{href:'#/discover'},'Media library'),h('h1',{},title));
}

export async function renderMedia(root,{id},ctx){
  const video=id==='video';
  try{
    if(video)await import('/vendor/videojs-10.5.0/video.js');
    else await import('/vendor/videojs-10.5.0/audio.js');
  }catch{}
  if(!ctx.isCurrent())return;
  const playerTag=video?'video-player':'audio-player';
  const skinTag=video?'video-skin':'audio-skin';
  const enhanced=Boolean(customElements.get(playerTag)&&customElements.get(skinTag));
  const title=mediaProducts.find(item=>item.id===id).title;
  const entries=siteSettings().media.filter(entry=>entry.kind===id&&entry.enabled);
  const status=h('p',{role:'status',class:'media-status'});
  if(!entries.length){
    mount(root,h('section',{class:'media-room'},header(title),h('p',{},'No releases are available yet.'),experienceLinks(id)));
    return;
  }
  const frame=h('div',{class:'media-frame'});
  const label=h('h2');
  const description=h('p',{class:'media-description'});
  const controls=h('div',{class:'media-actions'});
  const list=h('ol',{class:'media-list'});
  const page=h('section',{class:'media-room'},header(title),
    h('div',{class:'media-layout'},h('article',{class:'media-player'},frame,label,description,controls,status),
      h('aside',{},h('h2',{},video?'Films':id==='podcast'?'Episodes':'Playlist'),list)),experienceLinks(id));
  const owner='media-'+id;
  let index=0,element=null,active=true;
  const stop=()=>{
    if(element){element.pause();element.removeAttribute('src');element.replaceChildren();element.load();element=null;}
  };

  function select(next,autoplay=false){
    if(!active || next < 0 || next >= entries.length)return;
    stop();
    index=next;
    const entry=entries[next];
    label.textContent=entry.title;
    description.textContent=entry.description;
    status.textContent='';
    element=h(video?'video':'audio',{controls:!enhanced,preload:'metadata',playsinline:true,src:entry.src,
      'aria-label':entry.title,...(video&&entry.poster?{poster:entry.poster}:{}),...(entry.captions&&video?{crossorigin:'anonymous'}:{})});
    if(entry.captions&&video)element.append(h('track',{kind:'captions',label:'English',srclang:'en',src:entry.captions}));
    element.addEventListener('error',()=>{status.textContent='This media could not be played. Choose another title or try again.';});
    element.addEventListener('ended',()=>{if(!video&&index+1<entries.length)select(index+1,true);});
    mount(frame,enhanced?h(playerTag,{},h(skinTag,{},element)):element);
    if(autoplay)element.play().catch(()=>{status.textContent='Press play to continue.';});
    Array.from(list.querySelectorAll('button')).forEach((button,i)=>button.setAttribute('aria-current',i===next?'true':'false'));
    previous.disabled=index===0;
    following.disabled=index===entries.length-1;
  }
  const previous=h('button',{type:'button',onclick:()=>select(index-1,true)},id==='podcast'?'Previous episode':'Previous');
  const following=h('button',{type:'button',onclick:()=>select(index+1,true)},id==='podcast'?'Next episode':'Next');
  mount(controls,previous,following);
  mount(list,entries.map((entry,i)=>h('li',{},h('button',{type:'button',onclick:()=>select(i,true)},
    h('strong',{},entry.title),entry.description&&h('span',{},entry.description)))));
  function pauseHidden(){if(document.hidden)element?.pause();}
  function dispose(){
    active=false;stop();cinemaSound.resume(owner);
    document.removeEventListener('visibilitychange',pauseHidden);
    removeEventListener('pagehide',dispose);
  }
  page.addEventListener('ugt:leave',dispose,{once:true});
  document.addEventListener('visibilitychange',pauseHidden);
  addEventListener('pagehide',dispose,{once:true});
  cinemaSound.hold(owner);
  mount(root,page);
  select(0);
}

export function renderSupport(root,{order}){
  const payment=siteSettings().payment;
  const status=h('p',{role:'status',class:'media-status'});
  const check=h('button',{type:'button',onclick:checkOrder},'Refresh payment status');
  const pay=h('button',{type:'button',onclick:begin},'Continue to BTCPay');
  async function checkOrder(){
    check.disabled=true;
    try{
      const response=await fetch('/api/orders/'+encodeURIComponent(order),{cache:'no-store'});
      if(!response.ok)throw Error();
      const record=await response.json();
      const message={pending:'Awaiting confirmation',settled:'Payment confirmed',expired:'Invoice expired',invalid:'Invoice requires review'};
      status.textContent=`${message[record.status] || 'Status unavailable'} · ${record.amount} ${record.currency}`;
    }catch{status.textContent='Payment status is unavailable. Try refreshing.';}
    finally{check.disabled=false;}
  }
  async function begin(){
    pay.disabled=true;
    status.textContent='Opening secure checkout…';
    try{
      const response=await fetch('/api/checkout',{method:'POST'});
      const result=await response.json();
      if(!response.ok)throw Error(result.error || 'Checkout unavailable');
      const url=new URL(result.url);
      if(url.protocol!=='https:')throw Error('Invalid checkout URL');
      location.assign(url.href);
    }catch(error){status.textContent=error.message;pay.disabled=false;}
  }
  mount(root,h('section',{class:'media-room'},header('Support Human Within'),
    h('div',{class:'media-player'},
      order?check:enabled('support')&&payment?h('div',{},
        h('p',{},`One-time contribution · ${payment.amount} ${payment.currency}`),
        h('p',{},'BTCPay checkout accepts Bitcoin. Supported payment methods appear on the invoice.'),pay)
        :h('p',{},'Contributions are currently unavailable.'),status)));
  if(order)void checkOrder();
}
