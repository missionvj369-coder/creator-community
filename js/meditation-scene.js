/** Original calm water. No sensors, flashing imagery, or required visual tracking. */
export function createMeditationScene(canvas,{still=false}={}){
 const ctx=canvas.getContext('2d');let frame=0,last=0,disposed=false,elapsed=0,paused=true,pacer=false,night=false,w=1,h=1,dpr=1;
 function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.5);w=Math.max(1,r.width);h=Math.max(1,r.height);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);draw();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 function draw(){if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);const t=still?8:elapsed,dim=Math.min(1,Math.max(0,(elapsed-117)/55));
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#e7e4ef');sky.addColorStop(.42,'#f2e8cf');sky.addColorStop(.56,'#d8dfce');sky.addColorStop(1,'#b7cbc4');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  const cx=w*.54,cy=h*.39,glow=ctx.createRadialGradient(cx,cy,0,cx,cy,w*.35);glow.addColorStop(0,'#fff9dfdf');glow.addColorStop(.34,'#fff9df66');glow.addColorStop(1,'#fff9df00');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#a5b6a3';ctx.globalAlpha=.38;ctx.beginPath();ctx.moveTo(0,h*.54);ctx.bezierCurveTo(w*.16,h*.39,w*.3,h*.57,w*.49,h*.53);ctx.bezierCurveTo(w*.7,h*.46,w*.8,h*.5,w,h*.4);ctx.lineTo(w,h*.59);ctx.lineTo(0,h*.59);ctx.fill();ctx.globalAlpha=1;
  for(let i=0;i<42;i++){const depth=i/42,y=h*(.55+depth*.45),sway=Math.sin(t*.08+i*.71)*w*.025,half=w*(.016+depth*.28);ctx.beginPath();ctx.moveTo(cx-half+sway,y);ctx.quadraticCurveTo(cx+sway,y+Math.sin(t*.09+i)*1.5,cx+half+sway,y);ctx.strokeStyle=i%3?'#f9f2da':'#839f98';ctx.globalAlpha=.12+depth*.19;ctx.lineWidth=.4+depth*.8;ctx.stroke();}ctx.globalAlpha=1;
  // The optional light suggests 5 in / 5 out; the voice always permits one's own pace.
  if(pacer&&elapsed>=45&&elapsed<117){const phase=((elapsed-45)%10)/10,gain=(1-Math.cos(phase*Math.PI*2))/2,r=w*(.11+gain*.035),g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,`rgba(255,251,225,${.18+gain*.32})`);g.addColorStop(1,'rgba(255,251,225,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
  ctx.fillStyle=night?'#0b151c':'#233433';ctx.globalAlpha=dim*(night?.97:.75);ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
 }
 function loop(now){if(disposed)return;if(now-last>50){draw();last=now;}frame=requestAnimationFrame(loop);}resize();frame=requestAnimationFrame(loop);
 return {set(patch){if('elapsed'in patch)elapsed=patch.elapsed;if('still'in patch)still=patch.still;if('paused'in patch)paused=patch.paused;if('pacer'in patch)pacer=patch.pacer;if('night'in patch)night=patch.night;draw();},destroy(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();}};
}
