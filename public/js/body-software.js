import {Matrix4,Matrix3,Vector3,FrontSide} from '../vendor/three/three.module.js';

// A geometry renderer for devices without WebGL. It uses the same reference
// surfaces, camera, clipping planes and orbit controls as the GPU presentation.
export class CanvasAnatomyRenderer {
 constructor(){this.software=true;this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d',{alpha:true});if(!this.ctx)throw Error('Canvas is unavailable');this.ratio=1;this.width=1;this.height=1;}
 setPixelRatio(value){this.ratio=Math.min(1.25,value);}
 setSize(w,h){this.width=w;this.height=h;this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio);}
 render(scene,camera){
  const ctx=this.ctx,w=this.width,h=this.height;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.clearRect(0,0,w,h);scene.updateMatrixWorld();camera.updateMatrixWorld();
  const vp=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),light=new Vector3(-.45,.65,1).normalize(),faces=[];
  scene.traverseVisible(mesh=>{
   if(!mesh.isMesh)return;const material=mesh.material;if(material.opacity<.005)return;
   const geometry=mesh.geometry,position=geometry.attributes.position,normal=geometry.attributes.normal,index=geometry.index;if(!position||!index)return;
   const mvp=new Matrix4().multiplyMatrices(vp,mesh.matrixWorld),nm=new Matrix3().getNormalMatrix(mesh.matrixWorld),projected=new Float32Array(position.count*3),brightness=new Float32Array(position.count),world=material.clippingPlanes?.length?new Float32Array(position.count*3):null;
   const p=new Vector3(),n=new Vector3();
   for(let i=0;i<position.count;i++){p.fromBufferAttribute(position,i).applyMatrix4(mvp);projected[i*3]=(p.x*.5+.5)*w;projected[i*3+1]=(-p.y*.5+.5)*h;projected[i*3+2]=p.z;n.fromBufferAttribute(normal,i).applyMatrix3(nm).normalize();brightness[i]=.40+.54*Math.max(0,n.dot(light))+.12*Math.pow(Math.max(0,n.z),12);if(world){p.fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld);p.toArray(world,i*3);}}
   const color=material.color.clone().convertLinearToSRGB();
   for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2),ids=[a,b,c];let points=ids.map(id=>[projected[id*3],projected[id*3+1],projected[id*3+2],world?new Vector3().fromArray(world,id*3):null,brightness[id]]);
    if(points.some(p=>p[2]<-1||p[2]>1))continue;
    const area=(points[1][0]-points[0][0])*(points[2][1]-points[0][1])-(points[1][1]-points[0][1])*(points[2][0]-points[0][0]);if(material.side===FrontSide&&area>=0)continue;if(Math.abs(area)<.015)continue;
    for(const plane of material.clippingPlanes||[]){const clipped=[];for(let j=0;j<points.length;j++){const x=points[j],y=points[(j+1)%points.length],dx=plane.distanceToPoint(x[3]),dy=plane.distanceToPoint(y[3]);if(dx>=0)clipped.push(x);if((dx>=0)!==(dy>=0)){const t=dx/(dx-dy);clipped.push([x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t,x[3].clone().lerp(y[3],t),x[4]+(y[4]-x[4])*t]);}}points=clipped;if(points.length<3)break;}
    if(points.length<3)continue;const shade=(brightness[a]+brightness[b]+brightness[c])/3;faces.push({points,color,area:Math.abs(area),z:points.reduce((s,p)=>s+p[2],0)/points.length,fill:`rgb(${Math.min(255,Math.round(color.r*shade*255))},${Math.min(255,Math.round(color.g*shade*255))},${Math.min(255,Math.round(color.b*shade*255))})`,alpha:material.opacity});
   }
  });
  faces.sort((a,b)=>b.z-a.z);
  for(const face of faces){ctx.globalAlpha=face.alpha;ctx.fillStyle=face.fill;
   // Gouraud light interpolation keeps large smooth surfaces from looking
   // faceted in the software renderer. Tiny faces use their average light.
   if(face.area>18&&ctx.createLinearGradient){const [a,b,c]=face.points,lo=Math.min(a[4],b[4],c[4]),hi=Math.max(a[4],b[4],c[4]);if(hi-lo>.045){const det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(det)>.001){const gx=((b[4]-a[4])*(c[1]-a[1])-(c[4]-a[4])*(b[1]-a[1]))/det,gy=((b[0]-a[0])*(c[4]-a[4])-(c[0]-a[0])*(b[4]-a[4]))/det,norm=gx*gx+gy*gy,start=[a,b,c].find(p=>p[4]===lo),scale=(hi-lo)/norm,gradient=ctx.createLinearGradient(start[0],start[1],start[0]+gx*scale,start[1]+gy*scale),rgb=v=>`rgb(${Math.min(255,Math.round(face.color.r*v*255))},${Math.min(255,Math.round(face.color.g*v*255))},${Math.min(255,Math.round(face.color.b*v*255))})`;gradient.addColorStop(0,rgb(lo));gradient.addColorStop(1,rgb(hi));ctx.fillStyle=gradient;}}}
   ctx.beginPath();ctx.moveTo(face.points[0][0],face.points[0][1]);for(let i=1;i<face.points.length;i++)ctx.lineTo(face.points[i][0],face.points[i][1]);ctx.closePath();ctx.fill();}
  ctx.globalAlpha=1;
 }
 dispose(){this.ctx.clearRect(0,0,this.domElement.width,this.domElement.height);}
}
