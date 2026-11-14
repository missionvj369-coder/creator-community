"""Keep online readers light and offline downloads self-contained."""
from pathlib import Path
import json,re,zipfile,mimetypes,base64,argparse,io,hashlib
ROOT=Path(__file__).resolve().parents[1]/'public';DEST=ROOT/'books/downloads';DEST.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'content/books.json').read_text())
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('books',nargs='+',choices=[b['id'] for b in manifest],help='Books whose offline ZIPs should be rebuilt. Split downloads are rebuilt with verified part hashes.')
selected=set(parser.parse_args().books)
for b in manifest:
 if b['id'] not in selected:continue
 if b.get('downloadPage') and b['id']=='body-you-live-in':raise SystemExit('The original body reader uses an assembled, verified archive. Leave it unchanged unless updating that edition explicitly.')
 p=ROOT/b['file'].lstrip('/');source=p.read_text()
 def inline(m):
  asset=ROOT/'assets/books'/m[1];mime=mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
  return f'data:{mime};base64,'+base64.b64encode(asset.read_bytes()).decode()
 offline=re.sub(r'/assets/books/([a-f0-9]{20}\.[a-zA-Z0-9]+)',inline,source)
 offline=offline.replace('<script src="/js/book-bridge.js" defer></script>','')
 buffer=io.BytesIO()
 with zipfile.ZipFile(buffer,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=5) as z:
  z.writestr(b['id']+'/'+b['id']+'.html',offline)
  z.writestr(b['id']+'/Read_me.txt',f"{b['title']}\n\nExtract this folder and open {b['id']}.html in your browser. The illustrations, text, fonts and reading controls are included in the HTML file.\n")
 raw=buffer.getvalue()
 if b.get('downloadPage'):
  folder=DEST/b['id'];folder.mkdir(exist_ok=True);parts=[]
  for i,offset in enumerate(range(0,len(raw),8*1024*1024),1):
   part=raw[offset:offset+8*1024*1024];digest=hashlib.sha256(part).hexdigest();name=f'part-{i:02d}-{digest[:12]}.bin';(folder/name).write_bytes(part)
   parts.append({'url':f'/books/downloads/{b["id"]}/{name}','bytes':len(part),'sha256':digest})
  meta={'filename':b['id']+'.zip','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'parts':parts}
  (DEST/(b['id']+'.parts.json')).write_text(json.dumps(meta,indent=2)+'\n')
  landing=ROOT/b['download'].lstrip('/');html=landing.read_text();html,n=re.subn(r'(<script id="reader-pack" type="application/json">).*?(</script>)',lambda m:m[1]+json.dumps(meta)+m[2],html,flags=re.S);assert n==1;landing.write_text(html)
  keep={Path(x['url']).name for x in parts}
  for old in folder.glob('*.bin'):
   if old.name not in keep:old.unlink()
 else:
  target=DEST/(b['id']+'.zip');tmp=target.with_suffix('.zip.tmp');tmp.write_bytes(raw);tmp.replace(target)
 b['bytes']=p.stat().st_size;b['downloadBytes']=len(raw)
 print(f"{b['id']}: online reader {b['bytes']:,} bytes; standalone reader pack {b['downloadBytes']/1048576:.1f} MB")
(ROOT/'content/books.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
