/* Awards album: stickers earned in the game. Locked slots show the silhouette of a themed emoji. */
(function(){
"use strict";
var A=window.MM_ALBUM,KEY="mm-album",mem=null;
var TX={
en:{t:"Awards",lead:"Cards you earn in the game. Every card is also free in the Knowledge Base.",ch:{films:"Films",games:"Mini-games",rover:"Science samples",path:"Mission path",sci:"Discoveries"},
 film:"Watch the film on sol {s}",game:"Win mini-game №{n}",rover:"Drive {m} m on the rover",sci:"Discovery №{n}: visit lab or rover twice more",
 path:{day5:"Reach sol 5",day10:"Reach sol 10",fin:"Finish the campaign",flawless:"Finish without losing a life",fin2:"Finish a second time",allsci:"Make all 5 discoveries"},
 intro:"Intro film",got:"New card!",open:"Open",km:"Rover distance",of:"of",m:"m",cnt:"Collected",known:"Knowledge Base"},
ru:{t:"Награды",lead:"Карточки, которые ты получаешь в игре. Все карточки также открыты в Базе Знаний.",ch:{films:"Фильмы",games:"Мини-игры",rover:"Научные образцы",path:"Путь миссии",sci:"Научные открытия"},
 film:"Посмотри фильм на соле {s}",game:"Выиграй мини-игру №{n}",rover:"Проедь {m} м на ровере",sci:"Открытие №{n}: ещё 2 визита в лабораторию или на ровер",
 path:{day5:"Дойди до сола 5",day10:"Дойди до сола 10",fin:"Пройди кампанию",flawless:"Пройди без потери жизни",fin2:"Пройди кампанию второй раз",allsci:"Сделай все 5 открытий"},
 intro:"Вступительный фильм",got:"Новая карточка!",open:"Открыть",km:"Путь ровера",of:"из",m:"м",cnt:"Собрано",known:"База Знаний"},
tg:{t:"Мукофотҳо",lead:"Кортҳое, ки дар бозӣ мегиред. Ҳамаи кортҳо дар Пойгоҳи дониш низ озоданд.",ch:{films:"Филмҳо",games:"Бозиҳои хурд",rover:"Намунаҳои илмӣ",path:"Роҳи миссия",sci:"Кашфиётҳо"},
 film:"Филмро дар соли {s} бубинед",game:"Бозии хурди №{n}-ро бибаред",rover:"Бо ровер {m} м рондан",sci:"Кашфиёти №{n}: боз 2 боздид аз лаборатория ё ровер",
 path:{day5:"То соли 5 расед",day10:"То соли 10 расед",fin:"Кампанияро тамом кунед",flawless:"Бе аз даст додани ҳаёт тамом кунед",fin2:"Бори дуюм тамом кунед",allsci:"Ҳамаи 5 кашфиётро кунед"},
 intro:"Филми ибтидоӣ",got:"Корти нав!",open:"Кушодан",km:"Масофаи ровер",of:"аз",m:"м",cnt:"Ҷамъ шуд",known:"Пойгоҳи дониш"}};
var FK={intro:0,d3:3,d6:6,d9:9,d12:12,d15:15};
function lang(){return window.__mmLang||"ru"}
function T(){return TX[lang()]||TX.ru}
function tr(o){return o?(typeof o==="string"?o:(o[lang()]||o.en||o.ru||"")):""}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function load(){if(mem)return mem;var s=null;try{s=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
  mem=s&&typeof s==="object"?s:{};mem.own=mem.own||{};mem.km=+mem.km||0;return mem}
function save(){try{localStorage.setItem(KEY,JSON.stringify(mem))}catch(e){}}
function has(c){return !!load().own[c]}
function all(){var a=[];Object.keys(A.films).forEach(function(k){a=a.concat(A.films[k])});Object.keys(A.games).forEach(function(k){a.push(A.games[k])});
  a=a.concat(A.sci);A.rover.forEach(function(r){a.push(r[1])});Object.keys(A.path).forEach(function(k){a.push(A.path[k])});return a}
var queue=[],showing=false;
function award(c){c=+c;if(!c||!INFO[c]||has(c))return false;load().own[c]=1;save();queue.push(c);pump();upd();return true}
function pump(){if(showing||!queue.length)return;showing=true;var c=queue.shift(),d=INFO[c],t=T();
  var el=document.createElement("div");el.className="al-pop";
  el.innerHTML='<div class="al-card" style="--c:'+esc(d.color||"#eaa45c")+'"><div class="al-got">'+esc(t.got)+'</div><div class="al-big">'+esc(d.icon||"⭐")+'</div><b>№'+c+' · '+esc(tr(d.title))+'</b><button type="button" class="btn">'+esc(t.open)+'</button></div>';
  document.body.appendChild(el);requestAnimationFrame(function(){el.classList.add("on")});
  var done=function(open){el.classList.remove("on");setTimeout(function(){el.remove();showing=false;pump()},250);if(open&&window.qrOpen)window.qrOpen(String(c))};
  el.querySelector("button").onclick=function(e){e.stopPropagation();done(true)};el.onclick=function(){done(false)};
  setTimeout(function(){if(el.isConnected)done(false)},4200)}
function sticker(c,hint){var d=INFO[c];if(!d)return"";var own=has(c),ic=esc(d.icon||"⭐");
  return '<button type="button" class="al-s'+(own?" own":" lock")+'" data-c="'+c+'" style="--c:'+esc(d.color||"#eaa45c")+'"><span class="al-ic">'+ic+'</span><i class="al-n">№'+c+'</i><b>'+(own?esc(tr(d.title)):"???")+'</b>'+(own?(window.MMVault&&MMVault.done(String(c))?'<em class="al-star">★</em>':''):'<small>'+esc(hint)+'</small>')+'</button>'}
function chap(title,items,extra){var n=items.filter(function(i){return has(i[0])}).length;
  return '<section class="al-ch"><h3>'+esc(title)+' <span>'+n+' / '+items.length+'</span></h3>'+(extra||"")+'<div class="al-grid">'+items.map(function(i){return sticker(i[0],i[1])}).join("")+'</div></section>'}
function render(){var host=document.getElementById("p-album");if(!host)return;var t=T(),h=[],tot=all(),got=tot.filter(has).length;
  h.push('<h2 class="ptitle">'+esc(t.t)+'</h2><p class="lead">'+esc(t.lead)+'</p><div class="al-sum"><div class="pb"><i style="width:'+(got/tot.length*100).toFixed(1)+'%"></i></div><span>'+esc(t.cnt)+': '+got+' / '+tot.length+'</span></div>');
  var films=[];Object.keys(A.films).forEach(function(k){A.films[k].forEach(function(c){films.push([c,k==="intro"?t.intro:t.film.replace("{s}",FK[k])])})});
  h.push(chap(t.ch.films,films));
  var g=Object.keys(A.games).map(function(k){return[A.games[k],t.game.replace("{n}",k)]});h.push(chap(t.ch.games,g));
  var km=load().km,next=A.rover.filter(function(r){return km<r[0]})[0],bar='<div class="al-km">🚙 '+esc(t.km)+': <b>'+Math.round(km)+'</b> '+esc(t.m)+(next?' · '+esc(t.of)+' '+next[0]+' '+esc(t.m):'')+'</div>';
  h.push(chap(t.ch.rover,A.rover.map(function(r){return[r[1],t.rover.replace("{m}",r[0])]}),bar));
  h.push(chap(t.ch.sci,A.sci.map(function(c,i){return[c,t.sci.replace("{n}",i+1)]})));
  h.push(chap(t.ch.path,Object.keys(A.path).map(function(k){return[A.path[k],t.path[k]]})));
  host.innerHTML=h.join("");
  host.onclick=function(e){var b=e.target.closest(".al-s.own");if(b&&window.qrOpen)window.qrOpen(b.dataset.c)}}
function upd(){var h=document.getElementById("p-album");if(h&&h.classList.contains("on"))render()}
function addKm(m){m=+m||0;if(m<=0)return;var s=load();s.km+=m;A.rover.forEach(function(r){if(s.km>=r[0])award(r[1])});save();upd()}
var API={finCount:function(){return load().fins||0},finInc:function(){var s=load();s.fins=(s.fins||0)+1;save()},award:award,has:has,addKm:addKm,km:function(){return load().km},render:render,enter:render,
 game:function(id){var c=A.games[id];if(c)award(c)},film:function(k){var f=A.films[k];if(f)f.forEach(award)},
 sci:function(n){var c=A.sci[n-1];if(c)award(c)},path:function(k){var c=A.path[k];if(c)award(c)},count:function(){return all().filter(has).length}};
window.MMAlbum=API;window.albumEnter=render;
document.addEventListener("mmlang",upd);
})();
