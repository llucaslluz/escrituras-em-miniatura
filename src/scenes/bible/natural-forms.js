import * as THREE from 'three';

const TAU=Math.PI*2;
function smoothSeams(geometry){
 geometry.computeVertexNormals();const p=geometry.attributes.position,n=geometry.attributes.normal,sums=new Map(),keys=[];
 for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(',');keys.push(key);if(!sums.has(key))sums.set(key,new THREE.Vector3());sums.get(key).add(new THREE.Vector3().fromBufferAttribute(n,i));}
 for(const sum of sums.values())sum.normalize();for(let i=0;i<p.count;i++){const v=sums.get(keys[i]);n.setXYZ(i,v.x,v.y,v.z);}n.needsUpdate=true;
}

// A continuous, rounded rock surface. Its broad folds and the few embedded
// outcrops carry the silhouette; no cone is hidden under a pile of ornaments.
export function sculptedMountain(k,x,z,height,{trail=false}={}){
 const root=k.groupAt(x,0,z);root.name=trail?'Monte com percurso de subida':'Encosta rochosa arredondada';
 const segments=40,rings=15,positions=[],colors=[],uv=[],indices=[];
 const dark=new THREE.Color('#908675'),light=new THREE.Color('#afa18a'),path=new THREE.Color('#bdac8d');
 for(let row=0;row<=rings;row++)for(let col=0;col<=segments;col++){
  const r=row/rings,a=col/segments*TAU;
  const width=2.1*(1+.075*Math.sin(a*3+.7)+.035*Math.cos(a*5));
  const px=Math.cos(a)*r*width,pz=Math.sin(a)*r*width*.91;
  const cap=.14,profile=(Math.sqrt(1+cap*cap)-Math.sqrt(r*r+cap*cap))/(Math.sqrt(1+cap*cap)-cap);
  const fold=Math.sin(Math.PI*r)**2*(.045*Math.sin(a*3+.5)+.018*Math.sin(r*22+a*2));
  const py=Math.max(0,height*(profile+fold));positions.push(px,py,pz);uv.push(col/segments,r);
  const shade=.48+.18*Math.sin(a*3+r*4)+.09*Math.cos(a*7-r*3),color=dark.clone().lerp(light,shade);
  // A worn strip follows the existing approach, not a newly invented route.
  if(trail&&pz>.7&&pz<2.1){const distance=Math.abs(px-(-.65-.15*(pz-.8)/3.2));color.lerp(path,Math.max(0,1-distance/.34)*.55);}
  colors.push(...color.toArray());
  if(row<rings&&col<segments){const n=row*(segments+1)+col;indices.push(n,n+1,n+segments+1,n+1,n+segments+2,n+segments+1);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);smoothSeams(geometry);
 const surface=k.mesh(geometry,k.mat('#ffffff',{vertexColors:true,roughness:.9,bumpScale:.02}),0,0,0,root);surface.name='Superficie continua da encosta';
 const stoneGeometry=new THREE.SphereGeometry(1,14,9),p=stoneGeometry.attributes.position;
 for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i),zz=p.getZ(i),warp=1+.065*Math.sin(xx*3.1+yy*2.3)*Math.cos(zz*3.8);p.setXYZ(i,xx*warp,yy*(1+.06*Math.cos(xx*4+zz)),zz*warp);}
 smoothSeams(stoneGeometry);
 const parts=trail?[
  [-1.33,.44,.42,.78,.65,.82,.22], [1.26,.5,.12,.88,.74,.86,-.3],
  [-.64,1.7,-.78,.69,.87,.7,.18], [.67,1.92,-.68,.73,.88,.65,-.2],
 ]:[
  [-.98,.48,.25,1.15,.9,.92,.2], [.75,.54,.46,1.12,.91,.92,-.23],
  [-.44,1.58,-.22,.88,1.12,.74,.17], [.6,1.21,-.57,.94,.86,.8,-.1],
 ];
 const stones=new THREE.InstancedMesh(stoneGeometry,k.mat('#9f947f',{roughness:.9,bumpScale:.018}),parts.length),pose=new THREE.Object3D();
 for(const [i,[xx,yy,zz,sx,sy,sz,rz]]of parts.entries()){pose.position.set(xx,yy,zz);pose.rotation.set(.07,i*.9,rz);pose.scale.set(sx,sy,sz);pose.updateMatrix();stones.setMatrixAt(i,pose.matrix);}
 stones.castShadow=stones.receiveShadow=true;stones.name='Massas de rocha modelada';root.add(stones);
 return root;
}

