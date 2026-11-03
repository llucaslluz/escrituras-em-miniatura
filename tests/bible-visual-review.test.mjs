import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {builders} from '../src/scenes/bible.js';

function scene(id){const kit=new Kit(id);builders[id](kit);return kit;}
function character(k,name){return k.people.find(r=>r.root.userData.selectable===name);}
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}

test('B12: chamas de argila mantêm luz contida e troncos legíveis',()=>{
 const k=scene('B12');
 try{
  for(const t of[0,8,16,24]){
   k.update(t);k.group.updateMatrixWorld(true);let energy=0,count=0;
   k.group.traverse(o=>{if(o.name!=='Chamas de argila do forno')return;count++;
    assert.ok(new THREE.Box3().setFromObject(o,true).max.y<.55,'o fogo fica abaixo da cintura dos personagens');
    o.traverse(child=>{if(child.isPointLight)energy+=child.intensity;if(child.isMesh){assert.ok(child.material.emissiveIntensity<=.2);assert.ok(child.material.roughness>=.75);}});
   });
   assert.equal(count,8);assert.ok(energy<.8,'oito luzes não se somam até apagar rostos e mãos');
  }
 }finally{k.dispose();}
});

test('B13: o momento da margem mostra Jonas inteiro, sem cabeça isolada na água',()=>{
 const k=scene('B13');
 try{
  k.update(24);k.group.updateMatrixWorld(true);
  const jonahs=k.people.filter(r=>r.root.userData.selectable==='Jonas'&&visible(r.root));
  assert.equal(jonahs.length,1);assert.ok(jonahs[0].root.position.x>2.4);
  assert.ok(new THREE.Box3().setFromObject(jonahs[0].leftLeg,true).min.y>=.11);
  assert.equal(k.selectables.find(e=>e.name==='Grande peixe').object.visible,false);
 }finally{k.dispose();}
});

test('B15: o recém-nascido e a roupa cabem na manjedoura com apoio sobre a palha',()=>{
 const k=scene('B15');
 try{
  k.update(16);k.group.updateMatrixWorld(true);const baby=character(k,'Jesus Cristo');
  const bounds=new THREE.Box3().setFromObject(baby.root,true);
  assert.ok(bounds.min.y>=.56&&bounds.min.y<.58);
  assert.ok(bounds.min.x>-.4&&bounds.max.x<.4);
  assert.ok(bounds.min.z>.04&&bounds.max.z<.76,'cabeça e pés ficam dentro do berço');
  assert.ok(baby.root.scale.x>.3,'a figura continua pequena, mas reconhecível');
 }finally{k.dispose();}
});

test('B18: Jesus permanece na margem seca durante o chamado dos pescadores',()=>{
 const k=scene('B18');
 try{
  for(const t of[0,8,16,24]){
   k.update(t);k.group.updateMatrixWorld(true);const christ=character(k,'Jesus Cristo');
   const feet=new THREE.Box3().setFromObject(christ.leftLeg,true);
   assert.ok(feet.min.z>3.4,'os pés ficam além do limite frontal do lago');
   assert.ok(feet.min.y>=-.002&&feet.min.y<.02);
  }
 }finally{k.dispose();}
});

test('B20: cada sola toca a superfície real da rocha, não seu ponto mais alto',()=>{
 const k=scene('B20');
 try{
  const rock=k.group.children.find(o=>o.name==='Rocha de ensino'),christ=character(k,'Jesus Cristo'),ray=new THREE.Raycaster();
  for(const t of[0,8,16,24]){
   k.update(t);k.group.updateMatrixWorld(true);
   for(const leg of[christ.leftLeg,christ.rightLeg]){
    const foot=leg.children.find(o=>o.geometry?.type==='SphereGeometry'),point=foot.getWorldPosition(new THREE.Vector3());
    ray.set(new THREE.Vector3(point.x,3,point.z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(rock,false)[0];
    const gap=new THREE.Box3().setFromObject(foot,true).min.y-hit.point.y;
    assert.ok(gap>=-.002&&gap<.006,`sola junto à pedra: ${gap}`);
   }
  }
 }finally{k.dispose();}
});

test('B27: pernas ficam nos flancos da montaria e os cascos apoiam no caminho',()=>{
 const k=scene('B27');
 try{
  const rider=character(k,'Jesus Cristo'),donkey=rider.root.parent;
  for(const t of[0,8,16,24]){
   k.update(t);k.group.updateMatrixWorld(true);
   for(const leg of[rider.leftLeg,rider.rightLeg]){
    const local=donkey.worldToLocal(leg.getWorldPosition(new THREE.Vector3()));
    assert.ok(Math.abs(local.x)>.4,'as pernas não atravessam o centro da carcaça');
    assert.ok(new THREE.Box3().setFromObject(leg,true).min.y>.2,'as botas ficam pendentes, acima do piso');
   }
   assert.ok(donkey.userData.paws.every(p=>new THREE.Box3().setFromObject(p,true).min.y>=-.002));
  }
 }finally{k.dispose();}
});

test('B21: a vista do alimento mostra a tábua inteira em escala de detalhe',()=>{
 const k=scene('B21');
 try{
  k.update(16);k.group.updateMatrixWorld(true);const view=k.config.views[1],board=k.group.children.find(o=>o.name==='Tabua dos cinco paes e dois peixes');
  for(const [aspect,fov]of[[.56,52],[1.4,38]]){
   const camera=new THREE.PerspectiveCamera(fov,aspect,.1,100);camera.position.set(...view.camera);camera.lookAt(new THREE.Vector3(...view.target));camera.updateMatrixWorld(true);
   const bounds=new THREE.Box3().setFromObject(board,true),points=[];
   for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));
   assert.ok(points.every(p=>Math.abs(p.x)<.97&&Math.abs(p.y)<.97),'o suporte não fica cortado');
   const width=Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x));
   assert.ok(width>.3,'o alimento ocupa uma faixa reconhecível da imagem');
  }
 }finally{k.dispose();}
});

test('B29: a vista de perfil mantém a cabeça e os joelhos livres das árvores',()=>{
 const k=scene('B29');
 try{
  const christ=character(k,'Jesus Cristo'),view=k.config.views[2],ray=new THREE.Raycaster(),origin=new THREE.Vector3(...view.camera);
  for(const t of[8,16,24]){
   k.update(t);k.group.updateMatrixWorld(true);
   for(const part of[christ.head,christ.leftLeg,christ.rightLeg]){
    const delta=new THREE.Box3().setFromObject(part,true).getCenter(new THREE.Vector3()).sub(origin);
    ray.set(origin,delta.clone().normalize());ray.far=delta.length()-.02;
    const blockers=ray.intersectObject(k.group,true).filter(hit=>{let o=hit.object;while(o){if(o===christ.root)return false;o=o.parent;}return visible(hit.object)&&hit.object.material?.opacity>.6;});
    assert.equal(blockers.length,0,`perfil sem obstáculos em ${t}s`);
    for(const [aspect,fov]of[[.56,52],[1.4,38]]){
     const camera=new THREE.PerspectiveCamera(fov,aspect,.1,100);camera.position.copy(origin);camera.lookAt(new THREE.Vector3(...view.target));camera.updateMatrixWorld(true);
     const bounds=new THREE.Box3().setFromObject(part,true);
     for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){
      const point=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(point.x)<.97&&Math.abs(point.y)<.97,'o perfil inclui cabeça e joelhos inteiros');
     }
    }
   }
  }
 }finally{k.dispose();}
});
