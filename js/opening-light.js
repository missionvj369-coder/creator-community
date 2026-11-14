/** Light, silk and a human outline, drawn locally without a video/WebGL dependency. */
export function createOpeningLight(canvas,{reduced=false}={}){
 let g;try{g=canvas.getContext('2d');}catch{}if(!g)return {set(){},destroy(){}};
 let w=1,h=1,frame=0,last=0,time=0,elapsed=0,paused=false,still=reduced,active=true,disposed=false;
 const TAU=Math.PI*2,ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const stars=Array.from({length:150},(_,i)=>({x:(Math.sin(i*97.31)+1)/2,y:(Math.sin(i*43.19+7)+1)/2,s:.3+(i%7)*.16,a:i*2.399963}));
 function resize(){const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);g.setTransform(d,0,0,d,0,0);paint();}
 const ro=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;ro?ro.observe(canvas):addEventListener('resize',resize);
 function halo(x,y,r,color){const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,color);q.addColorStop(1,'rgba(249,248,240,0)');g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);}
 function person(t){
  // A single contour passes over the head and opens into shoulders and two hands.
  if(t<.32){const a=(t/.32)*TAU;return [Math.cos(a)*.09,-.2+Math.sin(a)*.11];}
  if(t<.66){const a=(t-.32)/.34;return [-.25+Math.sin(a*Math.PI)*.25,.04+Math.cos(a*Math.PI)*.24];}
  const a=(t-.66)/.34;return [.25-Math.sin(a*Math.PI)*.25,.04+Math.cos(a*Math.PI)*.24];
 }
 function paint(){if(disposed)return;g.clearRect(0,0,w,h);const cx=w/2,cy=h*.47,u=Math.min(w*.92,h*.86),p=still?1:ease(elapsed/3800),bloom=still?.7:ease((elapsed-3100)/6000);
  const bg=g.createLinearGradient(0,0,w*.8,h);bg.addColorStop(0,'#fdfbf5');bg.addColorStop(.5,'#f1f2e9');bg.addColorStop(1,'#eeeaf0');g.fillStyle=bg;g.fillRect(0,0,w,h);
  halo(cx-u*.22,cy-u*.08,u*.7,'rgba(215,228,199,.64)');halo(cx+u*.3,cy+u*.12,u*.6,'rgba(220,207,235,.47)');halo(cx,cy,u*.31,'rgba(255,254,235,.95)');
  g.save();g.translate(cx,cy);g.rotate(-.28+(still?0:Math.sin(time*.09)*.025));
  for(let j=0;j<24;j++){const n=j/23,r=u*(.23+n*.13),twist=(still?0:time*.055)+j*.031;g.strokeStyle=j%3===0?`rgba(157,136,170,${.065+p*.08})`:`rgba(152,169,120,${.06+p*.08})`;g.lineWidth=j%5===0?1.2:.65;g.beginPath();
   for(let k=0;k<=170;k++){const a=k/170*TAU,fold=Math.sin(a*3+twist)*u*.014*bloom,rr=r+fold;const x=Math.cos(a)*rr*(.7+Math.sin(a*2+twist)*.09*bloom),y=Math.sin(a)*rr*(1.1+Math.cos(a*3-twist)*.04);k?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.stroke();
  }g.restore();
  // Three opalescent bands unfold from the human contour into an open portal.
  g.save();g.translate(cx,cy);g.rotate(-.18+(still?0:Math.sin(time*.12)*.035));
  for(let band=0;band<3;band++){
   const rx=u*(.258+band*.027),ry=u*(.344+band*.027),width=u*(.009+band*.002),shift=band*1.8+(still?0:time*.09);
   const silk=g.createLinearGradient(-rx,-ry,rx,ry);silk.addColorStop(0,'rgba(255,255,248,.85)');silk.addColorStop(.23,'rgba(179,194,152,.5)');silk.addColorStop(.48,'rgba(228,218,236,.35)');silk.addColorStop(.72,'rgba(172,157,183,.38)');silk.addColorStop(.89,'rgba(217,200,159,.3)');silk.addColorStop(1,'rgba(255,255,245,.85)');
   g.globalAlpha=p*(.30+bloom*.50);g.fillStyle=silk;g.beginPath();
   for(let k=0;k<=160;k++){const a=k/160*TAU,fold=Math.sin(a*3+shift)*u*.013*bloom;const x=Math.cos(a)*(rx+fold),y=Math.sin(a)*(ry+fold*.6);k?g.lineTo(x,y):g.moveTo(x,y);}
   for(let k=160;k>=0;k--){const a=k/160*TAU,fold=Math.sin(a*3+shift)*u*.013*bloom,thickness=width*(.7+Math.sin(a+shift)*.25);g.lineTo(Math.cos(a)*(rx+fold-thickness),Math.sin(a)*(ry+fold*.6-thickness));}g.closePath();g.fill();
  }g.restore();
  for(let i=0;i<stars.length;i++){const m=stars[i],t=i/stars.length,[px,py]=person(t),swirl=m.a+(still?0:time*.025),r=u*(.08+.38*Math.sqrt(t));const sx=cx+Math.cos(swirl)*r,sy=cy+Math.sin(swirl)*r*.72;const gather=ease((elapsed-450)/2600)*(1-bloom*.72);const x=sx+(cx+px*u-sx)*gather,y=sy+(cy+py*u-sy)*gather;const a=.18+Math.sin(i*2.8+time*.3)*.09;g.fillStyle=i%4===0?`rgba(179,145,188,${a})`:`rgba(130,157,107,${a+.06})`;g.beginPath();g.arc(x,y,m.s*(w<500?.7:1),0,TAU);g.fill();}
  // A tiny warm point expands into an open, breathing halo.
  const glow=still?.9:ease(elapsed/1800);halo(cx,cy,u*(.02+.22*glow),'rgba(255,254,226,.6)');
  const a=g.createLinearGradient(cx-u*.27,0,cx+u*.27,0);a.addColorStop(0,'rgba(179,154,104,0)');a.addColorStop(.5,'rgba(179,154,104,.35)');a.addColorStop(1,'rgba(179,154,104,0)');g.strokeStyle=a;g.lineWidth=.8;g.beginPath();g.ellipse(cx,h*.77,u*.30,u*.035,0,0,TAU);g.stroke();
 }
 function loop(now){if(disposed)return;frame=requestAnimationFrame(loop);if(now-last<32)return;const dt=Math.min(.06,(now-last)/1000);last=now;if(!active||document.hidden)return;if(!paused&&!document.hidden&&!still)time+=dt;paint();}
 resize();frame=requestAnimationFrame(loop);
 return {set({elapsed:next,paused:p,still:s,active:a}={}){if(next!==undefined)elapsed=next;if(p!==undefined)paused=p;if(s!==undefined)still=s;if(a!==undefined)active=a;},destroy(){disposed=true;cancelAnimationFrame(frame);ro?.disconnect();removeEventListener('resize',resize);}};
}
