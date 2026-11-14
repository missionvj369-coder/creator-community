import assert from 'node:assert/strict';
import {STUDIO_IDS,STUDIO_PRODUCTS,studioPoster} from '../public/js/studio-meta.js';
import {STUDIO_EXAMPLES,normaliseStudioDraft,normaliseStudios,splitThoughts,studioIssues,reachableStudioStep,comparePossibilities,remapStudioValues,bridgeOpening,bridgeResponse,keepStudioCard,studioCardText} from '../public/js/studio-model.js';
import {normaliseSpace,validateBackup} from '../public/js/space-model.js';
import {PRODUCTS} from '../public/js/catalogue.js';
import {EXPERIENCE_ORDER,experienceNeighbours} from '../public/js/experience-flow.js';
import {sceneForRoute,CINEMA_SCENES} from '../public/js/cinema-model.js';
const base=(kind,extra)=>normaliseStudioDraft(kind,{id:kind+'-test',createdAt:1,...extra});
assert.equal(PRODUCTS.length,18);assert.ok(STUDIO_IDS.every(id=>!EXPERIENCE_ORDER.includes(id)));assert.equal(experienceNeighbours('sleep').next,'wonder-engine');
for(const meta of STUDIO_PRODUCTS){assert.ok(!PRODUCTS.some(p=>p.id===meta.id));assert.equal(sceneForRoute('#/product/'+meta.id),meta.id);assert.ok(CINEMA_SCENES[meta.id].score);const a=studioPoster(meta.id),b=studioPoster(meta.id);assert.notEqual(a,b,'SVG references must be unique per instance');assert.ok(!a.includes('NaN'));}
// Inserting/reordering thoughts must not move a classification onto the wrong thought.
let thoughts=splitThoughts('Write the introduction\nAsk which day works');thoughts[0].lane='now';thoughts[1].lane='learn';
thoughts=splitThoughts('A new thought\nAsk which day works\nWrite the introduction\nwrite the introduction',thoughts);
assert.equal(thoughts.length,3);assert.equal(new Set(thoughts.map(t=>t.id)).size,3);assert.equal(thoughts.find(t=>t.text==='Write the introduction').lane,'now');assert.equal(thoughts.find(t=>t.text==='Ask which day works').lane,'learn');assert.equal(thoughts[0].lane,'');
const malformed=base('mind-unfold',{thoughts:[{id:'thought-1',text:'A'},{id:'thought-1',text:'B'},{id:'thought-2',text:'C'}]});assert.equal(new Set(malformed.thoughts.map(t=>t.id)).size,3);
assert.ok(studioIssues('mind-unfold',{input:'x'.repeat(201)},1).input);assert.ok(studioIssues('mind-unfold',{input:Array.from({length:13},(_,i)=>'Thought '+i).join('\n')},1).input);
let mind=base('mind-unfold',{step:4,input:'A new thought\nAsk which day works\nWrite the introduction',thoughts});assert.equal(reachableStudioStep('mind-unfold',mind),2);assert.throws(()=>keepStudioCard({},'mind-unfold',mind));
mind.thoughts[0].lane='later';mind.focus=mind.thoughts[2].id;mind.action='Write only the first heading';mind.cue='After breakfast';assert.deepEqual(studioIssues('mind-unfold',mind,3),{});
let studios=keepStudioCard({},'mind-unfold',mind,10);assert.equal(studios.cards.length,1);studios=keepStudioCard(studios,'mind-unfold',{...mind,action:'Write a rough opening line'},20);assert.equal(studios.cards.length,1,'updating a card must not duplicate it');assert.equal(studios.cards[0].draft.action,'Write a rough opening line');
const text=studioCardText('mind-unfold',mind);assert.match(text,/Write only the first heading/);assert.match(text,/Ask which day works/);assert.match(text,/After breakfast/);
// All conversation branches remain a rehearsal. User wording is retained, and a pause is valid.
let bridge=base('human-bridge',{step:5,...STUDIO_EXAMPLES['human-bridge'],branch:'not-now',move:'pause',reply:'Let’s leave this here for today.'});
for(const branch of ['open','defensive','not-now'])for(const move of ['listen','restate','pause']){const reply=bridgeResponse({...bridge,branch},move);assert.ok(reply.length>30);if(move==='restate')assert.match(reply,/Could we agree changes a day ahead/);}
assert.notEqual(bridgeOpening({...bridge,tone:'warm'}),bridgeOpening({...bridge,tone:'firm'}));assert.notEqual(bridgeOpening({...bridge,intention:'request'}),bridgeOpening({...bridge,intention:'boundary'}));
assert.equal(normaliseStudioDraft('human-bridge',bridge).reply,'Let’s leave this here for today.');assert.equal(reachableStudioStep('human-bridge',bridge),5);assert.equal(reachableStudioStep('human-bridge',{...bridge,request:''}),3);
studios=keepStudioCard(studios,'human-bridge',bridge,30);assert.match(studioCardText('human-bridge',bridge),/not a prediction/);
// Weighting, genuine zero scores, unknowns and ties must not fabricate a recommendation.
let possibility=base('possibility-studio',{step:5,question:'How could I make time?',options:{a:'A short session',b:'A long session'},values:[{label:'Freedom',weight:5},{label:'Learning',weight:1}],ratings:{a:[5,0],b:[0,5]},chosen:'b',unknown:'What pace fits?',experiment:'Try one short session',cue:'After lunch',limit:'Stop at ten minutes'});
let comparison=comparePossibilities(possibility);assert.equal(comparison.options[0].score,83);assert.equal(comparison.options[1].score,17);assert.equal(comparison.leader,'a');assert.equal(possibility.chosen,'b','the chosen path is independent of the comparison');
comparison=comparePossibilities({...possibility,ratings:{a:[0,0],b:[0,0]}});assert.equal(comparison.options[0].score,0);assert(comparison.tied);assert.equal(comparison.leader,null);
comparison=comparePossibilities({...possibility,ratings:{a:[5,5],b:[null,5]}});assert.equal(comparison.complete,false);assert.equal(comparison.leader,null);assert.equal(comparison.options[1].coverage,1/6);
comparison=comparePossibilities({...possibility,ratings:{a:[null,null],b:[null,null]}});assert(comparison.options.every(o=>o.score===null));assert.equal(comparison.leader,null);
const changed=remapStudioValues(possibility,[{label:'Learning',weight:5},{label:'Freedom',weight:1},{label:'Rest',weight:4}]);assert.deepEqual(changed.ratings.a,[0,5,null]);assert.deepEqual(changed.ratings.b,[5,0,null]);assert.equal(comparePossibilities(changed).leader,null);
assert.ok(studioIssues('possibility-studio',{options:{a:'Same',b:'same'}},1)['option-b']);assert.ok(studioIssues('possibility-studio',{...possibility,limit:''},4).limit);assert.throws(()=>keepStudioCard(studios,'possibility-studio',{...possibility,unknown:''},40));
studios=keepStudioCard(studios,'possibility-studio',{...possibility,attempted:'yes',learning:'The smaller attempt fit better.'},40);assert.equal(studios.cards.length,3);assert.match(studioCardText('possibility-studio',studios.drafts['possibility-studio']),/The smaller attempt fit better/);
// Real backup migration: retain existing reading/course progress alongside all new private work.
const progress=normaliseSpace({studios,books:{'human-journey':{page:23,total:300}},bodyAtlas:{index:17,visited:[1,17]},notes:[{id:'note',text:'Keep this thought.',at:1}]});
const restored=validateBackup({app:'human-within',version:1,profile:{name:'Asha'},progress});assert.equal(restored.space.studios.cards.length,3);assert.equal(restored.space.studios.drafts['human-bridge'].reply,bridge.reply);assert.equal(restored.space.books['human-journey'].page,23);assert.equal(restored.space.bodyAtlas.index,17);assert.equal(restored.space.notes[0].text,'Keep this thought.');
assert.deepEqual(normaliseSpace({}).studios,{v:1,drafts:{},cards:[]});assert.deepEqual(normaliseStudios(null),{v:1,drafts:{},cards:[]});
const hostile=normaliseStudioDraft('possibility-studio',{question:'x'.repeat(1000),options:{a:'a'.repeat(400)},values:[{label:'Care',weight:999},{label:'care',weight:2},{label:'Rest',weight:-2},{label:'Work',weight:1},{label:'Extra',weight:1}],ratings:{a:[Infinity,'5',-20]},chosen:'fake'});assert.equal(hostile.question.length,180);assert.equal(hostile.options.a.length,100);assert.equal(hostile.values.length,3);assert.deepEqual(hostile.ratings.a,[null,5,0]);assert.equal(hostile.chosen,'');
console.log('legacy studios: retired from active routing, SVG identities, thought insertion/classification, gated cards and deduplicated updates, 9 rehearsal branches, transparent weighted comparisons, unknowns/zeros/ties, priority remapping, private drafts, full cards and ebook/body-safe backups passed');
