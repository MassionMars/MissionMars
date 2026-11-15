"use strict";
/* ============================================================
   ROVER RUN — mini-game 3 for MISSION: MARS (NASA Space Apps)
   You are the rover's autonomy. Radio delay means Earth cannot joystick a rover,
   so it drives itself: dodge boulders, sharp rocks and sand traps (no jumping).
   Based on NASA JPL material on Perseverance AutoNav, Hazcams/Navcams, keep-out zones and Curiosity wheel wear.
   Result event for the main site: window "mm-rover-result" {meters, samples, materials, hull, wheels}
   ============================================================ */
const L={
en:{t:"Rover Run",sub:"Drive like a Mars rover: dodge the hazards and collect science targets",start:"📘 How to play",skip:"⏭ Skip: I know how",go:"Drive!",next:"Next",again:"Run again",send:"Send to base",
 how:["◀ ▶ (or A / D, or swipe) change lane. There is no jumping on Mars!","Boulders damage the hull. Small sharp rocks wear the wheels. Sand traps slow you down.","Collect 🧪 science targets to charge AUTONAV, then press it (Space)","Drive 75 seconds and beat 348 m, a game version of Perseverance's one-sol record"],
 cards:[["Switch lanes","Press ◀ ▶ (or A / D), or swipe on the screen. You drive on your own: Earth cannot steer a rover live because the radio signal takes too long."],["Know your hazards","Boulders and sand traps are visible from far away: orbiters photograph them. Small sharp rocks appear only when they are close, like hazards that satellites cannot see."],["AUTONAV","Collect 🧪 science targets to fill the AUTONAV bar. Then press it (Space): the rover plans a safe path by itself for 5 seconds."]],
 tm:"Time",hull:"Hull",wheels:"Wheels",auto:"AUTONAV",autoB:"AUTONAV",
 r:["Distance","Samples","Materials"],mat:"Materials for the base: +",win:"🏆 You beat the 348 m goal!",crash:"💥 The rover was lost",wornT:"🛞 The wheels are worn out",done:"Run complete",stars:"Rating",srcT:"NASA sources",rc:"Reality check",rr:"What is real (NASA)",rs:"What the game simplifies",
 real:["Radio delay between Earth and Mars means a rover cannot be driven with a joystick. Engineers plan the route and the rover drives itself (NASA JPL).","Perseverance's AutoNav builds 3D maps of the terrain ahead, finds hazards and plans around them while the wheels turn (NASA JPL).","Planners mark keep-out zones, for example sand traps, using orbiter images, but the rover also finds hazards satellites cannot see (NASA JPL).","Early in the Curiosity mission, small sharp rocks put holes in its wheels (NASA JPL).","Perseverance can reach about 120 m per hour; Curiosity about 20 m per hour (NASA JPL)."],
 sim:["Real rovers drive a few metres per minute, not metres per second. The game is sped up.","Three lanes, hull and wheel bars, and the AUTONAV charge are game rules.","Records change: the 348 m goal is a game target based on a 347.7 m single-sol record by Perseverance."],
 f:[["No joystick","The radio signal takes a long time to cross between Earth and Mars, so a rover cannot be steered live. Engineers plan the route and the rover drives itself.","NASA JPL, 2021"],["Hidden hazards","Planners use satellite images, but while driving the rover found hazards that were not visible from orbit.","NASA JPL, 2021-22"],["Sharp rocks","Early in Curiosity's mission, small sharp rocks put holes in its wheels.","NASA JPL (rover team)"],["Thinking while driving","AutoNav processes camera images while the wheels turn, builds a 3D map and plans a route around hazards.","NASA JPL, 2021"],["Keep-out zones","Planners draw keep-out zones around hazards like sand traps so the rover steers away from them.","NASA JPL, 2022"],["Ground clearance","Perseverance has higher belly clearance and upgraded wheels, so it can roll over rougher ground than Curiosity.","NASA JPL, 2021"],["Speed","Perseverance can drive up to about 120 metres per hour with AutoNav. Curiosity manages about 20.","NASA JPL, 2021"]]},
ru:{t:"Заезд ровера",sub:"Ведите ровер как на Марсе: объезжайте опасности и собирайте научные цели",start:"📘 Как играть",skip:"⏭ Пропустить: я умею",go:"Поехали!",next:"Далее",again:"Ещё заезд",send:"Отправить на базу",
 how:["◀ ▶ (или A / D, или свайп) смена полосы. Прыгать на Марсе нельзя!","Валуны повреждают корпус. Мелкие острые камни изнашивают колёса. Песчаные ловушки замедляют.","Собирайте 🧪 научные цели, чтобы зарядить AUTONAV, затем нажмите его (Пробел)","Ехать 75 секунд и пройти 348 м: игровая версия рекорда Perseverance за один сол"],
 cards:[["Смена полосы","Нажимайте ◀ ▶ (или A / D) или делайте свайп. Вы едете сами: Земля не может управлять ровером в реальном времени, потому что радиосигнал идёт слишком долго."],["Знайте опасности","Валуны и песчаные ловушки видны издалека: их фотографируют орбитальные аппараты. Мелкие острые камни появляются только вблизи, как опасности, которых не видно со спутников."],["AUTONAV","Собирайте 🧪 научные цели, чтобы заполнить шкалу AUTONAV. Затем нажмите его (Пробел): ровер сам проложит безопасный путь на 5 секунд."]],
 tm:"Время",hull:"Корпус",wheels:"Колёса",auto:"AUTONAV",autoB:"AUTONAV",
 r:["Дистанция","Образцы","Материалы"],mat:"Материалы для базы: +",win:"🏆 Вы выполнили цель в 348 м!",crash:"💥 Ровер потерян",wornT:"🛞 Колёса изношены",done:"Заезд завершён",stars:"Оценка",srcT:"Источники NASA",rc:"Проверка реальностью",rr:"Что настоящее (NASA)",rs:"Что в игре упрощено",
 real:["Из-за задержки радиосигнала между Землёй и Марсом ровером нельзя управлять джойстиком. Инженеры планируют маршрут, а ровер едет сам (NASA JPL).","AutoNav ровера Perseverance строит трёхмерную карту местности впереди, находит опасности и планирует путь в обход, пока колёса вращаются (NASA JPL).","Планировщики по снимкам с орбиты отмечают запретные зоны, например песчаные ловушки, но ровер находит и опасности, которых не видно со спутников (NASA JPL).","В начале миссии Curiosity мелкие острые камни пробили дыры в его колёсах (NASA JPL).","Perseverance может ехать примерно 120 м в час, Curiosity около 20 м в час (NASA JPL)."],
 sim:["Настоящие роверы едут несколько метров в минуту, а не метров в секунду. В игре всё ускорено.","Три полосы, шкалы корпуса и колёс и заряд AUTONAV это правила игры.","Рекорды меняются: цель 348 м это игровая цель по мотивам рекорда Perseverance 347,7 м за один сол."],
 f:[["Нет джойстика","Радиосигнал идёт между Землёй и Марсом очень долго, поэтому ровером нельзя управлять в реальном времени. Инженеры планируют маршрут, а ровер едет сам.","NASA JPL, 2021"],["Скрытые опасности","Планировщики используют снимки со спутников, но во время езды ровер находил опасности, которых не было видно с орбиты.","NASA JPL, 2021-22"],["Острые камни","В начале миссии Curiosity мелкие острые камни пробили дыры в его колёсах.","NASA JPL (команда ровера)"],["Думает на ходу","AutoNav обрабатывает снимки камер, пока вращаются колёса, строит трёхмерную карту и планирует путь в обход опасностей.","NASA JPL, 2021"],["Запретные зоны","Планировщики рисуют запретные зоны вокруг опасностей вроде песчаных ловушек, чтобы ровер объезжал их.","NASA JPL, 2022"],["Клиренс","У Perseverance выше клиренс и усовершенствованные колёса, поэтому он может ехать по более грубой местности, чем Curiosity.","NASA JPL, 2021"],["Скорость","Perseverance с AutoNav может ехать до примерно 120 метров в час. Curiosity около 20.","NASA JPL, 2021"]]},
tg:{t:"Давраи ровер",sub:"Мисли ровери Миррих ронед: аз хатарҳо гузаред ва ҳадафҳои илмиро ҷамъ кунед",start:"📘 Чӣ тавр бозӣ кардан",skip:"⏭ Гузаштан: ман медонам",go:"Равем!",next:"Минбаъд",again:"Боз давр",send:"Ба пойгоҳ фиристодан",
 how:["◀ ▶ (ё A / D, ё свайп) иваз кардани хат. Дар Миррих ҷаҳидан мумкин нест!","Харсангҳо корпусро вайрон мекунанд. Сангҳои хурди тез чархҳоро мефарсоянд. Дому рег суръатро паст мекунад.","🧪 ҳадафҳои илмиро ҷамъ кунед, то AUTONAV пур шавад, баъд онро пахш кунед (Фосила)","75 сония ронед ва аз 348 м гузаред: нусхаи бозии рекорди Perseverance дар як сол"],
 cards:[["Иваз кардани хат","◀ ▶ (ё A / D)-ро пахш кунед ё свайп кунед. Шумо худатон меронед: Замин ровериро зинда идора карда наметавонад, зеро сигнали радио хеле дер мерасад."],["Хатарҳоро бишносед","Харсангҳо ва домҳои регӣ аз дур намоёнанд: киштиҳои мадорӣ онҳоро аксбардорӣ мекунанд. Сангҳои хурди тез танҳо наздик пайдо мешаванд, мисли хатарҳое, ки аз моҳвораҳо намоён нестанд."],["AUTONAV","🧪 ҳадафҳои илмиро ҷамъ кунед, то шкалаи AUTONAV пур шавад. Баъд онро пахш кунед (Фосила): ровер худаш 5 сония роҳи бехатар мекашад."]],
 tm:"Вақт",hull:"Корпус",wheels:"Чархҳо",auto:"AUTONAV",autoB:"AUTONAV",
 r:["Масофа","Намунаҳо","Мавод"],mat:"Мавод барои пойгоҳ: +",win:"🏆 Шумо ба ҳадафи 348 м расидед!",crash:"💥 Ровер гум шуд",wornT:"🛞 Чархҳо фарсуда шуданд",done:"Давр анҷом ёфт",stars:"Баҳо",srcT:"Манбаъҳои NASA",rc:"Санҷиши воқеият",rr:"Чӣ воқеӣ аст (NASA)",rs:"Бозӣ чиро содда мекунад",
 real:["Таъхири сигнали радио байни Замин ва Миррих имкон намедиҳад, ки ровер бо джойстик идора шавад. Муҳандисон роҳро ба нақша мегиранд ва ровер худаш меронад (NASA JPL).","AutoNav-и Perseverance харитаи се бузургии релефи пеш аз худро месозад, хатарҳоро меёбад ва ҳангоми гардиши чархҳо роҳро аз гирдашон ба нақша мегирад (NASA JPL).","Банақшагирон бо акси киштиҳои мадорӣ минтақаҳои манъшударо, масалан домҳои региро, нишон медиҳанд, аммо ровер хатарҳоеро низ меёбад, ки аз моҳвораҳо намоён нестанд (NASA JPL).","Дар аввали миссияи Curiosity сангҳои хурди тез дар чархҳояш сӯрох кушоданд (NASA JPL).","Perseverance тақрибан 120 м дар як соат, Curiosity тақрибан 20 м дар як соат рафта метавонад (NASA JPL)."],
 sim:["Роверҳои воқеӣ чанд метр дар як дақиқа мераванд, на метр дар як сония. Дар бозӣ ҳама тезонида шудааст.","Се хат, шкалаҳои корпус ва чарх ва пурии AUTONAV қоидаҳои бозианд.","Рекордҳо тағйир меёбанд: ҳадафи 348 м ҳадафи бозист, ки ба рекорди Perseverance (347,7 м дар як сол) асос ёфтааст."],
 f:[["Джойстик нест","Сигнали радио байни Замин ва Миррих хеле дер мерасад, бинобар ин ровериро зинда идора кардан мумкин нест. Муҳандисон роҳро ба нақша мегиранд ва ровер худаш меронад.","NASA JPL, 2021"],["Хатарҳои пинҳон","Банақшагирон аксҳои моҳвораро истифода мебаранд, аммо ҳангоми рондан ровер хатарҳоеро ёфт, ки аз мадор намоён набуданд.","NASA JPL, 2021-22"],["Сангҳои тез","Дар аввали миссияи Curiosity сангҳои хурди тез дар чархҳояш сӯрох кушоданд.","NASA JPL (гурӯҳи ровер)"],["Дар ҳаракат фикр мекунад","AutoNav ҳангоми гардиши чархҳо тасвирҳои камераро коркард мекунад, харитаи се бузургӣ месозад ва роҳро аз гирди хатарҳо ба нақша мегирад.","NASA JPL, 2021"],["Минтақаҳои манъшуда","Банақшагирон гирди хатарҳо, монанди домҳои регӣ, минтақаҳои манъшуда мекашанд, то ровер аз онҳо дур шавад.","NASA JPL, 2022"],["Баландии зери шикам","Perseverance зери шикамаш баландтар аст ва чархҳояш такмил ёфтаанд, бинобар ин аз релефи сахттар аз Curiosity гузашта метавонад.","NASA JPL, 2021"],["Суръат","Perseverance бо AutoNav то тақрибан 120 метр дар як соат рафта метавонад. Curiosity тақрибан 20.","NASA JPL, 2021"]]}};
