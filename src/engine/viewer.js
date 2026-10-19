import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Kit} from './kit.js';
import {AtmosphereController,normalizeAtmosphere} from './atmosphere.js';

const loaders={bible:()=>import('../scenes/bible.js'),mormon:()=>import('../scenes/mormon.js'),dc:()=>import('../scenes/dc.js'),pearl:()=>import('../scenes/pearl.js')};
export function effectivelyVisible(object){for(let o=object;o;o=o.parent)if(!o.visible)return false;return true;}
export class Viewer{
 constructor(host,preferences={},onUpdate=()=>{},onSelect=()=>{}){
  this.host=host;this.preferences=preferences;this.immersive=!!preferences.immersive;this.atmosphere=normalizeAtmosphere(preferences.atmosphere);this.onUpdate=onUpdate;this.onSelect=onSelect;this.time=0;this.speed=1;this.playing=!preferences.reduced;this.loop=preferences.loop!==false;host.dataset.looping=String(this.loop);this.names=false;this.disposed=false;this.frameCount=0;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#e5e8dd');
  this.camera=new THREE.PerspectiveCamera(38,1,.1,100);this.camera.position.set(9,7.5,11);
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:this.immersive,preserveDrawingBuffer:true,powerPreference:'high-performance'});}catch(error){this.error=error;host.innerHTML='<div class="fallback"><b>O diorama precisa de WebGL 2.</b><p>Ative a aceleração gráfica ou experimente outro navegador. A narrativa, os personagens e as fontes continuam disponíveis abaixo.</p></div>';return;}
  if(this.immersive){this.renderer.setClearColor('#000000',0);this.scene.background=null;}
  this.renderer.domElement.className='scene-canvas';this.renderer.domElement.setAttribute('aria-label','Diorama 3D interativo. Arraste para girar; use os controles para aproximar.');this.renderer.domElement.setAttribute('role','img');this.renderer.domElement.tabIndex=0;
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;this.renderer.shadowMap.type=THREE.PCFShadowMap;host.append(this.renderer.domElement);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.08;this.controls.minDistance=3;this.controls.maxDistance=25;this.controls.maxPolarAngle=Math.PI*.48;this.controls.target.set(0,1,0);this.controls.enablePan=false;
  this.labelLayer=document.createElement('div');this.labelLayer.className='labels-layer';host.append(this.labelLayer);
  this.pick=e=>{if(this.dragged>6||!this.kit)return;const r=this.renderer.domElement.getBoundingClientRect();const point=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(point,this.camera);const hits=ray.intersectObjects(this.kit.selectables.filter(x=>effectivelyVisible(x.object)).map(x=>x.object),true).filter(x=>effectivelyVisible(x.object));if(hits[0]){let obj=hits[0].object;while(obj&&!obj.userData.selectable)obj=obj.parent;const entry=this.kit.selectables.find(s=>s.object===obj);if(entry)this.onSelect(entry);}};
  this.down=e=>{this.startPoint=[e.clientX,e.clientY];this.dragged=0};this.move=e=>{if(this.startPoint)this.dragged=Math.hypot(e.clientX-this.startPoint[0],e.clientY-this.startPoint[1])};this.up=e=>{this.pick(e);this.startPoint=null};
  this.key=e=>{if(e.key==='+'||e.key==='='){this.zoom(.85);e.preventDefault()}if(e.key==='-'){this.zoom(1.15);e.preventDefault()}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){this.orbit(e.key==='ArrowLeft'?-.16:.16);e.preventDefault()}if(e.key==='ArrowUp'||e.key==='ArrowDown'){const d=this.camera.position.clone().sub(this.controls.target);const s=new THREE.Spherical().setFromVector3(d);s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.1:.1),.1,Math.PI*.48);this.camera.position.copy(this.controls.target).add(new THREE.Vector3().setFromSpherical(s));e.preventDefault()}};
  this.renderer.domElement.addEventListener('pointerdown',this.down);this.renderer.domElement.addEventListener('pointermove',this.move);this.renderer.domElement.addEventListener('pointerup',this.up);this.renderer.domElement.addEventListener('keydown',this.key);
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.applyPreferences(preferences);this.last=performance.now();this.tick=this.tick.bind(this);this.raf=requestAnimationFrame(this.tick);
 }
 applyPreferences(p){this.preferences=p;this.setLoop(p.loop!==false,false);if(p.reduced)this.playing=false;if(!this.renderer)return;const q=p.quality||'medium';this.renderer.setPixelRatio(Math.min(devicePixelRatio,{low:1,medium:1.5,high:2}[q]));this.renderer.shadowMap.enabled=q!=='low';this.setAtmosphere(p.atmosphere);this.resize();}
 async load(story){
  const token=Symbol();this.loadToken=token;this.story=story;this.time=0;this.host.dataset.loading='true';
  if(!this.renderer){this.playing=false;this.host.dataset.loading='false';this.onUpdate(this);return;}
  const {builders}=await loaders[story.book]();if(this.disposed||token!==this.loadToken)return;
  if(this.kit){this.scene.remove(this.kit.group);this.kit.dispose();this.kit=null;this.renderer?.renderLists.dispose();}
  const kit=new Kit(story.id);builders[story.id](kit);this.kit=kit;
  const peopleMap=new Map(story.characters.map(c=>[c.name,c]));for(const s of kit.selectables){const c=peopleMap.get(s.name);if(c){s.role=c.role;s.summary=c.description;s.reference=story.reference;}}
  if(kit.config.night){kit.background.set('#1b2b39');kit.light.color.set('#b5cef0');kit.light.intensity=1.4;kit.fill.intensity=.8;}
  kit.top.material=kit.mat(kit.config.ground);this.scene.background=this.immersive?null:kit.background;this.scene.fog=new THREE.Fog(kit.background,26,50);this.scene.add(kit.group);
  this.renderer.toneMappingExposure=1.12;this.atmosphereController=new AtmosphereController(kit,this.scene,this.renderer,{atmosphere:this.atmosphere,immersive:this.immersive});
  this.views=kit.config.views||[{label:'Vista geral',camera:kit.config.camera,target:kit.config.target},{label:'Personagens',camera:[4,3,5],target:[0,1,0]},{label:'Detalhes',camera:[0,2.6,4],target:[0,1,0]}];this.setView(0);this.playing=!this.preferences.reduced;this.updateScene();this.makeLabels();this.host.dataset.loading='false';this.host.dataset.scene=story.id;this.onUpdate(this);return kit;
 }
 makeLabels(){this.labelLayer.replaceChildren();this.labelNodes=(this.kit?.labels||[]).map(l=>{const node=document.createElement('span');node.className='model-label';node.textContent=l.text;this.labelLayer.append(node);return{...l,node}});this.labelLayer.hidden=!this.names;}
 setView(index){const v=this.views?.[index];if(!v)return;this.viewIndex=index;this.camera.position.fromArray(v.camera);this.controls?.target.fromArray(v.target||[0,1,0]);this.controls?.update();this.resize();this.onUpdate(this);}
 resize(){
  if(!this.renderer)return;
  const {width,height}=this.host.getBoundingClientRect();if(width<1||height<1)return;
  this.camera.aspect=width/height;this.camera.fov=this.camera.aspect<1.1?52:38;
  if(this.immersive){
   const v=this.views?.[this.viewIndex||0];
   if((this.viewIndex||0)===0&&v){
    const distance=new THREE.Vector3().fromArray(v.camera).distanceTo(new THREE.Vector3().fromArray(v.target||[0,1,0]));
    const available=width>=1100?Math.min(width-600,1120):width>760?width-340:height<540?width*.65:width*.94;
    this.camera.fov=THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(2*Math.atan(height*6/(available*distance))),34,105);
   }else{
    this.camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(19))*Math.max(1,1.3/this.camera.aspect)));
   }
   const horizontalShift=width>=1100?18:width>760?145:height<540?width*.12:0;
   this.camera.setViewOffset(width,height,-horizontalShift,height*(width>=1100?.025:-.035),width,height);
  }else this.camera.clearViewOffset();
  this.camera.updateProjectionMatrix();this.renderer.setSize(width,height,false);
 }
 orbit(angle){const offset=this.camera.position.clone().sub(this.controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);this.camera.position.copy(this.controls.target).add(offset);this.controls.update();}
 zoom(factor){const v=this.camera.position.clone().sub(this.controls.target);v.multiplyScalar(factor);v.clampLength(3,25);this.camera.position.copy(this.controls.target).add(v);this.controls.update();}
 get zoomPercent(){if(!this.controls)return 0;return THREE.MathUtils.clamp((this.controls.maxDistance-this.camera.position.distanceTo(this.controls.target))/(this.controls.maxDistance-this.controls.minDistance)*100,0,100);}
 setZoomPercent(value){if(!this.controls||!Number.isFinite(Number(value)))return;const p=THREE.MathUtils.clamp(Number(value),0,100);const distance=THREE.MathUtils.lerp(this.controls.maxDistance,this.controls.minDistance,p/100);const offset=this.camera.position.clone().sub(this.controls.target).normalize().multiplyScalar(distance);this.camera.position.copy(this.controls.target).add(offset);this.controls.update();this.onUpdate(this);}
 get effectiveAtmosphere(){return this.atmosphereController?.effectiveAtmosphere||(this.atmosphere==='original'?'morning':this.atmosphere);}
 setAtmosphere(value){this.atmosphere=normalizeAtmosphere(value);this.atmosphereController?.set(this.atmosphere);this.host.dataset.atmosphere=this.atmosphere;this.host.dataset.light=this.effectiveAtmosphere;}
 updateScene(){if(!this.kit)return;this.atmosphereController.update(this.time,this.story.duration);this.host.dataset.light=this.effectiveAtmosphere;}
 setLoop(enabled,notify=true){const wasLoop=this.loop!==false;this.loop=!!enabled;this.host.dataset.looping=String(this.loop);if(this.loop&&!wasLoop&&this.story&&this.time>=this.story.duration){this.time=0;this.updateScene();}if(notify)this.onUpdate(this);}
 toggle(){this.playing=!this.playing;this.onUpdate(this)}
 replay(){this.time=0;this.playing=true;this.updateScene();this.onUpdate(this)}
 seek(t){this.time=Math.max(0,Math.min(t,this.story.duration));this.updateScene();this.onUpdate(this)}
 tick(now){if(this.disposed)return;const dt=Math.min((now-this.last)/1000,.075);this.last=now;if(this.playing&&this.kit){this.time+=dt*this.speed;const duration=this.story.duration;if(this.loop!==false&&duration>0&&this.time>=duration)this.time%=duration;}if(this.kit){this.updateScene();this.controls.update();for(const {object,node}of this.labelNodes||[]){if(!this.names)break;const pos=new THREE.Vector3();object.getWorldPosition(pos);pos.y+=1.9;pos.project(this.camera);node.style.transform=`translate(-50%,-50%) translate(${(pos.x*.5+.5)*this.host.clientWidth}px,${(-pos.y*.5+.5)*this.host.clientHeight}px)`;node.hidden=pos.z>1||!effectivelyVisible(object);}this.renderer?.render(this.scene,this.camera);this.frameCount++;this.host.dataset.animationTime=this.time.toFixed(3);this.host.dataset.playing=String(this.playing);this.host.dataset.looping=String(this.loop!==false);if(now-(this.metricStart||now)>2000){this.host.dataset.measuredFps=((this.frameCount-this.metricFrame)*1000/(now-this.metricStart)).toFixed(1);this.host.dataset.drawCalls=String(this.renderer.info.render.calls);this.host.dataset.triangles=String(this.renderer.info.render.triangles);this.host.dataset.geometries=String(this.renderer.info.memory.geometries);this.metricStart=now;this.metricFrame=this.frameCount;}if(!this.metricStart){this.metricStart=now;this.metricFrame=this.frameCount;}if(now-(this.lastNotify||0)>100){this.lastNotify=now;this.onUpdate(this);}}this.raf=requestAnimationFrame(this.tick)}
 destroy(){this.disposed=true;cancelAnimationFrame(this.raf);this.observer?.disconnect();this.controls?.dispose();this.kit?.dispose();this.scene.clear();if(this.renderer){const c=this.renderer.domElement;c.removeEventListener('pointerdown',this.down);c.removeEventListener('pointermove',this.move);c.removeEventListener('pointerup',this.up);c.removeEventListener('keydown',this.key);this.renderer.dispose();this.renderer.forceContextLoss();}this.host.replaceChildren();}
}

