import * as THREE from 'three';

// Narrative time is supplied by Kit. No wall clock, timers or accumulated transforms.
const PI = Math.PI, TAU = PI * 2;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = (t, a, b) => { const p = clamp((t - a) / (b - a)); return p * p * (3 - 2 * p); };
const mix = (a, b, t) => a + (b - a) * t;
const ivory = '#eee2c3', earth = '#b69a70', blue = '#6b929c';
const seed = n => { let x = n; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
const jesus = (k, x, z, o = {}) => k.person('Jesus Cristo', x, z, { robe: '#f0e7d2', mantle: '#b46d58', hair: '#503b2e', ...o });
const attach = (parent, obj, x = 0, y = 0, z = 0) => { parent.add(obj); obj.position.set(x, y, z); return obj; };
const opacity = (obj, n) => obj.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = n; o.material.depthWrite = n > .8; } });
const face = (rig, x, z) => { rig.root.rotation.y = Math.atan2(x - rig.root.position.x, z - rig.root.position.z); };
function kneel(r, q = 1) {
  r.robe.scale.y = mix(1, .69, q); r.head.position.y = mix(1.37, 1.03, q);
  r.leftArm.position.y = r.rightArm.position.y = mix(1.08, .76, q);
  r.leftLeg.position.y = r.rightLeg.position.y = mix(.42, .2, q);
  r.leftLeg.rotation.x = r.rightLeg.rotation.x = -q * 1.12;
}
function pray(r, t, q = 1) {
  r.leftArm.rotation.set(-.72 * q, 0, .37 * q); r.rightArm.rotation.set(-.72 * q, 0, -.37 * q);
  r.leftForearm.rotation.x = r.rightForearm.rotation.x = -1.55 * q;
  r.head.rotation.x = .2 * q + Math.sin(t * .8) * .018;
}
function listen(k, rigs, start = 0) {
  k.animate(t => rigs.forEach((r, i) => { r.head.rotation.y = Math.sin(t * .5 + i) * .09; r.head.rotation.x = .06 + Math.sin(t * .6 + i) * .025; r.rightForearm.rotation.x = -.25 - ease(t, start, start + 5) * (.1 + i % 3 * .06); }));
}
function staff(k, hand, color = '#776047', height = 1.65) {
  const o = k.mesh(new THREE.CylinderGeometry(.025, .037, height, 8), k.mat(color)); attach(hand, o, 0, .33, 0); return o;
}
function bread(k, x, y, z, s = 1) {
  const g = k.groupAt(x, y, z); const loaf = k.mesh(new THREE.SphereGeometry(.17, 16, 10), k.mat('#c9a067'), 0, .07, 0, g); loaf.scale.set(1.3 * s, .55 * s, s);
  for (let j = -1; j <= 1; j++) { const seam = k.mesh(new THREE.CapsuleGeometry(.008, .12, 3, 8), k.mat('#ead1a0'), j * .075 * s, .13 * s, 0, g); seam.rotation.x = PI / 2; seam.rotation.z = -.25; }
  return g;
}
function cup(k, x, y, z) {
  const g = k.groupAt(x, y, z); k.mesh(new THREE.CylinderGeometry(.1, .065, .16, 20), k.mat('#b88f52'), 0, .14, 0, g); k.mesh(new THREE.CylinderGeometry(.025, .035, .1, 12), k.mat('#9c7446'), 0, .035, 0, g);
  k.mesh(new THREE.CylinderGeometry(.09, .09, .01, 20), k.mat('#793b45'), 0, .225, 0, g); return g;
}
function bowl(k, x, y, z, color = '#bb9474') { return k.mesh(new THREE.SphereGeometry(.24, 20, 12, 0, TAU, 0, PI * .55), k.mat(color, { side: THREE.DoubleSide }), x, y, z); }
function stoneAltar(k, x, z, radius = .9) {
  const g = k.groupAt(x, 0, z);
  for (let j = 0; j < 12; j++) { const a = j / 12 * TAU; const o = k.rock(x + Math.sin(a) * radius, z + Math.cos(a) * radius, .52); g.attach(o); }
  for (let j = 0; j < 5; j++) { const wood = k.box(1.3, .09, .1, '#826145', x, .55 + j * .065, z + (j % 2 ? .2 : -.2)); wood.rotation.y = j % 2 ? .8 : -.8; g.attach(wood); }
  return g;
}
function reeds(k, x, z, count = 7) {
  const g = k.groupAt(x, 0, z); for (let j = 0; j < count; j++) { const h = .4 + (j % 4) * .12; const stalk = k.mesh(new THREE.CylinderGeometry(.012, .018, h, 5), k.mat('#78845a'), Math.sin(j * 2) * .18, h / 2, Math.cos(j * 3) * .15, g); stalk.rotation.z = Math.sin(j) * .15; const tip = k.mesh(new THREE.SphereGeometry(.06, 6, 6), k.mat('#a69461'), stalk.position.x, h, stalk.position.z, g); tip.scale.set(.5, 1.5, .5); }
  k.ambient(t => { g.rotation.z = Math.sin(t * 1.8 + x) * .035; }); return g;
}
function blossoms(k, x, z, n = 9) { for (let i = 0; i < n; i++) { const xx = x + Math.sin(i * 2.4) * .45, zz = z + Math.cos(i * 1.8) * .45; k.cylinder(.012, .17, '#7b8c55', xx, .08, zz); const f = k.sphere(.045, i % 2 ? '#e2d3ab' : '#c4b496', xx, .19, zz); f.scale.y = .45; } }
function floor(k, w = 7, d = 6, color = '#c5b795') { for (let x = -w / 2; x < w / 2; x += .8) for (let z = -d / 2; z < d / 2; z += .8) k.box(.78, .04, .78, color, x + .4, .02, z + .4); }
function column(k, x, z, h = 2.7, color = '#d8c7a5') {
  k.cylinder(.32, .2, color, x, .1, z); k.cylinder(.2, h, color, x, h / 2, z); k.cylinder(.34, .23, color, x, h, z);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; k.cylinder(.017, h - .3, '#c7b697', x + Math.sin(a) * .2, h / 2, z + Math.cos(a) * .2); }
}
function room(k, style = 'simple') {
  floor(k); const color = style === 'egypt' ? '#cfb88a' : '#c2b295';
  k.box(7.4, 2.6, .24, color, 0, 1.3, -3); k.box(.25, 1.8, 3.5, color, -3.6, .9, -1.3);
  for (const x of [-2.7, 2.7]) { column(k, x, -2.6, 2.8, style === 'egypt' ? '#d9bd82' : '#d5c7a7'); k.lamp(x, .03, -.9); }
  if (style === 'egypt') { for (let j = 0; j < 11; j++) { const panel = k.box(.22, .8, .03, j % 2 ? '#8c9d8b' : '#b27b5e', -2.7 + j * .53, 1.4, -2.86); panel.rotation.z = j % 2 ? .18 : -.18; } }
  else { k.box(1.1, 1.1, .28, '#756955', 1.7, 1.6, -2.98); k.box(.06, 1.16, .05, '#dfcfab', 1.7, 1.6, -2.79); k.box(1.15, .06, .05, '#dfcfab', 1.7, 1.6, -2.79); }
}
function mountain(k, x, z, h = 2.8) {
  const o = k.mesh(new THREE.ConeGeometry(2.1, h, 7), k.mat('#a2957d'), x, h / 2, z); o.rotation.y = .3; for (let i = 0; i < 6; i++) k.rock(x + Math.sin(i) * 1.8, z + Math.cos(i) * 1.4, .6); return o;
}
function rain(k, strength = () => 1, amount = 110) {
  const r = seed(77), geo = new THREE.BufferGeometry(), arr = new Float32Array(amount * 6), starts = [];
  for (let i = 0; i < amount; i++) starts.push([r() * 10 - 5, r() * 6, r() * 9 - 4.5]);
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3)); const mat = new THREE.LineBasicMaterial({ color: '#dce9de', transparent: true, opacity: .55 }); const lines = k.add(new THREE.LineSegments(geo, mat));
  k.ambient(t => { const q = strength(t); mat.opacity = .55 * q; starts.forEach(([x, y, z], i) => { const yy = ((y - t * 5) % 6 + 6) % 6; arr.set([x, yy, z, x + .045, yy + .24, z - .025], i * 6); }); geo.attributes.position.needsUpdate = true; }); return lines;
}
function ripples(k, x, z, y = .1, radius = .45) {
  const rings = []; for (let i = 0; i < 3; i++) { const o = k.mesh(new THREE.TorusGeometry(radius, .009, 4, 40), k.mat('#e4ead7', { transparent: true, opacity: .5, depthWrite: false }), x, y, z); o.rotation.x = -PI / 2; rings.push(o); }
  k.ambient(t => rings.forEach((o, i) => { const p = (t * .35 + i / 3) % 1; o.scale.setScalar(.6 + p * 1.7); o.material.opacity = .5 * (1 - p); })); return rings;
}
function net(k, x, y, z, w = 2, h = 1.1) {
  const g = k.groupAt(x, y, z); for (let i = 0; i < 9; i++) { const strand = k.mesh(new THREE.CylinderGeometry(.008, .008, h, 4), k.mat('#b6a17a'), -w / 2 + i * w / 8, 0, 0, g); strand.rotation.z = .08 * Math.sin(i); }
  for (let i = 0; i < 6; i++) { const strand = k.mesh(new THREE.CylinderGeometry(.009, .009, w, 4), k.mat('#c9b894'), 0, -h / 2 + i * h / 5, 0, g); strand.rotation.z = PI / 2; } return g;
}
function gate(k, x = 0, z = -2.4, w = 3.2, h = 2.7) {
  for (const side of [-1, 1]) { for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) k.box(.64, .5, .65, (row + col) % 2 ? '#bcaa83' : '#d0bb92', x + side * (w / 2 + col * .65), .25 + row * .52, z); }
  k.box(w + 1, .4, .7, '#c9b48e', x, h, z); return k.box(w - .2, h - .3, .12, '#81735b', x, (h - .3) / 2, z - .25);
}
function angel(k, name, x, z, o = {}) { return k.person(name, x, z, { robe: '#f3edda', mantle: '#dedac0', hair: '#bda578', beard: false, ...o }); }