const X={en:{back:"Back to base",rw:"Reward",visit:"Science visit counted",disc:"Discovery {n} unlocked!",mtot:"m to the sample album",prac:"Practice ride: no reward. A paid ride is available once per sol.",costOk:"⚡ This ride costs {n} energy. A finished ride counts as a science visit and gives a shield bonus.",costUsed:"You already rode the rover this sol. This is a practice ride with no reward.",costLow:"Not enough energy for a real ride. This is a practice ride with no reward.",costFree:"Practice ride: the real ride is available during a mission sol."},
ru:{back:"Назад на базу",rw:"Награда",visit:"Научный визит засчитан",disc:"Научное открытие {n} получено!",mtot:"м в альбом образцов",prac:"Тренировочный заезд: без награды. Настоящий заезд доступен раз в сол.",costOk:"⚡ Поездка стоит {n} энергии. Завершённая поездка считается научным визитом и даёт бонус к защите.",costUsed:"В этот сол ты уже ездил на ровере. Это тренировочный заезд без награды.",costLow:"Не хватает энергии для настоящей поездки. Это тренировочный заезд без награды.",costFree:"Тренировка: настоящая поездка доступна в игровой сол."},
tg:{back:"Ба пойгоҳ",rw:"Мукофот",visit:"Боздиди илмӣ ҳисоб шуд",disc:"Кашфиёти илмии {n} гирифта шуд!",mtot:"м ба албоми намунаҳо",prac:"Давраи машқӣ: бе мукофот. Давраи воқеӣ як маротиба дар як сол дастрас аст.",costOk:"⚡ Ин сафар {n} қувва талаб мекунад. Сафари анҷомёфта боздиди илмӣ ҳисоб мешавад ва ба ҳимоя бонус медиҳад.",costUsed:"Дар ин сол шумо аллакай бо ровер рафтед. Ин давраи машқӣ бе мукофот аст.",costLow:"Қувва барои сафари воқеӣ намерасад. Ин давраи машқӣ бе мукофот аст.",costFree:"Машқ: сафари воқеӣ дар соли бозӣ дастрас аст."}};
Object.keys(X).forEach(k=>Object.assign(L[k],X[k]));
Object.assign(L.en,{t:"Rover ride",again:"Practice again"});Object.assign(L.ru,{t:"Поездка на ровере",again:"Ещё тренировка"});Object.assign(L.tg,{t:"Сафар бо ровер",again:"Боз машқ"});
const SRC=[["NASA JPL: Self-driving Perseverance 'takes the wheel' (2021)","https://www.jpl.nasa.gov/news/nasas-self-driving-perseverance-mars-rover-takes-the-wheel"],["NASA: same article","https://www.nasa.gov/solar-system/nasas-self-driving-perseverance-mars-rover-takes-the-wheel"],["NASA JPL: Perseverance rover hightails it to Martian delta (2022)","https://phys.org/news/2022-03-perseverance-rover-hightails-martian-delta.html"],["Perseverance driving records and cameras (NASA JPL data, summary)","https://www.universetoday.com/163273/nasas-perseverance-rover-is-setting-records-on-mars/"]];

