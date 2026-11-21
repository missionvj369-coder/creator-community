import {getStore} from '@netlify/blobs';
import {createPaymentHandler} from '../lib/payments.mjs';

export const config={path:'/api/checkout',method:'POST',rateLimit:{windowSize:60,windowLimit:5,aggregateBy:['ip','domain']}};
export default createPaymentHandler(()=>getStore({name:'creator-catalogue',consistency:'strong'}));
