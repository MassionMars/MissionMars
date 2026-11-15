/* Mars Dune Alpha: crisis chooser (random, unnamed), pretty game emblems and the card layout shared by every room. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", INK = "#231815";
  var COL = {
    1: ["#7dd3fc", "#0284c7"], 2: ["#86efac", "#15803d"], 3: ["#d8b4fe", "#7e22ce"], 4: ["#fda4af", "#e11d48"],
    5: ["#93c5fd", "#4338ca"], 6: ["#fdba74", "#ea580c"], 7: ["#fde68a", "#d97706"], 8: ["#bfdbfe", "#2563eb"],
    9: ["#fde047", "#dc2626"], 10: ["#bbf7d0", "#15803d"], 11: ["#a5f3fc", "#0e7490"], 12: ["#fbcfe8", "#be185d"],
    13: ["#c7d2fe", "#4f46e5"], 14: ["#fecaca", "#b91c1c"], 15: ["#99f6e4", "#0f766e"], 16: ["#fef08a", "#c2410c"]
  };
  function st(w) { return 'stroke="' + INK + '" stroke-width="' + (w || 2.6) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  var ICON = {
    1: '<path d="M30 7C30 7 14 27 14 40a16 16 0 0 0 32 0C46 27 30 7 30 7z" fill="#e0f2fe" ' + st() + '/><path d="M22 38a8 8 0 0 0 7 9" fill="none" stroke="#38bdf8" stroke-width="3.4" stroke-linecap="round"/><path d="M47 28c0 0-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z" fill="#7dd3fc" ' + st(2.2) + '/>',
    2: '<circle cx="24" cy="30" r="17" fill="#86efac" ' + st() + '/><path d="M24 14c-8 4-10 14-4 22M24 14c8 4 10 14 4 22M24 14v32" fill="none" stroke="#15803d" stroke-width="2.4" stroke-linecap="round"/><path d="M13 30c6 3 16 3 22 0" fill="none" stroke="#bbf7d0" stroke-width="2.4" stroke-linecap="round"/><path d="M44 24c4 10 4 18 0 30-4-12-4-20 0-30z" fill="#ef4444" ' + st(2.2) + '/><path d="M44 24c-5-6-8-8-10-8M44 24c1-7 3-10 6-12M44 24c6-3 9-3 12-1" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>',
    3: '<path d="M25 7h14v15l14 26a5 5 0 0 1-4.4 7.4H15.4A5 5 0 0 1 11 48l14-26z" fill="#f5f3ff" ' + st() + '/><path d="M18 40h28l7 12a3 3 0 0 1-2.6 4.4H13.6A3 3 0 0 1 11 52z" fill="#a855f7"/><path d="M25 7h14" ' + st(3.4) + '/><circle cx="27" cy="46" r="2.6" fill="#f5d0fe"/><circle cx="37" cy="42" r="2" fill="#f5d0fe"/><circle cx="33" cy="50" r="1.8" fill="#f5d0fe"/>',
    4: '<path d="M32 54C8 38 6 20 17 14c7-3 13 1 15 6 2-5 8-9 15-6 11 6 9 24-15 40z" fill="#fb7185" ' + st() + '/><path d="M8 33h13l4-9 7 18 5-12 3 3h16" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',
    5: '<path d="M4 34q7-24 14 0t14 0 14 0 14 0" fill="none" stroke="#fde047" stroke-width="5.4" stroke-linecap="round"/><path d="M4 34q7-24 14 0t14 0 14 0 14 0" fill="none" ' + st(1.4) + ' opacity=".6"/><path d="M4 40q7 20 14 0t14 0 14 0 14 0" fill="none" stroke="#4ade80" stroke-width="5.4" stroke-linecap="round"/>',
    6: '<rect x="12" y="24" width="40" height="18" rx="5" fill="#f5efe6" ' + st() + '/><rect x="17" y="28" width="12" height="8" rx="2" fill="#7dc4e8" ' + st(1.8) + '/><rect x="34" y="28" width="14" height="5" fill="#f97316" ' + st(1.6) + '/><path d="M46 24l5-12" ' + st(2.6) + '/><circle cx="52" cy="10" r="3.4" fill="#ef4444" ' + st(1.8) + '/><circle cx="18" cy="46" r="6.5" fill="#44403c" ' + st() + '/><circle cx="32" cy="46" r="6.5" fill="#44403c" ' + st() + '/><circle cx="46" cy="46" r="6.5" fill="#44403c" ' + st() + '/><path d="M12 28L4 20" ' + st(2.6) + '/>',
    7: '<path d="M14 18h38l-6 30H8z" fill="#3b82f6" ' + st() + '/><path d="M24 18l-4 30M36 18l-3 30M11 28h39M9 38h39" fill="none" stroke="#bfdbfe" stroke-width="2"/><path d="M46 6l2.4 5.6L54 14l-5.6 2.4L46 22l-2.4-5.6L38 14l5.6-2.4z" fill="#fff59d" ' + st(1.8) + '/><path d="M14 54l10-6" ' + st(3.4) + '/>',
    8: '<rect x="8" y="10" width="48" height="44" rx="6" fill="#e2e8f0" ' + st() + '/><path d="M30 10l-5 12 9 6-6 12 8 6-3 8" fill="none" stroke="#ef4444" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="34" y="24" width="20" height="16" rx="3" fill="#cbd5e1" ' + st(2.2) + '/><circle cx="38" cy="28" r="1.8" fill="#64748b"/><circle cx="50" cy="36" r="1.8" fill="#64748b"/>',
    9: '<rect x="6" y="26" width="52" height="14" rx="3" fill="#94a3b8" ' + st() + '/><rect x="24" y="12" width="14" height="30" rx="3" fill="#94a3b8" ' + st() + '/><path d="M31 6c-4 5-5 8-5 10a5 5 0 0 0 10 0c0-2-1-5-5-10z" fill="#38bdf8" ' + st(2) + '/><circle cx="12" cy="33" r="4" fill="#38bdf8"/><circle cx="52" cy="33" r="4" fill="#4ade80"/><path d="M31 44v10" ' + st(3.6) + '/>',
    10: '<rect x="8" y="8" width="48" height="48" rx="8" fill="#fef3c7" ' + st() + '/><circle cx="20" cy="20" r="6.500" fill="#4ade80" ' + st(2.2) + '/><path d="M32 14l8 13H24z" fill="#fb923c" ' + st(2.2) + '/><rect x="38" y="36" width="12" height="12" rx="3" fill="#f43f5e" ' + st(2.2) + '/><path d="M26 41l5 8h-10z" fill="#fb923c" ' + st(2) + '/><circle cx="46" cy="20" r="5" fill="#4ade80" ' + st(2) + '/>',
    11: '<path d="M32 56C8 40 6 22 17 16c7-3 13 1 15 6 2-5 8-9 15-6 11 6 9 24-15 40z" fill="#fb7185" ' + st() + '/><path d="M6 34h14l4-8 7 18 5-12 3 2h19" fill="none" stroke="#fff" stroke-width="3.600" stroke-linecap="round" stroke-linejoin="round"/>',
    12: '<path d="M23 6h18v12l9 32a6 6 0 0 1-6 8H20a6 6 0 0 1-6-8l9-32z" fill="#f8fafc" ' + st() + '/><path d="M18 38h28l4 12a4 4 0 0 1-4 6H18a4 4 0 0 1-4-6z" fill="#a78bfa"/><path d="M18 30h28" ' + st(2.4) + '/><circle cx="28" cy="46" r="3" fill="#ede9fe"/><circle cx="38" cy="42" r="2.200" fill="#ede9fe"/>',
    13: '<circle cx="32" cy="32" r="22" fill="#312e81" ' + st() + '/><circle cx="32" cy="32" r="12" fill="#fde047" ' + st(2.600) + '/><path d="M32 4v8M32 52v8M4 32h8M52 32h8" stroke="#fb923c" stroke-width="4.400" stroke-linecap="round"/><circle cx="32" cy="32" r="5" fill="#fff"/>',
    14: '<path d="M10 40l10-24 14 8 12-14 8 30z" fill="#7dd3fc" ' + st() + '/><path d="M20 16l6 18M34 24l-4 14M46 10l-6 20" stroke="#fff" stroke-width="2.600" stroke-linecap="round" opacity=".8"/><rect x="6" y="40" width="52" height="16" rx="5" fill="#b45309" ' + st() + '/><circle cx="46" cy="48" r="3.500" fill="#fde047" ' + st(1.600) + '/>',
    15: '<rect x="8" y="8" width="48" height="48" rx="7" fill="#cbd5e1" ' + st() + '/><rect x="12" y="12" width="18" height="18" rx="3" fill="#fb923c" ' + st(2.200) + '/><rect x="34" y="12" width="18" height="18" rx="3" fill="#fb923c" ' + st(2.200) + '/><rect x="12" y="34" width="18" height="18" rx="3" fill="#fb923c" ' + st(2.200) + '/><path d="M34 34h18v18" fill="none" stroke="#475569" stroke-width="3" stroke-dasharray="4 4"/>',
    16: '<path d="M8 46a24 24 0 0 1 48 0z" fill="#fff7ed" ' + st() + '/><path d="M14 38a20 20 0 0 1 12-14" fill="none" stroke="#f87171" stroke-width="5" stroke-linecap="round"/><path d="M26 24a20 20 0 0 1 14 0" fill="none" stroke="#4ade80" stroke-width="5" stroke-linecap="round"/><path d="M40 24a20 20 0 0 1 10 14" fill="none" stroke="#f87171" stroke-width="5" stroke-linecap="round"/><path d="M32 46l8-18" ' + st(3.400) + '/><circle cx="32" cy="46" r="4" fill="#231815"/><rect x="10" y="50" width="44" height="6" rx="3" fill="#94a3b8" ' + st(2) + '/>'
  };
  var NAMES = {
    1: "Поймай капли", 2: "Собери урожай", 3: "Витаминный микс", 4: "Пульс в норме", 5: "Поймай волну", 6: "Маршрут ровера", 7: "Очистка панелей", 8: "Залатай обшивку",
    9: "Полив по трубам", 10: "Грядки по схеме", 11: "Ритм сердца", 12: "Лишняя ампула", 13: "Реактор: погаси огни", 14: "Поиск льда", 15: "Люк шлюза", 16: "Давление в шлюзе"
  };
  function emblem(id, size) {
    var c = COL[id] || COL[1];
    return '<span class="mc-emb" style="--c1:' + c[0] + ';--c2:' + c[1] + (size ? ";--sz:" + size + "px" : "") + '"><svg viewBox="0 0 64 64" aria-hidden="true">' + (ICON[id] || "") + '</svg></span>';
  }

  /* a crisis is drawn at random; one that is not solved yet comes first, and the same one is not repeated at once */
  function pick(keys, avoid) {
    var done = {}; try { done = window.DuneBridge ? DuneBridge.doneMap() : {}; } catch (e) {}
    var open = keys.filter(function (k) { return !done[k]; });
    var pool = open.length ? open : keys;
    if (avoid) {
      var alt = pool.filter(function (k) { return k !== avoid; });
      if (!alt.length) alt = keys.filter(function (k) { return k !== avoid; });
      if (alt.length) pool = alt;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* icons instead of emoji in the reward chips; chips become round "pills" with a soft glow */
  var EMO = { "❤️": "life", "⚡": "energy", "🛡️": "shield" };
  function chips(el) {
    if (!el || !window.DuneBridge || !DuneBridge.icon) return;
    el.querySelectorAll("span").forEach(function (sp) {
      if (sp.querySelector("svg") || sp.dataset.mc) return;
      var t = sp.textContent, kind = null, k;
      for (k in EMO) if (t.indexOf(k) >= 0) { kind = EMO[k]; t = t.replace(k, ""); break; }
      if (!kind) return;
      t = t.replace(/\s*(Жизнь|Энергия|Щит)\s*/g, "").trim();
      sp.dataset.mc = "1"; sp.className = "mc-chip mc-" + kind;
      sp.innerHTML = '<b>' + t + '</b>' + DuneBridge.icon(kind);
    });
  }

  /* one-time rebuild of the dilemma card of a room: header + two big game cards */
  function build(cardId) {
    var card = document.getElementById(cardId); if (!card || card.dataset.mc) return;
    card.dataset.mc = "1";
    var title = card.querySelector("#crisis-title"), sub = card.querySelector("#crisis-subtitle"), resp = card.querySelector("#room-responsibility-badge");
    card.className = "mc-card-wrap pointer-events-auto";
    card.innerHTML =
      '<div class="mc-head"><div class="mc-alert"><i class="mc-siren"></i><span>Тревога в отсеке</span></div>' +
      '<span id="crisis-code-badge" hidden></span><h2 id="crisis-title"></h2><p id="crisis-subtitle"></p>' +
      (resp ? '<div id="room-responsibility-badge" class="mc-resp"></div>' : "") + '</div>' +
      '<div class="mc-grid">' + [1, 2].map(function (n) {
        return '<button type="button" class="mc-opt mc-o' + n + '" onclick="openTutorialForOption(' + n + ')">' +
          '<span class="mc-slot" id="opt' + n + '-emb"></span>' +
          '<span class="mc-main"><span class="mc-game"><span id="opt' + n + '-minigame-tag"></span><em class="mc-time">10 с</em></span>' +
          '<strong id="opt' + n + '-title"></strong>' +
          '<span class="mc-cost">Цена и награда:</span><span id="opt' + n + '-rewards" class="mc-rew"></span></span>' +
          '<span class="mc-go">Выбрать</span></button>';
      }).join("") + '</div>';
    if (title) card.querySelector("#crisis-title").textContent = title.textContent;
    if (sub) card.querySelector("#crisis-subtitle").textContent = sub.textContent;
  }

  /* called by a room after it filled the card for a crisis */
  function fill(ids) {
    [1, 2].forEach(function (n) {
      var slot = document.getElementById("opt" + n + "-emb"); if (slot) slot.innerHTML = emblem(ids[n - 1]);
      var btn = slot && slot.closest(".mc-opt"), c = COL[ids[n - 1]] || COL[1];
      if (btn) { btn.style.setProperty("--c1", c[0]); btn.style.setProperty("--c2", c[1]); }
      var tag = document.getElementById("opt" + n + "-minigame-tag"); if (tag) tag.textContent = NAMES[ids[n - 1]] || tag.textContent;
      chips(document.getElementById("opt" + n + "-rewards"));
    });
  }

  /* hide the old crisis switch */
  function hideTabs() {
    ["room-crisis-tabs"].forEach(function (id) { var e = document.getElementById(id); if (e) e.style.display = "none"; });
    document.querySelectorAll('[id^="tab-crisis-"]').forEach(function (b) { if (b.parentNode) b.parentNode.style.display = "none"; });
  }

  window.MMCrisis = { pick: pick, emblem: emblem, build: build, fill: fill, hideTabs: hideTabs, names: NAMES, icon: ICON };
})();
