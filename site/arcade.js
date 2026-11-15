(function(){
"use strict";
const $=s=>document.querySelector(s);
const G=[
 [1,"hub","💧","reflex",["Поймай капли","Catch the drops","Қатраҳоро бигир"],["Двигай воронку и лови чистые капли, не трогая солёные.","Slide the funnel to catch clean drops and dodge the salty ones.","Қифро ҳаракат деҳ ва қатраҳои тозаро бигир, шӯрҳоро нагир."]],
 [2,"hub","🥬","reflex",["Собери урожай","Harvest the crop","Ҳосилро ҷамъ кун"],["Быстро собирай спелые овощи и обходи заражённые.","Pick ripe veggies fast and skip the infected ones.","Сабзавоти пухтаро зуд бикан, бемороро нагир."]],
 [3,"hub","🧪","memory",["Витаминный микс","Vitamin mix","Омехтаи витаминҳо"],["Повтори цветной рецепт: перетащи нужные капсулы в колбу.","Copy the colour recipe: drag the right capsules into the flask.","Дорухатро такрор кун: капсулаҳои дурустро ба колба гузор."]],
 [4,"hub","💓","logic",["Пульс в норме","Steady pulse","Набзи муътадил"],["Нажимай лекарства и доведи пульс до 70. Доз мало!","Tap medicines to bring the pulse to 70. Doses are few!","Бо доруҳо набзро ба 70 расон. Дозаҳо кам аст!"]],
 [5,"lab","🌊","precision",["Поймай волну","Catch the wave","Мавҷро бигир"],["Подгони амплитуду и частоту под дрейфующий сигнал и удержи его.","Match amplitude and frequency to a drifting signal and hold it.","Амплитуда ва басомадро ба сигнали дрейфкунанда мутобиқ кун ва нигоҳ дор."]],
 [6,"lab","🛰️","logic",["Маршрут ровера","Rover route","Масири ровер"],["Проведи ровер через два алмаза до зарядки.","Drive the rover through two gems to the charger.","Роверро аз ду алмос то заряд бибар."]],
 [7,"airlock","🧹","reflex",["Очистка панелей","Clean the panels","Тоза кардани панелҳо"],["Сотри песок с солнечной батареи, пока не засыпало.","Brush the sand off the solar panel in time.","Регро аз панели офтобӣ пок кун."]],
 [8,"airlock","🔧","logic",["Залатай обшивку","Patch the hull","Пуши ҷоро ҷой кун"],["Выбери заплатку и закрой красные дырки в стене.","Pick patches and cover the red holes in the wall.","Печро интихоб кун ва сӯрохиҳои сурхро пӯшон."]],
 [9,"hub","🚿","logic",["Полив по клапанам","Valve irrigation","Обёрӣ бо клапанҳо"],["Три грядки хотят пить: открывай краны и держи воду в зелёной зоне.","Three beds are thirsty: open taps and keep water in the green zone.","Се кат ташна аст: краҳоро кушо ва обро дар минтақаи сабз нигоҳ дор."]],
 [10,"hub","🌱","memory",["Грядки по схеме","Beds by the plan","Кат аз рӯи нақша"],["Запомни расстановку культур за пару секунд и повтори по памяти.","Memorise a crop layout in seconds, then rebuild it from memory.","Ҷойгиркунии зироатро дар чанд сония ёд гир ва аз хотир такрор кун."]],
 [11,"hub","❤️","precision",["Ритм сердца","Heart rhythm","Ритми дил"],["Води курсор за бьющимся сердцем и держи его в кольце.","Follow the beating heart and keep it in the ring.","Курсорро аз паси дили тапанда бибар ва дар ҳалқа нигоҳ дор."]],
 [12,"hub","💉","memory",["Лишняя ампула","The odd ampoule","Ампулаи иловагӣ"],["Найди ампулу, отличающуюся цветом или уровнем.","Spot the ampoule that differs in colour or level.","Ампулаеро ёб, ки ранг ё сатҳаш фарқ мекунад."]],
 [13,"lab","⚛️","logic",["Реактор: кабели","Reactor: cables","Реактор: кабелҳо"],["Соедини цветные точки одного цвета, не пересекая линии.","Join dots of the same colour without crossing lines.","Нуқтаҳои ҳамрангро бе убури хатҳо пайваст кун."]],
 [14,"lab","🧊","logic",["Поиск льда","Ice hunt","Ҷустуҷӯи ях"],["Радар расстояний: найди два блока льда за 10 попыток.","A distance radar: find two ice blocks in 10 tries.","Радари масофа: дар 10 кӯшиш ду пораи яхро ёб."]],
 [15,"airlock","🔐","precision",["Люк шлюза","Airlock hatch","Люки шлюз"],["Найди два числа кода: подсказки «холодно – горячо».","Find two code numbers using “cold – hot” hints.","Ду рақами рамзро бо маслиҳати «хунук – гарм» ёб."]],
 [16,"airlock","🎯","precision",["Давление в шлюзе","Airlock pressure","Фишор дар шлюз"],["Останови стрелку в сужающейся зелёной зоне.","Stop the needle in a shrinking green zone.","Тирчаро дар минтақаи сабзи танг қатъ кун."]]
];
const COL=["#7dd3fc","#86efac","#d8b4fe","#fda4af","#93c5fd","#fdba74","#fde68a","#bfdbfe","#fde047","#bbf7d0","#fecaca","#fbcfe8","#c7d2fe","#a5f3fc","#99f6e4","#fef08a"];
const T={
 ru:{kbT:"База Знаний",kbP:"Энциклопедия игры: 53 карточки о Марсе, Луне, космической погоде, жизнеобеспечении и людях в космосе. Читай факты NASA и проверяй себя в коротких заданиях.",kbB:"Открыть Базу Знаний",mgT:"Мини-игры",mgP:"Попробуй любую из 16 мини-игр прямо здесь, без 15 солов кампании. Пробная игра не влияет на рекорды и награды.",play:"Играть",tags:{reflex:"Реакция",logic:"Логика",rhythm:"Ритм",precision:"Точность",memory:"Память"},trial:"Пробный режим: результаты не засчитываются",close:"Закрыть",again:"Заново",prev:"Предыдущая",next:"Следующая",back:"← Внутри игры",hard:"Сложная"},
 en:{kbT:"Knowledge Base",kbP:"The encyclopedia of the game: 53 cards about Mars, the Moon, space weather, life support and people in space. Read NASA facts and test yourself with short tasks.",kbB:"Open the Knowledge Base",mgT:"Mini-games",mgP:"Try any of the 16 mini-games right here, without playing 15 sols of the campaign. Practice runs do not affect records or awards.",play:"Play",tags:{reflex:"Reflex",logic:"Logic",rhythm:"Rhythm",precision:"Precision",memory:"Memory"},trial:"Practice mode: results do not count",close:"Close",again:"Retry",prev:"Previous",next:"Next",back:"← Inside the game",hard:"Hard"},
 tg:{kbT:"Пойгоҳи дониш",kbP:"Донишномаи бозӣ: 53 корт дар бораи Миррих, Моҳ, обу ҳавои кайҳонӣ ва ҳаёт дар кайҳон. Далелҳои NASA-ро бихон ва худро санҷ.",kbB:"Кушодани Пойгоҳи дониш",mgT:"Мини-бозиҳо",mgP:"Ҳар яке аз 16 мини-бозиро ҳамин ҷо санҷед, бе гузаштани 15 соли кампания. Бозии санҷишӣ ба рекорд ва мукофот таъсир намекунад.",play:"Бозӣ",tags:{reflex:"Вокуниш",logic:"Мантиқ",rhythm:"Ритм",precision:"Дақиқӣ",memory:"Хотира"},trial:"Ҳолати санҷишӣ: натиҷа ҳисоб намешавад",close:"Пӯшидан",again:"Аз нав",prev:"Қаблӣ",next:"Навбатӣ",back:"← Даруни бозӣ",hard:"Душвор"}
};
const li=()=>{const l=window.__mmLang||document.documentElement.lang||"en";return l==="ru"?0:l==="tg"?2:1};
const tt=()=>T[["ru","en","tg"][li()]];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const s6=$("#s6"),secs=$("#secs"),chips=$("#chips");
let kbBtn,kbTxt,mg,grid,mgH,mgP;
if(s6&&secs){
  s6.querySelector(".txt").remove();const md=s6.querySelector(".media,.slot");if(md)md.remove();
  kbTxt=document.createElement("p");kbTxt.className="txt";s6.appendChild(kbTxt);
  kbBtn=document.createElement("button");kbBtn.type="button";kbBtn.className="kbcard";kbBtn.dataset.go="qr";
  kbBtn.innerHTML='<span class="kbi">📚</span><span class="kbs"></span><span class="kbg">→</span>';s6.appendChild(kbBtn);
  mg=document.createElement("div");mg.className="sec rv";mg.id="smg";mg.innerHTML='<h2></h2><p class="txt"></p><div class="mgrid"></div>';
  secs.appendChild(mg);mgH=mg.querySelector("h2");mgP=mg.querySelector(".txt");grid=mg.querySelector(".mgrid");
  grid.innerHTML=G.map(g=>`<article class="mgc" style="--c:${COL[g[0]-1]}"><div class="mgi">${g[2]}</div><div class="mgb"><div class="mgn"></div><div class="mgt"></div><div class="mgd"></div></div><button type="button" class="mgp" data-g="${g[0]}"></button></article>`).join("");
  const ch=document.createElement("button");ch.className="chip";ch.dataset.to="smg";chips.appendChild(ch);
}
const qp=$("#p-qr");
let back;
if(qp){back=document.createElement("button");back.type="button";back.className="qback";back.dataset.go="inside";qp.insertBefore(back,qp.firstChild)}
function paint(){
  const t=tt(),l=li();if(!s6)return;
  s6.querySelector("h2").textContent=t.kbT;kbTxt.textContent=t.kbP;kbBtn.querySelector(".kbs").textContent=t.kbB;
  mgH.textContent=t.mgT;mgP.textContent=t.mgP;
  const cs=chips.querySelectorAll(".chip");cs[2].textContent=t.kbT;cs[3].textContent=t.mgT;
  grid.querySelectorAll(".mgc").forEach((a,i)=>{const g=G[i];
    a.querySelector(".mgn").textContent=g[4][l];a.querySelector(".mgt").textContent=t.tags[g[3]];
    a.querySelector(".mgd").textContent=g[5][l];a.querySelector(".mgp").textContent="▶ "+t.play});
  if(back)back.textContent=t.back;
  if(ov){ov.querySelector(".avb").textContent=t.trial;ov.querySelector(".avx").setAttribute("aria-label",t.close);ov.querySelector(".avr").title=t.again;ov.querySelector(".avp").title=t.prev;ov.querySelector(".avn").title=t.next;ov.querySelector(".avt").textContent=G[cur-1][2]+" "+G[cur-1][4][l]}
}
let ov=null,cur=1,fr=null;
function load(){
  const g=G[cur-1],docs=window.MM_DUNE_DOCS;
  window.__mmArc={id:cur,s:null};
  fr.removeAttribute("src");fr.removeAttribute("srcdoc");
  if(docs&&docs[g[1]])fr.srcdoc=docs[g[1]];else fr.src="dune/"+g[1]+".html";
  paint();
}
function pushLang(){try{fr.contentWindow.postMessage({mmLang:window.__mmLang||"en"},"*")}catch(_){}}
function open(id){
  cur=id;
  if(!ov){
    ov=document.createElement("div");ov.className="arc";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
    ov.innerHTML='<div class="avh"><span class="avt"></span><span class="avb"></span><span class="avs"></span><button type="button" class="avp">◀</button><button type="button" class="avn">▶</button><button type="button" class="avr">⟳</button><button type="button" class="avx">✕</button></div>';
    fr=document.createElement("iframe");fr.className="avf";fr.setAttribute("allow","fullscreen; autoplay");fr.setAttribute("referrerpolicy","no-referrer");ov.appendChild(fr);
    document.body.appendChild(ov);
    fr.addEventListener("load",()=>{pushLang();setTimeout(pushLang,300)});
    ov.querySelector(".avx").onclick=close;ov.querySelector(".avr").onclick=load;
    ov.querySelector(".avp").onclick=()=>{cur=cur===1?16:cur-1;load()};
    ov.querySelector(".avn").onclick=()=>{cur=cur===16?1:cur+1;load()};
  }
  ov.classList.add("on");document.documentElement.classList.add("arc-lock");load();
  setTimeout(()=>ov.querySelector(".avx").focus(),50);
}
function close(){
  if(!ov)return;ov.classList.remove("on");document.documentElement.classList.remove("arc-lock");
  window.__mmArc=null;if(fr){fr.removeAttribute("srcdoc");fr.src="about:blank"}
}
addEventListener("keydown",e=>{if(e.key==="Escape"&&ov&&ov.classList.contains("on"))close()});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-g]");if(b){open(+b.dataset.g)}});
document.addEventListener("mmlang",paint);
window.MMArcade={open:open,close:close,games:G};
paint();
})();
