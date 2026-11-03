import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Kit } from '../src/engine/kit.js';
import { builders } from '../src/scenes/bible.js';

test('B05 families cross with scaled clearances and arrive together at the near shore', () => {
  const kit = new Kit('B05');
  try {
    builders.B05(kit);
    const travelers = kit.people.filter(rig => rig.root.userData.redSeaTraveler);
    const families = travelers.filter(rig => rig.root.userData.redSeaFamily);
    assert.equal(travelers.length, 11, 'Moses leads ten representative family members');
    assert.equal(families.length, 10);
    assert.ok(families.some(rig => rig.root.scale.y < .65), 'children remain visible among the adults');
    assert.ok(families.some(rig => rig.root.scale.y >= .8), 'adults retain their larger silhouettes');
    kit.update(0);
    for(const rig of travelers) if(rig.root.position.z > -4.4) assert.ok(rig.root.position.y > .12, 'the waiting families stand on the dry bank above the closed sea');
    let previous;
    for (let sample = 0; sample <= 160; sample++) {
      const time = sample * .2;
      kit.update(time);
      const positions = travelers.map(rig => [rig.root.position.x, rig.root.position.z]);
      travelers.forEach((rig, i) => {
        const [x, z] = positions[i];
        assert.ok(Math.hypot(x, z) + .38 * rig.root.scale.x <= 5.95, `traveler remains supported by the base in ${time}s`);
        if (z < 2.8) assert.ok(Math.abs(x) <= 1.06, 'families stay in the central corridor before the near shore');
        if (previous) assert.ok(Math.hypot(x - previous[i][0], z - previous[i][1]) < .45, 'no abrupt swaps or jumps between people');
        for (let j = i + 1; j < travelers.length; j++) {
          const distance = Math.hypot(x - positions[j][0], z - positions[j][1]);
          const clearance = .37 * (rig.root.scale.x + travelers[j].root.scale.x);
          assert.ok(distance > clearance, `scaled figures ${i}/${j} do not coincide in ${time}s`);
        }
      });
      previous = positions;
    }
    for (const rig of families) {
      const [x, z] = rig.root.userData.redSeaArrival;
      assert.ok(Math.hypot(rig.root.position.x - x, rig.root.position.z - z) < .04, 'each person reaches their own place in the family group');
      assert.ok(rig.root.position.z >= 3.3, 'the final group stands beyond the breaking waves');
    }
    const snapshot = () => travelers.map(rig => [...rig.root.position.toArray(), rig.leftLeg.rotation.x, rig.rightLeg.rotation.x]);
    kit.update(24.6); const duringCrossing = snapshot();
    kit.update(0); kit.update(32); kit.update(24.6);
    assert.deepEqual(snapshot(), duringCrossing, 'the same narrative time reproduces the same crowd positions and footsteps');
  } finally { kit.dispose(); }
});

test('B05 footsteps keep a supporting boot on the dry corridor and seek reproduces joint support',()=>{
 const kit=new Kit('B05');
 try{
  builders.B05(kit);
  const travelers=kit.people.filter(rig=>rig.root.userData.redSeaTraveler);
  let lifted=false;
  for(let time=16;time<=24;time+=.4){
   kit.update(time);kit.group.updateMatrixWorld(true);
   for(const rig of travelers){
    if(rig.root.position.z< -2.2||rig.root.position.z>3.2)continue;
    const soles=[rig.leftLeg,rig.rightLeg].map(leg=>new THREE.Box3().setFromObject(leg,true).min.y);
    assert.ok(Math.min(...soles)>=-.003,'boots do not penetrate the dry seabed');
    assert.ok(Math.min(...soles)<.025,'at least one boot supports each moving traveler');
    assert.ok(Math.max(...soles)<.13,'swinging feet lift gently, without hopping');
    if(Math.max(...soles)>.025)lifted=true;
   }
  }
  assert.ok(lifted,'the swing foot actually leaves the ground instead of sliding alongside the supporting foot');
  const joints=()=>travelers.flatMap(r=>[r.root.rotation.y,r.leftLeg.position.y,r.rightLeg.position.y,r.leftLeg.rotation.x,r.rightLeg.rotation.x]);
  kit.update(20.2);const expected=joints();kit.update(0);kit.update(32);kit.update(20.2);
  assert.deepEqual(joints(),expected,'direction and grounded steps depend only on the requested time');
 }finally{kit.dispose();}
});
