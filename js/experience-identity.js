import { immersiveWorld } from './immersive-model.js?v=18214deeb83d6066';
import { worldPoster } from './immersive-world.js?v=18214deeb83d6066';

// The native experiences keep their original engines. These identities connect
// their entrances, collection cards, viewer chrome and gentle return screens.
export const PORTAL_IDENTITIES = {
  protocol:{page:'#081d21',accent:'#a8dbd5',rgb:'168,219,213',kind:'waves',line:'A room made of sound.',caption:'LISTEN · BREATHE · RETURN',intro:'Choose one three-minute session. A quiet sound, a simple breathing visual, and a little space for your attention.',enter:'Begin a sound session',inside:'Let listening be enough.',steps:[['Choose a sound','Open any of the 21 sessions, or continue where you left off.'],['Settle in','Begin when you are ready. Keep the volume comfortable and follow the visual if it feels useful.'],['Return in your own time','Pause or end at any point. Your place stays here.']]},
  frequency:{page:'#1b1d0c',accent:'#d8dba1',rgb:'216,219,161',kind:'harmonics',line:'Find your own resonance.',caption:'TUNE · EXPLORE · LISTEN',intro:'A sound playground for the moment you are in. Explore the scenarios, adjust the sound, and make the space your own.',enter:'Enter the sound playground',inside:'Curiosity is the only starting point.',steps:[['Find a moment','Explore 99 sound scenarios and choose one that interests you.'],['Make it yours','Use the controls to explore sound at a comfortable volume.'],['Stay or wander','There is no required order. Change the sound or leave whenever you like.']]},
  sanctuary:{page:'#091b18',accent:'#c4d8b0',rgb:'196,216,176',kind:'sanctum',line:'Nothing to become. Just be.',caption:'SPACE · LIGHT · STILLNESS',intro:'Fourteen scenes of quiet. Enter a world of light and space, let your attention rest, and stay for a while.',enter:'Enter the sanctuary',inside:'A place with nothing to prove.',steps:[['Enter softly','Open the sanctuary and meet its quiet visual world.'],['Follow what draws you','Explore the scenes at your own pace. Sound is a choice.'],['Leave gently','Return whenever you want. You do not need to finish anything.']]},
  mirror:{page:'#0b1924',accent:'#afcedd',rgb:'175,206,221',kind:'reflection',line:'The extraordinary, within.',caption:'LIFE · WONDER · PERSPECTIVE',intro:'Fourteen worlds that turn attention toward being human. Follow a visual thought and see something familiar in a new way.',enter:'Enter the human mirror',inside:'Look closely. Then look again.',steps:[['Meet a world','Begin with one of fourteen visual discoveries.'],['Give it a moment','Watch, explore and read what catches your attention.'],['Carry a thought','Keep a perspective that feels useful, then return to your own world.']]},
  mirror2:{page:'#241312',accent:'#e0b9a3',rgb:'224,185,163',kind:'thread',line:'Many worlds. One shared life.',caption:'ORIGINS · LIFE · OUR SHARED WORLD',intro:'One living sculpture, thirty-six worlds. Follow an eighteen-minute journey through the universe, life, the mind, and the world we make together.',enter:'Follow the living thread',inside:'Let one thread become a wider view.',steps:[['Begin the journey','Follow the changing sculpture, or choose a world from the chapter map.'],['Pause for a thought','Stop anywhere. Open an insight, turn the sculpture, or choose a quiet view.'],['Bring it into life','Each world offers a thought to carry and a small practical invitation.']]},
  passage:{page:'#081d25',accent:'#a3d6df',rgb:'163,214,223',kind:'passage',line:'Let the horizon open.',caption:'SEVEN WORLDS · ONE PASSAGE',intro:'A ten-minute audiovisual voyage through seven worlds. Let the scenes unfold around you and follow the passage at your own pace.',enter:'Begin the passage',inside:'A little room for the bigger picture.',steps:[['Step inside','Begin the voyage when you have a little space.'],['Let the scenes unfold','Travel through seven audiovisual worlds. Keep sound at a comfortable level.'],['Return with room','Leave when you are ready. Another experience will be here if you want it.']]},
  rewire:{page:'#191329',accent:'#c8b6e4',rgb:'200,182,228',kind:'wallpapers',line:'A thought, beautifully kept.',caption:'THIRTY ORIGINALS · YOUR POCKET GALLERY',intro:'Thirty individual artworks for your screen. Find a useful reminder, download it, and give it a place in everyday life.',enter:'Open the wallpaper studio',inside:'From a moment here to a reminder out there.',steps:[['Find your artwork','Explore thirty distinct wallpaper designs.'],['Keep the original','Preview an artwork and download the full wallpaper.'],['Make it part of your world','Set it as your wallpaper using your device’s photo or wallpaper settings.']]},
  sleep:{page:'#101425',accent:'#bebee1',rgb:'190,190,225',kind:'night',line:'Let the day grow quiet.',caption:'TWENTY GUIDED · TWENTY FADING',intro:'A forty-minute wind-down: twenty minutes of guided settling, followed by twenty minutes of sound fading toward silence.',enter:'Begin the evening wind-down',inside:'There is nothing left to keep up with.',steps:[['Make yourself comfortable','Choose a safe place to rest and keep the volume just audible.'],['Follow the gentle guidance','Let the breathing visual and voice guide the first twenty minutes. Breathe normally whenever you prefer.'],['Let sound fade','The next twenty minutes become quieter. You can end the session at any time.']]}
};

