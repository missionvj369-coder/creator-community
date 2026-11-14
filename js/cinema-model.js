// A distinct musical identity for every original experience.
export const CINEMA_SCENES={
 discover:{score:'curiosity',name:'The discovery rooms',mood:'Harp · piano · a little wonder'},'wonder-engine':{score:'curiosity',name:'Wonder Engine',mood:'Harp · piano · a little wonder'},'the-unseen':{score:'invisible',name:'The Unseen',mood:'Bowed strings · distant glass'},'creation-field':{score:'atelier',name:'The Creation Field',mood:'Warm keys · marimba · flowing strings'},
 home:{score:'arrival',name:'A world within you',mood:'Piano · strings · open air'},arrival:{score:'arrival',name:'A quiet arrival',mood:'Warm piano · a soft horizon'},
 ebooks:{score:'reading',name:'The reading room',mood:'Felt piano · soft cello'},you:{score:'homeward',name:'Your space',mood:'Warm keys · a quiet return'},
 protocol:{score:'stillness',name:'Sound Reset',mood:'Water · suspended strings'},frequency:{score:'resonance',name:'Frequency',mood:'Bowed glass · gentle harmonics'},
 sanctuary:{score:'sanctuary',name:'The Human Sanctuary',mood:'Harp · woodland air · strings'},journey:{score:'origins',name:'The Human Journey',mood:'Piano · cello · a widening horizon'},
 mirror:{score:'reflection',name:'The Human Mirror',mood:'Felt piano · silver air'},mirror2:{score:'wonder',name:'The Human Mirror, Reimagined',mood:'Harp · strings · a little wonder'},
 loop:{score:'patterns',name:'The Loop',mood:'Piano figures · quiet movement'},escape:{score:'opening',name:'Matrix Escape',mood:'Muted keys · opening strings'},
 thoughts:{score:'connection',name:'ONE',mood:'Harp · interwoven strings'},awakening:{score:'unfolding',name:'Sixty-Six Days of Awakening',mood:'Piano · viola · first light'},
 onegod:{score:'belonging',name:'One God, One Voice',mood:'Warm strings · a shared horizon'},passage:{score:'passage',name:'The Passage',mood:'Deep strings · distant bells'},
 clarity:{score:'firstlight',name:'Clarity',mood:'Felt piano · morning air'},rewire:{score:'perspective',name:'Rewire',mood:'Harp · marimba · soft light'},
 wallpapers:{score:'perspective',name:'The pocket gallery',mood:'Harp · marimba · soft light'},sleep:{score:'nightfall',name:'Twenty Minutes Down',mood:'Velvet strings · a quiet shore'},
 'mind-unfold':{score:'patterns',name:'Mind Unfold',mood:'Quiet piano · room to think'},'human-bridge':{score:'connection',name:'Human Bridge',mood:'Interwoven strings · a little connection'},'possibility-studio':{score:'opening',name:'Possibility Studio',mood:'Muted keys · an opening horizon'},
 body:{score:'living',name:'Know Your Body',mood:'Piano · cello · living wonder'}
};
export const cinemaScene=id=>CINEMA_SCENES[id]||CINEMA_SCENES.home;
export function sceneForRoute(hash){const [,seg,id]=String(hash).split('/');if(['product','read','browse','experience'].includes(seg))return id==='know-your-body'?'body':CINEMA_SCENES[id]?id:'home';if(['listen','session'].includes(seg))return 'protocol';if(['book','library','ebooks'].includes(seg))return 'ebooks';if(['meditate','arrive','welcome'].includes(seg))return 'arrival';return CINEMA_SCENES[seg]?seg:'home';}
export function normaliseSound(input={}){const v=input&&typeof input==='object'?input:{};const num=(x,d)=>x!==null&&Number.isFinite(Number(x))?Math.max(0,Math.min(1,Number(x))):d;return {enabled:v.enabled===true,music:v.music!==false,effects:v.effects!==false,guidance:v.guidance!==false,volume:num(v.volume,.55),musicLevel:num(v.musicLevel,.6),voiceLevel:num(v.voiceLevel,.9)};}
export function scoreLevel(p,{hidden=false,held=false,ducked=false}={}){return !p.enabled||!p.music||hidden||held?0:p.musicLevel*(ducked?.22:1);}
