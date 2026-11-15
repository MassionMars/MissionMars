(function(){
const HUE={"Space weather":52,"Mars":30,"Life support":150,"Moon & Artemis":275,"People & training":195,"Images & telescopes":245,"Power & tech":88},hue=d=>HUE[d&&d.cat&&d.cat.en]??40;
const root=document.getElementById("p-qr"),sheet=document.getElementById("sheet");
if(!root||typeof INFO==="undefined")return;
const $=s=>root.querySelector(s);
const C=()=>L[lang].c,tr=o=>o?(typeof o==="string"?o:(o[lang]||o.en||o.ru||"")):"";
const allCodes=()=>Object.keys(INFO).sort();
let curCat=null;
const codes=()=>allCodes().filter(k=>!curCat||INFO[k].cat&&INFO[k].cat.en===curCat);
const GX=()=>(typeof GT!=="undefined"&&(GT[lang]||GT.en))||{q:{},b:{},e:{}};
const fm=(s,o)=>String(s).replace(/\{(\w+)\}/g,(_,k)=>o[k]);
const pass=()=>{try{const a=JSON.parse(localStorage.getItem("mm-passport")||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}};
const addPass=c=>{try{const a=pass();if(!a.includes(c)){a.push(c);localStorage.setItem("mm-passport",JSON.stringify(a))}}catch(_){}};
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const base=()=>(typeof SITE_URL==="string"&&SITE_URL)||location.href.split("#")[0].split("?")[0];
let mode=(matchMedia("(pointer:coarse)").matches&&navigator.maxTouchPoints>0)?"phone":"desk",cur=null;
const QRU=[]; /* QR drawing is bundled in assets/vendor/qrcode.js, no network needed */let QP=null;
function loadQR(){if(window.QRCode)return Promise.resolve();if(QP)return QP;
  const one=i=>new Promise((ok,no)=>{if(i>=QRU.length)return no();const s=document.createElement("script");s.src=QRU[i];s.onload=()=>window.QRCode?ok():one(i+1).then(ok,no);s.onerror=()=>one(i+1).then(ok,no);document.head.appendChild(s)});
  return QP=one(0).catch(e=>{QP=null;throw e})}
root.innerHTML=`
<h1 class="ptitle" id="c-t"></h1>
<p class="txt" id="c-lead"></p>
<div class="pass" id="pass"></div>
<div class="qf" id="qf"></div>
<div class="seg"><button data-m="phone" id="c-mp"></button><button data-m="desk" id="c-md"></button></div>
<div id="pane-phone">
  <div class="scanbox" id="scanbox">
    <i class="cr tl"></i><i class="cr tr"></i><i class="cr bl"></i><i class="cr br"></i><i class="ln"></i>
    <div class="idle"><span>📷</span><button class="btn" id="camBtn" type="button"></button></div>
    <div class="soon" id="soon" hidden role="status"><span>⏳</span><p id="soon-t"></p><p class="s2" id="soon-2"></p><button class="btn ghost" id="soonOk" type="button"></button></div>
  </div>
</div>
<div id="pane-desk">
  <p class="st" id="c-dh"></p>
  <div class="carw"><button class="arr" id="prev" type="button" aria-label="←">‹</button><div class="car" id="car"></div><button class="arr" id="next" type="button" aria-label="→">›</button></div>
  <div class="dots" id="dots"></div>
</div>
<form class="codef" id="codeForm" autocomplete="off"><label for="code" id="c-enter"></label>
  <div class="inrow"><input id="code" inputmode="numeric" maxlength="3" placeholder="000" aria-describedby="c-msg"><button class="btn" id="c-open" type="submit"></button></div>
  <p class="st" id="c-msg" role="status"></p></form>`;
const soon=$("#soon");
$("#camBtn").onclick=()=>{soon.hidden=false};
$("#soonOk").onclick=()=>{soon.hidden=true};
const qrText=code=>base()+"#info="+code;
async function drawQR(el,code,size){if(el.dataset.done)return;
  try{await loadQR();el.innerHTML="";new QRCode(el,{text:qrText(code),width:size,height:size,colorDark:"#12080f",colorLight:"#f4e7d4",correctLevel:QRCode.CorrectLevel.M});el.dataset.done=1}catch(e){el.textContent="QR"}}
function drawAll(){root.querySelectorAll(".qr").forEach(el=>drawQR(el,el.dataset.q,92))}
let built=false;
function updCar(){const c=C();$("#car").querySelectorAll(".cc").forEach(el=>{const d=INFO[el.dataset.c];el.querySelector("h3").textContent=tr(d.title);el.querySelector(".cl").textContent=c.code;el.querySelector(".ql").textContent=c.qr})}
function buildCar(){if(built){updCar();return}built=true;const car=$("#car"),c=C();
  car.innerHTML=codes().map(k=>{const d=INFO[k];return`<div class="cc${pass().includes(k)?" seen":""}${window.MMVault&&MMVault.done(k)?" done":""}" tabindex="0" role="button" data-c="${esc(k)}" style="--tc:${esc(d.color||"#eaa45c")};--h:${hue(d)}"><div class="ci">${esc(d.icon||"🔹")}</div><h3>${esc(tr(d.title))}</h3><div class="cn">${esc(k)}</div><div class="cl">${esc(c.code)}</div><div class="qr" data-q="${esc(k)}"></div><div class="ql">${esc(c.qr)}</div></div>`}).join("");
  $("#dots").innerHTML=codes().map((_,i)=>`<i data-i="${i}"></i>`).join("");
  if(mode==="desk")drawAll();fx()}
let fxq=0;
function fx(){cancelAnimationFrame(fxq);fxq=requestAnimationFrame(()=>{const car=$("#car");if(!car||!car.clientWidth)return;const mid=car.scrollLeft+car.clientWidth/2;let bi=0,bd=1e9;
  car.querySelectorAll(".cc").forEach((el,i)=>{const cc=el.offsetLeft+el.offsetWidth/2,d=cc-mid,k=Math.min(1,Math.abs(d)/car.clientWidth);el.style.transform=`scale(${1-.16*k}) rotateY(${(d<0?1:-1)*k*22}deg)`;el.style.opacity=1-.5*k;if(Math.abs(d)<bd){bd=Math.abs(d);bi=i}});
  $("#dots").querySelectorAll("i").forEach((e,i)=>e.classList.toggle("on",i===bi))})}
function step(dir){const car=$("#car"),el=car.querySelector(".cc");if(!el)return;car.scrollBy({left:dir*(el.offsetWidth+14),behavior:"smooth"})}
$("#car").addEventListener("scroll",fx,{passive:true});
$("#prev").onclick=()=>step(-1);$("#next").onclick=()=>step(1);
$("#car").addEventListener("click",e=>{const c=e.target.closest(".cc");if(c)openInfo(c.dataset.c)});
$("#car").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){const c=e.target.closest(".cc");if(c){e.preventDefault();openInfo(c.dataset.c)}}});
$("#dots").addEventListener("click",e=>{const i=e.target.dataset.i;if(i==null)return;const el=$("#car").querySelectorAll(".cc")[i];if(el)$("#car").scrollTo({left:el.offsetLeft-($("#car").clientWidth-el.offsetWidth)/2,behavior:"smooth"})});
addEventListener("keydown",e=>{if(!root.classList.contains("on"))return;
  if(e.key==="Escape"&&!sheet.hidden){closeSheet();return}
  if(sheet.hidden&&mode==="desk"&&document.activeElement.tagName!=="INPUT"){if(e.key==="ArrowRight")step(1);if(e.key==="ArrowLeft")step(-1)}
  if(!sheet.hidden){if(e.key==="ArrowRight")nav(1);if(e.key==="ArrowLeft")nav(-1)}});
