const LANGS=["en","ru","tg"];
const DEFAULT_LANG="en";
const names={en:"EN",ru:"RU",tg:"TJ"};
const PAGES=["home","about","inside","game","qr","album"];
let lang=DEFAULT_LANG,page="home";
const $=s=>document.querySelector(s);
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

let lite=false;
try{
  const qs=location.search,full=/[?&]full\b/.test(qs);
  if(full)localStorage.removeItem("mm-lite");
  else if(/[?&]lite\b/.test(qs)||localStorage.getItem("mm-lite")==="1")lite=true;
  if(!full&&!lite&&((navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)))lite=true;
}catch(_){}
if(lite)document.body.classList.add("lite");

let introFired=false;
function introOff(){
  document.body.classList.remove("intro-on");
  if(introFired)return;introFired=true;window.__tReady=performance.now();
  document.dispatchEvent(new Event("introdone"));
}

$("#langs").innerHTML=LANGS.map(k=>`<button data-l="${k}" translate="no" class="notranslate" lang="en">${names[k]}</button>`).join("");
$("#bar").innerHTML=PAGES.map(p=>`<button data-go="${p}"></button>`).join("");
(function(){const b=$("#bar"),set=()=>document.documentElement.style.setProperty("--bar-h",b.offsetHeight+"px");
  set();addEventListener("resize",set);addEventListener("orientationchange",()=>setTimeout(set,250));
  if(window.ResizeObserver)new ResizeObserver(set).observe(b)})();
function mediaHTML(i){
  const m=(typeof MEDIA!=="undefined"&&MEDIA[i])||[];if(!m.length)return'<div class="slot"><span>＋</span></div>';
  return'<div class="media">'+m.map(x=>x.type==="video"?`<video src="${x.src}" ${x.poster?`poster="${x.poster}"`:""} controls playsinline></video>`
   :x.type==="youtube"?`<iframe src="https://www.youtube.com/embed/${x.id}" allowfullscreen loading="lazy"></iframe>`
   :`<img src="${x.src}" loading="lazy" alt="">`).join("")+"</div>"}
