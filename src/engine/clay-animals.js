import * as THREE from 'three';

// A small collection of rounded toy shapes is instanced per colour. Keeping the
// groups articulated preserves the existing scene helpers without one draw call
// for every mane petal, wool curl, toe or feather.
const geometryCache = new WeakMap();
const TAU = Math.PI * 2;
function sphereGeometry(kit) {
  if (!geometryCache.has(kit)) geometryCache.set(kit, new THREE.SphereGeometry(1, 18, 14));
  return geometryCache.get(kit);
}
function clayParts(kit, parent, color, parts, material = {}) {
  const mesh = new THREE.InstancedMesh(sphereGeometry(kit), kit.mat(color, { roughness: .57, bumpScale: .012, ...material }), parts.length);
  const transform = new THREE.Object3D();
  parts.forEach(([x, y, z, sx, sy, sz, rz = 0, ry = 0], i) => {
    transform.position.set(x, y, z); transform.scale.set(sx, sy, sz); transform.rotation.set(0, ry, rz); transform.updateMatrix(); mesh.setMatrixAt(i, transform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}
function littleEyes(kit, head, x, y, z, closed = false) {
  if (closed) return clayParts(kit, head, '#594036', [-1, 1].map(side => [side * x, y, z, .041, .008, .011, side * .15]));
  const eyes = new THREE.Group(); head.add(eyes);
  clayParts(kit, eyes, '#352d2b', [-1, 1].map(side => [side * x, y, z, .025, .035, .018]), { roughness: .2, bumpScale: 0 });
  clayParts(kit, eyes, '#fff4dc', [-1, 1].map(side => [side * x - .006, y + .01, z + .014, .007, .009, .004]), { roughness: .2, bumpScale: 0 });
  return eyes;
}

function fish(kit, x, z, s) {
  const root = kit.groupAt(x, 0, z); root.name = 'Peixe de massinha'; root.scale.setScalar(s); root.userData.clayCreature = 'fish';
  clayParts(kit, root, '#a8c5bf', [[0, .22, 0, .23, .25, .49], [0, .22, -.51, .035, .22, .23, .4], [0, .22, -.51, .035, .22, .23, -.4]]);
  clayParts(kit, root, '#87aaa4', [[0, .43, -.07, .034, .12, .23], [-.19, .18, -.03, .11, .033, .16, -.25], [.19, .18, -.03, .11, .033, .16, .25]]);
  clayParts(kit, root, '#293d3c', [[-.14, .27, .34, .024, .032, .019], [.14, .27, .34, .024, .032, .019]], { roughness: .2, bumpScale: 0 });
  clayParts(kit, root, '#d5dfc9', [[0, .16, .43, .07, .035, .035]]);
  return root;
}

export function createClayAnimal(kit, kind, x, z, s = 1) {
  if (kind === 'bird') { const bird = createClayDove(kit, x, .5, z); bird.scale.setScalar(s); return bird; }
  if (kind === 'fish') return fish(kit, x, z, s);
  const lion = kind === 'lion', donkey = kind === 'donkey';
  const root = kit.groupAt(x, 0, z); root.scale.setScalar(s); root.name = lion ? 'Leão de massinha' : donkey ? 'Jumentinho de massinha' : 'Ovelha de massinha'; root.userData.clayCreature = kind;
  const bodyColor = lion ? '#d4a16a' : donkey ? '#aaa6a6' : '#e7ddc6';
  const maneColor = '#986646', muzzleColor = lion ? '#f0cca0' : donkey ? '#d1c4b7' : '#bca48b';
  const body = new THREE.Group(); root.add(body);
  clayParts(kit, body, bodyColor, [[0, .45, -.04, .36, .36, .61]]);
  if (!lion && !donkey) {
    const wool = [];
    for (let i = 0; i < 13; i++) { const a = i / 13 * TAU; wool.push([Math.sin(a) * .25, .49 + Math.cos(a) * .13, -.4 + i % 4 * .23, .18, .18, .19]); }
    clayParts(kit, body, '#f2e8d3', wool);
  }
  if (donkey) clayParts(kit, body, '#827d7e', [[0, .77, -.05, .055, .05, .47]]);
  const paws = [];
  for (const side of [-1, 1]) for (const zz of [-.37, .34]) {
    const leg = new THREE.Group(); leg.position.set(side * .24, 0, zz); root.add(leg);
    clayParts(kit, leg, bodyColor, [[0, .22, 0, .095, .23, .11], [0, .085, .045, lion ? .13 : .105, .09, .17]]);
    if (donkey) clayParts(kit, leg, '#777173', [[0, .045, .06, .108, .045, .14]]);
    paws.push(leg);
  }
  const head = new THREE.Group(); head.position.set(0, .72, .47); root.add(head);
  if (lion) {
    const petals = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; petals.push([Math.sin(a) * .29, Math.cos(a) * .29, -.025, .145, .16, .15, -a]); }
    clayParts(kit, head, maneColor, [[0, 0, -.015, .365, .38, .21], ...petals]);
  }
  clayParts(kit, head, bodyColor, [[0, 0, .14, .26, .265, .205], ...[-1, 1].map(side => [side * .205, donkey ? .3 : .21, .05, .083, donkey ? .26 : .085, .075, donkey ? -side * .16 : 0])]);
  if (donkey) {
    clayParts(kit, head, '#d4bdb9', [-1, 1].map(side => [side * .205, .32, .102, .04, .16, .026, -side * .16]));
    clayParts(kit, head, '#726866', [[0, .2, -.025, .085, .14, .14]]);
  }
  clayParts(kit, head, muzzleColor, [[-.07, -.105, .315, .105, .075, .07], [.07, -.105, .315, .105, .075, .07]]);
  clayParts(kit, head, '#65483a', [[0, -.069, .374, .044, .027, .027], [0, -.14, .376, .009, .025, .009]]);
  const eyes = littleEyes(kit, head, .105, .035, .344);
  const sleepingEyes = littleEyes(kit, head, .105, .035, .354, true); sleepingEyes.visible = false;
  clayParts(kit, head, '#dcaa8e', [[-.185, -.055, .281, .045, .022, .015], [.185, -.055, .281, .045, .022, .015]]);
  const tail = new THREE.Group(); tail.position.set(0, .46, -.52); root.add(tail);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.24, -.03, -.24), new THREE.Vector3(.46, .07, -.29), new THREE.Vector3(.5, .17, -.2)]);
  const strand = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, lion ? .028 : .035, 6), kit.mat(bodyColor, { roughness: .57, bumpScale: .012 })); strand.castShadow = true; tail.add(strand);
  clayParts(kit, tail, lion ? maneColor : donkey ? '#827571' : '#f2e8d3', [[.5, .17, -.2, lion ? .085 : .065, .09, .075]]);
  // Local support for the two ellipsoids already used by each paw. Grounding
  // belongs to the paw, so resting never requires sinking the whole creature.
  const pawSupport = angle => {
    const c=Math.cos(angle),s=Math.sin(angle);
    return Math.max(
      -.22*c+Math.hypot(.23*c,.11*s),
      -.085*c+.045*s+Math.hypot(.09*c,.17*s),
      donkey?-.045*c+.06*s+Math.hypot(.045*c,.14*s):-Infinity,
    );
  };
  const supports={standing:pawSupport(0),front:pawSupport(-.95),back:pawSupport(.65)};
  Object.assign(root.userData, { body, head, paws, tail, resting: false, autoGroundPaws:true });
  kit.ambient(t => {
    const rest = root.userData.resting ? 1 : 0;
    body.position.y = -.09 * rest; body.scale.set(1 + Math.sin(t * 1.25 + x) * .012, 1, 1);
    head.position.y = .72 - rest * .2; head.position.z = .47 + rest * .12;
    head.rotation.y = Math.sin(t * .45 + z) * .065; head.rotation.z = rest * .055;
    paws.forEach((paw, i) => { const front = i % 2 === 1; if(root.userData.autoGroundPaws!==false) paw.position.y = rest ? (front?supports.front:supports.back) : supports.standing; paw.rotation.x = rest * (front ? -.95 : .65); paw.position.z = (front ? .34 : -.37) + (front ? .16 : -.05) * rest; });
    tail.position.y = .46 - rest * .2; tail.rotation.y = Math.sin(t * .65 + x) * .12;
    eyes.visible = !rest; sleepingEyes.visible = !!rest;
  });
  return root;
}

