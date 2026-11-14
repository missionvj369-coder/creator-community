import assert from 'node:assert/strict';
import { EXPERIENCE_CHAPTERS, EXPERIENCE_ORDER, EXPERIENCE_INVITATIONS, chapterFor, experienceNeighbours, independentRoute, independentProgress } from '../public/js/experience-flow.js';
import { PRODUCTS } from '../public/js/catalogue.js';
import { normaliseSpace, validateBackup } from '../public/js/space-model.js';

assert.equal(EXPERIENCE_ORDER.length,18);assert.equal(new Set(EXPERIENCE_ORDER).size,18);
assert.deepEqual(PRODUCTS.map(p=>p.id),EXPERIENCE_ORDER);
assert.deepEqual(PRODUCTS.map(p=>p.number),Array.from({length:18},(_,i)=>String(i+1).padStart(2,'0')));
assert.equal(EXPERIENCE_CHAPTERS.length,6);
for(const chapter of EXPERIENCE_CHAPTERS){assert.equal(chapter.products.length,3);for(const id of chapter.products){assert.equal(chapterFor(id),chapter);assert(EXPERIENCE_INVITATIONS[id]);}}
assert.equal(experienceNeighbours('protocol').previous,null);assert.equal(experienceNeighbours('creation-field').next,null);
for(let i=0;i<17;i++)assert.equal(experienceNeighbours(EXPERIENCE_ORDER[i]).next,EXPERIENCE_ORDER[i+1]);
assert.deepEqual(experienceNeighbours('missing'),{previous:null,next:null});

const carried={initialized:true,items:{clarity:{completed:5}},draft:{id:'clarity',idx:5,seconds:44,note:'An unfinished reflection.'}};
assert.equal(independentRoute('#/daily',carried),'#/product/clarity');
assert.equal(independentRoute('#/daily/mirror',carried),'#/product/mirror');
assert.equal(independentRoute('#/daily/unknown',carried),'#/home');
assert.equal(independentRoute('#/book/human-journey',carried),'#/book/human-journey');
const oldSessions=[{route:'#/browse/clarity/0',completed:true,at:1}];
let progress=independentProgress(oldSessions,carried,'clarity',30);
assert.equal(progress.next,5,'old browse history must not reset the carried course position');assert.equal(progress.completed.size,5);assert(progress.visited);
progress=independentProgress([...oldSessions,{route:'#/browse/clarity/7',completed:false}],carried,'clarity',30);assert.equal(progress.next,7,'a new independently chosen unfinished page can be resumed');
progress=independentProgress([],{},'clarity',30);assert.equal(progress.next,0);assert(!progress.visited);assert(!progress.done);
progress=independentProgress([],{items:{clarity:{completed:30}}},'clarity',30);assert(progress.done);assert.equal(progress.next,0,'a completed collection can be explored again');
const saved=normaliseSpace({dailyPlan:carried,books:{'human-journey':{page:23,total:300}},notes:[{id:'one',text:'Keep this.',at:1}]});
const restored=validateBackup({app:'human-within',version:1,profile:{name:'Asha'},progress:saved});
assert.equal(restored.space.dailyPlan.draft.note,'An unfinished reflection.');assert.equal(restored.space.books['human-journey'].page,23);
assert.equal(independentProgress(restored.space.sessions,restored.space.dailyPlan,'clarity',30).next,5);
console.log('experience flow: all 18 independent products in order, six chapters, next/previous invitations, retired-link recovery, retained course progress, completed replay and ebook-safe backups passed');
