"""Move embedded book artwork/fonts into content-addressed assets.
Preserves the original reading, flip, search, bookmark and accessibility controls.
"""
from pathlib import Path
from PIL import Image
import re, base64, hashlib, json, io
ROOT=Path(__file__).resolve().parents[1]/'public';OUT=ROOT/'assets/books';OUT.mkdir(parents=True,exist_ok=True)
PATTERN=re.compile(r'data:((?:image|font|application)/(?:[a-zA-Z0-9.+-]+));base64,([A-Za-z0-9+/=]+)')
metrics=[]
for p in (ROOT/'books').glob('*.html'):
 source=p.read_text();before=len(source.encode());assets={}
 def replace(m):
  mime=m[1];raw=base64.b64decode(m[2]);digest=hashlib.sha256(raw).hexdigest()[:20]
  ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/svg+xml':'svg','font/otf':'otf','font/woff2':'woff2','font/ttf':'ttf','application/font-sfnt':'otf','application/x-font-ttf':'ttf'}.get(mime,mime.split('/')[-1])
  # Keep page text lossless and sharp; avoid re-encoding existing book artwork.
  target=OUT/(digest+'.'+ext)
  if not target.exists():target.write_bytes(raw)
  assets[digest]=target.stat().st_size
  return '/assets/books/'+target.name
 result=PATTERN.sub(replace,source)
 # External fonts retain local fallbacks and do not block the first paint.
 result=result.replace("font-family:'BookSerif';src:","font-family:'BookSerif';font-display:swap;src:").replace("font-family:'BookSans';src:","font-family:'BookSans';font-display:swap;src:")
 # All readers report their actual current page to the parent, without sharing data externally.
 bridge='<script src="/js/book-bridge.js" defer></script>'
 if '/js/book-bridge.js' not in result:result=result.replace('</body>',bridge+'</body>')
 p.write_text(result)
 metrics.append({'id':p.stem,'beforeBytes':before,'readerBytes':p.stat().st_size,'assetCount':len(assets),'artworkBytes':sum(assets.values())})
manifest=json.loads((ROOT/'content/books.json').read_text())
for b in manifest:
 b['bytes']=(ROOT/b['file'].lstrip('/')).stat().st_size
 b['downloadType']='reader-pack'
 b['download']=f"/books/downloads/{b['id']}.zip"
 b['optimised']=True
(ROOT/'content/books.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ROOT/'content/book-performance.json').write_text(json.dumps(metrics,indent=2)+'\n')
print(json.dumps(metrics,indent=2))