const KEEP=[1,2,3,6]; /* Story, Rules, Cards, QR code: the other tabs (video, interface, photos) were removed */
$("#secs").innerHTML=KEEP.map(i=>`<div class="sec rv" id="s${i}"><h2></h2><p class="txt"></p>${mediaHTML(i)}</div>`).join("");
$("#chips").innerHTML=KEEP.map(i=>`<button class="chip" data-to="s${i}"></button>`).join("");
const AI=["Claude","Gemini","ChatGPT"],AIC=["#eaa45c","#5aa9e6","#6cc070"];
$("#a-ai").innerHTML=AI.map((n,i)=>`<div class="ab rv aic" style="--k:${i};border-left-color:${AIC[i]}"><b></b><span></span></div>`).join("");
function renderAbout(d){
  const t=d.a;["hi","p1","p2","p3","lead","p4","end"].forEach(k=>$("#a-"+k).textContent=t[k]);
  $("#a-next").textContent=t.next;
  document.querySelectorAll("#a-ai .aic").forEach((el,i)=>{el.firstChild.textContent=AI[i];el.firstChild.style.color=AIC[i];el.lastChild.textContent=t.ai[i]});
}
function render(){render0();document.dispatchEvent(new Event("mmlang"))}
function render0(){
  const d=L[lang];document.documentElement.lang=lang;window.__mmLang=lang;renderAbout(d);if(window.qrRender)qrRender();if(window.gameRender)gameRender();
  document.querySelectorAll("[data-t]").forEach(e=>e.textContent=d[e.dataset.t]);
  document.querySelectorAll("#tokens .nm").forEach((e,i)=>e.textContent=d.res[i]);
  document.querySelectorAll("#langs button").forEach(b=>{b.classList.toggle("on",b.dataset.l===lang);b.setAttribute("aria-pressed",b.dataset.l===lang)});
  document.querySelectorAll("#bar button").forEach((b,i)=>{b.textContent=d.n[i];b.classList.toggle("on",PAGES[i]===page);if(PAGES[i]===page)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  document.querySelectorAll("#secs h2").forEach((h,i)=>h.textContent=d.s[KEEP[i]]);
  document.querySelectorAll("#secs .txt").forEach((p,i)=>p.textContent=(d.body&&d.body[KEEP[i]])||"");
  document.querySelectorAll("#chips .chip").forEach((c,i)=>c.textContent=d.s[KEEP[i]]);
  if(window.MMX&&MMX.labels)MMX.labels();
}

function go(p){
  if(window.qrLeave)qrLeave(p);
  if(window.gameLeave)gameLeave(p);
  page=p;document.body.dataset.page=p;document.body.classList.toggle("nothome",p!=="home");
  document.querySelectorAll(".page").forEach(e=>e.classList.toggle("on",e.id==="p-"+p));
  window.scrollTo(0,0);render();observe();progress();
  if(p==="home")homeIn();if(p==="qr"&&window.qrEnter)qrEnter();if(p==="album"&&window.albumEnter)albumEnter();if(p==="game"&&window.gameEnter)gameEnter();
}
let io;function observe(){
  io&&io.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll(".page.on .rv").forEach(e=>{e.classList.remove("in");io.observe(e)});
}
let prq=0;
function progress(){if(prq)return;prq=requestAnimationFrame(()=>{prq=0;const h=document.documentElement.scrollHeight-innerHeight;$("#prog").style.transform="scaleX("+(h>0?Math.min(1,scrollY/h):0).toFixed(4)+")"})}
addEventListener("scroll",progress,{passive:true});

function play(el,c){el.classList.remove("jelly","drop","flip");void el.offsetWidth;el.classList.add(c)}
function burst(x,y,set){
  if(reduce||lite)return;
  const ring=document.createElement("i");ring.className="tapr";ring.style.left=x+"px";ring.style.top=y+"px";
  document.body.appendChild(ring);ring.addEventListener("animationend",()=>ring.remove());
  for(let i=0;i<10;i++){
    const p=document.createElement("div");p.className="fp";p.textContent=set[i%set.length];document.body.appendChild(p);
    const a=Math.random()*Math.PI*2,v=60+Math.random()*110,dx=Math.cos(a)*v,dy=Math.sin(a)*v-60;
    p.animate([{transform:`translate(${x}px,${y}px) scale(1)`,opacity:1},
      {transform:`translate(${x+dx}px,${y+dy}px) rotate(${Math.random()*360}deg) scale(1.2)`,opacity:1,offset:.5},
      {transform:`translate(${x+dx*1.2}px,${y+dy+240}px) rotate(${Math.random()*720}deg) scale(.4)`,opacity:0}],
      {duration:900+Math.random()*500,easing:"ease-out"}).onfinish=()=>p.remove();
  }
}
function fadeMain(){const m=$("main");m.classList.remove("lsw");void m.offsetWidth;m.classList.add("lsw")}
document.addEventListener("click",e=>{
  if(e.target.closest("#h1")){jumpTitle();return}
  const rs=e.target.closest(".res");if(rs){replayRes(rs);return}
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.l){lang=b.dataset.l;try{localStorage.setItem("mm-lang3",lang)}catch(_){}fadeMain();render();play(b,"flip");burst(e.clientX,e.clientY,["🌍","✨","💬"]);return}
  if(b.classList.contains("cta")){play(b,"drop");burst(e.clientX,e.clientY,["🔴","🪨","✨","🚀"]);setTimeout(()=>go(b.dataset.go),700);return}
  if(b.dataset.go){go(b.dataset.go);const n=$(`#bar [data-go="${b.dataset.go}"]`);play(n,"jelly");burst(e.clientX,e.clientY,["⭐","🔴","✨"]);return}
  if(b.dataset.to){play(b,"jelly");burst(e.clientX,e.clientY,["⭐","✨"]);$("#"+b.dataset.to).scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})}
});
try{const s=localStorage.getItem("mm-lang3");if(s&&L[s])lang=s}catch(_){}

