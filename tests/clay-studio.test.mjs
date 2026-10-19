import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ClayOptics,prepareStudio,updateStudio,disposeShadows} from '../src/engine/clay-studio.js';

function renderer(float=true){
 return{extensions:{has:()=>float},capabilities:{maxSamples:4},getPixelRatio:()=>2,info:{render:{calls:0,triangles:0}},target:null,getRenderTarget(){return this.target},setRenderTarget(target){this.target=target},renders:[],render(scene,camera){this.renders.push({scene,camera,target:this.target});this.info.render.calls=scene.isScene?23:1;this.info.render.triangles=scene.isScene?4200:1;}};
}

test('a lente respeita orçamento, tamanho físico e antialiasing de cada qualidade',()=>{
 const gpu=renderer(),lens=new ClayOptics(gpu);
 try{
  lens.resize(1920,1080);lens.setQuality('medium');
  assert.equal(lens.target.width,1800);assert.equal(lens.target.height,1013);assert.equal(lens.target.samples,2);
  lens.setQuality('high');assert.equal(lens.target.width,2560);assert.equal(lens.target.height,1440);assert.equal(lens.target.samples,4);
  lens.resize(390,844);assert.equal(lens.target.width,780);assert.equal(lens.target.height,1688);
  assert.equal(lens.target.depthTexture.type,THREE.UnsignedIntType);
 }finally{lens.dispose();}
});

test('qualidade baixa e GPU sem renderização HDR usam renderização direta',()=>{
 for(const [quality,float]of [['low',true],['medium',false]]){
  const gpu=renderer(float),lens=new ClayOptics(gpu),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();
  try{lens.setQuality(quality);lens.render(scene,camera,12);assert.equal(lens.target,null);assert.equal(gpu.renders.length,1);assert.equal(gpu.renders[0].scene,scene);assert.equal(gpu.renders[0].target,null);}
  finally{lens.dispose();}
 }
});

test('a composição restaura destino, atualiza foco e mantém contadores reais',()=>{
 const gpu=renderer(),lens=new ClayOptics(gpu),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.2,80),previous={name:'capture'};gpu.target=previous;
 try{
  lens.setQuality('medium');lens.render(scene,camera,14.5);
  assert.equal(gpu.renders.length,2);assert.equal(gpu.renders[0].target,lens.target);assert.equal(gpu.renders[1].target,previous);assert.equal(gpu.target,previous);
  assert.equal(lens.material.uniforms.focusDistance.value,14.5);assert.equal(lens.material.uniforms.cameraNear.value,.2);assert.equal(lens.material.uniforms.cameraFar.value,80);
  assert.equal(gpu.info.render.calls,24);assert.equal(gpu.info.render.triangles,4201);
  gpu.render=()=>{throw new Error('GPU render failure')};assert.throws(()=>lens.render(scene,camera,12));assert.equal(gpu.target,previous);
 }finally{lens.dispose();}
});

test('trocar qualidade e destruir a lente libera alvos, profundidade e material',()=>{
 const lens=new ClayOptics(renderer());lens.setQuality('medium');
 const target=lens.target;let targetsDisposed=0,materialsDisposed=0;
 target.addEventListener('dispose',()=>targetsDisposed++);lens.material.addEventListener('dispose',()=>materialsDisposed++);
 lens.setQuality('low');assert.equal(targetsDisposed,1);assert.equal(lens.target,null);
 lens.setQuality('high');lens.target.addEventListener('dispose',()=>targetsDisposed++);lens.dispose();
 assert.equal(targetsDisposed,2);assert.equal(materialsDisposed,1);assert.equal(lens.target,null);
});

test('softboxes acompanham o horário sem criar luzes a cada quadro e sombras são liberadas',()=>{
 const kit={group:new THREE.Group(),light:new THREE.DirectionalLight()};kit.group.add(kit.light);
 prepareStudio(kit);const children=kit.group.children.length;prepareStudio(kit,'high');assert.equal(kit.group.children.length,children);assert.equal(kit.light.shadow.mapSize.x,2048);
 assert.ok(kit.studio.bounce.position.z>0,'a softbox aquece o rosto pela frente');
 updateStudio(kit,'morning');const morning=kit.studio.rim.intensity;updateStudio(kit,'night');assert.ok(kit.studio.rim.intensity<morning);assert.equal(kit.studio.bounce.intensity,.38);
 updateStudio(kit,'sunset');assert.equal(kit.studio.bounce.intensity,.3);
 let disposed=0;kit.light.shadow.dispose=()=>disposed++;disposeShadows(kit);assert.equal(disposed,1);
});
