import * as THREE from 'three';

const TAU = Math.PI * 2;
const tone = (color, target, amount) => `#${new THREE.Color(color).lerp(new THREE.Color(target), amount).getHexString()}`;
const silhouetteNames=['straight','bell','wrapped'];
const hairNames=['soft','swept','parted'];
function identitySeed(identity){let seed=[...identity].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);seed=Math.imul(seed^(seed>>>16),2246822507)>>>0;return(seed^(seed>>>13))>>>0;}
function robeGeometry(kit,variant){
 const key=`person-robe-${variant}`;if(kit.geometryCache.has(key))return kit.geometryCache.get(key);
 const points=[[0,.15],[.23,.15],[.315,.18],[.342,.25],[.337,.37],[.317,.57],[.289,.78],[.276,.96],[.253,1.07],[.18,1.14],[0,1.15]];
 if(variant===1){points[2][0]=.30;points[3][0]=.334;points[4][0]=.315;}
 if(variant===2){points[2][0]=.295;points[3][0]=.322;points[4][0]=.329;}
 const geometry=new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),28);
 // Broad wrap folds use existing vertices, not additional strips or meshes.
 if(variant===2){const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),theta=Math.atan2(p.getX(i),p.getZ(i)),weight=Math.max(0,1-Math.abs(y-.38)/.3),inset=1-.035*weight*(.5+.5*Math.cos(theta*3+.5));p.setX(i,p.getX(i)*inset);p.setZ(i,p.getZ(i)*inset);}geometry.computeVertexNormals();}
 kit.geometryCache.set(key,geometry);return geometry;
}

/**
 * A sculpted toy figure with the original animation skeleton. Keeping the
 * shoulder, elbow and hand pivots (.31 + .27) also preserves the scene IK.
 * Head height stays 1.37 so authored kneeling poses and prop contacts survive.
 */
