import './style.css';
import { Store, type ObjectId, type Mood, type StudioState } from './state';
import { items, byId } from './content';
import { icon } from './ui/icons';
import { Studio } from './render/studio';
import { AmbientAudio } from './render/audio';

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
  <header class="topbar">
    <a class="brand" href="#" aria-label="กลับมุมมองเริ่มต้น"><span class="brand-mark">${icon('grid')}</span><span>GUNNY<span class="brand-sub">DIGITAL STUDIO</span></span></a>
    <span class="top-note"><i></i> YOUR SPACE, REIMAGINED</span>
    <nav aria-label="เมนูหลัก"><button class="text-button" id="collection-button">${icon('grid')}<span>อุปกรณ์ทั้งหมด</span><span class="count">11</span></button><button class="icon-button help-button" id="help-button" aria-label="วิธีใช้งาน">${icon('help')}</button></nav>
  </header>
  <main>
    <section class="intro" aria-labelledby="page-title">
      <div class="eyebrow"><span class="tiny-line"></span> THE INTERACTIVE ROOM</div>
      <h1 id="page-title">Your space.<br><em>Your flow.</em></h1>
      <p class="intro-description">ห้องทำงานที่เป็นตัวคุณ<br>ลองสัมผัส เปลี่ยนแสง และสำรวจ<br>ทุกรายละเอียดได้ในแบบของคุณ</p>
      <button id="explore-button" class="primary-button">เริ่มสำรวจห้อง ${icon('arrow')}</button>
      <div class="intro-rule"></div>
      <div class="material-note"><span class="material-dot walnut"></span><span class="material-dot ivory"></span><span class="material-dot charcoal"></span><span>Walnut. Ivory. Graphite.</span></div>
      <div class="edition">DESIGNED TO THINK. BUILT TO CREATE.<br><b>STUDIO NO. 001</b></div>
    </section>
    <div id="scene" class="scene-container">
      <div class="scene-caption"><span class="live-dot"></span> LIVE 3D <span class="caption-divider">/</span> <span id="mood-caption">DAYLIGHT</span></div>
      <div id="markers" class="markers" aria-label="วัตถุในห้อง"></div>
      <div id="hover-label" class="hover-label" hidden></div>
      <div class="scene-hint">${icon('orbit')}<span>ลากเพื่อหมุน</span><i></i><span>เลื่อนเพื่อซูม</span><i></i><span>คลิกเพื่อโต้ตอบ</span></div>
      <div class="loader" id="loader" role="status"><span class="loading-symbol">${icon('grid')}</span><h2>กำลังเตรียมห้องของคุณ</h2><p>เก็บรายละเอียดให้พร้อมสำหรับการสำรวจ</p><div class="progress-track"><span id="progress-fill"></span></div><span id="progress-text">0%</span></div>
    </div>
    <aside id="inspector" class="inspector" aria-label="ควบคุมอุปกรณ์" hidden></aside>
    <aside id="collection" class="collection-panel" aria-label="รายการอุปกรณ์" hidden>
      <div class="panel-top"><span class="eyebrow">THE COLLECTION</span><button class="icon-button" id="close-collection" aria-label="ปิดรายการ">${icon('close')}</button></div>
      <h2>ทุกชิ้นมีเรื่องราว</h2><p class="panel-description">เลือกอุปกรณ์เพื่อเริ่มโต้ตอบ</p>
      <div class="collection-list">${items.map(item=>`<button class="collection-item" data-select="${item.id}"><span>${item.number}</span><div><strong>${item.name}</strong><small>${item.subtitle}</small></div>${icon('chevron')}</button>`).join('')}</div>
    </aside>
    <div class="bottom-bar">
      <div class="mood-controls"><span class="dock-label">บรรยากาศ</span><div class="segmented" role="group" aria-label="บรรยากาศของห้อง"><button data-mood="day" aria-label="แสงกลางวัน">${icon('sun')}<span>Daylight</span></button><button data-mood="warm" aria-label="แสงอุ่น">${icon('warm')}<span>Golden</span></button><button data-mood="night" aria-label="โหมดโฟกัสกลางคืน">${icon('moon')}<span>Focus</span></button></div></div>
      <span class="dock-divider"></span>
      <label class="light-slider">${icon('sun')}<input id="light-slider" type="range" min="0" max="100" step="1" aria-label="ความสว่างไฟห้อง"><output id="light-output">80%</output></label>
      <span class="dock-divider"></span>
      <div class="view-controls"><button id="hotspots-button" class="icon-button" aria-label="แสดงจุดโต้ตอบ" title="จุดโต้ตอบ">${icon('pin')}</button><button id="orbit-button" class="icon-button" aria-label="หมุนชมอัตโนมัติ" title="หมุนชมอัตโนมัติ">${icon('orbit')}</button><button id="reset-view" class="icon-button" aria-label="กลับมุมมองเริ่มต้น" title="กลับมุมมองเริ่มต้น">${icon('reset')}</button></div>
    </div>
  </main>
  <footer><span>A PERSONAL SPACE, IN A NEW DIMENSION.</span><button id="capture-button">${icon('camera')} บันทึกมุมนี้</button><span class="footer-right">CRAFTED IN 3D <span>↗</span></span></footer>
  <div id="toast" role="status" aria-live="polite"></div>
  <dialog id="help-dialog"><form method="dialog"><div class="panel-top"><span class="eyebrow">MAKE YOURSELF AT HOME</span><button class="icon-button" aria-label="ปิดวิธีใช้งาน">${icon('close')}</button></div><h2>สำรวจห้องในแบบของคุณ</h2><p>ใช้เมาส์หรือนิ้วลากเพื่อหมุนห้อง เลื่อนหรือบีบสองนิ้วเพื่อซูม แล้วคลิกอุปกรณ์หรือจุดหมายเลขเพื่อเปิดแผงควบคุม</p><dl><div><dt>เลือกอุปกรณ์ด้วยคีย์บอร์ด</dt><dd>Tab → Enter หรือเปิด “อุปกรณ์ทั้งหมด”</dd></div><div><dt>กลับมุมมองเริ่มต้น</dt><dd>R</dd></div><div><dt>เปิด–ปิดโคมไฟ</dt><dd>L</dd></div><div><dt>แสดง–ซ่อนจุดโต้ตอบ</dt><dd>H</dd></div><div><dt>ปิดแผงควบคุม</dt><dd>Esc</dd></div></dl><p class="small-note">การตั้งค่าแสงและอุปกรณ์บันทึกไว้ในเบราว์เซอร์นี้ เสียงจะเริ่มเล่นเมื่อคุณกดเล่นเท่านั้น อุปกรณ์ทุกชิ้นเป็นการจำลองบนเว็บ</p><button value="close" class="primary-button">เข้าใจแล้ว ${icon('arrow')}</button></form></dialog>
