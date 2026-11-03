import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const PI=Math.PI,TAU=PI*2;
const mix=THREE.MathUtils.lerp;
const ease=(t,a,b)=>{const q=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return q*q*(3-2*q)};
const seed=n=>()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296};

// Clone only the revealed figures' materials: their fade must never make a
// shared face, robe, or stone translucent elsewhere in the diorama.
function reveal(object){
 const materials=new Map();
 object.traverse(child=>{
  if(!child.material)return;
  const original=child.material;
  if(!materials.has(original)){
   const material=original.clone();material.transparent=true;
   materials.set(original,{material,opacity:original.opacity,depthWrite:original.depthWrite,transparent:original.transparent});
  }
  child.material=materials.get(original).material;
  // Luminous arrivals do not cast a fully opaque shadow before their fade.
  child.castShadow=false;
 });
 return amount=>{
  object.visible=amount>0;object.userData.reveal=amount;
  for(const {material,opacity,depthWrite,transparent}of materials.values()){
   const complete=amount>=1,nextTransparent=transparent||!complete;
   if(material.transparent!==nextTransparent){material.transparent=nextTransparent;material.needsUpdate=true;}
   material.opacity=opacity*amount;material.depthWrite=depthWrite&&complete;
  }
 };
}

function denStone(variant){
 const geometry=new RoundedBoxGeometry(1.27,.73,1.03,3,.28),p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const thumb=1+.12*Math.sin(x*4.2+variant*2.1)*Math.cos(z*3.2-y*2.4);
  p.setXYZ(i,x*thumb+y*.13*Math.sin(variant+1),y*(1+.14*Math.cos(x*3+z*4+variant)),z*(1+.065*Math.sin(x*3.4+variant)));
 }
 // RoundedBoxGeometry is non-indexed for its UV seams. Average the warped
 // face normals only at coincident positions; keep UVs and topology intact.
 geometry.computeVertexNormals();
 const normal=geometry.attributes.normal,sums=new Map(),keys=[];
 for(let i=0;i<p.count;i++){
  const key=[p.getX(i),p.getY(i),p.getZ(i)].map(n=>Math.round(n*1e5)).join(',');keys.push(key);
  if(!sums.has(key))sums.set(key,new THREE.Vector3());
  sums.get(key).add(new THREE.Vector3().fromBufferAttribute(normal,i));
 }
 for(const sum of sums.values())sum.normalize();
 for(let i=0;i<p.count;i++){const n=sums.get(keys[i]);normal.setXYZ(i,n.x,n.y,n.z);}
 normal.needsUpdate=true;geometry.name='Pedra irregular boleada';return geometry;
}

function sculptDenWall(k){
 const root=k.groupAt();root.name='Cova de pedras arredondadas';
 const colors=['#89959d','#a2aaac','#abb0ae','#7d898f'],shapes=[denStone(0),denStone(1),denStone(2)],batches=Array.from({length:12},()=>[]),matrix=new THREE.Object3D();
 for(let row=0;row<4;row++)for(let j=0;j<13;j++){
  const a=mix(-PI*.49,PI*.49,j/12)+(row%2?.027:-.012),r=4.25+Math.sin(j*4.7+row)*.09;
  batches[(j+row*3)%12].push({position:[Math.sin(a)*r,.35+row*.69+Math.sin(j*3.4+row)*.065,-Math.cos(a)*3.65],scale:[.89+(j%3)*.11,1+Math.sin(j*2.2+row)*.12,.92+(row+j)%3*.075],rotation:[Math.sin(j+row)*.085,-a+Math.sin(j*2)*.14,Math.cos(j*4+row)*.10]});
 }
 for(const [j,x,z,size]of[[0,-4.35,1.15,1.08],[1,4.3,.95,1.12],[2,-4,2.5,.83],[3,4.05,2.48,.9]])batches[j].push({position:[x,.31*size,z],scale:[size,.9*size,size],rotation:[.08,j*.7,.1]});
 batches.forEach((parts,index)=>{
  const mesh=new THREE.InstancedMesh(shapes[index%3],k.mat(colors[index%4],{roughness:.88,bumpScale:.018}),parts.length);
  parts.forEach(({position,scale,rotation},i)=>{matrix.position.set(...position);matrix.scale.set(...scale);matrix.rotation.set(...rotation);matrix.updateMatrix();mesh.setMatrixAt(i,matrix.matrix)});
  mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);
 });
 return root;
}

