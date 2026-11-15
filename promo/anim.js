const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const P=(t,a,b)=>clamp((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3);
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eob=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const lerp=(a,b,x)=>a+(b-a)*x;
const NS="http://www.w3.org/2000/svg";
const $=s=>document.querySelector(s);

function el(parent,cls,css,html){const d=document.createElement("div");if(cls)d.className=cls;if(css)d.style.cssText=css;if(html!=null)d.innerHTML=html;parent.appendChild(d);return d}
function svg(parent,css,vb,inner){const s=document.createElementNS(NS,"svg");s.setAttribute("viewBox",vb);s.style.cssText="position:absolute;"+css;s.innerHTML=inner;parent.appendChild(s);return s}

function line(parent,css,parts){
  const d=el(parent,"abs big",css),ws=[];
  parts.forEach(p=>{
    const txt=typeof p==="string"?p:p[0],cls=typeof p==="string"?"":p[1];
    txt.split(/(?<= )/).forEach(w=>{const s=document.createElement("span");s.className="w "+cls;s.textContent=w;d.appendChild(s);ws.push(s)});
  });
  return {d,ws};
}
function reveal(L,t,t0,step=.1,dur=.55){
  L.ws.forEach((s,i)=>{
    const a=t0+i*step,e=eob(P(t,a,a+dur)),o=clamp(P(t,a,a+dur*.5));
    s.style.opacity=o;s.style.transform=`translateY(${(1-e)*56}px) scale(${.94+.06*e})`;s.style.filter=o<1?`blur(${(1-o)*10}px)`:"none";
  });
}
function gone(L,t,a,b){const x=eio(P(t,a,b));L.d.style.opacity=1-x;L.d.style.transform=`translateY(${-60*x}px)`}
function fadeIn(d,t,a,b,dy=40){const e=eo(P(t,a,b));d.style.opacity=e;d.style.transform=`translateY(${(1-e)*dy}px)`}
function stars(parent,n,seed){
  let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647,out=[];
  for(let i=0;i<n;i++){const d=el(parent,"abs",`left:${rnd()*1920}px;top:${rnd()*1080}px;width:${2+rnd()*3}px;height:${2+rnd()*3}px;border-radius:50%;background:#f4e7d4`);out.push([d,rnd()*6,.2+rnd()*.7])}
  return t=>out.forEach(([d,ph,a])=>d.style.opacity=a*(.55+.45*Math.sin(t*1.4+ph)));
}

const ICON={
  bolt:c=>`<polygon points="58,6 20,56 45,56 38,94 80,40 54,40" fill="${c}"/>`,
  o2:c=>`<circle cx="46" cy="58" r="30" fill="none" stroke="${c}" stroke-width="8"/><text x="46" y="69" font-size="30" font-weight="800" text-anchor="middle" fill="${c}" font-family="Inter">O₂</text><circle cx="82" cy="22" r="10" fill="none" stroke="${c}" stroke-width="6"/><circle cx="68" cy="8" r="5" fill="none" stroke="${c}" stroke-width="5"/>`,
  rad:c=>{let s="";for(let i=0;i<3;i++){const a=(-90+i*120)*Math.PI/180,a1=a-Math.PI/6,a2=a+Math.PI/6,R=42,r=14,p=(g,q)=>[50+q*Math.cos(g),50+q*Math.sin(g)].map(v=>v.toFixed(1)).join(" ");s+=`<path d="M${p(a1,r)} L${p(a1,R)} A${R} ${R} 0 0 1 ${p(a2,R)} L${p(a2,r)} A${r} ${r} 0 0 0 ${p(a1,r)}Z" fill="${c}"/>`}return s+`<circle cx="50" cy="50" r="8" fill="${c}"/>`},
  sprout:c=>`<path d="M50 94V52" stroke="${c}" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M50 62C26 62 14 48 14 28C38 28 50 40 50 62Z" fill="${c}"/><path d="M50 50C74 50 86 36 86 16C62 16 50 28 50 50Z" fill="${c}"/>`
};

const T={s1:[0,6.2],s2:[6.2,13.4],s3:[13.4,22.6],s4:[22.6,30.6],s5:[30.6,39.2],s6:[39.2,44.4],s7:[44.4,51]};
const TOTAL=51,light={s1:1,s3:1,s5:1};
const upd={};

function phone(parent,imgs,css){
  const p=el(parent,"phone",css);
  return {p,im:imgs.map(src=>{const i=document.createElement("img");i.src=src;p.appendChild(i);return i})};
}
function callout(parent,text,x,y,tx,ty){
  const pill=el(parent,"pill",`left:${x}px;top:${y}px`,text),sy=y+33;
  const w=Math.hypot(tx-x,ty-sy),ang=Math.atan2(ty-sy,tx-x);
  const ln=el(parent,"abs",`left:${x}px;top:${sy-2}px;height:4px;width:0;background:#c4562e;transform-origin:0 50%;transform:rotate(${ang}rad);border-radius:2px`);
  const dot=el(parent,"dot",`left:${tx}px;top:${ty}px`);
  return (t,a,b)=>{
    const out=1-P(t,b,b+.3),e=eob(P(t,a,a+.5)),l=eio(P(t,a+.25,a+.65))*out;
    pill.style.opacity=clamp(e)*out;pill.style.transform=`translateX(${(1-e)*60}px)`;
    ln.style.width=w*l+"px";dot.style.opacity=l;dot.style.transform=`scale(${l})`;
  };
}

/* 1: hook */
(()=>{
  const r=$("#s1");
  const a=line(r,"left:110px;top:300px;font-size:104px;",["Space lessons are usually"]);
  const b=line(r,"left:110px;top:430px;font-size:190px;",[["slides.","acc"]]);
  const strike=el(r,"abs","left:106px;top:552px;height:14px;width:0;background:#c4562e;border-radius:7px;transform:rotate(-2deg);transform-origin:0 0");
  const c1=line(r,"left:110px;top:200px;font-size:86px;color:#6f4a3c",["Ours makes you"]);
  const c2=line(r,"left:110px;top:310px;font-size:210px;",["survive"]);
  const c3=line(r,"left:110px;top:530px;font-size:210px;",[["30 days","acc"]]);
  const c4=line(r,"left:110px;top:750px;font-size:210px;",["on ",["Mars.","acc"]]);
  const tag=el(r,"abs mono","left:116px;top:985px;color:#6f4a3c;font-size:18px","A Mars base trainer for students");
  upd.s1=t=>{
    reveal(a,t,.25,.14);reveal(b,t,1.1,.1,.6);
    strike.style.width=520*eio(P(t,2.35,2.8))+"px";
    b.d.style.opacity=lerp(1,.35,P(t,2.4,2.9));
    gone(a,t,3.2,3.6);gone(b,t,3.2,3.6);strike.style.opacity=1-P(t,3.2,3.5);
    if(t<3.2){[a,b].forEach(x=>x.d.style.visibility="visible");[c1,c2,c3,c4].forEach(x=>x.d.style.visibility="hidden");tag.style.opacity=0}
    else{[a,b].forEach(x=>x.d.style.visibility=t>3.7?"hidden":"visible");[c1,c2,c3,c4].forEach(x=>x.d.style.visibility="visible")}
    reveal(c1,t,3.65,.08,.5);reveal(c2,t,3.95,.1,.6);reveal(c3,t,4.35,.1,.6);reveal(c4,t,4.8,.1,.6);
    if(t>=3.2)fadeIn(tag,t,5.4,5.9,16);
  };
})();

/* 2: four systems */
(()=>{
  const r=$("#s2"),st=stars(r,90,7);
  const h=line(r,"left:110px;top:150px;font-size:120px;",["You run the ",["base.","acc"]]);
  const defs=[["Power","#ffd24a","bolt",70,0],["Life support","#8fd0ff","o2",78,1.3],["Radiation shield","#ff6a55","rad",42,2.1],["Food","#6cc070","sprout",64,3.4]];
  const g=defs.map(([lab,col,ic,val,ph],i)=>{
    const w=el(r,"abs",`left:${150+i*412}px;top:380px;width:340px;height:520px`);
    svg(w,"left:0;top:0;width:340px;height:340px","0 0 340 340",`<circle cx="170" cy="170" r="140" fill="none" stroke="rgba(244,231,212,.12)" stroke-width="22"/><circle class="arc" cx="170" cy="170" r="140" fill="none" stroke="${col}" stroke-width="22" stroke-linecap="round" transform="rotate(-90 170 170)" stroke-dasharray="880" stroke-dashoffset="880"/>`);
    svg(w,"left:105px;top:105px;width:130px;height:130px","0 0 100 100",ICON[ic](col));
    const num=el(w,"abs big",`left:0;top:362px;width:340px;text-align:center;font-size:72px;color:${col}`,"0%");
    el(w,"abs",`left:0;top:450px;width:340px;text-align:center;font:600 30px Inter;color:#b99a86`,lab);
    return {w,arc:w.querySelector(".arc"),num,col,val,ph,i};
  });
  const sub=line(r,"left:110px;top:940px;font-size:50px;color:#b99a86",["Four systems. One crew. ",["No perfect answer.","acc"]]);
  const alert=el(r,"abs","left:1050px;top:112px;width:760px;padding:24px 36px;border-radius:26px;background:#ff6a55;color:#1b0c12;font:800 44px Inter;letter-spacing:-.02em;display:flex;gap:20px;align-items:center","<span style='font-size:54px'>☢</span>Solar storm incoming");
  const glow=el(r,"abs","left:0;top:0;width:1920px;height:1080px;background:radial-gradient(circle at 1070px 560px,rgba(255,80,60,.5),transparent 520px);opacity:0");
  upd.s2=t=>{
    st(t);reveal(h,t,.2,.14);
    g.forEach(o=>{
      const e=eob(P(t,.9+o.i*.18,1.6+o.i*.18));
      o.w.style.opacity=clamp(e);
      let v=o.val+Math.sin(t*1.2+o.ph)*5*P(t,2.2,3),shake=0;
      if(o.i===2){const hit=eio(P(t,4.6,5.4));v=lerp(v,14,hit);shake=Math.sin(t*60)*8*(P(t,4.6,4.8)*(1-P(t,5.2,5.8)));o.arc.style.stroke=hit>.3?"#ff3b30":o.col;o.num.style.color=hit>.3?"#ff6a55":o.col}
      o.w.style.transform=`translate(${shake}px,${(1-e)*80}px) scale(${.85+.15*e})`;
      const shown=v*eo(P(t,1.1+o.i*.18,2.1+o.i*.18));
      o.arc.style.strokeDashoffset=880*(1-shown/100*.96);o.num.textContent=Math.round(shown)+"%";
    });
    reveal(sub,t,3.1,.09,.5);
    const a=eob(P(t,4.2,4.8));alert.style.opacity=clamp(a);alert.style.transform=`translateY(${(1-a)*-120}px)`;
    glow.style.opacity=.9*Math.sin(P(t,4.4,6.4)*Math.PI);
    sub.d.style.opacity=1-P(t,4.3,4.7)*.7;
  };
})();

/* 3: choices and why */
(()=>{
  const r=$("#s3"),S=1.06,PL=1030,PT=44,K=S*414/390;
  const pt=(x,y)=>[PL+x*K,PT+y*K];
  const h1=line(r,"left:110px;top:230px;font-size:132px;",["Every choice"]);
  const h2=line(r,"left:110px;top:372px;font-size:132px;",["has ",["a price.","acc"]]);
  const sub=el(r,"abs","left:116px;top:580px;width:780px;font:600 40px/1.35 Inter;color:#6f4a3c","30 events. 23 of them are based on real cases.");
  const j1=line(r,"left:110px;top:230px;font-size:132px;",["Then it"]);
  const j2=line(r,"left:110px;top:372px;font-size:132px;",["tells you ",["why.","acc"]]);
  const sub2=el(r,"abs","left:116px;top:580px;width:780px;font:600 40px/1.35 Inter;color:#6f4a3c","After each decision: what happened, and the real story behind it.");
  const ph=phone(r,["shots/g_event.png","shots/g_after.png"],`left:${PL}px;top:${PT}px;transform:scale(${S})`);
  const c=[
    callout(r,"<b>REAL CASE</b> badge",1500,262,...pt(161,262)),
    callout(r,"Ask Earth: <b>limited hints</b>",1500,392,...pt(196,361)),
    callout(r,"Every option <b>has a cost</b>",1500,522,...pt(170,448)),
    callout(r,"<b>Why</b> did it end like this?",1470,262,...pt(150,371)),
    callout(r,"A <b>true</b> space story",1500,522,...pt(150,520))
  ];
  upd.s3=t=>{
    reveal(h1,t,.2,.1);reveal(h2,t,.45,.12);fadeIn(sub,t,1.2,1.7,24);
    const swap=eio(P(t,4.9,5.5));
    gone(h1,t,4.7,5.1);gone(h2,t,4.7,5.1);sub.style.opacity=eo(P(t,1.2,1.7))*(1-P(t,4.7,5.0));
    const on=t>=5.2;[j1,j2].forEach(x=>x.d.style.visibility=on?"visible":"hidden");
    reveal(j1,t,5.3,.1);reveal(j2,t,5.5,.1);sub2.style.opacity=on?eo(P(t,6.1,6.6)):0;sub2.style.transform=`translateY(${(1-eo(P(t,6.1,6.6)))*24}px)`;
    const pe=eob(P(t,.5,1.3));ph.p.style.opacity=clamp(pe);ph.p.style.left=PL+(1-pe)*520+"px";
    ph.im[0].style.opacity=1-swap;ph.im[1].style.opacity=swap;
    c[0](t,2.2,4.6);c[1](t,2.8,4.6);c[2](t,3.4,4.6);c[3](t,6.2,99);c[4](t,6.9,99);
  };
})();

/* 4: NASA twins */
(()=>{
  const r=$("#s4"),st=stars(r,80,21);
  const h1=line(r,"left:110px;top:120px;font-size:104px;",["Every building has"]);
  const h2=line(r,"left:110px;top:232px;font-size:104px;",["a ",["NASA twin.","acc"]]);
  const rows=[["Solar panels","ISS solar arrays"],["Air scrubbers","ISS life support (ECLSS)"],["Water filters","ISS Water Processor"],["Greenhouse","Veggie, the ISS garden"],["MOXIE oxygen unit","MOXIE on Perseverance"],["Micro nuclear reactor","Fission Surface Power"]];
  const R=rows.map(([a,b],i)=>{
    const d=el(r,"row",`top:${385+i*101}px`),l=el(d,"",null,a),m=el(d,"","position:relative;flex:1;height:4px;margin:0 36px;background:rgba(244,231,212,.12);border-radius:2px"),
      bar=el(m,"","position:absolute;left:0;top:0;height:4px;width:100%;background:#c4562e;transform-origin:0 50%;transform:scaleX(0);border-radius:2px"),
      dot=el(m,"","position:absolute;top:2px;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;background:#eaa45c;box-shadow:0 0 18px #eaa45c"),
      rt=el(d,"tw",null,b);
    return {d,l,bar,dot,rt,i};
  });
  const note=el(r,"abs","left:116px;top:1000px;font:600 26px Inter;color:#b99a86;letter-spacing:.02em","14 buildings, each linked to real NASA work. Some already fly, some are still ideas.");
  upd.s4=t=>{
    st(t);reveal(h1,t,.2,.1);reveal(h2,t,.55,.12);
    R.forEach(o=>{
      const a=1.5+o.i*.55,e=eo(P(t,a,a+.5)),k=eio(P(t,a+.2,a+.85));
      o.d.style.opacity=e;o.d.style.transform=`translateX(${(1-e)*-80}px)`;
      o.bar.style.transform=`scaleX(${k})`;o.dot.style.left=k*100+"%";o.dot.style.opacity=k>0&&k<1?1:(k>=1?.9:0);
      o.rt.style.opacity=eo(P(t,a+.55,a+.95));o.rt.style.transform=`translateX(${(1-eo(P(t,a+.55,a+.95)))*40}px)`;
    });
    fadeIn(note,t,5.4,6,12);
  };
})();

/* 5: QR cards */
(()=>{
  const r=$("#s5"),S=1.06,PL=330,PT=44;
  const ph=phone(r,["shots/q_desk.png","shots/q_sheet.png","shots/q_sheet2.png"],`left:${PL}px;top:${PT}px;transform:scale(${S})`);
  const h1=line(r,"left:960px;top:150px;font-size:146px;",["Scan. Learn."]);
  const h2=line(r,"left:960px;top:305px;font-size:146px;",[["Level up.","acc"]]);
  const stats=[["48","QR topics"],["5","languages"],["23","real cases"]].map(([n,l],i)=>{
    const d=el(r,"stat abs",`left:${960+i*300}px;top:580px`,`<b>${n}</b><span>${l}</span>`);return {d,b:d.querySelector("b"),n:+n,i};
  });
  const sub=el(r,"abs","left:966px;top:800px;width:880px;font:600 42px/1.35 Inter;color:#2a1218","Read a card, unlock a bonus in the game.");
  upd.s5=t=>{
    reveal(h1,t,.2,.12);reveal(h2,t,.6,.12);
    const pe=eob(P(t,.3,1.1));ph.p.style.opacity=clamp(pe);ph.p.style.left=PL+(1-pe)*-520+"px";
    const a=eio(P(t,3.3,3.9)),b=eio(P(t,5.6,6.2));
    ph.im[0].style.opacity=1-a;ph.im[1].style.opacity=a*(1-b);ph.im[2].style.opacity=b;
    stats.forEach(o=>{const s=1.4+o.i*.3,e=eo(P(t,s,s+.6));o.d.style.opacity=e;o.d.style.transform=`translateY(${(1-e)*50}px)`;o.b.textContent=Math.round(o.n*eo(P(t,s,s+1.1)))});
    fadeIn(sub,t,3.2,3.8,24);
  };
})();

/* 6: offline */
(()=>{
  const r=$("#s6"),st=stars(r,70,33);
  const h1=line(r,"left:110px;top:220px;font-size:150px;",["No internet?"]);
  const h2=line(r,"left:110px;top:380px;font-size:150px;",[["No problem.","acc"]]);
  const wf=svg(r,"left:1280px;top:260px;width:420px;height:420px","-200 -200 400 400",
    [60,120,180].map(R=>`<path class="a" d="M${-R*Math.sin(.8)} ${-R*Math.cos(.8)+90} A${R} ${R} 0 0 1 ${R*Math.sin(.8)} ${-R*Math.cos(.8)+90}" fill="none" stroke="#f4e7d4" stroke-width="22" stroke-linecap="round"/>`).join("")+`<circle cx="0" cy="90" r="16" fill="#f4e7d4"/><line class="sl" x1="-170" y1="-150" x2="170" y2="170" stroke="#e8743c" stroke-width="26" stroke-linecap="round" stroke-dasharray="520" stroke-dashoffset="520"/>`);
  const arcs=[...wf.querySelectorAll(".a")],sl=wf.querySelector(".sl");
  const c1=el(r,"chip","left:110px;top:700px","Installs like an app"),c2=el(r,"chip","left:110px;top:820px","Works in airplane mode");
  upd.s6=t=>{
    st(t);reveal(h1,t,.2,.12);reveal(h2,t,.55,.12);
    arcs.forEach((a,i)=>{const e=eob(P(t,.5+i*.15,1+i*.15));a.style.opacity=clamp(e)*(1-.7*eio(P(t,2,2.4)))});
    sl.style.strokeDashoffset=520*(1-eio(P(t,2.0,2.5)));
    [c1,c2].forEach((c,i)=>{const e=eob(P(t,2.6+i*.35,3.2+i*.35));c.style.opacity=clamp(e);c.style.transform=`translateX(${(1-e)*-80}px)`});
  };
})();

/* 7: title */
(()=>{
  const r=$("#s7"),st=stars(r,120,55);
  const pl=el(r,"abs","left:150px;top:230px;width:620px;height:620px;border-radius:50%;overflow:hidden;background:#c4562e;box-shadow:0 0 120px 30px rgba(232,116,60,.28)");
  const surf=el(pl,"abs","left:0;top:0;width:2480px;height:620px;background:linear-gradient(180deg,#a8482a 0%,#d8693a 30%,#c4562e 60%,#8a3a22 100%)");
  const cr=[[100,160,70],[330,380,46],[520,120,34],[700,300,90],[880,470,40],[1040,150,60],[1210,360,52]];
  [0,1240].forEach(off=>cr.forEach(([x,y,s])=>el(surf,"abs",`left:${x+off-s}px;top:${y-s}px;width:${s*2}px;height:${s*2}px;border-radius:50%;background:radial-gradient(circle at 60% 60%,rgba(255,170,110,.25),rgba(80,26,16,.55))`)));
  el(pl,"abs","inset:0;border-radius:50%;background:radial-gradient(circle at 32% 30%,rgba(255,200,150,.25),rgba(0,0,0,0) 45%,rgba(10,2,6,.78) 100%)");
  const ring=svg(r,"left:60px;top:140px;width:800px;height:800px","0 0 800 800",`<ellipse cx="400" cy="400" rx="380" ry="95" fill="none" stroke="rgba(244,231,212,.4)" stroke-width="3" transform="rotate(-20 400 400)"/>`);
  const sat=el(r,"abs","width:26px;height:26px;border-radius:50%;background:#f4e7d4;box-shadow:0 0 16px #f4e7d4;margin:-13px 0 0 -13px");
  const L1=line(r,"left:900px;top:250px;font-size:190px;",["MISSION:"]);
  const L2=line(r,"left:900px;top:430px;font-size:190px;color:#e8743c",["MARS"]);
  const tag=line(r,"left:906px;top:670px;font-size:64px;font-weight:600;",["Build. Survive. ",["Explore.","acc"]]);
  const s1=el(r,"abs","left:910px;top:810px;width:900px;font:600 30px/1.4 Inter;color:#b99a86","NASA Space Apps Challenge<br>Build a Junior Astronaut Mission Trainer");
  const s2=el(r,"abs","left:910px;top:945px;font:600 22px Inter;color:#7b5a4b;letter-spacing:.06em","Animation made with code, with AI assistance");
  upd.s7=t=>{
    st(t);
    const pe=eob(P(t,.1,1.1));pl.style.opacity=clamp(pe);pl.style.transform=`scale(${.7+.3*pe})`;ring.style.opacity=clamp(pe);
    surf.style.transform=`translateX(${-((t*46)%1240)}px)`;
    const ang=t*.9;sat.style.left=400+60+380*Math.cos(ang)*Math.cos(-.35)-95*Math.sin(ang)*Math.sin(-.35)+"px";
    sat.style.top=400+140+380*Math.cos(ang)*Math.sin(-.35)+95*Math.sin(ang)*Math.cos(-.35)+"px";sat.style.opacity=clamp(pe);
    reveal(L1,t,.5,.06,.6);reveal(L2,t,.9,.06,.6);reveal(tag,t,1.7,.12,.55);
    fadeIn(s1,t,2.6,3.2,20);fadeIn(s2,t,3.2,3.8,12);
  };
})();

/* engine */
function render(t){
  const names=Object.keys(T);let cur=names[names.length-1];
  for(const n of names)if(t>=T[n][0]&&t<T[n][1]){cur=n;break}
  names.forEach(n=>{$("#"+n).style.display=n===cur?"block":"none"});
  upd[cur](t-T[cur][0]);
  const hud=$("#hud");hud.style.color=light[cur]?"#2a1218":"#f4e7d4";
  $("#bar i").style.width=100*t/TOTAL+"%";$("#bar i").style.background=light[cur]?"#c4562e":"#e8743c";
  const bounds=names.slice(1).map(n=>T[n][0]);
  for(const [id,lag] of [["wipeA",0],["wipeB",.1]]){
    const w=$("#"+id);let x=null;
    for(const b of bounds){const p=P(t,b-.32+lag,b+.32+lag);if(p>0&&p<1){x=lerp(-2100,1920,eio(p));break}}
    if(x===null)w.style.display="none";else{w.style.display="block";w.style.transform=`translateX(${x}px)`}
  }
}
window.render=render;window.TOTAL=TOTAL;
const qs=new URLSearchParams(location.search);
if(qs.has("t"))document.fonts.ready.then(()=>render(+qs.get("t")));
else if(!qs.has("manual")){const t0=performance.now();document.fonts.ready.then(()=>{const f=()=>{render(((performance.now()-t0)/1000)%TOTAL);requestAnimationFrame(f)};f()})}
