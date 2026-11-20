export const mediaKinds=['music','video','podcast'];

export const mediaProducts = [
  {id:'music',kind:'media',title:'Music',short:'Music library',color:'#dfe8df',ink:'#486858',art:'orbit',hue:150},
  {id:'video',kind:'media',title:'Video',short:'Screening room',color:'#e5e2ef',ink:'#675c88',art:'arch',hue:255},
  {id:'podcast',kind:'media',title:'Podcast',short:'Spoken audio',color:'#efe4da',ink:'#78594b',art:'bloom',hue:25},
];

export const bookIds = ["human-journey", "how-to-work-with-me", "why-am-i-like-this", "growing-mind", "switch-off", "body-you-live-in"];

export const launchFeatures = [
  'protocol','frequency','sanctuary','journey','mirror','mirror2','loop','escape','thoughts',
  'awakening','onegod','passage','clarity','rewire','sleep','music','video','podcast','ebooks','meditate','welcome','support',
  ...bookIds.map(id=>'ebook:'+id),
];

export const legacyMediaRoutes = {'wonder-engine':'music','the-unseen':'video','creation-field':'podcast'};
export const initialMedia = [
  {id:'curiosity',kind:'music',title:'Curiosity',description:'Harp and piano',src:'/cinema/audio/curiosity.m4a',enabled:1,position:10},
  {id:'invisible',kind:'music',title:'Invisible',description:'Bowed strings and glass',src:'/cinema/audio/invisible.m4a',enabled:1,position:20},
  {id:'atelier',kind:'music',title:'Atelier',description:'Warm keys and marimba',src:'/cinema/audio/atelier.m4a',enabled:1,position:30},
  {id:'podcast-welcome',kind:'podcast',title:'Welcome to Human Within',description:'A short spoken introduction',src:'/cinema/audio/home-voice.m4a',enabled:1,position:10},
  {id:'podcast-journey',kind:'podcast',title:'The Human Journey',description:'A short spoken introduction to the collection',src:'/cinema/audio/journey-voice.m4a',enabled:1,position:20},
  {id:'podcast-clarity',kind:'podcast',title:'Clarity',description:'A short spoken introduction to the practice',src:'/cinema/audio/clarity-voice.m4a',enabled:1,position:30},
  {id:'welcome',kind:'video',title:'Human Within · Welcome',description:'The original welcome film',src:'/videos/welcome-flow.mp4',poster:'/videos/intro-1.webp',enabled:1,position:10},
];

let settings={title:'Human Within',notice:'',disabled:[],media:initialMedia,payment:null};
export const siteSettings=()=>settings;
export const enabled=id=>!settings.disabled.includes(id);
export async function loadSiteSettings(){
  try{
    const response=await fetch('/api/site',{signal:AbortSignal.timeout(3000)});
    if(response.ok&&response.headers.get('content-type')?.includes('application/json')){
      const next=await response.json();
      if(Array.isArray(next.disabled)&&Array.isArray(next.media))settings=next;
    }
  }catch{}
}
