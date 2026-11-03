// Headless structural audit: estimates are not GPU measurements or visual approval.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {Kit} from '../src/engine/kit.js';
import {stories} from '../src/data/catalog.js';
import {editorial} from '../src/data/editorial.js';
import {builders as bible} from '../src/scenes/bible.js';
import {builders as mormon} from '../src/scenes/mormon.js';
import {builders as dc} from '../src/scenes/dc.js';
import {builders as pearl} from '../src/scenes/pearl.js';
const builders={...bible,...mormon,...dc,...pearl},times=[0,4,8,12,16,20,24,28,31.9,32];
function capture(kit){
 const hash=createHash('sha256');let finite=true,meshes=0,triangles=0,draws=0;const nodes=new Set();
 const numbers=values=>{for(const n of values)if(typeof n==='number'&&!Number.isFinite(n))finite=false;hash.update(JSON.stringify(Array.from(values)));};
 kit.group.updateMatrixWorld(true);
 kit.group.traverse(o=>{
  nodes.add(o);numbers([...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray(),...o.matrixWorld.elements]);hash.update(String(o.visible));
  if(o.isLight)numbers([o.intensity,...o.color.toArray()]);
  if(o.geometry){for(const a of Object.values(o.geometry.attributes))numbers(a.array);if(o.geometry.index)numbers(o.geometry.index.array);}
  if(o.instanceMatrix)numbers(o.instanceMatrix.array);if(o.instanceColor)numbers(o.instanceColor.array);
  for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){
   for(const key of Object.keys(m).sort()){if(key==='version')continue;const v=m[key];if(typeof v==='number'){if(key==='attenuationDistance'&&v===Infinity)hash.update('attenuationDistance:Infinity');else numbers([v]);}else if(typeof v==='boolean')hash.update(key+v);else if(v?.isColor)numbers(v.toArray());}
  }
  if(o.isMesh){meshes++;let visible=true;for(let p=o;p;p=p.parent)visible&&=p.visible;
   if(visible){triangles+=(o.geometry.index?.count??o.geometry.attributes.position?.count??0)/3*(o.isInstancedMesh?o.count:1);draws+=Math.max(1,o.geometry.groups.length);}}
 });
 return {digest:hash.digest('hex'),finite,meshes,triangles,estimatedVisibleMeshDraws:draws,nodes};
}
const result={date:new Date().toISOString(),method:'Headless full geometry/transform/material snapshot; forward vs reverse seek on same instance. Draw estimate excludes shadows/postprocessing/culling. Contacts require scene-specific support surfaces; not asserted globally.',times,scenes:[]};
const filterArg=process.argv.find(a=>a.startsWith('--ids='));
const requested=filterArg?new Set(filterArg.slice(6).split(',')):null;
if(requested)for(const id of requested)if(!stories.some(s=>s.id===id))throw Error('Unknown scene '+id);
for(const story of stories.filter(s=>!requested||requested.has(s.id))){const row={id:story.id,route:'#historia/'+story.id,issues:[],samples:[]};let kit;
 try{
  kit=new Kit(story.id);if(!builders[story.id])throw Error('missing builder');builders[story.id](kit);
  if(!story.title||!story.reference||!story.sources?.length||!editorial[story.id]?.text)row.issues.push('missing catalog/editorial content');
  const forward=new Map();for(const t of times){kit.update(t,story.duration);const s=capture(kit);forward.set(t,s.digest);if(!s.finite)row.issues.push('non-finite '+t);row.samples.push({t,...s,nodes:undefined});
   for(const selectable of kit.selectables)if(!selectable.name||!s.nodes.has(selectable.object))row.issues.push('invalid selectable '+t);
  }
  for(const t of [...times].reverse()){kit.update(t,story.duration);const s=capture(kit);if(s.digest!==forward.get(t))row.issues.push('seek differs '+t);}
  row.selectables=kit.selectables.length;row.people=kit.people.length;row.contactStatus='not asserted: no common support/pose contract';
 }catch(error){row.issues.push(error.stack);}finally{kit?.dispose();}
 row.issues=[...new Set(row.issues)];result.scenes.push(row);console.log(row.id,row.issues.length?'FAIL '+row.issues.join('; '):'PASS');
}
result.catalogIntegrity=stories.length===72&&new Set(stories.map(s=>s.id)).size===72&&Object.keys(builders).sort().join()===stories.map(s=>s.id).sort().join();
const output=process.argv.slice(2).find(a=>!a.startsWith('--'))||path.join(os.tmpdir(),'sud-audit72','baseline.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2));console.log(output);if(!result.catalogIntegrity||result.scenes.some(s=>s.issues.length))process.exitCode=1;



