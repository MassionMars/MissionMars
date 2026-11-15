import asyncio, json, sys
from playwright.async_api import async_playwright

URL = sys.argv[1]
MODE = sys.argv[2]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        ctx = await b.new_context(viewport={"width": 1100, "height": 900}, service_workers="allow")
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        ext = []
        async def route(r):
            u = r.request.url
            if u.startswith(URL.rsplit(":", 1)[0]) or u.startswith("http://localhost") or u.startswith("http://127.0.0.1"):
                await r.continue_()
            else:
                ext.append(u); await r.abort()
        await page.route("**/*", route)
        await page.goto(URL + "#info=101", wait_until="load")
        await page.wait_for_timeout(2500)
        print("bar:", await page.evaluate("[...document.querySelectorAll('#bar button')].map(b=>b.dataset.go||b.textContent)"))
        if MODE == "dist":
            await page.evaluate("navigator.serviceWorker.ready")
            await page.wait_for_timeout(1500)
            info = await page.evaluate("""async()=>{const ks=await caches.keys();const out={};for(const k of ks){out[k]=(await (await caches.open(k)).keys()).length}return {out,ctrl:!!navigator.serviceWorker.controller}}""")
            print("caches:", info)
        async def sheet_state():
            return await page.evaluate("""()=>{const i=document.querySelector('.sh-fig img');const g=[...document.querySelectorAll('.sh-gal img')];
              return {sheetOpen:!document.querySelector('#sheet').hidden,img:i&&i.getAttribute('src'),w:i&&i.naturalWidth,gal:g.map(x=>x.naturalWidth)}}""")
        print("sheet:", await sheet_state())
        qrs = await page.evaluate("""async()=>{[...document.querySelectorAll('#bar button')].forEach(b=>{if(/qr/i.test(b.dataset.go||''))b.click()});await new Promise(r=>setTimeout(r,800));return {svg:document.querySelectorAll('.qr svg').length,txt:[...document.querySelectorAll('.qr')].filter(e=>e.textContent==='QR').length,all:document.querySelectorAll('.qr').length}}""")
        print("qr cards:", qrs)
        if MODE == "dist":
            await ctx.set_offline(True)
            await page.goto(URL + "#info=101", wait_until="load")
            await page.reload(wait_until="load")
            await page.wait_for_timeout(2000)
            print("OFFLINE sheet:", await sheet_state())
            qrs = await page.evaluate("""async()=>{[...document.querySelectorAll('#bar button')].forEach(b=>{if(/qr/i.test(b.dataset.go||''))b.click()});await new Promise(r=>setTimeout(r,800));return {svg:document.querySelectorAll('.qr svg').length,all:document.querySelectorAll('.qr').length}}""")
            print("OFFLINE qr cards:", qrs)
        await page.evaluate("[...document.querySelectorAll('#bar button')].forEach(b=>{if(b.dataset.go==='game')b.click()})")
        await page.wait_for_timeout(1500)
        title = await page.evaluate("(()=>{const f=document.querySelector('.dframe');try{return f&&f.contentDocument&&f.contentDocument.title}catch(e){return 'blocked'}})()")
        print("game frame:", title)
        print("page errors:", errs)
        print("blocked external:", sorted(set(u.split('/')[2] for u in ext)))
        await b.close()
asyncio.run(main())
