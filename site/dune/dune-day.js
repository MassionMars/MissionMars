(function () {
  "use strict";
  var B = window.DuneBridge; if (!B) return;
  function $(i) { return document.getElementById(i); }
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }

  var RES = [{ k: "life", i: "❤️", n: "Жизнь" }, { k: "energy", i: "⚡", n: "Энергия" }, { k: "shield", i: "🛡️", n: "Щит" }];
  var NAMES = { greenhouse: "Теплица", medbay: "Медпункт", lab: "Лаборатория", airlock: "Шлюз" };
  var ICON = { greenhouse: "🌱", medbay: "🏥", lab: "🔬", airlock: "🚪" };
  var GIVES = { greenhouse: "❤️ ⚡", medbay: "❤️ 🛡️", lab: "🛡️ ⚡", airlock: "⚡ 🛡️" };

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

  function layer() {
    var l = $("mm-hints"); if (l) return l;
    l = el("div"); l.id = "mm-hints"; document.body.appendChild(l); return l;
  }
  var Q = [], busy = false;
  function pump() {
    if (busy || !Q.length) return;
    var t = Q.shift(); busy = true;
    if (t.run) { t.run(function () { busy = false; setTimeout(pump, 250); }); return; }
    layer().insertBefore(t.node, layer().firstChild);
    setTimeout(function () { t.node.classList.add("in"); }, 30);
    var closed = false;
    function close() { if (closed) return; closed = true; t.node.classList.remove("in"); if (t.done) t.done(); setTimeout(function () { t.node.remove(); busy = false; pump(); }, 350); }
    t.node.querySelector("button").onclick = close; setTimeout(close, t.ms || 9000);
  }
  /* v14: characters. NOVA = NASA facts & alerts; Mohinur / Khurshed = tutorials & hints */
  var NASA = {
    storm: "https://science.nasa.gov/solar-system/planets/mars/10-things-massive-dust-storm-on-mars/",
    plants: "https://www.nasa.gov/humans-in-space/so-you-want-to-be-a-space-farmer/",
    med: "https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/",
    flare: "https://svs.gsfc.nasa.gov/13275",
    sol: "https://science.nasa.gov/mars/facts/", cold: "https://science.nasa.gov/mars/facts/", air: "https://www.nasa.gov/missions/mars-2020-perseverance/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/", conj: "https://www.jpl.nasa.gov/news/for-moratorium-on-sending-commands-to-mars-blame-the-sun",
    lab: "https://science.nasa.gov/mission/mars-2020-perseverance/"
  };
  var FT = {
    sol: { icon: "clock", ru: ["Сол — марсианский день", "1 сол = 24 ч 39 мин: Марс вращается чуть медленнее Земли, поэтому сутки длиннее на 39 минут. Потому и в игре дни зовутся солами."], en: ["Sol — a Martian day", "1 sol = 24 h 39 min. Mars spins a little slower than Earth, so its day is 39 minutes longer — that's why the game counts sols."], tg: ["Сол — рӯзи Миррих", "1 сол = 24 соату 39 дақиқа. Миррих аз Замин каме суст давр мезанад, барои ҳамин рӯзаш 39 дақиқа дарозтар аст."] },
    plants: { icon: "sprout", ru: ["Овощи на Марсе", "Марсианский грунт содержит перхлораты — соли, вредные для здоровья. Поэтому грунт промывают, а растения растят в закрытых теплицах под светодиодами."], en: ["Veggies on Mars", "Martian soil contains perchlorates — salts harmful to health. So the soil is washed and plants grow in closed greenhouses under LED lights."], tg: ["Сабзавот дар Миррих", "Хоки Миррих перхлоратҳо дорад — намакҳои зараровар. Барои ҳамин хокро мешӯянд ва растаниҳоро дар гулхонаҳои пӯшида мепарваранд."] },
    med: { icon: "medbay", ru: ["Здоровье в космосе", "В невесомости и изоляции слабеют кости и мышцы, ослабевает иммунитет. Астронавтам нужны ежедневные упражнения и медосмотры — как в нашем медпункте."], en: ["Health in space", "In microgravity and isolation bones, muscles and immunity weaken. Astronauts need daily exercise and checkups — like in our medbay."], tg: ["Саломатӣ дар кайҳон", "Дар бевазнӣ ва танҳоӣ устухону мушакҳо суст мешаванд. Кайҳоннавардон машқи ҳаррӯза ва муоинаи тиббӣ лозим доранд."] },
    lab: { icon: "lab", ru: ["Работа лаборатории", "Марсоходы NASA Curiosity и Perseverance измеряют радиацию, воду и состав грунта. По этим данным учёные решают, где безопасно строить базу."], en: ["Lab work", "NASA's Curiosity and Perseverance rovers measure radiation, water and soil. Scientists use these data to decide where a base can be built safely."], tg: ["Кори озмоишгоҳ", "Марсгардҳои NASA — Curiosity ва Perseverance — радиатсия, об ва хокро чен мекунанд. Олимон аз рӯи ин додаҳо ҷойи бехатари сохтани базаро интихоб мекунанд."] },
    air: { icon: "airlock", ru: ["Зачем нужен шлюз", "Шлюз выравнивает давление и не пускает в дом марсианскую пыль. Пыль мелкая, как пудра, липнет к скафандрам и портит механизмы."], en: ["Why an airlock", "An airlock equalises pressure and keeps Martian dust out. The dust is fine as powder, sticks to suits and damages machines."], tg: ["Шлюз барои чӣ?", "Шлюз фишорро баробар мекунад ва ғубори Мирриҳро намегузорад. Ғубор мисли орд майда аст, ба скафандр мечаспад."] },
    storm: { icon: "storm", ru: ["Пылевые бури", "Бури на Марсе порой накрывают всю планету. Ветер слабый — воздух очень разрежен, — но пыль закрывает Солнце, и панели почти не дают энергии."], en: ["Dust storms", "Martian storms sometimes cover the whole planet. The wind is weak (the air is very thin), but dust blocks the Sun and solar panels make almost no power."], tg: ["Тӯфони ғубор", "Тӯфонҳо гоҳ тамоми сайёраро мепӯшонанд. Бод суст аст, аммо ғубор Офтобро мепӯшонад ва панелҳо қариб барқ намедиҳанд."] },
    flare: { icon: "sun", ru: ["Вспышки на Солнце", "Вспышка выбрасывает поток заряженных частиц. У Марса нет плотной атмосферы, поэтому защитой служат щит, стены и укрытие базы."], en: ["Solar flares", "A flare throws out a stream of charged particles. Mars has no thick atmosphere, so the shield, the walls and the shelter protect the crew."], tg: ["Дурахши Офтоб", "Дурахш ҷараёни зарраҳои заряднокро мепартояд. Миррих атмосфераи ғафс надорад, пас сипар ва деворҳои база муҳофизат мекунанд."] },
    conj: { icon: "dish", ru: ["Соединение с Солнцем", "Раз в два года Солнце оказывается между Землёй и Марсом. Радиосвязь пропадает примерно на 2 недели — экипаж работает автономно."], en: ["Solar conjunction", "Every two years the Sun sits between Earth and Mars. Radio contact drops for about 2 weeks — the crew works on its own."], tg: ["Муқобили Офтоб", "Ҳар ду сол Офтоб байни Замин ва Миррих меистад. Алоқа тақрибан 2 ҳафта қатъ мешавад."] },
    cold: { icon: "cold", ru: ["Холод Марса", "Средняя температура на Марсе около −60 °C, а ночью бывает ещё холоднее. Поэтому базе нужен обогрев и тёплая изоляция."], en: ["Cold of Mars", "The average temperature on Mars is about −60 °C and nights are even colder. So the base needs heating and thick insulation."], tg: ["Сардии Миррих", "Ҳарорати миёнаи Миррих тақрибан −60 °C аст, шаб боз сардтар мешавад. Базаро гармкунӣ лозим аст."] }
  };
  /* tips: [who, emo, title, text] per language */
  var TP = {
    base: { who: "mohinur", emo: "point", pos: "top", at: ".dept-pin", ru: ["Это наша база", "Подсвеченные сектора открыты. Заходи в любой — кризис ждёт внутри. Замок значит: сектор закрыт на этот сол."], en: ["Our base", "Glowing sectors are open. Enter any — a crisis waits inside. A lock means it is closed this sol."], tg: ["Базаи мо", "Бахшҳои равшан кушодаанд. Ба ҳар кадом дарояд — дохилаш бӯҳрон интизор аст."] },
    res: { who: "khurshed", emo: "think", pos: "top", at: "#hud-life", ru: ["Три шкалы", "Жизнь, энергия и щит. Слабая шкала тянет вниз настроение экипажа, поэтому держи все три выше нуля."], en: ["Three meters", "Life, energy and shield. A weak meter drags the crew's mood down, so keep all three above zero."], tg: ["Се шкала", "Ҳаёт, энергия ва сипар. Шкалаи суст рӯҳияи экипажро паст мекунад."] },
    crisis: { who: "mohinur", emo: "think", ru: ["Как играть кризис", "Выбери одно из двух решений. Затем — мини-игра на 10 секунд: победишь — получишь награду, проиграешь — потеряешь часть ресурсов."], en: ["How a crisis works", "Pick one of two solutions. Then a 10-second mini-game: win and get a reward, lose and spend some resources."], tg: ["Бӯҳрон чӣ тавр", "Яке аз ду ҳалро интихоб кун. Баъд бозии 10-сонияӣ: ғолиб шавӣ — мукофот мегирӣ."] },
    map: { who: "khurshed", emo: "point", at: ".node.cur", ru: ["Карта солов", "Нажми на горящий день — он начнётся. Закрытые дни откроются, когда пройдёшь предыдущие."], en: ["Sol map", "Tap the glowing day to start it. Locked days open as you finish the earlier ones."], tg: ["Харитаи солҳо", "Рӯзи равшанро пахш кун. Рӯзҳои қулфшуда баъдтар кушода мешаванд."] },
    pick: { who: "mohinur", emo: "think", ru: ["Выбери два сектора", "На сол хватает сил на два сектора из четырёх. Смотри, какого ресурса меньше всего — туда и иди."], en: ["Pick two sectors", "You have time for two of four sectors per sol. Check which resource is lowest and go there."], tg: ["Ду бахш интихоб кун", "Дар як сол ду бахш аз чор кифоя аст. Бубин кадом захира камтар аст."] },
    sum: { who: "khurshed", emo: "happy", ru: ["Итоги сола", "Счастье 70% и выше — экипаж доволен. Ниже 50% — день придётся переиграть и потерять одну жизнь."], en: ["Sol summary", "Happiness 70%+ means a happy crew. Below 50% you replay the day and lose a life."], tg: ["Натиҷаи сол", "Хушҳолӣ 70%+ — экипаж розӣ. Аз 50% паст — рӯз аз нав мегузарад."] },
    result: { who: "khurshed", emo: "happy", ru: ["Итог сектора", "Победа даёт награду, поражение — потери. В каждый сектор можно зайти один раз за сол. Закрой все — и сол завершится."], en: ["Sector result", "Win gives a reward, loss costs resources. Each sector can be entered once per sol. Finish them all to end the sol."], tg: ["Натиҷаи бахш", "Ғалаба — мукофот, мағлубият — талафот. Ба ҳар бахш дар як сол як бор дароед."] }
  };
  API.tip = function (key, icon, text) {
    var c = B.camp(), d = TP[key];
    if (!d || c.day !== 1 || c.phase === "new" || c.seen["t-" + key]) return;
    B.seen("t-" + key);
    var l = window.MMChar ? { ru: "ru", en: "en", tg: "tg" }[(window.DuneI18n && DuneI18n.get()) === "tj" ? "tg" : (window.DuneI18n && DuneI18n.get()) || "ru"] : "ru";
    var tt = d[l] || d.en;
    Q.push({ run: function (done) { MMChar.say({ who: d.who, emo: d.emo, title: tt[0], text: tt[1], at: d.at, pos: d.pos, dim: false, onNext: done, onSkip: done }); } }); pump();
  };
  API.earthCard = function (e) {
    if (!e) return;
    var c = B.camp(), key = "e-" + c.day + "-" + e.i;
    if (c.seen[key]) return; B.seen(key);
    var pill = ($("hud-" + RES[e.i].k) || {}).parentElement; if (pill) pill.classList.add("hud-warn");
    var ttl = { ru: "Сообщение с Земли", en: "Message from Earth", tg: "Паём аз Замин" };
    Q.unshift({ run: function (done) { MMChar.say({ who: "khurshed", emo: "alert", title: ttl, icon: "dish", text: e.text, at: pill ? "#hud-" + RES[e.i].k : null, dim: false, onNext: function () { if (pill) pill.classList.remove("hud-warn"); done(); }, onSkip: function () { if (pill) pill.classList.remove("hud-warn"); done(); } }); } });
    pump();
  };
  API.fact = function (key) {
    var f = FT[key]; if (!f || B.hasSeen("f-" + key) || !window.MMChar) return;
    var l = (window.DuneI18n && DuneI18n.get()) || "ru"; if (l === "tj") l = "tg";
    var tt = f[l] || f.en;
    var tries = 0;
    (function wait() {
      if (document.querySelector(".mc-ov") && tries++ < 80) return setTimeout(wait, 900);
      MMChar.fact({ icon: f.icon, title: tt[0], text: tt[1], url: NASA[key] }, function () { B.seen("f-" + key); });
    })();
  };
  API.nasa = NASA;
  var TOUR = [
    ["khurshed", "point", { ru: "Карта солов", en: "Sol map", tg: "Харитаи солҳо" }, { ru: "Каждый горящий кружок — марсианский день. Нажми на него, чтобы начать сол. Закрытые дни пока недоступны.", en: "Each glowing circle is a Martian day. Tap it to start the sol. Locked days are not available yet.", tg: "Ҳар доираи равшан — як рӯзи Миррих. Онро пахш кун." }, ".node.cur"],
    ["mohinur", "happy", { ru: "Добро пожаловать!", en: "Welcome!", tg: "Хуш омадед!" }, { ru: "Я Мохинур, а это Хуршед. Мы поможем вам освоиться на базе «MISSION MARS». Ваша цель — продержаться 10 солов (марсианских дней).", en: "I'm Mohinur and this is Khurshed. We'll help you settle into MISSION MARS. Your goal: survive 10 sols (Martian days).", tg: "Ман Моҳинур, ин Хуршед. Мо ба шумо кӯмак мекунем. Ҳадаф: 10 сол истодагарӣ." }],
    ["khurshed", "point", { ru: "Три шкалы", en: "Three meters", tg: "Се шкала" }, { ru: "Вверху — жизнь, энергия и щит. Если любая упадёт до нуля, экипаж в беде. Следи, какая шкала слабее всех.", en: "At the top: life, energy and shield. If any drops to zero the crew is in trouble. Watch the weakest one.", tg: "Дар боло: ҳаёт, энергия, сипар. Агар яке ба сифр афтад — хатар." }, "#hud-life"],
    ["mohinur", "point", { ru: "Секторы базы", en: "Base sectors", tg: "Бахшҳои база" }, { ru: "Теплица, медпункт, лаборатория и шлюз. Светящийся сектор открыт: нажми на него. Один заход в сектор — один раз за сол.", en: "Greenhouse, medbay, lab and airlock. A glowing sector is open: tap it. Each sector can be visited once per sol.", tg: "Гулхона, пункти тиббӣ, озмоишгоҳ ва шлюз. Бахши равшан кушода аст." }],
    ["khurshed", "think", { ru: "Кризис и выбор", en: "Crisis and choice", tg: "Бӯҳрон ва интихоб" }, { ru: "В секторе случается кризис. Сначала НОВА даст сигнал тревоги, потом ты выбираешь одно из двух решений.", en: "A crisis hits the sector. NOVA sounds the alert first, then you pick one of two solutions.", tg: "Дар бахш бӯҳрон рух медиҳад. Аввал НОВА хатар эълон мекунад, баъд ту интихоб мекунӣ." }],
    ["mohinur", "happy", { ru: "Мини-игра", en: "Mini-game", tg: "Бозии хурд" }, { ru: "После выбора — мини-игра на 10 секунд. Победа даёт награду, поражение отнимает часть ресурсов. Не бойся ошибиться!", en: "After your choice comes a 10-second mini-game. Win for a reward; lose and you spend some resources. Don't fear mistakes!", tg: "Баъди интихоб бозии 10-сонияӣ. Ғалаба — мукофот." }],
    ["khurshed", "wow", { ru: "Факты NASA", en: "NASA facts", tg: "Далелҳои NASA" }, { ru: "Когда сверху появится НОВА со светящейся плашкой «Знаете ли вы?» — нажми! Там настоящие факты NASA и ссылка на статью.", en: "When NOVA drops from the top with a glowing “Did you know?” chip — tap it! Real NASA facts and an article link inside.", tg: "Вақте НОВА бо «Оё медонед?» пайдо шавад — пахш кун!" }]
  ];
  API.tour = function (force) {
    if (!window.MMChar) return;
    var c = B.camp(); if (!force && (c.day !== 1 || c.phase === "new")) return;
    MMChar.tour("day1", TOUR.map(function (t) { return { who: t[0], emo: t[1], title: t[2], text: t[3], at: t[4] }; }), null, !!force);
  };
  window.MMDay = API;

  var CR = typeof ROOM_CRISES !== "undefined" ? ROOM_CRISES : typeof LAB_CRISES !== "undefined" ? LAB_CRISES : typeof AIRLOCK_CRISES !== "undefined" ? AIRLOCK_CRISES : null;
  if (!CR || typeof gameState === "undefined") return;
  var IS_HUB = typeof ROOM_CRISES !== "undefined";
  function room() { return IS_HUB ? gameState.activeDept : (typeof LAB_CRISES !== "undefined" ? "lab" : "airlock"); }

  B.eco(CR, IS_HUB ? "hub" : "delta");
  gameState.hearts = 3;
  if (!IS_HUB) { var _sel = typeof selectLabCrisis === "function" ? selectLabCrisis : selectAirlockCrisis; _sel(gameState.currentCrisis); }


  /* v14: scientific outcome text */
  var SCIT = {
    greenhouse: { w: { ru: "Теплица восстановила замкнутый цикл: растения поглощают CO₂ и выделяют кислород, свежий урожай пополняет питание экипажа.", en: "The greenhouse restored its closed loop: plants absorb CO₂ and release oxygen, and fresh produce replenishes the crew's diet.", tg: "Гулхона давраи пӯшидаро барқарор кард: растаниҳо CO₂ мегиранд ва оксиген медиҳанд." }, l: { ru: "Часть посадок погибла: без стабильного полива и света фотосинтез падает, а запас кислорода и еды сокращается.", en: "Part of the crop died: without steady water and light photosynthesis drops, so oxygen and food reserves shrink.", tg: "Қисми кишт нобуд шуд: бе об ва рӯшноӣ фотосинтез коҳиш меёбад." } },
    medbay: { w: { ru: "Экипаж осмотрен и стабилизирован: в микрогравитации и изоляции слабеют кости и иммунитет, поэтому лечение и упражнения возвращают силы.", en: "The crew is examined and stable: in low gravity and isolation bones and immunity weaken, so treatment and exercise restore strength.", tg: "Экипаж муоина шуд: машқ ва табобат қувватро барқарор мекунад." }, l: { ru: "Помощь пришла поздно: стресс и усталость ослабили иммунитет, восстановление экипажа займёт больше времени.", en: "Help came late: stress and fatigue weakened immunity, so the crew will recover more slowly.", tg: "Кумак дер расид: стресс масуниятро суст кард." } },
    lab: { w: { ru: "Данные приборов получены: измерения радиации, воды и состава грунта помогают планировать безопасные выходы и защиту базы.", en: "Instrument data collected: radiation, water and soil measurements help plan safe outings and protect the base.", tg: "Маълумоти асбобҳо ҷамъ шуд: радиатсия ва об чен шуд." }, l: { ru: "Эксперимент сорван: без точных измерений учёные хуже оценивают радиацию и ресурсы, а щит базы настроен грубее.", en: "The experiment failed: without precise readings scientists estimate radiation and resources worse, and the shield is tuned roughly.", tg: "Озмоиш барбод рафт: бе чен кардани дақиқ сипар суст танзим шуд." } },
    airlock: { w: { ru: "Шлюз герметичен: давление выровнено, а марсианская пыль осталась снаружи — скафандры и механизмы защищены от износа.", en: "The airlock is sealed: pressure is equalised and Martian dust stays outside, protecting suits and machines from wear.", tg: "Шлюз пӯшида шуд: фишор баробар шуд, ғубор берун монд." }, l: { ru: "Герметичность нарушена: пыль и перепады давления попали внутрь, энергия ушла на повторную продувку шлюза.", en: "Seal compromised: dust and pressure swings got in, and energy was spent on re-purging the airlock.", tg: "Зичӣ вайрон шуд: ғубор ба дохил даромад ва энергия сарф шуд." } }
  };
  var RN = { life: { ru: "здоровье экипажа", en: "crew health", tg: "саломатии экипаж" }, energy: { ru: "запас электроэнергии", en: "power reserve", tg: "захираи энергия" }, shield: { ru: "радиационная защита", en: "radiation shield", tg: "муҳофизати радиатсионӣ" } };
  function sciWords(room, w, d) {
    var l = (window.DuneI18n && DuneI18n.get()) || "ru"; if (l === "tj") l = "tg";
    var t = SCIT[room] || SCIT.lab, base = (w ? t.w : t.l)[l] || (w ? t.w : t.l).en;
    var k = ["life", "energy", "shield"], parts = [];
    d.forEach(function (v, i) { if (v) parts.push((RN[k[i]][l] || RN[k[i]].en) + " " + (v > 0 ? "+" : "") + v); });
    return base;
  }
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
    var res = B.sectorDone(room(), !!w, d, !!(w && o.quick));
    var cr = CR[gameState.currentCrisis], mid = o.minigameId, mname = (window.MMCrisis && MMCrisis.names && MMCrisis.names[mid]) || "";
    var rIcon = { greenhouse: "sprout", medbay: "medbay", lab: "lab", airlock: "airlock" }[room()] || "warn";
    var box = $("gh-result-modal"), old = box && box.querySelector(".hs-wrap"); if (old) old.remove();
    if (window.MMHolo && $("res-title")) {
      var st = MMHolo.story({
        win: !!w, delta: d, pIcon: rIcon, pTitle: String(cr.title || "").replace(/[«»]/g, ""), pText: cr.subtitle ? String(cr.subtitle).replace(/\s*Выбери[^.!]*[.:]\s*$/i, "") : "",
        cEmb: window.MMCrisis && mid ? MMCrisis.emblem(mid, 54) : "", cIcon: "tool", cTitle: String(o.title || ""), cText: (mname ? mname + ": " : "") + (w ? "победа" : "поражение"),
        rTitle: w ? "Кризис устранён" : "Не получилось", rText: sciWords(room(), !!w, d),
        sci: res.sci ? { n: res.sci, t: SCI[res.sci - 1].n } : null
      });
      var host = $("res-title").parentNode, btnRow = host.querySelector(".flex.items-center.justify-center.gap-3") || host.lastElementChild;
      host.insertBefore(st, btnRow);
    }
    var btns = $("res-title") ? $("res-title").parentNode.querySelectorAll("button") : [];
    btns.forEach(function (b, i) { if (i === 0) b.textContent = res.all ? "🌅 Завершить сол" : "➡️ Дальше"; else b.style.display = "none"; });
    API.tip("result"); API.tip("res");
  };
  window.afterResult = function () {
    var c = B.camp();
    if (c.phase === "sum") { B.go("day"); return; }
    if (IS_HUB) { closeDepartment(); } else { B.go("hub"); }
  };

  function alertThen(cb) {
    if (!window.MMChar) return cb();
    var cr = CR[gameState.currentCrisis] || {};
    var ti = String(cr.title || "").replace(/[«»]/g, ""), tx0 = cr.subtitle ? String(cr.subtitle).replace(/\s*Выбери[^.!]*[.:]\s*$/i, "") : "";
    MMChar.alert({ title: ti, text: tx0, icon: "warn" }, cb);
  }
  if (IS_HUB) {
    var _open = openDepartment;
    openDepartment = function (k) {
      if (k === "lab" || k === "airlock") return _open(k);
      var st = B.sector(k);
      if (st !== "open") { B.toast(st === "done" ? "Этот сектор уже исследован в этот сол" : "🔒 Сектор закрыт на этот сол"); return; }
      _open(k);
      alertThen(function () { API.tip("crisis"); API.fact(k === "greenhouse" ? "plants" : "med"); });
    };
  } else {
    alertThen(function () { API.tip("crisis"); API.fact(typeof LAB_CRISES !== "undefined" ? "lab" : "air"); });
    if (B.sector(room()) !== "open") setTimeout(function () { B.toast(B.sector(room()) === "done" ? "Этот сектор уже исследован в этот сол" : "🔒 Сектор закрыт на этот сол"); setTimeout(function () { B.go("hub"); }, 900); }, 200);
  }

  (function cond() {
    var c = B.camp(), ev = B.EVENTS[c.day], m = /[?&]cond=(\w+)/.exec(location.search), k = m ? m[1] : (ev && c.phase === "play" ? ev.k : null);
    if (k && window.MMHolo) MMHolo.condition(k);
  })();

  if (IS_HUB) {
    setTimeout(function () {
      var c = B.camp();
      API.tip("base");
      if (c.phase === "play") API.earthCard(API.earth(c.day));
    }, 700);
  }
})();
