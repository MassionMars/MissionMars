/* MISSION MARS: performance helper. Visuals stay the same; work stops when it cannot be seen. */
(function(){
"use strict";
var de=document.documentElement,st=null;
var weak=false;
try{weak=(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)}catch(_){}
if(weak)de.classList.add("mm-lite");
function css(){var s=document.createElement("style");s.textContent=
"html.mm-hid *,html.mm-hid *::before,html.mm-hid *::after{animation-play-state:paused!important}"+
"html.mm-lite *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}"+
"img{content-visibility:auto}";
return s}
st=css();(document.head||de).appendChild(st);
function frames(){return Array.prototype.slice.call(document.querySelectorAll("iframe"))}
function apply(){
  var h=document.hidden;de.classList.toggle("mm-hid",h);
  frames().forEach(function(f){try{var d=f.contentDocument;if(!d)return;d.documentElement.classList.toggle("mm-hid",h);
    if(weak)d.documentElement.classList.add("mm-lite");
    if(!d.__mmPerf){d.__mmPerf=1;var s=d.createElement("style");s.textContent=st.textContent;(d.head||d.documentElement).appendChild(s)}}catch(_){}});
}
document.addEventListener("visibilitychange",apply);
document.addEventListener("load",function(e){if(e.target&&e.target.tagName==="IFRAME")apply()},true);
setInterval(function(){if(!document.hidden)apply()},4000);
/* lazy decode for images that are not yet marked */
function lazy(){Array.prototype.forEach.call(document.querySelectorAll("img:not([loading])"),function(i){i.loading="lazy";i.decoding="async"})}
if(document.readyState!=="loading")lazy();else document.addEventListener("DOMContentLoaded",lazy);
})();
