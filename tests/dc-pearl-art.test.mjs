import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {builders as dc} from '../src/scenes/dc.js';
import {builders as pearl} from '../src/scenes/pearl.js';
import {planStages} from '../src/data/dc.js';
import {Viewer} from '../src/engine/viewer.js';

const all={...dc,...pearl};
function inspectionCamera(k,index,width,height,immersive=true){
 const view=k.config.views[index],camera=new THREE.PerspectiveCamera(38,width/height,.1,100);
 camera.position.fromArray(view.camera);camera.lookAt(new THREE.Vector3().fromArray(view.target));
 Viewer.prototype.resize.call({invalidate(){},camera,renderer:{setSize(){}},host:{getBoundingClientRect:()=>({width,height})},views:k.config.views,viewIndex:index,immersive});camera.updateMatrixWorld(true);return camera;
}
function state(k){const out=[];k.group.traverse(o=>{out.push(o.visible,...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray());if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))out.push(m.opacity,m.transparent,m.depthWrite,m.emissiveIntensity??0);});return out;}
function figure(k,name){return k.people.find(r=>r.root.userData.selectable===name);}
function opacity(root){const values=[];root.traverse(o=>{if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))values.push(m.opacity);});return Math.max(...values);}

for(const[id,build]of Object.entries(all))test(`${id}: refined poses and material transitions survive backward seeks`,()=>{
 const k=new Kit(id);try{build(k);for(const t of[0,7.01,8.01,14.01,16.01,23.01,25,31.99]){k.update(t);const expected=state(k);assert.ok(expected.filter(n=>typeof n==='number').every(Number.isFinite));k.update(32);k.update(0);k.update(t);assert.deepEqual(state(k),expected,`${id} seek to ${t}s`);}}finally{k.dispose();}
});

for(const[id,name,start,end]of[
 ['D01','João Batista',7,12],['D02','Morôni',7,9],['D05','Jesus Cristo',10,15],['D07','Jesus Cristo',10,16],
 ['P02','Adão',25,28],['P05','Anjo',14,19],['P09','Deus, o Pai',23,28],['P10','Morôni',0,3],
])test(`${id}: ${name} appears gradually at full authored proportions`,()=>{
 const k=new Kit(id);try{all[id](k);const r=figure(k,name);k.update(start);assert.equal(r.root.visible,false);const initial=r.root.scale.y;k.update(start+.01);assert.equal(r.root.visible,true);assert.ok(opacity(r.root)<.001);k.update((start+end)/2);assert.ok(opacity(r.root)>.1&&opacity(r.root)<.9);k.update(end);assert.equal(opacity(r.root),1);assert.equal(r.root.scale.y,initial);}finally{k.dispose();}
});

for(const[id,names]of[['D01',['Joseph Smith','Oliver Cowdery']],['P09',['Joseph Smith']]])test(`${id}: kneeling robe and boots stay above the ground`,()=>{
 const k=new Kit(id);try{all[id](k);for(const t of[0,8,10,12,20,28,32]){k.update(t);k.group.updateMatrixWorld(true);for(const name of names){const r=figure(k,name);for(const part of[r.robe,r.leftLeg,r.rightLeg]){const y=new THREE.Box3().setFromObject(part,true).min.y;assert.ok(y>=-.003,`${id} ${name} ${t}s support ${y}`);}}}}finally{k.dispose();}
});

test('D09: diagram symbols remain selectable and illumination does not jump between stages',()=>{
 const k=new Kit('D09');try{dc.D09(k);for(const stage of planStages){const e=k.selectables.findLast(e=>e.name===stage.name&&e.role===stage.role);assert.ok(e);assert.equal(e.reference,stage.reference);}const nodes=planStages.map(s=>k.selectables.findLast(e=>e.name===s.name&&e.role===s.role).object);k.update(3.59);const before=nodes.map(n=>n.children[0].material.emissiveIntensity);k.update(3.61);const after=nodes.map(n=>n.children[0].material.emissiveIntensity);assert.ok(before.every((n,i)=>Math.abs(n-after[i])<.025));for(const n of nodes)assert.equal(n.visible,true);}finally{k.dispose();}
});