Object.assign(L.en,{brief:["Mission briefing","Planners on Earth study orbiter images and mark the hazards. Then the rover drives the route by itself. Choose a route."],
 routes:[["Plain route","Sand traps and a few boulders. Gentler for the hull."],["Ridge route","More boulders and sharp rocks, but richer science targets."]],
 legend:["Keep-out zone (sand)","Boulders","Sharp rocks","Science target"],mapT:"Orbiter map",
 objT:"Objectives",objMain:"Reach {n} m",o:["Collect {n} science samples","Keep the hull above 60%","Use AUTONAV at most twice","Avoid every sand trap"],
 scan:["AUTONAV READY","Terrain analysis complete · safe route calculated"],warnH:"⚠ HULL DAMAGE",warnW:"⚠ WORN WHEELS: SLOWER",
 sci:"Science",safe:"Safety",nav:"Navigation",rating:"Mission rating",navT:["Excellent","Good","Needs practice"],objR:"Objectives",
 r:["Distance","Science samples","Game resources"],mat:"Game resources for the base (a reward for science tasks): +",win:"🏆 You beat the historic 348 m goal!",
 real:["Radio delay between Earth and Mars means a rover cannot be driven with a joystick. Engineers plan the route and the rover drives itself (NASA JPL).","Perseverance's AutoNav builds 3D maps of the terrain ahead, finds hazards and plans around them while the wheels turn (NASA JPL).","Planners mark keep-out zones, for example sand traps, using orbiter images, but the rover also finds hazards satellites cannot see (NASA JPL).","Early in the Curiosity mission, small sharp rocks put holes in its wheels (NASA JPL).","Perseverance can reach about 120 m per hour; Curiosity about 20 m per hour (NASA JPL).","Perseverance's single-sol record: 347.7 m on 3 April 2023, beaten by 411.7 m on 19 June 2025 (NASA JPL)."],
 sim:["Real Perseverance picks a path to a target using stereo cameras and a terrain height map. The game offers three lanes and AUTONAV picks the safest one: a simplified model.","Real rovers drive a few metres per minute, not metres per second. The game is sped up.","Hull and wheel bars, mission objectives and the AUTONAV charge are game rules.","Real samples are sealed in tubes for science and a future return to Earth, not used as building material. The base resources are a game reward for science tasks.","Records change: 347.7 m (3 April 2023) was beaten by 411.7 m (19 June 2025). The 348 m goal is a historical game target."]});
L.en.f.push(["Driving record","On 19 June 2025 Perseverance drove 411.7 m in one sol, beating its own 347.7 m record of 3 April 2023. About 98% of that drive was autonomous.","NASA JPL, 2025"]);
Object.assign(L.ru,{brief:["Брифинг миссии","Планировщики на Земле изучают снимки с орбиты и отмечают опасности. Затем ровер едет по маршруту сам. Выберите маршрут."],
 routes:[["Равнинный маршрут","Песчаные ловушки и немного валунов. Мягче для корпуса."],["Маршрут по гряде","Больше валунов и острых камней, зато богаче научные цели."]],
 legend:["Запретная зона (песок)","Валуны","Острые камни","Научная цель"],mapT:"Карта с орбиты",
 objT:"Задания",objMain:"Проехать {n} м",o:["Собрать {n} научных образца","Сохранить корпус выше 60%","Использовать AUTONAV не больше двух раз","Не попасть ни в одну песчаную ловушку"],
 scan:["AUTONAV ГОТОВ","Анализ местности завершён · безопасный маршрут рассчитан"],warnH:"⚠ ПОВРЕЖДЕН КОРПУС",warnW:"⚠ ИЗНОС КОЛЁС: МЕДЛЕННЕЕ",
 sci:"Наука",safe:"Безопасность",nav:"Навигация",rating:"Оценка миссии",navT:["Отлично","Хорошо","Нужна практика"],objR:"Задания",
 r:["Дистанция","Научные образцы","Игровые ресурсы"],mat:"Игровые ресурсы для базы (награда за научные задачи): +",win:"🏆 Вы выполнили историческую цель в 348 м!",
 real:["Из-за задержки радиосигнала между Землёй и Марсом ровером нельзя управлять джойстиком. Инженеры планируют маршрут, а ровер едет сам (NASA JPL).","AutoNav ровера Perseverance строит трёхмерную карту местности впереди, находит опасности и планирует путь в обход, пока колёса вращаются (NASA JPL).","Планировщики по снимкам с орбиты отмечают запретные зоны, например песчаные ловушки, но ровер находит и опасности, которых не видно со спутников (NASA JPL).","В начале миссии Curiosity мелкие острые камни пробили дыры в его колёсах (NASA JPL).","Perseverance может ехать примерно 120 м в час, Curiosity около 20 м в час (NASA JPL).","Рекорд Perseverance за один сол: 347,7 м 3 апреля 2023 года, затем 411,7 м 19 июня 2025 года (NASA JPL)."],
 sim:["Настоящий Perseverance выбирает путь к цели по стереокамерам и карте высот местности. В игре три полосы, а AUTONAV выбирает самую безопасную: это упрощённая модель.","Настоящие роверы едут несколько метров в минуту, а не метров в секунду. В игре всё ускорено.","Шкалы корпуса и колёс, задания миссии и заряд AUTONAV это правила игры.","Настоящие образцы запечатывают в пробирки для науки и будущей доставки на Землю, а не используют как строительный материал. Ресурсы базы это игровая награда за научные задачи.","Рекорды меняются: 347,7 м (3 апреля 2023) побиты результатом 411,7 м (19 июня 2025). Цель в 348 м это историческая игровая цель."]});
L.ru.f.push(["Рекорд пробега","19 июня 2025 года Perseverance проехал 411,7 м за один сол и побил свой рекорд 347,7 м от 3 апреля 2023 года. Около 98% этого пути ровер проехал самостоятельно.","NASA JPL, 2025"]);
Object.assign(L.tg,{brief:["Брифинги миссия","Банақшагирон дар Замин аксҳои мадориро меомӯзанд ва хатарҳоро қайд мекунанд. Баъд ровер роҳро худаш мегузарад. Роҳро интихоб кунед."],
 routes:[["Роҳи ҳамвор","Домҳои регӣ ва якчанд харсанг. Барои корпус нармтар."],["Роҳи қаторкӯҳ","Харсангҳо ва сангҳои тези бештар, аммо ҳадафҳои илмии бойтар."]],
 legend:["Минтақаи манъшуда (рег)","Харсангҳо","Сангҳои тез","Ҳадафи илмӣ"],mapT:"Харитаи мадорӣ",
 objT:"Вазифаҳо",objMain:"{n} м расидан",o:["{n} намунаи илмӣ ҷамъ кунед","Корпусро аз 60% боло нигоҳ доред","AUTONAV-ро на бештар аз ду маротиба истифода баред","Ба ҳеҷ як домаи регӣ наафтед"],
 scan:["AUTONAV ТАЙЁР","Таҳлили релеф анҷом ёфт · роҳи бехатар ҳисоб шуд"],warnH:"⚠ КОРПУС ВАЙРОН ШУД",warnW:"⚠ ЧАРХҲО ФАРСУДА: ОҲИСТАТАР",
 sci:"Илм",safe:"Бехатарӣ",nav:"Навигатсия",rating:"Баҳои миссия",navT:["Аъло","Хуб","Машқ лозим аст"],objR:"Вазифаҳо",
 r:["Масофа","Намунаҳои илмӣ","Захираҳои бозӣ"],mat:"Захираҳои бозӣ барои пойгоҳ (мукофот барои вазифаҳои илмӣ): +",win:"🏆 Шумо ба ҳадафи таърихии 348 м расидед!",
 real:["Таъхири сигнали радио байни Замин ва Миррих имкон намедиҳад, ки ровер бо джойстик идора шавад. Муҳандисон роҳро ба нақша мегиранд ва ровер худаш меронад (NASA JPL).","AutoNav-и Perseverance харитаи се бузургии релефи пеш аз худро месозад, хатарҳоро меёбад ва ҳангоми гардиши чархҳо роҳро аз гирдашон ба нақша мегирад (NASA JPL).","Банақшагирон бо акси киштиҳои мадорӣ минтақаҳои манъшударо, масалан домҳои региро, нишон медиҳанд, аммо ровер хатарҳоеро низ меёбад, ки аз моҳвораҳо намоён нестанд (NASA JPL).","Дар аввали миссияи Curiosity сангҳои хурди тез дар чархҳояш сӯрох кушоданд (NASA JPL).","Perseverance тақрибан 120 м дар як соат, Curiosity тақрибан 20 м дар як соат рафта метавонад (NASA JPL).","Рекорди Perseverance дар як сол: 347,7 м 3 апрели соли 2023, баъд 411,7 м 19 июни соли 2025 (NASA JPL)."],
 sim:["Perseverance-и воқеӣ роҳро ба ҳадаф бо камераҳои стереоскопӣ ва харитаи баландии релеф интихоб мекунад. Дар бозӣ се хат ҳаст ва AUTONAV бехатартаринашро интихоб мекунад: модели содда.","Роверҳои воқеӣ чанд метр дар як дақиқа мераванд, на метр дар як сония. Дар бозӣ ҳама тезонида шудааст.","Шкалаҳои корпус ва чарх, вазифаҳои миссия ва пурии AUTONAV қоидаҳои бозианд.","Намунаҳои воқеиро барои илм ва бозгашти оянда ба Замин дар найчаҳо мӯҳр мекунанд, на ҳамчун маводи сохтмонӣ. Захираҳои пойгоҳ мукофоти бозӣ барои вазифаҳои илмӣ мебошанд.","Рекордҳо тағйир меёбанд: 347,7 м (3 апрели 2023) бо натиҷаи 411,7 м (19 июни 2025) шикаста шуд. Ҳадафи 348 м ҳадафи таърихии бозист."]});
