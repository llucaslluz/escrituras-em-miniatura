import * as THREE from 'three';
import {reveal,groundFigure,distanceGait} from './vision-polish.js';
import { stories as pearlStories } from '../data/pearl.js';
const ease=(t,a,b)=>{const v=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
const lerp=THREE.MathUtils.lerp;
function put(p,o){p.add(o);return o;}
function figure(k,name,x,z,options={}){return k.person(name,x,z,{robe:'#c7b28c',mantle:'#8b8064',hair:'#5c432d',skin:'#bc906c',...options});}
function pray(r,t,a=0,b=8){const v=ease(t,a,b);r.leftArm.rotation.z=-.55*v;r.rightArm.rotation.z=.55*v;r.leftForearm.rotation.x=-1.2*v;r.rightForearm.rotation.x=-1.2*v;r.head.rotation.x=.27*v;}
function flowers(k,x,z,count=12){const g=k.groupAt(x,0,z);for(let i=0;i<count;i++){const a=i*2.4,r=.2+(i%4)*.22;const sx=Math.cos(a)*r,sz=Math.sin(a)*r;put(g,k.cylinder(.012,.19,'#71834c',sx,.15,sz));put(g,k.sphere(.055,['#d9bf81','#e0c0ae','#c5cda4'][i%3],sx,.26,sz));}return g;}
function tent(k,x,z,color='#b9966e') {const g=k.groupAt(x,0,z);const roof=k.mesh(new THREE.ConeGeometry(1.5,1.6,4),k.mat(color),0,1,0,g);roof.rotation.y=Math.PI/4;roof.scale.z=.85;for(const dx of [-.9,.9])k.mesh(new THREE.CylinderGeometry(.035,.035,1.6,8),k.mat('#675039'),dx,.8,.65,g);const flap=k.mesh(new THREE.PlaneGeometry(.7,1.1),k.mat('#5f5142',{side:THREE.DoubleSide}),0,.6,1.02,g);return g;}
function star(k,x,y,z,scale=1,color='#e9d69b'){const g=k.groupAt(x,y,z);for(let i=0;i<5;i++){const a=i*2*Math.PI/5;const p=k.mesh(new THREE.ConeGeometry(.1*scale,.36*scale,3),k.mat(color,{emissive:color,emissiveIntensity:.2}),Math.sin(a)*.12*scale,Math.cos(a)*.12*scale,0,g);p.rotation.z=-a;}return g;}
function garden(k){k.config.ground='#7f925d';k.water(1.3,10,1.8,0,{river:true,y:.03,color:'#729f9d'});for(const [x,z,s]of[[-4,-2,1.2],[-3,-4,1.1],[3.4,-3,1.15],[4,1,1],[-4,2,1]])k.tree(x,z,s);flowers(k,-2,1,17);flowers(k,3,1.9,12);flowers(k,-.3,-3,13);}
function orb(k,x,y,z,r,color){const g=k.groupAt(x,y,z);put(g,k.sphere(r,color,0,0,0));for(let j=0;j<3;j++){const ring=k.mesh(new THREE.TorusGeometry(r*1.25,.012,6,50),k.mat('#dcc992'),0,0,0,g);ring.rotation.set(.5+j*.3,j*.8,.25+j*.4);}return g;}
function wallHouse(k,parent,x,z,color='#c4b797'){const home=k.groupAt(x,0,z);put(home,k.box(1.3,1.1,1,color,0,.6,0));put(home,k.box(.3,.65,.06,'#776246',.12,.35,.52));put(home,k.box(.26,.3,.04,'#729194',-.35,.8,.52));const roof=k.mesh(new THREE.ConeGeometry(1.1,.6,4),k.mat('#a98d69'),0,1.42,0,home);roof.rotation.y=Math.PI/4;roof.scale.z=.85;parent.add(home);return home;}

export const builders={
 P01(k){
  k.config.ground='#8f8b73';k.config.camera=[9,7.5,12];k.config.target=[0,2,0];for(let i=0;i<17;i++){const a=i*2.4,r=1+(i%5)*.6;const rock=k.rock(Math.cos(a)*r,Math.sin(a)*r,1.1+(i%3)*.3);rock.position.y=.15+(i%4)*.15;}
  k.cylinder(1.8,.9,'#9b967c',-.9,.5,-.7);for(let i=0;i<5;i++)k.box(1.25,.2,1,'#a8a184',-.9,.1+i*.18,2.5-i*.7);
  const moses=figure(k,'Moisés',-.9,2.5,{robe:'#c8c2a6',mantle:'#967a50',hair:'#b1a18a',beard:true});const staff=k.cylinder(.035,1.7,'#695137',0,0,0);moses.handL.add(staff);staff.position.set(0,-.2,.08);
  const father=figure(k,'Deus, o Pai',-.9,-1.85,{y:2.45,robe:'#f7f2e7',mantle:'#ebe2cf',hair:'#efebdc',beard:true,scale:1.08});const satan=figure(k,'Satanás',.45,-.3,{y:.95,robe:'#47433e',mantle:'#2e2b28',hair:'#26211d',beard:true,expression:'tristeza'});satan.root.rotation.y=-1.2;
  const light=k.ray(-.9,.9,-.7,5);const worlds=[];for(let i=0;i<5;i++)worlds.push(orb(k,-3+i*1.4,3.3+(i%2)*.75,-2.3-i*.15,.24+(i%3)*.07,['#829da6','#b0aa8c','#879c88'][i%3]));
  k.walk(moses,[-.9,2.5],[-.9,-.5],0,8);k.stars();
  k.animate(t=>{const weak=ease(t,7.2,8.4)*(1-ease(t,10.2,11.4)),confront=ease(t,11.2,13.5)*(1-ease(t,14.6,15.8)),v=ease(t,4,7)*(1-ease(t,7.2,8.5))+ease(t,15,19);moses.root.position.y=.2+.75*ease(t,0,8)-.22*weak;moses.leftLeg.rotation.x=moses.rightLeg.rotation.x=-.85*weak;light.visible=v>0;light.scale.set(Math.max(.001,v),1,Math.max(.001,v));moses.head.rotation.x=.35*weak-.45*ease(t,15,20);moses.head.rotation.y=-.45*confront;moses.rightArm.rotation.x=-1.15*confront;moses.rightArm.rotation.z=.4*ease(t,16,23);moses.leftForearm.rotation.x=-.3;satan.leftArm.rotation.z=-.65*confront;satan.rightArm.rotation.x=-.95*confront;father.rightArm.rotation.z=.55*v;father.leftArm.rotation.z=-.45*v;worlds.forEach((g,i)=>{const s=ease(t,15+i*.8,22+i*.8);g.scale.setScalar(Math.max(.001,s));g.rotation.y=.18*Math.sin(t*.2+i);});k.light.intensity=1.7+.9*v-.5*confront;});
  reveal(k,father.root,t=>ease(t,4,6.5)*(1-ease(t,7.2,8.5))+ease(t,15,18.5));reveal(k,satan.root,t=>ease(t,10.2,11.6)*(1-ease(t,14.5,15.8)));worlds.forEach((g,i)=>reveal(k,g,t=>ease(t,15+i*.8,18+i*.8)));
  k.finish();
 },
 P02(k){
  k.config.ground='#314753';k.config.camera=[10,8,12];k.config.target=[0,1,0];k.water(10.8,10.8,0,0,{y:.12,color:'#466f7b'});const island=k.cylinder(3.7,.28,'#8d9f68',0,.18,0);const earth=k.groupAt();
  const plants=[];for(const[x,z,s]of[[-2.6,-1.9,1],[-.7,-2.8,1.1],[2,-2,1],[2.8,.7,.8],[-3,1,.7]]){const tree=k.tree(x,z,s);earth.add(tree);plants.push(tree);}for(let i=0;i<4;i++){const f=flowers(k,-2+i*1.2,-.3+(i%2)*1.5,9);earth.add(f);plants.push(f);}const animals=[k.animal('sheep',-2,1.4,.75),k.animal('donkey',1,-1.1,.6),k.animal('lion',2,1.4,.55)];animals.forEach(a=>earth.add(a));const bird=k.dove(-2.5,2.6,-.4);earth.add(bird);
  const adam=figure(k,'Adão',-.55,.6,{y:.32,robe:'#cfbf9c',mantle:'#a5a67b'}),eve=figure(k,'Eva',.65,.7,{y:.32,robe:'#d9c6a5',mantle:'#a5ac8a',hair:'#6d4a31',beard:false});const sun=k.sphere(.4,'#f1d892',3.4,4,-2.2),moon=k.sphere(.25,'#d6dee0',-3.5,3.6,-2.6);const stars=k.stars();
  k.animate(t=>{const light=ease(t,1,7),land=ease(t,7,12);island.scale.y=Math.max(.001,land);earth.position.y=.18+.14*island.scale.y;k.light.intensity=.2+light*2.4;k.background.setRGB(lerp(.08,.58,light),lerp(.13,.68,light),lerp(.18,.69,light));plants.forEach((g,i)=>{const v=ease(t,10+i*.35,16+i*.35);g.scale.setScalar(Math.max(.001,v));});animals.forEach((a,i)=>{a.rotation.y=.15*Math.sin(t*.4+i);});bird.position.x=-2.5+2*ease(t,19,26);const greet=ease(t,25,31);adam.rightArm.rotation.z=.4*greet;eve.leftArm.rotation.z=-.4*greet;adam.head.rotation.y=-.2*greet;eve.head.rotation.y=.2*greet;});
  reveal(k,island,t=>ease(t,7,10));plants.forEach((g,i)=>reveal(k,g,t=>ease(t,10+i*.35,13+i*.35)));
  animals.forEach((animal,i)=>reveal(k,animal,t=>ease(t,18+i,20+i)));reveal(k,bird,t=>ease(t,19,21));
  reveal(k,adam.root,t=>ease(t,25,28));reveal(k,eve.root,t=>ease(t,25,28));
  reveal(k,sun,t=>ease(t,15,18));reveal(k,moon,t=>ease(t,15,18));reveal(k,stars,t=>ease(t,15,18));
  k.finish();
 },
 P03(k){
  k.config.ground='#b1afaa';k.background.set('#586779');k.config.camera=[10,8,12];k.config.target=[0,1.7,0];k.stars();for(let i=0;i<5;i++)k.cloud(-4+i*2,3,-3,.65);
  const center=k.cylinder(1.6,.25,'#d4c3a0',0,.12,-1.8);const jesus=figure(k,'Jesus Cristo',0,-1.8,{y:.25,robe:'#f5ecdc',mantle:'#e5cf9c',scale:1.1});const beam=k.ray(0,.2,-1.8,5);const assembly=[];for(let i=0;i<8;i++){const a=(i/7-.5)*Math.PI*1.4;assembly.push(figure(k,i===0?'Espíritos reunidos':`Espírito representativo ${i+1}`,Math.sin(a)*3.3,1+Math.cos(a)*2,{robe:['#d1c5b2','#c0c4c6','#c7cbb5'][i%3],mantle:'#e2dac5',scale:.9,beard:i%3===0}));}
  const father=figure(k,'Deus, o Pai',-.85,-2.05,{y:.25,robe:'#f7f2e7',mantle:'#ebe2cf',hair:'#efebdc',beard:true,scale:1.12});const lucifer=figure(k,'Lúcifer',-2.2,-.35,{robe:'#5c5852',mantle:'#3f3c38',hair:'#2d2620',beard:false,expression:'tristeza'});
  const path=k.box(1.2,.04,3.2,'#c3ae7e',0,.03,1.6);const doorway=k.groupAt(0,0,3.4);for(const x of [-.65,.65])put(doorway,k.box(.15,2,.2,'#d5c6a7',x,1,0));put(doorway,k.box(1.45,.15,.2,'#d5c6a7',0,2,0));k.select(path,'Arbítrio e mortalidade','Símbolo do plano','Abraão 3:24–28; Moisés 4:1–4','A composição destaca a escolha do Redentor e o arbítrio. Este caminho é didático e não descreve uma passagem física no céu.');
  k.animate(t=>{const focus=ease(t,4,10),rebel=ease(t,9,14)*(1-ease(t,16,20)),offer=ease(t,14,22);father.rightArm.rotation.z=.55*focus;father.head.rotation.y=.2*offer;jesus.rightArm.rotation.z=.85*offer;jesus.rightForearm.rotation.x=-.45*offer;jesus.leftArm.rotation.z=-.35*offer;jesus.head.rotation.x=-.15*offer;lucifer.rightArm.rotation.x=-1.2*rebel;lucifer.leftArm.rotation.z=-.5*rebel;lucifer.root.rotation.y=.65-2.2*ease(t,15,19);assembly.forEach((r,i)=>{r.head.rotation.y=(i-3.5)*.1*focus;const listen=ease(t,8+i*.2,16+i*.2);r.rightArm.rotation.z=(i%2?.12:.22)*listen;r.leftArm.rotation.z=-(i%2?.22:.12)*listen;});beam.scale.set(.5+.5*focus,1,.5+.5*focus);path.material.emissive.set('#9f7840');path.material.emissiveIntensity=.03+.22*ease(t,22,28);k.light.intensity=1.8+.8*focus;});reveal(k,lucifer.root,t=>1-ease(t,17,21));k.finish();
 },
 P04(k){
  garden(k);const choice=k.tree(-.7,-.5,1.3);const canopy=choice.children.find(o=>o.type==='Group');canopy.name='Copa arredondada da árvore do fruto';
  canopy.children.forEach((leaf,i)=>{const angle=i*2.4;if(i<36){const tier=Math.floor(i/12),radius=[.78,.64,.28][tier];leaf.position.set(Math.cos(angle)*radius,[-.28,-.02,.2][tier]+.04*Math.sin(i*1.7),Math.sin(angle)*radius);leaf.scale.set(1.4,1.08,1.18);}else{leaf.position.set(Math.cos(angle)*.82,-.25+Math.sin(i*1.4)*.13,Math.sin(angle)*.82);leaf.scale.set(1,.95,1.1);}leaf.rotation.set(0,angle,.1*Math.sin(i));});
  const fruit=[];for(let i=0;i<8;i++)fruit.push(k.sphere(.11,'#c9a46d',-.7+Math.sin(i*2)*.7,1.7+(i%3)*.27,-.5+Math.cos(i*2)*.65));k.select(choice,'Árvore e fruto','Elemento do relato','Moisés 4','O texto apresenta uma escolha e suas consequências. A espécie do fruto não é definida nesta representação.');
  const adam=figure(k,'Adão',.4,1.1,{robe:'#d1c2a0',mantle:'#929a74'}),eve=figure(k,'Eva',-1.2,1,{robe:'#c7b6a0',mantle:'#849780',beard:false});const held=k.sphere(.12,'#c9a46d',0,0,0);eve.handR.add(held);held.position.set(0,-.05,.12);
  const adamFruit=k.sphere(.11,'#c9a46d',0,0,0);adam.handL.add(adamFruit);adamFruit.position.set(0,-.05,.11);
  const adamTunic=k.mesh(new THREE.CylinderGeometry(.29,.34,.68,20),k.mat('#8c6a4a',{surface:'cloth'}),0,.62,0,adam.robe);const eveTunic=k.mesh(new THREE.CylinderGeometry(.28,.33,.68,20),k.mat('#967352',{surface:'cloth'}),0,.62,0,eve.robe);
  const cherub=figure(k,'Anjo querubim',-.15,-.85,{robe:'#f6efe0',mantle:'#e8d8b4',hair:'#d8c9a8',beard:false,scale:1.05});const sword=k.mesh(new THREE.ConeGeometry(.045,.62,8),k.mat('#ffe39f',{emissive:'#e89a3c',emissiveIntensity:.85}),0,.26,.06,cherub.handR);sword.rotation.x=.35;
  const pathPositions=[],pathColors=[],pathIndices=[],earth=k.mat('#baa77c').color,grassColor=k.mat('#7f925d').color;
  for(let row=0;row<=32;row++){const z=-.15+row*5.25/32,blend=ease(z,-.15,.4)*(1-ease(z,4.65,5.1)),center=-.1+.55*ease(z,1.5,4),halfWidth=(1.03+.09*Math.sin(z*2.3)+.05*Math.cos(z*4.1))*(.55+.45*blend);for(const u of[-1,-.8,0,.8,1]){const interior=(1-ease(Math.abs(u),.8,1))*blend;pathPositions.push(center+u*halfWidth,-.008+.02*interior,z);const color=grassColor.clone().lerp(earth,interior);pathColors.push(color.r,color.g,color.b);}if(row)for(let col=0;col<4;col++){const a=(row-1)*5+col,b=a+1,c=row*5+col+1,d=c-1;pathIndices.push(a,c,b,a,d,c);}}
  const pathGeometry=new THREE.BufferGeometry();pathGeometry.setAttribute('position',new THREE.Float32BufferAttribute(pathPositions,3));pathGeometry.setAttribute('color',new THREE.Float32BufferAttribute(pathColors,3));pathGeometry.setIndex(pathIndices);pathGeometry.computeVertexNormals();const path=k.mesh(pathGeometry,k.mat('#ffffff',{vertexColors:true,roughness:.88}));path.name='Caminho integrado ao jardim';
  const withered=[];for(let i=0;i<6;i++){const g=k.rock(-2.2+i*.8,3.4,.26);withered.push(g);}k.walk(adam,[.4,1.1],[1.3,3.7],21,30);k.walk(eve,[-1.2,1],[-.2,3.6],21,30);
  k.animate(t=>{const choiceV=ease(t,7,11),adamPartake=ease(t,11,15)*(1-ease(t,17,19)),guard=ease(t,18,22),exit=ease(t,17,25);eve.rightArm.rotation.x=-1.15*choiceV*(1-exit);eve.rightForearm.rotation.x=-.6*choiceV;eve.head.rotation.y=-.2*choiceV;adam.head.rotation.y=.35*choiceV*(1-exit);adam.leftArm.rotation.x=-1.1*adamPartake;adam.leftForearm.rotation.x=-.65*adamPartake;adam.leftArm.rotation.z=-.3*choiceV*(1-exit);cherub.rightArm.rotation.x=-1.05*guard;cherub.rightForearm.rotation.x=-.35*guard;cherub.leftArm.rotation.z=-.4*guard;held.visible=t>8&&t<19;fruit[0].visible=t<8;k.light.intensity=2.7-.95*exit;k.light.color.setRGB(1,1-.1*exit,1-.22*exit);});
  reveal(k,held,t=>ease(t,8,10)*(1-ease(t,17,19)));reveal(k,adamFruit,t=>ease(t,11,12.5)*(1-ease(t,17,18.5)));reveal(k,fruit[0],t=>1-ease(t,8,10));reveal(k,adamTunic,t=>ease(t,18,20.5));reveal(k,eveTunic,t=>ease(t,18,20.5));reveal(k,cherub.root,t=>ease(t,18,21.5));
  withered.forEach((stone,i)=>reveal(k,stone,t=>ease(t,18+i*.1,20+i*.1)));
  k.finish({camera:[9,6,11],target:[0,1,0]});
 },
 P05(k){
  k.config.ground='#a29c70';tent(k,-3,-2,'#b5a27b');for(let i=0;i<8;i++){k.box(.06,.04,2.2,'#766d46',-3.2+i*.3,.06,1.8);for(let j=0;j<3;j++)k.sphere(.06,'#8c995b',-3.2+i*.3,.17,1+j*.5);}const altar=k.groupAt(.6,0,-.6);for(let row=0;row<3;row++)for(let i=0;i<4;i++){const a=i*Math.PI/2;put(altar,k.rock(Math.cos(a)*.55,Math.sin(a)*.55,.4));altar.children[altar.children.length-1].position.y=.25+row*.28;}const flame=k.fire(.6,1,-.6,.6);k.animal('sheep',2.8,1,.75);k.basket(-2.3,.05,.7);
  const adam=figure(k,'Adão',-.5,1,{robe:'#b2a384',mantle:'#8f8d62'}),eve=figure(k,'Eva',-1.7,.6,{robe:'#c4b18e',mantle:'#a29474',beard:false});const angel=figure(k,'Anjo',2,-1.3,{robe:'#efe5cd',mantle:'#d9cda6',hair:'#a09478',scale:1.05});const ray=k.ray(2,.05,-1.3,5);const grain=k.cylinder(.02,.55,'#bfa263',0,0,0);eve.handL.add(grain);grain.position.set(0,-.1,.08);
  k.select(altar,'Altar','Oferta e ensino','Moisés 5:5–8','O anjo explica que a oferta simboliza o sacrifício do Unigênito. A miniatura apresenta o ensino sem encenar morte animal.');
  k.animate(t=>{const teach=ease(t,14,21),joy=ease(t,24,31);angel.root.visible=ray.visible=t>=14;ray.scale.set(teach,1,teach);pray(adam,t,4,10);pray(eve,t,4,10);angel.rightArm.rotation.z=.7*teach;angel.rightForearm.rotation.x=-.6;angel.head.rotation.y=.2;adam.head.rotation.y=-.4*teach;eve.head.rotation.y=-.4*teach;adam.head.rotation.x=.2-.4*joy;eve.head.rotation.x=.2-.4*joy;adam.rightArm.rotation.z=.5+.15*joy;eve.leftArm.rotation.z=-.5-.2*joy;flame.scale.setScalar(.6+.08*Math.sin(t*1.3));});
  reveal(k,angel.root,t=>ease(t,14,19));
  k.finish({camera:[9,6,11],target:[0,1,0]});
 },
 P06(k){
  k.config.ground='#8d9b6b';const city=k.groupAt();city.add(k.cylinder(4.1,.15,'#b5b791',0,.12,-.3));for(const[x,z,c]of[[-2.5,-2,'#c9bea2'],[0,-3,'#cfc3a6'],[2.6,-2,'#bdb696'],[3.3,.6,'#d2c3a2'],[-3.3,.5,'#c2b89a']]){const home=wallHouse(k,city,x,z,c);home.position.y=.145;}for(const[x,z]of[[-3,2.5],[3,2.5],[-4,-2]]){const t=k.tree(x,z,.7);city.add(t);}const square=k.box(4,.04,3,'#c7b98f',0,.22,0);city.add(square);
  const enoch=figure(k,'Enoque',0,-.9,{robe:'#b2b18b',mantle:'#758b80',beard:true});city.add(enoch.root);const people=[];for(const[x,z,i]of[[-1.6,.5,0],[1.6,.5,1],[-1.2,2,2],[1.1,2,3]]){const r=figure(k,i===0?'Moradores de Sião':`Morador ${i+1}`,x,z,{robe:['#bda47d','#a8aca0','#c29c7b','#84938a'][i],mantle:'#ded0ae',scale:i===3?.75:1,beard:i%2===0});city.add(r.root);people.push(r);}const basket=k.basket(0,0,0);people[0].handR.add(basket);basket.position.set(0,-.15,.16);basket.scale.setScalar(.5);
  const cloud=k.cloud(0,4,-1,2);const ray=k.ray(0,.05,0,6);k.walk(people[0],[-1.6,.5],[-.6,1],8,15);k.walk(people[1],[1.6,.5],[.65,1],8,15);
  k.animate(t=>{const teach=ease(t,0,8),share=ease(t,9,17),lift=ease(t,24,32);enoch.rightArm.rotation.z=.7*teach;enoch.leftArm.rotation.z=-.35*teach;enoch.head.rotation.y=.15*Math.sin(t*.25);people[0].rightArm.rotation.x=-1.1*share;people[0].rightForearm.rotation.x=-.3;people[1].leftArm.rotation.x=-1.1*share;people[1].leftForearm.rotation.x=-.3;people[2].head.rotation.y=-.2*share;people[3].leftArm.rotation.z=-.6*share;people[3].rightArm.rotation.z=.6*share;city.position.y=.9*lift;cloud.position.y=4-.55*lift;ray.visible=t>24;ray.scale.set(lift,1,lift);k.light.intensity=2.4+.6*lift;});k.finish({camera:[10,8,12],target:[0,1.6,0]});
 },
 P07(k){
  k.config.ground='#baaa7c';tent(k,-2,-2,'#c2aa80');tent(k,2,-2.9,'#9d8768');k.fire(0,.2,-.8,.5);k.vase(-1.5,.05,-.3);k.basket(2.2,.05,.2);k.animal('donkey',-3.5,.7,.7);for(let i=0;i<13;i++)k.rock(-4+i*.65,2.8+Math.sin(i)*.15,.15+(i%2)*.08);for(const[x,z]of[[-4,-1],[4,-1],[3,2]])k.tree(x,z,.6);
  const abraham=figure(k,'Abraão',-2.7,1.6,{robe:'#c9b58c',mantle:'#8b6b4c',hair:'#9b8b73'}),sarai=figure(k,'Sarai',-3.8,1.3,{robe:'#b89c80',mantle:'#837b6b',hair:'#65503c',beard:false}),lot=figure(k,'Ló',-4.5,2,{robe:'#a9a17e',mantle:'#a6865c',beard:true});
  const pack=k.box(.46,.55,.3,'#927751',0,0,0);lot.handL.add(pack);pack.position.set(0,-.26,0);const staff=k.cylinder(.025,1.5,'#634a31',0,0,0);abraham.handL.add(staff);staff.position.set(0,-.2,.02);
  k.walk(abraham,[-2.7,1.6],[-.4,.5],0,8);k.walk(sarai,[-3.8,1.3],[-1.5,1],1,9);k.walk(lot,[-4.5,2],[-2.4,1.5],1.5,9.5);
  const promise=[];for(let i=0;i<9;i++)promise.push(star(k,-3.5+i*.85,3.2+(i%3)*.3,-3.5,.35));
  k.animate(t=>{const p=ease(t,14,22),go=ease(t,25,32);if(t>25){[abraham,sarai,lot].forEach((r,i)=>{const sx=[-.4,-1.5,-2.4][i],sz=[.5,1,1.5][i];r.root.position.x=lerp(sx,sx+2.7,go);r.root.position.z=lerp(sz,sz+.9,go);distanceGait(r,Math.hypot(2.7,.9),(t-25)/7);r.root.rotation.y=Math.atan2(2.7,.9);});}abraham.rightArm.rotation.z=.55*p*(1-go);abraham.head.rotation.x=-.25*p;sarai.head.rotation.y=-.3*p;lot.head.rotation.y=-.2*p;promise.forEach((s,i)=>{const glow=ease(t,14+i*.35,16+i*.35);s.visible=glow>0;s.scale.setScalar(glow);});});k.finish({camera:[10,6.5,11],target:[0,1,0]});
 },
 P08(k){
  k.config.night=true;k.config.ground='#7f806d';k.config.camera=[9,6.8,12];k.config.target=[0,2,-.8];k.stars();tent(k,-3,-1.7,'#9b8765');k.fire(-2,.1,.5,.35);for(let i=0;i<7;i++)k.rock(-3+i*.9,2.3+(i%2)*.3,.3);const abraham=figure(k,'Abraão',-.6,.5,{robe:'#c0af8b',mantle:'#8b6b4a',hair:'#a3937b'});const instrument=k.groupAt();for(const x of [-.14,.14]){put(instrument,k.sphere(.09,'#d0e0cf',x,0,0));}put(instrument,k.box(.4,.05,.05,'#b6a478',0,-.07,0));abraham.handR.add(instrument);instrument.position.set(0,-.05,.08);k.select(instrument,'Urim e Tumim','Instrumento na revelação','Abraão 3:1','O relato menciona o Urim e Tumim dado a Abraão. Esta forma visual é uma convenção artística, não uma descrição detalhada do objeto.');
  const stars=[];for(let i=0;i<14;i++){const x=-4+(i%7)*1.25,y=3+Math.floor(i/7)*1.2+(i%3)*.12;stars.push(star(k,x,y,-3.5,.6+(i%3)*.2));}const arcs=[];for(let i=0;i<3;i++){const c=new THREE.EllipseCurve(0,0,2.5+i*.6,1+i*.25,.1,Math.PI-.1,false,0);const pts=c.getPoints(60).map(p=>new THREE.Vector3(p.x,p.y+2.7,-3));const tube=k.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,.015,5,false),k.mat('#baa473'),0,0,0);arcs.push(tube);}
  k.animate(t=>{const look=ease(t,4,11),learn=ease(t,14,23);abraham.head.rotation.x=-.5*look;abraham.rightArm.rotation.x=-.95*look;abraham.rightForearm.rotation.x=-.7;abraham.leftArm.rotation.z=-.6*learn;stars.forEach((s,i)=>{s.scale.setScalar(.55+learn*.45);s.rotation.z=.06*Math.sin(t*.5+i);});arcs.forEach((a,i)=>a.visible=t>14+i*2);k.light.intensity=.9+.5*learn;});
  arcs.forEach((arc,i)=>reveal(k,arc,t=>ease(t,14+i*2,16+i*2)));
  k.finish();
 },
 P09(k){
  k.config.ground='#81905b';k.config.camera=[8,7,12];k.config.target=[0,2.6,-.8];const trunks=[[-4,-3,1.4],[-2.9,-4.1,1.7],[-.9,-4.6,1.6],[1.8,-4,1.65],[4,-2.7,1.5],[4,1.2,1.3],[-4.2,1.8,1.35],[-3,3,1]];trunks.forEach(([x,z,s])=>k.tree(x,z,s));for(let i=0;i<25;i++){const a=i*2.4,r=2.2+(i%5)*.5;k.sphere(.045,['#9a9c68','#b7a46e','#7f8a51'][i%3],Math.sin(a)*r,.06,Math.cos(a)*r);}flowers(k,-2.4,.5,13);flowers(k,2.8,.3,11);k.rock(-2,2,.4);k.rock(2.1,-2,.5);
  const joseph=figure(k,'Joseph Smith',.1,3,{robe:'#b5a788',mantle:'#7d8a83',hair:'#795734',beard:false,scale:.87});
  const father=figure(k,'Deus, o Pai',-.62,.95,{y:2.85,robe:'#f3ead6',mantle:'#e7d7ac',hair:'#efebdc',beard:true,scale:1.07});
  const son=figure(k,'Jesus Cristo',.62,.95,{y:2.85,robe:'#f7f0df',mantle:'#dfc49a',hair:'#5c3b28',beard:true,scale:1.07});
  const column=k.ray(0,.05,.98,6);const light=new THREE.PointLight('#fff2c6',0,12,1.4);light.position.set(0,4,.95);k.add(light);k.label(father.root,'Deus, o Pai');k.label(son.root,'Jesus Cristo');
  const dust=[];for(let i=0;i<30;i++){const a=i*2.4,r=.2+(i%7)*.16;dust.push(k.sphere(.018,'#f5e9b8',Math.cos(a)*r,.3+(i%11)*.45,Math.sin(a)*r+.95));}
  k.walk(joseph,[.1,3],[0,1],0,7);
  k.animate(t=>{const kneel=ease(t,8,12),shine=ease(t,15,22),rev=ease(t,23,28);joseph.root.position.y=-.28*kneel;joseph.leftLeg.rotation.x=-.8*kneel;joseph.rightLeg.rotation.x=-.8*kneel;pray(joseph,t,8,12);joseph.head.rotation.x=.27*kneel-.88*rev;column.visible=shine>0;column.scale.set(Math.max(.001,shine),1,Math.max(.001,shine));father.root.scale.setScalar(1.07);son.root.scale.setScalar(1.07);father.rightArm.rotation.z=1.35*rev;father.rightForearm.rotation.z=-.15*rev;father.head.rotation.x=.22*rev;father.head.rotation.y=-.2*rev;son.leftArm.rotation.z=-.38*rev;son.rightArm.rotation.z=.38*rev;son.head.rotation.x=.24*rev;light.intensity=8*shine;k.light.intensity=1.3+1.5*shine;dust.forEach((d,i)=>{d.position.y=.3+(i%11)*.45+Math.sin(t*.35+i)*.08;});});
  reveal(k,father.root,t=>ease(t,23,28));reveal(k,son.root,t=>ease(t,23,28));
  dust.forEach((particle,i)=>reveal(k,particle,t=>ease(t,16+i*.025,18+i*.025)));
  k.animate(()=>groundFigure(joseph));
  k.finish();
 },
 P10(k){
  k.config.night=true;k.config.ground='#76805c';k.config.camera=[10,7.2,12];k.config.target=[0,1.3,0];const bedroom=k.groupAt(-2,0,.4);put(bedroom,k.box(4,.16,4,'#94734f',0,.02,0));put(bedroom,k.box(4,2.8,.12,'#b4a184',0,1.4,-2));put(bedroom,k.box(.12,2.8,4,'#b4a184',-2,1.4,0));for(let i=0;i<7;i++)put(bedroom,k.box(4,.012,.025,'#765a3f',0,.11,-1.7+i*.53));put(bedroom,k.box(1.3,.5,2.3,'#755438',-.5,.35,.1));put(bedroom,k.box(1.2,.18,2.2,'#dfd1af',-.5,.7,.1));put(bedroom,k.box(1.2,.08,1.6,'#8a9b97',-.5,.82,.4));put(bedroom,k.box(.95,.18,.4,'#e6d8bd',-.5,.87,-.7));const joseph=figure(k,'Joseph Smith',-2.5,1.9,{robe:'#d4c8ad',mantle:'#a3a28b',beard:false,scale:.9});const angel=figure(k,'Morôni',-.6,-.5,{y:.5,robe:'#f1e9d6',mantle:'#ded5b9',hair:'#b6ab90',scale:1.02});const ray=k.ray(-.6,2.8,-.5,4);
  const hill=k.groupAt(2.5,0,-.7);put(hill,k.sphere(1.7,'#8b966b',0,-.6,0));for(let i=0;i<9;i++){const a=i*2.4;put(hill,k.rock(Math.sin(a)*1.1,Math.cos(a)*1.1,.24));}const chest=k.groupAt(2.5,.17,-.5);put(chest,k.box(1.1,.3,.75,'#969482',0,0,0));const lid=put(chest,k.box(1.2,.14,.85,'#a29e87',0,.23,0));const plates=k.plates(2.5,.42,-.5);const hillJoseph=figure(k,'Joseph Smith',2.6,1.4,{robe:'#a9a084',mantle:'#6f7e72',beard:false,scale:.93});k.label(bedroom,'1823 · visita noturna');k.label(hill,'1823 → 1827 · preparação');k.tree(4,-2,.8);k.tree(1.1,-3,.8);k.stars();
  k.select(plates,'Placas','Recebidas em 1827','Joseph Smith—História 1:51–54,59','Joseph visita o lugar em 1823, mas só recebe os registros em 22 de setembro de 1827, após anos de preparação.');
  // Merged into the unified P10 animate block below.
  // The stone case rests on the hill rather than inside its solid dome.
  chest.name='Caixa de pedra';chest.position.y=1.25;
  const hinge=new THREE.Group();hinge.name='Dobradiça da caixa';hinge.position.set(0,.23,-.425);chest.add(hinge);hinge.attach(lid);lid.name='Tampa articulada';
  const heldTarget=new THREE.Vector3(),otherHand=new THREE.Vector3(),casePosition=new THREE.Vector3(2.5,1.4,-.5);
  k.animate(t=>{
   const night=ease(t,0,7),visit=ease(t,8,15),deliver=ease(t,18,24),receive=ease(t,24,30),atHill=t>=16;pray(joseph,t,0,5);angel.root.position.set(atHill?2.45:-.6,atHill?1.35:.5,atHill?-1.25:-.5);angel.root.rotation.y=atHill?0:-.4;ray.position.set(atHill?2.45:-.6,atHill?1.35:2.8,atHill?-1.1:-.5);angel.rightArm.rotation.z=.6*night*(1-deliver);angel.leftArm.rotation.z=-.35*night*(1-deliver);angel.leftArm.rotation.x=-.95*deliver*(1-.3*receive);angel.rightArm.rotation.x=-.95*deliver*(1-.3*receive);angel.leftForearm.rotation.x=-.45*deliver;angel.rightForearm.rotation.x=-.45*deliver;hillJoseph.head.rotation.x=.28*visit-.2*receive;hillJoseph.rightArm.rotation.x=-.8*visit-.15*receive;hillJoseph.rightForearm.rotation.x=-.5;hillJoseph.leftArm.rotation.x=-.85*receive;hillJoseph.leftForearm.rotation.x=-.75*receive;k.light.intensity=1.1+.9*visit;
   hinge.rotation.x=-1.25*visit;lid.position.set(0,0,.425);lid.rotation.set(0,0,0);
   hillJoseph.root.updateWorldMatrix(true,true);
   hillJoseph.handL.getWorldPosition(heldTarget);hillJoseph.handR.getWorldPosition(otherHand);
   heldTarget.add(otherHand).multiplyScalar(.5);heldTarget.y-=.015;
   plates.position.lerpVectors(casePosition,heldTarget,receive);
  });
  reveal(k,plates,t=>ease(t,9,12));
  joseph.root.position.y=.10;
  reveal(k,joseph.root,t=>1-ease(t,6,8));reveal(k,angel.root,t=>ease(t,0,3)*(1-ease(t,6,8))+ease(t,18,21));reveal(k,ray,t=>ease(t,0,3)*(1-ease(t,6,8))+ease(t,18,21));reveal(k,hillJoseph.root,t=>ease(t,8,12));
  k.finish();
 },
};

