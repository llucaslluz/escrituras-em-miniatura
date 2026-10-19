import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Viewer} from '../src/engine/viewer.js';
import {Kit} from '../src/engine/kit.js';
import {AtmosphereController} from '../src/engine/atmosphere.js';
import {stories} from '../src/data/catalog.js';
import {builders as bible} from '../src/scenes/bible.js';
import {builders as mormon} from '../src/scenes/mormon.js';
import {builders as dc} from '../src/scenes/dc.js';
import {builders as pearl} from '../src/scenes/pearl.js';

const builders={...bible,...mormon,...dc,...pearl};
function viewerAt(time=0,options={}){
 const samples=[];
 const viewer=Object.assign(Object.create(Viewer.prototype),{
  host:{dataset:{}},preferences:{},story:{duration:32},time,speed:1,playing:true,
  kit:{},atmosphereController:{update(t){samples.push(t)},effectiveAtmosphere:'morning'},
  controls:{update(){}},renderer:{render(){}},labelNodes:[],frameCount:0,
  last:1000,metricStart:1000,metricFrame:0,onUpdate(){},...options
 });
 return{viewer,samples};
}
function frame(viewer,now){
 const raf=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=()=>0;
 try{viewer.tick(now);}finally{globalThis.requestAnimationFrame=raf;}
}
function close(actual,expected){assert.ok(Math.abs(actual-expected)<1e-10,`${actual} ≈ ${expected}`);}
function snapshot(kit){
 const values=[];kit.group.updateMatrixWorld(true);
 kit.group.traverse(object=>{
  values.push(...object.position.toArray(),...object.rotation.toArray().slice(0,3),...object.scale.toArray(),object.visible?1:0);
  if(object.isLight)values.push(object.intensity,...object.color.toArray());
  const positions=object.geometry?.attributes?.position;
  if(positions)for(let i=0;i<Math.min(positions.array.length,90);i++)values.push(positions.array[i]);
 });
 values.push(...kit.background.toArray());return values;
}

test('repetição é a preferência padrão e aceita desligamento explícito',()=>{
 // WebGL is unavailable in Node; preference initialization precedes its fallback.
 for(const [preferences,expected]of [[{},true],[{reduced:true},true],[{loop:false},false]]){
  const host={dataset:{}};const viewer=new Viewer(host,preferences);
  assert.equal(viewer.loop,expected);assert.equal(host.dataset.looping,String(expected));
 }
});

test('o limite reinicia no zero e conserva o restante do quadro seguinte',()=>{
 const exact=viewerAt(31.925);frame(exact.viewer,1075);
 close(exact.viewer.time,0);close(exact.samples.at(-1),0);
 const residual=viewerAt(31.99);frame(residual.viewer,1075);
 close(residual.viewer.time,.065);close(residual.samples.at(-1),.065);
 assert.equal(residual.viewer.host.dataset.looping,'true');
 assert.equal(residual.viewer.host.dataset.animationTime,'0.065');
});

test('vários ciclos e velocidades continuam dentro da duração sem acumular deriva',()=>{
 const {viewer}=viewerAt(.02,{story:{duration:.1},speed:2});
 for(let i=1;i<=20;i++){
  frame(viewer,1000+i*75);
  assert.ok(viewer.time>=0&&viewer.time<.1);
  close(viewer.time,(.02+i*.15)%.1);
 }
});

test('pausar congela o ciclo e continuar cruza o limite normalmente',()=>{
 const {viewer}=viewerAt(31.99,{playing:false});frame(viewer,1075);
 close(viewer.time,31.99);assert.equal(viewer.host.dataset.playing,'false');
 viewer.toggle();frame(viewer,1150);close(viewer.time,.065);
});

test('desligar repetição conserva o fim narrativo e o movimento do ambiente',()=>{
 const {viewer,samples}=viewerAt(31.99);viewer.setLoop(false);frame(viewer,1075);frame(viewer,1150);
 close(viewer.time,32.14);close(samples.at(-1),32.14);
 assert.equal(viewer.playing,true);assert.equal(viewer.host.dataset.looping,'false');
 viewer.setLoop(true);close(viewer.time,0);close(samples.at(-1),0);
 frame(viewer,1225);close(viewer.time,.075);
});

test('buscar o último instante mantém a pausa e rever preserva a escolha de repetição',()=>{
 const {viewer}=viewerAt(4,{playing:false});viewer.setLoop(false);
 viewer.seek(100);assert.equal(viewer.time,32);assert.equal(viewer.playing,false);
 viewer.seek(-2);assert.equal(viewer.time,0);assert.equal(viewer.playing,false);
 viewer.replay();assert.equal(viewer.time,0);assert.equal(viewer.playing,true);assert.equal(viewer.loop,false);
 viewer.setLoop(true);viewer.seek(32);viewer.toggle();frame(viewer,1075);
 assert.equal(viewer.time,32,'o instante final pode ser inspecionado em pausa');
 viewer.toggle();frame(viewer,1150);close(viewer.time,.075);
});

test('preferências mantêm movimento reduzido pausado sem desligar a repetição',()=>{
 const {viewer}=viewerAt(10,{renderer:null});
 viewer.applyPreferences({reduced:true});assert.equal(viewer.playing,false);assert.equal(viewer.loop,true);
 viewer.applyPreferences({reduced:true,loop:false});assert.equal(viewer.playing,false);assert.equal(viewer.loop,false);
 viewer.applyPreferences({reduced:false,loop:true});assert.equal(viewer.playing,false,'alterar a repetição não despausa a cena');assert.equal(viewer.loop,true);
});

test('72 cenas recomeçam com transformações e luz originais sem estado do ciclo anterior',()=>{
 for(const story of stories){
  const kit=new Kit(story.id);builders[story.id](kit);
  if(kit.config.night){kit.background.set('#1b2b39');kit.light.color.set('#b5cef0');kit.light.intensity=1.4;kit.fill.intensity=.8;}
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(kit.background,26,50);
  const renderer={toneMappingExposure:1.12,render(){}};
  const atmosphereController=new AtmosphereController(kit,scene,renderer);
  const {viewer}=viewerAt(0,{story,kit,scene,renderer,atmosphereController});
  try{
   viewer.updateScene();const beginning=snapshot(kit);
   viewer.seek(story.duration);viewer.time=story.duration-.075;
   frame(viewer,1075);close(viewer.time,0);
   assert.deepEqual(snapshot(kit),beginning,`${story.id}: o início completo volta depois do fim`);
   viewer.setAtmosphere('sunset');const light=kit.light.color.toArray();
   viewer.seek(story.duration);frame(viewer,1150);
   assert.deepEqual(kit.light.color.toArray(),light,`${story.id}: horário manual atravessa o loop`);
  }finally{kit.dispose();}
 }
});
