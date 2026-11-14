import fs from 'node:fs';
import crypto from 'node:crypto';
import {MeshoptSimplifier} from './vendor/meshoptimizer/meshopt_simplifier.js';

// Preserve the registered reference coordinates. Only surface density changes.
await MeshoptSimplifier.ready;
const manifest=JSON.parse(fs.readFileSync('public/anatomy/manifest.json','utf8'));
for(const type of ['body','skeleton','uterus','lymph']){
 const entry=manifest[type],input=fs.readFileSync(`public${entry.file}`);
 const jsonLength=input.readUInt32LE(12),doc=JSON.parse(input.subarray(20,20+jsonLength));
 const binary=input.subarray(28+jsonLength),chunks=[];let length=0,total=0;
 const views=[],accessors=[];
 function read(index){const a=doc.accessors[index],v=doc.bufferViews[a.bufferView],offset=v.byteOffset+(a.byteOffset||0),components=a.type==='VEC3'?3:1;return a.componentType===5126?new Float32Array(binary.buffer,binary.byteOffset+offset,a.count*components).slice():new Uint32Array(binary.buffer,binary.byteOffset+offset,a.count).slice();}
 function add(array,type,target,bounds=false){const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),view=views.length;views.push({buffer:0,byteOffset:length,byteLength:bytes.length,target});chunks.push(bytes);length+=bytes.length;const a={bufferView:view,componentType:array instanceof Float32Array?5126:5125,count:array.length/(type==='VEC3'?3:1),type};if(bounds){a.min=[Infinity,Infinity,Infinity];a.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<array.length;i++){const k=i%3;a.min[k]=Math.min(a.min[k],array[i]);a.max[k]=Math.max(a.max[k],array[i]);}}accessors.push(a);return accessors.length-1;}
 for(const node of doc.nodes){if(node.mesh===undefined)continue;const mesh=doc.meshes[node.mesh],key=node.extras.key;
  for(const p of mesh.primitives){const positions=read(p.attributes.POSITION),normals=read(p.attributes.NORMAL),indices=read(p.indices),original=indices.length/3;
   const budget={skin:12000,brain:16000,lungs:8000,kidneys:5000,gut:9000,colon:8000,liver:5000,pancreas:3000,ureters:2000,bladder:2500,spinal:2000,eyes:3000,spleen:2500,thymus:700,bones:18000,uterus:6000,lymph:6000};
   const target=Math.min(original,budget[key]||Math.max(key==='heart'?250:80,Math.min(key==='heart'?10000:1600,Math.round(original*(key==='heart'?.35:.08)))));
   let [result]=MeshoptSimplifier.simplify(indices,positions,3,target*3,.035);
   if(result.length>target*3*1.8)[result]=MeshoptSimplifier.simplifySloppy(indices,positions,3,null,target*3,.06);
   const ids=new Map(),vertices=[],normalData=[],out=new Uint32Array(result.length);
   for(let i=0;i<result.length;i++){const old=result[i];if(!ids.has(old)){ids.set(old,ids.size);vertices.push(...positions.subarray(old*3,old*3+3));normalData.push(...normals.subarray(old*3,old*3+3));}out[i]=ids.get(old);}
   p.attributes.POSITION=add(new Float32Array(vertices),'VEC3',34962,true);p.attributes.NORMAL=add(new Float32Array(normalData),'VEC3',34962);p.indices=add(out,'SCALAR',34963);total+=out.length/3;
   node.extras.softwareTriangles=out.length/3;
  }
 }
 doc.bufferViews=views;doc.accessors=accessors;doc.buffers=[{byteLength:length}];doc.asset.generator+=' · meshoptimizer 1.3.0 lightweight surface';
 let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const bin=Buffer.concat(chunks),header=Buffer.alloc(20),binHeader=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);binHeader.writeUInt32LE(bin.length);binHeader.writeUInt32LE(0x004e4942,4);
 const output=Buffer.concat([header,json,binHeader,bin]),file=entry.file.replace('.glb','-lite.glb');fs.writeFileSync(`public${file}`,output);Object.assign(entry,{softwareFile:file,softwareBytes:output.length,softwareSha256:crypto.createHash('sha256').update(output).digest('hex'),softwareTriangles:total});console.log(type,output.length,total);
}
fs.writeFileSync('public/anatomy/manifest.json',JSON.stringify(manifest,null,2)+'\n');
