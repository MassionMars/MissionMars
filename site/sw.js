const VERSION="dev";
const NAME="mm-"+VERSION;
const RUNTIME="mm-runtime";

async function precache(){
  try{
    const r=await fetch("precache.json",{cache:"no-store"});
    if(!r.ok)return;
    const {files}=await r.json();
    const c=await caches.open(NAME);
    await c.addAll(files);
  }catch(e){}
}

self.addEventListener("install",e=>{e.waitUntil(precache().then(()=>self.skipWaiting()))});

self.addEventListener("activate",e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k.startsWith("mm-")&&k!==NAME&&k!==RUNTIME)await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",e=>{
  if(e.request.headers.has("range")||/\.mp4(\?|$)/.test(e.request.url))return;
  const req=e.request,url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin)return;
  e.respondWith((async()=>{
    const hit=await caches.match(req,{ignoreSearch:true});
    if(hit)return hit;
    try{
      const res=await fetch(req);
      if(res.ok)(await caches.open(RUNTIME)).put(req,res.clone());
      return res;
    }catch(err){
      if(req.mode==="navigate"){const home=await caches.match("index.html")||await caches.match("./");if(home)return home}
      throw err;
    }
  })());
});
