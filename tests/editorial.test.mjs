import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stories} from '../src/data/catalog.js';
import {editorial} from '../src/data/editorial.js';

test('as 72 cenas têm um ensinamento próprio, sem texto genérico de reserva',()=>{
 assert.deepEqual(Object.keys(editorial).sort(),stories.map(s=>s.id).sort());
 assert.equal(new Set(Object.values(editorial).map(e=>e.text)).size,72);
 assert.equal(new Set(Object.values(editorial).map(e=>e.title)).size,72);
 for(const s of stories){
  const e=editorial[s.id];
  assert.ok(e.title.length>=8&&e.title.length<=44,`${s.id}: título legível e específico`);
  assert.ok(e.text.length>=100&&e.text.length<=250,`${s.id}: doutrina concisa`);
  assert.ok(e.reference.length>4,`${s.id}: passagem que fundamenta o ensino`);
  assert.doesNotMatch(e.text,/Histórias de fé\. Encontros que ficam|Toque nos personagens para conhecer|Um pequeno mundo para contemplar/i);
 }
});

test('cada ensinamento aponta para uma fonte oficial da própria cena',()=>{
 for(const s of stories){
  const e=editorial[s.id],url=new URL(e.url);
  assert.equal(url.protocol,'https:',s.id);
  assert.equal(url.hostname,'www.churchofjesuschrist.org',s.id);
  assert.equal(url.searchParams.get('lang'),'por',s.id);
  assert.ok(s.sources.some(source=>new URL(source.url).pathname===url.pathname),`${s.id}: o capítulo citado pertence à base da cena`);
 }
});
