// Keep the same reading flow at every text size; expansion only adds space.
export function observeSceneCopy(page) {
 const rail=page.querySelector('.scene-copy'),body=rail.querySelector('.scene-copy-body'),toggle=rail.querySelector('.scene-reading-toggle');
 const setExpanded=expanded=>{
  rail.dataset.readingExpanded=String(expanded);
  toggle.setAttribute('aria-expanded',String(expanded));
  toggle.textContent=expanded?'Recolher leitura':'Expandir leitura';
 };
 const activate=()=>setExpanded(rail.dataset.readingExpanded!=='true');
 const escape=event=>{
  if(event.key!=='Escape'||rail.dataset.readingExpanded!=='true'||page.querySelector('dialog[open]')||page.dataset.openPanel!=='none')return;
  event.preventDefault();event.stopPropagation();setExpanded(false);toggle.focus({preventScroll:true});
 };
 const updateScroll=()=>{
  const scrollable=body.scrollHeight>body.clientHeight+1;
  if(scrollable)body.tabIndex=0;else body.removeAttribute('tabindex');
 };
 const resize=new ResizeObserver(updateScroll);resize.observe(body);
 toggle.addEventListener('click',activate);rail.addEventListener('keydown',escape);updateScroll();
 return()=>{resize.disconnect();toggle.removeEventListener('click',activate);rail.removeEventListener('keydown',escape)};
}
