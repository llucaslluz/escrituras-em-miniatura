import * as THREE from 'three';
import {makeClayTexture,clayColor,clayGeometry,clayPlinth,clayBeamTexture,clipWaterToPlinth} from './clay-style.js';
import {createClayPerson} from './clay-people.js';
import {createClayAnimal,createClayDove} from './clay-animals.js';
import {applyGroundedGait,gaitEnvelope} from './clay-gait.js';
import {resetActingFrame,applyContextualExpressions} from './acting.js';

const TAU=Math.PI*2;
const surfaceProfiles={cloth:{roughness:.85,bumpScale:.009,clearcoat:.015},skin:{roughness:.64,bumpScale:.007,clearcoat:.025},hair:{roughness:.76,bumpScale:.009,clearcoat:.025},stone:{roughness:.86,bumpScale:.01,clearcoat:.01},wood:{roughness:.79,bumpScale:.01,clearcoat:.02},leaf:{roughness:.83,bumpScale:.009,clearcoat:.015}};
export const smooth=(a,b,t)=>{const p=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return p*p*(3-2*p)};
export function random(seed=19){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
// Compatibility alias for source consumers of the first edition.
export const makeFelt=makeClayTexture;

export class Kit{
 constructor(id='scene',options={}){
  this.id=id;this.group=new THREE.Group();this.group.name=id;this.animations=[];this.ambients=[];this.people=[];this.selectables=[];this.labels=[];this.materials=new Map();this.geometryCache=new Map();this.config={camera:[9,7.5,11],target:[0,1,0],ground:'#b7a47a',...options};this.THREE=THREE;
  this.light=new THREE.DirectionalLight('#fff0d7',3.0);this.light.position.set(-3,9,5);this.light.castShadow=true;this.light.shadow.mapSize.set(1024,1024);Object.assign(this.light.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:28});this.light.shadow.bias=-.001;this.light.shadow.normalBias=.035;this.light.shadow.radius=3;this.group.add(this.light);
  this.fill=new THREE.HemisphereLight('#dae8f2','#9f8b78',1.65);this.group.add(this.fill);this.background=new THREE.Color('#e7e8da');
  this.group.userData.artStyle='claymation';
  this.ground=this.mesh(clayPlinth(6,.5),this.mat('#a79483',{roughness:.83,bumpScale:.018}),0,-.27,0);this.ground.name='Base de massinha';
  this.mesh(clayPlinth(5.98,.12),this.mat('#796b63',{roughness:.86}),0,-.47,0);
  this.top=this.mesh(clayPlinth(5.94,.065),this.mat(this.config.ground,{roughness:.84,bumpScale:.018}),0,-.0325,0);
  // A single instanced draw adds tiny clay pebbles and hand-worked ground grain.
  const seed=[...id].reduce((n,c)=>n+c.charCodeAt(0)*31,44),r=random(seed),count=140;
  const pebbles=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),this.mat('#c9bca6',{roughness:.9}),count);
  const transform=new THREE.Object3D(),palette=['#b8a38e','#d0bca3','#a5aaa0','#d9cdb9'].map(c=>clayColor(c));
  for(let i=0;i<count;i++){const rim=i>=86,a=rim?(i-86)/54*TAU+r()*.08:r()*TAU,rad=rim?5.22+r()*.56:Math.sqrt(r())*5.74,size=rim?.055+r()*.065:.02+r()*.045;transform.position.set(Math.cos(a)*rad,.008,Math.sin(a)*rad);transform.rotation.set(r(),a,r());transform.scale.set(size*(1+r()*.3),size*(rim?.42:.32),size*(.65+r()*.5));transform.updateMatrix();pebbles.setMatrixAt(i,transform.matrix);pebbles.setColorAt(i,palette[i%palette.length]);}
  pebbles.castShadow=pebbles.receiveShadow=true;pebbles.name='Grãos e pedrinhas de argila';this.add(pebbles);
  const floraCount=96,flora=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),this.mat('#849862',{roughness:.86,surface:'leaf'}),floraCount);const floraPalette=['#6e8650','#849a61','#98aa70','#d8c478','#cfa185','#a49b76'].map(c=>clayColor(c));for(let i=0;i<floraCount;i++){const outer=i<64,a=outer?(i/64)*TAU+r()*.09:r()*TAU,rad=outer?4.45+r()*1.28:1.6+r()*3.6,s=outer?.045+r()*.05:.03+r()*.035;transform.position.set(Math.cos(a)*rad,.016,Math.sin(a)*rad);transform.rotation.set(r()*.3,a,r()*.3);transform.scale.set(s*1.15,s*.52,s*(.85+r()*.35));transform.updateMatrix();flora.setMatrixAt(i,transform.matrix);flora.setColorAt(i,floraPalette[i%floraPalette.length]);}flora.castShadow=flora.receiveShadow=true;flora.name='Tufos e florzinhas de argila';this.add(flora);

 }
 mat(color,options={}){const key=color+JSON.stringify(options);if(!this.materials.has(key)){const{surface,...explicit}=options;const material=new THREE.MeshPhysicalMaterial({color:clayColor(color),roughness:.72,metalness:0,bumpMap:makeClayTexture(),bumpScale:.012,clearcoat:.045,clearcoatRoughness:.8,...surfaceProfiles[surface],...explicit});material.userData.clayMaterial=true;if(surface)material.userData.claySurface=surface;this.materials.set(key,material);}return this.materials.get(key)}
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
  const r=this.mesh(new THREE.DodecahedronGeometry(.5,1),this.mat('#8b8a78',{surface:'stone'}),x,.22*s,z);
  r.scale.set(s,s*.65,s*.8);r.rotation.set(.1,x,.1);r.updateMatrixWorld(true);
  if(s===0)return r;
  const before=new THREE.Box3().setFromObject(r,true),variant=Math.abs(Math.round(x*317+z*193))%3;
  r.scale.x*=[.90,.96,1][variant];r.scale.z*=[1,.90,.94][variant];r.rotation.x+=[-.035,.025,0][variant];r.rotation.z+=[.02,-.025,0][variant];r.updateMatrixWorld(true);
  const after=new THREE.Box3().setFromObject(r,true),ratio=Math.min(1,(x-before.min.x)/(x-after.min.x),(before.max.x-x)/(after.max.x-x),(z-before.min.z)/(z-after.min.z),(before.max.z-z)/(after.max.z-z),(before.max.y-before.min.y)/(after.max.y-after.min.y));
  r.scale.multiplyScalar(ratio);r.updateMatrixWorld(true);
  const fitted=new THREE.Box3().setFromObject(r,true);r.position.y+=before.min.y-fitted.min.y;r.userData.clayRockVariant=variant;
  return r;
 }
 tree(x,z,s=1,kind='olive'){
  const g=this.groupAt(x,0,z);g.scale.setScalar(s);const mesh=(geo,col,px,py,pz,p=g,surface='leaf')=>this.mesh(geo,this.mat(col,{surface}),px,py,pz,p);
  mesh(new THREE.CylinderGeometry(.13,.24,1.6,9),'#796348',0,.8,0,g,'wood').rotation.z=.09;
  for(let j=0;j<3;j++){const b=mesh(new THREE.CylinderGeometry(.065,.12,.92,7),'#796348',(j-1)*.22,1.48,0,g,'wood');b.rotation.z=(j-1)*-.6;}
  const canopy=new THREE.Group();canopy.position.y=1.9;g.add(canopy);const r=random(Math.round((x+10)*212+(z+12)*17));
  if(kind==='palm'){for(let j=0;j<8;j++){const leaf=mesh(new THREE.SphereGeometry(.48,12,6),'#6a8150',Math.sin(j/8*TAU)*.6,.1,Math.cos(j/8*TAU)*.6,canopy);leaf.scale.set(.3,.12,2.1);leaf.rotation.y=j/8*TAU;leaf.rotation.x=.3;}}
  else{for(let j=0;j<36;j++){const a=r()*TAU,rr=Math.sqrt(r())*.9;const leaf=mesh(new THREE.SphereGeometry(.24,10,8),j%3?'#778553':'#a2ac77',Math.cos(a)*rr,(r()-.5)*.65,Math.sin(a)*rr,canopy);leaf.scale.set(1.25,.55,.8);leaf.rotation.set(r(),r()*TAU,r());}for(let j=0;j<18;j++){const a=r()*TAU;const leaf=mesh(new THREE.SphereGeometry(.16,8,6),'#b4bd86',Math.cos(a)*.9,(r()-.5)*.6,Math.sin(a)*.9,canopy);leaf.scale.set(.3,.12,1.1);leaf.rotation.y=-a;}}
  if(kind!=='palm'){const variant=Math.abs(Math.round(x*317+z*193))%3;canopy.scale.set(...[[.96,.76,.96],[.79,1,.79],[1,.88,.72]][variant]);g.userData.clayCanopyVariant=variant;}
  this.ambient(t=>{canopy.rotation.z=Math.sin(t*1.1+x)*.018;canopy.rotation.x=Math.cos(t*.7+z)*.012});return g;
 }
 water(width,length,x=0,z=0,o={}){
  const g=this.groupAt(x,o.y??.045,z),geo=new THREE.PlaneGeometry(width,length,24,64);geo.rotateX(-Math.PI/2);const arr=geo.attributes.position,base=new Float32Array(arr.array);for(let i=0;i<arr.count;i++){if(o.river)base[i*3]+=Math.sin(base[i*3+2]*.58)*.52;}arr.array.set(base);
  clipWaterToPlinth(geo,x,z);const m=this.mat(o.color||'#6eaaa6',{transparent:true,opacity:.82,metalness:.25,roughness:.3,bumpScale:.018,side:THREE.DoubleSide});this.mesh(geo,m,0,0,0,g);
  const r=random(159);if(o.river){for(let i=0;i<32;i++){const rz=(r()-.5)*length,rx=(r()-.5)*width+Math.sin(rz*.58)*.52;const stone=this.rock(x+rx,z+rz,.12+r()*.2);stone.position.y=-.06;} }
  const ripples=[];for(let i=0;i<28;i++){const rz=(r()-.5)*length,rx=(r()-.5)*width*.88,radius=.18+r()*.18;const wave=this.mesh(new THREE.TorusGeometry(radius,.008,3,22,Math.PI*1.3),this.mat('#d5e5ce',{transparent:true,opacity:.5}),rx,.025,rz,g);wave.rotation.x=-Math.PI/2;wave.scale.set(1,.4,1);wave.userData.clayWaterRipple=true;ripples.push({wave,x:rx,z:rz,radius:radius+.008});}
  const fit=()=>{clipWaterToPlinth(geo,g.position.x,g.position.z);geo.computeVertexNormals();for(const w of ripples)w.wave.visible=Math.hypot(g.position.x+w.wave.position.x,g.position.z+w.wave.position.z)+w.radius<=5.84&&Math.abs(w.wave.position.z)+w.radius<length/2;};
  g.userData.fitWaterToPlinth=fit;fit();
  this.ambient(t=>{for(let i=0;i<arr.count;i++){const xx=base[i*3],zz=base[i*3+2];arr.setY(i,Math.sin(zz*3-t*2.1)*.025+Math.sin(xx*5+zz-t*1.3)*.012);}for(const w of ripples){w.wave.position.z=((w.z+length/2+t*.25)%length+length)%length-length/2;w.wave.position.x=w.x+(o.river?Math.sin(w.wave.position.z*.58)*.52:0);w.wave.position.y=.04+Math.sin(t*2+w.x)*.01;}fit();});return g;
 }
 fire(x,y,z,s=1){const g=this.groupAt(x,y,z);g.scale.setScalar(s);const flames=[];for(let j=0;j<6;j++){const f=this.mesh(new THREE.SphereGeometry(.16,12,8),this.mat(j%2?'#f5b94c':'#de7438',{emissive:'#c26320',emissiveIntensity:.7,transparent:true,opacity:.8}),Math.sin(j)*.18,.22,Math.cos(j)*.13,g);f.scale.set(.65,2,.65);flames.push(f);}const light=new THREE.PointLight('#ffc26b',2.5,5);light.position.y=.5;g.add(light);this.ambient(t=>{flames.forEach((f,i)=>{f.scale.y=1.4+Math.sin(t*7+i)*.6;f.rotation.z=Math.sin(t*4+i)*.2});light.intensity=2.2+Math.sin(t*8)*.3});return g}
 cloud(x,y,z,s=1){const g=this.groupAt(x,y,z);g.scale.setScalar(s);for(let i=0;i<5;i++)this.mesh(new THREE.SphereGeometry(.52,14,10),this.mat('#e5e3d6',{transparent:true,opacity:.85}),i*.45-.9,Math.sin(i)*.18,0,g).scale.set(1,.6,.8);this.ambient(t=>{g.position.x=x+Math.sin(t*.15)*.15});return g}
 ray(x,y,z,h=5){
  const g=this.groupAt(x,y,z),material=new THREE.MeshBasicMaterial({color:'#ffe7b5',alphaMap:clayBeamTexture(),transparent:true,opacity:.085,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  for(let i=0;i<3;i++){const geometry=new THREE.PlaneGeometry(3.8,h),a=geometry.attributes.position;for(let j=0;j<a.count;j++){const v=(a.getY(j)+h/2)/h;a.setX(j,a.getX(j)*(1-v*.55));}const sheet=this.mesh(geometry,material,0,h/2,0,g);sheet.rotation.y=i*Math.PI/3;sheet.castShadow=sheet.receiveShadow=false;sheet.renderOrder=2;}
  g.userData.clayLightShaft=true;return g;
 }
 stars(){const r=random(88),a=[];for(let i=0;i<160;i++){const theta=r()*TAU,phi=r()*Math.PI*.45;const rr=15;a.push(Math.sin(phi)*Math.cos(theta)*rr,Math.cos(phi)*rr,Math.sin(phi)*Math.sin(theta)*rr);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));return this.add(new THREE.Points(geo,new THREE.PointsMaterial({color:'#fff1c8',size:.06,transparent:true,opacity:.9})));}
 lamp(x,y,z){const g=this.groupAt(x,y,z);this.mesh(new THREE.SphereGeometry(.12,12,8),this.mat('#b37b4c'),0,.08,0,g).scale.y=.5;const f=this.fire(x,y+.12,z,.17);g.userData.flame=f;return g}
 animal(kind,x,z,s=1){return createClayAnimal(this,kind,x,z,s)}
 dove(x,y,z){return createClayDove(this,x,y,z)}
 boat(x,z,s=1){const g=this.groupAt(x,.22,z);g.scale.setScalar(s);for(let i=0;i<7;i++){const plank=this.mesh(new THREE.BoxGeometry(1.5+Math.sin(i/6*Math.PI)*.6,.13,.23),this.mat(i%2?'#a3774f':'#926540'),0,-.12,i*.22-.66,g);plank.rotation.x=(i-3)*.03;}for(const side of[-1,1]){const sideMesh=this.mesh(new THREE.BoxGeometry(.13,.55,1.7),this.mat('#9a7048'),side*.86,.09,0,g);sideMesh.rotation.z=-side*.2;}for(const zz of[-.5,.45])this.mesh(new THREE.BoxGeometry(1.6,.1,.22),this.mat('#bb9467'),0,.24,zz,g);this.ambient(t=>{g.rotation.z=Math.sin(t*1.8)*.025;g.rotation.x=Math.sin(t*1.2)*.02});return g}
 flag(x,y,z,c='#d8c6a1'){const g=this.groupAt(x,y,z);this.mesh(new THREE.CylinderGeometry(.025,.035,2.6,8),this.mat('#7a5b37'),0,1.3,0,g);const geo=new THREE.PlaneGeometry(1.2,.65,12,5),m=this.mat(c,{side:THREE.DoubleSide});this.mesh(geo,m,.61,2,0,g);const p=geo.attributes.position,base=new Float32Array(p.array);this.ambient(t=>{for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(base[i*3]*5-t*3)*.08*(base[i*3]+.6));p.needsUpdate=true;geo.computeVertexNormals()});return g}
 table(x,y,z,w=4,d=1.5){const g=this.groupAt(x,y,z);for(let i=0;i<6;i++)this.mesh(new THREE.BoxGeometry(w,.15,d/6-.012),this.mat(i%2?'#92704d':'#a48157'),0,.85,-d/2+(i+.5)*d/6,g);for(const a of[-1,1])for(const b of[-1,1])this.mesh(new THREE.BoxGeometry(.15,.83,.15),this.mat('#795639'),a*(w/2-.25),.4,b*(d/2-.18),g);return g}
 vase(x,y,z){const g=this.groupAt(x,y,z);const pts=[[.12,0],[.23,.1],[.25,.28],[.15,.47],[.12,.55],[.15,.58]].map(([a,b])=>new THREE.Vector2(a,b));this.mesh(new THREE.LatheGeometry(pts,20),this.mat('#b97f59'),0,0,0,g);this.mesh(new THREE.CylinderGeometry(.11,.11,.009,20),this.mat('#4c3e2d'),0,.56,0,g);return g}
 basket(x,y,z){const g=this.groupAt(x,y,z);this.mesh(new THREE.CylinderGeometry(.25,.19,.28,16,1,true),this.mat('#b18c56',{side:THREE.DoubleSide}),0,.14,0,g);for(let i=0;i<5;i++){const ring=this.mesh(new THREE.TorusGeometry(.2+i*.011,.012,4,24),this.mat('#d2b47a'),0,.04+i*.05,0,g);ring.rotation.x=Math.PI/2;}return g}
 book(x,y,z){const g=this.groupAt(x,y,z);this.mesh(new THREE.BoxGeometry(.54,.08,.39),this.mat('#dcd1ad'),0,.06,0,g);this.mesh(new THREE.BoxGeometry(.58,.025,.42),this.mat('#665344'),0,.01,0,g);this.mesh(new THREE.BoxGeometry(.58,.025,.42),this.mat('#665344'),0,.11,0,g);return g}
 plates(x,y,z){const g=this.groupAt(x,y,z);for(let i=0;i<5;i++)this.mesh(new THREE.BoxGeometry(.52,.022,.36),this.mat('#c9a25b',{metalness:.55,roughness:.48}),0,.02+i*.027,0,g);for(let j=0;j<3;j++){const ring=this.mesh(new THREE.TorusGeometry(.06,.013,6,16),this.mat('#ddbd72',{metalness:.6}),-.22,.08,j*.12-.12,g);ring.rotation.x=Math.PI/2;}return g}
 finish(config={}){Object.assign(this.config,config);return this}
 update(t,duration=32){const p=Math.min(t/duration,1),clamped=Math.min(t,duration);for(const f of this.ambients)f(t,p);resetActingFrame(this);for(const f of this.animations)f(clamped,p);applyContextualExpressions(this,clamped,duration);}
 dispose(){const geos=new Set(),mats=new Set();this.group.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());this.animations.length=this.ambients.length=this.people.length=this.labels.length=this.selectables.length=0;this.geometryCache.clear();this.materials.clear();this.group.clear();}
}
