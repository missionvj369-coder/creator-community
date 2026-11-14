export const STUDIO_IDS=['mind-unfold','human-bridge','possibility-studio'];
export const STUDIO_PRODUCTS=[
 {id:'mind-unfold',title:'Mind Unfold',kind:'studio',role:'create',hue:148,group:'The living studios',short:'A living map of what you’re carrying',tagline:'Put the thoughts down. Give each one a place. Leave with one useful next move.',color:'#dfe9d8',ink:'#56745b',art:'ribbon',need:'There’s too much in my head.',outcome:'A personal clarity map',lead:'You can put it down.',sub:'One thought at a time, turn a crowded head into a little room to move.'},
 {id:'human-bridge',title:'Human Bridge',kind:'studio',role:'create',hue:283,group:'The living studios',short:'Your words · a conversation rehearsal',tagline:'Find honest words, practise a difficult reply, and carry a conversation card into real life.',color:'#e8e0ee',ink:'#81708b',art:'arch',need:'There’s something I need to say.',outcome:'Words you can take with you',lead:'Find the words. Keep the connection.',sub:'Make room for what matters to you, and practise more than one way a conversation could unfold.'},
 {id:'possibility-studio',title:'Possibility Studio',kind:'studio',role:'create',hue:40,group:'The living studios',short:'Your values · your paths · one experiment',tagline:'Compare possibilities against your own priorities. Find a small way to learn before a bigger leap.',color:'#eee6d4',ink:'#8d7c52',art:'orbit',need:'I’m ready for a next chapter.',outcome:'A small experiment in real life',lead:'A possibility becomes a beginning.',sub:'Lay out the paths. Make the trade-offs visible. Choose one small thing to try.'}
];
export const studioMeta=id=>STUDIO_PRODUCTS.find(s=>s.id===id);
let posterSerial=0;
export function studioPoster(id){
 const key=id.replace(/[^a-z-]/g,'')+'-'+(++posterSerial),accent=studioMeta(id)?.ink||'#56745b';
 let shapes='';
 if(id==='mind-unfold'){
  for(let i=0;i<15;i++)shapes+=`<path class="studio-thread" style="--delay:${i*.12}s" d="M${58+i*5} ${45+i*13} C${330-i*6} ${20+i*4},${18+i*9} ${285-i*6},${240+i*3} ${83+(i%4)*45}" stroke="${i%3===0?'#cfc2d7':i%3===1?'#c1cca6':'#e0d4b0'}" stroke-opacity=".44" stroke-width=".8"/>`;
  for(let i=0;i<4;i++)shapes+=`<g class="studio-piece" style="--delay:${i*.25}s" transform="translate(${242+(i%2)*7} ${58+i*48})"><rect width="104" height="38" rx="8" fill="#e2e5cd" fill-opacity="${.15+i*.025}" stroke="#c4d0ae" stroke-opacity=".45"/><path d="M15 14H84M15 22H${55+i*5}" stroke="#dce3c5" stroke-opacity=".6" stroke-linecap="round"/></g>`;
 }else if(id==='human-bridge'){
  shapes='<path d="M75 226C75 72 190 72 190 226" fill="url(#'+key+'-a)" stroke="#d8d7bd" stroke-opacity=".35"/><path d="M210 226C210 72 325 72 325 226" fill="url(#'+key+'-b)" stroke="#e1d4e7" stroke-opacity=".4"/><path class="studio-thread" d="M125 172C153 88 251 254 280 164" stroke="#e8dfbb" stroke-width="1.3"/><circle class="studio-pulse" cx="201" cy="172" r="5" fill="#e8e4c7"/><path d="M75 242H325" stroke="#dce1c5" stroke-opacity=".25"/><rect x="93" y="65" width="93" height="34" rx="17" fill="#ced6b8" fill-opacity=".12"/><rect x="213" y="235" width="93" height="34" rx="17" fill="#d6c5df" fill-opacity=".15"/>';
 }else{
  for(let i=0;i<3;i++){const x=57+i*112,y=i===1?62:87;shapes+=`<g class="studio-piece" style="--delay:${i*.3}s"><path d="M${x} 237V${y+43}a43 43 0 0 1 86 0V237Z" fill="url(#${key}-${i%2?'b':'a'})" stroke="${i===1?'#e8d6a8':'#c4cfb2'}" stroke-opacity=".55"/><path d="M200 291Q${x+43} 260 ${x+43} 200" stroke="#d7d8b5" stroke-opacity=".35" stroke-dasharray="2 5"/><circle cx="${x+43}" cy="${y+86}" r="4" fill="#ded8b5"/></g>`;}
 }
 return `<svg class="studio-poster" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"><defs><linearGradient id="${key}-a" x2=".9" y2="1"><stop stop-color="#d6dfb6" stop-opacity=".6"/><stop offset="1" stop-color="${accent}" stop-opacity=".02"/></linearGradient><linearGradient id="${key}-b" x2="1" y2="1"><stop stop-color="#d7c8df" stop-opacity=".65"/><stop offset="1" stop-color="#c6b4cf" stop-opacity=".02"/></linearGradient></defs><ellipse cx="200" cy="258" rx="144" ry="20" fill="#000" opacity=".08"/>${shapes}</svg>`;
}
