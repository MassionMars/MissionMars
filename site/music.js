(function(){
"use strict";
const KEY="mm-music";
let ducked=0,on=true,ctx=null,out=null,echo=null,timer=null,mood="calm",step=0,next=0,started=false,bar=0;
try{on=localStorage.getItem(KEY)!=="0"}catch(_){}
const hz=m=>440*Math.pow(2,(m-69)/12);

const CH=[[50,57,60,64,65],[46,58,62,65,69],[43,55,58,62,65],[45,57,60,62,64]];
const ARP=[0,2,3,4,3,2,1,2];
function init(){
  if(ctx)return true;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{
    ctx=new AC();const comp=ctx.createDynamicsCompressor();comp.connect(ctx.destination);
    out=ctx.createGain();out.gain.value=0;out.connect(comp);
    const d=ctx.createDelay(1);d.delayTime.value=.42;const fb=ctx.createGain();fb.gain.value=.38;
    const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=1800;
    d.connect(lp);lp.connect(fb);fb.connect(d);echo=ctx.createGain();echo.gain.value=.5;echo.connect(d);lp.connect(out);
  }catch(_){ctx=null;return false}
  return true;
}
function note(m,t,dur,type,vol,att,pan){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=hz(m);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(out);if(pan)g.connect(echo);o.start(t);o.stop(t+dur+.05);return g;
}
function pad(chord,t,dur){
  chord.forEach((m,i)=>{
    [-6,6].forEach(det=>{
      const o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
      o.type=i%2?"triangle":"sawtooth";o.frequency.value=hz(m+12);o.detune.value=det;
      f.type="lowpass";f.frequency.value=700;f.Q.value=.6;
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.024,t+dur*.35);g.gain.exponentialRampToValueAtTime(0.0001,t+dur+1.2);
      o.connect(f);f.connect(g);g.connect(out);o.start(t);o.stop(t+dur+1.3);
    });
  });
}
function hat(t,v){
  const n=Math.floor(ctx.sampleRate*.04),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=b;f.type="highpass";f.frequency.value=6500;g.gain.value=v;
  s.connect(f);f.connect(g);g.connect(out);s.start(t);
}
const BEAT=()=>mood==="game"?.5:.75;
function schedule(){
  if(!ctx||!on)return;
  while(next<ctx.currentTime+.6){
    const b=BEAT(),perBar=Math.round(4/b*1)||8,chord=CH[bar%CH.length];
    if(step===0){pad(chord,next,perBar*b);note(chord[0]-12,next,perBar*b*.9,"sine",.2,.4)}
    const calmSkip=mood!=="game"&&step%2===1;
    if(!calmSkip){
      const idx=ARP[(step+bar)%ARP.length];
      note(chord[Math.min(idx,chord.length-1)]+12+(step%4===3?12:0),next,.55,"triangle",mood==="game"?.07:.055,.01,true);
    }
    if(mood==="game"&&step%2===1)hat(next,.05);
    if(mood==="game"&&step%4===0)note(chord[0]-12,next,.25,"sine",.16,.01);
    next+=b;step++;if(step>=perBar){step=0;bar++}
  }
}
function start(){
  if(!on)return;
  if(!init())return;
  ctx.resume().catch(()=>{});
  if(!started){started=true;next=ctx.currentTime+.1;step=0;timer=setInterval(schedule,200)}

  if(next<ctx.currentTime)next=ctx.currentTime+.1;
  out.gain.cancelScheduledValues(ctx.currentTime);out.gain.setTargetAtTime(ducked?.1:.9,ctx.currentTime,ducked?.4:.6);
}
function stop(){
  if(!ctx)return;out.gain.cancelScheduledValues(ctx.currentTime);out.gain.setTargetAtTime(0,ctx.currentTime,.2);
}
const T={en:{on:"Music on",off:"Music off"},ru:{on:"Музыка включена",off:"Музыка выключена"},tg:{on:"Мусиқӣ фаъол аст",off:"Мусиқӣ хомӯш аст"}};
function labels(){
  const b=document.getElementById("mus");if(!b)return;
  const l=(typeof lang!=="undefined"&&T[lang])?lang:"en",t=T[l];
  b.setAttribute("aria-pressed",on?"true":"false");b.setAttribute("aria-label",on?t.on:t.off);b.title=on?t.on:t.off;
}
function setOn(v){
  on=!!v;try{localStorage.setItem(KEY,on?"1":"0")}catch(_){}
  if(on)start();else stop();labels();
}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#mus");if(b){setOn(!on);if(window.MMX&&MMX.isOn&&MMX.isOn())MMX.play("click")}});
["pointerdown","keydown","touchstart"].forEach(ev=>addEventListener(ev,()=>{if(on)start()},{passive:true}));
document.addEventListener("visibilitychange",()=>{if(!ctx)return;if(document.hidden){stop();setTimeout(()=>{if(document.hidden)ctx.suspend().catch(()=>{})},900)}else if(on){start()}});
document.addEventListener("mmlang",labels);document.addEventListener("DOMContentLoaded",labels);
function duck(v){ducked=v?1:0;if(ctx&&on&&out){out.gain.cancelScheduledValues(ctx.currentTime);out.gain.setTargetAtTime(ducked?.1:.9,ctx.currentTime,.5)}}
window.MMMusic={duck,setOn,isOn:()=>on,state:()=>ctx?{gain:+out.gain.value.toFixed(2),ctx:ctx.state,ahead:+(next-ctx.currentTime).toFixed(2)}:null,mood:m=>{mood=m==="game"?"game":"calm"}};
})();
