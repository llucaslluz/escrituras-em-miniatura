import * as THREE from 'three';

/** Fit only the known miniature plinth, never sky, rain or scene effects. */
export function fitMiniatureBaseFov(camera,{radius=6,top=0,bottom=-.55,margin=.94}={}){
 camera.updateMatrixWorld(true);
 const point=new THREE.Vector3();let tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5));
 // The tiny radial allowance also covers the arc between sampled points.
 const extent=radius*1.001;
 for(const y of [top,bottom])for(let i=0;i<128;i++){
  const angle=i/128*Math.PI*2;
  point.set(Math.cos(angle)*extent,y,Math.sin(angle)*extent).applyMatrix4(camera.matrixWorldInverse);
  const depth=-point.z;if(depth<=camera.near)continue;
  tangent=Math.max(tangent,Math.abs(point.y)/(depth*margin),Math.abs(point.x)/(depth*camera.aspect*margin));
 }
 return THREE.MathUtils.radToDeg(2*Math.atan(tangent));
}