export function lowBurningBush(k,x,z){
 const root=k.groupAt(x,0,z);root.name='Sarça baixa ramificada';
 const branches=[],leaves=[];
 for(let i=0;i<7;i++){
  const a=i/7*TAU+.2,start=new THREE.Vector3(Math.sin(a)*.13,.03,Math.cos(a)*.1);
  const fork=new THREE.Vector3(Math.sin(a)*.36,.58+(i%3)*.1,Math.cos(a)*.3);
  const tip=new THREE.Vector3(Math.sin(a)*.69,.92+(i%3)*.11,Math.cos(a)*.56);
  branches.push([start,fork],[fork,tip]);
  const twig=fork.clone().add(new THREE.Vector3(Math.cos(a)*.25,.27,-Math.sin(a)*.25));branches.push([fork,twig]);
  for(const point of[tip,twig])for(const side of[-1,1])leaves.push([point.x+Math.cos(a)*.08*side,point.y+.025,point.z-Math.sin(a)*.08*side,a,side]);
 }
 const wood=new THREE.InstancedMesh(new THREE.CylinderGeometry(.028,.04,1,7),k.mat('#776549',{roughness:.88}),branches.length),pose=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
 for(const [i,[a,b]]of branches.entries()){const delta=b.clone().sub(a);pose.position.copy(a).add(b).multiplyScalar(.5);pose.quaternion.setFromUnitVectors(up,delta.clone().normalize());pose.scale.set(1,delta.length(),1);pose.updateMatrix();wood.setMatrixAt(i,pose.matrix);}
 wood.castShadow=wood.receiveShadow=true;root.add(wood);
 const foliage=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,7),k.mat('#7b8753',{roughness:.86}),leaves.length);
 for(const [i,[xx,yy,zz,a,side]]of leaves.entries()){pose.position.set(xx,yy,zz);pose.rotation.set(.18,a,side*.35);pose.scale.set(.16,.055,.095);pose.updateMatrix();foliage.setMatrixAt(i,pose.matrix);foliage.setColorAt(i,new THREE.Color(i%3?'#82905b':'#a0a66b'));}
 foliage.castShadow=foliage.receiveShadow=true;root.add(foliage);return root;
}

export function jonahSea(k){
 const root=k.groupAt(-1.65,.045,.3);root.name='Mar de contorno organico';
 const segments=64,rings=20,positions=[],uv=[],indices=[];
 for(let row=0;row<=rings;row++)for(let col=0;col<=segments;col++){
  const r=row/rings,a=col/segments*TAU;
  let x=Math.cos(a)*(3.5+.13*Math.sin(a*3))*r,z=Math.sin(a)*(4.65+.12*Math.cos(a*4))*r;
  const wx=x+root.position.x,wz=z+root.position.z,fit=Math.min(1,5.76/Math.hypot(wx,wz));x=wx*fit-root.position.x;z=wz*fit-root.position.z;
  positions.push(x,0,z);uv.push(col/segments,r);
  if(row<rings&&col<segments){const n=row*(segments+1)+col;indices.push(n,n+1,n+segments+1,n+1,n+segments+2,n+segments+1);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 geometry.userData.clayWaterSurface=true;geometry.userData.plinthRadius=5.76;
 const water=k.mesh(geometry,k.mat('#2d8694',{transparent:true,opacity:.90,transmission:.32,thickness:.58,ior:1.33,attenuationColor:'#0f5c6e',attenuationDistance:1.4,clearcoat:.52,clearcoatRoughness:.18,metalness:.03,roughness:.22,bumpScale:.012,side:THREE.DoubleSide}),0,0,0,root);water.name='Agua de margem curva';
 const foamBeads=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),k.mat('#f8f4e8',{roughness:.62,bumpScale:.006}),26),foamPose=new THREE.Object3D();
 for(let i=0;i<26;i++){const zz=-4.1+i*.305,xx=1.42+Math.sin(zz*1.6)*.14;foamPose.position.set(xx-root.position.x,.03,zz-root.position.z);foamPose.scale.set(.10+(i%3)*.03,.04,.13+(i%2)*.03);foamPose.rotation.y=Math.sin(i)*.3;foamPose.updateMatrix();foamBeads.setMatrixAt(i,foamPose.matrix);}
 foamBeads.castShadow=false;foamBeads.receiveShadow=true;root.add(foamBeads);
 const waves=new THREE.InstancedMesh(new THREE.TorusGeometry(.25,.008,3,22,Math.PI*1.3),k.mat('#c9d9cb',{transparent:true,opacity:.43,depthWrite:false}),28),pose=new THREE.Object3D();waves.castShadow=false;waves.receiveShadow=true;root.add(waves);
 const position=geometry.attributes.position;
 k.ambient(t=>{
  for(let i=0;i<position.count;i++){const xx=positions[i*3],zz=positions[i*3+2];position.setY(i,Math.sin(zz*3-t*2.1)*.025+Math.sin(xx*5+zz-t*1.3)*.012);}
  position.needsUpdate=true;geometry.computeVertexNormals();geometry.boundingBox=geometry.boundingSphere=null;
  for(let i=0;i<28;i++){const a=i*2.399,r=.24+(i%7)*.095;pose.position.set(Math.cos(a)*3.5*r+Math.sin(t*.45+i)*.055,.04+Math.sin(t*2+i)*.01,Math.sin(a)*4.65*r);pose.rotation.set(-Math.PI/2,0,a);pose.scale.setScalar(.75+(i%4)*.14);pose.updateMatrix();waves.setMatrixAt(i,pose.matrix);}waves.instanceMatrix.needsUpdate=true;
 });return root;
}

