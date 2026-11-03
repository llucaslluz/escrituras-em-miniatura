import { THREE, ease, mix, colors, tent, beam, prayer, teaching, thought, kneel, token, tool, temple, grass, ring, bag, reach, fade, walking } from './utils.js';

export const builders = {
  M07(k) {
    k.finish({ground:'#a5a37c',camera:[10,8,12],target:[0,1.1,-.5]});k.background.set('#d7ddc7');
    temple(k,0,-4.25);const tower=k.groupAt(0,0,-1.8);
    tower.name='Estrutura contraventada da torre';
    for(const x of[-.8,.8])for(const z of[-.65,.65])beam(k,[x,0,z],[x,2.95,z],.12,'#9b7950',tower);
    const floor=k.mesh(new THREE.BoxGeometry(2.2,.2,1.85),k.mat('#ad8b5f'),0,2.3,0,tower);floor.name='Piso da torre';
    for(const side of[-1,1]){beam(k,[side*.8,2.86,-.65],[side*.8,2.86,.65],.06,'#a37d4f',tower);beam(k,[side*.8,.24,-.65],[side*.8,2.14,.65],.065,'#8c6d46',tower);beam(k,[-.8,2.86,side*.65],[.8,2.86,side*.65],.06,'#a37d4f',tower);}
    beam(k,[-.8,.24,-.65],[.8,2.14,-.65],.065,'#8c6d46',tower);beam(k,[.8,.24,-.65],[-.8,2.14,-.65],.065,'#8c6d46',tower);
    token(k,tower,'Torre de Benjamim','Lugar de ensino','Mosias 2:7–8','A torre permite que o povo ouça Benjamim; suas palavras também são escritas e distribuídas.');
    for(let i=0;i<4;i++){const x=[-3.5,-2.7,2.7,3.6][i],z=[-.2,2.9,2.9,-.2][i];const familyTent=tent(k,x,z,['#a88d63','#cfbb8b','#b69a73','#ad957b'][i],.78,Math.atan2(-x,-1.8-z),{drape:.24,edgeDrape:.6});familyTent.name='Tenda voltada à torre';}
    const king=k.person('Rei Benjamim',0,-1.8,{y:2.4,robe:'#d4c298',mantle:'#8c765c',hair:'#858171'}),mosiah=k.person('Mosias',1.2,-2,{robe:'#a58d68'});
    const audience=[];for(let i=0;i<9;i++){const x=(i%3-1)*1.1,z=.6+Math.floor(i/3)*1.25;const r=k.person('Famílias reunidas',x,z,{robe:colors[i%6],beard:i%3!==1,scale:i===7?.65:.93,rotation:Math.PI});audience.push(r);}
    const pages=[];for(let i=0;i<3;i++)pages.push(k.box(.3,.012,.22,'#e5d8b4',-.9+i*.8,.06,2.8));const showPages=pages.map(fade);
    k.animate(t=>{teaching(king,t,ease(2,6,t));king.leftArm.rotation.z=-.25-.5*ease(15,20,t);mosiah.head.rotation.y=-.4;audience.forEach((r,i)=>{thought(r,t,i);const u=ease(23+i*.2,28+i*.2,t);prayer(r,u);r.head.rotation.x=.13*u;});pages.forEach((p,i)=>{showPages[i](ease(11+i*.25,13+i*.25,t));p.rotation.z=Math.sin(t*.7+i)*.02;});k.light.color.setRGB(1,.91+.04*ease(24,32,t),.73+.1*ease(24,32,t));});
    k.tree(-4,-3.1,.8);k.tree(4.4,-2.7,.9);k.cloud(1,6,-4,1.2);
  },

  M08(k) {
    k.finish({ground:'#b8a583',camera:[10,6.9,11],target:[0,1,-.5]});k.background.set('#d0c4ac');
    for(let i=0;i<7;i++)k.box(.93,.04,5.3,i%2?'#bfae8b':'#cbbd9c',-2.8+i*.94,.02,-.5);
    k.box(8,3,.4,'#b3a180',0,1.5,-3.2);
    for(const x of[-3.6,3.6])for(const z of[-2.1,1.8]){k.cylinder(.24,3,'#d6c39c',x,1.5,z);k.cylinder(.36,.16,'#aa8b60',x,.08,z);k.cylinder(.36,.16,'#c6aa79',x,3,z);}
    k.box(2.5,.28,2,'#a58b65',.5,.14,-2.1);const throne=k.groupAt(.5,.28,-2.5);
    k.mesh(new THREE.BoxGeometry(1.1,1.7,.25),k.mat('#9b7048'),0,.9,0,throne);k.mesh(new THREE.BoxGeometry(1.2,.2,.9),k.mat('#b7925e'),0,.45,.4,throne);
    for(const side of[-1,1])k.mesh(new THREE.BoxGeometry(.18,.8,.7),k.mat('#c3a069'),side*.55,.6,.4,throne);
    token(k,throne,'Tribunal do rei Noé','Corte','Mosias 12–17','Abinádi ensina diante do rei e de seus sacerdotes.');
    const noah=k.person('Rei Noé',.5,-2,{robe:'#a2755d',mantle:'#c4a25d',y:.28});noah.leftLeg.rotation.x=-1.1;noah.rightLeg.rotation.x=-1.1;
    const footrest=k.box(.75,.1,.47,'#9b7950',.5,.40,-1.64);footrest.name='Apoio dos pés do trono';
    const abinadi=k.person('Abinádi',-.7,.9,{robe:'#d6cdb2',hair:'#8d8774'}),alma=k.person('Alma',2.3,-.6,{robe:'#879180',beard:false});
    const priests=[k.person('Sacerdote',-2,-1.6,{robe:'#b89875'}),k.person('Sacerdote',2,-1.8,{robe:'#9e866d'})];
    const desk=k.table(3,0,2.5,1.3,.7),plates=k.plates(3,.97,2.5),showDesk=fade(desk),showPlates=fade(plates);desk.visible=false;plates.visible=false;
    const pen=k.groupAt();beam(k,[0,.04,0],[0,-.16,0],.012,'#877451',pen);const showPen=fade(pen);
    k.lamp(-3,.8,-2.4);k.lamp(3,.8,-2.4);
    k.animate(t=>{
      teaching(abinadi,t,ease(2,6,t));noah.rightArm.rotation.z=.8*ease(12,17,t);noah.head.rotation.y=-.25;
      const defend=ease(16,20,t)*(1-ease(23,26,t));alma.leftArm.rotation.z=-1.1*defend;alma.rightForearm.rotation.x=-.7*defend;alma.head.rotation.y=-.5;
      priests.forEach((r,i)=>{r.head.rotation.y=Math.sin(t*.8+i)*.18;r.leftArm.rotation.z=-.3*ease(9,15,t);});
      const later=ease(25,30,t);alma.root.position.x=mix(2.3,3,later);alma.root.position.z=mix(-.6,3.12,later);alma.root.rotation.y=mix(0,Math.PI,later);showDesk(ease(24.5,26.5,t));showPlates(ease(24.5,26.5,t));
      walking(alma,[2.3,-.6],[3,3.12],25,30,t);
      showPen(ease(29,30,t));if(t>27){alma.rightArm.rotation.x=-.8;alma.rightForearm.rotation.x=-.5+Math.sin(t*4)*.1;alma.head.rotation.x=.25;reach(alma,'right',[3+Math.sin(t*2)*.02,1.27,2.65+Math.cos(t*3)*.01],ease(29,30,t));}k.group.updateMatrixWorld(true);alma.handR.getWorldPosition(pen.position);
      k.light.intensity=3.1-.5*ease(24,32,t);
    });
  },

  M09(k) {
    k.finish({ground:'#85916a',camera:[10,7,11],target:[0,1,0]});k.background.set('#c9d8c0');
    const river=k.water(3.1,8.6,0,0,{color:'#6bafa5',y:.72});token(k,river,'Águas de Mórmon','Lugar de convênio','Mosias 18','Alma reúne e ensina o povo neste lugar.');
    // A closed, softly rounded bank surrounds the pool and blends into the
    // base. The water and shoreline share a gently irregular oval contour.
    const offset=z=>.2*Math.sin(z*.7),width=z=>1.55*Math.sqrt(Math.max(0,1-(z/4.3)**2))*(1+.08*Math.sin(z*.85));
    const banks=[],indices=[],segments=48,profiles=[[.7,2.4,.02],[1.3,3.7,.43],[1.55,4.3,.68],[1.72,4.52,.77],[2.12,4.98,.38],[2.55,5.5,.008]];
    for(const[ring,[rx,rz,y]]of profiles.entries())for(let i=0;i<segments;i++){const angle=i/segments*Math.PI*2,z=rz*Math.sin(angle);banks.push(rx*Math.cos(angle)*(1+.08*Math.sin(z*.85))+offset(z),y+(ring===3?.018*Math.sin(angle*3):0),z);}
    const center=banks.length/3;banks.push(0,.02,0);for(let i=0;i<segments;i++)indices.push(center,(i+1)%segments,i);
    for(let ring=0;ring<profiles.length-1;ring++)for(let i=0;i<segments;i++){const a=ring*segments+i,b=ring*segments+(i+1)%segments,c=b+segments,d=a+segments;indices.push(a,b,c,a,c,d);}
    const bottom=banks.length/3,outer=(profiles.length-1)*segments;for(let i=0;i<segments;i++)banks.push(banks[(outer+i)*3],-.06,banks[(outer+i)*3+2]);
    const bottomCenter=banks.length/3;banks.push(0,-.06,0);for(let i=0;i<segments;i++){const j=(i+1)%segments;indices.push(outer+i,outer+j,bottom+j,outer+i,bottom+j,bottom+i,bottomCenter,bottom+i,bottom+j);}
    const bankGeometry=new THREE.BufferGeometry();bankGeometry.setAttribute('position',new THREE.Float32BufferAttribute(banks,3));bankGeometry.setIndex(indices);bankGeometry.computeVertexNormals();const bank=k.mesh(bankGeometry,k.mat('#87916b',{roughness:.88}));bank.name='Leito e margens orgânicas das Águas de Mórmon';bank.userData.mormonRiverBank=true;
    const surface=river.children.find(o=>o.geometry?.userData.clayWaterSurface),positions=surface.geometry.attributes.position,rest=new Float32Array(positions.array),ripples=river.children.filter(o=>o.userData.clayWaterRipple);
    k.ambient(()=>{for(let i=0;i<positions.count;i++){const z=rest[i*3+2];positions.setX(i,offset(z)+rest[i*3]/1.55*width(z));positions.setZ(i,z);}positions.needsUpdate=true;surface.geometry.computeVertexNormals();surface.geometry.boundingBox=surface.geometry.boundingSphere=null;for(const wave of ripples){const radius=wave.geometry.parameters.radius+.008,z=wave.position.z;wave.visible=Math.abs(z)+radius<4.3&&Math.abs(wave.position.x-offset(z))+radius<width(z);}});
    const terraces=[bank,...[-3.1,3.15].map(x=>k.cylinder(2.15,.7,'#87916b',x,.3,.05))];
    [[-4.4,-1.3,1.1],[-2.5,-3.2,1.2],[2.5,-3.6,.9],[4.5,1,1.1],[4,-2.5,.7]].forEach(([x,z,s])=>k.tree(x,z,s));
    k.group.updateMatrixWorld(true);const groundAt=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)).intersectObjects(terraces)[0]?.point.y??0;
    for(let i=0;i<10;i++){const x=(i%2?1:-1)*(1.6+(i%3)*.2),z=-3+i*.63,start=k.group.children.length;grass(k,x,z,1.3);for(const blade of k.group.children.slice(start))blade.position.y+=groundAt(x,z);}
    for(const[x,z]of[[1.2,-3.8],[-1.5,3.8]]){const rock=k.rock(x,z,.65);rock.position.y+=groundAt(x,z);}
    const alma=k.person('Alma',-.48,.15,{robe:'#d6cfb0'}),helam=k.person('Helã',.5,.15,{robe:'#97aca0',beard:false});
    const onlookers=[];for(let i=0;i<6;i++){const r=k.person('Pessoas reunidas',i<3?-2.65:2.7,(i%3)*1.05-1,{y:.65,robe:colors[i],beard:i%2===0,rotation:i<3?Math.PI/2:-Math.PI/2});onlookers.push(r);}
    const waves=[ring(k,-.4,.77,.15,.5),ring(k,.5,.77,.15,.55),ring(k,0,.77,.2,.9)];
    k.animate(t=>{
      const prepare=ease(7,12,t),down=ease(16,19,t)*(1-ease(20,24,t));
      alma.rightArm.rotation.z=.95*prepare;alma.rightForearm.rotation.x=-.6*prepare;helam.leftArm.rotation.z=-.5*prepare;helam.rightArm.rotation.z=.4*prepare;
      alma.root.position.y=-1.15*down;helam.root.position.y=-1.15*down;alma.root.rotation.x=-.25*down;helam.root.rotation.x=-.3*down;alma.head.rotation.x=.12;helam.head.rotation.x=.12;
      reach(alma,'right',[helam.root.position.x-.24,1.08+helam.root.position.y,helam.root.position.z],prepare);
      if(t<7)teaching(alma,t,.75);onlookers.forEach((r,i)=>{thought(r,t,i);if(t>24){prayer(r,ease(24,28,t));r.head.rotation.x=.1;}});
      waves.forEach((w,i)=>{w.scale.setScalar(1+down*.5+Math.sin(t*2-i)*.06);w.material.opacity=.25+down*.35;});k.light.intensity=3+ease(24,31,t)*.35;
    });
  },

  M10(k) {
    k.finish({ground:'#a8aa7d',camera:[9,7.2,11],target:[0,1.2,0]});k.background.set('#d2d8bf');
    const path=k.box(2.2,.035,9,'#c5b78b',0,.02,0);path.rotation.y=-.38;[[3.8,-2.7,.9],[-3.8,-2,1.1],[-4,2.1,.8],[3.2,2.9,.7]].forEach(([x,z,s])=>k.tree(x,z,s));k.rock(-1.5,-2.4,.7);
    const alma=k.person('Alma, o filho',-.5,.8,{robe:'#ad926b',mantle:'#89947c',beard:false});
    const friends=['Amon','Aarão','Ômner','Hímni'].map((n,i)=>k.person(n,-1.9+i*.9,2.1,{robe:colors[i],beard:false}));
    const angel=k.person('Anjo',.3,-1.1,{y:2,robe:'#f0e8cc',mantle:'#dcd9c3',hair:'#a08f69',beard:false});const ray=k.ray(.3,0,-1.1,6);const cloud=k.cloud(.3,3.9,-1.3,1.2);
    const father=k.person('Alma',2,1.1,{robe:'#c4c7a3',hair:'#8c856d'});const stars=k.stars(),showAngel=fade(angel.root),showRay=fade(ray),showCloud=fade(cloud),showFather=fade(father.root);
    k.animate(t=>{
      const walk=ease(0,6,t);alma.root.position.z=mix(1,.2,walk);walking(alma,[-.5,1],[-.5,.2],0,6,t,.2);friends.forEach((r,i)=>{r.root.position.z=mix(2.1,1.3,walk);walking(r,[-1.9+i*.9,2.1],[-1.9+i*.9,1.3],0,6,t,.22);});
      const appear=ease(6,9,t)*(1-ease(15,18,t));showAngel(appear);showRay(appear);showCloud(appear);angel.root.position.y=mix(2.7,1.6,appear);teaching(angel,t,1);
      const fall=ease(9,12,t)*(1-ease(24,28,t));alma.root.rotation.x=-1.2*fall;alma.root.position.y=.16*fall;alma.head.rotation.x=-.1*fall;alma.leftArm.rotation.z=-.45*fall;alma.rightArm.rotation.z=.45*fall;
      friends.forEach((r,i)=>{const u=ease(10+i*.25,14+i*.25,t);if(t>=10+i*.25)kneel(r,u);prayer(r,u);r.head.rotation.x=.18;});
      showFather(ease(16,18,t));prayer(father,1);father.head.rotation.x=.23;
      const night=ease(16,20,t)*(1-ease(23,28,t));k.light.intensity=3.2+appear-night*2;k.background.setRGB(.82-night*.66-appear*.18,.85-night*.64-appear*.12,.75-night*.49-appear*.04);stars.material.opacity=night*.9;
      if(t>28){teaching(alma,t,ease(28,31,t));alma.root.rotation.x=0;father.head.rotation.x=.03;friends.forEach(r=>{kneel(r,1-ease(28,32,t));});}
    });
  },

  M11(k) {
    k.finish({ground:'#9caa78',camera:[10,7,11],target:[0,1,0]});k.background.set('#d5dfc5');
    k.water(3.7,4,-2.65,-.4,{color:'#7aa7a0'});for(let i=0;i<8;i++)k.rock(-4.4+Math.sin(i*1.9)*1,-.5+Math.cos(i)*1.7,.3);
    k.tree(-4,2.7,.8);k.tree(-2.6,-3.1,1);k.tree(1.3,-3.7,.9);
    const court=k.groupAt(2.9,0,-1.6);k.mesh(new THREE.BoxGeometry(2.3,.2,2.1),k.mat('#bba67c'),0,.1,0,court);
    for(const x of[-1,1])k.mesh(new THREE.CylinderGeometry(.12,.16,2.4,12),k.mat('#cfbd95'),x,1.4,-.6,court);k.mesh(new THREE.BoxGeometry(2.8,.25,1.5),k.mat('#bba37a'),0,2.65,-.6,court);
    k.mesh(new THREE.BoxGeometry(.9,1.4,.2),k.mat('#a78254'),0,.9,-.5,court);k.mesh(new THREE.BoxGeometry(1,.15,.65),k.mat('#b89561'),0,.5,-.2,court);
    const ammon=k.person('Amon',-1,1.5,{robe:'#9ca787',mantle:'#d2c29b'}),lamoni=k.person('Lamôni',2.9,-1.6,{robe:'#b18b60',mantle:'#d2b073',y:.2});lamoni.leftLeg.rotation.x=-1.1;lamoni.rightLeg.rotation.x=-1.1;
    const footrest=k.box(.75,.09,.47,'#9b7950',2.9,.33,-1.24);footrest.name='Apoio dos pés de Lamôni';
    const servant=k.person('Servos do rei',-.3,-.4,{robe:'#bda57c'});
    const flock=[];for(let i=0;i<6;i++){const start=[-3.4+(i%3)*.9,1.8+Math.floor(i/3)*1.3];const a=k.animal('sheep',...start,.7);flock.push({a,start,end:[-3.5+(i%3)*.67,-1.7+Math.floor(i/3)*.8]});}
    const horseGear=k.groupAt(1.7,.15,.8);beam(k,[-.35,0,0],[.35,.3,.2],.04,'#876442',horseGear);const coil=k.mesh(new THREE.TorusGeometry(.28,.035,6,32),k.mat('#c4ad78'),0,.2,0,horseGear);coil.rotation.x=Math.PI/2;token(k,horseGear,'Preparação para servir','Contexto','Alma 18:9–10','Amon continua servindo depois de preservar o rebanho.');
    k.animate(t=>{
      const gather=ease(3,12,t);flock.forEach(({a,start,end},i)=>{a.position.x=mix(start[0],end[0],gather);a.position.z=mix(start[1],end[1],gather);a.rotation.y=Math.atan2(end[0]-start[0],end[1]-start[1]);const u=Math.max(0,Math.min(1,(t-3)/9)),travel=Math.hypot(end[0]-start[0],end[1]-start[1])*gather,phase=travel/.42*Math.PI*2;for(const [leg,paw]of a.userData.paws.entries()){const angle=Math.sin(phase+(leg===0||leg===3?0:Math.PI))*.2*4*u*(1-u);paw.rotation.x=angle;const c=Math.cos(angle),s=Math.sin(angle);paw.position.y=Math.hypot(.09*c,.17*s)-(.085*c-.045*s);}});
      const serve=ease(13,20,t),meet=ease(22,29,t);ammon.root.position.x=mix(-1,1.65,serve);ammon.root.position.z=mix(1.5,.95,serve);ammon.root.position.x=mix(ammon.root.position.x,2.45,meet);ammon.root.position.z=mix(ammon.root.position.z,-.25,meet);
      if(t<22)walking(ammon,[-1,1.5],[1.65,.95],13,20,t);else walking(ammon,[1.65,.95],[2.45,-.25],22,29,t);ammon.root.rotation.y=mix(Math.atan2(2.65,-.55),Math.atan2(.8,-1.2),meet);
      ammon.rightArm.rotation.z=.85*(1-serve);ammon.leftArm.rotation.z=-.4*(1-serve);if(t>16&&t<22){ammon.rightArm.rotation.x=-.8;ammon.rightForearm.rotation.x=-.4+Math.sin(t*2)*.18;}if(t>27)teaching(ammon,t,ease(27,31,t));
      servant.rightArm.rotation.z=1.1*ease(8,14,t);servant.head.rotation.y=-.5;lamoni.head.rotation.y=-.4*ease(20,28,t);lamoni.rightForearm.rotation.x=-.55*ease(24,29,t);
    });
  },

  M12(k) {
    k.finish({ground:'#a1a378',camera:[9,7.4,11],target:[0,.75,0]});k.background.set('#d9dfc5');
    const pit=k.cylinder(1.55,.05,'#564c38',0,.025,.1);pit.scale.z=.8;token(k,pit,'Lugar onde as armas são enterradas','Sinal do convênio','Alma 24:15–19','O povo enterra as armas como testemunho de que não voltará a derramar sangue.');
    const mound=k.cylinder(1.75,.4,'#b5a375',0,.18,.1);mound.scale.set(.01,.01,.01);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.rock(Math.cos(a)*1.8,.1+Math.sin(a)*1.5,.22);}k.tree(-4,-2,1);k.tree(3.5,-2.4,.8);tent(k,-3.5,2.8,'#b39c72',.75,.7);
    const king=k.person('Rei Ânti-Néfi-Leí',0,-2.3,{robe:'#bca875',mantle:'#7b8e75'});
    const folk=[];for(let i=0;i<4;i++){
      const x=i<2?-2.5:2.5,z=(i%2)*1.8-.5;const r=k.person('Povo ânti-néfi-leíta',x,z,{robe:colors[i],rotation:i<2?Math.PI/2:-Math.PI/2});
      const sword=tool(k,r.handR,'sword');sword.rotation.z=Math.PI/2;
      const deposited=tool(k,k.group,'sword');deposited.visible=false;deposited.userData.weaponDeposit=true;
      folk.push({r,sword,deposited,x,z,showSword:fade(sword),showDeposited:fade(deposited)});
    }
    const hand=new THREE.Vector3(),orientation=new THREE.Quaternion(),rest=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,Math.PI/2));
    k.animate(t=>{teaching(king,t,1-ease(20,26,t));folk.forEach(({r,sword,deposited,x,z,showSword,showDeposited},i)=>{
      const u=ease(7+i*2,11+i*2,t),drop=ease(12+i*2,15+i*2,t);r.rightArm.rotation.z=.9*u;r.rightForearm.rotation.x=-.65*u;r.head.rotation.x=.25*u;
      prayer(r,ease(24,29,t));k.group.updateMatrixWorld(true);sword.getWorldPosition(hand);sword.getWorldQuaternion(orientation);
      deposited.position.copy(hand).lerp(new THREE.Vector3(mix(x,0,.8),.075,z*.4),drop);deposited.quaternion.copy(orientation).slerp(rest,drop);
      showSword(1-ease(0,.22,drop));showDeposited(ease(0,.22,drop)*(1-ease(25,28,t)));
    });const cover=ease(24,30,t);mound.scale.set(cover,cover,cover);king.leftArm.rotation.z=-.6*cover;king.rightArm.rotation.z=.6*cover;k.light.color.setRGB(1,.92,.77+.1*cover);});
    k.cloud(0,5.5,-3.5,1.2);
  },

  M13(k) {
    k.finish({ground:'#a7a078',camera:[9,7,11],target:[0,1.3,0]});k.background.set('#d5d9c1');
    const dais=k.cylinder(1.3,.4,'#b09a70',0,.2,-.25);tent(k,-3.8,-2.5,'#b29566',.9,.3);tent(k,3.4,-2.4,'#b5a076',.9,-.3);
    const moroni=k.person('Capitão Morôni',-.4,-.1,{y:.4,robe:'#b4b99a',mantle:'#83917a'});
    const standard=k.flag(.35,.5,-.1,'#d8c99f');token(k,standard,'Estandarte da liberdade','Sinal do compromisso','Alma 46:12–20','Morôni registra uma lembrança de Deus, religião, liberdade, paz e famílias.');
    for(let row=0;row<4;row++)for(let col=0;col<7;col++)k.mesh(new THREE.BoxGeometry(.05+(col%2)*.02,.015,.005),k.mat('#84734d'),.14+col*.14,2.22-row*.11,.015,standard);
    const crowd=[];for(let i=0;i<7;i++){const x=(i%4-1.5)*1.13,z=1.7+Math.floor(i/4)*1.35;const r=k.person('Povo reunido',x,z,{robe:colors[i%6],beard:i%2===0,rotation:Math.PI});crowd.push(r);k.walk(r,[x*1.5,z+1],[x,z],6+i*.35,17+i*.35);}
    const cloth=k.box(.7,.035,.5,'#d8c99f',-.7,1.45,.2),showCloth=fade(cloth),showStandard=fade(standard);
    k.animate(t=>{const lift=ease(10,17,t);standard.position.y=mix(-1.2,.5,lift);standard.rotation.z=mix(-.65,0,lift);showStandard(ease(7,10,t));showCloth(1-ease(7,10,t));moroni.rightArm.rotation.z=1.5*lift;moroni.rightForearm.rotation.x=-.4*lift;moroni.leftArm.rotation.x=-.6*(1-lift);moroni.head.rotation.y=Math.sin(t*.4)*.12;
      crowd.forEach((r,i)=>{if(t>20){r.rightArm.rotation.z=1.15*ease(20+i*.2,25+i*.2,t);r.rightForearm.rotation.x=-.5;r.head.rotation.x=-.1;}});k.light.intensity=3+ease(16,26,t)*.4;});
    k.tree(4.5,.3,.8);k.tree(-4.4,.7,.7);k.cloud(0,5.6,-3,1.1);
  },

  M14(k) {
    k.finish({ground:'#9f9b73',camera:[10,7,11],target:[0,1,0]});k.background.set('#d3d7bf');
    const road=k.box(3,.025,10,'#bcae82',0,.01,0);road.rotation.y=.28;tent(k,-3.7,-2.3,'#ac956b',.8,.5);tent(k,3.2,-2.4,'#baaa7d',.9,-.5);
    for(let i=0;i<10;i++)k.rock((i%2?1:-1)*(3.5+(i%3)*.4),-3+(i%5)*1.5,.3);k.tree(4.5,.8,.7);k.tree(-4.3,.2,.8);
    const helaman=k.person('Helamã',1.5,-1.2,{robe:'#bdb68d',mantle:'#839278'});
    const youths=[];for(let i=0;i<6;i++){const from=[(i%3-1)*1.15,2.4+Math.floor(i/3)*1.05],to=[(i%3-1)*1.15,-.1+Math.floor(i/3)*1.05];const r=k.person('Jovens guerreiros',...from,{robe:colors[i],scale:.9,beard:false});k.walk(r,from,to,5+i*.25,17+i*.25);const shield=k.mesh(new THREE.CylinderGeometry(.24,.24,.06,16),k.mat('#9a8057'),0,-.1,.08,r.handL);shield.rotation.x=Math.PI/2;youths.push(r);}
    for(const index of[1,4]){const wrap=k.mesh(new THREE.CylinderGeometry(.106,.106,.085,14),k.mat('#e0d5b8',{roughness:.9}),0,-.11,0,youths[index].rightForearm);wrap.name='Faixa de cuidado';}
    k.animate(t=>{teaching(helaman,t,(1-ease(4,7,t))*.8);helaman.head.rotation.y=Math.sin(t*.5)*.2;
      youths.forEach((r,i)=>{if(t>18){const support=ease(19,24,t);r.head.rotation.y=(i%3===0?.35:-.3)*support;r.rightArm.rotation.z=.6*support;r.rightForearm.rotation.x=-.7*support;}if(t>26){prayer(r,ease(26,31,t));}});
      helaman.rightArm.rotation.z=.8*ease(23,28,t);helaman.leftArm.rotation.z=-.7*ease(23,28,t);k.light.color.setRGB(1,.9,.7+.12*ease(24,32,t));
    });
    token(k,road,'Marcha dos jovens','Grupo representativo','Alma 53; 56–58','Seis figuras representam os dois mil jovens iniciais. O relato reconhece ferimentos e a preservação de suas vidas.');
  },
};
