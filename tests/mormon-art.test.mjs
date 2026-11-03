import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Kit } from '../src/engine/kit.js';
import { builders } from '../src/scenes/mormon.js';
import { fade } from '../src/scenes/mormon/utils.js';
import { Viewer } from '../src/engine/viewer.js';

const build=id=>{const k=new Kit(id);builders[id](k);return k;};
const numbers=k=>{const result=[];k.group.traverse(o=>{result.push(...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray(),Number(o.visible));for(const m of(o.material?Array.isArray(o.material)?o.material:[o.material]:[])){result.push(m.opacity,m.emissiveIntensity??0);if(m.color)result.push(...m.color.toArray());}});return result;};

test('M01–M20: fade preserva raios transparentes e restaura o material opaco ao completar',()=>{
 const group=new THREE.Group(),geometries=[new THREE.CylinderGeometry(.1,.3,1),new THREE.RingGeometry(.2,.3,12),new THREE.BoxGeometry(1,1,1)];
 const originals=[new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,opacity:.3}),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,opacity:.7}),new THREE.MeshBasicMaterial({transparent:false,depthWrite:true,opacity:1})];
 const meshes=originals.map((material,index)=>new THREE.Mesh(geometries[index],material));group.add(...meshes);const reveal=fade(group);
 try{
  for(const q of[.5,.999,1,.25,1]){
   reveal(q);meshes.forEach((mesh,index)=>{
    assert.notEqual(mesh.material,originals[index],'a transição não altera materiais compartilhados');
    assert.equal(mesh.material.opacity,originals[index].opacity*q);
    assert.equal(mesh.material.transparent,q<1||originals[index].transparent);
    assert.equal(mesh.material.depthWrite,q===1?originals[index].depthWrite:false);
   });
  }
  assert.equal(originals[0].depthWrite,false);assert.equal(originals[1].depthWrite,false);assert.equal(originals[2].transparent,false);
 }finally{for(const geometry of geometries)geometry.dispose();for(const mesh of meshes)mesh.material.dispose();for(const material of originals)material.dispose();}
});

test('M06: oração comprime a roupa e permite voltar ao estado em pé sem resíduos',()=>{
 const k=build('M06');try{
  const r=k.people.find(r=>r.root.userData.selectable==='Enos');
  k.update(0);const start=numbers(k),initialHem=r.robe.scale.y;
  k.update(12);assert.ok(r.robe.scale.y<initialHem,'a saia acompanha o torso ajoelhado');
  assert.ok(r.leftLeg.rotation.x>0,'as botas ficam recolhidas atrás, não enterradas para frente');
  k.group.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(r.robe,true);
  assert.ok(box.min.y>=-.003&&box.min.y<.03,`a bainha apoia no chão: ${box.min.y}`);
  k.update(32);k.update(0);assert.deepEqual(numbers(k),start,'o seek restaura roupa, acessórios e pivôs');
 }finally{k.dispose();}
});

test('M01: o fogo do acampamento entra gradualmente, incluindo a luz local',()=>{
 const k=build('M01');try{
  const fire=k.group.children.find(o=>o.userData.mormonFade&&o.children.some(c=>c.isPointLight));
  assert.ok(fire);const lamp=fire.children.find(c=>c.isPointLight);
  k.update(20);assert.equal(fire.visible,false);assert.equal(lamp.intensity,0);
  k.update(21.5);assert.ok(fire.userData.reveal>0&&fire.userData.reveal<1);assert.ok(lamp.intensity>0&&lamp.intensity<2.5);
  k.update(23);assert.equal(fire.userData.reveal,1);
  k.update(20);assert.equal(lamp.intensity,0,'voltar não acumula a intensidade do fogo');
 }finally{k.dispose();}
});