test('P07: departing group stops with feet still and a backward seek restores its previous walk',()=>{
 const k=new Kit('P07');try{pearl.P07(k);k.update(29);const moving=k.people.map(r=>r.leftLeg.rotation.x);assert.ok(moving.some(n=>Math.abs(n)>.01));k.update(32);assert.ok(k.people.every(r=>Math.abs(r.leftLeg.rotation.x)<1e-10));k.update(29);assert.deepEqual(k.people.map(r=>r.leftLeg.rotation.x),moving);}finally{k.dispose();}
});

const inspectionActors={
 D01:[[1,16,['Joseph Smith','Oliver Cowdery','João Batista']]],
 D02:[[1,12,['Oliver Cowdery','David Whitmer','Morôni']],[2,28,['Martin Harris','Morôni']]],
 D03:[[1,16,['Joseph Smith','Oliver Cowdery']],[2,20,['Participantes','Participante 4']]],
 D04:[[1,12,['Emma Smith']],[2,24,['Cantores','Cantora']]],
 D05:[[1,16,['Joseph Smith','Sidney Rigdon','Jesus Cristo']],[2,25,['Joseph Smith','Sidney Rigdon','Jesus Cristo']]],
 D06:[[1,16,['Joseph Smith']],[2,20,['Congregação','Pessoa da congregação 12']]],
 D07:[[1,24,['Jesus Cristo']],[2,24,['Jesus Cristo']]],D08:[[1,20,['Joseph Smith']],[2,20,['Companheiro de prisão']]],
 D09:[[1,20,['Jesus Cristo']]],D10:[[1,4,['Joseph F. Smith']],[2,25,['Jesus Cristo']]],
 P01:[[1,12,['Moisés']]],P02:[[1,30,['Adão','Eva']]],
 P03:[[1,20,['Jesus Cristo']],[2,20,['Espíritos reunidos','Espírito representativo 8']]],
 P04:[[1,12,['Adão','Eva']],[2,30,['Adão','Eva']]],
 P05:[[1,8,['Adão','Eva']],[2,24,['Anjo']]],
 P06:[[1,16,['Moradores de Sião','Morador 2']],[2,30,['Enoque']]],
 P07:[[1,12,['Abraão','Sarai','Ló']],[2,30,['Abraão','Sarai','Ló']]],
 P08:[[1,12,['Abraão']]],P09:[[1,12,['Joseph Smith']],[2,30,['Deus, o Pai','Jesus Cristo']]],
 P10:[[1,4,['Joseph Smith']],[2,30,['Joseph Smith']]],
};
for(const[id,cases]of Object.entries(inspectionActors))test(`${id}: authored inspection cameras keep protagonist heads inside mobile projection`,()=>{
 const k=new Kit(id);try{
  all[id](k);assert.equal(k.config.views.length,3);
  assert.ok(k.config.views.every(v=>v.label&&v.target&&v.camera));
  for(const[index,time,names]of cases){k.update(time);k.group.updateMatrixWorld(true);const view=k.config.views[index];
   for(const[width,height]of[[390,844],[844,390],[800,600]]){
    const camera=inspectionCamera(k,index,width,height,width!==800);
    for(const name of names){const actors=k.people.filter(r=>r.root.userData.selectable===name&&r.root.visible);assert.ok(actors.length,`${id} actor ${name} is present at ${time}s`);for(const r of actors){const bounds=new THREE.Box3().setFromObject(r.head,true);for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<.98&&Math.abs(p.y)<.98&&p.z>-1&&p.z<1,`${id} ${name} view${index} ${width}×${height}: ${p.toArray()}`);}}}
   }
  }
 }finally{k.dispose();}
});

test('D01: palms reach both crowns during the ordination moment rather than stopping at the chest',()=>{
 const k=new Kit('D01');try{dc.D01(k);for(const t of[16,18,20,22]){k.update(t);k.group.updateMatrixWorld(true);const minister=figure(k,'João Batista');for(const[name,hand]of[['Joseph Smith',minister.handL],['Oliver Cowdery',minister.handR]]){const r=figure(k,name),target=new THREE.Vector3(0,.42,.14).applyMatrix4(r.head.matrixWorld);assert.ok(hand.getWorldPosition(new THREE.Vector3()).distanceTo(target)<.002,`${name} crown contact at ${t}s`);}}}finally{k.dispose();}
});

