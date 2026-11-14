import {discoveryShelf} from './discovery-shelf.js?v=18214deeb83d6066';
import {openSoundSettings} from '../cinema-controls.js?v=18214deeb83d6066';
import { h, mount, icon, sheet, toast } from '../ui.js?v=18214deeb83d6066';
import { state, resetDevice } from '../store.js?v=18214deeb83d6066';
import { INTENTS } from '../engine.js?v=18214deeb83d6066';
import { space, summary, saveProfile, setPreferences, toggleSaved, removeNote, downloadBackup, importData } from '../personal.js?v=18214deeb83d6066';
import { drone } from '../audio.js?v=18214deeb83d6066';
import { independentRoute, retiredWritingRoute } from '../experience-flow.js?v=18214deeb83d6066';
const fmt=at=>new Date(at).toLocaleDateString(undefined,{day:'numeric',month:'short'});
export function renderYou(root,ctx){
  ctx.setHue(160);const s=space(),stats=summary(),doc=state.doc;
  let selected=[...doc.intents],minutes=s.minutes,tone=s.tone;
  const actualName=doc.name==='Friend'?'':doc.name;
  const name=h('input',{type:'text',value:actualName,maxlength:40,placeholder:'Your name (optional)','aria-label':'Your name',autocomplete:'given-name'});
  const error=h('p',{class:'field-message',role:'status'});
  const avatar=h('div',{class:'profile-monogram','data-tone':tone,'aria-hidden':'true'},initials(actualName));
  const greeting=h('h1',{class:'display'},actualName?`${actualName}’s space`:'Your space');
  const selectMinutes=h('div',{class:'profile-choice-row'});
  const selectTones=h('div',{class:'tone-choices',role:'group','aria-label':'Profile colour'});
  const goals=h('div',{class:'chips',role:'group','aria-label':'What matters to you'});
  const paintMinutes=()=>mount(selectMinutes,[2,5,10].map(n=>h('button',{type:'button',class:`chip ${minutes===n?'on':''}`,'aria-pressed':String(minutes===n),onclick:()=>{minutes=n;paintMinutes();}},`${n} minutes`)));
  const paintTones=()=>mount(selectTones,['sage','lilac','clay','sky','rose'].map(t=>h('button',{type:'button',class:`tone-choice ${tone===t?'on':''}`,'data-tone':t,'aria-label':`${t} profile colour`,'aria-pressed':String(tone===t),onclick:()=>{tone=t;avatar.dataset.tone=t;paintTones();}},tone===t&&icon('check',17))));
  const paintGoals=()=>mount(goals,INTENTS.map(i=>h('button',{type:'button',class:`chip ${selected.includes(i.id)?'on':''}`,'aria-pressed':String(selected.includes(i.id)),onclick:()=>{if(selected.includes(i.id))selected=selected.filter(x=>x!==i.id);else if(selected.length<3)selected.push(i.id);else toast('Choose up to three things that matter to you.');paintGoals();}},i.label)));
  paintMinutes();paintTones();paintGoals();
  const save=h('button',{class:'btn primary',type:'submit'},'Save my preferences',icon('check',17));
  const form=h('form',{class:'profile-form',onsubmit:async e=>{e.preventDefault();const value=name.value.trim()||doc.name||'Friend';save.disabled=true;try{await saveProfile(value,selected,minutes,tone);error.textContent='Your preferences are saved on this device.';avatar.textContent=initials(value);greeting.textContent=value==='Friend'?'Your space':`${value}’s space`;toast('Saved. Your next moment will use these preferences.');}catch{error.textContent='Your preferences could not be saved. Please try again.';}finally{save.disabled=false;}}},
    h('h2',{},'Make yourself at home.'),h('label',{class:'profile-field'},h('span',{},'Your name · optional'),name),h('div',{class:'profile-field'},h('span',{},'Your optional pause length'),selectMinutes,h('p',{class:'fine'},'For brief optional pauses. Each experience keeps its own length.')),
    h('div',{class:'profile-field'},h('span',{},'What would you like more of?'),goals,h('p',{class:'fine'},'Keep the intentions that matter to you in your profile.')),h('div',{class:'profile-field'},h('span',{},'Your colour'),selectTones),error,save);
  const stat=(n,label)=>h('div',{class:'honest-stat'},h('strong',{},String(n)),h('span',{},label));
  const activity=h('div',{class:'activity-list'});
  const sessions=[...s.sessions].filter(x=>!retiredWritingRoute(x.route)&&!x.route.startsWith('#/atlas/')&&(x.seconds>0||x.completed)).reverse().slice(0,7);
  mount(activity,sessions.length?sessions.map(x=>h('a',{class:'activity-row',href:independentRoute(x.route,s.dailyPlan)},h('span',{class:'activity-glyph'},icon(x.kind==='eBook'?'book':x.kind==='Moment'?'sparkle':'play',19)),h('div',{},h('strong',{},x.title),h('p',{},`${fmt(x.at)} · ${x.completed?'Completed':'Visited'}${x.seconds>=60?' · '+Math.floor(x.seconds/60)+' min':x.seconds>0?' · '+Math.round(x.seconds)+' sec':''}`)),icon('arrow',17))):h('div',{class:'gentle-empty'},h('p',{},'Your first small moment belongs here.'),h('a',{class:'text-link',href:'#/moment'},'Take a moment',icon('arrow',16))));
  const savedList=h('div',{class:'saved-list'});
  function paintSaved(){const saved=space().saved.filter(x=>!retiredWritingRoute(x.route));mount(savedList,saved.length?saved.map(item=>h('div',{class:'saved-row'},h('a',{href:independentRoute(item.route,space().dailyPlan)},h('small',{},item.kind),h('strong',{},item.title)),h('button',{class:'icon-btn','aria-label':`Remove ${item.title} from saved`,onclick:()=>{toggleSaved(item);paintSaved();}},icon('close',16)))):h('p',{class:'fine'},'Save an experience or book with its bookmark button. Your favourites will be here.'));}paintSaved();
  const notesList=h('div',{class:'notes-list'});
  function paintNotes(){const notes=[...space().notes].reverse();mount(notesList,notes.length?notes.map(n=>h('div',{class:'personal-note'},h('div',{},h('small',{},fmt(n.at)),h('p',{},n.text)),h('button',{class:'icon-btn','aria-label':'Delete this note',onclick:()=>{removeNote(n.id);paintNotes();}},icon('close',16)))):h('p',{class:'fine'},'Your saved thoughts are kept here.'));}paintNotes();
  const upload=h('input',{type:'file',accept:'.json,application/json',hidden:true,'aria-label':'Choose a Human Within backup',onchange:async()=>{
    const f=upload.files?.[0];if(!f)return;try{if(f.size>5000000)throw Error('Choose a backup smaller than 5 MB.');const data=JSON.parse(await f.text());
      const sh=sheet(h('div',{class:'restore-review'},h('h2',{class:'display sm'},'Restore this backup?'),h('p',{class:'lede'},'This replaces the profile and progress on this device with the selected backup.'),h('div',{class:'row-center'},h('button',{class:'btn ghost',onclick:()=>sh.close()},'Keep this device as it is'),h('button',{class:'btn primary',onclick:async()=>{try{await importData(data);sh.close();setPreferences({motion:space().motion});ctx.render();toast('Your backup has been restored.');}catch(e){toast(e.message||'This backup could not be restored.');}}},'Restore backup'))),{label:'Restore backup'});
    }catch(e){toast(e.message||'That file could not be read. Choose a Human Within JSON backup.');}upload.value='';
  }});
  const sound=h('button',{class:'preference-toggle',onclick:openSoundSettings},h('span',{},'Music, voice & sound'),h('strong',{},'Adjust'));
  const motion=h('button',{class:'preference-toggle','aria-pressed':String(s.motion==='reduced'),onclick:()=>{setPreferences({motion:space().motion==='reduced'?'full':'reduced'});motion.setAttribute('aria-pressed',String(space().motion==='reduced'));motion.lastElementChild.textContent=space().motion==='reduced'?'Gentle':'Full';}},h('span',{},'Interface motion'),h('strong',{},s.motion==='reduced'?'Gentle':'Full'));
  mount(root,h('section',{class:'page hub-page profile-page rise'},h('div',{class:'profile-welcome'},avatar,h('div',{},h('p',{class:'eyebrow'},'A LITTLE SPACE THAT IS YOURS'),greeting,h('p',{class:'lede'},'Your moments, reading, and things worth keeping.'))),
    h('div',{class:'device-label'},icon('check',15),state.persistent?'Saved in this browser · no account needed':'Temporary session · export a backup before closing'),
    h('div',{class:'honest-stats'},stat(stats.completed,'moments completed'),stat(stats.minutes,'minutes here'),stat(stats.days,'days you made space'),stat(stats.books,'books explored')),
    h('div',{class:'profile-columns'},h('div',{class:'profile-column'},form,h('section',{class:'profile-panel'},h('h2',{},'Comfort, your way.'),motion,sound)),h('div',{class:'profile-column'},h('section',{class:'profile-panel'},h('h2',{},'Your recent moments.'),activity),h('section',{class:'profile-panel'},h('h2',{},'Saved for another day.'),savedList))),
    s.notes.length>0&&h('section',{class:'profile-panel'},h('h2',{},'Previously saved thoughts.'),notesList),
    discoveryShelf(),
    h('section',{class:'profile-panel backup-panel'},h('div',{},h('h2',{},'Keep your space with you.'),h('p',{class:'fine'},'Your profile, moments, saved items, creations, reading positions and previous saved material stay on this device. Export a backup to move them to another browser.')),h('div',{class:'chips'},h('button',{class:'btn ghost small',onclick:()=>downloadBackup().catch(()=>toast('The backup could not be created.'))},icon('download',17),'Export backup'),h('button',{class:'btn ghost small',onclick:()=>upload.click()},icon('upload',17),'Restore backup'),upload)),
    h('button',{class:'quiet-link reset-link',onclick:()=>confirmReset(ctx)},'Reset this device’s space')));
}
const initials=name=>name.trim()?name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase():'you';
function confirmReset(ctx){const sh=sheet(h('div',{class:'center'},h('h2',{class:'display sm'},'Begin a fresh space?'),h('p',{class:'lede'},'This clears this app’s profile, notes, saved items, and reading positions from this browser. Export a backup first if you want to keep them.'),h('div',{class:'row-center'},h('button',{class:'btn ghost',onclick:()=>sh.close(),autofocus:true},'Keep my space'),h('button',{class:'btn danger',onclick:()=>{resetDevice();sh.close();location.hash='#/home';location.reload();}},'Clear this device'))),{label:'Reset this device'});}
