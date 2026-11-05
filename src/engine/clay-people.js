import * as THREE from 'three';
import { resolveFigureStyling, setExpression } from './acting.js';
import { getCharacterProfile } from './character-profiles.js';

const TAU = Math.PI * 2;
const tone = (color, target, amount) => `#${new THREE.Color(color).lerp(new THREE.Color(target), amount).getHexString()}`;
const silhouetteNames = ['straight', 'bell', 'wrapped'];
const hairNames = ['soft', 'swept', 'parted'];

function identitySeed(identity) {
  let seed = [...identity].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  seed = Math.imul(seed ^ (seed >>> 16), 2246822507) >>> 0;
  return (seed ^ (seed >>> 13)) >>> 0;
}

function robeGeometry(kit, variant) {
  const key = `person-robe-${variant}`;
  if (kit.geometryCache.has(key)) return kit.geometryCache.get(key);
  const points = [
    [0, .15], [.23, .15], [.315, .18], [.342, .25], [.337, .37],
    [.317, .57], [.289, .78], [.276, .96], [.253, 1.07], [.18, 1.14], [0, 1.15],
  ];
  if (variant === 1) { points[2][0] = .30; points[3][0] = .334; points[4][0] = .315; }
  if (variant === 2) { points[2][0] = .295; points[3][0] = .322; points[4][0] = .329; }
  const geometry = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 28);
  if (variant === 2) {
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), theta = Math.atan2(p.getX(i), p.getZ(i));
      const weight = Math.max(0, 1 - Math.abs(y - .38) / .3);
      const inset = 1 - .035 * weight * (.5 + .5 * Math.cos(theta * 3 + .5));
      p.setX(i, p.getX(i) * inset);
      p.setZ(i, p.getZ(i) * inset);
    }
    geometry.computeVertexNormals();
  }
  kit.geometryCache.set(key, geometry);
  return geometry;
}

/**
 * Manto / sobretudo aberto na frente (+Z) que envolve suavemente costas, laterais
 * e ombros sem criar volumes cilíndricos frontais nem abas abauladas nas costas.
 */
function mantleGeometry(kit, variant) {
  const key = `person-mantle-coat-${variant}`;
  if (kit.geometryCache.has(key)) return kit.geometryCache.get(key);
  const flare = variant === 2 ? .012 : variant === 1 ? .004 : .008;
  const outer = [
    [.344 + flare, .24],
    [.354 + flare, .36],
    [.336 + flare * .6, .56],
    [.309, .78],
    [.296, .96],
    [.272, 1.075],
    [.214, 1.132],
  ];
  const inner = [
    [.198, 1.124],
    [.255, 1.065],
    [.279, .955],
    [.292, .775],
    [.319 + flare * .5, .56],
    [.336 + flare, .36],
    [.327 + flare, .24],
    [.344 + flare, .24],
  ];
  const pts = [...outer, ...inner].map(([r, y]) => new THREE.Vector2(r, y));
  const geometry = new THREE.LatheGeometry(pts, 26, .52, TAU - 1.04);
  geometry.computeVertexNormals();
  kit.geometryCache.set(key, geometry);
  return geometry;
}

