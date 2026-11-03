import * as THREE from 'three';
import {applyGroundedGait,gaitEnvelope} from '../engine/clay-gait.js';

export const transition=(t,a,b)=>{const u=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return u*u*(3-2*u);};

// Isolate a revelation's opacity from the materials shared by other actors.
// Geometry, hierarchy, selection and authored scale remain untouched.
export function reveal(k,root,amount){
 const copies=new Map(),materials=[];
 root.traverse(o=>{if(!o.material)return;const clone=m=>{if(!copies.has(m)){const c=m.clone();copies.set(m,c);materials.push({material:c,opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite});}return copies.get(m);};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);});
 k.animate(t=>{const v=THREE.MathUtils.clamp(amount(t),0,1);root.visible=v>0;for(const{material,opacity,transparent,depthWrite}of materials){material.opacity=opacity*v;material.transparent=transparent||v<1;material.depthWrite=depthWrite&&v===1;}});
}

// Correct only the robe and feet: preserve root/head/hand authored locations,
// especially ordination reaches and kneeling props. Plane is scene-local y.
export function groundFigure(rig,floor=0){
 const scale=Math.abs(rig.root.scale.y)||1,plane=(floor-rig.root.position.y)/scale;
 if(!rig.robe.geometry.boundingBox)rig.robe.geometry.computeBoundingBox();
 rig.robe.position.y=Math.max(0,plane-rig.robe.geometry.boundingBox.min.y);
 for(const leg of[rig.leftLeg,rig.rightLeg]){
  const c=Math.cos(leg.rotation.x),s=Math.sin(leg.rotation.x);
  leg.position.y=plane+.365*c+.061*s+Math.hypot(.0516*c,.15*s);
 }
}

export function distanceGait(rig,distance,fraction){
 const u=THREE.MathUtils.clamp(fraction,0,1),p=u*u*(3-2*u);
 groundFigure(rig,rig.root.position.y);
 applyGroundedGait(rig,distance*p,{envelope:gaitEnvelope(u),arms:false});
}
