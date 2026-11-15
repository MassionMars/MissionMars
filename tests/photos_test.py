import asyncio, sys, json
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        ctx=await b.new_context(viewport={"width":420,"height":900},service_workers="allow")
        page=await ctx.new_page(); errs=[]; ext=set(); bad=[]
        page.on("pageerror",lambda e:errs.append(str(e)))
        page.on("response",lambda r: bad.append((r.status,r.url)) if r.status>=400 else None)
        async def route(r):
            u=r.request.url
            if "localhost" in u or "127.0.0.1" in u: await r.continue_()
            else: ext.add(u.split('/')[2]); await r.abort()
        await page.route("**/*",route)
        await page.goto(URL,wait_until="load"); await page.wait_for_timeout(1500)
        # QR sheets for all topics
        import os
        codes=[] if os.environ.get('SKIPQR') else await page.evaluate("Object.keys(INFO)")
        res={}
        for c in codes:
            await page.goto(URL+"#info="+c); await page.wait_for_timeout(500)
            res[c]=await page.evaluate("""()=>{const i=document.querySelector('.sh-fig img');const g=[...document.querySelectorAll('.sh-gal img')];return {open:!document.querySelector('#sheet').hidden,img:!!i,w:i?i.naturalWidth:0,src:i?i.getAttribute('src'):null,gal:g.length,galok:g.filter(x=>x.naturalWidth>0).length,cap:!!document.querySelector('.sh-fig figcaption')}}""")
        print("QR sheet: topics",len(res),"open",sum(r['open'] for r in res.values()),"with photo",sum(1 for r in res.values() if r['w']>0),"placeholder",[c for c,r in res.items() if r['src'] and 'placeholder' in r['src']],"no photo",[c for c,r in res.items() if r['w']==0 and not (r['src'] and 'placeholder' in r['src'])])
        print("gallery broken",[c for c,r in res.items() if r['gal']!=r['galok']])
        print("captions",sum(r['cap'] for r in res.values()))
        await page.goto(URL); await page.wait_for_timeout(800)
        await page.evaluate("[...document.querySelectorAll('#bar button')].forEach(b=>{if(b.dataset.go==='game')b.click()})")
        await page.wait_for_timeout(300)
        seen={}
        for step in range(1600):
            r=await page.evaluate("""()=>{const q=s=>document.querySelector(s);
              const d=q('[data-g="diff"][data-d="easy"]');if(d&&!window.__d){window.__d=1;d.click();return 'diff'}
              const t=q('[data-g="tskip"],[data-g="tnext"]');if(t){t.click();return 'tour'}
              const ph=q('.g-ec .g-ph img');const h=q('.g-ec h3');
              if(h){window.__s=window.__s||{};const k=h.textContent;if(!(k in window.__s))window.__s[k]=ph?[ph.getAttribute('src'),ph.naturalWidth,ph.complete]:null}
              if(q('.g-end'))return 'END';
              const o=q('[data-g="opt"]');if(o){o.click();return 'opt'}const cn=q('[data-g="res"]');if(cn){cn.click();return 'cont'}
              const c=q('[data-g="close"]');const e=q('[data-g="end"]');if(e&&!e.disabled){e.click();return 'end'}
              const n=q('[data-g="new"][data-n="15"]')||q('[data-g="new"][data-n="15"]');if(n){n.click();return 'new'}
              if(c){c.click();return 'close'}
              return 'idle'}""")
            if r=='END': break
            await page.wait_for_timeout(40)
        s=await page.evaluate("window.__s||{}")
        print("game steps",step,"last",r)
        for k,v in s.items(): print("  modal:",k[:40],"->",v)
        # buildings info modals
        await page.goto(URL); await page.wait_for_timeout(500)
        print("page errors",errs); print("external domains attempted",sorted(ext)); print("http>=400",[x for x in bad if 'favicon' not in x[1]][:10])
        await b.close()
asyncio.run(main())