function* marsGen(cv){
  const N=512,off=document.createElement("canvas");off.width=off.height=N;
  const g=off.getContext("2d"),img=g.createImageData(N,N),D=img.data;
  const mk=n=>{const a=new Float32Array(n*(n+1));for(let i=0;i<a.length;i++)a[i]=Math.random();return{n,a}};
  const oct=[[mk(4),.5],[mk(8),.27],[mk(16),.15],[mk(32),.08]];
  const nz=(o,x,y)=>{const u=x/N*o.n,v=y/N*o.n,x0=Math.floor(u),y0=Math.floor(v),fx=u-x0,fy=v-y0,a=fx*fx*(3-2*fx),b=fy*fy*(3-2*fy),G=(i,j)=>o.a[j*o.n+(i%o.n)];
    return G(x0,y0)*(1-a)*(1-b)+G(x0+1,y0)*a*(1-b)+G(x0,y0+1)*(1-a)*b+G(x0+1,y0+1)*a*b};
  const f=new Float32Array(N*N);
  for(let y=0;y<N;y++){for(let x=0;x<N;x++){let v=0;for(const [o,w] of oct)v+=w*nz(o,x,y);f[y*N+x]=v}if((y&15)===15)yield}
  for(let n=0;n<150;n++){const cx=Math.random()*N,cy=30+Math.random()*(N-60),r=2+Math.pow(Math.random(),2.4)*16,R=Math.ceil(r*1.3);
    for(let y=-R;y<=R;y++)for(let x=-R;x<=R;x++){const d=Math.hypot(x,y)/r;if(d>1.3)continue;const xi=(((cx+x)|0)%N+N)%N,yi=(cy+y)|0;if(yi<0||yi>=N)continue;
      f[yi*N+xi]+=d<.88?-.08*(1-d*.3):.07*Math.max(0,1-Math.abs(d-1)*4)}
    if(n%10===9)yield}
  const st=[[0,78,42,32],[.35,128,68,44],[.55,176,98,58],[.8,204,140,92],[1,220,164,114]];
  const col=v=>{v=Math.max(0,Math.min(1,v));let k=0;while(k<st.length-2&&v>st[k+1][0])k++;const a=st[k],b=st[k+1],t=(v-a[0])/(b[0]-a[0]);return[a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t]};
  for(let y=0;y<N;y++){const lat=Math.abs(y/N-.5)*2;for(let x=0;x<N;x++){const i=y*N+x,c=col((f[i]-.2)*1.7);
    const cap=0;
    D[i*4]=c[0]*(1-cap)+240*cap;D[i*4+1]=c[1]*(1-cap)+238*cap;D[i*4+2]=c[2]*(1-cap)+236*cap;D[i*4+3]=255}
    if((y&31)===31)yield}
  g.putImageData(img,0,0);const c2=cv.getContext("2d");c2.drawImage(off,0,0);c2.drawImage(off,N,0);
}
function runSliced(gen,cb){
  const idle=window.requestIdleCallback||(fn=>setTimeout(fn,16));
  (function step(){const t0=performance.now();let r;do{r=gen.next()}while(!r.done&&performance.now()-t0<5);
    if(r.done){cb&&cb();return}idle(step,{timeout:250})})();
}


const RES=[
 {v:80,c:"#ff6b81",svg:'<svg viewBox="0 0 32 32"><defs><linearGradient id="rgl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3be"/><stop offset=".5" stop-color="#ff4d6a"/><stop offset="1" stop-color="#c81e43"/></linearGradient></defs><g class="hrt"><path d="M16 28.5C4 19.5 3 10.5 9 7.4c4-2 7 .8 7 3 0-2.200 3-5 7-3 6 3.100 5 12.100-7 21.100Z" fill="url(#rgl)" stroke="#231815" stroke-width="2" stroke-linejoin="round"/><path d="M9.500 11.500c.8-2 3-2.300 4.200-1" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"/></g><path class="pls" d="M2 17h6l2-4 3 8 2.500-6 1.500 2H22" fill="none" stroke="#fff" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round" opacity=".0"/></svg>'},
 {v:60,c:"#ffd24a",svg:'<svg viewBox="0 0 32 32"><defs><linearGradient id="rge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset=".5" stop-color="#ffd21f"/><stop offset="1" stop-color="#ff9a1a"/></linearGradient></defs><path class="bolt" d="M19 2 6.500 18.500h7.500L12 30l14-18.500h-8Z" fill="url(#rge)" stroke="#231815" stroke-width="2" stroke-linejoin="round"/><path d="M17 5.500 10 15.500" stroke="#fff" stroke-width="1.800" stroke-linecap="round" opacity=".8"/><g class="spk" stroke="#fff3b0" stroke-width="1.600" stroke-linecap="round"><path d="M3.500 8l3 2"/><path d="M27 20l2.500 1.500"/><path d="M5 26l2.500-1"/></g></svg>'},
 {v:70,c:"#4aa8ff",svg:'<svg viewBox="0 0 32 32"><defs><linearGradient id="rgs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9dcff"/><stop offset=".55" stop-color="#3d8bff"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient><clipPath id="rgc"><path d="M16 2.500 27 6.500v8.500c0 7-5 12-11 15C10 27 5 22 5 15V6.500Z"/></clipPath></defs><path d="M16 2.500 27 6.500v8.500c0 7-5 12-11 15C10 27 5 22 5 15V6.500Z" fill="url(#rgs)" stroke="#231815" stroke-width="2" stroke-linejoin="round"/><g clip-path="url(#rgc)"><path class="shn" d="M5-2h7l-9 36H-4Z" fill="#fff" opacity=".5"/></g><path d="M16 9.500v12.500M10 15.500h12" stroke="#fff" stroke-width="2.800" stroke-linecap="round"/></svg>'}
];
const SPK=[0,1,2,3,4,5].map(k=>`<i class="sp" style="--a:${k*60+15}deg"></i>`).join("");
$("#h1").innerHTML=["MISSION","MARS"].map((w,k)=>'<span class="w">'+[...w].map((ch,i)=>`<span class="ch" style="--i:${i+k*7}">${ch}</span>`).join("")+"</span>").join("");
$("#tokens").innerHTML=RES.map(r=>`<div class="res" style="--c:${r.c}"><div class="ring"><svg class="rs" viewBox="0 0 80 80"><circle class="bgc" cx="40" cy="40" r="34"/><circle class="fgc" cx="40" cy="40" r="34"/></svg><div class="hd"></div>${SPK}<div class="ico">${r.svg}</div></div><div class="num">0%</div><div class="nm"></div></div>`).join("");

