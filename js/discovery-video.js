// A small, dependency-free WebM writer for one silent VP8 video track.
// Container: https://www.webmproject.org/docs/container/
const concat=parts=>{const out=new Uint8Array(parts.reduce((n,x)=>n+x.length,0));let at=0;for(const part of parts){out.set(part,at);at+=part.length;}return out;};
const bytes=hex=>new Uint8Array(hex.match(/../g).map(x=>parseInt(x,16)));
export function webmSize(value){for(let n=1;n<=7;n++){if(value<2**(7*n)-1){const result=new Uint8Array(n);let v=value;for(let i=n-1;i>=0;i--){result[i]=v%256;v=Math.floor(v/256);}result[0]|=2**(8-n);return result;}}throw Error('Video is too large.');}
const element=(id,data)=>concat([bytes(id),webmSize(data.length),data]);
const uint=value=>{const a=[];do{a.unshift(value%256);value=Math.floor(value/256);}while(value);return new Uint8Array(a);};
const number=(id,n)=>element(id,uint(n)),text=(id,s)=>element(id,new TextEncoder().encode(s));
const group=(id,children)=>element(id,concat(children));
export function muxCreationWebM(frames,{width,height,fps=30,duration=6}){
 if(!frames.length||!frames[0].key)throw Error('The video needs a first key frame.');
 const float=new Uint8Array(8);new DataView(float.buffer).setFloat64(0,duration*1000,false);
 const header=group('1a45dfa3',[number('4286',1),number('42f7',1),number('42f2',4),number('42f3',8),text('4282','webm'),number('4287',4),number('4285',2)]);
 const info=group('1549a966',[number('2ad7b1',1000000),element('4489',float),text('4d80','Human Within'),text('5741','The Creation Field')]);
 const tracks=group('1654ae6b',[group('ae',[number('d7',1),number('73c5',1),number('83',1),number('9c',0),text('86','V_VP8'),number('23e383',Math.round(1e9/fps)),group('e0',[number('b0',width),number('ba',height)])])]);
 const blocks=frames.map(frame=>{const ms=Math.round(frame.timestamp/1000);if(ms<0||ms>32767)throw Error('Video timestamp is outside the loop.');return element('a3',concat([new Uint8Array([0x81,ms>>8,ms&255,frame.key?0x80:0]),frame.data]));});
 return concat([header,group('18538067',[info,tracks,group('1f43b675',[number('e7',0),...blocks])])]);
}
export async function encodeCreationVideo(canvas,render,onProgress,isCancelled){
 if(typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined')return null;
 const fps=30,total=180,config={codec:'vp8',width:canvas.width,height:canvas.height,bitrate:4500000,framerate:fps,latencyMode:'quality'};
 let encoder=null,error=null;const frames=[];
 try{
  if(!(await VideoEncoder.isConfigSupported(config)).supported||isCancelled())return null;
  encoder=new VideoEncoder({output(chunk){const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);frames.push({data,timestamp:chunk.timestamp,key:chunk.type==='key'});},error(e){error=e;}});encoder.configure(config);
  for(let i=0;i<total;i++){
   if(isCancelled())return {cancelled:true};if(error)throw error;render(i/fps);
   const frame=new VideoFrame(canvas,{timestamp:Math.round(i*1e6/fps),duration:Math.round(1e6/fps)});try{encoder.encode(frame,{keyFrame:i%60===0});}finally{frame.close();}
   onProgress((i+1)/total);
   // Bound the encoder queue and yield to pause/cancel/navigation controls.
   if(encoder.encodeQueueSize>10)await encoder.flush();if(i%3===0)await new Promise(r=>setTimeout(r,0));
  }
  await encoder.flush();if(isCancelled())return {cancelled:true};if(error||frames.length!==total)throw error||Error('Incomplete video.');
  frames.sort((a,b)=>a.timestamp-b.timestamp);return {blob:new Blob([muxCreationWebM(frames,{width:canvas.width,height:canvas.height,fps,duration:6})],{type:'video/webm'}),extension:'webm',fallback:false};
 }catch{return isCancelled()?{cancelled:true}:null;}finally{try{encoder?.close();}catch{}}
}
