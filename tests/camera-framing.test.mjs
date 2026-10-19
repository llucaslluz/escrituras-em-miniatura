import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Kit} from '../src/engine/kit.js';
import {Viewer} from '../src/engine/viewer.js';
import {stories} from '../src/data/catalog.js';
import {builders as bible} from '../src/scenes/bible.js';
import {builders as mormon} from '../src/scenes/mormon.js';
import {builders as dc} from '../src/scenes/dc.js';
import {builders as pearl} from '../src/scenes/pearl.js';

const builders={...bible,...mormon,...dc,...pearl};
function viewerFor(kit){
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);
 const controls={target:new THREE.Vector3(),minDistance:3,maxDistance:25,update(){camera.lookAt(this.target);camera.updateMatrixWorld(true)}};
 return Object.assign(Object.create(Viewer.prototype),{camera,controls,host:{getBoundingClientRect:()=>({width:800,height:600})},renderer:{setSize(){}},immersive:false,views:kit.config.views||[{camera:kit.config.camera,target:kit.config.target}],onUpdate(){}});
}

test('a base completa das 72 vistas gerais cabe na captura 800×600 com margem',()=>{
 const point=new THREE.Vector3();
 for(const story of stories){
  const kit=new Kit(story.id);builders[story.id](kit);
  try{
   const viewer=viewerFor(kit);viewer.setView(0);
   for(const y of [0,-.55])for(let i=0;i<512;i++){
    const angle=i/512*Math.PI*2;point.set(Math.cos(angle)*6,y,Math.sin(angle)*6).project(viewer.camera);
    assert.ok(Math.abs(point.x)<=.9401&&Math.abs(point.y)<=.9401,`${story.id}: borda da base em (${point.x},${point.y})`);
    assert.ok(point.z>-1&&point.z<1,`${story.id}: base dentro da profundidade da câmera`);
   }
  }finally{kit.dispose();}
 }
});

test('o ajuste inicial não desfaz zoom manual ao redimensionar nem altera vista de detalhe',()=>{
 const kit=new Kit('D01');builders.D01(kit);
 try{
  const viewer=viewerFor(kit);viewer.setView(0);const fov=viewer.camera.fov;
  viewer.zoom(.8);const position=viewer.camera.position.clone();viewer.resize();
  assert.ok(viewer.camera.position.equals(position),'a câmera mantém a aproximação escolhida');assert.equal(viewer.camera.fov,fov,'a margem inicial permanece ancorada à vista autoral');
  const detail={label:'Detalhe',camera:[3,2,4],target:[0,1,0]};viewer.views.push(detail);viewer.setView(viewer.views.length-1);
  assert.equal(viewer.camera.fov,38);assert.deepEqual(viewer.camera.position.toArray(),detail.camera);
 }finally{kit.dispose();}
});
