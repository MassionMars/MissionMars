(function(){
if(typeof INFO==="undefined")return;
const S={
en:{db:"Database",photos:"{n} photos",quiz:"Mini quiz",fig:"PHOTO",see:"What you see",topic:"Topic",nasa:"NASA source",partner:"Partner image",next:"Next",back:"Back",toQuiz:"To the quiz",didyou:"Did you know?",pick:"Choose an answer",right:"Correct!",wrong:"Not quite.",finish:"Finish",done:"Topic complete!",nt:"Next topic",bc:"Back to the card",again:"Replay",close:"Close",hint:"Swipe or use the arrow keys",resR:"You got it right on the first try. Nice work!",resW:"Good try. Now you know the right answer.",resN:"You have seen every photo of this topic.",pn:"photos",lockH:"Locked: earn this card in Awards"},
ru:{db:"База данных",photos:"{n} фото",quiz:"Мини-викторина",fig:"ФОТО",see:"Что на снимке",topic:"Тема",nasa:"Источник NASA",partner:"Снимок партнёра",next:"Далее",back:"Назад",toQuiz:"К викторине",didyou:"А вы знали?",pick:"Выберите ответ",right:"Верно!",wrong:"Почти.",finish:"Завершить",done:"Тема пройдена!",nt:"Следующая тема",bc:"К карточке",again:"Ещё раз",close:"Закрыть",hint:"Листайте или используйте стрелки",resR:"Ответ верный с первой попытки. Отлично!",resW:"Хорошая попытка. Теперь вы знаете правильный ответ.",resN:"Вы посмотрели все снимки этой темы.",pn:"фото",lockH:"Закрыто: получи эту карточку в «Наградах»"},
tg:{db:"Пойгоҳи додаҳо",photos:"{n} акс",quiz:"Викторинаи хурд",fig:"АКС",see:"Дар акс чӣ аст",topic:"Мавзӯъ",nasa:"Манбаи NASA",partner:"Акси шарик",next:"Минбаъд",back:"Қафо",toQuiz:"Ба викторина",didyou:"Оё медонистед?",pick:"Ҷавобро интихоб кунед",right:"Дуруст!",wrong:"Қариб.",finish:"Анҷом",done:"Мавзӯъ гузашт!",nt:"Мавзӯи навбатӣ",bc:"Ба корт",again:"Боз як бор",close:"Пӯшидан",hint:"Варақ занед ё тирчаҳоро истифода баред",resR:"Ҷавоб аз бори аввал дуруст буд. Аъло!",resW:"Кӯшиши хуб. Акнун ҷавоби дурустро медонед.",resN:"Шумо ҳамаи аксҳои ин мавзӯъро дидед.",pn:"акс",lockH:"Баста: ин кортро дар «Мукофотҳо» гир"},
};
const t=()=>S[lang]||S.en;
const tr=o=>o?(typeof o==="string"?o:(o[lang]||o.en||"")):"";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const KEY="mm-vault";
const store=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(_){return{}}};
const mark=(c,v)=>{try{const s=store();s[c]=v;localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}};
const isDone=c=>!!store()[c];
const reduce=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
const ICON='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="14" height="12" rx="2"/><path d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4H20a1.5 1.5 0 0 1 1.5 1.5V15a1.5 1.5 0 0 1-1.5 1.5H17"/><circle cx="7.5" cy="11.5" r="1.5"/><path d="M3 17l4-3.5 3 2.5 3-2.5L17 17"/></svg>';

let root,stage,st=null,busy=false;

const unlocked=c=>!window.MMAlbum||MMAlbum.has(+c);
function photosOf(code){const d=INFO[code];return d?imgsFor(code,d.img).filter(x=>x&&x.src):[]}
function build(code){
  const d=INFO[code],M=(window.MEDIA||{})[code],steps=photosOf(code).map((im,i,a)=>({k:"ph",im,i,n:a.length}));
  if(tr(d.fact))steps.push({k:"fact"});
  if(M&&M.q)steps.push({k:"quiz"});
  steps.push({k:"end"});
  return steps}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

function make(){
  if(root)return;
  root=document.createElement("div");root.id="vault";root.setAttribute("aria-hidden","true");
  root.innerHTML='<div class="v-bg"></div><div class="v-wrap" role="dialog" aria-modal="true"><header class="v-top"></header><div class="v-prog"></div><div class="v-stage"></div><footer class="v-foot"></footer></div>';
  document.body.appendChild(root);
  stage=root.querySelector(".v-stage");
  root.addEventListener("click",onClick);
  let sx=0,sy=0,tracking=false;
  stage.addEventListener("touchstart",e=>{if(e.touches.length!==1)return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;tracking=!e.target.closest("button")},{passive:true});
  stage.addEventListener("touchend",e=>{if(!tracking)return;tracking=false;const c=e.changedTouches[0],dx=c.clientX-sx,dy=c.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)go(dx<0?1:-1)},{passive:true});
  addEventListener("keydown",e=>{
    if(!st)return;
    if(e.key==="Escape"){e.stopImmediatePropagation();e.preventDefault();close()}
    else if(e.key==="ArrowRight"){e.stopImmediatePropagation();go(1)}
    else if(e.key==="ArrowLeft"){e.stopImmediatePropagation();go(-1)}
  },true);
}

