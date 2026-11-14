"""Render the original Still Room narration over its original ambient score.

Use --runtime, --model, --voices and --bed for local, offline dependencies.
Models and intermediate WAVs remain outside the source checkout.
"""
import argparse, hashlib, json, subprocess, sys, wave
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('--runtime', required=True)
p.add_argument('--model', required=True)
p.add_argument('--voices', required=True)
p.add_argument('--bed', required=True)
p.add_argument('--cache', required=True)
a=p.parse_args()
sys.path.insert(0,a.runtime)
import numpy as np
import onnxruntime as ort
from kokoro_onnx import Kokoro

root=Path(__file__).resolve().parent.parent
script=json.loads((root/'content-source/meditation/script.json').read_text())
cache=Path(a.cache);cache.mkdir(parents=True,exist_ok=True)
opt=ort.SessionOptions();opt.intra_op_num_threads=4;opt.inter_op_num_threads=1
session=ort.InferenceSession(a.model,sess_options=opt,providers=['CPUExecutionProvider'])
engine=Kokoro.from_session(session,a.voices)
sr=24000
with wave.open(a.bed) as w:
    assert w.getframerate()==sr and w.getnchannels()==2
    bed=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float32).reshape(-1,2)/32768
analysis={}
for name,part in script['sessions'].items():
    duration=part['duration'];n=duration*sr
    music=bed[:n].copy();speech=np.zeros(n,dtype=np.float32);duck=np.ones(n,dtype=np.float32)
    for i,cue in enumerate(part['cues']):
        signature=json.dumps({'text':cue['text'],'voice':'af_heart','speed':.68,'sentence_pause':.7,'clause_pause':.16},sort_keys=True)
        key=hashlib.sha256(signature.encode()).hexdigest()[:18]
        clip=cache/(key+'.wav')
        if clip.exists():
            with wave.open(str(clip)) as w:
                voice=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float32)/32768
        else:
            voice,rate=engine.create(cue['text'],voice='af_heart',speed=.68,lang='en-us',sentence_pause=.7,clause_pause=.16)
            assert rate==sr
            voice=np.asarray(voice,dtype=np.float32)
            # Remove long synthetic leading/trailing silence while retaining soft edges.
            active=np.flatnonzero(np.abs(voice)>.001)
            if len(active):voice=voice[max(0,active[0]-int(.08*sr)):min(len(voice),active[-1]+int(.25*sr))]
            with wave.open(str(clip),'w') as w:
                w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr)
                w.writeframes((np.clip(voice,-1,1)*32767).astype('<i2').tobytes())
        start=int(cue['at']*sr);end=start+len(voice)
        next_at=part['cues'][i+1]['at'] if i+1<len(part['cues']) else duration
        if end/sr>next_at-.35:raise ValueError(f'Voice overlaps next cue: {name} {cue["id"]}, ends {end/sr:.2f}, next {next_at}')
        # Consistent voice level; limited gain prevents amplification of quiet noise.
        peak=float(np.max(np.abs(voice))) or 1
        voice=voice*min(2.0,.59/peak)
        fade=min(int(.03*sr),len(voice)//2)
        voice[:fade]*=np.linspace(0,1,fade);voice[-fade:]*=np.linspace(1,0,fade)
        speech[start:end]+=voice
        pre=max(0,start-int(.6*sr));post=min(n,end+int(1.2*sr))
        duck[pre:start]=np.minimum(duck[pre:start],np.linspace(1,.42,start-pre))
        duck[start:end]=np.minimum(duck[start:end],.42)
        duck[end:post]=np.minimum(duck[end:post],np.linspace(.42,1,post-end))
        cue['audioEnd']=round(end/sr,3)
        print(json.dumps({'session':name,'cue':cue['id'],'end':cue['audioEnd']}),flush=True)
    mixed=music*duck[:,None]*1.25+speech[:,None]
    fade_in=int(.2*sr);fade_out=int((12 if name=='arrival' else 35)*sr)
    mixed[:fade_in]*=np.linspace(0,1,fade_in)[:,None]
    mixed[-fade_out:]*=np.linspace(1,0,fade_out)[:,None]
    peak=float(np.max(np.abs(mixed)));rms=float(np.sqrt(np.mean(mixed**2)))
    if peak>.98:raise ValueError('Clipping risk')
    filename='arrival-5.mp3' if name=='arrival' else 'night-20.mp3'
    output=root/'public/meditation'/filename
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(sr),'-ac','2','-i','pipe:0','-codec:a','libmp3lame','-b:a','128k' if name=='arrival' else '96k',str(output)],input=mixed.astype('<f4').tobytes(),check=True)
    analysis[name]={'duration':duration,'sampleRate':sr,'channels':2,'peak':peak,'rmsDBFS':20*np.log10(max(rms,1e-12)),'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'bytes':output.stat().st_size,'cues':part['cues']}
    transcript='THE STILL ROOM\n'+('A gentle arrival · 5 minutes' if name=='arrival' else 'Stay at rest · 20 minutes')+'\n\n'
    transcript+='\n\n'.join(f'{int(c["at"]//60):02}:{int(c["at"]%60):02} — {c["title"]}\n{c["text"]}' for c in part['cues'])
    (root/'public/meditation'/('arrival-transcript.txt' if name=='arrival' else 'night-transcript.txt')).write_text(transcript+'\n')
(root/'public/content/meditation').mkdir(exist_ok=True)
(root/'public/content/meditation/session.json').write_text(json.dumps(script,ensure_ascii=False,indent=2)+'\n')
(root/'public/meditation/audio-analysis.json').write_text(json.dumps(analysis,ensure_ascii=False,indent=2)+'\n')
print('Both Still Room audio tracks rendered.',flush=True)
