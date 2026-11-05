import * as THREE from 'three';

// A small collection of rounded toy shapes is instanced per colour. Keeping the
// groups articulated preserves the existing scene helpers without one draw call
// for every mane petal, wool curl, toe, horn or feather.
const geometryCache = new WeakMap();
const TAU = Math.PI * 2;

function sphereGeometry(kit) {
  if (!geometryCache.has(kit)) geometryCache.set(kit, new THREE.SphereGeometry(1, 18, 14));
  return geometryCache.get(kit);
}

function clayParts(kit, parent, color, parts, material = {}) {
  const mesh = new THREE.InstancedMesh(
    sphereGeometry(kit),
    kit.mat(color, { roughness: .58, bumpScale: .013, ...material }),
    parts.length,
  );
  const transform = new THREE.Object3D();
  parts.forEach(([x, y, z, sx, sy, sz, rz = 0, ry = 0, rx = 0], i) => {
    transform.position.set(x, y, z);
    transform.scale.set(sx, sy, sz);
    transform.rotation.set(rx, ry, rz);
    transform.updateMatrix();
    mesh.setMatrixAt(i, transform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingBox();
  mesh.computeBoundingSphere();
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function littleEyes(kit, head, x, y, z, closed = false) {
  if (closed) {
    return clayParts(kit, head, '#4f372d', [-1, 1].map(side => [side * x, y, z, .043, .009, .012, side * .16]));
  }
  const eyes = new THREE.Group();
  head.add(eyes);
  clayParts(kit, eyes, '#2a211f', [-1, 1].map(side => [side * x, y, z, .026, .036, .019]), { roughness: .2, bumpScale: 0 });
  clayParts(kit, eyes, '#fff7e4', [-1, 1].map(side => [side * x - .007, y + .011, z + .015, .008, .010, .005]), { roughness: .18, bumpScale: 0 });
  return eyes;
}

function exactPawSupport(paw, angleX) {
  const prevY = paw.position.y;
  const prevRotX = paw.rotation.x;
  paw.position.y = 0;
  paw.rotation.x = angleX;
  paw.updateMatrixWorld(true);
  let minY = Infinity;
  const v = new THREE.Vector3();
  const inst = new THREE.Matrix4();
  const localMat = new THREE.Matrix4();
  const invParent = paw.parent ? paw.parent.matrixWorld.clone().invert() : new THREE.Matrix4();
  paw.traverse(mesh => {
    if (!mesh.geometry) return;
    const pos = mesh.geometry.attributes.position;
    const count = mesh.isInstancedMesh ? mesh.count : 1;
    for (let i = 0; i < count; i++) {
      if (mesh.isInstancedMesh) {
        mesh.getMatrixAt(i, inst);
        localMat.multiplyMatrices(mesh.matrixWorld, inst).premultiply(invParent);
      } else {
        localMat.copy(mesh.matrixWorld).premultiply(invParent);
      }
      for (let j = 0; j < pos.count; j++) {
        v.fromBufferAttribute(pos, j).applyMatrix4(localMat);
        if (v.y < minY) minY = v.y;
      }
    }
  });
  paw.position.y = prevY;
  paw.rotation.x = prevRotX;
  paw.updateMatrixWorld(true);
  return Number.isFinite(minY) ? -minY + .0025 : .23;
}

function fish(kit, x, z, s) {
  const root = kit.groupAt(x, 0, z);
  root.name = 'Peixe de massinha';
  root.scale.setScalar(s);
  root.userData.clayCreature = 'fish';
  clayParts(kit, root, '#6fa9ad', [
    [0, .22, 0, .22, .25, .49],
    [0, .27, -.52, .036, .21, .22, .38, 0, .22],
    [0, .17, -.52, .036, .21, .22, -.38, 0, -.22],
  ]);
  clayParts(kit, root, '#a9d3cf', [[0, .15, .04, .18, .15, .41]]);
  clayParts(kit, root, '#4c8287', [
    [0, .44, -.06, .034, .13, .24],
    [-.19, .18, .02, .12, .032, .16, -.28, .18],
    [.19, .18, .02, .12, .032, .16, .28, -.18],
  ]);
  clayParts(kit, root, '#233536', [
    [-.14, .27, .34, .026, .034, .02],
    [.14, .27, .34, .026, .034, .02],
  ], { roughness: .2, bumpScale: 0 });
  clayParts(kit, root, '#fff9e8', [
    [-.145, .28, .354, .008, .009, .006],
    [.145, .28, .354, .008, .009, .006],
  ], { roughness: .18, bumpScale: 0 });
  clayParts(kit, root, '#dfcbb8', [[0, .16, .44, .068, .034, .036]]);
  return root;
}

const ANIMAL_LABELS = {
  lion: 'Leão de massinha',
  donkey: 'Jumentinho de massinha',
  sheep: 'Ovelha de massinha',
  camel: 'Camelo de massinha',
  horse: 'Cavalo de massinha',
  ox: 'Boi de massinha',
};

export function createClayAnimal(kit, kind, x, z, s = 1) {
  if (kind === 'bird') {
    const bird = createClayDove(kit, x, .5, z);
    bird.scale.setScalar(s);
    return bird;
  }
  if (kind === 'fish') return fish(kit, x, z, s);

  const isLion = kind === 'lion';
  const isDonkey = kind === 'donkey';
  const isCamel = kind === 'camel';
  const isHorse = kind === 'horse';
  const isOx = kind === 'ox';
  const isSheep = !isLion && !isDonkey && !isCamel && !isHorse && !isOx;

  const root = kit.groupAt(x, 0, z);
  root.scale.setScalar(s);
  root.name = ANIMAL_LABELS[kind] || 'Animal de massinha';
  root.userData.clayCreature = kind;

  const bodyColor = isLion ? '#d29e65'
    : isDonkey ? '#9d9794'
    : isCamel ? '#c8955c'
    : isHorse ? '#8e5536'
    : isOx ? '#8b5c3d'
    : '#9e856f';
  const maneColor = isLion ? '#5f3926' : isHorse ? '#3b2418' : '#78553c';
  const muzzleColor = isLion ? '#f2d6b0'
    : isDonkey ? '#ded4c7'
    : isCamel ? '#e2c59d'
    : isHorse ? '#dfcBB4'
    : isOx ? '#e3ccb2'
    : '#cbb49c';

  // 1. Tronco esculpido (com lã volumosa, corcova de camelo, pescoço arqueado ou barbela)
  const body = new THREE.Group();
  root.add(body);
  if (isCamel) {
    clayParts(kit, body, bodyColor, [
      [0, .54, -.04, .37, .35, .62],
      [0, .86, -.08, .25, .26, .31],
      [0, .68, .42, .15, .24, .18, 0, 0, -.42],
      [0, .88, .53, .13, .22, .15, 0, 0, .18],
    ]);
    clayParts(kit, body, '#b37e47', [[0, 1.05, -.08, .18, .12, .22]]);
  } else if (isHorse) {
    clayParts(kit, body, bodyColor, [
      [0, .50, -.04, .34, .34, .63],
      [.0, .52, .30, .28, .31, .28],
      [0, .74, .39, .15, .27, .19, 0, 0, -.36],
    ]);
  } else if (isOx) {
    clayParts(kit, body, bodyColor, [
      [0, .47, -.04, .40, .37, .64],
      [0, .53, .28, .35, .36, .30],
    ]);
    clayParts(kit, body, '#754b30', [[0, .38, .38, .12, .18, .22]]);
  } else if (isLion) {
    clayParts(kit, body, bodyColor, [
      [0, .45, -.05, .35, .34, .61],
      [0, .48, .24, .34, .35, .30],
    ]);
    clayParts(kit, body, '#e3be8c', [[0, .34, .02, .24, .18, .48]]);
  } else if (isSheep) {
    clayParts(kit, body, '#f1e7d3', [[0, .47, -.04, .39, .37, .60]]);
    const wool = [];
    for (let i = 0; i < 18; i++) {
      const ring = i % 6;
      const row = Math.floor(i / 6);
      const a = (ring / 6) * TAU + row * .52;
      wool.push([
        Math.sin(a) * .29,
        .49 + Math.cos(a) * .17,
        -.36 + row * .33,
        .185,
        .18,
        .195,
      ]);
    }
    wool.push([0, .66, -.04, .24, .16, .42]);
    clayParts(kit, body, '#f7efe0', wool);
  } else {
    // Donkey
    clayParts(kit, body, bodyColor, [[0, .46, -.04, .34, .35, .60]]);
    clayParts(kit, body, '#cfc6ba', [[0, .34, .02, .23, .17, .46]]);
    clayParts(kit, body, '#6d6664', [
      [0, .77, -.04, .05, .045, .48],
      [0, .63, .18, .35, .045, .065],
    ]);
  }

  // 2. Quatro patas articuladas com dedos esculpidos ou cascos
  const paws = [];
  const legSpreadX = isOx ? .26 : isCamel ? .23 : .24;
  const backZ = isCamel || isHorse ? -.40 : -.37;
  const frontZ = isCamel || isHorse ? .36 : .34;
  const legTopY = isCamel ? .29 : isHorse ? .25 : .22;
  const legHalfH = isCamel ? .29 : isHorse ? .25 : .23;

  for (const side of [-1, 1]) {
    for (const zz of [backZ, frontZ]) {
      const leg = new THREE.Group();
      leg.position.set(side * legSpreadX, 0, zz);
      root.add(leg);
      const legCol = isSheep ? '#8f7762' : bodyColor;
      clayParts(kit, leg, legCol, [
        [0, legTopY, 0, isCamel ? .082 : .095, legHalfH, .105],
        [0, .082, .042, isLion ? .132 : .102, .082, .162],
      ]);
      if (isLion) {
        clayParts(kit, leg, '#dda971', [
          [-.052, .046, .168, .042, .038, .055],
          [0, .046, .182, .044, .040, .058],
          [.052, .046, .168, .042, .038, .055],
        ]);
      } else if (isCamel) {
        clayParts(kit, leg, '#9e7244', [
          [-.035, .042, .065, .065, .038, .12],
          [.035, .042, .065, .065, .038, .12],
        ]);
      } else {
        const hoofColor = isHorse ? '#3b2f29' : isOx ? '#47382e' : '#655c58';
        clayParts(kit, leg, hoofColor, [[0, .045, .058, .104, .044, .138]]);
      }
      paws.push(leg);
    }
  }

  // 3. Cabeça expressiva por espécie (juba dupla em pétalas, chifres, crina ou lã)
  const headBaseY = isCamel ? .96 : isHorse ? .89 : isOx ? .68 : .72;
  const headBaseZ = isCamel ? .58 : isHorse ? .52 : .47;
  const head = new THREE.Group();
  head.position.set(0, headBaseY, headBaseZ);
  root.add(head);

  if (isLion) {
    const outerPetals = [];
    const innerPetals = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU;
      outerPetals.push([Math.sin(a) * .315, Math.cos(a) * .315, -.035, .155, .17, .155, -a]);
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + .31;
      innerPetals.push([Math.sin(a) * .245, Math.cos(a) * .25, .045, .125, .135, .125, -a]);
    }
    clayParts(kit, head, maneColor, [[0, 0, -.03, .38, .39, .23], ...outerPetals]);
    clayParts(kit, head, '#784a32', innerPetals);
  }

  const headCol = isSheep ? '#937b66' : bodyColor;
  const earY = isDonkey ? .31 : isHorse ? .26 : isSheep || isOx ? .10 : .21;
  const earSy = isDonkey ? .26 : isHorse ? .16 : isSheep || isOx ? .065 : .088;
  const earSx = isSheep || isOx ? .13 : .082;
  clayParts(kit, head, headCol, [
    [0, 0, .14, .255, .255, .21],
    ...[-1, 1].map(side => [
      side * (isSheep || isOx ? .245 : .20),
      earY,
      .05,
      earSx,
      earSy,
      .072,
      isDonkey ? -side * .16 : isSheep || isOx ? side * .35 : -side * .1,
    ]),
  ]);

  if (isLion) {
    clayParts(kit, head, '#ebC598', [-1, 1].map(side => [side * .195, .205, .095, .046, .048, .03]));
  } else if (isSheep) {
    clayParts(kit, head, '#f6efe0', [
      [0, .22, .12, .17, .11, .16],
      [-.09, .20, .16, .095, .08, .095],
      [.09, .20, .16, .095, .08, .095],
    ]);
  } else if (isDonkey) {
    clayParts(kit, head, '#d6bfba', [-1, 1].map(side => [side * .20, .32, .10, .04, .16, .026, -side * .16]));
    clayParts(kit, head, '#685f5d', [[0, .21, -.02, .075, .13, .15]]);
  } else if (isHorse) {
    clayParts(kit, head, maneColor, [
      [0, .22, -.02, .068, .15, .17],
      [0, .19, .22, .065, .09, .09],
      [0, -.06, -.10, .07, .22, .12],
    ]);
    clayParts(kit, head, '#efe5d6', [[0, .05, .335, .045, .11, .03]]);
  } else if (isOx) {
    // Chifres curvos de marfim
    clayParts(kit, head, '#ece2cb', [
      [-.24, .20, .06, .13, .052, .052, .45],
      [.24, .20, .06, .13, .052, .052, -.45],
      [-.33, .29, .08, .05, .11, .048, .18],
      [.33, .29, .08, .05, .11, .048, -.18],
    ]);
  }

  // Focinho almofadado, narinas, olhos expressivos e bochechas
  clayParts(kit, head, muzzleColor, [
    [-.072, -.102, .318, .108, .078, .076],
    [.072, -.102, .318, .108, .078, .076],
    [0, -.135, .305, .095, .052, .062],
  ]);
  clayParts(kit, head, '#54392d', [
    [0, -.066, .378, .046, .029, .029],
    [0, -.132, .378, .009, .026, .009],
  ]);
  const eyes = littleEyes(kit, head, .105, .036, .344);
  const sleepingEyes = littleEyes(kit, head, .105, .036, .354, true);
  sleepingEyes.visible = false;
  clayParts(kit, head, '#dfab8e', [
    [-.182, -.055, .282, .044, .022, .015],
    [.182, -.055, .282, .044, .022, .015],
  ]);

  // 4. Cauda esculpida com tufo na ponta
  const tail = new THREE.Group();
  tail.position.set(0, .46, -.52);
  root.add(tail);
  const curve = isSheep
    ? new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -.08, -.14), new THREE.Vector3(0, -.16, -.18)])
    : new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(.22, -.04, -.22),
        new THREE.Vector3(.44, .06, -.28),
        new THREE.Vector3(.49, .17, -.19),
      ]);
  const strand = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 14, isHorse ? .042 : isLion ? .028 : .032, 6),
    kit.mat(isHorse ? maneColor : isSheep ? '#f4ecda' : bodyColor, { roughness: .58, bumpScale: .012 }),
  );
  strand.castShadow = true;
  tail.add(strand);
  if (!isSheep) {
    const tuftColor = isLion || isHorse ? maneColor : isDonkey ? '#6d625e' : '#5e3d28';
    clayParts(kit, tail, tuftColor, [[.49, .17, -.19, isLion ? .095 : .072, .105, .082]]);
  }

  // Cálculo exato de apoio das patas (em pé e em repouso) a partir da malha real
  const supports = {
    standing: exactPawSupport(paws[0], 0),
    front: exactPawSupport(paws[1], -.95),
    back: exactPawSupport(paws[0], .65),
  };

  Object.assign(root.userData, { body, head, paws, tail, resting: false, autoGroundPaws: true });

  kit.ambient(t => {
    const rest = root.userData.resting ? 1 : 0;
    body.position.y = -.085 * rest;
    body.scale.set(1 + Math.sin(t * 1.25 + x) * .012, 1, 1);
    head.position.y = headBaseY - rest * .20;
    head.position.z = headBaseZ + rest * .12;
    head.rotation.y = Math.sin(t * .45 + z) * .065;
    head.rotation.z = rest * .055;
    paws.forEach((paw, i) => {
      const front = i % 2 === 1;
      if (root.userData.autoGroundPaws !== false) {
        paw.position.y = rest ? (front ? supports.front : supports.back) : supports.standing;
      }
      paw.rotation.x = rest * (front ? -.95 : .65);
      paw.position.z = (front ? frontZ : backZ) + (front ? .16 : -.05) * rest;
    });
    tail.position.y = .46 - rest * .20;
    tail.rotation.y = Math.sin(t * .65 + x) * .12;
    eyes.visible = !rest;
    sleepingEyes.visible = !!rest;
  });

  return root;
}

