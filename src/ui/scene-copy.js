// Keep the editorial and character invitation in one flow. Fit the display
// heading to the actual wrapped text, rather than guessing from its length.
export function observeSceneCopy(page) {
 const rail=page.querySelector('.scene-copy'),editorial=rail.querySelector('.scene-editorial'),heading=rail.querySelector('h1'),intro=rail.querySelector('.scene-character-intro');
 let frame=0,disposed=false;
 const fit=()=>{
  if(disposed||!rail.isConnected)return;
  heading.style.removeProperty('font-size');
  delete rail.dataset.compactCopy;
  const natural=parseFloat(getComputedStyle(heading).fontSize),minimum=Math.min(natural,matchMedia('(max-width:760px)').matches?28:38);
  const needed=()=>editorial.getBoundingClientRect().height+intro.getBoundingClientRect().height+(getComputedStyle(intro).display==='none'?0:28);
  // Leave room for the ink below italic descenders, outside the line box.
  const available=rail.getBoundingClientRect().height-6;
  if(needed()>available)rail.dataset.compactCopy='true';
  if(needed()>available){
   heading.style.fontSize=minimum+'px';
   let low=minimum,high=natural;
   for(let i=0;i<9;i++){
    const size=(low+high)/2;heading.style.fontSize=size+'px';
    if(needed()<=available)low=size;else high=size;
   }
   heading.style.fontSize=Math.floor(low*10)/10+'px';
  }
  const scrollable=rail.scrollHeight>rail.clientHeight+1;
  rail.dataset.scrollable=String(scrollable);
  if(scrollable)rail.tabIndex=0;else rail.removeAttribute('tabindex');
 };
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(fit)};
 const resize=new ResizeObserver(schedule);resize.observe(rail);
 const preferences=new MutationObserver(schedule);preferences.observe(document.documentElement,{attributes:true,attributeFilter:['data-text']});
 fit();
 return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();preferences.disconnect()};
}
