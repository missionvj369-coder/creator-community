// A continuous, light Canvas garden. No videos, image downloads, or WebGL required.
export function createArrivalGarden(canvas,{reduced=false}={}){
 let g;try{g=canvas.getContext('2d');}catch{}if(!g)return {set(){},destroy(){}};
 let w=1,h=1,frame=0,last=0,time=0,phase=0,targetPhase=0,paused=false,gentle=reduced,active=true,disposed=false;
 const motes=Array.from({length:35},(_,i)=>({x:(Math.sin(i*78.3)+1)/2,y:(Math.cos(i*13.9)+1)/2,r:1+(i%4)*.48,s:.25+(i%7)*.07}));
 function resize(){const rect=canvas.getBoundingClientRect();w=Math.max(1,rect.width);h=Math.max(1,rect.height);const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);g.setTransform(dpr,0,0,dpr,0,0);paint();}
 const ro=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;if(ro)ro.observe(canvas);else window.addEventListener('resize',resize);
 function glow(x,y,r,color){const p=g.createRadialGradient(x,y,0,x,y,r);p.addColorStop(0,color);p.addColorStop(1,'rgba(248,250,242,0)');g.fillStyle=p;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
 function leaf(x,y,length,angle,color){g.save();g.translate(x,y);g.rotate(angle);const grad=g.createLinearGradient(0,0,length,0);grad.addColorStop(0,'rgba(126,157,115,.12)');grad.addColorStop(.5,color);grad.addColorStop(1,'rgba(230,238,213,.55)');g.fillStyle=grad;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(length*.22,-length*.45,length*.83,-length*.3,length,0);g.bezierCurveTo(length*.62,length*.3,length*.21,length*.18,0,0);g.fill();g.strokeStyle='rgba(255,255,246,.5)';g.lineWidth=.6;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(length*.5,-length*.04,length*.92,0);g.stroke();g.restore();}
 function plant(x,y,scale,flip){g.save();g.translate(x,y);g.scale(flip*scale,scale);const sway=Math.sin(time*.12+x)*.025;g.rotate(sway);g.strokeStyle='rgba(124,153,109,.3)';g.lineWidth=1;g.beginPath();g.moveTo(0,120);g.bezierCurveTo(40,60,-24,-44,2,-152);g.stroke();[[0,-122,78,-.5],[-3,-85,93,-2.8],[3,-52,112,-.4],[8,-8,114,-2.9],[13,33,126,-.2]].forEach(([a,b,l,ang],i)=>leaf(a,b,l,ang,'rgba(164,187,138,'+(.23+i*.022)+')'));g.restore();}
 function orb(x,y,r){g.save();g.shadowColor='rgba(112,139,91,.18)';g.shadowBlur=r*.45;const p=g.createRadialGradient(x-r*.35,y-r*.38,1,x+r*.12,y+r*.16,r*1.15);p.addColorStop(0,'#fffff5');p.addColorStop(.16,'#f8f6e4');p.addColorStop(.4,'#e4e9cd');p.addColorStop(.68,'#b9caa0');p.addColorStop(.87,'#a7bb8a');p.addColorStop(1,'#899f75');g.fillStyle=p;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.shadowBlur=0;g.strokeStyle='rgba(255,255,251,.7)';g.lineWidth=1;g.beginPath();g.arc(x-r*.025,y-r*.025,r*.92,3.6,5.6);g.stroke();g.restore();}
 function paint(){
  if(disposed)return;g.clearRect(0,0,w,h);const mid=w/2,cy=h*.47,unit=w<h?Math.min(w*1.55,h*.88):Math.min(w*1.2,h*1.65),s=unit/720;
  const bg=g.createLinearGradient(0,0,w*.25,h);bg.addColorStop(0,'#fcfcf7');bg.addColorStop(.54,'#f3f5eb');bg.addColorStop(1,'#e7eddd');g.fillStyle=bg;g.fillRect(0,0,w,h);
  glow(w*.38,h*.41,unit*.64,'rgba(224,229,203,.45)');glow(w*.65,h*.47,unit*.48,'rgba(229,218,239,.27)');glow(mid,h*.27,unit*.4,'rgba(255,255,249,.85)');
  plant(w*.16,h*.67,Math.min(1.15,s)*1.2,1);plant(w*.88,h*.65,Math.min(1,s),-1);
  const rhythm=gentle?0:Math.sin(time*.20)*.035;
  g.save();g.translate(mid,cy+unit*.15);for(let i=0;i<8;i++){const rr=unit*(.12+i*.035)+((time*2.2+i*7)%17);g.strokeStyle=`rgba(143,164,117,${(.085-i*.006)*(1+phase*.25)})`;g.lineWidth=.8;g.beginPath();g.ellipse(0,0,rr,rr*.20,0,0,Math.PI*2);g.stroke();}g.restore();
  const open=.5+phase*.22;for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.sin(time*.07)*.025;const r=unit*(.045+open*.035);leaf(mid+Math.cos(a)*r,cy+Math.sin(a)*r*.48,unit*(.15+rhythm),a-1.25,'rgba(188,198,157,.22)');}
  const wander=phase<1?phase:2-phase,move=gentle?0:Math.sin(time*.13)*unit*.19*Math.max(0,wander);const lift=gentle?0:Math.sin(time*.20)*unit*.022;
  const ox=mid+move,oy=cy-unit*.035+lift+phase*unit*.026;glow(ox,oy,unit*.19,'rgba(255,252,219,.57)');
  g.save();g.strokeStyle='rgba(180,162,119,.19)';g.lineWidth=1;g.setLineDash([1,8]);g.beginPath();g.ellipse(mid,cy,unit*.245,unit*.105,-.11,0,Math.PI*2);g.stroke();g.restore();
  orb(ox,oy,unit*.055);glow(ox-unit*.018,oy-unit*.018,unit*.036,'rgba(255,255,255,.85)');
  for(const m of motes){const x=(m.x*w+Math.sin(time*.06+m.y*7)*unit*.018+w)%w,y=(m.y*h-time*m.s*1.5+h*4)%h;g.fillStyle=`rgba(193,176,129,${.11+(Math.sin(time*.15+m.x*8)+1)*.09})`;g.beginPath();g.arc(x,y,m.r*s+.45,0,Math.PI*2);g.fill();}
  const haze=g.createLinearGradient(0,h*.58,0,h);haze.addColorStop(0,'rgba(248,249,240,0)');haze.addColorStop(1,'rgba(248,249,240,.7)');g.fillStyle=haze;g.fillRect(0,h*.58,w,h*.42);
 }
 function loop(now){if(disposed)return;frame=requestAnimationFrame(loop);if(now-last<32)return;const dt=Math.min(.06,(now-last)/1000);last=now;if(!active||document.hidden)return;if(!paused&&!document.hidden){if(!gentle)time+=dt;phase+=(targetPhase-phase)*Math.min(1,dt*.35);}paint();}
 resize();frame=requestAnimationFrame(loop);
 return {set({scene,gentle:nextGentle,paused:nextPaused,active:nextActive}={}){if(scene!==undefined)targetPhase=scene;if(nextGentle!==undefined)gentle=nextGentle;if(nextPaused!==undefined)paused=nextPaused;if(nextActive!==undefined)active=nextActive;},destroy(){disposed=true;cancelAnimationFrame(frame);ro?.disconnect();window.removeEventListener('resize',resize);}};
}
