// Small dependency-free ZIP writer. The downloadable reader remains self-contained.
const encoder=new TextEncoder();
const table=Uint32Array.from({length:256},(_,i)=>{for(let j=0;j<8;j++)i=i&1?0xedb88320^(i>>>1):i>>>1;return i>>>0;});
export function crc32(bytes){let crc=0xffffffff;for(const b of bytes)crc=table[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
export function inlineReader(source,assets){return source.replace(/\/assets\/books\/([a-f0-9]{20}\.[a-zA-Z0-9]+)/g,(url)=>{const data=assets.get(url);if(!data)throw Error('An illustrated page is missing.');return data;}).replace('<script src="/js/book-bridge.js" defer></script>','');}
export async function readerZip(entries,{compress=true}={}){
 const local=[],central=[];let offset=0,centralBytes=0;
 for(const entry of entries){
  if(!/^[a-z0-9-]+\/(?:[a-z0-9-]+\.html|Read_me\.txt)$/.test(entry.name))throw Error('Invalid reader path');
  const name=encoder.encode(entry.name),raw=typeof entry.data==='string'?encoder.encode(entry.data):entry.data;let packed=raw,method=0;
  if(compress&&typeof CompressionStream!=='undefined')try{packed=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());method=8;}catch{}
  const crc=crc32(raw),header=new Uint8Array(30),h=new DataView(header.buffer);
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(8,method,true);h.setUint16(12,33,true);h.setUint32(14,crc,true);h.setUint32(18,packed.length,true);h.setUint32(22,raw.length,true);h.setUint16(26,name.length,true);
  local.push(header,name,packed);
  const directory=new Uint8Array(46),d=new DataView(directory.buffer);
  d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint16(10,method,true);d.setUint16(14,33,true);d.setUint32(16,crc,true);d.setUint32(20,packed.length,true);d.setUint32(24,raw.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);
  central.push(directory,name);centralBytes+=46+name.length;offset+=30+name.length+packed.length;
 }
 const ending=new Uint8Array(22),end=new DataView(ending.buffer);end.setUint32(0,0x06054b50,true);end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);end.setUint32(12,centralBytes,true);end.setUint32(16,offset,true);
 return new Blob([...local,...central,ending],{type:'application/zip'});
}
