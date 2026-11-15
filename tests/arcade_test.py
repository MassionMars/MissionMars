import sys,time
from playwright.sync_api import sync_playwright
import sys
base=sys.argv[1] if len(sys.argv)>1 else "http://localhost:8133"
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={"width":1100,"height":760})
    errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('mm-lang3','ru');localStorage.setItem('mm-sound','0')")
    pg.goto(base+"/");pg.wait_for_timeout(800)
    pg.evaluate("()=>{const i=document.getElementById('intro');if(i)i.remove();document.body.classList.remove('intro-on');}")
    print("bar",pg.evaluate("[...document.querySelectorAll('#bar button')].map(b=>b.dataset.go+':'+b.textContent)"))
    pg.click('#bar [data-go="inside"]');pg.wait_for_timeout(500)
    print("cards",pg.evaluate("document.querySelectorAll('.mgc').length"),pg.evaluate("document.querySelector('#s6 h2').textContent"))
    pg.evaluate("document.getElementById('smg').scrollIntoView()");pg.wait_for_timeout(500)
    
    pg.click('.kbcard');pg.wait_for_timeout(600)
    print("page",pg.evaluate("document.body.dataset.page"),pg.evaluate("[...document.querySelectorAll('#bar button.on')].map(b=>b.dataset.go)"))
    
    pg.click('.qback');pg.wait_for_timeout(400)
    print("back",pg.evaluate("document.body.dataset.page"))
    fails=0
    for gid in range(1,17):
        pg.evaluate("document.getElementById('smg').scrollIntoView()")
        pg.click(f'[data-g="{gid}"]');pg.wait_for_timeout(1500)
        fr=pg.frame_locator('.arc iframe')
        f=[x for x in pg.frames if x!=pg.main_frame and 'blank' not in x.url][-1]
        st=f.evaluate("()=>({tut:!(document.getElementById('gh-tutorial-modal')||document.getElementById('lab-tutorial-modal')||document.getElementById('airlock-tutorial-modal')).classList.contains('hidden'),title:document.getElementById('tut-title').textContent})")
        # start game
        try:
            f.evaluate("()=>startSelectedMiniGame()");pg.wait_for_timeout(700)
            run=f.evaluate("()=>({running:miniGameRunning,t:document.getElementById('game-timer-display').textContent})")
        except Exception as e: run=str(e)
        
        ok=st['tut'] and isinstance(run,dict) and run['running']
        if not ok: fails+=1
        print(gid,st,run,"OK" if ok else "FAIL")
        pg.click('.avx');pg.wait_for_timeout(200)
    print("arc state",pg.evaluate("window.__mmArc"),"mm-dune",pg.evaluate("localStorage.getItem('mm-dune')"))
    print("errs",errs[:5],"fails",fails)
    assert not errs and fails==0 and pg.evaluate("localStorage.getItem('mm-dune')") is None
    print("0 failure(s)")
    b.close()
