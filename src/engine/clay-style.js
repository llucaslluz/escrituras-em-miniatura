import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

let clayTexture,beamTexture;
const warmPaper=new THREE.Color('#f3dfcd');
const waterRestPositions=new WeakMap();

/** Fit a horizontal surface to the plinth without accumulating deformation.
 * The offset is the water group's translation, including scripted sea parting.
 * Keeping the original XZ coordinates also makes seeking/replay reversible.
 */
export function clipWaterToPlinth(geometry,x=0,z=0,radius=5.84){
 const position=geometry.attributes.position;
 if(!waterRestPositions.has(geometry))waterRestPositions.set(geometry,new Float32Array(position.array));
 const rest=waterRestPositions.get(geometry);
 for(let i=0;i<position.count;i++){
  const wx=rest[i*3]+x,wz=rest[i*3+2]+z,distance=Math.hypot(wx,wz),scale=distance>radius?radius/distance:1;
  position.setX(i,wx*scale-x);position.setZ(i,wz*scale-z);
 }
 position.needsUpdate=true;geometry.boundingBox=geometry.boundingSphere=null;
 geometry.userData.clayWaterSurface=true;geometry.userData.plinthRadius=radius;
 return geometry;
}

/** Soft kneaded grain, with faint thumbprint curves instead of textile fibres. */
export function makeClayTexture(){
 if(clayTexture)return clayTexture;
 const size=256,data=new Uint8Array(size*size*4);
 const field=(x,y)=>Math.sin(x*.083+Math.cos(y*.061))*Math.cos(y*.097-x*.023);
 let seed=4719;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=(x-size*.47)/size,dy=(y-size*.54)/size;
  const fingerprint=Math.sin(Math.hypot(dx,dy)*size*.58+Math.sin(dy*9))*.8;
  const value=128+field(x,y)*12+field(x*2.6,y*2.6)*3+(random()-.5)*6+fingerprint;
  const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 clayTexture=new THREE.DataTexture(data,size,size);clayTexture.name='Plasticina: grão amassado e marcas suaves';
 clayTexture.wrapS=clayTexture.wrapT=THREE.RepeatWrapping;clayTexture.repeat.set(2,2);clayTexture.needsUpdate=true;
 return clayTexture;
}

export function clayColor(value){
 const color=new THREE.Color(value),luma=.2126*color.r+.7152*color.g+.0722*color.b;
 // Keep dark eyes/hair and skin diversity, with restrained pastel midtones.
 if(luma>.055)color.lerp(warmPaper,.065);
 return color;
}

export function clayBeamTexture(){
 if(beamTexture)return beamTexture;
 const width=64,height=128,data=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const u=x/(width-1),v=y/(height-1);
  const edge=Math.exp(-Math.pow((u-.5)/.23,2));
  const fade=Math.pow(Math.sin(v*Math.PI),.55);
  const value=Math.round(255*edge*fade),i=(y*width+x)*4;
  data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 beamTexture=new THREE.DataTexture(data,width,height);beamTexture.needsUpdate=true;return beamTexture;
}

/** Round authored boxes and stone polyhedra without changing their dimensions. */
export function clayGeometry(geometry,cache){
 const p=geometry.parameters;if(!p||!['BoxGeometry','DodecahedronGeometry'].includes(geometry.type))return geometry;
 const key=geometry.type+JSON.stringify(p);if(cache.has(key))return cache.get(key);
 let result;
 if(geometry.type==='BoxGeometry'){
  const small=Math.min(p.width,p.height,p.depth),radius=Math.min(small*.14,.14);
  result=new RoundedBoxGeometry(p.width,p.height,p.depth,small>.32?2:1,radius);
 }else{
  result=new THREE.IcosahedronGeometry(p.radius,2);const a=result.attributes.position;
  for(let i=0;i<a.count;i++){
   const x=a.getX(i),y=a.getY(i),z=a.getZ(i),r=p.radius||1;
   const amount=1+.038*Math.sin(x/r*3.1+y/r*1.7)*Math.cos(z/r*2.8-y/r*.9);
   a.setXYZ(i,x*amount,y*amount,z*amount);
  }
  // PolyhedronGeometry is non-indexed. Computing face normals would turn the
  // soft stones into low-poly facets; keep a smooth radial clay surface.
  const normals=result.attributes.normal;
  for(let i=0;i<a.count;i++){
   const x=a.getX(i),y=a.getY(i),z=a.getZ(i),length=Math.hypot(x,y,z)||1;
   normals.setXYZ(i,x/length,y/length,z/length);
  }
  normals.needsUpdate=true;
 }
 result.name='Forma arredondada de massinha';cache.set(key,result);return result;
}

export function clayPlinth(radius,height){
 const edge=Math.min(.15,height*.28),half=height/2;
 const profile=[[0,-half],[radius-edge,-half],[radius-.025,-half+edge*.45],[radius,-half+edge],[radius,half-edge],[radius-.025,half-edge*.45],[radius-edge,half],[0,half]];
 const geometry=new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),96);
 geometry.name='Base de massinha com borda boleada';return geometry;
}
