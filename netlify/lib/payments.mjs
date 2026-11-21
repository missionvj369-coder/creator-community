import {randomUUID} from 'node:crypto';
import {verifySignature} from '../../worker/payment.js';
import {json,sameOrigin} from './auth.mjs';
import {conflict,defaults,read,save} from './control.mjs';

const key='orders';
const states={InvoiceSettled:'settled',InvoiceExpired:'expired',InvoiceInvalid:'invalid'};
export function paymentReady(env=process.env){
  try{
    const url=new URL(env.BTCPAY_URL);
    return url.protocol==='https:'&&!url.username&&!url.password&&Boolean(env.BTCPAY_STORE_ID&&env.BTCPAY_API_KEY&&env.BTCPAY_WEBHOOK_SECRET);
  }catch{return false;}
}
async function mutate(store,transform){
  for(let i=0;i<4;i++){
    const saved=await read(store,key,[]);
    const next=transform(saved.data);
    if(!next)return false;
    if(await save(store,key,saved,next))return true;
  }
  return false;
}
export function createPaymentHandler(openStore,env=process.env,requestProvider=fetch){
  return async request=>{
    const url=new URL(request.url);
    try{
      const store=openStore();
      if(request.method==='GET'&&url.pathname.startsWith('/api/orders/')){
        const id=url.pathname.split('/').at(-1);
        const order=(await read(store,key,[])).data.find(item=>item.id===id);
        return order?json({status:order.status,amount:order.amount,currency:order.currency}):json({error:'Order unavailable'},404);
      }
      if(request.method!=='POST')return json({error:'Method not allowed'},405);
      if(url.pathname==='/api/payments/webhook'){
        const reader=request.body?.getReader();
        if(!reader)return json({error:'Invalid webhook'},400);
        const chunks=[];
        let size=0;
        while(true){
          const {value,done}=await reader.read();
          if(done)break;
          size+=value.length;
          if(size>32768){await reader.cancel();return json({error:'Request too large'},413);}
          chunks.push(value);
        }
        const bytes=Buffer.concat(chunks);
        if(!await verifySignature(bytes,request.headers.get('BTCPay-Sig'),env.BTCPAY_WEBHOOK_SECRET))return json({error:'Invalid signature'},401);
        let event;
        try{event=JSON.parse(bytes.toString('utf8'));}catch{return json({error:'Invalid event'},400);}
        if(event?.storeId!==env.BTCPAY_STORE_ID)return json({error:'Invalid store'},403);
        if(!Object.hasOwn(states,event.type))return json({ok:true});
        const state=states[event.type];
        const recorded=await mutate(store,orders=>{
          const order=orders.find(item=>item.invoice_id===event.invoiceId);
          if(!order)return null;
          if(order.status!=='settled'&&(order.status==='pending'||state==='settled'))order.status=state;
          return orders;
        });
        return recorded?json({ok:true}):json({error:'Retry webhook'},503);
      }
      if(url.pathname!=='/api/checkout')return json({error:'Unknown endpoint'},404);
      if(!sameOrigin(request))return json({error:'Origin not allowed'},403);
      const site=(await read(store,'settings',defaults)).data;
      if(!paymentReady(env)||site.disabled.includes('support'))return json({error:'Checkout unavailable'},503);
      if((await read(store,key,[])).data.length>=10000)return json({error:'Checkout temporarily unavailable'},503);
      const id=randomUUID();
      const provider=new URL(env.BTCPAY_URL);
      const api=new URL('/api/v1/stores/'+encodeURIComponent(env.BTCPAY_STORE_ID)+'/invoices',provider);
      const response=await requestProvider(api,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),
        headers:{authorization:'token '+env.BTCPAY_API_KEY,'content-type':'application/json'},
        body:JSON.stringify({amount:site.amount,currency:site.currency,metadata:{orderId:id},
          checkout:{redirectURL:url.origin+'/#/support/'+id,redirectAutomatically:true}})});
      if(!response.ok)return json({error:'Payment provider unavailable'},502);
      const invoice=await response.json();
      const checkout=new URL(invoice.checkoutLink);
      if(checkout.origin!==provider.origin||checkout.username||checkout.password||typeof invoice.id!=='string'||!invoice.id||invoice.id.length>128)return json({error:'Invalid invoice'},502);
      const order={id,invoice_id:invoice.id,amount:site.amount,currency:site.currency,status:'pending',created_at:new Date().toISOString()};
      return await mutate(store,orders=>orders.length<10000?[...orders,order]:null)?json({url:checkout.href,id},201):conflict();
    }catch{return json({error:'Payment service temporarily unavailable'},503);}
  };
}
