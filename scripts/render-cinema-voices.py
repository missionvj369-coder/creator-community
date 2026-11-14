"""Short original neural welcomes, using the Still Room's existing voice identity."""
import sys,json,hashlib,subprocess,argparse
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--runtime',required=True);p.add_argument('--model',required=True);p.add_argument('--voices',required=True);p.add_argument('--cache',required=True);p.add_argument('--source',default='content-source/cinema/voices.json');p.add_argument('--metadata',default='voices.json');a=p.parse_args();sys.path.insert(0,a.runtime)
import numpy as np,soundfile as sf,onnxruntime as ort
from kokoro_onnx import Kokoro
opt=ort.SessionOptions();opt.intra_op_num_threads=2;opt.inter_op_num_threads=1
engine=Kokoro.from_session(ort.InferenceSession(a.model,sess_options=opt,providers=['CPUExecutionProvider']),a.voices)
cache=Path(a.cache);cache.mkdir(parents=True,exist_ok=True);out=Path('public/cinema/audio');meta=out/a.metadata;data=json.loads(meta.read_text()) if meta.exists() else {}
for name,text in json.loads(Path(a.source).read_text()).items():
 file=out/(name+'-voice.m4a')
 if name in data and data[name]['text']==text and file.exists():print('retained',name,flush=True);continue
 audio,rate=engine.create(text,voice='af_heart',speed=.83,lang='en-us',sentence_pause=.55,clause_pause=.12);audio=np.asarray(audio,dtype=np.float32);active=np.flatnonzero(abs(audio)>.001)
 if len(active):audio=audio[max(0,active[0]-int(rate*.08)):min(len(audio),active[-1]+int(rate*.25))]
 k=min(int(rate*.015),len(audio)//2);audio[:k]*=np.linspace(0,1,k);audio[-k:]*=np.linspace(1,0,k);wav=cache/(name+'.wav');sf.write(wav,audio,rate,subtype='PCM_24')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-af','highpass=f=75,loudnorm=I=-20:TP=-3:LRA=8','-ar','48000','-ac','1','-c:a','aac','-b:a','192k',str(file)],check=True)
 data[name]={'file':'/cinema/audio/'+file.name,'text':text,'duration':round(len(audio)/rate,3),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'voice':'af_heart','sourceSampleRate':rate};meta.write_text(json.dumps(data,indent=2)+'\n');print(name,data[name]['duration'],flush=True)
