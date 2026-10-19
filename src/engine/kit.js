import * as THREE from 'three';

const TAU=Math.PI*2;
export const smooth=(a,b,t)=>{const p=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return p*p*(3-2*p)};
export function random(seed=19){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
let feltTexture;
export function makeFelt(){
  if(feltTexture)return feltTexture;
  const size=256,data=new Uint8Array(size*size*4),r=random(721);
  for(let i=0;i<size*size;i++){const n=155+r()*90;data[i*4]=data[i*4+1]=data[i*4+2]=n;data[i*4+3]=255;}
  // Short directional fibers, reproducible in the exported source.
  for(let i=0;i<13000;i++){const x=Math.floor(r()*size),y=Math.floor(r()*size),len=2+Math.floor(r()*6),v=110+r()*145;for(let j=0;j<len;j++){const p=(((y+j)%size)*size+(x+Math.floor(j*.4))%size)*4;data[p]=data[p+1]=data[p+2]=v;}}
  feltTexture=new THREE.DataTexture(data,size,size);feltTexture.wrapS=feltTexture.wrapT=THREE.RepeatWrapping;feltTexture.repeat.set(3,3);feltTexture.needsUpdate=true;return feltTexture;
}

export class Kit{
 constructor(id='scene',options={}){
  this.id=id;this.group=new THREE.Group();this.group.name=id;this.animations=[];this.ambients=[];this.people=[];this.selectables=[];this.labels=[];this.materials=new Map();this.config={camera:[9,7.5,11],target:[0,1,0],ground:'#b7a47a',...options};this.THREE=THREE;
  this.light=new THREE.DirectionalLight('#ffe5b5',3.3);this.light.position.set(-3,9,5);this.light.castShadow=true;this.light.shadow.mapSize.set(1024,1024);Object.assign(this.light.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:28});this.light.shadow.bias=-.001;this.light.shadow.normalBias=.035;this.light.shadow.radius=3;this.group.add(this.light);
  this.fill=new THREE.HemisphereLight('#e7eff1','#a27e50',2.2);this.group.add(this.fill);this.background=new THREE.Color('#e7e8da');
  this.ground=this.cylinder(6,.38,'#af936c',0,-.23,0);this.ground.name='Base artesanal';
  this.cylinder(6.02,.08,'#8f7252',0,-.44,0);this.top=this.cylinder(5.99,.035,this.config.ground,0,-.018,0);
  const r=random(44);for(let i=0;i<52;i++){const angle=i/52*TAU;const stitch=this.box(.1,.015,.035,'#e0cfaa',Math.sin(angle)*6.005,-.18,Math.cos(angle)*6.005);stitch.rotation.y=angle;}
  for(let i=0;i<70;i++){const a=r()*TAU,rad=Math.sqrt(r())*5.7;this.sphere(.012+r()*.018,'#d8c9a5',Math.cos(a)*rad,.008,Math.sin(a)*rad).scale.y=.4;}
 }
 mat(color,options={}){const key=color+JSON.stringify(options);if(!this.materials.has(key))this.materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.92,bumpMap:makeFelt(),bumpScale:.045,...options}));return this.materials.get(key)}
 add(o){this.group.add(o);return o}
 mesh(g,m,x=0,y=0,z=0,parent=this.group){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 box(w,h,d,c,x=0,y=0,z=0){return this.mesh(new THREE.BoxGeometry(w,h,d,1,1,1),this.mat(c),x,y,z)}
 sphere(r,c,x=0,y=0,z=0){return this.mesh(new THREE.SphereGeometry(r,16,12),this.mat(c),x,y,z)}
 cylinder(r,h,c,x=0,y=0,z=0){return this.mesh(new THREE.CylinderGeometry(r*.96,r,h,32),this.mat(c),x,y,z)}
 groupAt(x=0,y=0,z=0){const o=new THREE.Group();o.position.set(x,y,z);return this.add(o)}
 animate(f){this.animations.push(f);return f}
 ambient(f){this.ambients.push(f);return f}
 select(object,name,role='',reference='',summary=''){object.userData.selectable=name;this.selectables.push({object,name,role,reference,summary});return object}
 label(object,text){if(!this.labels.some(l=>l.object===object&&l.text===text))this.labels.push({object,text});return object}
 person(name,x,z,o={}){
  const root=this.groupAt(x,o.y||0,z),skin=o.skin||'#bc8c65',cloth=o.robe||'#e3d5b4',hair=o.hair||'#4c362c';root.rotation.y=o.rotation||0;root.scale.setScalar(o.scale||1);
  const local=(g,c,x,y,z,parent=root)=>this.mesh(g,this.mat(c),x,y,z,parent);
  const robe=local(new THREE.LatheGeometry([new THREE.Vector2(.29,.18),new THREE.Vector2(.31,.23),new THREE.Vector2(.26,.52),new THREE.Vector2(.22,.89),new THREE.Vector2(.24,1.08),new THREE.Vector2(.17,1.2)],24),cloth,0,0,0);
  const belt=local(new THREE.TorusGeometry(.235,.027,6,30),'#88715a',0,.67,0);belt.rotation.x=Math.PI/2;
  for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.115,.42,0);root.add(leg);local(new THREE.CapsuleGeometry(.065,.26,4,8),cloth,0,-.16,0,leg);const foot=local(new THREE.SphereGeometry(.1,12,8),'#694b33',0,-.37,.055,leg);foot.scale.set(.9,.45,1.6);local(new THREE.BoxGeometry(.13,.022,.03),cloth,0,-.33,.09,leg);if(side<0)root.userData.leftLeg=leg;else root.userData.rightLeg=leg;}
  const head=new THREE.Group();head.position.set(0,1.37,0);root.add(head);
  const face=local(new THREE.SphereGeometry(.235,24,20),skin,0,0,0,head);face.scale.set(.9,1.07,.9);
  local(new THREE.SphereGeometry(.224,20,12,0,TAU,0,Math.PI*.61),hair,0,.055,-.017,head);
  for(const side of [-1,1]){local(new THREE.SphereGeometry(.045,10,8),skin,side*.211,-.014,0,head);const lock=local(new THREE.SphereGeometry(.075,10,8),hair,side*.18,.01,-.035,head);lock.scale.set(.55,1.6,1);local(new THREE.SphereGeometry(.014,10,8),'#322a24',side*.075,.006,.187,head);const brow=local(new THREE.CapsuleGeometry(.009,.045,3,6),hair,side*.074,.05,.182,head);brow.rotation.z=Math.PI/2;}
  local(new THREE.SphereGeometry(.033,12,8),skin,0,-.035,.211,head).scale.set(.7,1,1);
  const mouth=local(new THREE.CapsuleGeometry(.006,.042,3,6),'#92644e',0,-.091,.188,head);mouth.rotation.z=Math.PI/2;
  if(o.beard!==false){const beard=local(new THREE.SphereGeometry(.14,16,12),hair,0,-.124,.073,head);beard.scale.set(.95,.78,.8);local(new THREE.SphereGeometry(.08,12,8),skin,0,-.07,.155,head);}
  if(o.mantle){const mantle=local(new THREE.SphereGeometry(.28,20,16),o.mantle,0,.97,-.04);mantle.scale.set(1.08,1.08,.65);const drape=local(new THREE.CapsuleGeometry(.09,.63,5,12),o.mantle,-.2,.65,.15);drape.rotation.z=-.12;}
  const arms={};for(const [side,suffix]of[[-1,'L'],[1,'R']]){const shoulder=new THREE.Group();shoulder.position.set(side*.24,1.08,0);root.add(shoulder);local(new THREE.CapsuleGeometry(.09,.22,5,12),cloth,0,-.15,0,shoulder);const elbow=new THREE.Group();elbow.position.y=-.31;shoulder.add(elbow);local(new THREE.CapsuleGeometry(.065,.19,4,10),cloth,0,-.12,0,elbow);const hand=new THREE.Group();hand.position.set(0,-.27,0);elbow.add(hand);local(new THREE.SphereGeometry(.067,12,8),skin,0,0,0,hand).scale.set(.8,1.2,.8);arms[suffix]={shoulder,elbow,hand};}
  // Visible hand stitching along the hem and front seam.
  for(let i=0;i<20;i++){const a=i/20*TAU;const s=local(new THREE.CapsuleGeometry(.004,.028,2,4),'#f2e6c9',Math.sin(a)*.295,.235,Math.cos(a)*.295);s.rotation.z=.6;}
  for(let i=0;i<8;i++)local(new THREE.BoxGeometry(.022,.006,.006),'#baa584',.025,.31+i*.074,.29-i*.009);
  const rig={root,head,robe,leftArm:arms.L.shoulder,rightArm:arms.R.shoulder,leftForearm:arms.L.elbow,rightForearm:arms.R.elbow,handL:arms.L.hand,handR:arms.R.hand,leftLeg:root.userData.leftLeg,rightLeg:root.userData.rightLeg};this.people.push(rig);this.select(root,name,'Personagem deste episódio','','Selecione o nome na lista para ler o contexto e as referências.');this.label(root,name);
  this.ambient(t=>{robe.scale.x=1+Math.sin(t*1.5+x)*.008;head.rotation.z=Math.sin(t*.8+x)*.012});return rig;
 }
 walk(rig,from,to,start,end){this.animate(t=>{const p=smooth(start,end,t),moving=t>start&&t<end;rig.root.position.x=THREE.MathUtils.lerp(from[0],to[0],p);rig.root.position.z=THREE.MathUtils.lerp(from[1],to[1],p);rig.root.rotation.y=Math.atan2(to[0]-from[0],to[1]-from[1]);const stride=moving?Math.sin((t-start)*7)*.32:0;rig.leftLeg.rotation.x=stride;rig.rightLeg.rotation.x=-stride;rig.leftArm.rotation.x=-stride*.5;rig.rightArm.rotation.x=stride*.5});}
 rock(x,z,s=1){const r=this.mesh(new THREE.DodecahedronGeometry(.5,1),this.mat('#8b8a78'),x,.22*s,z);r.scale.set(s,s*.65,s*.8);r.rotation.set(.1,x,.1);return r}
 tree(x,z,s=1,kind='olive'){
  const g=this.groupAt(x,0,z);g.scale.setScalar(s);const mesh=(geo,col,px,py,pz,p=g)=>this.mesh(geo,this.mat(col),px,py,pz,p);
  mesh(new THREE.CylinderGeometry(.13,.24,1.6,9),'#796348',0,.8,0).rotation.z=.09;
  for(let j=0;j<3;j++){const b=mesh(new THREE.CylinderGeometry(.065,.12,.92,7),'#796348',(j-1)*.22,1.48,0);b.rotation.z=(j-1)*-.6;}
  const canopy=new THREE.Group();canopy.position.y=1.9;g.add(canopy);const r=random(Math.round((x+10)*212+(z+12)*17));
  if(kind==='palm'){for(let j=0;j<8;j++){const leaf=mesh(new THREE.SphereGeometry(.48,12,6),'#6a8150',Math.sin(j/8*TAU)*.6,.1,Math.cos(j/8*TAU)*.6,canopy);leaf.scale.set(.3,.12,2.1);leaf.rotation.y=j/8*TAU;leaf.rotation.x=.3;}}
  else{for(let j=0;j<36;j++){const a=r()*TAU,rr=Math.sqrt(r())*.9;const leaf=mesh(new THREE.SphereGeometry(.24,10,8),j%3?'#778553':'#a2ac77',Math.cos(a)*rr,(r()-.5)*.65,Math.sin(a)*rr,canopy);leaf.scale.set(1.25,.55,.8);leaf.rotation.set(r(),r()*TAU,r());}for(let j=0;j<18;j++){const a=r()*TAU;const leaf=mesh(new THREE.SphereGeometry(.16,8,6),'#b4bd86',Math.cos(a)*.9,(r()-.5)*.6,Math.sin(a)*.9,canopy);leaf.scale.set(.3,.12,1.1);leaf.rotation.y=-a;}}
  this.ambient(t=>{canopy.rotation.z=Math.sin(t*1.1+x)*.018;canopy.rotation.x=Math.cos(t*.7+z)*.012});return g;
 }
 water(width,length,x=0,z=0,o={}){
  const g=this.groupAt(x,o.y??.045,z),geo=new THREE.PlaneGeometry(width,length,24,64);geo.rotateX(-Math.PI/2);const arr=geo.attributes.position,base=new Float32Array(arr.array);for(let i=0;i<arr.count;i++){if(o.river)base[i*3]+=Math.sin(base[i*3+2]*.58)*.52;}arr.array.set(base);
  const m=this.mat(o.color||'#6eaaa6',{transparent:true,opacity:.82,metalness:.25,roughness:.3,bumpScale:.018,side:THREE.DoubleSide});this.mesh(geo,m,0,0,0,g);
  const r=random(159);if(o.river){for(let i=0;i<32;i++){const rz=(r()-.5)*length,rx=(r()-.5)*width+Math.sin(rz*.58)*.52;const stone=this.rock(x+rx,z+rz,.12+r()*.2);stone.position.y=-.06;} }
  const ripples=[];for(let i=0;i<28;i++){const rz=(r()-.5)*length,rx=(r()-.5)*width*.88;const wave=this.mesh(new THREE.TorusGeometry(.18+r()*.18,.008,3,22,Math.PI*1.3),this.mat('#d5e5ce',{transparent:true,opacity:.5}),rx,.025,rz,g);wave.rotation.x=-Math.PI/2;wave.scale.set(1,.4,1);ripples.push({wave,x:rx,z:rz});}
  this.ambient(t=>{for(let i=0;i<arr.count;i++){const xx=base[i*3],zz=base[i*3+2];arr.setY(i,Math.sin(zz*3-t*2.1)*.025+Math.sin(xx*5+zz-t*1.3)*.012);}arr.needsUpdate=true;geo.computeVertexNormals();for(const w of ripples){w.wave.position.z=((w.z+length/2+t*.25)%length+length)%length-length/2;w.wave.position.x=w.x+(o.river?Math.sin(w.wave.position.z*.58)*.52:0);w.wave.position.y=.04+Math.sin(t*2+w.x)*.01;}});return g;
 }
 fire(x,y,z,s=1){const g=this.groupAt(x,y,z);g.scale.setScalar(s);const flames=[];for(let j=0;j<6;j++){const f=this.mesh(new THREE.SphereGeometry(.16,12,8),this.mat(j%2?'#f5b94c':'#de7438',{emissive:'#c26320',emissiveIntensity:.7,transparent:true,opacity:.8}),Math.sin(j)*.18,.22,Math.cos(j)*.13,g);f.scale.set(.65,2,.65);flames.push(f);}const light=new THREE.PointLight('#ffc26b',2.5,5);light.position.y=.5;g.add(light);this.ambient(t=>{flames.forEach((f,i)=>{f.scale.y=1.4+Math.sin(t*7+i)*.6;f.rotation.z=Math.sin(t*4+i)*.2});light.intensity=2.2+Math.sin(t*8)*.3});return g}
 cloud(x,y,z,s=1){const g=this.groupAt(x,y,z);g.scale.setScalar(s);for(let i=0;i<5;i++)this.mesh(new THREE.SphereGeometry(.52,14,10),this.mat('#e5e3d6',{transparent:true,opacity:.85}),i*.45-.9,Math.sin(i)*.18,0,g).scale.set(1,.6,.8);this.ambient(t=>{g.position.x=x+Math.sin(t*.15)*.15});return g}
 ray(x,y,z,h=5){const g=this.groupAt(x,y,z);const m=this.mat('#ffeac0',{emissive:'#f1d5a1',emissiveIntensity:.7,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide});this.mesh(new THREE.CylinderGeometry(.18,1.2,h,24,1,true),m,0,h/2,0,g);return g}
 stars(){const r=random(88),a=[];for(let i=0;i<160;i++){const theta=r()*TAU,phi=r()*Math.PI*.45;const rr=15;a.push(Math.sin(phi)*Math.cos(theta)*rr,Math.cos(phi)*rr,Math.sin(phi)*Math.sin(theta)*rr);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));return this.add(new THREE.Points(geo,new THREE.PointsMaterial({color:'#fff1c8',size:.06,transparent:true,opacity:.9})));}
 lamp(x,y,z){const g=this.groupAt(x,y,z);this.mesh(new THREE.SphereGeometry(.12,12,8),this.mat('#b37b4c'),0,.08,0,g).scale.y=.5;const f=this.fire(x,y+.12,z,.17);g.userData.flame=f;return g}
 animal(kind,x,z,s=1){
  if(kind==='bird')return this.dove(x,.5,z);
  const g=this.groupAt(x,0,z);g.scale.setScalar(s);const col=kind==='lion'?'#ba925d':kind==='donkey'?'#938c7a':kind==='fish'?'#b7c7ae':'#e5dfc5';
  const local=(geo,c,px,py,pz,p=g)=>this.mesh(geo,this.mat(c),px,py,pz,p);
  const body=local(new THREE.SphereGeometry(.35,16,12),col,0,.49,0);body.scale.set(.9,.85,1.6);
  const head=new THREE.Group();head.position.set(0,.7,.48);g.add(head);if(kind==='lion')local(new THREE.SphereGeometry(.3,16,12),'#866346',0,0,0,head).scale.set(1,1,.7);local(new THREE.SphereGeometry(.205,16,12),col,0,0,.09,head);local(new THREE.SphereGeometry(.1,12,8),'#d7b788',0,-.065,.26,head).scale.set(1.2,.65,.8);
  for(const side of [-1,1]){local(new THREE.SphereGeometry(.055,10,8),col,side*.13,.15,0,head).scale.y=kind==='donkey'?2.8:1;local(new THREE.SphereGeometry(.013,8,6),'#302a24',side*.085,.03,.26,head);for(const zz of[-.32,.32])local(new THREE.CapsuleGeometry(.055,.32,4,8),col,side*.21,.2,zz);}
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.5,-.4),new THREE.Vector3(.12,.42,-.7),new THREE.Vector3(.3,.55,-.84)]);const tail=local(new THREE.TubeGeometry(curve,12,.026,5),col,0,0,0);if(kind==='lion')local(new THREE.SphereGeometry(.06,10,8),'#866346',.3,.55,-.84);
  this.ambient(t=>{body.scale.x=.9+Math.sin(t*1.8+x)*.018;head.rotation.y=Math.sin(t*.8+z)*.12;tail.rotation.z=Math.sin(t*1.5)*.1});return g;
 }
 dove(x,y,z){const g=this.groupAt(x,y,z);this.mesh(new THREE.SphereGeometry(.14,16,12),this.mat('#f5f1da'),0,0,0,g).scale.set(.65,.8,1.6);this.mesh(new THREE.SphereGeometry(.09,12,10),this.mat('#fff7df'),0,.1,.17,g);this.mesh(new THREE.ConeGeometry(.027,.12,8),this.mat('#d0a553'),0,.08,.28,g).rotation.x=Math.PI/2;const wings=[];for(const side of[-1,1]){const wing=new THREE.Group();wing.position.x=side*.07;g.add(wing);for(let i=0;i<5;i++){const f=this.mesh(new THREE.SphereGeometry(.14,10,8),this.mat('#f2eddf'),side*(.12+i*.04),0,-i*.028,wing);f.scale.set(1.3,.12,.3);}wings.push(wing);}this.ambient(t=>{wings[0].rotation.z=Math.sin(t*9)*.75;wings[1].rotation.z=-Math.sin(t*9)*.75});g.userData.wings=wings;return g}
 boat(x,z,s=1){const g=this.groupAt(x,.22,z);g.scale.setScalar(s);for(let i=0;i<7;i++){const plank=this.mesh(new THREE.BoxGeometry(1.5+Math.sin(i/6*Math.PI)*.6,.13,.23),this.mat(i%2?'#a3774f':'#926540'),0,-.12,i*.22-.66,g);plank.rotation.x=(i-3)*.03;}for(const side of[-1,1]){const sideMesh=this.mesh(new THREE.BoxGeometry(.13,.55,1.7),this.mat('#9a7048'),side*.86,.09,0,g);sideMesh.rotation.z=-side*.2;}for(const zz of[-.5,.45])this.mesh(new THREE.BoxGeometry(1.6,.1,.22),this.mat('#bb9467'),0,.24,zz,g);this.ambient(t=>{g.rotation.z=Math.sin(t*1.8)*.025;g.rotation.x=Math.sin(t*1.2)*.02});return g}
 flag(x,y,z,c='#d8c6a1'){const g=this.groupAt(x,y,z);this.mesh(new THREE.CylinderGeometry(.025,.035,2.6,8),this.mat('#7a5b37'),0,1.3,0,g);const geo=new THREE.PlaneGeometry(1.2,.65,12,5),m=this.mat(c,{side:THREE.DoubleSide});this.mesh(geo,m,.61,2,0,g);const p=geo.attributes.position,base=new Float32Array(p.array);this.ambient(t=>{for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(base[i*3]*5-t*3)*.08*(base[i*3]+.6));p.needsUpdate=true;geo.computeVertexNormals()});return g}
 table(x,y,z,w=4,d=1.5){const g=this.groupAt(x,y,z);for(let i=0;i<6;i++)this.mesh(new THREE.BoxGeometry(w,.15,d/6-.012),this.mat(i%2?'#92704d':'#a48157'),0,.85,-d/2+(i+.5)*d/6,g);for(const a of[-1,1])for(const b of[-1,1])this.mesh(new THREE.BoxGeometry(.15,.83,.15),this.mat('#795639'),a*(w/2-.25),.4,b*(d/2-.18),g);return g}
 vase(x,y,z){const g=this.groupAt(x,y,z);const pts=[[.12,0],[.23,.1],[.25,.28],[.15,.47],[.12,.55],[.15,.58]].map(([a,b])=>new THREE.Vector2(a,b));this.mesh(new THREE.LatheGeometry(pts,20),this.mat('#b97f59'),0,0,0,g);this.mesh(new THREE.CylinderGeometry(.11,.11,.009,20),this.mat('#4c3e2d'),0,.56,0,g);return g}
 basket(x,y,z){const g=this.groupAt(x,y,z);this.mesh(new THREE.CylinderGeometry(.25,.19,.28,16,1,true),this.mat('#b18c56',{side:THREE.DoubleSide}),0,.14,0,g);for(let i=0;i<5;i++){const ring=this.mesh(new THREE.TorusGeometry(.2+i*.011,.012,4,24),this.mat('#d2b47a'),0,.04+i*.05,0,g);ring.rotation.x=Math.PI/2;}return g}
 book(x,y,z){const g=this.groupAt(x,y,z);this.mesh(new THREE.BoxGeometry(.54,.08,.39),this.mat('#dcd1ad'),0,.06,0,g);this.mesh(new THREE.BoxGeometry(.58,.025,.42),this.mat('#665344'),0,.01,0,g);this.mesh(new THREE.BoxGeometry(.58,.025,.42),this.mat('#665344'),0,.11,0,g);return g}
 plates(x,y,z){const g=this.groupAt(x,y,z);for(let i=0;i<5;i++)this.mesh(new THREE.BoxGeometry(.52,.022,.36),this.mat('#c9a25b',{metalness:.55,roughness:.48}),0,.02+i*.027,0,g);for(let j=0;j<3;j++){const ring=this.mesh(new THREE.TorusGeometry(.06,.013,6,16),this.mat('#ddbd72',{metalness:.6}),-.22,.08,j*.12-.12,g);ring.rotation.x=Math.PI/2;}return g}
 finish(config={}){Object.assign(this.config,config);return this}
 update(t,duration=32){const p=Math.min(t/duration,1);for(const f of this.ambients)f(t,p);for(const f of this.animations)f(Math.min(t,duration),p);}
 dispose(){const geos=new Set(),mats=new Set();this.group.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());this.animations.length=this.ambients.length=this.people.length=this.labels.length=this.selectables.length=0;this.group.clear();}
}
