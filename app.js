import * as T from './assets/three.module.js';
import {lessons,palette} from './data.js';
const $=s=>document.querySelector(s);let lesson=lessons[0],amount=lesson.points.length,free=false,guiding=false;
const scene=new T.Scene();scene.background=new T.Color('#eaf0f9');
let renderer;try{renderer=new T.WebGLRenderer({canvas:$('#canvas'),antialias:true,preserveDrawingBuffer:true});}catch(e){$('#fallback').hidden=false;}
const camera=new T.PerspectiveCamera(35,1,.1,150),root=new T.Group();scene.add(root);scene.add(new T.HemisphereLight(0xffffff,0x7c8cad,2.5));const light=new T.DirectionalLight(0xffffff,2.5);light.position.set(6,10,8);scene.add(light);
const materials=Object.fromEntries(Object.entries(palette).map(([k,v])=>[k,new T.MeshStandardMaterial({color:v[1],roughness:.32})]));
const beam=new T.BoxGeometry(.12,.12,1);
function cube(color){const g=new T.Group();for(let axis=0;axis<3;axis++)for(const a of [-.44,0,.44])for(const b of [-.44,0,.44]){if(a===0&&b===0)continue;const mesh=new T.Mesh(beam,materials[color]);if(axis===0){mesh.rotation.y=Math.PI/2;mesh.position.set(0,a,b);}if(axis===1){mesh.rotation.x=Math.PI/2;mesh.position.set(a,0,b);}if(axis===2)mesh.position.set(a,b,0);g.add(mesh);}return g;}
let yaw=.65,elev=.45,distance=12;
function draw(){if(!renderer)return;const r=$('#stage').getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();camera.position.set(distance*Math.cos(elev)*Math.sin(yaw),distance*Math.sin(elev),distance*Math.cos(elev)*Math.cos(yaw));camera.lookAt(0,0,0);renderer.render(scene,camera);}
function build(){root.children.forEach(o=>{if(o.isSprite){o.material.map.dispose();o.material.dispose();}});root.clear();const pts=lesson.points;const centers=['x','y','z'].map(k=>(Math.min(...pts.map(p=>p[k]))+Math.max(...pts.map(p=>p[k])))/2);pts.slice(0,amount).forEach((p,i)=>{const g=cube(free?'blue':p.color);g.position.set(p.x-centers[0],p.y-centers[1],p.z-centers[2]);root.add(g);if(guiding){const label=numberLabel(i+1);label.position.copy(g.position);label.position.z+=.58;root.add(label);if(i===amount-1){const edge=new T.LineSegments(outlineGeometry,outlineMaterial);edge.position.copy(g.position);root.add(edge);}}});draw();updateGuide();$('#step').max=pts.length;$('#step').value=amount;$('#progressText').textContent=amount+' / '+pts.length+' 顆';$('#prev').disabled=amount===1;$('#next').disabled=amount===pts.length;}
function cards(){const type=$('#category').value;$('#cards').innerHTML=lessons.filter(l=>type==='all'||l.type===type).map(l=>'<button class="card '+(l.id===lesson.id?'active':'')+'" data-id="'+l.id+'"><b>'+String(l.id).padStart(2,'0')+'</b><span>'+l.title+'<small> · '+l.type+' / '+l.points.length+' 顆</small></span></button>').join('');$('#cards').querySelectorAll('button').forEach(b=>b.onclick=()=>select(Number(b.dataset.id)));}
function select(id){lesson=lessons.find(l=>l.id===id);guiding=false;amount=lesson.points.length;$('#title').textContent=lesson.title;$('#meta').textContent='題目 '+String(id).padStart(2,'0')+' · '+lesson.type;$('#count').textContent=amount+' 顆';$('#description').textContent=lesson.description;$('#steps').innerHTML=lesson.steps.map(s=>'<li>'+s+'</li>').join('');$('#teaching').textContent=lesson.teaching;inventory();cards();view('iso');build();}
function inventory(){const counts={};lesson.points.forEach(p=>counts[p.color]=(counts[p.color]||0)+1);$('#inventory').innerHTML=free?'<span class="chip">任意顏色，共 '+lesson.points.length+' 顆</span>':Object.entries(counts).map(([c,n])=>'<span class="chip"><i style="background:'+palette[c][1]+'"></i>'+palette[c][0]+'色 '+n+' 顆</span>').join('');}
function view(v){yaw=v==='front'||v==='top'?0:.65;elev=v==='top'?Math.PI/2-.001:v==='front'?0:.45;distance=Math.max(9,...['x','y','z'].map(k=>(Math.max(...lesson.points.map(p=>p[k]))-Math.min(...lesson.points.map(p=>p[k]))+2)*2.1));draw();}
$('#category').onchange=cards;$('#step').oninput=e=>{amount=Number(e.target.value);build();};$('#prev').onclick=()=>{amount=Math.max(1,amount-1);build();};$('#next').onclick=()=>{amount=Math.min(lesson.points.length,amount+1);build();};$('#complete').onclick=()=>{guiding=false;amount=lesson.points.length;build();};$('#free').onchange=e=>{free=e.target.checked;inventory();build();};document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));$('#reset').onclick=()=>view('iso');
let drag=null;$('#canvas').onpointerdown=e=>{drag=[e.clientX,e.clientY,yaw,elev];e.target.setPointerCapture(e.pointerId);};$('#canvas').onpointermove=e=>{if(!drag)return;yaw=drag[2]-(e.clientX-drag[0])*.008;elev=Math.max(-1.4,Math.min(1.55,drag[3]+(e.clientY-drag[1])*.008));draw();};$('#canvas').onpointerup=$('#canvas').onpointercancel=()=>drag=null;$('#canvas').addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(4,Math.min(35,distance+e.deltaY*.01));draw();},{passive:false});new ResizeObserver(draw).observe($('#stage'));
function printCard(){if(!renderer)return;const old=amount,oldGuide=guiding;guiding=false;amount=lesson.points.length;build();$('#printImage').src=renderer.domElement.toDataURL('image/png');$('#printTitle').textContent='連接方塊｜'+lesson.title;$('#printBody').innerHTML='<p>'+lesson.type+' · 共 '+lesson.points.length+' 顆 · '+(free?'顏色自由搭配':'依圖配色')+'</p><p>'+lesson.description+'</p><ol>'+lesson.steps.map(s=>'<li>'+s+'</li>').join('')+'</ol><p>愛迪樂｜鍾孟修 職能治療師</p>';amount=old;guiding=oldGuide;build();}
$('#print').onclick=()=>{printCard();window.print();};window.addEventListener('beforeprint',printCard);

