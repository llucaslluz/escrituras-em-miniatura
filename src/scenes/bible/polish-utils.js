import * as THREE from 'three';
import {applyGroundedGait} from '../../engine/clay-gait.js';

const PI=Math.PI,clamp=THREE.MathUtils.clamp,mix=THREE.MathUtils.lerp;
export const smooth=(t,a,b)=>{const q=clamp((t-a)/(b-a),0,1);return q*q*(3-2*q)};
export const motion=(t,a,b)=>{const q=clamp((t-a)/(b-a),0,1);return Math.sin(q*PI)**2};

// Materials are cloned once per revealed prop/figure, never once per frame.
export function fadeFigure(root){
 const materials=new Map();
 root.traverse(o=>{
  if(!o.material)return;
  const original=o.material;
  if(!materials.has(original)){const material=original.clone();material.transparent=true;materials.set(original,{material,opacity:original.opacity,depthWrite:original.depthWrite,transparent:original.transparent});}
  o.material=materials.get(original).material;
 });
 return amount=>{root.visible=amount>0;for(const {material,opacity,depthWrite,transparent}of materials.values()){
   const complete=amount>=1,nextTransparent=transparent||!complete;
   if(material.transparent!==nextTransparent){material.transparent=nextTransparent;material.needsUpdate=true;}
   material.opacity=opacity*amount;material.depthWrite=depthWrite&&complete;
  }};
}
export function timedReveal(k,root,start,end,outStart=Infinity,outEnd=Infinity){
 const fade=fadeFigure(root);
 k.animate(t=>fade((start<=0?1:smooth(t,start,end))*(Number.isFinite(outStart)?1-smooth(t,outStart,outEnd):1)));
 return fade;
}

// Distance, rather than a wall-clock sine, sets the support/swing cycle.
export function pacedSteps(rig,distance,amount=1){
 applyGroundedGait(rig,distance,{envelope:amount,arms:false});
}

export function animalSteps(root,distance,amount){
 const phase=distance/Math.max(.2,.55*root.scale.x);
 root.userData.paws?.forEach((paw,i)=>{
  const swing=Math.sin(phase*PI*2+(i===0||i===3?0:PI));
  const angle=swing*.23*amount;paw.rotation.x=angle;
  const c=Math.cos(angle),s=Math.sin(angle);
  const shank=.22*c-Math.hypot(.23*c,.11*s),toe=.085*c-.045*s-Math.hypot(.09*c,.17*s);
  const hoof=root.userData.clayCreature==='donkey'?.045*c-.06*s-Math.hypot(.045*c,.14*s):Infinity;
  paw.position.y=.005-Math.min(shank,toe,hoof)+Math.max(0,swing)*.025*amount;
 });
}

const bounds=new THREE.Box3();
export function restOn(root,height=0){
 root.updateWorldMatrix(true,true);bounds.setFromObject(root,true);
 root.position.y+=height-bounds.min.y;
}
export function connectStream(stream,from,to,authoredLength){
 const delta=new THREE.Vector3().subVectors(to,from),length=delta.length();
 stream.position.copy(from).add(to).multiplyScalar(.5);stream.scale.y=Math.max(.001,length)/authoredLength;
 stream.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
}
