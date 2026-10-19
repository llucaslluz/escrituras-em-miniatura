import * as THREE from 'three';

export { THREE };
export const clamp = x => Math.max(0, Math.min(1, x));
export const ease = (a, b, t) => { const u = clamp((t - a) / (b - a)); return u * u * (3 - 2 * u); };
export const mix = (a, b, u) => a + (b - a) * u;
export const colors = ['#b98d68', '#7b8a71', '#d2ba88', '#a97860', '#889da0', '#e0d5b1'];

export function beam(k, from, to, radius = .04, color = '#8a6948', parent = k.group) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), delta = b.clone().sub(a);
  const mesh = k.mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 8), k.mat(color), 0, 0, 0, parent);
  mesh.position.copy(a.add(b).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return mesh;
}

export function tent(k, x, z, color = '#b8946b', size = 1, rotation = 0) {
  const g = k.groupAt(x, 0, z); g.scale.setScalar(size); g.rotation.y = rotation;
  const points = new Float32Array([-1,0,-.8, 0,1.55,-.8, -1,0,.8, 0,1.55,-.8, 0,1.55,.8, -1,0,.8,
    0,1.55,-.8, 1,0,-.8, 0,1.55,.8, 1,0,-.8, 1,0,.8, 0,1.55,.8,
    -1,0,-.8, 1,0,-.8, 0,1.55,-.8]);
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(points, 3)); geometry.computeVertexNormals();
  const cloth = k.mesh(geometry, k.mat(color, { side: THREE.DoubleSide }), 0, .02, 0, g);
  beam(k, [0,0,.82], [0,1.58,.82], .035, '#745337', g);
  beam(k, [0,1.58,-.8], [0,1.58,.85], .045, '#745337', g);
  for (const side of [-1,1]) {
    beam(k, [side*.96,.07,.72], [side*1.4,0,1.15], .014, '#d4c19a', g);
    beam(k, [side*1.4,0,1.15], [side*1.4,.16,1.15], .025, '#795338', g);
  }
  const base = new Float32Array(points);
  k.ambient(t => { const p = geometry.attributes.position; for(let i=0;i<p.count;i++)p.setY(i,base[i*3+1]+Math.sin(t*1.7+base[i*3+2]*3)*.012*Math.abs(base[i*3])); p.needsUpdate=true; geometry.computeVertexNormals(); });
  return g;
}

export function bag(k, x, y, z, color = '#a58b60', parent = k.group) {
  const mesh = k.mesh(new THREE.SphereGeometry(.22, 12, 10), k.mat(color), x, y+.2, z, parent); mesh.scale.set(1,1.2,.8);
  const knot = k.mesh(new THREE.TorusGeometry(.07,.018,5,14),k.mat('#e7d7af'),x,y+.41,z,parent); knot.rotation.x=Math.PI/2;
  return mesh;
}

export function masonry(k, x, z, width = 7, height = 2.5, depth = .8) {
  const g = k.groupAt(x,0,z), rows = Math.ceil(height/.4), cols = Math.ceil(width/.75);
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const xx=(c-(cols-1)/2)*.74+(r%2)*.12;
    k.mesh(new THREE.BoxGeometry(.71,.37,depth),k.mat(['#b39a77','#bda583','#aa9272'][(r+c)%3]),xx,.2+r*.39,0,g);
  }
  for(let c=0;c<cols;c+=2)k.mesh(new THREE.BoxGeometry(.6,.45,depth+.05),k.mat('#c5af8c'),(c-(cols-1)/2)*.74,rows*.39+.23,0,g);
  return g;
}