export function createClayDove(kit, x, y, z) {
  const root = kit.groupAt(x, y, z); root.name = 'Pomba de massinha'; root.userData.clayCreature = 'bird';
  clayParts(kit, root, '#efe8d8', [[0, 0, 0, .13, .15, .25], [0, .13, .18, .12, .12, .12], [-.045, -.025, -.24, .05, .025, .18, .08], [.045, -.025, -.24, .05, .025, .18, -.08]]);
  clayParts(kit, root, '#d8b477', [[0, .105, .3, .035, .026, .075]]);
  clayParts(kit, root, '#493c32', [[-.077, .145, .255, .012, .018, .009], [.077, .145, .255, .012, .018, .009]], { roughness: .2, bumpScale: 0 });
  const wings = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group(); wing.position.set(side * .075, .025, -.015); root.add(wing);
    clayParts(kit, wing, '#f7efdf', Array.from({ length: 5 }, (_, i) => [side * (.1 + i * .045), 0, -.025 - i * .029, .15, .033, .07, 0, side * .2]));
    wings.push(wing);
  }
  kit.ambient(t => { wings[0].rotation.z = .16 + Math.sin(t * 6) * .65; wings[1].rotation.z = -.16 - Math.sin(t * 6) * .65; });
  root.userData.wings = wings; return root;
}
