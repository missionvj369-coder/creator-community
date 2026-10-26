import { h, mount, icon, svgEl, toast } from '../ui.js';
import { PRODUCTS, PRODUCT_META, SITUATIONS, TOOLS, productById, situationById, art } from '../catalogue.js';
import { state } from '../store.js';
import { titlesOf } from '../content.js';
import { books, bookCard, toolCard, recentItem, saveButton } from './library.js';
import { space, summary, preferredMoments, sequenceProgress } from '../personal.js';

const goLink = (to, text, className='btn primary') => h('a',{href:to,class:className},text,icon('arrow',18));
const artEl = r => svgEl(art(r.art||r.icon,r.color,r.ink,r.id));
export const sectionHead = (kicker,title,link,label) => h('div',{class:'section-heading'},h('div',{},h('p',{class:'eyebrow'},kicker),h('h2',{},title)),link&&h('a',{class:'text-link',href:link},label||'See all',icon('arrow',17)));

export function productCard(r) {
 const route=`#/product/${r.id}`;
 return h('article',{class:'product-shell'},h('a',{class:'product-card',href:route,style:{'--tile':r.color,'--tile-ink':r.ink}},h('div',{class:'product-art'},h('span',{class:'product-num'},r.number),artEl(r),h('span',{class:'art-label'},r.kind==='sequence'?'A small daily practice':'An immersive experience'),h('span',{class:'card-arrow'},icon('arrow',21))),h('div',{class:'product-copy'},h('p',{class:'product-group'},r.group),h('h3',{},r.title),h('p',{class:'fine'},r.short))),saveButton({route,title:r.title,kind:'Experience'}));
}

export function situationCard(s, compact=false) {
  return h('a',{class:`situation-card ${compact?'compact':''}`,href:`#/moment/${s.id}`,style:{'--tile':s.color,'--tile-ink':s.ink}},h('div',{class:'situation-glyph'},artEl(s)),h('div',{},h('h3',{},s.title),h('p',{},s.label)),icon('arrow',17));
}

