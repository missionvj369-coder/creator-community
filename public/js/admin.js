import {h,mount} from './ui.js';
import {launchFeatures,mediaKinds} from './launch-catalogue.js';

const workspace=document.querySelector('#workspace');
const status=document.querySelector('#status');
const tabs=document.querySelector('#tabs');
let state,active='site',busy=false;
const signOut=document.querySelector('#admin-signout');
const labels={ebooks:'Ebook library',meditate:'Still Room',welcome:'Cinematic opening',support:'Support checkout',music:'16 · Music',video:'17 · Video',podcast:'18 · Podcast'};

async function call(url,method='GET',data){
  const response=await fetch(url,{
    method,credentials:'same-origin',cache:'no-store',
    ...(data?{headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{}),
  });
  if(response.status===403)throw Error('Your administrator session has expired or access was denied. Sign in again.');
  if(!response.headers.get('content-type')?.includes('application/json'))throw Error('Refresh to sign in again.');
  const result=await response.json();
  if(!response.ok)throw Object.assign(Error(result.error||'The request failed'),{status:response.status});
  return result;
}
async function refresh(){
  state=await call('/api/admin');
  document.querySelector('#identity').textContent=state.actor;
  if(state.mode==='media'){
    active='media';
    for(const button of tabs.querySelectorAll('button'))button.hidden=button.dataset.panel!=='media';
    signOut.onclick=async event=>{
      event.preventDefault();
      try{await call('/api/admin/session','DELETE');location.reload();}
      catch(error){status.textContent=error.message;}
    };
  }
  tabs.hidden=false;
  paint();
}
async function write(url,method,data){
  if(busy)return;
  busy=true;
  status.textContent='Saving…';
  workspace.inert=true;
  try{
    await call(url,method,data);
    await refresh();
    status.textContent='Saved.';
  }catch(error){status.textContent=error.message;}
  finally{workspace.inert=false;busy=false;}
}
const field=(label,name,value,options={})=>h('label',{},label,h('input',{name,value,...options}));
const select=(label,name,values,current)=>h('label',{},label,h('select',{name},
  values.map(value=>h('option',{value,selected:value===current},value))));
const dataOf=form=>Object.fromEntries(new FormData(form));
function settings(){
  const site=state.site;
  const form=h('form',{class:'admin-card',onsubmit:event=>{
    event.preventDefault();
    const values=dataOf(form);
    const disabled=launchFeatures.filter(id=>!Object.hasOwn(values,`feature:${id}`));
    void write('/api/admin/site','PUT',{title:values.title,notice:values.notice,amount:values.amount,currency:values.currency,disabled,revision:site.revision});
  }},h('h2',{},'Site & features'),
  field('Site title','title',site.title,{required:true,maxlength:80}),
  field('Home notice','notice',site.notice,{maxlength:500}),
  h('fieldset',{},h('legend',{},'Published features'),h('div',{class:'feature-grid'},launchFeatures.map(id=>
    h('label',{class:'check'},h('input',{type:'checkbox',name:`feature:${id}`,checked:!site.disabled.includes(id)}),labels[id]||id.replace('ebook:','Book · ').replaceAll('-',' '))))),
  h('fieldset',{},h('legend',{},'One-time contribution'),
    field('Amount','amount',site.amount,{required:true,inputmode:'decimal'}),
    select('Invoice currency','currency',['INR','USD','EUR'],site.currency)),
  h('button',{type:'submit',class:'primary'},'Publish settings'));
  return form;
}

function editor(entry){
  const {id='',kind='music',title='',description='',src='',poster='',captions='',position=10,enabled=1,revision=null}=entry || {};
  const form=h('form',{class:'admin-card',onsubmit:event=>{
    event.preventDefault();
    const data=dataOf(form);
    void write('/api/admin/media','PUT',{...data,id:id||data.id,position:Number(data.position),enabled:data.enabled?1:0,revision});
  }},h('h3',{},title||'Add media'),
    field('ID','id',id,{required:true,pattern:'[a-z0-9-]{1,48}',readonly:Boolean(entry)}),
    select('Section','kind',mediaKinds,kind),
    field('Title','title',title,{required:true,maxlength:120}),
    field('Description','description',description,{maxlength:600}),
    field('Audio or video URL','src',src,{required:true,maxlength:1000}),
    field('Poster URL','poster',poster,{maxlength:1000}),
    field('Captions URL (.vtt)','captions',captions,{maxlength:1000}),
    field('Position','position',position,{required:true,type:'number',min:0,max:9999}),
    h('label',{class:'check'},h('input',{type:'checkbox',name:'enabled',checked:enabled===1}),'Visible in library'),
    h('div',{class:'form-actions'},h('button',{type:'submit',class:'primary'},entry?'Save media':'Add to catalogue'),
      entry&&h('button',{type:'button',class:'danger',onclick:()=>{
        if(confirm(`Remove ${entry.title} from the catalogue?`))void write('/api/admin/media/'+entry.id,'DELETE',{revision});
      }},'Remove')));
  return entry?h('details',{},h('summary',{},`${entry.kind} · ${entry.title}${entry.enabled?'':' (hidden)'}`),form):form;
}

function table(title,columns,records){
  return h('section',{class:'admin-card'},h('h2',{},title),records.length
    ?h('div',{class:'table-scroll'},h('table',{},
      h('thead',{},h('tr',{},columns.map(([caption])=>h('th',{scope:'col'},caption)))),
      h('tbody',{},records.map(record=>h('tr',{},columns.map(([,key])=>h('td',{},String(record[key]??''))))))))
    :h('p',{},'No records yet.'));
}

function paint(){
  for(const button of tabs.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.panel===active));
  if(active==='site')mount(workspace,settings());
  if(active==='media')mount(workspace,h('h2',{},'Media catalogue'),
    h('p',{},state.mode==='media'?'Paste a direct HTTPS audio or video file link. Caption tracks use WebVTT.':'Use packaged media paths or URLs on the configured HTTPS media origin. Caption tracks use WebVTT.'),editor(null),state.media.map(editor));
  if(active==='payments')mount(workspace,h('p',{},state.paymentReady?'BTCPay credentials configured.':'BTCPay credentials are missing.'),
    table('Latest 50 orders',[['Created','created_at'],['Invoice','invoice_id'],['Amount','amount'],['Currency','currency'],['Status','status']],state.orders));
  if(active==='audit')mount(workspace,table('Latest 50 changes',[['Time','created_at'],['Administrator','actor'],['Action','action'],['Record','target']],state.events));
}
tabs.addEventListener('click',event=>{
  const panel=event.target.closest('button[data-panel]')?.dataset.panel;
  if(panel&&!busy){active=panel;paint();}
});
function login(){
  signOut.hidden=true;
  status.textContent='Sign in to publish music, videos, and podcasts.';
  const form=h('form',{class:'admin-card',onsubmit:async event=>{
    event.preventDefault();
    if(busy)return;
    busy=true;
    try{
      await call('/api/admin/session','POST',dataOf(form));
      form.reset();
      await refresh();
      signOut.hidden=false;
      status.textContent='';
    }catch(error){status.textContent=error.message;}
    finally{busy=false;}
  }},h('h2',{},'Admin sign-in'),
    field('Username','username','admin',{required:true,autocomplete:'username'}),
    field('Password','password','',{type:'password',required:true,autocomplete:'current-password'}),
    h('button',{type:'submit',class:'primary'},'Sign in'));
  mount(workspace,form);
}
refresh().then(()=>{status.textContent='';}).catch(error=>{
  if(error.status===401)login();
  else{signOut.hidden=true;status.textContent=error.message;}
});
