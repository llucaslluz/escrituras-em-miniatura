import * as THREE from 'three';
import {reveal,groundFigure} from './vision-polish.js';
import { planStages, stories as dcStories } from '../data/dc.js';

const ease=(t,a,b)=>{const v=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
const lerp=THREE.MathUtils.lerp;
const attach=(p,o)=>{p.add(o);return o;};
function timberRoom(k,{width=8,depth=7,wall='#b8ac8e',floor='#8b6448'}={}){
  k.box(width,.16,depth,floor,0,.02,0);
  for(let i=0;i<14;i++)k.box(width,.012,.025,'#614733',0,.11,-depth/2+i*depth/14);
  k.box(width,3.5,.18,wall,0,1.75,-depth/2);
  k.box(.18,3.5,depth,wall,-width/2,1.75,0);
  for(let i=0;i<8;i++)k.box(.055,3.5,.08,'#8c7356',-width/2+i*width/7,1.75,-depth/2+.11);
  const w=k.groupAt(1.8,2,-depth/2+.12);
  attach(w,k.box(1.45,1.3,.05,'#b7d7d7',0,0,0));
  for(const x of [-.77,0,.77])attach(w,k.box(.075,1.45,.1,'#634c38',x,0,.04));
  for(const y of [-.72,0,.72])attach(w,k.box(1.62,.07,.1,'#634c38',0,y,.04));
  return w;
}
function bench(k,x,z,w=3.4){k.box(w,.16,.5,'#80583b',x,.48,z);for(const dx of [-w*.39,w*.39])k.box(.14,.48,.3,'#67452f',x+dx,.22,z);}
function leafFloor(k){for(let i=0;i<30;i++){const a=i*2.399,r=1.5+(i%8)*.5;k.sphere(.05,i%2?'#a89051':'#6d7a40',Math.cos(a)*r,.07,Math.sin(a)*r);}}
function grove(k){k.config.ground='#78824b';for(const [x,z,s] of [[-4,-2,1.2],[-3,-4,1.5],[1,-4,1.4],[4,-3,1.3],[4,1,1.1],[-4,2,.95]])k.tree(x,z,s);leafFloor(k);}
function praying(r,t,start=0,end=8){const v=ease(t,start,end);r.leftArm.rotation.z=-.55*v;r.rightArm.rotation.z=.55*v;r.leftForearm.rotation.x=-1.3*v;r.rightForearm.rotation.x=-1.3*v;r.head.rotation.x=.25*v;}
function reachHead(r,side,recipient,amount){
  // Two-bone reach: upper arm .31 and forearm .27, both initially down.
  // Derive both joint rotations from the current head position, never from
  // a previous animation frame, so seeking and replay preserve contact.
  recipient.head.updateWorldMatrix(true,false);r.root.updateWorldMatrix(true,false);
  // Rest the clay palm on the enlarged crown, slightly towards the minister.
  // This keeps contact reachable without changing the articulated arm bones.
  const clay=recipient.root.userData.clayPerson;
  const target=(clay?new THREE.Vector3(0,clay.crownOffset+.03,.14):new THREE.Vector3(0,.275,0)).applyMatrix4(recipient.head.matrixWorld);
  r.root.worldToLocal(target);const shoulder=side==='L'?r.leftArm:r.rightArm,elbow=side==='L'?r.leftForearm:r.rightForearm;
  const delta=target.sub(shoulder.position),length=THREE.MathUtils.clamp(delta.length(),.041,.5799),direction=delta.normalize();
  const pole=new THREE.Vector3(0,-1,0).addScaledVector(direction,direction.y).normalize();
  const projection=(.31*.31-.27*.27+length*length)/(2*length),height=Math.sqrt(Math.max(0,.31*.31-projection*projection));
  const elbowPoint=direction.clone().multiplyScalar(projection).addScaledVector(pole,height);
  const upper=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),elbowPoint.clone().normalize());
  const forearm=direction.multiplyScalar(length).sub(elbowPoint).normalize().applyQuaternion(upper.clone().invert());
  const lower=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),forearm);
  shoulder.quaternion.identity().slerp(upper,amount);elbow.quaternion.identity().slerp(lower,amount);
}
function paper(k,x,y,z){const p=k.box(.8,.025,.55,'#f1e2bc',x,y,z);for(let i=0;i<5;i++){const l=k.box(.55,.006,.012,'#977d62',x,y+.016,z-.2+i*.075);p.attach(l);}return p;}
function christ(k,x,z,y=0,name='Jesus Cristo'){return k.person(name,x,z,{y,robe:'#f4eee1',mantle:'#e2ceb0',hair:'#714f38',skin:'#cc9b77',beard:true,scale:1.12});}
function temple(k){timberRoom(k,{width:8.4,depth:7.6,wall:'#eee5d1',floor:'#ac8663'});for(const x of [-3.6,3.6]){k.cylinder(.2,3.6,'#eee7d7',x,1.85,-1.8);k.box(.65,.14,.65,'#ded4bd',x,3.6,-1.8);}for(let i=0;i<3;i++){k.box(4.2-i*.5,.3,.85,'#d3c6ac',0,.25+i*.3,-2.6-i*.12);k.box(1.2,.65,.6,'#eee5cf',-1.35+i*1.35,1.1,-2.7);}k.box(5,.08,.12,'#9f8963',0,1.48,-2.3);}
function emblem(k,kind,x,y,z,color){const g=k.groupAt(x,y,z);if(kind==='sun'){attach(g,k.sphere(.45,color,0,0,0));for(let i=0;i<12;i++){const a=i*Math.PI/6;const ray=k.box(.11,.33,.1,color,Math.sin(a)*.67,Math.cos(a)*.67,0);ray.rotation.z=-a;attach(g,ray);}}else if(kind==='moon'){const m=k.mesh(new THREE.TorusGeometry(.43,.13,8,32,Math.PI*1.55),k.mat(color),0,0,0,g);m.rotation.z=-Math.PI*.77;}else{for(let i=0;i<5;i++){const a=i*Math.PI/2.5;const p=k.mesh(new THREE.ConeGeometry(.18,.49,3),k.mat(color),Math.sin(a)*.25,Math.cos(a)*.25,0,g);p.rotation.z=-a;}}return g;}
function arrow(k,a,b,color='#cfb77a'){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b);const d=vb.clone().sub(va),len=d.length();const g=k.groupAt(...va.toArray());g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());const rod=k.mesh(new THREE.CylinderGeometry(.035,.035,len-.2,7),k.mat(color),0,len/2,0,g);k.mesh(new THREE.ConeGeometry(.13,.28,8),k.mat(color),0,len-.12,0,g);return rod;}

