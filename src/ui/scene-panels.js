// Disclosures remain open while being read. A committed choice closes them.
export function createScenePanels(page) {
 const entries={
  navigation:{panel:page.querySelector('#scene-navigator'),trigger:page.querySelector('[data-action=toggle-navigation]'),label:'histórias'},
  settings:{panel:page.querySelector('#scene-settings'),trigger:page.querySelector('[data-action=toggle-settings]'),label:'configurações da cena'},
  controls:{panel:page.querySelector('#scene-toolbar'),trigger:page.querySelector('[data-action=toggle-controls]'),label:'controles da cena'}
 };
 for(const entry of Object.values(entries)){
  entry.panel.hidden=true;entry.trigger.setAttribute('aria-expanded','false');entry.trigger.setAttribute('aria-label','Abrir '+entry.label);
 }
 page.dataset.panel='closed';page.dataset.openPanel='none';
 let active=null;
 const close=(restoreFocus=false)=>{
  if(!active)return;
  const entry=entries[active];entry.panel.hidden=true;entry.trigger.setAttribute('aria-expanded','false');entry.trigger.setAttribute('aria-label','Abrir '+entry.label);
  active=null;page.dataset.panel='closed';page.dataset.openPanel='none';
  if(restoreFocus)entry.trigger.focus({preventScroll:true});
 };
 const open=name=>{
  const entry=entries[name];if(!entry?.panel||!entry.trigger)return;
  close();active=name;entry.panel.hidden=false;entry.trigger.setAttribute('aria-expanded','true');entry.trigger.setAttribute('aria-label','Recolher '+entry.label);
  page.dataset.panel=name==='settings'?'open':'closed';page.dataset.openPanel=name;
  const first=name==='navigation'?entry.panel.querySelector('select'):entry.panel.querySelector('button,a,input');
  first?.focus({preventScroll:true});
 };
 const toggle=name=>{if(active===name)close(true);else open(name)};
 const outside=event=>{
  if(!active)return;const entry=entries[active];
  if(!entry.panel.contains(event.target)&&!entry.trigger.contains(event.target))close();
 };
 const choice=event=>{
  const link=event.target.closest('a');
  if(link){
   // External references open in their own tab, leaving this dialog closed.
   link.closest('dialog[open]')?.close();
   if(active&&entries[active].panel.contains(link))close(true);
   return;
  }
  const button=event.target.closest('button');
  if(active&&button&&entries[active].panel.contains(button))close(true);
 };
 const commit=event=>{if(active&&entries[active].panel.contains(event.target)&&event.target.matches('input,select'))close(true)};
 const escape=event=>{if(event.key==='Escape'&&active&&!page.querySelector('dialog[open]')){event.preventDefault();close(true)}};
 page.addEventListener('pointerdown',outside);
 page.addEventListener('click',outside);
 page.addEventListener('click',choice);
 page.addEventListener('change',commit);
 page.addEventListener('keydown',escape);
 return{open,close,toggle,destroy(){close();page.removeEventListener('pointerdown',outside);page.removeEventListener('click',outside);page.removeEventListener('click',choice);page.removeEventListener('change',commit);page.removeEventListener('keydown',escape)}};
}
