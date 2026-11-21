import {getStore} from '@netlify/blobs';
import {json,readJSON,sameOrigin} from '../lib/auth.mjs';
import {read,tokenHash} from '../lib/control.mjs';

export const config={path:'/api/member',rateLimit:{windowSize:60,windowLimit:20,aggregateBy:['ip','domain']}};
const cookieName='__Host-creator_member';
const flags='; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=';
const tokenPattern=/^[A-Za-z0-9_-]{43}$/;

export function createMemberHandler(openStore){
  return async request=>{
    if(request.method!=='GET'&&!sameOrigin(request))return json({error:'Origin not allowed'},403);
    if(request.method==='DELETE')return json({ok:true},200,{'Set-Cookie':cookieName+'='+flags+'0'});
    let token;
    if(request.method==='POST'){
      try{token=(await readJSON(request)).token;}catch{return json({error:'Invalid request'},400);}
    }else if(request.method==='GET'){
      token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    }else return json({error:'Method not allowed'},405);
    if(typeof token!=='string'||!tokenPattern.test(token))return json({error:'Enter your member access key'},401);
    try{
      const hash=tokenHash(token);
      const {data}=await read(openStore(),'users',[]);
      const member=data.find(user=>user.enabled&&user.key===hash);
      if(!member)return json({error:'Access key is invalid or disabled'},401);
      const headers=request.method==='POST'?{'Set-Cookie':cookieName+'='+token+flags+'28800'}:{};
      return json({name:member.name,email:member.email},200,headers);
    }catch{return json({error:'Member accounts are temporarily unavailable'},503);}
  };
}
export default createMemberHandler(()=>getStore({name:'creator-catalogue',consistency:'strong'}));
