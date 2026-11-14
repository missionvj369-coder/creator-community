// A suggested emotional order. Every experience is independent and always open.
export const EXPERIENCE_CHAPTERS = [
  {id:'stillness',name:'Find stillness',word:'Stillness',line:'First, a little room to breathe.',description:'Let sound, space and simple attention soften the noise around you.',colour:'#e2ece4',ink:'#527762',products:['protocol','frequency','sanctuary']},
  {id:'self',name:'Meet yourself',word:'Self',line:'There is a whole world within you.',description:'Follow the human story, from the life you live to the extraordinary processes that make it possible.',colour:'#e3e8ee',ink:'#5e7688',products:['journey','mirror','mirror2']},
  {id:'choice',name:'Make room for choice',word:'Choice',line:'A familiar pattern. A new possibility.',description:'Notice what repeats, loosen an automatic response, and make space for a different perspective.',colour:'#eee7d9',ink:'#8a7650',products:['loop','escape','thoughts']},
  {id:'connection',name:'Feel connected',word:'Connection',line:'Your story belongs to a larger one.',description:'Explore meaning, shared humanity and the many ways people understand belonging.',colour:'#ebe3ed',ink:'#8b7194',products:['awakening','onegod','passage']},
  {id:'return',name:'Carry it into life',word:'Return',line:'Take something gentle with you.',description:'A clear intention, a visual reminder, or a quiet way to end the day. Let the experience meet real life.',colour:'#e8e9dc',ink:'#7b815b',products:['clarity','rewire','sleep']},
  {id:'discovery',name:'Let wonder find you',word:'Discovery',line:'A touch. A surprise. Something of your own.',description:'Play with a small experiment, reveal an invisible world, or let a movement become a work of art.',colour:'#dfe8e0',ink:'#527b67',products:['wonder-engine','the-unseen','creation-field']}
];
export const RETIRED_WRITING_STUDIOS=['mind-unfold','human-bridge','possibility-studio'];
export function retiredWritingRoute(route=''){const [,section,id]=route.split('/');return ['studios','guide','thread','threads'].includes(section)||(section==='home'&&id==='studios')||(['product','experience','read','browse'].includes(section)&&RETIRED_WRITING_STUDIOS.includes(id));}
export const EXPERIENCE_ORDER=EXPERIENCE_CHAPTERS.flatMap(c=>c.products);
export const chapterFor=id=>EXPERIENCE_CHAPTERS.find(c=>c.products.includes(id));
export function experienceNeighbours(id){const i=EXPERIENCE_ORDER.indexOf(id);return {previous:i>0?EXPERIENCE_ORDER[i-1]:null,next:i>=0?EXPERIENCE_ORDER[i+1]||null:null};}
export const EXPERIENCE_INVITATIONS={
  protocol:'Begin with a sound. Let the rest wait.',frequency:'Find a sound for the moment you are in.',sanctuary:'Stay in a quiet world for a little while.',
  journey:'Follow the story of being human.',mirror:'See the wonder in an ordinary human life.',mirror2:'Look again. Another perspective is waiting.',
  loop:'Notice the moment before the usual response.',escape:'Bring a little more choice to everyday life.',thoughts:'Let one small thought widen your view.',
  awakening:'Sit with a question that matters to you.',onegod:'Listen for the humanity between different voices.',passage:'Let the bigger picture unfold around you.',
  clarity:'Choose a thought worth carrying.',rewire:'Give a useful reminder a place in your world.',sleep:'Set the day down, one gentle moment at a time.',
  'wonder-engine':'Touch an experiment. See the familiar differently.','the-unseen':'Reveal the light, warmth and fields beyond ordinary sight.','creation-field':'Shape light with a gesture. Keep something you made.',
  'mind-unfold':'Give the thoughts a place. Leave with one useful move.','human-bridge':'Find your words. Practise a real conversation.','possibility-studio':'See the paths. Make one small beginning.'
};
// Old bookmarks and history continue to open a real, independent experience.
export function independentRoute(route,plan={}){
  if(retiredWritingRoute(route))return '#/home';
  if(!route?.startsWith('#/daily'))return route;
  const id=route.split('/')[2]||plan.draft?.id;
  return EXPERIENCE_ORDER.includes(id)?`#/product/${id}`:'#/home';
}
export function independentProgress(sessions,plan,id,total){
  const prefix=id==='protocol'?'#/listen/':`#/browse/${id}/`;
  const entries=sessions.filter(x=>x.route.startsWith(prefix)&&/^\d+$/.test(x.route.slice(prefix.length))&&Number(x.route.slice(prefix.length))<total);
  const completed=new Set(entries.filter(x=>x.completed).map(x=>Number(x.route.slice(prefix.length))));
  const carried=Math.min(total,plan?.items?.[id]?.completed||0);
  for(let i=0;i<carried;i++)completed.add(i);
  const draft=plan?.draft?.id===id?plan.draft:null;
  const last=entries.at(-1),current=last?Number(last.route.slice(prefix.length)):draft?.idx??carried;
  const done=completed.size>=total;
  const next=done?0:Math.max(0,Math.min(total-1,last?Math.max(carried,current+(last.completed?1:0)):current));
  return {completed,next,visited:!!last||carried>0||!!draft,done};
}
