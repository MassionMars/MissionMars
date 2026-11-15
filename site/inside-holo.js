/* v13: holographic "Inside the game" page: infographics instead of empty slots, holo mini-game tiles, knowledge base skin */
(function(){
"use strict";
var H=function(n,c){return window.MMHolo?MMHolo.ic(n,c):""};
var T={
 ru:{story:["Земля","Старт","Марс","База"],storyS:"15 солов на Марсе. Спаси базу и экипаж.",rules:["Проблема","Выбор","Результат"],rulesS:["Кризис или задача сола","Отсек и мини-игра","Что получили и потеряли"],upk:"Каждый сол база тратит",cr:"Кризисы",cards:"Карточки знаний",catS:["Космическая погода","Марс","Жизнеобеспечение","Луна","Люди","Телескопы","Энергия"],sols:"сол"},
 en:{story:["Earth","Launch","Mars","Base"],storyS:"15 sols on Mars. Save the base and the crew.",rules:["Problem","Choice","Result"],rulesS:["A crisis or the sol's task","A module and a mini-game","What you gained and lost"],upk:"Every sol the base uses",cr:"Crises",cards:"Knowledge cards",catS:["Space weather","Mars","Life support","Moon","People","Telescopes","Power"],sols:"sol"},
 tg:{story:["Замин","Парвоз","Миррих","Пойгоҳ"],storyS:"15 сол дар Миррих. Пойгоҳ ва экипажро наҷот деҳ.",rules:["Мушкил","Интихоб","Натиҷа"],rulesS:["Буҳрон ё вазифаи сол","Қисм ва бозии хурд","Чӣ гирифтед ва чӣ гум кардед"],upk:"Ҳар сол пойгоҳ сарф мекунад",cr:"Буҳронҳо",cards:"Корточкаҳои дониш",catS:["Обу ҳавои кайҳонӣ","Миррих","Таъмини ҳаёт","Моҳ","Одамон","Телескопҳо","Энергия"],sols:"сол"}};
var lg=function(){var l=window.__mmLang||document.documentElement.lang||"en";return T[l]?l:"en"};
var MG=["drop","greenhouse","science","heartbeat","wave","route","sun","tool","drop","sprout","life","syringe","atom","ice","lock","pin"];
function arrow(){return '<span class="ih-ar">'+H("arrow")+'</span>'}
function node(ic,l,c){return '<div class="ih-n" style="--c:'+(c||"#7ee7ff")+'"><div class="ih-i">'+H(ic)+'</div><b>'+l+'</b></div>'}
function s1(t){return '<div class="ih ih-story"><div class="ih-row">'+node("globe",t.story[0],"#7fd6ff")+arrow()+node("rocket",t.story[1],"#ffb98a")+arrow()+node("planet",t.story[2],"#ff9b6b")+arrow()+node("home",t.story[3],"#8dffb4")+'</div><div class="ih-cap">'+H("spark")+t.storyS+'</div></div>'}
function s2(t){var c=["#ff8f9c","#7ee7ff","#8dffb4"],ic=["warn","tap","trophy"];
 return '<div class="ih ih-rules"><div class="ih-row">'+[0,1,2].map(function(i){return '<div class="ih-n big" style="--c:'+c[i]+'"><div class="ih-i">'+H(ic[i])+'</div><b>'+t.rules[i]+'</b><em>'+t.rulesS[i]+'</em></div>'+(i<2?arrow():"")}).join("")+'</div>'+
 '<div class="ih-upk"><span>'+t.upk+'</span><i class="u">'+H("life")+'−10</i><i class="u">'+H("energy")+'−10</i><i class="u">'+H("shield")+'−10</i></div>'+
 '<div class="ih-upk"><span>'+t.cr+'</span><i class="u">'+H("storm")+'</i><i class="u">'+H("flare")+'</i><i class="u">'+H("dish")+'</i><i class="u">'+H("cold")+'</i></div></div>'}
function s3(t){var ic=["sun","planet","air","moon","grad","telescope","energy"],c=["#ffd27a","#ff9b6b","#aee6ff","#e6e0ff","#9fc9ff","#9fc9ff","#ffe27a"];
 return '<div class="ih ih-cards"><div class="ih-cat">'+t.catS.map(function(x,i){return '<div class="ih-n" style="--c:'+c[i]+'"><div class="ih-i">'+H(ic[i])+'</div><b>'+x+'</b></div>'}).join("")+'</div><div class="ih-cap">'+H("book")+t.cards+' · 53</div></div>'}
function paint(){
 var t=T[lg()],F={s1:s1,s2:s2,s3:s3};
 Object.keys(F).forEach(function(k){var sec=document.getElementById(k);if(!sec)return;var o=sec.querySelector(".ih"),slot=sec.querySelector(".slot");
  if(slot){var d=document.createElement("div");d.innerHTML=F[k](t);slot.replaceWith(d.firstChild)}
  else if(o){var d2=document.createElement("div");d2.innerHTML=F[k](t);o.replaceWith(d2.firstChild)}});
 document.querySelectorAll(".mgc").forEach(function(a,i){var m=a.querySelector(".mgi");if(m)m.innerHTML=H(MG[i]||"science")});
 var kb=document.querySelector(".kbi");if(kb)kb.innerHTML=H("book");var kg=document.querySelector(".kbg");if(kg)kg.innerHTML=H("arrow");
 ["#p-inside","#p-qr","#p-album","#p-game"].forEach(function(s){var e=document.querySelector(s);if(e&&window.MMHolo)MMHolo.scan(e)});
}
function init(){paint();document.addEventListener("mmlang",function(){setTimeout(paint,0)});
 ["#p-inside","#p-qr","#p-album","#p-game"].forEach(function(s){var e=document.querySelector(s);if(!e||!window.MutationObserver)return;var busy=0;
  new MutationObserver(function(){if(busy)return;busy=1;setTimeout(function(){MMHolo&&MMHolo.scan(e);busy=0},60)}).observe(e,{childList:true,subtree:true,characterData:true})})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(init,0)});else setTimeout(init,0);
})();
/* v14: title rings + top buttons get holographic icons */
(function(){
 var N=["life","energy","shield"];
 function rings(){var r=document.querySelectorAll("#tokens .res");if(!window.MMHolo)return;r.forEach(function(x,i){var ico=x.querySelector(".ico");if(ico&&!ico.dataset.h){ico.dataset.h=1;ico.innerHTML=MMHolo.ic(N[i]||"star");}});}
 function go(){rings();var t=document.getElementById("tokens");if(t&&window.MutationObserver)new MutationObserver(function(){setTimeout(rings,30)}).observe(t,{childList:true});var m=document.getElementById("mus"),sn=document.getElementById("snd");[m,sn].forEach(function(b,i){if(b&&window.MMHolo&&!b.dataset.h){b.dataset.h=1;b.innerHTML=MMHolo.ic(i?"energy":"star")}});}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(go,50)});else setTimeout(go,50);
})();
