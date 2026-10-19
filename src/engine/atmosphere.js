import {updateStudio} from './clay-studio.js';

const presets = Object.freeze({
  morning: Object.freeze({background:'#dce2d2',key:'#fff0d3',intensity:3.25,position:[-5,9,6],sky:'#e8f2f3',ground:'#a08869',fill:2.05,exposure:1.1}),
  sunset: Object.freeze({background:'#70584d',key:'#ffc388',intensity:2.7,position:[-7,3,-4],sky:'#d9b4a1',ground:'#65525a',fill:1.6,exposure:1.05}),
  night: Object.freeze({background:'#202d3e',key:'#bbd1f4',intensity:1.6,position:[4,8,-5],sky:'#8faccd',ground:'#414b65',fill:1.15,exposure:1.08})
});

export const normalizeAtmosphere = value => Object.hasOwn(presets,value) ? value : 'original';

function capture(kit,scene,renderer,state={}) {
  const copy=(name,value)=>{if(state[name])state[name].copy(value);else state[name]=value.clone();};
  copy('keyColor',kit.light.color);copy('keyPosition',kit.light.position);copy('keyTarget',kit.light.target.position);
  copy('skyColor',kit.fill.color);copy('groundColor',kit.fill.groundColor);copy('fillPosition',kit.fill.position);
  copy('background',kit.background);
  state.keyIntensity=kit.light.intensity;state.fillIntensity=kit.fill.intensity;
  state.exposure=renderer.toneMappingExposure;
  if(scene.fog){copy('fogColor',scene.fog.color);state.fogNear=scene.fog.near;state.fogFar=scene.fog.far;}
  return state;
}

/** Keep authored animation lighting separate from the visitor's atmosphere. */
export class AtmosphereController {
  constructor(kit,scene,renderer,{atmosphere='original',immersive=false}={}) {
    this.kit=kit;this.scene=scene;this.renderer=renderer;this.immersive=immersive;
    this.choice=normalizeAtmosphere(atmosphere);
    this.baseline=capture(kit,scene,renderer);
    this.authored=capture(kit,scene,renderer);
    this.apply();
  }

  get effectiveAtmosphere(){
    if(this.choice!=='original')return this.choice;
    const {r,g,b}=this.authored.background;
    return .2126*r+.7152*g+.0722*b<.24?'night':'morning';
  }

  restore(state) {
    const {kit,scene,renderer}=this;
    kit.light.color.copy(state.keyColor);kit.light.position.copy(state.keyPosition);kit.light.target.position.copy(state.keyTarget);kit.light.intensity=state.keyIntensity;
    kit.fill.color.copy(state.skyColor);kit.fill.groundColor.copy(state.groundColor);kit.fill.position.copy(state.fillPosition);kit.fill.intensity=state.fillIntensity;
    kit.background.copy(state.background);renderer.toneMappingExposure=state.exposure;
    if(scene.fog&&state.fogColor){scene.fog.color.copy(state.fogColor);scene.fog.near=state.fogNear;scene.fog.far=state.fogFar;}
    scene.background=this.immersive?null:kit.background;
  }

  set(value){this.choice=normalizeAtmosphere(value);this.apply();return this.choice;}

  apply() {
    this.restore(this.authored);
    const p=presets[this.choice];updateStudio(this.kit,this.effectiveAtmosphere);if(!p)return;
    const {kit,scene,renderer}=this;
    kit.light.color.set(p.key);kit.light.position.fromArray(p.position);kit.light.intensity=p.intensity;
    kit.fill.color.set(p.sky);kit.fill.groundColor.set(p.ground);kit.fill.intensity=p.fill;
    kit.background.set(p.background);renderer.toneMappingExposure=p.exposure;
    if(scene.fog){scene.fog.color.set(p.background);scene.fog.near=24;scene.fog.far=48;}
  }

  update(time,duration) {
    // Every narrative evaluates from its own original light state. This also
    // restores properties that a given story never writes in its animation.
    this.restore(this.baseline);
    this.kit.update(time,duration);
    capture(this.kit,this.scene,this.renderer,this.authored);
    this.apply();
  }
}