const TCOL=["#ff6b81","#ffd24a","#4aa8ff"];let tci=0;
function setTitleColor(i){tci=i%TCOL.length;$("#h1").style.setProperty("--tc",TCOL[tci])}
setTitleColor(0);
if(!reduce)setInterval(()=>{if(page==="home"&&!document.hidden&&!document.body.classList.contains("intro-on"))setTitleColor(tci+1)},3800);
function jumpTitle(){
  if(reduce||!$("#hero").classList.contains("go"))return;
  setTitleColor(tci+1);
  document.querySelectorAll("#h1 .ch").forEach((el,i)=>el.animate([{transform:"translateY(0) scale(1)"},{transform:"translateY(-26px) scale(1.18) rotate(-4deg)"},{transform:"translateY(0) scale(1)"}],{duration:560,delay:i*40,easing:"cubic-bezier(.3,1.5,.5,1)"}));
}
function replayRes(el){if(!el.classList.contains("pop"))return;el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop")}

let hRun=0,hT=[];
function homeIn(){
  const hero=$("#hero"),run=++hRun;hT.forEach(clearTimeout);hT=[];
  hero.classList.remove("go");void hero.offsetWidth;hero.classList.add("go");
  const els=[...document.querySelectorAll("#tokens .res")];
  els.forEach(e=>{e.classList.remove("pop");e.querySelector(".num").textContent="0%";e.querySelector(".fgc").style.strokeDashoffset=213.6;const h=e.querySelector(".hd");h.style.opacity=0;h.style.transform="rotate(0deg)"});
  els.forEach((el,i)=>{
    const num=el.querySelector(".num"),arc=el.querySelector(".fgc"),hd=el.querySelector(".hd"),V=RES[i].v;
    const fin=()=>{num.textContent=V+"%";arc.style.strokeDashoffset=213.6*(1-V/100);hd.style.opacity=0;el.classList.add("pop")};
    if(reduce){fin();return}
    hT.push(setTimeout(()=>{const t0=performance.now();hd.style.opacity=1;
      (function f(n){if(run!==hRun)return;const k=Math.min(1,(n-t0)/1500),e=1-Math.pow(1-k,3);
        num.textContent=Math.round(V*e)+"%";arc.style.strokeDashoffset=213.6*(1-V/100*e);hd.style.transform="rotate("+(3.6*V*e).toFixed(1)+"deg)";
        if(k<1)requestAnimationFrame(f);else fin()})(t0)},1700+i*320))});
}
document.addEventListener("introdone",()=>homeIn());
if(!document.getElementById("intro"))introOff();
setTimeout(()=>{const o=document.getElementById("intro");if(o){o.remove()}introOff();if(!$("#hero").classList.contains("go"))homeIn()},26000);
const plEl=$(".pl");let pq=0,px_=0,py_=0;
addEventListener("pointermove",e=>{
  if(page!=="home"||document.body.classList.contains("intro-on"))return;
  px_=(e.clientX/innerWidth-.5)*2;py_=(e.clientY/innerHeight-.5)*2;if(pq)return;
  pq=requestAnimationFrame(()=>{pq=0;plEl.style.transform=`translate3d(${(-px_*16).toFixed(1)}px,${(-py_*12).toFixed(1)}px,0)`})},{passive:true});

render();observe();

/* v6: stop animations while the tab is hidden */
document.addEventListener("visibilitychange",function(){try{document.documentElement.classList.toggle("mm-idle",document.hidden)}catch(e){}});
