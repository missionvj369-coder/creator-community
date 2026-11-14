import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as T from '../public/vendor/three/three.module.js';
import {BODY_PROCESSES,processFor,processStepAt} from '../public/js/body-processes.js';
import {ANATOMY_TARGETS} from '../public/js/body-viewer.js';
import {CanvasAnatomyRenderer} from '../public/js/body-software.js';

const manifest=JSON.parse(fs.readFileSync('public/anatomy/manifest.json'));
for(const type of ['body','skeleton','uterus','lymph']){
 const e=manifest[type];
 for(const lite of [false,true]){
  const file=lite?e.softwareFile:e.file,b=fs.readFileSync(`public${file}`);
  assert.equal(b.length,lite?e.softwareBytes:e.bytes);assert.ok(b.length<25*1024*1024);
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),lite?e.softwareSha256:e.sha256);
  assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
  const size=b.readUInt32LE(12),d=JSON.parse(b.subarray(20,20+size)),bin=b.subarray(28+size);let triangles=0;
  const read=i=>{const a=d.accessors[i],v=d.bufferViews[a.bufferView],offset=bin.byteOffset+v.byteOffset+(a.byteOffset||0);return a.componentType===5126?new Float32Array(bin.buffer,offset,a.count*3):new Uint32Array(bin.buffer,offset,a.count);};
  for(const node of d.nodes){assert.ok(e.structures.some(s=>s.key===node.extras.key));for(const p of d.meshes[node.mesh].primitives){const pos=read(p.attributes.POSITION),normal=read(p.attributes.NORMAL),indices=read(p.indices);assert.equal(pos.length,normal.length);assert.equal(indices.length%3,0);for(const value of pos)assert.ok(Number.isFinite(value));for(const value of normal)assert.ok(Number.isFinite(value));for(const i of indices)assert.ok(i<pos.length/3);triangles+=indices.length/3;}}
  if(lite){assert.equal(triangles,e.softwareTriangles);assert.ok(triangles<180000);}
 }
}
const organs=new Set(Object.values(manifest).flatMap(x=>x.structures?.map(s=>s.key)||[]));
for(const [kind,targets] of Object.entries(ANATOMY_TARGETS)){assert.ok(BODY_PROCESSES[kind]);for(const target of targets)assert.ok(organs.has(target),target);}
assert.equal(Object.keys(BODY_PROCESSES).length,38);
for(const [kind,spec] of Object.entries(BODY_PROCESSES)){assert.ok(spec.steps.length>=3&&spec.steps.length<=4);for(const step of spec.steps){assert.ok(step.label.length>3);assert.ok(step.text.length>30);}assert.equal(processFor(kind),spec);assert.equal(processStepAt(-5,spec.steps.length),0);assert.equal(processStepAt(6,spec.steps.length),1);assert.equal(processStepAt(999,spec.steps.length),spec.steps.length-1);}

// Check the no-WebGL path with real camera and mesh math: it must draw actual
// geometry, and a cross-section must remove the correct half of that geometry.
const paths=[],gradients=[];let path=[];
const context={createLinearGradient(...points){assert.ok(points.every(Number.isFinite));const stops=[];gradients.push(stops);return {addColorStop(position,color){stops.push({position,color});}};},setTransform(){},clearRect(){},beginPath(){path=[];},moveTo(x,y){path.push([x,y]);},lineTo(x,y){path.push([x,y]);},closePath(){},fill(){paths.push(path);}};
globalThis.document={createElement:()=>({getContext:()=>context})};
const renderer=new CanvasAnatomyRenderer();renderer.setSize(200,200);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(45,1,.01,10);camera.position.z=3;
const mesh=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshStandardMaterial({color:'#be9c80',side:T.DoubleSide}));scene.add(mesh);mesh.geometry.attributes.normal.setXYZ(0,1,0,0);
renderer.render(scene,camera);assert.equal(paths.length,2);assert.ok(gradients.length>0);assert.equal(gradients[0].length,2);const fullMin=Math.min(...paths.flat().map(p=>p[0]));paths.length=0;
mesh.material.clippingPlanes=[new T.Plane(new T.Vector3(1,0,0),0)];renderer.render(scene,camera);assert.ok(paths.length>0);assert.ok(Math.min(...paths.flat().map(p=>p[0]))>fullMin+10);assert.ok(paths.flat().every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)));
renderer.dispose();delete globalThis.document;
console.log('anatomy: 8 reference GLBs, hashes, finite geometry, indices, model targets, 38 function sequences and software projection/cross-sections passed');
