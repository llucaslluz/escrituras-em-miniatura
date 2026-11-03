import * as THREE from 'three';
import {createPartedSea} from './red-sea-water.js';
import {applyGroundedGait} from '../../engine/clay-gait.js';

const PI=Math.PI,TAU=PI*2;
const ease=(a,b,t)=>{const p=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return p*p*(3-2*p)};
const mix=THREE.MathUtils.lerp;

function clayScatter(k,parent,color,parts){
 const geometry=new THREE.SphereGeometry(1,12,8),mesh=new THREE.InstancedMesh(geometry,k.mat(color,{roughness:.83}),parts.length),dummy=new THREE.Object3D();
 parts.forEach(([x,y,z,sx,sy,sz,ry=0],i)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,ry,.08*Math.sin(i));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});
 mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

function hookedStaff(k,hand){
 const points=[[-.015,-.92,0],[0,-.28,0],[.015,.33,0],[.035,.73,0],[.11,.89,0],[.25,.92,0],[.35,.8,0],[.35,.64,0]].map(p=>new THREE.Vector3(...p));
 const staff=k.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.038,8,false),k.mat('#926342',{roughness:.68}),0,.43,0,hand);
 staff.name='Cajado curvo de Moisés';return staff;
}

function shore(k,x,z,w,d){
 const sand=k.mesh(new THREE.SphereGeometry(1,40,18),k.mat('#e8d3a7',{roughness:.88,bumpScale:.022}),x,-.005,z);
 sand.scale.set(w,.115,d);return sand;
}

function waitingShoreHeight(x,z){
 const q=1-(x/1.45)**2-((z+4)/1.95)**2;
 return q>0?Math.max(0,-.04+.3*Math.sqrt(q)):0;
}

// Bake a small fixed-step traffic plan once. The render loop only samples it,
// so direct seeking and repeating the story never accumulate crowd movement.
function familyPaths(families){
 const fps=25,dt=1/fps,frames=[],actors=families.map(({end,startX,startZ})=>({x:startX,z:startZ,r:.385*end.scale}));
 actors.push({x:0,z:-2.7,r:.385*1.02});
 const save=()=>frames.push(Float32Array.from(actors.flatMap(p=>[p.x,p.z])));
 const confine=p=>{
  const maxX=1+2.1*ease(2.9,3.5,p.z);p.x=THREE.MathUtils.clamp(p.x,-1.05,maxX);
  const distance=Math.hypot(p.x,p.z),limit=5.94-p.r;
  if(distance>limit){p.x*=limit/distance;p.z*=limit/distance;}
 };
 save();
 for(let frame=1;frame<=32*fps;frame++){
  const t=frame/fps,advance=10.8*ease(11,28.8,t);
  families.forEach(({end,startX,startZ},i)=>{
   const corridor=startZ+advance,fan=ease(3.4,4.7,corridor);
   const goalX=mix(startX,end.x,fan),goalZ=corridor<=3.4?corridor:mix(3.4,end.z,fan)+Math.sin(fan*PI)*.35;
   const actor=actors[i],dx=goalX-actor.x,dz=goalZ-actor.z,distance=Math.hypot(dx,dz),step=Math.min(distance*3.5*dt,1.1*dt);
   if(distance){actor.x+=dx/distance*step;actor.z+=dz/distance*step;}
  });
  const moses=actors.at(-1);moses.z=Math.min(3.8,-2.7+advance);moses.x=-.6*ease(1.6,3,moses.z);
  // The clearance follows each figure's actual scale. Keeping the previous
  // sample as the starting point also prevents abrupt swaps during fan-out.
  for(let pass=0;pass<24;pass++){
   for(let a=0;a<actors.length;a++)for(let b=a+1;b<actors.length;b++){
    const left=actors[a],right=actors[b],dx=right.x-left.x,dz=right.z-left.z,distance=Math.hypot(dx,dz),needed=left.r+right.r+.015;
    if(distance>=needed)continue;
    const nx=distance>1e-6?dx/distance:1,nz=distance>1e-6?dz/distance:0,push=(needed-distance)*.6,share=b===families.length?1:.5;
    left.x-=nx*push*share;left.z-=nz*push*share;
    if(b!==families.length){right.x+=nx*push*.5;right.z+=nz*push*.5;}
   }
   actors.slice(0,-1).forEach(confine);
  }
  save();
 }
 // Cumulative distance drives the feet, so a faster child takes shorter,
 // quicker steps instead of sharing an unrelated wall-clock leg oscillator.
 const distances=[new Float32Array(actors.length)],headings=[new Float32Array(actors.length)];
 for(let frame=1;frame<frames.length;frame++){
  const distance=new Float32Array(actors.length),heading=new Float32Array(actors.length);
  for(let i=0;i<actors.length;i++){
   const offset=i*2,before=frames[frame-1],current=frames[frame];
   distance[i]=distances[frame-1][i]+Math.hypot(current[offset]-before[offset],current[offset+1]-before[offset+1]);
   const a=frames[Math.max(0,frame-4)],b=frames[Math.min(frames.length-1,frame+4)],dx=b[offset]-a[offset],dz=b[offset+1]-a[offset+1],previous=headings[frame-1][i];
   const target=Math.hypot(dx,dz)>.008?Math.atan2(dx,dz):previous;
   const turn=Math.atan2(Math.sin(target-previous),Math.cos(target-previous));
   heading[i]=previous+THREE.MathUtils.clamp(turn,-.085,.085);
  }
  distances.push(distance);headings.push(heading);
 }
 return{fps,frames,distances,headings};
}