export const builders = {
  B01(k) {
    k.config.ground = '#a6b394'; k.background.set('#b2bfbb'); const sea = k.water(10, 9, 0, 0, { color: '#6f9899', y: -.2 });
    const ark = k.groupAt(.6, 0, -.7); const hull = k.mesh(new THREE.CapsuleGeometry(1, 3.3, 5, 16), k.mat('#936b47'), 0, .8, 0, ark);
    hull.rotation.z = PI / 2; hull.scale.set(.75, 1, 1.25);
    for (let j = 0; j < 10; j++) k.mesh(new THREE.BoxGeometry(.04, 1.18, 2.43), k.mat('#b58e5d'), -2.25 + j * .5, .85, 0, ark);
    k.mesh(new THREE.BoxGeometry(3.4, 1.2, 1.7), k.mat('#c19e70'), 0, 1.65, 0, ark);
    const roof = k.mesh(new THREE.ConeGeometry(2.25, .85, 4), k.mat('#876446'), 0, 2.55, 0, ark); roof.rotation.y = PI / 4; roof.scale.z = .66;
    for (let j = 0; j < 6; j++) k.mesh(new THREE.BoxGeometry(.34, .28, .07), k.mat('#554d3c'), -1.35 + j * .54, 1.97, .88, ark);
    const ramp = k.box(1.1, .11, 2.3, '#ac885e', -1.3, .25, 1.8); ramp.rotation.x = -.2;
    const noah = k.person('Noé', -2.2, 2.4, { robe: '#ac9e76', mantle: '#816e4a', hair: '#c5bdab' }); staff(k, noah.handR);
    const family = k.person('Família de Noé', -3, 1.2, { robe: '#a6ae91', mantle: '#c6ad80', beard: false });
    const animals = [['sheep', -1.4, 3, .75], ['sheep', -.55, 3.6, .65], ['donkey', 1, 2.7, .85], ['donkey', 2.2, 3.3, .7]].map(args => k.animal(...args));
    animals.forEach((a, i) => k.animate(t => { const q = ease(t, 1 + i * .7, 8 + i * .7); a.position.set(mix([-1.4, -.55, 1, 2.2][i], -.8, q), mix(0, .6, q), mix([3, 3.6, 2.7, 3.3][i], -.1, q)); a.visible = q < .98; a.rotation.y = PI; }));
    const clouds = [k.cloud(-2.8, 4.3, -2, 1.7), k.cloud(2.8, 4.5, -3, 1.6)]; const bird = k.dove(-2, 3.1, -1);
    rain(k, t => ease(t, 5, 11) * (1 - ease(t, 21, 28)));
    const rainbow = k.groupAt(0, 2.5, -3.1); ['#c9957b', '#d3b675', '#94ad8a', '#92aaa8'].forEach((c, i) => { const o = k.mesh(new THREE.TorusGeometry(2.5 + i * .09, .038, 5, 55, PI), k.mat(c), 0, 0, 0, rainbow); o.rotation.z = 0; });
    k.select(ark, 'Arca', 'Abrigo da família e dos animais', 'Gênesis 6–9', 'Construída segundo a orientação recebida por Noé.'); k.label(ark, 'Arca');
    k.animate(t => { const flood = ease(t, 7, 16) * (1 - ease(t, 23, 31)); sea.position.y = -.2 + flood * .65; ark.position.y = flood * .35; ark.rotation.z = flood * Math.sin(t * .8) * .025; noah.rightArm.rotation.x = -ease(t, 0, 5) * .8; noah.head.rotation.y = -.2 + ease(t, 22, 30) * .4; family.head.rotation.y = -.3; noah.root.visible = family.root.visible = t < 10 || t > 27; ramp.visible = t < 10 || t > 27; rainbow.visible = t > 25; clouds.forEach((c, i) => { c.position.x = (i ? 2.8 : -2.8) + (i ? 1 : -1) * ease(t, 22, 32) * 1.4; }); bird.visible = t > 17; const q = ease(t, 17, 29); bird.position.set(mix(-2.8, 2.7, q), 3.1 + Math.sin(q * PI) * .6, -1); k.light.intensity = 2.1 - flood * 1.1 + ease(t, 22, 30) * 1.2; });
    k.config.camera = [9, 7, 11];
  },
  B02(k) {
    k.config.ground = '#bdab83'; mountain(k, -2.8, -2.5, 2.8); stoneAltar(k, .9, -1); const bush = k.tree(2.8, -1.8, .65); const ram = k.animal('sheep', 2.45, -1.2, 1);
    for (const side of [-1, 1]) { const horn = k.mesh(new THREE.TorusGeometry(.1, .025, 6, 18, PI * 1.6), k.mat('#9d8a64'), 2.45 + side * .16, .87, -.71); horn.rotation.y = PI / 2; }
    const ab = k.person('Abraão', -2, 2.8, { robe: '#b7a280', mantle: '#7e8a72', hair: '#d4cbb4' }); const isaac = k.person('Isaque', -1.1, 3.3, { robe: '#d2b585', scale: .82, beard: false });
    const bundle = k.groupAt(0, 0, 0); for (let i = 0; i < 5; i++) { const w = k.mesh(new THREE.CylinderGeometry(.026, .035, .7, 6), k.mat('#806246'), (i - 2) * .055, 0, 0, bundle); w.rotation.x = PI / 2; } attach(isaac.handR, bundle, 0, .05, .1);
    const msg = angel(k, 'Anjo do Senhor', -.3, -2, { y: 2 }); const ray = k.ray(-.3, 1.6, -2, 3); k.walk(ab, [-2, 2.8], [.1, .4], 0, 8); k.walk(isaac, [-1.1, 3.3], [1.1, .8], 0, 9);
    k.animate(t => { const prepare = ease(t, 8, 14), halt = ease(t, 16, 19); ab.rightArm.rotation.x = -.7 * prepare + .45 * halt; ab.rightForearm.rotation.x = -.9 * prepare; ab.head.rotation.x = .2 * prepare - .4 * halt; ab.head.rotation.y = -.5 * halt; msg.root.visible = ray.visible = t > 15; msg.rightArm.rotation.z = -.8; isaac.head.rotation.y = -.6 * ease(t, 15, 23); ram.rotation.y = -.5 + .1 * Math.sin(t * .4); bush.scale.y = .65; bundle.visible = t < 12; });
    k.select(ram, 'Carneiro', 'Provisão junto aos arbustos', 'Gênesis 22:13', 'Abraão encontra um carneiro preso pelos chifres.');
  },
  B03(k) {
    room(k, 'egypt'); const rug = k.box(3.6, .04, 3.9, '#a5785d', 0, .07, -.2); for (let j = 0; j < 9; j++) k.box(.08, .01, 3.8, '#cfba80', -1.6 + j * .4, .1, -.2);
    const joseph = k.person('José do Egito', 0, -.9, { robe: '#eee4c7', mantle: '#6b9291', beard: false }); const ben = k.person('Benjamim', 0, 2.8, { robe: '#b9a87c', mantle: '#807b5d', beard: false });
    const brothers = [-2.2, -1.1, 1.1, 2.2].map((x, i) => k.person('Irmãos de José', x, 1.7 + Math.abs(x) * .25, { robe: ['#ad9372', '#c2b594', '#969c77', '#ac8166'][i], hair: i % 2 ? '#67503d' : '#40362e' }));
    k.walk(ben, [0, 2.8], [.12, -.17], 10, 20); k.animate(t => { const reveal = ease(t, 4, 10), hug = ease(t, 18, 25); joseph.leftArm.rotation.z = -.65 * reveal + 1.1 * hug; joseph.rightArm.rotation.z = .65 * reveal - 1.1 * hug; joseph.leftArm.rotation.x = joseph.rightArm.rotation.x = -1 * hug; joseph.head.rotation.x = .13 * hug; ben.leftArm.rotation.x = ben.rightArm.rotation.x = -.95 * hug; ben.leftForearm.rotation.x = ben.rightForearm.rotation.x = -.9 * hug; ben.root.rotation.y = PI; brothers.forEach((r, i) => { r.head.rotation.x = -.12 * reveal + .17 * hug; r.rightArm.rotation.x = -.3 * ease(t, 9 + i, 16 + i); }); rug.position.y = .07; });
  },
  B04(k) {
    k.config.ground = '#c0a67d'; mountain(k, -2.6, -2, 3.2); const bush = k.tree(1.1, -.4, .72); const flames = [k.fire(.7, .5, -.2, .65), k.fire(1.4, .7, -.6, .7), k.fire(1.05, 1.2, -.45, .7)];
    const mo = k.person('Moisés', -1.5, 3, { robe: '#c8ad82', mantle: '#946f51' }); staff(k, mo.handR); const sheep = k.animal('sheep', -3.4, 1.4, .75); k.animal('sheep', -2.6, 2.8, .6); const sandals = [k.sphere(.11, '#725137', -.9, .05, .65), k.sphere(.11, '#725137', -.63, .05, .65)]; sandals.forEach(o => o.scale.set(1, .4, 1.5));
    k.walk(mo, [-1.5, 3], [-.8, 1], 0, 10); const glow = new THREE.PointLight('#ffb04e', 3, 6); glow.position.set(1.1, 1.4, -.5); k.add(glow);
    k.animate(t => { const q = ease(t, 11, 20); face(mo, 1.1, -.4); kneel(mo, q); pray(mo, t, q); sandals.forEach(o => { o.visible = t > 12; }); flames.forEach(f => { f.visible = true; }); glow.intensity = 2.2 + ease(t, 7, 20) + Math.sin(t * 5) * .15; sheep.rotation.y = -.3 + ease(t, 6, 12) * .6; bush.scale.setScalar(.72); });
    k.select(bush, 'Sarça preservada', 'Sinal do chamado', 'Êxodo 3:2–6', 'Moisés vê o fogo sem que a sarça seja consumida.');
  },
  B05(k) {
    k.config.ground = '#b5aa85'; k.background.set('#a9c4c6'); const left = k.water(4, 10, -1.9, 0, { y: .12, color: '#639b9f' }), right = k.water(4, 10, 1.9, 0, { y: .12, color: '#639b9f' });
    const walls = [-1, 1].map(side => { const geo = new THREE.PlaneGeometry(9, 2.6, 36, 12); const mesh = k.mesh(geo, k.mat('#70b1ae', { transparent: true, opacity: .82, side: THREE.DoubleSide, roughness: .25 }), side * 1.8, 1.3, 0); mesh.rotation.y = side * PI / 2; return mesh; });
    for (let i = 0; i < 16; i++) k.rock(Math.sin(i * 3) * 1.2, -4.5 + i * .58, .15 + i % 3 * .04);
    const mo = k.person('Moisés', -1, 3, { robe: '#d8c49d', mantle: '#8c6f4d' }); staff(k, mo.handR, '#796044', 2.1);
    const people = Array.from({ length: 8 }, (_, i) => k.person('Povo de Israel', -.65 + i % 3 * .65, 4.1 + Math.floor(i / 3) * .55, { robe: ['#b8ae86', '#b68d72', '#8f9f87'][i % 3], scale: i % 4 === 0 ? .67 : .88, beard: i % 2 === 0 }));
    people.forEach((r, i) => k.walk(r, [r.root.position.x, r.root.position.z], [r.root.position.x, -3.8 + Math.floor(i / 3) * .55], 12 + i * .5, 27 + i * .35));
    k.animate(t => { const open = ease(t, 3, 12); left.position.x = -1.9 - open * 1.95; right.position.x = 1.9 + open * 1.95; walls.forEach((w, i) => { w.scale.y = open; w.position.x = (i ? 1 : -1) * mix(.1, 1.9, open); w.position.y = open * 1.3; }); mo.rightArm.rotation.z = .8 * ease(t, 1, 6); mo.rightArm.rotation.x = -1 * ease(t, 1, 7); mo.head.rotation.y = -.3; });
    k.cloud(-2, 4.6, -3, 1.2); k.config.camera = [10, 7, 11];
  },
  B06(k) {
    k.config.ground = '#a79a7f'; mountain(k, 0, -2, 4.3); const clouds = [k.cloud(-1.3, 4.1, -2, 1.1), k.cloud(1.2, 4.5, -2.3, 1.3)]; const beam = k.ray(0, 2.8, -2, 3.5);
    const mo = k.person('Moisés', -.8, 2, { robe: '#cebc93', mantle: '#847b5d', hair: '#b9af98' }); const crowd = [-3, -1.8, 1.8, 3].map((x, i) => k.person('Povo de Israel', x, 3, { robe: ['#a58f70', '#b8a37c', '#aab28d', '#b9866d'][i], scale: .85 }));
    const tablets = [k.box(.33, .55, .07, '#a6a493', 0, 0, 0), k.box(.33, .55, .07, '#a6a493', 0, 0, 0)]; attach(mo.handL, tablets[0], 0, -.02, .06); attach(mo.handR, tablets[1], 0, -.02, .06);
    k.animate(t => { const ascend = ease(t, 5, 14), receive = ease(t, 24, 29); mo.root.position.set(mix(-.8, -.65, ascend), ascend * 1.35, mix(2, -1.2, ascend)); mo.root.rotation.y = PI; mo.leftLeg.rotation.x = Math.sin(t * 6) * .2 * (t > 5 && t < 14 ? 1 : 0); mo.rightLeg.rotation.x = -mo.leftLeg.rotation.x; mo.leftArm.rotation.x = mo.rightArm.rotation.x = -.65 * receive; mo.leftForearm.rotation.x = mo.rightForearm.rotation.x = -.8 * receive; tablets.forEach(o => { o.visible = t >= 24; }); beam.visible = t > 14; k.light.intensity = 2.8 + Math.sin(t * 3) * .25 * ease(t, 12, 17); clouds.forEach((c, i) => { c.position.y = 4.1 + i * .4 + Math.sin(t * .5 + i) * .08; }); }); listen(k, crowd);
    tablets.forEach(o => k.select(o, 'Tábuas do testemunho', 'Entregues em momento posterior', 'Êxodo 31:18', 'As duas tábuas são entregues após as instruções registradas nos capítulos anteriores.'));
  },
  B07(k) {
    k.config.ground = '#c1a976'; const wallPieces = []; for (let row = 0; row < 5; row++) for (let col = 0; col < 11; col++) { const x = (col - 5) * .62 + (row % 2 ? .1 : 0); const o = k.box(.59, .47, .55, (row + col) % 2 ? '#b4a07d' : '#c7b38c', x, .24 + row * .49, -1.6); wallPieces.push({ o, x, y: o.position.y, row, col }); }
    for (const x of [-3.55, 3.55]) { k.box(.9, 3.05, .95, '#bca780', x, 1.52, -1.6); for (let j = 0; j < 3; j++) k.box(.23, .3, .95, '#cabb96', x - .3 + j * .3, 3.16, -1.6); }
    const jo = k.person('Josué', -3.3, 2.5, { robe: '#b2ad83', mantle: '#99754f' }); const priests = [-1.9, -.5, .9].map((x, i) => k.person('Sacerdotes de Israel', x, 2.2, { robe: ivory, mantle: '#bbaa73' }));
    priests.forEach(r => { const horn = k.mesh(new THREE.ConeGeometry(.11, .65, 12, 1, true), k.mat('#c7a264', { side: THREE.DoubleSide })); attach(r.handR, horn, 0, .02, .1); horn.rotation.x = PI / 2; });
    const ark = k.box(1.2, .65, .7, '#bd9959', .1, .8, 3.4); k.label(ark, 'Arca da aliança');
    k.animate(t => { const march = ease(t, 0, 14); [jo, ...priests].forEach((r, i) => { r.root.position.x = [-3.3, -1.9, -.5, .9][i] + Math.sin(march * PI) * .7; r.root.position.z = [2.5, 2.2, 2.2, 2.2][i] - march * .55; r.leftLeg.rotation.x = t < 14 ? Math.sin(t * 6 + i) * .2 : 0; r.rightLeg.rotation.x = -r.leftLeg.rotation.x; r.rightArm.rotation.x = -.1 - ease(t, 13, 18) * 1.35; r.rightForearm.rotation.x = -.7 * ease(t, 13, 18); }); wallPieces.forEach(({ o, x, y, row, col }) => { const q = ease(t, 21 + col * .12, 25 + col * .12); o.position.set(x, mix(y, .18 + row * .07, q), -1.6 + q * (row * .23 + Math.sin(col) * .4)); o.rotation.set(q * .6, q * Math.sin(col) * .3, q * Math.cos(col) * .4); }); ark.position.y = .8 + (t < 14 ? Math.sin(t * 6) * .025 : 0); });
  },
  B08(k) {
    k.config.ground = '#b2ad7c'; k.tree(-3.3, -2.4, 1.05); const wheat = k.groupAt(.8, 0, -.4); for (let row = 0; row < 7; row++) for (let col = 0; col < 10; col++) { const x = -1.4 + col * .34, z = -2.2 + row * .46, h = .47 + (row + col) % 4 * .07; k.mesh(new THREE.CylinderGeometry(.012, .016, h, 4), k.mat('#b2a25e'), x, h / 2, z, wheat); const ear = k.mesh(new THREE.SphereGeometry(.065, 7, 5), k.mat('#d2bb73'), x, h, z, wheat); ear.scale.set(.55, 1.5, .55); }
    const ruth = k.person('Rute', -3, 3, { robe: '#b3a185', mantle: '#8c9e83', beard: false }); const naomi = k.person('Noemi', -2, 3.2, { robe: '#ad947e', mantle: '#c8c1a1', hair: '#a9a394', beard: false }); const boaz = k.person('Boaz', 2.9, -.2, { robe: '#d7c39a', mantle: '#8a7958' });
    const basket = k.basket(0, 0, 0); attach(ruth.handL, basket, 0, -.15, .05); const grain = bread(k, 0, 0, 0, .6); attach(ruth.handR, grain, 0, 0, .05);
    k.walk(ruth, [-3, 3], [-.3, 1], 0, 9); k.walk(naomi, [-2, 3.2], [-1.2, 1.5], 0, 9); k.ambient(t => { wheat.rotation.z = Math.sin(t * 1.1) * .02; });
    k.animate(t => { const glean = ease(t, 10, 15) * (1 - ease(t, 20, 24)); ruth.head.rotation.x = glean * .35; ruth.rightArm.rotation.x = glean * -.6; ruth.root.rotation.x = glean * .2; const share = ease(t, 23, 29); ruth.root.rotation.y = -share * 1.4; ruth.rightArm.rotation.z = .6 * share; ruth.rightForearm.rotation.x = -share * 1.1; naomi.leftArm.rotation.z = -.5 * share; naomi.head.rotation.y = .4 * share; boaz.rightArm.rotation.z = -.6 * ease(t, 12, 18); grain.visible = t > 17; });
  },
  B09(k) {
    k.config.ground = '#c2b18b'; mountain(k, -3, -2.8, 2.3); mountain(k, 3, -2.8, 2.1); k.water(1, 7, -2.6, 0, { river: true, color: '#819e9a', y: .03 }); for (let i = 0; i < 5; i++) k.rock(-2.1 + i * .15, 2, .14);
    const david = k.person('Davi', -1.7, 2, { robe: '#d0bd91', mantle: '#9d7e57', hair: '#8b6045', beard: false, scale: .86 }); const gol = k.person('Golias', 1.8, -1.6, { robe: '#9e9274', mantle: '#ab8758', scale: 1.65 });
    const shield = k.mesh(new THREE.CylinderGeometry(.39, .39, .09, 24), k.mat('#b19662')); shield.rotation.x = PI / 2; attach(gol.handL, shield, 0, 0, .1); staff(k, gol.handR, '#8b714a', 2);
    const sling = k.groupAt(0, 0, 0); attach(david.handR, sling); for (const x of [-.035, .035]) k.mesh(new THREE.CylinderGeometry(.008, .008, .65, 4), k.mat('#846b4b'), x, .32, 0, sling); k.mesh(new THREE.SphereGeometry(.065, 8, 6), k.mat('#776f59'), 0, .67, 0, sling);
    const stone = k.sphere(.045, '#938b75', -1.6, 1.4, 2); const witnesses = [-4, 4].map(x => k.person('Observadores no vale', x, 1, { robe: '#ac9c79', scale: .75 }));
    k.animate(t => { const prep = ease(t, 5, 11), release = ease(t, 17, 18), flight = ease(t, 18, 19); face(david, 1.8, -1.6); face(gol, -1.7, 2); david.rightArm.rotation.x = -1.8 * prep + 1 * release; david.rightForearm.rotation.x = -.3; sling.rotation.x = t > 10 && t < 18 ? t * 14 : 0; sling.visible = t < 18; stone.visible = t >= 18 && t < 19; stone.position.set(mix(-1.6, 1.8, flight), 1.6 + Math.sin(flight * PI) * .4, mix(2, -1.6, flight)); const fall = ease(t, 19, 24); gol.root.rotation.x = -fall * PI / 2; gol.root.position.y = fall * .1; witnesses.forEach((r, i) => { r.head.rotation.y = i ? -.6 : .6; r.leftArm.rotation.z = -.3 * ease(t, 22, 28); }); });
  },
  B10(k) {
    k.config.ground = '#b5a481'; stoneAltar(k, 0, -1, 1); const ditch = k.mesh(new THREE.TorusGeometry(1.34, .075, 8, 40), k.mat('#789d9b', { roughness: .2 }), 0, .04, -1); ditch.rotation.x = PI / 2;
    const el = k.person('Elias', 0, 1.3, { robe: '#c2ad83', mantle: '#90764f', hair: '#9a907b' }); const helper = k.person('Povo no Carmelo', 1.7, -.3, { robe: '#b4a584' }); const jar = k.vase(0, 0, 0); attach(helper.handR, jar, 0, -.1, 0);
    const spectators = [-3, -1.8, 2.8, 3.8].map((x, i) => k.person('Povo no Carmelo', x, 2, { robe: ['#a8b091', '#c8b88e', '#af8e73', '#a29e7d'][i], scale: .88 }));
    const flame = k.fire(0, .6, -1, 1.7); const beam = k.ray(0, .8, -1, 4.7); const stream = k.mesh(new THREE.CylinderGeometry(.035, .045, .7, 8), k.mat('#a9c8bc', { transparent: true, opacity: .7 }), 1.25, .9, -.8);
    k.animate(t => { const pour = ease(t, 5, 9) * (1 - ease(t, 13, 16)); helper.rightArm.rotation.x = -pour * 1.2; helper.rightForearm.rotation.x = -pour * .6; jar.rotation.z = pour * 1.1; stream.visible = t > 7 && t < 13; flame.visible = beam.visible = t > 23; face(el, 0, -1); pray(el, t, ease(t, 14, 20)); spectators.forEach((r, i) => { kneel(r, ease(t, 25 + i * .3, 30)); r.head.rotation.x = .35 * ease(t, 25, 30); }); k.light.intensity = 2.8 + ease(t, 23, 25) * 1.7; });
    k.select(ditch, 'Vala com água', 'Preparação do altar', '1 Reis 18:32–35', 'A água derramada enche a vala ao redor do altar.');
  },
  B11(k) {
    k.config.night = true; k.config.ground = '#8d8876'; k.config.camera = [8.5, 7.2, 10.5]; k.config.target = [0, 1.3, -.3];
    // Open-front cutaway gives the den depth while retaining grounded, readable lions.
    const rockMaterial = k.mat('#817e6f'); for (let row = 0; row < 4; row++) for (let j = 0; j < 11; j++) { const a = mix(-PI * .48, PI * .48, j / 10); const x = Math.sin(a) * 4.25, z = -Math.cos(a) * 3.45; const b = k.mesh(new THREE.DodecahedronGeometry(.72, 0), rockMaterial, x, .45 + row * .77, z); b.scale.set(1.1, .73, 1); b.rotation.set(.07 * row, j, 0); }
    const rim = k.mesh(new THREE.TorusGeometry(3.55, .28, 8, 48, PI), k.mat('#aaa18b'), 0, 3.2, -.1); rim.rotation.x = -PI / 2; rim.rotation.z = 0;
    const da = k.person('Daniel', -.2, .3, { robe: '#d7c6a4', mantle: '#73858a', hair: '#ada694' }); kneel(da); const lions = [[-2.5, 1, 1.2], [2.3, .8, 1.3], [1, -1.8, 1.05]].map(([x, z, s]) => k.animal('lion', x, z, s));
    lions[0].rotation.y = .8; lions[1].rotation.y = -.9; lions[2].rotation.y = 2.3;
    // Articulated ears and tufted tail supplement each recognisable helper lion.
    const ears = [], tails = [];
    lions.forEach((lion, i) => { const head = lion.children.find(o => o.type === 'Group'); for (const side of [-1, 1]) { const ear = k.mesh(new THREE.SphereGeometry(.065, 10, 8), k.mat('#c5a36c'), side * .14, .2, .03, head || lion); ear.scale.set(1, 1, .5); ears.push({ ear, phase: i + side }); } const tail = new THREE.Group(); tail.position.set(0, .5, -.46); lion.add(tail); const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(.15, .06, -.35), new THREE.Vector3(.34, .12, -.4)]); k.mesh(new THREE.TubeGeometry(curve, 12, .025, 6), k.mat('#ba925d'), 0, 0, 0, tail); k.mesh(new THREE.SphereGeometry(.07, 12, 8), k.mat('#866346'), .34, .12, -.4, tail); tails.push(tail); });
    const an = angel(k, 'Anjo de proteção', -.4, -1.7, { y: .15 }); const glow = k.ray(-.4, .1, -.8, 5.7); const dar = k.person('Dario', 2.1, -3.1, { y: 3.3, scale: .8, robe: '#b5a273', mantle: '#8d797c' });
    k.stars(); const shaft = new THREE.SpotLight('#cfdbd5', 4, 15, .42, .75, 1); shaft.position.set(1, 8, -1); shaft.target.position.set(0, 0, .4); k.add(shaft); k.add(shaft.target);
    k.ambient(t => { ears.forEach(({ ear, phase }) => { ear.rotation.z = Math.sin(t * 1.3 + phase) * .13; }); tails.forEach((tail, i) => { tail.rotation.y = Math.sin(t * .7 + i) * .2; }); });
    k.animate(t => { const dawn = ease(t, 23, 32); pray(da, t, 1 - dawn * .45); da.head.rotation.x = .22 - dawn * .48; da.head.rotation.y = dawn * .4; an.root.visible = t > 14; an.rightArm.rotation.z = .65; opacity(an.root, .2 + ease(t, 15, 21) * .65); glow.visible = t > 14; dar.root.visible = t > 24; dar.head.rotation.x = .35; dar.rightArm.rotation.x = -1.1 * dawn; k.light.intensity = .6 + dawn * 2.1; k.light.color.set(dawn > .5 ? '#f4d5a1' : '#b5c3d2'); k.fill.intensity = .7 + dawn * .9; shaft.intensity = 4 + dawn * 8; });
    lions.forEach(l => k.select(l, 'Leões da cova', 'Animais preservando sua presença natural', 'Daniel 6:16–23', 'Daniel atribui a Deus a proteção que impede os leões de feri-lo.'));
    k.config.views = [{ label: 'Cova inteira', camera: [8.5, 7.2, 10.5], target: [0, 1.3, -.3] }, { label: 'Daniel e os leões', camera: [4.8, 3.3, 6.5], target: [0, 1, .1] }, { label: 'A abertura', camera: [7, 9, 7], target: [0, 1.3, -1] }];
  },
  B12(k) {
    k.config.ground = '#b49b7b'; k.background.set('#aa9a85'); const arch = k.mesh(new THREE.TorusGeometry(1.9, .42, 9, 32, PI), k.mat('#a57852'), 0, .35, -.8); k.box(.8, 2, 1.7, '#ad845e', -1.9, 1, -1.1); k.box(.8, 2, 1.7, '#ad845e', 1.9, 1, -1.1);
    for (let row = 0; row < 4; row++) for (const x of [-2, 2]) k.box(.83, .035, 1.74, '#cfb28a', x, .3 + row * .48, -1.1);
    const flames = Array.from({ length: 8 }, (_, i) => k.fire(-1.65 + i * .47, .05, -.5, .8)); const names = ['Sadraque', 'Mesaque', 'Abede-Nego']; const people = names.map((n, i) => k.person(n, -1.1 + i * 1.05, -.8, { robe: ['#a9b0a0', '#c7b88a', '#b9967f'][i], scale: .9 })); const fourth = angel(k, 'Quarta figura', .2, -1.7, { scale: .9 });
    const king = k.person('Nabucodonosor', 3.7, 2, { robe: '#c1a366', mantle: '#8a777b', scale: 1.05 }); const throne = k.box(1.1, .65, .8, '#99784e', 3.7, .3, 2.3); k.label(arch, 'Forno');
    k.animate(t => { people.forEach((r, i) => { const walk = ease(t, 6, 23); r.root.position.x = -1.1 + i * 1.05 + Math.sin(walk * PI * 2 + i) * .12; r.root.position.z = -.8 + ease(t, 24, 31) * 2.4; r.leftLeg.rotation.x = t > 6 ? Math.sin(t * 5 + i) * .19 : 0; r.rightLeg.rotation.x = -r.leftLeg.rotation.x; r.rightArm.rotation.z = .2 * ease(t, 12, 18); }); fourth.root.visible = t > 12 && t < 28; fourth.rightArm.rotation.z = .5; king.head.rotation.y = -.6; king.rightArm.rotation.x = -.9 * ease(t, 14, 22); flames.forEach(f => { f.scale.y = .7 + ease(t, 6, 13) * .5 - ease(t, 25, 31) * .4; }); throne.visible = true; });
  },
  B13(k) {
    k.config.ground = '#b6b497'; k.water(7.2, 9, -1.2, .4, { color: '#70969d' }); const boat = k.boat(-2.1, -.5, 1.2); const jo = k.person('Jonas', -2.1, -.4, { y: .5, robe: '#b2a18a', mantle: '#89937c' }); const sailor = k.person('Marinheiros', -2.8, -.3, { y: .5, robe: '#a7b2a0', scale: .9 });
    const fish = k.groupAt(-2, -.5, 2); const body = k.mesh(new THREE.SphereGeometry(.8, 24, 16), k.mat('#759391'), 0, .5, 0, fish); body.scale.set(1, .8, 2.4); const tail = k.mesh(new THREE.ConeGeometry(.6, .9, 3), k.mat('#5e8081'), 0, .5, -2, fish); tail.rotation.x = PI / 2; for (const x of [-.5, .5]) k.mesh(new THREE.SphereGeometry(.06, 10, 8), k.mat('#343d39'), x, .7, 1.2, fish);
    const prayer = k.person('Jonas', 0, 0, { robe: '#b2a18a', mantle: '#89937c', scale: .56 }); attach(fish, prayer.root, 0, .1, .15); kneel(prayer); const dryJonah = k.person('Jonas', 3, 2.9, { robe: '#b2a18a', mantle: '#89937c', scale: .85 }); gate(k, 3.3, -2.7, 1.6, 2.4); k.box(3, .12, 6, '#c1b38a', 3.7, .05, .2); rain(k, t => ease(t, 4, 8) * (1 - ease(t, 13, 18)), 80);
    k.animate(t => { const storm = ease(t, 3, 8) * (1 - ease(t, 14, 18)); boat.rotation.z = Math.sin(t * 2) * .12 * storm; jo.root.visible = sailor.root.visible = t < 15; jo.root.rotation.z = sailor.root.rotation.z = boat.rotation.z; sailor.leftArm.rotation.z = -.7 * storm; fish.visible = t > 11 && t < 25; fish.position.y = -.5 + Math.sin(ease(t, 11, 23) * PI) * .65; fish.rotation.y = -.7; tail.rotation.y = Math.sin(t * 2) * .2; prayer.root.visible = t > 16 && t < 25; body.material.transparent = true; body.material.opacity = t > 16 ? .46 : 1; pray(prayer, t); dryJonah.root.visible = t > 24; const q = ease(t, 24, 32); dryJonah.root.position.z = mix(2.9, -.9, q); dryJonah.root.rotation.y = PI; dryJonah.leftLeg.rotation.x = t > 24 ? Math.sin(t * 6) * .24 : 0; dryJonah.rightLeg.rotation.x = -dryJonah.leftLeg.rotation.x; k.light.intensity = 2.4 - storm * 1.5; });
    k.select(fish, 'Grande peixe', 'Animal do relato', 'Jonas 1:17; 2', 'O texto não informa a espécie do grande peixe.');
  },
  B14(k) {
    room(k); k.config.ground = '#bcaa8c'; const mary = k.person('Maria, mãe de Jesus', -.8, .4, { robe: '#e3d6b7', mantle: '#8aabaf', beard: false, hair: '#574335' }); const gab = angel(k, 'Gabriel', 2.6, -1.5, { y: .15 }); const ray = k.ray(1.5, .1, -1, 4);
    const stool = k.cylinder(.42, .38, '#9e8059', -.8, .2, .7); k.vase(-2.7, .04, -.8); const sewing = k.box(.6, .035, .45, '#d2c39f', -.9, .55, .5); k.basket(-1.8, .05, .8);
    k.animate(t => { const approach = ease(t, 4, 12), response = ease(t, 19, 28); gab.root.position.x = mix(2.6, 1.5, approach); gab.root.visible = t > 4; ray.visible = t > 5; gab.rightArm.rotation.x = -.7 * approach; gab.rightArm.rotation.z = -.4 * approach; face(mary, 1.5, -1); mary.head.rotation.x = -.1 * approach + .22 * response; mary.leftArm.rotation.x = -.8 * response; mary.rightArm.rotation.x = -.6 * response; mary.leftForearm.rotation.x = -1.1 * response; mary.rightForearm.rotation.x = -1.3 * response; k.light.intensity = 2.6 + approach * .8; stool.visible = sewing.visible = true; });
  },
  B15(k) {
    k.config.night = true; k.config.ground = '#b4a17d'; k.stars(); k.box(4.8, 2.1, .25, '#a99675', 0, 1.05, -2.1);
    for (const x of [-2.5, 2.5]) k.cylinder(.12, 2.9, '#806344', x, 1.45, -.1); const roof = k.box(5.6, .18, 3.9, '#92734f', 0, 2.9, -.65); roof.rotation.x = .12;
    for (let i = 0; i < 11; i++) k.box(.12, .13, 4, '#ae9062', -2.5 + i * .5, 2.98, -.65).rotation.x = .12;
    const manger = k.groupAt(0, 0, .4); for (const side of [-1, 1]) { const leg = k.mesh(new THREE.BoxGeometry(.08, .65, .85), k.mat('#9a714c'), side * .25, .3, 0, manger); leg.rotation.z = side * .4; } k.mesh(new THREE.BoxGeometry(.9, .1, .65), k.mat('#be9e68'), 0, .49, 0, manger);
    for (let i = 0; i < 30; i++) { const straw = k.mesh(new THREE.CylinderGeometry(.006, .006, .3, 4), k.mat('#d1b76d'), Math.sin(i * 2.4) * .36, .56, Math.cos(i * 3.1) * .24, manger); straw.rotation.set(PI / 2, i, .2); }
    const baby = k.person('Jesus Cristo', 0, .4, { y: .59, scale: .26, robe: ivory, beard: false, hair: '#765b42' }); baby.root.rotation.x = -PI / 2; baby.root.position.z = .55;
    const ma = k.person('Maria, mãe de Jesus', -.9, .2, { robe: '#e3d7b8', mantle: '#8ca6a6', beard: false }); kneel(ma); const jo = k.person('José de Nazaré', 1.1, .1, { robe: '#c0ab7f', mantle: '#8d9678' });
    k.animal('donkey', -1.65, -1.3, .78); k.animal('sheep', 1.7, -1.2, .75); k.lamp(-1.9, .03, 1.1); k.lamp(1.8, .03, 1.4);
    const pastors = [k.person('Pastores de Belém', -3.7, 3.2, { robe: '#ac9f7c', mantle: '#7d8a70' }), k.person('Pastores de Belém', -2.7, 3.8, { robe: '#c7b98e', scale: .82 })]; staff(k, pastors[0].handL); pastors.forEach((r, i) => k.walk(r, [r.root.position.x, r.root.position.z], [-2.2 + i * .6, 1.8 + i * .5], 10 + i * .5, 23));
    const announcement = k.ray(-3.8, 0, 3.2, 5);
    k.animate(t => { const care = ease(t, 0, 9); ma.rightArm.rotation.x = -.9 * care; ma.rightForearm.rotation.x = -1; ma.head.rotation.x = .25; face(ma, 0, .4); face(jo, 0, .4); jo.leftArm.rotation.x = -.5 * care; jo.head.rotation.x = .15; pastors.forEach(r => { r.head.rotation.x = .2 * ease(t, 23, 29); if (t > 23) face(r, 0, .4); }); announcement.visible = t > 5 && t < 14; baby.robe.scale.x = 1 + Math.sin(t * 1.5) * .025; k.light.intensity = .7 + ease(t, 8, 24) * .35; });
    k.select(manger, 'Manjedoura', 'Lugar onde Maria deita o menino', 'Lucas 2:7', 'A humildade da manjedoura orienta a composição deste nascimento.');
  },
  B16(k) {
    floor(k, 8, 7, '#d3c4a4'); for (const x of [-3, 3]) for (const z of [-2.5, .2]) column(k, x, z, 3.7); k.box(7, .35, .7, '#c5b28b', 0, 3.8, -2.5); k.box(4, .3, 1.1, '#bfad88', 0, .15, -1.4);
    const child = jesus(k, 0, -.2, { scale: .7, beard: false, mantle: '#b7a27b' }); const masters = [-1.8, 1.7, 2.3].map((x, i) => k.person('Doutores no templo', x, -1.5 + i * .1, { robe: ['#d9c8a2', '#b4aa87', '#d0bd92'][i], mantle: '#8b8064', hair: '#adab98' })); masters.forEach(r => face(r, 0, -.2));
    const ma = k.person('Maria, mãe de Jesus', -3, 3.5, { robe: '#d7caac', mantle: '#88a1a2', beard: false }); const jo = k.person('José de Nazaré', -2, 3.9, { robe: '#bca778', mantle: '#939879' }); k.walk(ma, [-3, 3.5], [-1, 1.1], 14, 24); k.walk(jo, [-2, 3.9], [-1.9, 1.4], 14, 24);
    masters.forEach((r, i) => { const scroll = k.book(0, 0, 0); attach(r.handL, scroll, 0, -.1, .05); scroll.scale.setScalar(.65); });
    k.animate(t => { child.head.rotation.y = Math.sin(t * .45) * .45; child.rightArm.rotation.x = -.55 - Math.sin(t * .65) * .12; child.rightForearm.rotation.x = -.9; masters.forEach((r, i) => { r.head.rotation.x = Math.sin(t * .6 + i) * .08; r.rightArm.rotation.x = -.35 - Math.sin(t * .5 + i) * .15; }); const reunion = ease(t, 23, 30); ma.rightArm.rotation.x = -reunion * .9; jo.head.rotation.x = -.12 * reunion; child.root.rotation.y = -reunion * .5; });
  },
  B17(k) {
    k.config.ground = '#b1ac7e'; k.background.set('#cbded7'); k.config.camera = [8.8, 6.8, 10.8]; k.config.target = [0, 1.45, -.2];
    // A meandering tessellated river, stone bed, banks and drifting foam establish flow.
    const river = k.water(3.6, 10.4, 0, 0, { river: true, y: .53, color: '#6fa9a2' });
    const r = seed(317); for (let j = 0; j < 60; j++) { const z = r() * 9.5 - 4.75, center = Math.sin(z * .58) * .52, x = center + (r() - .5) * 3.1; const stone = k.rock(x, z, .1 + r() * .2); stone.position.y = .06 + r() * .04; stone.material = k.mat(j % 3 ? '#9aab96' : '#738d83'); }
    for (let j = 0; j < 12; j++) { const z = -4.6 + j * .83, center = Math.sin(z * .58) * .52; for (const side of [-1, 1]) { const x = center + side * (1.95 + (j % 2) * .13); const bank = k.rock(x, z, .63); bank.position.y = .21; bank.scale.y = .43; if (j % 2 === 0) reeds(k, x + side * .18, z); } }
    k.tree(-3.5, -2.7, 1.3); k.tree(3.5, -3, 1.15); reeds(k, -2.5, 2.5, 12); reeds(k, 2.7, 1.8, 10); blossoms(k, -3, 1.3);
    const christ = jesus(k, -.45, .25, { mantle: '#d6d1b3' }); const john = k.person('João Batista', .6, -.15, { robe: '#a18c63', mantle: '#998158', hair: '#5c4b37' }); christ.root.rotation.y = -.28; john.root.rotation.y = -.8;
    const witness = k.person('Testemunhas à margem', 2.9, 2, { robe: '#c5bb94', mantle: '#879479', scale: .9 }); face(witness, 0, 0);
    const rings = [...ripples(k, -.4, .25, .58, .42), ...ripples(k, .7, -.15, .58, .35)];
    const cloudL = k.cloud(-1.1, 5.35, -2, 1.35), cloudR = k.cloud(1.25, 5.5, -2, 1.35); const rays = [-.3, .2, .7].map((x, i) => { const beam = k.ray(x, .6, -.6, 5.1); beam.rotation.z = (i - 1) * .07; return beam; });
    const dove = k.dove(-3, 5.1, -2); k.select(dove, 'Pomba', 'Sinal do Espírito', 'Mateus 3:16', 'Mateus descreve o Espírito de Deus descendo como pomba sobre Jesus.'); k.label(dove, 'Pomba');
    const skyLight = new THREE.SpotLight('#fff5d6', 0, 16, .36, .75, 1); skyLight.position.set(0, 7, -.8); skyLight.target.position.set(-.45, .7, .25); k.add(skyLight); k.add(skyLight.target);
    k.animate(t => {
      const prepare = ease(t, 0, 7), dip = ease(t, 8, 12) * (1 - ease(t, 13, 17)), emergence = ease(t, 16, 22), flight = ease(t, 20, 30);
      // John supports the back; the entire body enters the water before rising again.
      christ.root.rotation.z = -dip * 1.22; christ.root.position.y = -.37 * dip; christ.root.position.x = -.45 + dip * .12;
      christ.leftArm.rotation.set(-.6 - dip * .3, 0, .25); christ.rightArm.rotation.set(-.65 - dip * .25, 0, -.25); christ.leftForearm.rotation.x = christ.rightForearm.rotation.x = -1.25 * prepare;
      christ.head.rotation.x = .1 - emergence * .28; john.leftArm.rotation.set(-.85 - dip * .25, 0, .7 * prepare); john.rightArm.rotation.set(-.6, 0, -.2 - prepare * .4); john.leftForearm.rotation.x = -.8; john.rightForearm.rotation.x = -1.4 * prepare;
      john.head.rotation.x = .22 * dip - emergence * .17; witness.head.rotation.x = -emergence * .22; witness.rightArm.rotation.x = -emergence * .45;
      const open = ease(t, 17, 26); cloudL.position.x = -1.1 - open * 2.1; cloudR.position.x = 1.25 + open * 2.1; cloudL.rotation.z = -open * .04; cloudR.rotation.z = open * .04; rays.forEach(ray => { ray.visible = t >= 17; opacity(ray, .12 * open); });
      dove.visible = t >= 20; dove.position.set(mix(-3, -.45, flight), mix(5.1, 2.8, flight) + Math.sin(flight * PI) * .18, mix(-2, .15, flight)); dove.rotation.y = .65 * (1 - flight); dove.rotation.z = -.18 * Math.sin(flight * PI); dove.rotation.x = .12 + flight * .12;
      skyLight.intensity = open * 9; k.light.intensity = 2.3 + open * 1.5; rings.forEach(ring => { ring.position.y = .58; }); river.visible = true;
    });
    k.select(river, 'Rio Jordão', 'Águas do batismo', 'Mateus 3:13–17', 'O rio tem correnteza, leito de pedras e margens para dar contexto ao batismo.');
    k.config.views = [{ label: 'Rio e céu', camera: [8.8, 6.8, 10.8], target: [0, 1.45, -.2] }, { label: 'O batismo', camera: [4.5, 2.6, 5.8], target: [0, 1, .15] }, { label: 'Leito e correnteza', camera: [4, 5.2, 6.5], target: [0, .45, .3] }];
  },
  B18(k) {
    k.config.ground = '#b9b38c'; k.water(8, 8, -.8, -.6, { color: '#7eaaa7' }); const boat = k.boat(-.7, -.6, 1.6); const second = k.boat(2.6, -1.9, 1.05);
    const christ = jesus(k, -.3, 2.6); const peter = k.person('Simão Pedro', -.7, -.35, { y: .65, robe: '#c7b68a', mantle: '#8b987c' }); const james = k.person('Tiago, filho de Zebedeu', .2, -.7, { y: .65, robe: '#aeb7a0' }); const john = k.person('João, filho de Zebedeu', 2.6, -1.8, { y: .55, robe: '#b8a686', beard: false });
    const meshNet = net(k, -.6, .1, .8, 2.3, 1.5); const fishes = Array.from({ length: 9 }, (_, i) => { const f = k.animal('fish', -.6 + Math.sin(i * 3) * .7, .8, .2); f.rotation.z = PI / 2; return f; });
    k.animate(t => { const cast = ease(t, 3, 9), lift = ease(t, 13, 22), call = ease(t, 24, 31); meshNet.position.y = mix(.7, -.3, cast) + lift * 1.3; meshNet.position.z = .5 + Math.sin(cast * PI) * .7; meshNet.rotation.x = -.3 + lift * .3; fishes.forEach((f, i) => { f.visible = t > 13; f.position.set(-.6 + Math.sin(i * 3) * .7, -.15 + lift * 1.2 + Math.sin(t * 4 + i) * .04, .7 + Math.cos(i * 3) * .12); }); [peter, james].forEach(r => { r.leftArm.rotation.x = r.rightArm.rotation.x = -1.1 * cast + lift * .25; r.leftForearm.rotation.x = r.rightForearm.rotation.x = -lift * 1.2; r.head.rotation.x = .25 * lift - call * .3; r.root.rotation.y = call * .6; }); christ.rightArm.rotation.x = -.8 * call; christ.rightArm.rotation.z = .5 * call; john.leftArm.rotation.x = -.9 * lift; boat.rotation.x = Math.sin(t * 1.2) * .015; second.rotation.y = -.3; });
    k.select(meshNet, 'Redes da pesca', 'Sinal e resposta ao chamado', 'Lucas 5:4–11', 'Os pescadores tornam a lançar as redes e depois respondem ao chamado de Jesus.');
  },
  B19(k) {
    room(k); k.config.ground = '#c5b293'; const christ = jesus(k, -1.9, -.1); const mary = k.person('Maria, mãe de Jesus', -2.8, .9, { robe: '#d8c6a4', mantle: '#8caaa7', beard: false }); const servant = k.person('Servos de Caná', .5, -.8, { robe: '#adad88', mantle: '#bbaa80' }); const master = k.person('Mestre de cerimônias', 2.2, 1.4, { robe: '#d2ba8f', mantle: '#928666' }); k.table(2.1, 0, 1.4, 2, 1.1); bread(k, 2.5, .96, 1.5);
    const jars = Array.from({ length: 6 }, (_, i) => { const j = k.vase(-1.4 + i * .61, .03, -2.1); j.scale.setScalar(1.35); j.children.forEach(c => { if (c.material) c.material = k.mat('#b7b09a'); }); return j; });
    const liquid = jars.map((j, i) => k.cylinder(.14, .012, '#87aba6', -1.4 + i * .61, .79, -2.1)); const jug = k.vase(0, 0, 0); jug.scale.setScalar(.65); attach(servant.handR, jug, 0, -.05, .04); const serving = cup(k, 0, 0, 0); attach(master.handR, serving);
    const stream = k.mesh(new THREE.CylinderGeometry(.025, .035, .5, 7), k.mat('#b8d0c0', { transparent: true, opacity: .75 }), .5, .9, -1.9);
    k.animate(t => { const inform = ease(t, 0, 6), pour = ease(t, 7, 11) * (1 - ease(t, 14, 17)), carry = ease(t, 18, 25), taste = ease(t, 25, 30); mary.rightArm.rotation.x = -.9 * inform; face(mary, -1.9, -.1); christ.rightArm.rotation.x = -.6 * ease(t, 4, 9); servant.rightArm.rotation.x = -.95 * pour - .6 * carry; servant.rightForearm.rotation.x = -.8 * carry; jug.rotation.z = pour * 1.2; stream.visible = t > 8 && t < 15; liquid.forEach((l, i) => { l.visible = t > 8 + i; l.material = k.mat(t > 24 ? '#8f535a' : '#87aba6'); }); servant.root.position.set(mix(.5, 1.3, carry), 0, mix(-.8, .9, carry)); servant.root.rotation.y = Math.atan2(.8, 1.7); servant.leftLeg.rotation.x = t > 18 && t < 25 ? Math.sin(t * 6) * .24 : 0; servant.rightLeg.rotation.x = -servant.leftLeg.rotation.x; master.rightArm.rotation.x = -.75 - taste * .7; master.rightForearm.rotation.x = -1.3 * taste; master.head.rotation.x = -.1 * taste; serving.visible = t > 24; });
    jars.forEach(j => k.select(j, 'Talhas de pedra', 'Seis recipientes', 'João 2:6–9', 'As seis talhas são preenchidas com água antes do serviço à mesa.'));
  },
  B20(k) {
    k.config.ground = '#a8ad7b'; k.tree(-3.4, -2.7, 1); k.tree(3.5, -2.6, .9); const dais = k.rock(0, -1.2, 1.6); dais.position.y = .25; const christ = jesus(k, 0, -1.2, { y: .7 });
    const crowd = Array.from({ length: 11 }, (_, i) => { const a = -.95 + i * .19, rad = 2.6 + i % 2 * .6; const p = k.person('Ouvintes do sermão', Math.sin(a) * rad, -1.1 + Math.cos(a) * rad, { robe: ['#bcae8d', '#d7c6a2', '#a2ac8b', '#b98f77'][i % 4], mantle: i % 3 ? undefined : '#849e9a', scale: i % 5 ? .85 : .6, beard: i % 3 === 0 }); face(p, 0, -1.2); if (i % 2) kneel(p, .6); return p; });
    for (let i = 0; i < 7; i++) blossoms(k, -3 + i, 3.3 + Math.sin(i), 4); const lamp = k.lamp(-1, .05, -1.7); const rockHouse = k.groupAt(3, 0, 1); k.mesh(new THREE.BoxGeometry(.7, .6, .65), k.mat('#c7b38c'), 0, .3, 0, rockHouse); const roof = k.mesh(new THREE.ConeGeometry(.6, .35, 4), k.mat('#967659'), 0, .76, 0, rockHouse); roof.rotation.y = PI / 4; k.select(rockHouse, 'Casa sobre a rocha', 'Ilustração de um ensinamento', 'Mateus 7:24–27', 'Um pequeno símbolo ajuda a relacionar ouvir e praticar; não é um edifício narrado no local.');
    k.animate(t => { christ.rightArm.rotation.x = -.7 - Math.sin(t * .5) * .18; christ.rightArm.rotation.z = .2 + ease(t, 8, 14) * .45; christ.leftArm.rotation.x = -.45 * ease(t, 15, 20); christ.head.rotation.y = Math.sin(t * .25) * .35; crowd.forEach((r, i) => { r.head.rotation.x = .03 + Math.sin(t * .6 + i) * .035; if (i === 4) pray(r, t, ease(t, 16, 21) * .7); }); lamp.visible = t > 8; rockHouse.visible = t > 24; });
  },
  B21(k) {
    k.config.ground = '#aab187'; k.tree(-3.5, -2.3, 1); k.tree(3.7, -2.9, 1.1); const christ = jesus(k, 0, -1.2); const platter = k.box(1.5, .07, .7, '#ab895c', 0, .5, .1); for (let i = 0; i < 5; i++) bread(k, -.56 + i * .27, .55, .12, .65); for (let i = 0; i < 2; i++) { const fish = k.animal('fish', -.4 + i * .7, .4, .21); fish.position.y = .55; fish.rotation.z = PI / 2; }
    const loaf = bread(k, 0, 0, 0); attach(christ.handR, loaf, 0, 0, .05); const servers = [-1.3, 1.3].map(x => k.person('Discípulos de Jesus', x, .1, { robe: x < 0 ? '#bcaf87' : '#9ba58b', mantle: '#b38d6c' })); servers.forEach(r => { const basket = k.basket(0, 0, 0); attach(r.handL, basket, 0, -.1, 0); bread(k, r.root.position.x, .4, .2, .6); });
    const families = Array.from({ length: 7 }, (_, i) => { const p = k.person('Famílias da multidão', -3 + i, 2.7 + (i % 2) * .5, { robe: ['#c9bc98', '#a0ab8e', '#bc987c'][i % 3], scale: i % 3 ? .83 : .58, beard: false }); kneel(p, .5); return p; });
    const baskets = Array.from({ length: 12 }, (_, i) => k.basket(-2.7 + i % 6 * 1.05, .02, -3.8 + Math.floor(i / 6) * .65));
    k.animate(t => { const blessing = ease(t, 6, 12), give = ease(t, 14, 19), distribute = ease(t, 17, 26); christ.rightArm.rotation.x = -1.3 * blessing + .45 * give; christ.rightForearm.rotation.x = -.8 * blessing; christ.head.rotation.x = -.23 * blessing + .3 * give; servers.forEach((r, i) => { r.root.position.z = .1 + distribute * 1.7; r.root.position.x = (i ? 1 : -1) * (1.3 + distribute * .8); r.leftLeg.rotation.x = t > 17 && t < 26 ? Math.sin(t * 6 + i) * .2 : 0; r.rightLeg.rotation.x = -r.leftLeg.rotation.x; r.rightArm.rotation.x = -.8 * ease(t, 23, 28); }); baskets.forEach((b, i) => { b.visible = t > 25 + i * .35; }); families.forEach((r, i) => { r.rightForearm.rotation.x = -ease(t, 23 + i * .3, 29) * 1.1; }); platter.visible = true; });
  },
  B22(k) {
    k.config.night = true; k.config.ground = '#7e9693'; k.background.set('#899a9f'); const water = k.water(10, 10, 0, 0, { color: '#638b96' }); const boat = k.boat(0, 0, 1.85); const boatRig = k.groupAt(0, .25, 0); boatRig.attach(boat);
    const christ = jesus(k, -.6, -.5, { y: .55 }); const disciples = [k.person('Discípulos de Jesus', .6, -.4, { y: .55, robe: '#b6b49b' }), k.person('Discípulos de Jesus', -.8, .65, { y: .55, robe: '#c8b58b' }), k.person('Discípulos de Jesus', .8, .65, { y: .55, robe: '#a2ad95' })]; [christ, ...disciples].forEach(r => boatRig.attach(r.root));
    const clouds = [k.cloud(-2.5, 4.8, -2.5, 1.6), k.cloud(1.5, 4.5, -3, 1.8)]; rain(k, t => ease(t, 1, 8) * (1 - ease(t, 18, 25)), 130);
    // Extra broad swell field receives an explicit storm envelope, independent of river ripples.
    const swellGeo = new THREE.PlaneGeometry(10, 10, 42, 42); swellGeo.rotateX(-PI / 2); const p = swellGeo.attributes.position; const base = new Float32Array(p.array); const swell = k.mesh(swellGeo, k.mat('#759ca2', { transparent: true, opacity: .58, side: THREE.DoubleSide, roughness: .3 }), 0, .09, 0);
    k.ambient(t => { const storm = ease(t, 0, 8) * (1 - ease(t, 19, 27)); for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, storm * (Math.sin(x * 2 + z * 1.4 - t * 2.8) * .14 + Math.sin(z * 3 - t * 3) * .06)); } p.needsUpdate = true; swellGeo.computeVertexNormals(); boatRig.rotation.z = Math.sin(t * 2.3) * .13 * storm; boatRig.rotation.x = Math.sin(t * 1.8) * .08 * storm; boatRig.position.y = .25 + Math.sin(t * 2) * .055 * storm; });
    k.animate(t => { const wake = ease(t, 12, 18), calm = ease(t, 19, 27); kneel(christ, 1 - wake); christ.head.rotation.x = .5 * (1 - wake) - .1 * wake; christ.rightArm.rotation.x = -1.2 * wake; christ.rightArm.rotation.z = .5 * wake; disciples.forEach((r, i) => { r.head.rotation.y = -.4 + i * .25; r.rightArm.rotation.x = -.95 * ease(t, 5, 12) + calm * .6; r.leftArm.rotation.z = (-.5 + i * .3) * (1 - calm); }); clouds.forEach((c, i) => { c.position.x = [-2.5, 1.5][i] + calm * (i ? 2 : -2); }); k.light.intensity = .65 + calm * 1.8; k.fill.intensity = .8 + calm * .9; water.visible = swell.visible = true; });
  },
  B23(k) {
    k.config.night = true; k.config.ground = '#8aa39b'; k.water(10, 10, 0, 0, { color: '#6e969e' }); const boat = k.boat(2.8, -1.2, 1.4); const christ = jesus(k, -2.6, 1, { y: .07 }); const peter = k.person('Simão Pedro', 2.3, -.6, { y: .08, robe: '#cab58c', mantle: '#8f9a7c' }); const watchers = [k.person('Discípulos no barco', 2.9, -1.5, { y: .55, robe: '#b0ad92' }), k.person('Discípulos no barco', 3.6, -1, { y: .55, robe: '#c6b38e', beard: false })];
    k.cloud(-1.7, 4.3, -3, 1.7); k.stars(); const footRipples = ripples(k, 0, 0, .09, .22);
    k.animate(t => { const approach = ease(t, 0, 10), walk = ease(t, 8, 17), sink = ease(t, 17, 21) * (1 - ease(t, 23, 27)), rescue = ease(t, 22, 28); christ.root.position.set(mix(-2.6, -.5, approach), .07, 1); christ.root.rotation.y = 1.9; peter.root.position.set(mix(2.3, .05, walk), .08 - sink * .75, mix(-.6, .8, walk)); peter.root.rotation.y = -1.4; const stride = t > 8 && t < 17 ? Math.sin(t * 5) * .16 : 0; peter.leftLeg.rotation.x = stride; peter.rightLeg.rotation.x = -stride; christ.leftLeg.rotation.x = t < 10 ? Math.sin(t * 5) * .15 : 0; christ.rightLeg.rotation.x = -christ.leftLeg.rotation.x; peter.leftArm.rotation.x = -1.2 * sink - .8 * rescue; peter.rightArm.rotation.x = -1.3 * rescue; christ.rightArm.rotation.x = -.9 * ease(t, 20, 25); christ.rightForearm.rotation.x = -.8 * rescue; watchers.forEach(r => { face(r, 0, .8); r.head.rotation.x = -.08; }); footRipples.forEach(o => { o.position.x = peter.root.position.x; o.position.z = peter.root.position.z; }); boat.rotation.z = Math.sin(t * 1.7) * .035 * (1 - rescue); });
  },
  B24(k) {
    k.config.ground = '#c4ad83'; for (let j = 0; j < 8; j++) { k.rock(-3 + Math.sin(j * 2) * .8, -3.4 + j * .9, .5 + j % 3 * .2); k.rock(2 + Math.cos(j * 3) * .5, -3.5 + j * .8, .45); }
    const road = k.box(2.4, .03, 9, '#d4bf95', -.15, .025, .1); road.rotation.y = -.16;
    const victim = k.person('Viajante ferido', -.4, .5, { robe: '#a68f72', mantle: '#b8a383', beard: false }); kneel(victim, .8); victim.head.rotation.x = .45;
    const sam = k.person('Bom samaritano', -1.2, 3.7, { robe: '#c5b38e', mantle: '#87a19a' }); const donkey = k.animal('donkey', .9, 2.7, .95); const band = k.box(.34, .09, .06, '#eee5ce', 0, 0, 0); attach(victim.leftForearm, band, 0, -.1, .07);
    const oil = k.vase(0, 0, 0); oil.scale.setScalar(.45); attach(sam.handR, oil, 0, -.05, 0); const innkeeper = k.person('Hospedeiro', 2.7, -2.2, { robe: '#cbbb93', mantle: '#958d6c' }); gate(k, 2.6, -3, 1.5, 2.7); k.tree(-3.6, 2.1, .7);
    k.animate(t => { const approach = ease(t, 1, 10), care = ease(t, 10, 15) * (1 - ease(t, 24, 28)), leave = ease(t, 25, 32); sam.root.position.set(mix(-1.2, -1, approach) + leave * 2.4, 0, mix(3.7, .7, approach) - leave * 2.4); sam.root.rotation.y = mix(2.7, 2.2, approach); kneel(sam, care); sam.rightArm.rotation.x = -.95 * care; sam.rightForearm.rotation.x = -.8 * care; sam.head.rotation.x = .3 * care; band.visible = t > 18; oil.visible = t < 25; kneel(victim, .8 * (1 - leave)); victim.head.rotation.x = .45 * (1 - leave); victim.root.position.x = -.4 + leave * 2.3; victim.root.position.z = .5 - leave * 2.2; victim.root.rotation.y = leave * 2.3; donkey.position.set(.9 + leave, 0, 2.7 - leave * 3); donkey.rotation.y = 2.9; innkeeper.rightArm.rotation.x = -.8 * leave; sam.leftLeg.rotation.x = t > 1 && t < 10 || t > 25 ? Math.sin(t * 6) * .2 : sam.leftLeg.rotation.x; });
    k.select(band, 'Faixa de cuidado', 'Auxílio ao viajante', 'Lucas 10:34', 'O samaritano trata os ferimentos e providencia a continuidade dos cuidados.');
  },
  B25(k) {
    k.config.ground = '#bcb288'; gate(k, 0, -2.8, 2.4, 2.8); k.tree(-3.5, -.7, 1.1); k.tree(3.6, -1, 1.1); for (let i = 0; i < 11; i++) k.box(.85, .05, .57, i % 2 ? '#c8b890' : '#bdae87', Math.sin(i * .2) * .2, .03, -2.5 + i * .67);
    const son = k.person('Filho que retorna', 0, 4.2, { robe: '#b0a088', mantle: '#978569', beard: false, hair: '#63503d' }); const father = k.person('Pai acolhedor', 0, -1.8, { robe: '#d6c49d', mantle: '#8c9d85', hair: '#b5ae9a' }); const elder = k.person('Irmão mais velho', 3.4, .4, { robe: '#b6a079', mantle: '#a9b194' }); const robe = k.box(.42, .08, .4, '#ded0ac', 2.6, .7, -.8); k.basket(2.6, .02, -.8);
    k.animate(t => { const back = ease(t, 0, 17), welcome = ease(t, 10, 20), embrace = ease(t, 19, 26); son.root.position.z = mix(4.2, .65, back); son.root.rotation.y = PI; father.root.position.z = mix(-1.8, .05, welcome); father.leftArm.rotation.z = -.9 * welcome + 1.25 * embrace; father.rightArm.rotation.z = .9 * welcome - 1.25 * embrace; father.leftArm.rotation.x = father.rightArm.rotation.x = -embrace * .95; father.leftForearm.rotation.x = father.rightForearm.rotation.x = -embrace * .8; son.leftArm.rotation.x = son.rightArm.rotation.x = -embrace * .9; son.leftForearm.rotation.x = son.rightForearm.rotation.x = -embrace * .7; son.head.rotation.x = .35 * (1 - embrace) + embrace * .1; father.head.rotation.x = embrace * .15; son.leftLeg.rotation.x = t < 17 ? Math.sin(t * 5) * .18 : 0; son.rightLeg.rotation.x = -son.leftLeg.rotation.x; father.leftLeg.rotation.x = t > 10 && t < 20 ? Math.sin(t * 7) * .25 : 0; father.rightLeg.rotation.x = -father.leftLeg.rotation.x; face(elder, 0, .3); elder.head.rotation.x = .1; robe.visible = t > 25; });
  },
  B26(k) {
    k.config.ground = '#acaa87'; const cave = k.mesh(new THREE.SphereGeometry(1.35, 24, 16), k.mat('#474c41'), 0, .75, -2); cave.scale.z = .18; const arch = k.mesh(new THREE.TorusGeometry(1.2, .35, 9, 36, PI), k.mat('#aba58b'), 0, .65, -1.7); for (const x of [-1.25, 1.25]) k.box(.6, .9, .8, '#a19e85', x, .45, -1.9); for (let i = 0; i < 7; i++) k.rock(-2.1 + i * .7, -2.8, .75);
    const stone = k.mesh(new THREE.CylinderGeometry(1.12, 1.12, .23, 32), k.mat('#b5ad8e'), 0, 1, -1.38); stone.rotation.x = PI / 2;
    const christ = jesus(k, -1.8, 1.2); const martha = k.person('Marta de Betânia', 1.8, 1.6, { robe: '#c2ad8b', mantle: '#94a493', beard: false }); const mary = k.person('Maria de Betânia', 2.7, .8, { robe: '#c7b99a', mantle: '#8e9ca2', beard: false }); const laz = k.person('Lázaro', 0, -2.2, { robe: '#ddd9bd', mantle: '#c7c4ab', hair: '#665c46' });
    for (let j = 0; j < 7; j++) { const ring = k.mesh(new THREE.TorusGeometry(.25 - j * .008, .028, 5, 24), k.mat('#eee7cf'), 0, .3 + j * .12, 0, laz.root); ring.rotation.x = PI / 2; }
    k.tree(-3.7, -1.3, .95); blossoms(k, 3.3, 2.8, 8);
    k.animate(t => { const open = ease(t, 7, 14), call = ease(t, 16, 20), emerge = ease(t, 21, 31); stone.position.x = open * 2.5; stone.rotation.z = -open * 2; face(christ, 0, -1); christ.rightArm.rotation.x = -1.1 * call; christ.rightForearm.rotation.x = -.3 * call; christ.head.rotation.x = -.15 * call; laz.root.visible = t >= 21; laz.root.position.z = mix(-2.2, -.1, emerge); laz.leftLeg.rotation.x = t > 21 ? Math.sin(t * 3) * .1 : 0; laz.rightLeg.rotation.x = -laz.leftLeg.rotation.x; [martha, mary].forEach((r, i) => { face(r, 0, -1); r.head.rotation.x = .2 - emerge * .3; r.leftArm.rotation.x = -emerge * (.7 + i * .2); r.leftForearm.rotation.x = -emerge * .8; }); });
    k.select(stone, 'Pedra do sepulcro', 'A entrada é aberta', 'João 11:38–44', 'Jesus manda tirar a pedra antes de chamar Lázaro.');
  },
  B27(k) {
    k.config.ground = '#bfb08a'; gate(k, 0, -3, 2.8, 3.2); for (let j = 0; j < 10; j++) k.box(2.3, .04, .68, j % 2 ? '#c8bb98' : '#b4aa8d', 0, .04, -3 + j * .68);
    const donkey = k.animal('donkey', .4, 3.5, 1.1); const christ = jesus(k, 0, 0, { mantle: '#b18a70' }); attach(donkey, christ.root, 0, .57, -.05); kneel(christ, .8); christ.leftLeg.position.x = -.28; christ.rightLeg.position.x = .28; christ.root.rotation.y = 0;
    const people = Array.from({ length: 8 }, (_, i) => { const p = k.person('Multidão de Jerusalém', (i % 2 ? 1 : -1) * (1.8 + i % 3 * .3), -1.8 + Math.floor(i / 2) * 1.4, { robe: ['#b8ac88', '#a5b097', '#d1bc96', '#b5967a'][i % 4], scale: i === 5 ? .65 : .9, beard: i % 2 === 0 }); const branch = k.groupAt(0, 0, 0); attach(p.handR, branch, 0, .1, 0); k.mesh(new THREE.CylinderGeometry(.012, .016, .7, 5), k.mat('#8e7d4c'), 0, .25, 0, branch); for (let j = 0; j < 7; j++) { const l = k.mesh(new THREE.SphereGeometry(.12, 8, 5), k.mat('#829361'), Math.sin(j * 2.5) * .16, .1 + j * .08, 0, branch); l.scale.set(.45, 1.5, .23); l.rotation.z = Math.sin(j * 2.5) * .7; } return p; });
    const mantles = Array.from({ length: 5 }, (_, i) => { const cloth = k.box(.8, .025, .6, ['#a87f66', '#b7aa7e', '#8fa39a'][i % 3], .1 + Math.sin(i) * .2, .08, -2.2 + i * 1.2); cloth.rotation.y = i * .2; return cloth; });
    const legs = donkey.children.filter(o => o.geometry?.type === 'CapsuleGeometry'); k.animate(t => { const q = ease(t, 5, 29); donkey.position.z = mix(3.5, -2, q); donkey.rotation.y = PI; legs.forEach((l, i) => { l.rotation.x = t > 5 && t < 29 ? Math.sin(t * 6 + i * PI) * .15 : 0; }); christ.rightArm.rotation.x = -.55; christ.rightForearm.rotation.x = -.9; christ.head.rotation.y = Math.sin(t * .35) * .25; people.forEach((r, i) => { face(r, 0, donkey.position.z); r.rightArm.rotation.x = -.6 - Math.sin(t * 1.3 + i) * .2; r.rightForearm.rotation.x = -.45; }); mantles.forEach((o, i) => { o.visible = t > 2 + i; }); });
    k.select(donkey, 'Jumentinho', 'Montaria de Jesus', 'Mateus 21:1–11', 'A entrada em Jerusalém é acompanhada por mantos e ramos estendidos no caminho.');
  },
  B28(k) {
    room(k); k.config.night = true; k.config.ground = '#b5a080'; const table = k.table(0, 0, 0, 6.4, 1.65); const runner = k.box(6.2, .025, .51, '#d9caab', 0, .955, 0); for (let i = 0; i < 17; i++) k.box(.035, .009, .48, '#b4a17e', -3 + i * .375, .973, 0);
    const christ = jesus(k, 0, -1.4); const names = ['Simão Pedro', 'André', 'Tiago, filho de Zebedeu', 'João, filho de Zebedeu', 'Filipe', 'Bartolomeu', 'Tomé', 'Mateus', 'Tiago, filho de Alfeu', 'Simão Zelote', 'Judas, irmão de Tiago', 'Judas Iscariotes'];
    const colors = ['#b7b48a', '#a8b0a0', '#bd9d7e', '#c9baa0', '#a1aca2', '#baa278', '#b3a38b', '#b79d83', '#c4bc9c', '#949f89', '#b7ac90', '#a28a76']; const hairs = ['#8b8270', '#5b4836', '#5a493a', '#493c31', '#a49a83', '#675744', '#4a3b30', '#6b5540', '#5b4c39', '#b4aa91', '#584935', '#493d32'];
    const apostles = names.map((name, i) => { const back = i < 6, j = i % 6, x = back ? [-2.65, -1.78, -.89, .89, 1.78, 2.65][j] : [-2.65, -1.6, -.55, .55, 1.6, 2.65][j]; const p = k.person(name, x, back ? -1.35 : 1.35, { robe: colors[i], mantle: i % 3 ? undefined : '#938571', hair: hairs[i], beard: i !== 3, rotation: back ? 0 : PI, scale: .9 + i % 3 * .025 });
      p.leftArm.rotation.x = p.rightArm.rotation.x = -.75; p.leftForearm.rotation.x = p.rightForearm.rotation.x = -1.05;
      k.select(p.root, name, 'Apóstolo à mesa', 'Lucas 22:14; Lucas 6:13–16', 'Um dos doze apóstolos reunidos com Jesus. Aparência e posição são escolhas artísticas.'); return p; });
    for (let i = 0; i < 12; i++) { const x = -2.8 + i % 6 * 1.12, z = i < 6 ? -.5 : .5; const plate = k.cylinder(.21, .025, '#c4ac7d', x, .98, z); bread(k, x, 1, z, .65); cup(k, x + .26, .98, z); k.select(plate, 'Mesa da ceia', 'Pão e cálices', 'Lucas 22:14–20', 'Jesus reparte o pão e apresenta o cálice aos apóstolos.'); }
    for (const x of [-2.3, 2.3]) { k.vase(x, .98, 0); k.lamp(x, .98, -.05); } k.lamp(-3.2, .1, -.5); k.lamp(3.2, .1, -.5); const basin = bowl(k, -2.9, .25, 2); basin.rotation.x = PI; k.box(.4, .04, .5, '#e0d4b4', -2.9, .1, 2.4);
    const whole = bread(k, 0, 0, 0); attach(christ.handR, whole, 0, .02, .03); const halfR = bread(k, 0, 0, 0, .62), halfL = bread(k, 0, 0, 0, .62); attach(christ.handR, halfR, 0, .02, .03); attach(christ.handL, halfL, 0, .02, .03); const chalice = cup(k, 0, 0, 0); attach(christ.handR, chalice, 0, -.03, 0);
    const received = bread(k, 0, 0, 0, .55); attach(apostles[3].handL, received, 0, .02, .04);
    k.animate(t => { const raise = ease(t, 5, 12), divide = ease(t, 15, 19), give = ease(t, 20, 25), cupLift = ease(t, 26, 31);
      christ.rightArm.rotation.x = -.8 - raise * .75 + give * .25 - cupLift * .25; christ.leftArm.rotation.x = -.75 - raise * .75 + give * .3; christ.rightArm.rotation.z = -.35 + divide * .68 + give * .2; christ.leftArm.rotation.z = .35 - divide * .68;
      christ.leftForearm.rotation.x = christ.rightForearm.rotation.x = -1.05 + raise * .25; christ.head.rotation.x = -.18 * raise + give * .25; whole.visible = t < 17; halfR.visible = t >= 17 && t < 26; halfL.visible = t >= 17 && t < 24; chalice.visible = t >= 26; received.visible = t >= 24;
      apostles.forEach((r, i) => { r.head.rotation.y = Math.sin(t * .25 + i) * .1 + (i < 6 ? (i < 3 ? .2 : -.2) : 0); r.head.rotation.x = .07 + Math.sin(t * .6 + i) * .025; r.rightForearm.rotation.x = -1.05 - ease(t, 10 + i * .55, 18 + i * .4) * .16; if (i === 3) { r.leftArm.rotation.x = -.75 - give * .4; r.leftArm.rotation.z = -.35 * give; } }); runner.visible = true;
    });
    k.select(table, 'Mesa de madeira', 'Lugar da ceia', 'Lucas 22:7–20; João 13', 'Mesa, alimentos e objetos de serviço compõem uma ambientação artística da última ceia.');
    k.config.camera = [8.5, 6.5, 10.5]; k.config.target = [0, 1, 0]; k.config.views = [{ label: 'A mesa e os doze', camera: [8.5, 6.5, 10.5], target: [0, 1, 0] }, { label: 'Jesus e o pão', camera: [3.6, 2.7, 4.4], target: [0, 1.2, -.9] }, { label: 'Detalhes da mesa', camera: [4, 4.5, 5.5], target: [0, 1, 0] }];
  },
  B29(k) {
    k.config.night = true; k.config.ground = '#8f987b'; k.background.set('#384951'); k.stars(); const olives = [k.tree(-3.6, -2.2, 1.35), k.tree(2.7, -2.4, 1.3), k.tree(-3.3, 2.4, 1.05), k.tree(3.7, 1.8, 1.2)];
    for (let i = 0; i < 9; i++) { const rock = k.rock(-2.4 + i * .59, -2 + Math.sin(i * 2) * .5, .35 + i % 3 * .1); rock.rotation.y = i * .4; } const prayerRock = k.rock(-.5, -.8, 1.2); prayerRock.position.y = .17;
    const christ = jesus(k, -.4, 1.1, { mantle: '#b7a28c' }); const sleepers = [[1.8, 1.4], [2.4, 2.4], [1.2, 2.9]].map(([x, z], i) => { const r = k.person('Discípulos de Jesus', x, z, { robe: ['#a2aa90', '#b6a482', '#c4baa0'][i], mantle: i === 0 ? '#889c93' : undefined }); kneel(r, .9); r.head.rotation.x = .53; r.root.rotation.y = -1; for (const side of [-1, 1]) { const lid = k.mesh(new THREE.CapsuleGeometry(.012, .04, 3, 6), k.mat('#bc8c65'), side * .075, .006, .195, r.head); lid.rotation.z = PI / 2; } return r; });
    const messenger = angel(k, 'Anjo fortalecedor', -1.7, -1.3, { y: .2 }); const softRay = k.ray(-1.5, .1, -1.1, 4.3); const angelLight = new THREE.PointLight('#e2e2c5', 0, 5); angelLight.position.set(-1.3, 2, -1.1); k.add(angelLight);
    k.animate(t => { const kneeling = ease(t, 2, 9) * (1 - ease(t, 25, 30)), strengthened = ease(t, 16, 23), returnToFriends = ease(t, 28, 32); kneel(christ, kneeling); pray(christ, t, kneeling); christ.root.position.set(-.4 + returnToFriends * 1.3, 0, 1.1 + returnToFriends * .3); christ.root.rotation.y = PI * (1 - returnToFriends) + returnToFriends * 1.1; christ.head.rotation.x = .2 * kneeling - strengthened * .04; christ.rightArm.rotation.x = -kneeling * .75 - returnToFriends * .65; messenger.root.visible = softRay.visible = t > 16 && t < 29; messenger.rightArm.rotation.x = -.7 * strengthened; messenger.rightArm.rotation.z = .4 * strengthened; messenger.head.rotation.x = .08; angelLight.intensity = strengthened * (1 - returnToFriends) * 1.3; sleepers.forEach((r, i) => { r.head.rotation.x = .55 + Math.sin(t * .8 + i) * .015; r.leftArm.rotation.x = -.45; r.rightArm.rotation.x = -.45; r.leftForearm.rotation.x = r.rightForearm.rotation.x = -1.2; }); k.light.intensity = .62; k.fill.intensity = .65; olives.forEach(o => { o.visible = true; }); });
    k.select(prayerRock, 'Rocha no jardim', 'Ambientação artística da oração', 'Lucas 22:39–46', 'A passagem situa Jesus no Monte das Oliveiras e relata sua oração de joelhos; a rocha é uma escolha de composição.');
    k.config.camera = [8.3, 5.7, 10.3]; k.config.target = [0, 1, -.3]; k.config.views = [{ label: 'O jardim', camera: [8.3, 5.7, 10.3], target: [0, 1, -.3] }, { label: 'A oração', camera: [3.8, 2.8, 5.2], target: [-.6, .9, .5] }, { label: 'As oliveiras', camera: [-6.8, 4, 7.3], target: [0, 1, 0] }];
  },
  B30(k) {
    k.config.ground = '#a99d83'; k.background.set('#aaaba3'); k.config.camera = [9, 6.8, 11.5]; k.config.target = [0, 1.8, -.4];
    const hill = k.mesh(new THREE.SphereGeometry(3.5, 32, 16), k.mat('#b2a68a'), 0, -.6, -1.3); hill.scale.y = .23;
    const makeCross = (x, z, h, label) => { const cross = k.groupAt(x, 0, z); k.mesh(new THREE.BoxGeometry(.22, h, .2), k.mat('#76573c'), 0, h / 2, 0, cross); k.mesh(new THREE.BoxGeometry(h * .52, .2, .2), k.mat('#896744'), 0, h * .77, .015, cross); k.mesh(new THREE.BoxGeometry(.48, .12, .3), k.mat('#856342'), 0, h * .42, .08, cross); const foot = k.rock(x, z, .5); foot.position.y = .08; k.select(cross, label, 'Cruz firmemente apoiada', 'João 19:17–18; Lucas 23:33', 'A estrutura permanece fixa; somente tecidos, nuvens e gestos discretos se movem.'); k.label(cross, label); return cross; };
    const central = makeCross(0, -1.6, 4.5, 'Cruz de Jesus'); makeCross(-2.6, -2, 3.6, 'Cruz à esquerda'); makeCross(2.6, -2, 3.6, 'Cruz à direita');
    const christ = jesus(k, 0, -1.44, { y: 2.38, mantle: undefined, robe: '#ded7bf' }); christ.leftArm.rotation.z = -PI / 2; christ.rightArm.rotation.z = PI / 2; christ.leftForearm.rotation.z = .04; christ.rightForearm.rotation.z = -.04;
    [-1, 1].forEach(side => { const r = k.person('Condenados ao lado de Jesus', side * 2.6, -1.85, { y: 1.9, scale: .8, robe: '#a79b84', hair: '#615342' }); r.leftArm.rotation.z = -PI / 2; r.rightArm.rotation.z = PI / 2; r.head.rotation.x = .3; });
    const sign = k.box(.8, .28, .06, '#bdac86', 0, 4.14, -1.44); k.label(sign, 'Jesus Nazareno'); k.select(sign, 'Inscrição na cruz', 'Título ordenado por Pilatos', 'João 19:19–22', 'O texto de João registra a inscrição que identifica Jesus como nazareno e rei dos judeus.');
    const mother = k.person('Maria, mãe de Jesus', -1.9, 1.5, { robe: '#bfc1ab', mantle: '#8eaaa9', beard: false }); const mag = k.person('Maria Madalena', -2.7, 1.1, { robe: '#c6b59b', mantle: '#a49685', beard: false }); const beloved = k.person('Discípulo amado', -.8, 1.8, { robe: '#b9ac8d', mantle: '#8b9f95', beard: false }); const cent = k.person('Centurião', 2.9, 1.9, { robe: '#ae9274', mantle: '#886a5d' }); const soldiers = [k.person('Soldados romanos', 1.8, .3, { robe: '#aa8f73', mantle: '#9a6b59' }), k.person('Soldados romanos', 3.4, -.1, { robe: '#a6a18d', mantle: '#92745e' })];
    [cent, ...soldiers].forEach(r => { const helmet = k.mesh(new THREE.SphereGeometry(.25, 16, 10, 0, TAU, 0, PI * .5), k.mat('#a5a38d', { metalness: .25 }), 0, .05, 0, r.head); helmet.scale.y = .85; const shield = k.mesh(new THREE.CylinderGeometry(.25, .25, .07, 20), k.mat('#a28b62')); shield.rotation.x = PI / 2; attach(r.handL, shield, 0, 0, .12); }); staff(k, cent.handR, '#826b4e', 2);
    const garments = ['#baa989', '#918d76', '#b9b39a'].map((c, i) => { const geo = new THREE.PlaneGeometry(.7, .6, 12, 9); geo.rotateX(-PI / 2); const cloth = k.mesh(geo, k.mat(c, { side: THREE.DoubleSide }), 1.8 + i * .45, .1, 1); return { cloth, base: new Float32Array(geo.attributes.position.array) }; });
    const clouds = [k.cloud(-2.3, 5, -3, 1.8), k.cloud(2.8, 4.7, -2.7, 1.9)]; const windCloth = k.flag(-4, 0, -.1, '#aa9380'); windCloth.scale.set(.55, .65, .6);
    k.ambient(t => { garments.forEach(({ cloth, base }, j) => { const p = cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, base[i * 3 + 1] + Math.sin(base[i * 3] * 5 + t * 2 + j) * .018); p.needsUpdate = true; }); });
    k.animate(t => { const near = ease(t, 1, 9), care = ease(t, 9, 16), dark = ease(t, 13, 27); mother.root.position.z = mix(1.5, .5, near); beloved.root.position.z = mix(1.8, .8, near); beloved.root.position.x = mix(-.8, -1.25, care); face(mother, 0, -1.6); face(mag, 0, -1.6); face(beloved, -1.9, .5); mother.head.rotation.x = -.25 + care * .3; mag.head.rotation.x = -.18; beloved.leftArm.rotation.x = -.7 * care; beloved.leftForearm.rotation.x = -care * 1.1; christ.head.rotation.x = .08 + ease(t, 19, 29) * .29; christ.head.rotation.z = .04; soldiers.forEach((r, i) => { r.head.rotation.x = .3 - dark * .15; r.rightArm.rotation.x = -.5 - Math.sin(t * .5 + i) * .12 * (1 - dark); }); cent.head.rotation.x = -.27; cent.root.rotation.y = -2.3; cent.rightArm.rotation.x = -.65 * ease(t, 25, 30); k.light.intensity = 2.2 - dark * 1.65; k.fill.intensity = 1.7 - dark * .85; clouds.forEach((c, i) => { c.position.x = [-2.3, 2.8][i] - t * .045; }); central.rotation.set(0, 0, 0); });
    k.config.views = [{ label: 'O Gólgota', camera: [9, 6.8, 11.5], target: [0, 1.8, -.4] }, { label: 'Junto da cruz', camera: [4.2, 3.9, 6.2], target: [-.5, 2, -.7] }, { label: 'Três cruzes', camera: [0, 5.4, 12], target: [0, 2.1, -1.5] }];
  },
  B31(k) {
    k.config.ground = '#a8b18c'; k.background.set('#d9d8ba'); const dark = k.mesh(new THREE.SphereGeometry(1.25, 24, 16), k.mat('#535a4c'), -.7, .73, -2.1); dark.scale.z = .17; const arch = k.mesh(new THREE.TorusGeometry(1.15, .34, 9, 36, PI), k.mat('#b2ad93'), -.7, .58, -1.9); for (const x of [-1.9, .5]) k.box(.6, .75, .7, '#b5af94', x, .38, -2.1); const stone = k.mesh(new THREE.CylinderGeometry(1.04, 1.04, .23, 28), k.mat('#bcb599'), 1.4, .94, -2.1); stone.rotation.x = PI / 2; k.select(stone, 'Pedra já retirada', 'Entrada do sepulcro', 'João 20:1', 'A animação começa com a pedra já retirada, como Maria a encontra.');
    k.box(1.1, .1, .5, '#d5cfc0', -.7, .12, -2); k.box(.3, .08, .26, '#e2dbca', -.3, .23, -2); k.tree(-3.7, -2.7, 1.3); k.tree(3.3, -2.7, 1.1); for (let j = 0; j < 7; j++) blossoms(k, -3 + j, 2.4 + Math.sin(j) * .7, 7);
    const mary = k.person('Maria Madalena', -1.3, .8, { robe: '#d2c2a6', mantle: '#91a8a1', beard: false }); const christ = jesus(k, 2.1, .3, { mantle: '#e6ddc4' }); const angels = [-1.1, -.25].map(x => angel(k, 'Anjos no sepulcro', x, -2, { y: .1, scale: .68 })); angels.forEach(r => kneel(r, .7));
    const ray = k.ray(2.1, .1, .3, 4.3); k.animate(t => { const dawn = ease(t, 0, 20), turn = ease(t, 17, 24), recognition = ease(t, 23, 29); mary.root.rotation.y = mix(2.9, 1.75, turn); mary.head.rotation.x = .26 * (1 - turn) - recognition * .12; mary.rightArm.rotation.x = -.6 * recognition; mary.leftArm.rotation.x = -.45 * recognition; mary.rightForearm.rotation.x = -recognition; christ.root.visible = ray.visible = t >= 16; christ.rightArm.rotation.x = -.65 * ease(t, 18, 24); christ.rightArm.rotation.z = -.2; christ.head.rotation.y = -.45; angels.forEach(r => { r.root.visible = t > 8 && t < 20; }); k.light.intensity = 1.35 + dawn * 1.8; k.light.color.set('#ffe0a7'); k.fill.intensity = 1.2 + dawn * .65; opacity(ray, .055 * ease(t, 17, 23)); });
    k.config.camera = [8, 5.5, 10]; k.config.target = [0, 1, -.4];
  },
  B32(k) {
    k.config.ground = '#a9b38a'; k.background.set('#c6d8d0'); k.tree(-3.6, -2.6, 1.1); k.tree(3.7, -2.4, 1.2); for (let i = 0; i < 9; i++) k.rock(-3 + i * .75, -2.7 + Math.sin(i) * .5, .25); const christ = jesus(k, 0, -1.2, { mantle: '#e6ddc3' });
    const apostles = Array.from({ length: 7 }, (_, i) => { const r = k.person('Apóstolos de Jesus', -3 + i, 1.4 + Math.sin(i / 6 * PI) * 1.4, { robe: ['#c2b58e', '#9eac97', '#c7af8e', '#a7a98a'][i % 4], mantle: i % 3 === 0 ? '#b08c73' : undefined, hair: i % 3 ? '#5c4b3a' : '#9e9581' }); face(r, 0, -1.2); return r; }); const messengers = [-1.1, 1.1].map(x => angel(k, 'Dois mensageiros de branco', x, -.6));
    const cloud = k.cloud(0, 4.3, -1.2, 1.5), shaft = k.ray(0, .1, -1.2, 5.7); k.animate(t => { const ascent = ease(t, 8, 23), cover = ease(t, 20, 25), arrival = ease(t, 25, 29); christ.root.position.y = ascent * 3.6; christ.leftArm.rotation.z = -.4 - ease(t, 2, 7) * .3; christ.rightArm.rotation.z = .4 + ease(t, 2, 7) * .3; christ.leftArm.rotation.x = christ.rightArm.rotation.x = -.5; christ.root.visible = t < 25; cloud.scale.setScalar(1.2 + cover * .8); cloud.position.y = 4.1 + cover * .35; opacity(cloud, .65 + cover * .3); apostles.forEach((r, i) => { r.head.rotation.x = -.1 - ascent * .36 + arrival * .2; r.leftArm.rotation.x = -.3 * ascent; r.rightForearm.rotation.x = -.6 * ascent; if (i === 3) r.root.rotation.y += 0; }); messengers.forEach((r, i) => { r.root.visible = t > 25; r.rightArm.rotation.x = -.7 * arrival; r.head.rotation.y = i ? .2 : -.2; }); shaft.visible = t > 8; k.light.intensity = 2.8 + ascent * .7; });
    k.config.camera = [9, 7, 11]; k.config.target = [0, 2, -.3];
  },
};
