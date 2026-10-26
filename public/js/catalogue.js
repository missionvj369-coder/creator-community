import { illustration } from './product-art.js';
import { REALMS } from './engine.js';

export const BRAND = 'Human Within';
export const PRODUCT_META = {
  protocol: { group:'Sound & stillness', number:'01', short:'21 sound sessions', color:'#d8eceb', ink:'#256f6d', art:'ripple' },
  clarity: { group:'Daily practices', number:'02', short:'30 mornings & evenings', color:'#f6ebc9', ink:'#97752e', art:'sun' },
  awakening: { group:'Wisdom & belonging', number:'03', short:'66 days of reflection', color:'#e8e0f4', ink:'#77609e', art:'bloom' },
  onegod: { group:'Wisdom & belonging', number:'04', short:'32 voices of oneness', color:'#f7e0ce', ink:'#ad6941', art:'arch' },
  journey: { group:'Wisdom & belonging', number:'05', short:'55 guided chapters', color:'#dce7ef', ink:'#51778f', art:'orbit' },
  thoughts: { group:'Wisdom & belonging', number:'06', short:'99 thoughts of connection', color:'#f0dfe6', ink:'#a05b79', art:'bloom' },
  escape: { group:'Daily practices', number:'07', short:'21 lessons · 105 situations', color:'#f8e1d3', ink:'#b46840', art:'arch' },
  loop: { group:'Daily practices', number:'08', short:'21 ways to notice & choose', color:'#deebd9', ink:'#597c4c', art:'ribbon' },
  rewire: { group:'Daily practices', number:'09', short:'30 downloadable wallpapers', color:'#e3defa', ink:'#7564b1', art:'arch' },
  sleep: { group:'Sound & stillness', number:'10', short:'A 20-minute wind-down', color:'#dce0f4', ink:'#6767a1', art:'moon' },
  passage: { group:'Sound & stillness', number:'11', short:'7 worlds · a 10-minute voyage', color:'#d4e9ec', ink:'#347c88', art:'ribbon' },
  frequency: { group:'Sound & stillness', number:'12', short:'99 sound scenarios', color:'#efeacb', ink:'#8d8037', art:'ripple' },
  mirror: { group:'Immersive worlds', number:'13', short:'14 worlds of discovery', color:'#dce7e9', ink:'#527b83', art:'orbit' },
  mirror2: { group:'Immersive worlds', number:'14', short:'A new act · a new light', color:'#f0dcd6', ink:'#a66a5b', art:'ribbon' },
  sanctuary: { group:'Immersive worlds', number:'15', short:'14 scenes of quiet', color:'#dceada', ink:'#55835d', art:'bloom' },
};
export const PRODUCTS = REALMS.map(r => ({ ...r, ...PRODUCT_META[r.id] }));
export const TOOLS = [
  { id:'a-world-within', title:'A World Within', description:'99 living affirmations in a flowing, colourful world. Touch, drag, and make a moment your own.', file:'/tools/a-world-within.html', color:'#eddcf3', ink:'#94659e', art:'bloom', meta:'99 affirmations · music & touch' },
  { id:'arrival', title:'The Arrival', description:'A gentle sequence of 21 invitations to slow down and arrive.', route:'#/arrive', color:'#dcece6', ink:'#4a7f6b', art:'ripple', meta:'21 gentle invitations' },
  { id:'welcome', title:'A Message for You', description:'The three original welcome films, together in one place.', route:'#/welcome', color:'#f4e2cd', ink:'#a2713d', art:'sun', meta:'3 welcome films' },
];
export const SITUATIONS = [
  {id:'racing',title:'My mind won’t slow down',label:'Find some quiet',icon:'ripple',color:'#dcebea',ink:'#3c7b79',intro:'You do not have to solve every thought right now.',action:'Set the phone down. Feel where your feet meet the floor. Name three ordinary things you can see. Let one comfortable breath finish before doing anything else.',products:['protocol','clarity','sleep'],books:['switch-off','why-am-i-like-this'],tool:'a-world-within'},
  {id:'focus',title:'I keep getting distracted',label:'Make room for focus',icon:'arch',color:'#f2e8cd',ink:'#917c3e',intro:'Give the next small thing a place to begin.',action:'Choose one task you can begin in two minutes. Close one competing tab and move your phone out of reach. Do the first visible step, then decide whether to continue.',products:['loop','rewire','frequency'],books:['why-am-i-like-this','how-to-work-with-me']},
  {id:'tired',title:'I’m running on empty',label:'Pause without pressure',icon:'moon',color:'#e6e0f4',ink:'#7c69a1',intro:'A pause does not need to be earned.',action:'Relax your hands and notice whether you need water, food, rest, or a change of position. Choose one small need to meet. You can leave the rest for later.',products:['sanctuary','clarity','passage'],books:['body-you-live-in','switch-off']},
  {id:'sleep',title:'It’s time to switch off',label:'Ease into the evening',icon:'moon',color:'#dfe3f0',ink:'#6875a0',intro:'Let this be the end of doing for a moment.',action:'Lower the screen brightness. Write down one thing that can wait until tomorrow, if that helps. Choose a quiet activity and let sleep happen in its own time.',products:['sleep','passage','sanctuary'],books:['switch-off']},
  {id:'stuck',title:'I’m repeating the same pattern',label:'Find another response',icon:'ribbon',color:'#dfe9d7',ink:'#6b834c',intro:'Noticing the pattern creates a place to choose.',action:'Name the cue, the usual response, and what you get from it. Change the response by one small step today. Make that step easier to do than the old one.',products:['loop','escape','rewire'],books:['why-am-i-like-this']},
  {id:'alone',title:'I feel disconnected',label:'Remember connection',icon:'bloom',color:'#f1dfe6',ink:'#a16d81',intro:'Connection can begin with something very small.',action:'Think of one person you feel reasonably safe with. Send a simple hello, or offer a small act of care. If nobody comes to mind, sit in a welcoming shared place for a while.',products:['thoughts','mirror','onegod'],books:['human-journey'],tool:'a-world-within'},
  {id:'meaning',title:'I want to see the bigger picture',label:'Follow your curiosity',icon:'orbit',color:'#dde8ed',ink:'#648398',intro:'Make room for a question you care about.',action:'Choose one question about life, other people, or your place in the world. Spend a few minutes with one chapter or thought. You do not need a final answer today.',products:['journey','awakening','onegod'],books:['human-journey']},
  {id:'comparison',title:'Everyone seems ahead of me',label:'Return to your own pace',icon:'sun',color:'#f6e1d6',ink:'#ae7755',intro:'Another person’s visible moment is a small part of their life.',action:'Pause the feed. Name one thing that matters to you without an audience. Take one small step toward it before comparing again.',products:['escape','clarity','thoughts'],books:['why-am-i-like-this'],tool:'a-world-within'},
  {id:'morning',title:'I want a gentler start',label:'Begin the day with intention',icon:'sun',color:'#f4ebcc',ink:'#9a833f',intro:'Begin with the day you have.',action:'Before opening a feed, notice the light, stretch comfortably, and choose one useful thing for today. Keep the choice small enough to start.',products:['clarity','rewire','protocol'],books:['body-you-live-in'],tool:'arrival'},
  {id:'parent',title:'I want to understand my child',label:'Meet them with curiosity',icon:'bloom',color:'#deebe2',ink:'#628269',intro:'Start with what your child may be experiencing.',action:'In the next calm moment, get to their eye level and ask what felt hard. Listen before explaining. Choose one small change you can try together.',products:['thoughts','clarity','mirror'],books:['growing-mind']},
  {id:'body',title:'I’m curious about my body',label:'Explore the human story',icon:'orbit',color:'#f7e0d3',ink:'#b67353',intro:'Your body is a story happening every moment.',action:'Notice one ordinary process: your breath, balance, or the warmth of your hands. Read about it, then return to the sensation with fresh curiosity.',products:['mirror','journey','sanctuary'],books:['body-you-live-in']},
  {id:'ai',title:'I want to work better with AI',label:'Turn an idea into a clear request',icon:'arch',color:'#dfe5f4',ink:'#667ba8',intro:'A clear request gives collaboration a useful direction.',action:'State your goal, add the relevant context, describe the output you need, and give one example. Ask the assistant to identify any important missing information.',products:['escape','loop'],books:['how-to-work-with-me']},
];

export const productById = id => PRODUCTS.find(r => r.id === id);
export const situationById = id => SITUATIONS.find(r => r.id === id);
export function art(kind='orbit', color='#dce8e2', ink='#568577', key='art') { return illustration(key,kind,color,ink); }
