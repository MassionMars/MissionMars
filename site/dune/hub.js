    // =====================================================================
    // 1. СОСТОЯНИЕ РЕСУРСОВ БАЗЫ И ЗВУКОВОЙ СИНТЕЗАТОР (WEB AUDIO API)
    // =====================================================================
    const gameState = {
      life: 70,     // ❤️ Жизнь
      energy: 80,   // ⚡ Энергия
      shield: 75,   // 🛡️ Щит
      science: 10,  // 🧬 Наука
      hearts: 3,    // ❤️ Попытки
      activeDept: 'greenhouse',
      currentCrisis: '1A',
      selectedOption: 1
    };
    Object.assign(gameState, DuneBridge.load());

    // Конфигурация кризисов Комнаты 1 (🌱 ТЕПЛИЦА) и Комнаты 2 (🏥 МЕДПУНКТ)
    const ROOM_CRISES = {
      // ---------------- КОМНАТА 1: 🌱 ТЕПЛИЦА ----------------
      '1A': {
        dept: 'greenhouse',
        code: 'КРИЗИС 1А',
        title: '«Засуха в грядках»',
        subtitle: 'Уровень воды в системе упал, редис и салат вянут! Выбери действие:',
        responsibility: '🌱 Отвечает за: ❤️ Жизнь',
        options: {
          1: {
            title: 'Включить аварийный насос и яркие фитолампы на максимум',
            energyCost: -15,
            lifeReward: 20,
            shieldReward: 0,
            scienceReward: 0,
            minigameId: 1,
            minigameTag: '💧 Игра №1: Поймай капли (10с)',
            targetScore: 8
          },
          2: {
            title: 'Перевести растения в режим экономии и вручную опылить ростки',
            energyCost: -5,
            lifeReward: 10,
            shieldReward: 0,
            scienceReward: 0,
            minigameId: 2,
            minigameTag: '🥬 Игра №2: Собери урожай (10с)',
            targetScore: 8
          }
        }
      },
      '1B': {
        dept: 'greenhouse',
        code: 'КРИЗИС 1Б',
        title: '«Лопнула труба полива»',
        subtitle: 'Вода течёт мимо грядок, растения сохнут! Выбери действие:',
        responsibility: '🌱 Отвечает за: ❤️ Жизнь',
        options: {
          1: {
            title: 'Починить трубы и направить воду к грядкам',
            energyCost: -18,
            lifeReward: 18,
            shieldReward: 0,
            scienceReward: 0,
            minigameId: 9,
            minigameTag: '🚰 Полив по трубам (10с)',
            targetScore: 1
          },
          2: {
            title: 'Пересадить культуры по схеме без повторов',
            energyCost: -8,
            lifeReward: 12,
            shieldReward: 0,
            scienceReward: 0,
            minigameId: 10,
            minigameTag: '🥬 Грядки по схеме (10с)',
            targetScore: 1
          }
        }
      },

      // ---------------- КОМНАТА 2: 🏥 МЕДПУНКТ ----------------
      '2A': {
        dept: 'medbay',
        code: 'КРИЗИС 2А',
        title: '«Космическая бессонница и усталость»',
        subtitle: 'Из-за изоляции и радиации у экипажа упал иммунитет! Выбери действие:',
        responsibility: '🏥 Отвечает за: ❤️ Жизнь и 🛡️ Щит',
        options: {
          1: {
            title: 'Провести курс светотерапии и витаминных коктейлей',
            energyCost: -15,
            lifeReward: 20,
            shieldReward: 0,
            scienceReward: 0,
            minigameId: 3,
            minigameTag: '🧪 Игра №3: Витаминный микс (10с)',
            targetScore: 3
          },
          2: {
            title: 'Дать экипажу укол антирадиационного протектора',
            energyCost: -10,
            lifeReward: 5,
            shieldReward: 15,
            scienceReward: 0,
            minigameId: 4,
            minigameTag: '💓 Игра №4: Пульс в норме (10с)',
            targetScore: 5
          }
        }
      },
      '2B': {
        dept: 'medbay',
        code: 'КРИЗИС 2Б',
        title: '«Сбой медицинских датчиков»',
        subtitle: 'У астронавтов начался кашель от марсианской пыли! Выбери действие:',
        responsibility: '🏥 Отвечает за: ❤️ Жизнь и 🛡️ Щит',
        options: {
          1: {
            title: 'Поймать ритм пульса вручную',
            energyCost: -15,
            lifeReward: 18,
            shieldReward: 0,
            scienceReward: 0,
            minigameId: 11,
            minigameTag: '❤️ Ритм сердца (10с)',
            targetScore: 5
          },
          2: {
            title: 'Найти ампулу с неверным составом',
            energyCost: -8,
            lifeReward: 12,
            shieldReward: 0,
            scienceReward: 0,
            minigameId: 12,
            minigameTag: '💉 Лишняя ампула (10с)',
            targetScore: 4
          }
        }
      }
    };

    // Web Audio API — синтезатор звуков без внешних файлов
    let audioCtx = null;
    function ensureAudio() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playSound(type) {
      if (!DuneBridge.sfx()) return;
      try {
        ensureAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'good') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.11);
          gain.gain.setValueAtTime(0.16, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'bad') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.linearRampToValueAtTime(110, now + 0.18);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.19);
          osc.start(now);
          osc.stop(now + 0.19);
        } else if (type === 'tick') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(720, now);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (type === 'win') {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, now + idx * 0.08);
            g.gain.setValueAtTime(0.15, now + idx * 0.08);
            g.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.22);
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start(now + idx * 0.08);
            o.stop(now + idx * 0.08 + 0.23);
          });
        } else if (type === 'lose') {
          [320, 260, 200].forEach((freq, idx) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(freq, now + idx * 0.12);
            g.gain.setValueAtTime(0.14, now + idx * 0.12);
            g.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.22);
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start(now + idx * 0.12);
            o.stop(now + idx * 0.12 + 0.23);
          });
        }
      } catch (e) {
        // Игнорируем ошибки автовоспроизведения браузера
      }
    }

    function updateResourceHUD(deltas = {}) {
      _hudPaint(deltas);
      DuneBridge.save(gameState);
    }

    function _hudPaint(deltas = {}) {
      gameState.life = Math.max(0, Math.min(100, gameState.life));
      gameState.energy = Math.max(0, Math.min(100, gameState.energy));
      gameState.shield = Math.max(0, Math.min(100, gameState.shield));
      gameState.science = Math.max(0, gameState.science);

      document.getElementById('hud-life').textContent = gameState.life;
      document.getElementById('hud-energy').textContent = gameState.energy;
      document.getElementById('hud-shield').textContent = gameState.shield;
      document.getElementById('hud-science').textContent = gameState.science;

      document.getElementById('modal-life').textContent = gameState.life;
      document.getElementById('modal-energy').textContent = gameState.energy;
      document.getElementById('modal-shield').textContent = gameState.shield;
      document.getElementById('modal-science').textContent = gameState.science;

      const heartsStr = '❤️'.repeat(gameState.hearts) + '🖤'.repeat(Math.max(0, 3 - gameState.hearts));
      document.getElementById('hud-hearts').innerHTML = heartsStr;
      document.getElementById('modal-hearts').innerHTML = heartsStr;

      // Всплывающие индикаторы (+20 ❤️, +15 🛡️, -15 ⚡ и т.д.)
      ['life', 'energy', 'shield', 'science'].forEach((key) => {
        if (deltas[key]) {
          const el = document.getElementById(`float-${key}`);
          if (el) {
            const val = deltas[key];
            el.textContent = (val > 0 ? `+${val}` : `${val}`);
            el.className = ` absolute -bottom-8 left-1/2 -translate-x-1/2 font-black text-base sm:text-lg resource-float ${val > 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`;
            setTimeout(() => el.classList.add('hidden'), 1150);
          }
        }
      });
    }

    // =====================================================================
    // 2. НАВИГАЦИЯ ПО ОТСЕКАМ БАЗЫ И ПЕРЕКЛЮЧЕНИЕ КРИЗИСОВ (ТЕПЛИЦА И МЕДПУНКТ)
    // =====================================================================
    const DEPARTMENTS = {
      greenhouse: {
        title: 'ТЕПЛИЦА',
        icon: '🌱',
        compId: 'comp-greenhouse'
      },
      medbay: {
        title: 'МЕДПУНКТ',
        icon: '🏥',
        compId: 'comp-medbay'
      },
      lab: {
        title: 'ЛАБОРАТОРИЯ',
        icon: '🔬',
        compId: 'comp-lab'
      },
      airlock: {
        title: 'ШЛЮЗ',
        icon: '🚪',
        compId: 'comp-airlock'
      }
    };

    function highlightCompartment(deptKey, isHover) {
      const info = DEPARTMENTS[deptKey];
      if (!info) return;
      const svgGroup = document.getElementById(info.compId);
      if (svgGroup) {
        svgGroup.classList.toggle('active-hover', isHover);
      }
    }

    function syncPinHover(deptKey, isHover) {
      const pin = document.querySelector(`.dept-pin[data-dept="${deptKey}"]`);
      if (pin) {
        pin.classList.toggle('hovered', isHover);
      }
    }

    function openDepartment(deptKey) {
      if (deptKey === 'lab' || deptKey === 'airlock') { DuneBridge.go(deptKey); return; }
      const info = DEPARTMENTS[deptKey];
      if (!info) return;

      stopAnyRunningMiniGame();
      gameState.activeDept = deptKey;

      const screen = document.getElementById('compartment-screen');
      document.getElementById('dept-modal-title').textContent = info.title;
      document.getElementById('dept-modal-icon').textContent = info.icon;

      const ghBg = document.getElementById('greenhouse-bg-layer');
      const medBg = document.getElementById('medbay-bg-layer');
      const marsBg = document.getElementById('neutral-mars-bg-layer');
      const crisisTabs = document.getElementById('room-crisis-tabs');
      const dilemmaCard = document.getElementById('gh-dilemma-card');
      const tutorialModal = document.getElementById('gh-tutorial-modal');
      const gameBox = document.getElementById('gh-active-game-box');
      const resultModal = document.getElementById('gh-result-modal');
      const otherPlaceholder = document.getElementById('other-dept-placeholder');

      tutorialModal.classList.add('hidden');
      gameBox.classList.add('hidden');
      resultModal.classList.add('hidden');

      if (deptKey === 'greenhouse') {
        ghBg.classList.remove('hidden');
        medBg.classList.add('hidden');
        marsBg.classList.add('hidden');
        crisisTabs.classList.remove('hidden');
        dilemmaCard.classList.remove('hidden');
        otherPlaceholder.classList.add('hidden');
        selectRoomCrisis(MMCrisis.pick(['1A', '1B']).slice(-1));
      } else if (deptKey === 'medbay') {
        ghBg.classList.add('hidden');
        medBg.classList.remove('hidden');
        marsBg.classList.add('hidden');
        crisisTabs.classList.remove('hidden');
        dilemmaCard.classList.remove('hidden');
        otherPlaceholder.classList.add('hidden');
        selectRoomCrisis(MMCrisis.pick(['2A', '2B']).slice(-1));
      } else {
        ghBg.classList.add('hidden');
        medBg.classList.add('hidden');
        marsBg.classList.remove('hidden');
        crisisTabs.classList.add('hidden');
        dilemmaCard.classList.add('hidden');
        otherPlaceholder.classList.remove('hidden');
      }

      screen.classList.remove('hidden');
      requestAnimationFrame(() => {
        screen.classList.remove('opacity-0');
        screen.classList.add('opacity-100');
      });
    }

    function closeDepartment() {
      stopAnyRunningMiniGame();
      const screen = document.getElementById('compartment-screen');
      screen.classList.remove('opacity-100');
      screen.classList.add('opacity-0');
      setTimeout(() => {
        screen.classList.add('hidden');
      }, 260);
    }

    // Переключение между Кризисом А и Кризисом Б внутри текущей открытой комнаты
    function selectRoomCrisis(variantLetter) {
      stopAnyRunningMiniGame();
      const prefix = gameState.activeDept === 'medbay' ? '2' : '1';
      const crisisKey = `${prefix}${variantLetter}`;
      gameState.currentCrisis = crisisKey;
      const data = ROOM_CRISES[crisisKey];

      const tabA = document.getElementById('tab-crisis-a');
      const tabB = document.getElementById('tab-crisis-b');

      if (gameState.activeDept === 'greenhouse') {
        tabA.textContent = '💧 Кризис 1А: Засуха';
        tabB.textContent = '❤️ Кризис 1Б: Лопнула труба';
        document.getElementById('dome-crack-visual').classList.toggle('hidden', crisisKey !== '1B');
      } else {
        tabA.textContent = '😴 Кризис 2А: Бессонница';
        tabB.textContent = '😷 Кризис 2Б: Сбой датчиков';
        document.getElementById('medbay-dust-visual').classList.toggle('hidden', crisisKey !== '2B');
      }

      if (variantLetter === 'A') {
        tabA.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-[#231815] bg-[#4ade80] text-[#231815] shadow-[0_3px_0_#231815] transition cursor-pointer';
        tabB.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-transparent hover:border-[#231815] bg-[#f1f5f9] text-[#475569] transition cursor-pointer';
      } else {
        tabB.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-[#231815] bg-[#38bdf8] text-[#231815] shadow-[0_3px_0_#231815] transition cursor-pointer';
        tabA.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-transparent hover:border-[#231815] bg-[#f1f5f9] text-[#475569] transition cursor-pointer';
      }

      // Заполнение карточек вариантов
      document.getElementById('crisis-code-badge').textContent = data.code;
      document.getElementById('crisis-title').textContent = data.title;
      document.getElementById('crisis-subtitle').textContent = data.subtitle;
      document.getElementById('room-responsibility-badge').innerHTML = `<span>${data.responsibility}</span>`;

      function buildRewardBadges(opt) {
        let html = `<span class="px-3 py-1 rounded-xl bg-[#fef08a] border-2 border-[#231815] font-extrabold text-sm text-[#854d0e]">${opt.energyCost} ⚡</span>`;
        if (opt.shieldReward > 0) {
          html += `<span class="px-3 py-1 rounded-xl bg-[#dbeafe] border-2 border-[#231815] font-extrabold text-sm text-[#1e3a8a]">+${opt.shieldReward} 🛡️</span>`;
        }
        if (opt.lifeReward > 0) {
          html += `<span class="px-3 py-1 rounded-xl bg-[#bbf7d0] border-2 border-[#231815] font-extrabold text-sm text-[#166534]">+${opt.lifeReward} ❤️</span>`;
        }
        if (opt.scienceReward > 0) {
          html += `<span class="px-3 py-1 rounded-xl bg-[#e9d5ff] border-2 border-[#231815] font-extrabold text-sm text-[#6b21a8]">+${opt.scienceReward} 🧬 Наука</span>`;
        }
        return html;
      }

      // Вариант 1
      const o1 = data.options[1];
      document.getElementById('opt1-title').textContent = o1.title;
      document.getElementById('opt1-minigame-tag').textContent = o1.minigameTag;
      document.getElementById('opt1-rewards').innerHTML = buildRewardBadges(o1);

      // Вариант 2
      const o2 = data.options[2];
      document.getElementById('opt2-title').textContent = o2.title;
      document.getElementById('opt2-minigame-tag').textContent = o2.minigameTag;
      document.getElementById('opt2-rewards').innerHTML = buildRewardBadges(o2);
      MMCrisis.fill([o1.minigameId, o2.minigameId]);

      resetToCrisisDilemma();
    }

    function resetToCrisisDilemma() {
      stopAnyRunningMiniGame();
      document.getElementById('gh-dilemma-card').classList.remove('hidden');
      document.getElementById('gh-tutorial-modal').classList.add('hidden');
      document.getElementById('gh-active-game-box').classList.add('hidden');
      document.getElementById('gh-result-modal').classList.add('hidden');
    }

    // a won crisis leads to a new random one; after a loss the same crisis is offered again
    function nextCrisis() {
      const pre = gameState.activeDept === 'medbay' ? '2' : '1';
      selectRoomCrisis(MMCrisis.pick([pre + 'A', pre + 'B'], gameState.currentCrisis).slice(-1));
    }
    function afterResult() {
      if (gameState.lastWin) nextCrisis(); else resetToCrisisDilemma();
    }

    function backToDilemma() {
      resetToCrisisDilemma();
    }

    // Открытие GIF-инструкции перед началом мини-игры (№1, №2, №3 или №4)
    function openTutorialForOption(optionNum) {
      ensureAudio();
      playSound('tick');
      gameState.selectedOption = optionNum;
      const crisisObj = ROOM_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[optionNum];

      document.getElementById('gh-dilemma-card').classList.add('hidden');
      document.getElementById('gh-result-modal').classList.add('hidden');
      const tutModal = document.getElementById('gh-tutorial-modal');
      tutModal.classList.remove('hidden');

      const gif1 = document.getElementById('tut-gif-game1');
      const gif2 = document.getElementById('tut-gif-game2');
      const gif3 = document.getElementById('tut-gif-game3');
      const gif4 = document.getElementById('tut-gif-game4');

      [gif1, gif2, gif3, gif4].forEach((g) => g.classList.add('hidden'));

      if (optObj.minigameId === 1) {
        document.getElementById('tut-title').textContent =
          gameState.currentCrisis === '1B'
            ? 'Мини-игра №1: «Поймай капли» (Давление)'
            : 'Мини-игра №1: «Поймай капли»';
        document.getElementById('tut-desc').textContent =
          'Двигай воронку влево-вправо! Собери 8 чистых капель конденсата (💧) за 10 секунд и уворачивайся от жёлтых солёных капель!';
        gif1.classList.remove('hidden');
      } else if (optObj.minigameId === 2) {
        document.getElementById('tut-title').textContent = 'Мини-игра №2: «Собери урожай»';
        document.getElementById('tut-desc').textContent =
          'Быстро кликай на спелую капусту и редиску — собери 8 штук за 10 секунд! Не трогай увядшие заражённые кочаны с пятнами!';
        gif2.classList.remove('hidden');
      } else if (optObj.minigameId === 3) {
        const isFilter = gameState.currentCrisis === '2B';
        document.getElementById('tut-title').textContent = isFilter
          ? 'Мини-игра №3: «Витаминный микс» (Фильтр)'
          : 'Мини-игра №3: «Витаминный микс»';
        document.getElementById('tut-desc').textContent = isFilter
          ? 'Перетащи (или нажми) 3 цветных картриджа по образцу сверху в блок очистки воздуха за 10 секунд!'
          : 'Перетащи (или нажми) 3 правильных цветных капсулы по образцу на экране в колбу за 10 секунд!';
        gif3.classList.remove('hidden');
      } else if (optObj.minigameId === 4) {
        document.getElementById('tut-title').textContent = 'Мини-игра №4: «Пульс в норме»';
        document.getElementById('tut-desc').textContent =
          'Нажимай кнопку (или Пробел) в такт, когда бегунок попадает в ЗЕЛЁНУЮ ЗОНУ кардиограммы (5 раз за 10 секунд)!';
        gif4.classList.remove('hidden');
      }
    }

    // =====================================================================
    // 3. ДВИЖОК МИНИ-ИГР №1, №2, №3 И №4 — 10 СЕКУНД
    // =====================================================================
    let activeGameTimer = null;
    let activeAnimationFrame = null;
    let activeSpawnInterval = null;
    let miniGameRunning = false;
    let currentScore = 0;
    let targetScore = 8;
    let timeRemaining = 10.0;

    function stopAnyRunningMiniGame() {
      miniGameRunning = false;
      if (activeGameTimer) clearInterval(activeGameTimer);
      if (activeSpawnInterval) clearInterval(activeSpawnInterval);
      if (activeAnimationFrame) cancelAnimationFrame(activeAnimationFrame);
      activeGameTimer = null;
      activeSpawnInterval = null;
      activeAnimationFrame = null;
    }

    function startSelectedMiniGame() {
      stopAnyRunningMiniGame();
      ensureAudio();

      const crisisObj = ROOM_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[gameState.selectedOption];

      currentScore = 0;
      targetScore = optObj.targetScore;
      timeRemaining = 10.0;
      miniGameRunning = true;

      document.getElementById('gh-tutorial-modal').classList.add('hidden');
      const gameBox = document.getElementById('gh-active-game-box');
      gameBox.classList.remove('hidden');

      document.getElementById('game-score-current').textContent = '0';
      document.getElementById('game-score-target').textContent = targetScore;
      document.getElementById('game-goal-bar').style.width = '0%';
      document.getElementById('game-timer-display').textContent = '10.0с';
      document.getElementById('game-time-bar').style.width = '100%';

      const arena1 = document.getElementById('arena-game-1');
      const arena2 = document.getElementById('arena-game-2');
      const arena3 = document.getElementById('arena-game-3');
      const arena4 = document.getElementById('arena-game-4');
      [arena1, arena2, arena3, arena4].forEach((a) => a.classList.add('hidden'));

      const badge = document.getElementById('active-game-badge');

      if (optObj.minigameId === 1) {
        badge.textContent = gameState.currentCrisis === '1B' ? '💧 Поймай капли (Давление)' : '💧 Поймай капли';
        badge.className = 'px-3 py-1 rounded-xl bg-[#38bdf8] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        arena1.classList.remove('hidden');
        initCatchDropsGame();
      } else if (optObj.minigameId === 2) {
        badge.textContent = '🥬 Собери урожай';
        badge.className = 'px-3 py-1 rounded-xl bg-[#4ade80] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        arena2.classList.remove('hidden');
        initHarvestGame();
      } else if (optObj.minigameId === 3) {
        badge.textContent = gameState.currentCrisis === '2B' ? '🧪 Витаминный микс (Фильтр)' : '🧪 Витаминный микс';
        badge.className = 'px-3 py-1 rounded-xl bg-[#c084fc] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        arena3.classList.remove('hidden');
        initVitaminMixGame();
      } else if (optObj.minigameId === 4) {
        badge.textContent = '💓 Пульс в норме';
        badge.className = 'px-3 py-1 rounded-xl bg-[#f472b6] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        arena4.classList.remove('hidden');
        initPulseNormalGame();
      }

      // Обратный отсчёт 10 секунд с тиканьем на последних 3 секундах
      let lastWholeSecond = 10;
      activeGameTimer = setInterval(() => {
        if (!miniGameRunning) return;
        timeRemaining = Math.max(0, timeRemaining - 0.1);
        document.getElementById('game-timer-display').textContent = `${timeRemaining.toFixed(1)}с`;
        document.getElementById('game-time-bar').style.width = `${(timeRemaining / 10) * 100}%`;

        const ceilSec = Math.ceil(timeRemaining);
        if (ceilSec <= 3 && ceilSec > 0 && ceilSec !== lastWholeSecond) {
          lastWholeSecond = ceilSec;
          playSound('tick');
        }

        if (timeRemaining <= 0) {
          finishMiniGame(currentScore >= targetScore);
        }
      }, 100);
    }

    function addMiniGameScore(delta) {
      if (!miniGameRunning) return;
      currentScore = Math.max(0, currentScore + delta);
      document.getElementById('game-score-current').textContent = currentScore;
      const pct = Math.min(100, (currentScore / targetScore) * 100);
      document.getElementById('game-goal-bar').style.width = `${pct}%`;

      if (currentScore >= targetScore) {
        finishMiniGame(true);
      }
    }

    // ---------------- МИНИ-ИГРА №1: «ПОЙМАЙ КАПЛИ» (CANVAS) ----------------
    const keysDown = { left: false, right: false };
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф') keysDown.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в') keysDown.right = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф') keysDown.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в') keysDown.right = false;
    });

    function initCatchDropsGame() {
      const canvas = document.getElementById('drops-canvas');
      const ctx = canvas.getContext('2d');

      function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width || 800;
        canvas.height = rect.height || 420;
      }
      resizeCanvas();

      const funnel = {
        x: canvas.width / 2,
        w: 108,
        h: 46,
        hitFlash: 0
      };

      const drops = [];
      const popups = [];

      // Управление мышью и тачем
      const moveHandler = (clientX) => {
        const rect = canvas.getBoundingClientRect();
        const relX = clientX - rect.left;
        funnel.x = Math.max(funnel.w / 2 + 10, Math.min(canvas.width - funnel.w / 2 - 10, relX));
      };

      canvas.onmousemove = (e) => moveHandler(e.clientX);
      canvas.ontouchmove = (e) => {
        if (e.touches[0]) moveHandler(e.touches[0].clientX);
      };

      // Генерация падающих капель (чистые голубые и солёные жёлто-коричневые)
      activeSpawnInterval = setInterval(() => {
        if (!miniGameRunning) return;
        const isSalty = Math.random() < 0.32;
        drops.push({
          x: 45 + Math.random() * (canvas.width - 90),
          y: -20,
          r: isSalty ? 15 : 16,
          vy: 3.4 + Math.random() * 2.2,
          isSalty
        });
      }, 360);

      function renderDropsLoop() {
        if (!miniGameRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Движение с клавиатуры
        if (keysDown.left) funnel.x = Math.max(funnel.w / 2 + 10, funnel.x - 8);
        if (keysDown.right) funnel.x = Math.min(canvas.width - funnel.w / 2 - 10, funnel.x + 8);

        const funnelY = canvas.height - 68;

        // Обновление и отрисовка капель
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          d.y += d.vy;

          // Отрисовка капли в контурном комикс-стиле
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - d.r * 1.3);
          ctx.bezierCurveTo(d.x + d.r * 1.2, d.y, d.x + d.r, d.y + d.r, d.x, d.y + d.r);
          ctx.bezierCurveTo(d.x - d.r, d.y + d.r, d.x - d.r * 1.2, d.y, d.x, d.y - d.r * 1.3);
          ctx.closePath();

          ctx.fillStyle = d.isSalty ? '#eab308' : '#38bdf8';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#231815';
          ctx.stroke();

          // Блик на капле
          ctx.beginPath();
          ctx.arc(d.x - 4, d.y - 2, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.restore();

          // Проверка попадания в лейку/воронку
          if (
            d.y + d.r >= funnelY &&
            d.y - d.r <= funnelY + funnel.h &&
            Math.abs(d.x - funnel.x) <= funnel.w / 2 + 6
          ) {
            if (d.isSalty) {
              playSound('bad');
              funnel.hitFlash = 8;
              addMiniGameScore(-1);
              popups.push({ x: d.x, y: funnelY - 10, text: '-1 Соль!', color: '#facc15', life: 22 });
            } else {
              playSound('good');
              addMiniGameScore(1);
              popups.push({ x: d.x, y: funnelY - 10, text: '+1 💧', color: '#4ade80', life: 22 });
            }
            drops.splice(i, 1);
            continue;
          }

          if (d.y > canvas.height + 30) {
            drops.splice(i, 1);
          }
        }

        // Отрисовка воронки/лейки NASA
        ctx.save();
        const fx = funnel.x - funnel.w / 2;
        ctx.beginPath();
        ctx.moveTo(fx, funnelY);
        ctx.lineTo(fx + funnel.w, funnelY);
        ctx.lineTo(fx + funnel.w - 16, funnelY + funnel.h);
        ctx.lineTo(fx + 16, funnelY + funnel.h);
        ctx.closePath();

        ctx.fillStyle = funnel.hitFlash > 0 ? '#ef4444' : '#e2e8f0';
        if (funnel.hitFlash > 0) funnel.hitFlash--;
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#231815';
        ctx.stroke();

        // Голубая полоска воды внутри лейки
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(fx + 18, funnelY + 8, funnel.w - 36, 10);

        // Подпись на воронке
        ctx.fillStyle = '#231815';
        ctx.font = '800 13px MMSans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ВОРОНКА H₂O', funnel.x, funnelY + 33);
        ctx.restore();

        // Всплывающие тексты (+1 / -1)
        for (let i = popups.length - 1; i >= 0; i--) {
          const p = popups[i];
          p.y -= 1.5;
          p.life--;
          ctx.save();
          ctx.font = '800 18px MMSans, sans-serif';
          ctx.fillStyle = p.color;
          ctx.strokeStyle = '#231815';
          ctx.lineWidth = 3;
          ctx.strokeText(p.text, p.x, p.y);
          ctx.fillText(p.text, p.x, p.y);
          ctx.restore();
          if (p.life <= 0) popups.splice(i, 1);
        }

        activeAnimationFrame = requestAnimationFrame(renderDropsLoop);
      }

      activeAnimationFrame = requestAnimationFrame(renderDropsLoop);
    }

    // ---------------- МИНИ-ИГРА №2: «СОБЕРИ УРОЖАЙ» (12 ГРЯДОК) ----------------
    const VEG_CAB = '<svg viewBox="0 0 64 64" class="veg" aria-hidden="true"><ellipse cx="32" cy="57" rx="19" ry="4.5" fill="rgba(0,0,0,.28)"/><path d="M8 36c-2-12 7-24 24-24s26 12 24 24c-1 12-12 21-24 21S9 48 8 36z" fill="#3f9b4a" stroke="#1d3d22" stroke-width="2.4"/><path d="M14 38c-2-9 5-18 18-18s20 9 18 18c-1 9-8 15-18 15s-17-6-18-15z" fill="#79c85a" stroke="#256a2e" stroke-width="2"/><path d="M22 40c-1-6 3-12 10-12s11 6 10 12c-1 6-5 9-10 9s-9-3-10-9z" fill="#b9e58a" stroke="#3b8a3a" stroke-width="1.8"/><path d="M32 49V30M32 40l-8-8M32 40l8-8M32 34l-5-5M32 34l5-5" fill="none" stroke="#e8f8c8" stroke-width="1.6" stroke-linecap="round"/><path d="M12 30c4-8 10-12 17-12" fill="none" stroke="#cfeea2" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>';
    const VEG_RAD = '<svg viewBox="0 0 64 64" class="veg" aria-hidden="true"><ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,.28)"/><path d="M32 22c-4-12-14-14-20-12 4 2 10 6 12 14zM32 22c1-12 8-17 15-17-3 4-5 9-6 17zM32 22c0-10 0-15-1-19 4 4 5 11 5 19z" fill="#4fae4c" stroke="#1d3d22" stroke-width="2" stroke-linejoin="round"/><path d="M32 20c-12 0-21 9-21 20 0 9 7 14 14 16 4 1 4 1 7 5 3-4 3-4 7-5 7-2 14-7 14-16 0-11-9-20-21-20z" fill="url(#rg)" stroke="#6b0f2e" stroke-width="2.4"/><defs><radialGradient id="rg" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff8aa5"/><stop offset=".55" stop-color="#e5214f"/><stop offset="1" stop-color="#a50f35"/></radialGradient></defs><path d="M18 33c2-5 6-8 11-9" fill="none" stroke="#ffd0da" stroke-width="2.4" stroke-linecap="round" opacity=".8"/><path d="M25 52c3-3 4-3 7-3s4 0 7 3" fill="none" stroke="#fff4f6" stroke-width="2" opacity=".55"/></svg>';
    const VEG_BAD = '<svg viewBox="0 0 64 64" class="veg" aria-hidden="true"><ellipse cx="32" cy="57" rx="19" ry="4.5" fill="rgba(0,0,0,.28)"/><path d="M8 38c-2-12 7-24 24-24s26 12 24 24c-1 12-12 19-24 19S9 50 8 38z" fill="#9a8a35" stroke="#463c10" stroke-width="2.4"/><path d="M14 40c-2-9 5-17 18-17s20 8 18 17c-1 9-8 14-18 14s-17-5-18-14z" fill="#c4b247" stroke="#6b5a14" stroke-width="2"/><circle cx="24" cy="38" r="4" fill="#5a3a12"/><circle cx="38" cy="33" r="3" fill="#5a3a12"/><circle cx="35" cy="45" r="3.4" fill="#6c4a18"/><circle cx="23" cy="47" r="2" fill="#7b2e1a"/><path d="M26 18c2-3 4-4 6-5M44 22c2-2 3-2 5-3" stroke="#6b5a14" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    function initHarvestGame() {
      const grid = document.getElementById('harvest-grid');
      grid.innerHTML = '';

      const slots = [];
      for (let i = 0; i < 12; i++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className =
          'bed-cell h-20 sm:h-24 rounded-2xl border-[3px] border-[#231815] flex flex-col items-center justify-center transition relative overflow-hidden cursor-pointer';
        cell.innerHTML = '<span class="soil"></span>';
        grid.appendChild(cell);
        slots.push({ el: cell, state: 'empty', timeoutId: null });

        cell.onclick = () => {
          if (!miniGameRunning) return;
          const slot = slots[i];
          if (slot.state === 'good') {
            playSound('good');
            addMiniGameScore(1);
            clearSlot(slot, '+1', '#4ade80');
          } else if (slot.state === 'bad') {
            playSound('bad');
            addMiniGameScore(-1);
            clearSlot(slot, '−1', '#f87171');
          }
        };
      }

      function clearSlot(slot, feedbackText, colorHex) {
        if (slot.timeoutId) clearTimeout(slot.timeoutId);
        slot.state = 'empty';
        slot.el.innerHTML = `<span class="font-extrabold text-xs sm:text-sm" style="color:${colorHex}">${feedbackText}</span>`;
        setTimeout(() => {
          if (slot.state === 'empty') {
            slot.el.innerHTML = '<span class="soil"></span>';
          }
        }, 320);
      }

      function spawnLeafInRandomSlot() {
        if (!miniGameRunning) return;
        const emptySlots = slots.filter((s) => s.state === 'empty');
        if (emptySlots.length === 0) return;

        const chosen = emptySlots[Math.floor(Math.random() * emptySlots.length)];
        const isInfected = Math.random() < 0.28;
        chosen.state = isInfected ? 'bad' : 'good';

        if (isInfected) {
          chosen.el.innerHTML = '<div class="leaf-item veg-w bad">'+VEG_BAD+'</div>';
        } else {
          chosen.el.innerHTML = '<div class="leaf-item veg-w">'+(Math.random() < 0.5 ? VEG_CAB : VEG_RAD)+'</div>';
        }

        chosen.timeoutId = setTimeout(() => {
          if (chosen.state !== 'empty') {
            chosen.state = 'empty';
            chosen.el.innerHTML = '<span class="soil"></span>';
          }
        }, 1250);
      }

      // Сразу спавним 4 листа и затем каждые 330 мс
      for (let k = 0; k < 4; k++) spawnLeafInRandomSlot();
      activeSpawnInterval = setInterval(spawnLeafInRandomSlot, 330);
    }

    // ---------------- МИНИ-ИГРА №3: «ВИТАМИННЫЙ МИКС» (ПЕРЕТАСКИВАНИЕ 3 КАПСУЛ В КОЛБУ) ----------------
    const CAPSULE_TYPES = [
      { id: 'red', name: 'Витамин C', emoji: '🍓', bg: '#ef4444' },
      { id: 'blue', name: 'Аква-Гель', emoji: '💧', bg: '#38bdf8' },
      { id: 'green', name: 'Хлорофилл', emoji: '🌿', bg: '#4ade80' },
      { id: 'yellow', name: 'Витамин D', emoji: '☀️', bg: '#facc15' },
      { id: 'purple', name: 'Антиоксидант', emoji: '🍇', bg: '#c084fc' },
      { id: 'orange', name: 'Бета-Каротин', emoji: '🥕', bg: '#fb923c' }
    ];

    function initVitaminMixGame() {
      const isFilterMode = gameState.currentCrisis === '2B';
      document.getElementById('mix-mode-subtitle').textContent = isFilterMode
        ? '(собери 3 картриджа для фильтра)'
        : '(перетащи 3 капсулы в колбу)';
      document.getElementById('mix-flask-label').textContent = isFilterMode ? '🛡️ БЛОК ФИЛЬТРА' : '🧪 МЕД-КОЛБА';
      document.getElementById('mix-flask-icon').textContent = isFilterMode ? '🌀' : '⚗️';

      // Выбираем 3 случайные целевые капсулы для рецепта
      const shuffled = [...CAPSULE_TYPES].sort(() => Math.random() - 0.5);
      const recipe = shuffled.slice(0, 3);
      const matchedIds = [];

      const targetListEl = document.getElementById('mix-target-list');
      const filledSlotsEl = document.getElementById('mix-filled-slots');
      const poolEl = document.getElementById('mix-capsules-pool');
      const dropzoneEl = document.getElementById('mix-flask-dropzone');

      function renderRecipeAndSlots() {
        targetListEl.innerHTML = recipe
          .map((item) => {
            const done = matchedIds.includes(item.id);
            return `
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-[#231815] font-extrabold text-xs sm:text-sm transition-all ${
                done ? 'bg-[#dcfce7] opacity-55 scale-95' : 'bg-white shadow-[0_2px_0_#231815]'
              }">
                <span class="w-6 h-6 rounded-full border-2 border-[#231815] flex items-center justify-center text-xs" style="background:${item.bg}">${item.emoji}</span>
                <span>${done ? '✓' : item.name}</span>
              </div>
            `;
          })
          .join('');

        filledSlotsEl.innerHTML = [0, 1, 2]
          .map((idx) => {
            const id = matchedIds[idx];
            const found = CAPSULE_TYPES.find((c) => c.id === id);
            if (found) {
              return `<span class="w-9 h-9 rounded-full border-2 border-[#231815] flex items-center justify-center text-base shadow-sm" style="background:${found.bg}">${found.emoji}</span>`;
            }
            return `<span class="w-9 h-9 rounded-full border-2 border-dashed border-[#64748b] bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-400">${idx + 1}</span>`;
          })
          .join('');
      }

      renderRecipeAndSlots();

      // Перемешиваем все 6 капсул для игрового поля
      const poolItems = [...CAPSULE_TYPES].sort(() => Math.random() - 0.5);
      poolEl.innerHTML = '';

      function trySubmitCapsule(capObj, btnEl) {
        if (!miniGameRunning) return;
        const isNeeded = recipe.some((r) => r.id === capObj.id) && !matchedIds.includes(capObj.id);

        if (isNeeded) {
          playSound('good');
          matchedIds.push(capObj.id);
          btnEl.disabled = true;
          btnEl.classList.add('opacity-30', 'scale-90', 'pointer-events-none');
          dropzoneEl.classList.add('scale-105');
          setTimeout(() => dropzoneEl.classList.remove('scale-105'), 180);
          renderRecipeAndSlots();
          addMiniGameScore(1);
        } else {
          playSound('bad');
          btnEl.classList.add('shake-anim');
          dropzoneEl.classList.add('shake-anim');
          setTimeout(() => {
            btnEl.classList.remove('shake-anim');
            dropzoneEl.classList.remove('shake-anim');
          }, 280);
        }
      }

      poolItems.forEach((cap) => {
        const btn = document.createElement('div');
        btn.draggable = true;
        btn.className =
          'cursor-grab active:cursor-grabbing select-none flex flex-col items-center justify-center w-24 sm:w-28 h-20 sm:h-24 rounded-2xl bg-[#fffdf9] hover:bg-[#fef9c3] border-[3px] border-[#231815] shadow-[0_4px_0_#231815] transition transform hover:-translate-y-0.5';
        btn.innerHTML = `
          <div class="w-11 h-11 rounded-full border-[2.5px] border-[#231815] flex items-center justify-center text-xl shadow-inner" style="background:${cap.bg}">
            ${cap.emoji}
          </div>
          <span class="text-[11px] font-extrabold text-[#231815] mt-1">${cap.name}</span>
        `;

        // Поддержка и перетаскивания (Drag & Drop), и быстрого клика/тапа для детей
        btn.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', cap.id);
        });
        btn.addEventListener('click', () => {
          trySubmitCapsule(cap, btn);
        });

        btn.dataset.capId = cap.id;
        poolEl.appendChild(btn);
      });

      dropzoneEl.ondragover = (e) => {
        e.preventDefault();
      };
      dropzoneEl.ondrop = (e) => {
        e.preventDefault();
        const capId = e.dataTransfer.getData('text/plain');
        const capObj = CAPSULE_TYPES.find((c) => c.id === capId);
        const btnEl = poolEl.querySelector(`[data-cap-id="${capId}"]`);
        if (capObj && btnEl && !btnEl.disabled) {
          trySubmitCapsule(capObj, btnEl);
        }
      };
    }

    // ---------------- МИНИ-ИГРА №4: «ПУЛЬС В НОРМЕ» (КАРДИОГРАММА С БЕГУНКОМ) ----------------
    let pulseRunnerPos = 50; // 0..100%
    let pulseRunnerDir = 1;
    let pulseRunnerSpeed = 1.35;

    function initPulseNormalGame() {
      pulseRunnerPos = 15;
      pulseRunnerDir = 1;
      pulseRunnerSpeed = 1.45;

      const runnerEl = document.getElementById('pulse-runner');
      const bpmEl = document.getElementById('pulse-bpm-readout');
      const statusEl = document.getElementById('pulse-status-text');
      statusEl.textContent = 'Лови момент, когда бегунок в ЗЕЛЁНОЙ ЗОНЕ!';
      statusEl.className = 'text-xs font-bold text-[#0369a1]';
      bpmEl.textContent = '115';

      function updatePulseLoop() {
        if (!miniGameRunning) return;
        pulseRunnerPos += pulseRunnerDir * pulseRunnerSpeed;
        if (pulseRunnerPos >= 96) {
          pulseRunnerPos = 96;
          pulseRunnerDir = -1;
        } else if (pulseRunnerPos <= 4) {
          pulseRunnerPos = 4;
          pulseRunnerDir = 1;
        }
        runnerEl.style.left = `${pulseRunnerPos}%`;
        activeAnimationFrame = requestAnimationFrame(updatePulseLoop);
      }

      activeAnimationFrame = requestAnimationFrame(updatePulseLoop);
    }

    function handlePulseBeatHit() {
      if (!miniGameRunning) return;
      const crisisObj = ROOM_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[gameState.selectedOption];
      if (optObj.minigameId !== 4) return;

      const containerEl = document.getElementById('pulse-bar-container');
      const statusEl = document.getElementById('pulse-status-text');
      const bpmEl = document.getElementById('pulse-bpm-readout');
      const avatarEl = document.getElementById('pulse-heart-avatar');

      // Зелёная зона находится в диапазоне 32% .. 68%
      if (pulseRunnerPos >= 32 && pulseRunnerPos <= 68) {
        playSound('good');
        pulseRunnerSpeed = Math.min(2.15, pulseRunnerSpeed + 0.12);
        avatarEl.textContent = '💚';
        setTimeout(() => {
          avatarEl.textContent = '👩‍🚀';
        }, 260);

        const newBpm = Math.max(72, 115 - (currentScore + 1) * 8);
        bpmEl.textContent = String(newBpm);
        statusEl.textContent = 'Отлично! Ритм сердца выравнивается (+1)';
        statusEl.className = 'text-xs font-extrabold text-[#16a34a]';

        addMiniGameScore(1);
      } else {
        playSound('bad');
        containerEl.classList.add('shake-anim');
        setTimeout(() => containerEl.classList.remove('shake-anim'), 260);
        statusEl.textContent = 'Мимо зелёной зоны! Жди бегунок в центре!';
        statusEl.className = 'text-xs font-extrabold text-[#dc2626]';
      }
    }

    // Позволяем нажимать Пробел в Мини-игре №4 «Пульс в норме»
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && miniGameRunning) {
        const crisisObj = ROOM_CRISES[gameState.currentCrisis];
        const optObj = crisisObj.options[gameState.selectedOption];
        if (optObj && optObj.minigameId === 4) {
          e.preventDefault();
          handlePulseBeatHit();
        }
      }
    });

    // ---------------- ЗАВЕРШЕНИЕ МИНИ-ИГРЫ И НАЧИСЛЕНИЕ РЕСУРСОВ ----------------
    function finishMiniGame(isWin) {
      stopAnyRunningMiniGame();

      const crisisObj = ROOM_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[gameState.selectedOption];

      document.getElementById('gh-active-game-box').classList.add('hidden');
      const resModal = document.getElementById('gh-result-modal');
      resModal.classList.remove('hidden');

      const iconEl = document.getElementById('res-icon');
      const titleEl = document.getElementById('res-title');
      const descEl = document.getElementById('res-desc');
      const badgesEl = document.getElementById('res-badges');

      if (isWin) {
        playSound('win'); gameState.lastWin = true;
        DuneBridge.mini(gameState.currentCrisis, optObj.minigameId, true, (typeof currentScore!=='undefined'?currentScore:0), typeof timeRemaining!=='undefined'?timeRemaining:0);
        DuneBridge.done(gameState.currentCrisis);
        gameState.energy += optObj.energyCost;
        gameState.life += optObj.lifeReward;
        gameState.shield += optObj.shieldReward || 0;
        gameState.science += optObj.scienceReward;

        updateResourceHUD({
          energy: optObj.energyCost,
          life: optObj.lifeReward,
          shield: optObj.shieldReward || 0,
          science: optObj.scienceReward
        });

        const roomName = gameState.activeDept === 'medbay' ? 'Медпункт' : 'Теплица';
        iconEl.textContent = '🎉';
        titleEl.textContent = 'Победа! Кризис преодолён!';
        descEl.textContent = `Ты отлично справился за 10 секунд! ${roomName} Mars Dune Alpha работает стабильно.`;

        let badgesHTML = `
          <span class="px-3.5 py-1.5 rounded-xl bg-[#fef08a] border-2 border-[#231815] font-extrabold text-sm text-[#854d0e]">
            ${optObj.energyCost} ⚡ Энергия
          </span>
        `;
        if (optObj.shieldReward > 0) {
          badgesHTML += `
            <span class="px-3.5 py-1.5 rounded-xl bg-[#dbeafe] border-2 border-[#231815] font-extrabold text-sm text-[#1e3a8a]">
              +${optObj.shieldReward} 🛡️ Щит
            </span>
          `;
        }
        if (optObj.lifeReward > 0) {
          badgesHTML += `
            <span class="px-3.5 py-1.5 rounded-xl bg-[#bbf7d0] border-2 border-[#231815] font-extrabold text-sm text-[#166534]">
              +${optObj.lifeReward} ❤️ Жизнь
            </span>
          `;
        }
        if (optObj.scienceReward > 0) {
          badgesHTML += `
            <span class="px-3.5 py-1.5 rounded-xl bg-[#e9d5ff] border-2 border-[#231815] font-extrabold text-sm text-[#6b21a8]">
              +${optObj.scienceReward} 🧬 Наука
            </span>
          `;
        }
        badgesEl.innerHTML = badgesHTML;
      } else {
        playSound('lose'); gameState.lastWin = false;
        DuneBridge.mini(gameState.currentCrisis, optObj.minigameId, false, (typeof currentScore!=='undefined'?currentScore:0), 0);
        gameState.hearts = Math.max(0, gameState.hearts - 1);
        if (gameState.hearts === 0) {
          // Авто-восстановление сердечек для детской игры
          setTimeout(() => {
            gameState.hearts = 3;
            updateResourceHUD();
          }, 1200);
        }
        updateResourceHUD();

        iconEl.textContent = '⚠️';
        titleEl.textContent = 'Время вышло!';
        descEl.textContent = `Выполнено ${currentScore} из ${targetScore}. Потеряно 1 сердечко (❤️), но ты можешь сразу попробовать ещё раз!`;
        badgesEl.innerHTML = `
          <span class="px-3.5 py-1.5 rounded-xl bg-[#ffe4e6] border-2 border-[#231815] font-extrabold text-sm text-[#be123c]">
            -1 ❤️ Попытка
          </span>
        `;
      }
    }

    // Закрытие по клавише Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDepartment();
    });

    // =====================================================================
    // 4. ДИНАМИЧЕСКИЙ ЦИКЛ СОЛА И ОСЕДАНИЕ МАРСИАНСКОЙ ПЫЛИ НА ПАНЕЛЯХ
    // =====================================================================
    const dustLayers = document.querySelectorAll('.solar-dust-layer');
    const mainSunGroup = document.getElementById('main-sun-group');
    const skyDuskOverlay = document.getElementById('sky-dusk-overlay');
    const sceneEveningTint = document.getElementById('scene-evening-tint');

    let solProgress = 12; // 0..100 (процент завершения дня Сола)

    function updateSolEnvironment(value) {
      solProgress = Number(value);

      // 1. Накопление пыли на всех 8 солнечных панелях к концу дня (от 0.05 утром до 0.92 вечером)
      const dustOpacity = '0.06';
      dustLayers.forEach((layer) => {
        layer.setAttribute('opacity', dustOpacity);
      });

      // 2. Плавное движение Солнца по небу и вечерний оттенок
      const sunX = 1280 - (solProgress / 100) * 190;
      const sunY = 78 + Math.sin((solProgress / 100) * Math.PI) * 35;
      mainSunGroup.setAttribute('transform', `translate(${sunX.toFixed(1)}, ${sunY.toFixed(1)})`);

      const duskAlpha = ((solProgress / 100) * 0.28).toFixed(3);
      skyDuskOverlay.setAttribute('opacity', '0');
      sceneEveningTint.setAttribute('opacity', '0');
    }

    // The base no longer darkens: the sky and the ground keep their daytime colours.

    // Инициализация при загрузке
    window.onload = () => {
      updateSolEnvironment(12);
      updateResourceHUD();
      MMCrisis.build('gh-dilemma-card');
      MMCrisis.hideTabs();
      DuneBridge.decorateHub();
    };
  


    // ===== MM2 wiring: second-crisis mini-games (ids 9-16) =====
    (function () {
      const _open = openTutorialForOption, _stop = stopAnyRunningMiniGame, _finish = finishMiniGame;
      const opt = () => ROOM_CRISES[gameState.currentCrisis].options[gameState.selectedOption];
      const isNew = () => window.MM2 && MM2.has(opt().minigameId);
      openTutorialForOption = function (n) {
        gameState.selectedOption = n;
        if (!(window.MM2 && MM2.has(ROOM_CRISES[gameState.currentCrisis].options[n].minigameId))) { MM2.tutorialReset && MM2.tutorialReset(); return _open(n); }
        ensureAudio(); playSound('tick');
        document.getElementById('gh-dilemma-card') && document.getElementById('gh-dilemma-card').classList.add('hidden');
        document.getElementById('gh-result-modal').classList.add('hidden');
        document.getElementById('gh-tutorial-modal').classList.remove('hidden');
        MM2.tutorial(ROOM_CRISES[gameState.currentCrisis].options[n].minigameId);
      };
      stopAnyRunningMiniGame = function () { if (window.MM2) MM2.reset(); _stop(); };
      const _start = startSelectedMiniGame;
      startSelectedMiniGame = function () {
        if (!isNew()) { if (window.MM2) MM2.reset(); return _start(); }
        stopAnyRunningMiniGame(); ensureAudio();
        const id = opt().minigameId, T = MM2.meta[id].target;
        currentScore = 0; targetScore_set(T); timeRemaining = 10.0; miniGameRunning = true;
        document.getElementById('gh-tutorial-modal').classList.add('hidden');
        const box = document.getElementById('gh-active-game-box'); box.classList.remove('hidden');
        document.getElementById('game-timer-display').textContent = '10.0с';
        document.getElementById('game-time-bar').style.width = '100%';
        box.querySelectorAll('[id^="arena-game-"]').forEach((a) => a.classList.add('hidden'));
        window.MM2_HOOKS = {
          running: () => miniGameRunning,
          finish: (w) => { if (miniGameRunning) finishMiniGame(w); },
          sync: (sc) => { currentScore = sc; },
          sfx: (k) => { try { playSound(k); } catch (e) {} }
        };
        MM2.run(id, box);
        let lastWhole = 10;
        activeGameTimer = setInterval(() => {
          if (!miniGameRunning) return;
          timeRemaining = Math.max(0, timeRemaining - 0.1);
          document.getElementById('game-timer-display').textContent = timeRemaining.toFixed(1) + 'с';
          document.getElementById('game-time-bar').style.width = (timeRemaining / 10) * 100 + '%';
          const c = Math.ceil(timeRemaining);
          if (c <= 3 && c > 0 && c !== lastWhole) { lastWhole = c; playSound('tick'); }
          if (timeRemaining <= 0) finishMiniGame(currentScore >= MM2.meta[id].target);
        }, 100);
      };
      function targetScore_set(T) { try { targetScore = T; } catch (e) {} }
      const WIN = {
        9: 'Генератор раскрутился на полную! Кислород в куполе восстановлен.', 10: 'Ростки спасены — колпаки защитили их от утечки!',
        11: 'Пыль отправлена в фильтры, воздух снова чистый.', 12: 'Доза подобрана верно — экипаж чувствует себя лучше.',
        13: 'Все образцы льда найдены и надёжно упакованы.', 14: 'Лёд растоплен без перегрева — вода получена!',
        15: 'Код принят — шлюз герметичен и держит давление.', 16: 'Плиты легли идеально — контур базы укреплён.'
      };
      finishMiniGame = function (w) {
        const id = opt().minigameId; _finish(w);
        if (window.MM2 && MM2.has(id)) {
          if (w) document.getElementById('res-desc').textContent = WIN[id];
          else document.getElementById('res-desc').textContent = 'Выполнено ' + currentScore + ' из ' + MM2.meta[id].target + '. Потеряно 1 сердечко (❤️), но ты можешь сразу попробовать ещё раз!';
        }
      };
    })();
