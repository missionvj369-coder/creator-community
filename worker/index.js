import {adminIdentity} from './access.js';
import {checkout,paymentEnabled,webhook} from './payment.js';
import {bookIds,launchFeatures,mediaKinds} from '../public/js/launch-catalogue.js';

const security = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'};
const json = (value,status=200)=>Response.json(value,{status,headers:security});
const idPattern=/^[a-z0-9-]{1,48}$/;
const orderPattern=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const mediaColumns='id,kind,title,description,src,poster,captions,enabled,position,revision';

class InputError extends Error {
  constructor(message,status=400){super(message);this.status=status;}
}
async function readBytes(request) {
  const limit=32768;
  if (Number(request.headers.get('content-length'))>limit) throw new InputError('Request too large',413);
  const reader=request.body?.getReader();
  if(!reader)return new Uint8Array();
  const chunks=[];
  let size=0;
  try{
    for(;;){
      const {value,done}=await reader.read();
      if(done)break;
      size+=value.byteLength;
      if(size>limit){await reader.cancel();throw new InputError('Request too large',413);}
      chunks.push(value);
    }
  }finally{reader.releaseLock();}
  const result=new Uint8Array(size);
  let offset=0;
  for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.byteLength;}
  return result;
}
async function body(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new InputError('Use application/json',415);
  const bytes=await readBytes(request);
  let value;
  try { value=JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new InputError('Invalid JSON'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InputError('Expected an object');
  return value;
}
function word(value,max,required=false){
  if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw new InputError('Invalid text field');
  return value.trim();
}
function asset(value,env,extensions,required=false){
  value=word(value,1000,required);
  if(!value)return '';
  const url=new URL(value,'https://local.invalid');
  const path=url.pathname.toLowerCase();
  if(url.username||url.password||!extensions.some(ext=>path.endsWith(ext)))throw new InputError('Unsupported media URL');
  if(value.startsWith('/')&&!value.startsWith('//')&&url.origin==='https://local.invalid'&&/^\/(videos|cinema\/audio|meditation|assets|media)\//.test(path))return value;
  if(url.protocol==='https:'&&url.origin===env.MEDIA_ORIGIN&&value.startsWith('https://'))return value;
  throw new InputError('Use a catalogued local asset or the configured media origin');
}
async function settings(db){return db.prepare('SELECT * FROM site_settings WHERE singleton=1').first();}
async function media(db,admin=false){
  const {results}=await db.prepare(`SELECT ${mediaColumns} FROM media ${admin?'':'WHERE enabled=1'} ORDER BY position,id`).all();
  return results;
}
function sameOrigin(request) {
  return request.headers.get('origin')===new URL(request.url).origin;
}
async function audited(db,statement,actor,action,target){
  const [result]=await db.batch([statement,db.prepare(
    'INSERT INTO audit_log(actor,action,target) SELECT ?,?,? WHERE changes()=1'
  ).bind(actor,action,target)]);
  if (result.meta.changes!==1) return json({error:'This record changed. Reload before saving.'},409);
  return json({ok:true});
}
async function admin(request,env,path,actor){
  const db=env.DB;
  const method=request.method;
  if(method==='GET'&&path==='/api/admin'){
    const [site,entries,orders,events]=await Promise.all([
      settings(db),media(db,true),
      db.prepare('SELECT id,invoice_id,amount,currency,status,created_at,updated_at FROM orders ORDER BY created_at DESC LIMIT 50').all(),
      db.prepare('SELECT actor,action,target,created_at FROM audit_log ORDER BY id DESC LIMIT 50').all(),
    ]);
    return json({actor,site:{...site,disabled:JSON.parse(site.disabled)},media:entries,paymentReady:paymentEnabled(env),orders:orders.results,events:events.results});
  }
  if(method!=='GET'&&!sameOrigin(request))return json({error:'Origin not allowed'},403);
  if(method==='PUT'&&path==='/api/admin/site'){
    const input=await body(request);
    const title=word(input.title,80,true),notice=word(input.notice,500);
    const amount=word(input.amount,15,true);
    if(!/^(?:[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(amount)||!['INR','USD','EUR'].includes(input.currency)
        ||!Number.isInteger(input.revision)||!Array.isArray(input.disabled)||input.disabled.some(id=>!launchFeatures.includes(id))){
      throw new InputError('Check the amount, currency, feature keys and revision');
    }
    return audited(db,db.prepare(`UPDATE site_settings SET title=?,notice=?,disabled=?,amount=?,currency=?,revision=revision+1
      WHERE singleton=1 AND revision=?`).bind(title,notice,JSON.stringify([...new Set(input.disabled)]),amount,input.currency,input.revision),actor,'site.update','site');
  }
  if(method==='PUT'&&path==='/api/admin/media'){
    const input=await body(request);
    if(typeof input.id!=='string'||!idPattern.test(input.id)||!mediaKinds.includes(input.kind)||!Number.isInteger(input.position)
      || input.position<0 ||input.position>9999 || ![0,1].includes(input.enabled)
      || (input.revision!==null&&!Number.isInteger(input.revision)))throw new InputError('Check media ID, type, position and revision');
    const src=asset(input.src,env,input.kind==='video'?['.mp4','.webm']:['.m4a','.mp3','.ogg','.wav','.flac'],true);
    const fields=[input.kind,word(input.title,120,true),word(input.description,600),src,
      asset(input.poster,env,['.jpg','.jpeg','.webp','.png']),asset(input.captions,env,['.vtt']),input.enabled,input.position];
    const query=input.revision===null
      ?db.prepare('INSERT INTO media(id,kind,title,description,src,poster,captions,enabled,position) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(input.id,...fields)
      :db.prepare('UPDATE media SET kind=?,title=?,description=?,src=?,poster=?,captions=?,enabled=?,position=?,revision=revision+1 WHERE id=? AND revision=?').bind(...fields,input.id,input.revision);
    return audited(db,query,actor,'media.save',input.id);
  }
  if(method==='DELETE'&&path.startsWith('/api/admin/media/')){
    const id=path.split('/').at(-1);
    const input=await body(request);
    if(!idPattern.test(id)||!Number.isInteger(input.revision))throw new InputError('Invalid media ID or revision');
    return audited(db,db.prepare('DELETE FROM media WHERE id=? AND revision=?').bind(id,input.revision),actor,'media.remove',id);
  }
  return json({error:'Unknown admin operation'},404);
}

export default {
  async fetch(request,env){
    const {pathname:path}=new URL(request.url),method=request.method;
    try{
      const adminPage=path==='/admin'||path.startsWith('/admin/');
      if(adminPage||path==='/api/admin'||path.startsWith('/api/admin/')){
        const actor=await adminIdentity(request,env);
        if(!actor)return adminPage?new Response('Administrator sign-in required',{status:403,headers:security}):json({error:'Administrator sign-in required'},403);
        if(!adminPage)return await admin(request,env,path,actor);
        if(method!=='GET'&&method!=='HEAD')return json({error:'Method not allowed'},405);
        if(path==='/admin')return Response.redirect(new URL('/admin/',request.url),308);
        const assetResponse=await env.ASSETS.fetch(request);
        const headers=new Headers(assetResponse.headers);
        for(const [key,value] of Object.entries(security))headers.set(key,value);
        headers.set('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
        return new Response(assetResponse.body,{status:assetResponse.status,headers});
      }
      if(path.startsWith('/books/')){
        const book=decodeURIComponent(path).replace(/^\/books\/(?:downloads\/)?/,'').split(/[./]/)[0];
        const site=await settings(env.DB);
        const disabled=JSON.parse(site.disabled);
        if(disabled.includes('ebooks')||(bookIds.includes(book)&&disabled.includes('ebook:'+book))){
          return new Response('Book unavailable',{status:404,headers:security});
        }
      }
      if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
      if(method==='GET'&&path==='/api/site'){
        const [site,entries]=await Promise.all([settings(env.DB),media(env.DB)]);
        const disabled=JSON.parse(site.disabled);
        return json({title:site.title,notice:site.notice,disabled,media:entries,
          payment:paymentEnabled(env)&&!disabled.includes('support')?{amount:site.amount,currency:site.currency}:null});
      }
      if(method==='POST'&&path==='/api/checkout'){
        if(!sameOrigin(request))return json({error:'Origin not allowed'},403);
        return await checkout(request,env,await settings(env.DB),json);
      }
      if(method==='POST'&&path==='/api/payments/webhook')return await webhook(request,env,json,readBytes);
      const orderId=path.split('/').at(-1);
      if(method==='GET'&&path.startsWith('/api/orders/')&&orderPattern.test(orderId)){
        const record=await env.DB.prepare('SELECT amount,currency,status FROM orders WHERE id=?').bind(orderId).first();
        return record?json(record):json({error:'Order unavailable'},404);
      }
      return json({error:'Unknown endpoint'},404);
    }catch(error){
      if(error instanceof InputError)return json({error:error.message},error.status);
      console.error('Request failed',path,error.name);
      return json({error:'Service temporarily unavailable'},503);
    }
  },
};
