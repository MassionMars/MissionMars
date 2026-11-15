(function () {
  "use strict";
  var META = {
    4:  { target: 2, time: 40, desc: "Нужно довести пульс пациента до числа 70. Нажимай на лекарства: одни уменьшают пульс, другие увеличивают. Доз мало, поэтому подумай, какие нажать. Два пациента." },
    5:  { target: 3, time: 40, desc: "Оранжевая волна — образец. Двигай ползунок, пока твоя синяя волна не совпадёт с ней, и подержи секунду. Сначала подгоняешь высоту, потом частоту, потом обе." },
    6:  { target: 1, time: 50, desc: "Помоги роверу: проведи его 🚜 через оба алмаза 💎 и приведи на зарядку 🔋. Нажимай на соседние клетки. Камни 🪨 проехать нельзя. Кнопка ↶ отменяет шаг." },
    8:  { target: 1, time: 50, desc: "В стене две дырки. Выбери заплатку внизу и нажми на красную дырку — заплатка ляжет точно по форме. Нажми на заплатку, чтобы убрать её." },
    9:  { target: 15, time: 25, desc: "Три грядки хотят пить. Нажимай на грядку — польётся вода 💧. Держи воду в зелёной зоне 15 секунд. Одновременно открыть можно только два крана. Слишком мало или слишком много воды — грядка погибнет." },
    10:  { target: 2, time: 45, desc: "Сначала на пару секунд покажут грядки с растениями. Запомни, где что растёт. Потом всё спрячется — выбери растение внизу и нажми на клетку, где оно было." },
    11:  { target: 10, time: 24, desc: "На экране бьётся сердце ❤ и плывёт по кругу. Води курсор (или палец) за ним и держи его внутри кольца. Набери 10 секунд." },
    12: { target: 3, time: 25, desc: "Среди ампул одна другого цвета. Найди её 3 раза." },
    13:  { target: 1, time: 55, desc: "Соедини цветные точки одного цвета линией. Нажми на точку и, не отпуская, веди до такой же точки. Линии не должны пересекаться." },
    14: { target: 2, time: 35, desc: "Под плитами спрятаны два блока льда. Число показывает расстояние до ближайшего льда. У бура 10 попыток — найди оба блока!" },
    15:  { target: 2, time: 55, desc: "Код люка — два числа. Крути диск. Подсказка: ❄️ холодно, 🔥 горячо. Когда станет «Жми «Зафиксировать»», нажимай кнопку. Шесть ошибок — замок блокируется." },
    16: { target: 4, time: 18, desc: "Стрелка бегает по шкале. Нажми СТОП (или пробел), когда она в зелёной зоне. Зона сужается, стрелка ускоряется. Нужно 4 точные остановки." }
  };

  var live = null;

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

  function say(msg, t, k) { msg.textContent = t; msg.className = "mm2-msg" + (k ? " " + k : ""); }
  function pc(m) { var n = 0; while (m) { n += m & 1; m >>= 1; } return n; }
  function sym(v, s) {
    var C = ["#ef4444", "#3b82f6", "#22c55e", "#facc15", "#a855f7", "#fb923c"][v], o = ' fill="' + C + '" stroke="#231815" stroke-width="3" stroke-linejoin="round"';
    var P = [
      '<circle cx="20" cy="20" r="14"' + o + '/>',
      '<rect x="7" y="7" width="26" height="26" rx="4"' + o + '/>',
      '<path d="M20 5 36 34H4Z"' + o + '/>',
      '<path d="M20 3l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z"' + o + '/>',
      '<path d="M20 4 35 12V28L20 36 5 28V12Z"' + o + '/>',
      '<path d="M14 5h12v9h9v12h-9v9H14v-9H5V14h9z"' + o + '/>'
    ];
    return '<svg viewBox="0 0 40 40" width="' + (s || 28) + '" height="' + (s || 28) + '" aria-hidden="true">' + P[v] + '</svg>';
  }

  function g12(c, root) {
    var round = 0, SZ = [3, 3, 4, 4, 4], DL = [34, 30, 26, 24, 22], LV = [0, 0, 0, 0, 0], hue = 0, lock = false;
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Найди ампулу другого цвета</div><div class="mm2-vgrid"></div><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var box = root.querySelector(".mm2-vgrid"), msg = root.querySelector("#mm2-msg");
    function build() {
      var r = Math.min(round, 4), n = SZ[r], odd = Math.floor(Math.random() * n * n), lvl = false, d = DL[r];
      hue = Math.floor(rnd(0, 360)); box.innerHTML = ""; box.style.gridTemplateColumns = "repeat(" + n + ",1fr)"; box.className = "mm2-vgrid n" + n;
      for (var i = 0; i < n * n; i++) {
        var b = el("button", "mm2-vial"); b.type = "button";
        var l = !lvl && i === odd ? 55 + d : 55, yy = lvl && i === odd ? 20 - LV[r] : 20, xl = 10 - 5 * (yy - 11) / 22, xr = 20 + 5 * (yy - 11) / 22;
        b.innerHTML = '<svg viewBox="0 0 30 40" aria-hidden="true"><path d="M10 3h10v8l5 22a4 4 0 0 1-4 5H9a4 4 0 0 1-4-5l5-22z" fill="#f8fafc" stroke="#231815" stroke-width="2.4" stroke-linejoin="round"/><path d="M' + xl.toFixed(1) + ' ' + yy + 'H' + xr.toFixed(1) + 'L25 33a3 3 0 0 1-3 4.500H8A3 3 0 0 1 5 33z" fill="hsl(' + hue + ',75%,' + l + '%)"/></svg>';
        b.onclick = (function (isOdd, node) { return function () {
          if (lock || !c.alive()) return;
          if (isOdd) { lock = true; say(msg, "Нашёл!", "ok"); c.sfx("good"); node.classList.add("yes"); round++; c.after(260, function () { lock = false; say(msg, " "); build(); }); c.add(1); }
          else { say(msg, "Мимо", "bad"); c.sfx("bad"); c.shake(node); }
        }; })(i === odd, b);
        box.appendChild(b);
      }
    }
    build();
  }

  function g14(c, root) {
    var N = 5, NN = 25, ice = [], found = {}, opened = {}, tries = 10, cells = [], lock = false;
    var ids = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    ice = [ids[0]]; for (var z = 1; z < ids.length && ice.length < 2; z++) if (dist(ids[z], ice[0]) >= 2) ice.push(ids[z]);
    function dist(a, b2) { return Math.abs((a % N) - (b2 % N)) + Math.abs(((a / N) | 0) - ((b2 / N) | 0)); }
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Число — расстояние до ближайшего льда. Найди оба блока!</div><div class="mm2-sgrid n5"></div><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var box = root.querySelector(".mm2-sgrid"), msg = root.querySelector("#mm2-msg");
    for (var i = 0; i < NN; i++) { var b = el("button", "mm2-ice"); b.type = "button"; box.appendChild(b); cells.push(b); }
    var COLS = ["#fff", "#fb7185", "#fb923c", "#facc15", "#4ade80", "#38bdf8", "#818cf8"];
    function info() { say(msg, "Попыток бура: " + tries); }
    cells.forEach(function (b, i) {
      b.onclick = function () {
        if (lock || opened[i] || !c.alive()) return; opened[i] = 1;
        if (ice.indexOf(i) >= 0) { found[i] = 1; b.className = "mm2-ice found"; b.textContent = "🧊"; c.sfx("good"); c.add(1); say(msg, "Лёд найден!", "ok"); c.after(700, info); return; }
        var d = 99; ice.forEach(function (j) { if (!found[j]) d = Math.min(d, dist(i, j)); });
        b.className = "mm2-ice seen"; b.textContent = String(d); b.style.color = COLS[Math.min(d, 6)]; c.sfx("tick"); tries--; info();
        if (tries <= 0) { lock = true; c.fail(700); say(msg, "Бур разряжен", "bad"); }
      };
    });
    info();
  }

  function g16(c, root) {
    var pos = 0, dir = 1, z0 = 0, step = 0, ZW = [.26, .2, .16, .12], V = [.9, 1.1, 1.35, 1.6];
    root.innerHTML = '<div class="mm2-col"><div class="mm2-hint">Останови стрелку в зелёной зоне. Зона сужается!</div><div class="mm2-gauge" id="mm2-ga"><div class="mm2-zone"></div><div class="mm2-needle"></div></div><button type="button" class="mm2-btn cool" id="mm2-st">СТОП</button><div class="mm2-msg" id="mm2-msg">&nbsp;</div></div>';
    var ga = root.querySelector("#mm2-ga"), zn = root.querySelector(".mm2-zone"), nd = root.querySelector(".mm2-needle"), msg = root.querySelector("#mm2-msg");
    function zone() { var w = ZW[Math.min(step, 3)]; z0 = rnd(.06, .94 - w); zn.style.left = z0 * 100 + "%"; zn.style.width = w * 100 + "%"; }
    function stop() {
      if (!c.alive()) return;
      var w = ZW[Math.min(step, 3)];
      if (pos >= z0 && pos <= z0 + w) { say(msg, Math.abs(pos - z0 - w / 2) < w * .2 ? "В яблочко!" : "В зелёной зоне!", "ok"); c.sfx("good"); step++; zone(); c.add(1); }
      else { say(msg, "Мимо", "bad"); c.sfx("bad"); c.shake(ga); c.add(-1); }
    }
    root.querySelector("#mm2-st").onpointerdown = function (e) { e.preventDefault(); stop(); };
    c.on(window, "keydown", function (e) { if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); stop(); } });
    c.on(ga, "pointerdown", stop);
    zone();
    c.loop(function (dt) { var v = V[Math.min(step, 3)]; pos += dir * v * dt; if (pos >= 1) { pos = 1; dir = -1; } if (pos <= 0) { pos = 0; dir = 1; } nd.style.left = pos * 100 + "%"; });
  }

  /* ===== v12: полностью новые игры 4,5,6,8,9,10,11,13,15 ===== */
  function key(e) { return e.code || e.key; }

  /* 4 — Пульс в норме: арифметика доз, ровно 72 */
  function g4(c, root) {
    var R = [{ k: 2, x: 2 }, { k: 3, x: 2 }], r = 0, ops = [], v = 0, st = 0, left = 0, mv = 0, lock = false, i;
    root.innerHTML = '<div class="mm2-col mm3-pulse"><div class="mm2-hint">Доведи пульс до 70. Нажимай лекарства, доз немного</div>' +
      '<div class="mm3-bpm"><span class="mm3-heart" id="mm3-hr">❤</span><b id="mm3-v">0</b><small>уд/мин</small></div>' +
      '<div class="mm3-ecgw"><svg class="mm3-ecg" viewBox="0 0 600 44" preserveAspectRatio="none"><polyline points="0,22 50,22 58,22 64,6 72,40 78,22 150,22 200,22 208,22 214,6 222,40 228,22 300,22 350,22 358,22 364,6 372,40 378,22 450,22 500,22 508,22 514,6 522,40 528,22 600,22" fill="none" stroke="#4ade80" stroke-width="2.4" stroke-linejoin="round"/></svg></div>' +
      '<div class="mm3-ops"></div><div class="mm3-info"><span id="mm3-left"></span><button type="button" class="mm3-mini" id="mm3-rs">↺ Сброс</button></div><div class="mm2-msg" id="mm2-msg"></div></div>';
    var vEl = root.querySelector("#mm3-v"), hr = root.querySelector("#mm3-hr"), box = root.querySelector(".mm3-ops"), lf = root.querySelector("#mm3-left"), msg = root.querySelector("#mm2-msg"), rs = root.querySelector("#mm3-rs");
    function show() {
      vEl.textContent = v; vEl.className = v === 70 ? "ok" : "";
      hr.style.animationDuration = Math.max(.3, Math.min(1.4, 60 / Math.max(30, v))) + "s";
      lf.textContent = "Доз осталось: " + left;
    }
    function newRound() {
      var cfg = R[Math.min(r, 1)], dn = [-10, -5], up = [5, 10], tr = 0, seq, sum, d, u;
      do {
        d = shuffle(dn).slice(0, 2); u = pickOne(up); ops = [d[0], d[1], u].sort(function (a, b) { return a - b; });
        seq = []; sum = 0;
        for (i = 0; i < cfg.k; i++) { var o = ops[Math.floor(Math.random() * 3)]; seq.push(o); sum += o; }
        st = 70 - sum; tr++;
      } while ((st < 40 || st > 110 || st === 70 || seq.every(function (q) { return q === seq[0]; })) && tr < 300);
      mv = cfg.k + cfg.x; left = mv; v = st; lock = false; box.innerHTML = "";
      ops.forEach(function (o) {
        var b = el("button", "mm3-op " + (o < 0 ? "dn" : "up"), '<span>' + (o < 0 ? (o > -8 ? "💊" : "💉") : (o < 10 ? "☕" : "⚡")) + '</span><b>' + (o > 0 ? "+" : "−") + Math.abs(o) + '</b><small>' + (o < 0 ? (o > -8 ? "Седатив" : "Бета-блокатор") : (o < 10 ? "Кофеин" : "Адреналин")) + '</small>');
        b.type = "button";
        b.onclick = function () {
          if (lock || !c.alive()) return; v += o; left--; c.sfx("tick"); show();
          if (v === 70) { lock = true; say(msg, "Пульс в норме!", "ok"); c.add(1); r++; c.after(750, function () { if (c.score() < c.target) { newRound(); say(msg, " "); } }); }
          else if (left <= 0) { lock = true; say(msg, "Дозы кончились — сброс", "bad"); c.sfx("bad"); c.shake(vEl); c.after(700, function () { v = st; left = mv; lock = false; show(); say(msg, " "); }); }
        };
        box.appendChild(b);
      });
      show();
    }
    rs.onclick = function () { if (lock || !c.alive()) return; v = st; left = mv; show(); c.sfx("tick"); };
    newRound();
    if (window.__MM3_TEST) window.__MM3_TEST[4] = function () { return { v: v, left: left, ops: ops, btns: box.children }; };
  }

  /* 5 — Поймай волну: настрой амплитуду и частоту под плавающий сигнал */
  function g5(c, root) {
    var st = 0, A = 50, F = 25, dA = 0, dF = 0, hold = 0, lock = false, tt = 0;
    root.innerHTML = '<div class="mm2-col mm3-wave"><div class="mm2-hint">Подгони свою волну 🟦 под образец 🟧 и подержи</div>' +
      '<canvas class="mm3-cv" width="340" height="150"></canvas>' +
      '<div class="mm3-sl"><label><span>Высота</span><input type="range" id="mm3-a" min="10" max="100" value="30"></label><label><span>Частота</span><input type="range" id="mm3-f" min="10" max="50" value="14"></label></div>' +
      '<div class="mm3-bar"><i id="mm3-h"></i></div><div class="mm2-msg" id="mm2-msg"></div></div>';
    var cv = root.querySelector("canvas"), g = cv.getContext("2d"), sa = root.querySelector("#mm3-a"), sf = root.querySelector("#mm3-f"), hb = root.querySelector("#mm3-h"), msg = root.querySelector("#mm2-msg");
    function nt() {
      var a0 = +sa.value, f0 = +sf.value;
      do { A = Math.round(rnd(30, 88)); F = Math.round(rnd(16, 44)); } while (Math.abs(A - a0) < 26 || Math.abs(F - f0) < 14);
      dA = 0; dF = 0;
      if (st === 0) { F = f0; } else if (st === 1) { A = a0; }
      sa.disabled = st === 1; sf.disabled = st === 0; sa.parentNode.classList.toggle("off", st === 1); sf.parentNode.classList.toggle("off", st === 0);
    }
    nt(); say(msg, "Подгони высоту волны");
    if (window.__MM3_TEST) window.__MM3_TEST[5] = function () { return { ta: A + dA * Math.sin(tt * 1.3), tf: F + dF * Math.sin(tt * .9 + 1), sa: sa, sf: sf }; };
    c.loop(function (dt) {
      tt += dt;
      var ta = A + dA * Math.sin(tt * 1.3), tf = F + dF * Math.sin(tt * .9 + 1), a = +sa.value, f = +sf.value;
      var ok = Math.abs(a - ta) <= 9 && Math.abs(f - tf) <= 4.5;
      g.clearRect(0, 0, 340, 150); g.fillStyle = "#0b1530"; g.fillRect(0, 0, 340, 150);
      g.strokeStyle = "rgba(120,160,255,.12)"; g.lineWidth = 1; for (var q = 0; q < 340; q += 34) { g.beginPath(); g.moveTo(q, 0); g.lineTo(q, 150); g.stroke(); } for (q = 0; q < 150; q += 30) { g.beginPath(); g.moveTo(0, q); g.lineTo(340, q); g.stroke(); }
      function wave(amp, fr, col, w, dash) {
        g.strokeStyle = col; g.lineWidth = w; g.setLineDash(dash || []); g.beginPath();
        for (var x = 0; x <= 340; x += 3) { var y = 75 + (amp / 100) * 60 * Math.sin((x / 340) * Math.PI * 2 * (fr / 10) + tt * 3); x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke(); g.setLineDash([]);
      }
      wave(ta, tf, "#fb923c", 3, [7, 6]);
      if (ok) { wave(a, f, "rgba(74,222,128,.35)", 9); wave(a, f, "#4ade80", 3.4); } else wave(a, f, "#38bdf8", 3.4);
      if (!lock) {
        hold = ok ? hold + dt : Math.max(0, hold - dt * 1.6);
        hb.style.width = Math.min(100, hold / 1 * 100) + "%"; hb.className = ok ? "ok" : "";
        if (hold >= 1) { lock = true; st++; hold = 0; c.sfx("good"); say(msg, "Сигнал пойман!", "ok"); c.add(1); c.after(700, function () { if (c.score() < c.target) { nt(); lock = false; hb.style.width = "0"; say(msg, st === 1 ? "Теперь подгони частоту" : "Теперь двигай оба ползунка"); } }); }
      }
    });
  }

  /* 6 — Маршрут ровера: проложи путь через все маяки с ограниченным зарядом */
  function g6(c, root) {
    var N = 5, T = [], S, D, B = [], budget = 0, path = [], used = 0, over = false, cells = [], i, j;
    function idx(x, y) { return y * N + x; }
    function cost(k) { return T[k] === 1 ? 2 : 1; }
    function nb(k) { var x = k % N, y = (k / N) | 0, o = []; if (x > 0) o.push(k - 1); if (x < N - 1) o.push(k + 1); if (y > 0) o.push(k - N); if (y < N - 1) o.push(k + N); return o; }
    function dij(a) { var d = []; for (i = 0; i < N * N; i++) d.push(1e9); d[a] = 0; var q = [a]; while (q.length) { q.sort(function (p, s) { return d[p] - d[s]; }); var u = q.shift(); nb(u).forEach(function (w) { if (T[w] === 2) return; var nd = d[u] + cost(w); if (nd < d[w]) { d[w] = nd; q.push(w); } }); } return d; }
    function perms(a) { if (a.length < 2) return [a]; var o = []; a.forEach(function (x, k) { perms(a.slice(0, k).concat(a.slice(k + 1))).forEach(function (p) { o.push([x].concat(p)); }); }); return o; }
    function gen() {
      var tr = 0, bad = false;
      do {
        T = []; for (i = 0; i < N * N; i++) { var q = Math.random(); T.push(q < .18 ? 2 : 0); }
        S = idx(0, Math.floor(Math.random() * N)); D = idx(N - 1, Math.floor(Math.random() * N)); T[S] = 0; T[D] = 0;
        var fr = []; for (i = 0; i < N * N; i++) if (T[i] !== 2 && i !== S && i !== D && (i % N) > 0 && (i % N) < N - 1) fr.push(i);
        B = shuffle(fr).slice(0, 2); B.forEach(function (b) { T[b] = 0; });
        var dm = {}; [S].concat(B).forEach(function (a) { dm[a] = dij(a); });
        bad = false; var best = 1e9; B.forEach(function (b) { if (dm[S][b] >= 1e9) bad = true; });
        if (!bad) perms(B).forEach(function (p) { var s = dm[S][p[0]] + dm[p[0]][p[1]], dd = dij(p[1])[D]; if (dd >= 1e9) { bad = true; return; } s += dd; if (s < best) best = s; });
        tr++; budget = best + 4;
        if (!bad && best >= 6 && best <= 11) break;
      } while (tr < 400);
      if (bad) { T = []; for (i = 0; i < N * N; i++) T.push(0); budget = 40; }
    }
    gen();
    root.innerHTML = '<div class="mm2-col mm3-route"><div class="mm2-hint">Проведи 🚜 через оба 💎 и приезжай на 🔋. Жми на соседние клетки</div><div class="mm3-gridw"><div class="mm3-rg"></div></div>' +
      '<div class="mm3-info"><div class="mm3-batt"><i id="mm3-b"></i></div><span id="mm3-bt"></span><button type="button" class="mm3-mini" id="mm3-un">↶ Назад</button><button type="button" class="mm3-mini" id="mm3-rs">↺ Сброс</button></div><div class="mm2-msg" id="mm2-msg"></div></div>';
    var gr = root.querySelector(".mm3-rg"), bt = root.querySelector("#mm3-bt"), bb = root.querySelector("#mm3-b"), msg = root.querySelector("#mm2-msg"), rs = root.querySelector("#mm3-rs"), un = root.querySelector("#mm3-un");
    for (i = 0; i < N * N; i++) { var b = el("button", "mm3-rc"); b.type = "button"; b.dataset.i = i; gr.appendChild(b); cells.push(b); }
    function got() { return B.filter(function (b) { return path.indexOf(b) >= 0; }).length; }
    function draw() {
      cells.forEach(function (b, k) {
        var t = T[k], h = "", cls = "mm3-rc";
        if (t === 2) { cls += " rock"; h = "🪨"; } else if (t === 1) { cls += " sand"; h = "<small>2</small>"; }
        if (k === S) h = "🏁"; if (k === D) { cls += " dock"; h = "🔋"; }
        if (B.indexOf(k) >= 0) { h = path.indexOf(k) >= 0 ? "✅" : "💎"; }
        if (path.indexOf(k) >= 0) cls += " on";
        if (k === path[path.length - 1]) { cls += " cur"; h = "🚜"; }
        b.className = cls; b.innerHTML = h;
      });
      var left = budget - used; bt.textContent = "Заряд: " + left + " · маяки: " + got() + "/2";
      bb.style.width = Math.max(0, left / budget * 100) + "%"; bb.className = left <= 3 ? "low" : "";
    }
    function reset() { path = [S]; used = 0; draw(); }
    gr.addEventListener("click", function (e) {
      var b = e.target.closest(".mm3-rc"); if (!b || over || !c.alive()) return; var k = +b.dataset.i, last = path[path.length - 1];
      if (nb(last).indexOf(k) < 0 || T[k] === 2) { c.sfx("bad"); c.shake(b); return; }
      if (used + cost(k) > budget) { say(msg, "Не хватит заряда — вернись назад", "bad"); c.sfx("bad"); c.shake(b); return; }
      path.push(k); used += cost(k); c.sfx("tick"); say(msg, " "); draw();
      if (k === D && got() === 2) { over = true; say(msg, "Ровер на базе!", "ok"); c.add(1); }
    });
    rs.onclick = function () { if (over || !c.alive()) return; reset(); c.sfx("tick"); };
    un.onclick = function () { if (over || !c.alive() || path.length < 2) return; used -= cost(path[path.length - 1]); path.pop(); c.sfx("tick"); say(msg, " "); draw(); };
    reset();
    if (window.__MM3_TEST) window.__MM3_TEST[6] = function () { return { T: T, S: S, D: D, B: B, budget: budget, N: N, cells: cells }; };
  }

  /* 8 — Залатай обшивку: уложи заплатки-полимино на пробоины */
  function g8(c, root) {
    var N = 4, DIR = [[1, 0], [-1, 0], [0, 1], [0, -1]], COLS = ["#38bdf8", "#4ade80", "#fb923c", "#c084fc", "#facc15"], pieces = [], breach = {}, cover = [], sel = -1, hov = -1, over = false, cells = [], i, k;
    function norm(a) { var mx = Math.min.apply(null, a.map(function (p) { return p[0]; })), my = Math.min.apply(null, a.map(function (p) { return p[1]; })); return a.map(function (p) { return [p[0] - mx, p[1] - my]; }).sort(function (p, q) { return p[1] - q[1] || p[0] - q[0]; }); }
    function rot(a) { return norm(a.map(function (p) { return [p[1], -p[0]]; })); }
    function has(a, x, y) { return a.some(function (p) { return p[0] === x && p[1] === y; }); }
    function grow(size, occ) {
      var s = [], tries = 0, free = []; for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) if (!occ[y * N + x]) free.push([x, y]);
      if (!free.length) return null; s.push(pickOne(free));
      while (s.length < size) {
        var cand = []; s.forEach(function (p) { DIR.forEach(function (d) { var x = p[0] + d[0], y = p[1] + d[1]; if (x >= 0 && y >= 0 && x < N && y < N && !occ[y * N + x] && !has(s, x, y) && !has(cand, x, y)) cand.push([x, y]); }); });
        if (!cand.length) return null; s.push(pickOne(cand));
      }
      return s;
    }
    function gen() {
      var ok, tr = 0;
      do {
        ok = true; pieces = []; breach = {}; var occ = {}, sizes = [3, 3];
        for (i = 0; i < 2 && ok; i++) { var s = grow(sizes[i], occ); if (!s) { ok = false; break; } s.forEach(function (p) { occ[p[1] * N + p[0]] = 1; breach[p[1] * N + p[0]] = 1; }); var n = norm(s), rr = 0; while (rr--) n = rot(n); pieces.push({ cells: n, used: false, col: COLS[i] }); }
        tr++;
      } while (!ok && tr < 300);
      pieces = shuffle(pieces);
    }
    gen();
    for (i = 0; i < N * N; i++) cover.push(-1);
    root.innerHTML = '<div class="mm2-col mm3-patch"><div class="mm2-hint">1. Выбери заплатку внизу  2. Нажми на красную дырку: заплатка сама повернётся и ляжет</div><div class="mm3-pg"></div><div class="mm3-tray"></div><div class="mm3-info"><button type="button" class="mm3-mini" id="mm3-rt">⟳ Повернуть</button></div><div class="mm2-msg" id="mm2-msg"></div></div>';
    var gr = root.querySelector(".mm3-pg"), tray = root.querySelector(".mm3-tray"), msg = root.querySelector("#mm2-msg");
    for (i = 0; i < N * N; i++) { var b = el("button", "mm3-pc"); b.type = "button"; b.dataset.i = i; gr.appendChild(b); cells.push(b); }
    function place(pi, ax, ay) { var p = pieces[pi].cells, t = []; for (k = 0; k < p.length; k++) { var x = ax + p[k][0], y = ay + p[k][1]; if (x < 0 || y < 0 || x >= N || y >= N) return null; t.push(y * N + x); } return t; }
    function fit(pi, q) {
      var base = pieces[pi].cells, cur = base, r, j, t;
      for (r = 0; r < 4; r++) {
        for (j = 0; j < cur.length; j++) {
          var ax = (q % N) - cur[j][0], ay = ((q / N) | 0) - cur[j][1]; t = [];
          for (k = 0; k < cur.length; k++) { var x = ax + cur[k][0], y = ay + cur[k][1]; if (x < 0 || y < 0 || x >= N || y >= N) { t = null; break; } t.push(y * N + x); }
          if (t && t.every(function (z) { return breach[z] && cover[z] < 0; })) { pieces[pi].cells = cur; return t; }
        }
        cur = rot(cur);
      }
      return null;
    }
    function okPlace(t) { return t && t.every(function (q) { return breach[q] && cover[q] < 0; }); }
    function drawTray() {
      tray.innerHTML = "";
      pieces.forEach(function (p, pi) {
        var w = Math.max.apply(null, p.cells.map(function (q) { return q[0]; })) + 1, h = Math.max.apply(null, p.cells.map(function (q) { return q[1]; })) + 1;
        var b = el("button", "mm3-tp" + (pi === sel ? " sel" : "") + (p.used ? " used" : "")); b.type = "button";
        var gg = el("div", "mm3-mini-g"); gg.style.gridTemplateColumns = "repeat(" + w + ",22px)"; gg.style.gridTemplateRows = "repeat(" + h + ",22px)";
        p.cells.forEach(function (q) { var d = el("i"); d.style.gridColumn = q[0] + 1; d.style.gridRow = q[1] + 1; d.style.background = p.col; gg.appendChild(d); });
        b.appendChild(gg);
        b.onclick = function () {
          if (over || !c.alive()) return;
          if (p.used) { for (k = 0; k < cover.length; k++) if (cover[k] === pi) cover[k] = -1; p.used = false; }
          sel = pi; c.sfx("tick"); draw();
        };
        tray.appendChild(b);
      });
    }
    function draw() {
      var pv = null, pvOk = false;
      if (sel >= 0 && hov >= 0 && !pieces[sel].used) { var t = fit(sel, hov); pv = t || place(sel, hov % N, (hov / N) | 0); pvOk = !!t; }
      var left = 0;
      cells.forEach(function (b, q) {
        var cls = "mm3-pc", st = "";
        if (breach[q]) { cls += " br"; left++; }
        if (cover[q] >= 0) { cls += " cv"; st = pieces[cover[q]].col; left--; }
        if (pv && pv.indexOf(q) >= 0) cls += pvOk ? " pv" : " pvx";
        b.className = cls; b.style.background = st || ""; b.textContent = breach[q] && cover[q] < 0 ? "" : "";
      });
      drawTray();
      return left;
    }
    function fin() { var l = 0; for (i = 0; i < N * N; i++) if (breach[i] && cover[i] < 0) l++; return l; }
    gr.addEventListener("pointerover", function (e) { var b = e.target.closest(".mm3-pc"); if (!b) return; hov = +b.dataset.i; draw(); });
    gr.addEventListener("pointerleave", function () { hov = -1; draw(); });
    gr.addEventListener("click", function (e) {
      var b = e.target.closest(".mm3-pc"); if (!b || over || !c.alive()) return; var q = +b.dataset.i; hov = q;
      if (sel < 0 || pieces[sel].used) {
        if (cover[q] >= 0) { var pi = cover[q]; for (k = 0; k < cover.length; k++) if (cover[k] === pi) cover[k] = -1; pieces[pi].used = false; sel = pi; c.sfx("tick"); draw(); }
        return;
      }
      var t = fit(sel, q);
      if (!t) { c.sfx("bad"); c.shake(b); say(msg, "Сюда не подходит", "bad"); return; }
      t.forEach(function (z) { cover[z] = sel; }); pieces[sel].used = true; sel = -1; c.sfx("good"); say(msg, " "); draw();
      if (fin() === 0) { over = true; say(msg, "Обшивка герметична!", "ok"); c.add(1); }
    });
    function turn() { if (sel < 0 || over || !c.alive() || pieces[sel].used) return; pieces[sel].cells = rot(pieces[sel].cells); c.sfx("tick"); draw(); }
    root.querySelector("#mm3-rt").onclick = turn;
    gr.addEventListener("contextmenu", function (e) { e.preventDefault(); turn(); });
    c.on(window, "keydown", function (e) { if (key(e) === "KeyR") turn(); });
    sel = pieces.findIndex(function (p) { return !p.decoy; }); draw();
    if (window.__MM3_TEST) window.__MM3_TEST[8] = function () { return { pieces: pieces, breach: breach, N: N, cells: cells, sel: function (q) { sel = q; draw(); }, rot: rot }; };
  }

  /* 9 — Полив по трубам: управление водой между тремя грядками */
  function g9(c, root) {
    var M = [55, 50, 60], BASE = [2.2, 3, 3.8], open = [false, false, false], order = [], heat = [0, 0, 0], tt = 0, okT = 0, nextHeat = 1e9, dead = false, beds = [], i;
    root.innerHTML = '<div class="mm2-col mm3-water"><div class="mm2-hint">Нажимай на грядки: польётся вода 💧. Держи воду в зелёной зоне. Открыть можно только 2 крана</div><div class="mm3-beds"></div><div class="mm2-msg" id="mm2-msg"></div></div>';
    var box = root.querySelector(".mm3-beds"), msg = root.querySelector("#mm2-msg");
    for (i = 0; i < 3; i++) {
      var w = el("button", "mm3-bed"); w.type = "button"; w.dataset.i = i;
      w.innerHTML = '<span class="mm3-heatb">🔥</span><div class="mm3-tube"><i class="mm3-zone"></i><b class="mm3-lv"></b></div><span class="mm3-plant">🌱</span><span class="mm3-valve">🚰</span>';
      box.appendChild(w); beds.push(w);
    }
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".mm3-bed"); if (!b || dead || !c.alive()) return; var k = +b.dataset.i;
      if (open[k]) { open[k] = false; order = order.filter(function (q) { return q !== k; }); }
      else { open[k] = true; order.push(k); if (order.length > 2) { var o = order.shift(); open[o] = false; } }
      c.sfx("tick");
    });
    c.loop(function (dt) {
      tt += dt; var ph = tt > 12 ? 1.25 : 1;
      nextHeat -= dt; if (nextHeat <= 0) { heat[Math.floor(Math.random() * 3)] = 4; nextHeat = 6.5; }
      var all = true;
      for (i = 0; i < 3; i++) {
        if (heat[i] > 0) heat[i] -= dt;
        var dr = BASE[i] * ph * (heat[i] > 0 ? 1.8 : 1);
        M[i] += (open[i] ? 17 : 0) * dt - dr * dt; M[i] = Math.max(0, Math.min(100, M[i]));
        var b = beds[i], lv = b.querySelector(".mm3-lv");
        lv.style.height = M[i] + "%"; var good = M[i] >= 20 && M[i] <= 80; if (!good) all = false;
        b.classList.toggle("op", open[i]); b.classList.toggle("hot", heat[i] > 0); b.classList.toggle("okb", good); b.classList.toggle("warn", !good);
        b.querySelector(".mm3-plant").textContent = M[i] < 12 || M[i] > 90 ? "🥀" : good ? "🌱" : "🌿";
        if ((M[i] <= 0 || M[i] >= 100) && !dead) { dead = true; say(msg, M[i] <= 0 ? "Грядка засохла" : "Грядку залило", "bad"); c.sfx("bad"); c.fail(700); }
      }
      if (!dead) { if (all) okT += dt; if (Math.floor(okT) !== c.score()) c.set(Math.floor(okT)); say(msg, all ? "Влажность в норме" : "Срочно поправь влажность!", all ? "ok" : "bad"); }
    });
  }

  /* 10 — Грядки по схеме: запомни расстановку и воспроизведи по памяти */
  function g10(c, root) {
    var R = [{ n: 3, k: 3, f: 4, show: 5, sz: 76 }, { n: 3, k: 4, f: 5, show: 5, sz: 76 }], r = 0, pat = [], cur = [], tool = 0, phase = 0, lock = false, cells = [], types = [], pal = [], i;
    root.innerHTML = '<div class="mm2-col mm3-mem"><div class="mm2-hint" id="mm3-h">Запомни схему</div><div class="mm3-bar mm3-cd"><i id="mm3-cd"></i></div><div class="mm3-mg"></div><div class="mm3-pal"></div><div class="mm2-msg" id="mm2-msg"></div></div>';
    var hint = root.querySelector("#mm3-h"), cd = root.querySelector("#mm3-cd"), grid = root.querySelector(".mm3-mg"), palB = root.querySelector(".mm3-pal"), msg = root.querySelector("#mm2-msg");
    function paint(a, wrong) {
      cells.forEach(function (b, k) { b.innerHTML = a[k] ? '<svg viewBox="0 0 40 40" aria-hidden="true">' + sym(types[a[k] - 1], 40).replace(/<svg[^>]*>|<\/svg>/g, "") + '</svg>' : ""; b.classList.toggle("bad", !!(wrong && wrong[k])); });
    }
    function start() {
      var cfg = R[r], NN = cfg.n * cfg.n; phase = 0; lock = false; types = shuffle([0, 1, 2, 3, 4, 5]).slice(0, cfg.k);
      pat = []; for (i = 0; i < NN; i++) pat.push(0);
      shuffle(Array.apply(null, Array(NN)).map(function (_, q) { return q; })).slice(0, cfg.f).forEach(function (q, z) { pat[q] = (z % cfg.k) + 1; });
      cur = []; for (i = 0; i < NN; i++) cur.push(0);
      grid.innerHTML = ""; grid.style.gridTemplateColumns = "repeat(" + cfg.n + "," + cfg.sz + "px)"; cells = [];
      for (i = 0; i < NN; i++) { var b = el("button", "mm3-mc"); b.type = "button"; b.dataset.i = i; b.style.width = b.style.height = cfg.sz + "px"; grid.appendChild(b); cells.push(b); }
      palB.innerHTML = ""; palB.style.visibility = "hidden";
      pal = []; types.forEach(function (t, z) { var p = el("button", "mm3-pb", sym(t, 34)); p.type = "button"; p.dataset.v = z + 1; palB.appendChild(p); pal.push(p); });
      var er = el("button", "mm3-pb er", "✖"); er.type = "button"; er.dataset.v = 0; palB.appendChild(er); pal.push(er);
      tool = 1; selTool(); paint(pat); hint.textContent = "Запомни схему!"; say(msg, " ");
      var t0 = performance.now(); cd.style.width = "100%";
      (function tick() { if (!c.alive() || phase !== 0) return; var p = 1 - (performance.now() - t0) / (cfg.show * 1000); cd.style.width = Math.max(0, p * 100) + "%"; if (p <= 0) { phase = 1; paint(cur); palB.style.visibility = "visible"; hint.textContent = "Повтори расстановку по памяти"; cd.style.width = "0"; } else if (live) live.raf = requestAnimationFrame(tick); })();
    }
    function selTool() { pal.forEach(function (p) { p.classList.toggle("sel", +p.dataset.v === tool); }); }
    palB.addEventListener("click", function (e) { var b = e.target.closest(".mm3-pb"); if (!b || phase !== 1) return; tool = +b.dataset.v; selTool(); c.sfx("tick"); });
    grid.addEventListener("click", function (e) {
      var b = e.target.closest(".mm3-mc"); if (!b || phase !== 1 || lock || !c.alive()) return; var k = +b.dataset.i;
      cur[k] = cur[k] === tool ? 0 : tool; c.sfx("tick"); paint(cur);
      var n = cur.filter(function (v) { return v; }).length, need = pat.filter(function (v) { return v; }).length;
      if (n === need) {
        var wr = {}, bad = 0; for (i = 0; i < cur.length; i++) if (cur[i] !== pat[i]) { wr[i] = 1; bad++; }
        if (!bad) { lock = true; phase = 2; c.sfx("good"); say(msg, "Схема верна!", "ok"); c.add(1); r++; c.after(900, function () { if (c.score() < c.target) start(); }); }
        else { paint(cur, wr); say(msg, "Ошибок: " + bad, "bad"); c.sfx("bad"); }
      } else say(msg, " ");
    });
    start();
    if (window.__MM3_TEST) window.__MM3_TEST[10] = function () { return { pat: pat, types: types, phase: phase, cells: cells, pal: pal }; };
  }

  /* 11 — Ритм сердца: удерживай курсор на бьющемся сердце */
  function g11(c, root) {
    var W = 340, H = 220, mx = -99, my = -99, tt = 0, inT = 0, sp = 1;
    root.innerHTML = '<div class="mm2-col mm3-track"><div class="mm2-hint">Води курсор (палец) за сердцем ❤. Чем дольше ты в кольце — тем лучше</div><canvas class="mm3-cv mm3-tcv" width="340" height="220"></canvas><div class="mm2-msg" id="mm2-msg"></div></div>';
    var cv = root.querySelector("canvas"), g = cv.getContext("2d"), msg = root.querySelector("#mm2-msg");
    function pos(e) { var r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) * W / r.width; my = (e.clientY - r.top) * H / r.height; }
    cv.addEventListener("pointermove", pos); cv.addEventListener("pointerdown", function (e) { pos(e); });
    cv.addEventListener("pointerleave", function () { mx = -99; my = -99; });
    if (window.__MM3_TEST) window.__MM3_TEST[11] = function () { return { pt: function () { var x = W / 2 + 100 * Math.sin(tt * .65) + 26 * Math.sin(tt * 1.5 + 1), y = H / 2 + 56 * Math.sin(tt * .9 + .6) + 14 * Math.sin(tt * 2); return [x, y]; }, set: function (a, b) { mx = a; my = b; } }; };
    c.loop(function (dt) {
      sp = 1 + tt * .02; tt += dt * sp;
      var x = W / 2 + 100 * Math.sin(tt * .65) + 26 * Math.sin(tt * 1.5 + 1), y = H / 2 + 56 * Math.sin(tt * .9 + .6) + 14 * Math.sin(tt * 2);
      var R = Math.max(36, 56 - tt * 1), d = Math.hypot(mx - x, my - y), ok = d < R;
      if (ok) inT += dt;
      g.clearRect(0, 0, W, H); var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#1b1030"); bg.addColorStop(1, "#0b1530"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(255,120,150,.10)"; g.lineWidth = 1; for (var q = 0; q < W; q += 34) { g.beginPath(); g.moveTo(q, 0); g.lineTo(q, H); g.stroke(); } for (q = 0; q < H; q += 34) { g.beginPath(); g.moveTo(0, q); g.lineTo(W, q); g.stroke(); }
      var pul = 1 + .12 * Math.max(0, Math.sin(tt * 6.5)) ** 3;
      g.strokeStyle = ok ? "#4ade80" : "#fb7185"; g.lineWidth = 4; g.shadowColor = ok ? "#4ade80" : "#fb7185"; g.shadowBlur = ok ? 18 : 8; g.beginPath(); g.arc(x, y, R * pul, 0, 7); g.stroke(); g.shadowBlur = 0;
      var hs = R * .52 * pul; g.fillStyle = ok ? "#4ade80" : "#ef4444"; g.beginPath(); g.moveTo(x, y + hs * .9); g.bezierCurveTo(x - hs * 1.6, y - hs * .1, x - hs * .9, y - hs * 1.3, x, y - hs * .4); g.bezierCurveTo(x + hs * .9, y - hs * 1.3, x + hs * 1.6, y - hs * .1, x, y + hs * .9); g.fill(); g.strokeStyle = "#231815"; g.lineWidth = 2.5; g.stroke();
      if (mx > -90) { g.fillStyle = ok ? "#bbf7d0" : "#fff"; g.strokeStyle = "#231815"; g.lineWidth = 2; g.beginPath(); g.arc(mx, my, 7, 0, 7); g.fill(); g.stroke(); }
      if (Math.floor(inT) !== c.score()) c.set(Math.floor(inT)); say(msg, mx < -90 ? "Наведи курсор на сердце" : ok ? "В ритме!" : "Потерял ритм", ok ? "ok" : "bad");
    });
  }

  /* 13 — Реактор: соедини одноимённые разъёмы кабелями, не пересекая их */
  function g13(c, root) {
    var N = 4, COL = ["#ef4444", "#3b82f6", "#22c55e"], paths = [[], [], []], term = [], draw = -1, done = false, cells = [], i, j;
    function nb(k) { var x = k % N, y = (k / N) | 0, o = []; if (x > 0) o.push(k - 1); if (x < N - 1) o.push(k + 1); if (y > 0) o.push(k - N); if (y < N - 1) o.push(k + N); return o; }
    (function gen() {
      var tr = 0, ok;
      do {
        ok = true; term = []; var occ = {};
        for (i = 0; i < 3 && ok; i++) {
          var len = 3 + Math.floor(Math.random() * 2), free = []; for (j = 0; j < N * N; j++) if (!occ[j]) free.push(j);
          if (!free.length) { ok = false; break; } var p = [pickOne(free)];
          while (p.length < len) { var cand = nb(p[p.length - 1]).filter(function (q) { return !occ[q] && p.indexOf(q) < 0; }); if (!cand.length) break; p.push(pickOne(cand)); }
          if (p.length < 3 || nb(p[0]).indexOf(p[p.length - 1]) >= 0) { ok = false; break; }
          p.forEach(function (q) { occ[q] = 1; }); term.push([p[0], p[p.length - 1]]);
        }
        tr++;
      } while (!ok && tr < 500);
    })();
    root.innerHTML = '<div class="mm2-col mm3-flow"><div class="mm2-hint">Проведи пальцем от цветной точки до такой же. Линии не должны пересекаться</div><div class="mm3-fg"></div><div class="mm2-msg" id="mm2-msg"></div></div>';
    var gr = root.querySelector(".mm3-fg"), msg = root.querySelector("#mm2-msg");
    for (i = 0; i < N * N; i++) { var b = el("button", "mm3-fc"); b.type = "button"; b.dataset.i = i; gr.appendChild(b); cells.push(b); }
    function termOf(k) { for (var p = 0; p < 3; p++) if (term[p][0] === k || term[p][1] === k) return p; return -1; }
    function conn(p) { var a = paths[p]; return a.length > 1 && termOf(a[0]) === p && termOf(a[a.length - 1]) === p && a[0] !== a[a.length - 1]; }
    function render() {
      var n = 0;
      cells.forEach(function (b, k) {
        var o = -1, p; for (p = 0; p < 3; p++) if (paths[p].indexOf(k) >= 0) o = p;
        var t = termOf(k); b.className = "mm3-fc" + (o >= 0 ? " on" : "") + (t >= 0 ? " tm" : ""); b.style.setProperty("--fc", o >= 0 ? COL[o] : "transparent");
        b.innerHTML = t >= 0 ? '<i style="background:' + COL[t] + '"></i>' : "";
      });
      for (var p = 0; p < 3; p++) if (conn(p)) n++;
      say(msg, "Подключено: " + n + " из 3", n === 3 ? "ok" : "");
      return n === 3;
    }
    function fin() { if (render() && !done) { done = true; draw = -1; c.sfx("good"); c.add(1); } }
    gr.addEventListener("pointerdown", function (e) {
      if (done || !c.alive()) return; var b = e.target.closest(".mm3-fc"); if (!b) return; e.preventDefault(); var k = +b.dataset.i, t = termOf(k);
      if (t >= 0) { paths[t] = [k]; draw = t; c.sfx("tick"); render(); return; }
      for (var p = 0; p < 3; p++) { var a = paths[p]; if (a.length && a[a.length - 1] === k && !conn(p)) { draw = p; return; } }
    });
    c.on(window, "pointermove", function (e) {
      if (draw < 0 || done) return; var elx = document.elementFromPoint(e.clientX, e.clientY), b = elx && elx.closest && elx.closest(".mm3-fc"); if (!b || !gr.contains(b)) return;
      var k = +b.dataset.i, a = paths[draw], last = a[a.length - 1]; if (k === last || nb(last).indexOf(k) < 0) return;
      if (a.length > 1 && k === a[a.length - 2]) { a.pop(); render(); return; }
      if (a.indexOf(k) >= 0) return;
      var t = termOf(k); if (t >= 0 && t !== draw) return;
      if (t === draw) { a.push(k); draw = -1; c.sfx("good"); fin(); return; }
      for (var q = 0; q < 3; q++) if (q !== draw) { var ix = paths[q].indexOf(k); if (ix >= 0) paths[q] = paths[q].slice(0, ix); }
      a.push(k); c.sfx("tick"); render();
    });
    c.on(window, "pointerup", function () { draw = -1; });
    render();
    if (window.__MM3_TEST) window.__MM3_TEST[13] = function () { return { term: term, cells: cells, N: N }; };
  }

  /* 15 — Люк шлюза: найди три числа кода по сигналу «холодно–горячо» */
  function g15(c, root) {
    var MAXV = 60, cur = 30, sec = [], step = 0, miss = 0, MISS = 6, over = false, lock = false;
    function cd(a, b) { var d = Math.abs(a - b); return Math.min(d, MAXV - d); }
    function newSecret() { var s; do { s = Math.floor(Math.random() * MAXV); } while (cd(s, cur) < 12); return s; }
    function lvl(d) { return d <= 2 ? 5 : d <= 5 ? 4 : d <= 9 ? 3 : d <= 15 ? 2 : d <= 22 ? 1 : 0; }
    root.innerHTML = '<div class="mm2-col mm3-safe"><div class="mm2-hint">Крути диск, пока не станет «горячо». Потом жми «Зафиксировать»</div>' +
      '<div class="mm3-code"><i></i><i></i></div><div class="mm3-dial"><div class="mm3-knob" id="mm3-k"><span></span></div><b id="mm3-n">30</b></div>' +
      '<div class="mm3-sig"><i></i><i></i><i></i><i></i><i></i></div><div class="mm3-hot" id="mm3-hot"></div>' +
      '<input type="range" id="mm3-r" min="0" max="59" value="30" class="mm3-rg2">' +
      '<div class="mm3-bts"><button type="button" class="mm3-mini" data-d="-5">−5</button><button type="button" class="mm3-mini" data-d="-1">−1</button><button type="button" class="mm3-mini" data-d="1">+1</button><button type="button" class="mm3-mini" data-d="5">+5</button></div>' +
      '<button type="button" class="mm2-btn up" id="mm3-ok">Зафиксировать</button><div class="mm3-info"><span id="mm3-ms"></span></div><div class="mm2-msg" id="mm2-msg"></div></div>';
    var rg = root.querySelector("#mm3-r"), nEl = root.querySelector("#mm3-n"), kn = root.querySelector("#mm3-k"), sig = root.querySelectorAll(".mm3-sig i"), cdots = root.querySelectorAll(".mm3-code i"), ms = root.querySelector("#mm3-ms"), hot = root.querySelector("#mm3-hot"), msg = root.querySelector("#mm2-msg");
    sec = [newSecret()];
    function upd() {
      nEl.textContent = cur; kn.style.transform = "rotate(" + (cur / MAXV * 360) + "deg)"; rg.value = cur;
      var L = lvl(cd(cur, sec[step])); sig.forEach(function (s, k) { s.className = k < L ? (k >= 4 ? "on top" : "on") : ""; });
      ms.textContent = "Ошибок: " + miss + " / " + MISS; hot.textContent = ["❄️ Очень холодно","🥶 Холодно","😐 Тепло","🙂 Горячо","🔥 Очень горячо","🎯 Жми «Зафиксировать»!"][L];
    }
    function setV(v) { if (over || lock || !c.alive()) return; cur = ((Math.round(v) % MAXV) + MAXV) % MAXV; c.sfx("tick"); upd(); }
    rg.addEventListener("input", function () { setV(+rg.value); });
    root.querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { setV(cur + +b.dataset.d); }; });
    c.on(window, "keydown", function (e) { if (e.code === "ArrowLeft") { e.preventDefault(); setV(cur - 1); } else if (e.code === "ArrowRight") { e.preventDefault(); setV(cur + 1); } else if (e.code === "Enter") { e.preventDefault(); ok(); } });
    function ok() {
      if (over || lock || !c.alive()) return;
      if (cd(cur, sec[step]) <= 2) {
        cdots[step].className = "on"; c.sfx("good"); c.add(1); step++; say(msg, "Число принято!", "ok");
        if (step < 2) { lock = true; c.after(700, function () { sec.push(newSecret()); lock = false; say(msg, " "); upd(); }); } else { over = true; say(msg, "Люк открыт!", "ok"); }
      } else { miss++; c.sfx("bad"); c.shake(kn); say(msg, "Не то число", "bad"); upd(); if (miss >= MISS) { over = true; say(msg, "Замок заблокирован", "bad"); c.fail(900); } }
    }
    root.querySelector("#mm3-ok").onclick = ok;
    upd();
    if (window.__MM3_TEST) window.__MM3_TEST[15] = function () { return { sec: sec, step: step, set: setV, ok: ok }; };
  }

  /* ===== v12b: анимированные обучалки с картинками ===== */
  function cap(a, b, c) {
    return '<div class="dm-cap"><b class="v1"><i>1</i><span>' + a + '</span></b><b class="v2"><i>2</i><span>' + b + '</span></b><b class="v3"><i>3</i><span>' + c + '</span></b></div>';
  }
  function fg(x0, y0, x1, y1) { return '<div class="dm-fg" style="--x0:' + x0 + 'px;--y0:' + y0 + 'px;--x1:' + x1 + 'px;--y1:' + y1 + 'px">👆</div>'; }
  function dm(stage, caps) { return '<div class="dm"><div class="dm-st"><div class="dm-box">' + stage + '</div></div>' + cap(caps[0], caps[1], caps[2]) + '</div>'; }
  var WV = "M0 45 Q37 3 75 45 T150 45 T225 45 T300 45";
  var DEMOS = {
    4: function () {
      return dm('<div class="dm-num"><b class="v12">80</b><b class="v3 okc">70 ✅</b></div>' +
        '<div class="dm-row"><i class="dm-b hit">💉<em>−10</em></i><i class="dm-b">💊<em>−5</em></i><i class="dm-b">☕<em>+5</em></i></div>' + fg(110, 70, -88, 56),
        ["Смотри на пульс. Нужно, чтобы стало 70", "Нажми лекарство: −10", "Пульс 70 — пациент в порядке!"]);
    },
    5: function () {
      return dm('<svg class="dm-wv" viewBox="0 0 300 90"><path d="' + WV + '" fill="none" stroke="#fb923c" stroke-width="4" stroke-dasharray="8 6"/><g class="dm-amp"><path d="' + WV + '" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/></g><path class="v3" d="' + WV + '" fill="none" stroke="#4ade80" stroke-width="6" stroke-linecap="round"/></svg>' +
        '<div class="dm-sl"><u></u><s class="dm-knob"></s></div>' + fg(-60, 62, 60, 62),
        ["Оранжевая волна — образец", "Двигай ползунок, чтобы волны совпали", "Совпало — подержи секунду!"]);
    },
    6: function () {
      var g = "", i;
      for (i = 0; i < 15; i++) g += '<i class="dm-c"></i>';
      return dm('<div class="dm-grid g5">' + g + '<b class="dm-ic" style="--c:1;--r:1">🪨</b><b class="dm-ic gem" style="--c:3;--r:0">💎</b><b class="dm-ic" style="--c:4;--r:2">🔋</b><b class="dm-rov">🚜</b></div>',
        ["Вот твой ровер 🚜", "Жми соседние клетки: ровер едет и берёт 💎", "Привези его на зарядку 🔋!"]);
    },
    8: function () {
      var g = "", i;
      for (i = 0; i < 12; i++) g += '<i class="dm-c"></i>';
      return dm('<div class="dm-grid g4">' + g + '<b class="dm-hole" style="--c:1;--r:0"></b><b class="dm-hole" style="--c:2;--r:0"></b><b class="dm-hole" style="--c:2;--r:1"></b>' +
        '<div class="dm-patch"><b style="--c:1;--r:0"></b><b style="--c:2;--r:0"></b><b style="--c:2;--r:1"></b></div></div>' + fg(100, 70, 20, 4),
        ["В стене красная дырка", "Выбери заплатку и нажми на дырку", "Заплатка легла — дырка закрыта!"]);
    },
    9: function () {
      var t = "";
      [1, 2, 3].forEach(function (k) { t += '<div class="dm-tb"><u></u><s class="w' + k + '"></s><span>🌱</span></div>'; });
      return dm('<div class="dm-tubes">' + t + '</div>' + fg(-110, 70, -82, 36),
        ["Воды в грядке всё меньше", "Нажми на грядку — польётся вода 💧", "Держи воду в зелёной зоне"]);
    },
    10: function () {
      var ic = ["🌽", "", "🥕", "", "🍅", "", "", "🥕", ""], g = "";
      ic.forEach(function (x) { g += '<i class="dm-c m">' + (x ? '<em class="v13">' + x + '</em>' : "") + '<strong class="v2">' + (x ? "❓" : "") + '</strong></i>'; });
      return dm('<div class="dm-grid g3">' + g + '</div><div class="dm-eye v1">👀</div>' + fg(110, 70, -50, -30),
        ["Запомни, где что растёт", "Всё спрятали!", "Выбери растение и нажми на клетку"]);
    },
    11: function () {
      return dm('<div class="dm-screen"><div class="dm-orbit"><div class="dm-heart"><span class="dm-ring"></span>❤</div><div class="dm-fing">👆</div></div></div>',
        ["Бьётся сердце ❤ и плывёт по кругу", "Води пальцем или мышкой за ним", "Держи в кольце — копятся секунды"]);
    },
    13: function () {
      return dm('<svg class="dm-cab" viewBox="0 0 260 150"><path class="l1" d="M30 35H230" stroke="#ef4444"/><path class="l2" d="M30 115H230" stroke="#3b82f6"/>' +
        '<circle cx="30" cy="35" r="13" fill="#ef4444"/><circle cx="230" cy="35" r="13" fill="#ef4444"/><circle cx="30" cy="115" r="13" fill="#3b82f6"/><circle cx="230" cy="115" r="13" fill="#3b82f6"/></svg>' + fg(-120, -62, 100, -40),
        ["Найди две точки одного цвета", "Проведи линию от одной до другой", "Линии не пересекаются — готово!"]);
    },
    12: function () {
      var g = "", i; for (i = 0; i < 9; i++) g += '<i class="dm-c m dm-vial' + (i === 4 ? " odd" : "") + '">🧪</i>';
      return dm('<div class="dm-grid g3">' + g + '</div>' + fg(100, 70, 0, 4),
        ["Среди ампул одна другого цвета", "Найди её и нажми", "Нашёл 3 раза — победа!"]);
    },
    14: function () {
      var g = "", i; for (i = 0; i < 12; i++) g += '<i class="dm-c">' + (i === 5 ? '<em class="v2">3</em><strong class="v3">🧊</strong>' : "") + '</i>';
      return dm('<div class="dm-grid g4">' + g + '</div>' + fg(110, 70, 22, 8),
        ["Под плитами спрятан лёд", "Нажми плиту: число = расстояние до льда", "Иди туда, где число меньше — найди 🧊"]);
    },
    16: function () {
      return dm('<div class="dm-pbar"><i class="dm-pz"></i><s class="dm-pn"></s></div><div class="dm-stop v3">СТОП</div>',
        ["Стрелка бегает по шкале", "Нажми СТОП, когда она в зелёной зоне", "Зона сужается — нужно 4 точных попадания"]);
    },
    15: function () {
      return dm('<div class="dm-dial"><s></s></div><div class="dm-sg"><i style="--d:0"></i><i style="--d:.35"></i><i style="--d:.7"></i><i style="--d:1.05"></i><i style="--d:1.4"></i></div>' +
        '<div class="dm-hot"><b class="v1">❄️ Холодно</b><b class="v2">🥶 → 🔥</b><b class="v3">🎯 Горячо!</b></div><div class="dm-lock v3">Зафиксировать</div>',
        ["Крути диск", "Было холодно ❄️, стало горячо 🔥", "Жми «Зафиксировать»!"]);
    }
  };

  var GAMES = { 4: g4, 5: g5, 6: g6, 8: g8, 9: g9, 10: g10, 11: g11, 12: g12, 13: g13, 14: g14, 15: g15, 16: g16 };

  window.MM2 = {
    meta: META,
    has: function (id) { return !!GAMES[id]; },
    reset: reset, stop: stop,
    tutorialReset: function () {
      var d = $("tut-gif-new"); if (d) { d.classList.add("hidden"); if (d.parentNode) d.parentNode.style.height = ""; }
      document.querySelectorAll('[id$="tutorial-modal"]').forEach(function (md) {
        var sp = md.querySelectorAll(".inline-flex span"); if (sp[1]) sp[1].textContent = "• 10 секунд";
        md.querySelectorAll("button").forEach(function (b) { if (/СТАРТ/.test(b.textContent)) b.textContent = "🚀 СТАРТ! (10 СЕК)"; });
      });
    },

    tutorial: function (id) {
      var anchor = document.querySelector('[id^="tut-gif-game"]'); if (!anchor) return;
      var host = anchor.parentNode, d = $("tut-gif-new");
      document.querySelectorAll('[id^="tut-gif-game"]').forEach(function (g) { g.classList.add("hidden"); });
      if (!d) { d = el("div", "mm2-demo"); d.id = "tut-gif-new"; host.appendChild(d); }
      d.classList.remove("hidden");
      d.innerHTML = DEMOS[id] ? DEMOS[id]() : (window.MMCrisis ? MMCrisis.emblem(id, 104) + '<span class="mm2-demo-t">'+META[id].time+' с</span>' : "");
      host.style.height = DEMOS[id] ? "min(260px,30vh)" : "";
      var md = anchor.closest('[id$="tutorial-modal"]');
      if (md) {
        var sp = md.querySelectorAll(".inline-flex span"); if (sp[1]) sp[1].textContent = "• " + META[id].time + " секунд";
        md.querySelectorAll("button").forEach(function (b) { if (/СТАРТ/.test(b.textContent)) b.textContent = "🚀 СТАРТ! (" + META[id].time + " СЕК)"; else if (/\d+\s*(СЕК|SEC|сон)/i.test(b.textContent)) b.textContent = b.textContent.replace(/\d+(\s*(СЕК|SEC|сон))/i, META[id].time + "$1"); });
      }
      if (DEMOS[id]) d.classList.add("dmx"); else d.classList.remove("dmx");
      if (window.MMChar && !MMChar.seen("tour-mini")) setTimeout(function () { MMChar.tour("mini", [{ who: "mohinur", emo: "think", title: { ru: "Как играть", en: "How to play", tg: "Тарзи бозӣ" }, text: { ru: "Прочитай правило и посмотри пример. Когда будешь готов — нажми СТАРТ. На всё даётся ограниченное время, но ошибаться можно!", en: "Read the rule and watch the demo. When you're ready, press START. Time is limited, but mistakes are OK!", tg: "Қоидаро хон ва намунаро бин. Омода шудӣ — СТАРТ-ро пахш кун." }, at: "[id$=tutorial-modal] button:last-of-type", pos: "top", dim: false }]); }, 500);
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
