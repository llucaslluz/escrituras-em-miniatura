import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {builders} from '../src/scenes/bible.js';

const authored=['B01','B02','B03','B04','B06','B07','B08','B09','B10','B12','B13','B14','B15','B16','B18','B19','B20','B21','B22','B23','B24','B25','B26','B27','B31','B32'];
function visible(object){for(let p=object;p;p=p.parent)if(!p.visible)return false;return true;}
function corners(bounds){const points=[];for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z])points.push(new THREE.Vector3(x,y,z));return points;}

test('Presets autorais bíblicos enquadram cabeças e apoios nos quatro momentos',()=>{
 for(const id of authored){
  const kit=new Kit(id);builders[id](kit);
  try{
   assert.equal(kit.config.views.length,3);
   for(const time of[0,8,16,24]){
    kit.update(time);kit.group.updateMatrixWorld(true);
    for(const index of[1,2])for(const [aspect,fov]of[[.56,52],[1.4,38]]){
     const view=kit.config.views[index],camera=new THREE.PerspectiveCamera(fov,aspect,.1,100);
     camera.position.set(...view.camera);camera.lookAt(new THREE.Vector3(...view.target));camera.updateMatrixWorld(true);
     const focus=id==='B15'&&index===1?['Jesus Cristo','Maria, mãe de Jesus','José de Nazaré']:id==='B21'&&index===1?['Jesus Cristo']:null;
     for(const rig of kit.people){
      if(!visible(rig.root))continue;
      if(focus&&!focus.includes(rig.root.userData.selectable))continue;
      for(const part of[rig.head,rig.leftLeg,rig.rightLeg])for(const point of corners(new THREE.Box3().setFromObject(part,true))){
       point.project(camera);
       assert.ok(Math.abs(point.x)<.97&&Math.abs(point.y)<.97&&point.z>=-1&&point.z<=1,`${id} vista ${index}, ${time}s, aspecto ${aspect}: ${rig.root.userData.selectable} permanece dentro da imagem`);
      }
     }
    }
   }
  }finally{kit.dispose();}
 }
});

test('B05: geral e famílias mantêm linha de visão para pessoas durante a marcha',()=>{
 const kit=new Kit('B05');builders.B05(kit);
 try{
  const sea=kit.selectables.find(e=>e.name==='Águas abertas').object,ray=new THREE.Raycaster();
  for(const time of[8,16,24]){
   kit.update(time);kit.group.updateMatrixWorld(true);
   for(const index of[0,1]){
    const view=kit.config.views[index],origin=new THREE.Vector3(...view.camera);
    if(index===0){const target=new THREE.Vector3(...view.target);origin.sub(target).multiplyScalar(1.3).add(target);}
    for(const rig of kit.people){
     const delta=rig.head.getWorldPosition(new THREE.Vector3()).sub(origin);ray.set(origin,delta.clone().normalize());ray.far=delta.length()-.05;
     assert.ok(!ray.intersectObject(sea,true).some(hit=>visible(hit.object)&&hit.object.material.opacity>.6),`a água não oculta ${rig.root.userData.selectable} em ${time}s na vista ${index}`);
    }
   }
  }
 }finally{kit.dispose();}
});

test('B09: a cabeça durante a queda permanece à frente das montanhas',()=>{
 const kit=new Kit('B09');builders.B09(kit);
 try{
  const giant=kit.people.find(r=>r.root.userData.selectable==='Golias');
  for(let time=18.5;time<=24;time+=.25){
   kit.update(time);kit.group.updateMatrixWorld(true);
   const head=new THREE.Box3().setFromObject(giant.head,true);
   for(const [x,z,height]of[[-3,-2.8,2.3],[3,-2.8,2.1]])for(const point of corners(head)){
    const hill=Math.max(0,height*(1-Math.hypot(point.x-x,point.z-z)/2.1));
    if(hill>0)assert.ok(head.min.y>hill+.01,'a trajetória não enterra a cabeça no cone da montanha');
   }
   const body=new THREE.Box3().setFromObject(giant.root,true);assert.ok(body.min.y>=-.002&&body.min.y<.02);
  }
 }finally{kit.dispose();}
});
