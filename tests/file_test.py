import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        page = await b.new_page(viewport={"width": 1100, "height": 900})
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        await page.route("**/*", lambda r: r.continue_() if r.request.url.startswith("file:") else r.abort())
        await page.goto("file://" + sys.argv[1] + "/index.html#info=101", wait_until="load")
        await page.wait_for_timeout(2500)
        page.on('console', lambda m: print('console:', m.text))
        print(await page.evaluate("""()=>{const i=document.querySelector('.sh-fig img');return {img:i&&i.getAttribute('src'),w:i&&i.naturalWidth}}"""))
        print(await page.evaluate("""async()=>{[...document.querySelectorAll('#bar button')].forEach(b=>{if(b.dataset.go==='qr')b.click()});await new Promise(r=>setTimeout(r,2500));return {all:document.querySelectorAll('.qr').length,svg:document.querySelectorAll('.qr svg').length}}"""))
        await page.evaluate("[...document.querySelectorAll('#bar button')].forEach(b=>{if(b.dataset.go==='game')b.click()})")
        await page.wait_for_timeout(300)
        print('qr count',await page.evaluate("document.querySelectorAll('.qr').length"), await page.evaluate("(document.querySelector('#p-qr')||{}).className"))
        print("start btn:", await page.evaluate("!!document.querySelector('[data-g=\"new\"]')"))
        print("errors:", errs)
        await b.close()
asyncio.run(main())
