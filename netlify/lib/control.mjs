import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {launchFeatures} from '../../public/js/launch-catalogue.js';
import {json} from './auth.mjs';

export const defaults={title:'Human Within',notice:'',disabled:['support'],amount:'100',currency:'INR',revision:0};
export async function read(store,key,fallback){
  const value=await store.getWithMetadata(key,{type:'json'});
  return {data:value?.data??fallback,etag:value?.etag};
}
export async function save(store,key,value,next){
  return (await store.setJSON(key,next,value.etag?{onlyIfMatch:value.etag}:{onlyIfNew:true})).modified;
}
export const conflict=()=>json({error:'This record changed. Reload and try again.'},409);
export async function changeSettings(store,input){
  if(typeof input.title!=='string'||!input.title.trim()||input.title.length>80||
    typeof input.notice!=='string'||input.notice.length>500||
    typeof input.amount!=='string'||!/^(?:[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(input.amount)||
    !['INR','USD','EUR'].includes(input.currency)||!Array.isArray(input.disabled)||
    input.disabled.some(id=>!launchFeatures.includes(id)))return json({error:'Check the site settings'},400);
  const current=await read(store,'settings',defaults);
  if(input.revision!==current.data.revision)return conflict();
  const next={title:input.title.trim(),notice:input.notice.trim(),amount:input.amount,currency:input.currency,
    disabled:[...new Set(input.disabled)],revision:current.data.revision+1};
  return await save(store,'settings',current,next)?json({ok:true}):conflict();
}
export const visibleUsers=users=>users.map(({id,name,email,enabled,created_at,revision})=>({id,name,email,enabled,created_at,revision}));
export const tokenHash=token=>createHash('sha256').update(token).digest('hex');

export async function changeUser(store,input){
  const current=await read(store,'users',[]);
  const users=current.data;
  const existing=users.find(user=>user.id===input.id);
  if(input.id && (!existing||existing.revision!==input.revision))return conflict();
  if(typeof input.name!=='string'||!input.name.trim()||input.name.length>100||
    typeof input.email!=='string'||input.email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(input.email)||typeof input.enabled!=='boolean'){
    return json({error:'Enter a name and valid email address'},400);
  }
  if(!existing&&users.length>=1000)return json({error:'User directory is full'},409);
  const email=input.email.trim().toLowerCase();
  if(users.some(user=>user.email===email&&user.id!==existing?.id))return json({error:'Email already exists'},409);
  const token=!existing||input.rotate?randomBytes(32).toString('base64url'):null;
  const member={id:existing?.id??randomUUID(),email,name:input.name.trim(),enabled:input.enabled,
    key:token?tokenHash(token):existing.key,created_at:existing?.created_at??new Date().toISOString(),revision:(existing?.revision??-1)+1};
  if(!await save(store,'users',current,[...users.filter(user=>user.id!==member.id),member]))return conflict();
  return json({ok:true,token});
}
