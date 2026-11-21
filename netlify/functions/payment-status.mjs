import {getStore} from '@netlify/blobs';
import {createPaymentHandler} from '../lib/payments.mjs';

export const config={path:['/api/orders/:id','/api/payments/webhook']};
export default createPaymentHandler(()=>getStore({name:'creator-catalogue',consistency:'strong'}));
