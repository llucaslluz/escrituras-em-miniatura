import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Kit } from '../src/engine/kit.js';
import { clayGeometry, makeClayTexture, clayBeamTexture } from '../src/engine/clay-style.js';
import { stories } from '../src/data/catalog.js';
import { builders as bible } from '../src/scenes/bible.js';
import { builders as mormon } from '../src/scenes/mormon.js';
import { builders as dc } from '../src/scenes/dc.js';
import { builders as pearl } from '../src/scenes/pearl.js';

const builders = { ...bible, ...mormon, ...dc, ...pearl };

test('Rochas de argila: normais contínuas nas junções e curvas suaves entre vértices', () => {
  const source = new THREE.DodecahedronGeometry(.7, 1), cache = new Map();
  const stone = clayGeometry(source, cache), position = stone.getAttribute('position'), normal = stone.getAttribute('normal');
  try {
    const seen = new Map(); let sharedPositions = 0, curvedTriangles = 0;
    for (let i = 0; i < position.count; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(position, i);
      const direction = new THREE.Vector3().fromBufferAttribute(normal, i);
      assert.ok(Number.isFinite(direction.length()) && Math.abs(direction.length() - 1) < .00001, 'iluminação recebe normais unitárias finitas');
      const key = point.toArray().map(value => value.toFixed(5)).join(',');
      if (seen.has(key)) { assert.ok(direction.distanceTo(seen.get(key)) < .00001, 'vértices coincidentes não criam costuras de iluminação'); sharedPositions++; }
      else seen.set(key, direction);
    }
    for (let i = 0; i < position.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(normal, i), b = new THREE.Vector3().fromBufferAttribute(normal, i + 1), c = new THREE.Vector3().fromBufferAttribute(normal, i + 2);
      if (a.distanceTo(b) > .01 && a.distanceTo(c) > .01) curvedTriangles++;
    }
    assert.ok(sharedPositions > 50, 'a continuidade foi conferida em junções reais');
    assert.ok(curvedTriangles / (position.count / 3) > .9, 'a superfície curva não volta à aparência de faces planas');
  } finally { source.dispose(); stone.dispose(); }
});

test('Caixas arredondadas conservam dimensões, contatos e compartilhamento de geometria', () => {
  const cache = new Map(), sources = [];
  try {
    for (const dimensions of [[3, 2, 1], [.08, 1.4, .06], [.52, .022, .36]]) {
      const source = new THREE.BoxGeometry(...dimensions); sources.push(source);
      const rounded = clayGeometry(source, cache); rounded.computeBoundingBox();
      const size = rounded.boundingBox.getSize(new THREE.Vector3());
      size.toArray().forEach((value, axis) => assert.ok(Math.abs(value - dimensions[axis]) < .00001, 'bordas não afastam portas, tábuas ou objetos presos às mãos'));
      const n = rounded.getAttribute('normal'); let curvedEdge = false;
      for (let i = 0; i < n.count; i++) { const values = [n.getX(i), n.getY(i), n.getZ(i)].map(Math.abs); if (values.filter(value => value > .05 && value < .95).length >= 2) { curvedEdge = true; break; } }
      assert.ok(curvedEdge, 'as quinas têm normais curvas, além de preservar o volume');
      const equalSource = new THREE.BoxGeometry(...dimensions); sources.push(equalSource);
      assert.equal(clayGeometry(equalSource, cache), rounded, 'peças de mesmo tamanho compartilham o recurso');
    }
    assert.equal(new Set(cache.values()).size, 3, 'tamanhos diferentes não reutilizam uma forma incompatível');
    const sphere = new THREE.SphereGeometry(.3, 12, 8); sources.push(sphere);
    assert.equal(clayGeometry(sphere, cache), sphere, 'formas articuladas não são substituídas pelo arredondamento de caixas');
  } finally { sources.forEach(geometry => geometry.dispose()); new Set(cache.values()).forEach(geometry => geometry.dispose()); }
});

