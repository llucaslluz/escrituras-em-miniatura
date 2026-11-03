import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Kit } from '../src/engine/kit.js';
import { createPartedSea } from '../src/scenes/bible/red-sea-water.js';

function snapshot(sea) {
  const result = [];
  sea.root.traverse(object => {
    result.push(Number(object.visible));
    if (object.geometry?.attributes.position) result.push(...object.geometry.attributes.position.array);
    if (object.geometry?.attributes.normal) result.push(...object.geometry.attributes.normal.array);
    if (object.isInstancedMesh) result.push(...object.instanceMatrix.array);
  }); return result;
}

test('A espuma e as gotinhas surgem em opacidade gradual durante a abertura',()=>{
 const kit=new Kit('B05-wave-reveal'),sea=createPartedSea(kit);
 try{
  sea.update(.05,4);
  assert.ok(sea.foams.some(foam=>foam.visible));
  assert.ok(sea.foams.every(foam=>foam.material.opacity>0&&foam.material.opacity<.3),'a espuma não entra já opaca');
  sea.update(.21,7);
  assert.equal(sea.droplets.visible,true);
  assert.ok(sea.droplets.material.opacity>0&&sea.droplets.material.opacity<.01,'as primeiras gotinhas são quase transparentes');
  sea.update(1,20);const expected=sea.foams.map(foam=>foam.material.opacity);
  sea.update(0,0);sea.update(1,20);assert.deepEqual(sea.foams.map(foam=>foam.material.opacity),expected);
 }finally{kit.dispose();}
});

test('Mar Vermelho: duas águas baixas separam-se e revelam passagem sob cristas esculpidas', () => {
  const kit = new Kit('B05-wave-profile'), sea = createPartedSea(kit);
  try {
    assert.equal(sea.surfaces.length, 2); assert.equal(sea.walls.length, 2);
    sea.update(0, 0);
    assert.ok(sea.walls.every(wall => !wall.visible));
    for (const surface of sea.surfaces) {
      assert.ok(surface.geometry.userData.clayWaterSurface);
      assert.equal(surface.parent.position.y, .12);
      const p = surface.geometry.attributes.position;
      assert.ok(Array.from({ length: p.count }, (_, i) => Math.abs(p.getX(i))).some(x => x < .0001), 'o mar fechado cobre o centro');
    }
    sea.update(1, 20);
    for (const surface of sea.surfaces) {
      const p = surface.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) assert.ok(Math.abs(p.getX(i)) >= 1.6499, 'a areia recebe um corredor largo e livre');
    }
    for (const wall of sea.walls) {
      assert.ok(wall.visible);
      const p = wall.geometry.attributes.position; let top = 0, inner = 100, front = 0, back = 0;
      for (let i = 0; i < p.count; i++) { top = Math.max(top, p.getY(i)); inner = Math.min(inner, Math.abs(p.getX(i))); if (p.getZ(i) > 3.1) front = Math.max(front, p.getY(i)); if (p.getZ(i) < -4.3) back = Math.max(back, p.getY(i)); }
      assert.ok(top > 2.8 && top < 3.4, 'paredes têm volume e altura de uma onda de miniatura');
      assert.ok(inner >= 1.1 && inner < 1.3, 'a crista curva para dentro sem fechar a passagem de 2,2 metros de escala');
      assert.ok(front < top * .25 && back < top * .25, 'extremidades descem suavemente até o mar');
    }
  } finally { kit.dispose(); }
});

test('Ondas, espuma e gotinhas ficam sobre a base, com formas finitas e suaves', () => {
  const kit = new Kit('B05-wave-bounds'), sea = createPartedSea(kit), instance = new THREE.Matrix4(), matrix = new THREE.Matrix4(), point = new THREE.Vector3();
  try {
    sea.update(1, 24); kit.group.updateMatrixWorld(true);
    let foam = 0, calls = 0;
    sea.root.traverse(object => {
      if (!object.isMesh) return; calls++; if (object.userData.redSeaFoam) foam++;
      const p = object.geometry.attributes.position;
      for (let n = 0; n < (object.isInstancedMesh ? object.count : 1); n++) {
        if (object.isInstancedMesh) { object.getMatrixAt(n, instance); matrix.multiplyMatrices(object.matrixWorld, instance); } else matrix.copy(object.matrixWorld);
        for (let i = 0; i < p.count; i++) { point.fromBufferAttribute(p, i).applyMatrix4(matrix); assert.ok(point.toArray().every(Number.isFinite)); assert.ok(Math.hypot(point.x, point.z) <= sea.radius + .00001, 'ondas e espuma não voltam às quinas fora da base'); }
      }
      const normals = object.geometry.attributes.normal;
      if (normals) assert.ok(Array.from(normals.array).every(Number.isFinite));
    });
    assert.ok(foam > 0 && sea.droplets.count > 0);
    assert.ok(calls <= 40, 'espuma detalhada usa instâncias, sem uma chamada de desenho para cada bolha');
  } finally { kit.dispose(); }
});

test('Abrir, fechar e buscar outro instante recompõem as mesmas ondas e espuma sem acumular estado', () => {
  const kit = new Kit('B05-wave-replay'), sea = createPartedSea(kit);
  try {
    sea.update(1, 18); const expected = snapshot(sea);
    sea.update(.25, 8); assert.notDeepEqual(snapshot(sea), expected);
    sea.update(0, 0); sea.update(1, 32); sea.update(1, 18);
    assert.deepEqual(snapshot(sea), expected);
    sea.update(1, 19); assert.notDeepEqual(snapshot(sea), expected, 'o mar continua vivo mesmo com a passagem totalmente aberta');
    sea.update(0, 0); assert.equal(sea.droplets.visible, false); assert.ok(sea.foams.every(foam => !foam.visible));
  } finally { kit.dispose(); }
});

test('Amostras de superfície acompanham faces internas e externas para encaixar detalhes na água', () => {
  const kit = new Kit('B05-wave-sampling'), sea = createPartedSea(kit);
  try {
    sea.update(1, 18);
    const samples = [];
    for (const side of [-1, 1]) for (const z of [-2.5, -.5, 1.5]) for (const y of [.55, 1.1, 1.6]) {
      const inner = sea.sampleWall(side, z, y, 'inner'), outer = sea.sampleWall(side, z, y, 'outer');
      assert.ok(inner.toArray().every(Number.isFinite) && outer.toArray().every(Number.isFinite));
      assert.ok(Math.abs(inner.y - y) < .00001 && Math.abs(outer.y - y) < .00001, 'os detalhes mantêm a altura desejada');
      assert.ok(Math.abs(outer.x) > Math.abs(inner.x) + .3, 'faces são amostradas em lados diferentes do volume, não em uma lâmina');
      assert.equal(inner.z, z); assert.equal(outer.z, z); samples.push(inner.toArray(), outer.toArray());
    }
    sea.update(0, 0); sea.update(1, 18); let n = 0;
    for (const side of [-1, 1]) for (const z of [-2.5, -.5, 1.5]) for (const y of [.55, 1.1, 1.6]) { assert.deepEqual(sea.sampleWall(side, z, y, 'inner').toArray(), samples[n++]); assert.deepEqual(sea.sampleWall(side, z, y, 'outer').toArray(), samples[n++]); }
  } finally { kit.dispose(); }
});
