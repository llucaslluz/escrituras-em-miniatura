import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Kit } from '../src/engine/kit.js';
import { createClayPerson } from '../src/engine/clay-people.js';

test('clay figures preserve narrative joints, hand attachments and registration', () => {
  const kit = new Kit('clay-rig');
  const rig = createClayPerson(kit, 'Néfi', 2, -3, { y: .5, scale: .8, rotation: .4, robe: '#90a182', skin: '#80563d' });
  assert.deepEqual(rig.root.position.toArray(), [2, .5, -3]);
  assert.equal(rig.root.scale.y, .8);
  assert.equal(rig.head.position.y, 1.37);
  assert.equal(rig.leftArm.position.y, 1.08);
  assert.equal(rig.rightArm.position.x, .24);
  assert.equal(rig.leftLeg.position.y, .42);
  assert.equal(rig.rightForearm.position.y, -.31);
  assert.equal(rig.handR.position.y, -.27);
  assert.equal(kit.people[0], rig);
  assert.equal(kit.selectables[0].object, rig.root);
  assert.equal(kit.labels[0].object, rig.root);
  const prop = new THREE.Object3D();
  prop.position.z = .12;
  rig.handR.add(prop);
  rig.root.updateMatrixWorld(true);
  const rest = prop.getWorldPosition(new THREE.Vector3());
  rig.rightArm.rotation.x = -1.1;
  rig.rightForearm.rotation.x = -.7;
  rig.root.updateMatrixWorld(true);
  assert.ok(prop.getWorldPosition(new THREE.Vector3()).distanceTo(rest) > .25, 'props follow both arm joints');
  kit.dispose();
});

test('chibi silhouette has grounded feet, a broad head and optional beard', () => {
  const kit = new Kit('clay-proportions');
  const figure = createClayPerson(kit, 'Daniel', 0, 0, { beard: false, mantle: '#83958e' });
  figure.root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(figure.root);
  assert.ok(bounds.min.y >= -.002 && bounds.min.y < .02, `feet meet base at ${bounds.min.y}`);
  assert.ok(bounds.max.y > 1.72 && bounds.max.y < 1.85, 'adult remains within authored scene scale');
  const face = figure.head.getObjectByName('Rosto de argila');
  const faceSize = new THREE.Box3().setFromObject(face).getSize(new THREE.Vector3());
  assert.ok(faceSize.x >= .68 && faceSize.y >= .70, 'head has chibi proportions');
  assert.equal(figure.head.getObjectByName('Barba esculpida'), undefined);
  let meshes = 0;
  figure.root.traverse(object => { if (object.isMesh) meshes++; });
  assert.ok(meshes <= 65, `bounded ${meshes}-mesh sculpt supports crowded scenes`);
  kit.dispose();
});

test('clay breathing is deterministic and all figure resources are disposed', () => {
  const kit = new Kit('clay-lifecycle');
  const rig = createClayPerson(kit, 'Abraão', -.4, .8, { beard: true });
  kit.update(8);
  const pose = [rig.robe.scale.x, rig.head.rotation.z];
  kit.update(26);
  kit.update(8);
  assert.deepEqual([rig.robe.scale.x, rig.head.rotation.z], pose);
  const geometries = new Set(), materials = new Set();
  rig.root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) materials.add(object.material);
  });
  let disposedGeometry = 0, disposedMaterial = 0;
  for (const geometry of geometries) geometry.addEventListener('dispose', () => disposedGeometry++);
  for (const material of materials) material.addEventListener('dispose', () => disposedMaterial++);
  kit.dispose();
  assert.equal(disposedGeometry, geometries.size);
  assert.equal(disposedMaterial, materials.size);
  assert.equal(kit.people.length, 0);
});

test('sleeping disciples receive closed sculpted eyelids without visible pupils', () => {
  const kit = new Kit('clay-sleep');
  const sleeping = createClayPerson(kit, 'Discípulo adormecido', 0, 0, { eyesClosed: true });
  const awake = createClayPerson(kit, 'Discípulo desperto', 2, 0);
  const eyes = rig => rig.head.children.filter(object => object.userData.clayEye);
  assert.deepEqual(eyes(sleeping).map(object => object.userData.clayEye), ['lid', 'lid']);
  assert.equal(eyes(awake).filter(object => object.userData.clayEye === 'pupil').length, 2);
  assert.equal(eyes(awake).filter(object => object.userData.clayEye === 'highlight').length, 2);
  for (const eyelid of eyes(sleeping)) {
    assert.equal(eyelid.geometry.type, 'TubeGeometry');
    const positions = eyelid.geometry.attributes.position;
    assert.ok(Array.from(positions.array).every(Number.isFinite));
    assert.ok(eyelid.geometry.parameters.path.getPoint(.5).z > .30, 'eyelids sit on the enlarged face');
  }
  sleeping.head.rotation.x = .55;
  sleeping.root.updateMatrixWorld(true);
  assert.equal(eyes(sleeping)[0].parent, sleeping.head, 'closed eyes follow a bowed head');
  kit.dispose();
});

test('named character profiles and handcrafted objects provide era-authentic anatomy, garments and stop-motion detail', () => {
  const mortalKit = new Kit('B19');
  const christMortal = createClayPerson(mortalKit, 'Jesus Cristo', 0, 0);
  assert.ok(christMortal.head.getObjectByName('Nariz de argila'), 'crafted clay nose');
  assert.ok(christMortal.head.getObjectByName('Orelha de argila'), 'crafted clay ears');
  assert.ok(christMortal.head.children.some(o => o.userData.clayEyePart === 'iris'), 'expressive colored iris');
  assert.ok(christMortal.head.children.some(o => o.userData.clayEye === 'highlight'), 'catchlight highlight');
  assert.ok(christMortal.handR.getObjectByName('Polegar esculpido'), 'sculpted thumb on hands');
  assert.ok(christMortal.root.getObjectByName('Faixa transversal do manto'), 'Christ diagonal mantle sash');

  const restorationKit = new Kit('D01');
  const joseph = createClayPerson(restorationKit, 'Joseph Smith', 0, 0);
  const emma = createClayPerson(restorationKit, 'Emma Smith', 1, 0);
  assert.ok(joseph.root.getObjectByName('Camisa do século XIX'), '19th-century shirt and waistcoat for Joseph Smith');
  assert.ok(emma.root.getObjectByName('Xale histórico'), '19th-century crossed shawl for Emma Smith');

  const mormonKit = new Kit('M12');
  const moroni = createClayPerson(mormonKit, 'Capitão Morôni', 0, 0);
  assert.ok(moroni.root.getObjectByName('Couraça esculpida'), 'sculpted breastplate for Captain Moroni');
  assert.ok(moroni.head.getObjectByName('Faixa frontal'), 'headband on Book of Mormon warrior');

  const plates = mormonKit.plates(0, 0, 0);
  const boat = mormonKit.boat(0, 0, 1);
  const vase = mormonKit.vase(0, 0, 0);
  const book = mormonKit.book(0, 0, 0);
  assert.ok(plates.getObjectByName('Argola das placas') && plates.getObjectByName('Gravação nas placas'));
  assert.ok(boat.getObjectByName('Remo esculpido') && boat.getObjectByName('Borda superior do barco'));
  assert.ok(vase.getObjectByName('Alça da ânfora'));
  assert.ok(book.getObjectByName('Lombada esculpida') && book.getObjectByName('Fecho do livro'));

  mortalKit.dispose();
  restorationKit.dispose();
  mormonKit.dispose();
});
