import { h, mount, icon, svgEl, toast } from '../ui.js';
import { TOOLS, art } from '../catalogue.js';
import { drone, silence } from '../audio.js';
import { space, toggleSaved, isSaved, rememberItem, trackActivity, updateBook } from '../personal.js';

let bookPromise;
export const books=()=>bookPromise||(bookPromise=fetch('/content/books.json').then(r=>{if(!r.ok)throw Error('Could not load the books');return r.json();}).catch(e=>{bookPromise=null;throw e;}));
const size=n=>`${(n/1048576).toFixed(1)} MB`;
export function remember(route,title,kind){rememberItem({route,title,kind});}
export function recentItem(){const r=space().recent;if(!r)return null;const p=r.kind==='eBook'?space().books[r.route.split('/').pop()]:null;return {...r,subtitle:p&&p.page>1?`Page ${p.page} of ${p.total}`:null};}
export function saveButton(item){const btn=h('button',{class:'save-item icon-btn','aria-label':`${isSaved(item.route)?'Unsave':'Save'} ${item.title}`,'aria-pressed':String(isSaved(item.route)),onclick:()=>{const on=toggleSaved(item);btn.setAttribute('aria-pressed',String(on));btn.setAttribute('aria-label',`${on?'Unsave':'Save'} ${item.title}`);toast(on?'Saved in your space.':'Removed from saved.');}},icon('bookmark',18));return btn;}
export function warmBook(file){let link=document.querySelector(`link[data-book-prefetch="${file}"]`);if(!link){link=document.createElement('link');link.rel='prefetch';link.href=file;link.dataset.bookPrefetch=file;document.head.append(link);}}

export function bookCard(b){
  const progress=space().books[b.id];
  const cover=b.cover?h('img',{src:b.cover,alt:`${b.title} cover`,loading:'lazy',decoding:'async'}):h('div',{class:'typeset-cover'},h('span',{},'THE HUMAN WITHIN'),svgEl(art('bloom','#e7dff3','#8c71b2','mindbook')),h('b',{},'Why am I',h('br'),h('em',{},'like this?')),h('small',{},'30 discoveries about being you'));
  const route=`#/book/${b.id}`;
  return h('article',{class:'book-card',style:{'--book-color':b.color}},h('a',{href:route,class:'book-stage','aria-label':`Read ${b.title}`,onpointerenter:()=>warmBook(b.file),onfocus:()=>warmBook(b.file)},h('div',{class:'book-object'},cover)),saveButton({route,title:b.title,kind:'eBook'}),h('div',{class:'book-copy'},h('p',{class:'product-group'},b.category),h('h3',{},b.title),h('p',{class:'fine'},b.description),progress&&progress.page>1&&h('p',{class:'reading-position'},`Page ${progress.page} of ${progress.total}`),h('div',{class:'book-actions'},h('a',{href:route,class:'text-link'},progress&&progress.page>1?'Continue reading':'Read book',icon('arrow',16)),h('a',{href:b.download||b.file,download:`${b.id}.zip`,class:'icon-btn','aria-label':`Download ${b.title} reader pack`,title:'Download book and reader'},icon('download',18)))));
}

export function toolCard(t){return h('a',{class:'tool-card',href:t.route||`#/tool/${t.id}`,style:{'--tile':t.color,'--tile-ink':t.ink}},h('div',{class:'tool-art'},svgEl(art(t.art,t.color,t.ink,t.id))),h('div',{},h('p',{class:'eyebrow'},t.meta),h('h3',{},t.title),h('p',{},t.description)),icon('arrow',20));}

export async function renderBooks(root,ctx){
  ctx.setHue(270);let filter='All books',query='';const grid=h('div',{class:'book-grid'}),chips=h('div',{class:'chips scroll'}),count=h('p',{class:'results-count',role:'status'});
  const input=h('input',{type:'search',class:'catalogue-search',placeholder:'Search a title, topic, or author…','aria-label':'Search eBooks',oninput:e=>{query=e.target.value;paint();}});
  const page=h('section',{class:'page hub-page rise'},h('div',{class:'reading-room-intro'},h('div',{},h('p',{class:'eyebrow'},'THE READING ROOM'),h('h1',{class:'display'},'A good place',h('br'),h('em',{},'to get curious.')),h('p',{class:'lede'},'Six complete eBooks. Open a cover, turn a page, and give a thought somewhere to grow.')),h('div',{class:'reading-mark','aria-hidden':'true'},icon('book',110))),h('div',{class:'search-wrap'},icon('search',20),input),chips,count,grid,h('p',{class:'fine reading-foot'},'Read here with pages loaded as you go, or download the complete reader pack for offline reading.'));
  mount(root,page);grid.append(h('p',{class:'fine'},'Opening the reading room…'));let all=[];
  function paint(){const cats=['All books',...new Set(all.map(b=>b.category))];mount(chips,cats.map(c=>h('button',{class:`chip ${filter===c?'on':''}`,'aria-pressed':String(filter===c),onclick:()=>{filter=c;paint();}},c)));const list=all.filter(b=>(filter==='All books'||filter===b.category)&&`${b.title} ${b.description} ${b.author}`.toLowerCase().includes(query.toLowerCase()));count.textContent=`${list.length} of ${all.length} books`;mount(grid,list.length?list.map(bookCard):h('p',{class:'empty-state'},'No books match. Try another search.'));}
  try{all=await books();if(page.isConnected)paint();}catch{mount(grid,h('p',{class:'fine'},'The reading room could not load. Please try again.'));}
}
export function renderTools(root,ctx){ctx.setHue(290);mount(root,h('section',{class:'page hub-page rise'},h('div',{class:'page-intro'},h('p',{class:'eyebrow'},'MORE WAYS TO BE HERE'),h('h1',{class:'display'},'Little tools. Living worlds.'),h('p',{class:'lede'},'The extra creations, kept together in a space of their own.')),h('div',{class:'tools-grid'},TOOLS.map(toolCard))));}

