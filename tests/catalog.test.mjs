import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stories,books,byId,searchStories,neighbors} from '../src/data/catalog.js';
test('catálogo: 72 IDs únicos, quatro obras e 18 cenas da base',()=>{
 assert.equal(stories.length,88);assert.equal(byId.size,88);
 for(const b of books){const own=stories.filter(s=>s.book===b.id);assert.equal(own.length,b.count);const prefix={bible:'B',mormon:'M',dc:'D',pearl:'P'}[b.id];for(let i=1;i<=b.count;i++)assert.ok(byId.has(prefix+String(i).padStart(2,'0')));}
 assert.deepEqual(stories.filter(s=>s.base).map(s=>s.id),['B15','B17','B22','B28','B29','B30','B31','M16','M17','M18','M19','D05','D07','P02','P05','P06','P08','P09']);
});
test('dados: fontes oficiais, referências, contexto e quatro momentos válidos',()=>{
 for(const s of stories){for(const key of ['title','summary','reference','theme','place','era','artistic'])assert.ok(s[key]?.length>2,`${s.id}: ${key}`);assert.ok(s.characters.length>0,s.id);assert.ok(s.sources.length>0,s.id);for(const source of s.sources){const url=new URL(source.url);assert.equal(url.protocol,'https:');assert.equal(url.hostname,'www.churchofjesuschrist.org');assert.ok(url.searchParams.get('lang')==='por',source.url);}assert.ok(s.duration>=20&&s.duration<=40);assert.equal(s.moments.length,4,s.id);assert.equal(s.moments[0].at,0);for(let i=0;i<s.moments.length;i++){const m=s.moments[i];assert.ok(m.title&&m.caption);assert.ok(m.at>=0&&m.at<s.duration);if(i)assert.ok(m.at>s.moments[i-1].at);}}
});
test('busca sem acentos, filtros e vizinhos respeitam o livro',()=>{
 assert.ok(searchStories('nefi').some(s=>s.id==='M01'));assert.deepEqual(searchStories('Néfi').map(s=>s.id),searchStories('nefi').map(s=>s.id));assert.equal(searchStories('',{book:'dc'}).length,14);assert.equal(searchStories('',{book:'bible',testament:'old'}).length,14);assert.ok(searchStories('',{type:'parábola'}).every(s=>['B24','B25','B35'].includes(s.id)));assert.equal(neighbors(byId.get('B36')).next,undefined);assert.equal(neighbors(byId.get('M01')).previous,undefined);assert.equal(neighbors(byId.get('M02')).previous.id,'M01');
});