function header(){
  const d=INFO[st.code],T=t();
  root.querySelector(".v-top").innerHTML=`<button class="v-x" type="button" data-v="close" aria-label="${esc(T.close)}">✕</button><div class="v-ttl"><span class="v-ic">${esc(d.icon||"🔹")}</span><div><small>${esc(T.db)} · ${esc(st.code)}</small><b>${esc(tr(d.title))}</b></div></div>`;
  root.querySelector(".v-prog").innerHTML=st.steps.map((_,i)=>`<i class="${i<st.i?"on":i===st.i?"cur":""}"></i>`).join("")}

function footer(){
  const T=t(),s=st.steps[st.i],f=root.querySelector(".v-foot");
  if(s.k==="end"){f.style.display="none";return}
  f.style.display="";
  const nextStep=st.steps[st.i+1];
  let label=T.next,off=false;
  if(s.k==="quiz"){label=st.pick==null?T.pick:T.finish;off=st.pick==null}
  else if(nextStep&&nextStep.k==="quiz")label=T.toQuiz;
  else if(nextStep&&nextStep.k==="end")label=T.finish;
  f.innerHTML=`<button class="v-b" type="button" data-v="prev"${st.i===0?" disabled":""} aria-label="${esc(T.back)}">‹ ${esc(T.back)}</button><span class="v-cnt">${st.i+1} / ${st.steps.length-1}</span><button class="v-b primary" type="button" data-v="next"${off?" disabled":""}>${esc(label)} ›</button>`}

function badge(credit){return /NASA|JPL|GSFC|JSC|KSC|MSFC|GRC|ARC|SwRI|Caltech|MSSS|Dragon/i.test(credit||"")?t().nasa:t().partner}

