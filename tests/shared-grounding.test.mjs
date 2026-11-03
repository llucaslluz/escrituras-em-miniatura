import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {applyGroundedGait} from '../src/engine/clay-gait.js';

function lowestVertex(root){
 root.updateWorldMatrix(true,true);let min=Infinity;
 const vertex=new THREE.Vector3(),instance=new THREE.Matrix4(),world=new THREE.Matrix4();
 root.traverse(mesh=>{
  if(!mesh.geometry)return;
  const positions=mesh.geometry.attributes.position;
  for(let i=0;i<(mesh.isInstancedMesh?mesh.count:1);i++){
   if(mesh.isInstancedMesh){mesh.getMatrixAt(i,instance);world.multiplyMatrices(mesh.matrixWorld,instance);}else world.copy(mesh.matrixWorld);
   for(let j=0;j<positions.count;j++)min=Math.min(min,vertex.fromBufferAttribute(positions,j).applyMatrix4(world).y);
  }
 });return min;
}

test('shared walk keeps boots above support and reproduces a seek without root bob',()=>{
 const kit=new Kit('support-walk'),rig=kit.person('Viajante',0,0);
 kit.walk(rig,[0,0],[0,3],2,10);
 try{
  let highest=0;
  for(let t=0;t<=12;t+=.025){kit.update(t);assert.equal(rig.root.position.y,0);const soles=[rig.leftLeg,rig.rightLeg].map(lowestVertex);assert.ok(soles.every(y=>y>=-.00001&&y<.08),`soles ${soles} at ${t}`);assert.ok(Math.min(...soles)<.012,`one foot supports the body at ${t}`);highest=Math.max(highest,...soles);}
  assert.ok(highest>.055,'the swing foot clears the floor rather than dragging');
  kit.update(5);const pose=[...rig.leftLeg.position.toArray(),rig.leftLeg.rotation.x,rig.root.position.z];
  kit.update(11);kit.update(5);assert.deepEqual([...rig.leftLeg.position.toArray(),rig.leftLeg.rotation.x,rig.root.position.z],pose);
  kit.update(10);assert.equal(rig.leftLeg.rotation.x,0);assert.equal(rig.root.position.z,3);
 }finally{kit.dispose();}
});

test('stance boot centres remain planted in world space while the body advances',()=>{
 const kit=new Kit('planted'),rig=kit.person('Walker',0,0,{scale:.8,rotation:.7});
 try{
  for(const[leg,offset]of[[rig.leftLeg,.25],[rig.rightLeg,.75]]){
   let planted;
   for(const cycle of[.08,.16,.24,.32,.40,.48]){
    const distance=(2+cycle-offset)*.52*.8;
    rig.root.position.set(Math.sin(.7)*distance,0,Math.cos(.7)*distance);
    applyGroundedGait(rig,distance);
    leg.updateWorldMatrix(true,false);
    const centre=new THREE.Vector3(0,-.365,.061).applyMatrix4(leg.matrixWorld);
    if(planted)assert.ok(Math.hypot(centre.x-planted.x,centre.z-planted.z)<1e-8,'stance does not slide horizontally');
    else planted=centre;
    assert.ok(lowestVertex(leg)>=-.00001);
   }
  }
 }finally{kit.dispose();}
});

test('zero-distance walk stays still and distance rather than elapsed time sets cadence',()=>{
 const kit=new Kit('cadence'),a=kit.person('A',0,0),b=kit.person('B',0,0),still=kit.person('C',0,0);
 kit.walk(a,[0,0],[0,2],0,8);kit.walk(b,[0,0],[0,2],0,16);kit.walk(still,[0,0],[0,0],0,8);
 try{kit.update(2);const angle=a.leftLeg.rotation.x;assert.equal(still.leftLeg.rotation.x,0);kit.update(4);assert.equal(b.leftLeg.rotation.x,angle);}finally{kit.dispose();}
});

test('shared animal paws and resting bellies do not penetrate the support plane',()=>{
 const kit=new Kit('animal-support');
 try{for(const kind of['lion','sheep','donkey']){
  const animal=kit.animal(kind,0,0);
  for(const resting of[false,true]){animal.userData.resting=resting;kit.update(6);for(const paw of animal.userData.paws){const y=lowestVertex(paw);assert.ok(y>=-.00001&&y<.012,`${kind} resting=${resting} paw=${y}`);}assert.ok(lowestVertex(animal.userData.body)>=-.00001);}
 }}finally{kit.dispose();}
});

test('blinks are reversible, do not animate closed eyes and preserve attached props',()=>{
 const kit=new Kit('blink'),open=kit.person('A',0,0),closed=kit.person('B',1,0,{eyesClosed:true});
 const eyes=[];open.head.traverse(o=>{if(o.userData.clayEye==='pupil')eyes.push(o);});
 const lids=[];closed.head.traverse(o=>{if(o.userData.clayEye==='lid')lids.push(o);});
 const lidScale=lids.map(o=>o.scale.toArray()),prop=new THREE.Object3D();open.handL.add(prop);
 try{let min=Infinity,max=0;for(let t=0;t<6;t+=.025){kit.update(t);min=Math.min(min,eyes[0].scale.y);max=Math.max(max,eyes[0].scale.y);}assert.ok(min<max*.15,'existing pupils visibly close during a short blink');kit.update(3);const scales=eyes.map(o=>o.scale.y);kit.update(8);kit.update(3);assert.deepEqual(eyes.map(o=>o.scale.y),scales);assert.deepEqual(lids.map(o=>o.scale.toArray()),lidScale);assert.equal(prop.parent,open.handL);}finally{kit.dispose();}
});
