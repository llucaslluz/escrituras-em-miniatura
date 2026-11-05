import { THREE, ease, mix, tent, bag, masonry, beam, prayer, teaching, thought, dust, palmBank, grass, ring, token, tool, fade, walking, kneel } from './utils.js';

export const builders = {
  M01(k) {
    k.finish({ground:'#c5ad7d',camera:[9,6.4,11],target:[0,1,0]}); k.background.set('#e7d8b8');
    masonry(k,-3.4,-2.6,2.9,2,.6); const gate=k.box(.9,1.5,.08,'#71533a',-3.25,.75,-2.22);token(k,gate,'Jerusalém','Ponto de partida','1 Néfi 1–2','Leí deixa sua casa e seus bens ao partir com a família.');
    tent(k,3,-1.1,'#b7976a',1.2,-.25);k.water(.75,4,4.8,1,{river:true,color:'#83a7a0'});palmBank(k,[[4.2,-2.6,.8],[-4.7,.4,.6]]);
    for(let i=0;i<9;i++)k.rock(-1.5+Math.sin(i*1.8)*3,-3+Math.cos(i)*.7,.3+(i%2)*.3);
    const names=['Leí','Saria','Néfi','Sam','Lamã','Lemuel'];
    const colors=['#b89560','#c9b38e','#82927b','#b99e73','#a88369','#8a8870'];
    names.forEach((name,i)=>{
      const from=[-3.5+(i%2)*.72,-.1+Math.floor(i/2)*.75],to=[1.2+(i%3)*.78,1.1+Math.floor(i/3)*.85];
      const r=k.person(name,...from,{robe:colors[i],hair:i<2?'#77705b':'#4c3c2e',mantle:i===1?'#e6d7ad':undefined,beard:i!==1});
      k.walk(r,from,to,2+i*.6,18+i*.65);bag(k,.1,-.25,-.17,'#9c845c',r.handL);
      k.animate(t=>{if(t>22){thought(r,t,i);if(i===0)prayer(r,ease(23,27,t));else r.head.rotation.y=mix(0,-.6,ease(23,27,t));}});
    });
    const fire=k.fire(2.5,.05,.3,.4),showFire=fade(fire);k.animate(t=>{showFire(ease(20,23,t));k.light.color.setRGB(1,.9-.14*ease(20,32,t),.74-.1*ease(20,32,t));});
    bag(k,3.6,0,-.35);bag(k,3.25,0,-.5);dust(k,0,.5);k.cloud(0,5,-4,1.1);
  },

  M02(k) {
    k.finish({ground:'#8a936d',camera:[10,7.8,11],target:[0,1,0]});k.background.set('#babda7');
    const tree=k.tree(2,-1.1,1.65);token(k,tree,'Árvore da vida','Elemento do sonho','1 Néfi 8:10–12','Leí encontra uma árvore de fruto desejável e sente grande alegria.');
    const fruit=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const f=k.sphere(.105,'#fff6d6',2+Math.cos(a)*1.06,2.5+(i%3)*.24,-1.1+Math.sin(a)*1.05);f.material=k.mat('#fff3cf',{emissive:'#edc77e',emissiveIntensity:.7});fruit.push(f);}
    token(k,fruit[0],'Fruto branco','Elemento do sonho','1 Néfi 8:11–16','Leí prova o fruto e convida sua família a compartilhar a alegria.');
    const path=k.box(1,.025,6.6,'#cabb8c',-.6,.025,.8);path.rotation.y=-.55;token(k,path,'Caminho estreito','Elemento do sonho','1 Néfi 8:20','O caminho acompanha a barra de ferro até a árvore.');
    const rail=beam(k,[-2.5,.88,3.5],[1.2,.88,-1.9],.055,'#a4a79d');token(k,rail,'Barra de ferro','Elemento do sonho','1 Néfi 8:19–24','Alguns atravessam a névoa apegados à barra de ferro.');
    for(let i=0;i<8;i++){const u=i/7;beam(k,[mix(-2.5,1.2,u),0,mix(3.5,-1.9,u)],[mix(-2.5,1.2,u),.88,mix(3.5,-1.9,u)],.025,'#91978e');}
    const river=k.water(.9,9,-2.4,-.2,{river:true,color:'#5c8f8d'});token(k,river,'Rio','Elemento do sonho','1 Néfi 8:13,19','O rio aparece perto da árvore e da barra de ferro.');
    const building=k.groupAt(-4.2,1.9,-2.6);for(let i=0;i<3;i++){k.mesh(new THREE.BoxGeometry(1.65,.5,1.3),k.mat('#9d927b'),0,i*.6,0,building);k.mesh(new THREE.BoxGeometry(1.78,.075,1.4),k.mat('#c4b896'),0,i*.6+.28,0,building);}token(k,building,'Grande edifício','Elemento do sonho','1 Néfi 8:26–28','O edifício aparece elevado e cheio de pessoas que zombam.');
    const fog=[];for(let i=0;i<6;i++){const g=k.cloud(-2+i*.65,.65,1+i%2,.9);g.traverse(o=>{if(o.isMesh)o.material=k.mat('#9fa79c',{transparent:true,opacity:.45,depthWrite:false});});fog.push(g);}token(k,fog[0],'Névoa de escuridão','Elemento do sonho','1 Néfi 8:23–24','A névoa dificulta enxergar o caminho.');
    const lehi=k.person('Leí',-.4,.9,{robe:'#d1c09a',hair:'#817b6c'});k.walk(lehi,[-.4,.9],[1,-.3],2,7);
    const held=k.sphere(.11,'#fff8d9');lehi.handR.add(held);held.position.set(0,-.05,.05);
    const fam=['Saria','Néfi','Sam'].map((n,i)=>{const from=[-2.25+i*.32,3.2-i*.35],to=[.55+i*.48,-.6+i*.45];const r=k.person(n,...from,{robe:['#bd9e82','#7b9384','#b2a479'][i],beard:i>0});k.walk(r,from,to,12+i*1.2,23+i*1.2);return r;});
    const rebels=['Lamã','Lemuel'].map((n,i)=>k.person(n,-1.35+i*.6,3.25+i*.15,{robe:['#a47b5c','#8a8870'][i],beard:true,rotation:Math.PI}));
    const mockers=[0,1].map(i=>k.person('Pessoas no grande edifício',-3.95-i*.45,-2.15+i*.25,{y:2.48,robe:['#b59876','#8f8279'][i],scale:.72,beard:i===0,rotation:.65}));
    k.animate(t=>{const prayStart=ease(0,2,t)*(1-ease(2,3.5,t)),eat=ease(7,10,t)*(1-ease(11,13,t)),beckon=ease(11,15,t);prayer(lehi,prayStart);lehi.rightArm.rotation.x=-1.1*eat-.55*beckon;lehi.rightForearm.rotation.x=-1.3*eat-.4*beckon;lehi.rightArm.rotation.z=.75*beckon;lehi.head.rotation.y=-.3*beckon;fam.forEach((r,i)=>{const hold=ease(12+i*1.2,14+i*1.2,t)*(1-ease(22+i*1.2,24+i*1.2,t)),arrive=ease(24+i*1.2,27+i*1.2,t);r.leftArm.rotation.x=-.78*hold;r.leftArm.rotation.z=-.28*hold;r.leftForearm.rotation.x=-.45*hold;if(arrive>0){prayer(r,arrive);r.head.rotation.y=-.25*arrive;}});rebels.forEach((r,i)=>{const refuse=ease(13+i,18+i,t);r.head.rotation.y=Math.sin(t*2.4+i)*.28*refuse*(1-ease(21,24,t));r.leftArm.rotation.x=-.5*refuse;r.rightArm.rotation.x=-.5*refuse;r.root.rotation.y=Math.PI-1.35*ease(16+i,21+i,t);});mockers.forEach((r,i)=>{const mock=ease(14,19,t);r.rightArm.rotation.x=-1.15*mock;r.rightArm.rotation.z=(.25+Math.sin(t*1.8+i)*.08)*mock;});fog.forEach((g,i)=>g.scale.setScalar(mix(.9,.65,ease(14,26,t))));k.light.intensity=2+ease(4,16,t)*1.4;});
  },

  M03(k) {
    k.finish({night:true,ground:'#b9a17b',camera:[9,6.8,10],target:[0,1,0]});k.stars();
    masonry(k,0,-3,7.5,2.4,.65);k.box(1.2,1.7,.15,'#6c5039',1,.85,-2.6);k.lamp(1,1.8,-2.5);
    for(let i=0;i<8;i++){const p=k.box(.55,.06,.6,'#c1b28d',-3.3+i*.75,.025,.3+Math.sin(i)*.12);p.rotation.y=.1;}
    const cache=k.groupAt(.6,.6,-1.7);k.mesh(new THREE.BoxGeometry(1.05,.65,.8),k.mat('#8d6c43'),0,-.28,0,cache);const lid=k.mesh(new THREE.BoxGeometry(1.12,.1,.86),k.mat('#b08a58'),0,.09,0,cache);lid.rotation.z=-.18;
    const plates=k.plates(.6,.82,-1.65);token(k,plates,'Placas de latão','Registros','1 Néfi 3–4','Os registros são levados para a família de Leí no deserto.');
    const nephi=k.person('Néfi',-3,1.5,{robe:'#8b9b80',mantle:'#c0ad80'}),zoram=k.person('Zorã',.95,-.9,{robe:'#baa177',beard:false});
    const sam=k.person('Sam',-3.3,2.4,{robe:'#a89b78'}),laman=k.person('Lamã',-4,2,{robe:'#a47b5c'});
    k.walk(nephi,[-3,1.5],[.25,-.45],0,8);k.walk(zoram,[.95,-.9],[1.2,.2],4,11);
    k.walk(sam,[-3.3,2.4],[-2,2.1],19,29);k.walk(laman,[-4,2],[-2.7,2.5],19,29);
    const origin=new THREE.Vector3(.6,.82,-1.65),hand=new THREE.Vector3();
    k.animate(t=>{
      const receive=ease(8,13,t);nephi.rightArm.rotation.x=-1.15*receive;nephi.rightForearm.rotation.x=-.6*receive;nephi.leftArm.rotation.x=-.8*receive;
      zoram.rightArm.rotation.z=.85*ease(10,15,t)*(1-ease(20,23,t));zoram.head.rotation.y=-.55;
      const leave=ease(21,31,t);if(t>=8)nephi.root.position.set(mix(.25,-1.1,leave),0,mix(-.45,2.2,leave));if(t>=11)zoram.root.position.set(mix(1.2,-.2,leave),0,mix(.2,2.5,leave));
      if(t>=21){walking(nephi,[.25,-.45],[-1.1,2.2],21,31,t);walking(zoram,[1.2,.2],[-.2,2.5],21,31,t);nephi.root.rotation.y=Math.atan2(-1.35,2.65);zoram.root.rotation.y=Math.atan2(-1.4,2.3);}
      k.group.updateMatrixWorld(true);nephi.handR.getWorldPosition(hand);plates.position.copy(origin).lerp(hand,receive);plates.position.y+=.12*receive;
      thought(sam,t);thought(laman,t,2);
    });
    dust(k,-1,1);k.light.color.set('#b7c1c7');k.cloud(-2,5,-4,.7);
  },

  M04(k) {
    k.finish({ground:'#c5ad80',camera:[8,6.5,10],target:[0,.9,0]});k.background.set('#e5d6b7');
    tent(k,-2.5,-2,'#bd9d6d',1.2);tent(k,3,-2.8,'#b9926a',.7,.4);k.fire(-3,.02,.3,.35);
    for(let i=0;i<6;i++)k.rock(Math.cos(i*1.6)*4.7,Math.sin(i*1.6)*3.9,.4+(i%3)*.18);palmBank(k,[[4,-1,.7]]);bag(k,-3,0,-1);bag(k,-2.8,0,-.8);
    const device=k.groupAt(-1.35,.32,-.4);
    const orb=k.mesh(new THREE.SphereGeometry(.28,24,18),k.mat('#c3a45e',{metalness:.6,roughness:.4,transparent:true,opacity:.68}),0,0,0,device);
    const rim=k.mesh(new THREE.TorusGeometry(.285,.025,6,32),k.mat('#eed39a',{metalness:.55}),0,0,0,device);rim.rotation.x=Math.PI/2;
    const p1=beam(k,[-.2,0,0],[.2,0,0],.016,'#695e42',device),p2=beam(k,[0,0,-.21],[0,0,.21],.018,'#ddc67b',device);
    token(k,device,'Liahona','Instrumento de orientação','1 Néfi 16:10,16,26–29','Esfera de latão com dois ponteiros; a orientação se relaciona à fé e diligência.');
    const lehi=k.person('Leí',-1.6,.5,{robe:'#cbb48c',hair:'#827d6c'}),nephi=k.person('Néfi',.3,.7,{robe:'#82957a'}),saria=k.person('Saria',1.1,1.4,{robe:'#c5b099',mantle:'#e1cba4',beard:false});
    const motion=new THREE.Vector3();
    k.animate(t=>{
      const lift=ease(3,8,t),go=ease(22,32,t);lehi.rightArm.rotation.x=-.85*lift;lehi.rightForearm.rotation.x=-.75*lift;lehi.head.rotation.x=.3*(1-go);
      lehi.root.position.x=-1.6+go*2.5;lehi.root.position.z=.5+go*1.5;nephi.root.position.x=.3+go*2.5;nephi.root.position.z=.7+go*1.5;saria.root.position.x=1.1+go*2;saria.root.position.z=1.4+go*1;
      k.group.updateMatrixWorld(true);lehi.handR.getWorldPosition(motion);device.position.set(mix(-1.35,motion.x,lift),mix(.32,motion.y+.18,lift),mix(-.4,motion.z+.06,lift));
      p1.rotation.y=ease(7,15,t)*.7;p2.rotation.y=-ease(7,15,t)*.45;
      nephi.rightArm.rotation.z=.9*ease(10,15,t)*(1-go);nephi.head.rotation.y=-.4;thought(saria,t,1);
      [[lehi,[-1.6,.5],[.9,2]],[nephi,[.3,.7],[2.8,2.2]],[saria,[1.1,1.4],[3.1,2.4]]].forEach(([r,from,to])=>{walking(r,from,to,22,32,t);r.root.rotation.y=Math.atan2(to[0]-from[0],to[1]-from[1])*ease(21,23,t);});
    });dust(k,1,2);k.cloud(1,5,-4,.9);
  },

  M05(k) {
    k.finish({ground:'#baa47a',camera:[10,7.2,12],target:[0,1.2,0]});k.background.set('#bfd3ce');
    const water=k.water(10,7,0,1.2,{color:'#659ea0',y:.045});k.box(8,.12,2.2,'#c8b487',0,.03,-3.45);palmBank(k,[[-4.5,-2.8,.9],[4.2,-2.8,1]]);k.rock(-3.8,-2.8,.7);
    const gangplank=k.box(1.05,.1,2.4,'#ab8252',-.65,.25,-1.35);gangplank.rotation.x=.2;
    const ship=k.boat(0,.8,1.7);token(k,ship,'Navio de Néfi','Embarcação','1 Néfi 17–18','Construído segundo a orientação recebida do Senhor. O formato do modelo é artístico.');
    const mast=beam(k,[0,0,0],[0,2.5,0],.055,'#7b5735',ship),yard=beam(k,[-.8,2.2,0],[.8,2.2,0],.035,'#7b5735',ship);
    const sailGeo=new THREE.PlaneGeometry(1.55,1.55,14,14),sail=k.mesh(sailGeo,k.mat('#e2d7b2',{side:THREE.DoubleSide}),0,1.45,.03,ship);const original=new Float32Array(sailGeo.attributes.position.array);
    for(const side of[-1,1])beam(k,[0,2.4,0],[side*.8,0,.5],.015,'#d7bd83',ship);
    const pile=[];for(let i=0;i<5;i++)pile.push(k.box(1.7,.1,.18,'#ad8558',-2.3,.12+i*.11,-2.1));
    const nephi=k.person('Néfi',-1.9,-2.5,{robe:'#8a9c7e',mantle:'#c5b17f'}),sam=k.person('Sam',1.6,-2.6,{robe:'#b99d72'}),lehi=k.person('Leí',2.6,-2.7,{robe:'#d1bd93',hair:'#8b8571'});
    const crew=k.groupAt(0,0,.8);[nephi,sam,lehi].forEach(r=>crew.add(r.root));
    const hammer=tool(k,nephi.handR),showHammer=fade(hammer),showGangplank=fade(gangplank),showSail=fade(sail),showMast=fade(mast),showYard=fade(yard),showPile=pile.map(fade);const cloud=k.cloud(-1,5,-2,1.3),cloud2=k.cloud(3,4,-3,1);
    k.animate(t=>{
      const build=1-ease(7,10,t),board=ease(9,15,t),storm=ease(16,20,t)*(1-ease(24,29,t));
      nephi.rightArm.rotation.x=build*(-.9+Math.sin(t*4)*.45)-board*.4;nephi.rightForearm.rotation.x=-.4;showHammer(1-ease(7,9,t));
      nephi.root.position.set(mix(-1.9,-.6,board),mix(.09,.15,board),mix(-3.3,-.3,board));sam.root.position.set(mix(1.6,.6,board),mix(.09,.15,board),mix(-3.4,-.4,board));lehi.root.position.set(mix(2.6,0,board),mix(.09,.15,board),mix(-3.5,.65,board));
      [[nephi,[-1.9,-3.3],[-.6,-.3]],[sam,[1.6,-3.4],[.6,-.4]],[lehi,[2.6,-3.5],[0,.65]]].forEach(([r,from,to])=>{walking(r,from,to,9,15,t,.23);r.head.rotation.x=.14*storm;});
      if(t>21)prayer(nephi,ease(21,25,t));sam.leftArm.rotation.z=-.75*storm;sam.rightArm.rotation.z=.75*storm;
      ship.rotation.z=Math.sin(t*2.6)*(.025+.12*storm);ship.rotation.x=Math.sin(t*1.8)*(.02+.06*storm);
      const departure=ease(15,31,t);ship.position.z=.8+departure*.7;crew.position.z=ship.position.z;crew.rotation.copy(ship.rotation);showGangplank(1-ease(14,16,t));
      showSail(ease(6,8,t));showMast(ease(4,6,t));showYard(ease(4,6,t));for(let i=0;i<sailGeo.attributes.position.count;i++){const u=(original[i*3]+.775)/1.55,v=(original[i*3+1]+.775)/1.55,belly=Math.sin(u*Math.PI)*Math.sin(v*Math.PI);sailGeo.attributes.position.setZ(i,(.15+.04*Math.sin(t*1.6+u*2))*(1+storm*.45)*belly);}sailGeo.attributes.position.needsUpdate=true;sailGeo.computeVertexNormals();
      showPile.forEach((show,i)=>show(1-ease(3+i,4+i,t)));cloud.scale.setScalar(1.3+storm*.4);cloud2.scale.setScalar(1+storm*.4);k.light.intensity=3.3-storm*2;k.background.setRGB(.74-storm*.35,.82-storm*.32,.8-storm*.25);
    });
    const prayerRipple=ring(k,-.7,.09,.5,.5),showRipple=fade(prayerRipple);k.animate(t=>{prayerRipple.scale.setScalar(1+ease(24,30,t)*2);showRipple(ease(23,25,t));});
  },

  M06(k) {
    k.finish({ground:'#6d7d57',camera:[8,6.5,10],target:[0,1,0]});k.background.set('#c5d1b5');
    [[-4,-2,1.2],[-2.4,-3.3,1.4],[.1,-3.9,1.1],[2.9,-3.1,1.3],[4.2,-.7,1.15],[-4,1.5,.9],[3.4,3,.8]].forEach(([x,z,s])=>k.tree(x,z,s));
    for(let i=0;i<18;i++)grass(k,Math.sin(i*2.4)*4.8,Math.cos(i*1.7)*4.5,.8);k.rock(.9,0,1.3);k.rock(1.6,-.5,.7);dust(k,0,.5,'#d9dfb0');
    const enos=k.person('Enos',-.45,.2,{robe:'#b7a17a',mantle:'#788367'}),arc=new THREE.EllipseCurve(0,0,.28,.7,-Math.PI/2,Math.PI/2,false,0);
    const pts=arc.getPoints(25).map(p=>new THREE.Vector3(p.x,p.y,0));const bow=k.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.025,6),k.mat('#7a5637'),-1.4,.75,.3);beam(k,[-1.4,.05,.3],[-1.4,1.45,.3],.007,'#d1b88c');
    token(k,bow,'Arco em repouso','Contexto da caçada','Enos 1:3','Enos sai para caçar e recorda o ensino de seu pai.');
    const sunRay=k.ray(0,0,0,6),showSun=fade(sunRay),stars=k.stars();k.animate(t=>{
      const kneeling=ease(3,8,t);kneel(enos,kneeling);prayer(enos,kneeling);enos.head.rotation.x=.2+.04*Math.sin(t*.5);
      const night=ease(12,24,t);k.light.intensity=mix(3.4,.8,night);k.light.color.setRGB(mix(1,.6,night),mix(.93,.7,night),mix(.74,1,night));k.background.setRGB(mix(.77,.09,night),mix(.82,.14,night),mix(.71,.22,night));stars.material.opacity=night*.9;showSun(1-ease(17,21,t));
      enos.leftArm.rotation.z=-.65-.16*ease(24,30,t);enos.rightArm.rotation.z=.65+.16*ease(24,30,t);
    });
  },
};