export function renderHome(root,ctx) {
  ctx.setHue(160);
  const hero=h('div',{class:'home-hero'},h('div',{class:'hero-copy'},h('span',{class:'hero-overline'},h('i'), 'A little space to be human'),
    h('h1',{},'Come back',h('br'),h('em',{},'to yourself.')),
    h('p',{},'A calmer moment. A clearer thought. A deeper connection. Find something that meets you where you are.'),
    h('div',{class:'hero-actions'},goLink('#/moment',`Take a ${space().minutes}-minute moment`),h('a',{class:'quiet-link',href:'#/products'},'Explore all 15 experiences',icon('arrow',17))),
    h('div',{class:'hero-note'},h('span',{class:'note-dots'},h('i'),h('i'),h('i')),'Your pace. Your way.')),
    h('div',{class:'hero-sculpture','aria-hidden':'true'},h('div',{class:'sculpture-halo'}),h('div',{class:'sculpture-orbit'}),h('div',{class:'sculpture-orbit second'}),h('div',{class:'sculpture-core'},Array.from({length:8},(_,i)=>h('i',{style:{'--petal':i}}))),h('span',{class:'floating-word one'},'a little stillness'),h('span',{class:'floating-word two'},'a fresh perspective'),h('span',{class:'floating-word three'},'room to grow'),h('span',{class:'sculpture-caption'},'THE WORLD INSIDE YOU')));
  const recent=recentItem();
  const path=h('a',{href:'#/moment',class:'daily-ribbon'},h('span',{class:'daily-mark'},icon('path',28)),h('div',{},h('p',{class:'eyebrow'},'Prefer a little guidance?'),h('h3',{},summary().today?'You made a little space today.':'One moment can be a beginning.'),h('p',{},'Choose what you need. Try one useful action. Go at your own pace.')),h('span',{class:'ribbon-link'},'Take a moment',icon('arrow',20)));
  const page=h('section',{class:'page hub-page rise'},hero,
    h('div',{class:'collection-strip'},h('span',{},h('b',{},'15'),' experiences'),h('span',{},h('b',{},'6'),' eBooks'),h('span',{},h('b',{},'30'),' wallpapers'),h('a',{href:'#/tools'},'More ways to explore',icon('arrow',16))),
    recent&&h('a',{class:'continue-strip',href:recent.route},icon('play',18),h('span',{},'Pick up where you left off',h('b',{},recent.title),recent.subtitle&&h('small',{class:'recent-subtitle'},recent.subtitle)),icon('arrow',18)),
    sectionHead('START WITH YOUR MOMENT','What would help right now?','#/moment','Find my moment'),h('div',{class:'situation-grid'},preferredMoments().slice(0,4).map(id=>situationById(id)).map(s=>situationCard(s,true))),
    sectionHead('A WORLD OF SMALL POSSIBILITIES','Find your way in.','#/products','All 15 experiences'),h('div',{class:'product-grid'},['clarity','loop','sanctuary'].map(id=>productCard(productById(id)))),path,
    sectionHead('THE READING ROOM','Good things take a page.','#/ebooks','Explore the books'),h('div',{class:'book-grid home-books',id:'home-books'},h('p',{class:'fine'},'Opening the reading room…')),
    h('a',{class:'wallpaper-banner',href:'#/wallpapers'},h('div',{},h('p',{class:'eyebrow'},'A SMALL REMINDER, EVERY TIME YOU LOOK'),h('h2',{},'Let your screen',h('br'),'say something kinder.'),h('p',{},'30 colourful wallpapers. One useful cue at a time.'),h('span',{class:'text-link'},'Find your wallpaper',icon('arrow',18))),h('div',{class:'banner-phones','aria-hidden':'true'},h('img',{src:'/wallpapers/thumb-03.webp',alt:'',loading:'lazy'}),h('img',{src:'/wallpapers/thumb-01.webp',alt:'',loading:'lazy'}),h('img',{src:'/wallpapers/thumb-08.webp',alt:'',loading:'lazy'}))),
    h('footer',{class:'hub-footer'},h('span',{},'Human Within'),h('p',{},'Made for the many ways of being human.'),h('a',{href:'#/tools'},'Explore more tools',icon('arrow',16))));
  mount(root,page);
  books().then(bs=>{const grid=page.querySelector('#home-books');if(grid?.isConnected)mount(grid,bs.slice(0,3).map(bookCard));}).catch(()=>{});
}

export function renderProducts(root,ctx) {
  ctx.setHue(160); let filter='All experiences',query='';
  const groups=['All experiences','Sound & stillness','Daily practices','Wisdom & belonging','Immersive worlds'];
  const grid=h('div',{class:'product-grid'}),count=h('p',{class:'results-count',role:'status'}),chips=h('div',{class:'chips scroll'});
  const input=h('input',{class:'catalogue-search',type:'search',placeholder:'Search experiences, sounds, practices…','aria-label':'Search experiences',oninput:e=>{query=e.target.value;paint();}});
  function paint(){
    mount(chips,groups.map(g=>h('button',{class:`chip ${g===filter?'on':''}`,'aria-pressed':String(g===filter),onclick:()=>{filter=g;paint();}},g)));
    const list=PRODUCTS.filter(r=>(filter==='All experiences'||r.group===filter)&&`${r.title} ${r.short} ${r.tagline}`.toLowerCase().includes(query.toLowerCase()));
    count.textContent=`${list.length} of 15 experiences`;
    mount(grid,list.length?list.map(productCard):empty('No matches yet.','Try another word or choose a different category.'));
  }
  mount(root,h('section',{class:'page hub-page rise'},h('div',{class:'page-intro'},h('p',{class:'eyebrow'},'YOUR EXPLORATION SPACE'),h('h1',{class:'display'},'Many ways. One you.'),h('p',{class:'lede'},'Sound, reflection, small practices, and worlds to get lost in. Open what calls to you.')),h('div',{class:'search-wrap'},icon('search',21),input),chips,count,grid));paint();
}

