const key='escrituras-miniatura-v1';
const defaults={favorites:[],history:[],last:null,preferences:{reduced:typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches,quality:'medium',text:'normal',atmosphere:'original',loop:false,sound:false}};
export function readState(){try{return {...defaults,...JSON.parse(localStorage.getItem(key)||'{}'),preferences:{...defaults.preferences,...JSON.parse(localStorage.getItem(key)||'{}').preferences}}}catch{return structuredClone(defaults)}}
export const state=readState();
export function saveState(){try{localStorage.setItem(key,JSON.stringify(state));return true}catch{return false}}
export function favorite(id){state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];return saveState()}
export function visit(id){state.history=[id,...state.history.filter(x=>x!==id)].slice(0,72);state.last={id,time:0};saveState()}
