"""Keep online readers light and offline downloads self-contained."""
from pathlib import Path
import json,re,zipfile,mimetypes,base64
ROOT=Path(__file__).resolve().parents[1]/'public';DEST=ROOT/'books/downloads';DEST.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'content/books.json').read_text())
for b in manifest:
 p=ROOT/b['file'].lstrip('/');source=p.read_text()
 def inline(m):
  asset=ROOT/'assets/books'/m[1];mime=mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
  return f'data:{mime};base64,'+base64.b64encode(asset.read_bytes()).decode()
 offline=re.sub(r'/assets/books/([a-f0-9]{20}\.[a-zA-Z0-9]+)',inline,source)
 offline=offline.replace('<script src="/js/book-bridge.js" defer></script>','')
 target=DEST/(b['id']+'.zip');tmp=target.with_suffix('.zip.tmp')
 with zipfile.ZipFile(tmp,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=5) as z:
  z.writestr(b['id']+'/'+b['id']+'.html',offline)
  z.writestr(b['id']+'/Read_me.txt',f"{b['title']}\n\nExtract this folder and open {b['id']}.html in your browser. The illustrations, text, fonts and reading controls are included in the HTML file.\n")
 tmp.replace(target);b['bytes']=p.stat().st_size;b['downloadBytes']=target.stat().st_size
 print(f"{b['id']}: online reader {b['bytes']:,} bytes; standalone reader pack {b['downloadBytes']/1048576:.1f} MB")
(ROOT/'content/books.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
