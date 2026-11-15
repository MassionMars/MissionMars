(function(){
"use strict";
const cv=document.getElementById("stars");if(!cv)return;
const cx=cv.getContext("2d"),body=document.body,still=matchMedia("(prefers-reduced-motion:reduce)").matches;
const NS="http://www.w3.org/2000/svg";
let W=0,H=0,dpr=1,mx=.5,my=.5,sx=.5,sy=.5,stars=[],shoot=[],met=[],parts=[],nextS=2500,nextM=4500,nextSat=14000,t0=performance.now();
const lite=()=>body.classList.contains("lite");
const TINT=["255,244,226","255,214,170","190,215,255","255,190,170","220,200,255"];

(function ground(){
  const g=document.getElementById("ground");if(!g)return;
  let rocks="",r=7;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647};
  for(let i=0;i<22;i++){
    const x=40+rnd()*1520,y=205+rnd()*80,s=7+rnd()*20+(y-205)*.18;
    const pts=[[-1,.2],[-.6,-.7],[.1,-1],[.8,-.5],[1,.3],[.4,.7],[-.5,.6]].map(p=>((x+p[0]*s*(.85+rnd()*.3)).toFixed(1)+","+(y+p[1]*s*.62*(.85+rnd()*.3)).toFixed(1))).join(" ");
    rocks+=`<polygon points="${pts}" fill="url(#gr${i%3})" stroke="#2b140d" stroke-width="2.4" stroke-linejoin="round"/><path d="M${(x-s*.55).toFixed(1)} ${(y-s*.1).toFixed(1)}L${(x-s*.1).toFixed(1)} ${(y-s*.5).toFixed(1)}" stroke="#ffd9bd" stroke-width="2" stroke-linecap="round" opacity=".55"/><ellipse cx="${(x+s*.25).toFixed(1)}" cy="${(y+s*.55).toFixed(1)}" rx="${(s*1.15).toFixed(1)}" ry="${(s*.22).toFixed(1)}" fill="#3a170c" opacity=".35"/>`;
  }
  let peb="";for(let i=0;i<90;i++){const x=rnd()*1600,y=190+rnd()*110,s=1.2+rnd()*3.2;peb+=`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${s.toFixed(1)}" ry="${(s*.6).toFixed(1)}" fill="${i%3?"#7a3118":"#e9a27c"}" opacity="${(.35+rnd()*.4).toFixed(2)}"/>`}
  let rip="";for(let i=0;i<7;i++){const y=215+i*13,a=8+i*2;rip+=`<path d="M-20 ${y}q200 -${a} 400 0t400 0t400 0t400 0t400 0" fill="none" stroke="#f0a98a" stroke-width="${1.2+i*.3}" opacity="${(.12+i*.03).toFixed(2)}"/>`}
  const crat=(x,y,rx)=>`<ellipse cx="${x}" cy="${y+3}" rx="${rx*1.06}" ry="${rx*.3}" fill="#f2b496" opacity=".6"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx*.3}" fill="#6b2616" stroke="#2b140d" stroke-width="2.4"/><ellipse cx="${x+rx*.1}" cy="${y+rx*.06}" rx="${rx*.8}" ry="${rx*.21}" fill="#8f3a22"/>`;
  g.innerHTML=`<svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" width="100%" height="100%"><defs>
   <linearGradient id="gd0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2f3d"/><stop offset="1" stop-color="#9a3f33"/></linearGradient>
   <linearGradient id="gd1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b34c36"/><stop offset="1" stop-color="#8e3523"/></linearGradient>
   <linearGradient id="gd2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7673f"/><stop offset=".5" stop-color="#b94b2c"/><stop offset="1" stop-color="#7d2d19"/></linearGradient>
   <linearGradient id="gr0" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d98a68"/><stop offset="1" stop-color="#8c3f27"/></linearGradient>
   <linearGradient id="gr1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c47a60"/><stop offset="1" stop-color="#6e2e1d"/></linearGradient>
   <linearGradient id="gr2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3a07c"/><stop offset="1" stop-color="#9d4a2e"/></linearGradient>
   <filter id="gtex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".011 .05" numOctaves="4" seed="7" result="n"/><feDiffuseLighting in="n" lighting-color="#ff9560" surfaceScale="3.6" result="l"><feDistantLight azimuth="235" elevation="52"/></feDiffuseLighting><feComposite in="l" in2="SourceGraphic" operator="in"/></filter>
   <filter id="gtex2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .25  0 0 0 0 .08  0 0 0 0 .04  0 0 0 1.4 -.45"/><feComposite in2="SourceGraphic" operator="in"/></filter>
   <clipPath id="gcl"><path id="gnear" d="M0 205Q220 168 470 196T930 190T1260 178T1600 196V300H0Z"/></clipPath></defs>
   <path d="M0 170Q200 120 430 158T850 150T1250 128T1600 160V300H0Z" fill="url(#gd0)" opacity=".85"/>
   <path d="M0 185Q260 140 560 176T1060 160T1600 178V300H0Z" fill="url(#gd1)"/>
   <path d="M0 205Q220 168 470 196T930 190T1260 178T1600 196V300H0Z" fill="url(#gd2)" stroke="#2b140d" stroke-width="3"/>
   <g clip-path="url(#gcl)"><rect x="0" y="150" width="1600" height="150" fill="#c8693f" filter="url(#gtex)" opacity=".42"/><rect x="0" y="150" width="1600" height="150" fill="#000" filter="url(#gtex2)" opacity=".5"/>${rip}${peb}${crat(300,262,70)}${crat(1180,270,92)}${crat(760,285,46)}</g>
   <path d="M0 205Q220 168 470 196T930 190T1260 178T1600 196" fill="none" stroke="#ffc7a4" stroke-width="2.2" opacity=".5" transform="translate(0 -2)"/>
   ${rocks}</svg>`;
})();

(function(){const g=document.getElementById("ground");if(!g)return;
  g.insertAdjacentHTML("beforeend",`<svg id="gx" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
   <g class="gx gx-about"><g class="gx-rover"><ellipse cx="0" cy="26" rx="44" ry="7" fill="#3a170c" opacity=".35"/><rect x="-34" y="-12" width="68" height="26" rx="8" fill="#f1e8dc" stroke="#2b140d" stroke-width="2.4"/><rect x="-26" y="-6" width="26" height="12" rx="3" fill="#7dc4e8" stroke="#2b140d" stroke-width="1.8"/><rect x="6" y="-8" width="20" height="8" fill="#e0763c" stroke="#2b140d" stroke-width="1.6"/><line x1="22" y1="-12" x2="26" y2="-34" stroke="#2b140d" stroke-width="2.4"/><circle cx="26" cy="-35" r="3.4" fill="#ff5a4a" class="gx-blink"/><g class="gx-wh"><circle cx="-22" cy="16" r="9" fill="#2b2522" stroke="#2b140d" stroke-width="2"/><circle cx="0" cy="16" r="9" fill="#2b2522" stroke="#2b140d" stroke-width="2"/><circle cx="22" cy="16" r="9" fill="#2b2522" stroke="#2b140d" stroke-width="2"/></g></g></g>
   <g class="gx gx-inside"><g class="gx-devil"><ellipse cx="0" cy="22" rx="46" ry="8" fill="#3a170c" opacity=".3"/><path d="M-6 20 Q-40 0 -26 -26 Q-12 -52 -34 -78 Q-6 -66 -2 -40 Q6 -20 -6 20Z" fill="#f0b48f" opacity=".5"/><path d="M0 20 Q34 -2 22 -30 Q8 -56 30 -84 Q4 -70 0 -44 Q-8 -20 0 20Z" fill="#ffd4b0" opacity=".45"/><ellipse cx="0" cy="-76" rx="36" ry="9" fill="#f0b48f" opacity=".4"/></g></g>
   <g class="gx gx-qr"><rect class="gx-scan" x="0" y="190" width="1600" height="3" fill="#ffd9a8" opacity=".85"/><rect class="gx-scanG" x="0" y="150" width="1600" height="44" fill="url(#gxg)" opacity=".5"/><defs><linearGradient id="gxg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a8" stop-opacity="0"/><stop offset="1" stop-color="#ffd9a8" stop-opacity=".55"/></linearGradient></defs>
     <g class="gx-pix"><rect x="300" y="210" width="10" height="10" fill="#fff3e0"/><rect x="560" y="230" width="8" height="8" fill="#ffd9a8"/><rect x="900" y="215" width="12" height="12" fill="#fff3e0"/><rect x="1180" y="235" width="9" height="9" fill="#ffd9a8"/><rect x="1420" y="220" width="10" height="10" fill="#fff3e0"/></g></g></svg>`);
})();

function size(){
  dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+"px";cv.style.height=H+"px";cx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.round(W*H/5200)*(lite()?.5:1);
  stars=Array.from({length:Math.min(260,Math.max(60,n|0))},()=>({x:Math.random()*W,y:Math.random()*H*.86,z:[.3,.6,1][(Math.random()*3)|0],r:.5+Math.random()*1.3,p:Math.random()*6.3,sp:.6+Math.random()*2.6,c:TINT[(Math.random()*TINT.length)|0]}));
}
size();addEventListener("resize",()=>{clearTimeout(size.t);size.t=setTimeout(size,150)});
addEventListener("pointermove",e=>{mx=e.clientX/innerWidth;my=e.clientY/innerHeight},{passive:true});

function addShoot(x,y,ang,fast){const sp=(fast?1.3:.85)+Math.random()*.4;shoot.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,age:0,life:fast?650:950,len:110+Math.random()*80})}
function addMeteor(){
  const fromRight=Math.random()<.65,y=Math.random()*H*.35,ang=fromRight?Math.PI-.35-Math.random()*.35:.35+Math.random()*.35;
  met.push({x:fromRight?W+60:-60,y,vx:Math.cos(ang)*.19,vy:Math.sin(ang)*.19,r:6+Math.random()*4,age:0,spin:Math.random()*6});
}
function spark(x,y,n,col){for(let i=0;i<n;i++){const a=Math.random()*6.3,s=.06+Math.random()*.28;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,life:500+Math.random()*600,r:1.5+Math.random()*2.5,c:col||"255,210,140"})}}

