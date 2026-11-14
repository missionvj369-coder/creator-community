export const BODY_ROUTE='#/experience/know-your-body';
export const BODY_BOOK='body-you-live-in';
export const BODY_CHAPTERS=[
 {name:'Small beginnings',start:0,end:7,region:'cells',line:'Life, at the smallest scale.'},
 {name:'Brain & nerves',start:8,end:15,region:'nervous',line:'A living conversation.'},
 {name:'Your sensory world',start:16,end:23,region:'senses',line:'The world becomes a signal.'},
 {name:'Heart & blood',start:24,end:32,region:'circulation',line:'A journey that never stands still.'},
 {name:'Every breath',start:33,end:39,region:'respiration',line:'Space opens. Air arrives.'},
 {name:'The journey of food',start:40,end:48,region:'digestion',line:'A meal becomes a possibility.'},
 {name:'Water & balance',start:49,end:55,region:'urinary',line:'The art of keeping what you need.'},
 {name:'Built to move',start:56,end:63,region:'movement',line:'A framework, alive with motion.'},
 {name:'Skin & defence',start:64,end:71,region:'defence',line:'A boundary. A community. A defence.'},
 {name:'Hormones & new life',start:72,end:80,region:'endocrine',line:'Small messages. A changing life.'},
 {name:'The sleeping body',start:81,end:88,region:'sleep',line:'A different kind of activity.'},
 {name:'A life in your body',start:89,end:98,region:'whole',line:'Many systems. One living you.'}
];
export const BODY_PARTS=[
 {id:'brain',name:'Brain & spinal cord',index:8,region:'nervous'}, {id:'eyes',name:'Eyes & vision',index:16,region:'senses'},
 {id:'ears',name:'Ears & hearing',index:19,region:'senses'}, {id:'mouth',name:'Mouth, taste & teeth',index:40,region:'digestion'},
 {id:'heart',name:'Heart & blood vessels',index:24,region:'circulation'}, {id:'lungs',name:'Lungs & diaphragm',index:33,region:'respiration'},
 {id:'stomach',name:'Stomach & intestines',index:41,region:'digestion'}, {id:'liver',name:'Liver & gallbladder',index:45,region:'digestion'},
 {id:'pancreas',name:'Pancreas',index:44,region:'digestion'}, {id:'kidneys',name:'Kidneys & nephrons',index:49,region:'urinary'},
 {id:'bladder',name:'Bladder & urinary route',index:52,region:'urinary'}, {id:'skeleton',name:'Bones & joints',index:56,region:'movement'},
 {id:'muscle',name:'Muscles & tendons',index:60,region:'movement'}, {id:'skin',name:'Skin, hair & sweat',index:64,region:'defence'},
 {id:'lymph',name:'Lymph & immune cells',index:67,region:'defence'}, {id:'thyroid',name:'Hormones & glands',index:72,region:'endocrine'},
 {id:'reproductive',name:'Reproductive organs',index:75,region:'endocrine'}, {id:'uterus',name:'Uterus & ovaries',index:76,region:'endocrine',visual:'uterus'},
 {id:'testes',name:'Testes & sperm route',index:78,region:'endocrine',visual:'testes'}, {id:'cell',name:'Cells & DNA',index:0,region:'cells'},
 {id:'sleep',name:'Sleep & body clock',index:81,region:'sleep'}
];
const groups=[
 ['cell',[1,2,7]],['dna',[3,5]],['chromosomes',[4]],['energy',[6,93]],['balance',[8,51,54,55,56,94]],
 ['neuron',[9,10,11,12,13,15,16,48]],['reflex',[14]],['brainFlow',[98]],['eye',[17,18,19]],['ear',[20,21]],['vestibular',[22]],['taste',[23,24,41]],['tooth',[49]],
 ['heart',[25,26,33,95,99]],['vessels',[27,28,29,32]],['marrow',[30]],['clot',[31]],['lungs',[34,36,37,38,39,40]],['alveoli',[35]],
 ['gut',[42,43,44,47]],['pancreas',[45,74]],['liver',[46]],['nephron',[50,52]],['urinary',[53]],['bone',[57,58,60,63]],['joint',[59]],
 ['muscle',[61,62,64,90,91,96]],['skin',[65,66,67]],['lymph',[68]],['immune',[69,70,71,72]],['division',[97]],['hormones',[73,75,76,81]],
 ['uterus',[77,78]],['fertilisation',[79]],['placenta',[80]],['sleep',[82,83,84,85,86,87,88,89]],['nutrition',[92]]
];
export const BODY_VISUALS=Object.freeze(Object.fromEntries(groups.flatMap(([name,ids])=>ids.map(id=>[id,name]))));
export const bodyChapter=index=>BODY_CHAPTERS.find(c=>index>=c.start&&index<=c.end)||BODY_CHAPTERS[0];
export function normaliseBodyAtlas(input){const s=input&&typeof input==='object'?input:{};return {index:Number.isFinite(+s.index)?Math.max(0,Math.min(98,Math.round(+s.index))):0,visited:Array.isArray(s.visited)?[...new Set(s.visited.filter(n=>Number.isInteger(n)&&n>=0&&n<99))].sort((a,b)=>a-b):[],at:Number.isFinite(+s.at)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,+s.at)):0};}
export const discoverySeconds=(text,speed=1)=>Math.max(22,Math.min(90,String(text).trim().split(/\s+/).length/2.25+7))/Math.max(.5,Math.min(2,speed));
export class ReadingFlow{
 constructor({onAdvance=()=>{},onChange=()=>{}}={}){Object.assign(this,{onAdvance,onChange,duration:30,elapsed:0,running:false,destroyed:false});}
 reset(duration){this.duration=Math.max(1,Number(duration)||30);this.elapsed=0;this.onChange(this);}
 play(){if(!this.destroyed){this.running=true;this.onChange(this);}}
 pause(){this.running=false;this.onChange(this);}
 tick(seconds,{blocked=false}={}){if(!this.running||this.destroyed||!Number.isFinite(seconds)||seconds<0)return;this.elapsed=Math.min(this.duration,this.elapsed+Math.min(seconds,2));this.onChange(this);if(this.elapsed>=this.duration&&!blocked){this.running=false;this.onAdvance();}}
 get fraction(){return Math.min(1,this.elapsed/this.duration);}
 dispose(){this.running=false;this.destroyed=true;}
}
export const BODY_SOURCES=[
 ['Cells and tissues · NCI SEER','https://training.seer.cancer.gov/anatomy/cells_tissues_membranes/'],['Nervous system · NCI SEER','https://training.seer.cancer.gov/anatomy/nervous/'],
 ['How eyes work · National Eye Institute','https://www.nei.nih.gov/eye-health-information/healthy-vision/how-eyes-work'],['How we hear · NIDCD','https://www.nidcd.nih.gov/health/how-do-we-hear'],
 ['Heart and blood flow · NHLBI','https://www.nhlbi.nih.gov/health/heart/blood-flow'],['Lungs and airways · NHLBI','https://www.nhlbi.nih.gov/health/lungs/respiratory-system'],
 ['Digestion · NIDDK','https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works'],['Kidneys and nephrons · NIDDK','https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work'],
 ['Skeleton · NCI SEER','https://training.seer.cancer.gov/anatomy/skeletal/'],['Muscles · NCI SEER','https://training.seer.cancer.gov/anatomy/muscular/'],
 ['Skin · NIAMS','https://www.niams.nih.gov/health-topics/educational-resources/health-lesson-learning-about-skin'],['Lymphatic system · NCI SEER','https://training.seer.cancer.gov/anatomy/lymphatic/'],
 ['Hormones · NCI SEER','https://training.seer.cancer.gov/anatomy/endocrine/'],['Reproductive anatomy · NCI SEER','https://training.seer.cancer.gov/anatomy/reproductive/'],
 ['Testes and duct system · NCI SEER','https://training.seer.cancer.gov/anatomy/reproductive/male/']
].map(([label,url])=>({label,url}));
