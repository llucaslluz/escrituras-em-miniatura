import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {builders} from '../src/scenes/bible.js';

function scene(id){const kit=new Kit(id);builders[id](kit);return kit;}
function character(kit,name){return kit.people.find(r=>r.root.userData.selectable===name);}
function bottom(object){return new THREE.Box3().setFromObject(object,true).min.y;}

test('B03/B16/B20: pessoas ficam apoiadas no tapete, plataforma e rocha',()=>{
 for(const [id,name,floor]of[['B03','José do Egito',.105],['B16','Doutores no templo',.3],['B20','Jesus Cristo',null]]){
  const kit=scene(id);
  try{
   kit.update(16);kit.group.updateMatrixWorld(true);const rig=character(kit,name);
   const height=bottom(rig.leftLeg);
   assert.ok(height>=(floor??.6),`${id}: os pés não atravessam a superfície`);
   if(floor!==null)assert.ok(height<floor+.025,`${id}: os pés não flutuam sobre a superfície`);
  }finally{kit.dispose();}
 }
});

test('B04/B08: sandálias saem dos pés e Rute recolhe espigas reconhecíveis',()=>{
 const moses=scene('B04'),ruth=scene('B08');
 try{
  moses.update(16);const rig=character(moses,'Moisés');
  for(const leg of[rig.leftLeg,rig.rightLeg]){
   const boot=leg.children.find(o=>o.geometry?.type==='SphereGeometry');
   assert.equal(boot.material.opacity,0,'Moisés não continua calçado após retirar as sandálias');
  }
  ruth.update(24);let bundle;ruth.group.traverse(o=>{if(o.name==='Espigas recolhidas por Rute')bundle=o;});
  assert.ok(bundle&&bundle.parent===character(ruth,'Rute').handR);
  assert.equal(bundle.children.filter(o=>o.geometry?.type==='CylinderGeometry').length,6,'o feixe conserva hastes de trigo, em vez de representar um pão');
 }finally{moses.dispose();ruth.dispose();}
});

test('B18/B22: pessoas acompanham o convés em vez de pairar sobre ele',()=>{
 for(const id of['B18','B22']){
  const kit=scene(id);
  try{
   kit.update(8);kit.group.updateMatrixWorld(true);
   const rig=character(kit,id==='B18'?'Simão Pedro':'Discípulos de Jesus');
   assert.notEqual(rig.root.parent,kit.group,'a figura pertence ao grupo móvel do barco');
   assert.ok(rig.root.position.y<0,'a raiz alcança o convés abaixo da borda do casco');
  }finally{kit.dispose();}
 }
});

test('B26/B30: pedra rolante e apoio dos pés mantêm contato físico',()=>{
 const lazarus=scene('B26'),cross=scene('B30');
 try{
  const stone=lazarus.selectables.find(e=>e.name==='Pedra do sepulcro').object;
  for(const time of[7,10,14]){
   lazarus.update(time);lazarus.group.updateMatrixWorld(true);
   assert.ok(bottom(stone)>=-.002&&bottom(stone)<.02,'a pedra rola sem afundar ou levitar');
  }
  cross.update(24);cross.group.updateMatrixWorld(true);
  const christ=character(cross,'Jesus Cristo'),root=cross.selectables.find(e=>e.name==='Cruz de Jesus').object;
  const footrest=root.children.find(o=>o.name==='Apoio dos pés na cruz');
  const top=new THREE.Box3().setFromObject(footrest,true).max.y;
  assert.ok(bottom(christ.leftLeg)>=top-.003&&bottom(christ.leftLeg)<top+.02,'a plataforma sustenta os pés de Jesus');
 }finally{lazarus.dispose();cross.dispose();}
});

test('B09: a haste não levanta Golias do chão antes da queda apoiada',()=>{
 const kit=scene('B09');
 try{
  const giant=character(kit,'Golias');
  for(const time of[0,16,20,24]){
   kit.update(time);kit.group.updateMatrixWorld(true);
   assert.ok(bottom(giant.root)>=-.002&&bottom(giant.root)<.02);
   if(time<19)assert.ok(bottom(giant.leftLeg)<.02,'a lança não força os pés a flutuar');
  }
 }finally{kit.dispose();}
});