L.tg.f.push(["Рекорди масофа","19 июни соли 2025 Perseverance дар як сол 411,7 м рафт ва рекорди худро (347,7 м, 3 апрели 2023) шикаст. Тақрибан 98%-и ин роҳро ровер худаш рафт.","NASA JPL, 2025"]);
SRC.push(["NASA JPL: Perseverance breaks its own driving record (411.7 m, 2025)","https://www.jpl.nasa.gov/images/pia26645-nasas-perseverance-breaks-own-rover-driving-record"],["NASA JPL Robotics: Perseverance mobility report (autonomous driving)","https://robotics.jpl.nasa.gov/media/documents/2026_RO_AAS_final.pdf"],["NASA: Perseverance ready to roll for miles (2025)","https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-perseverance-mars-rover-ready-to-roll-for-miles-in-years-ahead"]);
const $=i=>document.getElementById(i);let lg,T;
const W=960,H=540,HY=205,YB=498,GOAL=348,RUN=75,cv=$("c"),cx=cv.getContext("2d"),dpr=Math.min(2,devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;cx.scale(dpr,dpr);
let seed=1+(Date.now()%2147483000);const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let ranked=false,finished=false,route=0,queue=[],objs=[],hits={s:0,sh:0,b:0},autoUses=0,scanOn=false,ph=0,S,obj=[],decor=[],parts=[],showCards=true,pause=false,cardI=0,fT=0,seen={},shake=0,flash=0,swipe=null;
for(let i=0;i<46;i++)decor.push({lat:(rnd()<.5?-1:1)*(1.9+rnd()*2.4),t:rnd(),r:.5+rnd()*.8});
function reset(){finished=false;queue=[];hits={s:0,sh:0,b:0};autoUses=0;objs=[0,1,2,3].sort(()=>rnd()-.5).slice(0,2);S={minHull:100,time:RUN,m:0,sp:3.6,lane:0,rx:0,hull:100,wh:100,ch:0,auto:0,samples:0,slow:0,next:.4,hit:0};obj=[];parts=[];seen={};shake=0;flash=0}
const ty=t=>HY+(YB-HY)*t*t,sc=t=>.06+.94*t*t,lx=(lane,t)=>W/2+lane*250*sc(t);
function fact(i,force){if(seen[i]&&!force)return;seen[i]=1;const f=T.f[i];$("fact").innerHTML=`<b>${f[0]}</b>${f[1]}<br><small style="opacity:.65">💡 NASA · ${f[2]}</small>`;$("fact").classList.add("on");clearTimeout(fT);fT=setTimeout(()=>$("fact").classList.remove("on"),7000)}
function setLang(l){l=(l||"").slice(0,2);lg=L[l]?l:"en";T=L[lg];document.documentElement.lang=lg;labels();if(ph===0)intro();else if(ph===2)end();else if(pause)card()}
/* ---------- input ---------- */
function mv(d){if(ph!==1||pause)return;S.lane=clamp(S.lane+d,-1,1)}
function useAuto(){if(ph===1&&!pause&&S.ch>=100&&S.auto<=0){S.auto=5;S.ch=0;autoUses++;fact(3,1)}}
addEventListener("keydown",e=>{if(["ArrowLeft","KeyA"].includes(e.code)){mv(-1);e.preventDefault()}if(["ArrowRight","KeyD"].includes(e.code)){mv(1);e.preventDefault()}if(["Space","ArrowUp","KeyW"].includes(e.code)){useAuto();e.preventDefault()}if(e.code==="Enter"&&pause)nextCard()});
document.querySelectorAll("[data-t]").forEach(b=>b.addEventListener("pointerdown",e=>{e.preventDefault();const k=b.dataset.t;if(k==="l")mv(-1);if(k==="r")mv(1);if(k==="auto")useAuto()}));
cv.addEventListener("pointerdown",e=>{swipe={x:e.clientX,id:e.pointerId}});
addEventListener("pointermove",e=>{if(swipe&&Math.abs(e.clientX-swipe.x)>38){mv(e.clientX>swipe.x?1:-1);swipe.x=e.clientX}});addEventListener("pointerup",()=>{swipe=null});
document.addEventListener("contextmenu",e=>e.preventDefault());
/* ---------- screens ---------- */
function labels(){$("l1").textContent=T.hull;$("l2").textContent=T.wheels;$("l3").textContent=T.auto;$("ba").textContent="🧭 "+T.autoB}
function card(){const c=T.cards[cardI];$("card").style.display="block";$("card").innerHTML=`<small>${cardI+1}/${T.cards.length}</small><b>${c[0]}</b><p>${c[1]}</p><button class="btn big" id="cn">${cardI===T.cards.length-1?"▶ "+T.go:T.next}</button>`;$("cn").onclick=nextCard}
function nextCard(){if(cardI<T.cards.length-1){cardI++;card()}else{pause=false;$("card").style.display="none";fact(0)}}
function intro(){ph=0;$("ov").style.display="flex";$("wrap").classList.add("idle");
 $("ovc").innerHTML=`<div class="lgs">${["en","ru","tg"].map(l=>`<button class="btn sm${l===lg?" on":""}" data-lg="${l}">${{en:"EN",ru:"RU",tg:"TJ"}[l]}</button>`).join("")}</div><h1>${T.t}</h1><p>${T.sub}</p><p class="rknote">${rk()}</p><ol>${T.how.map(x=>`<li>${x}</li>`).join("")}</ol><div class="row"><button class="btn big" id="h1">${T.start}</button><button class="btn" id="h2">${T.skip}</button></div>${RC().replace(" open","")}`;
 $("h1").onclick=()=>brief(true);$("h2").onclick=()=>brief(false)}
const rk=()=>{const B=window.DuneBridge;let c={ok:false,why:"phase"};try{c=B.roverCan()}catch(_){}return c.ok?T.costOk.replace("{n}",B.RV_COST||8):(c.why==="used"?T.costUsed:c.why==="energy"?T.costLow:T.costFree)};
const RC=()=>`<details class="rc" open><summary>🔎 ${T.rc}</summary><b>✅ ${T.rr}</b><ul>${T.real.map(x=>`<li>${x}</li>`).join("")}</ul><b>🎮 ${T.rs}</b><ul>${T.sim.map(x=>`<li>${x}</li>`).join("")}</ul></details>`;
function brief(cards){showCards=cards;ph=0;$("wrap").classList.add("idle");$("ov").style.display="flex";
 $("ovc").innerHTML=`<h1>${T.brief[0]}</h1><p>${T.brief[1]}</p><p class="rknote">${rk()}</p><canvas id="mp" width="640" height="220" style="width:100%;max-width:560px;border-radius:12px;border:1px solid rgba(255,220,180,.3)"></canvas><p style="font-size:.85em;opacity:.8">▭ ${T.legend[0]} · ● ${T.legend[1]} · ▲ ${T.legend[2]} · ◆ ${T.legend[3]}</p><div class="row">${T.routes.map((r,i)=>`<button class="btn big" data-rt="${i}" style="max-width:300px">${i?"⛰":"🏜"} ${r[0]}<br><small style="font-weight:400">${r[1]}</small></button>`).join("")}</div>`;
 drawMap(0);document.querySelectorAll("[data-rt]").forEach(b=>{b.onmouseenter=()=>drawMap(+b.dataset.rt);b.onclick=()=>run(showCards,+b.dataset.rt)})}
function drawMap(r){const c=$("mp");if(!c)return;const g=c.getContext("2d");let sd=r?91:37;const q=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const bg=g.createLinearGradient(0,0,0,220);bg.addColorStop(0,"#c98a58");bg.addColorStop(1,"#8a4a2c");g.fillStyle=bg;g.fillRect(0,0,640,220);g.fillStyle="rgba(0,0,0,.08)";for(let i=0;i<200;i++)g.fillRect(q()*640,q()*220,2,2);
 g.fillStyle="#fff";g.font="700 12px MMSans,system-ui";g.fillText("N ↑",10,18);g.fillText(T.mapT,570,18);
 const pt=x=>110+Math.sin(x/80+(r?1.5:0))*45;
 for(let i=0;i<(r?4:7);i++){const x=120+q()*400,y=pt(x)+(q()-.5)*70;g.setLineDash([6,4]);g.strokeStyle="#ff6a5a";g.fillStyle="rgba(240,205,150,.8)";g.beginPath();g.ellipse(x,y,r?18:34,r?9:15,0,0,7);g.fill();g.stroke();g.setLineDash([])}
 for(let i=0;i<(r?24:8);i++){const x=100+q()*440,y=pt(x)+(q()-.5)*90;g.fillStyle="#5a4036";g.beginPath();g.arc(x,y,r?7:6,0,7);g.fill()}
 for(let i=0;i<(r?12:4);i++){const x=100+q()*440,y=pt(x)+(q()-.5)*80;g.fillStyle="#2c2c34";g.beginPath();g.moveTo(x-6,y+6);g.lineTo(x,y-8);g.lineTo(x+6,y+6);g.fill()}
 for(let i=0;i<(r?6:3);i++){const x=130+q()*380,y=pt(x)+(q()-.5)*60;g.fillStyle="#7ff0dc";g.beginPath();g.moveTo(x,y-9);g.lineTo(x+7,y);g.lineTo(x,y+9);g.lineTo(x-7,y);g.fill()}
 g.strokeStyle="#ffffff";g.lineWidth=3;g.setLineDash([10,7]);g.beginPath();for(let x=40;x<=600;x+=6)x===40?g.moveTo(x,pt(x)):g.lineTo(x,pt(x));g.stroke();g.setLineDash([]);
 g.fillStyle="#6cc070";g.beginPath();g.arc(40,pt(40),9,0,7);g.fill();g.fillStyle="#ffd24a";g.beginPath();g.arc(600,pt(600),9,0,7);g.fill()}
function run(cards,rt){ranked=!!(window.DuneBridge&&DuneBridge.roverStart());showCards=cards;route=rt||0;reset();ph=1;$("ov").style.display="none";$("wrap").classList.remove("idle");cardI=0;if(cards){pause=true;card()}else{pause=false;$("card").style.display="none";fact(0)}}
function end(){ph=2;pause=false;$("card").style.display="none";$("wrap").classList.add("idle");$("fact").classList.remove("on");
 const m=Math.round(S.m),lost=S.hull<=0||S.wh<=0,nav=clamp(100-12*(hits.s+hits.sh)-20*Math.max(0,autoUses-2),0,100),os=objState(),
  chosen=objs.filter(i=>os[i]).length,sc2=Math.round(clamp(m/412,0,1)*40+clamp(S.samples/8,0,1)*20+(Math.max(0,S.hull)+Math.max(0,S.wh))/2*.2+nav*.2+chosen*3),
  rate=lost?"D":sc2>=85?"A":sc2>=70?"B":sc2>=50?"C":"D",mat=Math.round(sc2/6+S.samples),why=S.hull<=0?T.crash:S.wh<=0?T.wornT:m>=348?T.win:T.done,
  navT=nav>=80?T.navT[0]:nav>=55?T.navT[1]:T.navT[2],detail={meters:m,samples:S.samples,materials:mat,hull:Math.round(Math.max(0,S.hull)),wheels:Math.round(Math.max(0,S.wh)),rating:rate,score:sc2};
 const lines=[[T.objMain.replace("{n}",348),m>=348],...objs.map(i=>[T.o[i].replace("{n}",3),os[i]])].map(a=>`<li>${a[1]?"✅":"❌"} ${a[0]}</li>`).join("");
 let rw=null;if(ranked&&!finished){finished=true;const B=window.DuneBridge;try{rw=B.roverFinish(rate)}catch(_){rw={shield:0,sci:0}}try{parent.postMessage({mmDune:"award",k:"rover",v:m},"*")}catch(_){}}
 const rwHTML=ranked&&rw?`<div class="rwd"><b>${T.rw}</b><span>🛡️ +${rw.shield}</span><span>🔬 ${T.visit}</span>${rw.sci?`<span class="new">✨ ${T.disc.replace("{n}",rw.sci)}</span>`:""}<span>📏 +${m} ${T.mtot}</span></div>`:`<div class="rwd off">${T.prac}</div>`;
 $("ov").style.display="flex";$("ovc").innerHTML=`<h1>${T.t}</h1><p><b>${why}</b></p><p style="font-size:.9em">${T.rating}</p><div class="rate r${rate}">${rate}</div>
 <div class="res" style="grid-template-columns:repeat(2,1fr)"><div><b>${m} m</b>${T.r[0]}</div><div><b>${S.samples}</b>${T.sci}</div><div><b>${Math.round(Math.max(0,S.hull))}% / ${Math.round(Math.max(0,S.wh))}%</b>${T.safe} (${T.hull} / ${T.wheels})</div><div><b>${navT}</b>${T.nav}</div></div>
 <ul style="width:100%"><b>${T.objR}</b>${lines}</ul>${rwHTML}<details class="rc"><summary>🔎 ${T.rc}</summary><b>✅ ${T.rr}</b><ul>${T.real.map(x=>`<li>${x}</li>`).join("")}</ul><b>🎮 ${T.rs}</b><ul>${T.sim.map(x=>`<li>${x}</li>`).join("")}</ul><div id="src"><b>${T.srcT}</b>${SRC.map(a=>`<a href="${a[1]}" target="_blank" rel="noopener">↗ ${a[0]}</a>`).join("")}</div></details><div class="row"><button class="btn big" id="bk">🏠 ${T.back}</button>${ranked?"":`<button class="btn" id="h1">▶ ${T.again}</button>`}</div>`;
 $("bk").onclick=()=>{try{DuneBridge.go("hub")}catch(_){}};const ag=$("h1");if(ag)ag.onclick=()=>brief(showCards)}
$("ov").addEventListener("click",e=>{const b=e.target.closest("[data-lg]");if(b)setLang(b.dataset.lg)});
window.RoverRun={version:"2.0",start:()=>run(false,0),setLang};
/* ---------- simulation ---------- */
function row(r){r.forEach((ty,i)=>{if(ty)obj.push({lane:i-1,t:0,type:ty})})}
function pat(){const f=[-1,0,1][rnd()*3|0],r=rnd(),mk=x=>[0,1,2].map(i=>i-1===f?null:x);
 if(r<.25)return[mk("boulder"),[null,null,null],mk("boulder")];            // narrow pass between boulders
 if(r<.5)return[mk("sharp"),mk("sharp"),mk("sharp")];                        // cluster of small sharp rocks
 if(r<.7)return[mk("sand"),mk("sand")];                                      // wide sand area
 return[0,1,2].map(i=>{const a=[null,null,null];a[(i+f+1)%3]="sample";return a})}   // trail of science targets
function spawn(){
 if(queue.length)return row(queue.shift());
 if(rnd()<.3&&S.time<RUN-8){queue=pat();return row(queue.shift())}
 const hz=S.time<RUN-25?2:1,lanes=[-1,0,1].sort(()=>rnd()-.5),n=rnd()<.55?hz:1,w=route?[.4,.85]:[.25,.5];
 for(let i=0;i<n;i++){const r=rnd(),type=r<w[0]?"boulder":r<w[1]?"sharp":"sand";obj.push({lane:lanes[i],t:0,type})}
 if(n<3&&rnd()<(route?.7:.5))obj.push({lane:lanes[n],t:0,type:"sample"})}
function safeLane(){let best=S.lane,bs=-1e9;for(const l of[-1,0,1]){let s2=-Math.abs(l-S.lane)*.4;for(const o of obj)if(o.lane===l&&o.t>.35&&o.t<.97)s2+=o.type==="sample"?3:-9;if(s2>bs){bs=s2;best=l}}return best}
function step(dt){
 if(ph!==1||pause)return;
 S.time-=dt;if(S.time<=0){S.time=0;return end()}
 S.slow=Math.max(0,S.slow-dt);S.hit=Math.max(0,S.hit-dt);shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt);
 const base=3.6+(RUN-S.time)*.045,wm=S.wh<25?.65:S.wh<50?.85:1,sp=(S.auto>0?base*.85:base)*(S.slow>0?.4:1)*wm;S.minHull=Math.min(S.minHull,S.hull);S.sp+=(sp-S.sp)*Math.min(1,dt*3);S.m+=S.sp*dt;
 S.next-=dt*S.sp/4.6;if(S.next<=0){spawn();S.next=.75+rnd()*.5}
 /* AutoNav: steer by itself toward the safest lane */
 if(S.auto>0){S.auto-=dt;S.lane=safeLane()}
 S.rx+=(S.lane-S.rx)*Math.min(1,dt*9);
 const vt=S.sp/4.6/2.4*1.9;
 for(const o of obj){o.t+=vt*dt;
  if(!o.done&&o.t>.84&&o.t<1.02&&Math.abs(o.lane-S.rx)<.6){o.done=1;
   if(o.type==="boulder"){hits.b++;S.hull-=34;shake=.5;flash=.4;S.slow=1;S.hit=1;fact(5)}
   else if(o.type==="sharp"){hits.sh++;S.wh-=16;shake=.3;flash=.25;fact(2)}
   else if(o.type==="sand"){hits.s++;S.slow=1.8;fact(4)}
   else{S.samples++;S.ch=Math.min(100,S.ch+25);S.m+=6;for(let i=0;i<16;i++)parts.push({x:W/2+S.rx*250,y:YB-30,vx:(rnd()-.5)*160,vy:-60-rnd()*110,l:.8,c:1})}}}
 obj=obj.filter(o=>o.t<1.15);
 for(const d of decor){d.t+=vt*dt*.9;if(d.t>1.2){d.t=0;d.lat=(rnd()<.5?-1:1)*(1.9+rnd()*2.4)}}
 if(rnd()<.8)parts.push({x:W/2+S.rx*250+(rnd()-.5)*90,y:YB-4,vx:(rnd()-.5)*40,vy:-20-rnd()*30,l:.6});
 parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=120*dt;p.l-=dt});parts=parts.filter(p=>p.l>0);
 if(S.time<RUN-3)fact(1);if(S.m>60)fact(6);if(S.m>200)fact(7);if(S.m>150)fact(3);
 if(S.hull<=0||S.wh<=0){S.hull=Math.max(0,S.hull);S.wh=Math.max(0,S.wh);end()}
}
/* ---------- drawing ---------- */
const INK="#2a1511";
function rock(x,y,r,h){
 cx.fillStyle="rgba(60,20,10,.28)";cx.beginPath();cx.ellipse(x+r*.2,y,r*1.25,r*.24,0,0,7);cx.fill();
 const g=cx.createLinearGradient(x-r,y-r*1.3,x+r,y);g.addColorStop(0,h?"#e6a47a":"#dc9a70");g.addColorStop(1,"#a95a3f");
 cx.fillStyle=g;cx.strokeStyle=INK;cx.lineWidth=Math.max(1.2,r*.07);cx.lineJoin="round";
 cx.beginPath();cx.moveTo(x-r,y);cx.quadraticCurveTo(x-r*.95,y-r*1.15,x-r*.2,y-r*1.3);cx.quadraticCurveTo(x+r*.9,y-r*1.25,x+r,y);cx.closePath();cx.fill();cx.stroke();
 cx.fillStyle="rgba(255,235,210,.35)";cx.beginPath();cx.ellipse(x-r*.3,y-r*.85,r*.32,r*.16,-.5,0,7);cx.fill();
 cx.strokeStyle="rgba(42,21,17,.45)";cx.lineWidth=Math.max(1,r*.04);cx.beginPath();cx.moveTo(x+r*.1,y-r*1.1);cx.lineTo(x+r*.25,y-r*.6);cx.lineTo(x+r*.05,y-r*.3);cx.stroke()}
