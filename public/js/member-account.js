const form=document.querySelector('#member-login');
const details=document.querySelector('#member-details');
const status=document.querySelector('#status');
async function request(method,token){
  const response=await fetch('/api/member',{method,cache:'no-store',
    ...(token?{headers:{'content-type':'application/json'},body:JSON.stringify({token})}:{})});
  const result=await response.json();
  if(!response.ok)throw Object.assign(Error(result.error),{status:response.status});
  return result;
}
function show(member){
  form.hidden=Boolean(member);
  details.hidden=!member;
  document.querySelector('#member-name').textContent=member?'Signed in as '+member.name:'';
}
form.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=form.querySelector('button');
  button.disabled=true;
  try{show(await request('POST',form.elements.token.value.trim()));form.reset();status.textContent='';}
  catch(error){status.textContent=error.message;}
  finally{button.disabled=false;}
});
document.querySelector('#member-signout').addEventListener('click',async()=>{
  try{await request('DELETE');show(null);status.textContent='Signed out.';}
  catch(error){status.textContent=error.message;}
});
request('GET').then(show).catch(error=>{show(null);if(error.status!==401)status.textContent=error.message;});