export function experienceIdentity(id){return immersiveWorld(id)||PORTAL_IDENTITIES[id]||null;}
const n=v=>Number(v.toFixed(2));
const path=points=>points.map((p,i)=>`${i?'L':'M'}${n(p[0])},${n(p[1])}`).join(' ');

export function experiencePoster(id){
  if(immersiveWorld(id))return worldPoster(id);
  const w=PORTAL_IDENTITIES[id];if(!w)return '';
  const ink=w.accent;let body='';
  const stroke=(d,opacity=.5,width=.8)=>`<path d="${d}" fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
  const ellipse=(cx,cy,rx,ry,op=.3)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${ink}" stroke-opacity="${op}" stroke-width=".7"/>`;
  if(w.kind==='waves'){
    for(let j=0;j<37;j++)body+=stroke(path(Array.from({length:100},(_,i)=>{const x=22+i*3.6;return[x,150+(j-18)*2+Math.sin(i/11+j*.14)*Math.exp(-(((i-50)/32)**2))*(18+j*.5)];})),.12+Math.sin(j/36*Math.PI)*.55);
    body+=ellipse(200,155,105,77,.15);
  }else if(w.kind==='harmonics'){
    for(let j=0;j<32;j++)body+=stroke(path(Array.from({length:181},(_,i)=>{const a=i/180*Math.PI*2;return[200+Math.sin(a*3+j*.013)*(96+j*.7),150+Math.cos(a*2+j*.018)*(76+j*.6)];})),.15+j/110,.55);
  }else if(w.kind==='sanctum'){
    for(let j=0;j<13;j++){const d=j*5;body+=`<path d="M${80+d} 258V126 A${120-d} ${120-d} 0 0 1 ${320-d} 126 V258" fill="${ink}" fill-opacity=".008" stroke="${ink}" stroke-opacity="${.1+j*.035}" stroke-width=".8"/>`;}
    body+=`<ellipse cx="200" cy="255" rx="104" ry="13" fill="${ink}" fill-opacity=".06"/>`;
    body+=ellipse(200,255,115,18,.28)+ellipse(200,252,70,9,.2);
  }else if(w.kind==='reflection'){
    for(let j=0;j<35;j++){const d=j*1.6;body+=stroke(`M${200-d} ${55+j} C${90-d*.2} ${65+j},${121+d*.5} 127,${155-d*.2} 152 C${102+d*.5} 160,${170-d*.2} 173,${200-d} ${245-j}`, .13+j/100);body+=stroke(`M${200+d} ${55+j} C${310+d*.2} ${65+j},${279-d*.5} 127,${245+d*.2} 152 C${298-d*.5} 160,${230+d*.2} 173,${200+d} ${245-j}`, .13+j/100);}
  }else if(w.kind==='thread'){
    for(let j=0;j<28;j++)body+=stroke(path(Array.from({length:150},(_,i)=>{const t=i/149*Math.PI*4,r=55+Math.sin(t/2)*29+j*.8;return[200+Math.sin(t)*r,35+i/149*230+Math.cos(t)*13];})),.14+j/95,.6);
  }else if(w.kind==='passage'){
    for(let j=0;j<15;j++){const r=24+j*9;body+=`<ellipse cx="200" cy="150" rx="${r}" ry="${r*.72}" transform="rotate(${j*4-25} 200 150)" fill="${ink}" fill-opacity=".006" stroke="${ink}" stroke-opacity="${.75-j*.039}" stroke-width=".8"/>`;}
    body+=`<circle cx="200" cy="150" r="3" fill="${ink}" opacity=".8"/>`;
  }else if(w.kind==='wallpapers'){
    const art=[3,14,8];for(let j=0;j<3;j++){const x=77+j*79,y=j===1?44:68;body+=`<g transform="rotate(${(j-1)*12} ${x+45} 150)"><rect x="${x-1}" y="${y-1}" width="93" height="${j===1?192:170}" rx="13" fill="${ink}" fill-opacity=".09" stroke="${ink}" stroke-opacity=".4"/><image href="/wallpapers/thumb-${String(art[j]).padStart(2,'0')}.webp" x="${x+4}" y="${y+4}" width="83" height="${j===1?182:160}" preserveAspectRatio="xMidYMid slice"/></g>`;}
  }else if(w.kind==='night'){
    for(let j=0;j<24;j++)body+=ellipse(200,145,45+j*4,45+j*3,.025+j*.009);
    body+=`<path d="M222 80A75 75 0 1 0 259 194A80 80 0 0 1 222 80Z" fill="${ink}" fill-opacity=".13" stroke="${ink}" stroke-opacity=".7" stroke-width=".8"/>`;
    for(let j=0;j<23;j++){const x=48+(j*71%306),y=28+(j*47%235);body+=`<circle cx="${x}" cy="${y}" r="${j%3?.65:1}" fill="${ink}" opacity="${.16+j%4*.09}"/>`;}
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none" aria-hidden="true" data-world-art="${w.kind}">${body}</svg>`;
}