export const builders={
 D01(k){
  grove(k);k.water(3,10,-2.9,0,{river:true,y:.02,color:'#537f88'});for(let i=0;i<11;i++)k.rock(-1.65,-4.5+i*.8,.25+(i%3)*.09);
  const joseph=k.person('Joseph Smith',-.55,.6,{robe:'#c2ac86',mantle:'#5b6b71',hair:'#6e4b32',beard:false});
  const oliver=k.person('Oliver Cowdery',.65,.6,{robe:'#8f8e74',mantle:'#5a5547',hair:'#3a2b23',beard:false});
  const john=k.person('João Batista',.05,.2,{robe:'#f4ead6',mantle:'#e3d7bb',hair:'#8b775a',beard:true,scale:1.08});
  const ray=k.ray(0,.05,0,5);k.label(john.root,'João Batista');
  k.animate(t=>{const appear=ease(t,7,12),ord=ease(t,12,16)*(1-ease(t,23,27)),end=ease(t,24,30);john.root.visible=t>=7;john.root.scale.setScalar(1.08);ray.visible=t>=7;ray.scale.set(appear,1,appear);praying(joseph,t);praying(oliver,t);[joseph,oliver].forEach((r,i)=>{r.root.position.y=-.25*(1-end);r.leftLeg.rotation.x=r.rightLeg.rotation.x=-1.1*(1-end);r.head.rotation.x=.2*(1-end)-.18*end;r.head.rotation.y=(i?-.12:.12)*end;});reachHead(john,'L',joseph,ord);reachHead(john,'R',oliver,ord);k.light.intensity=2+appear*.8;});
  reveal(k,john.root,t=>ease(t,7,12));
  k.animate(()=>{groundFigure(joseph);groundFigure(oliver);});
  k.finish({camera:[8,5.5,10],target:[0,1.2,0]});
 },
 D02(k){
  grove(k);const joseph=k.person('Joseph Smith',-1.8,.8,{robe:'#a99575',mantle:'#5c6872',beard:false});
  const oliver=k.person('Oliver Cowdery',-3,.5,{robe:'#99896a',mantle:'#555a4c',beard:false});
  const david=k.person('David Whitmer',-1.8,2,{robe:'#b2a68a',mantle:'#6c695c',beard:false});
  const martin=k.person('Martin Harris',3,.9,{robe:'#a18a65',mantle:'#63533d',hair:'#777063',beard:false});
  const angel=k.person('Morôni',-2,-.8,{robe:'#f7edd8',mantle:'#e8d8b1',hair:'#a59a7d',scale:1.05});
  const plates=k.plates(0,0,0);angel.handR.add(plates);plates.position.set(0,-.06,.12);plates.scale.setScalar(.7);
  const lightA=k.ray(-2,.05,-.5,5),lightB=k.ray(2.8,.05,-.5,5);k.label(plates,'Placas mostradas às testemunhas');
  k.select(plates,'Placas','Registro apresentado pelo mensageiro','D&C 17; Depoimento de Três Testemunhas','As testemunhas declaram ter visto as placas pelo poder de Deus. As duas manifestações são encenadas em sequência.');
  k.walk(joseph,[-1.8,.8],[2,.8],17,23);
  k.animate(t=>{const first=t>=7&&t<17,second=t>=24;angel.root.visible=first||second;angel.root.position.x=second?2.8:-2;lightA.visible=first;lightB.visible=second;angel.rightArm.rotation.x=-1.15;angel.rightForearm.rotation.x=-.3;angel.leftArm.rotation.z=-.55*ease(t,8,13);angel.head.rotation.y=.2*Math.sin(t*.45);[oliver,david].forEach((r,i)=>{praying(r,t,0,5);r.head.rotation.x=-.25*ease(t,8,12);r.rightArm.rotation.z=.5*ease(t,9+i,14+i);});praying(martin,t,0,6);martin.head.rotation.x=.3-.6*ease(t,24,28);martin.rightArm.rotation.z=.45+ease(t,25,29)*.25;martin.leftArm.rotation.z=-.45-ease(t,25,29)*.25;joseph.head.rotation.x=-.2*(first||second?1:0);joseph.leftArm.rotation.z=-.55*(first||second?1:0);joseph.rightArm.rotation.z=.55*(first||second?1:0);joseph.root.rotation.y=t>17?-.5:0;});
  reveal(k,angel.root,t=>ease(t,7,9)*(1-ease(t,15,17))+ease(t,24,27));
  reveal(k,lightA,t=>ease(t,7,9)*(1-ease(t,15,17)));reveal(k,lightB,t=>ease(t,24,27));
  k.animate(t=>{const witness=ease(t,7,10)*(1-ease(t,15,17))+ease(t,24,27);joseph.head.rotation.x=-.2*witness;joseph.leftArm.rotation.z=-.55*witness;joseph.rightArm.rotation.z=.55*witness;joseph.root.rotation.y=-.5*ease(t,17,19);});
  k.finish({camera:[10,6,11],target:[0,1,0]});
 },
 D03(k){
  timberRoom(k);const table=k.table(0,0,-1.8,3.8,1.1);k.book(-.7,1.05,-1.8);paper(k,.7,1.06,-1.8);k.lamp(1.3,1.05,-1.8);bench(k,-2,1.7,2.8);bench(k,1.8,1.7,2.8);
  const joseph=k.person('Joseph Smith',-.8,-2.4,{robe:'#b5aa8b',mantle:'#495867',beard:false});const oliver=k.person('Oliver Cowdery',1.1,-2.4,{robe:'#95896f',mantle:'#4f574c',beard:false});
  const crowd=[[-2.5,.4],[-1.1,.5],[.4,.5],[2,.4]].map(([x,z],i)=>k.person(i===0?'Participantes':`Participante ${i+1}`,x,z,{robe:['#a77c62','#7e8b82','#b7a18b','#88805f'][i],mantle:'#d1ba91',hair:i===3?'#9c907b':'#553c2b',scale:.95,beard:i%2===0}));
  k.select(table,'Mesa de reunião','Leitura e registro','D&C 20–21','A reunião de organização se realizou na residência de Peter Whitmer Sênior em 6 de abril de 1830.');
  k.animate(t=>{const read=ease(t,7,12),vote=ease(t,15,20),rest=ease(t,25,30);joseph.rightArm.rotation.x=-.7*read;joseph.rightForearm.rotation.x=-.6;joseph.head.rotation.x=.22*(1-read);oliver.leftArm.rotation.x=-.65;oliver.head.rotation.y=-.25*read;crowd.forEach((r,i)=>{r.head.rotation.y=.12*Math.sin(t*.35+i);r.rightArm.rotation.x=-1.55*ease(t,15+i*.18,20+i*.18)*(1-rest);r.rightForearm.rotation.x=-.35*ease(t,15+i*.18,20+i*.18)*(1-rest);r.leftArm.rotation.z=-.16*ease(t,24,29);});});
  k.finish({camera:[8,6.5,11],target:[0,1,0]});
 },
 D04(k){
  timberRoom(k,{width:7.8,depth:6.8,wall:'#c4b69a'});
  const floor=k.group.children.find(o=>o.isMesh&&o.position.y===.02);
  if(floor)floor.material=k.mat('#8b6448',{surface:'wood'});
  const seams=k.group.children.filter(o=>o.isMesh&&o.position.y===.11);
  seams.forEach((plank,i)=>{plank.scale.x=.96+(i%3)*.02;plank.position.z+=(i?Math.sin(i*1.7)*.018:0);plank.material=k.mat(i%3?'#6b503c':'#73543b',{surface:'wood'});});
  k.light.position.set(-5,6,2);
  k.table(-1.5,0,-.3,2.5,1.4);k.lamp(-2.45,.905,-.15);k.book(-1.6,.9275,-.1);for(let i=0;i<5;i++)paper(k,-.9+i*.04,.943+i*.012,-.45);
  const emma=k.person('Emma Smith',-1.5,-1.4,{robe:'#758d86',mantle:'#e5d7bc',hair:'#3c2a25',beard:false,silhouette:'wrapped',hairStyle:'parted',mantleStyle:'shawl'});const joseph=k.person('Joseph Smith',1.4,-1.6,{robe:'#b5a285',mantle:'#5e6570',beard:false});
  const page=paper(k,0,0,0);emma.handR.add(page);page.position.set(0,-.02,.13);page.scale.setScalar(.6);const pen=k.cylinder(.015,.4,'#503a26',0,0,0);emma.handL.add(pen);pen.position.set(0,-.06,.04);pen.rotation.z=.5;
  const singers=[k.person('Cantores',1.3,1.3,{robe:'#b89c79',mantle:'#7f6c6b',beard:false}),k.person('Cantora',2.8,.2,{robe:'#8a797e',mantle:'#d7c39d',beard:false})];
  const notes=[];for(let i=0;i<7;i++){const g=k.groupAt(1+i*.25,2.1+(i%3)*.2,.5);attach(g,k.sphere(.07,'#b99853',0,0,0));attach(g,k.box(.025,.32,.025,'#b99853',.055,.16,0));notes.push(g);}
  k.animate(t=>{const choose=ease(t,7,14),sing=ease(t,16,23);emma.rightArm.rotation.x=-.75-.35*choose;emma.rightForearm.rotation.x=-.6;emma.leftArm.rotation.x=-.85;emma.leftForearm.rotation.x=-.8+.08*Math.sin(t*3)*(1-choose);emma.head.rotation.x=.22-.18*sing;joseph.head.rotation.y=-.4;emma.root.rotation.y=.12*sing;singers.forEach((r,i)=>{r.leftArm.rotation.x=-.5*sing;r.rightArm.rotation.x=-.5*sing;r.head.rotation.x=-.06*sing+Math.sin(t*.6+i)*.025;});notes.forEach((n,i)=>{n.visible=t>16;n.position.y=2.1+(i%3)*.2+Math.sin(t*.7+i)*.12;});k.light.intensity=2.2+.3*sing;});
  notes.forEach((note,i)=>reveal(k,note,t=>ease(t,16+i*.18,18+i*.18)));
  k.finish({camera:[8,6.2,10],target:[0,1,0]});
 },
 D05(k){
  timberRoom(k,{width:7.5,depth:6.4,wall:'#b7ad94'});k.table(-1.7,0,.3,2.8,1.2);k.book(-1.7,1.05,.2);k.lamp(-2.6,1.05,.3);
  const joseph=k.person('Joseph Smith',-2.6,-.7,{robe:'#aaa080',mantle:'#58657a',beard:false});const sidney=k.person('Sidney Rigdon',-.8,-.7,{robe:'#c2ac8a',mantle:'#746751',hair:'#4b3424',beard:false});
  const jesus=christ(k,1.6,-1.9,1);const light=k.ray(1.6,1,-1.9,5);const symbols=[emblem(k,'sun',3.2,2.8,-1.8,'#efd17c'),emblem(k,'moon',3.3,1.9,-.6,'#cfdae3'),emblem(k,'star',3.3,1,1,'#b7b9d3')];
  symbols.forEach((g,i)=>k.select(g,['Reino celestial','Reino terrestre','Reino telestial'][i],'Comparação de glória','D&C 76','Sol, lua e estrelas são comparações da glória na visão, não um mapa de mundos físicos.'));
  k.animate(t=>{const open=ease(t,8,15),glory=ease(t,23,30);jesus.root.visible=t>10;jesus.root.scale.setScalar(1.12*open);light.visible=t>8;light.scale.set(open,1,open);joseph.head.rotation.x=.3-.65*open;sidney.head.rotation.x=.3-.6*open;joseph.head.rotation.y=-.3*open;sidney.head.rotation.y=-.4*open;joseph.rightArm.rotation.z=.65*open;sidney.leftArm.rotation.z=-.65*open;jesus.rightArm.rotation.z=.65;jesus.leftArm.rotation.z=-.65;symbols.forEach((g,i)=>{g.visible=t>23;g.scale.setScalar(glory);g.rotation.y=.1*Math.sin(t*.4+i);});k.light.intensity=2+open;});
  reveal(k,jesus.root,t=>ease(t,10,15));
  k.animate(t=>{jesus.root.scale.setScalar(1.12);const turn=ease(t,10,17);joseph.root.rotation.y=1.8*turn;sidney.root.rotation.y=2*turn;});
  k.finish({camera:[9,6.5,11],target:[0,1.8,-.5]});
 },
 D06(k){
  temple(k);for(const z of [-.5,1.5,3]){bench(k,-2,z,2.5);bench(k,1.7,z,2.5);}const joseph=k.person('Joseph Smith',0,-2.4,{y:.55,robe:'#c5baa0',mantle:'#57616d',beard:false});const page=paper(k,0,0,0);joseph.handL.add(page);page.position.set(0,.1,.12);page.scale.setScalar(.65);
  const crowd=[];for(let i=0;i<12;i++){const x=[-2.8,-1.6,.8,2][i%4],z=-.9+Math.floor(i/4)*1.7;crowd.push(k.person(i===0?'Congregação':`Pessoa da congregação ${i+1}`,x,z,{robe:['#95876f','#a9a395','#9b7870','#849085'][i%4],mantle:'#d1bf9e',hair:i%3?'#513b2b':'#a09379',beard:i%2===0,scale:.88}));}for(const x of [-3.2,3.2])k.lamp(x,1.5,-2.7);
  k.animate(t=>{const prayer=ease(t,6,13);joseph.head.rotation.x=.2*prayer;joseph.rightArm.rotation.z=.35*prayer;joseph.leftArm.rotation.x=-.9;joseph.leftForearm.rotation.x=-.7;crowd.forEach((r,i)=>{r.head.rotation.x=.22*ease(t,8+i*.12,15+i*.12);r.leftArm.rotation.z=-.15*ease(t,6+i*.12,13+i*.12);r.rightArm.rotation.z=.15*ease(t,6+i*.12,13+i*.12);});k.light.intensity=2.3+.25*ease(t,22,31);});
  k.finish({camera:[9,7,12],target:[0,1.1,0]});
 },
 D07(k){
  temple(k);const left=k.box(2.6,3,.05,'#a48973',-1.3,2,-1.9),right=k.box(2.6,3,.05,'#a48973',1.3,2,-1.9);left.name='Véu esquerdo';right.name='Véu direito';for(let i=0;i<12;i++){const fold=k.box(.025,3,.07,'#c5ae92',-2.5+i*.45,2,-1.85);(i<6?left:right).attach(fold);}
  const joseph=k.person('Joseph Smith',-.9,.4,{robe:'#b9ac8b',mantle:'#586676',beard:false});const oliver=k.person('Oliver Cowdery',.9,.4,{robe:'#a49d83',mantle:'#616451',beard:false});const jesus=k.person('Jesus Cristo',0,-2.5,{y:1.5,robe:'#f6efdf',mantle:'#e7d9b2',hair:'#efebdc',beard:true,scale:1.12});const ray=k.ray(0,1.45,-2.5,4.5);const paving=k.box(3,.04,1.3,'#d6b969',0,1.45,-2.55);k.select(paving,'Piso luminoso','Elemento da visão','D&C 110:2–3','A revelação descreve o Salvador sobre o parapeito do púlpito e um pavimento semelhante a ouro puro. A miniatura traduz a descrição simbolicamente.');
  k.animate(t=>{const v=ease(t,8,16),joy=ease(t,22,29);left.position.x=-1.3-v*1.8;right.position.x=1.3+v*1.8;left.scale.x=right.scale.x=1-.7*v;jesus.root.visible=t>10;ray.visible=t>9;ray.scale.set(v,1,v);paving.visible=t>10;praying(joseph,t,0,7);praying(oliver,t,0,7);joseph.head.rotation.x=.2-.65*joy;oliver.head.rotation.x=.2-.65*joy;jesus.rightArm.rotation.z=.55;jesus.leftArm.rotation.z=-.55;joseph.rightArm.rotation.z=.5+.2*joy;oliver.leftArm.rotation.z=-.5-.2*joy;k.light.intensity=1.8+v;});
  reveal(k,jesus.root,t=>ease(t,10,16));reveal(k,paving,t=>ease(t,10,14));
  k.finish({camera:[8,6,10],target:[0,2,-1]});
 },
 D08(k){
  k.config.night=true;k.config.ground='#5d5b52';k.box(7,.2,6,'#6e6759',0,0,0);for(let row=0;row<6;row++)for(let col=0;col<8;col++){const x=-3.3+col*.86+(row%2)*.15;k.box(.81,.45,.45,row%2?'#6e6b60':'#777165',x,.3+row*.47,-2.8);if(col<6)k.box(.45,.45,.8,'#777165',-3.5,.3+row*.47,-2.2+col*.85);}
  const bars=k.groupAt(1.8,2,-2.48);for(let i=0;i<6;i++)attach(bars,k.cylinder(.035,1.1,'#343b3a',-.65+i*.26,0,0));k.box(1.65,.09,.2,'#3d423e',1.8,1.4,-2.5);k.box(1.65,.09,.2,'#3d423e',1.8,2.6,-2.5);const light=k.ray(0,.1,.1,3);light.rotation.z=-.55;
  k.box(2.5,.17,1.1,'#78613f',-1.6,.17,.8);for(let i=0;i<12;i++)k.box(.025,.03,.65,'#a68a51',-2.6+i*.19,.27,.8);k.table(1.2,0,.8,2,1.1);const letter=paper(k,1.2,1.05,.8);k.lamp(1.9,1.04,.8);
  const joseph=k.person('Joseph Smith',.6,-.2,{robe:'#a7a28e',mantle:'#676d6a',beard:false});const companion=k.person('Companheiro de prisão',-1.8,-.8,{robe:'#8c8675',mantle:'#665d4b',hair:'#514031',beard:true});
  const pen=k.cylinder(.018,.35,'#3c3021',0,0,0);joseph.handR.add(pen);pen.position.set(0,-.12,.06);
  k.animate(t=>{const prayer=ease(t,5,11),write=ease(t,14,20);joseph.head.rotation.x=.3*prayer-.1*ease(t,24,30);joseph.leftArm.rotation.z=-.45*prayer*(1-write);joseph.rightArm.rotation.z=.45*prayer*(1-write);joseph.rightArm.rotation.x=-.9*write;joseph.rightForearm.rotation.x=-.75*write+.035*Math.sin(t*2.6)*write*(1-ease(t,26,30));joseph.leftArm.rotation.x=-.6*write;companion.head.rotation.y=-.35*write;companion.rightArm.rotation.z=.2*write;light.scale.x=.3+.5*ease(t,22,31);k.light.intensity=.7+.8*ease(t,22,31);});
  k.select(letter,'Carta da prisão','Consolo e ensino','D&C 121–122','As seções são extraídas de cartas ditadas por Joseph Smith em março de 1839.');k.finish({camera:[8,5.8,10],target:[0,1,0]});
 },
 D09(k){
  k.config.ground='#c7bca0';k.config.camera=[11,9,13];k.config.target=[0,1.4,0];k.background.set('#263d4a');k.stars();
  const nodes=[];const colors=['#d0c1e3','#7faaa0','#8b93a5','#a8bec2','#e5d2a1','#c8ad78','#efd27b','#c5d4dc','#c4bfd5','#f3dfab'];
  for(let i=0;i<planStages.length;i++){const st=planStages[i], [x,y,z]=st.position;const group=k.groupAt(x,y,z);const base=k.mesh(new THREE.CylinderGeometry(.75,.83,.19,40),k.mat(colors[i]),0,.15,0,group);const rim=k.mesh(new THREE.TorusGeometry(.76,.04,8,40),k.mat('#e7d9b9'),0,.25,0,group);rim.rotation.x=Math.PI/2;
   if(st.id==='premortal'){for(let j=0;j<5;j++)k.mesh(new THREE.SphereGeometry(.11,12,10),k.mat('#f5ecdc',{emissive:'#6a586f',emissiveIntensity:.25}),Math.cos(j*1.25)*.35,.75+Math.sin(j)*.13,Math.sin(j*1.25)*.35,group);}
   if(st.id==='mortal'){const globe=k.mesh(new THREE.SphereGeometry(.39,32,20),k.mat('#6c9ba6'),0,.8,0,group);for(let j=0;j<5;j++){const land=k.mesh(new THREE.SphereGeometry(.19,12,8),k.mat('#a3b47a'),Math.sin(j*1.5)*.27,.8+Math.cos(j*1.5)*.2,.2,group);land.scale.set(1.2,.65,.35);}k.animate(t=>{globe.rotation.y=t*.045;});}
   if(st.id==='death'){for(const dx of [-.35,.35])k.mesh(new THREE.BoxGeometry(.12,.9,.15),k.mat('#ece2cb'),dx,.75,0,group);k.mesh(new THREE.BoxGeometry(.83,.14,.18),k.mat('#ece2cb'),0,1.25,0,group);k.mesh(new THREE.SphereGeometry(.11),k.mat('#e5d091'),0,.75,.2,group);}
   if(st.id==='spirit'){for(let j=0;j<3;j++){k.mesh(new THREE.ConeGeometry(.12,.45,12),k.mat('#e9e6d5'),(j-1)*.3,.6,0,group);k.mesh(new THREE.SphereGeometry(.09,12,8),k.mat('#f3ebd9'),(j-1)*.3,.9,0,group);}}
   if(st.id==='resurrection'){k.mesh(new THREE.TorusGeometry(.37,.055,8,40,Math.PI),k.mat('#f2ddb1'),0,.7,0,group);k.mesh(new THREE.ConeGeometry(.16,.48,12),k.mat('#fff0d4'),0,.59,.1,group);k.mesh(new THREE.SphereGeometry(.1,12,8),k.mat('#fff0d4'),0,.91,.1,group);}
   if(st.id==='judgment'){k.mesh(new THREE.CylinderGeometry(.04,.04,.85),k.mat('#e9d6a5'),0,.7,0,group);k.mesh(new THREE.BoxGeometry(.8,.06,.07),k.mat('#e9d6a5'),0,1.1,0,group);for(const dx of [-.34,.34]){k.mesh(new THREE.CylinderGeometry(.009,.009,.25),k.mat('#e9d6a5'),dx,.95,0,group);k.mesh(new THREE.CylinderGeometry(.19,.1,.06,20),k.mat('#e9d6a5'),dx,.8,0,group);}}
   if(['celestial','terrestrial','telestial'].includes(st.id)){const icon=emblem(k,st.id==='celestial'?'sun':st.id==='terrestrial'?'moon':'star',0,0,0,colors[i]);group.add(icon);icon.position.set(0,1,0);icon.scale.setScalar(.7);}
   if(st.id==='christ'){const r=christ(k,0,0);group.add(r.root);r.root.position.set(0,.25,0);r.root.scale.setScalar(.85);r.rightArm.rotation.z=.6;r.leftArm.rotation.z=-.6;const halo=k.mesh(new THREE.TorusGeometry(1,.045,8,60),k.mat('#e6c376'),0,1.1,-.25,group);halo.rotation.x=.1;k.ray(0,.2,-.5,4.5);}
   k.label(group,st.name);k.select(group,st.name,st.role,st.reference,st.summary);nodes.push({group,base});
  }
  for(let i=0;i<5;i++){const a=planStages[i].position,b=planStages[i+1].position;arrow(k,[a[0],.33,a[2]],[b[0],.33,b[2]]);}
  for(let i=6;i<9;i++){const b=planStages[i].position;arrow(k,[3.7,.42,-1.5],[b[0],b[1]+.28,b[2]],'#c7b788');}
  for(let i=0;i<6;i++){const [x,y,z]=planStages[i].position;const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,.18,-.5),new THREE.Vector3(x*.5,.2,z*.5),new THREE.Vector3(x,.18,z));k.mesh(new THREE.TubeGeometry(curve,20,.018,5,false),k.mat('#d6b467'),0,0,0);}
  const traveler=k.sphere(.12,'#fff0b4',-4,.5,-2);k.label(traveler,'Percurso didático');
  k.animate(t=>{let idx=Math.min(5,Math.floor(t/4.3)),f=ease(t,idx*4.3,(idx+1)*4.3);const a=planStages[idx].position,b=planStages[Math.min(5,idx+1)].position;traveler.position.set(lerp(a[0],b[0],f),.5,lerp(a[2],b[2],f));nodes.forEach(({group,base},i)=>{const active=i===9||i===Math.min(8,Math.floor(t/3.6));base.material.emissive.set(active?'#665535':'#000000');const glow=i===9?1:ease(t,i*3.6,i*3.6+.9)*(1-ease(t,(i+1)*3.6-.9,(i+1)*3.6));base.material.emissive.set('#665535');base.material.emissiveIntensity=.28*glow;});});
  k.finish();
 },
 D10(k){
  k.config.ground='#99967f';k.config.camera=[10,7,12];k.config.target=[0,1.4,0];k.box(5,.15,4,'#856349',-1.7,.02,1.3);k.box(5,3,.15,'#ada28c',-1.7,1.5,-.7);for(let i=0;i<6;i++)k.book(-3.7+i*.5,1.2,-.4);k.table(-1.7,0,1.4,2.8,1.3);const book=k.book(-1.7,1.05,1.4);k.lamp(-2.7,1.05,1.4);bench(k,-1.7,2.4,1.6);
  const joseph=k.person('Joseph F. Smith',-1.7,2.3,{robe:'#555650',mantle:'#303c3f',hair:'#e0d9c6',beard:true,age:1});k.label(joseph.root,'Joseph F. Smith · 1918');
  const vision=k.groupAt(0,0,0);const jesus=christ(k,1,-2,1);vision.add(jesus.root);const beam=k.ray(1,.2,-2,5);vision.add(beam);const crowd=[];for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const r=k.person(i===0?'Mensageiros':`Justo ${i}`,1+Math.sin(a)*2.3,-2+Math.cos(a)*1.6,{robe:['#d2cbb6','#b5c2b8','#e2d3b9'][i%3],mantle:'#e7dbc3',hair:i%2?'#8f7f61':'#baaf94',scale:.9});vision.add(r.root);crowd.push(r);}
  k.walk(crowd[1],[2.8,-1],[3.8,.4],23,31);k.walk(crowd[5],[-1,-2],[-2,-2.9],23,31);
  k.animate(t=>{const v=ease(t,8,17),mission=ease(t,23,30);vision.visible=t>8;vision.scale.setScalar(.2+.8*v);joseph.head.rotation.x=.3-.25*v;joseph.leftArm.rotation.x=-.9;joseph.rightArm.rotation.x=-.85;joseph.leftForearm.rotation.x=-.6;joseph.rightForearm.rotation.x=-.7;jesus.leftArm.rotation.z=-.65;jesus.rightArm.rotation.z=.55+.2*mission;crowd.forEach((r,i)=>{r.head.rotation.y=(i-3)*-.16;r.head.rotation.x=-.15*v;r.rightArm.rotation.z=.3*v;r.leftArm.rotation.z=-.18*v;});k.light.intensity=1.8+v*.8;});
  reveal(k,vision,t=>ease(t,8,17));
  k.animate(()=>vision.scale.setScalar(1));
  k.select(book,'Escrituras em estudo','Meditação em 1918','D&C 138:1–11','Joseph F. Smith ponderava sobre a Expiação e passagens de 1 Pedro antes da visão de 3 de outubro de 1918.');k.finish();
 },
};