test('M05: vela volumétrica mantém bordas presas e responde ao temporal sem saltar',()=>{
 const k=build('M05');try{
  let sail;k.group.traverse(o=>{if(o.geometry?.type==='PlaneGeometry'&&o.geometry.parameters.width===1.55)sail=o;});assert.ok(sail);
  for(const t of[8,16,20,28]){k.update(t);const p=sail.geometry.attributes.position;let maximum=0;for(let i=0;i<p.count;i++){maximum=Math.max(maximum,p.getZ(i));if(Math.abs(p.getX(i))>.774||Math.abs(p.getY(i))>.774)assert.ok(Math.abs(p.getZ(i))<1e-5,'costura permanece presa à verga e às bordas');}assert.ok(maximum>.10,'o pano possui barriga, não só uma placa plana');}
  k.update(7.5);assert.ok(sail.userData.reveal>0&&sail.userData.reveal<1,'montagem da vela tem transição');
 }finally{k.dispose();}
});

test('M12: arma depositada começa na mão, percorre o caminho e desaparece sob a terra',()=>{
 const k=build('M12');try{
  const deposited=k.group.children.filter(o=>o.userData.weaponDeposit);assert.equal(deposited.length,4);
  const rig=k.people.find(r=>r.root.userData.selectable==='Povo ânti-néfi-leíta');const hand=new THREE.Vector3();
  k.update(12);k.group.updateMatrixWorld(true);rig.handR.getWorldPosition(hand);
  assert.ok(deposited[0].position.distanceTo(hand)<1e-6,'a transição começa na posição real da mão');
  const origin=deposited[0].position.clone();k.update(12.001);assert.ok(deposited[0].position.distanceTo(origin)<.001,'não salta da mão ao centro da cova');
  k.update(15);assert.ok(Math.abs(deposited[0].position.y-.075)<1e-6);assert.ok(deposited[0].visible);
  k.update(29);assert.equal(deposited[0].visible,false,'a terra recobre as armas');
 }finally{k.dispose();}
});

test('M17: a inclinação da pessoa amparada conserva uma sola apoiada sem enterrar a outra',()=>{
 const k=build('M17');try{
  const r=k.people.find(r=>r.root.userData.selectable==='Pessoa enferma'),point=new THREE.Vector3();
  for(let frame=0;frame<=96;frame++){
   const t=frame*.25;k.update(t);k.group.updateMatrixWorld(true);const bottoms=[];
   for(const leg of[r.leftLeg,r.rightLeg]){const boot=leg.children.find(o=>o.geometry?.type==='SphereGeometry'),p=boot.geometry.attributes.position;let minimum=Infinity;for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i).applyMatrix4(boot.matrixWorld);minimum=Math.min(minimum,point.y);}bottoms.push(minimum);}
   assert.ok(bottoms.every(y=>y>=-.001),`${t}s: nenhuma sola atravessa o chão`);
   assert.ok(Math.min(...bottoms)<.008,`${t}s: ao menos um pé apoia o peso`);
  }
 }finally{k.dispose();}
});

test('M10/M16/M18/M19: aparições luminosas possuem intervalos de transição reversíveis',()=>{
 for(const [id,time]of[['M10',7.5],['M16',8],['M18',25],['M19',29]]){const k=build(id);try{
  k.update(time);const before=numbers(k);const partial=[];k.group.traverse(o=>{if(o.userData.mormonFade&&o.userData.reveal>0&&o.userData.reveal<1)partial.push(o);});assert.ok(partial.length,`${id}: ao menos uma aparição em transição`);
  k.update(32);k.update(0);k.update(time);assert.deepEqual(numbers(k),before,`${id}: aparência, pose e cor voltam ao mesmo instante`);
 }finally{k.dispose();}}
});

test('M01–M20: vistas autorais enquadram a ação em alturas próprias sem perder a vista geral',()=>{
 for(const id of Object.keys(builders)){const k=build(id);try{
  assert.equal(k.config.views.length,3,id);assert.deepEqual(k.config.views[0].camera,k.config.camera);assert.deepEqual(k.config.views[0].target,k.config.target);
  for(const view of k.config.views){assert.ok(view.label);assert.ok([...view.camera,...view.target].every(Number.isFinite));assert.ok(new THREE.Vector3(...view.camera).distanceTo(new THREE.Vector3(...view.target))>1);}
  if(id==='M07')assert.ok(k.config.views[1].target[1]>2,'a vista da torre não aponta para o chão');
  if(id==='M19')assert.ok(k.config.views[1].target[1]>1.7,'o detalhe das pedras aponta para a prateleira do monte');
 }finally{k.dispose();}}
});

