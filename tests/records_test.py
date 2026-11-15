"""Nicknames, unique records, player card, locked database."""
import sys
from playwright.sync_api import sync_playwright
url = sys.argv[1]; bad = 0
def ok(c, m):
    global bad
    print(("  ok   " if c else "  FAIL ") + m)
    if not c: bad += 1
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 760}, service_workers="block")
    ctx.add_init_script("try{localStorage.setItem('mm-lang3','ru')}catch(e){}")
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(url); pg.wait_for_timeout(500)
    pg.evaluate("()=>{const s=document.getElementById('skip');if(s)s.click()}")
    pg.wait_for_function("!document.body.classList.contains('intro-on')", timeout=20000)
    pg.evaluate("document.querySelector('#bar [data-go=game]').click()"); pg.wait_for_timeout(1500)
    # seed records with duplicates (same player twice, different case)
    pg.evaluate("""()=>{localStorage.setItem('mm-rec',JSON.stringify({full:[{nick:'Ali',av:'🦊',stars:3,pts:500},{nick:'ali',av:'🦊',stars:2,pts:900},{nick:'Bob',av:'🐱',stars:5,pts:700}],mini:{1:[{nick:'Ali',score:9,left:3},{nick:'Ali',score:7,left:5},{nick:'Bob',score:8,left:2}]}}))}""")
    pg.evaluate("document.querySelector('.dbtn[title], .dbtn')&&0")
    pg.evaluate("""()=>{const bs=[...document.querySelectorAll('#p-game .dbtn')];bs[2].click()}"""); pg.wait_for_timeout(300)
    rows = pg.evaluate("[...document.querySelectorAll('#p-game .drow.has .dnn')].map(e=>e.textContent)")
    ok(rows[:2] == ["ali", "Bob"] and len(rows) == 4 or rows.count("Ali") + rows.count("ali") <= 2, "one player holds one place per board: %s" % rows)
    ok(pg.evaluate("document.querySelectorAll('#p-game .drow.has .dnn').length") == 2, "full board shows two unique players")
    pg.evaluate("document.querySelector('#p-game .drow.r1').click()"); pg.wait_for_timeout(1000)
    ok(pg.evaluate("!!document.querySelector('#p-game .dpt.gold')") and pg.evaluate("!!document.querySelector('#p-game .dconf')"), "first place opens the champion card with confetti")
    pg.evaluate("document.querySelector('#p-game .dpt').click()"); pg.wait_for_timeout(200)
    ok(pg.evaluate("document.querySelectorAll('#p-game .dconf').length") > 20, "tapping the champion throws more confetti")
    # database is locked until the card is earned
    pg.evaluate("go('qr')"); pg.wait_for_timeout(300)
    pg.evaluate("qrOpen('101')"); pg.wait_for_timeout(500)
    ok(pg.evaluate("!!document.querySelector('.dbbtn.locked')"), "database button is locked for a card that was not earned")
    pg.evaluate("MMVault.open('101')"); pg.wait_for_timeout(300)
    ok(not pg.evaluate("document.querySelector('.v-root.open, #vault.open, .vault.open')!==null && document.querySelector('.v-root')?.classList.contains('open')"), "vault does not open when locked")
    pg.evaluate("MMAlbum.film('d6');"); pg.wait_for_timeout(200)
    pg.evaluate("document.querySelectorAll('.al-pop').forEach(e=>e.remove())")
    pg.evaluate("qrOpen('101')"); pg.wait_for_timeout(400)
    ok(not pg.evaluate("!!document.querySelector('.dbbtn.locked')"), "database unlocks once the card is earned")
    ok(not errs, "no console errors %s" % errs[:3])
    b.close()
print(bad, "failure(s)"); sys.exit(1 if bad else 0)
