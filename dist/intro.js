(function(){
const ov=document.getElementById("intro");
if(!ov)return;
const bail=()=>{ov.remove();introOff()};
if(reduce){bail();return}
const skipL={en:"Skip",ru:"Пропустить",tg:"Гузаштан"};
const sk=document.getElementById("skip");sk.textContent=skipL[lang]+" ▸";
const sb=document.getElementById("isub"),tl=document.getElementById("ititle"),fl=document.getElementById("flash"),gc=document.getElementById("gl");
sb.textContent=L[lang].sub;
const gl=gc.getContext("webgl",{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:"high-performance"})||gc.getContext("experimental-webgl");
if(!gl){bail();return}
const mk=(vsrc,fsrc)=>{const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(o));return null}return o};
 const v=sh(gl.VERTEX_SHADER,vsrc),f=sh(gl.FRAGMENT_SHADER,fsrc);if(!v||!f)return null;
 const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,"a");gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(p));return null}return p};
const VS="attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
const bk=mk(VS,`precision highp float;
uniform vec2 uRes;
float h31(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}
float inv(float a,float b,float x){return 1.-smoothstep(a,b,x);}
vec3 crat(vec3 p,float sc,float dens){
vec3 q=p*sc,i=floor(q),f=fract(q);float hh=0.,fl=0.,ej=0.;
for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){
vec3 g=vec3(float(x),float(y),float(z));
vec3 o=vec3(h31(i+g+3.1),h31(i+g+7.7),h31(i+g+11.3));
float r=h31(i+g+19.);float rr=.1+.32*r*r;
float on=step(1.-dens,h31(i+g+5.));
float d=length(g+o-f)/rr;
hh+=on*(inv(0.,.3,abs(d-1.))*.55-max(1.-d*d,0.)*.85);
fl+=on*inv(.2,.85,d);
ej+=on*inv(1.,2.2,d)*step(1.,d);}
return vec3(hh,fl,ej);}
vec3 dirOf(float lonD,float latD){float lo=radians(lonD),la=radians(latD);return vec3(cos(la)*sin(lo),sin(la),cos(la)*cos(lo));}
float ang(vec3 a,vec3 b){return acos(clamp(dot(a,b),-1.,1.));}
void main(){
vec2 fc=gl_FragCoord.xy/uRes;
float lon=(fc.x-.5)*6.2831853,lat=(fc.y-.5)*3.14159265;
vec3 p=vec3(cos(lat)*sin(lon),sin(lat),cos(lat)*cos(lon));
vec3 w=vec3(fbm(p*2.+1.),fbm(p*2.+7.),fbm(p*2.+13.))-.5;
vec3 pw=p+w*.35;
float el=fbm(pw*1.7);
float hemi=inv(-.2,.12,p.y+(fbm(p*1.3+31.)-.5)*.5);
float h=el*.5-hemi*.26+(1.-hemi)*.1;
float dT=ang(p,dirOf(-100.,3.));h+=.4*exp(-pow(dT/.5,2.));
float dO=ang(p,dirOf(-134.,18.));float om=exp(-pow(dO/.085,2.));h+=.6*om-.18*exp(-pow(dO/.02,2.));
float lat0=-.12+.035*sin(lon*9.)+.02*sin(lon*23.);
float vm=inv(0.,.045,abs(lat-lat0))*smoothstep(-1.65,-1.45,lon)*inv(-.9,-.7,lon)*(.6+.4*fbm(p*20.));
h-=.5*vm;
float dH=ang(p,dirOf(70.,-42.));float hb=inv(.12,.42,dH);h-=.32*hb;
float dA=ang(p,dirOf(-42.,-50.));h-=.14*inv(.05,.2,dA);
float dens=mix(.55,.12,hemi);
vec3 c1=crat(p,6.,dens*.9),c2=crat(p,16.,dens),c3=crat(p,42.,dens*.9);
h+=(c1.x*.5+c2.x*.3+c3.x*.18)*.45;
float fl=clamp(c1.y*.5+c2.y*.6+c3.y*.5,0.,1.),ej=clamp(c1.z+c2.z+c3.z,0.,1.);
h+=(fbm(p*30.)-.5)*.05;
vec3 dust=vec3(.78,.47,.27),rust=vec3(.46,.21,.12),dark=vec3(.15,.105,.1),pale=vec3(.9,.68,.48);
float tone=fbm(pw*3.+9.);
vec3 alb=mix(rust,dust,smoothstep(.3,.7,tone));
alb=mix(alb,pale,smoothstep(.55,.85,fbm(p*1.4+40.))*.5*hemi);
float dm=smoothstep(.54,.64,fbm(pw*1.9+21.)+.1*(1.-hemi))*inv(.55,.9,abs(p.y));
alb=mix(alb,dark,dm*.85);
alb*=.8+.5*clamp(h+.3,0.,1.);
alb=mix(alb,pale,hb*.45);
alb=mix(alb,rust*.75,vm*.5);
alb*=1.-fl*.28;alb+=ej*.07*vec3(1.,.8,.6);
alb*=1.+(n3(p*220.)-.5)*.16;
alb=mix(alb,dark*1.5,om*.45+exp(-pow(dT/.4,2.))*.1);
float cap=smoothstep(1.2,1.3,abs(lat)+(fbm(p*6.)-.5)*.18);
alb=mix(alb,vec3(.94,.94,.96),cap);
gl_FragColor=vec4(alb,clamp(h*.55+.5,0.,1.));
}
`),rn=mk(VS,`precision highp float;
uniform vec2 R;uniform float T;uniform sampler2D tx;uniform float tw;
const float PI=3.14159265;
float h31(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec4 smp(vec2 uv){float w=smoothstep(.02,.1,min(uv.x,1.-uv.x));return mix(texture2D(tx,vec2(fract(uv.x+.5),uv.y)),texture2D(tx,uv),w);}
vec3 sky(vec3 rd){vec3 s=vec3(0.);
for(int k=0;k<2;k++){float sc=k==0?60.:130.;vec3 q=rd*sc,id=floor(q),f=fract(q)-.5;
float r=h31(id+float(k)*17.);vec3 o=(vec3(h31(id+1.3),h31(id+2.7),h31(id+4.1))-.5)*.7;
float tw_=.7+.3*sin(T*3.+r*50.);
s+=smoothstep(.1,0.,length(f-o))*step(.9,r)*tw_*mix(vec3(.7,.8,1.),vec3(1.,.8,.6),h31(id+9.));}
float band=exp(-pow(dot(rd,normalize(vec3(.2,.9,.3)))*4.,2.));
float g=n3(rd*5.)*.6+n3(rd*13.)*.4;
s+=band*(.03+.14*g)*vec3(.95,.82,.75)*(1.-.5*smoothstep(.5,.85,n3(rd*9.+3.)));
return s;}
void main(){
vec2 uv=(gl_FragCoord.xy-.5*R)/min(R.x,R.y);
float t=T;
float e=smoothstep(0.,5.2,t);
float dv=clamp((t-9.4)/2.4,0.,1.);
float alt=t<9.4?.04*pow(85.,e)-.7*smoothstep(5.,9.4,t):2.7*exp(-5.8*pow(dv,1.25));
float d=1.+alt;
float tt=min(t,9.4);
float so=smoothstep(.4,9.4,tt);
float ay=.7+1.7*so,ax=.3+.2*sin(tt*.45);
float rl=.08*sin(t*.5)+dv*dv*1.6;float cr_=cos(rl),sr=sin(rl);uv=mat2(cr_,-sr,sr,cr_)*uv;
vec3 ro=d*vec3(sin(ay)*cos(ax),sin(ax),cos(ay)*cos(ax));
vec3 fw=-normalize(ro),rt=normalize(cross(fw,vec3(0,1,0))),up=cross(rt,fw);
vec3 rd=normalize(uv.x*rt+uv.y*up+1.5*fw);
vec3 L=normalize(vec3(.95,.25,.45));
float AYE=.7+1.7,AXE=.3+.2*sin(9.4*.45);
vec3 bdir=vec3(sin(AYE)*cos(AXE),sin(AXE),cos(AYE)*cos(AXE));
float b=dot(ro,rd),c=dot(ro,ro)-1.,disc=b*b-c,sun=max(dot(rd,L),0.);
float tp=1e9;if(disc>0.&&b<0.)tp=-b-sqrt(disc);
vec3 col=vec3(0.);
if(tp<1e8){
vec3 p=ro+rd*tp,n=p;
float lon=atan(p.x,p.z),lat=asin(clamp(p.y,-1.,1.));
vec2 tuv=vec2(lon/(2.*PI)+.5,lat/PI+.5);
vec4 s0=smp(tuv);
float bs=tw*2.;float hE=smp(tuv+vec2(bs,0.)).a,hN=smp(tuv+vec2(0.,bs)).a;float bk_=smoothstep(1.03,1.5,d);
float cl=max(cos(lat),.05);
vec3 east=vec3(cos(lon),0.,-sin(lon)),north=vec3(-sin(lat)*sin(lon),cos(lat),-sin(lat)*cos(lon));
vec3 nb=normalize(n-.45*bk_*((hE-s0.a)/(2.*PI*bs*cl))*east-.45*bk_*((hN-s0.a)/(PI*bs))*north);
vec3 alb=s0.rgb;
if(d<1.8){float k=1.-smoothstep(1.04,1.8,d);float nn=n3(p*400.)+.6*n3(p*1300.);alb*=1.+(nn-.8)*.6*k;}
float ndl=dot(n,L);
float dif=max(dot(nb,L),0.)*smoothstep(-.03,.15,ndl);
col=alb*(dif*1.35+.012+.05*max(ndl+.2,0.));
col*=mix(vec3(1.),vec3(1.12,.82,.62),1.-smoothstep(0.,.45,ndl));
float fr=pow(1.-max(dot(n,-rd),0.),3.5);
col+=fr*mix(vec3(1.,.55,.3),vec3(.5,.7,1.),smoothstep(0.,.7,ndl)*.7)*smoothstep(-.25,.35,ndl)*.9;
float bd=length(p-bdir);
col+=vec3(1.,.72,.42)*(exp(-pow(bd/.0045,2.))*(1.4+.8*sin(T*6.))+exp(-pow(bd/.02,2.))*.25)*smoothstep(1.5,5.,t);
}else{
col=sky(rd);
col+=vec3(1.,.8,.55)*(pow(sun,500.)*4.+pow(sun,40.)*.25+pow(sun,6.)*.04);
float tm=max(-b,0.);vec3 cp=ro+rd*tm;float mm=length(cp);
float halo=exp(-max(mm-1.,0.)*16.)*(b<0.?1.:0.);
float sl=dot(normalize(cp),L)*.5+.5;
col+=halo*mix(vec3(1.,.4,.18),vec3(.45,.65,1.),pow(sl,3.))*(.15+1.6*sl*sl)*.9;
}
float ma=T*.5+.6;vec3 mc=2.77*vec3(cos(ma),.02*sin(ma),sin(ma));float mr=.03;vec3 pe=vec3(1.,.81,.68);
vec3 po=(ro-mc)/pe,pd=rd/pe;float pa=dot(pd,pd),pb=dot(po,pd),pc=dot(po,po)-mr*mr,pdisc=pb*pb-pa*pc;
if(pdisc>0.&&pb<0.){float tm2=(-pb-sqrt(pdisc))/pa;if(tm2<tp){vec3 pm=ro+rd*tm2;
vec3 nm=normalize((pm-mc)/(pe*pe)+.25*(vec3(n3(pm*60.),n3(pm*60.+4.),n3(pm*60.+8.))-.5));
col=vec3(.2,.17,.15)*(.7+.6*n3(pm*45.))*(max(dot(nm,L),0.)*1.3+.02);}}
float hz=1.-smoothstep(1.02,1.4,d);
col=mix(col,vec3(.8,.48,.3)*(.3+.5*max(dot(normalize(ro),L),0.)+.2),hz*.5);
col*=smoothstep(0.,.9,T);
col=1.-exp(-col*1.25);col=pow(col,vec3(.88));
col*=1.-.4*dot(uv,uv);
gl_FragColor=vec4(col,1.);
}
`);
if(!bk||!rn){bail();return}
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const weak=document.body.classList.contains("lite")||(navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4);
const coarse=matchMedia("(pointer:coarse)").matches;
const BW=window.__BW||(weak?1024:coarse?1024:2048),BH=BW/2,NS=16,rows=BH/NS;
const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,BW,BH,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){bail();return}
gl.useProgram(bk);gl.uniform2f(gl.getUniformLocation(bk,"uRes"),BW,BH);gl.viewport(0,0,BW,BH);gl.enable(gl.SCISSOR_TEST);
let q=Math.min(1,(weak?760:1000)/Math.max(innerWidth,innerHeight));
gc.addEventListener("webglcontextlost",e=>{e.preventDefault();end()});
function fit(){gc.width=Math.round(innerWidth*q);gc.height=Math.round(innerHeight*q)}
addEventListener("resize",()=>{fit();if(baked)gl.viewport(0,0,gc.width,gc.height)});
let strip=0,baked=false,t0=0,last=0,fr=0,acc=0,done=false,uR,uT;
const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t)};
const END=11.9;
function end(){if(done)return;done=true;introOff();ov.style.opacity=0;setTimeout(()=>ov.remove(),1000)}
sk.onclick=end;
function finishBake(){
  gl.disable(gl.SCISSOR_TEST);gl.bindTexture(gl.TEXTURE_2D,tex);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  const an=gl.getExtension("EXT_texture_filter_anisotropic");if(an)gl.texParameterf(gl.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,4);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);fit();gl.viewport(0,0,gc.width,gc.height);
  gl.useProgram(rn);gl.uniform1i(gl.getUniformLocation(rn,"tx"),0);gl.uniform1f(gl.getUniformLocation(rn,"tw"),1/BW);
  uR=gl.getUniformLocation(rn,"R");uT=gl.getUniformLocation(rn,"T");
  baked=true;ov.classList.add("ready");t0=performance.now();last=t0;
}
let warmed=false,ema=16,lastAdj=0,shown=0;
function warm(){
  gl.scissor(0,0,2,2);gl.drawArrays(gl.TRIANGLES,0,3);gl.finish&&0;warmed=true}
