"""Original Human Within compositions, rendered with licensed sampled instruments.
48 kHz stereo, 24-bit intermediate masters, loop crossfades, loudness matching.
SoundFont, Python runtime and intermediate masters are not part of the app.
"""
import argparse,ctypes as C,ctypes.util,hashlib,json,subprocess,sys
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--runtime',required=True);p.add_argument('--soundfont',required=True);p.add_argument('--masters',required=True);args=p.parse_args();sys.path.insert(0,args.runtime)
import numpy as np,soundfile as sf
from scipy.signal import butter,sosfilt
OUT=Path('public/cinema/audio');OUT.mkdir(parents=True,exist_ok=True);MASTERS=Path(args.masters);MASTERS.mkdir(parents=True,exist_ok=True);SR=48000;N=SR*64
lib=C.CDLL(ctypes.util.find_library('fluidsynth'));ptr=C.c_void_p;integer=C.c_int

def fn(name,types,result=integer):
 f=getattr(lib,name);f.argtypes=types;f.restype=result;return f
settings=fn('new_fluid_settings',[],ptr)();fn('fluid_settings_setnum',[ptr,C.c_char_p,C.c_double])(settings,b'synth.sample-rate',SR);fn('fluid_settings_setnum',[ptr,C.c_char_p,C.c_double])(settings,b'synth.gain',.6)
for key in [b'synth.reverb.active',b'synth.chorus.active']:fn('fluid_settings_setint',[ptr,C.c_char_p,integer])(settings,key,0)
synth=fn('new_fluid_synth',[ptr],ptr)(settings);fn('fluid_synth_sfload',[ptr,C.c_char_p,integer])(synth,args.soundfont.encode(),1)
program=fn('fluid_synth_program_change',[ptr,integer,integer]);on=fn('fluid_synth_noteon',[ptr,integer,integer,integer]);off=fn('fluid_synth_noteoff',[ptr,integer,integer]);alloff=fn('fluid_synth_all_sounds_off',[ptr,integer]);cc=fn('fluid_synth_cc',[ptr,integer,integer,integer]);write=fn('fluid_synth_write_float',[ptr,integer,ptr,integer,integer,ptr,integer,integer])
CONFIG={
'arrival':(2,[0,9,5,7,2,5,9,7],0,48,46),'reading':(0,[0,5,9,7,2,5,0,7],0,42,8),'homeward':(5,[0,9,5,0,2,7,5,0],0,49,24),
'stillness':(2,[0,5,9,5,2,7,9,7],8,49,46),'resonance':(7,[0,5,2,9,0,7,5,7],11,48,8),'sanctuary':(2,[0,5,9,7,5,2,5,7],46,48,73),
'origins':(7,[9,5,0,7,2,9,5,7],0,42,46),'reflection':(0,[9,5,0,7,9,2,5,7],0,42,8),'wonder':(5,[0,7,9,5,2,0,5,7],46,49,11),
'patterns':(2,[9,5,0,7,9,2,5,7],0,48,24),'opening':(0,[9,2,5,7,0,5,9,7],8,48,0),'connection':(5,[0,9,5,7,2,5,0,7],46,48,0),
'unfolding':(7,[0,5,9,7,2,5,0,7],0,41,46),'belonging':(2,[0,5,0,7,9,5,2,7],0,49,46),'passage':(7,[9,5,2,7,9,0,5,7],8,42,11),
'firstlight':(0,[0,2,5,7,9,5,0,7],0,48,46),'perspective':(5,[0,5,9,7,2,0,5,7],46,48,12),'nightfall':(2,[9,5,0,7,9,5,2,7],8,49,46),'living':(7,[0,5,9,7,2,0,5,7],0,42,46)}
mp=OUT/'manifest.json';manifest=json.loads(mp.read_text()) if mp.exists() else {'version':1,'sampleRate':SR,'channels':2,'scores':{},'cues':{}}
def digest(file):return hashlib.sha256(file.read_bytes()).hexdigest()
def render(events):
 for ch in range(4):alloff(synth,ch)
 audio=np.zeros((N+SR*4,2),np.float32);cursor=0
 for frame,kind,ch,pitch,vel in sorted(events)+[(len(audio),'end',0,0,0)]:
  frame=max(cursor,min(len(audio),frame))
  while cursor<frame:
   count=min(4096,frame-cursor);l=np.empty(count,np.float32);r=np.empty(count,np.float32);write(synth,count,l.ctypes.data,0,1,r.ctypes.data,0,1);audio[cursor:cursor+count,0]=l;audio[cursor:cursor+count,1]=r;cursor+=count
  if kind=='on':on(synth,ch,pitch,vel)
  elif kind=='off':off(synth,ch,pitch)
 return audio
