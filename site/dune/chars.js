/* v14: characters NOVA (facts/alerts), Mohinur & Khurshed (tutorials). Holographic dialogs. */
(function () {
  "use strict";
  var base = (function () { var s = document.currentScript; return s && s.src ? s.src.replace(/[^\/]*$/, "") : "dune/"; })();
  var H = function (n, c) { return window.MMHolo ? MMHolo.ic(n, c) : ""; };
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function lang() { var l = ""; try { l = document.documentElement.getAttribute("data-dl") || (window.DuneI18n && DuneI18n.get()) || document.documentElement.lang || "ru"; } catch (e) {} return l === "tj" ? "tg" : (l || "ru").slice(0, 2); }
  var WHO = {
    nova: { img: "nova.webp", name: "NOVA", role: { ru: "Бортовой СИ", en: "Onboard SI", tg: "СИ-и бортӣ" }, col: "#7ee7ff" },
    mohinur: { img: "mohinur.webp", name: "Мохинур", role: { ru: "Юниор-астронавт", en: "Junior astronaut", tg: "Кайҳоннаварди ҷавон" }, col: "#ffd36e", en: "Mohinur", tg: "Моҳинур" },
    khurshed: { img: "khurshed.webp", name: "Хуршед", role: { ru: "Юниор-астронавт", en: "Junior astronaut", tg: "Кайҳоннаварди ҷавон" }, col: "#8dffb4", en: "Khurshed", tg: "Хуршед" }
  };
  var UI = {
    next: { ru: "Дальше", en: "Next", tg: "Минбаъд" }, ok: { ru: "Понятно", en: "Got it", tg: "Фаҳмидам" }, skip: { ru: "Пропустить", en: "Skip", tg: "Гузаштан" },
    go: { ru: "К выбору", en: "To the choice", tg: "Ба интихоб" }, fact: { ru: "Факт", en: "Fact", tg: "Факт" }, know: { ru: "Знаете ли вы?", en: "Did you know?", tg: "Оё медонед?" },
    nasa: { ru: "Читать на NASA", en: "Read on NASA", tg: "Дар NASA хон" }, alarm: { ru: "ТРЕВОГА", en: "ALERT", tg: "ХАТАР" }, tap: { ru: "Нажми", en: "Tap", tg: "Пахш кун" }
  };
  function tx(o) { if (typeof o === "string") return o; var l = lang(); return o[l] || o.en || o.ru; }
  function nm(w) { var l = lang(), x = WHO[w]; return l === "ru" ? x.name : (x[l] || x.name); }
  var EMO = { happy: "spark", alert: "warn", think: "bulb", wow: "star", point: "tap" };
  function seenGet(k) { try { return window.DuneBridge && DuneBridge.hasSeen ? DuneBridge.hasSeen(k) : localStorage.getItem("mmc-" + k) === "1"; } catch (e) { return false; } }
  function seenSet(k) { try { if (window.DuneBridge && DuneBridge.seen) DuneBridge.seen(k); else localStorage.setItem("mmc-" + k, "1"); } catch (e) {} }


  /* sound: tiny WebAudio cues (respect the game's sound switch) */
  var AC = null;
  function sfx(kind) {
    try {
      if (window.DuneBridge && DuneBridge.sfx && !DuneBridge.sfx()) return;
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume();
      var t0 = AC.currentTime;
      function tone(f, t, d, type, v) { var o = AC.createOscillator(), g = AC.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t0 + t); g.gain.setValueAtTime(0.0001, t0 + t); g.gain.exponentialRampToValueAtTime(v || .18, t0 + t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + d); o.connect(g); g.connect(AC.destination); o.start(t0 + t); o.stop(t0 + t + d + .02); }
      if (kind === "alarm") { for (var i = 0; i < 3; i++) { tone(880, i * .5, .22, "square", .12); tone(587, i * .5 + .25, .22, "square", .12); } }
      else if (kind === "fact") { tone(784, 0, .18, "triangle", .16); tone(1047, .12, .22, "triangle", .16); tone(1319, .26, .3, "triangle", .14); }
      else if (kind === "say") { tone(660, 0, .1, "sine", .1); tone(880, .08, .14, "sine", .1); }
    } catch (e) {}
  }

  function charHTML(w, emo) {
    var c = WHO[w];
    return '<div class="mc-char mc-' + w + '"><i class="mc-aura" style="--c:' + c.col + '"></i><img src="' + ((window.MM_CHARS && MM_CHARS[w]) || (base + "img/" + c.img)) + '" alt="' + c.name + '" draggable="false"><span class="mc-emo">' + H(EMO[emo] || "spark") + '</span><i class="mc-orb o1"></i><i class="mc-orb o2"></i><i class="mc-orb o3"></i></div>';
  }
  var ring = null, ringT = null;
  function point(sel, avoid) {
    unpoint(); if (!sel) return; var t = document.querySelector(sel); if (!t) return;
    var r0 = t.getBoundingClientRect(); if (r0.width < 8 || r0.height < 8) return;
        ring = el("div", "mc-ring"); document.body.appendChild(ring);
    function upd() {
      if (!ring) return; var r = t.getBoundingClientRect(), hide = false;
      if (avoid && avoid.isConnected) { var a = avoid.getBoundingClientRect(), m = 14; hide = r.left - m < a.right && r.right + m > a.left && r.top - m < a.bottom && r.bottom + m > a.top; }
      if (r.width < 8 || r.height < 8) hide = true;
      ring.style.cssText = "left:" + (r.left - 8) + "px;top:" + (r.top - 8) + "px;width:" + (r.width + 16) + "px;height:" + (r.height + 16) + "px" + (hide ? ";display:none" : "");
    }
    upd(); ringT = setInterval(upd, 300);
  }
  function unpoint() { if (ring) { ring.remove(); ring = null; } clearInterval(ringT); }

  var BUSY = false, WAIT = [];
  function dialog(o) {
    var w = o.who || "mohinur", side = o.side || (w === "khurshed" ? "right" : "left"), kind = o.kind || "tut";
    var root = el("div", "mc-ov mc-k-" + kind + (o.dim === false ? "" : " dim") + (o.pos === "top" ? " pos-top" : ""));
    var link = o.url ? '<a class="mc-link" href="' + o.url + '" target="_blank" rel="noopener">' + H("sat") + '<span>' + tx(UI.nasa) + '</span> ↗</a>' : "";
    var dots = o.total > 1 ? '<span class="mc-dots">' + Array.apply(null, Array(o.total)).map(function (_, i) { return '<i' + (i === o.index ? ' class="on"' : "") + '></i>'; }).join("") + '</span>' : "";
    root.innerHTML = '<div class="mc-dlg side-' + side + ' emo-' + (o.emo || "happy") + '">' + charHTML(w, o.emo || "happy") +
      '<div class="mc-bub"><i class="mc-c c1"></i><i class="mc-c c2"></i><i class="mc-c c3"></i><i class="mc-c c4"></i>' +
      '<div class="mc-who"><b>' + nm(w) + '</b><em>' + tx(WHO[w].role) + '</em>' + dots + '</div>' +
      (o.title ? '<h4 class="mc-h">' + (o.icon ? H(o.icon) : "") + '<span class="mc-ht">' + tx(o.title) + '</span></h4>' : "") +
      '<p class="mc-t">' + tx(o.text) + '</p>' + link +
      '<div class="mc-acts">' + (o.onSkip ? '<button type="button" class="mc-skip">' + tx(UI.skip) + '</button>' : "") + '<button type="button" class="mc-go">' + tx(o.btn || UI.ok) + ' ›</button></div></div></div>';
    var started = false;
    function start() {
      started = true; BUSY = true; document.body.appendChild(root);
      requestAnimationFrame(function () { root.classList.add("in"); });
      setTimeout(function () { if (started && root.parentNode) point(o.at, root.querySelector(".mc-bub")); }, 450);
      sfx(kind === "alert" ? "alarm" : kind === "fact" ? "fact" : "say");
    }
    /* only one speech bubble on screen at a time: a second one waits for the first (no stacked, overlapping text) */
    if (BUSY) WAIT.push(start); else start();
    function close(skip) {
      if (!started) { var wi = WAIT.indexOf(start); if (wi >= 0) WAIT.splice(wi, 1); } else { unpoint(); root.classList.remove("in"); setTimeout(function () { root.remove(); BUSY = false; var nx = WAIT.shift(); if (nx) nx(); }, 280); }
      if (skip) { if (o.onSkip) o.onSkip(); } else if (o.onNext) o.onNext();
    }
    function relang() {
      var q = function (x) { return root.querySelector(x); };
      if (q(".mc-who b")) q(".mc-who b").textContent = nm(w); if (q(".mc-who em")) q(".mc-who em").textContent = tx(WHO[w].role);
      if (q(".mc-ht")) q(".mc-ht").textContent = tx(o.title); if (q(".mc-t")) q(".mc-t").textContent = tx(o.text);
      if (q(".mc-go")) q(".mc-go").textContent = tx(o.btn || UI.ok); if (q(".mc-skip")) q(".mc-skip").textContent = tx(UI.skip);
      if (q(".mc-link span")) q(".mc-link span").textContent = tx(UI.nasa);
    }
    document.addEventListener("dunelang", relang); var _c = close; close = function (k) { document.removeEventListener("dunelang", relang); _c(k); };
    root.querySelector(".mc-go").onclick = function () { close(false); };
    var sk = root.querySelector(".mc-skip"); if (sk) sk.onclick = function () { close(true); };
    return { close: close, root: root };
  }

  /* tutorial: steps = [{who, emo, text, at, title}], done once per key */
  function tour(key, steps, cb, force) {
    if (!force && seenGet("tour-" + key)) { if (cb) cb(); return false; }
    var i = 0, stop = false;
    (function step() {
      if (stop || i >= steps.length) { seenSet("tour-" + key); if (cb) cb(); return; }
      var s = steps[i], last = i === steps.length - 1;
      dialog({ who: s.who, emo: s.emo, text: s.text, title: s.title, icon: s.icon, at: s.at, pos: s.pos, dim: s.dim, index: i, total: steps.length, btn: last ? UI.ok : UI.next,
        onNext: function () { i++; step(); }, onSkip: function () { stop = true; seenSet("tour-" + key); if (cb) cb(); } });
    })();
    return true;
  }

  /* NOVA alert before a crisis choice */
  function alertBox(o, cb) {
    var d = dialog({ who: "nova", emo: "alert", kind: "alert", side: "left", title: o.title, icon: o.icon || "warn", text: o.text, btn: UI.go, onNext: cb });
    var b = d.root.querySelector(".mc-bub"); var tag = el("div", "mc-alarm", H("warn") + "<b>" + tx(UI.alarm) + "</b>" + H("warn")); b.insertBefore(tag, b.firstChild);
    return d;
  }

  /* NOVA fact beacon: drops from the top, glows and levitates, click opens full card */
  var FB = null;
  function fact(f, cb) {
    if (FB) FB.remove();
    var b = el("button", "mc-beacon"); b.type = "button";
    b.innerHTML = '<span class="mc-bs"></span><span class="mc-bs b2"></span><span class="mc-bs b3"></span>' + charHTML("nova", "wow") + '<span class="mc-bchip">' + H("bulb") + '<b>' + tx(UI.know) + '</b><i>' + H("tap") + '</i></span>';
    document.body.appendChild(b); FB = b;
    requestAnimationFrame(function () { b.classList.add("in"); });
    sfx("fact"); var tmr = setTimeout(function () { b.classList.add("min"); }, 22000);
    b.onclick = function () { clearTimeout(tmr); b.remove(); FB = null; factCard(f, cb); };
    return b;
  }
  function factCard(f, cb) {
    var d = dialog({ who: "nova", emo: "happy", kind: "fact", side: "left", title: f.title, icon: f.icon || "bulb", text: f.text, url: f.url, btn: UI.ok, onNext: cb });
    var b = d.root.querySelector(".mc-bub"); b.insertBefore(el("div", "mc-tag", H("spark") + "<b>" + tx(UI.know) + "</b>"), b.firstChild);
    return d;
  }
  window.MMChar = { say: dialog, tour: tour, alert: alertBox, fact: fact, factCard: factCard, WHO: WHO, UI: UI, tx: tx, seen: seenGet, mark: seenSet, point: point, unpoint: unpoint };
})();
(function(){try{if(sessionStorage.getItem("mm-glitch-in")!=="1")return;sessionStorage.removeItem("mm-glitch-in");}catch(e){return}
 function run(){var o=document.createElement("div");o.className="mc-glin";o.innerHTML='<i></i><i></i><i></i><i></i><i></i><u></u>';document.body.appendChild(o);document.body.classList.add("mc-glbody");setTimeout(function(){o.remove();document.body.classList.remove("mc-glbody")},1100)}
 if(document.body)run();else document.addEventListener("DOMContentLoaded",run)})();
