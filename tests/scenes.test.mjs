import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Kit} from '../src/engine/kit.js';
import {stories} from '../src/data/catalog.js';
import {builders as bible} from '../src/scenes/bible.js';
import {builders as mormon} from '../src/scenes/mormon.js';
import {builders as dc} from '../src/scenes/dc.js';
import {builders as pearl} from '../src/scenes/pearl.js';
const builders={...bible,...mormon,...dc,...pearl};
function snapshot(kit){const result=[];kit.group.updateMatrixWorld(true);kit.group.traverse(o=>{result.push(...o.position.toArray(),...o.rotation.toArray().slice(0,3),...o.scale.toArray(),o.visible?1:0);if(o.isLight)result.push(o.intensity);if(o.geometry?.attributes?.position){const attr=o.geometry.attributes.position;for(let i=0;i<Math.min(attr.array.length,90);i++)result.push(attr.array[i]);}});return result;}
test('72 construtores correspondem exatamente ao catálogo',()=>assert.deepEqual(Object.keys(builders).sort(),stories.map(s=>s.id).sort()));
for(const story of stories)test(`${story.id}: construir, animar, voltar e liberar recursos`,()=>{
 const kit=new Kit(story.id);builders[story.id](kit);assert.ok(kit.animations.length>0,'ação narrativa própria');assert.ok(kit.selectables.length>0,'elementos selecionáveis');assert.ok(kit.ambients.length>0,'ambiente vivo');kit.update(0,story.duration);const beginning=snapshot(kit);kit.update(24,story.duration);const middle=snapshot(kit);assert.notDeepEqual(beginning,middle,'ação muda estado do diorama');for(const t of [0,4,8,12,16,24,32,45]){kit.update(t,story.duration);const values=snapshot(kit);assert.ok(values.every(Number.isFinite),`transformações finitas em ${t}s`);}kit.update(24,story.duration);const repeat=snapshot(kit);assert.deepEqual(middle,repeat,'tempo determinístico e repetição sem acúmulo');
 const geometries=new Set(),materials=new Set();let gd=0,md=0;kit.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});for(const g of geometries)g.addEventListener('dispose',()=>gd++);for(const m of materials)m.addEventListener('dispose',()=>md++);kit.dispose();assert.equal(gd,geometries.size);assert.equal(md,materials.size);assert.equal(kit.group.children.length,0);assert.equal(kit.animations.length,0);
});
