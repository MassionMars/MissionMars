/* Game page of the site. The game itself is Mars Dune Alpha: a base hub plus the laboratory and the airlock
 * (site/dune/*.html), shown in one frame. The rooms share one state through dune/dune-bridge.js and report to this
 * page by postMessage: finished crises, mini-game results, restarts. Here live the things around the game:
 * the nickname, the 15-day base map and the records tables. In the one-file build the three pages are embedded as
 * strings (window.MM_DUNE_DOCS) and shown through srcdoc. */
(function(){
"use strict";
const ROOMS={day:"dune/day.html",hub:"dune/hub.html",lab:"dune/lab.html",airlock:"dune/airlock.html",rover:"dune/rover.html"};
const DAYS=15;
const T={
 en:{frame:"Mars Dune Alpha: the base game",full:"Full screen",exit:"Exit full screen",loading:"Loading the base…",ok:"OK",
  note:"Tip: on a phone, rotate the screen to landscape for the best view.",
  nick:"Nickname",nickEdit:"Change nickname",nickQ:"What is your name, astronaut?",nickHint:"Your name goes on the records board. Up to 14 characters.",nickGo:"Start the mission",nickPh:"Astro",
  map:"Base map",rec:"Records",day:"Day",dayOf:"Day {n} of 15",close:"Close",
  today:"Today’s task",go:"Go there",done:"Done!",locked:"Locked",star:"Star for the planned task",
  room:{1:"Greenhouse",2:"Medbay",3:"Laboratory",4:"Airlock"},crisis:"Crisis",
  mapTip:"Win any mini-game to finish the day. Solve the planned crisis to earn a ⭐.",
  toast:"Day {n} complete!",toastStar:"Day {n} complete! ⭐",
  full_:"Full mission",mini_:"Mini-games",free:"free place for a record",rank:"#",player:"Player",pts:"Points",days:"Days",stars:"Stars",
  score:"score",left:"left",
  fin:"Mission complete!",finT:"You kept Dune Alpha alive for 15 days.",finS:"Your score",finR:"Your place",again:"Records",
  tab:["Full mission","Mini-games"],
  mini:{1:"Catch the drops",2:"Harvest the crop",3:"Vitamin mix",4:"Steady pulse",5:"Catch the wave",6:"Rover route",7:"Clean the panels",8:"Patch the hull",9:"Pipe watering",10:"Garden grid",11:"Heart rhythm",12:"Odd vial out",13:"Reactor: lights off",14:"Ice finder",15:"Hatch puzzle",16:"Airlock pressure"},
  cn:{"1A":"Drought in the beds","1B":"Burst irrigation pipe","2A":"Insomnia","2B":"Medical sensor glitch","3A":"DONKI flare warning","3B":"Martian ice","4A":"Sand on the panels","4B":"Airlock pressure drop"}},
 ru:{frame:"Mars Dune Alpha: игра про базу",full:"На весь экран",exit:"Выйти из полноэкранного режима",loading:"Загружаем базу…",ok:"Понятно",
  note:"Подсказка: на телефоне переверни экран горизонтально — база будет видна лучше.",
  nick:"Ник",nickEdit:"Сменить ник",nickQ:"Как тебя зовут, астронавт?",nickHint:"Твоё имя попадёт в таблицу рекордов. До 14 символов.",nickGo:"Начать миссию",nickPh:"Астро",
  map:"Карта базы",rec:"Рекорды",day:"День",dayOf:"День {n} из 15",close:"Закрыть",
  today:"Задание дня",go:"Перейти",done:"Готово!",locked:"Закрыто",star:"Звезда за плановое задание",
  room:{1:"Теплица",2:"Медпункт",3:"Лаборатория",4:"Шлюз"},crisis:"Кризис",
  mapTip:"Выиграй любую мини-игру — день пройден. Реши кризис по плану — получишь ⭐.",
  toast:"День {n} пройден!",toastStar:"День {n} пройден! ⭐",
  full_:"Вся миссия",mini_:"Мини-игры",free:"свободное место для рекорда",rank:"№",player:"Игрок",pts:"Очки",days:"Дни",stars:"Звёзды",
  score:"счёт",left:"осталось",
  fin:"Миссия выполнена!",finT:"Ты сохранил базу Dune Alpha на все 15 дней.",finS:"Твой счёт",finR:"Твоё место",again:"Рекорды",
  tab:["Вся миссия","Мини-игры"],
  mini:{1:"Поймай капли",2:"Собери урожай",3:"Витаминный микс",4:"Пульс в норме",5:"Поймай волну",6:"Маршрут ровера",7:"Очистка панелей",8:"Залатай обшивку",9:"Полив по трубам",10:"Грядки по схеме",11:"Ритм сердца",12:"Лишняя ампула",13:"Реактор: погаси огни",14:"Поиск льда",15:"Люк шлюза",16:"Давление в шлюзе"},
  cn:{"1A":"Засуха в грядках","1B":"Лопнула труба полива","2A":"Бессонница","2B":"Сбой медицинских датчиков","3A":"Вспышка DONKI","3B":"Марсианский лёд","4A":"Песок на панелях","4B":"Падение давления в шлюзе"}},
 tg:{frame:"Mars Dune Alpha: бозии база",full:"Экрани пурра",exit:"Баромадан аз экрани пурра",loading:"База бор мешавад…",ok:"Фаҳмо",
  note:"Маслиҳат: дар телефон экранро уфуқӣ гардонед.",
  nick:"Ном",nickEdit:"Тағйири ном",nickQ:"Номи ту чист, кайҳоннавард?",nickHint:"Номи ту ба ҷадвали рекордҳо меафтад. То 14 аломат.",nickGo:"Оғози миссия",nickPh:"Астро",
  map:"Харитаи база",rec:"Рекордҳо",day:"Рӯз",dayOf:"Рӯзи {n} аз 15",close:"Пӯшидан",
  today:"Вазифаи рӯз",go:"Рафтан",done:"Тайёр!",locked:"Баста",star:"Ситора барои вазифаи нақшавӣ",
  room:{1:"Гармхона",2:"Пункти тиббӣ",3:"Озмоишгоҳ",4:"Шлюз"},crisis:"Бӯҳрон",
  mapTip:"Ягон бозии хурдро бибар — рӯз гузашт. Бӯҳронро аз рӯи нақша ҳал кун — ⭐ мегирӣ.",
  toast:"Рӯзи {n} гузашт!",toastStar:"Рӯзи {n} гузашт! ⭐",
  full_:"Тамоми миссия",mini_:"Бозиҳои хурд",free:"ҷои холӣ барои рекорд",rank:"№",player:"Бозигар",pts:"Холҳо",days:"Рӯзҳо",stars:"Ситораҳо",
  score:"ҳисоб",left:"монд",
  fin:"Миссия иҷро шуд!",finT:"Ту базаи Dune Alpha-ро 15 рӯз нигоҳ доштӣ.",finS:"Ҳисоби ту",finR:"Ҷои ту",again:"Рекордҳо",
  tab:["Тамоми миссия","Бозиҳои хурд"],
  mini:{1:"Қатраҳоро бигир",2:"Ҳосилро ҷамъ кун",3:"Омехтаи витаминҳо",4:"Набзи муътадил",5:"Мавҷро бигир",6:"Масири ровер",7:"Тоза кардани панелҳо",8:"Пуши ҷоро ҷой кун",9:"Обёрии қубурҳо",10:"Кортҳо аз рӯи нақша",11:"Ритми дил",12:"Ампулаи иловагӣ",13:"Реактор: чароғҳоро хомӯш кун",14:"Ҷустуҷӯи ях",15:"Лӯчаи шлюз",16:"Фишор дар шлюз"},
  cn:{"1A":"Хушксолӣ дар кортҳо","1B":"Қубури обёрӣ тарқид","2A":"Бехобӣ","2B":"Вайроншавии датчикҳои тиббӣ","3A":"Шӯълаи DONKI","3B":"Яхи Миррих","4A":"Рег дар панелҳо","4B":"Афтидани фишор дар шлюз"}}
};
const root=document.getElementById("p-game");
let wrap,frame,load,note,fsBtn,tools,chip,toastEl,room="hub",built=false,modal=null;
const L=()=>(typeof lang!=="undefined"&&T[lang])?lang:"en";
const tr=()=>T[L()];

/* ---------- saved data: campaign + records (localStorage, with a memory fallback) ---------- */
const mem={};
function rd(k,d){try{const v=JSON.parse(localStorage.getItem(k)||"null");if(v&&typeof v==="object")return v}catch(_){}return mem[k]||d}
function wr(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
const cleanNick=s=>String(s||"").replace(/[^\p{L}\p{N} _\-]/gu,"").replace(/\s+/g," ").trim().slice(0,14);
function camp(){
  const c=rd("mm-camp",{});let g={};
  try{g=JSON.parse(localStorage.getItem("mm-dune")||"null")||{}}catch(_){}
  if(!g.camp&&window.__mmDune&&window.__mmDune.s)g=window.__mmDune.s;
  const k=g.camp||{};
  return{nick:cleanNick(c.nick),day:Math.max(1,Math.min(DAYS,+k.day||1)),phase:k.phase||"new",lives:k.lives!=null?+k.lives:3,fin:c.fin?1:0};
}
function recs(){const r=rd("mm-rec",{});return{full:Array.isArray(r.full)?r.full.slice(0,5):[],mini:r.mini&&typeof r.mini==="object"?r.mini:{}}}
const nm=()=>camp().nick||"Astro";

/* ---------- little DOM helpers (text goes in through textContent) ---------- */
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function btn(cls,txt,fn){const b=el("button",cls,txt);b.type="button";b.addEventListener("click",fn);return b}
function fmt(s,n){return s.replace("{n}",n)}

function closeModal(){if(modal){modal.remove();modal=null}}
function openModal(title,body,opts){
  closeModal();
  const ov=el("div","dm"),card=el("div","dc");
  ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label",title);
  const h=el("div","dh");h.appendChild(el("h3","",title));
  if(!(opts&&opts.noclose)){const x=btn("dx","✕",closeModal);x.setAttribute("aria-label",tr().close);h.appendChild(x)}
  card.appendChild(h);card.appendChild(body);ov.appendChild(card);
  ov.addEventListener("click",e=>{if(e.target===ov&&!(opts&&opts.noclose))closeModal()});
  wrap.appendChild(ov);modal=ov;
  const f=card.querySelector("input,button:not(.dx)");if(f)setTimeout(()=>f.focus({preventScroll:true}),60);
}
addEventListener("keydown",e=>{if(e.key==="Escape"&&modal&&!modal.dataset.lock)closeModal()});

/* ---------- nickname ---------- */
function nickModal(first){
  const t=tr(),b=el("div","dbody");
  b.appendChild(el("p","dp",t.nickHint));
  const inp=el("input","dinp");inp.type="text";inp.maxLength=14;inp.placeholder=t.nickPh;inp.value=camp().nick;
  inp.setAttribute("aria-label",t.nick);inp.autocomplete="off";inp.spellcheck=false;
  const go=()=>{const n=cleanNick(inp.value)||t.nickPh;const c=camp();c.nick=n;wr("mm-camp",c);closeModal();paintChip()};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
  b.appendChild(inp);b.appendChild(btn("dgo",t.nickGo,go));
  openModal(t.nickQ,b,{noclose:first});
  if(first&&modal)modal.dataset.lock="1";
}

/* ---------- the 15-day map lives on the control page ---------- */
function mapModal(){show("day")}

/* ---------- records ---------- */
function rows(list,n,fmtRow){
  const t=tr(),o=el("div","drows");
  for(let i=0;i<n;i++){
    const r=list[i],row=el("div","drow"+(r?"":" free"));
    row.appendChild(el("span","dn1",String(i+1)));
    if(r)fmtRow(row,r);else row.appendChild(el("span","dfree","— "+t.free+" —"));
    o.appendChild(row);
  }
  return o;
}
function recModal(tab){
  const t=tr(),R=recs(),b=el("div","dbody"),tabs=el("div","dtabs");
  tab=tab||0;
  t.tab.forEach((x,i)=>tabs.appendChild(btn("dtab"+(i===tab?" on":""),x,()=>recModal(i))));
  b.appendChild(tabs);
  if(tab===0){
    b.appendChild(rows(R.full,5,(row,r)=>{
      row.appendChild(el("span","dnn",r.nick));row.appendChild(el("span","dv","⭐ "+r.stars));row.appendChild(el("span","dv",r.pts+" "+t.pts.toLowerCase()));
    }));
  }else{
    const g=el("div","dgrid");
    for(let id=1;id<=16;id++){
      const box=el("div","dbox");box.appendChild(el("h4","",id+". "+t.mini[id]));
      box.appendChild(rows((R.mini[id]||[]),3,(row,r)=>{
        row.appendChild(el("span","dnn",r.nick));row.appendChild(el("span","dv",r.score+" "+t.score));row.appendChild(el("span","dv",r.left+"s"));
      }));
      g.appendChild(box);
    }
    b.appendChild(g);
  }
  openModal("🏆 "+t.rec,b);
}

/* ---------- events from the game ---------- */
function toast(msg){
  toastEl.textContent=msg;toastEl.classList.remove("show");void toastEl.offsetWidth;toastEl.classList.add("show");
  if(window.MMX&&MMX.play)MMX.play("day");
}
function addMini(id,score,left){
  if(!(id>=1&&id<=16))return;
  const R=recs(),l=(R.mini[id]||[]).slice();
  l.push({nick:nm(),score:score,left:left});
  l.sort((a,b)=>b.score-a.score||b.left-a.left);
  R.mini[id]=l.slice(0,3);wr("mm-rec",R);
}
function onMini(d){if(d.win){addMini(d.id,d.score,d.left);if(window.MMAlbum)MMAlbum.game(d.id)}}
function onAward(d){const A=window.MMAlbum;if(!A)return;
  if(d.k==="film")A.film(d.v);
  else if(d.k==="sci")A.sci(+d.v);
  else if(d.k==="rover")A.addKm(+d.v)}
function onCamp(d){paintChip();const A=window.MMAlbum;if(!A)return;
  if(d.day>=5&&d.phase!=="new")A.path("day5");if(d.day>=10&&d.phase!=="new")A.path("day10");
  if(d.sci)for(let i=1;i<=d.sci&&i<=5;i++)A.sci(i);
  if(d.sci>=5)A.path("allsci")}
function onFinale(d){
  const c=camp(),pts=Math.max(0,+d.pts||0),stars=Math.max(0,+d.stars||0),nick=c.nick||"Astro";
  const R=recs();R.full.push({nick:nick,stars:stars,pts:pts});R.full.sort((a,b)=>b.pts-a.pts||b.stars-a.stars);R.full=R.full.slice(0,5);wr("mm-rec",R);
  const k=rd("mm-camp",{});k.fin=1;wr("mm-camp",k);toast(tr().fin);
  const A=window.MMAlbum;if(A){A.path("fin");if(+d.lives>=3)A.path("flawless");const n=A.finCount?A.finCount():0;if(n>=1)A.path("fin2");A.finInc&&A.finInc()}
}
function setNick(n){const c=rd("mm-camp",{});c.nick=cleanNick(n)||"Astro";wr("mm-camp",c);paintChip()}
window.MMHost={nick:()=>camp().nick,setNick:setNick};

addEventListener("message",e=>{
  if(!built||e.source!==frame.contentWindow)return;
  const d=e.data;if(!d||typeof d!=="object")return;
  if(d.mmDune==="go"&&typeof d.room==="string"&&ROOMS[d.room])show(d.room);
  else if(d.mmDune==="mini")onMini(d);
  else if(d.mmDune==="nick")setNick(d.nick);
  else if(d.mmDune==="camp")onCamp(d);
  else if(d.mmDune==="award")onAward(d);
  else if(d.mmDune==="finale")onFinale(d);
  else if(d.mmDune==="records")recModal(0);
});

/* ---------- frame ---------- */
function pushLang(){try{frame.contentWindow.postMessage({mmLang:L()},"*")}catch(_){}}
function show(r){
  room=ROOMS[r]?r:"hub";
  load.classList.remove("off");
  const docs=window.MM_DUNE_DOCS;
  if(docs&&docs[room]){frame.removeAttribute("src");frame.srcdoc=docs[room]}
  else{frame.removeAttribute("srcdoc");frame.src=ROOMS[room]}
}
function measure(){
  const t=document.querySelector(".top");
  if(t)document.documentElement.style.setProperty("--top-h",Math.ceil(t.getBoundingClientRect().bottom)+"px");
}
function paintChip(){
  if(!built)return;const t=tr(),c=camp();
  chip.textContent="";chip.appendChild(el("b","",c.phase==="end"?"✓ "+DAYS+"/"+DAYS:t.day+" "+c.day+"/"+DAYS));
  chip.setAttribute("aria-label",t.map);
  nickBtn.textContent="👤 "+(c.nick||t.nick);nickBtn.title=t.nickEdit;nickBtn.setAttribute("aria-label",t.nickEdit);
  mapBtn.title=t.map;mapBtn.setAttribute("aria-label",t.map);recBtn.title=t.rec;recBtn.setAttribute("aria-label",t.rec);
}
let nickBtn,mapBtn,recBtn;
function build(){
  built=true;
  frame=document.createElement("iframe");frame.className="dframe";
  frame.setAttribute("allow","fullscreen; autoplay");frame.setAttribute("allowfullscreen","");frame.setAttribute("referrerpolicy","no-referrer");
  root.innerHTML='<div class="dwrap"><div class="dload"></div><div class="dtools"></div><div class="dtoast" role="status"></div>'
   +'<div class="dnote" hidden><span></span><button type="button" data-ok></button></div></div>';
  wrap=root.querySelector(".dwrap");wrap.insertBefore(frame,wrap.firstChild);load=root.querySelector(".dload");
  tools=root.querySelector(".dtools");toastEl=root.querySelector(".dtoast");
  note=root.querySelector(".dnote");
  chip=btn("dchip","",()=>mapModal());mapBtn=btn("dbtn","🗺️",()=>mapModal());recBtn=btn("dbtn","🏆",()=>recModal(0));
  nickBtn=btn("dbtn dnick","",()=>nickModal(false));fsBtn=btn("dbtn","⛶",()=>{
    const d=document;
    if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d)}
    else{(wrap.requestFullscreen||wrap.webkitRequestFullscreen).call(wrap)}
  });
  [nickBtn,chip,mapBtn,recBtn,fsBtn].forEach(b=>tools.appendChild(b));
  frame.addEventListener("load",()=>{load.classList.add("off");pushLang()});
  if(!(wrap.requestFullscreen||wrap.webkitRequestFullscreen))fsBtn.hidden=true;
  root.querySelector("[data-ok]").addEventListener("click",()=>{
    note.hidden=true;try{localStorage.setItem("mm-dune-note","1")}catch(_){}
  });
  let seen=false;try{seen=localStorage.getItem("mm-dune-note")==="1"}catch(_){}
  note.hidden=seen;
  paint();measure();show("day");
}
function paint(){
  if(!built)return;const t=tr();
  frame.title=t.frame;load.textContent=t.loading;
  fsBtn.title=t.full;fsBtn.setAttribute("aria-label",t.full);
  note.querySelector("span").textContent=t.note;note.querySelector("[data-ok]").textContent=t.ok;
  paintChip();pushLang();
  if(modal)closeModal();
}
addEventListener("resize",()=>{if(built)measure()});
addEventListener("orientationchange",()=>setTimeout(()=>{if(built)measure()},250));
window.gameEnter=function(){if(window.MMMusic)MMMusic.mood("game");if(!built)build();else measure()};
window.gameLeave=function(){if(window.MMMusic)MMMusic.mood("calm")};
window.gameRender=function(){paint()};
})();
