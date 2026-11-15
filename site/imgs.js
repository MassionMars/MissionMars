window.imgsFor=function(code,remote){
  const reg=window.LOCAL_IMG||{},med=window.MEDIA||{};
  if(!window.IMG_BY_ID){
    window.IMG_BY_ID={};window.IMG_USED={};
    for(const c in reg)for(const x of reg[c])window.IMG_BY_ID[x.id]=x;
    for(const c in med)for(const s of med[c].s)window.IMG_USED[s[0]]=1;
  }
  const out=[];
  const m=med[code];
  if(m)for(const s of m.s){
    const r=window.IMG_BY_ID[s[0]];
    if(r)out.push({id:s[0],src:r.src,cap:s[1],desc:s[2],credit:r.credit});
  }

  for(const x of reg[code]||[])if(!window.IMG_USED[x.id])out.push(x);
  if(out.length)return out;
  if(!remote)return[];
  return[typeof remote==="string"?{src:remote}:remote];
};
