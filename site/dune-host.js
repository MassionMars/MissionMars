(function(){
"use strict";
const ROOMS={day:"dune/day.html",hub:"dune/hub.html",lab:"dune/lab.html",airlock:"dune/airlock.html",rover:"dune/rover.html"};
const DAYS=15;
const T={
 en:{frame:"MISSION MARS: the base game",full:"Full screen",exit:"Exit full screen",loading:"Loading the base…",ok:"OK",
  note:"Tip: on a phone, rotate the screen to landscape for the best view.",
  nick:"Nickname",nickEdit:"Change nickname",nickQ:"What is your name, astronaut?",nickHint:"Your name goes on the records board. Up to 14 characters.",nickGo:"Start the mission",nickPh:"Astro",
  map:"Base map",rec:"Records",day:"Day",dayOf:"Day {n} of 15",close:"Close",
  today:"Today’s task",go:"Go there",done:"Done!",locked:"Locked",star:"Star for the planned task",
  room:{1:"Greenhouse",2:"Medbay",3:"Laboratory",4:"Airlock"},crisis:"Crisis",
  mapTip:"Win any mini-game to finish the day. Solve the planned crisis to earn a ⭐.",
  toast:"Day {n} complete!",toastStar:"Day {n} complete! ⭐",
  full_:"Full mission",mini_:"Mini-games",free:"free place for a record",rank:"#",player:"Player",pts:"Points",days:"Days",stars:"Stars",
  score:"score",left:"left",
  fin:"Mission complete!",finT:"You kept MISSION MARS alive for 15 days.",finS:"Your score",finR:"Your place",again:"Records",
  tab:["Full mission","Mini-games","Rover"],
  mini:{1:"Catch the drops",2:"Harvest the crop",3:"Vitamin mix",4:"Steady pulse",5:"Catch the wave",6:"Rover route",7:"Clean the panels",8:"Patch the hull",9:"Pipe watering",10:"Garden grid",11:"Heart rhythm",12:"Odd vial out",13:"Reactor: lights off",14:"Ice finder",15:"Hatch puzzle",16:"Airlock pressure"},
  cn:{"1A":"Drought in the beds","1B":"Burst irrigation pipe","2A":"Insomnia","2B":"Medical sensor glitch","3A":"DONKI flare warning","3B":"Martian ice","4A":"Sand on the panels","4B":"Airlock pressure drop"}},
 ru:{frame:"MISSION MARS: игра про базу",full:"На весь экран",exit:"Выйти из полноэкранного режима",loading:"Загружаем базу…",ok:"Понятно",
  note:"Подсказка: на телефоне переверни экран горизонтально — база будет видна лучше.",
  nick:"Ник",nickEdit:"Сменить ник",nickQ:"Как тебя зовут, астронавт?",nickHint:"Твоё имя попадёт в таблицу рекордов. До 14 символов.",nickGo:"Начать миссию",nickPh:"Астро",
  map:"Карта базы",rec:"Рекорды",day:"День",dayOf:"День {n} из 15",close:"Закрыть",
  today:"Задание дня",go:"Перейти",done:"Готово!",locked:"Закрыто",star:"Звезда за плановое задание",
  room:{1:"Теплица",2:"Медпункт",3:"Лаборатория",4:"Шлюз"},crisis:"Кризис",
  mapTip:"Выиграй любую мини-игру — день пройден. Реши кризис по плану — получишь ⭐.",
  toast:"День {n} пройден!",toastStar:"День {n} пройден! ⭐",
  full_:"Вся миссия",mini_:"Мини-игры",free:"свободное место для рекорда",rank:"№",player:"Игрок",pts:"Очки",days:"Дни",stars:"Звёзды",
  score:"счёт",left:"осталось",
  fin:"Миссия выполнена!",finT:"Ты сохранил базу MISSION MARS на все 15 дней.",finS:"Твой счёт",finR:"Твоё место",again:"Рекорды",
  tab:["Вся миссия","Мини-игры","Ровер"],
  mini:{1:"Поймай капли",2:"Собери урожай",3:"Витаминный микс",4:"Пульс в норме",5:"Поймай волну",6:"Маршрут ровера",7:"Очистка панелей",8:"Залатай обшивку",9:"Полив по клапанам",10:"Грядки по схеме",11:"Ритм сердца",12:"Лишняя ампула",13:"Реактор: кабели",14:"Поиск льда",15:"Люк шлюза",16:"Давление в шлюзе"},
  cn:{"1A":"Засуха в грядках","1B":"Лопнула труба полива","2A":"Бессонница","2B":"Сбой медицинских датчиков","3A":"Вспышка DONKI","3B":"Марсианский лёд","4A":"Песок на панелях","4B":"Падение давления в шлюзе"}},
 tg:{frame:"MISSION MARS: бозии база",full:"Экрани пурра",exit:"Баромадан аз экрани пурра",loading:"База бор мешавад…",ok:"Фаҳмо",
  note:"Маслиҳат: дар телефон экранро уфуқӣ гардонед.",
  nick:"Ном",nickEdit:"Тағйири ном",nickQ:"Номи ту чист, кайҳоннавард?",nickHint:"Номи ту ба ҷадвали рекордҳо меафтад. То 14 аломат.",nickGo:"Оғози миссия",nickPh:"Астро",
  map:"Харитаи база",rec:"Рекордҳо",day:"Рӯз",dayOf:"Рӯзи {n} аз 15",close:"Пӯшидан",
  today:"Вазифаи рӯз",go:"Рафтан",done:"Тайёр!",locked:"Баста",star:"Ситора барои вазифаи нақшавӣ",
  room:{1:"Гармхона",2:"Пункти тиббӣ",3:"Озмоишгоҳ",4:"Шлюз"},crisis:"Бӯҳрон",
  mapTip:"Ягон бозии хурдро бибар — рӯз гузашт. Бӯҳронро аз рӯи нақша ҳал кун — ⭐ мегирӣ.",
  toast:"Рӯзи {n} гузашт!",toastStar:"Рӯзи {n} гузашт! ⭐",
  full_:"Тамоми миссия",mini_:"Бозиҳои хурд",free:"ҷои холӣ барои рекорд",rank:"№",player:"Бозигар",pts:"Холҳо",days:"Рӯзҳо",stars:"Ситораҳо",
  score:"ҳисоб",left:"монд",
  fin:"Миссия иҷро шуд!",finT:"Ту базаи MISSION MARS-ро 15 рӯз нигоҳ доштӣ.",finS:"Ҳисоби ту",finR:"Ҷои ту",again:"Рекордҳо",
  tab:["Тамоми миссия","Бозиҳои хурд","Ровер"],
  mini:{1:"Қатраҳоро бигир",2:"Ҳосилро ҷамъ кун",3:"Омехтаи витаминҳо",4:"Набзи муътадил",5:"Мавҷро бигир",6:"Масири ровер",7:"Тоза кардани панелҳо",8:"Пуши ҷоро ҷой кун",9:"Обёрии қубурҳо",10:"Кортҳо аз рӯи нақша",11:"Ритми дил",12:"Ампулаи иловагӣ",13:"Реактор: чароғҳоро хомӯш кун",14:"Ҷустуҷӯи ях",15:"Лӯчаи шлюз",16:"Фишор дар шлюз"},
  cn:{"1A":"Хушксолӣ дар кортҳо","1B":"Қубури обёрӣ тарқид","2A":"Бехобӣ","2B":"Вайроншавии датчикҳои тиббӣ","3A":"Шӯълаи DONKI","3B":"Яхи Миррих","4A":"Рег дар панелҳо","4B":"Афтидани фишор дар шлюз"}}
};
Object.assign(T.en,{rv:"Rover science",pts2:"Science points",champ:"Champion of MISSION MARS",pc:"Player card",best:"Best mission",stars_:"Stars",minis:"Mini-game records",wins:"Mini-games won",fins:"Missions finished",place:"Place",pick:"Pick an avatar",back:"Back",tapme:"Tap a row to see the player",short:"The name needs at least 2 letters"});
Object.assign(T.ru,{rv:"Наука на ровере",pts2:"Очки науки",champ:"Чемпион MISSION MARS",pc:"Карточка игрока",best:"Лучшая миссия",stars_:"Звёзды",minis:"Рекордов в мини-играх",wins:"Выиграно мини-игр",fins:"Пройдено миссий",place:"Место",pick:"Выбери аватар",back:"Назад",tapme:"Нажми на строку, чтобы увидеть игрока",short:"В нике должно быть минимум 2 буквы"});
Object.assign(T.tg,{rv:"Илм дар ровер",pts2:"Холҳои илмӣ",champ:"Қаҳрамони MISSION MARS",pc:"Корти бозигар",best:"Беҳтарин миссия",stars_:"Ситораҳо",minis:"Рекордҳо дар бозиҳои хурд",wins:"Бозиҳои бурдашуда",fins:"Миссияҳои анҷомёфта",place:"Ҷой",pick:"Аватарро интихоб кун",back:"Қафо",tapme:"Ба сатр зер кун, то бозигарро бинӣ",short:"Ном бояд ақаллан 2 ҳарф дошта бошад"});
const root=document.getElementById("p-game");
let wrap,frame,load,note,fsBtn,tools,chip,toastEl,room="hub",built=false,modal=null;
const L=()=>(typeof lang!=="undefined"&&T[lang])?lang:"en";
const tr=()=>T[L()];

const mem={};
function rd(k,d){try{const v=JSON.parse(localStorage.getItem(k)||"null");if(v&&typeof v==="object")return v}catch(_){}return mem[k]||d}
function wr(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
const cleanNick=s=>String(s||"").replace(/[^\p{L}\p{N} _\-]/gu,"").replace(/\s+/g," ").trim().slice(0,14);
const AVS=["🧑‍🚀","👩‍🚀","🦊","🐱","🐼","🦉","🚀","🌟","🤖","🦄","🐲","🛰️"];
const nkey=n=>String(n||"").toLowerCase();
function camp(){
  const c=rd("mm-camp",{});let g={};
  try{g=JSON.parse(localStorage.getItem("mm-dune")||"null")||{}}catch(_){}
  if(!g.camp&&window.__mmDune&&window.__mmDune.s)g=window.__mmDune.s;
  const k=g.camp||{};
  return{nick:cleanNick(c.nick),av:AVS.includes(c.av)?c.av:AVS[0],day:Math.max(1,Math.min(DAYS,+k.day||1)),phase:k.phase||"new",lives:k.lives!=null?+k.lives:3,fin:c.fin?1:0};
}
const better={full:(a,b)=>a.pts-b.pts||a.stars-b.stars,mini:(a,b)=>a.score-b.score||b.left-a.left,rover:(a,b)=>a.sci-b.sci||a.m-b.m};
function uniq(list,kind,n){
  const m=new Map();
  (Array.isArray(list)?list:[]).forEach(r=>{if(!r||!r.nick)return;const k=nkey(r.nick),o=m.get(k);if(!o||better[kind](r,o)>0)m.set(k,r)});
  return[...m.values()].sort((a,b)=>better[kind](b,a)).slice(0,n);
}
function recs(){
  const r=rd("mm-rec",{}),mini={};
  if(r.mini&&typeof r.mini==="object")for(let i=1;i<=16;i++)mini[i]=uniq(r.mini[i],"mini",3);
  return{full:uniq(r.full,"full",5),mini,rover:uniq(r.rover,"rover",5)};
}
function prof(n){const P=rd("mm-prof",{});return P[nkey(n)]||{fin:0,wins:0}}
function bump(n,k){const P=rd("mm-prof",{}),o=P[nkey(n)]||{fin:0,wins:0};o[k]++;P[nkey(n)]=o;wr("mm-prof",P)}
const nm=()=>camp().nick||"Astro";

function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function btn(cls,txt,fn){const b=el("button",cls,txt);b.type="button";b.addEventListener("click",fn);return b}
function fmt(s,n){return s.replace("{n}",n)}

function closeModal(){if(modal){modal.remove();modal=null}}
function openModal(title,body,opts){
  closeModal();
  const ov=el("div","dm"),card=el("div","dc");
  ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label",title.replace(/<[^>]*>/g,"").trim());
  const h=el("div","dh");{const h3=el("h3","");h3.innerHTML=/^</.test(title)?title:title.replace(/&/g,"&amp;").replace(/</g,"&lt;");h.appendChild(h3)}
  if(!(opts&&opts.noclose)){const x=btn("dx","✕",closeModal);x.setAttribute("aria-label",tr().close);h.appendChild(x)}
  card.appendChild(h);card.appendChild(body);ov.appendChild(card);
  ov.addEventListener("click",e=>{if(e.target===ov&&!(opts&&opts.noclose))closeModal()});
  wrap.appendChild(ov);modal=ov;
  const f=card.querySelector("input,button:not(.dx)");if(f)setTimeout(()=>f.focus({preventScroll:true}),60);
}
addEventListener("keydown",e=>{if(e.key==="Escape"&&modal&&!modal.dataset.lock)closeModal()});

function avPicker(cur,onPick){
  const g=el("div","dav");
  AVS.forEach(a=>{const x=btn("dav1"+(a===cur?" on":""),a,()=>{g.querySelectorAll(".dav1").forEach(y=>y.classList.toggle("on",y===x));onPick(a)});g.appendChild(x)});
  return g;
}
function nickModal(first){
  const t=tr(),b=el("div","dbody");let av=camp().av;
  b.appendChild(el("p","dp",t.nickHint));
  const inp=el("input","dinp");inp.type="text";inp.maxLength=14;inp.placeholder=t.nickPh;inp.value=camp().nick;
  inp.setAttribute("aria-label",t.nick);inp.autocomplete="off";inp.spellcheck=false;
  const msg=el("p","dp dwarn","");
  const go=()=>{const n=cleanNick(inp.value);if(inp.value.trim()&&n.length<2){msg.textContent=t.short;return}setNick(n||t.nickPh,av);closeModal()};
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
  b.appendChild(inp);b.appendChild(msg);b.appendChild(el("p","dp",t.pick));b.appendChild(avPicker(av,a=>{av=a}));b.appendChild(btn("dgo",t.nickGo,go));
  openModal(t.nickQ,b,{noclose:first});
  if(first&&modal)modal.dataset.lock="1";
}

function mapModal(){show("day")}

const H=(n,c)=>window.MMHolo?MMHolo.ic(n,c):"";
const MCOL=["#ffd36e","#cfe6f5","#ffa66b"];
const medHTML=i=>i<3?`<svg viewBox="0 0 24 24" class="dmed" style="--hc:${MCOL[i]}"><path d="M7 2h4l1 6H8zM17 2h-4l-1 6h4z" fill="currentColor" fill-opacity=".25"/><circle cx="12" cy="15" r="6.2"/><text x="12" y="18" text-anchor="middle" font-size="8" font-weight="900" fill="currentColor" stroke="none">${i+1}</text></svg>`:String(i+1);
const MED=["","",""];
function rows(list,n,fmtRow,onTap){
  const t=tr(),o=el("div","drows");
  for(let i=0;i<n;i++){
    const r=list[i],row=el("div","drow"+(r?" has r"+(i+1):" free"));
    {const n1=el("span","dn1");n1.innerHTML=medHTML(i);row.appendChild(n1)}
    if(r){
      row.appendChild(el("span","dav0",r.av||AVS[0]));
      fmtRow(row,r);
      row.tabIndex=0;row.setAttribute("role","button");
      const tap=e=>{if(e.type==="keydown"&&e.key!=="Enter"&&e.key!==" ")return;e.preventDefault();onTap&&onTap(r,i,row)};
      row.addEventListener("click",tap);row.addEventListener("keydown",tap);
    }else row.appendChild(el("span","dfree","— "+t.free+" —"));
    o.appendChild(row);
  }
  return o;
}
function confetti(host,n){
  const cols=["#fde047","#f97316","#38bdf8","#86efac","#f472b6","#fff"];
  for(let i=0;i<(n||46);i++){
    const c=el("i","dconf");c.style.left=(Math.random()*100)+"%";c.style.background=cols[i%cols.length];
    c.style.setProperty("--dx",((Math.random()-.5)*160)+"px");c.style.setProperty("--r",(Math.random()*720-360)+"deg");
    c.style.animationDelay=(Math.random()*.35)+"s";c.style.animationDuration=(1.4+Math.random()*1.1)+"s";
    host.appendChild(c);setTimeout(()=>c.remove(),3200);
  }
}
function placeOf(r,list){return list.findIndex(x=>nkey(x.nick)===nkey(r.nick))+1}
function playerCard(r,rank,tab,kind){
  const t=tr(),R=recs(),b=el("div","dbody dpc"),pr=prof(r.nick);
  const champ=rank===1;
  const top=el("div","dpt"+(champ?" gold":""));
  if(champ){const cr=el("div","dcrown");cr.innerHTML=H("trophy","xl");top.appendChild(cr)}
  top.appendChild(el("div","dbigav",r.av||AVS[0]));
  top.appendChild(el("div","dbig",r.nick));
  {const pl=el("div","dbig sm");pl.innerHTML=(rank<=3?medHTML(rank-1):"#")+" "+t.place+" "+rank;top.appendChild(pl)}
  if(champ)top.appendChild(el("div","dchamp",t.champ));
  b.appendChild(top);
  const fb=R.full.find(x=>nkey(x.nick)===nkey(r.nick));
  let minis=0;for(let i=1;i<=16;i++)if((R.mini[i]||[]).some(x=>nkey(x.nick)===nkey(r.nick)))minis++;
  const st=el("div","dst");
  [[t.best,fb?fb.pts+" "+t.pts.toLowerCase():"—"],[t.stars_,fb?"⭐ "+fb.stars:"—"],[t.fins,pr.fin],[t.wins,pr.wins],[t.minis,minis],[t.rv,(R.rover.find(x=>nkey(x.nick)===nkey(r.nick))||{sci:"—"}).sci]].forEach(x=>{const l=el("div","dsl");l.appendChild(el("span","",x[0]));l.appendChild(el("b","",String(x[1])));st.appendChild(l)});
  b.appendChild(st);
  b.appendChild(btn("dgo",t.back,()=>recModal(tab)));
  openModal(t.pc,b);
  if(champ&&modal){const c=modal.querySelector(".dc");confetti(c,60);top.addEventListener("click",()=>{top.classList.remove("pop");void top.offsetWidth;top.classList.add("pop");confetti(c,40)})}
}
function recModal(tab){
  const t=tr(),R=recs(),b=el("div","dbody"),tabs=el("div","dtabs");
  tab=tab||0;
  t.tab.forEach((x,i)=>tabs.appendChild(btn("dtab"+(i===tab?" on":""),x,()=>recModal(i))));
  b.appendChild(tabs);
  if(tab===0){
    b.appendChild(rows(R.full,5,(row,r)=>{
      row.appendChild(el("span","dnn",r.nick));{const a=el("span","dv");a.innerHTML=H("star")+" "+(Number(r.stars)||0);row.appendChild(a)}row.appendChild(el("span","dv",r.pts+" "+t.pts.toLowerCase()));
    },(r,i,row)=>{if(i===0){confetti(row,26);row.classList.remove("shine");void row.offsetWidth;row.classList.add("shine");setTimeout(()=>playerCard(r,1,0),650)}else playerCard(r,i+1,0)}));
  }else if(tab===2){
    b.appendChild(rows(R.rover,5,(row,r)=>{
      row.appendChild(el("span","dnn",r.nick));const a=el("span","dv");a.innerHTML=H("science")+" "+(Number(r.sci)||0);row.appendChild(a);const c=el("span","dv");c.innerHTML=H("ruler")+" "+(Number(r.m)||0)+" m";row.appendChild(c);
    },(r,i,row)=>{if(i===0){confetti(row,26);row.classList.remove("shine");void row.offsetWidth;row.classList.add("shine");setTimeout(()=>playerCard(r,1,2),650)}else playerCard(r,i+1,2)}));
  }else{
    const g=el("div","dgrid");
    for(let id=1;id<=16;id++){
      const box=el("div","dbox");box.appendChild(el("h4","",id+". "+t.mini[id]));
      box.appendChild(rows((R.mini[id]||[]),3,(row,r)=>{
        row.appendChild(el("span","dnn",r.nick));row.appendChild(el("span","dv",r.score+" "+t.score));row.appendChild(el("span","dv",r.left+"s"));
      },(r,i,row)=>{if(i===0){confetti(row,22);row.classList.remove("shine");void row.offsetWidth;row.classList.add("shine");setTimeout(()=>playerCard(r,1,1),600)}else playerCard(r,i+1,1)}));
      g.appendChild(box);
    }
    b.appendChild(g);
  }
  b.appendChild(el("p","dp dtap",t.tapme));
  openModal(H("trophy")+" "+t.rec,b);
}

function toast(msg){
  toastEl.textContent=msg;toastEl.classList.remove("show");void toastEl.offsetWidth;toastEl.classList.add("show");
  if(window.MMX&&MMX.play)MMX.play("day");
}
function addMini(id,score,left){
  if(!(id>=1&&id<=16))return;
  const c=camp(),R=recs(),l=(R.mini[id]||[]).slice();
  l.push({nick:nm(),av:c.av,score:score,left:left});
  R.mini[id]=uniq(l,"mini",3);
  const all=rd("mm-rec",{});all.mini=R.mini;all.full=R.full;wr("mm-rec",all);
  bump(nm(),"wins");
}
function onRover(d){const sci=Math.max(0,Math.round(+d.sci||0)),m=Math.max(0,Math.round(+d.m||0));if(!sci)return;
  const c=camp(),R=recs(),l=R.rover.slice();l.push({nick:nm(),av:c.av,sci:sci,m:m});R.rover=uniq(l,"rover",5);
  const all=rd("mm-rec",{});all.rover=R.rover;all.mini=R.mini;all.full=R.full;wr("mm-rec",all);toast("+"+sci+" "+tr().pts2)}
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
  const R=recs();R.full=uniq(R.full.concat([{nick:nick,av:c.av,stars:stars,pts:pts}]),"full",5);wr("mm-rec",R);bump(nick,"fin");
  const k=rd("mm-camp",{});k.fin=1;wr("mm-camp",k);toast(tr().fin);
  const A=window.MMAlbum;if(A){A.path("fin");if(+d.lives>=3)A.path("flawless");const n=A.finCount?A.finCount():0;if(n>=1)A.path("fin2");A.finInc&&A.finInc()}
}
function setNick(n,av){const c=rd("mm-camp",{});c.nick=cleanNick(n)||"Astro";if(AVS.includes(av))c.av=av;wr("mm-camp",c);paintChip()}
window.MMHost={nick:()=>camp().nick,av:()=>camp().av,AVS:AVS,setNick:setNick};

addEventListener("message",e=>{
  if(!built||e.source!==frame.contentWindow)return;
  const d=e.data;if(!d||typeof d!=="object")return;
  if(d.mmDune==="go"&&typeof d.room==="string"&&ROOMS[d.room])show(d.room);
  else if(d.mmDune==="mini")onMini(d);
  else if(d.mmDune==="nick")setNick(d.nick,d.av);
  else if(d.mmDune==="camp")onCamp(d);
  else if(d.mmDune==="award")onAward(d);
  else if(d.mmDune==="rover")onRover(d);
  else if(d.mmDune==="finale")onFinale(d);
  else if(d.mmDune==="records")recModal(0);
  else if(d.mmDune==="duck"){if(window.MMMusic&&MMMusic.duck)MMMusic.duck(!!d.on)}
  else if(d.mmDune==="link"&&typeof d.url==="string")openLink(d.url,String(d.label||"").slice(0,160));
});

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
  nickBtn.textContent=c.av+" "+(c.nick||t.nick);nickBtn.title=t.nickEdit;nickBtn.setAttribute("aria-label",t.nickEdit);
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
  [nickBtn,chip,mapBtn,recBtn].forEach(b=>tools.appendChild(b));
  frame.addEventListener("load",()=>{load.classList.add("off");pushLang();try{var d=frame.contentDocument;if(d&&!d.__mmLk){d.__mmLk=1;d.addEventListener("click",ev=>{var n=ev.target;while(n&&n.nodeType===1&&!(n.tagName==="A"&&n.getAttribute("href")))n=n.parentNode;if(n&&n.nodeType===1&&/^https?:/i.test(n.getAttribute("href"))){ev.preventDefault();ev.stopPropagation();openLink(n.getAttribute("href"),n.getAttribute("data-lbl")||"")}},true)}}catch(_){}});
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
