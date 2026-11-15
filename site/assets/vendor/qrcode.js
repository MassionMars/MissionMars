(function(){
const EC={1:[10,[[1,16]]],2:[16,[[1,28]]],3:[26,[[1,44]]],4:[18,[[2,32]]],5:[24,[[2,43]]],6:[16,[[4,27]]]};
const ALIGN={1:[],2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34]};
const EXP=new Array(512).fill(0),LOG=new Array(256).fill(0);
for(let i=0,x=1;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=285}
for(let i=255;i<512;i++)EXP[i]=EXP[i-255];
const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
function rs(data,n){
  let gen=[1];
  for(let i=0;i<n;i++){const nx=new Array(gen.length+1).fill(0);gen.forEach((c,j)=>{nx[j]^=c;nx[j+1]^=mul(c,EXP[i])});gen=nx}
  let rem=new Array(n).fill(0);
  for(const b of data){const f=b^rem[0];rem=rem.slice(1).concat(0);for(let i=0;i<n;i++)rem[i]^=mul(gen[i+1],f)}
  return rem;
}
const total=v=>EC[v][1].reduce((a,g)=>a+g[0]*g[1],0);
function words(data,ver){
  const eccLen=EC[ver][0],groups=EC[ver][1],tot=total(ver);
  let bits="0100"+data.length.toString(2).padStart(8,"0")+data.map(b=>b.toString(2).padStart(8,"0")).join("");
  bits+="0".repeat(Math.min(4,tot*8-bits.length));
  bits+="0".repeat((8-bits.length%8)%8);
  const cw=[];for(let i=0;i<bits.length;i+=8)cw.push(parseInt(bits.slice(i,i+8),2));
  const start=cw.length,pad=[236,17];
  while(cw.length<tot)cw.push(pad[(cw.length-start)%2]);
  const blocks=[];let pos=0;
  for(const [n,d] of groups)for(let i=0;i<n;i++){blocks.push(cw.slice(pos,pos+d));pos+=d}
  const eccs=blocks.map(b=>rs(b,eccLen)),out=[];
  const mx=Math.max(...blocks.map(b=>b.length));
  for(let i=0;i<mx;i++)blocks.forEach(b=>{if(i<b.length)out.push(b[i])});
  for(let i=0;i<eccLen;i++)eccs.forEach(e=>out.push(e[i]));
  return out;
}
const MASKS=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
const PATS=["10111010000","00001011101"];
function penalty(m){
  const n=m.length;let s=0;
  const cols=m.map((_,x)=>m.map(r=>r[x]));
  for(const lines of [m,cols])for(const line of lines){
    let run=1;
    for(let i=1;i<n;i++){if(line[i]===line[i-1])run++;else{if(run>=5)s+=run-2;run=1}}
    if(run>=5)s+=run-2;
    const str=line.join("");
    for(let i=0;i<n-10;i++)if(PATS.includes(str.slice(i,i+11)))s+=40;
  }
  for(let y=0;y<n-1;y++)for(let x=0;x<n-1;x++)if(m[y][x]===m[y][x+1]&&m[y][x]===m[y+1][x]&&m[y][x]===m[y+1][x+1])s+=3;
  const dark=m.reduce((a,r)=>a+r.reduce((b,v)=>b+v,0),0);
  s+=(Math.ceil(Math.abs(dark*20-n*n*10)/(n*n))-1)*10;
  return s;
}
function encode(text){
  const data=Array.from(new TextEncoder().encode(text));
  let ver=0;for(let v=1;v<=6;v++)if(data.length<=total(v)-2){ver=v;break}
  if(!ver)throw new Error("text too long for QR");
  const cw=words(data,ver),size=17+4*ver;
  const mod=Array.from({length:size},()=>new Array(size).fill(0));
  const fn=Array.from({length:size},()=>new Array(size).fill(false));
  const put=(x,y,v)=>{mod[y][x]=v?1:0;fn[y][x]=true};
  const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy;if(x>=0&&x<size&&y>=0&&y<size){const d=Math.max(Math.abs(dx),Math.abs(dy));put(x,y,d!==2&&d!==4)}}};
  finder(3,3);finder(size-4,3);finder(3,size-4);
  for(let i=0;i<size;i++){if(!fn[6][i])put(i,6,i%2===0);if(!fn[i][6])put(6,i,i%2===0)}
  const pos=ALIGN[ver],last=pos[pos.length-1];
  for(const cy of pos)for(const cx of pos){
    if((cx===6&&cy===6)||(cx===6&&cy===last)||(cx===last&&cy===6))continue;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)put(cx+dx,cy+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
  }
  for(let i=0;i<9;i++){fn[8][i]=true;fn[i][8]=true}
  for(let i=0;i<8;i++){fn[8][size-1-i]=true;fn[size-1-i][8]=true}
  put(8,size-8,true);
  const bits=[];cw.forEach(c=>{for(let j=7;j>=0;j--)bits.push((c>>j)&1)});
  let i=0;
  for(let right=size-1;right>=1;right-=2){
    if(right===6)right=5;
    for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){
      const x=right-j,y=((right+1)&2)===0?size-1-vert:vert;
      if(!fn[y][x]&&i<bits.length)mod[y][x]=bits[i++];
    }
  }
  const withMask=k=>{
    const m=mod.map(r=>r.slice());
    for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!fn[y][x]&&MASKS[k](x,y))m[y][x]^=1;
    let rem=k;for(let j=0;j<10;j++)rem=(rem<<1)^((rem>>9)*0x537);
    const f=((k<<10)|rem)^0x5412,set=(x,y,b)=>{m[y][x]=(f>>b)&1};
    for(let b=0;b<6;b++)set(8,b,b);
    set(8,7,6);set(8,8,7);set(7,8,8);
    for(let b=9;b<15;b++)set(14-b,8,b);
    for(let b=0;b<8;b++)set(size-1-b,8,b);
    for(let b=8;b<15;b++)set(8,size-15+b,b);
    m[size-8][8]=1;
    return m;
  };
  let best=null,bs=1e9;
  for(let k=0;k<8;k++){const m=withMask(k),p=penalty(m);if(p<bs){bs=p;best=m}}
  return best;
}
function QRCode(el,o){
  const m=encode(o.text),q=2,n=m.length+q*2;
  let d="";m.forEach((row,y)=>row.forEach((v,x)=>{if(v)d+="M"+(x+q)+" "+(y+q)+"h1v1h-1z"}));
  const ns="http://www.w3.org/2000/svg",s=document.createElementNS(ns,"svg");
  s.setAttribute("viewBox","0 0 "+n+" "+n);s.setAttribute("shape-rendering","crispEdges");
  s.setAttribute("width",o.width||128);s.setAttribute("height",o.height||o.width||128);
  s.setAttribute("role","img");s.setAttribute("aria-label","QR");
  const bg=document.createElementNS(ns,"rect");bg.setAttribute("width",n);bg.setAttribute("height",n);bg.setAttribute("fill",o.colorLight||"#fff");
  const p=document.createElementNS(ns,"path");p.setAttribute("d",d);p.setAttribute("fill",o.colorDark||"#000");
  s.append(bg,p);el.appendChild(s);
}
QRCode.CorrectLevel={L:1,M:0,Q:3,H:2};
QRCode.matrix=encode;
window.QRCode=QRCode;
})();
