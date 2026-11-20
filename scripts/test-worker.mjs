import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {SignJWT,exportJWK,generateKeyPair} from 'jose';
import worker from '../worker/index.js';
import {bookIds,initialMedia} from '../public/js/launch-catalogue.js';

const sql = new DatabaseSync(':memory:');
sql.exec(readFileSync(new URL('../migrations/0001_launch.sql',import.meta.url),'utf8'));
sql.exec("UPDATE media SET position=42, revision=7 WHERE id='curiosity'");
sql.exec(readFileSync(new URL('../migrations/0002_podcast.sql',import.meta.url),'utf8'));
assert.deepEqual(Object.values(sql.prepare("SELECT position,revision FROM media WHERE id='curiosity'").get()),[42,7]);
const DB = {
  prepare(query) {
    const args=[],statement=sql.prepare(query);
    return {
      bind(...values){args.push(...values);return this;},
      first:async()=>statement.get(...args)||null,
      all:async()=>({results:statement.all(...args)}),
      run:async()=>({meta:{changes:Number(statement.run(...args).changes)}}),
      execute:()=>query.includes('RETURNING')?{results:statement.all(...args)}:{meta:{changes:Number(statement.run(...args).changes)}},
    };
  },
  async batch(statements) {
    sql.exec('BEGIN');
    try{const results=statements.map(statement=>statement.execute());sql.exec('COMMIT');return results;}
    catch(error){sql.exec('ROLLBACK');throw error;}
  },
};
const env={
  DB,ASSETS:{fetch:async()=>new Response('asset')},ACCESS_TEAM:'creator.cloudflareaccess.com',ACCESS_AUD:'creator-admin',
  ADMIN_EMAILS:'admin@example.com',BTCPAY_URL:'https://payment.example',BTCPAY_STORE_ID:'store-id',
  BTCPAY_API_KEY:'sandbox-test-key',BTCPAY_WEBHOOK_SECRET:'sandbox-test-secret',MEDIA_ORIGIN:'https://media.example',
};
const issuer='https://'+env.ACCESS_TEAM;
const {publicKey,privateKey}=await generateKeyPair('RS256');
const jwk={...await exportJWK(publicKey),kid:'test-key',alg:'RS256'};
const sign=(email,audience=env.ACCESS_AUD)=>new SignJWT({email}).setProtectedHeader({alg:'RS256',kid:jwk.kid})
  .setIssuer(issuer).setAudience(audience).setSubject(email).setExpirationTime('5m').sign(privateKey);
