"""Human Within — original 20-minute ambient composition.
No external samples, no therapeutic-frequency or binaural effects.
Dependencies: Python3, numpy, FFmpeg. Output: 24kHz stereo PCM16 bed.wav.
Run: python generate_bed.py [--output-dir PATH]
"""
from pathlib import Path
import argparse,json,math,subprocess,tempfile,wave
import numpy as np

SR=24000
DURATION=1200
CHUNK=4*SR
SEED=20261028
ROOT=Path(__file__).resolve().parent
# Slowly evolving F-major / relative-minor colours. Every list is an original
# voicing, not a sample or a frequency-treatment prescription.
VOICINGS=[
 [41,48,53,57,60,67], # F major9
 [45,52,55,60,64,67], # A minor7/11
 [38,45,53,57,60,64], # D minor9
 [46,53,57,60,65,69], # Bb major9
 [43,50,53,57,62,65], # G minor9
 [36,43,53,55,62,64], # C suspended/add9
 [41,48,55,57,60,65], # F add9
 [38,45,52,53,60,65], # D minor11
 [46,53,60,62,65,69], # Bb major9
 [43,50,57,58,62,65], # G minor9
 [36,43,52,55,57,62], # C6/9
 [41,48,53,57,64,67], # F major9
 [45,52,55,60,64,69], # A minor7
 [41,48,53,57,60,67], # F major9, final rest
]
WEIGHTS=np.array([.20,.29,.36,.31,.20,.12])

def hz(midi):return 440*2**((midi-69)/12)
def smoothstep(x):
 x=np.clip(x,0,1)
 return x*x*(3-2*x)

def make_events():
 rng=np.random.default_rng(SEED+1)
 events=[]
 start=15.0
 while start<DURATION-50:
  section=min(len(VOICINGS)-1,int(start/90))
  chord=VOICINGS[section]
  # Sparse, irregular pairs or individual felt notes; there is no metronome.
  count=2 if rng.random()<.24 else 1
  for note_no in range(count):
   pitch=int(chord[int(rng.integers(2,6))])+(12 if rng.random()<.34 else 0)
   events.append(dict(start=float(start+note_no*rng.uniform(1.1,2.8)),midi=pitch,
       gain=float(rng.uniform(.0045,.009)),pan=float(rng.uniform(-.50,.50)),
       phase=float(rng.uniform(0,2*np.pi))))
  start+=rng.uniform(21,37)
 return events

EVENTS=make_events()

def compose_raw(path):
 rng=np.random.default_rng(SEED)
 # All oscillators are phase-continuous functions of absolute time.
 phases=rng.uniform(0,2*np.pi,(len(VOICINGS),6,4))
 pad_pans=np.array([-.30,.25,-.48,.45,-.18,.12])
 with wave.open(str(path),'wb') as out:
  out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR)
  for offset in range(0,SR*DURATION,CHUNK):
   count=min(CHUNK,SR*DURATION-offset)
   t=(offset+np.arange(count,dtype=np.float64))/SR
   stereo=np.zeros((count,2),dtype=np.float64)
   for i,chord in enumerate(VOICINGS):
    # Twenty-second overlap around ninety-second harmonic changes.
    start=i*90
    enter=smoothstep((t-start+20)/40)
    leave=1-smoothstep((t-(start+90)+20)/40)
    envelope=enter*leave
    if not np.any(envelope>0):continue
    for j,note in enumerate(chord):
     f=hz(note);phase=phases[i,j]
     drift=.05*np.sin(2*np.pi*.0081*t+phase[0])
     tone=(np.sin(2*np.pi*f*t+phase[0]+drift)
        +.18*np.sin(2*np.pi*2*f*t+phase[1]+.5*drift)
        +.052*np.sin(2*np.pi*3*f*t+phase[2])
        +.014*np.sin(2*np.pi*5*f*t+phase[3]))
     movement=.90+.055*np.sin(2*np.pi*(.010+j*.0018)*t+phase[2])
     tone*=envelope*WEIGHTS[j]*.025*movement
     pan=pad_pans[j]+.065*np.sin(2*np.pi*.004*t+phase[1])
     stereo[:,0]+=tone*np.sqrt((1-pan)/2)
     stereo[:,1]+=tone*np.sqrt((1+pan)/2)
   for event in EVENTS:
    rel=t-event['start']
    active=(rel>=0)&(rel<34)
    if not np.any(active):continue
    a=rel[active];f=hz(event['midi']);phase=event['phase']
    attack=(1-np.exp(-a/.13))**2
    fundamental=np.sin(2*np.pi*f*a+phase)*np.exp(-a/5.5)
    # Mild inharmonicity and softer short upper partials suggest felt strings.
    partials=.19*np.sin(2*np.pi*f*2.001*a+phase*.7)*np.exp(-a/2.7)
    partials+=.045*np.sin(2*np.pi*f*3.003*a+phase*.5)*np.exp(-a/1.5)
    signal=(fundamental+partials)*attack*event['gain']
    pan=event['pan']
    stereo[active,0]+=signal*math.sqrt((1-pan)/2)
    stereo[active,1]+=signal*math.sqrt((1+pan)/2)
   # Extremely soft air with gradual sea-like swells. It is subsequently
   # bandwidth-limited and diffused; neither channel has a different beat tone.
   swell=.48+.22*np.sin(2*np.pi*.019*t+.8)+.14*np.sin(2*np.pi*.007*t+2)
   air=rng.normal(0,1,(count,2))
   stereo+=air*swell[:,None]*.00072
   # A slowly changing, low midrange shimmer, far below the warm pad.
   shimmer=.0003*np.sin(2*np.pi*523.251*t+.08*np.sin(2*np.pi*.013*t))
   shimmer*=.5+.5*np.sin(2*np.pi*.005*t)
   stereo[:,0]+=shimmer*.7;stereo[:,1]+=shimmer*.55
   stereo=np.clip(stereo,-.95,.95)
   out.writeframes(np.rint(stereo*32767).astype('<i2').tobytes())
   if offset%(SR*120)==0:print(f'Composed {offset/SR:.0f}/{DURATION}s',flush=True)

