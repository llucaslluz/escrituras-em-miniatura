import * as THREE from 'three';

const RADIUS = 5.84, FRONT = 3.2, BACK = -4.4, WATER_Y = .12;
const clamp = value => Math.max(0, Math.min(1, value));
const ease = (a, b, value) => { const p = clamp((value - a) / (b - a)); return p * p * (3 - 2 * p); };
const heightAt = z => Math.max(.025, ease(BACK, -3.55, z) * (1 - ease(2.35, FRONT, z)));
const waveHeight = (z, t) => heightAt(z) * (.94 + Math.sin(z * 2.1 + t * .45) * .035 + Math.sin(z * 4.7 - t * .28) * .012);
const coastAt = z => Math.min(5.5, Math.sqrt(Math.max(0, RADIUS * RADIUS - z * z)) - .025);

function gridGeometry(across, along, wrap = false) {
  const geometry = new THREE.BufferGeometry(), positions = new Float32Array((across + 1) * (along + 1) * 3), uv = new Float32Array((across + 1) * (along + 1) * 2), indices = [];
  for (let j = 0; j <= along; j++) for (let i = 0; i <= across; i++) { const n = j * (across + 1) + i; uv[n * 2] = i / across; uv[n * 2 + 1] = j / along; }
  for (let j = 0; j < along; j++) for (let i = 0; i < across; i++) { const a = j * (across + 1) + i, b = a + 1, c = a + across + 1, d = c + 1; indices.push(a, c, b, b, c, d); }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.userData.wrap = wrap; return geometry;
}
function refresh(geometry) { geometry.attributes.position.needsUpdate = true; geometry.computeVertexNormals(); geometry.boundingSphere = geometry.boundingBox = null; }

function waveProfile() {
  // A thick, hand-sculpted breaking-wave section. Its rolled lip leans into the
  // passage while the broad back settles into the horizontal turquoise sea.
  const shape = new THREE.Shape();
  shape.moveTo(1.68, .015);
  shape.bezierCurveTo(1.73, .7, 1.88, 1.45, 1.97, 2.04);
  // The underside returns toward the corridor before the round lip curls up:
  // this undercut gives a real breaking-wave silhouette instead of a ramp.
  shape.bezierCurveTo(1.99, 2.30, 1.72, 2.41, 1.43, 2.45);
  shape.bezierCurveTo(1.18, 2.48, 1.08, 2.72, 1.13, 2.95);
  shape.bezierCurveTo(1.19, 3.23, 1.48, 3.36, 1.79, 3.23);
  shape.bezierCurveTo(2.20, 3.05, 2.38, 2.60, 2.53, 2.03);
  shape.bezierCurveTo(2.75, 1.18, 2.88, .47, 3.70, .12);
  shape.bezierCurveTo(4.15, -.005, 4.9, .015, 5.5, .015);
  shape.lineTo(1.68, .015); return shape.getSpacedPoints(64);
}

