import {createRemoteJWKSet, jwtVerify} from 'jose';

let jwks, issuer;
export async function adminIdentity(request, env) {
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM || '') || !env.ACCESS_AUD) return null;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const origin = `https://${env.ACCESS_TEAM}`;
  if (issuer !== origin) {
    jwks = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', origin));
    issuer = origin;
  }
  try {
    const {payload} = await jwtVerify(token, jwks, {
      issuer: origin, audience: env.ACCESS_AUD, algorithms: ['RS256'], requiredClaims:['exp','sub'],
    });
    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    const allowed = (env.ADMIN_EMAILS || '').toLowerCase().split(',').map(value=>value.trim());
    return email && allowed.includes(email) ? email : null;
  } catch {
    return null;
  }
}
