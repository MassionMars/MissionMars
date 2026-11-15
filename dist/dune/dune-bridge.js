(function () {
  "use strict";
  var KEY = "mm-dune", DEF = { life: 70, energy: 80, shield: 75, science: 10, hearts: 3 };
  var ROOMS = { greenhouse: ["1A", "1B"], medbay: ["2A", "2B"], lab: ["3A", "3B"], airlock: ["4A", "4B"] };
  var NAMES = { greenhouse: "Теплица", medbay: "Медпункт", lab: "Лаборатория", airlock: "Шлюз" };
  var ALL = [].concat(ROOMS.greenhouse, ROOMS.medbay, ROOMS.lab, ROOMS.airlock);

  function arc() { try { var p = window.parent; return p && p !== window && p.__mmArc ? p.__mmArc : null; } catch (e) { return null; } }
  function mem() {
    try { var p = window.parent; if (p && p !== window) { p.__mmDune = p.__mmDune || {}; return p.__mmDune; } } catch (e) {}
    return window.__mmDune || (window.__mmDune = {});
  }
  function read() {
    var s = null, A = arc();
    if (A) { if (!A.s) A.s = {}; return A.s; }
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (!s || typeof s !== "object") s = mem().s || null;
    return s && typeof s === "object" ? s : {};
  }
  function write(s) {
    var A = arc();
    if (A) { s.life = DEF.life; s.energy = DEF.energy; s.shield = DEF.shield; s.hearts = 3; A.s = s; return; }
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    mem().s = s;
  }
  function num(v, d, lo, hi) { v = Number(v); return isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : d; }

  function post(msg) { if (arc() && msg && msg.mmDune !== "go") return; try { if (window.parent && window.parent !== window) window.parent.postMessage(msg, "*"); } catch (e) {} }
  function pmx() { try { return window.parent && window.parent !== window ? window.parent.MMX : null; } catch (e) { return null; } }
  var SVGNS = "http://www.w3.org/2000/svg";

  var ICONS = {
    life: '<path class="ol" d="M16 28C4 19 3 10 9 7c4-2 7 1 7 3 0-2 3-5 7-3 6 3 5 12-7 21z" fill="url(#dg-heart)"/><path d="M9 11c1-2 3-2 4-1" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"/>',
    energy: '<path class="ol bolt" d="M19 2 7 18h7l-2 12 13-17h-7z" fill="url(#dg-bolt)"/><path d="M17 5 10 16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>',
    shield: '<clipPath id="dg-sc"><path d="M16 2 27 6v9c0 7-5 12-11 15C10 27 5 22 5 15V6z"/></clipPath><path class="ol" d="M16 2 27 6v9c0 7-5 12-11 15C10 27 5 22 5 15V6z" fill="url(#dg-shield)"/><g clip-path="url(#dg-sc)"><path class="shine" d="M6 0l6 0-8 34-6 0z" fill="#fff" opacity=".45"/></g><path d="M16 9v13M10.5 14.5h11" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>',
    science: '<path class="ol" d="M12 3h8v2h-1v7l8 14c1 2 0 4-2 4H7c-2 0-3-2-2-4l8-14V5h-1z" fill="#e0f2fe"/><path class="liq" d="M9 21h14l3.5 6c.7 1.3-.1 2.5-1.5 2.5H7c-1.400 0-2.200-1.200-1.500-2.500z" fill="url(#dg-sci)"/><circle class="bub" cx="14" cy="22" r="1.6" fill="#fff"/><circle class="bub" cx="19" cy="24" r="1.3" fill="#fff"/><circle class="bub" cx="16" cy="26" r="1.1" fill="#fff"/><path class="ol" d="M12 3h8" fill="none"/>'
  };
  var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'
    + '<linearGradient id="dg-heart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a9b"/><stop offset=".55" stop-color="#ef4444"/><stop offset="1" stop-color="#b91c1c"/></linearGradient>'
    + '<linearGradient id="dg-bolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff59d"/><stop offset=".5" stop-color="#facc15"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>'
    + '<linearGradient id="dg-shield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset=".6" stop-color="#3b82f6"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient>'
    + '<linearGradient id="dg-sci" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b4fe"/><stop offset="1" stop-color="#9333ea"/></linearGradient></defs></svg>';
  function icon(kind, cls) { return '<span class="mi mi-' + kind + (cls ? " " + cls : "") + '" aria-hidden="true"><svg viewBox="0 0 32 32">' + ICONS[kind] + '</svg></span>'; }
  var EMO = { "\u2764\uFE0F": "life", "\u26A1": "energy", "\uD83D\uDEE1\uFE0F": "shield", "\uD83E\uDDEC": "science" };

  var Bridge = {
    icon: function (k) { return icon(k); },
    load: function () {
      var s = read();
      return {
        life: num(s.life, DEF.life, 0, 100), energy: num(s.energy, DEF.energy, 0, 100), shield: num(s.shield, DEF.shield, 0, 100),
        science: num(s.science, DEF.science, 0, 99999), hearts: num(s.hearts, DEF.hearts, 0, 3)
      };
    },
    save: function (g) {
      var s = read();
      ["life", "energy", "shield", "science", "hearts"].forEach(function (k) { s[k] = num(g[k], DEF[k], 0, 99999); });
      write(s);
    },
    doneMap: function () {
      var d = read().done, o = {};
      if (d && typeof d === "object") ALL.forEach(function (k) { if (d[k]) o[k] = 1; });
      return o;
    },
    done: function (key) {
      if (ALL.indexOf(key) < 0) return;
      var s = read(); s.done = Bridge.doneMap(); s.done[key] = 1; write(s);
      post({ mmDune: "done", key: key });
    },

    mini: function (crisis, id, win, score, left) {
      post({ mmDune: "mini", crisis: String(crisis), id: Number(id) || 0, win: !!win, score: Number(score) || 0, left: Math.round((Number(left) || 0) * 10) / 10 });
    },
    sfx: function () { var m = pmx(); if (m && typeof m.isOn === "function") return m.isOn(); try { return localStorage.getItem("mm-sound") !== "0"; } catch (e) { return true; } },
    click: function () { var m = pmx(); if (m && m.play) try { m.play("click"); } catch (e) {} },
    count: function () { return Object.keys(Bridge.doneMap()).length; },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} mem().s = null; post({ mmDune: "reset" }); },
    go: function (room) {
      if (window.parent && window.parent !== window) window.parent.postMessage({ mmDune: "go", room: room }, "*");
      else location.href = room + ".html";
    },

    chip: function (where) {
      var el = document.createElement("div");
      el.id = "dune-progress";
      el.setAttribute("style", "position:fixed;z-index:60;" + where + "display:flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;color:#fff;font:800 13px MMSans,system-ui,sans-serif");
      function paint() {
        var c = Bridge.camp(), n = c.picked.filter(function (r) { return c.sdone[r]; }).length;
        el.textContent = "☀️ Сол " + c.day + " · сектора " + n + " / 2";
      }
      document.body.appendChild(el); paint();
      window.addEventListener("focus", paint);
    },

    fit: function () {
      var de = document.documentElement;
      de.classList.toggle("dune-sm", innerWidth < 760 || innerHeight < 640);
      de.classList.toggle("dune-xs", innerHeight < 450);
      var b = 0;
      document.querySelectorAll(".fixed.top-3").forEach(function (h) { b = Math.max(b, h.getBoundingClientRect().bottom); });
      var m = document.getElementById("minigame-mount-point");
      if (m && b) {
        m.style.paddingTop = Math.round(b + 8) + "px"; m.style.paddingBottom = "54px"; m.style.overflowY = "auto";
        m.style.alignItems = "center"; m.style.alignItems = "safe center";
      }
    },
    style: function () {
      var s = document.createElement("style");
      s.textContent = "html.dune-sm #base-hud,html.dune-sm .fixed.top-3{zoom:.74}html.dune-sm .dept-btn-inner{zoom:.72}html.dune-sm #dune-progress{zoom:.85}html.dune-xs #base-hud,html.dune-xs .fixed.top-3{zoom:.56}html.dune-xs .dept-btn-inner{zoom:.62}";
      document.head.appendChild(s);
      addEventListener("resize", Bridge.fit);
      document.addEventListener("dunelang", function () { setTimeout(Bridge.fit, 60); });
      if (window.ResizeObserver) { var ro = new ResizeObserver(function () { Bridge.fit(); }); document.querySelectorAll(".fixed.top-3").forEach(function (h) { ro.observe(h); }); }
      addEventListener("orientationchange", function () { setTimeout(Bridge.fit, 250); });
    },

    icons: function () {
      var d = document.createElement("div"); d.innerHTML = DEFS; document.body.appendChild(d.firstChild);
      document.querySelectorAll(".fixed.top-3 span, #base-hud span").forEach(function (sp) {
        if (sp.children.length) return;
        var k = EMO[sp.textContent.trim()]; if (!k) return;
        var w = document.createElement("span"); w.innerHTML = icon(k); sp.parentNode.replaceChild(w.firstChild, sp);
      });
      ["hud-hearts", "modal-hearts"].forEach(function (id) {
        var el = document.getElementById(id); if (!el) return;
        var busy = false;
        function paint() {
          if (busy) return; busy = true;
          var t = el.textContent, h = (t.match(/\u2764\uFE0F/g) || []).length, n = (t.match(/\uD83D\uDDA4/g) || []).length, o = "", i;
          if (el.querySelector(".mi")) { busy = false; return; }
          for (i = 0; i < h; i++) o += icon("life", "mi-heart");
          for (i = 0; i < n; i++) o += icon("life", "mi-heart dead");
          if (o) el.innerHTML = o; busy = false;
        }
        new MutationObserver(function () { paint(); }).observe(el, { childList: true, characterData: true, subtree: true });
        paint();
      });

      ["life", "energy", "shield", "science"].forEach(function (k) {
        var el = document.getElementById("hud-" + k); if (!el) return;
        new MutationObserver(function () { var b = el.parentNode; b.classList.remove("hud-pop"); void b.offsetWidth; b.classList.add("hud-pop"); }).observe(el, { childList: true, characterData: true, subtree: true });
      });
    },

    dust: function () {
      if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
      for (var i = 0; i < 9; i++) {
        var m = document.createElement("i"); m.className = "ds-dust";
        m.style.cssText = "left:" + (40 + Math.random() * 70) + "vw;top:" + (Math.random() * 90) + "vh;animation-duration:" + (18 + Math.random() * 24) + "s;animation-delay:-" + (Math.random() * 30) + "s;opacity:" + (0.3 + Math.random() * 0.5) + ";transform:scale(" + (0.6 + Math.random()) + ")";
        document.body.appendChild(m);
      }
    },

    walkers: function (svg, list) {
      if (!svg) return;
      var tint = svg.querySelector("#scene-evening-tint"), fpl = document.createElementNS(SVGNS, "g"), lay = document.createElementNS(SVGNS, "g");
      fpl.setAttribute("id", "hub-footprints"); lay.setAttribute("id", "hub-walkers");
      if (tint) { svg.insertBefore(fpl, tint); svg.insertBefore(lay, tint); } else { svg.appendChild(fpl); svg.appendChild(lay); }
      var W = list.map(function (c, i) {
        var g = document.createElementNS(SVGNS, "g"); g.setAttribute("class", "ds-walker");
        g.innerHTML = '<ellipse cx="0" cy="28" rx="15" ry="5.5" fill="#5e2210" opacity=".5"/><g class="astro-walk-cycle" style="animation-delay:-' + (i * .45) + 's">'
          + '<rect id="hw' + i + 'p" x="-12" y="-12" width="12" height="20" rx="3" fill="#cbd5e1" stroke="#231815" stroke-width="2.4"/>'
          + '<rect x="-7" y="8" width="6.5" height="19" rx="3" fill="#f1f5f9" stroke="#231815" stroke-width="2.4"/><rect x="1.5" y="8" width="6.5" height="19" rx="3" fill="#f1f5f9" stroke="#231815" stroke-width="2.4"/>'
          + '<rect x="-9" y="-14" width="18" height="24" rx="6" fill="#f8fafc" stroke="#231815" stroke-width="2.4"/><path d="M-7 -6q7 4 14 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>'
          + '<circle cx="0" cy="-23" r="10.5" fill="#f8fafc" stroke="#231815" stroke-width="2.4"/><ellipse class="vis" cx="4" cy="-23" rx="6" ry="5" fill="#38bdf8" stroke="#231815" stroke-width="1.7"/>'
          + '<circle cx="6" cy="-25" r="1.6" fill="#fff"/>'
          + '<rect x="7" y="-4" width="10" height="7" rx="2" fill="' + (c.tool || "#fde047") + '" stroke="#231815" stroke-width="1.7"/></g>';
        lay.appendChild(g);
        return { g: g, vis: g.querySelector(".vis"), x: c.x, y: c.y, min: c.min, max: c.max, dir: c.dir || 1, sp: c.speed || .8, n: i * 13 };
      });
      function print(x, y, k) {
        var e = document.createElementNS(SVGNS, "ellipse"), side = k % 2 ? -4 : 4;
        e.setAttribute("cx", x.toFixed(1)); e.setAttribute("cy", (y + side).toFixed(1)); e.setAttribute("rx", "7"); e.setAttribute("ry", "3");
        e.setAttribute("fill", "#6e2912"); e.setAttribute("stroke", "#231815"); e.setAttribute("stroke-width", "1.4"); e.setAttribute("class", "ds-fp");
        fpl.appendChild(e); setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 4600);
      }
      (function tick() {
        W.forEach(function (w) {
          w.x += w.dir * w.sp;
          if (w.x >= w.max) { w.x = w.max; w.dir = -1; } else if (w.x <= w.min) { w.x = w.min; w.dir = 1; }
          w.g.setAttribute("transform", "translate(" + w.x.toFixed(1) + "," + w.y + ")" + (w.dir < 0 ? " scale(1,1)" : ""));
          w.vis.setAttribute("cx", w.dir > 0 ? "4" : "-4");
          if (++w.n % 24 === 0) print(w.x - w.dir * 9, w.y + 28, w.n / 24);
        });
        requestAnimationFrame(tick);
      })();
    },
    decorateRoom: function () { Bridge.style(); Bridge.icons(); Bridge.dust(); Bridge.clicks(); Bridge.fit(); Bridge.chip("left:50%;bottom:10px;transform:translateX(-50%);"); setTimeout(Bridge.fit, 300); },
    clicks: function () {
      document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button"); if (b && !b.disabled) Bridge.click(); }, true);
    },
    decorateHub: function () {
      Bridge.style(); Bridge.icons(); Bridge.dust(); Bridge.clicks(); Bridge.fit();
      Bridge.walkers(document.getElementById("mars-base-svg"), [
        { x: 520, y: 1085, min: 470, max: 800, dir: 1, speed: .8, tool: "#fde047" },
        { x: 1100, y: 690, min: 1010, max: 1190, dir: -1, speed: .6, tool: "#67e8f9" }]);
      document.querySelectorAll(".dept-pin").forEach(function (pin) {
        var room = pin.getAttribute("data-dept"), st = Bridge.sector(room);
        pin.classList.toggle("pin-locked", st === "locked"); pin.classList.toggle("pin-done", st === "done");
        var inner = pin.querySelector(".dept-btn-inner");
        if (inner && st !== "open") {
          var s = document.createElement("span"); s.className = "pin-mark"; s.textContent = st === "done" ? "✅" : "🔒"; inner.appendChild(s);
        }
      });
      Bridge.chip("left:50%;bottom:10px;transform:translateX(-50%);");
    },
    finale: function () {
      var st = read(); if (st.fin) return; st.fin = 1; write(st);
      var m = document.createElement("div");
      m.setAttribute("style", "position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:rgba(35,24,21,.72);padding:16px");
      m.innerHTML = '<div style="max-width:440px;text-align:center;background:#fffdf9;border:4px solid #231815;border-radius:28px;box-shadow:0 8px 0 #231815;padding:24px 22px;color:#231815;font-family:MMSans,system-ui,sans-serif"><div style="font-size:54px">🏆</div><div style="font-size:24px;font-weight:900;margin:6px 0">База MISSION MARS спасена!</div><p style="font-weight:700;font-size:15px;line-height:1.45;margin:0 0 14px">Ты решил все 8 кризисов: Теплица, Медпункт, Лаборатория и Шлюз работают.</p><p style="font-weight:900;font-size:18px;margin:0 0 14px">❤️ ' + Bridge.load().life + ' · ⚡ ' + Bridge.load().energy + ' · 🛡️ ' + Bridge.load().shield + '</p><button type="button" style="border:3px solid #231815;border-radius:16px;background:#fde047;font:900 16px MMSans,system-ui,sans-serif;padding:10px 20px;cursor:pointer;color:#231815;box-shadow:0 4px 0 #231815">Продолжить</button></div>';
      m.querySelector("button").onclick = function () { m.remove(); };
      document.body.appendChild(m);
    },
    names: NAMES
  };

  var SECT = ["greenhouse", "medbay", "lab", "airlock"], DAYS = 15, SPECIAL = [1, 3, 6, 9, 12, 15];

  var ECO = {
    "1A": [[32, 4, -6],  [22, 5, -2]],
    "1B": [[30, 6, -6],  [20, -2, 6]],
    "2A": [[32, -6, 4],  [5, -2, 22]],
    "2B": [[6, -6, 30],  [20, -2, 6]],
    "3A": [[-6, 4, 32],  [-2, 5, 22]],
    "3B": [[-6, 6, 30],  [6, -2, 20]],
    "4A": [[-6, 32, 4],  [-2, 22, 5]],
    "4B": [[6, 30, -6],  [-2, 20, 6]]
  };
  var EVENTS = { 3: { k: "storm", d: [-3, -15, -6] }, 6: { k: "flare", d: [-6, -4, -14] }, 9: { k: "blackout", d: [-7, -12, -5] }, 12: { k: "cold", d: [-8, -12, -4] } };
  var UPKEEP = [-10, -10, -10];
  function cl(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function campNorm(c) {
    c = c && typeof c === "object" ? c : {};
    var o = {
      phase: ["new", "map", "pick", "play", "sum", "end"].indexOf(c.phase) >= 0 ? c.phase : "new",
      day: num(c.day, 1, 1, DAYS), lives: num(c.lives, 3, 0, 3), picked: [], sdone: {}, snap: null, faces: {}, skipped: {}, seen: {},
      lab: num(c.lab, 0, 0, 99), wear: num(c.wear, 0, 0, 6), vis: {}, run: {}, rv: num(c.rv, 0, 0, 99), rvDay: num(c.rvDay, 0, 0, DAYS), replay: c.replay ? 1 : 0, ev: c.ev ? 1 : 0, fin: c.fin ? 1 : 0, finFilm: c.finFilm ? 1 : 0, cong: c.cong ? 1 : 0, pts: num(c.pts, 0, 0, 99999), sum: null
    };
    (Array.isArray(c.picked) ? c.picked : []).forEach(function (r) { if (SECT.indexOf(r) >= 0 && o.picked.indexOf(r) < 0 && o.picked.length < 2) o.picked.push(r); });
    SECT.forEach(function (r) { if (c.vis && c.vis[r]) o.vis[r] = num(c.vis[r], 0, 0, DAYS); if (c.run && c.run[r]) o.run[r] = num(c.run[r], 0, 0, DAYS); });
    SECT.forEach(function (r) { if (c.sdone && c.sdone[r]) o.sdone[r] = { w: c.sdone[r].w ? 1 : 0, q: c.sdone[r].q ? 1 : 0, d: Array.isArray(c.sdone[r].d) ? c.sdone[r].d.slice(0, 3).map(Number) : [0, 0, 0] }; });
    if (Array.isArray(c.snap) && c.snap.length === 3) o.snap = c.snap.map(function (v) { return cl(v); });
    if (c.faces && typeof c.faces === "object") for (var k in c.faces) { var n = +k; if (n >= 1 && n <= DAYS) o.faces[n] = num(c.faces[k], 1, 0, 2); }
    if (c.skipped && typeof c.skipped === "object") for (var k2 in c.skipped) if (c.skipped[k2]) o.skipped[k2] = 1;
    if (c.seen && typeof c.seen === "object") for (var k3 in c.seen) if (c.seen[k3]) o.seen[String(k3).slice(0, 24)] = 1;
    if (c.sum && typeof c.sum === "object") o.sum = c.sum;
    o.sci = Math.min(5, Math.floor((o.lab + o.rv) / 2));
    return o;
  }
  Bridge.DAYS = DAYS; Bridge.SECT = SECT; Bridge.SPECIAL = SPECIAL; Bridge.EVENTS = EVENTS; Bridge.ECO = ECO; Bridge.UPKEEP = UPKEEP;
  Bridge.camp = function () { return campNorm(read().camp); };
  Bridge.campSave = function (c) { var s = read(); s.camp = campNorm(c); write(s); post({ mmDune: "camp", day: s.camp.day, phase: s.camp.phase, lives: s.camp.lives, sci: s.camp.sci }); return s.camp; };
  Bridge.cl = cl;
  Bridge.res = function () { var g = Bridge.load(); return [g.life, g.energy, g.shield]; };
  Bridge.setRes = function (r) { var g = Bridge.load(); g.life = cl(r[0]); g.energy = cl(r[1]); g.shield = cl(r[2]); Bridge.save(g); return [g.life, g.energy, g.shield]; };
  Bridge.addRes = function (d) { var r = Bridge.res(); return Bridge.setRes([r[0] + d[0], r[1] + d[1], r[2] + d[2]]); };

  Bridge.happy = function (r) { var a = (r[0] + r[1] + r[2]) / 3, m = Math.min(r[0], r[1], r[2]); return Math.round(0.6 * a + 0.4 * m); };
  Bridge.face = function (h) { return h >= 70 ? 2 : h >= 50 ? 1 : 0; };

  Bridge.failVec = function (v) { return window.DuneEcon.fail(v, Bridge.camp().day); };

  Bridge.eco = function (dict, kind) {
    var E = window.DuneEcon, c = Bridge.camp(), res = Bridge.res();
    Object.keys(dict).forEach(function (key) {
      var rows = ECO[key]; if (!rows) return;
      var room = E.ROOM[key.charAt(0)], q = E.quickIdx(rows);
      var ctx = { day: c.day, res: res, tired: E.tired(c.run, room), neglect: E.neglect(c.vis, room, c.day) };
      [1, 2].forEach(function (n, i) {
        var o = dict[key].options[n], v = E.scale(rows[i], ctx); if (!o) return;
        if (kind === "hub") { o.lifeReward = v[0]; o.energyCost = v[1]; o.shieldReward = v[2]; o.scienceReward = 0; }
        else { o.lifeDelta = v[0]; o.energyDelta = v[1]; o.shieldDelta = v[2]; o.scienceDelta = 0; }
        o.vec = v; o.quick = i === q;
      });
    });
  };
  Bridge.eventVec = function (day) { var ev = EVENTS[day]; return ev ? window.DuneEcon.event(ev.d, day) : null; };

  Bridge.sector = function (room) {
    var c = Bridge.camp();
    if (SECT.indexOf(room) < 0) return "open";
    if (arc()) return "open";
    if (c.phase !== "play") return window.parent !== window ? "locked" : "open";
    if (c.sdone[room]) return "done";
    return c.picked.indexOf(room) >= 0 ? "open" : "locked";
  };

  Bridge.sectorDone = function (room, win, d, q) {
    var c = Bridge.camp(); if (c.phase !== "play" || c.sdone[room]) return { all: false, sci: 0 };
    c.sdone[room] = { w: win ? 1 : 0, q: q ? 1 : 0, d: d || [0, 0, 0] };
    var before = c.sci, all = c.picked.length === 2 && c.picked.every(function (r) { return c.sdone[r]; });
    if (room === "lab") c.lab++;
    if (all) c.phase = "sum";
    c = Bridge.campSave(c);
    return { all: all, sci: c.sci > before ? c.sci : 0 };
  };

  var RV_COST = 8, RV_MIN = 10, RV_SHIELD = { A: 6, B: 4, C: 2, D: 0 };
  Bridge.RV_COST = RV_COST;
  Bridge.roverCan = function () {
    var c = Bridge.camp();
    if (c.phase !== "play") return { ok: false, why: "phase" };
    if (c.rvDay === c.day) return { ok: false, why: "used" };
    if (Bridge.res()[1] < RV_MIN) return { ok: false, why: "energy" };
    return { ok: true };
  };
  Bridge.roverStart = function () {
    if (!Bridge.roverCan().ok) return false;
    var c = Bridge.camp(); c.rvDay = c.day; Bridge.campSave(c); Bridge.addRes([0, -RV_COST, 0]); return true;
  };
  Bridge.roverFinish = function (rating) {
    var c = Bridge.camp(), before = c.sci; c.rv++; c = Bridge.campSave(c);
    var sh = RV_SHIELD[rating] || 0; if (sh) Bridge.addRes([0, 0, sh]);
    return { shield: sh, sci: c.sci > before ? c.sci : 0 };
  };
  Bridge.seen = function (k) { var c = Bridge.camp(); if (c.seen[k]) return true; c.seen[k] = 1; Bridge.campSave(c); return false; };
  Bridge.hasSeen = function (k) { return !!Bridge.camp().seen[k]; };
  Bridge.restart = function () { var s = read(); var nick = s.camp && s.camp.nick; delete s.camp; s.life = DEF.life; s.energy = DEF.energy; s.shield = DEF.shield; s.hearts = 3; s.done = {}; write(s); post({ mmDune: "camp", day: 1, phase: "map", lives: 3 }); };
  Bridge.toast = function (txt, ms) {
    var t = document.getElementById("mm-toast");
    if (!t) { t = document.createElement("div"); t.id = "mm-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = txt; t.className = "show"; clearTimeout(Bridge._tt); Bridge._tt = setTimeout(function () { t.className = ""; }, ms || 2200);
  };

  var _go = Bridge.go;
  Bridge.go = function (room) {
    if (arc()) { Bridge.toast("🎮 Режим пробы мини-игр"); return; }
    if (SECT.indexOf(room) >= 0) {
      var st = Bridge.sector(room);
      if (st !== "open") { Bridge.toast(st === "done" ? "Этот сектор уже исследован в этот сол" : "🔒 Сектор закрыт на этот сол"); return; }
    }
    return _go(room);
  };

  ["highlightCompartment", "syncPinHover", "openDepartment"].forEach(function (n) { if (!window[n]) window[n] = function () {}; });
  Bridge.arcade = function () { var A = arc(); return A ? A.id : 0; };
  window.DuneBridge = Bridge;
})();

(function () {
  function sync() { try { document.documentElement.classList.toggle("mm-idle", document.hidden); } catch (e) {} }
  document.addEventListener("visibilitychange", sync); sync();
})();