export async function renderProduct(root,{id},ctx) {
  const r=productById(id);if(!r)return mount(root,empty('Experience not found.','Choose an experience from Explore.'));
  ctx.setHue(r.hue);const list=h('div',{class:'unit-list'}),sub=h('div',{class:'product-content'}),st=state.view.realms[r.id];
  const progress=sequenceProgress(r.id,r.count||0),next=progress.next;
  const cta=r.id==='rewire'?'#/wallpapers':r.kind==='experience'?`#/experience/${r.id}`:r.id==='protocol'?`#/listen/${next}`:`#/browse/${r.id}/${next}`;
  const intro=h('div',{class:'product-detail-hero',style:{'--tile':r.color,'--tile-ink':r.ink}},h('div',{},h('a',{href:'#/products',class:'back-link'},icon('back',16),'All experiences'),h('p',{class:'eyebrow'},`${r.number} / 15 · ${r.group}`),h('h1',{class:'display'},r.title),h('p',{class:'lede'},r.tagline),h('div',{class:'hero-actions'},goLink(cta,r.id==='rewire'?'Explore all wallpapers':r.kind==='experience'?'Enter experience':progress.visited?'Continue exploring':'Start exploring'),null),h('span',{class:'detail-meta'},r.short)),h('div',{class:'detail-art','aria-hidden':'true'},artEl(r)));
  const page=h('section',{class:'page hub-page rise'},intro,sub);mount(root,page);
  if(r.kind==='experience'){mount(sub,h('div',{class:'experience-about'},h('h2',{},'Make a little space.'),h('p',{class:'lede'},'Open full-screen if you like. Sound begins when you choose it. Come back whenever you need a moment.'),h('div',{class:'chips'},h('span',{class:'chip'},'Open any time'),h('span',{class:'chip'},'Sound controls inside'),h('span',{class:'chip'},'Your pace'))));return;}
  if(r.id==='rewire'){mount(sub,sectionHead('A NEW COLOUR FOR EVERY DAY','All 30 are ready.','#/wallpapers','Open the wallpaper studio'),h('div',{class:'wallpaper-mini-grid'},[1,3,8,14].map(i=>h('a',{href:'#/wallpapers'},h('img',{src:`/wallpapers/thumb-${String(i).padStart(2,'0')}.webp`,alt:`Preview wallpaper ${i}`,loading:'lazy'})))));return;}
  const query=h('input',{type:'search',class:'catalogue-search',placeholder:`Search all ${r.count} ${r.unit.toLowerCase()}s…`,'aria-label':`Search ${r.title}`});
  const tabs=h('div',{class:'chips'});const lessonView=h('div',{class:'lesson-view'},h('div',{class:'search-wrap'},icon('search',20),query),list);const scenariosView=h('div',{class:'escape-view',hidden:true});
  mount(sub,h('div',{class:'section-heading'},h('div',{},h('p',{class:'eyebrow'},'THE COMPLETE COLLECTION'),h('h2',{},r.id==='escape'?'From noticing to choosing.':`Explore every ${r.unit.toLowerCase()}.`)),h('span',{class:'fine'},'Pick any page. Your place is kept.')),r.id==='escape'&&tabs,lessonView,scenariosView);
  if(r.id==='escape'){
    let active='lessons';const paintTabs=()=>mount(tabs,['lessons','situations'].map(t=>h('button',{class:`chip ${active===t?'on':''}`,'aria-pressed':String(active===t),onclick:()=>{active=t;lessonView.hidden=t!=='lessons';scenariosView.hidden=t!=='situations';paintTabs();}},t==='lessons'?'21 lessons':'105 real-life situations')));paintTabs();
    renderEscapeScenarios(scenariosView);
  }
  list.append(h('p',{class:'fine'},'Opening the collection…'));
  const ts=await titlesOf(r.id);if(!page.isConnected)return;
  const paint=()=>{const matches=ts.map((title,i)=>({title,i})).filter(x=>x.title.toLowerCase().includes(query.value.toLowerCase()));mount(list,matches.length?matches.map(({title,i})=>h('a',{class:'unit-row',href:r.id==='protocol'?`#/listen/${i}`:`#/browse/${r.id}/${i}`},h('span',{class:'unit-n'},String(i+1).padStart(2,'0')),h('div',{},h('h3',{},title),h('p',{class:'fine'},`${r.unit} ${i+1}${progress.completed.has(i)?' · completed':''}`)),icon(r.id==='protocol'?'play':'arrow',19))):empty('No matches.','Try another word.'));};query.addEventListener('input',paint);paint();
}

