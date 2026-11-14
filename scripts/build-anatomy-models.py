"""Convert HRA v1.2 and BodyParts3D reference surfaces; NumPy and Pillow required."""
import sys,json,struct,hashlib,collections,zipfile
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
SRC=Path(sys.argv[1]);OUT=Path.cwd()/'public/anatomy';OUT.mkdir(parents=True,exist_ok=True)
D={5121:'u1',5123:'<u2',5125:'<u4',5126:'<f4'};DIM={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
PALETTE={'skin':'b8baaa','brain':'cba49b','spinal':'d2ba94','eyes':'b7c4bd','heart':'ba6558','lungs':'c69491','liver':'975d4f','pancreas':'d3b47c','gut':'c7a184','colon':'aa8973','kidneys':'aa6257','ureters':'d8bf91','bladder':'d7b891','spleen':'80566c','thymus':'c9a6a0','bones':'dbd4bb','uterus':'c28b8a','lymph':'a3b896'}
REGION={'skin':'defence','brain':'nervous','spinal':'nervous','eyes':'senses','heart':'circulation','lungs':'respiration','liver':'digestion','pancreas':'digestion','gut':'digestion','colon':'digestion','kidneys':'urinary','ureters':'urinary','bladder':'urinary','spleen':'defence','thymus':'defence','bones':'movement','uterus':'endocrine','lymph':'defence'}
def read_glb(file):
 b=(SRC/file).read_bytes();size=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+size]);binary=b[28+size:]
 def acc(i):
  a=j['accessors'][i];v=j['bufferViews'][a['bufferView']];dt=np.dtype(D[a['componentType']]);dim=DIM[a['type']]
  return np.ndarray((a['count'],dim),dtype=dt,buffer=binary,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',dim*dt.itemsize),dt.itemsize)).copy()
 def visit(i,parent):
  x=j['nodes'][i];m=np.eye(4)
  if 'matrix'in x:m=np.array(x['matrix']).reshape(4,4).T
  else:
   q=x.get('rotation',[0,0,0,1]);a,b,c,w=q;r=np.array([[1-2*(b*b+c*c),2*(a*b-c*w),2*(a*c+b*w)],[2*(a*b+c*w),1-2*(a*a+c*c),2*(b*c-a*w)],[2*(a*c-b*w),2*(b*c+a*w),1-2*(a*a+b*b)]]);m[:3,:3]=r@np.diag(x.get('scale',[1,1,1]));m[:3,3]=x.get('translation',[0,0,0])
  m=parent@m
  if 'mesh'in x:
   for p in j['meshes'][x['mesh']]['primitives']:
    if p.get('mode',4)!=4:continue
    v=acc(p['attributes']['POSITION']);v=(np.c_[v,np.ones(len(v))]@m.T)[:,:3];f=acc(p['indices']).reshape(-1,3).astype(np.int64)
    yield x.get('name',file),v,f
  for child in x.get('children',[]):yield from visit(child,m)
 for i in j['scenes'][j.get('scene',0)]['nodes']:yield from visit(i,np.eye(4))
def reduce(v,f,cell):
 _,ids=np.unique(np.round(v/cell).astype(np.int32),axis=0,return_inverse=True);counts=np.bincount(ids);v=np.stack([np.bincount(ids,weights=v[:,i])/counts for i in range(3)],axis=1);f=ids[f];f=f[(f[:,0]!=f[:,1])&(f[:,1]!=f[:,2])&(f[:,0]!=f[:,2])];_,keep=np.unique(np.sort(f,axis=1),axis=0,return_index=True);f=f[np.sort(keep)];n=np.zeros_like(v);a,b,c=v[f[:,0]],v[f[:,1]],v[f[:,2]];normal=np.cross(b-a,c-a)
 for i in range(3):np.add.at(n,f[:,i],normal)
 n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12);return v.astype('<f4'),f.astype('<u4'),n.astype('<f4')
def group(key,items,cell=.0015,part=None,source='HRA v1.2'):
 vv=[];ff=[];off=0
 for name,v,f in items:vv.append(v);ff.append(f.astype(np.int64)+off);off+=len(v)
 v,f,n=reduce(np.concatenate(vv),np.concatenate(ff),cell);r={'key':key,'part':part or key,'region':REGION[key],'source':source,'vertices':len(v),'triangles':len(f),'min':v.min(0).tolist(),'max':v.max(0).tolist(),'center':((v.min(0)+v.max(0))/2).tolist()};print(key,len(v),len(f),flush=True);return r,v,f,n
