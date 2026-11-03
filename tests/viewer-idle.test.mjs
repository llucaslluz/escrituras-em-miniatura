import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Viewer} from '../src/engine/viewer.js';

function fixture(playing=false){
 let renders=0,updates=0,cameraChanged=false;
 const viewer=Object.assign(Object.create(Viewer.prototype),{host:{dataset:{}},story:{duration:32},time:7,speed:1,playing,loop:true,kit:{},scene:{},camera:{},controls:{update(){const changed=cameraChanged;cameraChanged=false;return changed;}},renderer:{render(){renders++;},info:{render:{calls:5,triangles:20},memory:{geometries:3}}},atmosphereController:{update(){updates++;},set(){}},labelNodes:[],frameCount:0,last:0,needsRender:true,onUpdate(){}});
 return{viewer,get renders(){return renders;},get updates(){return updates;},moveCamera(){cameraChanged=true;}};
}
function tick(viewer,now){const old=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=()=>1;try{viewer.tick(now);}finally{globalThis.requestAnimationFrame=old;}}

test('pausa estável conserva a imagem e o instante sem repetir renders',()=>{
 const f=fixture();tick(f.viewer,16);
 for(let i=2;i<=120;i++)tick(f.viewer,i*16);
 assert.equal(f.renders,1);assert.equal(f.updates,1);assert.equal(f.viewer.time,7);
 assert.equal(f.viewer.host.dataset.renderMode,'paused-idle');assert.equal(f.viewer.host.dataset.renderedFrames,'1');
});

test('câmera, busca temporal, atmosfera e nomes continuam atualizando em pausa',()=>{
 const f=fixture();tick(f.viewer,16);f.moveCamera();tick(f.viewer,32);assert.equal(f.renders,2);
 f.viewer.seek(19);tick(f.viewer,48);assert.equal(f.renders,3);assert.equal(f.viewer.time,19);
 f.viewer.setAtmosphere('night');tick(f.viewer,64);assert.equal(f.renders,4);
 f.viewer.names=true;tick(f.viewer,80);assert.equal(f.renders,5);
 tick(f.viewer,96);assert.equal(f.renders,5);
 f.viewer.invalidate();tick(f.viewer,112);assert.equal(f.renders,6);
});

test('reprodução e retomada mantêm o relógio e a sequência de renderização',()=>{
 const f=fixture(true);for(let i=1;i<=20;i++)tick(f.viewer,i*16);
 assert.equal(f.renders,20);assert.ok(Math.abs(f.viewer.time-7.32)<1e-9);
 f.viewer.toggle();tick(f.viewer,336);const paused=f.viewer.time,renders=f.renders;
 tick(f.viewer,352);assert.equal(f.renders,renders);assert.equal(f.viewer.time,paused);
 f.viewer.toggle();tick(f.viewer,368);assert.equal(f.renders,renders+1);assert.ok(f.viewer.time>paused);
});

test('documento oculto suspende o trabalho e retorna sem saltar momentos',()=>{
 const old=globalThis.document,f=fixture(true);globalThis.document={visibilityState:'hidden'};
 try{tick(f.viewer,1000);tick(f.viewer,5000);assert.equal(f.renders,0);assert.equal(f.viewer.time,7);assert.equal(f.viewer.host.dataset.renderMode,'hidden');globalThis.document.visibilityState='visible';tick(f.viewer,5016);assert.equal(f.renders,1);assert.ok(Math.abs(f.viewer.time-7.016)<1e-9);}
 finally{if(old===undefined)delete globalThis.document;else globalThis.document=old;}
});

test('atalhos modificados pertencem ao navegador e teclas simples mantêm a câmera',()=>{
 const f=fixture(),calls=[];f.viewer.zoom=n=>calls.push(['zoom',n]);f.viewer.orbit=n=>calls.push(['orbit',n]);
 for(const modifier of ['ctrlKey','metaKey','altKey'])for(const key of ['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown']){
  let prevented=false;f.viewer.onKeyDown({key,[modifier]:true,preventDefault(){prevented=true;}});
  assert.equal(prevented,false,`${modifier} ${key}`);assert.equal(calls.length,0);
 }
 for(const key of ['=','-','ArrowLeft','ArrowRight']){let prevented=false;f.viewer.onKeyDown({key,preventDefault(){prevented=true;}});assert.equal(prevented,true);}
 assert.deepEqual(calls,[['zoom',.85],['zoom',1.15],['orbit',-.16],['orbit',.16]]);
});

test('seta vertical em pausa invalida a câmera sem avançar a narrativa',()=>{
 const f=fixture();f.viewer.camera=new THREE.PerspectiveCamera(38,1,.1,100);f.viewer.camera.position.set(9,7.5,11);f.viewer.controls.target=new THREE.Vector3(0,1,0);
 tick(f.viewer,16);const before=f.viewer.camera.position.clone();let prevented=false;
 f.viewer.onKeyDown({key:'ArrowUp',preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.ok(f.viewer.camera.position.distanceTo(before)>0);assert.equal(f.viewer.needsRender,true);
 tick(f.viewer,32);assert.equal(f.renders,2);assert.equal(f.viewer.time,7);tick(f.viewer,48);assert.equal(f.renders,2);
});

 test('redimensionar em pausa redesenha a projeção uma vez e retorna ao repouso',()=>{
 const f=fixture();tick(f.viewer,16);assert.equal(f.renders,1);f.viewer.host.getBoundingClientRect=()=>({width:390,height:844});f.viewer.camera=new THREE.PerspectiveCamera(38,1,.1,100);f.viewer.renderer.setSize=()=>{};f.viewer.resize();tick(f.viewer,32);assert.equal(f.renders,2);assert.equal(f.viewer.camera.aspect,390/844);tick(f.viewer,48);assert.equal(f.renders,2);
 });