export function createClayDove(kit, x, y, z) {
  const root = kit.groupAt(x, y, z);
  root.name = 'Pomba de massinha';
  root.userData.clayCreature = 'bird';
  clayParts(kit, root, '#f4eee0', [
    [0, 0, 0, .135, .15, .255],
    [0, .135, .185, .12, .122, .122],
    [-.052, -.022, -.245, .052, .024, .185, .10],
    [0, -.018, -.255, .055, .024, .195, 0],
    [.052, -.022, -.245, .052, .024, .185, -.10],
  ]);
  clayParts(kit, root, '#d8b26e', [[0, .108, .305, .034, .025, .078]]);
  clayParts(kit, root, '#362a23', [
    [-.078, .148, .256, .014, .019, .010],
    [.078, .148, .256, .014, .019, .010],
  ], { roughness: .2, bumpScale: 0 });
  clayParts(kit, root, '#fff9ea', [
    [-.081, .154, .263, .005, .006, .004],
    [.081, .154, .263, .005, .006, .004],
  ], { roughness: .18, bumpScale: 0 });
  const wings = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    wing.position.set(side * .075, .028, -.015);
    root.add(wing);
    const feathers = [
      ...Array.from({ length: 5 }, (_, i) => [side * (.10 + i * .046), 0, -.022 - i * .028, .152, .032, .072, 0, side * .20]),
      ...Array.from({ length: 3 }, (_, i) => [side * (.085 + i * .042), .018, .015 - i * .022, .105, .028, .058, 0, side * .14]),
    ];
    clayParts(kit, wing, '#faf4e6', feathers);
    wings.push(wing);
  }
  kit.ambient(t => {
    wings[0].rotation.z = .16 + Math.sin(t * 6) * .65;
    wings[1].rotation.z = -.16 - Math.sin(t * 6) * .65;
  });
  root.userData.wings = wings;
  return root;
}
