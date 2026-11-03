import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {builders} from '../src/scenes/bible.js';

const down=new THREE.Vector3(0,-1,0);
function scene(id){const k=new Kit(id);builders[id](k);return k;}
function surfaceAt(root,x,z){const ray=new THREE.Raycaster(new THREE.Vector3(x,7,z),down);return ray.intersectObject(root,true)[0]?.point.y??0;}
function foot(rig,leg){return leg.children.find(o=>o.geometry?.type==='SphereGeometry');}

test('B04: a sarça fica baixa, ramificada e separada do rosto e do gesto de Moisés',()=>{
 const k=scene('B04');
 try{
  const bush=k.group.children.find(o=>o.name==='Sarça baixa ramificada'),moses=k.people[0];
  for(const t of[0,8,16,24,32]){
   k.update(t);k.group.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(bush,true);
   assert.ok(bounds.min.y>=0&&bounds.max.y<1.05,'a sarça nasce no piso e conserva porte de arbusto');
   for(const part of[moses.head,moses.handL,moses.handR])assert.ok(!bounds.intersectsBox(new THREE.Box3().setFromObject(part,true)),'a folhagem deixa o gesto livre');
   let energy=0;k.group.traverse(o=>{if(o.isPointLight)energy+=o.intensity;});assert.ok(energy<2,'o fogo não branqueia a folhagem com quatro luzes somadas');
  }
 }finally{k.dispose();}
});

test('B04/B06: encostas contínuas têm silhueta arredondada e assimetria real',()=>{
 for(const [id,name,x,z,height]of[['B04','Encosta rochosa arredondada',-2.6,-2,3.2],['B06','Monte com percurso de subida',0,-2,4.3]]){
  const k=scene(id);
  try{
   const hill=k.group.children.find(o=>o.name===name);k.update(0);k.group.updateMatrixWorld(true);
   const bounds=new THREE.Box3().setFromObject(hill,true);assert.ok(Math.abs(bounds.max.y-height)<.03,'a altura narrativa é preservada');
   let cones=0;hill.traverse(o=>{if(o.geometry?.type==='ConeGeometry')cones++;});assert.equal(cones,0);
   assert.ok(Math.abs(surfaceAt(hill,x-.85,z+.6)-surfaceAt(hill,x+.85,z+.6))>.05,'as duas vertentes não são cópias espelhadas');
  }finally{k.dispose();}
 }
});

test('B06: cada pé acompanha a superfície esculpida durante toda a subida',()=>{
 const k=scene('B06');
 try{
  const hill=k.group.children.find(o=>o.name==='Monte com percurso de subida'),moses=k.people[0];
  for(let t=0;t<=32;t+=.25){
   k.update(t);k.group.updateMatrixWorld(true);
   for(const leg of[moses.leftLeg,moses.rightLeg]){
    const boot=foot(moses,leg),center=boot.getWorldPosition(new THREE.Vector3()),support=surfaceAt(hill,center.x,center.z);
    const gap=new THREE.Box3().setFromObject(boot,true).min.y-support;
    assert.ok(gap>=-.002&&gap<.07,`apoio ou balanço da passada em ${t}s: ${gap}`);
   }
  }
  assert.ok(moses.root.position.y>2.3&&moses.root.position.y<2.9,'Moisés chega à zona alta, abaixo do cume');
 }finally{k.dispose();}
});

test('B13: a margem curva mantém a caminhada seca sobre o piso de .11',()=>{
 const k=scene('B13');
 try{
  const shore=k.group.children.find(o=>o.name==='Margem arredondada de Jonas'),jonah=k.people.find(r=>r.root.position.x===3);
  for(let t=24;t<=32;t+=.25){
   k.update(t);k.group.updateMatrixWorld(true);
   for(const leg of[jonah.leftLeg,jonah.rightLeg]){
    const boot=foot(jonah,leg),center=boot.getWorldPosition(new THREE.Vector3()),support=surfaceAt(shore,center.x,center.z);
    assert.ok(Math.abs(support-.11)<.001,'a superfície existe sob todo o trajeto');
    const gap=new THREE.Box3().setFromObject(boot,true).min.y-support;assert.ok(gap>=-.002&&gap<.065);
   }
  }
 }finally{k.dispose();}
});

test('B13: cabeça, dorso e cauda têm contornos próprios sem perder o recorte da oração',()=>{
 const k=scene('B13');
 try{
  k.update(20);const fish=k.selectables.find(o=>o.name==='Grande peixe').object,body=fish.children.find(o=>o.name==='Corpo esculpido do grande peixe');
  assert.ok(fish.children.some(o=>o.name==='Mandibula arredondada'));
  assert.ok(fish.children.some(o=>o.name==='Nadadeira dorsal'));
  const tail=fish.children.find(o=>o.name==='Cauda bifurcada arredondada');assert.ok(tail.geometry.type==='ExtrudeGeometry');
  const p=body.geometry.attributes.position;let head=0,peduncle=0;
  for(let i=0;i<p.count;i++){const z=p.getZ(i);if(z>.3&&z<.6)head=Math.max(head,Math.abs(p.getX(i)));if(z<-.3&&z>-.6)peduncle=Math.max(peduncle,Math.abs(p.getX(i)));}
  assert.ok(head>peduncle*1.15,'o corpo afina em direção ao pedúnculo, em vez de ser um elipsoide');
  assert.ok(body.material.transparent&&body.material.opacity<.5,'o novo volume mantém a oração visível pelo recorte');
 }finally{k.dispose();}
});