function frame(now){
  if(done)return;
  try{
  if(!baked){
    if(!warmed){warm();requestAnimationFrame(frame);return}
    for(let k=0;k<2&&strip<NS;k++){gl.scissor(0,strip*rows,BW,rows);gl.drawArrays(gl.TRIANGLES,0,3);strip++}
    if(strip>=NS)finishBake();
    requestAnimationFrame(frame);return}
  const t=Math.max(0,(now-t0)/1000),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
  if(t>END){end();return}
  ema=ema*.9+dt*1000*.1;
  if(ema>30&&q>.34&&now-lastAdj>700){q*=.82;lastAdj=now;ema=22;fit();gl.viewport(0,0,gc.width,gc.height)}
  gl.uniform2f(uR,gc.width,gc.height);gl.uniform1f(uT,Math.min(t,11.8));gl.drawArrays(gl.TRIANGLES,0,3);
  if(shown<1&&t>=5.4){shown=1;tl.classList.add("show")}
  if(shown<2&&t>=6.4){shown=2;sb.classList.add("show")}
  if(shown<3&&t>=8.8){shown=3;tl.classList.remove("show");tl.classList.add("gone");sb.classList.remove("show")}
  if(shown<4&&t>=10.9){shown=4;fl.classList.add("on")}
  requestAnimationFrame(frame)
  }catch(e){console.error(e);end()}
}
fit();requestAnimationFrame(frame);
})();