// Supply scripture-specific metadata for every selectable person, including
// representative members of a larger gathering.
for(const [id,build] of Object.entries(builders)){
 builders[id]=(k)=>{const offset=k.selectables.length;build(k);const story=dcStories.find(s=>s.id===id);for(const entry of k.selectables.slice(offset)){if(entry.role!=='Personagem deste episódio')continue;const source=story.characters.find(c=>c.name===entry.name);entry.role=source?.role||'Pessoa representativa da comunidade';entry.reference=story.reference;entry.summary=source?.description||`Figura de apoio na composição de “${story.title}”. O grupo tem escala reduzida; sua identidade individual não é afirmada pelo diorama.`;}
  const face=(name,x,z)=>{for(const e of k.selectables.filter(e=>e.name===name)){e.object.rotation.y=Math.atan2(x-e.object.position.x,z-e.object.position.z);}};
  if(id==='D01'){face('Joseph Smith',.05,.2);face('Oliver Cowdery',.05,.2);}
  if(id==='D02'){face('Oliver Cowdery',-2,-.8);face('David Whitmer',-2,-.8);face('Martin Harris',2.8,-.8);}
  if(id==='D03'||id==='D06')k.people.slice(id==='D03'?2:1).forEach(r=>r.root.rotation.y=Math.PI);
  if(id==='D04'){face('Cantores',-1.5,-1.4);face('Cantora',-1.5,-1.4);face('Emma Smith',-1.5,-.3);}
  if(id==='D07'){face('Joseph Smith',0,-2.5);face('Oliver Cowdery',0,-2.5);}
  if(id==='D08')face('Companheiro de prisão',.6,-.2);
  if(id==='D10')face('Joseph F. Smith',-1.7,1.4);
  if(['D03','D04','D05','D06','D07','D08','D10'].includes(id)){for(const r of k.people){const room=id!=='D10'||r.root.userData.selectable==='Joseph F. Smith';if(room&&r.root.position.y===0)r.root.position.y=.10;}}
  const views={D09:[{label:'Etapas e relações',camera:[11,9,13],target:[0,1.4,0]},{label:'Cristo no centro',camera:[4,3.3,5],target:[0,1.1,-.5]},{label:'Reinos de glória',camera:[5,5,4],target:[0,2.8,-3.2]}],D05:[{label:'Estudo e visão',camera:[9,6.5,11],target:[0,1.8,-.5]},{label:'Joseph e Sidney',camera:[.3,4.3,6.5],target:[-.5,1.7,-.8]},{label:'Cristo e as glórias',camera:[5,4.5,6],target:[-.2,1.85,-1]}],D07:[{label:'Templo e testemunhas',camera:[8,6,10],target:[0,2,-1]},{label:'O Salvador',camera:[4,4.1,4.5],target:[0,2.8,-2.5]},{label:'Púlpitos',camera:[4.5,4.8,5.5],target:[0,2,-2.1]}]};
  const inspection={"D01": [{"label": "Ordenação e oração", "camera": [3, 3.4, 6], "target": [0, 1.1, 0.3]}, {"label": "João e os companheiros", "camera": [-3, 3.5, 6], "target": [0, 1.15, 0.3]}], "D02": [{"label": "Primeiras testemunhas", "camera": [-0.5, 3.6, 6], "target": [-2, 1.2, 0.1]}, {"label": "Martin e a segunda manifestação", "camera": [-0.8, 3.8, 5.5], "target": [2.4, 1.25, 0.3]}], "D03": [{"label": "Leitura e registro", "camera": [2, 3.6, 4.5], "target": [0, 1.2, -1.9]}, {"label": "Participantes e voto", "camera": [5, 4.5, 7], "target": [0, 1.15, 0.5]}], "D04": [{"label": "Emma e a seleção dos hinos", "camera": [1, 3.3, 4], "target": [-1.5, 1.2, -0.7]}, {"label": "Canto e música", "camera": [5, 4, 6], "target": [1.8, 1.65, 0.5]}], "D06": [{"label": "Oração no púlpito", "camera": [3, 4.3, 5], "target": [0, 1.65, -2.4]}, {"label": "Congregação reunida", "camera": [5, 5, 8], "target": [0, 1.15, 1]}], "D08": [{"label": "Oração e escrita", "camera": [-3, 3, 5], "target": [0.5, 1.2, 0.2]}, {"label": "Cela e companheiro", "camera": [5, 4, 7], "target": [-1, 1.3, -0.4]}], "D10": [{"label": "Estudo de Joseph F. Smith", "camera": [1, 3.6, 7], "target": [-1.7, 1.15, 1.3]}, {"label": "Cristo e os mensageiros", "camera": [6, 5, 5], "target": [1, 1.7, -2]}]};
  if(inspection[id])k.config.views=[{label:'Vista geral',camera:[...k.config.camera],target:[...k.config.target]},...inspection[id]];
  if(views[id])k.config.views=views[id];return k;};
}
