/* Safe HTML rendering.
 *
 * The site builds its screens from template strings. All text comes from our own data files, but one
 * mistake (an unescaped value, a bad translation) would turn into script injection. This file is the
 * single choke point: every `element.innerHTML = ...` goes through sanitize() first, so scripts, inline
 * event handlers, javascript: links and foreign embeds can never reach the page. The Content-Security-Policy
 * in index.html blocks the same things a second time at the browser level.
 *
 * Also exports MM.esc() for escaping plain text and MM.h() for building elements without strings.
 */
(function(){
"use strict";
const DENY=new Set(["SCRIPT","STYLE","LINK","META","BASE","OBJECT","EMBED","FOREIGNOBJECT","ANIMATE","SET","ANIMATETRANSFORM","ANIMATEMOTION","USE","IFRAME","FRAME","FRAMESET","APPLET"]);
const URL_ATTR=new Set(["href","src","xlink:href","action","formaction","poster","data"]);
const YT=/^https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[\w-]{6,20}(\?[\w=&%-]*)?$/;
const SAFE_URL=/^(?:https?:|mailto:|tel:|#|\/|\.\/|\.\.\/|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);|blob:|[\w][\w./%-]*(?:\?[^:]*)?$)/i;

function cleanAttrs(el){
  for(const a of Array.from(el.attributes)){
    const n=a.name.toLowerCase(),v=a.value;
    if(n.startsWith("on")||n==="srcdoc"){el.removeAttribute(a.name);continue}
    if(URL_ATTR.has(n)){
      const val=v.replace(/[\u0000- ]/g,"");
      if(!SAFE_URL.test(val)){el.removeAttribute(a.name);continue}
    }
    if(n==="style"&&/expression\s*\(|javascript:|@import|url\(\s*["']?\s*(?:javascript|data:text)/i.test(v))el.removeAttribute(a.name);
  }
}
function walk(node){
  for(const c of Array.from(node.childNodes)){
    if(c.nodeType===1){
      const tag=c.tagName.toUpperCase();
      if(tag==="IFRAME"&&YT.test(c.getAttribute("src")||"")){
        cleanAttrs(c);c.setAttribute("referrerpolicy","no-referrer");c.setAttribute("sandbox","allow-scripts allow-same-origin allow-presentation");walk(c);continue;
      }
      if(DENY.has(tag)){c.remove();continue}
      cleanAttrs(c);walk(c);
    }else if(c.nodeType!==3){c.remove()}
  }
}
const desc=Object.getOwnPropertyDescriptor(Element.prototype,"innerHTML");
let tpl=null;
function sanitize(html){
  if(html==null||html==="")return null;
  tpl=tpl||document.createElement("template");
  desc.set.call(tpl,String(html)); /* native setter: parse inertly, nothing runs */
  const frag=tpl.content;walk(frag);
  return frag;
}
/* innerHTML on every element goes through the sanitizer */
if(desc&&desc.set&&!Element.prototype.__mmSafe){
  Object.defineProperty(Element.prototype,"innerHTML",{
    configurable:true,enumerable:desc.enumerable,
    get:desc.get,
    set(v){
      const f=sanitize(v);
      if(f===null){desc.set.call(this,"");return}
      if(this.tagName==="TEMPLATE"){desc.set.call(this,v);return}
      desc.set.call(this,"");this.appendChild(f);
    }
  });
  Object.defineProperty(Element.prototype,"__mmSafe",{value:true});
}
const ESC={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>ESC[c]);
/* tiny element builder: h("button",{class:"x",onclick:fn},"text",child) */
function h(tag,attrs,...kids){
  const el=document.createElement(tag);
  for(const k in (attrs||{})){
    const v=attrs[k];if(v==null||v===false)continue;
    if(k.startsWith("on")&&typeof v==="function")el.addEventListener(k.slice(2),v);
    else if(k==="class")el.className=v;
    else if(k==="data")for(const d in v)el.dataset[d]=v[d];
    else el.setAttribute(k,v===true?"":v);
  }
  for(const c of kids.flat())if(c!=null&&c!==false)el.append(c.nodeType?c:document.createTextNode(String(c)));
  return el;
}
window.MM=Object.assign(window.MM||{},{esc,h,sanitize});
})();
