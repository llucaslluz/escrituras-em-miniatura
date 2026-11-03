import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {builders} from '../src/scenes/bible.js';
import {fadeFigure} from '../src/scenes/bible/polish-utils.js';

function den(){const kit=new Kit('B11');builders.B11(kit);return kit;}
function materials(root){const result=new Set();root.traverse(o=>{if(o.material)result.add(o.material)});return [...result];}

test('B11: túnica, botas e patas repousam no chão durante oração e amanhecer',()=>{
 const kit=den();
 try{
  const daniel=kit.people.find(r=>r.root.userData.selectable==='Daniel');
  const lions=kit.selectables.filter(e=>e.name==='Leões da cova').map(e=>e.object);
  for(const time of[0,8,16,24,32]){
   kit.update(time);kit.group.updateMatrixWorld(true);
   for(const part of[daniel.robe,daniel.leftLeg,daniel.rightLeg]){
    const bottom=new THREE.Box3().setFromObject(part,true).min.y;
    assert.ok(bottom>=-.002&&bottom<.025,`Daniel está apoiado sem atravessar o piso em ${time}s: ${bottom}`);
   }
   for(const lion of lions)for(const paw of lion.userData.paws){
    const bottom=new THREE.Box3().setFromObject(paw,true).min.y;
    assert.ok(bottom>=-.002&&bottom<.025,`patas em contato com o chão em ${time}s: ${bottom}`);
   }
  }
 }finally{kit.dispose();}
});

test('B11/B05: fades preservam profundidade dos feixes e restauram materiais opacos',()=>{
 for(const id of['B11','B05']){
  const kit=new Kit(id);builders[id](kit);
  try{
   kit.update(24);let beams=0;
   kit.group.traverse(o=>{
    if(!o.userData.clayLightShaft)return;beams++;
    for(const material of materials(o)){
     assert.equal(material.depthWrite,false,`${id}: luz não escreve planos no buffer de profundidade`);
     assert.equal(material.transparent,true);
    }
   });
   assert.ok(beams>0);
   const opaque=id==='B11'?kit.people.find(r=>r.root.userData.selectable==='Anjo de proteção').robe:kit.group.children.find(o=>o.name==='Areia, pedrinhas e conchas do caminho');
   assert.ok(materials(opaque).some(m=>m.depthWrite&&!m.transparent),'o fim do fade restaura sólidos opacos');
  }finally{kit.dispose();}
 }
 const solid=new THREE.Mesh(new THREE.SphereGeometry(.2),new THREE.MeshBasicMaterial()),fade=fadeFigure(solid);
 fade(.5);assert.equal(solid.material.transparent,true);assert.equal(solid.material.depthWrite,false);
 fade(1);assert.equal(solid.material.transparent,false);assert.equal(solid.material.depthWrite,true);
 solid.geometry.dispose();solid.material.dispose();
});

test('B11: pedras mantêm UVs e normais suaves nas bordas coincidentes',()=>{
 const kit=den(),shapes=new Set();
 try{
  kit.group.traverse(o=>{if(o.geometry?.name==='Pedra irregular boleada')shapes.add(o.geometry)});
  assert.equal(shapes.size,3);
  for(const geometry of shapes){
   const p=geometry.attributes.position,n=geometry.attributes.normal,seen=new Map();
   assert.equal(geometry.attributes.uv.count,p.count,'as costuras UV não são apagadas para suavizar');
   for(let i=0;i<p.count;i++){
    const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(','),normal=new THREE.Vector3().fromBufferAttribute(n,i);
    assert.ok(Math.abs(normal.length()-1)<1e-5);
    if(seen.has(key))assert.ok(normal.dot(seen.get(key))>1-1e-5,'triângulos vizinhos compartilham a normal suave');
    else seen.set(key,normal);
   }
  }
 }finally{kit.dispose();}
});

test('B11: revelações e cor da manhã são contínuas e reversíveis',()=>{
 const kit=den();
 try{
  const angel=kit.people.find(r=>r.root.userData.selectable==='Anjo de proteção').root;
  const king=kit.people.find(r=>r.root.userData.selectable==='Dario').root;
  for(const [root,start,end]of[[angel,14,20],[king,24,29]]){
   kit.update(start);assert.equal(root.visible,false);
   kit.update(start+.01);assert.equal(root.visible,true);
   assert.ok(materials(root).every(m=>m.opacity<.001),'a entrada não aparece em opacidade plena no primeiro quadro');
   kit.update((start+end)/2);const middle=materials(root).map(m=>m.opacity);
   assert.ok(middle.every(n=>n>0&&n<1),'a transição inclui estados intermediários');
   kit.update(end);assert.ok(materials(root).every(m=>m.opacity===1));
   kit.update(0);kit.update((start+end)/2);assert.deepEqual(materials(root).map(m=>m.opacity),middle);
  }
  kit.update(27.49);const before=kit.light.color.clone();kit.update(27.51);
  assert.ok(Math.hypot(...before.toArray().map((n,i)=>n-kit.light.color.toArray()[i]))<.01,'a luz da manhã não troca de cor abruptamente');
 }finally{kit.dispose();}
});
