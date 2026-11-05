import { THREE, ease, mix, masonry, beam, prayer, teaching, thought, kneel, token, temple, grass, ring, colors, bag, reach, fade, walking, stride, supportTiltedFeet } from './utils.js';

function arrow(k, color='#8b6841') {
  const g=k.groupAt();beam(k,[0,0,-.38],[0,0,.35],.012,color,g);
  const tip=k.mesh(new THREE.ConeGeometry(.045,.14,6),k.mat('#9ca19a',{metalness:.35}),0,0,.41,g);tip.rotation.x=Math.PI/2;
  for(const side of[-1,1]){const feather=k.mesh(new THREE.BoxGeometry(.1,.012,.15),k.mat('#b5a58b'),side*.035,0,-.29,g);feather.rotation.z=side*.5;}
  return g;
}

function projectile(k, object, from, to, start, end, height = 1.7) {
  object.userData.samuelProjectile=true;
  const origin=new THREE.Vector3(...from),target=new THREE.Vector3(...to),axis=new THREE.Vector3(0,0,1);
  k.animate(t=>{
    const raw=(t-start)/(end-start),u=Math.max(0,Math.min(1,raw));object.visible=raw>=0&&raw<=1;
    object.position.copy(origin).lerp(target,u);object.position.y+=Math.sin(u*Math.PI)*height;
    const tangent=target.clone().sub(origin);tangent.y+=Math.PI*height*Math.cos(u*Math.PI);object.quaternion.setFromUnitVectors(axis,tangent.normalize());
  });
}

