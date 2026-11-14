import { immersiveWorld } from './immersive-model.js?v=18214deeb83d6066';
const TAU=Math.PI*2;
export function worldGeometry(kind,time=0,charge=0,seed=0){
  const lines=[],nodes=[];const curve=(n,fn,alpha=1)=>lines.push({points:Array.from({length:n},(_,i)=>fn(i/(n-1))),alpha});
  if(kind==='ribbon')for(let j=0;j<32;j++)curve(112,u=>{const t=(u*(TAU-charge*.85)+charge*.42),rib=(j-15.5)*.005;return [( .68+(.24+rib)*Math.cos(3*t))*Math.cos(2*t),(.68+(.24+rib)*Math.cos(3*t))*Math.sin(2*t),.32*Math.sin(3*t)+rib*3+charge*.2*Math.sin(t)];},.45+j/70);
  if(kind==='labyrinth')for(let j=0;j<14;j++)curve(65,u=>{const t=u*TAU,k=.25+j*.052,a=Math.cos(t),b=Math.sin(t),turn=charge*(j%2?.65:-.2),x=Math.sign(a)*Math.pow(Math.abs(a),.32)*k,y=Math.sign(b)*Math.pow(Math.abs(b),.32)*k;return [x*Math.cos(turn)-y*Math.sin(turn),x*Math.sin(turn)+y*Math.cos(turn),-.6+j*.09];},.45+j/25);
  if(kind==='bloom')for(let j=0;j<36;j++)curve(74,u=>{const t=u*TAU,angle=j*2.399963+.29*Math.sin(t),size=.37+(j%3)*.23,r=.05+Math.sin(t/2)*size,open=.7+charge*.28;return [Math.cos(angle)*r*open,Math.sin(angle)*r*open,.3*Math.cos(t/2)*(1-charge*.6)+.035*(j%3)];},.45+(j%3)*.2);
  if(kind==='arches')for(let j=0;j<13;j++)curve(108,u=>{const k=.4+j*.055,spread=(1-charge*.6)*Math.sin(j*.85)*.24;let x,y;if(u<.2){x=-k;y=-.88+u/.2*.73;}else if(u>.8){x=k;y=-.15-(u-.8)/.2*.73;}else{const a=Math.PI*(1-(u-.2)/.6);x=Math.cos(a)*k;y=Math.sin(a)*k-.15;}return [x+spread,y,-.6+j*.095];},.55+j/25);
  if(kind==='spiral')for(let j=0;j<26;j++)curve(140,u=>{const t=u*TAU*3.7+j*.019,r=.18+u*(.65+charge*.18);return [Math.cos(t)*r,(u-.5)*1.65,Math.sin(t)*r+(j-13)*.006];},.35+j/45);
  if(kind==='constellation'){
    for(let i=0;i<99;i++){const y=1-i/49,rr=Math.sqrt(Math.max(0,1-y*y)),t=i*2.399963+seed*.03;nodes.push([Math.cos(t)*rr*.9,y*.9,Math.sin(t)*rr*.9]);}
    for(let i=0;i<nodes.length;i++)for(let d=1;d<=2;d++){const j=(i+d*8)%nodes.length;if(i%3===0||i<charge*6+8)lines.push({points:[nodes[i],nodes[j]],alpha:i<charge*6+8?.9:.18});}
  }
  return {lines,nodes};
}
function project(p,rotation,pointer=[0,0]){const a=rotation+pointer[0]*.17,c=Math.cos(a),s=Math.sin(a),x=p[0]*c+p[2]*s,z=p[2]*c-p[0]*s,b=-.15+pointer[1]*.1,y=p[1]*Math.cos(b)-z*Math.sin(b),depth=p[1]*Math.sin(b)+z*Math.cos(b),k=2.9/(3.1-depth*.38);return [x*k,y*k,depth];}
export function worldPoster(id){
  const spec=immersiveWorld(id);if(!spec)return '';
  const key=`poster-${id}`,geometry=worldGeometry(spec.world,0,.13),paths=geometry.lines.filter((_,i)=>i%2===0).map(line=>{const points=line.points.filter((_,i)=>i%2===0).map(p=>{const q=project(p,.3);return `${(180+q[0]*110).toFixed(1)},${(130-q[1]*110).toFixed(1)}`;}).join(' ');return `<polyline points="${points}" fill="none" stroke="${spec.accent}" stroke-width=".75" opacity="${line.alpha*.65}"/>`;}).join('');
  const horizon=spec.world==='horizon'?`<circle cx="185" cy="113" r="42" fill="url(#${key}-sun)"/><path d="M38 147 Q180 139 328 147" fill="none" stroke="${spec.accent}" opacity=".7"/>${Array.from({length:17},(_,i)=>`<path d="M${87-i*3} ${153+i*5} Q180 ${145+i*6} ${280+i*2} ${153+i*5}" fill="none" stroke="${spec.accent}" stroke-width=".5" opacity="${.3-i*.013}"/>`).join('')}`:'';
  const stars=geometry.nodes.filter((_,i)=>i%2===0).map(p=>{const q=project(p,.3);return `<circle cx="${180+q[0]*110}" cy="${130-q[1]*110}" r="1.5" fill="${spec.accent}"/>`;}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" aria-hidden="true"><defs><radialGradient id="${key}"><stop stop-color="rgb(${spec.rgb})" stop-opacity=".17"/><stop offset="1" stop-color="${spec.page}" stop-opacity="0"/></radialGradient><radialGradient id="${key}-sun" cx="35%" cy="25%"><stop stop-color="#fff3d4"/><stop offset="1" stop-color="#c49a66"/></radialGradient></defs><rect width="360" height="260" fill="${spec.page}"/><ellipse cx="180" cy="130" rx="170" ry="120" fill="url(#${key})"/>${paths}${stars}${horizon}</svg>`;
}
export function createImmersiveWorld(canvas,id,{motion=true,seed=0,reading=false}={}){
  const spec=immersiveWorld(id),ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return {fallback:true,dispose(){},act(){},setStage(){},setMotion(){}};
  let width=1,height=1,raf=0,disposed=false,time=0,last=0,charge=0,targetCharge=0,stage=0,pointer=[0,0],pointerTarget=[0,0],visible=!document.hidden;
  const dust=Array.from({length:110},(_,i)=>({x:((i*137.507+seed*19)%1000)/1000,y:((i*i*73.31+41)%1000)/1000,r:.45+(i%5)*.2}));
  const rgba=(a)=>`rgba(${spec.rgb},${a})`;
  function size(){const r=canvas.getBoundingClientRect();width=r.width||1;height=r.height||1;const dpr=Math.min(1.5,devicePixelRatio||1);canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);paint();}
  function paint(){
    if(disposed)return;const mobile=width<700,cx=width*(mobile?.5:.72),cy=height*(mobile?(reading?.17:.2):.49),r=Math.min(width*(mobile?(reading?.245:.30):.245),height*(mobile?.20:.36));
    ctx.globalCompositeOperation='source-over';ctx.fillStyle=spec.page;ctx.fillRect(0,0,width,height);
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.65);glow.addColorStop(0,rgba(.13));glow.addColorStop(.5,rgba(.045));glow.addColorStop(1,rgba(0));ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for(let i=0;i<dust.length;i++){const p=dust[i],x=(p.x*width+Math.sin(time*.04+i)*4),y=p.y*height;ctx.fillStyle=rgba(.1+.18*(.5+.5*Math.sin(time*.22+i)));ctx.beginPath();ctx.arc(x,y,p.r,0,TAU);ctx.fill();}
    if(spec.world==='horizon')horizon(cx,cy,r);else{
      const g=worldGeometry(spec.world,time,charge,seed+stage),rotation=.28+(spec.world==='arches'?.03:time*.035);
      for(const line of g.lines){const points=line.points.map(p=>project(p,rotation,pointer)),sculpted=['arches','labyrinth','bloom'].includes(spec.world);const depth=points.reduce((s,p)=>s+p[2],0)/points.length,alpha=Math.min(.9,line.alpha*((sculpted?.74:.48)+depth*.12));ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(cx+p[0]*r,cy-p[1]*r):ctx.moveTo(cx+p[0]*r,cy-p[1]*r));if(sculpted){ctx.fillStyle=rgba(spec.world==='bloom'?.008:.011);ctx.fill();}ctx.strokeStyle=rgba(alpha*.12);ctx.lineWidth=sculpted?7:5;ctx.stroke();ctx.strokeStyle=rgba(alpha);ctx.lineWidth=width<700?.65:.8;ctx.stroke();}
      for(let i=0;i<g.nodes.length;i++){const p=project(g.nodes[i],rotation,pointer),x=cx+p[0]*r,y=cy-p[1]*r,active=i<charge*6+8;ctx.beginPath();ctx.arc(x,y,active?2.3:1.05,0,TAU);ctx.fillStyle=rgba(active?.95:.4);ctx.shadowColor=spec.accent;ctx.shadowBlur=active?12:0;ctx.fill();ctx.shadowBlur=0;}
    }
    const vignette=ctx.createLinearGradient(0,0,width,0);vignette.addColorStop(0,'rgba(0,0,0,.24)');vignette.addColorStop(.5,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.12)');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
  }
  function horizon(cx,cy,r){
    const dusk=charge,sy=cy-r*.08+dusk*r*.22,sun=ctx.createRadialGradient(cx-r*.14,sy-r*.14,0,cx,sy,r*.45);sun.addColorStop(0,dusk?'#e5daed':'#fff1ca');sun.addColorStop(.4,dusk?'#c5b4d0':'#e6c594');sun.addColorStop(1,dusk?'#7e7195':'#99744b');ctx.fillStyle=sun;ctx.beginPath();ctx.arc(cx,sy,r*.45,0,TAU);ctx.fill();
    ctx.fillStyle=spec.page;ctx.fillRect(cx-r*1.6,cy+r*.27,r*3.2,r*1.9);ctx.beginPath();ctx.moveTo(cx-r*1.4,cy+r*.27);ctx.lineTo(cx+r*1.4,cy+r*.27);ctx.strokeStyle=rgba(.5);ctx.lineWidth=1;ctx.stroke();
    for(let j=0;j<35;j++){ctx.beginPath();for(let k=0;k<=65;k++){const x=(k/65-.5)*r*3,y=cy+r*.3+j*j*r*.00068+Math.sin(k*.18+time*.22+j*.55)*r*.012; k?ctx.lineTo(cx+x,y):ctx.moveTo(cx+x,y);}ctx.strokeStyle=dusk?`rgba(184,161,216,${.28-j*.006})`:rgba(.28-j*.006);ctx.lineWidth=.7;ctx.stroke();}
    for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(cx,cy+r*.4+i*r*.07,r*(.25+i*.055),r*.009,0,0,TAU);ctx.strokeStyle=rgba(.2-i*.022);ctx.stroke();}
  }
  function tick(now){if(disposed)return;raf=0;if(!visible||!motion)return;if(now-last>=32){const dt=Math.min(.05,(now-last)/1000||.033);last=now;time+=dt;charge+=(targetCharge-charge)*.045;pointer=pointer.map((p,i)=>p+(pointerTarget[i]-p)*.035);paint();}raf=requestAnimationFrame(tick);}
  function restart(){if(!disposed&&visible&&motion&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}else if(!motion){charge=targetCharge;paint();}}
  function move(e){const b=canvas.getBoundingClientRect();pointerTarget=[(e.clientX-b.left)/b.width-.5,(e.clientY-b.top)/b.height-.5];if(!motion){pointer=pointerTarget;paint();}}
  function visibility(){visible=!document.hidden;if(!visible){cancelAnimationFrame(raf);raf=0;}else restart();}
  const surface=canvas.closest('.immersion')||canvas,resize=new ResizeObserver(size);resize.observe(canvas);surface.addEventListener('pointermove',move);document.addEventListener('visibilitychange',visibility);size();restart();
  return {act(){targetCharge=spec.world==='constellation'?(targetCharge+1)%15:targetCharge>.5?0:1;if(!motion){charge=targetCharge;paint();}return targetCharge;},setStage(value){stage=value;if(spec.world==='horizon')targetCharge=value>=2?1:0;restart();},setMotion(value){motion=!!value;cancelAnimationFrame(raf);raf=0;restart();},dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);resize.disconnect();surface.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility);canvas.width=1;canvas.height=1;}};
}
