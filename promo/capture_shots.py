"""Take the phone screenshots used in the promo from the real site (site/).

    python promo/capture_shots.py

Needs: pip install playwright && playwright install chromium
"""
import asyncio
import functools
import http.server
import threading
from pathlib import Path

from playwright.async_api import async_playwright

HERE = Path(__file__).resolve().parent
SITE = HERE.parent / "site"
OUT = HERE / "shots"
CLICK = "s => { const e = document.querySelector(s); if (e) e.click(); return !!e }"
GO = "n => [...document.querySelectorAll('#bar button')].forEach(b => { if (b.dataset.go === n) b.click() })"


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(SITE))
    handler.log_message = lambda *a, **k: None
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def main():
    srv = serve()
    url = "http://127.0.0.1:%d/" % srv.server_address[1]
    OUT.mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                                        is_mobile=True, has_touch=True)
        page = await ctx.new_page()
        await page.route("**/*", lambda r: r.continue_() if r.request.url.startswith(url) else r.abort())
        await page.goto(url, wait_until="load")
        await page.wait_for_timeout(800)
        await page.evaluate(CLICK, "#skip")
        await page.wait_for_timeout(1200)

        await page.evaluate(GO, "game")
        await page.wait_for_timeout(400)
        await page.evaluate(CLICK, '[data-g="diff"][data-d="normal"]')
        await page.evaluate(CLICK, '[data-g="new"][data-n="30"]')
        await page.wait_for_timeout(500)
        await page.evaluate(CLICK, '[data-g="tskip"]')
        await page.wait_for_timeout(500)
        await page.evaluate("window.scrollTo(0, 0)")
        await page.screenshot(path=str(OUT / "g_play.png"))

        for _ in range(3):
            await page.evaluate("[...document.querySelectorAll('[data-g=\"build\"]')].filter(b => !b.disabled).slice(0, 1).forEach(b => b.click())")
            await page.wait_for_timeout(200)
        await page.evaluate("[...document.querySelectorAll('[data-g=\"info\"]')].filter(e => e.dataset.id === 'solar').forEach(e => e.click())")
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(OUT / "g_info_solar.png"))
        await page.evaluate(CLICK, ".g-x")

        found = False
        for _ in range(60):
            if await page.evaluate("!!document.querySelector('[data-g=\"opt\"]')"):
                found = True
                break
            await page.evaluate(CLICK, '[data-g="end"]')
            await page.wait_for_timeout(120)
        if found:
            await page.wait_for_timeout(400)
            await page.screenshot(path=str(OUT / "g_event.png"))
            await page.evaluate(CLICK, '[data-g="opt"]')
            await page.wait_for_timeout(600)
            await page.screenshot(path=str(OUT / "g_after.png"))
        else:
            print("no event appeared, g_event.png and g_after.png were not updated")

        await page.evaluate(GO, "qr")
        await page.wait_for_timeout(600)
        await page.evaluate("[...document.querySelectorAll('#p-qr .seg button')].forEach(b => { if (/computer/i.test(b.textContent)) b.click() })")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=str(OUT / "q_desk.png"))
        await page.evaluate("location.hash = '#info=110'; window.dispatchEvent(new HashChangeEvent('hashchange'))")
        await page.wait_for_timeout(900)
        await page.screenshot(path=str(OUT / "q_sheet.png"))
        await page.evaluate("document.querySelector('.sh').scrollTo(0, 520)")
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(OUT / "q_sheet2.png"))
        await browser.close()
    srv.shutdown()
    print("screenshots saved to", OUT)


if __name__ == "__main__":
    asyncio.run(main())