export const builders = {
  M15(k) {
    k.finish({ground:'#b6a27c',camera:[10,7.2,12],target:[0,1.8,-.25]});k.background.set('#dbd6ba');
    const wall=masonry(k,0,-1.6,7.4,2.7,1.05);token(k,wall,'Muralha de Zaraenla','Lugar da pregação','Helamã 13:4','Impedido de entrar, Samuel sobe à muralha e anuncia o que o Senhor lhe põe no coração.');
    k.box(7.5,.16,1.15,'#bdac8c',0,2.78,-1.6);
    // A broad parapet walkway and a masonry stair give the miniature a physical access route.
    for(let i=0;i<7;i++)k.box(1.05,(i+1)*.39,.46,'#a58e6a',-3.1,(i+1)*.195,-4.25+i*.4);
    for(const z of[-2.2,-1])for(const x of[-3.65,3.65])k.box(.5,3,.5,'#ad9674',x,1.5,z);
    for(let i=0;i<9;i++)for(const side of[-1,1]){const tie=k.box(.1,.035,.015,'#d1bd99',-3.2+i*.8,1.1+(i%2)*.4,-1.6+side*.54);tie.rotation.z=.12;}
    k.box(1.1,1.8,.12,'#775737',2.8,.9,-1.02);for(let i=0;i<6;i++)k.box(.035,1.72,.035,'#b5935c',2.35+i*.18,.9,-.94);
    k.tree(-4.6,-1.8,.8);k.tree(4.7,-1.9,.8);grass(k,-4.5,2.5,1);grass(k,4.6,1.7,.9);
    const samuel=k.person('Samuel',0,-1.6,{y:2.87,robe:'#b47854',mantle:'#d0b88c',hair:'#3f352b'});
    const believers=[k.person('Ouvintes que acreditam',-2.45,.55,{robe:'#9da387',rotation:Math.PI}),k.person('Ouvintes que acreditam',-3.3,1.8,{robe:'#c9ba92',beard:false,rotation:Math.PI}),k.person('Ouvintes que acreditam',-1.4,2,{robe:'#baa077',rotation:Math.PI})];
    const archer=k.person('Opositor com arco',2.35,2.15,{robe:'#a08a65',rotation:Math.PI});
    const thrower=k.person('Opositor com pedras',.7,3,{robe:'#a68161',rotation:Math.PI});
    const skeptic=k.person('Opositores',3.6,.85,{robe:'#9b9b7d',rotation:Math.PI});
    // Bow and string are attached to the articulated hand, independent of the fired arrows.
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-.43,0),new THREE.Vector3(.18,0,0),new THREE.Vector3(0,.43,0)]);
    k.mesh(new THREE.TubeGeometry(curve,24,.025,6),k.mat('#7b5331'),0,0,0,archer.handL);beam(k,[0,-.43,0],[0,.43,0],.007,'#dfc89b',archer.handL);
    const stoneHeld=k.mesh(new THREE.DodecahedronGeometry(.09),k.mat('#91866e'),0,-.03,0,thrower.handR);
    // All destinations clear Samuel by >0.7 world units. No arrow or stone intersects the figure.
    for(let i=0;i<4;i++){
      const a=arrow(k);token(k,a,`Flecha ${i+1}`,'Projétil que não atinge Samuel','Helamã 16:2','O relato afirma que flechas e pedras não conseguiam atingi-lo.');
      projectile(k,a,[2.25,1.42,2.1],[i%2?1.7:2.6,4.8,-3.3],16+i*2,18.9+i*2,.8);
    }
    for(let i=0;i<4;i++){
      const stone=k.mesh(new THREE.DodecahedronGeometry(.09+(i%2)*.015),k.mat('#9b8e74'));
      projectile(k,stone,[.65,1.3,3],[i%2?2:-1.8,3.1,-3.4],17+i*2,20+i*2,1.9);
    }
    k.animate(t=>{
      teaching(samuel,t,.8+ease(1,6,t)*.2);samuel.leftArm.rotation.z=-.4-.3*ease(8,14,t);samuel.head.rotation.y=Math.sin(t*.4)*.22;
      believers.forEach((r,i)=>{const trust=ease(7+i*.7,13+i*.7,t);r.head.rotation.x=-.2*trust;r.rightForearm.rotation.x=-.9*trust;r.leftArm.rotation.z=-.25*trust;const retreat=ease(27,32,t),from=[[-2.45,-3.3,-1.4][i],[.55,1.8,2][i]],to=[from[0]-.8,from[1]+.45];r.root.position.x=mix(from[0],to[0],retreat);r.root.position.z=mix(from[1],to[1],retreat);walking(r,from,to,27,32,t,.22);r.root.rotation.y=mix(Math.PI,Math.atan2(-.8,.45),retreat);});
      const aiming=ease(12,15,t)*(1-ease(25,29,t));archer.leftArm.rotation.x=-1.2*aiming;archer.rightArm.rotation.x=-1.1*aiming;archer.rightForearm.rotation.x=-1.1*aiming;archer.rightArm.rotation.z=.25*aiming;
      const throwPhase=t>=16&&t<26?Math.sin((t-16)*Math.PI)*ease(15.5,17,t)*(1-ease(25,26,t)):0;thrower.rightArm.rotation.x=(-.5-throwPhase*.8)*aiming;thrower.rightForearm.rotation.x=-.8*aiming;stoneHeld.visible=throwPhase<.4;
      skeptic.rightArm.rotation.z=.8*ease(6,12,t)*(1-ease(24,30,t));skeptic.head.rotation.y=Math.sin(t*.9)*.3;
      k.light.intensity=3.1+.35*ease(24,31,t);
    });k.cloud(-1,6,-4,1.1);k.cloud(3.5,5,-4,.8);
  },

  M16(k) {
    k.finish({ground:'#bdb695',camera:[10,8,12],target:[0,2,0]});k.background.set('#d8dfd2');
    const building=temple(k,0,-3.4);token(k,building,'Templo em Abundância','Lugar da reunião','3 Néfi 11:1','A multidão estava reunida nos arredores do templo. A arquitetura é uma escolha artística.');
    for(let i=0;i<7;i++)for(let j=0;j<3;j++)k.box(.7,.035,.8,(i+j)%2?'#c9bea0':'#b7ac8c',-2.4+i*.8,.02,-.7+j*.85);
    k.tree(-4.1,-1.4,1);k.tree(4.2,-1.6,.85);
    const christ=k.person('Jesus Cristo',0,-.25,{y:5.6,robe:'#f2ecd7',mantle:'#e5d9b6',hair:'#67513b'});
    const ray=k.ray(0,0,-.25,7);const cloudL=k.cloud(-1,6,-1.3,1),cloudR=k.cloud(1,6,-1.3,1);
    const nephi=k.person('Néfi, discípulo de Cristo',-1.7,1.7,{robe:'#9ba78c',rotation:Math.PI});
    const witnesses=[nephi];for(let i=0;i<7;i++){const a=(i/7)*Math.PI*1.5-Math.PI*.25;const r=k.person('Povo de Néfi',Math.sin(a)*3.15,Math.cos(a)*2+1,{robe:colors[i%6],beard:i%2===0,scale:i===5?.7:1,rotation:Math.atan2(-Math.sin(a)*3.15,-Math.cos(a)*2-1)});witnesses.push(r);}
    const points=witnesses.map(r=>r.root.position.clone()),showChrist=fade(christ.root),showRay=fade(ray);
    k.animate(t=>{
      const descend=ease(8,16,t),invite=ease(16,20,t);christ.root.position.y=mix(5.6,0,descend);showChrist(ease(7,9,t));christ.leftArm.rotation.z=-.5*descend-.12*invite;christ.rightArm.rotation.z=.6*descend+.05*invite;christ.leftArm.rotation.x=-.55*invite;christ.rightArm.rotation.x=-.55*invite;christ.leftForearm.rotation.x=-.35*invite;christ.rightForearm.rotation.x=-.35*invite;christ.head.rotation.x=.12*invite;christ.head.rotation.y=Math.sin(t*.35)*.1*invite;
      cloudL.position.x=-1-ease(4,13,t)*1.7;cloudR.position.x=1+ease(4,13,t)*1.7;showRay(ease(4,7,t));k.light.intensity=2.4+ease(5,16,t)*1.2;
      const targets=[[-.65,.55],[.68,.6],[-1.15,.95],[1.15,1.0]];
      witnesses.forEach((r,i)=>{r.head.rotation.x=-.35*ease(1,5,t)*(1-ease(15,18,t));const bow=ease(16.5,19,t)*(1-ease(20,22,t));kneel(r,bow);r.leftForearm.rotation.x=-.6*bow;r.rightForearm.rotation.x=-.6*bow;
        if(i<4){const start=20+i*1.8,end=start+3.2,approach=ease(start,end,t),dest=targets[i];r.root.position.x=mix(points[i].x,dest[0],approach);r.root.position.z=mix(points[i].z,dest[1],approach);if(t>=start&&t<=end)walking(r,[points[i].x,points[i].z],dest,start,end,t,.2);const touch=ease(end-.6,end+.6,t)*(1-ease(end+1.2,end+2.2,t)),worship=ease(end+1.2,end+2.5,t);r.rightArm.rotation.x=-.95*touch;r.rightForearm.rotation.x=-.55*touch;if(worship>0){kneel(r,worship*.85);prayer(r,worship);}}
      });
    });
  },

  M17(k) {
    k.finish({ground:'#acb28b',camera:[9,6.7,11],target:[0,1,0]});k.background.set('#d9e2cd');
    // An intimate garden edge is deliberately separate from the descent and children's compositions.
    temple(k,1.8,-4);k.tree(-3.8,-2.1,1.25);k.tree(4.3,-.8,1);k.tree(-4.3,2,.8);
    for(let i=0;i<7;i++){const b=k.box(.8,.05,.7,i%2?'#c9bea0':'#c1b18c',-.6+i*.35,.025,-2.6+i*.8);b.rotation.y=-.25;}
    k.rock(-1.8,-2.6,.8);k.rock(3.9,2.7,.65);for(let i=0;i<8;i++)grass(k,-3.1+(i%2)*.3,-1.6+i*.55,1.1);
    const christ=k.person('Jesus Cristo',.3,-.8,{robe:'#f2ecd7',mantle:'#dfd6ba',hair:'#67513b'});
    const patient=k.person('Pessoa enferma',-2.15,2.8,{robe:'#9dad96',hair:'#71634d'}),helper=k.person('Acompanhante',-2.9,2.7,{robe:'#bfaa82',beard:false});
    const second=k.person('Outra pessoa enferma',2.8,2.1,{robe:'#ba9c80',beard:false}),family=k.person('Pessoas reunidas',3.4,.5,{robe:'#a49e78'});
    const staff=beam(k,[0,-.2,0],[0,.65,0],.032,'#8b6a45',patient.handL);token(k,staff,'Apoio de madeira','Detalhe artístico','3 Néfi 17:5–10','O apoio sugere uma dificuldade de locomoção sem identificar uma enfermidade específica.');
    const starting={p:patient.root.position.clone(),h:helper.root.position.clone()},showStaff=fade(staff);
    k.animate(t=>{
      const move=ease(6,15,t),heal=ease(17,23,t);patient.root.position.x=mix(starting.p.x,-.35,move);patient.root.position.z=mix(starting.p.z,-.4,move);patient.root.rotation.y=2.6;helper.root.position.x=mix(starting.h.x,-1.3,move);helper.root.position.z=mix(starting.h.z,.1,move);helper.root.rotation.y=2.6;
      walking(patient,[starting.p.x,starting.p.z],[-.35,-.4],6,15,t,.12);walking(helper,[starting.h.x,starting.h.z],[-1.3,.1],6,15,t,.2);
      patient.root.rotation.z=.12*(1-heal);patient.head.rotation.x=.2*(1-heal);patient.leftArm.rotation.x=-.4*(1-heal);patient.leftForearm.rotation.x=-.4;helper.rightArm.rotation.z=.8*(1-ease(20,24,t));helper.rightForearm.rotation.x=-.6;
      if(t<=25)supportTiltedFeet(patient);
      const care=ease(14,18,t);christ.leftArm.rotation.z=-1*care;christ.leftForearm.rotation.x=-.5*care;christ.rightArm.rotation.x=-.55*care;christ.head.rotation.y=-.45*care;
      reach(christ,'left',[patient.root.position.x,1.08,patient.root.position.z],care*(1-ease(24,27,t)));
      second.head.rotation.y=-.5;second.leftForearm.rotation.x=-.5*ease(15,20,t);family.rightArm.rotation.z=.65*ease(22,27,t);
      if(t>25){kneel(patient,ease(25,29,t));prayer(patient,1);kneel(helper,ease(26,30,t));prayer(helper,1);kneel(second,ease(26,31,t));prayer(second,1);}
      showStaff(1-ease(23,25,t));k.light.intensity=3+heal*.5;k.light.color.setRGB(1,.92,.75+heal*.12);
    });k.cloud(0,5.5,-3,1.1);
  },

  M18(k) {
    k.finish({ground:'#aab18a',camera:[9,7.3,11],target:[0,1.4,0]});k.background.set('#dfe4d2');
    temple(k,0,-4);k.tree(-4,-1.8,1);k.tree(4,-1.8,1);for(let i=0;i<12;i++)grass(k,Math.cos(i)*4.6,Math.sin(i)*4.5,.8);
    const christ=k.person('Jesus Cristo',0,-.4,{robe:'#f2ecd7',mantle:'#e2d8bb',hair:'#67513b'});
    const children=[];for(let i=0;i<5;i++){const a=(i/4-.5)*Math.PI*.85,from=[Math.sin(a)*3.6,Math.cos(a)*2.7+.2],to=[Math.sin(a)*1.3,Math.cos(a)*1.15-.15];const r=k.person('Crianças',...from,{robe:colors[i],scale:.5+(i%2)*.07,beard:false});r.root.userData.blessingPlace=to;k.walk(r,from,to,1+i*.4,8+i*.4);children.push(r);}
    const parents=[];for(let i=0;i<5;i++){const a=(i/4-.5)*Math.PI*1.05;const r=k.person('Famílias',Math.sin(a)*3.4,Math.cos(a)*2.5+.6,{robe:colors[(i+3)%6],beard:i%2===1,rotation:Math.PI});parents.push(r);}
    const angels=[];for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.5;const r=k.person('Anjos',Math.sin(a)*2.05,Math.cos(a)*1.65-.1,{y:4.8,robe:'#f1e9ce',mantle:'#dfd7bb',hair:'#ad9c73',beard:false,scale:.9,rotation:-a});angels.push(r);}
    // A luminous circle represents the scriptural fire without literal flames reaching the children.
    const halo=ring(k,0,.06,-.05,2.35,'#eed38c');halo.material=k.mat('#f3d88c',{emissive:'#e8b95c',emissiveIntensity:.9,transparent:true,opacity:.15,depthWrite:false});
    const sparks=[];for(let i=0;i<26;i++){const a=i/26*Math.PI*2;const g=k.sphere(.035,'#f5dda0',Math.sin(a)*2.35,.15,Math.cos(a)*2.35-.05);g.material=k.mat('#f5dda0',{emissive:'#e5af4f',emissiveIntensity:1.1,transparent:true,opacity:.85});sparks.push(g);}
    token(k,halo,'Manifestação de fogo','Representação luminosa','3 Néfi 17:24–25','Os pequeninos são circundados por fogo enquanto anjos ministram entre eles.');
    const showAngels=angels.map(r=>fade(r.root)),showSparks=sparks.map(fade);
    k.animate(t=>{
      const pray=ease(9,12,t)*(1-ease(14,16,t));kneel(christ,pray);prayer(christ,pray);parents.forEach((r,i)=>{kneel(r,ease(9+i*.1,13+i*.1,t));prayer(r,ease(9,13,t));r.head.rotation.x=.2;});
      children.forEach(r=>{r.root.rotation.y=mix(r.root.rotation.y,Math.PI,ease(13,16,t));});
      if(t>=16){const index=Math.min(4,Math.floor((t-16)/1.6)),target=children[index];christ.head.rotation.y=Math.atan2(target.root.position.x,target.root.position.z+.4)*.4;christ.leftArm.rotation.z=-.6;christ.rightArm.rotation.z=.6;christ.leftForearm.rotation.x=-.8;christ.rightForearm.rotation.x=-.8;children.forEach((r,i)=>{const start=16+i*1.6,out=ease(start,start+.5,t),back=ease(start+1,start+1.6,t),visit=out*(1-back),to=r.root.userData.blessingPlace;r.root.position.x=mix(to[0],.15,visit);r.root.position.z=mix(to[1],.05,visit);const facing=Math.atan2(.15-to[0],.05-to[1]),turn=Math.atan2(Math.sin(facing-Math.PI),Math.cos(facing-Math.PI));r.root.rotation.y=Math.PI+turn*4*visit*(1-visit);r.head.rotation.x=i===index?-.17:0;r.leftForearm.rotation.x=i===index?-.6:0;r.rightForearm.rotation.x=i===index?-.6:0;stride(r,Math.hypot(to[0]-.15,to[1]-.05)*visit,4*visit*(1-visit),.2);if(i===index){r.head.updateWorldMatrix(true,false);const crown=new THREE.Vector3(0,r.root.userData.clayPerson?.crownOffset??.24,0).applyMatrix4(r.head.matrixWorld);crown.y+=.055;reach(christ,'right',crown,visit);}});}
      const descend=ease(24,30,t);angels.forEach((r,i)=>{showAngels[i](ease(24+i*.12,26+i*.12,t));r.root.position.y=mix(4.8,.15,descend);r.leftArm.rotation.z=-.55;r.rightArm.rotation.z=.55;r.head.rotation.x=.18;});
      const fire=ease(24,26,t);halo.visible=fire>0;halo.material.opacity=(.15+.5*descend)*fire;sparks.forEach((g,i)=>{showSparks[i](ease(24+(i%4)*.1,26+(i%4)*.1,t));g.position.y=.1+descend*(.1+(i%4)*.13)+Math.sin(t*2+i)*.04;});k.light.intensity=3+descend*.7;
    });
  },

  M19(k) {
    k.finish({night:true,ground:'#8e8d7f',camera:[9,7.4,11],target:[0,1.5,0]});k.background.set('#202b3a');k.stars();
    // A mountain shelf is raised above rough slopes. The luminous objects below are exactly 16.
    const mountain=k.mesh(new THREE.ConeGeometry(3.7,2.6,7,2),k.mat('#7f8175'),0,.8,-1.2);mountain.rotation.y=.22;
    const shelf=k.cylinder(2.05,.35,'#aaa99a',0,1.55,-.15);shelf.scale.z=.95;
    for(let i=0;i<8;i++){const r=k.rock(Math.sin(i*2)*3.6,Math.cos(i*2)*2.2-1,.65+(i%3)*.25);r.position.y=.2;}
    const brother=k.person('Irmão de Jarede',-.1,1.1,{y:1.75,robe:'#b9b3a0',mantle:'#8b968b',hair:'#685b45'});
    const tray=k.groupAt(0,1.76,-.8);k.mesh(new THREE.BoxGeometry(2.25,.045,.92),k.mat('#a99c7b'),0,0,0,tray);
    const stones=[];for(let i=0;i<16;i++){
      const x=(i%8-3.5)*.255,z=Math.floor(i/8)*.34-.17;
      const material=k.mat('#d8e1db',{emissive:'#ffe1a2',emissiveIntensity:0,roughness:.22,metalness:.12,transparent:true,opacity:.92}).clone();
      const stone=k.mesh(new THREE.DodecahedronGeometry(.095,1),material,x,.11,z,tray);stone.name=`Pedra luminosa ${i+1}`;stone.userData.jaredStone=i+1;stones.push(stone);
      token(k,stone,`Pedra ${i+1} de 16`,'Pedra para iluminar os barcos','Éter 3:1–6','Uma das dezesseis pequenas pedras apresentadas ao Senhor.');
    }
    token(k,tray,'Dezesseis pedras','Luz para oito barcos','Éter 3:1–6','Há duas pedras de iluminação para cada um dos oito barcos; esta composição inclui exatamente dezesseis.');
    const lord=k.person('Senhor',.15,-1.8,{y:1.75,robe:'#eae7d7',mantle:'#d4d6cb',hair:'#a19b84'});lord.root.traverse(o=>{if(o.isMesh)o.material=o.material.clone();});const veil=k.ray(.2,1.5,-1.8,5);
    const handTip=k.groupAt(0,2.2,-1);k.mesh(new THREE.SphereGeometry(.1,16,12),k.mat('#e6c8a0'),0,.16,0,handTip).scale.set(.75,1,.6);
    beam(k,[0,.13,.01],[0,-.05,.02],.024,'#e6c8a0',handTip);for(let i=0;i<3;i++)beam(k,[-.055+i*.045,.19,-.01],[-.05+i*.04,.06,-.025],.018,'#e6c8a0',handTip);
    token(k,handTip,'Toque do Senhor','Ação descrita no relato','Éter 3:6','O Senhor toca as pedras uma por uma. A trajetória é uma escolha de encenação.');
    const pool=new THREE.PointLight('#ffda91',0,7,2);pool.position.set(0,2,-.6);k.add(pool);const showHand=fade(handTip),showLord=fade(lord.root),showVeil=fade(veil);
    k.animate(t=>{
      const pray=ease(1,5,t);kneel(brother,pray,1.75);prayer(brother,pray);brother.head.rotation.x=.28;
      const touch=Math.max(0,Math.min(15,(t-14)/.82)),index=Math.min(15,Math.floor(touch)),fraction=touch-index,next=Math.min(15,index+1);
      stones.forEach((s,i)=>{const power=ease(14+i*.82,14.2+i*.82,t);s.material.emissiveIntensity=power*2.4;s.material.color.setRGB(mix(.75,1,power),mix(.8,.95,power),mix(.78,.78,power));});
      const a=stones[index].position,b=stones[next].position,smooth=ease(0,1,fraction);handTip.position.set(mix(a.x,b.x,smooth),1.76+.11+.1+Math.sin(smooth*Math.PI)*.15,-.8+mix(a.z,b.z,smooth));showHand(ease(12.8,13.4,t)*(1-ease(26.8,27.4,t)));
      const reveal=ease(27,31,t);showLord(reveal);lord.root.position.y=1.75;lord.rightArm.rotation.x=-.9;lord.rightForearm.rotation.x=-.6;lord.leftArm.rotation.z=-.35;
      const fall=ease(26,28,t)*(1-ease(29,31,t));brother.root.rotation.x=.35*fall;brother.root.position.y=1.75-.095*pray;brother.head.rotation.x=.28+.3*fall;
      pool.intensity=ease(14,28,t)*3;k.light.intensity=.75+ease(14,28,t)*.55;showVeil(ease(12.8,14,t));
    });
    k.select(mountain,'Monte Selém','Lugar do encontro','Éter 3:1','O texto identifica o nome do monte, sem estabelecer uma localização moderna.');
  },

  M20(k) {
    k.finish({night:true,ground:'#93947d',camera:[8,6.3,10],target:[0,1,0]});k.background.set('#28333c');k.stars();
    // Unlocated shelter: deliberately no modern map, named hill, or archaeological claim.
    k.rock(-3.1,-2,2);k.rock(1.7,-3,2.6);k.rock(3.5,-1.6,1.7);k.tree(-4.1,.8,.8);
    const desk=k.groupAt(-.4,0,0);for(const side of[-1,1])k.mesh(new THREE.BoxGeometry(.17,.7,.17),k.mat('#7e6949'),side*.67,.35,0,desk);k.mesh(new THREE.BoxGeometry(1.7,.13,.85),k.mat('#a68b60'),0,.77,0,desk);
    const plates=k.plates(-.4,.88,0);token(k,plates,'Registro de Morôni','Placas preservadas','Mórmon 8; Morôni 10','Morôni continua o registro e dirige suas palavras a leitores futuros.');
    const moroni=k.person('Morôni',-.35,-.6,{robe:'#b9b395',mantle:'#87947c',hair:'#6d6851'});moroni.root.rotation.y=0;
    const stylus=k.groupAt();beam(k,[0,.04,0],[0,-.16,0],.014,'#9c9074',stylus);
    const caseGroup=k.groupAt(1.8,0,.65);const cloth=k.mesh(new THREE.BoxGeometry(1.1,.06,.9),k.mat('#a09372'),0,.09,0,caseGroup);
    for(const side of[-1,1])beam(k,[side*.48,.12,-.34],[side*.48,.12,.34],.014,'#c8b58b',caseGroup);
    const lamp=k.lamp(-1.2,.85,0);const glimmer=new THREE.PointLight('#ffe0a0',1,3);glimmer.position.set(-1.2,1.1,0);k.add(glimmer);
    const initial=new THREE.Vector3(-.4,.88,0),carry=new THREE.Vector3(),showStylus=fade(stylus);
    k.animate(t=>{
      const write=1-ease(17,20,t);moroni.rightArm.rotation.x=-.9*write;moroni.rightForearm.rotation.x=(-.6+Math.sin(t*3)*.06)*write;moroni.head.rotation.x=.25*write;showStylus(1-ease(18.5,20,t));reach(moroni,'right',[-.35+Math.sin(t*2)*.05,1.18,-.12+Math.cos(t*3)*.02],write);
      k.group.updateMatrixWorld(true);moroni.handR.getWorldPosition(stylus.position);
      const finish=ease(17,21,t);moroni.leftArm.rotation.x=-.75*finish;moroni.leftForearm.rotation.x=-.4*finish;
      const move=ease(22,28,t);moroni.root.position.x=mix(-.35,1.25,move);moroni.root.position.z=mix(-.6,.1,move);walking(moroni,[-.35,-.6],[1.25,.1],22,28,t,.2);moroni.root.rotation.y=Math.atan2(1.6,.7)*move;
      const lift=ease(20,23,t),place=ease(28,31,t);k.group.updateMatrixWorld(true);moroni.handL.getWorldPosition(carry);plates.position.copy(initial).lerp(carry,lift);plates.position.lerp(new THREE.Vector3(1.8,.15,.65),place);plates.rotation.y=.2*lift*(1-place);if(t>=20)moroni.rightArm.rotation.x=-.65*lift*(1-place);
      moroni.head.rotation.y=-.25*ease(8,13,t)*(1-finish);k.light.color.setRGB(.8+place*.2,.82+place*.08,1-place*.17);k.light.intensity=.9+place*.45;
    });
    token(k,caseGroup,'Recolhimento dos registros','Composição artística','Morôni 10:2,34','A embalagem e o lugar são escolhas visuais, sem alegação de localização histórica.');
  },

  M21(k) {
    k.finish({ground:'#6b7d53',camera:[8.6,6.2,10.5],target:[0,1.1,0]});k.background.set('#c9d5c0');
    for(const[x,z,s]of[[-3.6,-2.2,1.35],[-1.8,-3.5,1.5],[1.9,-3.3,1.45],[3.7,-1.6,1.25],[-3.4,1.8,1.05],[3.2,2.1,1.1]])k.tree(x,z,s);
    for(let i=0;i<14;i++)grass(k,Math.cos(i*1.7)*3.8,Math.sin(i*1.7)*3.6,.85);
    const stump=k.cylinder(.48,.42,'#7b5e3f',1.5,.21,-.8);
    const plates=k.plates(1.5,.46,-.8);
    token(k,plates,'Promessa sobre os registros','Oração pela preservação','Enos 1:13–16','Enos ora com fé para que o Senhor preserve os registros e os leve aos lamanitas no futuro.');
    const enos=k.person('Enos',-.3,.6,{robe:'#9e8b6b',mantle:'#5e7358',hair:'#4c3828',beard:false});
    const jacob=k.person('Jacó (na memória de Enos)',-2.1,-1.2,{robe:'#cfc2a3',mantle:'#8d7b60',hair:'#b8b09c',beard:true,scale:.94});
    const ray=k.ray(-.3,.05,.6,4.8);
    const showJacob=fade(jacob.root),showRay=fade(ray);
    k.animate(t=>{
      const remember=1-ease(7,10,t),kneelAmt=ease(6,11,t),forgive=ease(15,22,t),intercede=ease(23,30,t);
      showJacob(remember*.85);
      jacob.rightArm.rotation.x=-.65*remember;
      kneel(enos,kneelAmt);
      prayer(enos,kneelAmt*(1-intercede*.4));
      enos.head.rotation.x=.26*kneelAmt-.42*forgive;
      enos.leftArm.rotation.z=-.35*kneelAmt-.35*intercede;
      enos.rightArm.rotation.z=.35*kneelAmt+.35*intercede;
      enos.head.rotation.y=.35*intercede;
      showRay(forgive);
      k.light.intensity=2.1+forgive*.9;
      stump.visible=true;
    });
  },

  M22(k) {
    k.finish({ground:'#b59e7a',camera:[9.4,6.6,11.2],target:[0,1.2,-.2]});k.background.set('#dfd2b7');
    const dais=masonry(k,0,-2.3,5.2,.65,2.2);
    for(const x of[-2.2,2.2])k.cylinder(.24,2.8,'#c8b594',x,1.4,-1.8);
    const throne=k.box(1.1,.95,.85,'#8e6a45',0,1.1,-2.35);k.fire(-2.4,.75,-1.5,.45);k.fire(2.4,.75,-1.5,.45);
    token(k,throne,'Trono do rei Noé','Corte em Lehi-Néfi','Mosias 12:17–19','Abinádi é levado perante o rei Noé e seus sacerdotes e testifica com poder sobre a lei e o Messias.');
    const abinadi=k.person('Abinádi',-.2,1.1,{robe:'#c8b99c',mantle:'#7e6a54',hair:'#c9c1ae',beard:true});
    const king=k.person('Rei Noé',0,-2.1,{y:.65,robe:'#b8864b',mantle:'#7a3e38',hair:'#4d382a',beard:true});
    const alma=k.person('Alma',1.9,.4,{robe:'#98a38c',mantle:'#677560',hair:'#523d2d',beard:false});
    const priests=[-1.7,1.7].map((x,i)=>k.person('Sacerdotes de Noé',x,-1.6,{y:.65,robe:colors[i+1],mantle:'#7d6c55',beard:true,scale:.93}));
    const halo=k.ray(-.2,.08,1.1,4.2);const showHalo=fade(halo);
    k.animate(t=>{
      const shine=ease(7,13,t),command=ease(14,22,t),convert=ease(22,30,t);
      abinadi.root.rotation.y=Math.PI;
      abinadi.rightArm.rotation.x=-1.15*shine-.2*command;
      abinadi.leftArm.rotation.z=-.45*command;
      abinadi.head.rotation.x=-.14*shine;
      showHalo(shine);
      king.rightArm.rotation.x=-.65*ease(2,8,t)*(1-shine*.5);
      priests.forEach((r,i)=>{r.head.rotation.y=(i?-.25:.25)*(1-shine);r.root.position.z=-1.6-.18*shine;});
      alma.root.rotation.y=-2.2;
      alma.root.position.x=mix(1.9,1.35,convert);
      alma.head.rotation.x=.22*convert;
      alma.rightArm.rotation.x=-.75*convert;
      alma.rightForearm.rotation.x=-.7*convert;
      k.light.intensity=2.3+shine*.8;
      dais.visible=true;
    });
  },

  M23(k) {
    k.finish({ground:'#8c8577',camera:[9.2,6.5,11],target:[0,1.2,0]});k.background.set('#b7b2a6');
    const wallBack=masonry(k,0,-2.3,5.6,2.6,.7);
    const pillarL=k.box(.75,2.7,.75,'#989082',-1.85,1.35,-.6);
    const pillarR=k.box(.75,2.7,.75,'#989082',1.85,1.35,-.6);k.fire(-2.5,1.2,-1.8,.4);k.fire(2.5,1.2,-1.8,.4);
    token(k,pillarL,'Pilares da prisão de Amonia','Libertação pelo poder de Deus','Alma 14:26–29','A terra treme e as paredes da prisão se fendem quando Alma e Amuleque clamam ao Senhor.');
    const alma=k.person('Alma, o Filho',-.65,-.2,{robe:'#b7ab91',mantle:'#6c7a6b',hair:'#5b4534',beard:false});
    const amulek=k.person('Amuleque',.65,-.2,{robe:'#a6987e',mantle:'#7c6953',hair:'#523f30',beard:true});
    const cords=[-0.65,0.65].map(x=>ring(k,x,.75,-.2,.32,'#6e563b'));
    const ray=k.ray(0,.05,-.2,4.8);const showRay=fade(ray);
    k.animate(t=>{
      const bound=1-ease(14,18,t),cry=ease(7,14,t),breakFree=ease(15,21,t),walkOut=ease(23,31,t);
      [alma,amulek].forEach((r,i)=>{
        kneel(r,bound*.75);
        r.leftArm.rotation.x=-.55*bound-.65*cry*(1-walkOut);
        r.rightArm.rotation.x=-.55*bound-.75*breakFree*(1-walkOut);
        r.head.rotation.x=.22*bound-.24*cry;
        r.root.position.z=mix(-.2,1.85,walkOut);
        walking(r,[i?.65:-.65,-.2],[i?.65:-.65,1.85],23,31,t,.2);
      });
      cords.forEach((c,i)=>{c.position.y=mix(.75,.08,breakFree);c.scale.setScalar(1+.35*breakFree);c.visible=t<24;});
      pillarL.rotation.z=.32*breakFree;pillarL.position.x=-1.85-.45*breakFree;
      pillarR.rotation.z=-.32*breakFree;pillarR.position.x=1.85+.45*breakFree;
      showRay(breakFree);
      k.light.intensity=1.9+breakFree*1.1;
      wallBack.visible=true;
    });
  },

  M24(k) {
    k.finish({ground:'#989f74',camera:[9.6,6.6,11.4],target:[0,1.1,.2]});k.background.set('#d7dec5');
    for(const[x,z,s]of[[-3.9,-2.4,1.2],[3.8,-2.3,1.15],[-3.6,1.8,.95]])k.tree(x,z,s);
    for(let i=0;i<12;i++)grass(k,Math.cos(i*1.9)*4.1,Math.sin(i*1.9)*3.7,.85);
    const banner=k.flag(.6,0,-.9,'#b88c4a');
    token(k,banner,'Compromisso dos jovens de Helamã','Fé ensinada pelas mães','Alma 53:20–21; 56:47–48','Eles nunca haviam lutado, mas não duvidavam de que suas mães sabiam que Deus os livraria.');
    const helaman=k.person('Helamã',0,-.7,{robe:'#a38b68',mantle:'#5e6f59',hair:'#7a6b58',beard:true});
    const youths=[[-1.6,.8],[-.55,.95],[.55,.95],[1.6,.8]].map(([x,z],i)=>k.person('Jovens guerreiros',x,z,{robe:colors[i],mantle:'#c7b593',beard:false,scale:.88}));
    const mothers=[-2.4,2.4].map((x,i)=>k.person('Mães de fé (memória viva)',x,-1.6,{robe:colors[i+2],mantle:'#dfd1b4',beard:false,scale:.92}));
    const showMothers=mothers.map(r=>fade(r.root));
    youths.forEach(r=>{const spear=k.groupAt();beam(k,[0,-.45,0],[0,.75,0],.018,'#785c3d',spear);r.handR.add(spear);});
    k.animate(t=>{
      const remember=ease(6,13,t)*(1-ease(18,22,t)),march=ease(15,23,t),thanks=ease(24,31,t);
      showMothers.forEach(fn=>fn(remember*.85));
      mothers.forEach(r=>{r.rightArm.rotation.x=-.65*remember;});
      helaman.rightArm.rotation.x=-.85*ease(0,7,t)-.35*march;
      helaman.root.position.z=mix(-.7,.35,march);
      walking(helaman,[0,-.7],[0,.35],15,23,t,.18);
      youths.forEach((r,i)=>{
        r.root.rotation.y=Math.PI*(1-march);
        r.root.position.z=mix(i%2?.95:.8,(i%2?.95:.8)+.75,march);
        walking(r,[r.root.position.x,i%2?.95:.8],[r.root.position.x,(i%2?.95:.8)+.75],15,23,t,.18);
        r.rightArm.rotation.x=-.75*ease(2,9,t);
        kneel(r,thanks*.7);
        prayer(r,thanks);
      });
      kneel(helaman,thanks*.65);
    });
  },
};