export function palmBank(k, positions) { positions.forEach(([x,z,s]) => k.tree(x,z,s??1,'palm')); }
export function grass(k, x, z, size = 1, color = '#849064') {
  for(let i=0;i<5;i++) { const blade=k.box(.035,.2*size,.02,color,x+(i-2)*.048,.1*size,z+Math.sin(i)*.04); blade.rotation.z=(i-2)*.15; }
}
export function prayer(rig, amount = 1) {
  rig.leftArm.rotation.z=-.6*amount; rig.rightArm.rotation.z=.6*amount;
  rig.leftForearm.rotation.x=-1.2*amount; rig.rightForearm.rotation.x=-1.2*amount;
  rig.head.rotation.x=.18*amount;
}
export function teaching(rig, t, amount = 1) {
  rig.rightArm.rotation.z=(1.25+Math.sin(t*1.6)*.12)*amount;
  rig.rightForearm.rotation.x=-.55*amount;
  rig.leftArm.rotation.z=-.25*amount;
  rig.head.rotation.y=Math.sin(t*.55)*.16;
}
export function kneel(rig, u, baseY = 0) {
  rig.root.position.y=baseY-.18*u;
  rig.leftLeg.rotation.x=-1.25*u; rig.rightLeg.rotation.x=-1.25*u;
  rig.root.rotation.x=.12*u;
}
export function thought(rig, t, phase = 0) { rig.head.rotation.y=Math.sin(t*.45+phase)*.12; rig.leftForearm.rotation.x=-.12-.09*Math.sin(t*.7+phase); }
// Two articulated segments target an actual world-space point. The hand stays
// on a head, shoulder or prop instead of gesturing vaguely beside it.
export function reach(rig, side, target, amount = 1) {
  const arm=side==='left'?rig.leftArm:rig.rightArm,fore=side==='left'?rig.leftForearm:rig.rightForearm;
  rig.root.updateWorldMatrix(true,true);
  const local=rig.root.worldToLocal(target.isVector3?target.clone():new THREE.Vector3(...target));
  const delta=local.sub(arm.position),distance=Math.max(.045,Math.min(.5799,delta.length())),direction=delta.normalize();
  let bend=new THREE.Vector3(0,0,1).addScaledVector(direction,-direction.z);
  if(bend.lengthSq()<.001)bend=new THREE.Vector3(1,0,0).addScaledVector(direction,-direction.x);
  bend.normalize();
  const angle=Math.acos(Math.max(-1,Math.min(1,(.31*.31+distance*distance-.27*.27)/(2*.31*distance))));
  const upper=direction.clone().multiplyScalar(Math.cos(angle)).addScaledVector(bend,Math.sin(angle));
  const lower=direction.clone().multiplyScalar(distance).addScaledVector(upper,-.31).normalize();
  const down=new THREE.Vector3(0,-1,0),upperQ=new THREE.Quaternion().setFromUnitVectors(down,upper);
  const lowerLocal=lower.applyQuaternion(upperQ.clone().invert()),lowerQ=new THREE.Quaternion().setFromUnitVectors(down,lowerLocal);
  arm.quaternion.slerp(upperQ,amount);fore.quaternion.slerp(lowerQ,amount);
}
export function ring(k, x, y, z, radius = .5, color = '#dce5ce') {
  const mesh=k.mesh(new THREE.TorusGeometry(radius,.012,4,40),k.mat(color,{transparent:true,opacity:.55,depthWrite:false}),x,y,z);mesh.rotation.x=-Math.PI/2;return mesh;
}
export function token(k, object, name, role, reference, summary) { k.select(object,name,role,reference,summary);k.label(object,name);return object; }

export function tool(k, parent, type = 'hammer') {
  const g=new THREE.Group();parent.add(g);
  beam(k,[0,-.1,0],[0,.3,0],.025,'#89613d',g);
  if(type==='hammer') k.mesh(new THREE.BoxGeometry(.23,.09,.1),k.mat('#7c7c6f'),0,.29,0,g);
  else k.mesh(new THREE.BoxGeometry(.15,.32,.035),k.mat('#9caa9d',{metalness:.3}),0,.4,0,g);
  return g;
}

export function dust(k, x, z, color = '#e9d5ae') {
  const motes=[];for(let i=0;i<12;i++){const m=k.sphere(.015+(i%3)*.007,color,x+Math.sin(i*2)*1.2,.25+(i%5)*.15,z+Math.cos(i*3)*.8);m.material=k.mat(color,{transparent:true,opacity:.4,depthWrite:false});motes.push(m);}
  k.ambient(t=>motes.forEach((m,i)=>{m.position.x=x+Math.sin(t*.3+i*2)*1.2;m.position.y=.25+(i%5)*.15+Math.sin(t*.8+i)*.05;}));return motes;
}

export function temple(k, x = 0, z = -3.5) {
  const g=k.groupAt(x,0,z);
  for(let i=0;i<3;i++)k.mesh(new THREE.BoxGeometry(4.4-i*.6,.26,2.1-i*.2),k.mat(i%2?'#cbbd97':'#ddd0ac'),0,.13+i*.26,0,g);
  for(const side of[-1,1])for(const zz of[-.65,.65]){
    k.mesh(new THREE.CylinderGeometry(.14,.2,1.6,12),k.mat('#d9c9a3'),side*1.25,1.58,zz,g);
    k.mesh(new THREE.BoxGeometry(.42,.15,.42),k.mat('#c1ab7f'),side*1.25,2.39,zz,g);
  }
  k.mesh(new THREE.BoxGeometry(3.2,.25,1.9),k.mat('#c7b48d'),0,2.6,0,g);
  return g;
}
