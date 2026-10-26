"""Thirty individually composed vector artworks with print-sharp PNG downloads.
Uses the system SVG renderer and Pillow. Every drawing is tied to its daily cue.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import ctypes as C,ctypes.util, math,json,zipfile,html
ROOT=Path(__file__).resolve().parents[1]/'public';OUT=ROOT/'wallpapers';OUT.mkdir(exist_ok=True)
PALETTES=[('Lavender','#e8e1f1','#f7edf1','#67517f','#b298c4'),('Sage','#e2ecdb','#f2f1df','#4e7055','#a2bb90'),('Apricot','#f7e0c8','#fff0df','#9d6748','#dda674'),('Sky','#dfeaf2','#e8e5f2','#506d8d','#a1bbd1'),('Rose','#f0dfe7','#f5eadf','#935e75','#c89dac'),('Midnight','#233949','#453c55','#f2dfbd','#a8b5cb')]
FONT='/usr/share/fonts/opentype/urw-base35/P052-Roman.otf'
# Render our editable SVG source directly to a PNG without a browser or network.
rsvg=C.CDLL(ctypes.util.find_library('rsvg-2'));cairo=C.CDLL(ctypes.util.find_library('cairo'));gobj=C.CDLL(ctypes.util.find_library('gobject-2.0'))
rsvg.rsvg_handle_new_from_data.argtypes=[C.c_char_p,C.c_size_t,C.POINTER(C.c_void_p)];rsvg.rsvg_handle_new_from_data.restype=C.c_void_p
rsvg.rsvg_handle_render_cairo.argtypes=[C.c_void_p,C.c_void_p];rsvg.rsvg_handle_render_cairo.restype=C.c_int
cairo.cairo_image_surface_create.argtypes=[C.c_int,C.c_int,C.c_int];cairo.cairo_image_surface_create.restype=C.c_void_p
cairo.cairo_create.argtypes=[C.c_void_p];cairo.cairo_create.restype=C.c_void_p
cairo.cairo_surface_write_to_png.argtypes=[C.c_void_p,C.c_char_p];cairo.cairo_surface_write_to_png.restype=C.c_int
cairo.cairo_destroy.argtypes=[C.c_void_p];cairo.cairo_surface_destroy.argtypes=[C.c_void_p];gobj.g_object_unref.argtypes=[C.c_void_p]
def render(svg,path):
 raw=svg.encode();err=C.c_void_p();handle=rsvg.rsvg_handle_new_from_data(raw,len(raw),C.byref(err));assert handle,'SVG could not parse'
 surface=cairo.cairo_image_surface_create(0,1080,2340);ctx=cairo.cairo_create(surface)
 assert rsvg.rsvg_handle_render_cairo(handle,ctx),'SVG did not render'
 tmp=path.with_suffix('.png.tmp');assert cairo.cairo_surface_write_to_png(surface,str(tmp).encode())==0;tmp.replace(path)
 cairo.cairo_destroy(ctx);cairo.cairo_surface_destroy(surface);gobj.g_object_unref(handle)

def artwork(day,ink,paper,accent):
 G='url(#sculpt)';L='url(#glass)';A='url(#warm)';D='url(#deep)'
 def p(d,fill=G,stroke=None,w=2):return f'<path d="{d}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"' if stroke else '')+'/>'
 def c(x,y,r,fill=G):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>'
 def e(x,y,rx,ry,fill=G):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}"/>'
 def r(x,y,w,h,rx=12,fill=G):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"/>'
 def l(x,y,xx,yy,w=2,color=ink):return p(f'M{x} {y}L{xx} {yy}','none',color,w)
 designs={
  1:('lighthouse',lambda: p('M240 405L257 177H344L364 405Z',L)+r(244,147,112,53,9,G)+p('M238 149L300 97L362 149Z',A)+p('M302 164L575 48V286Z','url(#beam)')+c(301,165,20,A)+r(269,236,64,14,4,G)+r(266,285,70,14,4,G)+p('M205 414Q300 375 400 414L421 443H180Z',G)),
  2:('floating-stones',lambda: e(181,333,94,29,G)+e(420,333,94,29,G)+p('M91 334V373Q179 420 275 373V334',G)+p('M326 334V373Q418 421 515 373V334',G)+e(181,330,94,22,L)+e(420,330,94,22,L)+p('M279 258C293 250 310 250 324 258','none',ink,3)+l(301,218,301,179,3)+c(301,137,15,A)),
  3:('purpose-portal',lambda:r(199,54,202,357,35,G)+r(212,69,176,326,26,L)+r(269,83,64,8,5,G)+p('M229 360V234a71 71 0 0 1 142 0v126Z',D)+p('M250 360V235a50 50 0 0 1 100 0v125Z',A)+c(301,247,22,L)+p('M289 263L280 306H322L314 263Z',L)+e(300,437,125,10,'#0000000c')),
  4:('small-staircase',lambda: p('M119 403H225V319H322V235H416V151H492V403Z',G)+p('M119 403L161 430H536V180L492 151V403Z',D)+p('M224 320L266 348M322 235L365 263M416 151L460 180','none','#ffffffaa',2)+c(467,117,27,A)+p('M95 430H544','none',ink,2)),
  5:('thought-and-stone',lambda: p('M171 162C140 113 193 74 233 87C262 31 350 44 366 96C424 73 470 133 433 170Q444 219 391 226H210Q155 221 171 162Z',L)+c(341,261,15,L)+c(321,295,8,L)+e(285,383,134,39,G)+p('M163 370Q187 303 286 310Q378 317 413 376Q301 421 163 370Z',G)+l(206,354,358,354,3,'#ffffffaa')),
  6:('grounded-island',lambda: p('M301 60C255 140 145 234 172 324C195 419 401 419 428 324C451 233 344 139 301 60Z',L)+p('M176 325Q292 267 425 325L384 382H216Z',G)+p('M258 370L267 422L286 390L308 438L323 390L344 422L353 370','none',ink,2)+p('M299 316V174','none',ink,5)+p('M300 254C219 253 219 183 243 169C303 177 315 216 300 254',G)+p('M300 223C375 203 366 143 341 134C296 144 289 185 300 223',G)),
  7:('named-facets',lambda: p('M300 67L462 185L405 365L300 426L196 365L139 185Z',G)+p('M300 67L238 210L300 426L363 210Z',L)+p('M139 185L238 210L196 365M462 185L363 210L405 365M238 210H363','none',paper,3)+p('M300 67V426','none',ink,2)),
  8:('quiet-feather',lambda: p('M214 404C176 306 209 152 404 68C463 239 321 361 214 404Z',L)+p('M192 439Q275 277 405 69','none',ink,4)+''.join(p(f'M{226+i*23} {365-i*40}Q{298+i*15} {344-i*35} {366+i*8} {299-i*35}','none',ink,1.3) for i in range(4))+p('M116 297Q158 260 183 283M107 339Q140 309 164 323','none',ink,2)),
  9:('one-golden-path',lambda:p('M65 332Q200 121 333 322Q427 219 538 344L555 445H42Z',G)+p('M332 433C188 387 425 333 306 282C229 251 335 218 299 185','none',paper,31)+p('M332 433C188 387 425 333 306 282C229 251 335 218 299 185','none',accent,3)+c(299,179,20,A)+c(464,123,37,L)),
  10:('needle-and-thread',lambda: p('M323 74L313 369L300 420L288 369L302 74Z',L)+e(310,109,5,20,D)+p('M310 107C457 83 493 266 394 285C304 305 193 242 163 318C128 404 230 445 284 386','none',ink,10)+p('M310 107C457 83 493 266 394 285','none','#ffffffb0',2)),
  11:('memory-book',lambda: p('M91 161Q189 123 299 183V402Q195 347 91 383Z',L)+p('M299 183Q411 123 510 161V383Q407 347 299 402Z',G)+p('M299 191V402','none',ink,3)+''.join(p(f'M{115} {208+i*31}Q198 {187+i*31} 270 {223+i*31}','none',ink,1.5) for i in range(4))+p('M391 309C370 244 404 205 415 181','none',paper,3)+p('M391 275Q342 251 358 222Q395 229 391 275',L)+p('M402 239Q455 217 438 191Q403 196 402 239',L)),
  12:('spaced-mobile',lambda:p('M300 59V130M165 130H435M165 130V224M300 130V290M435 130V187','none',ink,3)+c(165,264,40,A)+c(300,334,44,G)+c(435,228,40,L)+''.join(c(150+i*42,420,4,ink) for i in range(8))),
  13:('kintsugi-bowl',lambda: e(300,233,199,68,G)+p('M102 232Q118 410 300 424Q485 408 499 232Z',G)+e(300,231,197,54,L)+p('M209 282L244 316L225 351L286 381L296 422M244 316L307 300L347 329L410 310M347 329L338 373L383 402','none','#d3a65f',8)+e(300,230,162,36,'#ffffff3a')),
  14:('protected-candle',lambda:p('M159 389V210a141 141 0 0 1 282 0v179Z',L)+e(300,394,158,27,G)+r(267,236,68,135,8,G)+p('M300 235C253 207 294 168 300 145C331 182 346 210 300 235Z',A)+c(300,108,10,G)+l(169,219,169,340,3,'#ffffffb0')),
  15:('resting-mountains',lambda:p('M51 359L183 196L296 344L399 227L553 366V440H51Z',G)+p('M136 359L305 174L486 395V440H136Z',D)+c(371,109,70,A)+c(401,88,60,paper)+''.join(c(111+i*83,88+(i%3)*36,2.5,ink) for i in range(6))+p('M94 421Q309 390 526 420','none',paper,2)),
  16:('a-moving-human',lambda:c(323,117,34,G)+p('M299 157L349 157L376 252L333 276L296 229L259 300L232 285Z',G)+p('M333 267L379 340L431 377M308 264L275 348L213 400','none',ink,19)+p('M315 179L255 214L208 193M341 177L387 216L423 183','none',ink,14)+e(176,424,35,9,L)+e(456,409,35,9,L)),
  17:('a-kind-embrace',lambda:p('M299 238C234 185 204 116 259 101C283 94 298 110 300 126C310 98 343 87 363 110C397 151 346 204 299 238Z',A)+p('M100 345C103 268 133 231 173 234C204 231 196 279 217 286L287 317Q314 344 288 362L235 346L204 357L235 398L177 430Z',G)+p('M500 345C497 268 467 231 427 234C396 231 404 279 383 286L313 317Q286 344 312 362L365 346L396 357L365 398L423 430Z',L)),
  18:('two-own-gardens',lambda:r(98,331,137,94,20,G)+r(354,307,149,118,20,L)+p('M166 335V163M431 311V209','none',ink,5)+p('M166 257Q92 233 112 192Q163 199 166 257M166 211Q225 191 208 145Q164 157 166 211',G)+p('M431 279Q371 257 385 220Q432 226 431 279M431 241Q493 222 477 184Q433 195 431 241',A)+p('M276 132V423','none',ink,1)),
  19:('worry-lantern',lambda:p('M194 169L300 106L405 169V345L300 410L194 345Z',L)+p('M300 106V410M194 169L300 220L405 169M194 345L300 295L405 345','none',ink,2)+c(300,263,54,A)+p('M300 104V61M300 412V448','none',ink,3)+r(279,49,43,14,6,G)),
  20:('room-for-a-feeling',lambda:r(136,61,328,354,20,G)+r(151,76,298,324,14,L)+p('M300 80V400M151 242H449','none',ink,3)+p('M155 78C253 166 142 258 236 397H155Z',L)+p('M446 78C345 167 463 258 365 397H446Z',L)+c(359,173,38,A)+p('M166 359Q274 282 437 359V398H166Z',G)),
  21:('check-the-prism',lambda:p('M191 368L300 105L438 368Z',L)+p('M300 105L329 341L438 368Z',G)+l(57,220,253,220,12,paper)+p('M330 220L541 117M330 235L541 235M330 250L541 351','none',accent,8)+p('M191 368L329 341L438 368','none',ink,2)),
  22:('next-step-compass',lambda:c(300,251,176,G)+c(300,251,154,L)+p('M300 95V126M300 377V408M145 251H176M424 251H455','none',ink,4)+p('M372 122L323 275L228 381L275 228Z',A)+p('M372 122L300 251L228 381L275 228Z',G)+c(300,251,17,L)),
  23:('letter-of-care',lambda:r(119,197,326,214,18,G)+p('M122 202L282 319L443 202',L,ink,2)+p('M123 408L248 301M444 408L321 302','none',paper,3)+p('M324 134L476 71L421 188L389 137Z',L)+p('M324 134L389 137L421 188','none',ink,2)+p('M205 159Q249 121 291 148','none',ink,2)),
  24:('listening-shell',lambda:p('M167 375C95 261 158 98 296 79C438 60 515 202 460 318C418 405 294 437 219 368C172 323 195 235 265 216C324 201 363 255 342 303C329 338 280 338 264 307','none',ink,27)+p('M167 375C95 261 158 98 296 79C438 60 515 202 460 318','none','#ffffff99',4)+l(420,374,461,425,3)+l(458,346,509,385,3)),
  25:('a-gentle-boundary',lambda:p('M124 405V202a176 176 0 0 1 352 0v203Z',G)+p('M163 405V201a137 137 0 0 1 274 0v204Z',L)+p('M301 133L416 185V405L301 353Z',G)+c(390,297,8,A)+p('M300 132V353','none',ink,3)+p('M101 419H500','none',ink,2)),
  26:('ordinary-beauty',lambda:p('M243 216Q215 282 209 331C206 403 394 403 391 331Q385 279 357 216Z',L)+e(300,216,57,15,G)+p('M300 219Q299 143 259 71M305 211Q355 155 392 107','none',ink,4)+p('M272 107Q202 91 213 52Q262 54 272 107',G)+p('M325 180Q371 194 387 160Q351 133 325 180',G)+c(397,100,26,A)+c(259,65,19,A)+e(300,420,150,10,'#0000000a')),
  27:('cue-and-motion',lambda:p('M141 330L116 128L182 118L208 322Z',G)+p('M238 330L264 116L331 126L306 339Z',L)+p('M358 346L418 152L481 174L420 367Z',G)+''.join(c(148+i*124,220-i*12,7,paper) for i in range(3))+p('M96 389Q300 420 505 391','none',ink,2)),
  28:('the-helpful-bridge',lambda:p('M43 386L80 213L186 266L214 423Z',G)+p('M388 423L423 263L525 214L560 388Z',G)+p('M157 289Q298 171 441 289V317Q302 216 157 317Z',L)+p('M164 290Q300 176 435 290','none',ink,3)+''.join(l(183+i*47,277-math.sin(i/5*math.pi)*40,183+i*47,308-math.sin(i/5*math.pi)*40,2) for i in range(6))+c(299,113,29,A)),
  29:('beginning-again',lambda:p('M88 361Q300 287 514 360L463 419H135Z',G)+p('M243 329L286 355L280 389L320 421','none',paper,7)+p('M301 344C295 277 314 230 299 175','none',ink,5)+p('M300 261C224 264 218 188 242 174C302 185 315 222 300 261',L)+p('M304 222C377 207 367 141 342 130C301 148 291 187 304 222',L)+c(303,91,13,A)),
  30:('the-person-you-practise',lambda:c(300,124,34,L)+p('M265 171Q300 155 335 171L361 297L331 312L326 420H302L290 315L274 420H249L261 308L235 294Z',L)+p('M264 180L201 234L152 190M335 180L395 233L447 190','none',ink,15)+p('M110 409Q134 330 174 357M438 405Q463 319 506 350','none',accent,8)+c(152,180,19,A)+c(448,180,19,A)+''.join(c(138+i*65,83+(i%2)*25,3,ink) for i in range(6))),
 }
 name,draw=designs[day];return name,draw()

def make(d):
 name,bg,bg2,ink,accent=PALETTES[(d['day']-1)%6];design,body=artwork(d['day'],ink,bg,accent)
 f=ImageFont.truetype(FONT,83);measure=ImageDraw.Draw(Image.new('RGB',(1,1)));lines=[];line=''
 for word in d['cue'].split():
  candidate=(line+' '+word).strip()
  if measure.textlength(candidate,font=f)>835 and line:lines.append(line);line=word
  else:line=candidate
 if line:lines.append(line)
 fontSize=83 if len(lines)<=4 else 73
 quote=''.join(f'<text x="540" y="{1640+i*105}" text-anchor="middle" font-family="P052,Georgia,serif" font-size="{fontSize}" fill="{ink}">{html.escape(line)}</text>' for i,line in enumerate(lines))
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340" viewBox="0 0 1080 2340"><defs>
 <linearGradient id="paper" x2=".4" y2="1"><stop stop-color="{bg}"/><stop offset="1" stop-color="{bg2}"/></linearGradient>
 <linearGradient id="sculpt" x2=".9" y2="1"><stop stop-color="white" stop-opacity=".86"/><stop offset=".4" stop-color="{accent}"/><stop offset="1" stop-color="{ink}" stop-opacity=".72"/></linearGradient>
 <linearGradient id="glass" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".92"/><stop offset=".52" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="{accent}" stop-opacity=".46"/></linearGradient>
 <linearGradient id="warm" x2=".9" y2="1"><stop stop-color="#fff7de"/><stop offset=".52" stop-color="#e2bb7d"/><stop offset="1" stop-color="#c19459"/></linearGradient>
 <linearGradient id="deep" x2=".8" y2="1"><stop stop-color="{accent}"/><stop offset="1" stop-color="{ink}"/></linearGradient>
 <linearGradient id="beam"><stop stop-color="#fff9df" stop-opacity=".85"/><stop offset="1" stop-color="#fff9df" stop-opacity="0"/></linearGradient>
 <radialGradient id="halo"><stop stop-color="#fff" stop-opacity=".56"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 </defs><rect width="1080" height="2340" fill="url(#paper)"/><circle cx="550" cy="1030" r="530" fill="url(#halo)"/>
 <text x="540" y="375" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="19" letter-spacing="6" fill="{ink}" opacity=".58">A LITTLE SPACE TO BE HUMAN</text>
 <g transform="translate(75 670) scale(1.55)">{body}</g>
 <text x="540" y="1485" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="23" letter-spacing="6" fill="{ink}" opacity=".7">{html.escape(d['category'].upper())}</text>{quote}
 <path d="M480 2060H600" stroke="{ink}" stroke-opacity=".25" stroke-width="2"/><text x="540" y="2140" text-anchor="middle" font-family="P052,Georgia,serif" font-style="italic" font-size="36" fill="{ink}" opacity=".68">human within</text></svg>'''
 base=f"human-within-{d['day']:02d}";(OUT/(base+'.svg')).write_text(svg);render(svg,OUT/(base+'.png'))
 im=Image.open(OUT/(base+'.png')).convert('RGB');im.thumbnail((360,780));im.save(OUT/f"thumb-{d['day']:02d}.webp",quality=88)
 return {**{k:d[k] for k in ['day','title','cue','category','action']},'explanation':f"{d['title']} is illustrated with its own {design.replace('-',' ')} artwork. Let the image bring the short cue back to mind when it would be useful.",'design':design,'palette':name,'background':bg,'file':f'/wallpapers/{base}.png','svg':f'/wallpapers/{base}.svg','thumb':f"/wallpapers/thumb-{d['day']:02d}.webp",'width':1080,'height':2340}
wallpapers=[make(d) for d in json.loads((ROOT/'content/rewire.json').read_text())]
(ROOT/'content/wallpapers.json').write_text(json.dumps(wallpapers,ensure_ascii=False,indent=2)+'\n')
with zipfile.ZipFile(OUT/'human-within-all-30.zip.tmp','w',compression=zipfile.ZIP_DEFLATED,compresslevel=5) as z:
 for w in wallpapers:z.write(ROOT/w['file'].lstrip('/'),Path(w['file']).name)
(OUT/'human-within-all-30.zip.tmp').replace(OUT/'human-within-all-30.zip')
# Internal contact sheet for visual verification.
contact=Image.new('RGB',(1500,6*540),'#f4f1e9');draw=ImageDraw.Draw(contact)
for i,w in enumerate(wallpapers):
 im=Image.open(ROOT/w['file'].lstrip('/')).convert('RGB');im.thumbnail((225,488));x=38+(i%5)*300;y=15+(i//5)*540;contact.paste(im,(x,y));draw.text((x,y+494),f"{w['day']:02d}  {w['design']}",fill='#536147')
contact.save('/workspace/scratch/e703baa7a12e/wallpaper-art-check.jpg',quality=86)
print('Built 30 distinct artworks, 30 PNGs, 30 previews, editable SVGs, and the complete download pack.')
