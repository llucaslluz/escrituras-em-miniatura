import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {Viewer} from '../src/engine/viewer.js';
import {builders as mormon} from '../src/scenes/mormon.js';
import {builders as pearl} from '../src/scenes/pearl.js';

test('M07: o piso sustenta o rei e as quatro tendas conservam bordas apoiadas durante o vento',()=>{
 const k=new Kit('M07');try{mormon.M07(k);const king=k.people.find(r=>r.root.userData.selectable==='Rei Benjamim'),floor=k.group.getObjectByName('Piso da torre'),tents=k.group.children.filter(o=>o.name==='Tenda voltada à torre');assert.equal(tents.length,4);
  for(const t of[0,8,16,24,32]){k.update(t);k.group.updateMatrixWorld(true);const support=new THREE.Box3().setFromObject(floor,true).max.y;
   for(const foot of[king.leftLeg,king.rightLeg]){const bottom=new THREE.Box3().setFromObject(foot,true).min.y;assert.ok(bottom>=support-.001&&bottom<support+.012,`${t}s: pés apoiados no piso da torre`);}
   for(const tent of tents){const cloth=tent.children.find(o=>o.geometry?.type==='BufferGeometry'),p=cloth.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);assert.ok(y>=-1e-6,'a lona não atravessa o chão');if(Math.abs(x)>.999)assert.ok(Math.abs(y)<1e-6,'a borda inferior não levanta durante o vento');if(Math.abs(x)<1e-6&&y>1)assert.ok(Math.abs(y-1.55)<1e-6,'a cumeeira fica presa ao suporte');}}
  }
 }finally{k.dispose();}
});

test('P04: a passagem conserva o fruto na mão e as trajetórias de saída',()=>{
 const k=new Kit('P04');try{pearl.P04(k);const adam=k.people.find(r=>r.root.userData.selectable==='Adão'),eve=k.people.find(r=>r.root.userData.selectable==='Eva'),held=eve.handR.children.find(o=>o.geometry?.parameters.radius===.12);assert.ok(held);
  for(const t of[0,8,9,12,16,18,19,24,30,32]){k.update(t);k.group.updateMatrixWorld(true);assert.deepEqual(held.position.toArray(),[0,-.05,.12],'posição local do fruto preservada');assert.equal(held.visible,t>8&&t<19,`${t}s: janela narrativa preservada`);assert.equal(adam.root.position.y,0);assert.equal(eve.root.position.y,0);}
  assert.deepEqual(adam.root.position.toArray(),[1.3,0,3.7]);assert.deepEqual(eve.root.position.toArray(),[-.2,0,3.6]);
  const path=k.group.getObjectByName('Caminho integrado ao jardim');assert.ok(path);const bounds=new THREE.Box3().setFromObject(path,true);assert.ok(bounds.max.y<=.013&&bounds.min.y<0,'a passagem fica embutida no terreno, sem degrau elevado');
 }finally{k.dispose();}
});

test('M07/P04: as vistas narrativas mantêm cabeças e fruto dentro da projeção móvel e desktop',()=>{
 for(const[id,build,cases]of[['M07',mormon.M07,[[1,16,['Rei Benjamim']],[2,24,['Rei Benjamim']]]],['P04',pearl.P04,[[1,12,['Adão','Eva']],[2,30,['Adão','Eva']]]]]){const k=new Kit(id);try{build(k);for(const[index,t,names]of cases){k.update(t);k.group.updateMatrixWorld(true);const view=k.config.views[index];for(const[width,height]of[[320,568],[360,800],[390,844],[412,915],[844,390],[1440,900]]){const camera=new THREE.PerspectiveCamera(38,width/height,.1,100);camera.position.fromArray(view.camera);camera.lookAt(new THREE.Vector3(...view.target));Viewer.prototype.resize.call({invalidate(){},camera,renderer:{setSize(){}},host:{getBoundingClientRect:()=>({width,height})},views:k.config.views,viewIndex:index,immersive:true});camera.updateMatrixWorld(true);
   const objects=k.people.filter(r=>names.includes(r.root.userData.selectable)).map(r=>r.head);if(id==='P04'&&t===12)objects.push(k.people.find(r=>r.root.userData.selectable==='Eva').handR.children.find(o=>o.geometry?.parameters.radius===.12));
   for(const object of objects){const bounds=new THREE.Box3().setFromObject(object,true);for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<.98&&Math.abs(p.y)<.98&&p.z>-1&&p.z<1,`${id} vista${index} ${t}s ${width}×${height}`);}}
  }}}finally{k.dispose();}}
});
