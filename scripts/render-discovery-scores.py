"""Three original, sample-free scores for the discovery rooms.
48 kHz stereo additive instruments, 24-bit masters, matched AAC delivery.
No external models, samples, credentials or services are needed.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
p=argparse.ArgumentParser();p.add_argument('--masters',required=True);args=p.parse_args()
SR=48000;DURATION=62.5;N=int(SR*DURATION);OUT=Path('public/cinema/audio');masters=Path(args.masters);masters.mkdir(parents=True,exist_ok=True)
manifest=json.loads((OUT/'manifest.json').read_text())
config={'curiosity':(5,[0,5,9,7,2,9,5,0],.85),'invisible':(2,[9,5,2,0,7,5,9,7],.45),'atelier':(0,[0,9,5,2,7,5,9,0],.68)}
for index,(name,(key,roots,brightness)) in enumerate(config.items()):
 target=OUT/(name+'.m4a')
 if name in manifest['scores'] and target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==manifest['scores'][name]['sha256']:
  print('retained',name,flush=True);continue
 rng=np.random.default_rng(8391+index);audio=np.zeros((N,2),np.float32)
 def note(start,midi,length,level,pan,kind):
  count=min(int(length*SR),N-int(start*SR));offset=int(start*SR)
  if count<=0:return
  t=np.arange(count,dtype=np.float32)/SR;f=440*2**((midi-69)/12)
  if kind=='pad':
   env=(1-np.exp(-t*1.8))*np.minimum(1,np.maximum(0,(length-t)/1.9))
   wave=np.sin(2*np.pi*f*t)+.16*np.sin(2*np.pi*f*2*t+.17*np.sin(t))+.045*np.sin(2*np.pi*f*3*t)
   wave*=.93+.07*np.sin(t*.7+pan)
  else:
   env=(1-np.exp(-t*34))*np.exp(-t*(1.1 if name=='atelier' else .65))*np.minimum(1,np.maximum(0,(length-t)/.5))
   wave=np.sin(2*np.pi*f*t)+.23*brightness*np.sin(2*np.pi*f*2.001*t)*np.exp(-t*.65)+.10*brightness*np.sin(2*np.pi*f*3.998*t)*np.exp(-t*1.5)
  sig=wave*env*level;audio[offset:offset+count,0]+=sig*np.sqrt(1-pan);audio[offset:offset+count,1]+=sig*np.sqrt(pan)
 for bar,root in enumerate(roots):
  start=bar*DURATION/8;base=48+key+root;third=3 if root in [2,9] else 4;chord=[base,base+third,base+7,base+14]
  for j,pitch in enumerate(chord[:3]):note(start+j*.12,pitch,9,.028,.25+j*.23,'pad')
  note(start,base-12,8,.018,.5,'pad')
  if name=='invisible':pattern=[2,3,1]
  elif name=='atelier':pattern=[0,2,3,1,2]
  else:pattern=[0,2,3,2]
  for j,c in enumerate(pattern):note(start+.4+j*(6.6/len(pattern))+rng.uniform(-.04,.04),chord[c]+12,5,.06+rng.uniform(-.008,.008),.2+rng.random()*.6,'key')
 wet=np.zeros_like(audio)
 for delay,gain,flip in [(.043,.13,False),(.083,.12,True),(.173,.11,True),(.293,.075,False),(.431,.055,True),(.719,.035,True),(1.09,.018,False)]:
  k=int(delay*SR);wet[k:]+=audio[:-k,::-1 if flip else 1]*gain
 audio+=sosfilt(butter(2,6200,fs=SR,output='sos'),wet,axis=0).astype(np.float32)
 audio=sosfilt(butter(2,35,fs=SR,btype='highpass',output='sos'),audio,axis=0).astype(np.float32)
 # Slow equal-power fades keep the loop join quiet and free of clicks.
 k=int(SR*1.1);audio[:k]*=np.sin(np.linspace(0,np.pi/2,k))[:,None];audio[-k:]*=np.cos(np.linspace(0,np.pi/2,k))[:,None]
 wav=masters/(name+'.wav');sf.write(wav,audio,SR,subtype='PCM_24')
 analysis=subprocess.run(['ffmpeg','-v','info','-i',str(wav),'-af','loudnorm=I=-23:TP=-2:LRA=12:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
 stats=json.JSONDecoder().raw_decode(analysis.stderr[analysis.stderr.rfind('{'):])[0]
 filt=f'loudnorm=I=-23:TP=-2:LRA=12:measured_I={stats["input_i"]}:measured_TP={stats["input_tp"]}:measured_LRA={stats["input_lra"]}:measured_thresh={stats["input_thresh"]}:offset={stats["target_offset"]}:linear=true'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-af',filt,'-ar',str(SR),'-ac','2','-c:a','aac','-b:a','256k','-movflags','+faststart',str(target)],check=True)
 manifest['scores'][name]={'file':'/cinema/audio/'+target.name,'duration':DURATION,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'targetLUFS':-23,'truePeakLimitDBTP':-2}
 (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(name,target.stat().st_size,flush=True)