addEventListener("pointerdown",e=>{
  if(body.dataset.page==="game"||body.classList.contains("intro-on"))return;
  if(e.target.closest&&e.target.closest(".txt,.cc,.sh,.sec,.aic,.media,.seg,.codef,.slot,.team,.soon,.chip,.bar,.top,.sheet,.inrow,.ab.rv,.ptitle"))return;
  for(let i=met.length-1;i>=0;i--){
    const m=met[i];if(Math.hypot(e.clientX-m.x,e.clientY-m.y)<m.r+34){
      met.splice(i,1);spark(m.x,m.y,36,"255,196,120");spark(m.x,m.y,14,"255,255,255");
      if(window.MMX&&MMX.play)MMX.play("good");
      if(typeof burst==="function")burst(m.x,m.y,["☄️","✨","⭐"]);
      try{const n=(+localStorage.getItem("mm-meteors")||0)+1;localStorage.setItem("mm-meteors",n)}catch(_){}
      return}
  }
  if(!e.target.closest("button,a,input,.res,h1")){
    if(!still&&e.clientY<innerHeight*.7){addShoot(e.clientX,e.clientY,.5+Math.random()*.5,true);spark(e.clientX,e.clientY,6,"255,236,200");if(window.MMX&&MMX.play)MMX.play("tab")}
  }
},{passive:true});

