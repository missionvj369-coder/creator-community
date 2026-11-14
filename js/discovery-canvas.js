import {clamp,seeded,colourMix,waveValue,fallingPosition,pendulumOffset,magneticField} from './discovery-model.js?v=18214deeb83d6066';
import {CREATION_PALETTES} from './discovery-meta.js?v=18214deeb83d6066';
const TAU=Math.PI*2;
function disc(g,x,y,r,fill){g.beginPath();g.arc(x,y,Math.max(0,r),0,TAU);g.fillStyle=fill;g.fill();}
function line(g,x,y,xx,yy,colour,width=1){g.beginPath();g.moveTo(x,y);g.lineTo(xx,yy);g.strokeStyle=colour;g.lineWidth=width;g.stroke();}
function round(g,x,y,w,h,r,fill){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);g.fillStyle=fill;g.fill();}
function ellipse(g,x,y,rx,ry,fill){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);g.fillStyle=fill;g.fill();}
function glow(g,x,y,r,colour,alpha=1){g.save();g.globalAlpha=alpha;const c=g.createRadialGradient(x,y,0,x,y,r);c.addColorStop(0,colour);c.addColorStop(1,colour+'00');disc(g,x,y,r,c);g.restore();}
function metal(g,x,y,r,col='#e0c697'){const c=g.createRadialGradient(x-r*.4,y-r*.48,r*.02,x,y,r);c.addColorStop(0,'#fff5dc');c.addColorStop(.25,col);c.addColorStop(.7,colourMix(col,'#14271e',.38));c.addColorStop(1,'#0a1915');disc(g,x,y,r,c);}
function backdrop(g,w,h,col='#14251f'){g.clearRect(0,0,w,h);g.fillStyle=col;g.fillRect(0,0,w,h);const a=g.createRadialGradient(w*.55,h*.42,0,w*.55,h*.5,Math.max(w,h)*.8);a.addColorStop(0,'#b9b89918');a.addColorStop(1,'#00000025');g.fillStyle=a;g.fillRect(0,0,w,h);}
function caption(g,w,h,text){g.save();g.fillStyle='#dedbc28a';g.textAlign='center';g.font=`${Math.max(8,Math.min(11,w/46))}px Arial,sans-serif`;g.letterSpacing=w<480?'.5px':'2px';g.fillText(text,w*.5,h*.91,w*.88);g.restore();}
export function renderWonder(g,w,h,{scene,value=.5,time=0,dropAt=null},cache=new Map()){
 backdrop(g,w,h);const s=Math.min(w,h),cx=w*.5,cy=h*.46;
 if(scene==='contrast'){
  const r=s*.16,span=s*.25;
  for(const [x,base]of [[cx-span,'#78917b'],[cx+span,'#172c21']]){
   ellipse(g,x,cy+r*1.7,r*1.2,r*.12,'#00000038');disc(g,x,cy,r*1.52,colourMix(base,'#405c49',value));g.lineWidth=1;g.strokeStyle='#d9d4b733';g.stroke();disc(g,x,cy,r*.55,'#b9bcad');
  }
  const y=cy+s*.35;line(g,cx-span,y,cx+span,y,'#cdc5a450');disc(g,cx-span,y,2,'#ddd5bb');disc(g,cx+span,y,2,'#ddd5bb');caption(g,w,h,value>.95?'SAME COLOUR · SAME SURROUNDINGS':'SAME COLOUR · DIFFERENT SURROUNDINGS');
 }else if(scene==='contour'){
  const r=s*.36;ellipse(g,cx,cy+r*.85,r*.9,r*.12,'#00000030');disc(g,cx,cy,r,'#eee9d8');g.strokeStyle='#ffffff55';g.lineWidth=1;g.stroke();
  const pts=[[cx,cy-r*.58],[cx-r*.57,cy+r*.4],[cx+r*.57,cy+r*.4]];
  for(const [x,y]of pts){const toward=Math.atan2(cy-y,cx-x)+value*Math.PI*.9,cut=Math.PI/3;g.beginPath();g.moveTo(x,y);g.arc(x,y,r*.26,toward+cut*.5,toward+TAU-cut*.5);g.closePath();g.fillStyle='#25382e';g.fill();}
  caption(g,w,h,value<.12?'THREE FRAGMENTS. AN UNDRAWN SURFACE.':'THE SUGGESTION CHANGES WITH THE FRAGMENTS');
 }else if(scene==='waves'){
  const n=112;let c=cache.get('wave');if(!c){const canvas=document.createElement('canvas');canvas.width=canvas.height=n;c={canvas,g:canvas.getContext('2d'),image:null};c.image=c.g.createImageData(n,n);cache.set('wave',c);}
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const z=waveValue(x/n,y/n,time,value),light=clamp(.42+z*.23+Math.pow(Math.abs(z),7)*.38),i=(y*n+x)*4;c.image.data[i]=49+light*128;c.image.data[i+1]=76+light*135;c.image.data[i+2]=68+light*108;c.image.data[i+3]=255;}c.g.putImageData(c.image,0,0);
  ellipse(g,cx,cy+s*.28,s*.43,s*.065,'#00000050');g.save();g.beginPath();g.ellipse(cx,cy,s*.43,s*.3,0,0,TAU);g.clip();g.drawImage(c.canvas,cx-s*.43,cy-s*.3,s*.86,s*.6);g.restore();g.beginPath();g.ellipse(cx,cy,s*.43,s*.3,0,0,TAU);g.strokeStyle='#dbdfc478';g.lineWidth=1.5;g.stroke();
  const sep=.13+value*.22;for(const x of [cx-sep*s*.86,cx+sep*s*.86]){glow(g,x,cy,18,'#dcd0a0',.4);metal(g,x,cy,5);}
  caption(g,w,h,'TWO SOURCES · ONE SHARED SURFACE');
 }else if(scene==='fall'){
  const top=h*.18,bottom=h*.76,boxW=s*.63;round(g,cx-boxW*.5,top-s*.07,boxW,bottom-top+s*.16,s*.16,'#d7e1cd09');g.strokeStyle='#ccdbbf32';g.lineWidth=1;g.stroke();
  line(g,cx-boxW*.38,bottom,cx+boxW*.38,bottom,'#c5c5a878',1.5);const age=dropAt===null?0:Math.max(0,(time-dropAt)*.35);
  const yh=top+(bottom-top)*fallingPosition(age,value,false),yf=top+(bottom-top)*fallingPosition(age,value,true);
  g.save();g.translate(cx-s*.15,yh);g.rotate(-.28);round(g,-s*.009,-s*.012,s*.018,s*.09,2,'#977252');const a=g.createLinearGradient(-25,-12,25,12);a.addColorStop(0,'#d4d7c7');a.addColorStop(.5,'#7a887b');a.addColorStop(1,'#dae2c9');round(g,-s*.044,-s*.025,s*.088,s*.046,3,a);g.restore();
  g.save();g.translate(cx+s*.15,yf);g.rotate(-.22);g.beginPath();g.moveTo(0,s*.055);g.bezierCurveTo(-s*.06,0,-s*.018,-s*.085,s*.025,-s*.08);g.bezierCurveTo(s*.063,-s*.01,s*.018,s*.03,0,s*.055);g.fillStyle='#d9d6c0';g.fill();line(g,0,s*.068,s*.02,-s*.076,'#637a64',1);for(let i=0;i<6;i++)line(g,s*.003,s*.04-i*s*.016,-s*.022,s*.012-i*s*.012,'#7c8e7466',.8);g.restore();
  caption(g,w,h,value<.02?'AIR REMOVED · THE SAME ACCELERATION':'AIR PRESENT · DIFFERENT RESISTANCE');
 }else{
  const count=14,top=h*.18,phase=time+value*60;line(g,w*.13,top,w*.87,top,'#c7ccad50',2);
  for(let i=0;i<count;i++){const ax=w*.19+i*w*.0465,L=h*(.51-i*.013),theta=pendulumOffset(i,phase,.48),x=ax+Math.sin(theta)*L*.42,y=top+Math.cos(theta)*L;line(g,ax,top,x,y,'#b6c4a16a',.85);disc(g,ax,top,1.5,'#b7c3a7');ellipse(g,x,y+12,10,2,'#00000038');metal(g,x,y,s*(.014+i*.00038),i%3===0?'#c9b5ce':'#d6c28e');}
  caption(g,w,h,'MANY RHYTHMS · ONE RETURN');
 }
}
function nebulaLayer(w,h,infrared){
 const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));const g=c.getContext('2d');backdrop(g,w,h,'#101724');const random=seeded(7219),s=Math.min(w,h);
 glow(g,w*.67,h*.23,s*.7,infrared?'#8d84bc':'#936989',.23);
 const clouds=[[.3,.76,.10,.41],[.49,.84,.09,.30],[.65,.86,.07,.23]];
 for(const [px,py,rx,ry]of clouds){
  for(let k=16;k>=0;k--){const x=w*px+Math.sin(k*1.3)*s*.018,y=h*py-k*s*.018,r=s*(rx+k*.004);g.globalAlpha=(infrared?.018:.035);ellipse(g,x,y,r,s*ry*(.6+k*.022),infrared?'#9291b5':'#b4829c');}
 }
 g.globalAlpha=1;
 for(let i=0;i<560;i++){const x=random()*w,y=random()*h,bright=random(),r=.4+random()*(bright>.96?2.3:.8);const hidden=clouds.some(([px,py,rx,ry])=>Math.pow((x/w-px)/(rx*1.5),2)+Math.pow((y/h-py)/ry,2)<1);
  if(!infrared&&hidden&&bright<.96)continue;const alpha=infrared?.18+bright*.65:.14+bright*.45;if(bright>.972)glow(g,x,y,r*7,infrared?'#d1bee1':'#e3bca4',.35);g.globalAlpha=alpha;disc(g,x,y,r,bright>.8?'#f0dfcc':'#bac4d5');if(bright>.98){line(g,x-r*3,y,x+r*3,y,'#ebe1d78a',.6);line(g,x,y-r*3,x,y+r*3,'#ebe1d78a',.6);}g.globalAlpha=1;
 }
 return c;
}
function warmRoom(g,w,h,thermal,heat=.85){
 backdrop(g,w,h,thermal?'#201c38':'#1b2929');const s=Math.min(w,h),cx=w*.51,cy=h*.48;
 ellipse(g,cx,cy+s*.29,s*.34,s*.06,thermal?'#424063':'#00000040');
 const fill=thermal?colourMix('#a77fa9','#f5c789',heat):'#d3cdb3',shade=thermal?'#b45d91':'#75887a';
 const grad=g.createLinearGradient(cx-s*.16,0,cx+s*.17,0);grad.addColorStop(0,shade);grad.addColorStop(.4,fill);grad.addColorStop(1,thermal?'#cf7c9b':'#b7bea7');
 g.beginPath();g.moveTo(cx-s*.17,cy-s*.07);g.lineTo(cx-s*.14,cy+s*.25);g.quadraticCurveTo(cx,cy+s*.3,cx+s*.14,cy+s*.25);g.lineTo(cx+s*.17,cy-s*.07);g.closePath();g.fillStyle=grad;g.fill();
 g.beginPath();g.ellipse(cx+s*.18,cy+s*.06,s*.09,s*.115,0,-Math.PI/2,Math.PI/2);g.strokeStyle=thermal?'#e5949f':'#c2c5af';g.lineWidth=s*.025;g.stroke();ellipse(g,cx,cy-s*.07,s*.17,s*.045,thermal?'#efc395':'#e0deca');ellipse(g,cx,cy-s*.075,s*.143,s*.028,thermal?'#f6ddad':'#3d3730');
 for(let i=0;i<4;i++){g.beginPath();g.moveTo(cx+s*(i*.055-.08),cy-s*.13);g.bezierCurveTo(cx+s*(i*.05-.14),cy-s*.24,cx+s*(i*.055-.02),cy-s*.29,cx+s*(i*.05-.09),cy-s*.4);g.strokeStyle=thermal?`rgba(223,154,180,${.2+heat*.3})`:'#ded9c625';g.lineWidth=thermal?8:1.3;g.stroke();}
 const px=cx-s*.33,py=cy+s*.23;round(g,px-s*.055,py-s*.14,s*.11,s*.13,6,thermal?'#665d87':'#81927c');line(g,px,py-s*.12,px,py-s*.39,thermal?'#7e75a0':'#a4b49a',2);g.save();g.translate(px,py-s*.31);g.rotate(-.6);ellipse(g,0,0,s*.035,s*.09,thermal?'#7e75a0':'#718c6b');g.restore();
 metal(g,cx+s*.34,cy+s*.24,s*.07,thermal?'#736b98':'#899d8c');
}
function magnetRoom(g,w,h,reveal,angle,time){
 backdrop(g,w,h,'#1c2430');const s=Math.min(w,h),cx=w*.5,cy=h*.5,a=angle*TAU;
 if(reveal){g.save();g.translate(cx,cy);g.rotate(a);g.scale(s*.24,s*.24);for(let j=0;j<9;j++){const r0=.9+j*.29;for(const sign of [1,-1]){g.beginPath();for(let i=0;i<=110;i++){const th=Math.PI*i/110,r=r0*Math.sin(th)**2,x=r*Math.cos(th),y=r*Math.sin(th)*sign;i?g.lineTo(x,y):g.moveTo(x,y);}g.strokeStyle=j%2?'#a9b6d451':'#e5d4b45e';g.lineWidth=.004;g.stroke();const th=.2+((time*.11+j*.11)%1)*2.7,r=r0*Math.sin(th)**2;disc(g,r*Math.cos(th),r*Math.sin(th)*sign,.012,'#dcd3b9');}}g.restore();
  const step=s*.053;for(let y=cy-s*.43;y<cy+s*.44;y+=step)for(let x=cx-s*.47;x<cx+s*.48;x+=step){const X=(x-cx)/(s*.32),Y=(y-cy)/(s*.32),[bx,by]=magneticField(X,Y,a),b=Math.atan2(by,bx);if(Math.abs(X*Math.cos(a)+Y*Math.sin(a))<.65&&Math.abs(-X*Math.sin(a)+Y*Math.cos(a))<.19)continue;line(g,x-Math.cos(b)*2,y-Math.sin(b)*2,x+Math.cos(b)*2,y+Math.sin(b)*2,'#c7c1d040',.7);}
 }
 g.save();g.translate(cx,cy);g.rotate(a);const gradient=g.createLinearGradient(-s*.2,-s*.04,s*.2,s*.04);gradient.addColorStop(0,'#e0c79d');gradient.addColorStop(.49,'#9d906f');gradient.addColorStop(.5,'#c9ced4');gradient.addColorStop(1,'#82949e');round(g,-s*.2,-s*.046,s*.4,s*.092,s*.024,gradient);g.fillStyle='#26372e';g.textAlign='center';g.font=`600 ${Math.max(11,s*.025)}px Arial`;g.fillText('N',-s*.13,4);g.fillText('S',s*.13,4);g.restore();
}
export function renderUnseen(g,w,h,{scene,value=.5,time=0,angle=.12,heat=.85},cache=new Map()){
 const key=`${scene}-${Math.round(w)}-${Math.round(h)}`;const x=w*(1-clamp(value));
 const layer=thermal=>{
  if(scene==='starlight'){let c=cache.get(key+'-'+thermal);if(!c){c=nebulaLayer(w,h,thermal);if(cache.size>6)cache.clear();cache.set(key+'-'+thermal,c);}g.drawImage(c,0,0,w,h);}
  else if(scene==='warmth')warmRoom(g,w,h,thermal,heat);
  else magnetRoom(g,w,h,thermal,angle,time);
 };
 layer(false);g.save();g.beginPath();g.rect(x,0,w-x,h);g.clip();layer(true);g.restore();
 line(g,x,0,x,h,'#e3d9e4b3',1);glow(g,x,h*.5,24,'#dbcee1',.14);disc(g,x,h*.5,15,'#18232b');g.strokeStyle='#dcd2deaa';g.lineWidth=1;g.stroke();line(g,x-7,h*.5,x-2,h*.5,'#ded8df',1);line(g,x+2,h*.5,x+7,h*.5,'#ded8df',1);
}
function ribbon(g,points,col,width,alpha=1){if(points.length<2)return;g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.lineCap='round';g.lineJoin='round';g.strokeStyle=col;g.globalAlpha=alpha;g.lineWidth=width;g.stroke();g.globalAlpha=1;}
export function renderCreation(g,w,h,art,time=0,live=null){
 const p=CREATION_PALETTES[art.palette]||CREATION_PALETTES.aurora,rand=seeded(art.seed),s=Math.min(w,h),phase=TAU*(time%6)/6;backdrop(g,w,h,p.background);glow(g,w*.55,h*.43,s*.66,p.colours[0],.10);
 const all=live?.length?[...art.strokes,live]:art.strokes,last=all.at(-1)?.at(-1),cx=w*(last?.[0]===undefined ? .5 : .3+last[0]*.4),cy=h*(last?.[1]===undefined ? .5 : .3+last[1]*.4);
 if(art.style==='silk'){
  const seed=rand()*TAU;
  for(let i=0;i<52;i++){const points=[],offset=(i-26)*s*.0045;for(let k=0;k<=80;k++){const u=k/80,x=w*(-.1+u*1.2),envelope=Math.sin(u*Math.PI),y=h*.5+offset+Math.sin(u*TAU+seed+Math.sin(phase)*.15)*s*.18*envelope+Math.sin(u*Math.PI*3+seed)*s*.12+(last?(last[1]-.5)*s*.28*Math.exp(-((u-last[0])**2)/.07):0);points.push([x,y]);}ribbon(g,points,p.colours[Math.floor(i/13)%4],Math.max(.6,s*.0014),.14+Math.sin(i/52*Math.PI)*.55);}
 }else if(art.style==='bloom'){
  const count=70,twist=rand()*TAU;ellipse(g,cx,cy+s*.28,s*.3,s*.045,'#00000035');
  for(let i=count;i>0;i--){const u=i/count,a=i*2.399963+twist,r=s*.35*Math.sqrt(u),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.78,len=s*(.07+u*.14),width=len*.43,turn=a+Math.sin(phase)*.08;g.save();g.translate(x,y);g.rotate(turn);const c=g.createLinearGradient(0,-len,0,len*.4);c.addColorStop(0,p.colours[i%4]);c.addColorStop(.55,colourMix(p.colours[i%4],p.background,.2));c.addColorStop(1,p.background);g.beginPath();g.moveTo(0,len*.3);g.bezierCurveTo(-width,len*.08,-width,-len*.55,0,-len);g.bezierCurveTo(width,-len*.55,width,len*.08,0,len*.3);g.fillStyle=c;g.fill();g.strokeStyle='#ffffff18';g.lineWidth=.5;g.stroke();g.restore();}
  metal(g,cx,cy,s*.035,p.colours[3]);
 }else{
  const tilt=(last?.[0]||.5)*.5,turn=rand()*TAU;
  for(let j=0;j<8;j++){const points=[],a=j*.35+turn,rx=s*(.19+j*.025),ry=s*(.06+j*.015);for(let i=0;i<=100;i++){const u=i/100*TAU;const X=Math.cos(u)*rx,Y=Math.sin(u)*ry;points.push([cx+X*Math.cos(a)-Y*Math.sin(a),cy+X*Math.sin(a)+Y*Math.cos(a)*(1+tilt)]);}ribbon(g,points,p.colours[j%4],s*.0014,.42);const u=phase+(j/8)*TAU,X=Math.cos(u)*rx,Y=Math.sin(u)*ry;const x=cx+X*Math.cos(a)-Y*Math.sin(a),y=cy+X*Math.sin(a)+Y*Math.cos(a)*(1+tilt);glow(g,x,y,s*.035,p.colours[j%4],.32);metal(g,x,y,s*.012,p.colours[j%4]);}
 }
 // A gesture becomes a family of living strands, rather than an ink line.
 for(let j=0;j<all.length;j++){const stroke=all[j];for(let k=0;k<7;k++){const points=stroke.map((point,i)=>{const next=stroke[Math.min(i+1,stroke.length-1)],prev=stroke[Math.max(0,i-1)],dx=next[0]-prev[0],dy=next[1]-prev[1],length=Math.hypot(dx*w,dy*h)||1,spread=(k-3)*s*.006*(.4+Math.sin(i/(stroke.length||1)*Math.PI)),wind=Math.sin(phase+i*.17+j)*s*.002;return [point[0]*w-dy*h/length*spread+wind,point[1]*h+dx*w/length*spread+wind];});ribbon(g,points,p.colours[(j+Math.floor(k/2))%4],Math.max(.65,s*.0013),.38);}}
 const dust=seeded(art.seed+100);for(let i=0;i<90;i++){const x=dust()*w,y=dust()*h,a=dust();disc(g,x+Math.sin(phase+a*TAU)*2,y+Math.cos(phase+a*TAU)*2,.4+a*.7,p.colours[i%4]+'50');}
}