const outlineGeometry=new T.EdgesGeometry(new T.BoxGeometry(1.08,1.08,1.08));
const outlineMaterial=new T.LineBasicMaterial({color:0x102844});
const guide=document.createElement('section');guide.className='guide';guide.innerHTML='<button id="startGuide">開始引導製作</button><div id="guidePanel" hidden><strong id="guideHeading"></strong><p id="guideText" aria-live="polite"></p><p class="guideNote">黑框是本步新加入的方塊。方向以正面視角為準；需要時按「正面」確認。</p><button id="guidePrev">上一步</button> <button id="guideNext">完成這步，下一步</button> <button id="exitGuide">結束引導</button></div>';
$('.progress').before(guide);
function numberLabel(n){const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.fillStyle='#15233b';x.beginPath();x.arc(32,32,29,0,Math.PI*2);x.fill();x.fillStyle='white';x.font='bold 34px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(n,32,34);const texture=new T.CanvasTexture(c);const m=new T.SpriteMaterial({map:texture,depthTest:false});const a=new T.Sprite(m);a.scale.set(.38,.38,1);a.renderOrder=10;return a;}
function updateGuide(){
 $('#guidePanel').hidden=!guiding;
 $('#startGuide').textContent=guiding?'重新從第一步開始':'開始引導製作';
 if(!guiding)return;
 const p=lesson.points[amount-1],color=free?'任意顏色':palette[p.color][0]+'色';
 $('#guideHeading').textContent='第 '+amount+' 步 / 共 '+lesson.points.length+' 步';
 let text='拿 1 顆'+color+'方塊，當作起點（編號 1）。';
 if(amount>1){const i=lesson.points.slice(0,amount-1).findIndex(q=>Math.abs(p.x-q.x)+Math.abs(p.y-q.y)+Math.abs(p.z-q.z)===1);const q=lesson.points[i];const direction=p.x>q.x?'右側':p.x<q.x?'左側':p.y>q.y?'上方':p.y<q.y?'下方':p.z>q.z?'前方（朝向你）':'後方（遠離你）';text='拿 1 顆'+color+'方塊，接在編號 '+(i+1)+' 方塊的'+direction+'，成為編號 '+amount+'。';}
 if(amount===lesson.points.length)text+=' 這是最後一顆！完成後請旋轉模型，確認整體形狀。';
 $('#guideText').textContent=text;$('#guidePrev').disabled=amount===1;
 $('#guideNext').textContent=amount===lesson.points.length?'完成製作，查看全圖':'完成這步，下一步';
}
$('#startGuide').onclick=()=>{guiding=true;amount=1;view('iso');build();guide.scrollIntoView({behavior:'smooth',block:'nearest'});};
$('#guidePrev').onclick=()=>{amount=Math.max(1,amount-1);build();};
$('#guideNext').onclick=()=>{if(amount<lesson.points.length)amount++;else guiding=false;build();};
$('#exitGuide').onclick=()=>{guiding=false;amount=lesson.points.length;build();};

const work=$('.work');
const fullscreenButton=document.createElement('button');
fullscreenButton.id='fullscreenQuestion';
fullscreenButton.type='button';
fullscreenButton.textContent='全螢幕觀看題目';
fullscreenButton.setAttribute('aria-pressed','false');
$('.workhead').append(fullscreenButton);
let fallbackScreen=false;
function syncFullscreen(){
 const active=document.fullscreenElement===work||fallbackScreen;
 work.classList.toggle('question-fullscreen',active);
 document.body.classList.toggle('question-expanded',active);
 fullscreenButton.textContent=active?'退出全螢幕':'全螢幕觀看題目';
 fullscreenButton.setAttribute('aria-pressed',String(active));
 requestAnimationFrame(draw);
}
function closeFallback(){fallbackScreen=false;syncFullscreen();fullscreenButton.focus();}
fullscreenButton.addEventListener('click',async()=>{
 if(fallbackScreen){closeFallback();return;}
 if(document.fullscreenElement===work){await document.exitFullscreen();return;}
 try{
  if(!work.requestFullscreen)throw new Error('Fullscreen unavailable');
  await work.requestFullscreen();
 }catch{fallbackScreen=true;}
 syncFullscreen();
});
document.addEventListener('fullscreenchange',syncFullscreen);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&fallbackScreen)closeFallback();});
select(1);
