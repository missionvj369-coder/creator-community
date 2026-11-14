// The original content remains authoritative. These are settings and stage layouts.
export const IMMERSIVE_WORLDS={
  loop:{name:'The Loop',world:'ribbon',eyebrow:'THE SPACE BETWEEN CUE AND CHOICE',lines:['A familiar pattern.','A different way.'],intro:'Watch a continuous ribbon find an opening. Then follow one real-life pattern, from its first cue to a response you can choose.',caption:'THE OPEN RIBBON',action:'Open the loop',activeAction:'Let the ribbon return',hint:'Move gently across the ribbon. Open it when you want another perspective.',accent:'#c7dfbb',rgb:'178,211,154',page:'#081b19',root:130.81},
  escape:{name:'Matrix Escape',world:'labyrinth',eyebrow:'A ROOM FOR A FREER THOUGHT',lines:['See the pattern.','Find your opening.'],intro:'A shifting architecture of light. Twenty-one ideas to question, practical prompts to try, and a field guide to 105 everyday situations.',caption:'THE LIGHT MAZE',action:'Reveal an opening',activeAction:'Return to the maze',hint:'Move through the light. A different angle can reveal an opening.',accent:'#e6d6a8',rgb:'225,195,133',page:'#171914',root:146.83},
  thoughts:{name:'ONE',world:'constellation',eyebrow:'NINETY-NINE THOUGHTS · ONE SHARED WORLD',lines:['A single thought.','A wider world.'],intro:'A living constellation of small perspectives. Touch the lights, trace a connection, and bring one useful thought into ordinary life.',caption:'THE HUMAN CONSTELLATION',action:'Connect another light',activeAction:'Connect another light',hint:'Touch the constellation or use the button to add a connection.',accent:'#edc8ce',rgb:'226,169,181',page:'#20151e',root:174.61},
  awakening:{name:'Sixty-Six Days of Awakening',world:'bloom',eyebrow:'SIXTY-SIX INVITATIONS TO LOOK WITHIN',lines:['A quieter question.','A life unfolding.'],intro:'A luminous bloom unfolds around a question. Explore an affirmation, a practical action, and the voices included in each original reflection.',caption:'THE UNFOLDING BLOOM',action:'Let the bloom open',activeAction:'Let the bloom rest',hint:'Move around the petals. Let the form open at your own pace.',accent:'#daccf0',rgb:'200,175,230',page:'#151827',root:164.81},
  onegod:{name:'One God, One Voice',world:'arches',eyebrow:'MANY VOICES · A SHARED HORIZON',lines:['Listen across','the distance.'],intro:'Walk through luminous arches of reflection. Thirty-two messages, their accompanying scriptures, and a small way to carry each one into life.',caption:'THE HALL OF LIGHT',action:'Gather the light',activeAction:'Let the light disperse',hint:'Move through the arches and notice the space they share.',accent:'#efdbba',rgb:'232,205,158',page:'#211a13',root:110},
  clarity:{name:'Clarity',world:'horizon',eyebrow:'A MORNING TO BEGIN · AN EVENING TO CLOSE',lines:['Meet the light.','Keep what matters.'],intro:'A dawn-to-dusk horizon for a clear intention, a small practice and an evening reflection. Thirty complete pairs, always open to you.',caption:'THE INNER HORIZON',action:'Turn toward evening',activeAction:'Return to morning',hint:'Choose morning or evening. Let the horizon change with you.',accent:'#eed8aa',rgb:'235,190,126',page:'#1d201d',root:196},
  journey:{name:'The Human Journey',world:'spiral',eyebrow:'FROM OUR ORIGINS TO THE LIFE AHEAD',lines:['An entire world.','A human life.'],intro:'Follow a luminous thread through origins, a human lifetime and new possibilities. The complete fifty-five-chapter collection, with room to read slowly.',caption:'THE THREAD OF LIFE',action:'Widen the perspective',activeAction:'Return to the thread',hint:'Move around the thread. Explore the story one chapter at a time.',accent:'#bad8e7',rgb:'150,199,219',page:'#101c26',root:123.47}
};
export const immersiveWorld=id=>IMMERSIVE_WORLDS[id]||null;
export function immersiveStages(u){
  const b=u.blocks,stage=(label,title,lead='',blocks=[])=>({label,title,lead,blocks});
  if(u.realm==='loop')return b[0].items.map((item,i)=>stage(['Notice','Understand','Reframe','Practise','Carry'][i],i?item.label:u.title,i?'':u.lead,[{t:'steps',items:[item]},...(i===4?b.slice(1):[])]));
  if(u.realm==='clarity')return [stage('Morning',u.title,u.lead,b.slice(0,2)),stage('Practise','A small beginning.','',b.slice(2,3)),stage('Evening','Let the day settle.','',b.slice(3,5)),stage('Reflect','Something to carry.','',b.slice(5))];
  if(u.realm==='awakening')return [stage('Question',u.title,u.lead),stage('Affirm','An intention to sit with.','',b.slice(0,1)),stage('Practise','Bring it into life.','',b.slice(1,2)),stage('Voices','Listen across traditions.','',b.slice(2))];
  if(u.realm==='onegod')return [stage('Message',u.title,u.lead,b.slice(0,1)),stage('Scriptures','Voices in conversation.','',b.slice(1,3)),stage('Live it','Give the thought a place.','',b.slice(3))];
  if(u.realm==='thoughts')return [stage('Perspective',u.title,u.lead),stage('Try it','A connection in real life.','',b.slice(0,1)),...(b.length>1?[stage('Bridge','Follow the next thread.','',b.slice(1))]:[])];
  if(u.realm==='escape')return [stage('Notice',u.title,u.lead),stage('Explore','Question the familiar.','',b.slice(0,2)),stage('Try it','Make it your own.','',b.slice(2))];
  const groups=[];let current=[];
  for(const block of b){if((block.t==='h'&&current.length)||current.length>=3){groups.push(current);current=[];}current.push(block);}if(current.length)groups.push(current);
  return [stage('The story',u.title,u.lead),...groups.map((blocks,i)=>stage(`Part ${i+1}`,blocks[0]?.t==='h'?blocks[0].text:'A little further into the story.','',blocks))];
}
export function normaliseImmersive(input={}){
  if(!input||typeof input!=='object'||Array.isArray(input))return {};
  const result={};
  const limits={loop:21,escape:21,thoughts:99,awakening:66,onegod:32,clarity:30,journey:55};
  for(const id of Object.keys(IMMERSIVE_WORLDS)){const x=input[id];if(!x||typeof x!=='object')continue;const n=(v,max)=>Number.isFinite(+v)?Math.max(0,Math.min(max,Math.floor(+v))):0;result[id]={idx:n(x.idx,limits[id]-1),stage:n(x.stage,40),note:String(x.note||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,800),at:n(x.at,Number.MAX_SAFE_INTEGER)};}
  return result;
}
export function immersiveDraft(space,id,completed=new Set()){
  const current=normaliseImmersive(space?.immersive)[id];if(current)return current;
  const legacy=space?.dailyPlan?.draft;
  if(legacy?.id===id&&!completed.has(legacy.idx))return normaliseImmersive({[id]:{idx:legacy.idx,stage:0,note:legacy.note,at:space.dailyPlan.startedAt}})[id];
  return null;
}
export function immersiveText(u){
  const blockText=b=>[b.label,b.text,...(b.items||[]).flatMap(x=>[x.label,x.text,x.extra,x.cite])].filter(Boolean).join(' ');
  return [u.title,u.lead,...u.blocks.map(blockText)].filter(Boolean).join('\n');
}
