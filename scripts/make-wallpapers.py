"""Build the downloadable wallpaper originals and their lightweight gallery previews.
No network or runtime image generation is needed in the app.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, json, zipfile, textwrap

ROOT=Path(__file__).resolve().parents[1]/'public'
OUT=ROOT/'wallpapers';OUT.mkdir(exist_ok=True)
W,H=1080,2340
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
SERIF='/usr/share/fonts/opentype/urw-base35/P052-Roman.otf'
ITALIC='/usr/share/fonts/opentype/urw-base35/P052-Italic.otf'
PALETTES=[
 ('Lavender','#e8ddf6','#f7eaf1','#795b9e','#ba99d4'),
 ('Sage','#dfebd5','#f2f0d9','#4e7054','#9cb88d'),
 ('Apricot','#f8ddbf','#fff0df','#a35f3f','#e6a16d'),
 ('Sky','#d5e8ef','#e6e5f5','#496c91','#88a9ce'),
 ('Rose','#f4dce5','#f2e9da','#985b75','#d59aac'),
 ('Midnight','#233749','#483b5b','#f1dcb9','#a7a7cc'),
]

def rgb(h):return tuple(bytes.fromhex(h.lstrip('#')))
def mix(a,b,t):return tuple(round(x*(1-t)+y*t) for x,y in zip(rgb(a),rgb(b)))
def centered(draw,text,y,font,fill):
 box=draw.textbbox((0,0),text,font=font);draw.text(((W-box[2]+box[0])/2,y),text,font=font,fill=fill)
def tracking(draw,text,y,size,fill,space=8):
 f=ImageFont.truetype(FONT,size);width=sum(draw.textlength(c,font=f) for c in text)+space*(len(text)-1);x=(W-width)/2
 for c in text:draw.text((x,y),c,font=f,fill=fill);x+=draw.textlength(c,font=f)+space

def make(d):
 i=d['day']-1;name,bg,bg2,ink,accent=PALETTES[i%6]
 im=Image.new('RGB',(W,H));dr=ImageDraw.Draw(im)
 for y in range(H):dr.line((0,y,W,y),fill=mix(bg,bg2,y/H))
 # A tactile composition. The open top quarter leaves space for a phone clock.
 art=Image.new('RGBA',(W,H));ad=ImageDraw.Draw(art)
 shape=i%6;variant=i//6;cx=540;cy=1040;edge=rgb(ink);ac=rgb(accent)
 if shape==0:
  for n in range(8):
   a=n*math.pi/4+variant*.14;px=cx+math.sin(a)*125;py=cy+math.cos(a)*125
   petal=Image.new('RGBA',(470,620));pd=ImageDraw.Draw(petal)
   pd.ellipse((55,40,415,580),fill=(*ac,155),outline=(*edge,65),width=2)
   pd.ellipse((85,55,380,520),fill=(255,255,255,40))
   petal=petal.rotate(n*45+variant*9,resample=Image.Resampling.BICUBIC,expand=True)
   art.alpha_composite(petal,(int(px-petal.width/2),int(py-petal.height/2)))
  ad=ImageDraw.Draw(art);ad.ellipse((cx-82,cy-82,cx+82,cy+82),fill=(*edge,180));ad.ellipse((cx-64,cy-68,cx+64,cy+60),fill=(244,236,252,200))
 elif shape==1:
  for j in range(8):
   x=150+j*42;y=680+j*42;xx=930-j*42;yy=1370
   ad.arc((x,y,xx,y+(xx-x)),180,360,fill=(*edge,45+j*23),width=18)
   ad.line((x,y+(xx-x)//2,x,yy),fill=(*edge,45+j*23),width=18)
   ad.line((xx,y+(xx-x)//2,xx,yy),fill=(*edge,45+j*23),width=18)
  ad.ellipse((470,1060,610,1200),fill=(*ac,230))
 elif shape==2:
  for n in range(24):
   a=n*math.pi/12;ra=243+variant*8;rb=350+variant*8
   ad.line((cx+math.cos(a)*ra,cy+math.sin(a)*ra,cx+math.cos(a)*rb,cy+math.sin(a)*rb),fill=(*edge,130),width=12)
  for r in range(218,0,-2):ad.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(*mix(accent,bg,1-r/218),255))
 elif shape==3:
  for j in range(7):
   pts=[]
   for x in range(-80,1161,4):
    y=cy-185+j*56+math.sin((x+variant*90)/170+j*.18)*(130+j*6)
    pts.append((x,y))
   ad.line(pts,fill=(*edge,50+j*26),width=20)
  ad.ellipse((734,688,800,754),fill=(*ac,255))
 elif shape==4:
  for j in range(9):
   rx=70+j*39;ry=40+j*25
   ad.ellipse((cx-rx,cy-ry,cx+rx,cy+ry),outline=(*edge,230-j*20),width=10)
  ad.ellipse((cx-30,cy-30,cx+30,cy+30),fill=(*edge,230))
 else:
  for j in range(22):
   x=110+(j*157+i*31)%850;y=510+(j*101)%850;r=2+j%4
   ad.ellipse((x-r,y-r,x+r,y+r),fill=(*edge,95))
  ad.ellipse((255,770,825,1340),fill=(*edge,225))
  ad.ellipse((375,690,890,1205),fill=(*rgb(bg),255))
  ad.arc((155,690,925,1460),15,280,fill=(*ac,100),width=2)
 im=Image.alpha_composite(im.convert('RGBA'),art).convert('RGB');dr=ImageDraw.Draw(im)
 tracking(dr,'A LITTLE SPACE TO BE HUMAN',370,21,(*rgb(ink),),6)
 tracking(dr,d['category'].upper(),1470,23,rgb(ink),6)
 # Measure the actual rendered text, including punctuation, before drawing it.
 font_size=83;lines=[]
 while True:
  font=ImageFont.truetype(SERIF,font_size);lines=[];line=''
  for word in d['cue'].split():
   candidate=(line+' '+word).strip()
   if dr.textlength(candidate,font=font)>820 and line:lines.append(line);line=word
   else:line=candidate
  if line:lines.append(line)
  if len(lines)<=4:break
  font_size-=3
 y=1600
 for line in lines:centered(dr,line,y,font,rgb(ink));y+=round(font_size*1.28)
 dr.line((465,2050,615,2050),fill=rgb(accent),width=2)
 centered(dr,'human within',2110,ImageFont.truetype(ITALIC,39),rgb(ink))
 path=OUT/f'human-within-{d["day"]:02d}.png';tmp=path.with_suffix('.png.tmp');im.save(tmp,format='PNG',optimize=True);tmp.replace(path)
 thumb=im.copy();thumb.thumbnail((360,780));thumb_path=OUT/f'thumb-{d["day"]:02d}.webp';thumb_tmp=thumb_path.with_suffix('.webp.tmp');thumb.save(thumb_tmp,format='WEBP',quality=87);thumb_tmp.replace(thumb_path)
 return {**{k:d[k] for k in ['day','title','cue','category','explanation','action']},'palette':name,'background':bg,'file':f'/wallpapers/{path.name}','thumb':f'/wallpapers/thumb-{d["day"]:02d}.webp','width':W,'height':H}

all=[make(d) for d in json.loads((ROOT/'content/rewire.json').read_text())]
(ROOT/'content/wallpapers.json').write_text(json.dumps(all,ensure_ascii=False,indent=2))
with zipfile.ZipFile(OUT/'human-within-all-30.zip.tmp','w',compression=zipfile.ZIP_STORED) as z:
 for d in all:z.write(ROOT/d['file'].lstrip('/'),Path(d['file']).name)
(OUT/'human-within-all-30.zip.tmp').replace(OUT/'human-within-all-30.zip')
print(f'Built {len(all)} full-resolution PNGs, previews, and the complete download pack.')