function crater(x,y,r){
 cx.fillStyle="#7a3320";cx.strokeStyle=INK;cx.lineWidth=Math.max(1,r*.06);cx.beginPath();cx.ellipse(x,y,r,r*.28,0,0,7);cx.fill();cx.stroke();
 cx.fillStyle="#5a2216";cx.beginPath();cx.ellipse(x,y+r*.03,r*.78,r*.19,0,0,7);cx.fill();
 cx.strokeStyle="#e9a77a";cx.lineWidth=Math.max(1,r*.05);cx.beginPath();cx.ellipse(x,y-r*.03,r*1.02,r*.3,0,3.3,6.1);cx.stroke()}
function drawObj(o){const t=o.t,y=ty(t),x=lx(o.lane,t),k=sc(t),a=scanOn;
 if(o.type==="boulder"){rock(x,y,56*k,0);if(t>.3)box(x,y-56*k,64*k,"#ff6a5a",a)}
 else if(o.type==="sharp"){const vis=a?1:clamp((t-.45)/.12,0,1);if(vis<=0)return;cx.globalAlpha=vis;const r=26*k;cx.fillStyle="rgba(60,20,10,.3)";cx.beginPath();cx.ellipse(x,y,r*1.2,r*.2,0,0,7);cx.fill();
  cx.lineJoin="round";cx.lineWidth=Math.max(1.2,r*.1);cx.strokeStyle=INK;
  [-1,0,1].forEach((d,i)=>{const hh=r*(1.5-Math.abs(d)*.4),bx=x+d*r*.7;const g=cx.createLinearGradient(bx-r*.4,y,bx+r*.4,y);g.addColorStop(0,i===1?"#3b3654":"#4a4566");g.addColorStop(1,"#26223a");cx.fillStyle=g;
   cx.beginPath();cx.moveTo(bx-r*.42,y);cx.lineTo(bx-r*.05,y-hh);cx.lineTo(bx+r*.42,y);cx.closePath();cx.fill();cx.stroke();
   cx.fillStyle="rgba(190,200,255,.4)";cx.beginPath();cx.moveTo(bx-r*.05,y-hh);cx.lineTo(bx+r*.12,y-r*.45);cx.lineTo(bx-r*.1,y-r*.45);cx.closePath();cx.fill()});
  cx.globalAlpha=1;if(a&&t>.3)box(x,y-26*k,40*k,"#ffd24a",a)}
 else if(o.type==="sand"){const w=140*k;cx.fillStyle="rgba(244,214,150,.88)";cx.beginPath();cx.ellipse(x,y,w,w*.2,0,0,7);cx.fill();cx.strokeStyle="rgba(226,70,50,.9)";cx.lineWidth=Math.max(1.4,3.4*k);cx.setLineDash([8*k+2,6*k+2]);cx.beginPath();cx.ellipse(x,y,w,w*.2,0,0,7);cx.stroke();cx.setLineDash([]);cx.strokeStyle="rgba(150,100,50,.45)";cx.lineWidth=Math.max(1,2*k);for(let i=-2;i<=2;i++){cx.beginPath();cx.moveTo(x-w*.8,y+i*w*.05);cx.quadraticCurveTo(x,y+i*w*.05-w*.07,x+w*.8,y+i*w*.05);cx.stroke()}}
 else{const r=24*k,gl=cx.createRadialGradient(x,y-r,2,x,y-r,r*2.4);gl.addColorStop(0,"rgba(120,255,230,.85)");gl.addColorStop(1,"rgba(120,255,230,0)");cx.fillStyle=gl;cx.fillRect(x-r*2.5,y-r*3.5,r*5,r*5);
  cx.fillStyle="#7ff0dc";cx.strokeStyle=INK;cx.lineWidth=Math.max(1.4,3*k);cx.lineJoin="round";cx.beginPath();cx.moveTo(x,y-r*2);cx.lineTo(x+r*.8,y-r);cx.lineTo(x,y);cx.lineTo(x-r*.8,y-r);cx.closePath();cx.fill();cx.stroke();
  cx.fillStyle="rgba(255,255,255,.65)";cx.beginPath();cx.moveTo(x,y-r*1.85);cx.lineTo(x-r*.5,y-r*1.05);cx.lineTo(x-r*.12,y-r*1.05);cx.closePath();cx.fill()}}
