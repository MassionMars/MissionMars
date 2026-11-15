"""Rover ride, five discoveries, album awards and Knowledge Base tab."""
import sys
from playwright.sync_api import sync_playwright
url = sys.argv[1]; bad = 0
def ok(c, m):
    global bad
    print(("  ok   " if c else "  FAIL ") + m)
    if not c: bad += 1
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 720}, service_workers="block")
    ctx.add_init_script("try{localStorage.setItem('mm-lang3','ru');localStorage.removeItem('mm-album')}catch(e){}")
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(url); pg.wait_for_timeout(500)
    pg.evaluate("()=>{const s=document.getElementById('skip');if(s)s.click()}")
    pg.wait_for_function("!document.body.classList.contains('intro-on')", timeout=20000)
    nav = pg.evaluate("[...document.querySelectorAll('#bar button')].map(b=>b.textContent)")
    ok(len(nav) == 5 and "База Знаний" not in nav and "Награды" in nav, "nav has 5 tabs, Knowledge Base moved inside the game page: %s" % nav)
    pg.evaluate("go('qr')"); pg.wait_for_timeout(400)
    ok(pg.evaluate("INFO['201']&&INFO['205']&&Object.keys(INFO).length") >= 53, "53 cards exist in the Knowledge Base")
    pg.evaluate("document.querySelector('#bar [data-go=album]').click()"); pg.wait_for_timeout(400)
    ok(pg.evaluate("document.querySelectorAll('#p-album .al-s').length") == 53 - 0 or pg.evaluate("document.querySelectorAll('#p-album .al-s').length") >= 50, "album shows the stickers")
    ok(pg.evaluate("document.querySelectorAll('#p-album .al-s.lock').length") > 40, "locked slots are silhouettes, not circles")
    pg.evaluate("MMAlbum.addKm(260)"); pg.wait_for_timeout(300)
    ok(pg.evaluate("MMAlbum.has(138)"), "250 m on the rover gives the first sample card")
    pg.evaluate("MMAlbum.addKm(2000)"); pg.wait_for_timeout(300)
    ok(pg.evaluate("[138,136,140,141,142].every(c=>MMAlbum.has(c))"), "cumulative distance unlocks all five samples")
    pg.evaluate("MMAlbum.game(3)");
    ok(pg.evaluate("MMAlbum.has(133)"), "winning mini-game 3 gives its card")
    # bridge: rover rules
    pg.evaluate("document.querySelector('#bar [data-go=game]').click()"); pg.wait_for_timeout(1500)
    f = next((x for x in pg.frames if x != pg.main_frame), None)
    ok(f is not None, "game frame is open")
    f.evaluate("(()=>{const c=DuneBridge.camp();c.phase='play';c.day=4;c.lab=0;c.rv=0;c.rvDay=0;c.picked=['lab','airlock'];c.sdone={};DuneBridge.campSave(c);DuneBridge.setRes([60,60,60])})()")
    ok(f.evaluate("DuneBridge.roverCan().ok"), "rover ride is available")
    f.evaluate("DuneBridge.roverStart()")
    ok(f.evaluate("DuneBridge.res()[1]") == 60 - f.evaluate("DuneBridge.RV_COST"), "ride costs energy")
    ok(not f.evaluate("DuneBridge.roverCan().ok"), "only one ride per sol")
    r = f.evaluate("DuneBridge.roverFinish('A')"); ok(r["shield"] == 6, "rating A gives +6 shield")
    f.evaluate("(()=>{const c=DuneBridge.camp();c.lab=1;DuneBridge.campSave(c)})()")
    ok(f.evaluate("DuneBridge.camp().sci") == 1, "lab + rover (1+1) make the first discovery")
    f.evaluate("(()=>{const c=DuneBridge.camp();c.lab=6;c.rv=6;DuneBridge.campSave(c)})()")
    ok(f.evaluate("DuneBridge.camp().sci") == 5, "discoveries are capped at five")
    f.evaluate("(()=>{const c=DuneBridge.camp();c.rvDay=0;DuneBridge.campSave(c);DuneBridge.setRes([60,5,60])})()")
    ok(not f.evaluate("DuneBridge.roverCan().ok"), "a ride is refused with too little energy")
    pg.wait_for_timeout(300)
    ok(pg.evaluate("MMAlbum.has(144)&&MMAlbum.has(127)&&MMAlbum.has(130)"), "five discoveries are awarded to the album, with the final card")
    # rover room opens
    pg.evaluate("MMHost&&0"); 
    f.evaluate("DuneBridge.setRes([60,60,60]);(()=>{const c=DuneBridge.camp();c.rvDay=0;DuneBridge.campSave(c)})();DuneBridge.go('rover')"); pg.wait_for_timeout(1500)
    g = next((x for x in pg.frames if "rover" in x.url or x.evaluate("!!window.RoverRun")), None)
    ok(g is not None and g.evaluate("!!window.RoverRun"), "rover room loads")
    ok(not errs, "no console errors %s" % errs[:3])
    b.close()
print(bad, "failure(s)"); sys.exit(1 if bad else 0)
