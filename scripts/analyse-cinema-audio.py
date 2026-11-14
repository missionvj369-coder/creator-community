"""Measure shipped, decoded audio instead of reporting encoder targets as results."""
import concurrent.futures, json, pathlib, re, subprocess

root=pathlib.Path(__file__).resolve().parents[1]
folder=root/'public/cinema/audio'
files=sorted(folder.glob('*.m4a'))+sorted((root/'public/videos').glob('*.mp4'))

def analyse(path):
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)]))
    stream=next(s for s in probe['streams'] if s['codec_type']=='audio')
    result=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-vn','-af','loudnorm=I=-23:TP=-2:LRA=12:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    data=json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}',result.stderr)[-1])
    return {'file':'/'+str(path.relative_to(root/'public')),'duration':round(float(probe['format']['duration']),3),'sampleRate':int(stream['sample_rate']),'channels':stream['channels'],'integratedLUFS':float(data['input_i']),'truePeakDBTP':float(data['input_tp']),'loudnessRangeLU':float(data['input_lra']),'bytes':path.stat().st_size}

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    measured=list(pool.map(analyse,files))
assert all(x['sampleRate']==48000 for x in measured)
assert all(x['truePeakDBTP']<0 for x in measured), 'Decoded clipping / true-peak overs'
scores=json.loads((folder/'manifest.json').read_text())['scores']
score_files={s['file'] for s in scores.values()}
assert all(x['channels']==2 and abs(x['integratedLUFS']+23)<1 for x in measured if x['file'] in score_files)
report={'method':'FFmpeg loudnorm input measurements on decoded shipped AAC files; before app volume and mixing. This verifies file levels, not listening quality or device output.','assets':measured}
target=root/'content-source/cinema/audio-verification.json'
target.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'measuredAssets':len(measured),'scores':len(score_files),'maximumTruePeakDBTP':max(x['truePeakDBTP'] for x in measured),'report':str(target)}))