function box(x,y,s,c,a){if(!a)return;cx.strokeStyle=c;cx.lineWidth=2;cx.strokeRect(x-s,y-s*.9,s*2,s*1.1)}
function ridge(off,base,amp,fill,i,sp){cx.fillStyle=fill;cx.strokeStyle="#5a2a2a";cx.lineWidth=2;cx.lineJoin="round";cx.beginPath();cx.moveTo(0,HY+2);
 for(let x=0;x<=W;x+=12){const w=x+off*sp;cx.lineTo(x,HY-base*(.45+.4*Math.sin(w/150+i)+.2*Math.sin(w/47)+.12*Math.abs(Math.sin(w/23))))}cx.lineTo(W,HY+2);cx.closePath();cx.fill();cx.stroke()}
const STARS=[];for(let i=0;i<40;i++)STARS.push([rnd()*W,rnd()*HY*.55,.5+rnd()*1.2]);
function scene(){
 const sh=shake>0?(rnd()-.5)*10*shake:0;cx.save();cx.translate(sh,sh);
 const sk=cx.createLinearGradient(0,0,0,HY);sk.addColorStop(0,"#3a2058");sk.addColorStop(.45,"#9a4a62");sk.addColorStop(.8,"#e9895a");sk.addColorStop(1,"#f7bd82");cx.fillStyle=sk;cx.fillRect(0,0,W,HY+4);
 cx.fillStyle="rgba(255,240,230,.55)";STARS.forEach(s=>{cx.beginPath();cx.arc(s[0],s[1],s[2],0,7);cx.fill()});
 const sg=cx.createRadialGradient(700,118,3,700,118,190);sg.addColorStop(0,"rgba(255,248,230,1)");sg.addColorStop(.1,"rgba(255,222,170,.75)");sg.addColorStop(.35,"rgba(255,170,110,.3)");sg.addColorStop(1,"rgba(255,150,90,0)");cx.fillStyle=sg;cx.fillRect(460,0,500,HY);
 cx.fillStyle="#fffaf0";cx.beginPath();cx.arc(700,118,15,0,7);cx.fill();
 const off=S.m*.4+S.rx*30;ridge(off,80,1,"#b5605a",0,.15);ridge(off,50,1,"#c9704f",1,.35);
 const g=cx.createLinearGradient(0,HY,0,H);g.addColorStop(0,"#e0804e");g.addColorStop(.3,"#c8613a");g.addColorStop(1,"#8e3a24");cx.fillStyle=g;cx.fillRect(0,HY,W,H-HY);
 cx.strokeStyle=INK;cx.lineWidth=2;cx.beginPath();cx.moveTo(0,HY);cx.lineTo(W,HY);cx.stroke();
 const ph0=(S.m*.12)%1;for(let i=0;i<14;i++){const t0=(i+ph0)/14,t1=(i+1+ph0)/14;if(i%2){cx.fillStyle="rgba(90,30,12,.10)";cx.fillRect(0,ty(Math.min(1,t0)),W,ty(Math.min(1,t1))-ty(Math.min(1,t0)))}}
 cx.fillStyle="rgba(100,36,18,.34)";cx.beginPath();cx.moveTo(lx(-1.5,0),HY);cx.lineTo(lx(1.5,0),HY);cx.lineTo(lx(1.5,1),YB+40);cx.lineTo(lx(-1.5,1),YB+40);cx.fill();
 cx.strokeStyle="rgba(255,228,190,.42)";cx.lineWidth=2.5;[-.5,.5].forEach(l=>{cx.setLineDash([14,14]);cx.lineDashOffset=-S.m*8;cx.beginPath();cx.moveTo(lx(l,0),HY);cx.lineTo(lx(l,1),YB+40);cx.stroke()});cx.setLineDash([]);
 [...decor].sort((a,b)=>a.t-b.t).forEach(d=>{const x=W/2+d.lat*250*sc(d.t),y=ty(d.t);if(d.t>0.03){if(((d.r*1000)|0)%4===0)crater(x,y,60*sc(d.t)*d.r);else rock(x,y,16*sc(d.t)*d.r*3,0)}});
 const all=[...obj].sort((a,b)=>a.t-b.t);all.forEach(drawObj);
 if(S.auto>0){cx.strokeStyle="rgba(120,255,150,.95)";cx.lineWidth=4;cx.setLineDash([10,8]);cx.lineDashOffset=-S.m*10;cx.beginPath();cx.moveTo(lx(S.rx,.3),ty(.3));cx.lineTo(lx(S.lane,.6),ty(.6));cx.lineTo(lx(S.lane,1),YB);cx.stroke();cx.setLineDash([]);cx.fillStyle="#fff";cx.strokeStyle=INK;cx.lineWidth=4;cx.font="900 14px MMSans,MMSans,system-ui";cx.strokeText("◉ AUTONAV",18,HY+30);cx.fillText("◉ AUTONAV",18,HY+30)}
 scanOn=S.auto>0||(S.ch>=100&&ph===1&&!pause);
 if(S.ch>=100&&S.auto<=0&&ph===1&&!pause){const sl=safeLane(),yy=HY+((S.time*.9)%1)*(YB-HY);const sg2=cx.createLinearGradient(0,yy-24,0,yy);sg2.addColorStop(0,"rgba(120,255,150,0)");sg2.addColorStop(1,"rgba(120,255,150,.45)");cx.fillStyle=sg2;cx.fillRect(0,yy-24,W,24);
  cx.strokeStyle="rgba(120,255,150,.9)";cx.lineWidth=4;cx.setLineDash([10,8]);cx.beginPath();cx.moveTo(lx(S.rx,.3),ty(.3));cx.lineTo(lx(sl,.6),ty(.6));cx.lineTo(lx(sl,1),YB);cx.stroke();cx.setLineDash([]);
  cx.fillStyle="#fffdf9";cx.strokeStyle=INK;cx.lineWidth=3;cx.beginPath();cx.roundRect(14,HY+14,340,52,14);cx.fill();cx.stroke();cx.fillStyle="#1f7a3a";cx.font="900 15px MMSans,MMSans,system-ui";cx.fillText("◉ "+T.scan[0],26,HY+36);cx.font="700 12px MMSans,MMSans,system-ui";cx.fillStyle="#5b4636";cx.fillText(T.scan[1],26,HY+56)}
 rover();
 parts.forEach(p=>{cx.fillStyle=p.c?"rgba(127,240,220,"+p.l+")":`rgba(235,160,110,${p.l})`;cx.beginPath();cx.arc(p.x,p.y,p.c?3:3+p.l*3,0,7);cx.fill()});
 if(S.slow>0&&S.hit<=0){cx.fillStyle="#ffd24a";cx.strokeStyle=INK;cx.lineWidth=4;cx.font="900 20px MMSans,MMSans,system-ui";cx.textAlign="center";cx.strokeText("⚠ SAND",W/2,HY+60);cx.fillText("⚠ SAND",W/2,HY+60);cx.textAlign="left"}
 const v=cx.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*1);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(40,10,10,.32)");cx.fillStyle=v;cx.fillRect(0,0,W,H);
 if(S.hull<50){const a=(S.hull<25?.5:.25)*(.6+.4*Math.sin(S.time*(S.hull<25?12:6)));const rg=cx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.9);rg.addColorStop(0,"rgba(255,0,0,0)");rg.addColorStop(1,`rgba(255,40,30,${a})`);cx.fillStyle=rg;cx.fillRect(0,0,W,H);cx.fillStyle="#fff";cx.strokeStyle="#b3261e";cx.lineWidth=5;cx.font="900 16px MMSans,MMSans,system-ui";cx.textAlign="center";cx.strokeText(T.warnH,W/2,HY+90);cx.fillText(T.warnH,W/2,HY+90);cx.textAlign="left"}
 if(S.wh<50){cx.fillStyle="#ffd24a";cx.strokeStyle=INK;cx.lineWidth=4;cx.font="900 15px MMSans,MMSans,system-ui";cx.textAlign="center";cx.strokeText(T.warnW,W/2,HY+112);cx.fillText(T.warnW,W/2,HY+112);cx.textAlign="left"}
 if(flash>0){cx.fillStyle=`rgba(255,70,50,${flash*.7})`;cx.fillRect(0,0,W,H)}
 cx.restore()}