function instancedSymmetric(geometry, material, transforms, parent) {
  const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
  const dummy = new THREE.Object3D();
  transforms.forEach(({ pos, scale = [1, 1, 1], rot = [0, 0, 0] }, idx) => {
    dummy.position.set(...pos);
    dummy.scale.set(...scale);
    dummy.rotation.set(...rot);
    dummy.updateMatrix();
    mesh.setMatrixAt(idx, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingBox();
  mesh.computeBoundingSphere();
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * Escultura artesanal stop-motion / claymation com identidade cultural e histórica
 * por personagem, preservando todos os pivôs de animação (ombro .31, antebraço .27,
 * cabeça 1.37 e coroa .39) e orçamento enxuto de malhas para cenas com multidão.
 */
export function createClayPerson(kit, name, x, z, rawOptions = {}) {
  const profile = getCharacterProfile(kit.id, name, rawOptions);
  const lockProfileGarment =
    profile.garmentStyle === 'restoration-man' ||
    profile.garmentStyle === 'christ-resurrected' ||
    profile.garmentStyle === 'roman-soldier';
  const mergedOptions = {
    ...profile,
    ...rawOptions,
    robe: lockProfileGarment ? profile.robe : (rawOptions.robe || profile.robe),
    mantle: lockProfileGarment
      ? profile.mantle
      : (rawOptions.mantle !== undefined ? rawOptions.mantle : profile.mantle),
    hair: rawOptions.hair || profile.hair,
    skin: rawOptions.skin || profile.skin,
    beard: rawOptions.beard !== undefined ? rawOptions.beard : (profile.beard ?? true),
  };
  const o = resolveFigureStyling(kit.id, name, mergedOptions);
  const root = kit.groupAt(x, o.y || 0, z);
  const seed = identitySeed(`${kit.id}/${name}/${x}/${z}`);
  const explicitSilhouette = silhouetteNames.indexOf(o.silhouette);
  const variant = explicitSilhouette < 0 ? seed % 3 : explicitSilhouette;
  const explicitHair = hairNames.indexOf(o.hairStyle);
  const hairVariant = explicitHair < 0 ? (seed >>> 8) % 3 : explicitHair;
  const mantleVariant = o.mantleStyle === 'shawl' || o.veil ? 2 : (seed >>> 16) % 3;

  const skin = o.skin || '#c99572';
  const cloth = o.robe || '#e3d5b4';
  const hair = o.hair || '#594035';
  const clothShade = tone(cloth, '#786254', .22);
  const beltColor = o.accentColor || tone(cloth, '#7a5c40', .52);
  const clothGlow = o.heavenlyGlow ? { emissive: '#fff2d0', emissiveIntensity: .15 } : {};
  const irisPalette = ['#5b4331', '#4a6258', '#685138', '#3f5363'];
  const irisColor = o.heavenlyGlow ? '#6a523c' : irisPalette[seed % irisPalette.length];

  root.rotation.y = o.rotation || 0;
  root.scale.setScalar(o.scale || 1);
  root.name = `Miniatura em argila · ${name}`;
  root.userData.clayPerson = {
    style: 'plasticine-chibi',
    eraStyle: o.eraStyle || 'biblical',
    garmentStyle: o.garmentStyle || 'biblical',
    headRadius: .36,
    crownOffset: .39,
    upperArm: .31,
    forearm: .27,
    eyesClosed: !!o.eyesClosed,
    baseExpression: o.expression || 'sereno',
    crucifixionMarks: !!o.crucifixionMarks,
    heavenlyGlow: !!o.heavenlyGlow,
    silhouette: silhouetteNames[variant],
    hairStyle: o.hairStyle || hairNames[hairVariant],
    mantleVariant,
  };

  const local = (geometry, color, px, py, pz, parent = root, options = {}) =>
    kit.mesh(geometry, kit.mat(color, { surface: 'cloth', ...options }), px, py, pz, parent);
  const ball = (radius, color, px, py, pz, parent = root, scale, options) => {
    const mesh = local(new THREE.SphereGeometry(radius, 20, 14), color, px, py, pz, parent, options);
    if (scale) mesh.scale.set(...scale);
    return mesh;
  };
  const capsule = (radius, length, color, px, py, pz, parent = root, options) =>
    local(new THREE.CapsuleGeometry(radius, length, 5, 12), color, px, py, pz, parent, options);

  // 1. Túnica / Traje base
  const robe = local(robeGeometry(kit, variant), cloth, 0, 0, 0, root, clothGlow);
  robe.name = 'Túnica modelada em argila';
  if (o.crucifixionMarks && kit.id !== 'B30') {
    const sideMark = capsule(.0075, .034, '#9b4d45', .168, .78, .238, robe, { roughness: .74, bumpScale: 0 });
    sideMark.rotation.z = .38;
    sideMark.name = 'Marca da lança no lado';
  }

  // 2. Camadas de Roupa por Época (Restauração séc. XIX, Romano, Guerreiro, Mulher)
  if (o.garmentStyle === 'restoration-man') {
    const vest = capsule(.145, .28, o.vestColor || '#7d6e56', 0, .86, .165, root);
    vest.scale.set(1.05, 1, .48);
    const shirt = ball(.115, o.shirtColor || '#f4eee1', 0, 1.01, .215, root, [.88, .95, .42]);
    shirt.name = 'Camisa do século XIX';
    const cravat = capsule(.022, .075, o.cravatColor || '#2b2522', 0, 1.03, .258, root);
    cravat.rotation.z = Math.PI / 2;
    instancedSymmetric(
      new THREE.CapsuleGeometry(.032, .28, 5, 10),
      kit.mat(tone(cloth, '#1e242b', .28), { surface: 'cloth' }),
      [
        { pos: [-.115, .91, .235], scale: [1, 1, .45], rot: [0, 0, -.22] },
        { pos: [.115, .91, .235], scale: [1, 1, .45], rot: [0, 0, .22] },
      ],
      root,
    );
  } else if (o.garmentStyle === 'roman-soldier') {
    // Lorica segmentata de aço escovado + ombreiras + tiras de couro (pteruges)
    const steelMatOpts = { metalness: .44, roughness: .42 };
    const cuirass = ball(.292, '#99a0a8', 0, .87, .035, root, [1.03, .92, .93], steelMatOpts);
    cuirass.name = 'Couraça esculpida';
    for (const [bandY, bandR] of [[.94, .272], [.80, .284]]) {
      const segBand = local(new THREE.TorusGeometry(bandR, .016, 6, 26), '#b0b7bf', 0, bandY, .02, root, steelMatOpts);
      segBand.rotation.x = Math.PI / 2;
    }
    instancedSymmetric(
      new THREE.SphereGeometry(.125, 14, 10),
      kit.mat('#a3aab2', { surface: 'cloth', ...steelMatOpts }),
      [
        { pos: [-.225, 1.055, 0], scale: [.92, .68, 1.05], rot: [0, 0, .26] },
        { pos: [.225, 1.055, 0], scale: [.92, .68, 1.05], rot: [0, 0, -.26] },
      ],
      root,
    );
    const pteruges = [];
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * TAU + .31;
      pteruges.push({
        pos: [Math.sin(ang) * .312, .495, Math.cos(ang) * .312],
        scale: [.92, 1, .34],
        rot: [0, ang, 0],
      });
    }
    instancedSymmetric(
      new THREE.CapsuleGeometry(.038, .17, 4, 8),
      kit.mat('#613c24', { surface: 'cloth', roughness: .76 }),
      pteruges,
      root,
    );
  } else if (o.armor) {
    // Couraça esculpida para Capitão Morôni, Helamã, Jovens Guerreiros e Golias
    const armorColor = o.accentColor || '#9e8455';
    const cuirass = ball(.285, armorColor, 0, .86, .065, root, [1.02, .92, .88], { metalness: .30, roughness: .50 });
    cuirass.name = 'Couraça esculpida';
    const chestPlate = local(new THREE.TorusGeometry(.278, .018, 6, 28), tone(armorColor, '#e0c684', .3), 0, .71, .01, root, { metalness: .34, roughness: .46 });
    chestPlate.rotation.x = Math.PI / 2;
  } else if (o.garmentStyle === 'restoration-woman') {
    const shawl = ball(.285, o.mantle || '#e6d8be', 0, .96, .04, root, [1.06, .62, .92]);
    shawl.name = 'Xale histórico';
    ball(.032, o.accentColor || '#d4b475', 0, 1.03, .265, root, [.9, 1.1, .5]);
  }

  // Cinto / faixa na cintura e dobras da túnica
  const belt = local(new THREE.TorusGeometry(.307, .024, 7, 32), beltColor, 0, .65, 0);
  belt.rotation.x = Math.PI / 2;
  ball(.042, beltColor, -.025, .648, .303, root, [.8, .85, .7]);
  instancedSymmetric(
    new THREE.CapsuleGeometry(.013, .16, 4, 8),
    kit.mat(beltColor, { surface: 'cloth' }),
    [
      { pos: [-.05, .55, .31], rot: [0, 0, -.16] },
      { pos: [0, .55, .31], rot: [0, 0, .16] },
    ],
    root,
  );
  const foldScaleX = variant === 2 ? 1.8 : variant === 1 ? 1.35 : 1;
  instancedSymmetric(
    new THREE.CapsuleGeometry(.016, .36, 4, 8),
    kit.mat(clothShade, { surface: 'cloth' }),
    [
      { pos: [-.215, .41, .233], scale: [foldScaleX, 1, .45], rot: [0, 0, .12] },
      { pos: [.215, .41, .233], scale: [foldScaleX, 1, .45], rot: [0, 0, -.12] },
    ],
    root,
  );
  const hem = local(new THREE.TorusGeometry(.326, .013, 6, 32), o.accentColor || clothShade, 0, .208, 0, root, clothGlow);
  hem.rotation.x = Math.PI / 2;
  hem.scale.setScalar([1, .97, .94][variant]);

  // 3. Pernas e Calçados por Época (Sandálias, Botas ou Sapatos do séc. XIX)
  // Nota: O primeiro SphereGeometry de cada perna permanece exatamente em (0, -.365, .061)
  // para preservar todos os testes de contato com o solo e caminhada.
  const footwearColor = o.footwear === 'shoes' ? '#362d26' : o.footwear === 'boots' ? '#634832' : '#806249';
  const trouserColor = o.garmentStyle === 'restoration-man' ? tone(cloth, '#262b30', .3) : cloth;
  const legs = {};
  for (const [side, key] of [[-1, 'leftLeg'], [1, 'rightLeg']]) {
    const leg = new THREE.Group();
    leg.name = side < 0 ? 'Perna esquerda' : 'Perna direita';
    leg.position.set(side * .115, .42, 0);
    root.add(leg);
    capsule(.074, .24, trouserColor, 0, -.16, 0, leg, clothGlow);
    ball(.12, footwearColor, 0, -.365, .061, leg, [.86, .43, 1.25]);
    if (o.footwear === 'boots') {
      const greave = local(new THREE.TorusGeometry(.078, .014, 6, 18), tone(footwearColor, '#9c7a54', .25), 0, -.26, .01, leg);
      greave.rotation.x = Math.PI / 2;
    } else if (o.footwear === 'sandals') {
      const strap = local(new THREE.TorusGeometry(.082, .009, 5, 16), '#6b4c33', 0, -.32, .055, leg);
      strap.rotation.x = Math.PI / 2 + .25;
    }
    if (o.crucifixionMarks) {
      const footMark = capsule(.009, .016, '#9b4d45', 0, -.315, .095, leg, { surface: 'skin', roughness: .72, bumpScale: 0 });
      footMark.name = 'Marca dos cravos no pé';
    }
    legs[key] = root.userData[key] = leg;
  }

  // 4. Cabeça e Rosto Artesanal
  const head = new THREE.Group();
  head.name = 'Cabeça chibi articulada';
  head.position.set(0, 1.37, 0);
  root.add(head);
  const skinOptions = { surface: 'skin', roughness: .64, bumpScale: .007 };
  const face = ball(.36, skin, 0, 0, 0, head, [.97, 1, .91], skinOptions);
  face.name = 'Rosto de argila';

  // Cabelos Esculpidos por Estilo + Véus / Faixas / Coroas / Elmos
  const hairOptions = { surface: 'hair' };
  const hStyle = o.hairStyle || hairNames[hairVariant];
  ball(.35, hair, 0, .012, -.12, head, hairVariant === 2 ? [.94, 1.02, .67] : hairVariant === 1 ? [.94, .98, .65] : [.98, .98, .67], hairOptions);
  const cap = local(new THREE.SphereGeometry(.365, 24, 14, 0, TAU, 0, Math.PI * .46), hair, 0, .025, -.018, head, hairOptions);
  cap.scale.z = .94;

  if (!o.helmet) {
    for (const [px, py, pz, size, tilt] of [
      [-.225, .194, .202, .116, -.50], [-.105, .247, .265, .133, -.30],
      [.065, .26, .275, .139, .25], [.215, .213, .215, .11, .55],
    ]) {
      const parted = hStyle === 'bun-veil' || hStyle === 'shoulder-waves' || hairVariant === 2;
      const swept = hairVariant === 1;
      const lock = ball(size, hair, px * (parted ? 1.08 : .96), py - (swept ? .018 : 0), pz, head, [parted ? 1.04 : 1.16, swept ? .55 : .61, .60], hairOptions);
      lock.rotation.z = tilt + (swept ? -.23 : parted ? Math.sign(px) * .12 : 0);
    }
  }

  // Mechas nos ombros para Jesus Cristo, Profetas e cabelos longos/tranças
  if (!o.helmet && (hStyle === 'shoulder-waves' || hStyle === 'patriarch-long' || hStyle === 'braided')) {
    instancedSymmetric(
      new THREE.CapsuleGeometry(.058, .19, 5, 10),
      kit.mat(hair, hairOptions),
      [
        { pos: [-.285, -.165, -.055], rot: [.12, 0, .16] },
        { pos: [.285, -.165, -.055], rot: [.12, 0, -.16] },
      ],
      head,
    );
  }

  // Coque traseiro e véu fluido para mulheres das escrituras
  if (hStyle === 'bun-veil' && !o.helmet) {
    ball(.135, hair, 0, -.04, -.34, head, [1, .92, .85], hairOptions);
    if (o.veil && o.mantle) {
      const veilCap = local(new THREE.SphereGeometry(.374, 20, 12, 0, TAU, 0, Math.PI * .52), o.mantle, 0, .01, -.045, head, clothGlow);
      veilCap.scale.set(.98, .96, .95);
      veilCap.name = 'Véu esculpido';
    }
  }

  // Elmo Romano (galea com protetores faciais e crista vermelha) ou Elmo de Bronze (Golias)
  if (o.helmet === 'roman') {
    const steelOpts = { metalness: .44, roughness: .42 };
    const brassOpts = { metalness: .46, roughness: .38 };
    const galea = local(new THREE.SphereGeometry(.396, 24, 14, 0, TAU, 0, Math.PI * .52), '#989fa7', 0, .058, 0, head, steelOpts);
    galea.scale.set(1.01, .92, 1.01);
    galea.name = 'Capacete romano de argila';
    galea.userData.clayHelmet = true;

    const browBand = local(new THREE.TorusGeometry(.384, .018, 6, 24), '#c9a356', 0, .072, -.005, head, brassOpts);
    browBand.rotation.x = Math.PI / 2 - .06;

    const neckGuard = ball(.24, '#8d949c', 0, -.055, -.28, head, [1.22, .26, .62], steelOpts);
    neckGuard.rotation.x = .32;

    instancedSymmetric(
      new THREE.CapsuleGeometry(.044, .11, 4, 8),
      kit.mat('#959ca4', { surface: 'cloth', ...steelOpts }),
      [
        { pos: [-.324, -.068, .112], scale: [.52, 1, .95], rot: [.18, .28, .16] },
        { pos: [.324, -.068, .112], scale: [.52, 1, .95], rot: [.18, -.28, -.16] },
      ],
      head,
    );

    const crestHolder = capsule(.02, .11, '#c8a255', 0, .41, -.018, head, brassOpts);
    crestHolder.name = 'Suporte da crista romana';
    const crestScale = o.crest === 'transverse' ? [1.22, .58, .32] : [.32, .60, 1.24];
    const plume = ball(.17, '#bd2826', 0, .475, -.02, head, crestScale, { roughness: .78 });
    plume.name = 'Crista romana vermelha';
  } else if (o.helmet === 'bronze') {
    const bronzeOpts = { metalness: .42, roughness: .44 };
    const helm = local(new THREE.SphereGeometry(.396, 22, 14, 0, TAU, 0, Math.PI * .51), '#a17e49', 0, .058, 0, head, bronzeOpts);
    helm.scale.set(1.01, .92, 1.01);
    helm.name = 'Elmo de bronze esculpido';
    const rim = local(new THREE.TorusGeometry(.384, .019, 6, 24), '#bd9858', 0, .072, 0, head, bronzeOpts);
    rim.rotation.x = Math.PI / 2 - .05;
  }

  // Faixa de testa (headband) para jovens e guerreiros do Livro de Mórmon / Davi
  if (o.headband && !o.helmet) {
    const band = local(new THREE.TorusGeometry(.348, .018, 6, 28), o.accentColor || '#9c6b43', 0, .145, -.01, head);
    band.rotation.x = Math.PI / 2 - .08;
    band.scale.z = .94;
    band.name = 'Faixa frontal';
  }

  // Coroa real com pontas douradas esculpidas ou toucado egípcio (abaixo de .385)
  if (o.crown === 'gold') {
    const goldOpts = { metalness: .46, roughness: .36 };
    const crownBand = local(new THREE.TorusGeometry(.31, .022, 6, 26), '#d9b45b', 0, .23, -.01, head, goldOpts);
    crownBand.rotation.x = Math.PI / 2 - .06;
    crownBand.name = 'Coroa real';
    const peaks = [];
    for (let i = 0; i < 5; i++) {
      const ang = -1.1 + i * .55;
      peaks.push({
        pos: [Math.sin(ang) * .292, .274, Math.cos(ang) * .285 - .01],
        scale: [1, 1, .82],
        rot: [.06, ang, 0],
      });
    }
    instancedSymmetric(
      new THREE.ConeGeometry(.028, .068, 6),
      kit.mat('#e2bf66', { surface: 'cloth', ...goldOpts }),
      peaks,
      head,
    );
  } else if (o.crown === 'egyptian') {
    const diadem = local(new THREE.TorusGeometry(.345, .02, 6, 26), '#d4af59', 0, .16, -.005, head, { metalness: .42, roughness: .4 });
    diadem.rotation.x = Math.PI / 2 - .05;
    diadem.name = 'Diadema egípcio';
  }

  // Orelhas laterais com cavidade interna e costeletas
  for (const side of [-1, 1]) {
    ball(.073, skin, side * .337, -.018, -.002, head, [.76, .95, .67], skinOptions).name = 'Orelha de argila';
  }
  instancedSymmetric(
    new THREE.SphereGeometry(.036, 10, 8),
    kit.mat(tone(skin, '#9e664c', .28), skinOptions),
    [
      { pos: [-.352, -.02, .006], scale: [.48, .72, .42] },
      { pos: [.352, -.02, .006], scale: [.48, .72, .42] },
    ],
    head,
  );
  if (!o.helmet) {
    instancedSymmetric(
      new THREE.SphereGeometry(.092, 12, 10),
      kit.mat(hair, hairOptions),
      [
        { pos: [-.316, .036, -.024], scale: [.43, hairVariant === 2 ? 1.2 : 1.3, .85], rot: [0, 0, -.13] },
        { pos: [.316, .036, -.024], scale: [.43, hairVariant === 2 ? 1.2 : 1.3, .85], rot: [0, 0, .13] },
      ],
      head,
    );
  }

  // 5. Olhos Expressivos (Esclera sutil, Íris colorida, Pupila escura, Pálpebra superior e Catchlight)
  const animatedEyes = [];
  const brows = {};
  const tears = {};
  for (const side of [-1, 1]) {
    if (o.eyesClosed) {
      const points = Array.from({ length: 7 }, (_, i) => {
        const t = i / 6, px = side * .114 + (t - .5) * .068;
        const py = -.005 - Math.sin(t * Math.PI) * .017;
        const pz = .36 * .91 * Math.sqrt(1 - (px / (.36 * .97)) ** 2 - (py / .36) ** 2) + .007;
        return new THREE.Vector3(px, py, pz);
      });
      const eyelid = local(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 12, .0065, 5, false), tone(skin, '#744c40', .60), 0, 0, 0, head, { roughness: .74, bumpScale: 0 });
      eyelid.name = side < 0 ? 'Pálpebra esquerda fechada' : 'Pálpebra direita fechada';
      eyelid.userData.clayEye = 'lid';
    } else {
      const sclera = ball(.033, '#f7f1e6', side * .114, -.005, .303, head, [.92, 1.08, .46], { roughness: .36, bumpScale: 0 });
      sclera.userData.clayEyePart = 'sclera';
      animatedEyes.push({ mesh: sclera, height: sclera.scale.y });

      const iris = ball(.027, irisColor, side * .114, -.005, .308, head, [.84, 1.07, .52], { roughness: .28, bumpScale: 0 });
      iris.userData.clayEyePart = 'iris';
      animatedEyes.push({ mesh: iris, height: iris.scale.y });

      const eye = ball(.021, '#241b18', side * .114, -.005, .313, head, [.79, 1.07, .56], { roughness: .22, bumpScale: 0 });
      eye.userData.clayEye = 'pupil';
      animatedEyes.push({ mesh: eye, height: eye.scale.y });

      const highlight = ball(.008, '#fffdf7', side * .114 - .006, .006, .326, head, [1, 1, .62], { roughness: .18, bumpScale: 0 });
      highlight.userData.clayEye = 'highlight';
      animatedEyes.push({ mesh: highlight, height: highlight.scale.y });

      const upperLid = capsule(.0075, .036, tone(skin, '#845846', .38), side * .114, .022, .311, head, skinOptions);
      upperLid.rotation.z = Math.PI / 2 - side * .05;
      upperLid.userData.clayEyePart = 'upperLid';
    }
    const brow = capsule(.009, .046, hair, side * .114, .065, .305, head, hairOptions);
    brow.rotation.z = Math.PI / 2 + side * .07;
    brows[side < 0 ? 'L' : 'R'] = brow;

    const tear = ball(.0105, '#b9d8e8', side * .125, -.044, .312, head, [.62, 1.35, .42], { roughness: .2, bumpScale: 0 });
    tear.visible = false;
    tear.name = side < 0 ? 'Lágrima esquerda' : 'Lágrima direita';
    tears[side < 0 ? 'L' : 'R'] = tear;
  }
  instancedSymmetric(
    new THREE.SphereGeometry(.044, 12, 10),
    kit.mat(tone(skin, '#e68a80', .36), skinOptions),
    [
      { pos: [-.216, -.068, .254], scale: [1.1, .63, .20] },
      { pos: [.216, -.068, .254], scale: [1.1, .63, .20] },
    ],
    head,
  );

  // Nariz esculpido em massinha (ponte + ponta arredondada)
  capsule(.015, .042, tone(skin, '#e3ad93', .10), 0, -.024, .326, head, skinOptions);
  const noseTip = ball(.045, tone(skin, '#e9b298', .14), 0, -.056, .338, head, [.78, .82, .74], skinOptions);
  noseTip.name = 'Nariz de argila';

  // Boca articulada
  const smileCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-.037, .008, -.006),
    new THREE.Vector3(0, -.008, .007),
    new THREE.Vector3(.037, .008, -.006),
  );
  const mouth = local(new THREE.TubeGeometry(smileCurve, 10, .0055, 5, false), tone(skin, '#744c40', .52), 0, -.135, .314, head, { bumpScale: 0 });
  mouth.name = 'Boca articulada';

  // 6. Barbas em Camadas (curta, Jesus, patriarca longa ou real)
  if (o.beard !== false) {
    const bStyle = o.beardStyle || 'short-beard';
    const beardScale = bStyle === 'full-patriarch' ? [.98, .92, .94] : bStyle === 'trimmed-jesus' ? [.94, .68, .90] : [.95, .72, .91];
    const beardY = bStyle === 'full-patriarch' ? -.245 : -.223;
    const beard = ball(.218, hair, 0, beardY, .078, head, beardScale, hairOptions);
    beard.name = 'Barba esculpida';
    if (bStyle === 'full-patriarch' || bStyle === 'royal-beard') {
      const lowerBeard = ball(.145, hair, 0, -.34, .11, head, [.88, .95, .78], hairOptions);
      lowerBeard.name = 'Pontas da barba longa';
    }
    instancedSymmetric(
      new THREE.CapsuleGeometry(.027, .05, 4, 8),
      kit.mat(hair, hairOptions),
      [
        { pos: [-.047, -.096, .312], scale: [1, 1, .60], rot: [0, 0, -1.18] },
        { pos: [.047, -.096, .312], scale: [1, 1, .60], rot: [0, 0, 1.18] },
      ],
      head,
    );
  }

  // 7. Manto Sobreposto Fluido (aberto na frente, sem cilindros/baguetes nem abas de besouro)
  // Suprimido em soldados/guerreiros com armadura para exibir couraça limpa.
  if (o.mantle && !o.armor && o.garmentStyle !== 'roman-soldier' && o.garmentStyle !== 'restoration-woman') {
    const mantleShell = local(mantleGeometry(kit, mantleVariant), o.mantle, 0, 0, 0, root, clothGlow);
    mantleShell.name = 'Manto envolvente esculpido';
    instancedSymmetric(
      new THREE.CapsuleGeometry(.016, .62, 5, 10),
      kit.mat(tone(o.mantle, '#5e5044', .14), { surface: 'cloth', ...clothGlow }),
      [
        { pos: [-.154, .64, .265], scale: [.92, 1, .46], rot: [0, .48, .05] },
        { pos: [.154, .64, .265], scale: [.92, 1, .46], rot: [0, -.48, -.05] },
      ],
      root,
    );
  }
  if (o.mantle && (o.garmentStyle === 'christ-mortal' || o.garmentStyle === 'christ-resurrected')) {
    const sash = capsule(.052, .46, o.sashColor || o.mantle, -.02, .86, .248, root, clothGlow);
    sash.rotation.z = -.58;
    sash.scale.z = .36;
    sash.name = 'Faixa transversal do manto';
  }

  // 7B. Asas Emplumadas Esculpidas e Auréola Luminosa (Anjos celestiais)
  const angelWings = [];
  if (o.angelWings) {
    const featherGeo = kit.geometryCache.get('angel-feather-sphere') || (() => {
      const g = new THREE.SphereGeometry(1, 12, 9);
      kit.geometryCache.set('angel-feather-sphere', g);
      return g;
    })();
    const featherMat = kit.mat('#f6f0e2', { surface: 'cloth', emissive: '#fff4d6', emissiveIntensity: .18, roughness: .82 });
    for (const side of [-1, 1]) {
      const wing = new THREE.Group();
      wing.name = side < 0 ? 'Asa esquerda de argila' : 'Asa direita de argila';
      wing.position.set(side * .20, 1.02, -.175);
      root.add(wing);
      const feathers = [];
      for (let i = 0; i < 6; i++) {
        const tier = i < 4 ? i : i - 3.5;
        const rowY = i < 4 ? .09 + i * .062 : -.02 + (i - 4) * .055;
        feathers.push({
          pos: [side * (.11 + tier * .088), rowY, i < 4 ? -.02 : -.045],
          scale: [.112, (.265 - tier * .02), .062],
          rot: [0, -side * .12, -side * (.52 + tier * .17)],
        });
      }
      instancedSymmetric(featherGeo, featherMat, feathers, wing);
      angelWings.push({ wing, side });
    }
  }
  if (o.angelHalo) {
    const halo = local(
      new THREE.TorusGeometry(.22, .021, 7, 32),
      '#f6df9e',
      0,
      1.89,
      -.01,
      root,
      { emissive: '#e8be68', emissiveIntensity: 1.55, roughness: .34, bumpScale: 0 },
    );
    halo.rotation.x = Math.PI / 2;
    halo.name = 'Auréola luminosa';
  }

  // 8. Braços, Braceletes e Mãos com Polegar Destacado
  const sleeveColor = o.garmentStyle === 'roman-soldier' ? cloth : cloth;
  const arms = {};
  for (const [side, key] of [[-1, 'L'], [1, 'R']]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * .24, 1.08, 0);
    root.add(shoulder);
    const upper = capsule(.119, .11, sleeveColor, 0, -.14, 0, shoulder, clothGlow);
    upper.scale.z = .95;
    const elbow = new THREE.Group();
    elbow.position.y = -.31;
    shoulder.add(elbow);
    const forearmCloth = o.garmentStyle === 'roman-soldier' ? skin : sleeveColor;
    const forearmOpts = o.garmentStyle === 'roman-soldier' ? skinOptions : clothGlow;
    capsule(.094, .10, forearmCloth, 0, -.108, 0, elbow, forearmOpts);
    const cuffColor = o.garmentStyle === 'roman-soldier'
      ? '#664028'
      : o.bracers
        ? (o.accentColor || '#8c6239')
        : o.garmentStyle === 'restoration-man'
          ? '#f4eee1'
          : clothShade;
    const cuff = local(new THREE.TorusGeometry(.085, o.bracers ? .018 : .012, 6, 20), cuffColor, 0, -.225, 0, elbow);
    cuff.rotation.x = Math.PI / 2;
    const hand = new THREE.Group();
    hand.position.set(0, -.27, 0);
    elbow.add(hand);
    ball(.09, skin, 0, 0, .004, hand, [.90, 1.06, .84], skinOptions);
    const thumb = ball(.038, skin, -side * .062, .024, .046, hand, [.84, 1.12, .90], skinOptions);
    thumb.name = 'Polegar esculpido';
    if (o.crucifixionMarks) {
      const handMark = capsule(.011, .132, '#9b4d45', 0, -.004, .004, hand, { surface: 'skin', roughness: .72, bumpScale: 0 });
      handMark.rotation.x = Math.PI / 2;
      handMark.name = 'Marca dos cravos na mão';
    }
    arms[key] = { shoulder, elbow, hand };
  }

  const rig = {
    root, head, robe,
    leftArm: arms.L.shoulder, rightArm: arms.R.shoulder,
    leftForearm: arms.L.elbow, rightForearm: arms.R.elbow,
    handL: arms.L.hand, handR: arms.R.hand,
    leftLeg: legs.leftLeg, rightLeg: legs.rightLeg,
    faceParts: {
      browL: brows.L,
      browR: brows.R,
      mouth,
      tearL: tears.L,
      tearR: tears.R,
      animatedEyes,
      lastBlinkOpenness: 1,
    },
  };
  setExpression(rig, o.expression || 'sereno', 1, 1);
  kit.people.push(rig);
  kit.select(root, name, 'Personagem deste episódio', '', 'Selecione o nome na lista para ler o contexto e as referências.');
  kit.label(root, name);
  const motionPhase = seed / 4294967296 * TAU;
  kit.ambient(t => {
    robe.scale.x = 1 + Math.sin(t * 1.5 + motionPhase) * .006;
    robe.scale.z = 1 + Math.sin(t * 1.5 + motionPhase) * .008;
    head.rotation.z = Math.sin(t * .8 + motionPhase) * .009;
    for (const { wing, side } of angelWings) {
      wing.rotation.y = side * (.08 + Math.sin(t * 1.4 + motionPhase) * .05);
    }
    const blinkPhase = ((t + motionPhase) % 5.7 + 5.7) % 5.7;
    const openness = 1 - .94 * Math.exp(-(((blinkPhase - 2.85) / .075) ** 2));
    rig.faceParts.lastBlinkOpenness = openness;
    for (const { mesh, height } of animatedEyes) mesh.scale.y = height * openness;
  });
  return rig;
}