for(const [id,build] of Object.entries(builders)){
 builders[id]=(k)=>{const offset=k.selectables.length;build(k);const story=pearlStories.find(s=>s.id===id);for(const entry of k.selectables.slice(offset)){if(entry.role!=='Personagem deste episódio')continue;const source=story.characters.find(c=>c.name===entry.name);entry.role=source?.role||'Figura representativa';entry.reference=story.reference;entry.summary=source?.description||`Figura de apoio na composição de “${story.title}”. O grupo é representativo; não se afirma uma identidade individual além das fontes.`;}
  const face=(name,x,z)=>{for(const e of k.selectables.filter(e=>e.name===name)){e.object.rotation.y=Math.atan2(x-e.object.position.x,z-e.object.position.z);}};
  if(id==='P03')k.people.slice(1,9).forEach(r=>r.root.rotation.y=Math.atan2(-r.root.position.x,-1.8-r.root.position.z));
  if(id==='P05'){face('Adão',2,-1.3);face('Eva',2,-1.3);face('Anjo',-1,.8);}
  if(id==='P06'){k.people.forEach(r=>r.root.position.y=.24);k.people.slice(3).forEach(r=>r.root.rotation.y=Math.PI);}
  if(id==='P08')face('Abraão',0,-3.5);
  if(id==='P10'){const jo=k.selectables.filter(e=>e.name==='Joseph Smith');jo[0].object.rotation.y=2.47;jo[1].object.rotation.y=Math.PI;}
  const views={P09:[{label:'Bosque e visão',camera:[8,7,12],target:[0,2.4,.6]},{label:'Oração de Joseph',camera:[4,2.5,5],target:[0,.8,1]},{label:'Dois Personagens',camera:[0,4.2,6.4],target:[0,4,.95]}],P01:[{label:'O monte e a criação',camera:[9,7.5,12],target:[0,2,0]},{label:'Moisés e os mundos',camera:[10,4.8,-.5],target:[-.4,2.4,-1.4]},{label:'A visão pelo outro lado',camera:[-10,4.8,-.7],target:[-.4,2.4,-1.4]}],P08:[{label:'Abraão sob as estrelas',camera:[9,6.8,12],target:[0,2,-.8]},{label:'Instrumento e estudo',camera:[3,2.8,4],target:[-.6,1.1,.5]},{label:'Símbolos no céu',camera:[3,5.2,6],target:[0,3.5,-3]}],P10:[{label:'Tempos separados',camera:[10,7.2,12],target:[0,1.3,0]},{label:'1823 · visita noturna',camera:[2,4,6],target:[-2,1,.4]},{label:'1827 · os registros',camera:[6,3.5,6],target:[2.5,1.35,.1]}]};
  const inspection={"P02": [{"label": "Adão e Eva", "camera": [3, 3.5, 6], "target": [0, 1.4, 0.6]}, {"label": "Vida na criação", "camera": [5, 4.5, 7], "target": [0, 1, 0]}], "P03": [{"label": "O Redentor escolhido", "camera": [3, 3.5, 5], "target": [0, 1.35, -1.8]}, {"label": "Assembleia e arbítrio", "camera": [6, 5.5, 9], "target": [0, 1.2, 1.5]}], "P04": [{"label": "Escolha junto à árvore", "camera": [3, 3.4, 6], "target": [-0.5, 1.25, 0.8]}, {"label": "Caminho de saída", "camera": [5, 3.6, 8], "target": [0.6, 1.15, 2.8]}], "P05": [{"label": "Oração e oferta", "camera": [3, 3.6, 6], "target": [-0.8, 1.1, 0.6]}, {"label": "Ensino do anjo", "camera": [5, 3.6, 5], "target": [1.2, 1.2, -0.8]}], "P06": [{"label": "Partilha em Sião", "camera": [4, 4, 7], "target": [0, 1.45, 0.7]}, {"label": "Enoque e a cidade", "camera": [6, 5.5, 8], "target": [0, 2, -0.7]}], "P07": [{"label": "Abraão e a família", "camera": [3, 3.6, 6], "target": [-1.4, 1.15, 0.8]}, {"label": "Promessa e jornada", "camera": [5, 5, 8], "target": [0, 2.1, -0.8]}]};
  if(inspection[id])k.config.views=[{label:'Vista geral',camera:[...k.config.camera],target:[...k.config.target]},...inspection[id]];
  if(views[id])k.config.views=views[id];return k;};
}
