import {inlineReader,readerZip} from './reader-pack-core.js?v=18214deeb83d6066';
const spec=JSON.parse(document.querySelector('#reader-pack').textContent);
const progress=document.querySelector('progress'),status=document.querySelector('[role=status]'),link=document.querySelector('#save-pack'),retry=document.querySelector('#retry');
let objectURL=null,running=false;
const hash=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
async function checked(asset){const r=await fetch(asset.url);if(!r.ok)throw Error('download failed');const bytes=await r.arrayBuffer();if(bytes.byteLength!==asset.bytes)throw Error('incomplete file');if(globalThis.crypto?.subtle&&await hash(bytes)!==asset.sha256)throw Error('file check failed');return bytes;}
const dataURL=(bytes,mime)=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>resolve(reader.result);reader.readAsDataURL(new Blob([bytes],{type:mime}));});
async function assemble(){
 const source=new TextDecoder().decode(await checked(spec.reader)),assets=new Map();let cursor=0,received=0;const total=spec.assets.reduce((n,a)=>n+a.bytes,0);
 async function worker(){while(cursor<spec.assets.length){const a=spec.assets[cursor++],bytes=await checked(a);assets.set(a.url,await dataURL(bytes,a.mime));received+=a.bytes;progress.value=received/total*.85;status.textContent=`Gathering your illustrated pages · ${Math.round(received/total*100)}%`;}}
 await Promise.all([worker(),worker(),worker()]);
 const offline=new TextEncoder().encode(inlineReader(source,assets));assets.clear();
 if(offline.byteLength!==spec.offlineBytes||globalThis.crypto?.subtle&&await hash(offline)!==spec.offlineSha256)throw Error('reader check failed');
 status.textContent='Finishing your complete offline reader…';progress.value=.9;
 const zip=await readerZip([{name:`${spec.folder}/${spec.folder}.html`,data:offline},{name:`${spec.folder}/Read_me.txt`,data:spec.readme}]);progress.value=1;return zip;
}
async function prepare(){
 if(running)return;running=true;retry.hidden=true;link.hidden=true;progress.value=0;status.textContent='Preparing your complete offline reader…';const chunks=[];let received=0;
 try{
  let blob;
  if(spec.kind==='assembled-reader-v1')blob=await assemble();else{
  for(const part of spec.parts){
   const response=await fetch(part.url);if(!response.ok)throw Error('download failed');const buffer=await response.arrayBuffer();if(buffer.byteLength!==part.bytes)throw Error('incomplete file');
   if(globalThis.crypto?.subtle){const digest=await crypto.subtle.digest('SHA-256',buffer),hash=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==part.sha256)throw Error('file check failed');}
   chunks.push(buffer);received+=buffer.byteLength;progress.value=received/spec.bytes;status.textContent=`Preparing your reader · ${Math.round(received/spec.bytes*100)}%`;
  }
  blob=new Blob(chunks,{type:'application/zip'});}
  if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(blob);link.href=objectURL;link.download=spec.filename;link.hidden=false;status.textContent='Your complete reader is ready. If the download hasn’t started, choose Save reader.';link.click();
 }catch{status.textContent='The download was interrupted. Please try again.';retry.hidden=false;}finally{running=false;}
}
retry.addEventListener('click',prepare);prepare();
