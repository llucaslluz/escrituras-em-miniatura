import * as THREE from 'three';
import {
 makeClayTexture,makeClayRoughnessMap,makeWoodNormalMap,makeWoodRoughnessMap,
 clayColor,clayGeometry,clayStoneBlockGeometry,clayPlinth,clayBeamTexture,clipWaterToPlinth
} from './clay-style.js';
import {createClayPerson} from './clay-people.js';
import {createClayAnimal,createClayDove} from './clay-animals.js';
import {applyGroundedGait,gaitEnvelope} from './clay-gait.js';
import {resetActingFrame,applyContextualExpressions} from './acting.js';

const TAU=Math.PI*2;
const surfaceProfiles={
 cloth:{roughness:.84,bumpScale:.014,clearcoat:.02},
 skin:{roughness:.62,bumpScale:.009,clearcoat:.035},
 hair:{roughness:.74,bumpScale:.015,clearcoat:.03},
 stone:{roughness:.87,bumpScale:.022,clearcoat:.015},
 wood:{roughness:.74,bumpScale:.018,clearcoat:.08,clearcoatRoughness:.58},
 terracotta:{roughness:.78,bumpScale:.016,clearcoat:.03},
 leaf:{roughness:.81,bumpScale:.014,clearcoat:.025}
};
export const smooth=(a,b,t)=>{const p=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return p*p*(3-2*p)};
export function random(seed=19){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
// Compatibility alias for source consumers of the first edition.
export const makeFelt=makeClayTexture;

export class Kit{
 constructor(id='scene',options={}){
  this.id=id;this.group=new THREE.Group();this.group.name=id;this.animations=[];this.ambients=[];this.people=[];this.selectables=[];this.labels=[];this.materials=new Map();this.geometryCache=new Map();this.config={camera:[9,7.5,11],target:[0,1,0],ground:'#b7a47a',...options};this.THREE=THREE;
  this.light=new THREE.DirectionalLight('#fff0d5',3.15);this.light.position.set(-3.4,9.2,5.2);this.light.castShadow=true;this.light.shadow.mapSize.set(1024,1024);Object.assign(this.light.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:28});this.light.shadow.bias=-.0008;this.light.shadow.normalBias=.028;this.light.shadow.radius=4;this.group.add(this.light);
  this.fill=new THREE.HemisphereLight('#dcebf5','#967f68',1.6);this.group.add(this.fill);this.background=new THREE.Color('#dfe4dc');
  this.group.userData.artStyle='claymation';

  // Turned dark walnut wood diorama base with carved wood-grain normal & roughness maps.
  this.ground=this.mesh(clayPlinth(6,.5),this.mat('#583b26',{surface:'wood',roughness:.68,bumpScale:.018,clearcoat:.14}),0,-.27,0);this.ground.name='Base de massinha';
  this.mesh(clayPlinth(5.98,.12),this.mat('#3d2718',{surface:'wood',roughness:.74,bumpScale:.016,clearcoat:.10}),0,-.47,0);
  this.top=this.mesh(clayPlinth(5.94,.065),this.mat(this.config.ground,{surface:'stone',roughness:.85,bumpScale:.024}),0,-.0325,0);

  const seed=[...id].reduce((n,c)=>n+c.charCodeAt(0)*31,44),r=random(seed);
  const transform=new THREE.Object3D();

  // 1. Subtle organic clay ground undulations around the outer/mid stage (preserving y=0 walking center).
  const moundCount=18,mounds=new THREE.InstancedMesh(new THREE.SphereGeometry(1,14,8),this.mat(this.config.ground,{surface:'stone',roughness:.87,bumpScale:.024}),moundCount);
  const moundTones=[clayColor(this.config.ground),clayColor(this.config.ground).offsetHSL(0,-.02,.03),clayColor(this.config.ground).offsetHSL(0,.01,-.03)];
  for(let i=0;i<moundCount;i++){
   const a=i/moundCount*TAU+r()*.22,rad=4.05+r()*1.18;
   transform.position.set(Math.cos(a)*rad,-.006,Math.sin(a)*rad);
   transform.rotation.set(0,a+r()*.5,0);
   transform.scale.set(.65+r()*.5,.018+r()*.014,.52+r()*.42);
   transform.updateMatrix();mounds.setMatrixAt(i,transform.matrix);mounds.setColorAt(i,moundTones[i%3]);
  }
  mounds.receiveShadow=true;mounds.castShadow=false;mounds.name='Ondulações suaves do terreno';this.add(mounds);

  // 2. Natural multi-scale stone clusters (anchor rock + medium stones + fine pebbles) + scattered ground grain.
  const clusterCount=14,perCluster=6,scatterCount=96,totalStones=clusterCount*perCluster+scatterCount;
  const pebbles=new THREE.InstancedMesh(clayGeometry(new THREE.DodecahedronGeometry(1,1),this.geometryCache),this.mat('#c2b49d',{surface:'stone',roughness:.89}),totalStones);
  const stonePalette=['#9d9483','#b8a892','#878377','#cfc1ab','#a89b86'].map(c=>clayColor(c));
  const clusterCenters=[];
  let idx=0;
  for(let c=0;c<clusterCount;c++){
   const ca=c/clusterCount*TAU+r()*.28,cr=4.35+r()*1.22;
   const cx=Math.cos(ca)*cr,cz=Math.sin(ca)*cr;
   clusterCenters.push([cx,cz,ca]);
   for(let m=0;m<perCluster;m++){
    const spread=m===0?0:.09+r()*.24,ma=r()*TAU;
    const px=cx+Math.cos(ma)*spread,pz=cz+Math.sin(ma)*spread;
    const size=m===0?.115+r()*.055:m<3?.068+r()*.038:.034+r()*.026;
    transform.position.set(px,size*.22,pz);
    transform.rotation.set(r()*.4,r()*TAU,r()*.4);
    transform.scale.set(size*(1+r()*.28),size*(.48+r()*.22),size*(.78+r()*.34));
    transform.updateMatrix();pebbles.setMatrixAt(idx,transform.matrix);pebbles.setColorAt(idx,stonePalette[(c+m)%stonePalette.length]);
    idx++;
   }
  }
  for(let i=0;i<scatterCount;i++){
   const a=r()*TAU,rad=1.25+Math.sqrt(r())*4.42,size=.018+r()*.036;
   transform.position.set(Math.cos(a)*rad,.007,Math.sin(a)*rad);
   transform.rotation.set(r()*.3,a,r()*.3);
   transform.scale.set(size*(1+r()*.3),size*.30,size*(.7+r()*.4));
   transform.updateMatrix();pebbles.setMatrixAt(idx,transform.matrix);pebbles.setColorAt(idx,stonePalette[i%stonePalette.length]);
   idx++;
  }
  pebbles.castShadow=pebbles.receiveShadow=true;pebbles.name='Grãos e pedrinhas de argila';this.add(pebbles);

  // 3. Sculpted grass tufts, moss cushions and tiny wildflowers anchored around the stone clusters.
  const grassBladesPerCluster=7,mossCount=clusterCount*2+24,totalFlora=clusterCount*grassBladesPerCluster+mossCount;
  const flora=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,7),this.mat('#7a9058',{surface:'leaf',roughness:.84}),totalFlora);
  const leafPalette=['#5d7644','#728a52','#869b61','#667d4c','#96a76d','#d8c377'].map(c=>clayColor(c));
  let fIdx=0;
  for(const [cx,cz,ca] of clusterCenters){
   const tx=cx+Math.cos(ca+.5)*.14,tz=cz+Math.sin(ca+.5)*.14;
   for(let b=0;b<grassBladesPerCluster;b++){
    const ba=b/grassBladesPerCluster*TAU+r()*.25,h=.065+r()*.055,tilt=.32+r()*.28;
    transform.position.set(tx+Math.cos(ba)*.045,h*.55,tz+Math.sin(ba)*.045);
    transform.rotation.set(Math.sin(ba)*tilt,ba,-Math.cos(ba)*tilt);
    transform.scale.set(.022,h,.034);
    transform.updateMatrix();flora.setMatrixAt(fIdx,transform.matrix);flora.setColorAt(fIdx,leafPalette[b%5]);
    fIdx++;
   }
  }
  for(let i=0;i<mossCount;i++){
   const fromCluster=i<clusterCount*2;
   const [cx,cz]=fromCluster?clusterCenters[Math.floor(i/2)]:[0,0];
   const a=r()*TAU,rad=fromCluster?.12+r()*.22:3.8+r()*1.85;
   const px=fromCluster?cx+Math.cos(a)*rad:Math.cos(a)*rad;
   const pz=fromCluster?cz+Math.sin(a)*rad:Math.sin(a)*rad;
   const s=.042+r()*.048;
   transform.position.set(px,.014,pz);
   transform.rotation.set(0,a,0);
   transform.scale.set(s*1.35,s*.36,s*1.05);
   transform.updateMatrix();flora.setMatrixAt(fIdx,transform.matrix);flora.setColorAt(fIdx,leafPalette[i%leafPalette.length]);
   fIdx++;
  }
  flora.castShadow=flora.receiveShadow=true;flora.name='Tufos e florzinhas de argila';this.add(flora);
 }

 mat(color,options={}){
  const key=color+JSON.stringify(options);
  if(!this.materials.has(key)){
   const{surface,...explicit}=options;
   const woodDefaults=surface==='wood'?{
    normalMap:makeWoodNormalMap(),
    normalScale:new THREE.Vector2(.36,.20),
    roughnessMap:makeWoodRoughnessMap()
   }:{
    roughnessMap:makeClayRoughnessMap()
   };
   const material=new THREE.MeshPhysicalMaterial({
    color:clayColor(color),
    roughness:.74,
    metalness:0,
    bumpMap:makeClayTexture(),
    bumpScale:.015,
    clearcoat:.045,
    clearcoatRoughness:.78,
    ...woodDefaults,
    ...surfaceProfiles[surface],
    ...explicit
   });
   material.userData.clayMaterial=true;
   if(surface)material.userData.claySurface=surface;
   this.materials.set(key,material);
  }
  return this.materials.get(key);
 }

 add(o){this.group.add(o);return o}
 mesh(g,m,x=0,y=0,z=0,parent=this.group){const o=new THREE.Mesh(clayGeometry(g,this.geometryCache),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 box(w,h,d,c,x=0,y=0,z=0){return this.mesh(new THREE.BoxGeometry(w,h,d,1,1,1),this.mat(c),x,y,z)}
 sphere(r,c,x=0,y=0,z=0){return this.mesh(new THREE.SphereGeometry(r,16,12),this.mat(c),x,y,z)}
 cylinder(r,h,c,x=0,y=0,z=0){return this.mesh(new THREE.CylinderGeometry(r*.96,r,h,32),this.mat(c),x,y,z)}
 groupAt(x=0,y=0,z=0){const o=new THREE.Group();o.position.set(x,y,z);return this.add(o)}
 animate(f){this.animations.push(f);return f}
 ambient(f){this.ambients.push(f);return f}
 select(object,name,role='',reference='',summary=''){object.userData.selectable=name;this.selectables.push({object,name,role,reference,summary});return object}
 label(object,text){if(!this.labels.some(l=>l.object===object&&l.text===text))this.labels.push({object,text});return object}
 person(name,x,z,o={}){return createClayPerson(this,name,x,z,o)}
 walk(rig,from,to,start,end){
  const distance=Math.hypot(to[0]-from[0],to[1]-from[1]);
  this.animate(t=>{
   const u=THREE.MathUtils.clamp((t-start)/Math.max(end-start,.001),0,1),p=u*u*(3-2*u);
   rig.root.position.x=THREE.MathUtils.lerp(from[0],to[0],p);rig.root.position.z=THREE.MathUtils.lerp(from[1],to[1],p);
   if(distance>0)rig.root.rotation.y=Math.atan2(to[0]-from[0],to[1]-from[1]);
   applyGroundedGait(rig,distance*p,{envelope:distance>0?gaitEnvelope(u):0});
  });
 }

 rock(x,z,s=1){
  const toneIndex=Math.abs(Math.round(x*197+z*311))%3;
  const rockColor=['#8b8878','#989282','#7e7d70'][toneIndex];
  const r=this.mesh(new THREE.DodecahedronGeometry(.5,1),this.mat(rockColor,{surface:'stone'}),x,.22*s,z);
  r.scale.set(s,s*.65,s*.8);r.rotation.set(.1,x,.1);r.updateMatrixWorld(true);
  if(s===0)return r;
  const before=new THREE.Box3().setFromObject(r,true),variant=Math.abs(Math.round(x*317+z*193))%3;
  r.scale.x*=[.90,.96,1][variant];r.scale.z*=[1,.90,.94][variant];r.rotation.x+=[-.035,.025,0][variant];r.rotation.z+=[.02,-.025,0][variant];r.updateMatrixWorld(true);
  const after=new THREE.Box3().setFromObject(r,true),ratio=Math.min(1,(x-before.min.x)/(x-after.min.x),(before.max.x-x)/(after.max.x-x),(z-before.min.z)/(z-after.min.z),(before.max.z-z)/(after.max.z-z),(before.max.y-before.min.y)/(after.max.y-after.min.y));
  r.scale.multiplyScalar(ratio);r.updateMatrixWorld(true);
  const fitted=new THREE.Box3().setFromObject(r,true);r.position.y+=before.min.y-fitted.min.y;r.userData.clayRockVariant=variant;
  if(s>=.40){
   const mossA=this.mesh(new THREE.SphereGeometry(.095,8,6),this.mat('#687d4b',{surface:'leaf'}),.24,-.22,.22,r);mossA.scale.set(1.25,.42,1.05);mossA.name='Musgo da rocha';
   const mossB=this.mesh(new THREE.SphereGeometry(.075,8,6),this.mat('#7f905b',{surface:'leaf'}),-.22,-.24,-.18,r);mossB.scale.set(1.12,.38,1);mossB.name='Musgo lateral';
  }
  return r;
 }

 tree(x,z,s=1,kind='olive'){
  const g=this.groupAt(x,0,z);g.scale.setScalar(s);const mesh=(geo,col,px,py,pz,p=g,surface='leaf')=>this.mesh(geo,this.mat(col,{surface}),px,py,pz,p);
  mesh(new THREE.CylinderGeometry(.13,.24,1.6,9),'#73583c',0,.8,0,g,'wood').rotation.z=.09;
  for(let j=0;j<3;j++){const a=j/3*TAU+.25,root=mesh(new THREE.CylinderGeometry(.042,.085,.34,6),'#654d34',Math.cos(a)*.17,.11,Math.sin(a)*.17,g,'wood');root.rotation.set(Math.sin(a)*.52,a,-Math.cos(a)*.52);root.name='Raiz esculpida';}
  mesh(new THREE.SphereGeometry(.055,8,6),'#5e472f',.11,.72,.08,g,'wood').scale.set(1.1,.8,.6);
  for(let j=0;j<3;j++){const b=mesh(new THREE.CylinderGeometry(.065,.12,.92,7),'#73583c',(j-1)*.22,1.48,0,g,'wood');b.rotation.z=(j-1)*-.6;}
  const canopy=new THREE.Group();canopy.position.y=1.9;g.add(canopy);const r=random(Math.round((x+10)*212+(z+12)*17));
  if(kind==='palm'){
   for(let j=0;j<9;j++){const leaf=mesh(new THREE.SphereGeometry(.48,12,6),j%2?'#637d49':'#789158',Math.sin(j/9*TAU)*.6,.1,Math.cos(j/9*TAU)*.6,canopy);leaf.scale.set(.32,.12,2.1);leaf.rotation.y=j/9*TAU;leaf.rotation.x=.32;}
   for(let c=0;c<3;c++)mesh(new THREE.SphereGeometry(.085,8,6),'#6b4b2e',Math.cos(c*2.1)*.13,-.05,Math.sin(c*2.1)*.13,canopy,'wood');
  }else{
   for(let j=0;j<38;j++){const a=r()*TAU,rr=Math.sqrt(r())*.9;const leaf=mesh(new THREE.SphereGeometry(.24,10,8),j%3===0?'#657948':j%3===1?'#7d8f58':'#98a66f',Math.cos(a)*rr,(r()-.5)*.65,Math.sin(a)*rr,canopy);leaf.scale.set(1.25,.58,.82);leaf.rotation.set(r(),r()*TAU,r());}
   for(let j=0;j<18;j++){const a=r()*TAU;const leaf=mesh(new THREE.SphereGeometry(.16,8,6),'#aeb97e',Math.cos(a)*.9,(r()-.5)*.6,Math.sin(a)*.9,canopy);leaf.scale.set(.32,.13,1.1);leaf.rotation.y=-a;}
  }
  if(kind!=='palm'){const variant=Math.abs(Math.round(x*317+z*193))%3;canopy.scale.set(...[[.96,.76,.96],[.79,1,.79],[1,.88,.72]][variant]);g.userData.clayCanopyVariant=variant;}
  this.ambient(t=>{canopy.rotation.z=Math.sin(t*1.1+x)*.018;canopy.rotation.x=Math.cos(t*.7+z)*.012});return g;
 }

 water(width,length,x=0,z=0,o={}){
  const g=this.groupAt(x,o.y??.045,z),geo=new THREE.PlaneGeometry(width,length,28,64);geo.rotateX(-Math.PI/2);const arr=geo.attributes.position,base=new Float32Array(arr.array);
  for(let i=0;i<arr.count;i++){if(o.river)base[i*3]+=Math.sin(base[i*3+2]*.58)*.52;}arr.array.set(base);
  clipWaterToPlinth(geo,x,z);
  const m=this.mat(o.color||'#46a6a8',{
   transparent:true,
   opacity:.86,
   transmission:.34,
   thickness:.62,
   ior:1.33,
   metalness:.06,
   roughness:.18,
   clearcoat:.56,
   clearcoatRoughness:.16,
   specularIntensity:.88,
   attenuationColor:new THREE.Color('#0f6273'),
   attenuationDistance:1.35,
   bumpScale:.02,
   side:THREE.DoubleSide
  });
  this.mesh(geo,m,0,0,0,g);

  const r=random(159);
  if(o.river){
   for(let i=0;i<32;i++){
    const rz=(r()-.5)*length,rx=(r()-.5)*width+Math.sin(rz*.58)*.52;
    const wx=x+rx,wz=z+rz;
    if(Math.hypot(wx,wz)<=5.52){
     const stone=this.rock(wx,wz,.12+r()*.19);stone.position.y=-.055;
    }
   }
  }

  // Sculpted white clay foam streaks & ripples.
  const ripples=[];
  for(let i=0;i<30;i++){
   const rz=(r()-.5)*length,rx=(r()-.5)*width*.86,radius=.17+r()*.18;
   const wave=this.mesh(new THREE.TorusGeometry(radius,.011,4,22,Math.PI*1.35),this.mat('#f4f7ec',{transparent:true,opacity:.64,roughness:.52,clearcoat:.18}),rx,.024,rz,g);
   wave.rotation.x=-Math.PI/2;wave.scale.set(1,.42,1);wave.userData.clayWaterRipple=true;
   ripples.push({wave,x:rx,z:rz,radius:radius+.012});
  }

  // Sculpted shoreline foam beads & seashells along banks when water meets dry land on the disc.
  const foamDots=[],foamMat=this.mat('#fbf6e8',{roughness:.58,clearcoat:.08});
  if(width<9.6){
   for(const side of[-1,1])for(let i=0;i<18;i++){
    const fz=-length*.46+i/17*length*.92,fx=side*(width*.47)+(o.river?Math.sin(fz*.58)*.52:0)+Math.sin(i*2.1)*.035;
    if(Math.hypot(x+fx,z+fz)<=5.56){
     const bead=this.mesh(new THREE.SphereGeometry(.055+(i%3)*.015,8,6),foamMat,fx,.016,fz,g);
     bead.scale.set(1.1,.38,1.35);foamDots.push(bead);
     if(i%5===2&&Math.hypot(x+fx+side*.16,z+fz)<=5.5){
      const shell=this.mesh(new THREE.SphereGeometry(.055,10,7,0,TAU,0,Math.PI*.55),this.mat(i%2?'#efd9b8':'#e2bfa3',{roughness:.7}),fx+side*.16,-.01,fz,g);
      shell.scale.set(1.15,.46,.9);shell.rotation.y=i*1.3;shell.name='Concha na margem';
     }
    }
   }
  }

  const fit=()=>{
   clipWaterToPlinth(geo,g.position.x,g.position.z);geo.computeVertexNormals();
   for(const w of ripples)w.wave.visible=Math.hypot(g.position.x+w.wave.position.x,g.position.z+w.wave.position.z)+w.radius<=5.84&&Math.abs(w.wave.position.z)+w.radius<length/2;
   for(const b of foamDots)b.visible=Math.hypot(g.position.x+b.position.x,g.position.z+b.position.z)<=5.68;
  };
  g.userData.fitWaterToPlinth=fit;fit();
  this.ambient(t=>{
   for(let i=0;i<arr.count;i++){const xx=base[i*3],zz=base[i*3+2];arr.setY(i,Math.sin(zz*3-t*2.1)*.028+Math.sin(xx*5+zz-t*1.3)*.014);}
   for(const w of ripples){
    w.wave.position.z=((w.z+length/2+t*.25)%length+length)%length-length/2;
    w.wave.position.x=w.x+(o.river?Math.sin(w.wave.position.z*.58)*.52:0);
    w.wave.position.y=.038+Math.sin(t*2+w.x)*.01;
   }
   fit();
  });
  return g;
 }

 fire(x,y,z,s=1){
  const g=this.groupAt(x,y,z);g.scale.setScalar(s);const flames=[];
  for(let j=0;j<6;j++){
   const f=this.mesh(new THREE.SphereGeometry(.16,12,8),this.mat(j%2?'#f5b94c':'#de7438',{emissive:'#c26320',emissiveIntensity:.7,transparent:true,opacity:.84}),Math.sin(j)*.18,.22,Math.cos(j)*.13,g);
   f.scale.set(.65,2,.65);flames.push(f);
  }
  const light=new THREE.PointLight('#ffc26b',2.5,5);light.position.y=.5;g.add(light);
  this.ambient(t=>{flames.forEach((f,i)=>{f.scale.y=1.4+Math.sin(t*7+i)*.6;f.rotation.z=Math.sin(t*4+i)*.2});light.intensity=2.2+Math.sin(t*8)*.3});
  return g;
 }

 // Volumetric asymmetric stop-motion cumulus cloud (flat shaded underside + multi-depth puffy domes).
 cloud(x,y,z,s=1){
  const g=this.groupAt(x,y,z);g.scale.setScalar(s);g.name='Nuvem volumétrica de massinha';
  const variant=Math.abs(Math.round(x*131+z*73))%3;
  const topCol='#f3efe3',midCol='#e6e1d3',baseCol='#cfc8b8';
  const base=this.mesh(new THREE.SphereGeometry(.62,16,12),this.mat(baseCol,{roughness:.88,bumpScale:.016}),0,-.16,0,g);
  base.scale.set(1.85,.34,1.05);
  const puffs=variant===0?[
   [-.78,-.01,.06,.48,midCol],[-.34,.18,-.08,.62,topCol],[.22,.26,.05,.68,topCol],[.74,.05,-.04,.50,midCol],
   [-.52,-.04,.30,.38,midCol],[.06,.04,.34,.44,topCol],[.52,-.05,.26,.36,baseCol],[-.08,.06,-.32,.45,midCol],[.98,-.09,.08,.33,baseCol]
  ]:variant===1?[
   [-.86,-.05,-.04,.44,baseCol],[-.42,.22,.06,.65,topCol],[.14,.14,-.09,.56,topCol],[.64,.20,.04,.58,topCol],
   [1.02,-.04,-.02,.38,midCol],[-.16,-.02,.32,.43,midCol],[.42,-.03,.30,.39,midCol],[.18,.05,-.32,.42,baseCol]
  ]:[
   [-.92,-.06,.04,.40,baseCol],[-.48,.11,-.05,.54,midCol],[.02,.28,.02,.70,topCol],[.56,.12,.08,.54,topCol],
   [.96,-.05,-.04,.40,baseCol],[-.28,-.03,.31,.40,midCol],[.32,.01,.33,.42,topCol],[-.12,.08,-.31,.46,midCol]
  ];
  for(const [px,py,pz,rad,col] of puffs){
   const p=this.mesh(new THREE.SphereGeometry(rad,16,12),this.mat(col,{roughness:.85,bumpScale:.016,clearcoat:.02}),px,py,pz,g);
   p.scale.set(1.08,.86,.96);
  }
  this.ambient(t=>{g.position.x=x+Math.sin(t*.15+variant)*.15});
  return g;
 }

 // Soft volumetric god-rays with suspended golden dust motes.
 ray(x,y,z,h=5){
  const g=this.groupAt(x,y,z),material=new THREE.MeshBasicMaterial({color:'#ffe8b8',alphaMap:clayBeamTexture(),transparent:true,opacity:.095,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  for(let i=0;i<3;i++){
   const geometry=new THREE.PlaneGeometry(3.8,h),a=geometry.attributes.position;
   for(let j=0;j<a.count;j++){const v=(a.getY(j)+h/2)/h;a.setX(j,a.getX(j)*(1-v*.55));}
   const sheet=this.mesh(geometry,material,0,h/2,0,g);sheet.rotation.y=i*Math.PI/3;sheet.castShadow=sheet.receiveShadow=false;sheet.renderOrder=2;
  }
  const r=random(Math.abs(Math.round((x+7)*137+(z+9)*251))+31),moteCount=34,moteArr=new Float32Array(moteCount*3);
  for(let i=0;i<moteCount;i++){
   const my=.25+r()*(h-.45),cone=(1-my/h*.52)*1.15,ma=r()*TAU,mr=Math.sqrt(r())*cone;
   moteArr.set([Math.cos(ma)*mr,my,Math.sin(ma)*mr],i*3);
  }
  const moteGeo=new THREE.BufferGeometry();moteGeo.setAttribute('position',new THREE.BufferAttribute(moteArr,3));
  const motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:'#fff3c8',size:.036,transparent:true,opacity:.66,depthWrite:false}));
  motes.name='Poeira dourada na luz';g.add(motes);
  this.ambient(t=>{motes.rotation.y=Math.sin(t*.18+x)*.16;motes.position.y=Math.sin(t*.55+z)*.04;});
  g.userData.clayLightShaft=true;return g;
 }

 stars(){
  const r=random(88),a=[];
  for(let i=0;i<160;i++){const theta=r()*TAU,phi=r()*Math.PI*.45;const rr=15;a.push(Math.sin(phi)*Math.cos(theta)*rr,Math.cos(phi)*rr,Math.sin(phi)*Math.sin(theta)*rr);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));
  return this.add(new THREE.Points(geo,new THREE.PointsMaterial({color:'#fff1c8',size:.06,transparent:true,opacity:.9})));
 }

 lamp(x,y,z){
  const g=this.groupAt(x,y,z);
  const body=this.mesh(new THREE.SphereGeometry(.12,12,8),this.mat('#b37b4c',{surface:'terracotta'}),0,.08,0,g);body.scale.set(1.15,.5,.95);
  const rim=this.mesh(new THREE.TorusGeometry(.055,.012,6,14),this.mat('#946038',{surface:'terracotta'}),0,.135,0,g);rim.rotation.x=Math.PI/2;
  const spout=this.mesh(new THREE.CylinderGeometry(.022,.034,.09,8),this.mat('#b37b4c',{surface:'terracotta'}),.11,.10,0,g);spout.rotation.z=-1.15;
  const handle=this.mesh(new THREE.TorusGeometry(.042,.01,6,12,Math.PI*1.3),this.mat('#946038',{surface:'terracotta'}),-.11,.10,0,g);handle.rotation.z=Math.PI/2;
  this.mesh(new THREE.CylinderGeometry(.044,.044,.008,10),this.mat('#e8a948',{emissive:'#c97a22',emissiveIntensity:.45}),0,.132,0,g);
  const f=this.fire(x,y+.12,z,.17);g.userData.flame=f;return g;
 }

 animal(kind,x,z,s=1){return createClayAnimal(this,kind,x,z,s)}
 dove(x,y,z){return createClayDove(this,x,y,z)}

 boat(x,z,s=1){
  const g=this.groupAt(x,.22,z);g.scale.setScalar(s);
  for(let i=0;i<7;i++){
   const plank=this.mesh(new THREE.BoxGeometry(1.5+Math.sin(i/6*Math.PI)*.6,.13,.23),this.mat(i%2?'#9d6f45':'#885b36',{surface:'wood'}),0,-.12,i*.22-.66,g);
   plank.rotation.x=(i-3)*.03;
  }
  for(let r=-2;r<=2;r++)this.mesh(new THREE.BoxGeometry(1.48,.055,.07),this.mat('#6f492a',{surface:'wood'}),0,-.03,r*.28,g);
  for(const side of[-1,1]){
   const sideMesh=this.mesh(new THREE.BoxGeometry(.13,.55,1.7),this.mat('#946840',{surface:'wood'}),side*.86,.09,0,g);sideMesh.rotation.z=-side*.2;
   const gunwale=this.mesh(new THREE.BoxGeometry(.08,.07,1.76),this.mat('#6d4829',{surface:'wood'}),side*.92,.37,0,g);gunwale.rotation.z=-side*.2;gunwale.name='Borda superior do barco';
   const oar=new THREE.Group();oar.name='Remo esculpido';oar.position.set(side*.96,.28,.08);oar.rotation.set(.18,side*.12,side*.92);
   this.mesh(new THREE.CylinderGeometry(.018,.02,.96,8),this.mat('#b58958',{surface:'wood'}),0,0,0,oar);
   this.mesh(new THREE.BoxGeometry(.09,.28,.022),this.mat('#845a33',{surface:'wood'}),0,-.46,0,oar);
   g.add(oar);
  }
  for(const zz of[-.5,.45])this.mesh(new THREE.BoxGeometry(1.6,.1,.22),this.mat('#b58b5c',{surface:'wood'}),0,.24,zz,g);
  for(const end of[-1,1]){
   const post=this.mesh(new THREE.CylinderGeometry(.045,.065,.56,8),this.mat('#664325',{surface:'wood'}),0,.24,end*.84,g);
   post.rotation.x=end*.22;post.name='Proa e popa esculpidas';
  }
  this.ambient(t=>{g.rotation.z=Math.sin(t*1.8)*.025;g.rotation.x=Math.sin(t*1.2)*.02});
  return g;
 }

 flag(x,y,z,c='#d8c6a1'){
  const g=this.groupAt(x,y,z);
  this.mesh(new THREE.CylinderGeometry(.026,.038,2.6,8),this.mat('#704f2e',{surface:'wood'}),0,1.3,0,g);
  this.mesh(new THREE.SphereGeometry(.055,10,8),this.mat('#c9a65b',{metalness:.45,roughness:.38}),0,2.63,0,g);
  if(Math.abs(y)<.05)this.stonePile(0,0,0,.28,6,g);
  const geo=new THREE.PlaneGeometry(1.2,.65,12,5),m=this.mat(c,{surface:'cloth',side:THREE.DoubleSide});
  this.mesh(geo,m,.61,2,0,g);
  const p=geo.attributes.position,base=new Float32Array(p.array);
  this.ambient(t=>{for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(base[i*3]*5-t*3)*.08*(base[i*3]+.6));p.needsUpdate=true;geo.computeVertexNormals()});
  return g;
 }

 table(x,y,z,w=4,d=1.5){
  const g=this.groupAt(x,y,z);
  for(let i=0;i<6;i++)this.mesh(new THREE.BoxGeometry(w,.15,d/6-.012),this.mat(i%2?'#8c6844':'#9f7a50',{surface:'wood'}),0,.85,-d/2+(i+.5)*d/6,g);
  for(const a of[-1,1])for(const b of[-1,1])this.mesh(new THREE.BoxGeometry(.15,.83,.15),this.mat('#724f31',{surface:'wood'}),a*(w/2-.25),.4,b*(d/2-.18),g);
  this.mesh(new THREE.BoxGeometry(w-.42,.08,.11),this.mat('#66452a',{surface:'wood'}),0,.24,0,g).name='Travessa da mesa';
  for(const a of[-1,1])this.mesh(new THREE.BoxGeometry(.1,.08,d-.36),this.mat('#66452a',{surface:'wood'}),a*(w/2-.25),.24,0,g);
  return g;
 }

 vase(x,y,z){
  const g=this.groupAt(x,y,z);
  const pts=[[.12,0],[.23,.1],[.25,.28],[.15,.47],[.12,.55],[.15,.58]].map(([a,b])=>new THREE.Vector2(a,b));
  this.mesh(new THREE.LatheGeometry(pts,20),this.mat('#b97f59',{surface:'terracotta'}),0,0,0,g);
  this.mesh(new THREE.CylinderGeometry(.11,.11,.009,20),this.mat('#4c3e2d'),0,.56,0,g);
  for(const side of[-1,1]){
   const h=this.mesh(new THREE.TorusGeometry(.082,.016,7,14,Math.PI*1.15),this.mat('#9f6845',{surface:'terracotta'}),side*.16,.41,0,g);
   h.rotation.z=side*-Math.PI/2;h.name='Alça da ânfora';
  }
  const band=this.mesh(new THREE.TorusGeometry(.238,.011,6,20),this.mat('#8c5535',{surface:'terracotta'}),0,.26,0,g);band.rotation.x=Math.PI/2;
  return g;
 }

 basket(x,y,z){
  const g=this.groupAt(x,y,z);
  this.mesh(new THREE.CylinderGeometry(.25,.19,.28,16,1,true),this.mat('#b18c56',{side:THREE.DoubleSide,surface:'cloth'}),0,.14,0,g);
  this.mesh(new THREE.CylinderGeometry(.185,.185,.025,16),this.mat('#9b7845',{surface:'cloth'}),0,.015,0,g);
  for(let i=0;i<5;i++){const ring=this.mesh(new THREE.TorusGeometry(.2+i*.011,.012,4,24),this.mat('#d2b47a',{surface:'cloth'}),0,.04+i*.05,0,g);ring.rotation.x=Math.PI/2;}
  for(const side of[-1,1]){const h=this.mesh(new THREE.TorusGeometry(.052,.012,6,12,Math.PI),this.mat('#8f6d3d',{surface:'cloth'}),side*.24,.28,0,g);h.rotation.y=Math.PI/2;h.name='Alça do cesto';}
  return g;
 }

 book(x,y,z){
  const g=this.groupAt(x,y,z);
  this.mesh(new THREE.BoxGeometry(.54,.08,.39),this.mat('#dcd1ad'),0,.06,0,g);
  this.mesh(new THREE.BoxGeometry(.58,.025,.42),this.mat('#614c3c',{surface:'cloth'}),0,.01,0,g);
  this.mesh(new THREE.BoxGeometry(.58,.025,.42),this.mat('#614c3c',{surface:'cloth'}),0,.11,0,g);
  const spine=this.mesh(new THREE.CylinderGeometry(.024,.024,.42,10),this.mat('#4f3d30',{surface:'cloth'}),-.285,.06,0,g);spine.rotation.x=Math.PI/2;spine.name='Lombada esculpida';
  for(const zz of[-.11,.11])this.mesh(new THREE.BoxGeometry(.045,.095,.032),this.mat('#c8a258',{metalness:.45,roughness:.45}),.275,.06,zz,g).name='Fecho do livro';
  return g;
 }

 plates(x,y,z){
  const g=this.groupAt(x,y,z);
  for(let i=0;i<5;i++)this.mesh(new THREE.BoxGeometry(.52,.022,.36),this.mat('#c9a25b',{metalness:.55,roughness:.48}),0,.02+i*.027,0,g);
  for(let j=0;j<3;j++){const ring=this.mesh(new THREE.TorusGeometry(.06,.013,6,16),this.mat('#ddbd72',{metalness:.6}),-.22,.08,j*.12-.12,g);ring.rotation.x=Math.PI/2;ring.name='Argola das placas';}
  for(let k=0;k<4;k++){const line=this.mesh(new THREE.BoxGeometry(.34,.004,.012),this.mat('#a8813b',{metalness:.5,roughness:.45}),.03,.141,-.09+k*.06,g);line.name='Gravação nas placas';}
  return g;
 }

 scroll(x,y,z){
  const g=this.groupAt(x,y,z);
  this.mesh(new THREE.BoxGeometry(.38,.016,.28),this.mat('#e7dcc0'),0,.03,0,g);
  for(const s of[-1,1]){
   const roll=this.mesh(new THREE.CylinderGeometry(.034,.034,.32,12),this.mat('#dfd2b2'),s*.19,.036,0,g);roll.rotation.x=Math.PI/2;
   const knob=this.mesh(new THREE.CylinderGeometry(.016,.016,.38,8),this.mat('#7a5638',{surface:'wood'}),s*.19,.036,0,g);knob.rotation.x=Math.PI/2;
  }
  return g;
 }

 liahona(x,y,z){
  const g=this.groupAt(x,y,z);
  this.mesh(new THREE.SphereGeometry(.18,16,12),this.mat('#d6af62',{metalness:.55,roughness:.38}),0,.18,0,g);
  const band=this.mesh(new THREE.TorusGeometry(.182,.016,8,20),this.mat('#b5893d',{metalness:.6,roughness:.36}),0,.18,0,g);band.rotation.x=Math.PI/2;
  for(const s of[-1,1]){const spindle=this.mesh(new THREE.CylinderGeometry(.009,.009,.22,8),this.mat('#f1d48b',{metalness:.65}),s*.045,.20,0,g);spindle.rotation.z=Math.PI/2+s*.28;}
  return g;
 }

 // Pile of irregular stones + moss cushions wedging crosses, posts, standards and altars.
 stonePile(x,y,z,radius=.42,count=9,parent=this.group){
  const g=new THREE.Group();g.position.set(x,y,z);g.name='Pedras empilhadas de apoio';parent.add(g);
  const r=random(Math.abs(Math.round(x*173+z*293))+count*17),pose=new THREE.Object3D();
  const blockGeo=clayStoneBlockGeometry(0,this.geometryCache);
  const stones=new THREE.InstancedMesh(blockGeo,this.mat('#9b9382',{surface:'stone',roughness:.89}),count);
  const cols=['#8c8576','#a89e8b','#7d786b','#bab09b'].map(c=>clayColor(c));
  for(let i=0;i<count;i++){
   const ring=i<Math.ceil(count*.65)?0:1;
   const a=(i/(ring?Math.max(1,count-Math.ceil(count*.65)):Math.ceil(count*.65)))*TAU+r()*.35;
   const rad=ring?radius*.45:radius*(.78+r()*.28),sy=ring?.15+r()*.06:.11+r()*.06;
   pose.position.set(Math.cos(a)*rad,sy*(ring?1.05:.52),Math.sin(a)*rad);
   pose.rotation.set((r()-.5)*.35,a+r(),(r()-.5)*.35);
   pose.scale.set(.18+r()*.11,sy,.16+r()*.09);
   pose.updateMatrix();stones.setMatrixAt(i,pose.matrix);stones.setColorAt(i,cols[i%cols.length]);
  }
  stones.castShadow=stones.receiveShadow=true;g.add(stones);
  for(let m=0;m<3;m++){
   const ma=m*2.1+.4,moss=this.mesh(new THREE.SphereGeometry(.065,8,6),this.mat(m%2?'#687e4b':'#7e915c',{surface:'leaf'}),Math.cos(ma)*radius*.78,.045,Math.sin(ma)*radius*.78,g);
   moss.scale.set(1.3,.42,1.05);
  }
  return g;
 }

 // Stacked courses of irregular fieldstone blocks with moss in crevices and hanging leafy vines.
 stoneWall(x,y,z,width=3.2,height=2.4,options={}){
  const depth=options.depth??.58,vines=options.vines!==false,parent=options.parent||this.group;
  const g=new THREE.Group();g.position.set(x,y,z);if(options.rotationY)g.rotation.y=options.rotationY;g.name='Muro de blocos de pedra irregulares';parent.add(g);
  const cols=Math.max(2,Math.round(width/.68)),rows=Math.max(2,Math.round(height/.46));
  const bw=width/cols,bh=height/rows,r=random(Math.abs(Math.round(x*211+z*149+width*37))+19),pose=new THREE.Object3D();
  const palette=(options.palette||['#8f897a','#a59e8d','#7e7a6d','#b4ab98']).map(c=>clayColor(c));
  const shapes=[0,1,2].map(v=>clayStoneBlockGeometry(v,this.geometryCache));
  const buckets=[[],[],[]],mossPatches=[];
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const stagger=(row%2?.22:-.18)*bw*(row<rows-1?1:.4);
   const px=-width/2+(col+.5)*bw+THREE.MathUtils.clamp(stagger,-bw*.25,bw*.25);
   const py=(row+.5)*bh+(r()-.5)*.022,pz=(r()-.5)*.045;
   const sx=bw*(.94+r()*.14),sy=bh*1.48*(.92+r()*.14),sz=depth*1.18*(.92+r()*.14);
   buckets[(row+col)%3].push({px,py,pz,sx,sy,sz,rx:(r()-.5)*.08,ry:(r()-.5)*.12,rz:(r()-.5)*.07,color:palette[(row*3+col)%palette.length]});
   if((row+col)%3===0&&row<rows-1){
    mossPatches.push([px+(r()-.5)*bw*.3,py+bh*.48,depth*.44,bw*(.22+r()*.12),.042,.048]);
   }
  }
  buckets.forEach((items,bi)=>{
   if(!items.length)return;
   const inst=new THREE.InstancedMesh(shapes[bi],this.mat('#ffffff',{surface:'stone',roughness:.88,bumpScale:.022}),items.length);
   items.forEach((it,i)=>{pose.position.set(it.px,it.py,it.pz);pose.rotation.set(it.rx,it.ry,it.rz);pose.scale.set(it.sx,it.sy,it.sz);pose.updateMatrix();inst.setMatrixAt(i,pose.matrix);inst.setColorAt(i,it.color);});
   inst.castShadow=inst.receiveShadow=true;g.add(inst);
  });
  if(mossPatches.length){
   const mossInst=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),this.mat('#6d8250',{surface:'leaf',roughness:.85}),mossPatches.length);
   mossPatches.forEach(([mx,my,mz,sx,sy,sz],i)=>{pose.position.set(mx,my,mz);pose.rotation.set(0,0,i*.3);pose.scale.set(sx,sy,sz);pose.updateMatrix();mossInst.setMatrixAt(i,pose.matrix);});
   mossInst.castShadow=mossInst.receiveShadow=true;g.add(mossInst);
  }
  if(vines&&height>=1.1&&width>=1.2){
   const vineLeaves=[],vineCount=Math.min(3,Math.max(1,Math.floor(width/1.5)));
   for(let v=0;v<vineCount;v++){
    const vx=-width*.32+v*(vineCount>1?width*.64/(vineCount-1):0)+(r()-.5)*.18,vz=depth*.45;
    const pts=[new THREE.Vector3(vx,height-.05,vz),new THREE.Vector3(vx+.09,height*.68,vz+.04),new THREE.Vector3(vx-.07,height*.38,vz+.05),new THREE.Vector3(vx+.04,height*.16,vz+.06)];
    const curve=new THREE.CatmullRomCurve3(pts);
    this.mesh(new THREE.TubeGeometry(curve,14,.016,5,false),this.mat('#5e7246',{surface:'leaf'}),0,0,0,g);
    for(let l=0;l<6;l++){const p=curve.getPoint(.08+l*.15);for(const side of[-1,1])vineLeaves.push([p.x+side*.065,p.y-.02,p.z+.015,side]);}
   }
   const leafInst=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),this.mat('#6c8350',{surface:'leaf'}),vineLeaves.length);
   vineLeaves.forEach(([lx,ly,lz,side],i)=>{pose.position.set(lx,ly,lz);pose.rotation.set(.15,side*.28,-side*.55);pose.scale.set(.085,.034,.048);pose.updateMatrix();leafInst.setMatrixAt(i,pose.matrix);});
   leafInst.castShadow=leafInst.receiveShadow=true;g.add(leafInst);
  }
  return g;
 }

 altar(x,y,z,s=1){
  const g=this.groupAt(x,y,z);g.scale.setScalar(s);g.name='Altar de pedras irregulares';
  const blockGeo=clayStoneBlockGeometry(1,this.geometryCache),pose=new THREE.Object3D();
  const stones=[],cols=['#958e7d','#aba290','#827c6e','#b7ae9b'].map(c=>clayColor(c));
  for(let row=0;row<3;row++){
   const rad=.52-row*.06,n=8-row;
   for(let i=0;i<n;i++){
    const a=i/n*TAU+row*.4;
    stones.push({x:Math.cos(a)*rad,y:.14+row*.22,z:Math.sin(a)*rad*.82,sx:.36,sy:.28,sz:.32,ry:-a,col:cols[(row+i)%4]});
   }
  }
  const inst=new THREE.InstancedMesh(blockGeo,this.mat('#ffffff',{surface:'stone',roughness:.88}),stones.length);
  stones.forEach((st,i)=>{pose.position.set(st.x,st.y,st.z);pose.rotation.set(.04,st.ry,.03);pose.scale.set(st.sx,st.sy,st.sz);pose.updateMatrix();inst.setMatrixAt(i,pose.matrix);inst.setColorAt(i,st.col);});
  inst.castShadow=inst.receiveShadow=true;g.add(inst);
  this.mesh(new THREE.BoxGeometry(.96,.12,.78),this.mat('#9f9785',{surface:'stone'}),0,.68,0,g);
  for(const sx of[-1,1])for(const sz of[-1,1])this.mesh(new THREE.CylinderGeometry(.045,.085,.17,6),this.mat('#a89f8d',{surface:'stone'}),sx*.44,.79,sz*.32,g);
  for(let m=0;m<4;m++){const ma=m*1.57+.5;this.mesh(new THREE.SphereGeometry(.065,8,6),this.mat('#6b804e',{surface:'leaf'}),Math.cos(ma)*.52,.24+(m%2)*.2,Math.sin(ma)*.42,g).scale.set(1.2,.42,.9);}
  return g;
 }

 tent(x,y,z,c='#ccb894'){
  const g=this.groupAt(x,y,z);
  const roof=this.mesh(new THREE.ConeGeometry(1.45,1.55,6),this.mat(c,{surface:'cloth'}),0,.82,0,g);roof.scale.set(1.15,1,.88);
  this.mesh(new THREE.BoxGeometry(.52,.72,.14),this.mat('#5c4632',{surface:'cloth'}),0,.36,.95,g);
  for(const s of[-1,1]){const fold=this.mesh(new THREE.CylinderGeometry(.05,.14,.82,8),this.mat('#b59f79',{surface:'cloth'}),s*.32,.41,.98,g);fold.rotation.z=s*.25;}
  return g;
 }

 // Curved rectangular Roman scutum shield with brass rim and central umbo boss.
 romanShield(color='#8f2924',parent=null){
  const g=new THREE.Group();g.name='Escudo romano esculpido';
  const arc=1.08,rad=.36,h=.58;
  const body=this.mesh(new THREE.CylinderGeometry(rad,rad,h,16,1,false,-arc/2,arc),this.mat(color,{surface:'wood',roughness:.58}),0,0,-rad+.04,g);
  body.scale.z=.42;
  for(const sy of[-1,1]){
   const rim=this.mesh(new THREE.TorusGeometry(rad*.58,.016,6,16,arc*1.15),this.mat('#c9a75c',{metalness:.48,roughness:.36}),0,sy*(h/2-.01),-.09,g);
   rim.rotation.x=Math.PI/2;rim.rotation.z=(Math.PI-arc*1.15)/2;
  }
  for(const sx of[-1,1])this.mesh(new THREE.BoxGeometry(.026,h,.032),this.mat('#c9a75c',{metalness:.48,roughness:.36}),sx*.185,0,.02,g);
  this.mesh(new THREE.BoxGeometry(.16,.12,.018),this.mat('#c9a75c',{metalness:.52,roughness:.34}),0,0,.052,g);
  this.mesh(new THREE.SphereGeometry(.055,12,8),this.mat('#d6b66c',{metalness:.58,roughness:.30}),0,0,.065,g).scale.set(1,1,.65);
  if(parent)parent.add(g);
  return g;
 }

 // Embossed round/oval warrior buckler shield for Book of Mormon & Old Testament warriors.
 warriorShield(color='#9c7b4c',parent=null){
  const g=new THREE.Group();g.name='Escudo esculpido de guerreiro';
  const body=this.mesh(new THREE.CylinderGeometry(.25,.25,.045,22),this.mat(color,{surface:'wood',roughness:.62}),0,0,0,g);body.rotation.x=Math.PI/2;
  const rim=this.mesh(new THREE.TorusGeometry(.245,.018,7,24),this.mat('#c7a45b',{metalness:.45,roughness:.38}),0,0,.012,g);
  const boss=this.mesh(new THREE.SphereGeometry(.062,12,8),this.mat('#d4b36a',{metalness:.55,roughness:.32}),0,0,.028,g);boss.scale.set(1,1,.62);
  void rim;if(parent)parent.add(g);
  return g;
 }

 // Slender wooden spear with metallic collar and sculpted leaf-shaped steel blade.
 spear(height=1.85,woodColor='#6e4d30',parent=null){
  const g=new THREE.Group();g.name='Lança proporcional com ponta metálica';
  this.mesh(new THREE.CylinderGeometry(.016,.020,height,8),this.mat(woodColor,{surface:'wood'}),0,height*.22,0,g);
  this.mesh(new THREE.CylinderGeometry(.024,.020,.07,8),this.mat('#b89a58',{metalness:.48,roughness:.38}),0,height*.72,0,g);
  const tip=this.mesh(new THREE.ConeGeometry(.044,.22,6),this.mat('#c2c8ce',{metalness:.55,roughness:.30}),0,height*.72+.135,0,g);
  tip.scale.set(1,1,.38);
  if(parent){parent.add(g);g.position.set(0,-.12,.02);}
  return g;
 }

 // Proportional sword with pommel, grip, crossguard and tapered metallic blade.
 sword(bladeColor='#c2c7cc',parent=null){
  const g=new THREE.Group();g.name='Espada esculpida';
  this.mesh(new THREE.CylinderGeometry(.018,.020,.14,8),this.mat('#634328',{surface:'wood'}),0,0,0,g);
  this.mesh(new THREE.SphereGeometry(.028,8,6),this.mat('#c5a258',{metalness:.48,roughness:.36}),0,-.078,0,g);
  this.mesh(new THREE.BoxGeometry(.15,.032,.042),this.mat('#c5a258',{metalness:.48,roughness:.36}),0,.078,0,g);
  const blade=this.mesh(new THREE.ConeGeometry(.048,.42,4),this.mat(bladeColor,{metalness:.54,roughness:.32}),0,.295,0,g);
  blade.rotation.y=Math.PI/4;blade.scale.set(1,1,.32);
  if(parent){parent.add(g);g.position.set(0,.02,.03);}
  return g;
 }

 // Tied clay travel sack/bundle (as in the Red Sea and wilderness journeys).
 travelBag(x=0,y=0,z=0,color='#9f7a54',parent=this.group){
  const g=new THREE.Group();g.position.set(x,y,z);g.name='Bolsa de viagem de massinha';parent.add(g);
  const sack=this.mesh(new THREE.SphereGeometry(.14,12,10),this.mat(color,{surface:'cloth'}),0,.12,0,g);sack.scale.set(1.08,.94,.96);
  const neck=this.mesh(new THREE.TorusGeometry(.058,.014,6,14),this.mat('#6e4e32',{surface:'cloth'}),0,.225,0,g);neck.rotation.x=Math.PI/2;
  const top=this.mesh(new THREE.SphereGeometry(.058,10,8),this.mat(color,{surface:'cloth'}),0,.265,0,g);top.scale.set(1.15,.65,1);
  return g;
 }

 finish(config={}){Object.assign(this.config,config);return this}
 update(t,duration=32){const p=Math.min(t/duration,1),clamped=Math.min(t,duration);for(const f of this.ambients)f(t,p);resetActingFrame(this);for(const f of this.animations)f(clamped,p);applyContextualExpressions(this,clamped,duration);}
 dispose(){const geos=new Set(),mats=new Set();this.group.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());this.animations.length=this.ambients.length=this.people.length=this.labels.length=this.selectables.length=0;this.geometryCache.clear();this.materials.clear();this.group.clear();}
}
