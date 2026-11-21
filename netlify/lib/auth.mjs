import {createHash, createHmac, randomBytes, timingSafeEqual} from 'node:crypto';

const cookieName = '__Host-creator_admin';
const lifetime = 60 * 60 * 8;

export function json(body, status = 200, headers = {}) {
  return Response.json(body, {status, headers: {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
export function sameOrigin(request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
export async function readJSON(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw Error('Expected JSON');
  let body = '';
  for await (const chunk of request.body.pipeThrough(new TextDecoderStream())) {
    body += chunk;
    if (body.length > 8192) throw Error('Request is too large');
  }
  const value = JSON.parse(body);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Expected an object');
  return value;
}
export function credentials() {
  const password = process.env.CREATOR_ADMIN_PASSWORD;
  return password?.length >= 24 ? {username: process.env.CREATOR_ADMIN_USERNAME || 'admin', password} : null;
}
const hash = value => createHash('sha256').update(value).digest();
export function matches(input, account) {
  if (typeof input.username !== 'string' || typeof input.password !== 'string') return false;
  const userOK = timingSafeEqual(hash(input.username), hash(account.username));
  const passOK = timingSafeEqual(hash(input.password), hash(account.password));
  return userOK && passOK;
}
const sign = (account, payload) => createHmac('sha256', account.password).update('creator-session/v1\n' + account.username + '\n' + payload).digest();
const cookie = (value, age) => `${cookieName}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
export function newSession(account) {
  const payload = `${Math.floor(Date.now()/1000) + lifetime}.${randomBytes(16).toString('hex')}`;
  return cookie(`${payload}.${sign(account,payload).toString('hex')}`,lifetime);
}
export function clearSession() { return cookie('',0); }
export function isAdmin(request, account) {
  const token = request.headers.get('cookie')?.split(';').map(part=>part.trim())
    .find(part=>part.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  const match = token?.match(/^(\d{10,12}\.[a-f\d]{32})\.([a-f\d]{64})$/);
  if (!match || Number(match[1].split('.')[0]) <= Date.now()/1000) return false;
  return timingSafeEqual(sign(account,match[1]),Buffer.from(match[2],'hex'));
}
