import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {MEDITATION_PRESETS,normaliseMeditation,createMeditationClock,meditationCue,meditationPhase,bedtimeClipGain} from '../public/js/meditation-model.js';
import {normaliseSpace,sessionRecord,validateBackup,summaryOf} from '../public/js/space-model.js';
import {arrivalDestination} from '../public/js/arrival-model.js';

const script=JSON.parse(fs.readFileSync('public/content/meditation/session.json','utf8'));
for(const [id,session] of Object.entries(script.sessions)){
 const file='public'+session.audio;
 const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,channels,sample_rate','-of','json',file]));
 assert(Math.abs(Number(info.format.duration)-session.duration)<.2);
 assert.equal(info.streams[0].codec_name,'mp3');assert.equal(info.streams[0].channels,2);assert.equal(Number(info.streams[0].sample_rate),24000);
 assert(fs.statSync(file).size<25*1024*1024);
 assert.equal(session.cues.length,id==='arrival'?14:30);
 for(let i=0;i<session.cues.length;i++){const cue=session.cues[i],next=session.cues[i+1]?.at??session.duration;assert(cue.audioEnd>cue.at);assert(cue.audioEnd<=next-.35,`${cue.id} leaves room after the voice`);}
 assert(!/you (will|must) (sleep|stop thinking)|guaranteed|cure|hold your breath/i.test(session.cues.map(c=>c.text).join(' ')));
 assert.equal(meditationCue(session,150).phase,'body');
}
assert.equal(meditationPhase(50),'breathe');assert.equal(meditationPhase(117),'eyes');assert.equal(meditationPhase(290,'night'),'rest');
const clock=createMeditationClock(300);clock.tickAudio(25,25000);assert.equal(clock.snapshot().listened,0,'loading is not listening');
const fresh=createMeditationClock(300);fresh.start(0);fresh.tickAudio(1,1000);fresh.pause(1000);fresh.tickAudio(1,15000,false);assert.equal(fresh.snapshot().listened,1);fresh.resume(15000);fresh.tickAudio(2,16000);assert.equal(fresh.snapshot().listened,2);
fresh.tickAudio(2,50000);assert.equal(fresh.snapshot().listened,2,'a stalled file earns no time');fresh.tickAudio(300,51000);fresh.finish();assert.equal(fresh.snapshot().completed,false,'seeking to the end is not a completed practice');
const night=createMeditationClock(1200);night.start(0);night.tickAudio(1,1000);night.tickAudio(1200,1200000);night.finish();assert.equal(night.snapshot().completed,true,'native background media time can count when the media actually advances');
const visual=createMeditationClock(300);visual.start(0);visual.tickVisual(1000);visual.tickVisual(90000,false);assert.equal(visual.snapshot().elapsed,1);visual.tickVisual(91000);assert.equal(visual.snapshot().elapsed,2,'hidden caption time cannot skip guidance');
const restore=createMeditationClock(300,{elapsed:80,listened:79});restore.start(10000);restore.tickAudio(81,11000);assert.equal(restore.snapshot().listened,80);
assert.equal(bedtimeClipGain(293,300),1);assert.equal(bedtimeClipGain(300,300),0);assert.equal(bedtimeClipGain(1190,1200),1);
const bounded=normaliseMeditation({choice:'unknown',last:{preset:'night5',elapsed:9999,listened:-1,recordId:'bad<script>',at:10}});assert.equal(bounded.choice,'arrival');assert.equal(bounded.last.elapsed,300);assert.equal(bounded.last.listened,0);
let space=normaliseSpace({atlas:{'old-letter':{answers:{message:'Keep this private draft'},at:1}}});
space=sessionRecord(space,{id:'med-one',route:'#/meditate/arrival',title:'The Still Room',kind:'Meditation',seconds:30,completed:false,at:1});
space=sessionRecord(space,{id:'med-one',route:'#/meditate/arrival',title:'The Still Room',kind:'Meditation',seconds:80,completed:false,at:1});assert.equal(space.sessions.length,1);assert.equal(summaryOf(space).seconds,80);
space.meditation=normaliseMeditation({choice:'night5',last:{preset:'night5',elapsed:90,listened:89,recordId:'med-one'}});
const backup=validateBackup({app:'human-within',version:1,profile:{name:'A friend'},progress:space});assert.equal(backup.space.atlas['old-letter'].answers.message,'Keep this private draft');assert.equal(backup.space.meditation.last.elapsed,90);
assert.equal(arrivalDestination('#/meditate/night20'),'#/meditate/night20');assert.equal(arrivalDestination('#/atlas/old-tool'),'#/home');
assert(!fs.existsSync('public/content/atlas.json'));assert(!fs.existsSync('public/js/atlas.js'));
for(const p of Object.values(MEDITATION_PRESETS))assert([300,1200].includes(p.duration));
console.log('meditation: actual five/twenty-minute audio, measured narration gaps, real-media timing, stalls/seeks, captions, resume, quiet fade, backup compatibility and rejected expansion removal passed');
