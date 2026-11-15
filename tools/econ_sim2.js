const E=require('../site/dune/dune-econ.js');
const BR=require('fs').readFileSync(process.env.ECOSRC||__dirname+'/../site/dune/dune-bridge.js','utf8');
const ECO=JSON.parse(BR.match(/var ECO = (\{[\s\S]*?\});/)[1].replace(/(\d[AB]):/g,'"$1":'));
const EV={3:[-3,-14,-4],6:[-7,-3,-15],9:[-7,-9,-3],12:[-9,-14,-3]};
const ROOMS=["greenhouse","medbay","lab","airlock"],PRE={greenhouse:1,medbay:2,lab:3,airlock:4};
const cl=v=>Math.max(0,Math.min(100,Math.round(v)));
const happy=r=>Math.round(.6*(r[0]+r[1]+r[2])/3+.4*Math.min(...r));
const face=h=>h>=70?2:h>=50?1:0;
function oldFail(v){const o=v.map(x=>Math.min(0,Math.round(x/2)));let i=0;for(let k=1;k<3;k++)if(v[k]>v[i])i=k;o[i]-=4;return o}
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function vecs(model,room,variant,st){ // returns [{vec,quick}] for 2 options
  const key=PRE[room]+variant,rows=ECO[key];
  if(model==='old')return rows.map(r=>({vec:r,quick:false}));
  const q=E.quickIdx(rows),res=st.res;
  return rows.map((r,i)=>({vec:E.scale(r,{day:st.day,res,tired:E.tired(st.run,room),neglect:E.neglect(st.vis,room,st.day)}),quick:i===q}));
}
function closeSol(model,st,res,perfect,wearAdd){
  if(model==='old'){const up=[-2,-3,-2];return{total:up,wearAfter:0}}
  return E.close(st.day,res,st.wear,perfect,wearAdd);
}
function evalPair(model,st,pair,pWin){ // expected happiness for pair using avg of variants & best option
  let best=0,tot=0;
  const r0=st.res.slice();
  let exp=r0.slice();
  pair.forEach(room=>{
    let acc=[0,0,0];
    ['A','B'].forEach(v=>{
      const o=vecs(model,room,v,st);
      let bestv=null,bs=-1e9;
      o.forEach(x=>{const w=x.vec,f=model==='old'?oldFail(x.vec):E.fail(x.vec,st.day);const e=[0,1,2].map(i=>pWin*w[i]+(1-pWin)*f[i]);const rr=exp.map((a,i)=>cl(a+e[i]));const s=happy(rr);if(s>bs){bs=s;bestv=e}});
      acc=acc.map((a,i)=>a+bestv[i]/2);
    });
    exp=exp.map((a,i)=>a+acc[i]);
  });
  exp=exp.map(cl);
  const c=closeSol(model,st,exp,false,0);
  const fin=exp.map((a,i)=>cl(a+c.total[i]));
  return happy(fin)+Math.min(...fin)*0.2;
}
function pairs(){const o=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)o.push([ROOMS[i],ROOMS[j]]);return o}
const POL={
 perfect:{p:.95,pick:'best',noise:0},
 average:{p:.75,pick:'best',noise:.3},
 weak:{p:.5,pick:'rand',noise:1},
 risky:{p:.75,pick:'risky',noise:0},
 inefficient:{p:.65,pick:'greedy',noise:0},
 naive95:{p:.95,pick:'rand',noise:1},
 greedy95:{p:.95,pick:'greedy',noise:0},
 risky95:{p:.95,pick:'risky',noise:0}
};
function run(model,pol,seed){
  const R=rng(seed),P=POL[pol];
  let st={res:[70,80,75],day:1,lives:3,wear:0,vis:{},run:{}},gameOvers=0,replays=0,sols=0,lost=0,minHist=[],crit=null,hist=[],firstCrit=null,minRes=[0,0,0];
  let cleanDone=false;
  while(st.day<=15&&sols<400){
    sols++;
    const snap=st.res.slice();
    let res=st.res.slice();
    if(EV[st.day])res=res.map((a,i)=>cl(a+(model==='old'?EV[st.day][i]:E.event(EV[st.day],st.day)[i])));
    st.res=res;
    let pair;
    const ps=pairs();
    if(P.pick==='rand'||R()<P.noise)pair=ps[Math.floor(R()*6)];
    else if(P.pick==='risky'){ // chase energy and shield stock
      let bs=-1e9;ps.forEach(p=>{let s=0;p.forEach(r=>['A','B'].forEach(v=>vecs(model,r,v,st).forEach((x,i)=>{if(i===0)s+=x.vec[1]*2+x.vec[2]})));if(s>bs){bs=s;pair=p}});
    }else if(P.pick==='greedy'){
      let bs=-1e9;ps.forEach(p=>{let s=0;p.forEach(r=>['A','B'].forEach(v=>vecs(model,r,v,st).forEach(x=>{s+=x.vec.filter(a=>a>0).reduce((a,b)=>a+b,0)})));s+=R()*4;if(s>bs){bs=s;pair=p}});
    }else{let bs=-1e9;ps.forEach(p=>{const s=evalPair(model,st,p,P.p);if(s>bs){bs=s;pair=p}});}
    let wearAdd=0,wins=0;
    pair.forEach(room=>{
      const v=R()<.5?'A':'B',o=vecs(model,room,v,st);
      let pick;
      if(P.pick==='rand')pick=Math.floor(R()*2);
      else if(P.pick==='risky')pick=0;
      else if(P.pick==='greedy'){const s=o.map(x=>x.vec.filter(a=>a>0).reduce((a,b)=>a+b,0));pick=s[0]>=s[1]?0:1}
      else{let bs=-1e9;o.forEach((x,i)=>{const rr=st.res.map((a,j)=>cl(a+x.vec[j]));const s=happy(rr)+Math.min(...rr)*.2;if(s>bs){bs=s;pick=i}})}
      const win=R()<P.p,x=o[pick];
      const d=win?x.vec:(model==='old'?oldFail(x.vec):E.fail(x.vec,st.day));
      st.res=st.res.map((a,j)=>cl(a+d[j]));
      if(win){wins++;if(x.quick)wearAdd+=E.P.wearQuick}else wearAdd+=E.P.wearFail;
    });
    const cs=closeSol(model,st,st.res,wins===2,model==='old'?0:wearAdd);
    st.res=st.res.map((a,i)=>cl(a+cs.total[i]));
    const h=happy(st.res),f=face(h);
    if(firstCrit===null&&st.res.some(a=>a<30))firstCrit=st.day;
    st.res.forEach((a,i)=>{minRes[i]+=a<30?1:0});
    hist.push(h);
    if(f===0){
      st.lives--;lost++;
      if(st.lives<=0){gameOvers++;st={res:[70,80,75],day:1,lives:3,wear:0,vis:{},run:{}};}
      else{replays++;st.res=snap}
    }else{
      ROOMS.forEach(r=>{if(pair.includes(r)){st.vis[r]=st.day;st.run[r]=(st.run[r]||0)+1}else st.run[r]=0});st.wear=cs.wearAfter;st.day++;
    }
  }
  return{done:st.day>15,gameOvers,lost,replays,hist,firstCrit,minRes,sols};
}
function stats(model,pol,N=1500){
  let clean=0,fin=0,lost=0,rep=0,go=0,fc=[],bn=[0,0,0],byDay=Array(16).fill(0),cntDay=Array(16).fill(0),sols=0;
  for(let n=0;n<N;n++){
    const r=run(model,pol,n*7919+13);
    if(r.done)fin++;if(r.done&&r.gameOvers===0)clean++;
    lost+=r.lost;rep+=r.replays;go+=r.gameOvers;sols+=r.sols;
    if(r.firstCrit!==null)fc.push(r.firstCrit);
    r.minRes.forEach((a,i)=>bn[i]+=a);
    r.hist.forEach((h,i)=>{});
  }
  const sum=bn.reduce((a,b)=>a+b,0)||1;
  return{model,pol,'clean%':(clean/N*100).toFixed(1),'finish%':(fin/N*100).toFixed(1),'avgLivesLost':(lost/N).toFixed(2),'avgGameOvers':(go/N).toFixed(2),'avgSols':(sols/N).toFixed(1),'critSol':fc.length?(fc.reduce((a,b)=>a+b,0)/fc.length).toFixed(1):'-','critRuns%':(fc.length/N*100).toFixed(0),'bottleneck L/E/S %':bn.map(a=>(a/sum*100).toFixed(0)).join('/')};
}
module.exports={stats,run,E};
if(require.main===module){
  const models=process.argv[2]?process.argv[2].split(','):['old','new'];
  for(const m of models){console.log('== '+m);for(const p of Object.keys(POL))console.log(JSON.stringify(stats(m,p)))}
}
