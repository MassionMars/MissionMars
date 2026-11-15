/* MISSION MARS: link menu. Every external link (main page and game frames) opens this menu: copy / open. */
(function(){
"use strict";
var T={
en:{t:"Source link",s:"This link opens an external NASA page.",c:"Copy link",o:"Open link",x:"Close",ok:"Copied!",no:"Select and copy the link"},
ru:{t:"Ссылка на источник",s:"Эта ссылка откроет внешнюю страницу NASA.",c:"Скопировать ссылку",o:"Открыть ссылку",x:"Закрыть",ok:"Скопировано!",no:"Выделите и скопируйте ссылку"},
tg:{t:"Пайванд ба манбаъ",s:"Ин пайванд саҳифаи берунии NASA-ро мекушояд.",c:"Нусхабардории пайванд",o:"Кушодани пайванд",x:"Пӯшидан",ok:"Нусха шуд!",no:"Пайвандро ҷудо карда нусха кунед"}};
function lg(){var l=window.__mmLang||document.documentElement.getAttribute("lang")||"en";return T[l]?l:"en"}
function safe(u){try{var x=new URL(u,location.href);return(x.protocol==="https:"||x.protocol==="http:")?x.href:""}catch(_){return""}}
var ov=null;
function close(){if(ov){ov.remove();ov=null}}
function openLink(url,label){
  var u=safe(url);if(!u)return;close();var t=T[lg()];
  ov=document.createElement("div");ov.className="lkm";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
  var box=document.createElement("div");box.className="lkm-b";
  var h=document.createElement("h3");h.textContent=t.t;
  var p=document.createElement("p");p.textContent=label||t.s;
  var a=document.createElement("input");a.type="text";a.readOnly=true;a.value=u;a.className="lkm-u";a.setAttribute("aria-label",t.t);
  a.addEventListener("focus",function(){a.select()});
  var st=document.createElement("div");st.className="lkm-st";st.setAttribute("aria-live","polite");
  var row=document.createElement("div");row.className="lkm-r";
  var bc=document.createElement("button");bc.type="button";bc.textContent="⧉ "+t.c;
  bc.addEventListener("click",function(){
    function done(ok){st.textContent=ok?t.ok:t.no;if(!ok){a.focus();a.select()}}
    try{navigator.clipboard.writeText(u).then(function(){done(true)},function(){fb()})}catch(_){fb()}
    function fb(){try{a.focus();a.select();done(document.execCommand("copy"))}catch(_){done(false)}}
  });
  var bo=document.createElement("button");bo.type="button";bo.className="go";bo.textContent="↗ "+t.o;
  bo.addEventListener("click",function(){var w=window.open(u,"_blank","noopener,noreferrer");if(!w)location.href=u;close()});
  var bx=document.createElement("button");bx.type="button";bx.className="x";bx.textContent=t.x;bx.addEventListener("click",close);
  row.appendChild(bc);row.appendChild(bo);row.appendChild(bx);
  box.appendChild(h);box.appendChild(p);box.appendChild(a);box.appendChild(st);box.appendChild(row);ov.appendChild(box);
  ov.addEventListener("click",function(e){if(e.target===ov)close()});
  document.body.appendChild(ov);bo.focus();
}
function onClick(e){
  var n=e.target;while(n&&n.nodeType===1&&!(n.tagName==="A"&&n.getAttribute("href")))n=n.parentNode;
  if(!n||n.nodeType!==1)return;var h=n.getAttribute("href");
  if(!/^https?:/i.test(h))return;
  e.preventDefault();e.stopPropagation();
  var lab=n.getAttribute("data-lbl")||"";
  if(window===window.top||!window.parent)openLink(h,lab);
  else try{window.parent.postMessage({mmDune:"link",url:h,label:lab},"*")}catch(_){}
}
document.addEventListener("click",onClick,true);
addEventListener("keydown",function(e){if(e.key==="Escape"&&ov)close()});
window.openLink=openLink;
})();