const trl=o=>o?(Array.isArray(o)?o:(o[lang]||o.en||o.ru||[])):[];
function fill(code){const d=INFO[code],c=C(),list=codes(),idx=list.indexOf(code),col=d.color||"#eaa45c";
  const text=tr(d.text),fact=tr(d.fact),pts=trl(d.points),cat=tr(d.cat),srcs=[].concat(d.source||[]).filter(s=>s&&/^https?:\/\//i.test(s.url));
  const ims=imgsFor(code,d.img),im=ims[0],cap=im?tr(im.cap):"";
  sheet.innerHTML=`<div class="sh-bg" data-x></div><article class="sh" style="--tc:${esc(col)};--h:${hue(d)}" role="dialog" aria-modal="true"><button class="x" data-x type="button" aria-label="${esc(c.close)}">✕</button>
  <div class="sh-top"><span class="sh-i">${esc(d.icon||"🔹")}</span><div><div class="tag">${esc(c.qr)} · ${esc(c.code)} ${esc(code)}${cat?" · "+esc(cat):""}</div><h2>${esc(tr(d.title))}</h2></div></div>
  ${window.MMVault?MMVault.button(code):""}
  ${im&&im.src?`<figure class="sh-fig"><img class="sh-img" src="${esc(im.src)}" alt="${esc(cap)}" loading="lazy" referrerpolicy="no-referrer">${cap||im.credit?`<figcaption>${esc(cap)}${im.credit?` <span>© ${esc(im.credit)}</span>`:""}</figcaption>`:""}</figure>`:""}
  ${ims.length>1?`<div class="sh-gal">${ims.slice(1).map(x=>`<img src="${esc(x.src)}" alt="${esc(tr(x.cap))}" loading="lazy">`).join("")}</div>`:""}
  <div class="whatl">${esc(c.what)}</div><div class="sh-body">${text?esc(text):`<span class="emp">${esc(c.empty)}</span>`}</div>
  ${pts.length?`<ul class="pts">${pts.map(p=>`<li>${esc(p)}</li>`).join("")}</ul>`:""}
  ${fact?`<div class="fact"><b>${esc(c.fact)}</b>${esc(fact)}</div>`:""}
  <div class="sh-nav"><button type="button" data-n="-1" aria-label="←">‹</button><span>${idx+1} / ${list.length}</span><button type="button" data-n="1" aria-label="→">›</button></div>
  ${srcs.length?`<div class="src"><span>${esc(c.src)}:</span>${srcs.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.url)} ↗</a>`).join("")}</div>`:""}</article>`;
  const f=sheet.querySelector(".sh-fig img");if(f)f.addEventListener("error",()=>{if(!f.dataset.ph){f.dataset.ph=1;f.src="assets/placeholder.svg";return}const g=f.closest(".sh-fig");if(g)g.classList.add("off")})}
function openInfo(code){if(!INFO[code])return false;const was=!sheet.hidden;cur=code;addPass(code);fill(code);updPass();sheet.hidden=false;
  if(!was){sheet.classList.remove("on");void sheet.offsetWidth}
  sheet.classList.add("on");
  try{history.replaceState(null,"","#info="+code)}catch(e){}return true}
function closeSheet(){sheet.classList.remove("on");setTimeout(()=>{if(!sheet.classList.contains("on")){sheet.hidden=true;sheet.innerHTML=""}},250);cur=null;try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}
function nav(d){let l=codes();if(!l.includes(cur))l=allCodes();let i=l.indexOf(cur)+d;i=(i+l.length)%l.length;openInfo(l[i])}
sheet.addEventListener("click",e=>{const vb=e.target.closest("[data-vault]");if(vb&&window.MMVault){MMVault.open(vb.dataset.code,vb);return}if(e.target.closest("[data-x]"))closeSheet();const n=e.target.closest("[data-n]");if(n)nav(+n.dataset.n)});
const msg=(t,bad)=>{const m=$("#c-msg");m.textContent=t||"";m.classList.toggle("bad",!!bad);if(bad){const i=$("#code");i.classList.remove("shake");void i.offsetWidth;i.classList.add("shake")}};
function tryCode(v){v=v.trim();if(INFO[v]){msg("");$("#code").value="";return openInfo(v)}msg(C().bad,true);return false}
$("#codeForm").addEventListener("submit",e=>{e.preventDefault();tryCode($("#code").value)});
$("#code").addEventListener("input",e=>{e.target.value=e.target.value.replace(/[^0-9A-Za-z]/g,"").slice(0,3);msg("");if(e.target.value.length===3)tryCode(e.target.value)});
function setMode(m){mode=m;$("#pane-phone").hidden=m!=="phone";$("#pane-desk").hidden=m!=="desk";soon.hidden=true;
  root.querySelectorAll(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));if(m==="desk"){drawAll();fx()}}
root.querySelector(".seg").addEventListener("click",e=>{const b=e.target.closest("button");if(b)setMode(b.dataset.m)});
function updPass(){const g=GX().q||{},p=$("#pass");if(!p||!g.pass)return;const n=pass().filter(c=>INFO[c]).length,m=allCodes().length;
  p.innerHTML=`<div class="pt"><b>🛂 ${esc(g.pass)}</b><span>${esc(fm(g.passOf,{n,m}))}</span></div><div class="pb"><i style="width:${(n/m*100).toFixed(1)}%"></i></div>`;
  root.querySelectorAll(".cc").forEach(el=>el.classList.toggle("seen",pass().includes(el.dataset.c)))}
function buildFilter(){const g=GX().q||{},f=$("#qf");if(!f)return;const cats=[];allCodes().forEach(k=>{const c=INFO[k].cat;if(c&&!cats.find(x=>x.en===c.en))cats.push(c)});
  f.innerHTML=`<button type="button" class="chip${curCat?"":" on"}" data-cat="">${esc(g.all||"All")}</button>`+cats.map(c=>`<button type="button" class="chip${curCat===c.en?" on":""}" data-cat="${esc(c.en)}" style="--h:${HUE[c.en]??40}">${esc(c[lang]||c.en)}</button>`).join("")}
$("#qf").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;curCat=b.dataset.cat||null;built=false;buildCar();buildFilter();$("#car").scrollLeft=0;fx()});
window.qrOpen=c=>{if(INFO[c])openInfo(c)};
window.qrRender=function(){const c=C();
  $("#c-t").textContent=c.t;$("#c-lead").textContent=c.lead;$("#c-mp").textContent="📱 "+c.mP;$("#c-md").textContent="💻 "+c.mD;
  $("#camBtn").textContent=c.cam;$("#soon-t").textContent=c.soon;$("#soon-2").textContent=c.soon2;$("#soonOk").textContent=c.soonOk;
  $("#c-dh").textContent=c.deskHint;$("#c-enter").textContent=c.enter;$("#c-open").textContent=c.open;msg("");
  buildFilter();buildCar();updPass();if(cur&&!sheet.hidden)fill(cur);if(window.MMVault)MMVault.refresh()};
window.qrEnter=()=>setMode(mode);
window.qrLeave=p=>{if(p!=="qr")soon.hidden=true};
qrRender();setMode(mode);
const fromHash=()=>{const m=location.hash.match(/info=([\w-]+)/i);return m&&INFO[m[1]]?m[1]:null};
const dl=fromHash();
if(dl){const io=document.getElementById("intro");if(io)io.remove();introOff();setTimeout(()=>{go("qr");openInfo(dl)},0)}
addEventListener("hashchange",()=>{const c=fromHash();if(c&&c!==cur){go("qr");openInfo(c)}});
})();
document.addEventListener("mmlang",()=>{if(window.qrRender)qrRender()});
