import {clearSession,credentials,json,matches,newSession,readJSON,sameOrigin} from '../lib/auth.mjs';

export const config = {
  path: '/api/admin/session',
  rateLimit: {windowSize:60, windowLimit:10, aggregateBy:['ip','domain']},
};
export default async function handler(request) {
  const account = credentials();
  if (!account) return json({error:'Set CREATOR_ADMIN_PASSWORD in Netlify Functions to enable sign-in.'},503);
  if (!sameOrigin(request)) return json({error:'Origin not allowed'},403);
  if (request.method === 'DELETE') return json({ok:true},200,{'Set-Cookie':clearSession()});
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);
  let input;
  try { input = await readJSON(request); } catch { return json({error:'Invalid sign-in request'},400); }
  if (!matches(input,account)) return json({error:'Incorrect username or password'},401);
  return json({ok:true},200,{'Set-Cookie':newSession(account)});
}
