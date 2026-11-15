"""Browser test of the MISSION MARS game inside the site.

    python tests/dune_test.py http://localhost:8133/            (serve dist/ first)
    python tests/dune_test.py file:///.../index.html            (the one-file build)

Checks: the game page opens, the hub shows the shared HUD, a room opens inside the same frame, a won crisis changes the
shared state, the way back to the base keeps it, the old game and mini-games are gone, no console errors."""
import sys
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8133/"
shots = sys.argv[2] if len(sys.argv) > 2 else None
fails = []


def ok(cond, msg):
    print(("  ok   " if cond else "  FAIL ") + msg)
    if not cond:
        fails.append(msg)


def child(pg, name, t=8000):
    pg.wait_for_function("n=>{const f=document.querySelector('.dframe');return f&&f.contentDocument&&f.contentDocument.title.includes(n)&&f.contentDocument.readyState==='complete'}", arg=name, timeout=t)
    return next(f for f in pg.frames if f != pg.main_frame and name in f.title())


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 720}, service_workers="block")
    ctx.add_init_script("try{localStorage.setItem('mm-lang3','ru')}catch(e){}")
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(url)
    pg.wait_for_timeout(600)
    pg.evaluate("()=>{const s=document.getElementById('skip');if(s)s.click()}")
    pg.wait_for_function("!document.body.classList.contains('intro-on')", timeout=20000)
    ok(pg.locator(".cta-row .cta").count() == 2 and pg.locator(".cta.play").count() == 1, "home has the Play button and then the About button")
    ok(pg.eval_on_selector(".cta.play", "e=>e.textContent.trim().length>0"), "Play button has a label")
    nav = pg.eval_on_selector_all("#bar button", "bs=>bs.map(b=>b.dataset.go)")
    ok(nav == ["home", "about", "inside", "game", "album"], "bottom menu is home/about/inside/game/album, got %s" % nav)
    ok(pg.evaluate("typeof MMEngine==='undefined'&&!document.getElementById('p-mini')&&!document.getElementById('mgsw')"), "old game engine, mini-games page and switcher are gone")
    # the home sky: stars, no hard-edged background boxes, meteors that can be caught
    ok(pg.evaluate("!document.querySelector('.hero .bl,.blob,.flare,.dust')"), "the boxed glow/dust layers (hard edges) are gone")
    ok(pg.evaluate("getComputedStyle(document.getElementById('skybg')).opacity")=="1", "home has the deep Martian dusk sky")
    pg.evaluate("localStorage.removeItem('mm-meteors')"); pos = pg.evaluate("MMSky.spawn()"); pg.wait_for_timeout(60)
    pos = pg.evaluate("MMSky.meteors()[0]"); pg.mouse.click(pos["x"] + 2, pos["y"] + 2); pg.wait_for_timeout(200)
    ok(pg.evaluate("localStorage.getItem('mm-meteors')") == "1", "a meteor can be caught with a tap")
    pg.click('#bar [data-go="game"]')
    ctl = child(pg, "Mission control")
    ctl.evaluate("()=>document.querySelector('.vfx-foot button,.skip button').click()"); pg.wait_for_timeout(200)
    ctl.fill(".inp", "Tester<b>_1"); ctl.evaluate("()=>[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Начать')).click()")
    pg.wait_for_timeout(300)
    ok(pg.evaluate("JSON.parse(localStorage.getItem('mm-camp')).nick") == "Testerb_1", "nickname is cleaned and saved")
    ctl.evaluate("()=>document.querySelector('.node.cur').click()"); pg.wait_for_timeout(300)
    ctl.evaluate("()=>{document.querySelector('.sec:nth-child(1)').click();document.querySelector('.sec:nth-child(3)').click();[...document.querySelectorAll('.btn')].find(x=>x.textContent.includes('К работе')).click()}")
    hub = child(pg, "База", 12000)
    pg.wait_for_timeout(500)
    ok(hub.locator("#hub-walkers .ds-walker").count() == 2, "two astronauts walk on the Martian surface of the base")
    pg.wait_for_timeout(1800)
    ok(hub.locator("#hub-footprints .ds-fp").count() >= 1, "walking astronauts leave footprints")
    ok(hub.locator(".mi-life, .mi-energy, .mi-shield, .mi-science").count() >= 4, "HUD resource icons are animated SVG")
    ok(hub.inner_text("#hud-life") == "70" and hub.inner_text("#hud-energy") == "80", "hub shows starting resources")
    ok(hub.locator(".dept-pin:not(.rover-pin)").count() == 4 and hub.locator(".dept-pin.pin-locked").count() == 2, "hub has four rooms, two of them locked")
    if shots: pg.screenshot(path=shots + "/site_hub.png")
    hub.evaluate("()=>DuneBridge.go('lab')")
    lab = child(pg, "Лаборатория")
    pg.wait_for_timeout(400)
    ok(lab.inner_text("#hud-life") == "70", "lab opens in the same frame with the same state")
    lab.evaluate("()=>{gameState.currentCrisis='3A';gameState.selectedOption=1;finishMiniGame(true)}")
    pg.wait_for_timeout(300)
    life = int(lab.inner_text("#hud-life"))
    ok(life != 70 and int(lab.inner_text("#hud-shield")) > 75, "winning a lab crisis changes life (%d) and raises the shield" % life)
    ok(lab.locator("#hud-science").is_hidden(), "the old science resource is gone from the HUD")
    if shots: pg.screenshot(path=shots + "/site_lab_result.png")
    lab.evaluate("()=>DuneBridge.go('hub')")
    hub = child(pg, "База")
    pg.wait_for_timeout(500)
    ok(int(hub.inner_text("#hud-life")) == life, "back on the base the state is kept")
    ok("1 / 2" in hub.inner_text("#dune-progress"), "progress strip shows 1 / 2: %r" % hub.inner_text("#dune-progress"))
    # records board, language, audio buttons
    hub.evaluate("()=>DuneBridge.mini('3A',5,true,5,3)")
    pg.wait_for_timeout(300)
    pg.click(".dtools .dbtn >> nth=2"); pg.wait_for_timeout(300)
    ok(pg.locator(".drow.free").count() >= 1, "records board has free places for future records")
    pg.click(".dtab >> nth=1"); pg.wait_for_timeout(200)
    ok(pg.locator(".dbox").count() == 16 and "Testerb_1" in pg.inner_text(".dgrid"), "16 mini-game records, the winner is listed")
    pg.keyboard.press("Escape")
    ok(pg.locator("#tokens .res").count() == 3, "home shows three resources: life, energy, shield")
    ok(pg.eval_on_selector_all("#chips .chip", "bs=>bs.length") == 4 and pg.locator(".mgc").count() == 16 and pg.locator(".kbcard").count() == 1, "Inside the game: story, rules, Knowledge Base, mini-games, 16 mini-game cards")
    ok(pg.locator("#langs button").count() == 3, "only three languages: %s" % pg.eval_on_selector_all("#langs button", "bs=>bs.map(b=>b.dataset.l)"))
    pg.click('#langs [data-l="en"]'); pg.wait_for_timeout(500)
    hub = child(pg, "Base") if False else next(f for f in pg.frames if f != pg.main_frame)
    ok("greenhouse" in hub.inner_text("body").lower() and not any(c in hub.inner_text("body") for c in "ЖЗЫЭЮЯ"), "game text switches to English")
    pg.click('#langs [data-l="tg"]'); pg.wait_for_timeout(500)
    ok("ГАРМХОНА" in hub.inner_text("body"), "game text switches to Tajik")
    pg.click('#langs [data-l="ru"]'); pg.wait_for_timeout(400)
    ok("ТЕПЛИЦА" in hub.inner_text("body"), "and back to Russian")
    pg.click("#mus"); ok(pg.get_attribute("#mus", "aria-pressed") == "false", "music can be switched off on its own")
    pg.wait_for_timeout(1200); st = pg.evaluate("MMMusic.state()")
    ok(st and st["gain"] < 0.05, "music is silent when off %s" % st)
    pg.click("#mus"); pg.wait_for_timeout(1800); st = pg.evaluate("MMMusic.state()")
    ok(st and st["gain"] > 0.5 and st["ctx"] == "running" and st["ahead"] < 2, "music plays again after being switched off and on %s" % st)
    pg.click("#mus")
    ok(pg.get_attribute("#snd", "aria-pressed") == "true", "sound effects stay on")
    pg.click("#snd"); ok(pg.get_attribute("#snd", "aria-pressed") == "false", "sound effects have their own button")
    pg.click("#mus"); pg.click("#snd")
    # other pages still work
    for pid in ("qr", "inside", "about", "home"):
        pg.evaluate("go('%s')" % pid)
        pg.wait_for_timeout(250)
        ok(pg.evaluate("document.getElementById('p-%s').classList.contains('on')" % pid), "page %s opens" % pid)
    # phone
    m = ctx.new_page(); m.set_viewport_size({"width": 390, "height": 780})
    m.on("pageerror", lambda e: errs.append("mobile " + str(e)))
    m.goto(url); m.wait_for_timeout(500)
    m.evaluate("()=>{const s=document.getElementById('skip');if(s)s.click()}")
    m.wait_for_function("!document.body.classList.contains('intro-on')", timeout=20000)
    m.click('#bar [data-go="game"]'); m.wait_for_timeout(1500)
    ok(m.evaluate("document.documentElement.scrollWidth<=innerWidth+1"), "no horizontal scroll on a phone")
    if shots: m.screenshot(path=shots + "/site_hub_phone.png")
    real = [e for e in errs if "favicon" not in e and "ERR_FILE_NOT_FOUND" not in e]
    ok(not real, "no console errors %s" % real[:3])
    b.close()
print("\n%d failure(s)" % len(fails))
sys.exit(1 if fails else 0)
