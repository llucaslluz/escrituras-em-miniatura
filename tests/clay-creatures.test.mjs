import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Kit } from '../src/engine/kit.js';
import { builders } from '../src/scenes/bible.js';

function buildDen() { const kit = new Kit('B11'); builders.B11(kit); return kit; }
function transforms(kit) {
  const values = [];
  kit.group.updateMatrixWorld(true);
  kit.group.traverse(object => values.push(...object.position.toArray(), ...object.rotation.toArray().slice(0, 3), ...object.scale.toArray(), Number(object.visible)));
  return values;
}

test('B11: cinco leões tranquilos, dois em repouso, sem perder os personagens do relato', () => {
  const kit = buildDen();
  try {
    const lions = kit.selectables.filter(entry => entry.name === 'Leões da cova').map(entry => entry.object);
    assert.equal(lions.length, 5);
    assert.equal(lions.filter(lion => lion.userData.resting).length, 2);
    assert.deepEqual(kit.people.map(rig => rig.root.userData.selectable), ['Daniel', 'Anjo de proteção', 'Dario']);
    kit.update(20);
    const restingHeads = lions.filter(lion => lion.userData.resting).map(lion => lion.userData.head.position.y);
    const standingHeads = lions.filter(lion => !lion.userData.resting).map(lion => lion.userData.head.position.y);
    assert.ok(Math.max(...restingHeads) < Math.min(...standingHeads), 'o repouso altera a pose, não só um rótulo');
    for (const lion of lions) assert.ok(lion.userData.tail && lion.userData.paws.length === 4, 'leões preservam cauda e quatro patas');
    const daniel = kit.people.find(rig => rig.root.userData.selectable === 'Daniel');
    daniel.root.traverse(object => { if (object.material) assert.equal(object.material.opacity, 1, 'a revelação do anjo não apaga materiais compartilhados de Daniel'); });
  } finally { kit.dispose(); }
});

test('B11: o anjo e Dario entram nos momentos próprios e voltar no tempo recompõe a cena', () => {
  const kit = buildDen();
  try {
    const angel = kit.people.find(rig => rig.root.userData.selectable === 'Anjo de proteção').root;
    const king = kit.people.find(rig => rig.root.userData.selectable === 'Dario').root;
    kit.update(0); assert.equal(angel.visible, false); assert.equal(king.visible, false);
    kit.update(20); assert.equal(angel.visible, true); assert.equal(king.visible, false);
    const middle = transforms(kit);
    kit.update(32); assert.equal(king.visible, true);
    kit.update(0); assert.equal(angel.visible, false); assert.equal(king.visible, false);
    kit.update(20); assert.deepEqual(transforms(kit), middle, 'buscar ou repetir não acumula transformações');
  } finally { kit.dispose(); }
});

test('B11: a seleção atravessa as peças instanciadas e identifica o leão inteiro', () => {
  const kit = buildDen();
  try {
    kit.update(20); kit.group.updateMatrixWorld(true);
    const lion = kit.selectables.find(entry => entry.name === 'Leões da cova').object;
    const bounds = new THREE.Box3().setFromObject(lion);
    const target = bounds.getCenter(new THREE.Vector3());
    const ray = new THREE.Raycaster(target.clone().add(new THREE.Vector3(0, .15, 4)), new THREE.Vector3(0, -.15, -4).normalize());
    const hits = ray.intersectObject(lion, true);
    assert.ok(hits.length > 0, 'as peças de argila continuam selecionáveis');
    let selected = hits[0].object;
    while (selected && !selected.userData.selectable) selected = selected.parent;
    assert.equal(selected, lion);
    assert.ok(hits.some(hit => hit.object.isInstancedMesh), 'o teste alcança a geometria instanciada');
  } finally { kit.dispose(); }
});

test('Animais de massinha: variantes, asas articuladas e descarte completo dos recursos usados', () => {
  const kit = new Kit('clay-creatures');
  const creatures = ['lion', 'sheep', 'donkey', 'fish', 'bird'].map((kind, i) => kit.animal(kind, i * .9 - 2, 0, .8));
  const dove = kit.dove(0, 2.5, 0); creatures.push(dove);
  for (const time of [0, 4, 18, 32]) {
    kit.update(time);
    assert.ok(transforms(kit).every(Number.isFinite));
    for (const creature of creatures) {
      const bounds = new THREE.Box3().setFromObject(creature);
      assert.equal(bounds.isEmpty(), false);
      assert.ok([...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite));
    }
  }
  assert.equal(dove.userData.wings.length, 2, 'o contrato usado nas cenas de voo é preservado');
  kit.update(0); const wingBefore = dove.userData.wings[0].rotation.z;
  kit.update(.2); assert.notEqual(dove.userData.wings[0].rotation.z, wingBefore);
  const geometries = new Set(), materials = new Set(); let disposedGeometries = 0, disposedMaterials = 0;
  kit.group.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
  geometries.forEach(geometry => geometry.addEventListener('dispose', () => disposedGeometries++));
  materials.forEach(material => material.addEventListener('dispose', () => disposedMaterials++));
  kit.dispose();
  assert.equal(disposedGeometries, geometries.size);
  assert.equal(disposedMaterials, materials.size);
  assert.equal(kit.group.children.length, 0);
});
