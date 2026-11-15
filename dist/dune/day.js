function mmLg(){var l=null;try{l=window.parent.__mmLang}catch(e){}if(!l)try{l=window.DuneI18n&&DuneI18n.get()}catch(e){}if(!l)l=document.documentElement.getAttribute("data-dl");return(l==="ru"||l==="en"||l==="tg")?l:"en"}
(function () {
  "use strict";
  var B = window.DuneBridge, D = window.MMDay, app = document.getElementById("app");
  try { if (!window.MM_COMICS && window.parent && window.parent !== window) window.MM_COMICS = window.parent.MM_COMICS; } catch (e) {}
  if (!B || !D) return;
  B.icons();
  var stage = null, queue = [], sel = [];

  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function btn(txt, cls, fn) { var b = h("button", "btn " + (cls || ""), txt); b.type = "button"; b.onclick = function () { B.click(); fn(); }; return b; }
  function clear() { app.textContent = ""; }
  function say(m) { try { window.parent.postMessage(m, "*"); } catch (e) {} }
  function host() { try { return window.parent && window.parent !== window ? window.parent.MMHost : null; } catch (e) { return null; } }
  function nick() { var m = host(); return (m && m.nick && m.nick()) || ""; }
  function cleanNick(s) { return String(s || "").replace(/[^\p{L}\p{N} _\-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 14); }

  var FILMS = window.MM_FILMS || {
    intro: { t: "Первый контакт", s: "Мохинур и Хуршед прилетают на Марс и открывают базу MISSION MARS.", src: "" },
    d3: { t: "Стена пыли", s: "Над базой поднимается пылевая буря. Мохинур и Хуршед готовят панели.", src: "" },
    d6: { t: "Вспышка", s: "Датчики Хуршеда фиксируют мощную вспышку на Солнце.", src: "" },
    d9: { t: "Тишина в эфире", s: "Мохинур зовёт Землю, но эфир молчит: Марс ушёл за Солнце.", src: "" },
    d12: { t: "Самая холодная ночь", s: "Температура падает, а изоляция давит на всех.", src: "" },
    d15: { t: "Возвращение героев", s: "Корабль ждёт. Экипаж возвращается домой.", src: "" }
  };
  function film(key, done0, skippable) {
    var done = function (sk) { if (!sk) say({ mmDune: "award", k: "film", v: key }); done0(sk); };
    clear();
    if (window.MM_COMICS && MM_COMICS[key]) return comic(key, done);
    if ((key === "intro" || key === "d15") && videoFilm(key === "intro" ? "intro" : "finale", done)) return;
    var f = FILMS[key] || FILMS.intro, box = h("div", "film");
    if (f.src) {
      var v = document.createElement("video"); v.src = f.src; v.controls = true; v.autoplay = true; v.playsInline = true;
      v.onended = function () { done(false); }; box.appendChild(v);
    } else {
      box.appendChild(h("span", "tag", "🎬 Мини-фильм"));
      box.appendChild(h("h2", "", f.t));
      var cast = h("div", "cast");
      [["🧑‍🚀", "Мохинур"], ["👨‍🚀", "Хуршед"]].forEach(function (c) { var w = h("div", "who"); var av = h("div", "av"); av.innerHTML = '<img src="' + (window.MM_CHARS ? MM_CHARS[c[1] === "Мохинур" ? "mohinur" : "khurshed"] : "") + '" alt="" draggable="false">'; w.appendChild(av); w.appendChild(h("span", "", c[1])); cast.appendChild(w); });
      box.appendChild(cast);
      box.appendChild(h("p", "", f.s));
      var go = btn("▶ Смотреть", "gold", function () { box.classList.add("play"); go.disabled = true; setTimeout(function () { done(false); }, 5000); });
      box.appendChild(go); box.appendChild(h("div", "bar"));
    }
    var sk = h("div", "skip"); sk.appendChild(btn("Пропустить ⏭", "alt", function () { done(true); })); box.appendChild(sk);
    var wrap = h("div", "top"); app.appendChild(wrap); app.appendChild(box);
  }

  /* ---- comic reward: 4 slides per day (3, 6, 9, 12), auto-play + tap / swipe / keys, skippable ---- */
  var CT = {
    d3: { ru: "Стена пыли", en: "Wall of dust", tg: "Девори чанг" },
    d6: { ru: "Вспышка", en: "The flare", tg: "Шӯълавар" },
    d9: { ru: "Тишина в эфире", en: "Radio silence", tg: "Хомӯшӣ дар эфир" },
    d12: { ru: "Самая холодная ночь", en: "The coldest night", tg: "Шаби сардтарин" }
  };
  var CL = {
    ru: { sol: "Сол", skip: "Пропустить", next: "Продолжить", gift: "Подарок за миссию", prev: "Назад", fwd: "Дальше", pause: "Пауза" },
    en: { sol: "Sol", skip: "Skip", next: "Continue", gift: "Mission reward", prev: "Back", fwd: "Next", pause: "Paused" },
    tg: { sol: "Сол", skip: "Гузаштан", next: "Идома", gift: "Тӯҳфа барои миссия", prev: "Қафо", fwd: "Баъд", pause: "Таваққуф" }
  };
  function comic(key, done) {
    var lg = mmLg(); if (!CL[lg]) lg = "en";
    var L = CL[lg], pics = MM_COMICS[key], N = pics.length, SLIDE_MS = 6500, i = -1, timer = 0, t0 = 0, left = SLIDE_MS, paused = false, finished = false, busy = 0;
    clear();
    var wrap = h("div", "cmx"), stage = h("div", "cmx-stage"), bars = h("div", "cmx-bars"), head = h("div", "cmx-head");
    head.appendChild(h("span", "cmx-sol", L.sol + " " + key.slice(1)));
    head.appendChild(h("span", "cmx-t", (CT[key] || CT.d3)[lg]));
    var segs = [];
    for (var k = 0; k < N; k++) { var sg = h("i", "cmx-seg"); sg.appendChild(h("b")); bars.appendChild(sg); segs.push(sg); }
    var tapL = h("button", "cmx-tap l"), tapR = h("button", "cmx-tap r"); tapL.type = tapR.type = "button"; tapL.setAttribute("aria-label", L.prev); tapR.setAttribute("aria-label", L.fwd);
    var pz = h("div", "cmx-pause", "❚❚ " + L.pause);
    var foot = h("div", "cmx-foot"), cnt = h("span", "cmx-cnt", ""), skip = btn(L.skip + " ⏭", "alt", function () { end(true); }), nxt = btn(L.next + " ▶", "gold", function () { end(false); });
    nxt.classList.add("cmx-next"); nxt.style.display = "none";
    foot.appendChild(skip); foot.appendChild(cnt); foot.appendChild(nxt);
    stage.appendChild(head); stage.appendChild(bars); stage.appendChild(tapL); stage.appendChild(tapR); stage.appendChild(pz);
    wrap.appendChild(h("div", "cmx-gift", "🎁 " + L.gift)); wrap.appendChild(stage); wrap.appendChild(foot); app.appendChild(wrap);
    pics.forEach(function (u) { var im = new Image(); im.src = u; });

    function end(sk) { if (finished) return; finished = true; clearTimeout(timer); document.removeEventListener("keydown", key_, true); done(sk); }
    function show(n, dir) {
      if (n < 0 || n >= N || finished) return;
      var old = stage.querySelector(".cmx-img.cur");
      var im = h("div", "cmx-img " + (dir < 0 ? "fromL" : "fromR") + " kb" + (n % 4));
      im.style.backgroundImage = 'url("' + pics[n] + '")';
      stage.insertBefore(im, head);
      if (old) { old.classList.remove("cur"); old.classList.add("out", dir < 0 ? "toR" : "toL"); setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 900); }
      im.classList.add("cur"); i = n;
      segs.forEach(function (sg, j) { sg.className = "cmx-seg" + (j < n ? " done" : ""); var b = sg.firstChild; b.style.transition = "none"; b.style.width = j < n ? "100%" : "0%"; });
      cnt.textContent = (n + 1) + " / " + N;
      var last = n === N - 1; nxt.style.display = last ? "" : "none"; skip.style.display = last ? "none" : "";
      left = SLIDE_MS; if (!paused) run();
    }
    function run() {
      clearTimeout(timer); t0 = Date.now();
      var b = segs[i] && segs[i].firstChild; if (b) { b.style.transition = "none"; var cur = 1 - left / SLIDE_MS; b.style.width = (cur * 100) + "%"; void b.offsetWidth; b.style.transition = "width " + left + "ms linear"; b.style.width = "100%"; }
      stage.classList.remove("hold");
      if (i < N - 1) timer = setTimeout(function () { go(1); }, left);
    }
    function halt() { if (paused || finished) return; paused = true; clearTimeout(timer); left = Math.max(300, left - (Date.now() - t0)); var b = segs[i] && segs[i].firstChild; if (b) { var w = b.getBoundingClientRect().width / b.parentNode.getBoundingClientRect().width; b.style.transition = "none"; b.style.width = (w * 100) + "%"; } stage.classList.add("hold"); }
    function resume() { if (!paused || finished) return; paused = false; run(); }
    function go(d) { var n = i + d; if (n < 0 || n >= N) return; var now = Date.now(); if (now - busy < 380) return; busy = now; show(n, d); }
    function key_(e) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); if (i === N - 1 && e.key !== "ArrowRight") end(false); else go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); end(true); }
    }
    document.addEventListener("keydown", key_, true);
    // press and hold = pause; short tap = prev / next
    var lastP = 0, down = 0, holdT = 0, held = false, sx = 0, sy = 0;
    function pdown(e) { down = Date.now(); held = false; sx = e.clientX; sy = e.clientY; holdT = setTimeout(function () { held = true; halt(); }, 260); }
    function pup(side, e) { clearTimeout(holdT); var dx = e.clientX - sx; if (held) { held = false; resume(); return; } if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); return; } go(side); }
    [[tapL, -1], [tapR, 1]].forEach(function (p) {
      p[0].addEventListener("pointerdown", pdown);
      p[0].addEventListener("pointerup", function (e) { lastP = Date.now(); pup(p[1], e); });
      p[0].addEventListener("click", function () { if (Date.now() - lastP > 700) go(p[1]); });
      p[0].addEventListener("pointerleave", function () { clearTimeout(holdT); if (held) { held = false; resume(); } });
      p[0].addEventListener("pointercancel", function () { clearTimeout(holdT); if (held) { held = false; resume(); } });
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) halt(); else resume(); });
    show(0, 1);
  }

  /* ---- the two mini-films (start of sol 1 / after sol 15): full quality, music ducks while they play, skippable ---- */
  var VT = {
    ru: { intro: "Пролог миссии", finale: "Финал миссии", skip: "Пропустить", warn: "Если пропустить фильм, карточки-бонусы за него не выдаются.", play: "Смотреть", next: "Продолжить" },
    en: { intro: "Mission prologue", finale: "Mission finale", skip: "Skip", warn: "If you skip the film, you will not get its bonus cards.", play: "Watch", next: "Continue" },
    tg: { intro: "Пролог", finale: "Финали миссия", skip: "Гузаштан", warn: "Агар филмро гузаронед, кортҳои бонусӣ дода намешаванд.", play: "Тамошо", next: "Идома" }
  };
  function mp() { try { return window.parent && window.parent !== window ? window.parent.MMVideo : null; } catch (e) { return null; } }
  function videoFilm(k, done) {
    var V = mp(); if (!V || !V.has || !V.has(k)) return false;
    var src = V.url(k); if (!src) return false;
    var lg0 = mmLg(); var L = VT[lg0] || VT.en;
    clear();
    var wrap = h("div", "vfx"), stage = h("div", "vfx-stage"), v = document.createElement("video"), finished = false;
    v.src = src; v.poster = V.poster ? V.poster(k) : ""; v.controls = true; v.playsInline = true; v.preload = "auto"; v.setAttribute("controlslist", "nodownload noplaybackrate"); v.disablePictureInPicture = true;
    stage.appendChild(v);
    var tag = h("div", "vfx-tag", "🎬 " + L[k === "intro" ? "intro" : "finale"]); stage.appendChild(tag);
    var big = h("button", "vfx-big", "▶"); big.type = "button"; big.style.display = "none"; big.setAttribute("aria-label", L.play); stage.appendChild(big);
    var foot = h("div", "vfx-foot"), sk = btn(L.skip + " ⏭", "alt", function () { end(true); });
    foot.appendChild(sk); foot.appendChild(h("p", "vfx-warn", L.warn));
    wrap.appendChild(stage); wrap.appendChild(foot); app.appendChild(wrap);
    function duck(on) { say({ mmDune: "duck", on: on }); }
    function end(sk2) { if (finished) return; finished = true; try { v.pause(); } catch (e) {} duck(false); window.removeEventListener("pagehide", ph); document.removeEventListener("keydown", kd, true); done(sk2); }
    function ph() { duck(false); }
    function kd(e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); end(true); } }
    window.addEventListener("pagehide", ph); document.addEventListener("keydown", kd, true);
    v.onended = function () { setTimeout(function () { end(false); }, 500); };
    v.onplay = function () { big.style.display = "none"; duck(true); };
    v.onpause = function () { if (!finished && !v.ended) duck(false); };
    v.onerror = function () { if (!finished) { finished = true; duck(false); document.removeEventListener("keydown", kd, true); film(k === "intro" ? "intro" : "d15", done, true, true); } };
    big.onclick = function () { v.play(); };
    var pr = v.play(); if (pr && pr.catch) pr.catch(function () { big.style.display = ""; });
    return true;
  }

  /* ---- congratulations after the finale ---- */
  var CG = {
    ru: { t: "Поздравляем, {n}!", p: "Ты спас базу MISSION MARS и вернул экипаж домой. Космос гордится тобой!", pts: "Очки", sci: "Открытия", ok: "Продолжить" },
    en: { t: "Congratulations, {n}!", p: "You saved the MISSION MARS base and brought the crew home. Space is proud of you!", pts: "Points", sci: "Discoveries", ok: "Continue" },
    tg: { t: "Табрик, {n}!", p: "Ту пойгоҳи MISSION MARS-ро наҷот дода, экипажро ба хона баргардондӣ. Кайҳон ба ту фахр мекунад!", pts: "Холҳо", sci: "Кашфиётҳо", ok: "Идома" }
  };
  function congrats(pts, sci) {
    var lg0 = mmLg(), L = CG[lg0] || CG.en, ov = h("div", "cgx"), box = h("div", "cgx-box");
    for (var i = 0; i < 26; i++) { var p = h("i", "cgx-c"); p.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "%"); p.style.setProperty("--d", (Math.random() * 2.4).toFixed(2) + "s"); p.style.setProperty("--r", Math.floor(Math.random() * 360) + "deg"); p.style.setProperty("--h", [48, 190, 330, 130, 28][i % 5]); ov.appendChild(p); }
    var ic = h("div", "cgx-ic"); ic.innerHTML = HO ? HO.ic("trophy") : "🏆"; box.appendChild(ic);
    box.appendChild(h("h2", "", L.t.replace("{n}", nick() || "Astro"))); box.appendChild(h("p", "", L.p));
    var st = h("div", "cgx-st"); [[L.pts, pts], [L.sci, sci + " / 5"]].forEach(function (a) { var d = h("div", "cgx-s"); d.appendChild(h("em", "", a[0])); d.appendChild(h("b", "", String(a[1]))); st.appendChild(d); }); box.appendChild(st);
    box.appendChild(btn(L.ok, "gold", function () { ov.classList.remove("in"); setTimeout(function () { ov.remove(); }, 300); }));
    ov.appendChild(box); document.body.appendChild(ov); requestAnimationFrame(function () { ov.classList.add("in"); });
  }

  function nameView() {
    clear();
    var c = h("div", "card name");
    c.appendChild(h("div", "ico", "🧑‍🚀"));
    c.appendChild(h("h2", "", "Как тебя зовут, астронавт?"));
    c.appendChild(h("p", "muted", "Имя попадёт в таблицу рекордов. До 14 символов."));
    var inp = h("input", "inp"); inp.type = "text"; inp.maxLength = 14; inp.value = nick(); inp.placeholder = "Astro"; inp.autocomplete = "off"; inp.spellcheck = false;
    var AV = (host() && host().AVS) || ["🧑‍🚀", "👩‍🚀", "🦊", "🐱", "🐼", "🦉", "🚀", "🌟", "🤖", "🦄", "🐲", "🛰️"], av = (host() && host().av && host().av()) || AV[0];
    var warn = h("p", "muted warn", "");
    function go() {
      var n = cleanNick(inp.value); if (inp.value.trim() && n.length < 2) { warn.textContent = "В нике должно быть минимум 2 буквы"; return; } n = n || "Astro";
      var m = host(); if (m && m.setNick) m.setNick(n, av); say({ mmDune: "nick", nick: n, av: av });
      var cc = B.camp(); cc.phase = "map"; cc.day = 1; cc.lives = 3; B.campSave(cc); render();
    }
    inp.onkeydown = function (e) { if (e.key === "Enter") go(); };
    c.appendChild(inp); c.appendChild(warn); c.appendChild(h("p", "muted", "Выбери аватар"));
    var pk = h("div", "avs"); AV.forEach(function (a) { var b = h("button", "av1" + (a === av ? " on" : ""), a); b.type = "button"; b.onclick = function () { av = a; pk.querySelectorAll(".av1").forEach(function (x) { x.classList.toggle("on", x === b); }); }; pk.appendChild(b); });
    c.appendChild(pk); c.appendChild(btn("Начать миссию 🚀", "", go));
    app.appendChild(c); setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 80);
  }

  var HO = window.MMHolo;
  function fh(k, sz) { return HO ? HO.face(k, sz) : ["😞", "😐", "😀"][k]; }
  var EVI = { 1: ["rocket", "#8dffb4", "Старт"], 3: ["storm", "#ffc58a", "Буря"], 6: ["flare", "#ffe27a", "Вспышка"], 9: ["dish", "#ff8f9c", "Связь"], 12: ["cold", "#aee6ff", "Холод"], 15: ["trophy", "#ffe27a", "Финал"] };
  function topBar(c) {
    var t = h("div", "top");
    t.appendChild(h("span", "pill", "👤 " + (nick() || "Astro")));
    t.appendChild(h("span", "pill", "☀️ Сол " + c.day + " / 15"));
    var hr = h("span", "pill"); var hs = h("span", "hearts"); for (var i = 0; i < 3; i++) hs.appendChild(h("span", i < c.lives ? "" : "x", "❤️")); hr.appendChild(hs); hr.title = "Жизни"; t.appendChild(hr);
    var sb = h("button", "pill", "🔬 " + c.sci + " / 5"); sb.type = "button"; sb.onclick = function () { sciCard(c); }; t.appendChild(sb);
    return t;
  }
  function sciCard(c) {
    var ov = h("div", "mm-fact-card"), in_ = h("div", "mm-fact-in");
    in_.appendChild(h("h4", "", "Научные открытия"));
    D.SCI.forEach(function (s, i) {
      var r = h("div", "sci"); r.appendChild(h("span", "", s.i));
      var b = h("span"); b.appendChild(h("b", "", s.n)); b.appendChild(document.createElement("br"));
      var vis = c.lab + c.rv, okk = vis >= 2 * (i + 1); b.appendChild(h("span", "", okk ? "✅ " : "")); b.appendChild(h("span", "", okk ? s.t : "🔒 Ещё визитов в лабораторию или на ровер: " + Math.max(0, 2 * (i + 1) - vis)));
      r.appendChild(b); in_.appendChild(r);
    });
    var ok = h("button", "mm-btn2", "Понятно"); ok.type = "button"; ok.onclick = function () { ov.remove(); }; in_.appendChild(ok);
    ov.appendChild(in_); ov.onclick = function (e) { if (e.target === ov) ov.remove(); }; document.body.appendChild(ov);
  }
  function mapView() {
    clear(); var c = B.camp();
    app.appendChild(topBar(c));
    var tall = app.clientWidth < 600, cols = tall ? 3 : 5, rows = tall ? 5 : 3;
    var w = h("div", "mapw" + (tall ? " tall" : ""));
    var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
    var pts = [];
    for (var i = 0; i < 15; i++) {
      var r = Math.floor(i / cols), k = i % cols, col = r % 2 ? cols - 1 - k : k;
      pts.push([(col + .5) / cols * 100, (r + .5) / rows * 100]);
    }
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", "M" + pts.map(function (q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L"));
    p.setAttribute("fill", "none"); p.setAttribute("stroke", "rgba(126,231,255,.75)"); p.setAttribute("stroke-width", "3"); p.setAttribute("stroke-dasharray", "2 13"); p.setAttribute("class", "flow"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(p); w.appendChild(svg);
    var availH = Math.max(220, app.clientHeight - 150), base = Math.min(app.clientWidth - 28, tall ? 420 : 860, tall ? availH * 7 / 12 : availH * 16 / 9);
    w.style.width = base + "px";
    var d0 = Math.max(34, Math.min(78, base / cols * .5));
    for (i = 0; i < 15; i++) {
      var n = i + 1, sp = B.SPECIAL.indexOf(n) >= 0, d = d0 * (sp ? 1.22 : 1);
      var st = n < c.day || (n === c.day && c.phase === "end") ? "done" : n === c.day ? "cur" : "lock";
      var b = h("button", "node " + st + (sp ? " sp" : "")); b.type = "button";
      b.style.setProperty("--d", d + "px"); b.style.left = pts[i][0] + "%"; b.style.top = pts[i][1] + "%";
      b.setAttribute("aria-label", "Сол " + n);
      var ev = EVI[n];
      if (st === "done") { var fc = h("span", "fc"); fc.innerHTML = fh(c.faces[n] != null ? c.faces[n] : 1, 64); b.appendChild(fc); b.appendChild(h("span", "nn", String(n))); }
      else if (sp && ev) {
        var ee = h("span", "ev"); ee.innerHTML = HO.ic(ev[0]); ee.firstChild.style.setProperty("--hc", ev[1]); b.appendChild(ee);
        b.appendChild(h("span", "nn", String(n))); b.appendChild(h("span", "tag", ev[2]));
        if (st === "lock") b.style.setProperty("--c", ev[1]);
        var gf = h("span", "gift"); gf.innerHTML = HO.ic("gift"); b.appendChild(gf);
        if (st === "lock") { var lk0 = h("span", "lk"); lk0.innerHTML = HO.ic("lock"); b.appendChild(lk0); }
      } else {
        b.appendChild(document.createTextNode(String(n)));
        if (st === "lock") { var lk = h("span", "lk"); lk.innerHTML = HO.ic("lock"); b.appendChild(lk); }
      }
      if (st === "cur") b.onclick = function () { B.click(); enterDay(); }; else b.tabIndex = -1;
      w.appendChild(b);
    }
    app.appendChild(w);
    var info = h("div", "dinfo"), lbl = c.phase === "play" ? "Вернуться на базу" : c.phase === "pick" ? "Выбрать сектора" : "Начать сол " + c.day;
    info.appendChild(btn(lbl + " ▶", "gold", enterDay));
    if (B.SPECIAL.indexOf(c.day) >= 0) info.appendChild(h("span", "pill", "🎁 Особый день"));
    if (c.replay) info.appendChild(h("span", "pill", "↺ Нужно переиграть этот день"));
    var jb = btn("🛠 " + jt("btn"), "alt jury-b", juryPanel); info.appendChild(jb);
    app.appendChild(info);
    D.tip("map");
    if (c.day === 1) D.fact("sol");
  }


  /* ---------- jury panel: restart, skip days (auto-play at medium level) ---------- */
  var JT = {
    title: { ru: "Панель жюри", en: "Jury panel", tg: "Панели ҳакамон" },
    sub: { ru: "Можно пропускать сволы: игра сама пройдёт день на среднем уровне (около 60% побед).", en: "Skip sols: the game plays the day for you at a medium level (about 60% wins).", tg: "Рӯзҳоро гузаштан мумкин: бозӣ худаш дар сатҳи миёна мегузарад (тақрибан 60% ғалаба)." },
    jump: { ru: "Перейти к солу", en: "Jump to sol", tg: "Гузариш ба сол" },
    skip1: { ru: "Пропустить текущий сол (авто)", en: "Skip current sol (auto)", tg: "Гузаштани соли ҷорӣ (худкор)" },
    again: { ru: "Начать игру заново", en: "Restart the game", tg: "Аз нав оғоз кардан" },
    sure: { ru: "Весь прогресс будет стёрт. Начать заново?", en: "All progress will be erased. Restart?", tg: "Тамоми пешрафт нест мешавад. Аз нав оғоз?" },
    yes: { ru: "Да, заново", en: "Yes, restart", tg: "Бале" }, no: { ru: "Отмена", en: "Cancel", tg: "Бекор" }, close: { ru: "Закрыть", en: "Close", tg: "Пӯшидан" },
    pick: { ru: "Выбери сол", en: "Choose a sol", tg: "Солро интихоб кун" }, sol: { ru: "Сол", en: "Sol", tg: "Сол" },
    btn: { ru: "Выбрать сол", en: "Choose sol", tg: "Интихоби сол" }, done: { ru: "Готово: пропущено солов", en: "Done: sols skipped", tg: "Анҷом: солҳои гузашта" }
  };
  function jt(k) { return JT[k][lg()] || JT[k].en; }
  function autoDay() {
    var c = B.camp(), E = window.DuneEcon; if (c.phase === "end" || c.phase === "new") return false;
    if (c.phase === "sum") { computeSum(c); return settleAuto(); }
    if (c.phase === "map" || c.phase === "pick") {
      var ev = B.EVENTS[c.day]; c.snap = B.res(); c.sdone = {}; c.sum = null; c.ev = 0;
      if (ev) { B.addRes(B.eventVec(c.day)); c.ev = 1; }
    }
    c.snap = c.snap || B.res(); var snap0 = c.snap.slice();
    var tries = [0, 1];
    for (var t = 0; t < tries.length; t++) {
      c = B.camp(); if (t) { B.setRes(snap0); c.sum = null; if (c.lives < 3 && t) { /* keep lives as before the failed try */ } }
      c.picked = [B.SECT[c.day % 4], B.SECT[(c.day + 1) % 4]]; c.sdone = {};
      var res = B.res();
      c.picked.forEach(function (r, i) {
        var key = (B.SECT.indexOf(r) + 1) + "A", rows = B.ECO[key] || B.ECO["1A"], q = E.quickIdx(rows), idx = 0;
        var ctx = { day: c.day, res: res, tired: E.tired(c.run, E.ROOM[B.SECT.indexOf(r) + 1]), neglect: E.neglect(c.vis, E.ROOM[B.SECT.indexOf(r) + 1], c.day) };
        var v = E.scale(rows[idx], ctx), win = t ? true : ((c.day * 7 + i * 3) % 5) < 3;
        c.sdone[r] = { w: win ? 1 : 0, q: idx === q && win ? 1 : 0, d: win ? v : B.failVec(v) };
        if (win) B.addRes(c.sdone[r].d); else B.addRes(c.sdone[r].d);
        if (r === "lab") c.lab++;
      });
      c.phase = "sum"; B.campSave(c); c = computeSum(B.camp());
      if (c.sum.f > 0) break;
      c.lives = Math.min(3, c.lives + (c.sum.over ? 0 : 1)); B.campSave(c);
    }
    c = B.camp();
    if (c.sum && c.sum.f === 0) { c.sum.f = 1; c.sum.over = 0; c.sum.h = Math.max(c.sum.h, 50); c.lives = Math.max(1, c.lives); B.campSave(c); }
    return settleAuto();
  }
  function settleAuto() {
    var c = B.camp(), s = c.sum; if (!s) return false;
    c.faces[c.day] = s.f; c.pts += s.h; c.wear = s.wearAfter || 0;
    B.SECT.forEach(function (r) { if (c.picked.indexOf(r) >= 0) { c.vis[r] = c.day; c.run[r] = (c.run[r] || 0) + 1; } else c.run[r] = 0; });
    c.replay = 0; c.picked = []; c.sdone = {}; c.sum = null; c.snap = null;
    if (c.day >= 15) c.phase = "end"; else { c.day++; c.phase = "map"; }
    B.campSave(c); return true;
  }
  function skipTo(n) { var guard = 0, k = 0; while (B.camp().day < n && B.camp().phase !== "end" && guard++ < 20) { if (!autoDay()) break; k++; } return k; }
  function jumpTo(n) {
    var c = B.camp();
    if (n > c.day && c.phase !== "end") { skipTo(n); c = B.camp(); if (c.day === n && c.phase !== "map") { c.phase = "map"; c.picked = []; c.sdone = {}; c.sum = null; c.snap = null; B.campSave(c); } return; }
    if (n === 1) { B.restart(); c = B.camp(); }
    c.day = n; c.phase = "map"; c.picked = []; c.sdone = {}; c.sum = null; c.snap = null; c.ev = 0; c.replay = 0; c.lives = 3; c.seen = c.seen || {};
    if (n === 1) c.seen = {};
    B.campSave(c); B.setRes([70, 70, 70]);
  }
  function juryPanel() {
    var ov = h("div", "jury"), c = B.camp();
    var box = h("div", "jury-box"); ov.appendChild(box);
    box.appendChild(h("h3", "", jt("pick")));
    var g = h("div", "jury-g");
    for (var n = 1; n <= 15; n++) (function (n) {
      var b = h("button", "jn" + (n === c.day ? " cur" : ""), String(n)); b.type = "button"; b.setAttribute("aria-label", jt("sol") + " " + n);
      b.onclick = function () { B.click(); ov.remove(); jumpTo(n); render(); }; g.appendChild(b);
    })(n);
    box.appendChild(g);
    box.appendChild(btn(jt("close"), "alt", function () { ov.remove(); }));
    ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
    document.body.appendChild(ov);
  }

  var GT = { ru: "СИНХРОНИЗАЦИЯ // ПЕРЕХОД НА БАЗУ", en: "SYNC // ENTERING THE BASE", tg: "СИНХРОНИЗАТСИЯ // ГУЗАР БА БАЗА" };
  function lg() { var l = (window.DuneI18n && DuneI18n.get()) || "ru"; return l === "tj" ? "tg" : l; }
  function warp(fn) {
    var w = document.getElementById("warp");
    if (!w.querySelector(".gl")) { for (var i = 0; i < 7; i++) { var g = h("b", "gl"); g.style.setProperty("--i", i); w.appendChild(g); } w.appendChild(h("u", "gl-scan")); }
    w.classList.add("go", "glitch"); app.classList.add("glt");
    try { sessionStorage.setItem("mm-glitch-in", "1"); } catch (e) {}
    setTimeout(function () { fn(); setTimeout(function () { w.classList.remove("go", "glitch"); app.classList.remove("glt"); }, 600); }, 1100);
  }

  function enterDay() {
    var c = B.camp();
    if (c.phase === "play") { warp(function () { B.go("hub"); }); return; }
    if (c.phase === "sum") { render(); return; }
    if (c.phase === "pick") { render(); return; }
    var ev = B.EVENTS[c.day]; c.snap = B.res(); c.picked = []; c.sdone = {}; c.sum = null; c.ev = 0;
    if (ev) { B.addRes(B.eventVec(c.day)); c.ev = 1; }
    c.phase = "pick"; var rep = c.replay; B.campSave(c);
    queue = [];
    if (!rep && [3, 6, 9, 12].indexOf(c.day) >= 0) queue.push("film");
    if (ev) queue.push("event");
    sel = []; next();
  }
  function next() {
    var q = queue.shift(), c = B.camp();
    if (!q) { stage = null; render(); return; }
    stage = q;
    if (q === "film") film("d" + c.day, function (skipped) { if (skipped) { var cc = B.camp(); cc.skipped[c.day] = 1; B.campSave(cc); } next(); });
    else eventView();
  }
  function eventView() {
    clear(); var c = B.camp(), ev = B.EVENTS[c.day], T = D.EVT[ev.k], card = h("div", "card mm-rise");
    card.appendChild(h("div", "big", T.i)); card.appendChild(h("h2", "", T.n)); card.appendChild(h("p", "", T.t));
    var dr = h("div", "drops");
    B.eventVec(c.day).forEach(function (v, i) { if (v) dr.appendChild(h("span", "drop" + (v > 0 ? " up" : ""), (v > 0 ? "+" : "") + v + " " + D.RES[i].i)); });
    card.appendChild(dr);
    card.appendChild(h("p", "muted", "Ресурсы уже уменьшились. В этот сол нужно их восстановить."));
    var row = h("div", "row"); row.appendChild(btn("Дальше ▶", "", next)); card.appendChild(row);
    app.appendChild(card);
    D.fact({ storm: "storm", flare: "flare", blackout: "conj", cold: "cold" }[ev.k]);
  }

  function resBars(c) {
    var r = B.res(), e = c.day < 9 ? D.earth(c.day) : null, w = h("div", "res3");
    D.RES.forEach(function (x, i) {
      var b = h("div", "rb" + (e && e.i === i ? " low" : "")); b.appendChild(h("span", "", x.i)); b.appendChild(h("b", "", String(r[i])));
      var bar = h("div", "bar"), f = h("i"); f.style.width = r[i] + "%"; bar.appendChild(f); b.appendChild(bar);
      if (e && e.i === i) b.appendChild(h("span", "arr", "▼"));
      w.appendChild(b);
    });
    return w;
  }
  function sectorNote(c, r) {
    var E = window.DuneEcon;
    if (E.tired(c.run, r)) return "😓 Усталость: награда −15%";
    if (E.neglect(c.vis, r, c.day) >= 3) return "⚠️ Давно без ухода: потери больше";
    return "";
  }
  function forecast(c) {
    var E = window.DuneEcon, r = B.res(), cl = E.close(c.day, r, c.wear, false, 0), why = E.reasons(r), box = h("div", "fcast mm-note " + (why.length || c.wear > 1 ? "is-warn" : ""));
    var t = cl.total.map(function (x, i) { return x ? x + D.RES[i].i : ""; }).filter(Boolean).join("  ");
    var l1 = h("div", ""); l1.appendChild(h("b", "", "Расход до конца сола:")); l1.appendChild(h("em", "", " " + t)); box.appendChild(l1);
    if (c.wear > 0) { var l2 = h("span", ""); l2.appendChild(h("i", "", "Износ оборудования:")); l2.appendChild(document.createTextNode(" −" + (-cl.wear[1]) + "⚡")); box.appendChild(l2); }
    E.reasons(r).forEach(function (k) { box.appendChild(h("span", "", WHY[k])); });
    return box;
  }
  function pickView() {
    clear(); var c = B.camp(), card = h("div", "card");
    card.appendChild(h("h2", "", "Сол " + c.day + ": выбери 2 сектора"));
    card.appendChild(h("p", "muted", "Остальные закроются на этот сол."));
    var e = c.day < 9 ? D.earth(c.day) : null;
    card.appendChild(resBars(c));
    card.appendChild(forecast(c));
    if (e) { var m = h("div", "sci", ""); m.style.background = "linear-gradient(180deg,#e0f2fe,#bae6fd)"; m.appendChild(h("span", "", "📡")); var t = h("span"); t.appendChild(h("b", "", "Сообщение с Земли")); t.appendChild(document.createElement("br")); t.appendChild(h("span", "", e.text)); m.appendChild(t); card.appendChild(m); }
    var g = h("div", "secs"), go = null;
    B.SECT.forEach(function (r) {
      var s = h("button", "sec" + (e && e.sectors.indexOf(r) >= 0 ? " rec" : "")); s.type = "button";
      s.appendChild(h("span", "e", D.ICON[r])); s.appendChild(h("b", "", D.NAMES[r])); s.appendChild(h("small", "", "Даёт: " + D.GIVES[r]));
      var nt = sectorNote(c, r); if (nt) s.appendChild(h("small", "warnnote", nt));
      s.onclick = function () {
        B.click(); var i = sel.indexOf(r);
        if (i >= 0) sel.splice(i, 1); else if (sel.length < 2) sel.push(r); else { sel.shift(); sel.push(r); }
        g.querySelectorAll(".sec").forEach(function (x, j) { x.classList.toggle("on", sel.indexOf(B.SECT[j]) >= 0); });
        go.disabled = sel.length !== 2;
      };
      if (sel.indexOf(r) >= 0) s.classList.add("on");
      g.appendChild(s);
    });
    card.appendChild(g);
    var row = h("div", "row"); go = btn("К работе 🚀", "", function () {
      if (sel.length !== 2) return; var cc = B.camp(); cc.picked = sel.slice(); cc.phase = "play"; B.campSave(cc); warp(function () { B.go("hub"); });
    }); go.disabled = sel.length !== 2; row.appendChild(go); card.appendChild(row);
    app.appendChild(card);
    D.tip("pick");
  }

  function faceSVG(k) {
    var mouth = ["M42 82q18-14 36 0", "M44 80h32", "M42 76q18 16 36 0"][k], col = ["#fca5a5", "#fde68a", "#bbf7d0"][k];
    return '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#e2e8f0" stroke="#1e293b" stroke-width="4"/><circle cx="60" cy="62" r="42" fill="' + col + '" stroke="#1e293b" stroke-width="4"/>'
      + '<circle cx="46" cy="54" r="5" fill="#1e293b"/><circle cx="74" cy="54" r="5" fill="#1e293b"/>' + (k === 0 ? '<path d="M38 44l16 5M82 44l-16 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>' : "")
      + '<path d="' + mouth + '" fill="none" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/><path d="M26 36q8-16 30-18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/></svg>';
  }
  function computeSum(c) {
    if (c.sum) return c;
    var E = window.DuneEcon, lines = [], ev = B.EVENTS[c.day], wins = 0, add = 0;
    if (ev) lines.push({ k: "ev", d: B.eventVec(c.day) });
    c.picked.forEach(function (r) {
      var s = c.sdone[r] || {}; lines.push({ k: r, d: s.d || [0, 0, 0], w: s.w });
      if (s.w) { wins++; if (s.q) add += E.P.wearQuick; } else add += E.P.wearFail;
    });
    var before = B.res(), cl = E.close(c.day, before, c.wear, wins === 2, add);
    lines.push({ k: "up", d: cl.up });
    if (cl.dep.some(Boolean)) lines.push({ k: "dep", d: cl.dep });
    if (cl.wear.some(Boolean)) lines.push({ k: "wear", d: cl.wear });
    B.addRes(cl.total);
    var end = B.res(), hh = B.happy(end), f = B.face(hh);
    c.sum = { h: hh, f: f, end: end, lines: lines, over: 0, wearAfter: cl.wearAfter, why: E.reasons(before) };
    if (f === 0) { c.lives = Math.max(0, c.lives - 1); if (c.lives === 0) c.sum.over = 1; }
    return B.campSave(c);
  }
  var WHY = { lowE: "⚡ Энергии мало: система жизнеобеспечения тратит больше ❤️.", lowS: "🛡️ Щит слабый: пыль съедает ⚡ и ❤️.", hoard: "📦 Запас выше 90 портится и утекает." };
  function sumView() {
    clear(); var c = computeSum(B.camp()), s = c.sum, card = h("div", "card");
    var cr = h("div", "crew"); cr.innerHTML = fh(s.f, 150); card.appendChild(cr);
    card.appendChild(h("div", "pct " + (s.f === 0 ? "bad" : s.f === 2 ? "ok" : ""), s.h + "%"));
    card.appendChild(h("h2", "", ["Экипаж расстроен", "Экипаж равнодушен", "Экипаж доволен!"][s.f]));
    card.appendChild(h("p", "muted", "Счастье экипажа"));
    s.lines.forEach(function (l) {
      var row = h("div", "sline"), nm = l.k === "ev" ? D.EVT[B.EVENTS[c.day].k].n : l.k === "up" ? "Расход базы за сол" : l.k === "dep" ? "Цепные последствия" : l.k === "wear" ? "Износ оборудования" : D.NAMES[l.k];
      var lab = h("span", B.SECT.indexOf(l.k) >= 0 && !l.w ? "bad" : "", ""); lab.appendChild(h("span", "", nm)); if (B.SECT.indexOf(l.k) >= 0) lab.appendChild(document.createTextNode(l.w ? " ✓" : " ✗"));
      row.appendChild(lab);
      var v = h("span", "", l.d.map(function (x, i) { return x ? (x > 0 ? "+" : "") + x + D.RES[i].i : ""; }).filter(Boolean).join("  ") || "—"); row.appendChild(v); card.appendChild(row);
    });
    card.appendChild(h("div", "sline", "")).textContent = "";
    var tot = card.lastChild; tot.appendChild(h("b", "", "Сейчас")); tot.appendChild(h("b", "", s.end.map(function (x, i) { return x + D.RES[i].i; }).join("  ")));
    (s.why || []).forEach(function (k) { card.appendChild(h("p", "muted why", WHY[k])); });
    var row = h("div", "row");
    if (s.f === 0) {
      card.appendChild(h("p", "bad", s.over ? "Жизни закончились. Миссия начинается заново с сола 1." : "Меньше 50%: день провален. Минус одна жизнь ❤️, день нужно переиграть."));
      row.appendChild(btn(s.over ? "Начать заново ↺" : "Переиграть день ↺", "warn", function () { settle(); }));
    } else {
      card.appendChild(h("p", "ok", s.f === 2 ? "Отличный сол! Идём дальше." : "Сол пройден. Можно и лучше!"));
      row.appendChild(btn(c.day >= 15 ? "К финалу 🏁" : "К карте дней ▶", "", function () { settle(); }));
    }
    card.appendChild(row); app.appendChild(card);
    D.tip("sum");
  }
  function settle() {
    var c = B.camp(), s = c.sum; if (!s) return;
    if (s.f === 0) {
      if (s.over) { B.restart(); var n = B.camp(); n.phase = "map"; n.day = 1; n.lives = 3; B.campSave(n); }
      else { B.setRes(c.snap || B.res()); c.replay = 1; c.phase = "map"; c.picked = []; c.sdone = {}; c.sum = null; c.snap = null; B.campSave(c); }
    } else {
      c.faces[c.day] = s.f; c.pts += s.h; c.wear = s.wearAfter || 0; B.SECT.forEach(function (r) { if (c.picked.indexOf(r) >= 0) { c.vis[r] = c.day; c.run[r] = (c.run[r] || 0) + 1; } else c.run[r] = 0; }); c.replay = 0; c.picked = []; c.sdone = {}; c.sum = null; c.snap = null;
      if (c.day >= 15) c.phase = "end"; else { c.day++; c.phase = "map"; }
      B.campSave(c);
    }
    sel = []; render();
  }

  function endView() {
    clear(); var c = B.camp(), card = h("div", "card"), happy = 0, k;
    for (k in c.faces) if (c.faces[k] === 2) happy++;
    var pts = c.pts + c.sci * 30 + happy * 10;
    card.appendChild(h("div", "big", "🚀")); card.appendChild(h("h2", "", "Миссия выполнена!"));
    card.appendChild(h("p", "", "Герои возвращаются домой. База MISSION MARS продержалась 15 солов."));
    var f = h("div", "drops"); for (k = 1; k <= 15; k++) { var fs = h("span", ""); fs.innerHTML = fh(c.faces[k] != null ? c.faces[k] : 1, 34); f.appendChild(fs); } card.appendChild(f);
    card.appendChild(h("div", "sline", "")).textContent = ""; var l1 = card.lastChild; l1.appendChild(h("span", "", "Очки")); l1.appendChild(h("b", "", String(pts)));
    card.appendChild(h("div", "sline", "")).textContent = ""; var l2 = card.lastChild; l2.appendChild(h("span", "", "Научные открытия")); l2.appendChild(h("b", "", c.sci + " / 5"));
    var sk = Object.keys(c.skipped).length;
    card.appendChild(h("p", "muted", sk ? "Ты пропустил(а) часть фильмов: награда за них не будет выдана." : "Награда за фильмы появится позже."));
    var row = h("div", "row");
    row.appendChild(btn("Таблица рекордов 🏆", "gold", function () { say({ mmDune: "records" }); }));
    row.appendChild(btn("Сыграть заново ↺", "alt", function () { B.restart(); var n = B.camp(); n.phase = "map"; n.day = 1; n.lives = 3; B.campSave(n); render(); }));
    card.appendChild(row); app.appendChild(card);
    if (!c.fin) { c.fin = 1; B.campSave(c); say({ mmDune: "finale", pts: pts, stars: happy, lives: c.lives }); }
    if (!c.cong) { c.cong = 1; B.campSave(c); setTimeout(function () { congrats(pts, c.sci); }, 350); }
  }

  function render() {
    var c = B.camp();
    if (stage === "film" || stage === "event") return;
    if (c.phase === "new") { queue = []; stage = "film"; film("intro", function () { stage = null; nameView(); }); return; }
    if (c.phase === "end") { if (!c.finFilm) { c.finFilm = 1; B.campSave(c); stage = "film"; queue = []; film("d15", function (skipped) { if (skipped) { var cc = B.camp(); cc.skipped[15] = 1; B.campSave(cc); } stage = null; endView(); }); return; } return endView(); }
    if (c.phase === "sum") return sumView();
    if (c.phase === "pick") return pickView();
    mapView();
  }
  window.addEventListener("resize", function () { if (!stage && B.camp().phase === "map") mapView(); });
  render();
})();
