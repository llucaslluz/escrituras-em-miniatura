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
 * Escultura artesanal stop-motion / claymation com identidade cultural e histórica
 * por personagem, preservando todos os pivôs de animação (ombro .31, antebraço .27,
 * cabeça 1.37 e coroa .39) e orçamento enxuto de malhas para cenas com multidão.
 */
export function createClayPerson(kit, name, x, z, rawOptions = {}) {
  const profile = getCharacterProfile(kit.id, name, rawOptions);
  const mergedOptions = {
    ...profile,
    ...rawOptions,
    // Se o perfil nominal define cores históricas para personagens recorrentes,
    // usamos o perfil nominal, exceto quando rawOptions traz customização específica
    // que não conflita com trajes da Restauração ou de Cristo.
    robe: profile.garmentStyle === 'restoration-man' || profile.garmentStyle === 'christ-resurrected'
      ? profile.robe
      : (rawOptions.robe || profile.robe),
    mantle: profile.garmentStyle === 'restoration-man' || profile.garmentStyle === 'christ-resurrected'
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

  // 2. Camadas de Roupa por Época (Restauração séc. XIX, Guerreiro/Armadura, Cristo, Bíblico)
  if (o.garmentStyle === 'restoration-man') {
    // Colete do séc. XIX, camisa branca com colarinho e gravata-fita (cravat)
    const vest = capsule(.145, .28, o.vestColor || '#7d6e56', 0, .86, .165, root);
    vest.scale.set(1.05, 1, .48);
    const shirt = ball(.115, o.shirtColor || '#f4eee1', 0, 1.01, .215, root, [.88, .95, .42]);
    shirt.name = 'Camisa do século XIX';
    const cravat = capsule(.022, .075, o.cravatColor || '#2b2522', 0, 1.03, .258, root);
    cravat.rotation.z = Math.PI / 2;
    for (const side of [-1, 1]) {
      const lapel = capsule(.032, .28, tone(cloth, '#1e242b', .28), side * .115, .91, .235, root);
      lapel.rotation.z = side * .22;
      lapel.scale.z = .45;
    }
  } else if (o.armor) {
    // Couraça / Peitoral esculpido para Capitão Morôni, Helamã, Jovens Guerreiros, Golias e Soldados
    const armorColor = o.accentColor || '#9e8455';
    const cuirass = ball(.285, armorColor, 0, .86, .065, root, [1.02, .92, .88], { metalness: .28, roughness: .52 });
    cuirass.name = 'Couraça esculpida';
    const chestPlate = local(new THREE.TorusGeometry(.278, .018, 6, 28), tone(armorColor, '#e0c684', .3), 0, .71, .01, root, { metalness: .32, roughness: .48 });
    chestPlate.rotation.x = Math.PI / 2;
  } else if (o.garmentStyle === 'restoration-woman') {
    // Xale cruzado e camafeu/colarinho histórico do séc. XIX (Emma Smith)
    const shawl = ball(.285, o.mantle || '#e6d8be', 0, .96, .04, root, [1.06, .62, .92]);
    shawl.name = 'Xale histórico';
    ball(.032, o.accentColor || '#d4b475', 0, 1.03, .265, root, [.9, 1.1, .5]);
  }

  // Cinto / faixa na cintura e dobras da túnica
  const belt = local(new THREE.TorusGeometry(.307, .024, 7, 32), beltColor, 0, .65, 0);
  belt.rotation.x = Math.PI / 2;
  ball(.042, beltColor, -.025, .648, .303, root, [.8, .85, .7]);
  for (const side of [-1, 1]) {
    const cord = capsule(.013, .16, beltColor, -.025 + side * .025, .55, .31);
    cord.rotation.z = side * .16;
    const fold = capsule(.016, .36, clothShade, side * .215, .41, .233);
    fold.rotation.z = -side * .12;
    fold.scale.z = .45;
    fold.scale.x = variant === 2 ? 1.8 : variant === 1 ? 1.35 : 1;
  }
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

  // Cabelos Esculpidos por Estilo + Véus / Faixas / Coroas (sempre respeitando max y <= .385)
  const hairOptions = { surface: 'hair' };
  const hStyle = o.hairStyle || hairNames[hairVariant];
  ball(.35, hair, 0, .012, -.12, head, hairVariant === 2 ? [.94, 1.02, .67] : hairVariant === 1 ? [.94, .98, .65] : [.98, .98, .67], hairOptions);
  const cap = local(new THREE.SphereGeometry(.365, 24, 14, 0, TAU, 0, Math.PI * .46), hair, 0, .025, -.018, head, hairOptions);
  cap.scale.z = .94;

  for (const [px, py, pz, size, tilt] of [
    [-.225, .194, .202, .116, -.50], [-.105, .247, .265, .133, -.30],
    [.065, .26, .275, .139, .25], [.215, .213, .215, .11, .55],
  ]) {
    const parted = hStyle === 'bun-veil' || hStyle === 'shoulder-waves' || hairVariant === 2;
    const swept = hairVariant === 1;
    const lock = ball(size, hair, px * (parted ? 1.08 : .96), py - (swept ? .018 : 0), pz, head, [parted ? 1.04 : 1.16, swept ? .55 : .61, .60], hairOptions);
    lock.rotation.z = tilt + (swept ? -.23 : parted ? Math.sign(px) * .12 : 0);
  }

  // Mechas nos ombros para Jesus Cristo, Profetas e cabelos longos/tranças
  if (hStyle === 'shoulder-waves' || hStyle === 'patriarch-long' || hStyle === 'braided') {
    for (const side of [-1, 1]) {
      const wave = capsule(.058, .19, hair, side * .285, -.165, -.055, head, hairOptions);
      wave.rotation.z = -side * .16;
      wave.rotation.x = .12;
    }
  }

  // Coque traseiro e véu fluido para mulheres das escrituras
  if (hStyle === 'bun-veil') {
    ball(.135, hair, 0, -.04, -.34, head, [1, .92, .85], hairOptions);
    if (o.veil && o.mantle) {
      const veilCap = local(new THREE.SphereGeometry(.374, 20, 12, 0, TAU, 0, Math.PI * .52), o.mantle, 0, .01, -.045, head, clothGlow);
      veilCap.scale.set(.98, .96, .95);
      veilCap.name = 'Véu esculpido';
    }
  }

  // Faixa de testa (headband) para jovens e guerreiros do Livro de Mórmon / Davi
  if (o.headband) {
    const band = local(new THREE.TorusGeometry(.348, .018, 6, 28), o.accentColor || '#9c6b43', 0, .145, -.01, head);
    band.rotation.x = Math.PI / 2 - .08;
    band.scale.z = .94;
    band.name = 'Faixa frontal';
  }

  // Coroa real ou toucado egípcio (mantendo altura abaixo de .385 para preservar enquadramentos)
  if (o.crown === 'gold') {
    const crownBand = local(new THREE.TorusGeometry(.31, .022, 6, 26), '#d9b45b', 0, .23, -.01, head, { metalness: .45, roughness: .38 });
    crownBand.rotation.x = Math.PI / 2 - .06;
    crownBand.name = 'Coroa real';
  } else if (o.crown === 'egyptian') {
    const diadem = local(new THREE.TorusGeometry(.345, .02, 6, 26), '#d4af59', 0, .16, -.005, head, { metalness: .42, roughness: .4 });
    diadem.rotation.x = Math.PI / 2 - .05;
    diadem.name = 'Diadema egípcio';
  }

  // Orelhas laterais com cavidade interna e costeletas
  for (const side of [-1, 1]) {
    ball(.073, skin, side * .337, -.018, -.002, head, [.76, .95, .67], skinOptions).name = 'Orelha de argila';
    ball(.036, tone(skin, '#9e664c', .28), side * .352, -.02, .006, head, [.48, .72, .42], skinOptions);
    const sideburn = ball(.092, hair, side * .316, .036, -.024, head, [.43, hairVariant === 2 ? 1.2 : 1.3, .85], hairOptions);
    sideburn.rotation.z = side * .13;
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

    ball(.044, tone(skin, '#e68a80', .36), side * .216, -.068, .254, head, [1.1, .63, .20], skinOptions);
  }

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
    for (const side of [-1, 1]) {
      const mustache = capsule(.027, .05, hair, side * .047, -.096, .312, head, hairOptions);
      mustache.rotation.z = side * 1.18;
      mustache.scale.z = .60;
    }
  }

  // 7. Manto Sobreposto e Faixa Transversal (Jesus Cristo, Profetas e Mulheres)
  if (o.mantle) {
    ball(.34, o.mantle, 0, .70, -.168, root, [[1.08, 1.45, .44], [1, 1.35, .42], [1.08, 1.25, .44]][mantleVariant], clothGlow);
    for (const side of [-1, 1]) {
      const shoulderFold = ball(.17, o.mantle, side * .221, .985, -.04, root, [.65, 1.25, .60], clothGlow);
      shoulderFold.rotation.z = -side * [.24, .17, .30][mantleVariant];
    }
    const drape = capsule(.083, .48, o.mantle, -.218, .715, .245, root, clothGlow);
    drape.rotation.z = -.13;
    drape.scale.x = [1, .90, 1.08][mantleVariant];
    const mantleFold = capsule(.013, .37, tone(o.mantle, '#817668', .19), -.237, .704, .318);
    mantleFold.rotation.z = -.13;

    if (o.garmentStyle === 'christ-mortal' || o.garmentStyle === 'christ-resurrected') {
      const sash = capsule(.055, .46, o.sashColor || o.mantle, -.02, .86, .245, root, clothGlow);
      sash.rotation.z = -.58;
      sash.scale.z = .42;
      sash.name = 'Faixa transversal do manto';
    }
  }

  // 8. Braços, Braceletes e Mãos com Polegar Destacado
  const arms = {};
  for (const [side, key] of [[-1, 'L'], [1, 'R']]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * .24, 1.08, 0);
    root.add(shoulder);
    const upper = capsule(.119, .11, cloth, 0, -.14, 0, shoulder, clothGlow);
    upper.scale.z = .95;
    const elbow = new THREE.Group();
    elbow.position.y = -.31;
    shoulder.add(elbow);
    capsule(.094, .10, cloth, 0, -.108, 0, elbow, clothGlow);
    const cuffColor = o.bracers ? (o.accentColor || '#8c6239') : o.garmentStyle === 'restoration-man' ? '#f4eee1' : clothShade;
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
    const blinkPhase = ((t + motionPhase) % 5.7 + 5.7) % 5.7;
    const openness = 1 - .94 * Math.exp(-(((blinkPhase - 2.85) / .075) ** 2));
    rig.faceParts.lastBlinkOpenness = openness;
    for (const { mesh, height } of animatedEyes) mesh.scale.y = height * openness;
  });
  return rig;
}
