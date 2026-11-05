import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

let clayTexture,clayRoughness,woodNormal,woodRoughness,beamTexture;
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

/** Soft kneaded grain, with thumbprint swirls and hand-worked clay relief. */
export function makeClayTexture(){
 if(clayTexture)return clayTexture;
 const size=256,data=new Uint8Array(size*size*4);
 const field=(x,y)=>Math.sin(x*.083+Math.cos(y*.061))*Math.cos(y*.097-x*.023);
 const swirl=(x,y)=>Math.sin(x*.037-y*.041+Math.sin(x*.019+y*.023)*1.6);
 let seed=4719;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=(x-size*.47)/size,dy=(y-size*.54)/size;
  const dx2=(x-size*.22)/size,dy2=(y-size*.28)/size;
  const fingerprint=Math.sin(Math.hypot(dx,dy)*size*.58+Math.sin(dy*9))*1.45+Math.sin(Math.hypot(dx2,dy2)*size*.52)*1.05;
  const value=Math.max(40,Math.min(220,Math.round(128+field(x,y)*15+swirl(x,y)*8+field(x*2.4,y*2.4)*3.5+(random()-.5)*5+fingerprint)));
  const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 clayTexture=new THREE.DataTexture(data,size,size);clayTexture.name='Plasticina: grão amassado e marcas suaves';
 clayTexture.wrapS=clayTexture.wrapT=THREE.RepeatWrapping;clayTexture.repeat.set(2,2);clayTexture.needsUpdate=true;
 return clayTexture;
}

/** Subtle matte/satin roughness variation where fingers smoothed the plasticine. */
export function makeClayRoughnessMap(){
 if(clayRoughness)return clayRoughness;
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
  const smudge=Math.sin(u*2+Math.cos(v*3))*18+Math.cos(v*4-u)*11+Math.sin((u+v)*5)*6;
  const value=Math.max(168,Math.min(246,Math.round(214+smudge)));
  const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 clayRoughness=new THREE.DataTexture(data,size,size);clayRoughness.name='Plasticina: variação de brilho manual';
 clayRoughness.wrapS=clayRoughness.wrapT=THREE.RepeatWrapping;clayRoughness.repeat.set(2,2);clayRoughness.needsUpdate=true;
 return clayRoughness;
}

/** Procedural carved wood-grain normal & roughness maps for plinths, crosses, boats, tables and beams. */
export function makeWoodNormalMap(){
 if(woodNormal)return woodNormal;
 const size=256,data=new Uint8Array(size*size*4);
 const heightAt=(x,y)=>{
  const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
  const knot=Math.exp(-(((x-size*.62)/26)**2+((y-size*.38)/54)**2))*3.4;
  const grain=Math.sin(u*14+Math.sin(v*2)*1.8+knot)*.62+Math.sin(u*31+Math.cos(v*3)*.9)*.26+Math.sin(u*5+v)*0.22;
  return grain;
 };
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const hL=heightAt((x-1+size)%size,y),hR=heightAt((x+1)%size,y);
  const hD=heightAt(x,(y-1+size)%size),hU=heightAt(x,(y+1)%size);
  const nx=(hL-hR)*1.35,ny=(hD-hU)*1.35,nz=1;
  const len=Math.hypot(nx,ny,nz)||1,i=(y*size+x)*4;
  data[i]=Math.round((nx/len*.5+.5)*255);
  data[i+1]=Math.round((ny/len*.5+.5)*255);
  data[i+2]=Math.round((nz/len*.5+.5)*255);
  data[i+3]=255;
 }
 woodNormal=new THREE.DataTexture(data,size,size);woodNormal.name='Madeira entalhada: veios em relevo';
 woodNormal.wrapS=woodNormal.wrapT=THREE.RepeatWrapping;woodNormal.repeat.set(2,2);woodNormal.needsUpdate=true;
 return woodNormal;
}

