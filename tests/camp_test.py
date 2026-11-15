"""Campaign flow: film -> name -> day map -> two sectors -> end of sol -> next day (and the losing / event / science paths)."""
import sys, json
from playwright.sync_api import sync_playwright
url = sys.argv[1]
bad = 0
def ok(c, m):
    global bad
    print(("  ok   " if c else "  FAIL ") + m)
    if not c: bad += 1

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 720}, service_workers="block")
    ctx.add_init_script("try{localStorage.setItem('mm-lang3','ru')}catch(e){}")
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(url); pg.wait_for_timeout(500)
    pg.evaluate("()=>{const s=document.getElementById('skip');if(s)s.click()}")
    pg.wait_for_function("!document.body.classList.contains('intro-on')", timeout=20000)
    pg.evaluate("document.querySelector('#bar [data-go=game]').click()")

    def fr(title, t=8000):
        for _ in range(int(t / 100)):
            for f in pg.frames:
                if f != pg.main_frame and title in f.title():
                    try:
                        if f.evaluate("document.readyState") == "complete": return f
                    except Exception: pass
            pg.wait_for_timeout(100)
        raise Exception("no frame " + title)
    def ctl(): return fr("Mission control")
    def js(f, e): return f.evaluate(e)
    def camp(f): return json.loads(js(f, "JSON.stringify(DuneBridge.camp())"))
    def clk(f, sel): f.evaluate("s=>document.querySelector(s).click()", sel)
    def clk_text(f, txt): f.evaluate("t=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes(t)); b.click()}", txt)

    f = ctl()
    ok(js(f, "!!document.querySelector('.vfx video, .vfx-stage')"), "intro film (video) is shown on Day 1")
    ok(js(f, "!!document.querySelector('.vfx-foot button,.skip button')"), "film can be skipped")
    clk(f, ".vfx-foot button,.skip button"); pg.wait_for_timeout(300)
    ok(js(f, "!!document.querySelector('.inp')"), "after the film comes the name input")
    clk_text(f, "Начать миссию"); pg.wait_for_timeout(400)
    ok(js(f, "document.querySelectorAll('.node').length") == 15, "map has 15 days")
    ok(js(f, "document.querySelectorAll('.node.lock').length") == 14 and js(f, "document.querySelectorAll('.node.cur').length") == 1, "only day 1 is open, the rest are locked")
    ok(js(f, "document.querySelectorAll('.node .gift').length") >= 5, "special days carry a gift")

    # day 1: choose sectors
    clk(f, ".node.cur"); pg.wait_for_timeout(300)
    ok(js(f, "document.querySelectorAll('.sec').length") == 4 and js(f, "document.querySelector('.row .btn').disabled"), "four sectors, start is disabled until two are chosen")
    for s in (0, 1, 2): clk(f, ".sec:nth-child(%d)" % (s + 1))
    ok(js(f, "document.querySelectorAll('.sec.on').length") == 2, "only two sectors can be selected")
    clk(f, ".sec:nth-child(3)")  # lab off, keep greenhouse + medbay? toggles
    js(f, "[...document.querySelectorAll('.sec.on')].forEach(x=>x.click())")
    clk(f, ".sec:nth-child(1)"); clk(f, ".sec:nth-child(4)")
    clk_text(f, "К работе"); pg.wait_for_timeout(1800)
    h = fr("База")
    pins = js(h, "[...document.querySelectorAll('.dept-pin:not(.rover-pin)')].map(p=>p.dataset.dept+(p.classList.contains('pin-locked')?':L':':O'))")
    ok(sorted(pins) == ["airlock:O", "greenhouse:O", "lab:L", "medbay:L"], "base: chosen sectors open, others locked %s" % pins)
    js(h, "DuneBridge.go('lab')"); pg.wait_for_timeout(300)
    ok("закрыт" in js(h, "(document.getElementById('mm-toast')||{}).textContent||''") or "closed" in js(h, "(document.getElementById('mm-toast')||{}).textContent||''"), "a locked sector refuses to open")
    js(h, "openDepartment('greenhouse')"); pg.wait_for_timeout(500)
    js(h, "openTutorialForOption(1)"); js(h, "startSelectedMiniGame()"); pg.wait_for_timeout(300); js(h, "finishMiniGame(true)"); pg.wait_for_timeout(300)
    c = camp(h); ok(c["sdone"].get("greenhouse", {}).get("w") == 1, "a won sector is recorded")
    js(h, "afterResult()"); pg.wait_for_timeout(500)
    js(h, "openDepartment('greenhouse')"); pg.wait_for_timeout(300)
    ok(js(h, "document.getElementById('compartment-screen').classList.contains('hidden')"), "a played sector cannot be entered again")
    js(h, "DuneBridge.go('airlock')"); pg.wait_for_timeout(1800)
    a = fr("Шлюз")
    life0 = js(a, "DuneBridge.load().life")
    js(a, "openTutorialForOption(1)"); js(a, "startSelectedMiniGame()"); pg.wait_for_timeout(300); js(a, "finishMiniGame(false)"); pg.wait_for_timeout(300)
    ok(js(a, "DuneBridge.load().life") <= life0, "a lost sector costs resources")
    ok(camp(a)["phase"] == "sum", "after the second sector the sol is over")
    js(a, "afterResult()"); pg.wait_for_timeout(1200)
    f = ctl()
    ok(js(f, "!!document.querySelector('.crew svg')") and "%" in js(f, "document.getElementById('app').innerText"), "end of sol shows the crew face and the percentage")
    st = camp(f)["sum"]["f"]
    clk_text(f, "К карте"); pg.wait_for_timeout(500) if st else None
    c = camp(f)
    if st:
        ok(c["day"] == 2 and c["phase"] == "map" and c["faces"].get("1") == st, "passing the sol opens day 2 and keeps the crew face")
    else:
        ok(c["lives"] == 2, "a sad crew costs a life")

    # day 2: a low resource -> message from Earth; then force a lost sol
    js(f, "(()=>{const c=DuneBridge.camp();c.day=2;c.phase='map';DuneBridge.campSave(c);DuneBridge.setRes([60,20,70]);})()")
    pg.evaluate("document.querySelector('#bar [data-go=home]').click()"); pg.wait_for_timeout(200)
    pg.evaluate("document.querySelector('#bar [data-go=game]').click()"); pg.wait_for_timeout(1500)
    f = ctl(); clk(f, ".node.cur"); pg.wait_for_timeout(400)
    ok(js(f, "!!document.querySelector('.rb.low')") and "Земли" in js(f, "document.getElementById('app').innerText"), "days before 9: a message from Earth points to the lowest resource")
    js(f, "(()=>{const c=DuneBridge.camp();c.picked=['greenhouse','medbay'];c.phase='sum';c.sdone={greenhouse:{w:0,d:[-3,-2,0]},medbay:{w:0,d:[-3,-2,0]}};DuneBridge.campSave(c);DuneBridge.setRes([20,20,20])})()")
    js(f, "location.reload()"); pg.wait_for_timeout(1500)
    f = ctl(); c = camp(f)
    ok(c["sum"]["f"] == 0 and c["lives"] == 2, "under 50%: sad crew, one life lost")
    clk_text(f, "Переиграть"); pg.wait_for_timeout(500); c = camp(f)
    ok(c["day"] == 2 and c["replay"] == 1 and c["phase"] == "map", "the failed day has to be replayed")
    # three more losses -> restart
    for _ in range(2):
        js(f, "(()=>{const c=DuneBridge.camp();c.picked=['greenhouse','medbay'];c.phase='sum';c.sum=null;c.sdone={greenhouse:{w:0,d:[0,0,0]},medbay:{w:0,d:[0,0,0]}};DuneBridge.campSave(c);DuneBridge.setRes([5,5,5])})()")
        js(f, "location.reload()"); pg.wait_for_timeout(1300); f = ctl()
        clk_text(f, "Начать заново" if camp(f)["lives"] == 0 else "Переиграть"); pg.wait_for_timeout(500)
    c = camp(f)
    ok(c["day"] == 1 and c["lives"] == 3 and js(f, "DuneBridge.load().life") == 70, "no lives left: the game starts again from day 1 with fresh resources")

    # day 3: film (skippable, skipping is remembered), event takes resources
    js(f, "(()=>{const c=DuneBridge.camp();c.day=3;c.phase='map';c.replay=0;DuneBridge.campSave(c);DuneBridge.setRes([70,80,75])})()")
    js(f, "location.reload()"); pg.wait_for_timeout(1300); f = ctl(); clk(f, ".node.cur"); pg.wait_for_timeout(400)
    ok(js(f, "!!document.querySelector('.cmx') && document.querySelectorAll('.cmx-seg').length==4"), "day 3 starts with the comic (4 slides)")
    pg.wait_for_timeout(500); clk(f, ".cmx-tap.r"); pg.wait_for_timeout(700)
    ok(js(f, "document.querySelector('.cmx-cnt').textContent") == "2 / 4", "tap moves to the next slide")
    clk(f, ".cmx-foot .alt"); pg.wait_for_timeout(300)
    ok(camp(f)["skipped"].get("3") == 1, "skipping the film is remembered")
    ok(js(f, "document.querySelectorAll('.drop').length") >= 2 and js(f, "DuneBridge.load().energy") < 80, "the dust storm takes resources")
    clk_text(f, "Дальше"); pg.wait_for_timeout(300)
    ok(js(f, "document.querySelectorAll('.sec').length") == 4, "after the event comes the sector choice")
    # day 10: no messages from Earth any more
    js(f, "(()=>{const c=DuneBridge.camp();c.day=10;c.phase='map';DuneBridge.campSave(c);DuneBridge.setRes([60,10,70])})()")
    js(f, "location.reload()"); pg.wait_for_timeout(1300); f = ctl(); clk(f, ".node.cur"); pg.wait_for_timeout(400)
    ok(not js(f, "!!document.querySelector('.rb.low')") and "Земли" not in js(f, "document.getElementById('app').innerText"), "after day 9 there are no messages from Earth")
    # science: lab used twice -> one task
    js(f, "(()=>{const c=DuneBridge.camp();c.lab=1;c.day=4;c.phase='play';c.picked=['lab','airlock'];c.sdone={};DuneBridge.campSave(c);DuneBridge.setRes([60,60,60])})()")
    js(f, "DuneBridge.go('lab')"); pg.wait_for_timeout(1800)
    l = fr("Лаборатория")
    js(l, "openTutorialForOption(1)"); js(l, "startSelectedMiniGame()"); pg.wait_for_timeout(300); js(l, "finishMiniGame(true)"); pg.wait_for_timeout(300)
    ok(camp(l)["sci"] == 1 and "Научное открытие" in js(l, "document.getElementById('res-badges').parentNode.innerText"), "second lab use completes a science task")
    # the end
    js(l, "(()=>{const c=DuneBridge.camp();c.day=15;c.phase='end';c.faces={1:2,2:2};DuneBridge.campSave(c)})()")
    js(l, "DuneBridge.go('day')"); pg.wait_for_timeout(1500); f = ctl()
    ok(js(f, "!!document.querySelector('.vfx')"), "finale film plays after day 15")
    js(f, "document.querySelector('.vfx-foot button').click()"); pg.wait_for_timeout(1500)
    ok("Миссия выполнена" in js(f, "document.getElementById('app').innerText") or js(f, "!!document.querySelector('.cgx')"), "the final screen appears after day 15")
    ok(not errs, "no console errors %s" % errs[:3])
    b.close()
print("%d failure(s)" % bad); sys.exit(1 if bad else 0)
