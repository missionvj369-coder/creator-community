const encoder = new TextEncoder();
const states = {InvoiceSettled:'settled',InvoiceExpired:'expired',InvoiceInvalid:'invalid'};

export function paymentEnabled(env) {
  return Boolean(env.BTCPAY_URL && env.BTCPAY_STORE_ID && env.BTCPAY_API_KEY && env.BTCPAY_WEBHOOK_SECRET);
}

export async function checkout(request, env, settings, json) {
  if (!paymentEnabled(env) || JSON.parse(settings.disabled).includes('support')) {
    return json({error:'Checkout unavailable'}, 503);
  }
  const now = Math.floor(Date.now()/1000);
  const window = Math.floor(now/600);
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${window}:${ip}:${env.BTCPAY_WEBHOOK_SECRET}`));
  const bucket = Array.from(new Uint8Array(digest), byte=>byte.toString(16).padStart(2,'0')).join('');
  const [limit] = await env.DB.batch([
    env.DB.prepare(`INSERT INTO checkout_limits(bucket,count,expires_at) VALUES (?,1,?)
      ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count`).bind(bucket,(window+1)*600),
    env.DB.prepare('DELETE FROM checkout_limits WHERE expires_at<=?').bind(now),
  ]);
  if (limit.results[0].count > 5) return json({error:'Please wait before creating another checkout'},429);
  const id = crypto.randomUUID();
  const origin = new URL(request.url).origin;
  const gateway = new URL(env.BTCPAY_URL);
  if (gateway.protocol !== 'https:' || gateway.username || gateway.password) throw new Error('Invalid gateway configuration');
  const endpoint = new URL(`/api/v1/stores/${encodeURIComponent(env.BTCPAY_STORE_ID)}/invoices`,gateway);
  const reply = await fetch(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),
    headers:{authorization:`token ${env.BTCPAY_API_KEY}`,'content-type':'application/json'},
    body:JSON.stringify({amount:settings.amount,currency:settings.currency,metadata:{orderId:id},
      checkout:{redirectURL:`${origin}/#/support/${id}`,redirectAutomatically:true}})});
  if (!reply.ok) return json({error:'Payment provider unavailable'},502);
  const invoice = await reply.json();
  const checkoutUrl = new URL(invoice.checkoutLink);
  if (checkoutUrl.origin !== gateway.origin || typeof invoice.id !== 'string' || !invoice.id || invoice.id.length > 128) {
    return json({error:'Invalid payment provider response'},502);
  }
  await env.DB.prepare(`INSERT INTO orders(id,invoice_id,amount,currency,status) VALUES (?,?,?,?,'pending')`)
    .bind(id,invoice.id,settings.amount,settings.currency).run();
  return json({url:checkoutUrl.href,id},201);
}

export async function verifySignature(bytes, signature, secret) {
  if (!secret || !/^sha256=[a-f0-9]{64}$/i.test(signature || '')) return false;
  const mac = Uint8Array.from(signature.slice(7).match(/../g), byte=>parseInt(byte,16));
  const key = await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  return crypto.subtle.verify('HMAC',key,mac,bytes);
}

export async function webhook(request, env, json, readBytes) {
  const bytes = await readBytes(request);
  if (!await verifySignature(bytes,request.headers.get('BTCPay-Sig'),env.BTCPAY_WEBHOOK_SECRET)) {
    return json({error:'Invalid signature'},401);
  }
  let event;
  try { event=JSON.parse(new TextDecoder().decode(bytes)); }
  catch { return json({error:'Malformed webhook'},400); }
  if (!event || typeof event !== 'object' || event.storeId !== env.BTCPAY_STORE_ID) return json({error:'Invalid store'},403);
  if (!Object.hasOwn(states,event.type)) return json({ok:true});
  if (typeof event.invoiceId !== 'string') return json({error:'Missing invoice'},400);
  const next = states[event.type];
  const row = await env.DB.prepare('SELECT status FROM orders WHERE invoice_id=?').bind(event.invoiceId).first();
  if (!row) return json({error:'Invoice not registered'},503);
  await env.DB.prepare(`UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP
    WHERE invoice_id=? AND status<>? AND (status='pending' OR ?='settled')`)
    .bind(next,event.invoiceId,next,next).run();
  return json({ok:true});
}
