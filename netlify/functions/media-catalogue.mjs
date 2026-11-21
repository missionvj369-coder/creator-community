import {getStore} from '@netlify/blobs';
import {initialMedia,mediaKinds} from '../../public/js/launch-catalogue.js';
import {credentials,isAdmin,json,readJSON,sameOrigin} from '../lib/auth.mjs';

import {changeSettings,changeUser,defaults,read,visibleUsers} from '../lib/control.mjs';
import {paymentReady} from '../lib/payments.mjs';

export const config = {path:['/api/site','/api/admin','/api/admin/media','/api/admin/media/:id','/api/admin/site','/api/admin/users']};
const key = 'media';
const idPattern = /^[a-z0-9-]{1,48}$/;
const audio = /\.(mp3|m4a|aac|wav|ogg|flac|opus)$/i;
const video = /\.(mp4|webm)$/i;
const poster = /\.(png|jpe?g|webp|avif)$/i;
const captions = /\.vtt$/i;

function field(value, length, required = false) {
  if (typeof value !== 'string' || value.length > length || (required && !value.trim())) throw Error('Check the text fields');
  return value.trim();
}
function asset(value, extension, required = false) {
  const input = field(value,1000,required);
  if (!input) return '';
  const url = new URL(input,'https://local.invalid');
  const local = url.origin === 'https://local.invalid' && /^\/(videos|cinema\/audio|meditation|assets|media)\//.test(url.pathname);
  if (!extension.test(url.pathname) || url.username || url.password || (!local && !input.startsWith('https://'))) {
    throw Error('Use a direct HTTPS media file URL or a packaged media path');
  }
  return local ? url.pathname + url.search : url.href;
}
function mediaEntry(input) {
  if (typeof input.id !== 'string' || !idPattern.test(input.id) || !mediaKinds.includes(input.kind) ||
      !Number.isInteger(input.position) || input.position < 0 || input.position > 9999 || ![0,1].includes(input.enabled)) {
    throw Error('Check the ID, section, and position');
  }
  return {id:input.id, kind:input.kind, title:field(input.title,120,true), description:field(input.description,600),
    src:asset(input.src,input.kind==='video'?video:audio,true),poster:asset(input.poster,poster),
    captions:asset(input.captions,captions),enabled:input.enabled,position:input.position};
}

export function createHandler(openStore) {
  return async request => {
    const path = new URL(request.url).pathname;
    const publicRoute = path === '/api/site';
    const account = credentials();
    if (!publicRoute) {
      if (!account) return json({error:'Set CREATOR_ADMIN_PASSWORD in Netlify Functions to enable sign-in.'},503);
      if (!isAdmin(request,account)) return json({error:'Sign in to manage media'},401);
      if (request.method !== 'GET' && !sameOrigin(request)) return json({error:'Origin not allowed'},403);
    }
    try {
      const store = openStore();
      const saved = await store.getWithMetadata(key,{type:'json'});
      const media = (saved?.data ?? initialMedia.map(item=>({...item,poster:item.poster??'',captions:'',revision:0})))
        .sort((a,b)=>a.position-b.position||a.id.localeCompare(b.id));
      if (publicRoute && request.method==='GET'){
        const {data:site}=await read(store,'settings',defaults);
        return json({title:site.title,notice:site.notice,disabled:site.disabled,media:media.filter(item=>item.enabled),
          payment:paymentReady()&&!site.disabled.includes('support')?{amount:site.amount,currency:site.currency}:null});
      }
      if (path === '/api/admin' && request.method==='GET'){
        const [site,users,orders]=await Promise.all([read(store,'settings',defaults),read(store,'users',[]),read(store,'orders',[])]);
        return json({actor:account.username,mode:'netlify',media,site:site.data,users:visibleUsers(users.data),
          orders:orders.data.slice(-50).reverse(),paymentReady:paymentReady()});
      }
      if(request.method==='PUT'&&(path==='/api/admin/site'||path==='/api/admin/users')){
        let input;
        try{input=await readJSON(request);}catch{return json({error:'Invalid request'},400);}
        return path.endsWith('/site')?await changeSettings(store,input):await changeUser(store,input);
      }
      const adding = path === '/api/admin/media' && request.method==='PUT';
      const deleting = path.startsWith('/api/admin/media/') && request.method==='DELETE';
      if (!adding && !deleting) return json({error:'Method not allowed'},405);
      let input, entry;
      try {
        input=await readJSON(request);
        entry=adding?mediaEntry(input):null;
      } catch (error) { return json({error:error.message},400); }
      const id = adding ? entry.id : path.split('/').at(-1);
      if (!idPattern.test(id)) return json({error:'Invalid ID'},400);
      const current = media.find(item=>item.id===id);
      const revision = current?.revision ?? null;
      if (input.revision!==revision || (deleting && !current)) return json({error:'This entry changed. Reload and try again.'},409);
      if (adding && !current && media.length>=500) return json({error:'Catalogue limit reached'},409);
      const next=media.filter(item=>item.id!==id);
      if (adding) next.push({...entry,revision:(revision??-1)+1});
      const result=await store.setJSON(key,next,saved?{onlyIfMatch:saved.etag}:{onlyIfNew:true});
      return result.modified ? json({ok:true}) : json({error:'The catalogue changed. Reload and try again.'},409);
    } catch {
      return json({error:'Media catalogue storage is unavailable'},503);
    }
  };
}
export default createHandler(()=>getStore({name:'creator-catalogue',consistency:'strong'}));