`;
const $=<T extends HTMLElement=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
const store=new Store(),audio=new AmbientAudio();
let studio:Studio|undefined,ready=false,selection:ObjectId|undefined,toastTimer=0,lastTrigger:HTMLElement|null=null;
const inspector=$('#inspector'),collection=$('#collection');
const markerIds:ObjectId[]=['workstation','blind','chair','server','drawer'];
$('#markers').innerHTML=markerIds.map(id=>`<button class="marker" data-select="${id}" aria-label="เลือก ${byId[id].name}" title="${byId[id].subtitle}"><span>${byId[id].number}</span><b>${byId[id].name}</b></button>`).join('');
const markers=[...document.querySelectorAll<HTMLButtonElement>('.marker')];

function toast(message:string){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=window.setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
function closePanels(){inspector.hidden=true;collection.hidden=true;document.body.classList.remove('panel-open');selection=undefined;studio?.select();lastTrigger?.focus({preventScroll:true});}
function toggleControl(field:string,title:string,subtitle:string){return `<div class="control-row"><div><strong>${title}</strong><small>${subtitle}</small></div><button class="switch" data-toggle="${field}" role="switch" aria-label="${title}" aria-checked="false"><span></span></button></div>`;}
function controlsFor(id:ObjectId){
  switch(id){
    case 'workstation':return toggleControl('monitors','หน้าจอทั้งสอง','พักหน้าจอเมื่ออยากพักสายตา');
    case 'laptop':return toggleControl('laptop','หน้าจอโน้ตบุ๊ก','เทอร์มินัลพร้อมสำหรับไอเดียใหม่');
    case 'pc':return toggleControl('pc','เวิร์กสเตชัน','ไฟและพัดลมของโมเดล');
    case 'server':return toggleControl('server','สถานะโฮมแล็บ','ระบบจำลองภายในห้อง');
    case 'lamp':return toggleControl('lamp','โคมไฟทำงาน','แสงอุ่นเฉพาะจุด');
    case 'drawer':return toggleControl('drawer','เปิดลิ้นชัก','เลื่อนลิ้นชักบนเข้า–ออก');
    case 'chair':return `<button class="action-button" data-action="rotate-chair">${icon('orbit')} หมุนเก้าอี้ 90°</button><span class="control-caption" id="chair-angle"></span>`;
    case 'blind':return `<label class="range-control"><span>ระดับปิดม่าน <output id="blind-output"></output></span><input type="range" min="0" max="100" data-range="blind" aria-label="ระดับปิดม่าน"><span class="range-ends"><small>เปิดรับแสง</small><small>ปิดม่าน</small></span></label>`;
    case 'speakers':return `<button class="action-button" data-action="sound" id="sound-button"></button><label class="range-control"><span>ระดับเสียง <output id="volume-output"></output></span><input type="range" min="0" max="100" data-range="volume" aria-label="ระดับเสียงแอมเบียนต์"></label>`;
    case 'headphones':return `<button class="action-button" data-action="focus-mood">${icon('moon')} เข้าสู่บรรยากาศ Focus</button>`;
    case 'camera':return `<button class="action-button" data-action="snapshot">${icon('camera')} บันทึกภาพห้อง PNG</button>`;
  }
}
function select(id:ObjectId){
  if(!ready){toast('รอสักครู่ กำลังเตรียมโมเดล');return;}
  lastTrigger=document.activeElement instanceof HTMLElement?document.activeElement:null;
  selection=id;studio?.select(id);collection.hidden=true;inspector.hidden=false;document.body.classList.add('panel-open');
  const item=byId[id];
  inspector.innerHTML=`<div class="panel-top"><span class="object-number">OBJECT / ${item.number}</span><button class="icon-button" data-action="close" aria-label="ปิดแผงอุปกรณ์">${icon('close')}</button></div><span class="object-tag">${item.tag}</span><h2 tabindex="-1" id="object-title">${item.name}</h2><p class="object-subtitle">${item.subtitle}</p><div class="panel-rule"></div><p class="object-description">${item.detail}</p><div class="object-controls">${controlsFor(id)}</div><button class="focus-button" data-action="focus-object">${icon('focus')} ดูอุปกรณ์ใกล้ขึ้น ${icon('arrow')}</button><div class="object-bottom"><span>EXPLORE THE DETAILS</span><span>${item.number} / 11</span></div>`;
  refresh(store.value);$('#object-title').focus({preventScroll:true});
}
function refresh(state:StudioState){
  document.body.dataset.mood=state.mood;
  document.querySelectorAll<HTMLButtonElement>('[data-mood]').forEach(b=>{const active=b.dataset.mood===state.mood;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach(b=>b.setAttribute('aria-checked',String(state[b.dataset.toggle as keyof StudioState])));
  document.querySelectorAll<HTMLInputElement>('[data-range]').forEach(input=>{input.value=String(state[input.dataset.range as keyof StudioState]);});
  $('#light-slider').setAttribute('aria-valuetext',`${state.light}%`);($<HTMLInputElement>('#light-slider')).value=String(state.light);$('#light-output').textContent=`${state.light}%`;
  $('#hotspots-button').setAttribute('aria-pressed',String(state.hotspots));$('#markers').classList.toggle('disabled',!state.hotspots);
  $('#mood-caption').textContent={day:'DAYLIGHT',warm:'GOLDEN HOUR',night:'FOCUS MODE'}[state.mood];
  if(selection==='blind')$('#blind-output').textContent=`${state.blind}%`;
  if(selection==='chair')$('#chair-angle').textContent=`มุมเก้าอี้ ${((state.chair%360)+360)%360}°`;
  if(selection==='speakers'){$('#sound-button').innerHTML=`${icon(state.sound?'pause':'play')} ${state.sound?'หยุดเสียงแอมเบียนต์':'เล่นเสียงแอมเบียนต์'}`;$('#volume-output').textContent=`${state.volume}%`;}
  studio?.update(state);
  void audio.set(state.sound,state.volume).catch(()=>{store.update({sound:false});toast('เบราว์เซอร์ยังไม่อนุญาตให้เล่นเสียง ลองกดเล่นอีกครั้ง');});
}
store.subscribe(refresh);refresh(store.value);

document.addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLElement>('button,a.brand');if(!button)return;
  if(button.dataset.select)select(button.dataset.select as ObjectId);
  if(button.dataset.mood)store.update({mood:button.dataset.mood as Mood});
  if(button.dataset.toggle){const key=button.dataset.toggle as keyof StudioState;store.update({[key]:!store.value[key]});}
  const action=button.dataset.action;
  if(action==='close')closePanels();
  if(action==='rotate-chair')store.update({chair:store.value.chair+90});
  if(action==='focus-object'&&selection)studio?.focus(selection);
  if(action==='sound')store.update({sound:!store.value.sound});
  if(action==='focus-mood'){store.update({mood:'night'});toast('เปลี่ยนเป็นบรรยากาศ Focus แล้ว');}
  if(action==='snapshot')snapshot();
  if(button.matches('.brand')){event.preventDefault();closePanels();studio?.reset();}
});
document.addEventListener('input',event=>{
  const input=event.target as HTMLInputElement;
  if(input.dataset.range)store.update({[input.dataset.range]:Number(input.value)});
});
$('#light-slider').addEventListener('input',e=>store.update({light:Number((e.target as HTMLInputElement).value)}));
$('#hotspots-button').addEventListener('click',()=>store.update({hotspots:!store.value.hotspots}));
$('#orbit-button').addEventListener('click',()=>{const active=studio?.toggleOrbit()||false;$('#orbit-button').setAttribute('aria-pressed',String(active));});
$('#reset-view').addEventListener('click',()=>{closePanels();studio?.reset();$('#orbit-button').setAttribute('aria-pressed','false');toast('กลับมุมมองเริ่มต้นแล้ว');});
$('#explore-button').addEventListener('click',()=>select('workstation'));
$('#collection-button').addEventListener('click',()=>{if(!collection.hidden){closePanels();return;}lastTrigger=$('#collection-button');inspector.hidden=true;collection.hidden=false;selection=undefined;document.body.classList.add('panel-open');collection.querySelector<HTMLButtonElement>('.collection-item')?.focus();});
$('#close-collection').addEventListener('click',closePanels);
$('#help-button').addEventListener('click',()=>($<HTMLDialogElement>('#help-dialog')).showModal());
$('#capture-button').addEventListener('click',snapshot);
document.addEventListener('keydown',event=>{
  if((event.target as HTMLElement).matches('input,textarea,select')||event.ctrlKey||event.metaKey||event.altKey)return;
  if(event.key==='Escape')closePanels();
  if(($<HTMLDialogElement>('#help-dialog')).open)return;
  if(event.key.toLowerCase()==='r'){studio?.reset();closePanels();}
  if(event.key.toLowerCase()==='l')store.update({lamp:!store.value.lamp});
  if(event.key.toLowerCase()==='h')store.update({hotspots:!store.value.hotspots});
});
function snapshot(){if(!ready||!studio){toast('รอโมเดลโหลดเสร็จก่อนบันทึกภาพ');return;}const a=document.createElement('a');a.href=studio.snapshot();a.download=`gunny-studio-${store.value.mood}.png`;a.click();toast('บันทึกภาพห้องแล้ว');}

async function boot(){
  try{
    studio=new Studio($('#scene'));studio.onSelect=select;
    studio.onHover=id=>{const label=$('#hover-label');label.hidden=!id;if(id)label.textContent=`${byId[id].number} / ${byId[id].name}`;};
    studio.onFrame=()=>{
      if(!studio)return;
      for(const marker of markers){const id=marker.dataset.select as ObjectId;const p=studio.project(byId[id].position);marker.style.transform=`translate(${p.x}px,${p.y}px)`;marker.style.visibility=p.visible?'visible':'hidden';marker.classList.toggle('selected',selection===id);}
    };
    studio.onContextLoss=()=>showError('การแสดงผล 3D หยุดชั่วคราว กรุณาโหลดหน้าเว็บใหม่');
    studio.update(store.value);
    await studio.load(percent=>{$('#progress-fill').style.width=`${percent}%`;$('#progress-text').textContent=`${Math.round(percent)}%`;});
    ready=true;document.body.classList.add('ready');$('#loader').hidden=true;
    // Read-only diagnostics for performance checks and integration tests.
    Object.defineProperty(window,'__studio',{value:{getState:()=>({...store.value}),getStats:()=>studio?.stats(),isReady:()=>ready},configurable:true});
  }catch(error){console.error('Studio load failed:',error);showError('ยังเปิดโมเดล 3D ไม่ได้ ลองโหลดใหม่ หรือใช้เบราว์เซอร์ที่รองรับ WebGL 2');}
}
function showError(message:string){
  $('#loader').hidden=false;$('#loader').innerHTML=`<h2>ห้องยังไม่พร้อมแสดงผล</h2><p>${message}</p><button class="primary-button" id="retry-button">ลองอีกครั้ง ${icon('reset')}</button><a href="${import.meta.env.BASE_URL}studio-poster.png" class="error-link">ดูภาพห้องแทน</a>`;
  $('#retry-button').addEventListener('click',()=>location.reload());
}
window.addEventListener('pagehide',()=>{audio.dispose();studio?.dispose();});
void boot();