function fadeClay(root){
 const materials=new Map();
 root.traverse(object=>{
  if(!object.material)return;
  const original=object.material;
  if(!materials.has(original)){
   const material=original.clone();material.transparent=true;
   materials.set(original,{material,opacity:original.opacity,depthWrite:original.depthWrite,transparent:original.transparent});
  }
  object.material=materials.get(original).material;
 });
 return value=>{root.visible=value>0;for(const {material,opacity,depthWrite,transparent}of materials.values()){
   const complete=value>=1,nextTransparent=transparent||!complete;
   if(material.transparent!==nextTransparent){material.transparent=nextTransparent;material.needsUpdate=true;}
   material.opacity=opacity*value;material.depthWrite=depthWrite&&complete;
  }};
}

function groundedSteps(rig,distance,motion){
 applyGroundedGait(rig,distance,{envelope:motion,arms:false});
 for(const leg of [rig.leftLeg,rig.rightLeg]){
  const angle=leg.rotation.x,facing=rig.root.rotation.y,scale=rig.root.scale.x;
  const footZ=leg.position.z-.365*Math.sin(angle)+.061*Math.cos(angle);
  const worldX=rig.root.position.x+(Math.cos(facing)*leg.position.x+Math.sin(facing)*footZ)*scale;
  const worldZ=rig.root.position.z+(-Math.sin(facing)*leg.position.x+Math.cos(facing)*footZ)*scale;
  leg.position.y+=(waitingShoreHeight(worldX,worldZ)-rig.root.position.y)/scale;
 }
 return rig.leftLeg.rotation.x;
}