export function renderSituations(root,ctx){ctx.setHue(170);let query='';const grid=h('div',{class:'situation-grid'});const input=h('input',{type:'search',class:'catalogue-search',placeholder:'Try sleep, focus, connection, parenting…','aria-label':'Search situations',oninput:e=>{query=e.target.value;paint();}});function paint(){const s=SITUATIONS.filter(x=>`${x.title} ${x.label} ${x.intro}`.toLowerCase().includes(query.toLowerCase()));mount(grid,s.length?s.map(x=>situationCard(x)):empty('No matches yet.','Try a simpler word, or explore the experiences.'));}mount(root,h('section',{class:'page hub-page rise'},h('div',{class:'page-intro'},h('p',{class:'eyebrow'},'MEET YOUR MOMENT'),h('h1',{class:'display'},'What would help right now?'),h('p',{class:'lede'},'Choose what feels familiar. Start with one small action, then explore a little further.')),h('div',{class:'search-wrap'},icon('search',20),input),grid));paint();}

export function renderSituation(root,{id},ctx){
  const s=situationById(id);if(!s)return mount(root,empty('Situation not found.','Return to the situation finder.'));ctx.setHue(170);
  const shelf=h('div',{class:'book-grid'});const page=h('section',{class:'page hub-page rise'},h('a',{class:'back-link',href:'#/situations'},icon('back',17),'All situations'),h('div',{class:'situation-hero',style:{'--tile':s.color,'--tile-ink':s.ink}},h('div',{},h('p',{class:'eyebrow'},s.label),h('h1',{class:'display'},s.title),h('p',{class:'lede'},s.intro))),h('div',{class:'first-action'},h('span',{class:'action-number'},'01'),h('div',{},h('p',{class:'eyebrow'},'START HERE · NO PREPARATION NEEDED'),h('h2',{},'Try one small thing.'),h('p',{},s.action))),sectionHead('WHEN YOU HAVE A LITTLE MORE SPACE','Something for this moment.'),h('div',{class:'product-grid'},s.products.map(x=>productCard(productById(x)))),sectionHead('A PAGE TO SIT WITH','Keep exploring.'),shelf,s.tool&&h('div',{class:'tools-grid'},toolCard(TOOLS.find(t=>t.id===s.tool))));mount(root,page);books().then(bs=>{if(page.isConnected)mount(shelf,bs.filter(b=>s.books.includes(b.id)).map(bookCard));}).catch(()=>{});
}

async function renderEscapeScenarios(root){
  const res=await fetch('/content/scenarios.json');if(!res.ok)return mount(root,empty('Could not load situations.','Return to the lessons and try again.'));
  const all=await res.json();let category='All',query='';const grid=h('div',{class:'escape-grid'}),chips=h('div',{class:'chips scroll'}),count=h('p',{class:'results-count',role:'status'});const input=h('input',{class:'catalogue-search',type:'search',placeholder:'Search 105 everyday situations…','aria-label':'Search 105 situations',oninput:e=>{query=e.target.value;paint();}});
  const cats=['All','Study','Work','Relationships','Daily life','Online'];
  function paint(){mount(chips,cats.map(c=>h('button',{class:`chip ${c===category?'on':''}`,'aria-pressed':String(c===category),onclick:()=>{category=c;paint();}},c)));const list=all.filter(s=>(category==='All'||s.category===category)&&`${s.title} ${s.action} ${s.theme}`.toLowerCase().includes(query.toLowerCase()));count.textContent=`${list.length} of 105 situations`;mount(grid,list.length?list.map(s=>h('article',{class:'escape-card'},h('p',{class:'eyebrow'},`${s.category} · ${s.theme}`),h('h3',{},s.title),h('p',{},s.action),h('a',{class:'text-link',href:`#/browse/escape/${s.lesson}`},`Explore lesson ${s.lesson+1}`,icon('arrow',16)))):empty('No matches.','Try another category or search.'));}
  mount(root,h('div',{class:'search-wrap'},icon('search',20),input),chips,count,grid);paint();
}

export function empty(title,line){return h('div',{class:'empty-state'},h('h3',{},title),h('p',{class:'fine'},line));}
