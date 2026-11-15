    // =====================================================================
    // 1. СОСТОЯНИЕ РЕСУРСОВ И ДАННЫЕ КРИЗИСОВ 3А И 3Б (КОМНАТА 3: ЛАБОРАТОРИЯ)
    // =====================================================================
    const gameState = {
      life: 70,     // ❤️ Жизнь
      energy: 80,   // ⚡ Энергия
      shield: 75,   // 🛡️ Щит
      science: 10,  // 🧬 Наука
      hearts: 3,    // ❤️ Попытки
      currentCrisis: '3A',
      selectedOption: 1
    };
    Object.assign(gameState, DuneBridge.load());

    const LAB_CRISES = {
      '3A': {
        code: 'КРИЗИС 3А',
        title: '«Предупреждение NASA DONKI о вспышке»',
        subtitle: 'Нужно перенастроить магнитный щит и антенну! Выбери план действий:',
        options: {
          1: {
            title: 'Направить всю мощность компьютера на расчёт защиты',
            energyDelta: -15,
            lifeDelta: -5,     // учёные устали
            shieldDelta: 20,
            scienceDelta: 0,
            minigameId: 5,
            minigameTag: '〰️ Игра №5: Поймай волну (10с)'
          },
          2: {
            title: 'Отправить ровер на разведку кратера, пока есть связь',
            energyDelta: -10,
            lifeDelta: -8,
            shieldDelta: 0,    // много науки, но щит не вырос!
            scienceDelta: 0,
            minigameId: 6,
            minigameTag: '🚜 Игра №6: Маршрут ровера (10с)'
          }
        }
      },
      '3B': {
        code: 'КРИЗИС 3Б',
        title: '«Анализ марсианского льда»',
        subtitle: 'Образец может дать воду или сломать анализатор! Выбери план действий:',
        options: {
          1: {
            title: 'Перезапустить реактор лаборатории',
            energyDelta: -15,
            lifeDelta: 15,
            shieldDelta: 0,
            scienceDelta: 0,
            minigameId: 13,
            minigameTag: '💡 Реактор: погаси огни (10с)'
          },
          2: {
            title: 'Найти залежи льда датчиком',
            energyDelta: -10,
            lifeDelta: -5,
            shieldDelta: 0,
            scienceDelta: 0,
            minigameId: 14,
            minigameTag: '🧊 Поиск льда (10с)'
          }
        }
      }
    };

    // =====================================================================
    // 2. АНИМАЦИЯ АСТРОНАВТОВ НА ЗЕМЛЕ МАРСА + ИСЧЕЗАЮЩИЕ СЛЕДЫ НА ПЕСКЕ
    // =====================================================================
    const surfaceWalkers = [
      {
        elId: 'surface-astro-1',
        visorId: 'astro1-visor',
        x: 360,
        y: 295,
        minX: 210,
        maxX: 690,
        dir: 1,
        speed: 0.9,
        stepCounter: 0
      },
      {
        elId: 'surface-astro-2',
        visorId: 'astro2-visor',
        x: 1120,
        y: 322,
        minX: 930,
        maxX: 1410,
        dir: -1,
        speed: 0.82,
        stepCounter: 14
      }
    ];

    function spawnFootprint(x, y, stepIndex) {
      const layer = document.getElementById('mars-footprints-layer');
      if (!layer) return;

      const fp = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      const offsetY = (stepIndex % 2 === 0) ? -3 : 3;
      fp.setAttribute('cx', x.toFixed(1));
      fp.setAttribute('cy', (y + offsetY).toFixed(1));
      fp.setAttribute('rx', '6.5');
      fp.setAttribute('ry', '2.8');
      fp.setAttribute('fill', '#6e2912');
      fp.setAttribute('stroke', '#231815');
      fp.setAttribute('stroke-width', '1.2');
      fp.setAttribute('class', 'mars-footprint');

      layer.appendChild(fp);

      // Удаляем след из DOM после завершения плавного затухания (4.5 сек)
      setTimeout(() => {
        if (fp.parentNode) fp.parentNode.removeChild(fp);
      }, 4500);
    }

    function updateSurfaceAstronauts() {
      surfaceWalkers.forEach((w) => {
        w.x += w.dir * w.speed;
        if (w.x >= w.maxX) {
          w.x = w.maxX;
          w.dir = -1;
        } else if (w.x <= w.minX) {
          w.x = w.minX;
          w.dir = 1;
        }

        const astroEl = document.getElementById(w.elId);
        const visorEl = document.getElementById(w.visorId);
        if (astroEl) {
          astroEl.setAttribute('transform', `translate(${w.x.toFixed(1)}, ${w.y})`);
        }
        if (visorEl) {
          visorEl.setAttribute('cx', w.dir > 0 ? '4' : '-4');
        }

        w.stepCounter++;
        if (w.stepCounter % 26 === 0) {
          // Оставляем след позади пяток астронавта на марсианском грунте
          spawnFootprint(w.x - w.dir * 8, w.y + 28, w.stepCounter / 26);
        }
      });

      requestAnimationFrame(updateSurfaceAstronauts);
    }

    // =====================================================================
    // 3. ЗВУКОВОЙ СИНТЕЗАТОР (WEB AUDIO API) И ОБНОВЛЕНИЕ РЕСУРСОВ
    // =====================================================================
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
          osc.frequency.setValueAtTime(540, now);
          osc.frequency.exponentialRampToValueAtTime(920, now + 0.11);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'bad') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.linearRampToValueAtTime(110, now + 0.18);
          gain.gain.setValueAtTime(0.17, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.19);
          osc.start(now);
          osc.stop(now + 0.19);
        } else if (type === 'tick') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(720, now);
          gain.gain.setValueAtTime(0.08, now);
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
          [320, 250, 190].forEach((freq, idx) => {
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
      } catch (e) {}
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

      const heartsStr = '❤️'.repeat(gameState.hearts) + '🖤'.repeat(Math.max(0, 3 - gameState.hearts));
      document.getElementById('hud-hearts').innerHTML = heartsStr;

      ['life', 'energy', 'shield', 'science'].forEach((key) => {
        if (deltas[key]) {
          const el = document.getElementById(`float-${key}`);
          if (el) {
            const val = deltas[key];
            el.textContent = val > 0 ? `+${val}` : `${val}`;
            el.className = `absolute -bottom-8 left-1/2 -translate-x-1/2 font-black text-base sm:text-lg resource-float ${
              val > 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'
            }`;
            setTimeout(() => el.classList.add('hidden'), 1150);
          }
        }
      });
    }

    // =====================================================================
    // 4. ПЕРЕКЛЮЧЕНИЕ КРИЗИСОВ 3А И 3Б И ЭКРАНА ИНСТРУКЦИЙ
    // =====================================================================
    function buildLabRewardBadges(opt) {
      const items = [];
      if (opt.energyDelta !== 0) {
        items.push(`<span class="px-3 py-1 rounded-xl bg-[#fef08a] border-2 border-[#231815] font-extrabold text-sm text-[#854d0e]">${opt.energyDelta > 0 ? '+' : ''}${opt.energyDelta} ⚡</span>`);
      }
      if (opt.lifeDelta !== 0) {
        const isPos = opt.lifeDelta > 0;
        items.push(`<span class="px-3 py-1 rounded-xl ${isPos ? 'bg-[#bbf7d0] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'} border-2 border-[#231815] font-extrabold text-sm">${isPos ? '+' : ''}${opt.lifeDelta} ❤️</span>`);
      }
      if (opt.shieldDelta !== 0) {
        items.push(`<span class="px-3 py-1 rounded-xl bg-[#dbeafe] border-2 border-[#231815] font-extrabold text-sm text-[#1e3a8a]">+${opt.shieldDelta} 🛡️</span>`);
      }
      if (opt.scienceDelta !== 0) {
        items.push(`<span class="px-3 py-1 rounded-xl bg-[#e9d5ff] border-2 border-[#231815] font-extrabold text-sm text-[#6b21a8]">+${opt.scienceDelta} 🧬 Наука</span>`);
      }
      return items.join('');
    }

    function selectLabCrisis(crisisKey) {
      stopAnyRunningMiniGame();
      gameState.currentCrisis = crisisKey;
      const data = LAB_CRISES[crisisKey];

      const tab3A = document.getElementById('tab-crisis-3a');
      const tab3B = document.getElementById('tab-crisis-3b');

      if (crisisKey === '3A') {
        tab3A.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-[#231815] bg-[#38bdf8] text-[#231815] shadow-[0_3px_0_#231815] transition cursor-pointer';
        tab3B.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-transparent hover:border-[#231815] bg-[#f1f5f9] text-[#475569] transition cursor-pointer';
      } else {
        tab3B.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-[#231815] bg-[#38bdf8] text-[#231815] shadow-[0_3px_0_#231815] transition cursor-pointer';
        tab3A.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-transparent hover:border-[#231815] bg-[#f1f5f9] text-[#475569] transition cursor-pointer';
      }

      // Визуальные акценты в интерьере Лаборатории под выбранный кризис
      document.getElementById('ice-laser-beam').classList.toggle('hidden', crisisKey !== '3B');
      document.getElementById('solar-flare-aura').setAttribute('opacity', crisisKey === '3A' ? '0.28' : '0.08');

      document.getElementById('crisis-code-badge').textContent = data.code;
      document.getElementById('crisis-title').textContent = data.title;
      document.getElementById('crisis-subtitle').textContent = data.subtitle;

      const o1 = data.options[1];
      document.getElementById('opt1-title').textContent = o1.title;
      document.getElementById('opt1-minigame-tag').textContent = o1.minigameTag;
      document.getElementById('opt1-rewards').innerHTML = buildLabRewardBadges(o1);

      const o2 = data.options[2];
      document.getElementById('opt2-title').textContent = o2.title;
      document.getElementById('opt2-minigame-tag').textContent = o2.minigameTag;
      document.getElementById('opt2-rewards').innerHTML = buildLabRewardBadges(o2);

      MMCrisis.fill([o1.minigameId, o2.minigameId]);
      resetToCrisisDilemma();
    }

    // a won crisis leads to a new random one; after a loss the same crisis is offered again
    function nextCrisis() { selectLabCrisis(MMCrisis.pick(['3A', '3B'], gameState.currentCrisis)); }
    function afterResult() { if (gameState.lastWin) nextCrisis(); else resetToCrisisDilemma(); }

    function backToBase() {
      stopAnyRunningMiniGame();
      DuneBridge.go('hub');
    }

    function resetToCrisisDilemma() {
      stopAnyRunningMiniGame();
      document.getElementById('lab-dilemma-card').classList.remove('hidden');
      document.getElementById('lab-tutorial-modal').classList.add('hidden');
      document.getElementById('lab-active-game-box').classList.add('hidden');
      document.getElementById('lab-result-modal').classList.add('hidden');
    }

    function openTutorialForOption(optionNum) {
      ensureAudio();
      playSound('tick');
      gameState.selectedOption = optionNum;
      const crisisObj = LAB_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[optionNum];

      document.getElementById('lab-dilemma-card').classList.add('hidden');
      document.getElementById('lab-result-modal').classList.add('hidden');
      const tutModal = document.getElementById('lab-tutorial-modal');
      tutModal.classList.remove('hidden');

      const gif5 = document.getElementById('tut-gif-game5');
      const gif6 = document.getElementById('tut-gif-game6');
      gif5.classList.add('hidden');
      gif6.classList.add('hidden');

      if (optObj.minigameId === 5) {
        const isLaser = gameState.currentCrisis === '3B';
        document.getElementById('tut-title').textContent = isLaser
          ? 'Мини-игра №5: «Поймай волну» (Лазер)'
          : 'Мини-игра №5: «Поймай волну» (Щит)';
        document.getElementById('tut-desc').textContent =
          'Двигай ползунок частоты влево-вправо, чтобы совместить жёлтую и зелёную синусоиды в одну линию и удержать резонанс!';
        gif5.classList.remove('hidden');
      } else {
        document.getElementById('tut-title').textContent = 'Мини-игра №6: «Маршрут ровера»';
        document.getElementById('tut-desc').textContent =
          'Проведи мышкой (или пальцем) непрерывную линию от старта ровера (🚜) до синего камня (🧊 лёд), объезжая красные валуны!';
        gif6.classList.remove('hidden');
      }
    }

    // =====================================================================
    // 5. ДВИЖОК МИНИ-ИГР №5 («ПОЙМАЙ ВОЛНУ») И №6 («МАРШРУТ РОВЕРА») — 10 СЕК
    // =====================================================================
    let activeGameTimer = null;
    let activeAnimationFrame = null;
    let miniGameRunning = false;
    let currentScore = 0;
    let timeRemaining = 10.0;

    function stopAnyRunningMiniGame() {
      miniGameRunning = false;
      if (activeGameTimer) clearInterval(activeGameTimer);
      if (activeAnimationFrame) cancelAnimationFrame(activeAnimationFrame);
      activeGameTimer = null;
      activeAnimationFrame = null;
    }

    function startSelectedMiniGame() {
      stopAnyRunningMiniGame();
      ensureAudio();

      const crisisObj = LAB_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[gameState.selectedOption];

      timeRemaining = 10.0;
      miniGameRunning = true;

      document.getElementById('lab-tutorial-modal').classList.add('hidden');
      const gameBox = document.getElementById('lab-active-game-box');
      gameBox.classList.remove('hidden');

      document.getElementById('game-goal-bar').style.width = '0%';
      document.getElementById('game-timer-display').textContent = '10.0с';
      document.getElementById('game-time-bar').style.width = '100%';

      const arena5 = document.getElementById('arena-game-5');
      const arena6 = document.getElementById('arena-game-6');
      arena5.classList.add('hidden');
      arena6.classList.add('hidden');

      const badge = document.getElementById('active-game-badge');

      if (optObj.minigameId === 5) {
        badge.textContent = gameState.currentCrisis === '3B' ? '〰️ Поймай волну (Лазер)' : '〰️ Поймай волну (Щит)';
        badge.className = 'px-3 py-1 rounded-xl bg-[#38bdf8] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        document.getElementById('game-score-current').textContent = '0%';
        document.getElementById('game-score-target').textContent = '100%';
        arena5.classList.remove('hidden');
        initCatchWaveGame();
      } else {
        badge.textContent = '🚜 Маршрут ровера';
        badge.className = 'px-3 py-1 rounded-xl bg-[#c084fc] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        document.getElementById('game-score-current').textContent = '0%';
        document.getElementById('game-score-target').textContent = '100%';
        arena6.classList.remove('hidden');
        initRoverRouteGame();
      }

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
          finishMiniGame(false);
        }
      }, 100);
    }

    // ---------------- МИНИ-ИГРА №5: «ПОЙМАЙ ВОЛНУ» (СИНУСОИДЫ) ----------------
    function initCatchWaveGame() {
      const canvas = document.getElementById('wave-canvas');
      const ctx = canvas.getContext('2d');
      const slider = document.getElementById('wave-freq-slider');
      const syncBadge = document.getElementById('wave-sync-badge');

      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || 680;
      canvas.height = rect.height || 260;

      // Выбираем случайную целевую частоту (от 28 до 88) и ставим ползунок подальше от неё
      const targetVal = Math.floor(28 + Math.random() * 58);
      const startVal = targetVal > 55 ? 18 : 92;
      slider.value = String(startVal);

      let phase = 0;
      let holdProgress = 0; // 0..100 (набирается при точном совпадении частот)
      let soundCooldown = 0;

      function renderWaveLoop() {
        if (!miniGameRunning) return;

        const userVal = Number(slider.value);
        const diff = Math.abs(userVal - targetVal);
        const matchPct = Math.max(0, Math.round(100 - diff * 1.8));

        syncBadge.textContent = `Точность: ${matchPct}%`;

        // Если две синусоиды практически совпали в одну линию (diff <= 6)
        if (diff <= 6) {
          holdProgress = Math.min(100, holdProgress + 1.35);
          syncBadge.className = 'px-3 py-1 rounded-xl bg-[#4ade80] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
          if (soundCooldown <= 0) {
            playSound('good');
            soundCooldown = 18;
          }
        } else {
          syncBadge.className = 'px-3 py-1 rounded-xl bg-[#fef08a] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        }
        if (soundCooldown > 0) soundCooldown--;

        const progressRounded = Math.round(holdProgress);
        document.getElementById('game-score-current').textContent = `${progressRounded}%`;
        document.getElementById('game-goal-bar').style.width = `${progressRounded}%`;

        if (holdProgress >= 100) {
          finishMiniGame(true);
          return;
        }

        // Отрисовка сетки осциллографа
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx < canvas.width; gx += 40) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, canvas.height);
          ctx.stroke();
        }
        for (let gy = 0; gy < canvas.height; gy += 40) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(canvas.width, gy);
          ctx.stroke();
        }

        const midY = canvas.height / 2;
        const targetFreq = 0.012 + (targetVal / 100) * 0.032;
        const userFreq = 0.012 + (userVal / 100) * 0.032;
        const targetAmp = canvas.height * 0.28;
        const userAmp = canvas.height * (0.28 + ((userVal - targetVal) / 100) * 0.14);

        // 1. Эталонная ЗЕЛЁНАЯ синусоида
        ctx.save();
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = midY + Math.sin(x * targetFreq + phase) * targetAmp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // 2. Управляемая ЖЁЛТАЯ синусоида
        ctx.save();
        ctx.beginPath();
        const phaseOffset = (userVal - targetVal) * 0.06;
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = midY + Math.sin(x * userFreq + phase + phaseOffset) * userAmp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = diff <= 6 ? '#fef08a' : '#facc15';
        ctx.lineWidth = 5;
        ctx.setLineDash(diff <= 6 ? [] : [10, 6]);
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // Подсказка прямо на экране осциллографа при совпадении
        if (diff <= 6) {
          ctx.save();
          ctx.fillStyle = '#4ade80';
          ctx.font = '800 18px MMSans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`⚡ РЕЗОНАНС ПОЙМАН! УДЕРЖИВАЙ: ${progressRounded}%`, canvas.width / 2, 34);
          ctx.restore();
        }

        phase += 0.07;
        activeAnimationFrame = requestAnimationFrame(renderWaveLoop);
      }

      activeAnimationFrame = requestAnimationFrame(renderWaveLoop);
    }

    // Позволяем крутить ползунок волны стрелками клавиатуры
    window.addEventListener('keydown', (e) => {
      if (!miniGameRunning) return;
      const crisisObj = LAB_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[gameState.selectedOption];
      if (optObj.minigameId === 5) {
        const slider = document.getElementById('wave-freq-slider');
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          slider.value = String(Math.max(10, Number(slider.value) - 2));
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          slider.value = String(Math.min(100, Number(slider.value) + 2));
        }
      }
    });

    // ---------------- МИНИ-ИГРА №6: «МАРШРУТ РОВЕРА» (НАРИСОВАТЬ ПУТЬ ДО ЛЬДА) ----------------
    let roverRouteResetFn = null;

    function resetRoverRouteAttempt() {
      if (roverRouteResetFn) roverRouteResetFn();
    }

    function initRoverRouteGame() {
      const canvas = document.getElementById('rover-route-canvas');
      const ctx = canvas.getContext('2d');
      const footerEl = document.getElementById('rover-status-footer');
      const wrapperEl = document.getElementById('rover-map-wrapper');

      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || 680;
      canvas.height = rect.height || 300;

      const startZone = { x: 72, y: canvas.height * 0.72, r: 34 };
      const goalZone = { x: canvas.width - 78, y: canvas.height * 0.28, r: 36 };

      // 4 красных марсианских валуна между стартом и синим льдом
      const rocks = [
        { x: canvas.width * 0.30, y: canvas.height * 0.68, r: 32 },
        { x: canvas.width * 0.46, y: canvas.height * 0.30, r: 34 },
        { x: canvas.width * 0.62, y: canvas.height * 0.70, r: 33 },
        { x: canvas.width * 0.76, y: canvas.height * 0.34, r: 28 }
      ];

      let pathPoints = [];
      let isDrawing = false;
      let isDrivingWin = false;
      let roverAnimIdx = 0;

      roverRouteResetFn = () => {
        if (isDrivingWin) return;
        pathPoints = [];
        isDrawing = false;
        document.getElementById('game-score-current').textContent = '0%';
        document.getElementById('game-goal-bar').style.width = '0%';
        footerEl.textContent = 'Начни вести линию от зелёного круга «СТАРТ РОВЕРА» слева!';
        footerEl.className = 'px-4 py-1 rounded-full bg-black/65 text-white text-xs sm:text-sm font-bold';
      };

      function getCanvasPoint(clientX, clientY) {
        const b = canvas.getBoundingClientRect();
        return {
          x: ((clientX - b.left) / b.width) * canvas.width,
          y: ((clientY - b.top) / b.height) * canvas.height
        };
      }

      function handlePointerDown(clientX, clientY) {
        if (!miniGameRunning || isDrivingWin) return;
        const pt = getCanvasPoint(clientX, clientY);
        const distStart = Math.hypot(pt.x - startZone.x, pt.y - startZone.y);
        if (distStart <= startZone.r + 18) {
          isDrawing = true;
          pathPoints = [pt];
          playSound('tick');
          footerEl.textContent = 'Веди линию к синему кристаллу льда 🧊! Объезжай красные валуны!';
          footerEl.className = 'px-4 py-1 rounded-full bg-[#0284c7] text-white text-xs sm:text-sm font-bold';
        } else {
          footerEl.textContent = '⚠️ Начни рисовать маршрут прямо из зелёного круга «СТАРТ» слева!';
        }
      }

      function handlePointerMove(clientX, clientY) {
        if (!miniGameRunning || !isDrawing || isDrivingWin) return;
        const pt = getCanvasPoint(clientX, clientY);
        pathPoints.push(pt);

        // Процент приближения к синему камню (льду)
        const totalDist = Math.hypot(goalZone.x - startZone.x, goalZone.y - startZone.y);
        const remainDist = Math.hypot(goalZone.x - pt.x, goalZone.y - pt.y);
        const pct = Math.max(0, Math.min(95, Math.round((1 - remainDist / totalDist) * 100)));
        document.getElementById('game-score-current').textContent = `${pct}%`;
        document.getElementById('game-goal-bar').style.width = `${pct}%`;

        // Проверка столкновения линии с красными валунами
        for (const rock of rocks) {
          if (Math.hypot(pt.x - rock.x, pt.y - rock.y) < rock.r - 3) {
            playSound('bad');
            isDrawing = false;
            pathPoints = [];
            wrapperEl.classList.add('shake-anim');
            setTimeout(() => wrapperEl.classList.remove('shake-anim'), 260);
            document.getElementById('game-score-current').textContent = '0%';
            document.getElementById('game-goal-bar').style.width = '0%';
            footerEl.textContent = '💥 Ой! Маршрут задел красный валун! Проведи линию заново от СТАРТА!';
            footerEl.className = 'px-4 py-1 rounded-full bg-[#dc2626] text-white text-xs sm:text-sm font-bold';
            return;
          }
        }

        // Проверка достижения синего камня (льда)
        if (Math.hypot(pt.x - goalZone.x, pt.y - goalZone.y) <= goalZone.r) {
          isDrawing = false;
          isDrivingWin = true;
          roverAnimIdx = 0;
          playSound('good');
          document.getElementById('game-score-current').textContent = '100%';
          document.getElementById('game-goal-bar').style.width = '100%';
          footerEl.textContent = '🚀 Маршрут построен! Ровер едет к образцу льда...';
          footerEl.className = 'px-4 py-1 rounded-full bg-[#16a34a] text-white text-xs sm:text-sm font-bold';
        }
      }

      function handlePointerUp() {
        if (!isDrivingWin && isDrawing) {
          isDrawing = false;
        }
      }

      canvas.onmousedown = (e) => handlePointerDown(e.clientX, e.clientY);
      canvas.onmousemove = (e) => handlePointerMove(e.clientX, e.clientY);
      window.onmouseup = () => handlePointerUp();

      canvas.ontouchstart = (e) => {
        if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      };
      canvas.ontouchmove = (e) => {
        if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      };
      canvas.ontouchend = () => handlePointerUp();

      function renderRoverMapLoop() {
        if (!miniGameRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Фоновые изолинии кратера Марса
        ctx.strokeStyle = 'rgba(124, 45, 18, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 110, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 190, 0, Math.PI * 2);
        ctx.stroke();

        // Отрисовка проведённого игроком маршрута ровера
        if (pathPoints.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
          for (let i = 1; i < pathPoints.length; i++) {
            ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          }
          ctx.strokeStyle = '#231815';
          ctx.lineWidth = 11;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 6;
          ctx.setLineDash([12, 8]);
          ctx.stroke();
          ctx.restore();
        }

        // Зелёная зона СТАРТА
        ctx.save();
        ctx.beginPath();
        ctx.arc(startZone.x, startZone.y, startZone.r, 0, Math.PI * 2);
        ctx.fillStyle = '#4ade80';
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#231815';
        ctx.stroke();
        ctx.fillStyle = '#231815';
        ctx.font = '800 12px MMSans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('СТАРТ', startZone.x, startZone.y + startZone.r + 16);
        ctx.restore();

        // Голубая зона ФИНИША (Синий камень — марсианский лёд)
        ctx.save();
        ctx.beginPath();
        ctx.arc(goalZone.x, goalZone.y, goalZone.r, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#231815';
        ctx.stroke();

        // Многогранный синий кристалл льда
        ctx.beginPath();
        ctx.moveTo(goalZone.x, goalZone.y - 20);
        ctx.lineTo(goalZone.x + 18, goalZone.y - 6);
        ctx.lineTo(goalZone.x + 12, goalZone.y + 18);
        ctx.lineTo(goalZone.x - 12, goalZone.y + 18);
        ctx.lineTo(goalZone.x - 18, goalZone.y - 6);
        ctx.closePath();
        ctx.fillStyle = '#67e8f9';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#231815';
        ctx.stroke();

        ctx.fillStyle = '#fffdf9';
        ctx.font = '800 12px MMSans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧊 СИНИЙ ЛЁД', goalZone.x, goalZone.y + goalZone.r + 16);
        ctx.restore();

        // Красные марсианские валуны (препятствия)
        rocks.forEach((r) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          ctx.fillStyle = '#dc2626';
          ctx.fill();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = '#231815';
          ctx.stroke();

          // Грани валуна
          ctx.beginPath();
          ctx.arc(r.x - 7, r.y - 7, r.r * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#f87171';
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = '800 11px MMSans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ВАЛУН', r.x, r.y + 4);
          ctx.restore();
        });

        // Позиция иконки ровера (на старте или едет по построенной линии)
        let roverPos = { x: startZone.x, y: startZone.y };
        if (isDrivingWin && pathPoints.length > 0) {
          roverAnimIdx = Math.min(pathPoints.length - 1, roverAnimIdx + Math.max(2, Math.ceil(pathPoints.length / 18)));
          roverPos = pathPoints[roverAnimIdx];
          if (roverAnimIdx >= pathPoints.length - 1) {
            finishMiniGame(true);
            return;
          }
        }

        ctx.save();
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚜', roverPos.x, roverPos.y);
        ctx.restore();

        activeAnimationFrame = requestAnimationFrame(renderRoverMapLoop);
      }

      activeAnimationFrame = requestAnimationFrame(renderRoverMapLoop);
    }

    // =====================================================================
    // 6. ЗАВЕРШЕНИЕ МИНИ-ИГРЫ И НАЧИСЛЕНИЕ/СПИСАНИЕ РЕСУРСОВ ЛАБОРАТОРИИ
    // =====================================================================
    function finishMiniGame(isWin) {
      stopAnyRunningMiniGame();

      const crisisObj = LAB_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[gameState.selectedOption];

      document.getElementById('lab-active-game-box').classList.add('hidden');
      const resModal = document.getElementById('lab-result-modal');
      resModal.classList.remove('hidden');

      const iconEl = document.getElementById('res-icon');
      const titleEl = document.getElementById('res-title');
      const descEl = document.getElementById('res-desc');
      const badgesEl = document.getElementById('res-badges');

      if (isWin) {
        playSound('win'); gameState.lastWin = true;
        DuneBridge.mini(gameState.currentCrisis, optObj.minigameId, true, (typeof currentScore!=='undefined'?currentScore:0), typeof timeRemaining!=='undefined'?timeRemaining:0);
        DuneBridge.done(gameState.currentCrisis);
        gameState.energy += optObj.energyDelta;
        gameState.life += optObj.lifeDelta;
        gameState.shield += optObj.shieldDelta;
        gameState.science += optObj.scienceDelta;

        updateResourceHUD({
          energy: optObj.energyDelta,
          life: optObj.lifeDelta,
          shield: optObj.shieldDelta,
          science: optObj.scienceDelta
        });

        iconEl.textContent = '🎉';
        titleEl.textContent = 'Задача Лаборатории решена!';
        descEl.textContent =
          optObj.minigameId === 5
            ? 'Частота синхронизирована за 10 секунд! Системы Лаборатории отработали идеально.'
            : 'Марсоход успешно объехал все красные валуны и добыл ценнейший образец синего льда!';

        badgesEl.innerHTML = buildLabRewardBadges(optObj);
      } else {
        playSound('lose'); gameState.lastWin = false;
        DuneBridge.mini(gameState.currentCrisis, optObj.minigameId, false, (typeof currentScore!=='undefined'?currentScore:0), 0);
        gameState.hearts = Math.max(0, gameState.hearts - 1);
        if (gameState.hearts === 0) {
          setTimeout(() => {
            gameState.hearts = 3;
            updateResourceHUD();
          }, 1200);
        }
        updateResourceHUD();

        iconEl.textContent = '⚠️';
        titleEl.textContent = 'Время вышло!';
        descEl.textContent = 'Потеряно 1 сердечко (❤️), но ты можешь сразу попробовать снова или выбрать другой вариант!';
        badgesEl.innerHTML = `
          <span class="px-3.5 py-1.5 rounded-xl bg-[#ffe4e6] border-2 border-[#231815] font-extrabold text-sm text-[#be123c]">
            -1 ❤️ Попытка
          </span>
        `;
      }
    }

    // Запуск при загрузке
    window.onload = () => {
      updateResourceHUD();
      DuneBridge.decorateRoom();
      MMCrisis.build('lab-dilemma-card');
      MMCrisis.hideTabs();
      selectLabCrisis(MMCrisis.pick(['3A', '3B']));
      requestAnimationFrame(updateSurfaceAstronauts);
    };
  


    // ===== MM2 wiring: second-crisis mini-games (ids 9-16) =====
    (function () {
      const _open = openTutorialForOption, _stop = stopAnyRunningMiniGame, _finish = finishMiniGame;
      const opt = () => LAB_CRISES[gameState.currentCrisis].options[gameState.selectedOption];
      const isNew = () => window.MM2 && MM2.has(opt().minigameId);
      openTutorialForOption = function (n) {
        gameState.selectedOption = n;
        if (!(window.MM2 && MM2.has(LAB_CRISES[gameState.currentCrisis].options[n].minigameId))) { MM2.tutorialReset && MM2.tutorialReset(); return _open(n); }
        ensureAudio(); playSound('tick');
        document.getElementById('lab-dilemma-card') && document.getElementById('lab-dilemma-card').classList.add('hidden');
        document.getElementById('lab-result-modal').classList.add('hidden');
        document.getElementById('lab-tutorial-modal').classList.remove('hidden');
        MM2.tutorial(LAB_CRISES[gameState.currentCrisis].options[n].minigameId);
      };
      stopAnyRunningMiniGame = function () { if (window.MM2) MM2.reset(); _stop(); };
      const _start = startSelectedMiniGame;
      startSelectedMiniGame = function () {
        if (!isNew()) { if (window.MM2) MM2.reset(); return _start(); }
        stopAnyRunningMiniGame(); ensureAudio();
        const id = opt().minigameId, T = MM2.meta[id].target;
        currentScore = 0; targetScore_set(T); timeRemaining = 10.0; miniGameRunning = true;
        document.getElementById('lab-tutorial-modal').classList.add('hidden');
        const box = document.getElementById('lab-active-game-box'); box.classList.remove('hidden');
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