function slideHTML(s){
  const d=INFO[st.code],M=(window.MEDIA||{})[st.code],T=t();
  if(s.k==="ph"){
    const im=s.im,cap=tr(im.cap),desc=tr(im.desc)||tr(d.text),cat=tr(d.cat);
    return `<div class="v-ph"><div class="v-bk"></div><img alt="${esc(cap)}" referrerpolicy="no-referrer"><i class="v-hud"></i><span class="v-fig">${esc(T.fig)} ${s.i+1}/${s.n}</span>${im.credit?`<span class="v-cr">© ${esc(im.credit)}</span>`:""}</div>
<div class="v-info"><div class="v-chips" style="--i:0"><span class="v-chip">${esc(d.icon||"🔹")} ${esc(tr(d.title))}</span>${cat?`<span class="v-chip">${esc(cat)}</span>`:""}<span class="v-chip nasa">🛰 ${esc(badge(im.credit))}</span></div>
<h3 class="v-h" style="--i:1">${esc(cap)}</h3><div class="v-l" style="--i:2">${esc(T.see)}</div><p class="v-d" style="--i:3">${esc(desc)}</p><div class="v-hint" style="--i:4">${esc(T.hint)}</div></div>`}
  if(s.k==="fact")return `<div class="v-bigic">${esc(d.icon||"💡")}</div><div class="v-info" style="align-items:center"><div class="v-l" style="--i:0">${esc(T.didyou)}</div><p class="v-fact" style="--i:1">${esc(tr(d.fact))}</p></div>`;
  if(s.k==="quiz"){
    const q=M.q;
    return `<div class="v-info"><div class="v-chips" style="--i:0"><span class="v-chip">🎮 ${esc(T.quiz)}</span><span class="v-chip">${esc(d.icon||"🔹")} ${esc(tr(d.title))}</span></div><h3 class="v-q" style="--i:1">${esc(tr(q[0]))}</h3><div class="v-opts">${st.order.map((oi,k)=>`<button class="v-o" type="button" data-v="opt" data-o="${oi}" style="--i:${k+2}"><b>${"ABC"[k]}</b><span>${esc(tr(q[1][oi]))}</span></button>`).join("")}</div><div class="v-fb"></div></div>`}
  const good=st.first===true,hasQ=!!(M&&M.q);
  return `<div class="v-medal"><span>${good?"⭐":"🏅"}</span></div><h3 style="margin:6px 0 0">${esc(T.done)}</h3><p>${esc(hasQ?(good?T.resR:T.resW):T.resN)}</p><div class="v-stats"><span>📷 ${photosOf(st.code).length} ${esc(T.pn)}</span>${hasQ?`<span>${good?"✅":"💡"} ${esc(T.quiz)}</span>`:""}</div><div class="v-btns"><button class="v-b primary" type="button" data-v="topic">${esc(T.nt)} ›</button><button class="v-b" type="button" data-v="again">↺ ${esc(T.again)}</button><button class="v-b" type="button" data-v="card">${esc(T.bc)}</button></div>`}