test('Materiais e luz: grão suave compartilhado preserva os acabamentos narrativos', () => {
  const kit = new Kit('clay-material-contract');
  try {
    const options = { roughness: .27, metalness: .5, transparent: true, opacity: .6 };
    const material = kit.mat('#a9b9bd', options);
    assert.equal(kit.mat('#a9b9bd', options), material);
    assert.equal(material.bumpMap, makeClayTexture());
    assert.ok(material.isMeshPhysicalMaterial);
    for (const [key, value] of Object.entries(options)) assert.equal(material[key], value, 'água, metais e transparência mantêm suas propriedades');
    const texture = makeClayTexture(), { data, width, height } = texture.image;
    assert.ok(width >= 64 && height >= 64);
    let gradient = 0, minimum = 255, maximum = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width - 1; x++) { const value = data[(y * width + x) * 4]; gradient += Math.abs(value - data[(y * width + x + 1) * 4]); minimum = Math.min(minimum, value); maximum = Math.max(maximum, value); }
    assert.ok(maximum > minimum + 10, 'há marcas de superfície visíveis');
    assert.ok(gradient / (height * (width - 1)) < 12, 'o grão não recupera o ruído áspero das fibras');
    const beam = clayBeamTexture(), sample = (x, y) => beam.image.data[(y * beam.image.width + x) * 4];
    const center = sample(Math.floor(beam.image.width / 2), Math.floor(beam.image.height / 2));
    assert.ok(center > 200);
    assert.ok(sample(0, Math.floor(beam.image.height / 2)) < center * .1);
    assert.ok(sample(Math.floor(beam.image.width / 2), 0) < center * .1, 'o feixe desaparece gradualmente nas bordas');
  } finally { kit.dispose(); }
});

test('72 histórias recebem base, grão e formas de massinha sem perder os contratos de cena', () => {
  assert.equal(stories.length, 88);
  for (const story of stories) {
    const kit = new Kit(story.id);
    try {
      builders[story.id](kit);
      assert.equal(kit.group.userData.artStyle, 'claymation', story.id);
      kit.ground.geometry.computeBoundingBox();
      const baseSize = kit.ground.geometry.boundingBox.getSize(new THREE.Vector3());
      assert.ok(baseSize.x > 11 && baseSize.z > 11 && baseSize.y > .3, `${story.id}: base mantém escala e espessura do diorama`);
      assert.ok(kit.group.children.some(object => object.isInstancedMesh && object.count > 1 && object.instanceColor), `${story.id}: o chão tem detalhes instanciados coloridos`);
      let clayMeshes = 0;
      kit.group.traverse(object => {
        if (!object.isMesh) return;
        assert.notEqual(object.geometry.type, 'BoxGeometry', `${story.id}: caixas visíveis não conservam quinas rígidas`);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          if (material.isMeshBasicMaterial) { assert.ok(material.transparent && material.alphaMap === clayBeamTexture(), `${story.id}: luz volumétrica permanece um efeito suave`); continue; }
          assert.ok(material.isMeshPhysicalMaterial && material.userData.clayMaterial, `${story.id}: objetos sólidos usam o material compartilhado`);
          assert.equal(material.bumpMap, makeClayTexture(), `${story.id}: nenhuma peça sólida retorna à textura anterior`);
          clayMeshes++;
        }
      });
      assert.ok(clayMeshes > 0 && kit.animations.length > 0 && kit.ambients.length > 0 && kit.selectables.length > 0, `${story.id}: modelo, ação, ambiente e seleção continuam presentes`);
      for (const rig of kit.people) { assert.ok(rig.root.userData.clayPerson, `${story.id}: cada figura usa a nova escultura`); assert.equal(kit.group.getObjectById(rig.root.id), rig.root); }
      kit.update(16, story.duration);
      for (const entry of kit.selectables) assert.equal(kit.group.getObjectById(entry.object.id), entry.object, `${story.id}: alvos de seleção continuam ligados à cena`);
    } finally { kit.dispose(); }
  }
});