function inspectionCamera(k,index,width,height,immersive=true){
 const view=k.config.views[index],camera=new THREE.PerspectiveCamera(38,width/height,.1,100);camera.position.fromArray(view.camera);camera.lookAt(new THREE.Vector3(...view.target));
 Viewer.prototype.resize.call({invalidate(){},camera,renderer:{setSize(){}},host:{getBoundingClientRect:()=>({width,height})},views:k.config.views,viewIndex:index,immersive});camera.updateMatrixWorld(true);return camera;
}
const viewports=[[320,568],[360,800],[390,844],[412,915],[844,390],[1440,900]];
const firstVisibleHit=(k,from,to)=>new THREE.Raycaster(from,to.clone().sub(from).normalize()).intersectObject(k.group,true).find(hit=>{for(let node=hit.object;node;node=node.parent)if(!node.visible)return false;return hit.object.material?.opacity>.1;});
function belongsTo(node,parent){for(let current=node;current;current=current.parent)if(current===parent)return true;return false;}
function inside(camera,object,message){const bounds=new THREE.Box3().setFromObject(object,true);for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<.98&&Math.abs(p.y)<.98&&p.z>-1&&p.z<1,message);}}

test('M01/M03/M05: detalhes mantêm a ação no quadro nos seis tamanhos e no canvas de contato',()=>{
 for(const[id,index,times]of[['M01',2,[16,24]],['M03',1,[8,10.5,13,16,20]],['M05',1,[16,20,24]]]){const k=build(id);try{for(const t of times){k.update(t);k.group.updateMatrixWorld(true);for(const[width,height]of[...viewports,[400,300]]){const camera=inspectionCamera(k,index,width,height,width!==400);for(const r of k.people.filter((_,i)=>id!=='M03'||i<2))inside(camera,r.head,`${id} ${t}s ${width}×${height}: cabeça no enquadramento`);if(id==='M03')inside(camera,k.selectables.find(s=>s.name==='Placas de latão').object,`M03 ${t}s: placas enquadradas`);}
  if(id==='M01')for(const r of k.people){const direction=new THREE.Vector3(...k.config.views[2].camera).sub(r.root.position).setY(0).normalize(),forward=new THREE.Vector3(Math.sin(r.root.rotation.y),0,Math.cos(r.root.rotation.y));assert.ok(direction.dot(forward)>.5,'a câmera do acampamento permanece no hemisfério frontal da família');}
 }}finally{k.dispose();}}
});

test('M03: vista das placas revela a superfície entre a retirada e a decisão de Zorã',()=>{
 const k=build('M03');try{const plates=k.selectables.find(s=>s.name==='Placas de latão').object,from=new THREE.Vector3(...k.config.views[1].camera);for(const t of[8,10.5,13,16,20]){k.update(t);k.group.updateMatrixWorld(true);for(const x of[-.19,0,.19])for(const z of[-.12,0,.12]){const top=plates.localToWorld(new THREE.Vector3(x,.139,z));assert.ok(belongsTo(firstVisibleHit(k,from,top)?.object,plates),`${t}s: corpo/muralha não escondem a superfície dos registros`);}}}finally{k.dispose();}
});

test('M05/M14: detalhe do navio abre Sam e o líder permanece legível na interlocução',()=>{
 for(const[id,name,times,indices]of[['M05','Sam',[16,20,24],[1]],['M14','Helamã',[16,24],[0,1]]]){const k=build(id);try{for(const t of times){k.update(t);k.group.updateMatrixWorld(true);const r=k.people.find(r=>r.root.userData.selectable===name),face=r.head.localToWorld(new THREE.Vector3(0,-.04,.35));for(const index of indices)assert.ok(belongsTo(firstVisibleHit(k,new THREE.Vector3(...k.config.views[index].camera),face)?.object,r.root),`${id} ${t}s vista${index}: rosto não encoberto por vela/primeira fila`);}}finally{k.dispose();}}
});
