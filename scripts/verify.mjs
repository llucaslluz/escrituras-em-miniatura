import fs from 'node:fs';
import path from 'node:path';
import {stories,books} from '../src/data/catalog.js';
const problems=[];
for(const s of stories){if(!fs.existsSync(`public/thumbnails/${s.id}.jpg`))problems.push(`Miniatura ausente: ${s.id}`);}
for(const p of ['README.md','LICENSE','docs/INVENTARIO.md','docs/VERIFICACOES.md','docs/DEPENDENCIAS.md','package-lock.json','dist/index.html'])if(!fs.existsSync(p))problems.push(`Arquivo ausente: ${p}`);
const inventory={version:'1.0.0',generated:new Date().toISOString(),total:stories.length,books:books.map(b=>({id:b.id,name:b.name,scenes:stories.filter(s=>s.book===b.id).map(s=>({id:s.id,title:s.title,base:s.base,state:'implementada',source:`src/scenes/${b.id}.js`,reference:s.reference}))})),problems};
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/inventory.json',JSON.stringify(inventory,null,2));console.log(JSON.stringify({total:stories.length,perBook:books.map(b=>[b.name,stories.filter(s=>s.book===b.id).length]),problems},null,2));if(problems.length)process.exitCode=1;