/** Exodus 14, condensed into a reversible miniature: the passage stays open. */
export function buildRedSea(k){
 k.config.ground='#e7cf9e';k.background.set('#acd5d9');
 k.ground.material=k.mat('#af8156',{roughness:.87});
 k.light.color.set('#fff1d4');k.light.intensity=3.25;k.light.position.set(-4,8,5);
 k.fill.color.set('#d7eef0');k.fill.groundColor.set('#b49a78');k.fill.intensity=1.9;
 const sea=createPartedSea(k);sea.root.userData.redSea=true;
 const nearShore=shore(k,0,4.35,3.35,1.24);nearShore.scale.y=.035;nearShore.position.y=-.02;
 const waitingShore=shore(k,0,-4,1.45,1.95);waitingShore.scale.y=.3;waitingShore.position.y=-.04;

 // Delicate clay details make the dry seabed readable between the waves.
 const decor=k.groupAt();decor.name='Areia, pedrinhas e conchas do caminho';
 let seed=14021;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const palettes=['#c6b390','#eadbc1','#a7a89c'],stones=palettes.map(()=>[]);
 for(let i=0;i<74;i++){
  const x=(rnd()-.5)*2.8,z=rnd()*8.6-4.2,size=.025+rnd()*.075;
  stones[i%3].push([x,.025,z,size,.02+rnd()*.03,size*(.7+rnd()*.5),rnd()*TAU]);
 }
 stones.forEach((parts,i)=>clayScatter(k,decor,palettes[i],parts));
 clayScatter(k,decor,'#a7a28f',[[-1.32,.055,3.2,.14,.07,.12],[-1.12,.035,3.4,.08,.045,.1],[-.2,.04,4.95,.11,.05,.08],[2.9,.04,4.6,.09,.045,.12],[1.15,.04,.5,.11,.045,.09],[-.8,.035,-1.5,.09,.04,.12]]);
 for(const [x,z]of[[-1.1,3.1],[.2,1.9],[-.7,-.8],[1.15,-2.4]]){
  const shell=k.mesh(new THREE.SphereGeometry(.09,12,8,0,PI*2,0,PI*.56),k.mat('#efdbb7',{roughness:.73}),x,.035,z);shell.scale.set(1.15,.5,.85);shell.rotation.y=z;
 }
 const jar=k.vase(-.2,0,4.75);jar.scale.setScalar(.55);jar.name='Pequeno jarro na margem';
 const seaDecor=k.groupAt();seaDecor.name='Algas de massinha junto à água';const leaves=[];
 for(const [x,z]of[[-4.8,.9],[-4.35,2.0],[4.8,.4],[4.45,1.75]])for(let n=0;n<5;n++){
  const h=.16+n%3*.065;leaves.push([x+Math.sin(n*2.2)*.09,.14+h*.42,z+Math.cos(n*2.2)*.1,.038,h,.06,n*.8]);
 }
 clayScatter(k,seaDecor,'#478f86',leaves);

 const moses=k.person('Moisés',0,-2.7,{robe:'#eedab4',mantle:'#b58b62',hair:'#79543c',beard:true,scale:1.02});
 moses.root.userData.redSeaTraveler=true;moses.root.userData.redSeaMoses=true;
 const staff=hookedStaff(k,moses.handR);
 // Families end in a compact group at the near shore, as in the reference.
 const families=[
  {x:.43,z:4.5,scale:.5,robe:'#d2d1aa',hair:'#765440',beard:false},
  {x:1.55,z:4.13,scale:.8,robe:'#a9b58e',mantle:'#d8cfad',hair:'#6d503d',beard:false},
  {x:1.05,z:4.5,scale:.56,robe:'#e2c79e',hair:'#8d674b',beard:false},
  {x:2.64,z:3.55,scale:.8,robe:'#d3ae83',mantle:'#b0b99a',hair:'#694a36',beard:true},
  {x:.45,z:3.35,scale:.83,robe:'#b8b99a',mantle:'#e0cba5',hair:'#6b4937',beard:true},
  {x:.81,z:3.95,scale:.7,robe:'#d4b3a0',hair:'#7d5741',beard:false},
  {x:1.91,z:3.55,scale:.84,robe:'#c6b88e',mantle:'#aa987d',hair:'#644735',beard:true},
  {x:2.8,z:4.16,scale:.78,robe:'#a8b49e',hair:'#916b4d',beard:false},
  {x:2.02,z:4.5,scale:.5,robe:'#d1b58f',mantle:'#e7d2ad',hair:'#805a3f',beard:false},
  {x:1.18,z:3.35,scale:.84,robe:'#d9cda9',hair:'#6e4d36',beard:true},
 ].map((o,i)=>{
  const startX=((i%3)-1)*.8,startZ=-3.45-Math.floor(i/3)*.7;
  const rig=k.person('Povo de Israel',startX,startZ,o);
  rig.root.userData.redSeaTraveler=true;rig.root.userData.redSeaFamily=true;rig.root.userData.redSeaArrival=[o.x,o.z];
  return{rig,end:o,startX,startZ,index:i};
 });
 const paths=familyPaths(families);

 // Tiny fish are sculpted into the water, rather than swimming in the path.
 const fishGroup=k.groupAt();fishGroup.name='Peixes dentro das águas';const fishes=[];
 for(const side of[-1,1])for(let i=0;i<4;i++){
  const fish=k.animal('fish',side*(1.76+i%2*.2),-2.7+i*1.2,.42+i%2*.07);
  fish.children[0].material=k.mat(i%2?'#80b6b0':'#bdca96',{roughness:.6});
  fish.children[1].material=k.mat('#5a9ba0',{roughness:.57});
  fish.position.y=.5+i%3*.38;fish.rotation.y=i%2?PI:0;fish.userData.redSeaFish=true;fishGroup.attach(fish);
  fishes.push({fish,y:fish.position.y,z:fish.position.z,index:i,side});
 }
 const clouds=[k.cloud(-2.8,4.85,-2.6,1.08),k.cloud(2.3,5.1,-2.8,1.22)];
 clouds.forEach(c=>{c.name='Nuvem de massinha';c.traverse(o=>{if(o.material)o.material=k.mat('#f4ead6',{roughness:.8})})});
 const light=k.ray(0,.25,-2.35,5.7);light.name='Luz sobre o caminho';light.scale.set(1.4,1,1.4);
 const specks=new Float32Array(38*3);
 for(let i=0;i<38;i++)specks.set([(rnd()-.5)*2.2,.8+rnd()*4.4,rnd()*5.6-3.8],i*3);
 const sparkleGeometry=new THREE.BufferGeometry();sparkleGeometry.setAttribute('position',new THREE.BufferAttribute(specks,3));
 const sparkles=k.add(new THREE.Points(sparkleGeometry,new THREE.PointsMaterial({color:'#fff5cf',size:.035,transparent:true,opacity:.65,depthWrite:false})));
 sparkles.name='Pontos de luz no caminho';

 const showSand=fadeClay(decor),showAlgae=fadeClay(seaDecor),showFish=fadeClay(fishGroup),showLight=fadeClay(light);
 k.animate(t=>{
  const open=ease(2.5,11,t),arrive=ease(23,31,t),sample=THREE.MathUtils.clamp(t,0,32)*paths.fps;
  const frame=Math.floor(sample),before=paths.frames[frame],after=paths.frames[Math.min(frame+1,paths.frames.length-1)],fraction=sample-frame;
  const place=(rig,index)=>{
   const offset=index*2;rig.root.position.set(mix(before[offset],after[offset],fraction),0,mix(before[offset+1],after[offset+1],fraction));
   rig.root.position.y=waitingShoreHeight(rig.root.position.x,rig.root.position.z);
   const distance=mix(paths.distances[frame][index],paths.distances[Math.min(frame+1,paths.frames.length-1)][index],fraction);
   const heading=mix(paths.headings[frame][index],paths.headings[Math.min(frame+1,paths.frames.length-1)][index],fraction);
   return {motion:Math.min(1,Math.hypot(after[offset]-before[offset],after[offset+1]-before[offset+1])*paths.fps/.3),distance,heading};
  };
  sea.update(open,t);showSand(ease(.12,.38,open));showAlgae(ease(.48,.78,open));showFish(ease(.59,.79,open));const radiance=ease(.38,.7,open);showLight(radiance);sparkles.visible=radiance>0;
  const mosesMotion=place(moses,families.length);
  moses.root.rotation.y=mix(mix(-.3,mosesMotion.heading,ease(10.5,13,t)),.12,arrive);
  moses.rightArm.rotation.set(-.25-ease(1,6,t)*.6*(1-ease(11,17,t)),0,-.12);
  moses.rightForearm.rotation.x=-.15;moses.leftArm.rotation.x=-.2;
  moses.head.rotation.y=-.2*(1-arrive);moses.head.rotation.x=.025*Math.sin(t*.8);
  groundedSteps(moses,mosesMotion.distance,mosesMotion.motion);
  staff.rotation.set(.4+ease(1,6,t)*.6*(1-ease(11,17,t)),0,.05);
  for(const {rig,index}of families){
   const {motion,distance,heading}=place(rig,index);rig.root.rotation.y=mix(heading,.15,ease(29,31,t));
   const step=groundedSteps(rig,distance,motion);
   rig.leftArm.rotation.x=-.12-step*.35;rig.rightArm.rotation.x=-.1+step*.35;
   rig.leftForearm.rotation.x=-.2;rig.rightForearm.rotation.x=-.22;
   rig.head.rotation.y=.06*Math.sin(t*.6+index);rig.head.rotation.x=index<3?.03:-.015;
  }
  for(const {fish,y,z,index,side}of fishes){sea.sampleWall(side,z+Math.sin(t*.6+index+side)*.07,y+Math.sin(t*.8+index)*.025,side<0?'inner':'outer',fish.position);fish.position.x+=.16;}
  sparkles.material.opacity=(.3+Math.sin(t*.7)*.12)*radiance;
 });
 k.select(sea.root,'Águas abertas','Caminho por terra seca','Êxodo 14:21–22','As ondas e os peixes são detalhes artísticos da miniatura. Êxodo descreve as águas como uma parede de cada lado do caminho.');
 k.config.camera=[.5,8.5,14.5];k.config.target=[0,1.2,0];
 k.config.views=[
  {label:'O caminho entre as águas',camera:[.5,8.5,14.5],target:[0,1.2,0]},
  {label:'Moisés e as famílias',camera:[0,6.5,10.5],target:[0,1,-.2]},
  {label:'As ondas',camera:[-4.4,4.8,7.2],target:[-.9,1.8,-.6]},
 ];
}
