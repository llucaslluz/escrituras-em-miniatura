import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {Viewer} from '../src/engine/viewer.js';
import {AtmosphereController,normalizeAtmosphere} from '../src/engine/atmosphere.js';
import {stories} from '../src/data/catalog.js';
import {builders as bible} from '../src/scenes/bible.js';
import {builders as mormon} from '../src/scenes/mormon.js';
import {builders as dc} from '../src/scenes/dc.js';
import {builders as pearl} from '../src/scenes/pearl.js';

const builders={...bible,...mormon,...dc,...pearl};
function setup(story,preferences={}){
 const kit=new Kit(story.id);builders[story.id](kit);
 if(kit.config.night){kit.background.set('#1b2b39');kit.light.color.set('#b5cef0');kit.light.intensity=1.4;kit.fill.intensity=.8;}
 const scene=new THREE.Scene();scene.background=kit.background;scene.fog=new THREE.Fog(kit.background,26,50);
 const renderer={toneMappingExposure:1.12,render(){}};
 const atmosphere=new AtmosphereController(kit,scene,renderer,preferences);
 return{kit,scene,renderer,atmosphere};
}
function lighting({kit,scene,renderer}){
 return [...kit.light.color.toArray(),...kit.light.position.toArray(),kit.light.intensity,...kit.fill.color.toArray(),...kit.fill.groundColor.toArray(),kit.fill.intensity,...kit.background.toArray(),...scene.fog.color.toArray(),scene.fog.near,scene.fog.far,renderer.toneMappingExposure];
}

test('horários inválidos retornam ao ambiente original',()=>{
 for(const value of [undefined,null,'','late','__proto__'])assert.equal(normalizeAtmosphere(value),'original');
 for(const value of ['morning','sunset','night'])assert.equal(normalizeAtmosphere(value),value);
});

test('os três horários mudam direção, cor, intensidade, preenchimento, atmosfera e exposição',()=>{
 const instance=setup(stories[0]);
 try{
  const result=[];
  for(const choice of ['morning','sunset','night']){instance.atmosphere.set(choice);result.push(lighting(instance));assert.equal(instance.atmosphere.effectiveAtmosphere,choice);}
  for(const [start,end]of [[0,3],[3,6],[6,7],[7,10],[10,13],[13,14],[14,17],[17,20],[22,23]])assert.equal(new Set(result.map(item=>item.slice(start,end).join(','))).size,3,`propriedade de iluminação ${start} distingue os horários`);
 }finally{instance.kit.dispose();}
});

test('72 cenas preservam o horário escolhido durante a narrativa e restauram a luz original',()=>{
 for(const story of stories){
  const actual=setup(story),expected=setup(story);
  try{
   for(const choice of ['morning','sunset','night']){
    actual.atmosphere.set(choice);const preset=lighting(actual);
    for(const time of [0,8,16,24,story.duration,6,0]){
     actual.atmosphere.update(time,story.duration);
     assert.deepEqual(lighting(actual),preset,`${story.id}, ${choice}, ${time}s: horário estável`);
     actual.atmosphere.set('original');expected.atmosphere.update(time,story.duration);
     assert.deepEqual(lighting(actual),lighting(expected),`${story.id}, ${time}s: restaura a iluminação narrativa`);
     actual.atmosphere.set(choice);
    }
   }
  }finally{actual.kit.dispose();expected.kit.dispose();}
 }
});

test('tela imersiva deixa o fundo transparente e conserva a névoa da cena',()=>{
 const instance=setup(stories[0],{immersive:true,atmosphere:'night'});
 try{instance.atmosphere.update(16,32);assert.equal(instance.scene.background,null);assert.ok(instance.scene.fog.color.equals(instance.kit.background));instance.atmosphere.set('original');assert.equal(instance.scene.background,null);}
 finally{instance.kit.dispose();}
});

test('o tema original acompanha a criação da luz e reconhece outros fundos escuros',()=>{
 const creation=setup(stories.find(story=>story.id==='P02'));
 const plan=setup(stories.find(story=>story.id==='D09'));
 try{
  creation.atmosphere.update(0,32);assert.equal(creation.atmosphere.effectiveAtmosphere,'night','a criação começa na escuridão');
  creation.atmosphere.update(32,32);assert.equal(creation.atmosphere.effectiveAtmosphere,'morning','a luz criada muda também o contraste da interface');
  creation.atmosphere.set('sunset');creation.atmosphere.update(0,32);assert.equal(creation.atmosphere.effectiveAtmosphere,'sunset','a escolha manual continua explícita');
  creation.atmosphere.set('original');assert.equal(creation.atmosphere.effectiveAtmosphere,'night','voltar à história recupera o tema do momento atual');
  plan.atmosphere.update(0,32);assert.equal(plan.atmosphere.effectiveAtmosphere,'night','a percepção do fundo prevalece sobre config.night');
 }finally{creation.kit.dispose();plan.kit.dispose();}
});

test('pausa, busca e repetição conservam o horário manual no próprio Viewer',()=>{
 const story=stories.find(item=>item.id==='M10')||stories[0];
 const instance=setup(story,{atmosphere:'sunset'});
 const viewer=Object.assign(Object.create(Viewer.prototype),instance,{story,host:{dataset:{}},controls:{update(){}},time:12,speed:1,playing:false,last:100,frameCount:0,metricStart:100,metricFrame:0,onUpdate(){},labelNodes:[]});
 viewer.atmosphereController=instance.atmosphere;viewer.updateScene();
 const preset=lighting(instance),raf=globalThis.requestAnimationFrame;
 globalThis.requestAnimationFrame=()=>0;
 try{
  viewer.tick(200);viewer.tick(300);assert.equal(viewer.time,12,'a pausa congela o tempo');assert.deepEqual(lighting(instance),preset);
  viewer.seek(24);assert.equal(viewer.time,24);assert.equal(viewer.playing,false);assert.deepEqual(lighting(instance),preset);
  viewer.replay();assert.equal(viewer.time,0);assert.equal(viewer.playing,true);assert.deepEqual(lighting(instance),preset);
  viewer.tick(400);assert.ok(viewer.time>0);assert.deepEqual(lighting(instance),preset);
 }finally{globalThis.requestAnimationFrame=raf;instance.kit.dispose();}
});

test('controle de aproximação respeita os limites e informa o valor real',()=>{
 const camera=new THREE.PerspectiveCamera();camera.position.set(9,7.5,11);
 const viewer=Object.assign(Object.create(Viewer.prototype),{camera,controls:{target:new THREE.Vector3(0,1,0),minDistance:3,maxDistance:25,update(){}},onUpdate(){}});
 for(const [input,expected]of [[-10,0],[0,0],[42,42],[100,100],[110,100]]){viewer.setZoomPercent(input);assert.ok(Math.abs(viewer.zoomPercent-expected)<1e-10);}
 const before=viewer.camera.position.clone();viewer.setZoomPercent('inválido');assert.ok(viewer.camera.position.equals(before));
});