function rover(){const x=W/2+S.rx*250,y=YB,w=Math.sin(S.m*3)*1.2;cx.save();cx.translate(x,y);cx.rotate((S.lane-S.rx)*.06);cx.lineJoin="round";cx.strokeStyle=INK;
 cx.fillStyle="rgba(60,20,10,.38)";cx.beginPath();cx.ellipse(0,6,96,14,0,0,7);cx.fill();
 /* suspension bars */
 cx.lineWidth=5;[-1,1].forEach(s=>{cx.beginPath();cx.moveTo(s*70,-32);cx.lineTo(s*66,-14+w*s);cx.moveTo(s*62,-50);cx.lineTo(s*62,-36);cx.stroke()});
 [-1,1].forEach(s=>[0,1,2].forEach(i=>{const px=s*(72-i*4),py=-18-i*9+w*s;
  cx.fillStyle="#2d2a32";cx.lineWidth=3;cx.beginPath();cx.roundRect(px-13,py-15,26,32,8);cx.fill();cx.stroke();
  cx.strokeStyle="#4b4753";cx.lineWidth=2;for(let k=-11;k<=11;k+=6){cx.beginPath();cx.moveTo(px-13,py+k);cx.lineTo(px+13,py+k+((S.m*8)%6));cx.stroke()}cx.strokeStyle=INK;
  cx.fillStyle="#cbbfae";cx.lineWidth=2;cx.beginPath();cx.arc(px,py,5,0,7);cx.fill();cx.stroke()}));
 /* body */
 const g=cx.createLinearGradient(0,-100,0,-34);g.addColorStop(0,"#fbf4e6");g.addColorStop(1,"#d3c2a8");cx.fillStyle=g;cx.lineWidth=3.5;cx.beginPath();cx.roundRect(-64,-98,128,64,12);cx.fill();cx.stroke();
 cx.fillStyle="#c4562e";cx.fillRect(-62,-56,124,6);cx.strokeStyle=INK;cx.lineWidth=2;cx.strokeRect(-62,-56,124,6);
 cx.fillStyle="#23405f";cx.lineWidth=2.5;cx.beginPath();cx.roundRect(-52,-88,40,24,6);cx.fill();cx.stroke();cx.fillStyle="rgba(180,225,255,.45)";cx.beginPath();cx.moveTo(-48,-86);cx.lineTo(-30,-86);cx.lineTo(-40,-66);cx.lineTo(-50,-66);cx.fill();
 cx.fillStyle="#e7ddc9";cx.beginPath();cx.roundRect(10,-90,46,36,6);cx.fill();cx.stroke();cx.strokeStyle="rgba(42,21,17,.5)";cx.lineWidth=2;for(let i=0;i<4;i++){cx.beginPath();cx.moveTo(15,-84+i*8);cx.lineTo(51,-84+i*8);cx.stroke()}cx.strokeStyle=INK;
 cx.fillStyle="#ffb24a";[-56,56].forEach(px=>{cx.beginPath();cx.arc(px,-42,4,0,7);cx.fill();cx.stroke()});
 /* solar deck */
 cx.fillStyle="#35588c";cx.lineWidth=3;cx.beginPath();cx.moveTo(-58,-98);cx.lineTo(58,-98);cx.lineTo(46,-122);cx.lineTo(-46,-122);cx.closePath();cx.fill();cx.stroke();
 cx.strokeStyle="rgba(190,215,255,.55)";cx.lineWidth=1.5;for(let i=1;i<6;i++){const f=i/6,xa=-58+116*f,xb=-46+92*f;cx.beginPath();cx.moveTo(xa,-98);cx.lineTo(xb,-122);cx.stroke()}cx.beginPath();cx.moveTo(-52,-110);cx.lineTo(52,-110);cx.stroke();
 /* mast and camera head */
 cx.strokeStyle=INK;cx.lineWidth=7;cx.beginPath();cx.moveTo(0,-122);cx.lineTo(0,-148);cx.stroke();cx.strokeStyle="#efe6d8";cx.lineWidth=3;cx.beginPath();cx.moveTo(0,-122);cx.lineTo(0,-148);cx.stroke();
 cx.strokeStyle=INK;cx.fillStyle="#efe6d8";cx.lineWidth=3;cx.beginPath();cx.roundRect(-22,-166,44,20,6);cx.fill();cx.stroke();
 [-10,10].forEach(px=>{cx.fillStyle="#23405f";cx.beginPath();cx.arc(px,-156,6,0,7);cx.fill();cx.stroke();cx.fillStyle="#9ed4ff";cx.beginPath();cx.arc(px-2,-158,2,0,7);cx.fill()});
 if(S.auto>0){cx.strokeStyle="rgba(120,255,150,.9)";cx.lineWidth=2.5;cx.beginPath();cx.arc(0,-156,22+4*Math.sin(S.m*9),0,7);cx.stroke()}cx.restore()}