test('B13: o fade mantém o recorte translúcido que revela a oração de Jonas',()=>{
 const kit=scene('B13');
 try{
  kit.update(20);
  const fish=kit.selectables.find(e=>e.name==='Grande peixe').object,body=fish.children.find(o=>o.geometry?.parameters?.radius===.8);
  assert.ok(body.material.opacity>0&&body.material.opacity<.5);
  assert.equal(body.material.transparent,true,'o fim do fade não torna o corte interno opaco');
 }finally{kit.dispose();}
});

test('Transições bíblicas recompõem cor/opacidade ao buscar e mantêm recursos estáveis',()=>{
 const ids=['B01','B02','B04','B06','B08','B09','B10','B12','B13','B14','B15','B17','B18','B19','B20','B21','B24','B25','B26','B27','B28','B29','B31','B32'];
 for(const id of ids){
  const kit=scene(id);
  const capture=()=>{const values=[];kit.group.traverse(o=>{values.push(Number(o.visible));if(o.material)values.push(o.material.opacity,...o.material.color.toArray());});return values;};
  const resources=()=>{const result=[];kit.group.traverse(o=>{if(o.geometry)result.push(o.geometry);if(o.material)result.push(o.material)});return result;};
  try{
   kit.update(0);const originalResources=resources();
   for(const time of[0,8.5,16.5,24.5,32]){
    kit.update(time);const expected=capture();kit.update(0);kit.update(32);kit.update(time);
    assert.deepEqual(capture(),expected,`${id}: materiais em ${time}s dependem somente do tempo`);
    assert.deepEqual(resources(),originalResources,`${id}: materiais e geometrias são reutilizados entre quadros`);
   }
  }finally{kit.dispose();}
 }
});

test('B24/B29: voltar da caminhada restaura joelhos e recuo horizontal dos pés',()=>{
 for(const id of['B24','B29']){
  const kit=scene(id),times=[0,4,8,12,16,20,24,28,32],forward=new Map();
  const capture=()=>{const values=[];kit.group.traverse(o=>values.push(...o.position.toArray(),...o.rotation.toArray().slice(0,3),...o.scale.toArray()));return values;};
  try{
   for(const time of times){kit.update(time);forward.set(time,capture());}
   for(const time of times.slice().reverse()){kit.update(time);assert.deepEqual(capture(),forward.get(time),`${id}: pose em ${time}s independe da ordem da busca`);}
  }finally{kit.dispose();}
 }
});

test('B09: busca reversa recompõe transformações mundiais, geometria e materiais',()=>{
 const kit=scene('B09'),times=[0,4,8,12,16,20,24,28,31.9,32],forward=new Map();
 const capture=()=>{
  const hash=createHash('sha256'),values=data=>hash.update(JSON.stringify(data));
  kit.group.updateMatrixWorld(true);
  kit.group.traverse(o=>{
   values([...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray(),...o.matrixWorld.elements,o.visible]);
   if(o.isLight)values([o.intensity,...o.color.toArray()]);
   for(const a of Object.values(o.geometry?.attributes||{}))hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
   if(o.geometry?.index){const a=o.geometry.index.array;hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
   for(const attribute of[o.instanceMatrix,o.instanceColor])if(attribute){const a=attribute.array;hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
   for(const material of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])for(const key of Object.keys(material).sort()){
    // version counts shader recompilations, not the authored visual state.
    if(key==='version')continue;
    const value=material[key];
    if(typeof value==='number'||typeof value==='boolean')values([key,value]);
    else if(value?.isColor)values([key,...value.toArray()]);
   }
  });return hash.digest('hex');
 };
 try{
  for(const time of times){kit.update(time);forward.set(time,capture());}
  for(const time of times.slice().reverse()){kit.update(time);assert.equal(capture(),forward.get(time),`estado completo B09 em ${time}s`);}
 }finally{kit.dispose();}
});