export function createClayPerson(kit, name, x, z, o = {}) {
  const root = kit.groupAt(x, o.y || 0, z);
  const seed=identitySeed(`${kit.id}/${name}/${x}/${z}`);
  const explicitSilhouette=silhouetteNames.indexOf(o.silhouette),variant=explicitSilhouette<0?seed%3:explicitSilhouette;
  const explicitHair=hairNames.indexOf(o.hairStyle),hairVariant=explicitHair<0?(seed>>>8)%3:explicitHair;
  const mantleVariant=o.mantleStyle==='shawl'?2:(seed>>>16)%3;
  const skin = o.skin || '#c99572', cloth = o.robe || '#e3d5b4', hair = o.hair || '#594035';
  const clothShade = tone(cloth, '#8f786a', .17);
  const beltColor = tone(cloth, '#896c50', .48);
  root.rotation.y = o.rotation || 0;
  root.scale.setScalar(o.scale || 1);
  root.name = `Miniatura em argila · ${name}`;
  root.userData.clayPerson = { style: 'plasticine-chibi', headRadius: .36, crownOffset: .39, upperArm: .31, forearm: .27, eyesClosed: !!o.eyesClosed };
  Object.assign(root.userData.clayPerson,{silhouette:silhouetteNames[variant],hairStyle:hairNames[hairVariant],mantleVariant});

  const local = (geometry, color, px, py, pz, parent = root, options = {}) =>
    kit.mesh(geometry, kit.mat(color, {surface:'cloth',...options}), px, py, pz, parent);
  const ball = (radius, color, px, py, pz, parent = root, scale, options) => {
    const mesh = local(new THREE.SphereGeometry(radius, 20, 14), color, px, py, pz, parent, options);
    if (scale) mesh.scale.set(...scale);
    return mesh;
  };
  const capsule = (radius, length, color, px, py, pz, parent = root, options) =>
    local(new THREE.CapsuleGeometry(radius, length, 5, 12), color, px, py, pz, parent, options);

  // The broad, softly pinched silhouette reads as a hand-shaped clay robe.
  const robe = local(robeGeometry(kit,variant), cloth, 0, 0, 0);
  robe.name = 'Túnica modelada em argila';
  const belt = local(new THREE.TorusGeometry(.307, .024, 7, 32), beltColor, 0, .65, 0);
  belt.rotation.x = Math.PI / 2;
  ball(.042, beltColor, -.025, .648, .303, root, [.8, .85, .7]);
  for (const side of [-1, 1]) {
    const cord = capsule(.013, .16, beltColor, -.025 + side * .025, .55, .31);
    cord.rotation.z = side * .16;
  }
  for (const side of [-1, 1]) {
    const fold = capsule(.016, .36, clothShade, side * .215, .41, .233);
    fold.rotation.z = -side * .12;
    fold.scale.z = .45;
    fold.scale.x=variant===2?1.8:variant===1?1.35:1;
  }
  const hem = local(new THREE.TorusGeometry(.326, .011, 6, 32), clothShade, 0, .208, 0);
  hem.rotation.x = Math.PI / 2;
  hem.scale.setScalar([1,.97,.94][variant]);

  // Tiny boots touch the ground; the legs retain their authored walking pivots.
  const legs = {};
  for (const [side, key] of [[-1, 'leftLeg'], [1, 'rightLeg']]) {
    const leg = new THREE.Group();
    leg.name = side < 0 ? 'Perna esquerda' : 'Perna direita';
    leg.position.set(side * .115, .42, 0);
    root.add(leg);
    capsule(.074, .24, cloth, 0, -.16, 0, leg);
    ball(.12, '#806249', 0, -.365, .061, leg, [.86, .43, 1.25]);
    legs[key] = root.userData[key] = leg;
  }

  const head = new THREE.Group();
  head.name = 'Cabeça chibi articulada';
  head.position.set(0, 1.37, 0);
  root.add(head);
  const skinOptions = { surface:'skin', roughness: .64, bumpScale: .007 };
  const face = ball(.36, skin, 0, 0, 0, head, [.97, 1, .91], skinOptions);
  face.name = 'Rosto de argila';

  // A cap, back mass and individual flattened locks replace the felt helmet.
  const hairOptions={surface:'hair'};
  ball(.35, hair, 0, .012, -.12, head, hairVariant===2?[.94,1.02,.67]:hairVariant===1?[.94,.98,.65]:[.98,.98,.67],hairOptions);
  const cap = local(new THREE.SphereGeometry(.365, 24, 14, 0, TAU, 0, Math.PI * .46), hair, 0, .025, -.018, head,hairOptions);
  cap.scale.z = .94;
  for (const [px, py, pz, size, tilt] of [
    [-.225, .194, .202, .116, -.50], [-.105, .247, .265, .133, -.30],
    [.065, .26, .275, .139, .25], [.215, .213, .215, .11, .55],
  ]) {
    const parted=hairVariant===2,swept=hairVariant===1;
    const lock = ball(size, hair, px*(parted?1.08:.96), py-(swept?.018:0), pz, head, [parted?1.04:1.16,swept?.55:.61,.60],hairOptions);
    lock.rotation.z = tilt+(swept?-.23:parted?Math.sign(px)*.12:0);
  }
  for (const side of [-1, 1]) {
    ball(.073, skin, side * .337, -.018, -.002, head, [.76, .95, .67], skinOptions);
    const sideburn = ball(.092, hair, side * .316, .036, -.024, head, [.43, hairVariant===2?1.2:1.3, .85],hairOptions);
    sideburn.rotation.z = side * .13;
  }

  const animatedEyes = [];
  for (const side of [-1, 1]) {
    if (o.eyesClosed) {
      // Follow the enlarged face surface, so sleeping eyes remain sculpted
      // into the head when a disciple bows or turns in an authored pose.
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
      const eye = ball(.025, '#382d2a', side * .114, -.005, .311, head, [.79, 1.07, .56], { roughness: .32, bumpScale: 0 });
      eye.userData.clayEye = 'pupil';
      animatedEyes.push({mesh:eye, height:eye.scale.y});
      const highlight = ball(.0075, '#fff8e8', side * .114 - .006, .005, .325, head, [1, 1, .62], { roughness: .25, bumpScale: 0 });
      highlight.userData.clayEye = 'highlight';
      animatedEyes.push({mesh:highlight, height:highlight.scale.y});
    }
    const brow = capsule(.009, .046, hair, side * .114, .065, .305, head,hairOptions);
    brow.rotation.z = Math.PI / 2 + side * .07;
    ball(.043, tone(skin, '#e68a80', .36), side * .216, -.068, .254, head, [1.1, .63, .20], skinOptions);
  }
  ball(.045, tone(skin, '#e9b298', .12), 0, -.056, .337, head, [.78, .80, .72], skinOptions);
  // A quiet closed smile remains appropriate to prayer and solemn episodes.
  const smileCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-.037, -.127, .308),
    new THREE.Vector3(0, -.143, .321),
    new THREE.Vector3(.037, -.127, .308),
  );
  local(new THREE.TubeGeometry(smileCurve, 10, .0055, 5, false), tone(skin, '#744c40', .52), 0, 0, 0, head, { bumpScale: 0 });
  if (o.beard !== false) {
    const beard = ball(.218, hair, 0, -.223, .076, head, [.96, .72, .91],hairOptions);
    beard.name = 'Barba esculpida';
    for (const side of [-1, 1]) {
      const mustache = capsule(.027, .05, hair, side * .047, -.096, .312, head,hairOptions);
      mustache.rotation.z = side * 1.18;
      mustache.scale.z = .60;
    }
  }

  if (o.mantle) {
    ball(.34, o.mantle, 0, .70, -.168, root, [[1.08,1.45,.44],[1,1.35,.42],[1.08,1.25,.44]][mantleVariant]);
    for (const side of [-1, 1]) {
      const shoulderFold = ball(.17, o.mantle, side * .221, .985, -.04, root, [.65, 1.25, .60]);
      shoulderFold.rotation.z = -side * [.24,.17,.30][mantleVariant];
    }
    const drape = capsule(.083, .48, o.mantle, -.218, .715, .245);
    drape.rotation.z = -.13;
    drape.scale.x=[1,.90,1.08][mantleVariant];
    const mantleFold = capsule(.013, .37, tone(o.mantle, '#817668', .19), -.237, .704, .318);
    mantleFold.rotation.z = -.13;
  }

  const arms = {};
  for (const [side, key] of [[-1, 'L'], [1, 'R']]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * .24, 1.08, 0);
    root.add(shoulder);
    const upper = capsule(.119, .11, cloth, 0, -.14, 0, shoulder);
    upper.scale.z = .95;
    const elbow = new THREE.Group();
    elbow.position.y = -.31;
    shoulder.add(elbow);
    capsule(.094, .10, cloth, 0, -.108, 0, elbow);
    const cuff = local(new THREE.TorusGeometry(.085, .012, 6, 20), clothShade, 0, -.225, 0, elbow);
    cuff.rotation.x = Math.PI / 2;
    const hand = new THREE.Group();
    hand.position.set(0, -.27, 0);
    elbow.add(hand);
    ball(.09, skin, 0, 0, .004, hand, [.90, 1.06, .84], skinOptions);
    ball(.036, skin, -side * .058, .024, .043, hand, [.82, 1.05, .88], skinOptions);
    arms[key] = { shoulder, elbow, hand };
  }

  const rig = {
    root, head, robe,
    leftArm: arms.L.shoulder, rightArm: arms.R.shoulder,
    leftForearm: arms.L.elbow, rightForearm: arms.R.elbow,
    handL: arms.L.hand, handR: arms.R.hand,
    leftLeg: legs.leftLeg, rightLeg: legs.rightLeg,
  };
  kit.people.push(rig);
  kit.select(root, name, 'Personagem deste episódio', '', 'Selecione o nome na lista para ler o contexto e as referências.');
  kit.label(root, name);
  const motionPhase=seed/4294967296*TAU;
  kit.ambient(t => {
    robe.scale.x = 1 + Math.sin(t * 1.5 + motionPhase) * .006;
    head.rotation.z = Math.sin(t * .8 + motionPhase) * .009;
    // Shape existing eyes only: no timers, new geometry, or authored arm poses.
    const blinkPhase=((t+motionPhase)%5.7+5.7)%5.7;
    const openness=1-.94*Math.exp(-(((blinkPhase-2.85)/.075)**2));
    for(const {mesh,height}of animatedEyes)mesh.scale.y=height*openness;
  });
  return rig;
}