function objState(){const ok=[S.samples>=3,S.minHull>=60,autoUses<=2,hits.s===0];return ok}
function hud(){const os=objState(),fm=(s,d)=>`<div>${d?"✓":"▫"} ${s}</div>`;
 $("objp").innerHTML=`<b>${T.objT}</b>`+fm(T.objMain.replace("{n}",348)+" ("+Math.round(S.m)+")",S.m>=348)+objs.map(i=>{const d=os[i],bad=(i===1&&S.minHull<60)||(i===2&&autoUses>2)||(i===3&&hits.s>0);return `<div style="${bad?"opacity:.55;text-decoration:line-through":""}">${d&&i===0?"✓":d?"▫":"▫"} ${T.o[i].replace("{n}",3)}${i===0?" ("+S.samples+"/3)":i===2?" ("+autoUses+"/2)":""}</div>`}).join("");$("tm").textContent=Math.ceil(S.time);$("mt").textContent=Math.round(S.m);$("sm").textContent=S.samples;$("sp").textContent="🚙 "+(S.sp*.8).toFixed(1)+" m/s";
 const set=(i,v,c)=>{$("g"+i).style.width=clamp(v,0,100)+"%";if(c)$("g"+i).style.background=c};
 set(1,S.hull,S.hull<35?"#ff5a4d":"#6cc070");set(2,S.wh,S.wh<35?"#ff5a4d":"#6cc070");set(3,S.auto>0?S.auto/5*100:S.ch,"#4aa8ff");$("ba").classList.toggle("rdy",S.ch>=100&&S.auto<=0)}
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;if(S){step(dt);scene();hud()}requestAnimationFrame(loop)}
reset();(function(){let l="en";try{l=window.parent.__mmLang||l}catch(_){}setLang(new URLSearchParams(location.search).get("lang")||l)})();
addEventListener("message",e=>{const d=e.data;if(d&&typeof d.mmLang==="string"&&e.source===window.parent)setLang(d.mmLang)});
intro();requestAnimationFrame(loop);