def write(name,records):
 j={'asset':{'version':'2.0','generator':'Human Within reference mesh preparation','copyright':'HRA / HuBMAP CC BY 4.0. BodyParts3D © DBCLS CC BY 4.0. See CREDITS.md.'},'scene':0,'scenes':[{'nodes':list(range(len(records)))}],'nodes':[],'meshes':[],'materials':[],'accessors':[],'bufferViews':[]};binary=bytearray()
 def acc(a,typ,component,target,bounds=False):
  binary.extend(b'\x00'*((-len(binary))%4));offset=len(binary);binary.extend(a.tobytes());view=len(j['bufferViews']);j['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':a.nbytes,'target':target});x={'bufferView':view,'componentType':component,'count':len(a),'type':typ}
  if bounds:x.update(min=a.min(0).tolist(),max=a.max(0).tolist())
  j['accessors'].append(x);return len(j['accessors'])-1
 for r,v,f,n in records:
  pos=acc(v,'VEC3',5126,34962,True);normal=acc(n,'VEC3',5126,34962);indices=acc(f.reshape(-1),'SCALAR',5125,34963);color=PALETTE[r['key']];rgb=[int(color[i:i+2],16)/255 for i in [0,2,4]];mid=len(j['materials']);j['materials'].append({'name':r['key'],'pbrMetallicRoughness':{'baseColorFactor':rgb+[1],'metallicFactor':.02,'roughnessFactor':.65},'doubleSided':True});mesh=len(j['meshes']);j['meshes'].append({'name':r['part'],'primitives':[{'attributes':{'POSITION':pos,'NORMAL':normal},'indices':indices,'material':mid}]});j['nodes'].append({'name':r['part'],'mesh':mesh,'extras':r})
 binary.extend(b'\x00'*((-len(binary))%4));j['buffers']=[{'byteLength':len(binary)}];text=json.dumps(j,separators=(',',':')).encode();text+=b' '*((-len(text))%4);data=struct.pack('<III',0x46546c67,2,28+len(text)+len(binary))+struct.pack('<II',len(text),0x4e4f534a)+text+struct.pack('<II',len(binary),0x004e4942)+binary;(OUT/name).write_bytes(data);print(name,len(data),flush=True);return {'file':'/anatomy/'+name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'structures':[r[0]for r in records]}
files={'skin':['VH_M_Skin.glb'],'brain':['Allen_M_Brain.glb'],'spinal':['VH_M_Spinal_Cord.glb'],'eyes':['VH_M_Eye_L.glb','VH_M_Eye_R.glb'],'lungs':['VH_M_Lung.glb'],'liver':['VH_M_Liver.glb'],'pancreas':['VH_M_Pancreas.glb'],'gut':['VH_M_Small_Intestine.glb'],'colon':['SBU_M_Intestine_Large.glb'],'kidneys':['VH_M_Kidney_L.glb','VH_M_Kidney_R.glb'],'ureters':['VH_M_Ureter_L.glb','VH_M_Ureter_R.glb'],'bladder':['VH_M_Urinary_Bladder.glb'],'spleen':['VH_M_Spleen.glb'],'thymus':['VH_M_Thymus.glb']}
body=[]
for key,names in files.items():
 items=[m for name in names for m in read_glb(name)if not any(t in m[0].lower()for t in ['extraction','registration','placement','landmark'])]
 if key=='liver':items=[m for m in items if any(t in m[0].lower()for t in ['segment','caudate_lobe'])]
 body.append(group(key,items,{'skin':.006,'brain':.002,'eyes':.001,'lungs':.002,'kidneys':.0018}.get(key,.0015)))
for name,v,f in read_glb('VH_M_Heart.glb'):body.append(group('heart',[(name,v,f)],.0008,name.replace('VH_M_','')))
uterus=[group('uterus',[m for file in ['VH_F_Uterus.glb','VH_F_Ovary_L.glb','VH_F_Ovary_R.glb','VH_F_Fallopian_Tube_L.glb','VH_F_Fallopian_Tube_R.glb']for m in read_glb(file)],.00045)];lymph=[group('lymph',read_glb('NIH_M_Lymph_Node.glb'),.00025)]
z=zipfile.ZipFile(SRC/'partof_BP3D_4.0_obj_99.zip');parts=collections.defaultdict(list)
for row in (SRC/'partof_element_parts.txt').read_text().splitlines()[1:]:
 fma,name,fj=row.split('\t');parts[fma].append(fj)
def obj(fj):
 vv=[];ff=[]
 for line in z.read('partof_BP3D_4.0_obj_99/'+fj+'.obj').decode().splitlines():
  if line.startswith('v '):vv.append([float(x)for x in line.split()[1:4]])
  elif line.startswith('f '):
   ids=[int(x.split('/')[0])-1 for x in line.split()[1:]]
   for i in range(1,len(ids)-1):ff.append([ids[0],ids[i],ids[i+1]])
 v=np.array(vv)[:,[0,2,1]]/1000;v[:,1]-=.78;v[:,2]=-v[:,2]-.1;return fj,v,np.array(ff)
skeleton=[group('skin',[obj(x)for x in parts['FMA7163']],.005,source='BodyParts3D 4.0'),group('bones',[obj(x)for x in parts['FMA23881']],.0022,source='BodyParts3D 4.0')]
m={'version':1,'source':'HRA v1.2 and BodyParts3D 4.0','license':'CC BY 4.0','body':write('reference-body.glb',body),'skeleton':write('reference-skeleton.glb',skeleton),'uterus':write('reference-uterus.glb',uterus),'lymph':write('reference-lymph.glb',lymph)};(OUT/'manifest.json').write_text(json.dumps(m,indent=2))
w,h=600,1120;im=Image.new('RGB',(w,h),'#0b211e');draw=ImageDraw.Draw(im);light=np.array([-.5,.7,1]);light/=np.linalg.norm(light)
for skin in [True,False]:
 tri=[]
 for r,v,f,n in body:
  if (r['key']=='skin')!=skin:continue
  pts=np.stack([w/2+v[:,0]*h*.51,h*.51-v[:,1]*h*.51],axis=1);color=np.array([int(PALETTE[r['key']][i:i+2],16)for i in [0,2,4]])
  for face in f:
   nn=n[face].mean(0)
   if nn[2]<-.1:continue
   c=(color*(.36+.64*max(0,float(nn@light)))).clip(0,255)
   if skin:c=c*.45+np.array([11,33,30])*.55
   tri.append((float(v[face,2].mean()),pts[face],tuple(c.astype(int))))
 tri.sort(key=lambda t:t[0])
 for _,p,c in tri:draw.polygon([tuple(x)for x in p],fill=c)
im.save(OUT/'reference-body.webp',quality=90);print('Reference poster ready.',flush=True)