export function makeWoodRoughnessMap(){
 if(woodRoughness)return woodRoughness;
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
  const grain=Math.sin(u*14+Math.sin(v*2)*1.6)*22+Math.cos(u*29)*10;
  const value=Math.max(145,Math.min(242,Math.round(198+grain)));
  const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 woodRoughness=new THREE.DataTexture(data,size,size);woodRoughness.name='Madeira entalhada: rugosidade dos veios';
 woodRoughness.wrapS=woodRoughness.wrapT=THREE.RepeatWrapping;woodRoughness.repeat.set(2,2);woodRoughness.needsUpdate=true;
 return woodRoughness;
}

export function clayColor(value){
 const color=new THREE.Color(value),luma=.2126*color.r+.7152*color.g+.0722*color.b;
 // Keep dark eyes/hair and skin diversity, with restrained warm stop-motion midtones.
 if(luma>.055)color.lerp(warmPaper,.05);
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
   const amount=1+.048*Math.sin(x/r*3.1+y/r*1.7)*Math.cos(z/r*2.8-y/r*.9)+.02*Math.sin(z/r*5.2-x/r*2.4);
   a.setXYZ(i,x*amount,y*amount,z*amount);
  }
  const normals=result.attributes.normal;
  for(let i=0;i<a.count;i++){
   const x=a.getX(i),y=a.getY(i),z=a.getZ(i),length=Math.hypot(x,y,z)||1;
   normals.setXYZ(i,x/length,y/length,z/length);
  }
  normals.needsUpdate=true;
 }
 result.name='Forma arredondada de massinha';cache.set(key,result);return result;
}

/** Irregular hand-molded stone block with welded normals for stacked masonry walls and altars. */
export function clayStoneBlockGeometry(variant=0,cache){
 const key=`clayStoneBlock:${variant}`;
 if(cache?.has(key))return cache.get(key);
 const geometry=new RoundedBoxGeometry(1,.62,.78,3,.19),p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const warp=1+.11*Math.sin(x*4.1+variant*2.3)*Math.cos(z*3.4-y*2.2);
  p.setXYZ(
   i,
   x*warp+y*.09*Math.sin(variant+1.2),
   y*(1+.12*Math.cos(x*3.2+z*3.8+variant)),
   z*(1+.07*Math.sin(x*3.5+variant))
  );
 }
 geometry.computeVertexNormals();
 const normal=geometry.attributes.normal,sums=new Map(),keys=[];
 for(let i=0;i<p.count;i++){
  const k=[p.getX(i),p.getY(i),p.getZ(i)].map(n=>Math.round(n*1e5)).join(',');keys.push(k);
  if(!sums.has(k))sums.set(k,new THREE.Vector3());
  sums.get(k).add(new THREE.Vector3().fromBufferAttribute(normal,i));
 }
 for(const sum of sums.values())sum.normalize();
 for(let i=0;i<p.count;i++){const n=sums.get(keys[i]);normal.setXYZ(i,n.x,n.y,n.z);}
 normal.needsUpdate=true;geometry.name='Bloco de pedra irregular de massinha';
 cache?.set(key,geometry);return geometry;
}

export function clayPlinth(radius,height){
 const edge=Math.min(.15,height*.28),half=height/2;
 // Turned dark wood molding profile for the main diorama base, smooth rounded lip for thin layers.
 const profile=height>=.4&&radius>=5.9?[
  [0,-half],
  [radius-edge,-half],
  [radius-.02,-half+edge*.38],
  [radius,-half+edge*.85],
  [radius-.038,-half+height*.34],
  [radius-.012,-half+height*.52],
  [radius-.034,half-height*.28],
  [radius,half-edge*.82],
  [radius-.025,half-edge*.38],
  [radius-edge,half],
  [0,half],
 ]:[
  [0,-half],[radius-edge,-half],[radius-.025,-half+edge*.45],[radius,-half+edge],[radius,half-edge],[radius-.025,half-edge*.45],[radius-edge,half],[0,half]
 ];
 const geometry=new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),96);
 geometry.name='Base torneada de massinha';return geometry;
}