def measure(path):
 total=0.;n=0;peak=0.;frame_count=0;windows=[]
 with wave.open(str(path),'rb') as w:
  params=dict(rate=w.getframerate(),channels=w.getnchannels(),sample_width=w.getsampwidth(),frames=w.getnframes())
  while True:
   data=w.readframes(SR*10)
   if not data:break
   values=np.frombuffer(data,dtype='<i2').astype(np.float64)/32768
   peak=max(peak,float(np.abs(values).max()))
   energy=float(np.square(values).sum());total+=energy;n+=values.size
   windows.append(math.sqrt(energy/values.size))
   frame_count+=values.size//params['channels']
 rms=math.sqrt(total/n)
 return dict(**params,duration=frame_count/params['rate'],rms=rms,rms_dbfs=20*math.log10(max(rms,1e-12)),peak=peak,peak_dbfs=20*math.log10(max(peak,1e-12)),ten_second_rms_dbfs=[round(20*math.log10(max(x,1e-12)),3) for x in windows])

def build(dest):
 dest.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix='human-within-bed-',dir=dest) as tmp:
  tmp=Path(tmp);raw=tmp/'composition-raw.wav';diffused=tmp/'composition-diffused.wav'
  compose_raw(raw)
  # Two soft, unequal delay clouds produce diffuse tails, rather than rhythmic
  # echoes. They act only on this music bed, not the spoken guidance.
  filters=(
   'highpass=f=45,lowpass=f=4100,'
   'aecho=0.84:0.82:173|311|487|733|1091|1603:0.10|0.09|0.075|0.06|0.045|0.035,'
   'aecho=0.92:0.91:47|83|139|227:0.055|0.045|0.035|0.025,'
   'stereowiden=delay=23:feedback=0.10:crossfeed=0.12:drymix=0.96,'
   'lowpass=f=4300,atrim=duration=1200,'
   'afade=t=in:st=0:d=8,afade=t=out:st=1165:d=35'
  )
  subprocess.run(['ffmpeg','-v','error','-i',str(raw),'-af',filters,'-ar',str(SR),'-ac','2','-c:a','pcm_s16le','-y',str(diffused)],check=True)
  info=measure(diffused)
  desired_rms=10**(-30/20)
  gain=min(desired_rms/info['rms'],.185/info['peak'])
  target=dest/'bed.wav'
  with wave.open(str(diffused),'rb') as src,wave.open(str(target),'wb') as out:
   out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR)
   while True:
    block=src.readframes(CHUNK)
    if not block:break
    values=np.frombuffer(block,dtype='<i2').astype(np.float64)*gain
    out.writeframes(np.rint(np.clip(values,-32767,32767)).astype('<i2').tobytes())
  final=measure(target)
  final.update(file=str(target),composition='Human Within — Soft Landing',seed=SEED,
     description='Original slow harmonic pads, sparse felt-string notes, soft diffuse stereo ambience; no external samples or therapeutic-frequency claims.',
     fade_in_seconds=8,fade_out_seconds=35,event_count=len(EVENTS),normalisation_gain=gain,
     segment_seconds=90,voicings=VOICINGS)
  (dest/'bed-analysis.json').write_text(json.dumps(final,indent=2))
  assert final['duration']==DURATION and final['rate']==SR and final['channels']==2
  assert final['peak']<.20
  assert -31<=final['rms_dbfs']<=-29
  print(json.dumps({k:v for k,v in final.items() if k!='ten_second_rms_dbfs' and k!='voicings'},indent=2),flush=True)

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--output-dir',type=Path,default=ROOT);args=parser.parse_args();build(args.output_dir)
