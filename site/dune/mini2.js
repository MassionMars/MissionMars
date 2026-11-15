/* Mars Dune Alpha: eight extra 10-second logic and speed mini-games for the second crisis of every room.
 * Each room hands over its hooks (window.MM2_HOOKS): running(), finish(win), sync(score,target), sfx(kind). */
(function () {
  "use strict";
  var META = {
    9:  { target: 1, desc: "Поверни трубы так, чтобы вода из бака (💧 в углу) дошла до всех грядок. Нажимай на трубу, чтобы повернуть её." },
    10: { target: 1, desc: "Рассади три культуры ● ▲ ■ так, чтобы в каждой строке и в каждом столбце они не повторялись. Нажимай на пустую клетку." },
    11: { target: 5, desc: "Нажимай кнопку (или пробел), когда красный шарик попадает в зелёное кольцо. Попади в ритм сердца 5 раз из 7!" },
    12: { target: 4, desc: "Среди ампул одна чуть другого цвета. Найди её быстрее! Нужно найти 4 раза, ампулы будут всё более похожими." },
    13: { target: 1, desc: "Нажатие на клетку меняет её и четырёх соседей. Погаси все огни реактора. Подумай, какие клетки нажимать." },
    14: { target: 2, desc: "Нажимай на клетки: число показывает, сколько шагов до льда. Двигайся к нулю и найди лёд 2 раза!" },
    15: { target: 1, desc: "Сдвигай панели люка в пустую клетку и расставь цифры от 1 до 8 по порядку." },
    16: { target: 3, desc: "Стрелка бегает по шкале. Нажми СТОП (или пробел), когда она в зелёной зоне. Нужно 3 точных остановки." }
  };

  var live = null; // current run: { timers:[], raf:0, off:[] }

  function H() { return window.MM2_HOOKS || { running: function () { return false; }, finish: function () {}, sync: function () {}, sfx: function () {} }; }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function stop() {
    if (!live) return;
    live.timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    if (live.raf) cancelAnimationFrame(live.raf);
    live.off.forEach(function (f) { try { f(); } catch (e) {} });
    live = null;
  }
  function arena(box) {
    var a = $("arena-game-new");
    if (!a) {
      a = el("div", "hidden relative flex-1 w-full h-full mm2-arena"); a.id = "arena-game-new";
      var last = null; box.querySelectorAll('[id^="arena-game-"]').forEach(function (x) { last = x; });
      if (last && last.parentNode) last.parentNode.insertBefore(a, last.nextSibling); else box.appendChild(a);
    }
    return a;
  }
  function reset() {
    stop();
    var a = $("arena-game-new"); if (a) { a.classList.add("hidden"); a.innerHTML = ""; }
  }

  /* the helper object every game gets */
  function makeCtx(root, id) {
    var score = 0, target = META[id].target, done = false;
    var c = {
      root: root, id: id, target: target,
      alive: function () { return !done && live && H().running(); },
      set: function (n) {
        score = Math.max(0, n); H().sync(score, target);
        var cur = $("game-score-current"), bar = $("game-goal-bar");
        if (cur) cur.textContent = String(score);
        if (bar) bar.style.width = Math.min(100, score / target * 100) + "%";
        if (score >= target && !done) { done = true; H().sfx("win"); live && live.timers.push(setTimeout(function () { H().finish(true); }, 380)); }
      },
      score: function () { return score; },
      add: function (d) { c.set(score + d); },
      fail: function (delay) { if (done) return; done = true; live && live.timers.push(setTimeout(function () { H().finish(false); }, delay || 300)); },
      sfx: function (k) { H().sfx(k); },
      after: function (ms, fn) { if (!live) return; var t = setTimeout(function () { if (c.alive()) fn(); }, ms); live.timers.push(t); return t; },
      every: function (ms, fn) { if (!live) return; var t = setInterval(function () { if (c.alive()) fn(); else clearInterval(t); }, ms); live.timers.push(t); return t; },
      loop: function (fn) {
        var last = performance.now();
        (function step(now) {
          if (!live || !c.alive()) return;
          var dt = Math.min(.05, (now - last) / 1000); last = now; fn(dt, now / 1000);
          live.raf = requestAnimationFrame(step);
        })(last);
      },
      on: function (target_, ev, fn, opt) { target_.addEventListener(ev, fn, opt); live && live.off.push(function () { target_.removeEventListener(ev, fn, opt); }); },
      pop: function (host, text, cls) { var p = el("div", "mm2-pop " + (cls || ""), text); host.appendChild(p); setTimeout(function () { p.remove(); }, 900); },
      shake: function (node) { node.classList.remove("mm2-shake"); void node.offsetWidth; node.classList.add("mm2-shake"); }
    };
    return c;
  }

  /* ---------------- 9: pipes (logic) ---------------- */
  function g9(c, root) {
    var N = 3, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], base, rot, btns = [], won = false;
    function gen() {
      base = []; for (var i = 0; i < N * N; i++) base.push(0);
      var seen = [1, 0, 0, 0, 0, 0, 0, 0, 0], st = [0];
      while (st.length) {
        var i2 = st[st.length - 1], x = i2 % N, y = (i2 / N) | 0, nb = [];
        for (var d = 0; d < 4; d++) { var nx = x + DX[d], ny = y + DY[d]; if (nx >= 0 && ny >= 0 && nx < N && ny < N && !seen[ny * N + nx]) nb.push(d); }
        if (!nb.length) { st.pop(); continue; }
        var dd = pickOne(nb), j = (y + DY[dd]) * N + x + DX[dd];
        base[i2] |= 1 << dd; base[j] |= 1 << ((dd + 2) % 4); seen[j] = 1; st.push(j);
      }
    }
    function mask(i) { var m = base[i], k = rot[i] % 4; while (k--) m = ((m << 1) | (m >> 3)) & 15; return m; }
    function wet() {
      var w = [1, 0, 0, 0, 0, 0, 0, 0, 0], q = [0];
      while (q.length) {
        var i = q.pop(), x = i % N, y = (i / N) | 0, m = mask(i);
        for (var d = 0; d < 4; d++) if (m & (1 << d)) {
          var nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
          var j = ny * N + nx; if (!w[j] && (mask(j) & (1 << ((d + 2) % 4)))) { w[j] = 1; q.push(j); }
        }
      }
      return w;
    }
    var tries = 0;
    do { gen(); rot = base.map(function (_, i) { return i ? Math.floor(Math.random() * 4) : 0; }); tries++; }
    while (tries < 40 && wet().reduce(function (a, b) { return a + b; }, 0) > 5);
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Поверни трубы: вода из бака 💧 должна дойти до всех грядок</div><div class="mm2-pgrid"></div><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var grid = root.querySelector(".mm2-pgrid"), msg = root.querySelector("#mm2-msg");
    for (var i = 0; i < N * N; i++) { var b = el("button", "mm2-pt"); b.type = "button"; grid.appendChild(b); btns.push(b); }
    function draw() {
      var w = wet();
      btns.forEach(function (b, i) {
        var bm = base[i], col = w[i] ? "#38bdf8" : "#cbd5e1", s = '<svg viewBox="-50 -50 100 100" style="transform:rotate(' + (rot[i] * 90) + 'deg)">', deg = 0, d;
        for (d = 0; d < 4; d++) if (bm & (1 << d)) { deg++; s += '<line x1="0" y1="0" x2="' + [0, 50, 0, -50][d] + '" y2="' + [-50, 0, 50, 0][d] + '" stroke="#231815" stroke-width="26"/>'; }
        for (d = 0; d < 4; d++) if (bm & (1 << d)) s += '<line x1="0" y1="0" x2="' + [0, 50, 0, -50][d] + '" y2="' + [-50, 0, 50, 0][d] + '" stroke="' + col + '" stroke-width="16"/>';
        s += '<circle r="' + (deg === 1 ? 19 : 14) + '" fill="#231815"/><circle r="' + (deg === 1 ? 14 : 10) + '" fill="' + (i === 0 ? "#fde047" : deg === 1 ? (w[i] ? "#4ade80" : "#a3a380") : col) + '"/></svg>';
        b.innerHTML = s + (i === 0 ? '<span class="mm2-tank">💧</span>' : "");
        b.classList.toggle("wet", !!w[i]);
      });
      return w.every(function (x) { return x; });
    }
    btns.forEach(function (b, i) {
      if (i === 0) return;
      b.onclick = function () {
        if (won || !c.alive()) return; rot[i]++; c.sfx("tick");
        if (draw()) { won = true; msg.textContent = "Вся теплица полита!"; msg.className = "mm2-msg ok"; c.add(1); }
      };
    });
    draw();
  }

  /* ---------------- 10: garden square (logic) ---------------- */
  function g10(c, root) {
    var N = 3, P = shuffle([0, 1, 2]), Rr = shuffle([0, 1, 2]), Cc = shuffle([0, 1, 2]), S = shuffle([1, 2, 3]), sol = [], y, x;
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) sol.push(S[(Rr[y] + Cc[x]) % 3]);
    var given = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4), g = sol.map(function (v, i) { return given.indexOf(i) >= 0 ? v : 0; }), cells = [], over = false;
    function shape(v) {
      var C = ["", "#4ade80", "#fb923c", "#f43f5e"][v];
      return v === 1 ? '<circle cx="20" cy="20" r="13" fill="' + C + '" stroke="#231815" stroke-width="3"/>' : v === 2 ? '<path d="M20 5 36 33H4Z" fill="' + C + '" stroke="#231815" stroke-width="3" stroke-linejoin="round"/>' : v === 3 ? '<rect x="7" y="7" width="26" height="26" rx="5" fill="' + C + '" stroke="#231815" stroke-width="3"/>' : "";
    }
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">В каждой строке и в каждом столбце: ● ▲ ■ по одному разу</div><div class="mm2-sgrid"></div><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var box = root.querySelector(".mm2-sgrid"), msg = root.querySelector("#mm2-msg");
    for (var i = 0; i < 9; i++) { var b = el("button", "mm2-gcell" + (given.indexOf(i) >= 0 ? " fix" : "")); b.type = "button"; box.appendChild(b); cells.push(b); }
    function draw() {
      var bad = {}, full = true;
      for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
        var v = g[y * N + x]; if (!v) { full = false; continue; }
        for (var k = 0; k < N; k++) { if (k !== x && g[y * N + k] === v) bad[y * N + x] = 1; if (k !== y && g[k * N + x] === v) bad[y * N + x] = 1; }
      }
      cells.forEach(function (b, i) { b.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true">' + shape(g[i]) + '</svg>'; b.classList.toggle("bad", !!bad[i]); });
      return full && !Object.keys(bad).length;
    }
    cells.forEach(function (b, i) {
      if (given.indexOf(i) >= 0) return;
      b.onclick = function () {
        if (over || !c.alive()) return; g[i] = (g[i] + 1) % 4; c.sfx("tick");
        if (draw()) { over = true; msg.textContent = "Грядки в порядке!"; msg.className = "mm2-msg ok"; c.add(1); }
      };
    });
    draw();
  }

  /* ---------------- 11: heartbeat rhythm (speed) ---------------- */
  function g11(c, root) {
    var T = 1.3, N = 7, beats = [], t0 = performance.now(), hits = 0, miss = 0;
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Нажимай, когда красный шарик попадёт в зелёное кольцо</div><div class="mm2-lane" id="mm2-ln"><svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,50 120,50 140,50 150,16 160,86 170,50 400,50" fill="none" stroke="rgba(134,239,172,.5)" stroke-width="2"/></svg><div class="mm2-tg"></div></div><button type="button" class="mm2-btn up" id="mm2-tap">❤ ПУЛЬС</button><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var ln = root.querySelector("#mm2-ln"), msg = root.querySelector("#mm2-msg"), tg = root.querySelector(".mm2-tg");
    for (var k = 0; k < N; k++) { var e = el("div", "mm2-bt"); e.style.display = "none"; ln.appendChild(e); beats.push({ t: 1 + k * 1.15, el: e, s: 0 }); }
    function tap() {
      if (!c.alive()) return;
      var now = (performance.now() - t0) / 1000, best = null;
      beats.forEach(function (b) { if (!b.s && Math.abs(now - b.t) < .36 && (!best || Math.abs(now - b.t) < Math.abs(now - best.t))) best = b; });
      if (!best) return;
      if (Math.abs(now - best.t) < .2) { best.s = 1; best.el.className = "mm2-bt hit"; hits++; msg.textContent = "Точно!"; msg.className = "mm2-msg ok"; c.sfx("good"); c.add(1); }
      else { best.s = 2; best.el.className = "mm2-bt miss"; miss++; msg.textContent = "Мимо"; msg.className = "mm2-msg bad"; c.sfx("bad"); }
    }
    root.querySelector("#mm2-tap").onclick = tap;
    c.on(window, "keydown", function (e) { if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); tap(); } });
    c.on(ln, "pointerdown", tap);
    c.loop(function () {
      var now = (performance.now() - t0) / 1000, w = ln.clientWidth, x0 = tg.offsetLeft + tg.offsetWidth / 2;
      beats.forEach(function (b) {
        var p = (b.t - now) / T;
        if (p < -.2 || p > 1) { b.el.style.display = "none"; if (p < -.2 && !b.s) { b.s = 2; miss++; } return; }
        b.el.style.display = "block"; b.el.style.left = (x0 + p * (w - x0)) + "px";
      });
      if (miss > N - META[11].target) c.fail(400);
    });
  }

  /* ---------------- 12: odd vial out (speed + observation) ---------------- */
  function g12(c, root) {
    var round = 0, SZ = [3, 4, 4, 5], DL = [22, 15, 11, 8], hue = 0, lock = false;
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Найди ампулу с другим цветом</div><div class="mm2-vgrid"></div><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var box = root.querySelector(".mm2-vgrid"), msg = root.querySelector("#mm2-msg");
    function build() {
      var n = SZ[Math.min(round, SZ.length - 1)], d = DL[Math.min(round, DL.length - 1)], odd = Math.floor(Math.random() * n * n);
      hue = Math.floor(rnd(0, 360)); box.innerHTML = ""; box.style.gridTemplateColumns = "repeat(" + n + ",1fr)"; box.className = "mm2-vgrid n" + n;
      for (var i = 0; i < n * n; i++) {
        var b = el("button", "mm2-vial"); b.type = "button";
        var l = i === odd ? 55 + d : 55;
        b.innerHTML = '<svg viewBox="0 0 30 40" aria-hidden="true"><path d="M10 3h10v8l5 22a4 4 0 0 1-4 5H9a4 4 0 0 1-4-5l5-22z" fill="#f8fafc" stroke="#231815" stroke-width="2.4" stroke-linejoin="round"/><path d="M8.500 20h13l3 13a3 3 0 0 1-3 4H8.500a3 3 0 0 1-3-4z" fill="hsl(' + hue + ',75%,' + l + '%)"/></svg>';
        b.onclick = (function (isOdd, node) { return function () {
          if (lock || !c.alive()) return;
          if (isOdd) { lock = true; msg.textContent = "Нашёл!"; msg.className = "mm2-msg ok"; c.sfx("good"); node.classList.add("yes"); round++; c.after(200, function () { lock = false; msg.innerHTML = "&nbsp;"; msg.className = "mm2-msg"; build(); }); c.add(1); }
          else { msg.textContent = "Мимо"; msg.className = "mm2-msg bad"; c.sfx("bad"); c.shake(node); c.add(-1); }
        }; })(i === odd, b);
        box.appendChild(b);
      }
    }
    build();
  }

  /* ---------------- 13: reactor lights (logic) ---------------- */
  function g13(c, root) {
    var N = 3, s = [0, 0, 0, 0, 0, 0, 0, 0, 0], over = false, cells = [];
    function tg(i) { var x = i % N, y = (i / N) | 0; [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (p) { var nx = x + p[0], ny = y + p[1]; if (nx >= 0 && ny >= 0 && nx < N && ny < N) s[ny * N + nx] ^= 1; }); }
    do { s = [0, 0, 0, 0, 0, 0, 0, 0, 0]; shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3).forEach(tg); } while (s.every(function (v) { return !v; }));
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Нажатие меняет клетку и соседей крестом. Погаси все огни!</div><div class="mm2-sgrid"></div><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var box = root.querySelector(".mm2-sgrid"), msg = root.querySelector("#mm2-msg");
    for (var i = 0; i < 9; i++) { var b = el("button", "mm2-lo"); b.type = "button"; box.appendChild(b); cells.push(b); }
    function draw() { cells.forEach(function (b, i) { b.classList.toggle("on", !!s[i]); }); return s.every(function (v) { return !v; }); }
    cells.forEach(function (b, i) { b.onclick = function () { if (over || !c.alive()) return; tg(i); c.sfx("tick"); if (draw()) { over = true; msg.textContent = "Реактор остыл!"; msg.className = "mm2-msg ok"; c.add(1); } }; });
    draw();
  }

  /* ---------------- 14: ice finder (logic) ---------------- */
  function g14(c, root) {
    var N = 4, ice = 0, opened = {}, lock = false, cells = [];
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Число — сколько шагов до льда. Найди лёд 2 раза!</div><div class="mm2-sgrid n4"></div><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var box = root.querySelector(".mm2-sgrid"), msg = root.querySelector("#mm2-msg");
    for (var i = 0; i < N * N; i++) { var b = el("button", "mm2-ice"); b.type = "button"; box.appendChild(b); cells.push(b); }
    var COLS = ["#fff", "#fb7185", "#fb923c", "#facc15", "#4ade80", "#38bdf8", "#818cf8"];
    function round() { ice = Math.floor(Math.random() * N * N); opened = {}; cells.forEach(function (b) { b.className = "mm2-ice"; b.textContent = ""; b.style.color = ""; }); lock = false; }
    function dist(a, b2) { return Math.abs((a % N) - (b2 % N)) + Math.abs(((a / N) | 0) - ((b2 / N) | 0)); }
    cells.forEach(function (b, i) {
      b.onclick = function () {
        if (lock || opened[i] || !c.alive()) return; opened[i] = 1; var d = dist(i, ice);
        if (d === 0) { lock = true; b.className = "mm2-ice found"; b.textContent = "🧊"; msg.textContent = "Лёд найден!"; msg.className = "mm2-msg ok"; c.sfx("good"); c.add(1); c.after(650, function () { msg.innerHTML = "&nbsp;"; msg.className = "mm2-msg"; round(); }); }
        else { b.className = "mm2-ice seen"; b.textContent = String(d); b.style.color = COLS[Math.min(d, 6)]; c.sfx("tick"); }
      };
    });
    round();
  }

  /* ---------------- 15: hatch puzzle (logic) ---------------- */
  function g15(c, root) {
    var N = 3, a = [1, 2, 3, 4, 5, 6, 7, 8, 0], e = 8, prev = -1, over = false, bs = [];
    for (var k = 0; k < 9; k++) {
      var x = e % N, y = (e / N) | 0, o = [];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (p) { var nx = x + p[0], ny = y + p[1]; if (nx >= 0 && ny >= 0 && nx < N && ny < N && ny * N + nx !== prev) o.push(ny * N + nx); });
      var j = pickOne(o); a[e] = a[j]; a[j] = 0; prev = e; e = j;
    }
    function solved() { return a.every(function (v, i) { return v === (i + 1) % 9; }); }
    if (solved()) { a[7] = 0; a[8] = 8; }
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Сдвигай панели в пустую клетку: цифры от 1 до 8 по порядку</div><div class="mm2-sgrid"></div><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var box = root.querySelector(".mm2-sgrid"), msg = root.querySelector("#mm2-msg");
    for (var i = 0; i < 9; i++) { var b = el("button", "mm2-sl"); b.type = "button"; box.appendChild(b); bs.push(b); }
    function draw() { bs.forEach(function (b, i) { b.className = "mm2-sl" + (a[i] ? "" : " e"); b.textContent = a[i] ? String(a[i]) : ""; }); }
    bs.forEach(function (b, i) {
      b.onclick = function () {
        if (over || !c.alive()) return; var z = a.indexOf(0);
        if (Math.abs((i % N) - (z % N)) + Math.abs(((i / N) | 0) - ((z / N) | 0)) !== 1) return;
        a[z] = a[i]; a[i] = 0; c.sfx("tick"); draw();
        if (solved()) { over = true; msg.textContent = "Люк собран!"; msg.className = "mm2-msg ok"; c.add(1); }
      };
    });
    draw();
  }

  /* ---------------- 16: pressure gauge (speed) ---------------- */
  function g16(c, root) {
    var pos = 0, dir = 1, v = .85, z0 = 0, ZW = .26;
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Останови стрелку в зелёной зоне, 3 раза</div><div class="mm2-gauge" id="mm2-ga"><div class="mm2-zone"></div><div class="mm2-needle"></div></div><button type="button" class="mm2-btn cool" id="mm2-st">СТОП</button><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var ga = root.querySelector("#mm2-ga"), zn = root.querySelector(".mm2-zone"), nd = root.querySelector(".mm2-needle"), msg = root.querySelector("#mm2-msg");
    function zone() { z0 = rnd(.08, .92 - ZW); zn.style.left = z0 * 100 + "%"; zn.style.width = ZW * 100 + "%"; }
    function stop() {
      if (!c.alive()) return;
      if (pos >= z0 && pos <= z0 + ZW) { msg.textContent = "В зелёной зоне!"; msg.className = "mm2-msg ok"; c.sfx("good"); v += .22; zone(); c.add(1); }
      else { msg.textContent = "Мимо"; msg.className = "mm2-msg bad"; c.sfx("bad"); c.shake(ga); }
    }
    root.querySelector("#mm2-st").onclick = stop;
    c.on(window, "keydown", function (e) { if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); stop(); } });
    c.on(ga, "pointerdown", stop);
    zone();
    c.loop(function (dt) { pos += dir * v * dt; if (pos >= 1) { pos = 1; dir = -1; } if (pos <= 0) { pos = 0; dir = 1; } nd.style.left = pos * 100 + "%"; });
  }

  var GAMES = { 9: g9, 10: g10, 11: g11, 12: g12, 13: g13, 14: g14, 15: g15, 16: g16 };

  window.MM2 = {
    meta: META,
    has: function (id) { return !!GAMES[id]; },
    reset: reset, stop: stop,
    tutorialReset: function () { var d = $("tut-gif-new"); if (d) d.classList.add("hidden"); },
    /* tutorial card: big animated emblem instead of the old GIF demos */
    tutorial: function (id) {
      var anchor = document.querySelector('[id^="tut-gif-game"]'); if (!anchor) return;
      var host = anchor.parentNode, d = $("tut-gif-new");
      document.querySelectorAll('[id^="tut-gif-game"]').forEach(function (g) { g.classList.add("hidden"); });
      if (!d) { d = el("div", "mm2-demo"); d.id = "tut-gif-new"; host.appendChild(d); }
      d.classList.remove("hidden");
      d.innerHTML = window.MMCrisis ? MMCrisis.emblem(id, 104) + '<span class="mm2-demo-t">10 с</span>' : "";
      $("tut-title").textContent = "Мини-игра: «" + (window.MMCrisis ? MMCrisis.names[id] : "") + "»";
      $("tut-desc").textContent = META[id].desc;
    },
    run: function (id, box) {
      reset();
      var a = arena(box); a.classList.remove("hidden"); a.innerHTML = "";
      var root = el("div", "mm2-root"); a.appendChild(root);
      live = { timers: [], raf: 0, off: [] };
      var c = makeCtx(root, id);
      var badge = $("active-game-badge");
      if (badge && window.MMCrisis) { badge.textContent = MMCrisis.names[id]; badge.style.background = ""; badge.className = "px-3 py-1 rounded-xl border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]"; badge.style.background = "linear-gradient(180deg,var(--m1),var(--m2))"; badge.style.setProperty("--m1", ({9:"#fde047",10:"#bbf7d0",11:"#a5f3fc",12:"#fbcfe8",13:"#c7d2fe",14:"#fecaca",15:"#99f6e4",16:"#fef08a"})[id]); badge.style.setProperty("--m2", ({9:"#f87171",10:"#4ade80",11:"#22d3ee",12:"#f472b6",13:"#818cf8",14:"#f87171",15:"#2dd4bf",16:"#fb923c"})[id]); }
      var cur = $("game-score-current"), tgt = $("game-score-target");
      if (cur) cur.textContent = "0"; if (tgt) tgt.textContent = String(META[id].target);
      var bar = $("game-goal-bar"); if (bar) bar.style.width = "0%";
      H().sync(0, META[id].target);
      GAMES[id](c, root);
    }
  };
})();
