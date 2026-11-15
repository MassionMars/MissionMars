import asyncio, sys
from playwright.async_api import async_playwright
URL=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        ctx=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=1,is_mobile=True,has_touch=True)
        await ctx.add_init_script("try{const o={};for(let i=100;i<=205;i++)o[i]=1;localStorage.setItem('mm-album',JSON.stringify({own:o,km:0}))}catch(e){}")
        page=await ctx.new_page(); errs=[]
        page.on("pageerror",lambda e:errs.append(str(e)))
        await page.route("**/*",lambda r:r.continue_() if "localhost" in r.request.url else r.abort())
        await page.goto(URL); await page.wait_for_timeout(2000)
        codes=await page.evaluate("Object.keys(INFO).sort()")
        bad=[]
        for lg in ["en","ru","tg"]:
            await page.evaluate("l=>{document.querySelector('#langs [data-l=\"'+l+'\"]').click()}",lg)
            await page.wait_for_timeout(300)
            for c in codes if lg=="en" else codes[::12]:
                await page.evaluate("c=>{qrOpen(c)}",c); await page.wait_for_timeout(120)
                has=await page.evaluate("!!document.querySelector('.dbbtn')")
                if not has: bad.append((lg,c,'no button')); continue
                await page.evaluate("document.querySelector('.dbbtn').click()"); await page.wait_for_timeout(200)
                info=await page.evaluate("""()=>{const v=document.querySelector('#vault');return {open:v.classList.contains('open'),steps:v.querySelectorAll('.v-prog i').length,txt:(v.querySelector('.v-d')||{}).textContent||''}}""")
                if not info['open'] or info['steps']<3 or len(info['txt'])<30: bad.append((lg,c,info))
                # walk to the end
                for i in range(12):
                    cls=await page.evaluate("(document.querySelector('.v-slide:not(.gone)')||{}).className||''")
                    if 'end' in cls: break
                    if 'quiz' in cls:
                        await page.evaluate("document.querySelector('.v-o').click()")
                    await page.evaluate("(()=>{const n=document.querySelector('[data-v=\"next\"]');if(n&&!n.disabled)n.click()})()")
                    await page.wait_for_timeout(420)
                cls=await page.evaluate("(document.querySelector('.v-slide:not(.gone)')||{}).className||''")
                if 'end' not in cls: bad.append((lg,c,'never reached end',cls))
                await page.keyboard.press("Escape"); await page.wait_for_timeout(300)
                await page.evaluate("(()=>{const x=document.querySelector('#sheet [data-x]');if(x)x.click()})()"); await page.wait_for_timeout(150)
        print("problems:",bad[:10],"count",len(bad)); print("errors",errs[:5])
        await b.close()
asyncio.run(main())
