const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const p=clamp(v);return p*p*(3-2*p);};

export function gaitEnvelope(progress){return smooth(progress/.15)*(1-smooth((progress-.85)/.15));}

/** Absolute gait. distance is world-space travelled distance along the path;
 * ground is a LOCAL vertical offset relative to the root's support plane.
 * Does not move/rotate the root or touch the head, hands or forearms.
 */
export function applyGroundedGait(rig,distance,{envelope=1,ground=0,swingHeight=.065,arms=true}={}){
 const weight=clamp(envelope),scale=Math.max(.001,Math.abs(rig.root.scale.z));
 const phase=distance/(.52*scale);
 for(const[leg,offset]of[[rig.leftLeg,.25],[rig.rightLeg,.75]]){
  const cycle=((phase+offset)%1+1)%1,stance=cycle<.5;
  const swing=(cycle-.5)*2;
  const z=stance?.13-.52*cycle:-.13+.26*smooth(swing);
  const lift=stance?0:swingHeight*Math.sin(Math.PI*swing)**2*weight;
  const angle=weight>0?(-.32*z/.13*weight||0):0,c=Math.cos(angle),s=Math.sin(angle);
  leg.rotation.x=angle;
  // Cancel the centre's arc around the hip. At full weight, stance centre
  // retreats by exactly the distance advanced by the root (no foot skating).
  leg.position.z=.061+z*weight+.365*s-.061*c;
  leg.position.y=ground+.365*c+.061*s+Math.hypot(.0516*c,.15*s)+lift;
 }
 if(arms){rig.leftArm.rotation.x=-rig.leftLeg.rotation.x*.5;rig.rightArm.rotation.x=-rig.rightLeg.rotation.x*.5;}
}