export function createPartedSea(kit) {
  const root = kit.groupAt(0, 0, 0); root.name = 'Mar Vermelho · ondas de massinha'; root.userData.redSea = true;
  const profile = waveProfile(), surfaceAcross = 24, depthSegments = 64, wallAcross = profile.length - 1;
  const surfaceMaterial = kit.mat('#6ed0ce', { roughness: .32, metalness: 0, transparent: false, opacity: 1, clearcoat: .27, clearcoatRoughness: .3, bumpScale: .008, side: THREE.DoubleSide });
  const wallMaterial = kit.mat('#f1ffff', { vertexColors: true, roughness: .29, metalness: 0, transparent: true, opacity: .89, transmission: 0, clearcoat: .34, clearcoatRoughness: .26, bumpScale: .009, side: THREE.DoubleSide });
  const foamMaterial = kit.mat('#fff5db', { roughness: .58, bumpScale: .006, clearcoat: .06 });
  const foamHighlight = kit.mat('#fffced', { roughness: .5, bumpScale: .004 });
  const dropletMaterial = kit.mat('#a5ece5', { roughness: .21, transparent: true, opacity: .86, clearcoat: .4, bumpScale: 0 });
  const foamGeometry = new THREE.SphereGeometry(1, 12, 8), transform = new THREE.Object3D();
  const branches = [], foams = [], walls = [], surfaces = [];
  const lowerColor = new THREE.Color('#137e92'), upperColor = new THREE.Color('#8cddd4'), outerColor = new THREE.Color('#36aebb'), poolColor = new THREE.Color('#6ed0ce');
  const peakIndex = profile.reduce((peak, point, index) => point.y > profile[peak].y ? index : peak, 0);
  const outermostIndex = profile.reduce((outer, point, index) => point.x > profile[outer].x ? index : outer, 0);
  const profileAtHeight = (height, outer = true) => {
    const start = outer ? peakIndex : 0, end = outer ? profile.length - 1 : peakIndex;
    for (let i = start; i < end; i++) { const a = profile[i], b = profile[i + 1]; if ((height - a.y) * (height - b.y) <= 0 && Math.abs(a.y - b.y) > .00001) { const q = (height - a.y) / (b.y - a.y); return new THREE.Vector2(THREE.MathUtils.lerp(a.x, b.x, q), height); } }
    return profile[peakIndex].clone();
  };
  const deform = (x, y, z, q, t) => {
    const coast = coastAt(z), outerScale = Math.min(1, (coast - 1.68) / (5.5 - 1.68)), fullX = x > 1.68 ? 1.68 + (x - 1.68) * outerScale : x;
    const ridge = (x > 2.03 ? Math.pow(.5 + .5 * Math.sin(z * 4.1 + y * 1.9 - t * .2), 4) * .16 : Math.sin(z * 3.1 + y * 1.5 + t * .2) * .04) * Math.sin(clamp(y / 3.3) * Math.PI);
    let dx = 1.68 * q + (fullX - 1.68) * (.18 + q * .82) + ridge * q;
    dx += Math.sin(z * 2.4 + y * 1.3 + t * .35) * .025 * q * clamp(y);
    return [Math.min(coast, Math.max(1.12 * q, dx)), Math.max(0, y) * waveHeight(z, t) * q];
  };

  // The wall's spatial terms never change. Keep them in Float64 so moving
  // this work out of update does not introduce an extra rounding step.
  const rowZ=new Float64Array(depthSegments+1),rowCoast=new Float64Array(depthSegments+1),rowRipple=new Float64Array(depthSegments+1);
  const rowHeightWeight=new Float64Array(depthSegments+1),rowWaveA=new Float64Array(depthSegments+1),rowWaveB=new Float64Array(depthSegments+1),rowRipplePhase=new Float64Array(depthSegments+1);
  const profileY=new Float64Array(profile.length),profileEnvelope=new Float64Array(profile.length),profileClampY=new Float64Array(profile.length),profileOuter=new Uint8Array(profile.length);
  const wallPointCount=(depthSegments+1)*profile.length,wallX=new Float64Array(wallPointCount),wallRidgePhase=new Float64Array(wallPointCount),wallLateralPhase=new Float64Array(wallPointCount);
  for(let i=0;i<profile.length;i++){const p=profile[i];profileY[i]=Math.max(0,p.y);profileEnvelope[i]=Math.sin(clamp(p.y/3.3)*Math.PI);profileClampY[i]=clamp(p.y);profileOuter[i]=Number(p.x>2.03);}
  for(let j=0;j<=depthSegments;j++){
    const z=BACK+(FRONT-BACK)*j/depthSegments,coast=coastAt(z),outerScale=Math.min(1,(coast-1.68)/(5.5-1.68));
    rowZ[j]=z;rowCoast[j]=coast;rowHeightWeight[j]=heightAt(z);rowWaveA[j]=z*2.1;rowWaveB[j]=z*4.7;rowRipplePhase[j]=z*3;
    for(let i=0;i<profile.length;i++){const p=profile[i],n=j*profile.length+i;wallX[n]=p.x>1.68?1.68+(p.x-1.68)*outerScale:p.x;wallRidgePhase[n]=profileOuter[i]?z*4.1+p.y*1.9:z*3.1+p.y*1.5;wallLateralPhase[n]=z*2.4+p.y*1.3;}
  }

  for (const side of [-1, 1]) {
    const name = side < 0 ? 'left' : 'right', group = new THREE.Group(); group.position.y = WATER_Y; group.name = side < 0 ? 'Águas à esquerda' : 'Águas à direita'; root.add(group);
    const surfaceGeometry = gridGeometry(surfaceAcross, depthSegments); surfaceGeometry.userData.clayWaterSurface = true; surfaceGeometry.userData.plinthRadius = RADIUS;
    const surface = kit.mesh(surfaceGeometry, surfaceMaterial, 0, 0, 0, group); surface.name = 'Mar horizontal recortado'; surface.userData.redSeaSurface = name;
    surfaces.push(surface);
    const wallGeometry = gridGeometry(wallAcross, depthSegments, true), colors = new Float32Array(wallGeometry.attributes.position.count * 3);
    // The submerged underside is deliberately open. A broad coplanar bottom
    // would cut through the rippling pool and create pale sorting/depth patches.
    const wallIndices = [];
    for (let j = 0; j < depthSegments; j++) for (let i = 0; i < outermostIndex; i++) { const a = j * (wallAcross + 1) + i, b = a + 1, c = a + wallAcross + 1, d = c + 1; wallIndices.push(a, c, b, b, c, d); }
    for (const triangle of THREE.ShapeUtils.triangulateShape(profile.slice(0, -1), [])) { wallIndices.push(...triangle.slice().reverse()); wallIndices.push(...triangle.map(index => depthSegments * (wallAcross + 1) + index)); }
    wallGeometry.setIndex(wallIndices);
    for (let j = 0; j <= depthSegments; j++) for (let i = 0; i <= wallAcross; i++) {
      const y = profile[i].y, color = y < .6 ? poolColor.clone().lerp(lowerColor, clamp(y / .6)) : lowerColor.clone().lerp(upperColor, clamp((y - .6) / 2.7)); if (profile[i].x > 2.6 && y > .1) color.lerp(outerColor, .35);
      colors.set(color.toArray(), (j * (wallAcross + 1) + i) * 3);
    }
    wallGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const wall = kit.mesh(wallGeometry, wallMaterial, 0, 0, 0, group); wall.name = side < 0 ? 'Onda esculpida esquerda' : 'Onda esculpida direita'; wall.userData.redSeaWall = name;
    walls.push(wall);
    // Two instanced batches give the crest chunky cream dollops and a quieter
    // collar of foam where the wall meets the dry sandy passage.
    const crestCount = 40, baseCount = 52, crest = new THREE.InstancedMesh(foamGeometry, foamMaterial, crestCount * 2), foot = new THREE.InstancedMesh(foamGeometry, foamHighlight, baseCount);
    for (const foam of [crest, foot]) { foam.castShadow = foam.receiveShadow = true; foam.userData.redSeaFoam = true; group.add(foam); foams.push(foam); }
    const patches = new THREE.InstancedMesh(foamGeometry, foamMaterial, 32); patches.castShadow = patches.receiveShadow = true; patches.userData.redSeaFoam = true; group.add(patches); foams.push(patches);
    const streaks = [];
    for (let i = 0; i < 9; i++) {
      const z = -3.65 + i * .65, points = [];
      const outer = i % 3 !== 0;
      for (let n = 0; n < 5; n++) { const v = n / 4, y = 2.83 - i % 3 * .16 - v * .53, p = profileAtHeight(y, outer); points.push(new THREE.Vector3(side * (p.x + (outer ? .035 : -.035)), p.y, z + Math.sin(v * Math.PI) * .24 + (v - .5) * .35)); }
      const geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 18, .046 + i % 3 * .012, 7, false);
      const mesh = kit.mesh(geometry, i % 3 ? foamMaterial : foamHighlight, 0, 0, 0, group); mesh.userData.redSeaFoam = true; mesh.name = 'Espuma modelada sobre a onda';
      streaks.push({ mesh, rest: new Float32Array(geometry.attributes.position.array) }); foams.push(mesh);
    }
    branches.push({ side, group, surface, wall, crest, foot, patches, streaks, crestCount, baseCount });
  }

  const dropletCount = 36, droplets = new THREE.InstancedMesh(foamGeometry, dropletMaterial, dropletCount); droplets.userData.redSeaDroplets = true; droplets.name = 'Gotinhas suspensas'; root.add(droplets);

  function update(open, time = 0) {
    const q = Number.isFinite(open) ? clamp(open) : 0, t = Number.isFinite(time) ? time : 0; root.userData.redSeaOpen = q;
    const spread = .18 + q * .82;
    wallMaterial.opacity=.89*ease(0,.09,q);
    for(const material of [foamMaterial,foamHighlight]){material.transparent=true;material.opacity=ease(.02,.14,q);material.depthWrite=q>=.14;}
    dropletMaterial.opacity=.86*ease(.2,.4,q);
    const leftWall=branches[0].wall.geometry.attributes.position,rightWall=branches[1].wall.geometry.attributes.position;
    for(let j=0;j<=depthSegments;j++){
      const z=rowZ[j],coast=rowCoast[j];
      const height=rowHeightWeight[j]*(.94+Math.sin(rowWaveA[j]+t*.45)*.035+Math.sin(rowWaveB[j]-t*.28)*.012);
      rowRipple[j]=Math.sin(rowRipplePhase[j]-t*1.65)*.022;
      // Both sides use the same profile; only their horizontal sign differs.
      for(let i=0;i<profile.length;i++){
        const n=j*profile.length+i;
        const ridge=(profileOuter[i]?Math.pow(.5+.5*Math.sin(wallRidgePhase[n]-t*.2),4)*.16:Math.sin(wallRidgePhase[n]+t*.2)*.04)*profileEnvelope[i];
        let x=1.68*q+(wallX[n]-1.68)*(.18+q*.82)+ridge*q;
        x+=Math.sin(wallLateralPhase[n]+t*.35)*.025*q*profileClampY[i];
        x=Math.min(coast,Math.max(1.12*q,x));const y=profileY[i]*height*q;
        leftWall.setXYZ(n,-x,y,z);rightWall.setXYZ(n,x,y,z);
      }
    }
    for (const branch of branches) {
      const { side, surface, wall, crest, foot, patches, streaks, crestCount, baseCount } = branch;
      const surfacePosition = surface.geometry.attributes.position;
      for (let j = 0; j <= depthSegments; j++) {
        const z=rowZ[j],coast=rowCoast[j];
        for (let i = 0; i <= surfaceAcross; i++) {
          const x = side * (1.65 * q + (coast - 1.65 * q) * i / surfaceAcross), n = j * (surfaceAcross + 1) + i;
          surfacePosition.setXYZ(n,x,(rowRipple[j]+Math.sin(x*4+z-t*.8)*.009)*(1-q*.2),z);
        }
      }
      refresh(surface.geometry); refresh(wall.geometry); wall.visible = q > 0;
      for (let i = 0; i < crestCount; i++) {
        const z = BACK + .12 + (FRONT - BACK - .24) * i / (crestCount - 1), height = waveHeight(z, t), x = 1.52 * q + Math.sin(i * 2.3) * .055 * q;
        for (let n = 0; n < 2; n++) {
          transform.position.set(side * (x + n * .13 * q), 3.24 * height * q + .025, z + n * .045);
          transform.scale.set((.16 + i % 3 * .016) * spread, (.09 + n * .018) * Math.max(.1, q), .19 + n * .035); transform.rotation.set(Math.sin(i) * .2, 0, side * (i % 3 - 1) * .22); transform.updateMatrix(); crest.setMatrixAt(i * 2 + n, transform.matrix);
        }
      }
      for (let i = 0; i < baseCount; i++) {
        const z = BACK + .07 + (FRONT - BACK - .14) * i / (baseCount - 1);
        transform.position.set(side * (1.68 * q - .025 + Math.sin(i * 2.4) * .045), .045, z); transform.scale.set((.09 + i % 3 * .013) * spread, .045 + i % 2 * .015, .11); transform.rotation.set(0, Math.sin(i) * .25, 0); transform.updateMatrix(); foot.setMatrixAt(i, transform.matrix);
      }
      for (let i = 0; i < 32; i++) {
        const cluster = Math.floor(i / 4), lobe = i % 4, z = -3.2 + cluster * .84 + Math.sin(lobe * 2.1) * .14, y = 2.48 - cluster % 3 * .34 + Math.cos(lobe * 1.6) * .1, p = profileAtHeight(y, true), [x, yy] = deform(p.x + .035, p.y, z, q, t);
        transform.position.set(side * x, yy, z); transform.scale.set(.052 * spread, (.10 + lobe % 2 * .04) * Math.max(.1, q), .15 + lobe % 3 * .035); transform.rotation.set(0, Math.sin(i) * .13, side * -.28); transform.updateMatrix(); patches.setMatrixAt(i, transform.matrix);
      }
      for (const foam of [crest, foot, patches]) { foam.instanceMatrix.needsUpdate = true; foam.boundingSphere = foam.boundingBox = null; foam.visible = q > .02; }
      for (const { mesh, rest } of streaks) {
        const a = mesh.geometry.attributes.position;
        for (let i = 0; i < a.count; i++) { const z = rest[i * 3 + 2], [x, y] = deform(Math.abs(rest[i * 3]), rest[i * 3 + 1], z, q, t); a.setXYZ(i, side * x, y, z); }
        refresh(mesh.geometry); mesh.visible = q > .02;
      }
    }
    for (let i = 0; i < dropletCount; i++) {
      const side = i < dropletCount / 2 ? -1 : 1, z = -3.65 + (i % 18) / 17 * 5.95, height = waveHeight(z, t), phase = t * .7 + i * 1.7;
      transform.position.set(side * (1.35 + Math.sin(i * 2.8) * .16), WATER_Y + 3.16 * height * q + .15 + Math.sin(phase) * .08, z + Math.cos(phase) * .025);
      const size = .026 + i % 4 * .008; transform.scale.set(size, size * (1.15 + Math.sin(i) * .18), size); transform.rotation.set(0, 0, Math.sin(i) * .2); transform.updateMatrix(); droplets.setMatrixAt(i, transform.matrix);
    }
    droplets.instanceMatrix.needsUpdate = true; droplets.boundingSphere = droplets.boundingBox = null; droplets.visible = q > .2;
    return q;
  }

  function sampleWall(side, z, height, face = 'inner', target = new THREE.Vector3()) {
    const branch = branches[side < 0 ? 0 : 1], p = branch.wall.geometry.attributes.position, longitudinal = clamp((z - BACK) / (FRONT - BACK)) * depthSegments, row = Math.min(depthSegments - 1, Math.floor(longitudinal)), fraction = longitudinal - row;
    const point = index => { const a = row * (wallAcross + 1) + index, b = a + wallAcross + 1; return new THREE.Vector2(THREE.MathUtils.lerp(p.getX(a), p.getX(b), fraction), THREE.MathUtils.lerp(p.getY(a), p.getY(b), fraction)); };
    const wanted = height - WATER_Y, start = face === 'outer' ? peakIndex : 0, end = face === 'outer' ? profile.length - 1 : peakIndex;
    let nearest = point(start), distance = Math.abs(nearest.y - wanted);
    for (let i = start; i < end; i++) {
      const a = point(i), b = point(i + 1);
      if ((wanted - a.y) * (wanted - b.y) <= 0 && Math.abs(a.y - b.y) > .000001) { const u = (wanted - a.y) / (b.y - a.y); nearest.set(THREE.MathUtils.lerp(a.x, b.x, u), wanted); break; }
      if (Math.abs(b.y - wanted) < distance) { distance = Math.abs(b.y - wanted); nearest.copy(b); }
    }
    target.set(nearest.x, nearest.y, Math.max(BACK, Math.min(FRONT, z))); branch.group.updateWorldMatrix(true, false); return target.applyMatrix4(branch.group.matrixWorld);
  }
  const result = { root, left: branches[0].group, right: branches[1].group, walls, surfaces, foams, droplets, update, sampleWall, radius: RADIUS, waterLevel: WATER_Y, passageWidth: 3.3, crestPassageWidth: 2.24 };
  update(0, 0); return result;
}