const admin=await sign('admin@example.com');
const fetchReal=globalThis.fetch;
let remoteInvoice=0;
globalThis.fetch=async (input,options)=>{
  const url=String(input);
  if(url===issuer+'/cdn-cgi/access/certs')return Response.json({keys:[jwk]});
  assert.equal(url,env.BTCPAY_URL+'/api/v1/stores/store-id/invoices');
  assert.equal(options.headers.authorization,'token sandbox-test-key');
  const data=JSON.parse(options.body);
  assert.match(data.checkout.redirectURL,/^https:\/\/launch\.example\/#\/support\//);
  assert.deepEqual([data.amount,data.currency],['120.50','INR']);
  return Response.json({id:'invoice-'+(++remoteInvoice),checkoutLink:env.BTCPAY_URL+'/i/'+remoteInvoice});
};
const origin='https://launch.example';
const call=(path,options={})=>worker.fetch(new Request(origin+path,options),env);
const change=(url,data,method='PUT',from=origin)=>call(url,{method,headers:{
  origin:from,'content-type':'application/json','Cf-Access-Jwt-Assertion':admin,
},body:JSON.stringify(data)});
try{
  const unauth=await call('/admin/');
  assert.equal(unauth.status,403);
  for(const jwt of ['invalid', await sign('guest@example.com'), await sign('admin@example.com','another-app')]){
    assert.equal((await call('/api/admin',{headers:{'Cf-Access-Jwt-Assertion':jwt}})).status,403);
  }
  const authenticated=await call('/admin/',{headers:{'Cf-Access-Jwt-Assertion':admin}});
  assert.equal(authenticated.status,200);
  assert.match(authenticated.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  const publicSite=await (await call('/api/site')).json();
  assert.deepEqual(publicSite.media.map(entry=>entry.id).sort(),initialMedia.map(entry=>entry.id).sort());
  assert.deepEqual(publicSite.payment,null);
  assert.equal((await call('/api/checkout',{method:'POST',headers:{origin}})).status,503);
  const siteEdit={title:'Creator Community',notice:'New catalogue',disabled:['video','ebook:'+bookIds[0]],
    amount:'120.50',currency:'INR',revision:0};
  assert.equal((await change('/api/admin/site',siteEdit,'PUT','https://cross-origin.example')).status,403);
  assert.equal((await change('/api/admin/site',{...siteEdit,amount:'-1'})).status,400);
  assert.equal((await change('/api/admin/site',siteEdit)).status,200);
  assert.equal((await change('/api/admin/site',siteEdit)).status,409);
  assert.equal((await call('/books/'+bookIds[0]+'.html')).status,404);
  assert.equal((await call('/books/downloads/'+bookIds[0]+'.zip')).status,404);
  assert.equal((await call('/books/'+bookIds[1]+'.html')).status,200);
  const entry={id:'test-media',kind:'podcast',title:'An episode',description:'Spoken audio',src:'https://media.example/test.m4a',
    poster:'',captions:'https://media.example/test.vtt',position:30,enabled:1,revision:null};
  assert.equal((await change('/api/admin/media',{...entry,src:'https://elsewhere.example/test.m4a'})).status,400);
  assert.equal((await change('/api/admin/media',entry)).status,200);
  assert.equal((await change('/api/admin/media',entry)).status,409);
  assert.equal((await change('/api/admin/media',{...entry,enabled:0,revision:0})).status,200);
  assert(!(await (await call('/api/site')).json()).media.some(media=>media.id===entry.id));
  assert.equal((await change('/api/admin/media/'+entry.id,{revision:1},'DELETE')).status,200);

  assert.equal((await call('/api/checkout',{method:'POST'})).status,403);
  const pay=()=>call('/api/checkout',{method:'POST',headers:{origin}});
  const created=await pay();
  assert.equal(created.status,201);
  const order=await created.json();
  assert.equal(order.url,'https://payment.example/i/1');
  assert.equal((await (await call('/api/orders/'+order.id)).json()).status,'pending');
  const notify=async(type,storeId='store-id',good=true)=>{
    const content=JSON.stringify({type,storeId,invoiceId:'invoice-1'});
    const encoder=new TextEncoder();
    const key=await crypto.subtle.importKey('raw',encoder.encode(env.BTCPAY_WEBHOOK_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const mac=Buffer.from(await crypto.subtle.sign('HMAC',key,encoder.encode(content))).toString('hex');
    return call('/api/payments/webhook',{method:'POST',headers:{'BTCPay-Sig':'sha256='+(good?mac:'0'.repeat(64))},body:content});
  };
  assert.equal((await notify('InvoiceSettled','store-id',false)).status,401);
  assert.equal((await notify('InvoiceSettled','other-store')).status,403);
  assert.equal((await notify('InvoiceExpired')).status,200);
  assert.equal((await notify('InvoiceSettled')).status,200);
  assert.equal((await notify('InvoiceSettled')).status,200);
  assert.equal((await notify('InvoiceExpired')).status,200);
  assert.equal((await (await call('/api/orders/'+order.id)).json()).status,'settled');
  for(let i=0;i<4;i++)assert.equal((await pay()).status,201);
  assert.equal((await pay()).status,429);
  const overview=await (await call('/api/admin',{headers:{'Cf-Access-Jwt-Assertion':admin}})).json();
  assert.equal(overview.events.length,4);
  assert.equal(overview.orders.length,5);
  assert.equal(overview.actor,'admin@example.com');
  console.log('Worker: Access JWT policy, write origin, D1 revisions and auditing, ebook visibility, media validation, hosted checkout, signed replay-safe settlement and throttling passed.');
}finally{globalThis.fetch=fetchReal;sql.close();}