export async function renderBook(root,{id},ctx){
  let bs;try{bs=await books();}catch{return viewerError(root,ctx);}
  if(ctx.isCurrent&&!ctx.isCurrent())return;const b=bs.find(x=>x.id===id);if(!b)return viewerError(root,ctx);
  renderEmbed(root,{id:b.id,title:b.title,file:b.file+'?embedded=1'+(space().books[b.id]?.page>1?'&resume='+space().books[b.id].page:''),download:`${b.id}.zip`,downloadFile:b.download,cover:b.cover,route:`#/book/${id}`,kind:'eBook',back:'#/ebooks'},ctx);
}
export function renderTool(root,{id},ctx){const t=TOOLS.find(x=>x.id===id&&x.file);if(!t)return viewerError(root,ctx);renderEmbed(root,{title:t.title,file:t.file,download:`${t.id}.html`,route:`#/tool/${id}`,kind:'Interactive tool',back:'#/tools'},ctx);}

export function renderEmbed(root,item,ctx){
  drone.stop();silence();remember(item.route,item.title,item.kind);
  let activity=null,finished=false;const progress=h('div',{class:'embed-loading',role:'status'},item.cover&&h('img',{class:'loading-book-cover',src:item.cover,alt:''}),h('i',{class:'loading-orbit'}),h('p',{},item.kind==='eBook'?'Your book is opening…':`Opening ${item.kind.toLowerCase()}…`));
  const frame=h('iframe',{class:'world-frame embed-frame',title:item.title,src:item.file,allow:'autoplay; fullscreen',loading:'eager',onload:()=>{try{if(frame.contentDocument?.URL==='about:blank')return;}catch{}progress.hidden=true;if(!activity)activity=trackActivity({route:item.route,title:item.title,kind:item.kind});},onerror:()=>{progress.replaceChildren(h('p',{},'This file could not open.'),h('a',{class:'btn primary',href:item.file,target:'_blank',rel:'noopener'},'Open original reader'));}});
  const wrap=h('div',{class:'world embed-view'},h('header',{class:'world-bar embed-bar'},h('button',{class:'icon-btn','aria-label':'Back',onclick:()=>ctx.close(item.back)},icon('back',20)),h('div',{class:'embed-title'},h('small',{},item.kind),h('strong',{},item.title)),
    h('button',{class:'btn primary embed-done',onclick:()=>{finished=true;activity?.finish(item.kind!=='eBook'||!!space().books[item.id]&&space().books[item.id].page===space().books[item.id].total);ctx.close(item.back);}},item.kind==='eBook'?'Keep my place':'Done for now'),h('a',{class:'icon-btn',href:item.downloadFile||item.file,download:item.download,'aria-label':`Download ${item.title}`,title:'Download original HTML'},icon('download',20)),
    h('button',{class:'icon-btn','aria-label':'Full screen',title:'Full screen',onclick:()=>{if(document.fullscreenElement)document.exitFullscreen?.();else if(frame.requestFullscreen)frame.requestFullscreen().catch(()=>toast('Use the open reader button for a larger view.'));else window.open(item.file,'_blank','noopener');}},icon('expand',20)),
    h('a',{class:'icon-btn',href:item.file,target:'_blank',rel:'noopener','aria-label':'Open original reader in a new tab',title:'Open original reader'},icon('external',20))),h('div',{class:'embed-body'},frame,progress));
  const receive=e=>{if(e.source!==frame.contentWindow||e.origin!==location.origin||e.data?.type!=='human-within:reading'||e.data.id!==item.id)return;const {page,total,label}=e.data;if(Number.isInteger(page)&&Number.isInteger(total)&&page>=1&&page<=total&&total<=10000)updateBook(item.id,{page,total,label});};addEventListener('message',receive);wrap.addEventListener('ugt:leave',()=>{removeEventListener('message',receive);if(!finished)activity?.finish(false);frame.src='about:blank';});mount(root,wrap);
}
function viewerError(root,ctx){mount(root,h('div',{class:'reader celebrate'},h('div',{class:'center blocked'},h('h1',{class:'display'},'That file could not open.'),h('button',{class:'btn primary',onclick:()=>ctx.close(item.back)},'Go back'))));}
