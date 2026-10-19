import {stories as bible} from './bible.js';
import {stories as mormon} from './mormon.js';
import {stories as dc} from './dc.js';
import {stories as pearl} from './pearl.js';
export const books=[{id:'bible',name:'Bíblia',short:'Bíblia',count:32,icon:'bible',color:'#b88650',description:'Dos primeiros convênios ao ministério de Jesus Cristo.'},{id:'mormon',name:'Livro de Mórmon',short:'Livro de Mórmon',count:20,icon:'mormon',color:'#76856a',description:'Jornadas de fé e outro testemunho de Jesus Cristo.'},{id:'dc',name:'Doutrina e Convênios',short:'Doutrina e Convênios',count:10,icon:'dc',color:'#7c929b',description:'Revelações, restauração e o plano de nosso Pai Celestial.'},{id:'pearl',name:'Pérola de Grande Valor',short:'Pérola de Grande Valor',count:10,icon:'pearl',color:'#a295b3',description:'Criação, visões e o propósito eterno da vida.'}];
export const stories=[...bible,...mormon,...dc,...pearl];
export const byId=new Map(stories.map(s=>[s.id,s]));
export const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function searchStories(query='',filters={}){const terms=normalize(query).split(/\s+/).filter(Boolean);return stories.filter(s=>(!filters.book||s.book===filters.book)&&(!filters.type||s.type===filters.type)&&(!filters.testament||s.testament===filters.testament)&&terms.every(term=>normalize([s.title,s.reference,s.theme,s.summary,books.find(b=>b.id===s.book).name,...s.characters.map(c=>c.name)].join(' ')).includes(term)));}
export function neighbors(story){const all=stories.filter(s=>s.book===story.book),i=all.indexOf(story);return{previous:all[i-1],next:all[i+1]}}
export const characterKey=name=>/^(jesus|jesus cristo|cristo|o salvador)$/i.test(name)?'Jesus Cristo':name;
export const characters=(()=>{const map=new Map();for(const s of stories)for(const c of s.characters){const name=characterKey(c.name);if(!map.has(name))map.set(name,{name,description:c.description,stories:[],references:[]});const e=map.get(name);if(!e.stories.includes(s))e.stories.push(s);if(!e.references.includes(s.reference))e.references.push(s.reference);}return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));})();
