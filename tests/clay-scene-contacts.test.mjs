import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Kit } from '../src/engine/kit.js';
import { builders as bible } from '../src/scenes/bible.js';
import { builders as dc } from '../src/scenes/dc.js';
import { builders as mormon } from '../src/scenes/mormon.js';

test('B29 sleeping disciples use the enlarged sculpted closed eyes', () => {
  const kit = new Kit('B29');
  try {
    bible.B29(kit);
    const sleepers = kit.people.filter(rig => rig.root.userData.selectable === 'Discípulos de Jesus');
    assert.equal(sleepers.length, 3);
    for (const rig of sleepers) {
      assert.equal(rig.root.userData.clayPerson.eyesClosed, true);
      const eyes = rig.head.children.filter(object => object.userData.clayEye);
      assert.deepEqual(eyes.map(object => object.userData.clayEye), ['lid', 'lid']);
    }
  } finally { kit.dispose(); }
});

test('B30 helmets enclose the new crown and the inscription clears the head', () => {
  const kit = new Kit('B30');
  try {
    bible.B30(kit);
    const christ = kit.people.find(rig => rig.root.userData.selectable === 'Jesus Cristo');
    const sign = kit.selectables.find(entry => entry.name === 'Inscrição na cruz').object;
    const helmets = [];
    kit.group.traverse(object => { if (object.userData.clayHelmet) helmets.push(object); });
    assert.equal(helmets.length, 3);
    for (const helmet of helmets) {
      assert.ok(helmet.geometry.parameters.radius > .38, 'helmet fits the larger head width');
      assert.ok(helmet.position.y + helmet.geometry.parameters.radius * helmet.scale.y > .40, 'clay hair does not pierce the dome');
    }
    for (const time of [0, 16, 32]) {
      kit.update(time);
      kit.group.updateMatrixWorld(true);
      const headBounds = new THREE.Box3().setFromObject(christ.head, true);
      const signBounds = new THREE.Box3().setFromObject(sign, true);
      assert.ok(signBounds.min.y > headBounds.max.y + .025, `inscription clears the larger head in ${time}s`);
    }
  } finally { kit.dispose(); }
});

test('D01 palms rest outside the enlarged crown instead of passing through it', () => {
  const kit = new Kit('D01');
  try {
    dc.D01(kit);
    const john = kit.people.find(rig => rig.root.userData.selectable === 'João Batista');
    const recipients = ['Joseph Smith', 'Oliver Cowdery'].map(name => kit.people.find(rig => rig.root.userData.selectable === name));
    for (const time of [20, 22]) {
      kit.update(time);
      kit.group.updateMatrixWorld(true);
      recipients.forEach((rig, i) => {
        const hand = (i ? john.handR : john.handL).getWorldPosition(new THREE.Vector3());
        const local = rig.head.worldToLocal(hand);
        const scalpDistance = Math.hypot(local.x, local.y - .025, (local.z + .018) / .94);
        assert.ok(local.y > .38, 'hand rises to the larger crown');
        assert.ok(scalpDistance > .39 && scalpDistance < .47, 'palm center is outside the hair while its rounded surface touches it');
      });
    }
  } finally { kit.dispose(); }
});

test('M18 blessing hands follow all five tilted child crowns at their own scales', () => {
  const kit = new Kit('M18');
  try {
    mormon.M18(kit);
    const christ = kit.people.find(rig => rig.root.userData.selectable === 'Jesus Cristo');
    const children = kit.people.filter(rig => rig.root.userData.selectable === 'Crianças');
    assert.equal(children.length, 5);
    children.forEach((child, index) => {
      kit.update(16 + index * 1.6 + .7);
      kit.group.updateMatrixWorld(true);
      const hand = christ.handR.getWorldPosition(new THREE.Vector3());
      const headBounds = new THREE.Box3().setFromObject(child.head, true);
      assert.ok(hand.y > headBounds.max.y, 'palm rests above the hair instead of inside the enlarged head');
      assert.ok(hand.y - headBounds.max.y < .09, 'palm remains close to the child crown');
      const local = child.head.worldToLocal(hand);
      assert.ok(Math.abs(local.x) < .03 && Math.abs(local.z) < .06, 'blessing stays centered as the child tilts their head');
    });
  } finally { kit.dispose(); }
});
