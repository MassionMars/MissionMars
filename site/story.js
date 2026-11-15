/* About page: the story of the game in order — prologue film, four comics, finale film */
(function(){
"use strict";
var host=document.getElementById("a-story");if(!host)return;
var T={
 en:{play:"Watch the story",prev:"Previous",next:"Next",sol:"Sol",ch:["Prologue","Sol 3","Sol 6","Sol 9","Sol 12","Finale"],ti:["Prologue film","The wall of dust","The flare","Radio silence","The coldest night","Finale film"],end:"The end",replay:"Watch again"},
 ru:{play:"Смотреть сюжет",prev:"Назад",next:"Дальше",sol:"Сол",ch:["Пролог","Сол 3","Сол 6","Сол 9","Сол 12","Финал"],ti:["Фильм-пролог","Стена пыли","Вспышка","Тишина в эфире","Самая холодная ночь","Финальный фильм"],end:"Конец",replay:"Смотреть снова"},
 tg:{play:"Тамошои сюжет",prev:"Қафо",next:"Баъд",sol:"Сол",ch:["Пролог","Сол 3","Сол 6","Сол 9","Сол 12","Финал"],ti:["Филми пролог","Девори чанг","Шӯълавар","Хомӯшӣ дар эфир","Шаби сардтарин","Филми финалӣ"],end:"Поён",replay:"Боз тамошо кунед"}
};
var CH=[{v:"intro"},{c:"d3"},{c:"d6"},{c:"d9"},{c:"d12"},{v:"finale"}];
var cur=-1,slide=0,timer=0,vid=null,playing=false,SL=5200;
function lg(){var l=window.__mmLang||document.documentElement.lang||"en";return T[l]?l:"en"}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function duck(on){try{if(window.MMMusic&&MMMusic.duck)MMMusic.duck(on)}catch(_){}}
var root=el("div","sty"),stage=el("div","sty-stage"),chips=el("div","sty-chips"),bar=el("div","sty-bar"),ttl=el("div","sty-t"),big=el("button","sty-big"),ctl=el("div","sty-ctl");
big.type="button";stage.appendChild(ttl);stage.appendChild(bar);stage.appendChild(big);
var bp=el("button","sty-nav p","‹"),bn=el("button","sty-nav n","›");bp.type=bn.type="button";ctl.appendChild(bp);ctl.appendChild(bn);
root.appendChild(stage);root.appendChild(chips);host.appendChild(root);stage.appendChild(bp);stage.appendChild(bn);
function poster(){var P=window.MMVideo&&MMVideo.poster&&MMVideo.poster("intro");stage.style.setProperty("--poster",P?'url("'+P+'")':"none")}
function paintChips(){var t=T[lg()];chips.textContent="";CH.forEach(function(c,i){var b=el("button","sty-chip"+(i===cur?" on":""),t.ch[i]);b.type="button";b.onclick=function(){open(i)};chips.appendChild(b)});big.textContent="▶ "+(cur>=CH.length?T[lg()].replay:T[lg()].play)}
function clearStage(){clearTimeout(timer);if(vid){try{vid.pause()}catch(_){}vid.remove();vid=null;duck(false)}stage.querySelectorAll(".sty-img").forEach(function(x){x.remove()});bar.textContent=""}
function open(i){
  if(i<0)i=0;if(i>=CH.length){stopAll();cur=CH.length;paintChips();big.style.display="";return}
  clearStage();cur=i;slide=0;playing=true;stage.classList.add("on");big.style.display="none";paintChips();ttl.textContent=T[lg()].ti[i];
  var c=CH[i];if(c.c)comic();else video(c.v)}
function stopAll(){clearStage();playing=false;stage.classList.remove("on");big.style.display=""}
function video(k){
  var V=window.MMVideo;if(!V||!V.has(k)){open(cur+1);return}
  vid=document.createElement("video");vid.className="sty-vid";vid.src=V.url(k);vid.poster=V.poster(k);vid.controls=true;vid.playsInline=true;vid.preload="auto";vid.setAttribute("controlslist","nodownload");
  vid.onplay=function(){duck(true)};vid.onpause=function(){duck(false)};vid.onended=function(){duck(false);setTimeout(function(){if(playing&&cur>=0)open(cur+1)},400)};
  stage.insertBefore(vid,ttl);var p=vid.play();if(p&&p.catch)p.catch(function(){})}
function comic(){
  var pics=(window.MM_COMICS&&MM_COMICS[CH[cur].c])||[];if(!pics.length){open(cur+1);return}
  bar.textContent="";pics.forEach(function(){var s=el("i","sty-seg");s.appendChild(el("b"));bar.appendChild(s)});show(0,1)}
function show(n,dir){
  var pics=MM_COMICS[CH[cur].c];if(n<0){if(cur>0)open(cur-1);return}if(n>=pics.length){open(cur+1);return}
  var old=stage.querySelector(".sty-img.cur"),im=el("div","sty-img kb"+(n%4));im.style.backgroundImage='url("'+pics[n]+'")';stage.insertBefore(im,ttl);
  if(old){old.classList.remove("cur");old.classList.add("out");setTimeout(function(){old.remove()},800)}
  requestAnimationFrame(function(){im.classList.add("cur")});slide=n;
  [].forEach.call(bar.children,function(s,j){var b=s.firstChild;b.style.transition="none";b.style.width=j<n?"100%":"0%"});
  var b=bar.children[n].firstChild;void b.offsetWidth;b.style.transition="width "+SL+"ms linear";b.style.width="100%";
  clearTimeout(timer);timer=setTimeout(function(){if(playing)show(n+1,1)},SL)}
big.onclick=function(){open(cur>=CH.length||cur<0?0:cur)};
bn.onclick=function(){if(!playing)return open(0);if(CH[cur].c)show(slide+1,1);else open(cur+1)};
bp.onclick=function(){if(!playing)return;if(CH[cur].c)show(slide-1,-1);else open(cur-1)};
stage.addEventListener("keydown",function(e){if(e.key==="ArrowRight")bn.click();if(e.key==="ArrowLeft")bp.click()});
stage.tabIndex=0;var tx=null;stage.addEventListener("touchstart",function(e){tx=e.touches[0].clientX},{passive:true});stage.addEventListener("touchend",function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>50){(dx<0?bn:bp).click()}},{passive:true});
if("IntersectionObserver" in window)new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting&&playing)stopAll(),cur=-1,paintChips()})},{threshold:.05}).observe(root);
document.addEventListener("mmlang",function(){paintChips();if(cur>=0&&cur<CH.length)ttl.textContent=T[lg()].ti[cur]});
poster();paintChips();
})();
