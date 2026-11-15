(function(){
"use strict";
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const KEY="mm-sound";
let on=true,ctx=null,master=null;
try{on=localStorage.getItem(KEY)!=="0"}catch(_){}

function audio(){
  if(!on)return null;
  if(!ctx){
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    try{ctx=new AC();master=ctx.createGain();master.gain.value=.16;master.connect(ctx.destination)}catch(_){ctx=null;return null}
  }
  if(ctx.state==="suspended")ctx.resume().catch(()=>{});
  return ctx;
}

function tone(f0,f1,dur,type,gain,delay){
  const c=audio();if(!c)return;
  const t0=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();
  o.type=type||"sine";o.frequency.setValueAtTime(f0,t0);
  if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);
  g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(gain||.5,t0+.012);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+.03);
}
function noise(dur,gain,freq,delay){
  const c=audio();if(!c)return;
  const n=Math.floor(c.sampleRate*dur),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t0=c.currentTime+(delay||0);
  s.buffer=buf;f.type="bandpass";f.frequency.value=freq||1200;g.gain.value=gain||.3;
  s.connect(f);f.connect(g);g.connect(master);s.start(t0);
}
const SOUNDS={
  click:()=>tone(660,880,.07,"triangle",.35),
  tab:()=>tone(520,620,.06,"sine",.25),
  build:()=>{tone(220,330,.12,"square",.22);tone(440,660,.16,"triangle",.3,.09);noise(.12,.12,2500,.02)},
  mine:()=>{noise(.18,.35,500);tone(110,70,.18,"sawtooth",.2)},
  rest:()=>{tone(392,392,.3,"sine",.25);tone(523,523,.4,"sine",.2,.12)},
  good:()=>{tone(523,523,.12,"triangle",.3);tone(659,659,.12,"triangle",.3,.1);tone(784,784,.22,"triangle",.32,.2)},
  bad:()=>{tone(300,150,.3,"sawtooth",.3);tone(200,100,.36,"square",.18,.08)},
  alert:()=>{tone(880,880,.1,"square",.25);tone(880,880,.1,"square",.25,.18);tone(660,660,.16,"square",.25,.36)},
  day:()=>{tone(392,392,.18,"sine",.3);tone(494,494,.18,"sine",.3,.14);tone(587,587,.3,"sine",.3,.28)},
  win:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,f,.28,"triangle",.32,i*.13))},
  fail:()=>{[392,330,262,196].forEach((f,i)=>tone(f,f*.97,.34,"sawtooth",.24,i*.18))},
  dawn:()=>{tone(262,262,.7,"sine",.18);tone(392,392,.7,"sine",.15,.1);tone(523,523,.9,"sine",.14,.2)}
};
const VIB={click:8,build:[12,40,18],good:[14,40,14],bad:[60,50,90],alert:[40,60,40,60,80],day:18,win:[20,40,20,40,70],fail:[120,60,160]};
function play(name){
  const f=SOUNDS[name];
  if(on&&f){try{f()}catch(_){}}
  if(on&&VIB[name]&&navigator.vibrate&&!reduce){try{navigator.vibrate(VIB[name])}catch(_){}}
}
function setOn(v){on=!!v;try{localStorage.setItem(KEY,on?"1":"0")}catch(_){}if(on)play("click")}

const prev={};
function animate(container,scope){
  const store=prev[scope]||(prev[scope]={});
  container.querySelectorAll("[data-tk]").forEach(el=>{
    const k=el.dataset.tk,v=+el.dataset.tv,old=store[k];store[k]=v;
    const bar=el.querySelector("[data-tb]");
    if(old==null||old===v||reduce)return;
    const up=v>old;
    el.classList.add(up?"fl-up":"fl-dn");setTimeout(()=>el.classList.remove("fl-up","fl-dn"),900);
    if(bar){const w=bar.dataset.tb;bar.style.width=Math.max(0,Math.min(100,old/(+bar.dataset.tm||100)*100))+"%";requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.width=w+"%"}))}
    const num=el.querySelector("[data-tn]");
    if(num){const t0=performance.now(),D=650;(function step(now){const u=Math.min(1,(now-t0)/D),e=1-Math.pow(1-u,3);num.textContent=Math.round(old+(v-old)*e);if(u<1&&num.isConnected)requestAnimationFrame(step);else if(num.isConnected)num.textContent=Math.round(v)})(t0)}
  });
}
function resetAnimation(scope){delete prev[scope]}

function sky(progress,storm){
  const p=Math.max(0,Math.min(1,progress));

  const stops=[[0,[255,142,120]],[.25,[255,176,110]],[.6,[232,150,96]],[.85,[176,96,120]],[1,[96,70,140]]];
  let a=stops[0],b=stops[stops.length-1];
  for(let i=1;i<stops.length;i++)if(p<=stops[i][0]){a=stops[i-1];b=stops[i];break}
  const u=b[0]===a[0]?0:(p-a[0])/(b[0]-a[0]),c=a[1].map((x,i)=>Math.round(x+(b[1][i]-x)*u));
  const dust=storm?.55:0;
  return{rgb:c.join(","),dust,night:Math.max(0,p-.8)*2.2};
}
function applySky(el,progress,storm){
  const s=sky(progress,storm);
  el.style.setProperty("--sky-rgb",s.rgb);el.style.setProperty("--sky-dust",s.dust);el.style.setProperty("--sky-night",s.night.toFixed(2));
}

function labels(){
  const l=(typeof lang!=="undefined"&&lang)||"en",pack=(typeof GT!=="undefined"&&(GT[l]||GT.en))||null,t=pack&&pack.x;
  const sk=document.getElementById("skip-link"),sb=document.getElementById("snd");
  if(t&&sk)sk.textContent=t.a11.skip;
  if(sb){sb.textContent=on?"🔊":"🔇";sb.setAttribute("aria-pressed",on?"true":"false");if(t){sb.setAttribute("aria-label",on?t.fx.on:t.fx.off);sb.title=on?t.fx.on:t.fx.off}}
}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#snd");if(b){setOn(!on);labels()}});
document.addEventListener("mmlang",labels);
document.addEventListener("DOMContentLoaded",labels);

window.MMX=Object.assign(window.MMX||{},{play,setOn,isOn:()=>on,animate,resetAnimation,applySky,reduce,labels});
})();