function kneelingDaniel(k){
 const rig=k.person('Daniel',-.05,.55,{robe:'#e1d5ba',mantle:'#9ba99b',hair:'#95866e',beard:false});
 rig.root.rotation.y=.14;rig.root.position.y=-.095;rig.robe.scale.y=.69;
 rig.head.position.y=1.03;rig.leftArm.position.y=rig.rightArm.position.y=.76;
 rig.leftLeg.position.y=rig.rightLeg.position.y=.45;rig.leftLeg.rotation.x=rig.rightLeg.rotation.x=1.12;
 const articulated=new Set([rig.robe,rig.head,rig.leftArm,rig.rightArm,rig.leftLeg,rig.rightLeg]);
 // The belt, hem, folds and mantle follow the shorter kneeling torso too.
 for(const child of rig.root.children)if(!articulated.has(child)){child.position.y*=.69;child.scale.y*=.69;}
 rig.root.userData.danielKneeling=true;return rig;
}

export function buildDanielDen(k){
    k.config.night = true; k.config.ground = '#b7a58e'; k.config.camera = [7.9, 7.1, 11.7]; k.config.target = [0, 1.25, -.25];
    // The front stays open, with irregular blocks behind the figures.
    sculptDenWall(k);
    // Leaf and moss details share a few instanced meshes rather than dozens of
    // individual draw calls. All positions are derived from fixed indices.
    const leafGeometry = new THREE.SphereGeometry(1, 10, 8), transform = new THREE.Object3D();
    const details = (color, parts) => { const mesh = new THREE.InstancedMesh(leafGeometry, k.mat(color), parts.length); parts.forEach(([x, y, z, sx, sy, sz, rz = 0, ry = 0], i) => { transform.position.set(x, y, z); transform.scale.set(sx, sy, sz); transform.rotation.set(0, ry, rz); transform.updateMatrix(); mesh.setMatrixAt(i, transform.matrix); }); mesh.castShadow = mesh.receiveShadow = true; k.add(mesh); return mesh; };
    const leaves = [], moss = [], fernLeaves = [];
    for (const [i, a] of [-1.02, -.49, .49, 1.06].entries()) {
      const x = Math.sin(a) * 4.25, z = -Math.cos(a) * 3.65 + .55;
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x - .08, 3.05, z), new THREE.Vector3(x + .12, 2.25, z + .1), new THREE.Vector3(x - .1, 1.55, z + .12), new THREE.Vector3(x + .05, .85 + i % 2 * .25, z + .2)]);
      k.mesh(new THREE.TubeGeometry(curve, 18, .022, 5), k.mat('#6f7955'));
      for (let n = 0; n < 7; n++) { const p = curve.getPoint(.06 + n * .135); for (const side of [-1, 1]) leaves.push([p.x + side * .085, p.y - .035, p.z + .015, .12, .045, .065, side * -.52, side * .3]); }
    }
    for (let i = 0; i < 20; i++) { const a = mix(-PI * .46, PI * .46, i / 19), r = 3.77 + Math.sin(i) * .16; moss.push([Math.sin(a) * r, .055 + i % 3 * .012, -Math.cos(a) * 3.1, .17 + i % 3 * .04, .04, .11]); }
    for (const [x, z] of [[-4.4, .8], [4.3, .6], [-3.7, 2.6], [3.9, 2.5], [-3.3, -2.3], [3.2, -2.4]]) for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; fernLeaves.push([x + Math.sin(a) * .16, .14 + i % 2 * .07, z + Math.cos(a) * .16, .065, .23, .045, -Math.sin(a) * .65, a]); }
    details('#6f8159', leaves); details('#89916b', moss); details('#71845e', fernLeaves);
    const jointMoss = [], paleMoss = [];
    for (let i = 0; i < 25; i++) {
      const a = mix(-1.42, 1.42, i / 24), row = i % 4, x = Math.sin(a) * (4.25 - .64), z = -Math.cos(a) * 3.65 + Math.cos(a) * .64;
      const y = .17 + row * .69 + Math.sin(i * 2.3) * .08;
      for (let lobe = 0; lobe < 3; lobe++) {
        const tangent = (lobe - 1) * .095, patch = [x + Math.cos(a) * tangent, y + Math.sin(lobe * 2.1 + i) * .035, z + Math.sin(a) * tangent, .11 + lobe % 2 * .045, .05 + (i + lobe) % 3 * .015, .027, Math.sin(i + lobe) * .25, -a];
        (i % 3 ? jointMoss : paleMoss).push(patch);
      }
    }
    details('#647657', jointMoss); details('#8a9568', paleMoss);
    const pebbles = [];
    for (let i = 0; i < 23; i++) { const a = i / 23 * TAU, r = 4.1 + Math.sin(i * 3) * .6; pebbles.push([Math.sin(a) * r, .045, Math.cos(a) * r, .05 + i % 3 * .025, .04 + i % 2 * .02, .065]); }
    details('#c4b8a1', pebbles);
    const da=kneelingDaniel(k);
    const positions = [[-2.75, .9, 1.18, .65, false], [2.65, .8, 1.2, -.9, false], [-1.9, 3.3, 1.13, -.25, true], [1.65, 3.6, 1.13, -.1, true], [2, -1.8, 1.02, 2.4, false]];
    const lions = positions.map(([x, z, s, turn, resting]) => { const lion = k.animal('lion', x, z, s); lion.rotation.y = turn; lion.userData.resting = resting; return lion; });
    const an = k.person('Anjo de proteção', -.2, -1.25, { y: .23, robe:'#f3edda', hair:'#d6b676', mantle:'#e8dfc7', beard:false });
    // Wings and halo are a symbolic toy-art convention; the existing episode
    // note identifies the angel as an interpretation, not a physical account.
    for (const side of [-1, 1]) { const wing = new THREE.Group(); wing.position.set(side * .22, 1.01, -.18); an.root.add(wing); for (let i = 0; i < 4; i++) { const feather = k.mesh(leafGeometry, k.mat('#f1e9d7'), side * (.12 + i * .09), .1 + i * .055, -.025, wing); feather.scale.set(.115, .27 - i * .022, .065); feather.rotation.z = -side * (.55 + i * .17); } }
    const halo = k.mesh(new THREE.TorusGeometry(.225, .022, 6, 36), k.mat('#f5dc9c', { emissive: '#e7bd69', emissiveIntensity: 1.7, bumpScale: 0 }), 0, 1.92, 0, an.root); halo.rotation.x = PI / 2;
    const glow = k.ray(-.15, .05, -.4, 6); const dar = k.person('Dario', 2.05, -3.55, { y: 3.06, scale: .72, robe: '#c6b084', mantle: '#a18c98' });
    k.stars(); const shaft = new THREE.SpotLight('#ffe3aa', 12, 14, .34, .9, 1.1); shaft.position.set(-.2, 8, -.45); shaft.target.position.set(-.05, 0, .45); k.add(shaft); k.add(shaft.target);
    const motes = [], r = seed(161); for (let i = 0; i < 42; i++) motes.push((r() - .5) * 2.5, .3 + r() * 5, (r() - .5) * 1.7 - .4);
    const moteGeometry = new THREE.BufferGeometry(); moteGeometry.setAttribute('position', new THREE.Float32BufferAttribute(motes, 3));
    const particles = k.add(new THREE.Points(moteGeometry, new THREE.PointsMaterial({ color: '#ffe4a9', size: .025, transparent: true, opacity: .65, depthWrite: false })));
    k.ambient(t => { particles.rotation.y = Math.sin(t * .12) * .14; particles.position.y = Math.sin(t * .5) * .045; });
    const showAngel=reveal(an.root),showKing=reveal(dar.root),showGlow=reveal(glow);
    const nightColor=new THREE.Color('#c6d2e1'),dawnColor=new THREE.Color('#f4d5ac');
    const support=new Map(),bounds=new THREE.Box3();
    k.animate(t=>{
      const dawn=ease(t,23,32),protection=ease(t,14,20),arrival=ease(t,24,29),prayer=1-dawn*.45;
      da.leftArm.rotation.set(-.72*prayer,0,.55*prayer);da.rightArm.rotation.set(-.72*prayer,0,-.55*prayer);
      da.leftForearm.rotation.x=da.rightForearm.rotation.x=-1.55*prayer;
      da.head.rotation.x=.22-dawn*.48+Math.sin(t*.8)*.012;da.head.rotation.y=dawn*.4;
      showAngel(protection);showGlow(protection);showKing(arrival);
      an.rightArm.rotation.z=.38;an.leftArm.rotation.z=-.24;an.head.rotation.x=.08;
      an.root.position.y=.23+(1-protection)*.11+Math.sin(t*.75)*.008*protection;
      dar.head.rotation.x=.35;dar.rightArm.rotation.x=-1.1*dawn;
      k.light.intensity=1.2+dawn*1.8;k.light.color.copy(nightColor).lerp(dawnColor,dawn);
      k.fill.intensity=1.15+dawn*.65;shaft.intensity=9+protection*10+dawn*4;
      particles.visible=protection>0;particles.material.opacity=.65*protection;
      lions.forEach((lion,index)=>{
        const {body,head,paws,tail,resting}=lion.userData;
        body.position.y=resting?-.19:0;body.scale.set(1.11+Math.sin(t*1.05+index*1.7)*.009,1.03,1.10);head.scale.setScalar(1.055);
        head.rotation.y=Math.sin(t*.32+index*1.7)*.045;tail.rotation.y=Math.sin(t*.5+index*2.1)*.09;
        if(resting)paws.forEach((paw,i)=>{paw.position.y=.015;paw.rotation.x=-PI/2;paw.position.z=i%2?.5:-.36;});
        // Both standing feet and tucked paws have an actual ground contact.
        if(!support.has(lion)){
          lion.position.y=0;lion.updateWorldMatrix(true,true);bounds.makeEmpty();
          for(const paw of paws)bounds.union(new THREE.Box3().setFromObject(paw,true));
          bounds.union(new THREE.Box3().setFromObject(body,true));support.set(lion,-bounds.min.y+.006);
        }
        lion.position.y=support.get(lion);
      });
    });
    lions.forEach(l => k.select(l, 'Leões da cova', 'Animais em repouso', 'Daniel 6:16–23', 'Daniel atribui a Deus a proteção que impede os leões de feri-lo.'));
    const angelEntry = k.selectables.find(entry => entry.object === an.root); if (angelEntry) { angelEntry.reference = 'Daniel 6:22'; angelEntry.summary = 'O anjo representa a proteção testemunhada por Daniel. As asas e a auréola são convenções artísticas, não uma descrição de sua anatomia nas escrituras.'; }
    k.config.views = [{ label: 'Cova inteira', camera: [7.9, 7.1, 11.7], target: [0, 1.25, -.25] }, { label: 'Daniel e os leões', camera: [3.8, 3.6, 7.8], target: [0, 1.05, .2] }, { label: 'A abertura', camera: [6.5, 9, 7.5], target: [0, 1.3, -1] }];
}
