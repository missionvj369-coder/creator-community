// Reports the visible reader's actual page to the enclosing Human Within app.
(()=>{
  if(parent===window||location.protocol==='file:')return;
  const id=location.pathname.split('/').pop().replace(/\.html$/,'');
  const selectors={'body-you-live-in':'#counter','switch-off':'#pageCount','growing-mind':'#readCount','human-journey':'#status','how-to-work-with-me':'#page-status','why-am-i-like-this':'#count'};
  const sel=selectors[id];if(!sel)return;let last='',pending;const desired=Number(new URLSearchParams(location.search).get('resume'));let resumeAttempted=false;
  function send(){
    const element=document.querySelector(sel);if(!element)return;
    const match=element.textContent.match(/(\d+)\s*(?:\/|of)\s*(\d+)/i);if(!match)return;
    const page=+match[1],total=+match[2];if(!page||!total||page>total||total>10000)return;
    if(desired>1&&!resumeAttempted){
      resumeAttempted=true;
      if(id==='body-you-live-in'&&window.__bookDebug){window.__bookDebug.goTo(Math.min(desired,total)-1);schedule();return;}
      if(id==='switch-off'){location.hash='page='+Math.min(desired,total);schedule();return;}
      if(id==='growing-mind'){const input=document.getElementById('pageNumber');input.value=String(Math.min(desired,total));input.dispatchEvent(new Event('change'));schedule();return;}
      if(id==='human-journey'){const input=document.getElementById('slider');input.value=String(Math.min(desired,total)-1);input.dispatchEvent(new Event('input'));schedule();return;}
      const resume=document.getElementById(id==='how-to-work-with-me'?'resume-book':'resume');if(resume&&!resume.hidden){resume.click();schedule();return;}
    }
    // A hidden discovery counter is not a page the reader has reached.
    if(id==='why-am-i-like-this'&&!document.getElementById('cover')?.hidden)return;
    const key=`${page}:${total}`;if(key===last)return;last=key;
    const label=(document.querySelector('#running-heading,#chapter-label,#chapterCaption,#question')?.textContent||'').trim().slice(0,180);
    parent.postMessage({type:'human-within:reading',id,page,total,label},location.origin);
  }
  function schedule(){clearTimeout(pending);pending=setTimeout(send,120);}
  const counter=document.querySelector(sel);if(counter)new MutationObserver(schedule).observe(counter,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',schedule);document.addEventListener('keydown',schedule);document.addEventListener('input',schedule);addEventListener('pagehide',send);send();
})();
