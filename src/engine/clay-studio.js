import * as THREE from 'three';
import {FullScreenQuad} from 'three/addons/postprocessing/Pass.js';

// One scene render and one screen pass. Low quality uses the direct renderer.
// The frame buffer contains only the diorama; DOM labels and the interface never
// pass through the miniature lens and remain sharp at every text size.
const profiles=Object.freeze({
 low:Object.freeze({enabled:false,maxEdge:0,samples:0,blur:0,occlusion:0}),
 medium:Object.freeze({enabled:true,maxEdge:1800,samples:2,blur:1.1,occlusion:.24}),
 high:Object.freeze({enabled:true,maxEdge:2560,samples:4,blur:1.55,occlusion:.3})
});
export const opticsProfile=quality=>profiles[quality]||profiles.medium;

const fragmentShader=/* glsl */`
 uniform sampler2D beauty;
 uniform sampler2D sceneDepth;
 uniform vec2 resolution;
 uniform float cameraNear;
 uniform float cameraFar;
 uniform float focusDistance;
 uniform float lensBlur;
 uniform float contactStrength;
 varying vec2 vUv;
 #include <packing>
 float distanceAt(vec2 uv){return -perspectiveDepthToViewZ(texture2D(sceneDepth,uv).x,cameraNear,cameraFar);}
 void main(){
  vec4 center=texture2D(beauty,vUv);
  // Keep transparent canvas edges transparent, including after color conversion.
  if(center.a<.0001){gl_FragColor=vec4(0.);return;}
  float viewDepth=distanceAt(vUv);
  float blur=lensBlur*smoothstep(2.0,6.0,abs(viewDepth-focusDistance));
  vec4 softened=center*4.;
  vec3 glow=vec3(0.);
  float contact=0.;
  float radius=clamp(resolution.y*.11/max(viewDepth,.1),1.5,9.);
  for(int i=0;i<8;i++){
   float angle=float(i)*.785398163;
   vec2 direction=vec2(cos(angle),sin(angle));
   vec2 blurUv=clamp(vUv+direction*blur/resolution,vec2(0.),vec2(1.));
   vec4 neighbor=texture2D(beauty,blurUv);
   softened+=neighbor;
   glow+=max(neighbor.rgb-vec3(1.6),vec3(0.));
   vec2 aoUv=clamp(vUv+direction*radius/resolution,vec2(0.),vec2(1.));
   float gap=viewDepth-distanceAt(aoUv);
   // Only close surfaces occlude. This avoids dark silhouettes and prevents
   // distant walls, the transparent sky or luminous beams becoming an outline.
   contact+=smoothstep(.018,.075,gap)*(1.-smoothstep(.13,.7,gap));
  }
  softened/=12.;
  vec3 color=softened.rgb/max(softened.a,.0001);
  color*=1.-contactStrength*contact*.125*step(viewDepth,cameraFar*.96);
  color+=glow*.006;
  gl_FragColor=vec4(color,center.a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  // WebGLRenderer's canvas uses premultiplied alpha. Render-target edges are
  // unpremultiplied above before tone mapping, then restored for the canvas.
  gl_FragColor.rgb*=gl_FragColor.a;
 }
`;

export class ClayOptics{
 constructor(renderer){
  this.renderer=renderer;this.width=1;this.height=1;this.quality=null;this.target=null;
  this.material=new THREE.ShaderMaterial({name:'Clay miniature optics',uniforms:{beauty:{value:null},sceneDepth:{value:null},resolution:{value:new THREE.Vector2(1,1)},cameraNear:{value:.1},cameraFar:{value:100},focusDistance:{value:15},lensBlur:{value:1.1},contactStrength:{value:.24}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader,depthTest:false,depthWrite:false,blending:THREE.NoBlending,toneMapped:true});
  this.quad=new FullScreenQuad(this.material);
 }
 setQuality(quality){
  const profile=opticsProfile(quality);if(this.profile===profile)return;
  this.profile=profile;this.quality=quality;
  this.target?.dispose();this.target=null;
  if(profile.enabled){
   // WebGL 2 depth textures are native. Without a float color buffer, retain
   // the direct, correctly tone-mapped renderer instead of clipping highlights.
   if(!this.renderer.extensions?.has('EXT_color_buffer_float'))return;
   this.target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthTexture:new THREE.DepthTexture(1,1,THREE.UnsignedIntType),samples:Math.min(profile.samples,this.renderer.capabilities.maxSamples||0)});
   this.target.texture.name='Clay studio beauty';this.target.depthTexture.name='Clay studio depth';
   this.material.uniforms.beauty.value=this.target.texture;this.material.uniforms.sceneDepth.value=this.target.depthTexture;
   this.material.uniforms.lensBlur.value=profile.blur;this.material.uniforms.contactStrength.value=profile.occlusion;
   this.resize(this.width,this.height);
  }
 }
 resize(width,height){
  this.width=width;this.height=height;if(!this.target)return;
  const ratio=Math.min(this.renderer.getPixelRatio(),this.profile.maxEdge/Math.max(width,height));
  const w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio));
  this.target.setSize(w,h);this.material.uniforms.resolution.value.set(w,h);
 }
 render(scene,camera,focusDistance){
  const {renderer,target}=this;if(!target){renderer.render(scene,camera);return;}
  const previous=renderer.getRenderTarget();
  try{
   renderer.setRenderTarget(target);renderer.render(scene,camera);
   const calls=renderer.info.render.calls,triangles=renderer.info.render.triangles;
   this.material.uniforms.cameraNear.value=camera.near;this.material.uniforms.cameraFar.value=camera.far;
   this.material.uniforms.focusDistance.value=focusDistance||camera.position.length();
   renderer.setRenderTarget(previous);this.quad.render(renderer);
   // Include both scene and optical pass in the public performance counters.
   renderer.info.render.calls+=calls;renderer.info.render.triangles+=triangles;
  }finally{renderer.setRenderTarget(previous);}
 }
 dispose(){this.target?.dispose();this.target=null;this.material.dispose();this.quad.dispose();}
}

export function prepareStudio(kit,quality='medium'){
 const shadow=kit.light.shadow;
 shadow.mapSize.set(quality==='high'?2048:1024,quality==='high'?2048:1024);
 shadow.radius=quality==='high'?12:8;shadow.bias=-.00035;shadow.normalBias=.018;
 if(!kit.studio){
  const rim=new THREE.DirectionalLight('#c9ddf5',.70);rim.name='Softbox fria';rim.position.set(5,7,-5);
  const bounce=new THREE.DirectionalLight('#ffe5c8',.30);bounce.name='Softbox frontal quente';bounce.position.set(2,3,7);
  kit.group.add(rim,bounce);kit.studio={rim,bounce};
 }
 return kit.studio;
}

export function updateStudio(kit,atmosphere){
 if(!kit.studio)return;
 const {rim,bounce}=kit.studio;
 if(atmosphere==='night'){rim.color.set('#9dbbe6');rim.intensity=.54;bounce.color.set('#ffdcaf');bounce.intensity=.38;}
 else if(atmosphere==='sunset'){rim.color.set('#c6ccef');rim.intensity=.50;bounce.color.set('#ffd0a3');bounce.intensity=.3;}
 else{rim.color.set('#d0e3f3');rim.intensity=.70;bounce.color.set('#ffe4c7');bounce.intensity=.30;}
}

export function disposeShadows(kit){kit?.group.traverse(object=>object.shadow?.dispose());}
