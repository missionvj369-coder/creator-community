import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {crc32,inlineReader,readerZip} from '../public/js/reader-pack-core.js';
const encode=x=>new TextEncoder().encode(x);
assert.equal(crc32(encode('123456789')),0xcbf43926);
const asset='/assets/books/0123456789abcdef0123.webp',html=`<html>Human · within<img src="${asset}"><script src="/js/book-bridge.js" defer></script></html>`;
assert.equal(inlineReader(html,new Map([[asset,'data:image/webp;base64,QQ==']])),'<html>Human · within<img src="data:image/webp;base64,QQ=="></html>');
assert.throws(()=>inlineReader(html,new Map()),/missing/);
for(const compress of [false,true]){
 const blob=await readerZip([{name:'test-reader/test-reader.html',data:'<html>Human · within</html>'},{name:'test-reader/Read_me.txt',data:'Open the HTML offline.'}],{compress});
 const result=spawnSync('python3',['-c',"import sys,io,zipfile; z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); assert z.testzip() is None; assert z.read('test-reader/test-reader.html').decode()=='<html>Human · within</html>'; assert z.read('test-reader/Read_me.txt')==b'Open the HTML offline.'"],{input:Buffer.from(await blob.arrayBuffer())});assert.equal(result.status,0,result.stderr.toString());
}
await assert.rejects(()=>readerZip([{name:'../unsafe.html',data:'x'}]),/Invalid/);
const spec=JSON.parse(fs.readFileSync('public/books/downloads/body-you-live-in.reader.json'));
const assets=new Map();for(const a of [spec.reader,...spec.assets]){const bytes=fs.readFileSync('public'+a.url);assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);if(a.mime)assets.set(a.url,`data:${a.mime};base64,${bytes.toString('base64')}`);}
const offline=Buffer.from(inlineReader(fs.readFileSync('public'+spec.reader.url,'utf8'),assets));assert.equal(offline.length,spec.offlineBytes);assert.equal(crypto.createHash('sha256').update(offline).digest('hex'),spec.offlineSha256);
console.log('reader packs: standard ZIP CRC/UTF-8/deflate and fallback, guarded paths, all 163 full-quality assets and exact original offline-reader hash passed');