test('D07: the folds travel with the veil and leave the revealed figure unobstructed',()=>{
 const k=new Kit('D07');try{dc.D07(k);const panels=['Véu esquerdo','Véu direito'].map(name=>k.group.getObjectByName(name));assert.ok(panels.every(p=>p.children.length===6));for(const t of[16,24]){k.update(t);k.group.updateMatrixWorld(true);const figureBounds=new THREE.Box3().setFromObject(figure(k,'Jesus Cristo').root,true),left=new THREE.Box3().setFromObject(panels[0],true),right=new THREE.Box3().setFromObject(panels[1],true);assert.ok(left.max.x<figureBounds.min.x-.1);assert.ok(right.min.x>figureBounds.max.x+.1);}}finally{k.dispose();}
});

test('D02/D05: detail camera paths to faces are clear of trees and walls',()=>{
 for(const[id,index,time,names]of[['D02',2,16,['Martin Harris']],['D05',1,16,['Joseph Smith','Sidney Rigdon','Jesus Cristo']],['D05',2,24,['Joseph Smith','Sidney Rigdon','Jesus Cristo']]]){
  const k=new Kit(id);try{all[id](k);k.update(time);k.group.updateMatrixWorld(true);const camera=new THREE.Vector3().fromArray(k.config.views[index].camera);for(const name of names){const r=figure(k,name),target=r.head.getWorldPosition(new THREE.Vector3()),distance=camera.distanceTo(target),ray=new THREE.Raycaster(camera,target.clone().sub(camera).normalize(),0,distance-.38);const blockers=ray.intersectObjects(k.group.children,true).filter(hit=>{let o=hit.object;while(o){if(o===r.root||o.userData.clayPerson)return false;if(!o.visible)return false;o=o.parent;}return !hit.object.material?.transparent;});assert.equal(blockers.length,0,`${id} view${index} ${name} has no solid scenery between camera and head`);}}finally{k.dispose();}
 }
});

test('P10: the case is supported above the hill and the plates end between the hands',()=>{
 const k=new Kit('P10');try{pearl.P10(k);const box=k.group.getObjectByName('Caixa de pedra'),plates=k.selectables.find(e=>e.name==='Placas').object;assert.ok(box.position.y-.15>=1.1-1e-8);for(const t of[16,24]){k.update(t);assert.ok(plates.position.y>=1.4);assert.equal(plates.visible,true);}k.update(30);k.group.updateMatrixWorld(true);const r=k.people.filter(r=>r.root.userData.selectable==='Joseph Smith').at(-1),target=r.handL.getWorldPosition(new THREE.Vector3()).add(r.handR.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5);target.y-=.015;assert.ok(plates.position.distanceTo(target)<1e-8);assert.ok(k.group.getObjectByName('Dobradiça da caixa').rotation.x< -1);}finally{k.dispose();}
});

test('D09/P01/P08: symbolic inspection views include the elevated symbols',()=>{
 for(const id of['D09','P01','P08']){
  const k=new Kit(id);try{all[id](k);k.update(32);
   const points=id==='D09'?planStages.filter(s=>['celestial','terrestrial','telestial'].includes(s.id)).flatMap(s=>[-.5,.5].map(dx=>new THREE.Vector3(s.position[0]+dx,3.4,s.position[2]))):id==='P01'?Array.from({length:5},(_,i)=>new THREE.Vector3(-3+i*1.4,3.3+(i%2)*.75+.4,-2.3-i*.15)):Array.from({length:14},(_,i)=>new THREE.Vector3(-4+(i%7)*1.25,3+Math.floor(i/7)*1.2+(i%3)*.12+.35,-3.5));
   for(const[width,height]of[[390,844],[844,390]]){const camera=inspectionCamera(k,2,width,height);for(const point of points){const p=point.clone().project(camera);assert.ok(Math.abs(p.x)<.98&&Math.abs(p.y)<.98&&p.z>-1&&p.z<1,`${id} symbol ${width}×${height}: ${p.toArray()}`);}}
  }finally{k.dispose();}
 }
});