function moon(x,y,r,tone){
  const g=cx.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r*1.05);g.addColorStop(0,"rgb("+tone[0]+")");g.addColorStop(1,"rgb("+tone[1]+")");
  cx.fillStyle=g;cx.beginPath();cx.ellipse(x,y,r*1.1,r*.92,.4,0,6.3);cx.fill();
  cx.fillStyle="rgba(40,20,30,.28)";[[.3,.1,.28],[-.35,-.25,.2],[-.05,.45,.16]].forEach(c=>{cx.beginPath();cx.arc(x+c[0]*r,y+c[1]*r,c[2]*r,0,6.3);cx.fill()});
  cx.strokeStyle="rgba(255,255,255,.22)";cx.lineWidth=1;cx.beginPath();cx.ellipse(x,y,r*1.1,r*.92,.4,0,6.3);cx.stroke();
}

let last=performance.now(),frame=0;
function tick(now){
  requestAnimationFrame(tick);
  if(document.hidden||body.classList.contains("intro-on"))return;
  const home=body.dataset.page!=="game";
  const dt=Math.min(50,now-last);last=now;frame++;
  if(!home)return;
  sx+=(mx-sx)*.05;sy+=(my-sy)*.05;
  cx.clearRect(0,0,W,H);
  const t=(now-t0)/1000;

  for(const s of stars){
    const px=s.x+(sx-.5)*s.z*-26,py=s.y+(sy-.5)*s.z*-16;
    let a=.45+.55*Math.sin(t*s.sp+s.p)*.5+.25;
    const d=Math.hypot(px-mx*W,py-my*H);if(d<110&&home)a+=(1-d/110)*.7;
    a=Math.max(.05,Math.min(1,a))*(home?1:.5);
    cx.fillStyle="rgba("+s.c+","+a.toFixed(2)+")";cx.beginPath();cx.arc(px,py,s.r*(d<110&&home?1.5:1),0,6.3);cx.fill();
    if(s.r>1.25&&!lite()){cx.fillStyle="rgba("+s.c+","+(a*.18).toFixed(3)+")";cx.beginPath();cx.arc(px,py,s.r*3.4,0,6.3);cx.fill();
      cx.strokeStyle="rgba("+s.c+","+(a*.4).toFixed(2)+")";cx.lineWidth=.7;cx.beginPath();cx.moveTo(px-s.r*3.2,py);cx.lineTo(px+s.r*3.2,py);cx.moveTo(px,py-s.r*3.2);cx.lineTo(px,py+s.r*3.2);cx.stroke()}
  }
  if(still||!home){ if(!home){cx.globalAlpha=1} return }


  nextS-=dt;if(nextS<=0){nextS=2200+Math.random()*4200;addShoot(Math.random()*W*.9,Math.random()*H*.4,.35+Math.random()*.5,false)}
  nextM-=dt;if(nextM<=0&&met.length<2){nextM=7000+Math.random()*7000;addMeteor()}
  nextSat-=dt;if(nextSat<=0){nextSat=26000+Math.random()*14000;met.push({sat:true,x:-30,y:H*(.15+Math.random()*.2),vx:.045,vy:.006,r:8,age:0})}

  for(let k=shoot.length-1;k>=0;k--){const m=shoot[k];m.age+=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;const f=1-m.age/m.life;if(f<=0){shoot.splice(k,1);continue}
    const L=m.len*f,g=cx.createLinearGradient(m.x,m.y,m.x-m.vx*L,m.y-m.vy*L);g.addColorStop(0,"rgba(255,248,230,"+f.toFixed(2)+")");g.addColorStop(1,"rgba(255,190,140,0)");
    cx.strokeStyle=g;cx.lineWidth=2;cx.lineCap="round";cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(m.x-m.vx*L,m.y-m.vy*L);cx.stroke()}

  for(let k=met.length-1;k>=0;k--){const m=met[k];m.age+=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;
    if(m.x<-120||m.x>W+120||m.y>H){met.splice(k,1);continue}
    if(m.sat){cx.fillStyle="rgba(255,255,255,.9)";cx.fillRect(m.x-3,m.y-1.5,6,3);cx.fillStyle="rgba(120,190,255,.9)";cx.fillRect(m.x-10,m.y-1,6,2);cx.fillRect(m.x+4,m.y-1,6,2);
      if(((m.age/450)|0)%2)(cx.fillStyle="rgba(255,90,80,.95)",cx.beginPath(),cx.arc(m.x,m.y-4,1.6,0,6.3),cx.fill());continue}
    const L=170,tx=m.x-m.vx*L,ty=m.y-m.vy*L,g=cx.createLinearGradient(m.x,m.y,tx,ty);
    g.addColorStop(0,"rgba(255,230,170,.95)");g.addColorStop(.35,"rgba(255,140,60,.55)");g.addColorStop(1,"rgba(255,90,40,0)");
    cx.strokeStyle=g;cx.lineCap="round";cx.lineWidth=m.r*1.7;cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(tx,ty);cx.stroke();
    const h=cx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r*3);h.addColorStop(0,"rgba(255,250,225,1)");h.addColorStop(.35,"rgba(255,190,100,.85)");h.addColorStop(1,"rgba(255,120,40,0)");
    cx.fillStyle=h;cx.beginPath();cx.arc(m.x,m.y,m.r*3,0,6.3);cx.fill();
    if(Math.random()<.5)parts.push({x:m.x,y:m.y,vx:(Math.random()-.5)*.03,vy:(Math.random()-.5)*.03,age:0,life:500,r:1.2+Math.random()*1.6,c:"255,170,90"})}

  for(let k=parts.length-1;k>=0;k--){const p=parts[k];p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.00012*dt;const f=1-p.age/p.life;if(f<=0){parts.splice(k,1);continue}
    cx.fillStyle="rgba("+p.c+","+f.toFixed(2)+")";cx.beginPath();cx.arc(p.x,p.y,p.r*f+.3,0,6.3);cx.fill()}
}
requestAnimationFrame(tick);
window.MMSky={meteors:()=>met.filter(m=>!m.sat).map(m=>({x:m.x,y:m.y})),spawn:()=>{addMeteor();const m=met[met.length-1];m.x=W*.5;m.y=H*.3;return{x:m.x,y:m.y}}};
})();
