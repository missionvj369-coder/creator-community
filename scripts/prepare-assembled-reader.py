"""Avoid shipping a second copy of the largest book's images in its ZIP download."""
from pathlib import Path
import hashlib,io,json,mimetypes,re,shutil,zipfile
root=Path(__file__).resolve().parents[1]
public=root/'public'
slug='body-you-live-in'
original=root/'content-source/reader-packs'/slug
original.mkdir(parents=True,exist_ok=True)
parts=public/'books/downloads'/f'{slug}.parts.json'
if parts.exists():
    shutil.move(str(parts),str(original/'original.parts.json'))
    shutil.move(str(public/'books/downloads'/slug),str(original/'parts'))
meta=json.loads((original/'original.parts.json').read_text())
data=b''.join((original/'parts'/Path(p['url']).name).read_bytes() for p in meta['parts'])
assert hashlib.sha256(data).hexdigest()==meta['sha256']
with zipfile.ZipFile(io.BytesIO(data)) as archive:
    offline=archive.read(f'{slug}/{slug}.html')
    readme=archive.read(f'{slug}/Read_me.txt').decode()
reader=public/'books'/f'{slug}.html'
def record(path):
    data=path.read_bytes()
    return {'url':'/'+str(path.relative_to(public)),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
assets=[]
for name in sorted(set(re.findall(r'/assets/books/([a-f0-9]{20}\.[a-zA-Z0-9]+)',reader.read_text()))):
    path=public/'assets/books'/name
    assets.append({**record(path),'mime':mimetypes.guess_type(name)[0] or 'application/octet-stream'})
spec={'kind':'assembled-reader-v1','filename':f'{slug}.zip','folder':slug,'reader':record(reader),'assets':assets,'readme':readme,'offlineBytes':len(offline),'offlineSha256':hashlib.sha256(offline).hexdigest(),'bytes':meta['bytes'],'originalArchiveSha256':meta['sha256']}
(public/'books/downloads'/f'{slug}.reader.json').write_text(json.dumps(spec,indent=2)+'\n')
page=public/'books/downloads'/f'{slug}.html'
html=page.read_text()
html=re.sub(r'(<script id="reader-pack" type="application/json">).*?(</script>)',lambda m:m[1]+json.dumps(spec,separators=(',',':'))+m[2],html,flags=re.S)
page.write_text(html)
print(json.dumps({'duplicateBytesRemoved':len(data),'assets':len(assets),'exactOfflineReaderSHA256':spec['offlineSha256']}))
