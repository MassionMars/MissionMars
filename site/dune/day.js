/* Mission control: the part of the game that sits between the sols. All texts are Russian: dune-i18n.js translates them. */
(function () {
  "use strict";
  var B = window.DuneBridge, D = window.MMDay, app = document.getElementById("app");
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

  /* film slots: put a real video file into src to replace the placeholder (window.MM_FILMS can be set by the page) */
  var FILMS = window.MM_FILMS || {
    intro: { t: "Первый контакт", s: "Мохинур и Хуршед прилетают на Марс и открывают базу Dune Alpha.", src: "" },
    d3: { t: "Стена пыли", s: "Над базой поднимается пылевая буря. Мохинур и Хуршед готовят панели.", src: "" },
    d6: { t: "Вспышка", s: "Датчики Хуршеда фиксируют мощную вспышку на Солнце.", src: "" },
    d9: { t: "Тишина в эфире", s: "Мохинур зовёт Землю, но эфир молчит: Марс ушёл за Солнце.", src: "" },
    d12: { t: "Самая холодная ночь", s: "Температура падает, а изоляция давит на всех.", src: "" },
    d15: { t: "Возвращение героев", s: "Корабль ждёт. Экипаж возвращается домой.", src: "" }
  };
  function film(key, done0, skippable) {
    var done = function (sk) { if (!sk) say({ mmDune: "award", k: "film", v: key }); done0(sk); };
    clear();
    var f = FILMS[key] || FILMS.intro, box = h("div", "film");
    if (f.src) {
      var v = document.createElement("video"); v.src = f.src; v.controls = true; v.autoplay = true; v.playsInline = true;
      v.onended = function () { done(false); }; box.appendChild(v);
    } else {
      box.appendChild(h("span", "tag", "🎬 Мини-фильм"));
      box.appendChild(h("h2", "", f.t));
      var cast = h("div", "cast");
      [["🧑‍🚀", "Мохинур"], ["👨‍🚀", "Хуршед"]].forEach(function (c) { var w = h("div", "who"); w.appendChild(h("div", "av", c[0])); w.appendChild(h("span", "", c[1])); cast.appendChild(w); });
      box.appendChild(cast);
      box.appendChild(h("p", "", f.s));
      var go = btn("▶ Смотреть", "gold", function () { box.classList.add("play"); go.disabled = true; setTimeout(function () { done(false); }, 5000); });
      box.appendChild(go); box.appendChild(h("div", "bar"));
    }
    var sk = h("div", "skip"); sk.appendChild(btn("Пропустить ⏭", "alt", function () { done(true); })); box.appendChild(sk);
    var wrap = h("div", "top"); app.appendChild(wrap); app.appendChild(box);
  }

  function nameView() {
    clear();
    var c = h("div", "card name");
    c.appendChild(h("div", "ico", "🧑‍🚀"));
    c.appendChild(h("h2", "", "Как тебя зовут, астронавт?"));
    c.appendChild(h("p", "muted", "Имя попадёт в таблицу рекордов. До 14 символов."));
    var inp = h("input", "inp"); inp.type = "text"; inp.maxLength = 14; inp.value = nick(); inp.placeholder = "Astro"; inp.autocomplete = "off"; inp.spellcheck = false;
    function go() {
      var n = cleanNick(inp.value) || "Astro"; var m = host(); if (m && m.setNick) m.setNick(n); say({ mmDune: "nick", nick: n });
      var cc = B.camp(); cc.phase = "map"; cc.day = 1; cc.lives = 3; B.campSave(cc); render();
    }
    inp.onkeydown = function (e) { if (e.key === "Enter") go(); };
    c.appendChild(inp); c.appendChild(btn("Начать миссию 🚀", "", go));
    app.appendChild(c); setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 80);
  }

  /* ----- the map of 15 sols ----- */
  var FACE = ["😞", "😐", "😀"];
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
    p.setAttribute("fill", "none"); p.setAttribute("stroke", "rgba(255,226,190,.55)"); p.setAttribute("stroke-width", "6"); p.setAttribute("stroke-dasharray", "1 14"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("vector-effect", "non-scaling-stroke");
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
      if (st === "done") { b.appendChild(h("span", "fc", FACE[c.faces[n] != null ? c.faces[n] : 1])); }
      else { b.appendChild(document.createTextNode(String(n))); if (st === "lock") b.appendChild(h("span", "lk", "🔒")); }
      if (st === "done") b.appendChild(h("span", "nn", String(n)));
      if (sp && st !== "done") b.appendChild(h("span", "gift", "🎁"));
      if (st === "cur") b.onclick = function () { B.click(); enterDay(); }; else b.tabIndex = -1;
      w.appendChild(b);
    }
    app.appendChild(w);
    var info = h("div", "dinfo"), lbl = c.phase === "play" ? "Вернуться на базу" : c.phase === "pick" ? "Выбрать сектора" : "Начать сол " + c.day;
    info.appendChild(btn(lbl + " ▶", "gold", enterDay));
    if (B.SPECIAL.indexOf(c.day) >= 0) info.appendChild(h("span", "pill", "🎁 Особый день"));
    if (c.replay) info.appendChild(h("span", "pill", "↺ Нужно переиграть этот день"));
    app.appendChild(info);
    D.tip("map", "👆", "Нажми на горящий день, чтобы начать. Закрытые дни откроются позже.");
    if (c.day === 1) D.fact("sol");
  }

  function warp(fn) { var w = document.getElementById("warp"); w.classList.add("go"); setTimeout(function () { fn(); setTimeout(function () { w.classList.remove("go"); }, 400); }, 900); }

  /* start of a sol: the film, the event, then the choice of two sectors */
  function enterDay() {
    var c = B.camp();
    if (c.phase === "play") { warp(function () { B.go("hub"); }); return; }
    if (c.phase === "sum") { render(); return; }
    if (c.phase === "pick") { render(); return; }
    var ev = B.EVENTS[c.day]; c.snap = B.res(); c.picked = []; c.sdone = {}; c.sum = null; c.ev = 0;
    if (ev) { B.addRes(ev.d); c.ev = 1; }
    c.phase = "pick"; var rep = c.replay; B.campSave(c);
    queue = [];
    if (!rep && [3, 6, 9, 12, 15].indexOf(c.day) >= 0) queue.push("film");
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
    clear(); var c = B.camp(), ev = B.EVENTS[c.day], T = D.EVT[ev.k], card = h("div", "card");
    card.appendChild(h("div", "big", T.i)); card.appendChild(h("h2", "", T.n)); card.appendChild(h("p", "", T.t));
    var dr = h("div", "drops");
    ev.d.forEach(function (v, i) { if (v) dr.appendChild(h("span", "drop" + (v > 0 ? " up" : ""), (v > 0 ? "+" : "") + v + " " + D.RES[i].i)); });
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
  function pickView() {
    clear(); var c = B.camp(), card = h("div", "card");
    card.appendChild(h("h2", "", "Сол " + c.day + ": выбери 2 сектора"));
    card.appendChild(h("p", "muted", "Остальные закроются на этот сол."));
    var e = c.day < 9 ? D.earth(c.day) : null;
    card.appendChild(resBars(c));
    if (e) { var m = h("div", "sci", ""); m.style.background = "linear-gradient(180deg,#e0f2fe,#bae6fd)"; m.appendChild(h("span", "", "📡")); var t = h("span"); t.appendChild(h("b", "", "Сообщение с Земли")); t.appendChild(document.createElement("br")); t.appendChild(h("span", "", e.text)); m.appendChild(t); card.appendChild(m); }
    var g = h("div", "secs"), go = null;
    B.SECT.forEach(function (r) {
      var s = h("button", "sec" + (e && e.sectors.indexOf(r) >= 0 ? " rec" : "")); s.type = "button";
      s.appendChild(h("span", "e", D.ICON[r])); s.appendChild(h("b", "", D.NAMES[r])); s.appendChild(h("small", "", "Даёт: " + D.GIVES[r]));
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
    D.tip("pick", "👆", "Выбери 2 сектора из 4. Смотри, какого ресурса мало.");
  }

  /* end of a sol */
  function faceSVG(k) {
    var mouth = ["M42 82q18-14 36 0", "M44 80h32", "M42 76q18 16 36 0"][k], col = ["#fca5a5", "#fde68a", "#bbf7d0"][k];
    return '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#e2e8f0" stroke="#1e293b" stroke-width="4"/><circle cx="60" cy="62" r="42" fill="' + col + '" stroke="#1e293b" stroke-width="4"/>'
      + '<circle cx="46" cy="54" r="5" fill="#1e293b"/><circle cx="74" cy="54" r="5" fill="#1e293b"/>' + (k === 0 ? '<path d="M38 44l16 5M82 44l-16 5" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>' : "")
      + '<path d="' + mouth + '" fill="none" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/><path d="M26 36q8-16 30-18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/></svg>';
  }
  function computeSum(c) {
    if (c.sum) return c;
    var lines = [], ev = B.EVENTS[c.day];
    if (ev) lines.push({ k: "ev", d: ev.d });
    c.picked.forEach(function (r) { lines.push({ k: r, d: (c.sdone[r] || {}).d || [0, 0, 0], w: (c.sdone[r] || {}).w }); });
    var up = B.UPKEEP; B.addRes(up); lines.push({ k: "up", d: up });
    var end = B.res(), hh = B.happy(end), f = B.face(hh);
    c.sum = { h: hh, f: f, end: end, lines: lines, over: 0 };
    if (f === 0) { c.lives = Math.max(0, c.lives - 1); if (c.lives === 0) c.sum.over = 1; }
    return B.campSave(c);
  }
  function sumView() {
    clear(); var c = computeSum(B.camp()), s = c.sum, card = h("div", "card");
    var cr = h("div", "crew"); cr.innerHTML = faceSVG(s.f); card.appendChild(cr);
    card.appendChild(h("div", "pct " + (s.f === 0 ? "bad" : s.f === 2 ? "ok" : ""), s.h + "%"));
    card.appendChild(h("h2", "", ["Экипаж расстроен", "Экипаж равнодушен", "Экипаж доволен!"][s.f]));
    card.appendChild(h("p", "muted", "Счастье экипажа"));
    s.lines.forEach(function (l) {
      var row = h("div", "sline"), nm = l.k === "ev" ? D.EVT[B.EVENTS[c.day].k].n : l.k === "up" ? "Расход за сол" : D.NAMES[l.k];
      var lab = h("span", l.k !== "ev" && l.k !== "up" && !l.w ? "bad" : "", ""); lab.appendChild(h("span", "", nm)); if (l.k !== "ev" && l.k !== "up") lab.appendChild(document.createTextNode(l.w ? " ✓" : " ✗"));
      row.appendChild(lab);
      var v = h("span", "", l.d.map(function (x, i) { return x ? (x > 0 ? "+" : "") + x + D.RES[i].i : ""; }).filter(Boolean).join("  ") || "—"); row.appendChild(v); card.appendChild(row);
    });
    card.appendChild(h("div", "sline", "")).textContent = "";
    var tot = card.lastChild; tot.appendChild(h("b", "", "Сейчас")); tot.appendChild(h("b", "", s.end.map(function (x, i) { return x + D.RES[i].i; }).join("  ")));
    var row = h("div", "row");
    if (s.f === 0) {
      card.appendChild(h("p", "bad", s.over ? "Жизни закончились. Миссия начинается заново с сола 1." : "Меньше 50%: день провален. Минус одна жизнь ❤️, день нужно переиграть."));
      row.appendChild(btn(s.over ? "Начать заново ↺" : "Переиграть день ↺", "warn", function () { settle(); }));
    } else {
      card.appendChild(h("p", "ok", s.f === 2 ? "Отличный сол! Идём дальше." : "Сол пройден. Можно и лучше!"));
      row.appendChild(btn(c.day >= 15 ? "К финалу 🏁" : "К карте дней ▶", "", function () { settle(); }));
    }
    card.appendChild(row); app.appendChild(card);
    D.tip("sum", "😀", "Счастье 70% и выше — экипаж доволен. Ниже 50% — день придётся переиграть.");
  }
  function settle() {
    var c = B.camp(), s = c.sum; if (!s) return;
    if (s.f === 0) {
      if (s.over) { B.restart(); var n = B.camp(); n.phase = "map"; n.day = 1; n.lives = 3; B.campSave(n); }
      else { B.setRes(c.snap || B.res()); c.replay = 1; c.phase = "map"; c.picked = []; c.sdone = {}; c.sum = null; c.snap = null; B.campSave(c); }
    } else {
      c.faces[c.day] = s.f; c.pts += s.h; c.replay = 0; c.picked = []; c.sdone = {}; c.sum = null; c.snap = null;
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
    card.appendChild(h("p", "", "Герои возвращаются домой. База Dune Alpha продержалась 15 солов."));
    var f = h("div", "drops"); for (k = 1; k <= 15; k++) f.appendChild(h("span", "", FACE[c.faces[k] != null ? c.faces[k] : 1])); card.appendChild(f);
    card.appendChild(h("div", "sline", "")).textContent = ""; var l1 = card.lastChild; l1.appendChild(h("span", "", "Очки")); l1.appendChild(h("b", "", String(pts)));
    card.appendChild(h("div", "sline", "")).textContent = ""; var l2 = card.lastChild; l2.appendChild(h("span", "", "Научные открытия")); l2.appendChild(h("b", "", c.sci + " / 5"));
    var sk = Object.keys(c.skipped).length;
    card.appendChild(h("p", "muted", sk ? "Ты пропустил(а) часть фильмов: награда за них не будет выдана." : "Награда за фильмы появится позже."));
    var row = h("div", "row");
    row.appendChild(btn("Таблица рекордов 🏆", "gold", function () { say({ mmDune: "records" }); }));
    row.appendChild(btn("Сыграть заново ↺", "alt", function () { B.restart(); var n = B.camp(); n.phase = "map"; n.day = 1; n.lives = 3; B.campSave(n); render(); }));
    card.appendChild(row); app.appendChild(card);
    if (!c.fin) { c.fin = 1; B.campSave(c); say({ mmDune: "finale", pts: pts, stars: happy, lives: c.lives }); }
  }

  function render() {
    var c = B.camp();
    if (stage === "film" || stage === "event") return;
    if (c.phase === "new") { queue = []; stage = "film"; film("intro", function () { stage = null; nameView(); }); return; }
    if (c.phase === "end") return endView();
    if (c.phase === "sum") return sumView();
    if (c.phase === "pick") return pickView();
    mapView();
  }
  window.addEventListener("resize", function () { if (!stage && B.camp().phase === "map") mapView(); });
  render();
})();
