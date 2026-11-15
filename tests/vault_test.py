import asyncio, sys
from playwright.async_api import async_playwright
URL=sys.argv[1]; OUT=sys.argv[2]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        ctx=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        page=await ctx.new_page(); errs=[]
        page.on("pageerror",lambda e:errs.append(str(e)))
        page.on("console",lambda m:errs.append("console:"+m.text) if m.type=="error" else None)
        await page.route("**/*",lambda r:r.continue_() if "localhost" in r.request.url else r.abort())
        await page.goto(URL+"#info=110"); await page.reload(); await page.wait_for_timeout(2500)
        await page.screenshot(path=OUT+"/v0_sheet.png")
        await page.click(".dbbtn"); await page.wait_for_timeout(450); await page.screenshot(path=OUT+"/v1_opening.png")
        await page.wait_for_timeout(1500); await page.screenshot(path=OUT+"/v2_slide1.png")
        await page.click('[data-v="next"]'); await page.wait_for_timeout(280); await page.screenshot(path=OUT+"/v3_transition.png")
        await page.wait_for_timeout(1400); await page.screenshot(path=OUT+"/v4_slide2.png")
        n=await page.evaluate("document.querySelectorAll('.v-prog i').length"); print("steps",n)
        for i in range(10):
            lab=await page.evaluate("(document.querySelector('.v-slide:not(.gone)')||{}).className")
            if 'quiz' in lab: break
            await page.click('[data-v="next"]'); await page.wait_for_timeout(700)
        await page.wait_for_timeout(1200); await page.screenshot(path=OUT+"/v5_fact_or_quiz.png")
        print("at",await page.evaluate("document.querySelector('.v-slide:not(.gone)').className"))
        await page.click('.v-o >> nth=1'); await page.wait_for_timeout(900); await page.screenshot(path=OUT+"/v6_answer.png")
        await page.click('[data-v="next"]'); await page.wait_for_timeout(1500); await page.screenshot(path=OUT+"/v7_end.png")
        print("done flag",await page.evaluate("localStorage.getItem('mm-vault')"))
        await page.click('[data-v="topic"]'); await page.wait_for_timeout(1500); await page.screenshot(path=OUT+"/v8_next_topic.png")
        print("title",await page.evaluate("document.querySelector('.v-ttl b').textContent"))
        await page.keyboard.press("Escape"); await page.wait_for_timeout(1000)
        print("vault open?",await page.evaluate("document.querySelector('#vault').classList.contains('open')"),"sheet open?",await page.evaluate("!document.querySelector('#sheet').hidden"))
        print("errors",errs)
        await b.close()
asyncio.run(main())
