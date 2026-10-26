import assert from 'node:assert/strict';
import { normaliseSpace, sessionRecord, summaryOf, validateBackup } from '../public/js/space-model.js';
const now=Date.UTC(2026,9,26,9,0);
let space=normaliseSpace();assert.equal(summaryOf(space,now).completed,0);
space=sessionRecord(space,{id:'moment-1',route:'#/moment/focus',title:'Focus',kind:'Moment',seconds:42,completed:false,at:now});
space=sessionRecord(space,{id:'moment-1',route:'#/moment/focus',title:'Focus',kind:'Moment',seconds:89,completed:true,at:now});
assert.equal(space.sessions.length,1,'checkpoint and completion must update the same moment');assert.equal(space.sessions[0].at,now,'timestamps must retain their full millisecond precision');
assert.deepEqual(summaryOf(space,now,'Asia/Kolkata'),{completed:1,seconds:89,minutes:1,days:1,today:1,books:0,saved:0,wallpapers:0});
space=normaliseSpace({...space,books:{'body-you-live-in':{page:12,total:164,at:now}},saved:[{route:'#/book/body-you-live-in',title:'The Body You Live In',kind:'eBook',at:now}],notes:[{id:'note',text:'Take one small step.',at:now}]});
const backup={app:'human-within',version:1,profile:{name:'Asha',intents:['clarity']},progress:space,readerState:{'neoXhuman.body.illustrated.v2':JSON.stringify({page:11})}};
const restored=validateBackup(JSON.parse(JSON.stringify(backup)));assert.equal(restored.name,'Asha');assert.equal(restored.space.books['body-you-live-in'].page,12);assert.equal(restored.space.notes[0].at,now);assert.equal(restored.space.sessions[0].completed,true);
assert.throws(()=>validateBackup({}),/backup/);assert.throws(()=>validateBackup({...backup,version:99}),/backup/);assert.throws(()=>validateBackup({...backup,progress:{}}),/incomplete/);
const removed=normaliseSpace({saved:[{route:'javascript:alert(1)',title:'bad'}]});assert.equal(removed.saved.length,0);
// Store round-trip uses a private in-memory test browser, never production data.
const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k),key:i=>[...mem.keys()][i],get length(){return mem.size;}};
globalThis.fetch=async()=>{throw Error('The local profile must not call a server.');};
const S=await import('../public/js/store.js');await S.boot();await S.start({name:'Asha',intents:['clarity'],length:'quick'});await S.act('profile',{name:'Asha Rao',intents:['calm','clarity']});S.mutateSpace(()=>space);
const exported=await S.exportData();assert.equal(exported.profile.name,'Asha Rao');assert.equal(exported.progress.books['body-you-live-in'].page,12);
mem.clear();await S.importData(exported);await S.boot();assert.equal(S.state.mode,'local');assert.equal(S.state.doc.name,'Asha Rao');assert.equal(S.state.doc.space.sessions.length,1);assert.equal(S.state.doc.space.saved.length,1);assert.equal(S.state.doc.space.notes[0].text,'Take one small step.');
console.log('personal: local persistence, accurate time, deduplicated completions, saved items, and backup/restore passed');

const Personal=await import('../public/js/personal.js');S.mutateSpace(s=>sessionRecord(s,{id:'clarity-first',route:'#/browse/clarity/0',title:'Return to now',kind:'Practice',seconds:22,completed:true,at:now}));const next=Personal.sequenceProgress('clarity',30);assert.equal(next.next,1);assert.equal(next.completed.has(0),true);console.log('continuation: a completed practice offers the next step');
mem.set('unrelated-site-setting','keep');mem.set('hj-single-font','21');S.resetDevice();assert.equal(mem.get('unrelated-site-setting'),'keep');assert.equal(mem.has('ugt.local.v2'),false);assert.equal(mem.has('hj-single-font'),false);console.log('reset: clears only this app’s keys');
