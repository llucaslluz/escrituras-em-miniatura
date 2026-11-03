import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { clipWaterToPlinth } from '../src/engine/clay-style.js';
import { Kit } from '../src/engine/kit.js';
import { builders as bible } from '../src/scenes/bible.js';
import { builders as mormon } from '../src/scenes/mormon.js';
import { builders as dc } from '../src/scenes/dc.js';
import { builders as pearl } from '../src/scenes/pearl.js';

const builders = { ...bible, ...mormon, ...dc, ...pearl };
const waterStories = ['B01', 'B05', 'B09', 'B13', 'B17', 'B18', 'B22', 'B23', 'M01', 'M02', 'M05', 'M09', 'M11', 'D01', 'P02', 'P04'];
function surfaces(kit) { const result = []; kit.group.traverse(object => { if (object.geometry?.userData.clayWaterSurface) result.push(object); }); return result; }
function assertContained(object, message) {
  const position = object.geometry.attributes.position, point = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld);
    assert.ok(Math.hypot(point.x, point.z) <= 5.84001, `${message}: vértice ${i} ultrapassa a base`);
    assert.ok(point.toArray().every(Number.isFinite), `${message}: geometria finita`);
  }
}

test('Recorte da água preserva altura, topologia e restaura posições ao mover/voltar', () => {
  const geometry = new THREE.PlaneGeometry(10, 10, 16, 16); geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position, original = new Float32Array(position.array), count = position.count, indices = [...geometry.index.array];
  try {
    clipWaterToPlinth(geometry);
    const centered = new Float32Array(position.array);
    assert.notDeepEqual(centered, original, 'as quinas que saíam da base foram recortadas');
    for (const [x, z] of [[3.85, 0], [-3.85, 0], [0, 1.2], [0, 0]]) {
      clipWaterToPlinth(geometry, x, z);
      for (let i = 0; i < count; i++) {
        assert.ok(Math.hypot(position.getX(i) + x, position.getZ(i) + z) <= 5.84001);
        assert.equal(position.getY(i), original[i * 3 + 1], 'o recorte horizontal não altera o nível narrativo da água');
      }
    }
    assert.deepEqual(position.array, centered, 'o movimento não acumula achatamento do recorte');
    assert.equal(position.count, count); assert.deepEqual([...geometry.index.array], indices, 'a malha continua compatível com a animação de ondas');
  } finally { geometry.dispose(); }
});

test('Água e espuma das 16 histórias permanecem dentro da miniatura durante toda a ação', () => {
  for (const id of waterStories) {
    const kit = new Kit(id); builders[id](kit);
    try {
      const water = surfaces(kit); assert.ok(water.length > 0, `${id}: superfícies horizontais foram incluídas`);
      for (const time of [0, 5, 12, 20, 32, 45]) {
        kit.update(time); kit.group.updateMatrixWorld(true);
        water.forEach(object => assertContained(object, `${id} em ${time}s`));
        kit.group.traverse(object => { if (object.userData.clayWaterRipple && object.visible) assertContained(object, `${id}: espuma em ${time}s`); });
      }
      const before = water.map(object => Array.from(object.geometry.attributes.position.array));
      kit.update(8);
      assert.ok(water.some((object, i) => object.geometry.attributes.position.array.some((value, j) => j % 3 === 1 && value !== before[i][j])), `${id}: ondas continuam em movimento`);
    } finally { kit.dispose(); }
  }
});

test('B05: ondas esculpidas revelam a passagem e retornam ao mesmo estado ao buscar o tempo', () => {
  const kit = new Kit('B05'); bible.B05(kit);
  try {
    const water = surfaces(kit), walls = [], foam = [];
    let sea;
    kit.group.traverse(object => {
      if (object.userData.redSea) sea = object;
      if (object.userData.redSeaWall) walls.push(object);
      if (object.userData.redSeaFoam) foam.push(object);
    });
    assert.ok(sea, 'o mar esculpido permanece identificado na história');
    assert.equal(water.length, 2); assert.equal(walls.length, 2);
    assert.deepEqual(walls.map(object => object.userData.redSeaWall).sort(), ['left', 'right']);
    assert.ok(foam.length > 0, 'as cristas têm espuma modelada');
    kit.update(0);
    assert.equal(sea.userData.redSeaOpen, 0);
    assert.ok(walls.every(object => !object.visible));
    assert.ok(foam.every(object => !object.visible));
    assert.ok(water.some(object => {
      const p = object.geometry.attributes.position;
      return Array.from({ length: p.count }, (_, i) => Math.abs(p.getX(i))).some(x => x < .01);
    }), 'antes da abertura a água alcança o centro');
    kit.update(20); kit.group.updateMatrixWorld(true);
    assert.equal(sea.userData.redSeaOpen, 1);
    assert.ok(walls.every(object => object.visible));
    assert.ok(foam.some(object => object.visible));
    for (const wall of walls) {
      assertContained(wall, 'a crista acompanha a borda da miniatura');
      const position = wall.geometry.attributes.position;
      let maximum = 0;
      for (let i = 0; i < position.count; i++) {
        maximum = Math.max(maximum, position.getY(i));
        assert.ok(Math.abs(position.getX(i)) > 1, 'as cristas preservam o corredor entre os dois lados');
      }
      assert.ok(maximum > 2.8, 'a água conserva altura e volume em vez de ser achatada pelo recorte horizontal');
      assert.equal(wall.geometry.userData.clayWaterSurface, undefined);
    }
    for (const surface of water) {
      assertContained(surface, 'o mar horizontal permanece dentro da base');
      const p = surface.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) assert.ok(Math.abs(p.getX(i) + surface.parent.position.x) > 1.6, 'o leito central permanece seco e aberto');
    }
    const snapshot = () => [...water, ...walls, ...foam].map(object => ({
      position: Array.from(object.geometry.attributes.position.array),
      instances: object.instanceMatrix ? Array.from(object.instanceMatrix.array) : null,
      visible: object.visible,
    }));
    const opened = snapshot();
    kit.update(0); kit.update(32); kit.update(20);
    assert.deepEqual(snapshot(), opened, 'busca direta e reprodução recompõem as mesmas ondas e espuma no mesmo instante');
  } finally { kit.dispose(); }
});