function render(dir){
  const s=st.steps[st.i],el=document.createElement("div");
  el.className="v-slide "+s.k+(dir?(dir>0?" in-r":" in-l"):"");
  el.innerHTML=slideHTML(s);
  const old=stage.querySelector(".v-slide:not(.gone)");
  if(old){old.classList.remove("in-r","in-l");old.classList.add("gone",dir>=0?"out-l":"out-r");if(!dir||reduce())old.remove();else setTimeout(()=>old.remove(),520)}
  stage.appendChild(el);
  if(s.k==="ph"){
    const im=el.querySelector("img"),bk=el.querySelector(".v-bk");
    im.addEventListener("error",()=>{if(!im.dataset.f){im.dataset.f=1;im.src="assets/placeholder.svg"}});
    im.src=s.im.src;bk.style.backgroundImage='url("'+s.im.src.replace(/"/g,"%22")+'")'}
  if(s.k==="quiz"&&st.pick!=null)paintQuiz(el,false);
  header();footer();
  const nb=root.querySelector(".v-b.primary");if(nb&&!nb.disabled)nb.focus({preventScroll:true})}

function paintQuiz(el,fresh){
  const M=window.MEDIA[st.code],T=t(),right=st.pick===M.q[2];
  el.querySelectorAll(".v-o").forEach(b=>{const o=+b.dataset.o;if(o===M.q[2])b.classList.add("ok");else if(o===st.pick)b.classList.add("no");else b.classList.add("dim")});
  el.querySelector(".v-opts").classList.add("locked");
  el.querySelector(".v-fb").innerHTML=`<div class="v-why"><b>${esc(right?T.right:T.wrong)}</b>${esc(tr(M.q[3]))}</div>`;
  if(fresh&&right)stars(el.querySelector(".v-o.ok"))}

function stars(from){
  const r=from.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  if(reduce())return;
  for(let i=0;i<14;i++){const s=document.createElement("span");s.className="v-star";s.textContent=["⭐","✨","🌟"][i%3];s.style.left=cx+"px";s.style.top=cy+"px";const a=Math.random()*6.28,d=60+Math.random()*110;s.style.setProperty("--dx",Math.cos(a)*d+"px");s.style.setProperty("--dy",Math.sin(a)*d-40+"px");document.body.appendChild(s);setTimeout(()=>s.remove(),1200)}}

function go(dir){
  if(!st||busy)return;
  const s=st.steps[st.i],ni=st.i+dir;
  if(ni<0||ni>=st.steps.length)return;
  if(dir>0&&s.k==="quiz"&&st.pick==null)return;
  st.i=ni;busy=true;setTimeout(()=>{busy=false},reduce()?30:480);
  if(st.steps[ni].k==="end"){
    mark(st.code,{ok:!!st.first,t:Date.now()});
    marks()}
  render(dir)}

function pickOpt(btn){
  const M=window.MEDIA[st.code];if(st.pick!=null)return;
  st.pick=+btn.dataset.o;if(st.first==null)st.first=st.pick===M.q[2];
  paintQuiz(stage.querySelector(".v-slide.quiz"),true);footer();
  const nb=root.querySelector(".v-b.primary");if(nb)nb.focus({preventScroll:true})}

function nextTopic(){
  const all=Object.keys(INFO).sort(),pool=all.filter(c=>photosOf(c).length&&unlocked(c));
  let i=pool.indexOf(st.code),n=pool[(i+1)%pool.length];
  if(typeof qrOpen==="function"||window.qrOpen)window.qrOpen(n);
  start(n,1)}

function start(code,dir){
  const d=INFO[code];
  st={code,steps:build(code),i:0,pick:null,first:null,order:shuffle([0,1,2])};
  root.style.setProperty("--tc",d.color||"#eaa45c");
  header();
  render(dir||0)}

function onClick(e){
  const b=e.target.closest("[data-v]");if(!b||!st)return;
  const a=b.dataset.v;
  if(a==="close"||a==="card")close();
  else if(a==="prev")go(-1);
  else if(a==="next")go(1);
  else if(a==="opt")pickOpt(b);
  else if(a==="topic")nextTopic();
  else if(a==="again"){st.i=0;st.pick=null;st.first=null;st.order=shuffle([0,1,2]);busy=true;setTimeout(()=>{busy=false},480);render(-1)}}

function open(code,from){
  if(!INFO[code]||!photosOf(code).length||!unlocked(code))return;
  make();
  const r=from&&from.getBoundingClientRect?from.getBoundingClientRect():null;
  root.style.setProperty("--ox",(r?r.left+r.width/2:innerWidth/2)+"px");
  root.style.setProperty("--oy",(r?r.top+r.height/2:innerHeight/2)+"px");
  stage.innerHTML="";
  start(code);
  root.classList.add("on");root.setAttribute("aria-hidden","false");
  document.documentElement.style.overflow="hidden";
  void root.offsetWidth;root.classList.add("open")}

function close(){
  if(!root||!st)return;
  st=null;root.classList.remove("open");root.setAttribute("aria-hidden","true");
  document.documentElement.style.overflow="";
  const fin=()=>{if(!st){root.classList.remove("on");stage.innerHTML=""}};
  if(reduce())fin();else setTimeout(fin,820)}

function marks(){
  document.querySelectorAll(".cc[data-c]").forEach(el=>el.classList.toggle("done",isDone(el.dataset.c)));
  document.querySelectorAll(".dbbtn[data-code]").forEach(el=>el.classList.toggle("done",isDone(el.dataset.code)))}

function refresh(){
  if(st&&root){header();footer();const old=stage.querySelector(".v-slide:not(.gone)");if(old){const s=st.steps[st.i],el=document.createElement("div");el.className="v-slide "+s.k;el.innerHTML=slideHTML(s);old.replaceWith(el);
    if(s.k==="ph"){const im=el.querySelector("img");im.src=s.im.src;el.querySelector(".v-bk").style.backgroundImage='url("'+s.im.src+'")'}
    if(s.k==="quiz"&&st.pick!=null)paintQuiz(el,false)}}
  marks()}

function button(code){
  const n=photosOf(code).length;if(!n)return"";
  const T=t();
  if(!unlocked(code))return `<button class="dbbtn locked" type="button" data-vault data-locked="1" data-code="${esc(code)}"><span class="dbi">🔒</span><span class="dbt"><b>${esc(T.db)}</b><small>${esc(T.lockH)}</small></span><span class="dbq">→</span></button>`;
  return `<button class="dbbtn${isDone(code)?" done":""}" type="button" data-vault data-code="${esc(code)}"><span class="dbi">${ICON}</span><span class="dbt"><b>${esc(T.db)}</b><small>${esc(T.photos.replace("{n}",n))} · ${esc(T.quiz)}</small></span><span class="dbq">▶</span></button>`}

setTimeout(marks,0);
window.MMVault={unlocked,open,refresh,button,done:isDone,count:c=>photosOf(c).length};
})();