for index,(name,(key,roots,piano,strings,accent)) in enumerate(CONFIG.items()):
 out=OUT/(name+'.m4a')
 if name in manifest['scores'] and out.exists() and digest(out)==manifest['scores'][name]['sha256']:print('retained',name,flush=True);continue
 rng=np.random.default_rng(index+771);events=[]
 for ch,prog in enumerate([piano,strings,accent,42]):program(synth,ch,prog);cc(synth,ch,10,[48,78,92,54][ch]);cc(synth,ch,7,[85,41,48,30][ch])
 def note(t,ch,pitch,length,velocity):
  start=max(0,int((t+rng.uniform(-.035,.035))*SR));end=min(N+SR*3,start+int(length*SR));events.extend([(start,'on',ch,int(pitch),int(velocity)),(end,'off',ch,int(pitch),0)])
 for bar,root in enumerate(roots):
  base=48+key+root;minor=root in [2,9];chord=[base,base+(3 if minor else 4),base+7,base+(10 if minor else 11),base+14];t=bar*8
  for j,pitch in enumerate(chord[:4]):note(t+j*.11,1,pitch,7.55,32+j*2)
  note(t,3,base-12,7.5,32)
  pattern=[0,2,4,1,2,4] if index%2 else [0,2,1,4,2,1]
  for beat,j in enumerate(pattern):note(t+.35+beat*1.16,0,chord[j]+(12 if index%3==0 else 0),2.8+rng.uniform(0,.6),rng.integers(43,60))
  if name!='nightfall':
   for j in range(2):note(t+2.6+j*3.1,2,chord[(j+bar)%5]+12,3.7,rng.integers(30,43))
 audio=render(events);audio=sosfilt(butter(2,34,fs=SR,btype='highpass',output='sos'),audio,axis=0).astype(np.float32);wet=np.zeros_like(audio)
 for delay,gain,cross in [(.037,.13,False),(.061,.11,True),(.113,.095,True),(.179,.07,False),(.293,.058,True),(.431,.045,False),(.719,.027,True),(1.073,.019,False)]:
  k=int(delay*SR);wet[k:]+=audio[:-k,::-1 if cross else 1]*gain
 audio+=sosfilt(butter(2,6500,fs=SR,output='sos'),wet,axis=0).astype(np.float32);audio[:SR*4]+=audio[N:N+SR*4];audio=audio[:N]
 k=int(SR*1.5);theta=np.linspace(0,np.pi/2,k,dtype=np.float32)[:,None];audio=np.concatenate([audio[-k:]*np.cos(theta)+audio[:k]*np.sin(theta),audio[k:-k]])
 audio*=.65/max(.001,float(abs(audio).max()));wav=MASTERS/(name+'.wav');sf.write(wav,audio,SR,subtype='PCM_24')
 result=subprocess.run(['ffmpeg','-v','info','-i',str(wav),'-af','loudnorm=I=-23:TP=-2:LRA=12:print_format=json','-f','null','-'],capture_output=True,text=True,check=True);stats=json.JSONDecoder().raw_decode(result.stderr[result.stderr.rfind('{'):])[0]
 filt=f'loudnorm=I=-23:TP=-2:LRA=12:measured_I={stats["input_i"]}:measured_TP={stats["input_tp"]}:measured_LRA={stats["input_lra"]}:measured_thresh={stats["input_thresh"]}:offset={stats["target_offset"]}:linear=true'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-af',filt,'-ar',str(SR),'-ac','2','-c:a','aac','-b:a','256k','-movflags','+faststart',str(out)],check=True)
 manifest['scores'][name]={'file':'/cinema/audio/'+out.name,'duration':62.5,'bytes':out.stat().st_size,'sha256':digest(out),'targetLUFS':-23,'truePeakLimitDBTP':-2};mp.write_text(json.dumps(manifest,indent=2)+'\n');print(name,out.stat().st_size,flush=True)
for name,freq,length in [('enter',293.665,1.4),('page',440,.38),('complete',392,2.2),('return',220,1.3)]:
 t=np.arange(int(SR*length))/SR;env=(1-np.exp(-t*28))*np.exp(-t*(3.6 if name=='page' else 2.2));sig=(np.sin(2*np.pi*freq*t)+.24*np.sin(2*np.pi*freq*1.5*t))*.07*env;stereo=np.column_stack([sig,np.roll(sig,180)*.92]);wav=MASTERS/(name+'-cue.wav');sf.write(wav,stereo,SR,subtype='PCM_24');out=OUT/(name+'-cue.m4a');subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','aac','-b:a','192k',str(out)],check=True);manifest['cues'][name]={'file':'/cinema/audio/'+out.name,'duration':length,'bytes':out.stat().st_size,'sha256':digest(out)}
mp.write_text(json.dumps(manifest,indent=2)+'\n');print('All original scores and cues mastered.',flush=True)