export function jonahShore(k){
 const shape=new THREE.Shape();shape.moveTo(1.3,3.65);
 // Shape y is -world z; extrusion becomes the unchanged .11 support height.
 shape.bezierCurveTo(1.15,2.8,1.65,1.8,1.55,.6);shape.bezierCurveTo(1.1,-.5,1.5,-1.3,1.5,-2.1);shape.bezierCurveTo(1.4,-3,1.85,-3.65,2,-4.3);
 shape.bezierCurveTo(2.6,-4.55,3.1,-4.5,3.5,-4.5);shape.bezierCurveTo(4.7,-3.7,5.65,-1.2,5.68,.2);shape.bezierCurveTo(5.65,2.1,4.4,4.1,3.25,4.6);shape.bezierCurveTo(2.3,4.45,1.65,4,1.3,3.65);
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.02,curveSegments:12});geometry.rotateX(-Math.PI/2);
 const shore=k.mesh(geometry,k.mat('#bcae88',{roughness:.9,bumpScale:.02}),0,0,0);shore.name='Margem arredondada de Jonas';return shore;
}

export function greatFish(k){
 const root=k.groupAt(-2,-.5,2),geometry=new THREE.SphereGeometry(.8,24,16),p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),u=z/.8;
  const width=1+.17*u-.36*Math.max(0,-u)**1.2;
  p.setXYZ(i,x*width,y*(1+.12*u)+.045*(1-u*u),z);
 }
 smoothSeams(geometry);
 const body=k.mesh(geometry,k.mat('#759391',{roughness:.69}),0,.5,0,root);body.scale.set(1,.8,2.4);body.name='Corpo esculpido do grande peixe';
 const jaw=k.mesh(new THREE.SphereGeometry(1,16,10),k.mat('#a0aaa0',{roughness:.78}),0,.34,1.38,root);jaw.scale.set(.53,.19,.45);jaw.name='Mandibula arredondada';
 const mouthCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.45,.44,1.49),new THREE.Vector3(0,.43,1.78),new THREE.Vector3(.45,.44,1.49)]);
 k.mesh(new THREE.TubeGeometry(mouthCurve,16,.012,5),k.mat('#526f70',{roughness:.82}),0,0,0,root);
 const finShape=new THREE.Shape();finShape.moveTo(0,-.04);finShape.bezierCurveTo(-.3,.06,-.52,.55,-.84,.54);finShape.bezierCurveTo(-.9,.46,-.69,.12,-.6,0);finShape.bezierCurveTo(-.69,-.12,-.9,-.46,-.84,-.54);finShape.bezierCurveTo(-.52,-.55,-.3,-.06,0,-.04);
 const finGeometry=new THREE.ExtrudeGeometry(finShape,{depth:.065,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:8});finGeometry.rotateY(-Math.PI/2);
 const tail=k.mesh(finGeometry,k.mat('#5e8081',{roughness:.74}),0,.5,-1.65,root);tail.name='Cauda bifurcada arredondada';
 const dorsal=k.mesh(new THREE.SphereGeometry(1,12,8),k.mat('#648785'),0,1.08,-.25,root);dorsal.scale.set(.11,.34,.49);dorsal.rotation.x=-.3;dorsal.name='Nadadeira dorsal';
 const finBase=new THREE.SphereGeometry(1,12,8),fins=new THREE.InstancedMesh(finBase,k.mat('#6a8a87'),2),pose=new THREE.Object3D();
 for(const [i,side]of[-1,1].entries()){pose.position.set(side*.67,.37,.45);pose.rotation.set(.3,side*.4,side*.4);pose.scale.set(.44,.07,.25);pose.updateMatrix();fins.setMatrixAt(i,pose.matrix);}fins.castShadow=fins.receiveShadow=true;root.add(fins);
 for(const side of[-1,1])k.mesh(new THREE.SphereGeometry(.06,10,8),k.mat('#343d39'),side*.57,.7,1.18,root);
 return {root,body,tail};
}
