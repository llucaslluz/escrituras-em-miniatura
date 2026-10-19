import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Kit } from '../src/engine/kit.js';
import { builders } from '../src/scenes/mormon.js';
import { stories as mormon } from '../src/data/mormon.js';
import { stories as bible } from '../src/data/bible.js';

function build(id) {
  const kit = new Kit(id);
  builders[id](kit);
  return kit;
}

test('M19: exatamente dezesseis pedras, iluminadas individualmente depois do toque', () => {
  const kit = build('M19');
  try {
    const stones = [];
    kit.group.traverse(object => { if (object.userData.jaredStone) stones.push(object); });
    assert.equal(stones.length, 16, 'oito barcos recebem duas pedras cada');
    assert.deepEqual(stones.map(stone => stone.userData.jaredStone).sort((a,b) => a-b), Array.from({ length: 16 }, (_,i) => i+1));
    assert.equal(new Set(stones.map(stone => stone.name)).size, 16, 'cada pedra tem identificação própria');
    assert.equal(new Set(stones.map(stone => stone.material)).size, 16, 'cada pedra controla sua própria iluminação');
    const rows = new Map();
    for (const stone of stones) rows.set(stone.position.z, (rows.get(stone.position.z) || 0)+1);
    assert.deepEqual([...rows.values()], [8,8], 'duas fileiras completas de oito');
    kit.update(0);
    assert.ok(stones.every(stone => stone.material.emissiveIntensity === 0), 'não brilham antes do toque');
    kit.update(14.4);
    assert.ok(stones[0].material.emissiveIntensity > 2);
    assert.ok(stones.slice(1).every(stone => stone.material.emissiveIntensity === 0), 'a iluminação não acontece toda de uma vez');
    kit.update(32);
    assert.ok(stones.every(stone => stone.material.emissiveIntensity > 2), 'as dezesseis foram iluminadas');
  } finally { kit.dispose(); }
});

test('M15: oito projéteis visíveis passam sem tocar a figura de Samuel', () => {
  const kit = build('M15');
  try {
    const projectiles = [];
    kit.group.traverse(object => { if (object.userData.samuelProjectile) projectiles.push(object); });
    assert.equal(projectiles.length, 8, 'quatro flechas e quatro pedras');
    const samuel = kit.people.find(rig => rig.root.userData.selectable === 'Samuel');
    assert.ok(samuel, 'a figura protegida está identificada');
    const visibleAtLeastOnce = new Set();
    const protectedBounds = new THREE.Box3(), projectileBounds = new THREE.Box3();
    // Conservative bounds include the entire figure and its moving arms. A miss
    // against this volume also excludes intersections with the smaller meshes.
    for (let sample = 0; sample <= 275; sample++) {
      const time = 16 + sample*.04;
      kit.update(time);
      kit.group.updateMatrixWorld(true);
      protectedBounds.setFromObject(samuel.root);
      for (const projectile of projectiles) {
        if (!projectile.visible) continue;
        visibleAtLeastOnce.add(projectile);
        projectileBounds.setFromObject(projectile);
        assert.equal(protectedBounds.intersectsBox(projectileBounds), false, `projétil atinge o volume de Samuel em ${time.toFixed(2)} s`);
      }
    }
    assert.equal(visibleAtLeastOnce.size, 8, 'a proteção não é obtida ocultando os projéteis');
  } finally { kit.dispose(); }
});

test('Nomes distinguem identidades homônimas no catálogo e nas figuras', () => {
  const names = (catalog,id) => catalog.find(story => story.id === id).characters.map(character => character.name);
  assert.ok(names(bible,'B01').includes('Noé'));
  assert.ok(names(mormon,'M08').includes('Rei Noé'));
  assert.ok(!names(mormon,'M08').includes('Noé'), 'o rei não se funde ao construtor da arca');
  assert.ok(names(bible,'B03').includes('Benjamim'));
  assert.ok(names(mormon,'M07').includes('Rei Benjamim'));
  assert.ok(!names(mormon,'M07').includes('Benjamim'), 'o rei não se funde ao irmão de José');
  assert.ok(names(mormon,'M01').includes('Néfi'));
  assert.ok(names(mormon,'M16').includes('Néfi, discípulo de Cristo'));
  assert.ok(!names(mormon,'M16').includes('Néfi'), 'o discípulo não se funde ao filho de Leí');
  for (const [id, expected] of [['M07','Rei Benjamim'], ['M08','Rei Noé'], ['M16','Néfi, discípulo de Cristo']]) {
    const kit = build(id);
    try {
      const rigs = kit.people.map(rig => rig.root.userData.selectable);
      assert.equal(rigs.filter(name => name === expected).length, 1, `${id}: identificação do personagem no modelo corresponde ao catálogo`);
      const selected = kit.selectables.find(entry => entry.name === expected);
      assert.ok(selected.reference && selected.summary, `${id}: contexto acessível permanece vinculado à identidade`);
    } finally { kit.dispose(); }
  }
});
