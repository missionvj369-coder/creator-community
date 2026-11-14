"""Verify that every offline download is intact, self-contained and matches its online reader."""
from pathlib import Path
import base64,hashlib,io,json,mimetypes,re,zipfile
root=Path(__file__).resolve().parents[1]/'public'
books=json.loads((root/'content/books.json').read_text())
for b in books:
 source=(root/b['file'].lstrip('/')).read_text()
 assert (root/b['file'].lstrip('/')).stat().st_size==b['bytes'],b['id']
 generated=False
 if b.get('downloadPage'):
  page=(root/b['download'].lstrip('/')).read_text()
  meta=json.loads(re.search(r'<script id="reader-pack" type="application/json">(.*?)</script>',page,re.S)[1]);parts=[]
  if meta.get('kind')=='assembled-reader-v1':
   generated=True
   for asset in [meta['reader'],*meta['assets']]:
    raw=(root/asset['url'].lstrip('/')).read_bytes()
    assert len(raw)==asset['bytes'] and hashlib.sha256(raw).hexdigest()==asset['sha256'],asset['url']
   original=root.parent/'content-source/reader-packs'/b['id']
   original_meta=json.loads((original/'original.parts.json').read_text())
   data=b''.join((original/'parts'/Path(p['url']).name).read_bytes() for p in original_meta['parts'])
   assert len(data)==meta['bytes'] and hashlib.sha256(data).hexdigest()==meta['originalArchiveSha256']
  else:
   for part in meta['parts']:
    data=(root/part['url'].lstrip('/')).read_bytes()
    assert len(data)==part['bytes'] and hashlib.sha256(data).hexdigest()==part['sha256'],part['url'];parts.append(data)
   data=b''.join(parts)
   assert len(data)==meta['bytes'] and hashlib.sha256(data).hexdigest()==meta['sha256'],b['id']
 else:data=(root/b['download'].lstrip('/')).read_bytes()
 assert len(data)==b['downloadBytes'],b['id']
 with zipfile.ZipFile(io.BytesIO(data)) as archive:
  assert archive.testzip() is None,b['id']
  offline=archive.read(f"{b['id']}/{b['id']}.html").decode()
 def inline(m):
  asset=root/'assets/books'/m[1];mime=mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
  return f'data:{mime};base64,'+base64.b64encode(asset.read_bytes()).decode()
 expected=re.sub(r'/assets/books/([a-f0-9]{20}\.[a-zA-Z0-9]+)',inline,source).replace('<script src="/js/book-bridge.js" defer></script>','')
 assert expected==offline,f"{b['id']}: offline content differs from the online reader"
 if generated:
  raw=expected.encode()
  assert len(raw)==meta['offlineBytes'] and hashlib.sha256(raw).hexdigest()==meta['offlineSha256']
 assert '/assets/books/' not in offline and '/js/book-bridge.js' not in offline,b['id']
 print(f"{b['id']}: CRC, size, assets and exact reader content verified")
print('All six offline reader packs match their online editions; split parts also pass SHA-256 checks.')
