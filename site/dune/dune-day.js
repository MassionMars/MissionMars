/* Mars Dune Alpha: campaign layer shared by the control page and the rooms.
 * Texts are written in Russian: dune-i18n.js translates them (EN is the default). */
(function () {
  "use strict";
  var B = window.DuneBridge; if (!B) return;
  function $(i) { return document.getElementById(i); }
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }

  var RES = [{ k: "life", i: "❤️", n: "Жизнь" }, { k: "energy", i: "⚡", n: "Энергия" }, { k: "shield", i: "🛡️", n: "Щит" }];
  var NAMES = { greenhouse: "Теплица", medbay: "Медпункт", lab: "Лаборатория", airlock: "Шлюз" };
  var ICON = { greenhouse: "🌱", medbay: "🏥", lab: "🔬", airlock: "🚪" };
  var GIVES = { greenhouse: "❤️", medbay: "❤️ 🛡️", lab: "🛡️", airlock: "⚡" };
  /* what the sol-event takes away: icons + names */
  var EVT = {
    storm: { i: "🌪️", n: "Пылевая буря", t: "Пыль закрыла солнечные панели и забила фильтры." },
    flare: { i: "☀️", n: "Солнечная вспышка", t: "Поток радиации ударил по щиту базы." },
    blackout: { i: "📡", n: "Обрыв связи с Землёй", t: "Марс зашёл за Солнце: связи нет, база одна." },
    cold: { i: "🥶", n: "Экстремальный холод", t: "Морозная ночь и изоляция давят на экипаж." }
  };
  var SCI = [
    { i: "🛰️", n: "HiRISE: снимки с орбиты", t: "Камера HiRISE на орбитальном аппарате MRO снимает Марс так чётко, что видно камни размером с стол." },
    { i: "🌬️", n: "MAVEN: куда ушёл воздух", t: "Аппарат MAVEN изучает, как Солнце сдуло у Марса атмосферу. Раньше воздуха там было гораздо больше." },
    { i: "🔭", n: "ExoMars: ищем следы жизни", t: "Европейско-российская программа ExoMars ищет в грунте следы древней жизни. Бур берёт пробы на глубине до двух метров." },
    { i: "🚙", n: "Curiosity: кратер Гейла", t: "Марсоход Curiosity нашёл в кратере Гейла следы древнего озера. Значит, там когда-то была вода." },
    { i: "🚁", n: "Ingenuity: полёт на Марсе", t: "Вертолёт Ingenuity впервые взлетел над другой планетой. Воздух на Марсе очень тонкий, поэтому лопасти крутятся очень быстро." }
  ];

  var FACTS = {
    sol: ["⏱️", "Сол — марсианский день", "1 сол = 24 ч 39 мин. Он чуть длиннее земных суток, поэтому в игре дни называются солами."],
    plants: ["🥬", "Овощи на Марсе", "Марсианский грунт содержит перхлораты. Его промывают, а растения растят в закрытых теплицах."],
    med: ["🩺", "Здоровье в космосе", "В невесомости и в изоляции слабеют кости и иммунитет. Поэтому экипажу нужны упражнения и осмотры."],
    lab: ["🔬", "Работа лаборатории", "Научные приборы Марса — марсоходы NASA: Curiosity и Perseverance. Они сообщают о радиации, воде и грунте."],
    air: ["🚪", "Зачем шлюз", "Шлюз выравнивает давление и не пускает внутрь марсианскую пыль. Она мелкая, как пудра, и липнет к скафандрам."],
    storm: ["🌪️", "Пылевые бури", "Бури на Марсе бывают огромными и закрывают всю планету. Ветер слабый, но пыль перекрывает свет панелей."],
    flare: ["☀️", "Вспышки на Солнце", "Вспышки дают поток частиц. Без плотной атмосферы Марса защитой служат щит и стены базы."],
    conj: ["📡", "Соединение с Солнцем", "Раз в два года Солнце оказывается между Землёй и Марсом. Связь пропадает примерно на 2 недели."],
    cold: ["🥶", "Холод Марса", "Средняя температура на Марсе около −60 °C, а ночью бывает ещё холоднее."]
  };
  var API = { RES: RES, NAMES: NAMES, ICON: ICON, GIVES: GIVES, EVT: EVT, SCI: SCI, FACTS: FACTS };

  /* ----- a message from Earth (days 1–8 only): the lowest resource, if it is low ----- */
  API.earth = function (day) {
    if (day >= 9) return null;
    var r = B.res(), i = 0; for (var k = 1; k < 3; k++) if (r[k] < r[i]) i = k;
    if (r[i] >= 45) return null;
    var t = [
      "Жизнь экипажа на исходе! Теплица и Медпункт вернут силы.",
      "Энергии почти нет! Шлюз и солнечные панели дадут заряд.",
      "Щит слабеет! Лаборатория и Медпункт его укрепят."][i];
    return { i: i, text: t, sectors: [["greenhouse", "medbay"], ["airlock"], ["lab", "medbay"]][i] };
  };

  /* ----- floating tip card (first sol only) and the "Fact" chip ----- */
  function layer() {
    var l = $("mm-hints"); if (l) return l;
    l = el("div"); l.id = "mm-hints"; document.body.appendChild(l); return l;
  }
  var Q = [], busy = false;
  function pump() {
    if (busy || !Q.length) return;
    var t = Q.shift(); busy = true; layer().insertBefore(t.node, layer().firstChild);
    setTimeout(function () { t.node.classList.add("in"); }, 30);
    var closed = false;
    function close() { if (closed) return; closed = true; t.node.classList.remove("in"); if (t.done) t.done(); setTimeout(function () { t.node.remove(); busy = false; pump(); }, 350); }
    t.node.querySelector("button").onclick = close; setTimeout(close, t.ms || 9000);
  }
  API.tip = function (key, icon, text) {
    var c = B.camp();
    if (c.day !== 1 || c.phase === "new" || c.seen["t-" + key]) return;
    B.seen("t-" + key);
    var t = el("div", "mm-tip", '<span class="mm-tip-i">' + icon + '</span><span class="mm-tip-t"></span><button type="button" class="mm-tip-x" aria-label="OK">✓</button>');
    t.querySelector(".mm-tip-t").textContent = text;
    Q.push({ node: t }); pump();
  };
  API.earthCard = function (e) {
    if (!e) return;
    var c = B.camp(), key = "e-" + c.day + "-" + e.i;
    if (c.seen[key]) return; B.seen(key);
    var t = el("div", "mm-earth", '<span class="mm-earth-i">📡</span><span><b>Сообщение с Земли</b><br><span class="mm-earth-t"></span></span><button type="button" class="mm-tip-x" aria-label="OK">✓</button>');
    t.querySelector(".mm-earth-t").textContent = e.text;
    var pill = ($("hud-" + RES[e.i].k) || {}).parentElement;
    Q.unshift({ node: t, ms: 12000, done: function () { if (pill) pill.classList.remove("hud-warn"); } });
    if (pill) pill.classList.add("hud-warn");
    pump();
  };
  API.fact = function (key) {
    var f = FACTS[key]; if (!f || B.hasSeen("f-" + key)) return;
    var chip = el("button", "mm-fact", '<span>💡</span><b>Факт</b>'); chip.type = "button";
    chip.onclick = function () {
      B.seen("f-" + key); chip.remove();
      var m = el("div", "mm-fact-card", '<div class="mm-fact-in"><div class="mm-fact-i"></div><h4></h4><p></p><button type="button" class="mm-btn2">Понятно</button></div>');
      m.querySelector(".mm-fact-i").textContent = f[0]; m.querySelector("h4").textContent = f[1]; m.querySelector("p").textContent = f[2];
      m.querySelector("button").onclick = function () { m.remove(); }; m.onclick = function (e) { if (e.target === m) m.remove(); };
      document.body.appendChild(m);
    };
    layer().appendChild(chip);
    setTimeout(function () { chip.classList.add("in"); }, 30);
    setTimeout(function () { if (chip.parentNode) chip.remove(); }, 30000);
  };
  window.MMDay = API;

  /* ================= the room layer (hub, lab, airlock) ================= */
  var CR = typeof ROOM_CRISES !== "undefined" ? ROOM_CRISES : typeof LAB_CRISES !== "undefined" ? LAB_CRISES : typeof AIRLOCK_CRISES !== "undefined" ? AIRLOCK_CRISES : null;
  if (!CR || typeof gameState === "undefined") return;
  var IS_HUB = typeof ROOM_CRISES !== "undefined";
  function room() { return IS_HUB ? gameState.activeDept : (typeof LAB_CRISES !== "undefined" ? "lab" : "airlock"); }

  /* the balanced numbers come from the bridge (also done in the pages themselves) */
  B.eco(CR, IS_HUB ? "hub" : "delta");
  gameState.hearts = 3;
  if (!IS_HUB) { var _sel = typeof selectLabCrisis === "function" ? selectLabCrisis : selectAirlockCrisis; _sel(gameState.currentCrisis); }

  var _fin = finishMiniGame;
  finishMiniGame = function (w) {
    var before = [gameState.life, gameState.energy, gameState.shield];
    var o = CR[gameState.currentCrisis].options[gameState.selectedOption], vec = o.vec || [0, 0, 0];
    _fin(w);
    if (!w) {
      var f = B.failVec(vec);
      gameState.life += f[0]; gameState.energy += f[1]; gameState.shield += f[2];
      gameState.hearts = 3;
      updateResourceHUD({ life: f[0], energy: f[1], shield: f[2] });
    }
    gameState.hearts = 3;
    var d = [gameState.life - before[0], gameState.energy - before[1], gameState.shield - before[2]];
    var res = B.sectorDone(room(), !!w, d);
    $("res-icon").textContent = w ? "🎉" : "⚠️";
    $("res-title").textContent = w ? "Сектор спасён!" : "Не получилось";
    if (!w) $("res-desc").textContent = "Кризис не погашен: часть ресурсов потрачена, награды нет. Второй попытки в этом секторе на сегодня нет.";
    var bd = $("res-badges"); bd.innerHTML = "";
    d.forEach(function (v, i) {
      if (!v) return;
      var s = el("span", "mm-chip " + (v > 0 ? "up" : "dn")); s.textContent = (v > 0 ? "+" : "") + v + " " + RES[i].i; bd.appendChild(s);
    });
    if (res.sci) {
      var t = SCI[res.sci - 1], s2 = el("div", "mm-sci", '<span>' + t.i + '</span><span><b>Научное открытие ' + res.sci + ' / 5!</b><br>' + t.n + '</span>');
      bd.parentNode.insertBefore(s2, bd.nextSibling);
    }
    var btns = $("res-title").parentNode.querySelectorAll("button");
    btns.forEach(function (b, i) { if (i === 0) b.textContent = res.all ? "🌙 Завершить сол" : "➡️ Дальше"; else b.style.display = "none"; });
    if (w) API.tip("result", "🏆", "Победа даёт награду, поражение — потери. В каждый сектор — один заход за сол.");
  };
  window.afterResult = function () {
    var c = B.camp();
    if (c.phase === "sum") { B.go("day"); return; }
    if (IS_HUB) { closeDepartment(); } else { B.go("hub"); }
  };

  if (IS_HUB) {
    var _open = openDepartment;
    openDepartment = function (k) {
      if (k === "lab" || k === "airlock") return _open(k);
      var st = B.sector(k);
      if (st !== "open") { B.toast(st === "done" ? "Этот сектор уже исследован в этот сол" : "🔒 Сектор закрыт на этот сол"); return; }
      _open(k);
      API.tip("crisis", "🚨", "Случайный кризис! Выбери один из двух вариантов: впереди мини-игра на 10 секунд.");
      API.fact(k === "greenhouse" ? "plants" : "med");
    };
  } else {
    API.tip("crisis", "🚨", "Случайный кризис! Выбери один из двух вариантов: впереди мини-игра на 10 секунд.");
    API.fact(typeof LAB_CRISES !== "undefined" ? "lab" : "air");
    if (B.sector(room()) !== "open") setTimeout(function () { B.toast(B.sector(room()) === "done" ? "Этот сектор уже исследован в этот сол" : "🔒 Сектор закрыт на этот сол"); setTimeout(function () { B.go("hub"); }, 900); }, 200);
  }
  /* base: first-sol tips and the message from Earth */
  if (IS_HUB) {
    setTimeout(function () {
      var c = B.camp();
      API.tip("base", "👆", "Открытые сектора светятся. Заходи в любой — замки закрыты на этот сол.");
      API.tip("res", "❤️⚡🛡️", "Жизнь, энергия, щит. Слабейший тянет вниз счастье экипажа — держи все три.");
      if (c.phase === "play") API.earthCard(API.earth(c.day));
    }, 700);
  }
})();
