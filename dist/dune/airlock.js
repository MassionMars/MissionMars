const gameState = {
      life: 70,
      energy: 80,
      shield: 75,
      science: 10,
      hearts: 3,
      currentCrisis: '4A',
      selectedOption: 1
    };
    Object.assign(gameState, DuneBridge.load());

    const AIRLOCK_CRISES = {
      '4A': {
        code: 'КРИЗИС 4А',
        title: '«Солнечные панели занесло песком перед бурей»',
        subtitle: 'Песчаная буря засыпает батареи! Выбери план действий для шлюза:',
        options: {
          1: {
            title: 'Выйти в скафандрах и очистить панели под ветром',
            lifeDelta: -15,
            energyDelta: 25,
            shieldDelta: 0,
            scienceDelta: 0,
            minigameId: 7,
            minigameTag: '🧹 Игра №7: Очистка панелей (10с)'
          },
          2: {
            title: 'Свернуть панели и укрепить стены мешками с реголитом',
            lifeDelta: -10,
            energyDelta: -5,
            shieldDelta: 25,
            scienceDelta: 0,
            minigameId: 8,
            minigameTag: '🧱 Игра №8: Залатай обшивку (10с)'
          }
        }
      },
      '4B': {
        code: 'КРИЗИС 4Б',
        title: '«Падение давления в шлюзе»',
        subtitle: 'Нужно срочно герметизировать стык и удерживать контур базы:',
        options: {
          1: {
            title: 'Собрать панели аварийного люка',
            lifeDelta: -15,
            energyDelta: 25,
            shieldDelta: 0,
            scienceDelta: 0,
            minigameId: 15,
            minigameTag: '🚪 Люк шлюза (10с)'
          },
          2: {
            title: 'Выровнять давление в контуре',
            lifeDelta: -12,
            energyDelta: 0,
            shieldDelta: 25,
            scienceDelta: 0,
            minigameId: 16,
            minigameTag: '🎚️ Давление в шлюзе (10с)'
          }
        }
      }
    };

    const surfaceWalkers = [
      {
        elId: 'surface-astro-1',
        visorId: 'astro1-visor',
        x: 360,
        y: 298,
        minX: 180,
        maxX: 680,
        dir: 1,
        speed: 0.92,
        stepCounter: 0
      },
      {
        elId: 'surface-astro-2',
        visorId: 'astro2-visor',
        x: 1080,
        y: 324,
        minX: 890,
        maxX: 1380,
        dir: -1,
        speed: 0.84,
        stepCounter: 13
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
          spawnFootprint(w.x - w.dir * 8, w.y + 28, w.stepCounter / 26);
        }
      });

      requestAnimationFrame(updateSurfaceAstronauts);
    }

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
        } else if (type === 'brush') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(340 + Math.random() * 180, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.linearRampToValueAtTime(0.005, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
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

    function buildAirlockRewardBadges(opt) {
      const items = [];
      if (opt.lifeDelta !== 0) {
        const isPos = opt.lifeDelta > 0;
        items.push(`<span class="px-3 py-1 rounded-xl ${isPos ? 'bg-[#bbf7d0] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'} border-2 border-[#231815] font-extrabold text-sm">${isPos ? '+' : ''}${opt.lifeDelta} ❤️</span>`);
      }
      if (opt.energyDelta !== 0) {
        const isPos = opt.energyDelta > 0;
        items.push(`<span class="px-3 py-1 rounded-xl ${isPos ? 'bg-[#fef08a] text-[#854d0e]' : 'bg-[#fee2e2] text-[#991b1b]'} border-2 border-[#231815] font-extrabold text-sm">${isPos ? '+' : ''}${opt.energyDelta} ⚡</span>`);
      }
      if (opt.shieldDelta !== 0) {
        items.push(`<span class="px-3 py-1 rounded-xl bg-[#dbeafe] border-2 border-[#231815] font-extrabold text-sm text-[#1e3a8a]">+${opt.shieldDelta} 🛡️</span>`);
      }
      return items.join('');
    }

    function selectAirlockCrisis(crisisKey) {
      stopAnyRunningMiniGame();
      gameState.currentCrisis = crisisKey;
      const data = AIRLOCK_CRISES[crisisKey];

      const tab4A = document.getElementById('tab-crisis-4a');
      const tab4B = document.getElementById('tab-crisis-4b');

      if (crisisKey === '4A') {
        tab4A.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-[#231815] bg-[#f59e0b] text-[#231815] shadow-[0_3px_0_#231815] transition cursor-pointer';
        tab4B.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-transparent hover:border-[#231815] bg-[#f1f5f9] text-[#475569] transition cursor-pointer';
      } else {
        tab4B.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-[#231815] bg-[#f59e0b] text-[#231815] shadow-[0_3px_0_#231815] transition cursor-pointer';
        tab4A.className = 'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-extrabold text-sm sm:text-lg border-[3px] border-transparent hover:border-[#231815] bg-[#f1f5f9] text-[#475569] transition cursor-pointer';
      }

      document.getElementById('hull-breach-visual').classList.toggle('hidden', crisisKey !== '4B');
      document.getElementById('airlock-top-light').setAttribute('fill', crisisKey === '4B' ? '#ef4444' : '#4ade80');

      document.getElementById('crisis-code-badge').textContent = data.code;
      document.getElementById('crisis-title').textContent = data.title;
      document.getElementById('crisis-subtitle').textContent = data.subtitle;

      const o1 = data.options[1];
      document.getElementById('opt1-title').textContent = o1.title;
      document.getElementById('opt1-minigame-tag').textContent = o1.minigameTag;
      document.getElementById('opt1-rewards').innerHTML = buildAirlockRewardBadges(o1);

      const o2 = data.options[2];
      document.getElementById('opt2-title').textContent = o2.title;
      document.getElementById('opt2-minigame-tag').textContent = o2.minigameTag;
      document.getElementById('opt2-rewards').innerHTML = buildAirlockRewardBadges(o2);

      MMCrisis.fill([o1.minigameId, o2.minigameId]);
      resetToCrisisDilemma();
    }

    function nextCrisis() { selectAirlockCrisis(MMCrisis.pick(['4A', '4B'], gameState.currentCrisis)); }
    function afterResult() { if (gameState.lastWin) nextCrisis(); else resetToCrisisDilemma(); }

    function backToBase() {
      stopAnyRunningMiniGame();
      DuneBridge.go('hub');
    }

    function resetToCrisisDilemma() {
      stopAnyRunningMiniGame();
      document.getElementById('airlock-dilemma-card').classList.remove('hidden');
      document.getElementById('airlock-tutorial-modal').classList.add('hidden');
      document.getElementById('airlock-active-game-box').classList.add('hidden');
      document.getElementById('airlock-result-modal').classList.add('hidden');
    }

    function openTutorialForOption(optionNum) {
      ensureAudio();
      playSound('tick');
      gameState.selectedOption = optionNum;
      const crisisObj = AIRLOCK_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[optionNum];

      document.getElementById('airlock-dilemma-card').classList.add('hidden');
      document.getElementById('airlock-result-modal').classList.add('hidden');
      const tutModal = document.getElementById('airlock-tutorial-modal');
      tutModal.classList.remove('hidden');

      const gif7 = document.getElementById('tut-gif-game7');
      const gif8 = document.getElementById('tut-gif-game8');
      gif7.classList.add('hidden');
      gif8.classList.add('hidden');

      if (optObj.minigameId === 7) {
        const isValveMode = gameState.currentCrisis === '4B';
        document.getElementById('tut-title').textContent = isValveMode
          ? 'Мини-игра №7: «Очистка панелей и вентилей»'
          : 'Мини-игра №7: «Очистка панелей»';
        document.getElementById('tut-desc').textContent =
          'Быстро води мышкой или пальцем (как щёткой) по солнечной батарее, стирая слой оранжевого песка, пока буря не засыпала её снова!';
        gif7.classList.remove('hidden');
      } else {
        document.getElementById('tut-title').textContent = 'Мини-игра №8: «Залатай обшивку»';
        document.getElementById('tut-desc').textContent =
          'Перетащи 4 защитные плиты из реголита (или нажми на них) на мигающие красные трещины на стене базы до конца таймера!';
        gif8.classList.remove('hidden');
      }
    }

    let activeGameTimer = null;
    let activeAnimationFrame = null;
    let activeStormInterval = null;
    let miniGameRunning = false;
    let currentScore = 0;
    let timeRemaining = 10.0;

    function stopAnyRunningMiniGame() {
      miniGameRunning = false;
      if (activeGameTimer) clearInterval(activeGameTimer);
      if (activeStormInterval) clearInterval(activeStormInterval);
      if (activeAnimationFrame) cancelAnimationFrame(activeAnimationFrame);
      activeGameTimer = null;
      activeStormInterval = null;
      activeAnimationFrame = null;
    }

    function startSelectedMiniGame() {
      stopAnyRunningMiniGame();
      ensureAudio();

      const crisisObj = AIRLOCK_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[gameState.selectedOption];

      timeRemaining = 10.0;
      miniGameRunning = true;

      document.getElementById('airlock-tutorial-modal').classList.add('hidden');
      const gameBox = document.getElementById('airlock-active-game-box');
      gameBox.classList.remove('hidden');

      document.getElementById('game-goal-bar').style.width = '0%';
      document.getElementById('game-timer-display').textContent = '10.0с';
      document.getElementById('game-time-bar').style.width = '100%';

      const arena7 = document.getElementById('arena-game-7');
      const arena8 = document.getElementById('arena-game-8');
      arena7.classList.add('hidden');
      arena8.classList.add('hidden');

      const badge = document.getElementById('active-game-badge');

      if (optObj.minigameId === 7) {
        badge.textContent = gameState.currentCrisis === '4B' ? '🧹 Очистка вентилей и панелей' : '🧹 Очистка панелей';
        badge.className = 'px-3 py-1 rounded-xl bg-[#f59e0b] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        document.getElementById('game-score-current').textContent = '0%';
        document.getElementById('game-score-target').textContent = '100%';
        arena7.classList.remove('hidden');
        initCleanPanelsGame();
      } else {
        badge.textContent = '🧱 Залатай обшивку';
        badge.className = 'px-3 py-1 rounded-xl bg-[#60a5fa] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-[#231815]';
        document.getElementById('game-score-current').textContent = '0';
        document.getElementById('game-score-target').textContent = '4';
        arena8.classList.remove('hidden');
        initPatchHullGame();
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

    function initCleanPanelsGame() {
      const canvas = document.getElementById('sand-wipe-canvas');
      const ctx = canvas.getContext('2d');

      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || 660;
      canvas.height = rect.height || 300;

      const cols = 22;
      const rows = 10;
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
      const sandGrid = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          sandGrid.push({
            r,
            c,
            x: c * cellW,
            y: r * cellH,
            sandLevel: 1.0
          });
        }
      }

      let brushPos = { x: canvas.width / 2, y: canvas.height / 2 };
      let soundThrottle = 0;

      function wipeAt(clientX, clientY) {
        if (!miniGameRunning) return;
        const b = canvas.getBoundingClientRect();
        const px = ((clientX - b.left) / b.width) * canvas.width;
        const py = ((clientY - b.top) / b.height) * canvas.height;
        brushPos = { x: px, y: py };

        let wipedAny = false;
        const brushRadius = 56;

        for (let i = 0; i < sandGrid.length; i++) {
          const cell = sandGrid[i];
          const cx = cell.x + cellW / 2;
          const cy = cell.y + cellH / 2;
          const dist = Math.hypot(px - cx, py - cy);
          if (dist <= brushRadius && cell.sandLevel > 0) {
            cell.sandLevel = Math.max(0, cell.sandLevel - 0.55);
            wipedAny = true;
          }
        }

        if (wipedAny && soundThrottle <= 0) {
          playSound('brush');
          soundThrottle = 5;
        }
      }

      canvas.onmousemove = (e) => wipeAt(e.clientX, e.clientY);
      canvas.ontouchmove = (e) => {
        if (e.touches[0]) wipeAt(e.touches[0].clientX, e.touches[0].clientY);
      };
      canvas.onmousedown = (e) => wipeAt(e.clientX, e.clientY);

      activeStormInterval = setInterval(() => {
        if (!miniGameRunning) return;
        for (let k = 0; k < 6; k++) {
          const idx = Math.floor(Math.random() * sandGrid.length);
          sandGrid[idx].sandLevel = Math.min(1.0, sandGrid[idx].sandLevel + 0.28);
        }
      }, 650);

      function renderSandLoop() {
        if (!miniGameRunning) return;
        if (soundThrottle > 0) soundThrottle--;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let cleanCount = 0;
        for (let i = 0; i < sandGrid.length; i++) {
          const cell = sandGrid[i];
          if (cell.sandLevel <= 0.15) {
            cleanCount++;
          } else {
            ctx.save();
            ctx.fillStyle = `rgba(217, 119, 6, ${cell.sandLevel * 0.94})`;
            ctx.fillRect(cell.x - 0.5, cell.y - 0.5, cellW + 1, cellH + 1);

            ctx.fillStyle = `rgba(146, 64, 14, ${cell.sandLevel * 0.65})`;
            ctx.beginPath();
            ctx.arc(cell.x + cellW * 0.35, cell.y + cellH * 0.45, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        const rawCleanRatio = cleanCount / sandGrid.length;
        const normalizedPct = Math.min(100, Math.round((rawCleanRatio / 0.88) * 100));

        document.getElementById('game-score-current').textContent = `${normalizedPct}%`;
        document.getElementById('game-goal-bar').style.width = `${normalizedPct}%`;

        if (normalizedPct >= 100) {
          finishMiniGame(true);
          return;
        }

        ctx.save();
        ctx.font = '34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧹', brushPos.x, brushPos.y);
        ctx.restore();

        activeAnimationFrame = requestAnimationFrame(renderSandLoop);
      }

      activeAnimationFrame = requestAnimationFrame(renderSandLoop);
    }

    function initPatchHullGame() {
      const cracksGrid = document.getElementById('hull-cracks-grid');
      const platesPool = document.getElementById('regolith-plates-pool');
      const badgeEl = document.getElementById('patch-counter-badge');

      cracksGrid.innerHTML = '';
      platesPool.innerHTML = '';

      let patchedCount = 0;
      let selectedPlateEl = null;

      const CRACK_SPOTS = [
        { id: 1, label: 'Трещина сектора А-1' },
        { id: 2, label: 'Трещина сектора А-2' },
        { id: 3, label: 'Шов гермоконтура Б-1' },
        { id: 4, label: 'Шов гермоконтура Б-2' }
      ];

      function applyPatchToCrack(crackEl, plateEl) {
        if (!miniGameRunning || crackEl.dataset.sealed === 'true') return;
        playSound('good');

        crackEl.dataset.sealed = 'true';
        crackEl.className =
          'relative rounded-2xl bg-[#dcfce7] border-[3px] border-[#231815] shadow-[0_4px_0_#231815] flex flex-col items-center justify-center p-3 transition-all';
        crackEl.innerHTML = `
          <div class="px-3 py-1.5 rounded-xl bg-[#d97706] border-2 border-[#231815] font-extrabold text-xs sm:text-sm text-white shadow">
            🧱 Плита реголита закреплена!
          </div>
          <span class="text-xs font-extrabold text-[#166534] mt-1">✅ ГЕРМЕТИЧНО</span>
        `;

        if (plateEl) {
          plateEl.disabled = true;
          plateEl.classList.add('opacity-30', 'pointer-events-none', 'scale-90');
        }
        selectedPlateEl = null;

        patchedCount++;
        badgeEl.textContent = `Залатано: ${patchedCount} / 4`;
        document.getElementById('game-score-current').textContent = String(patchedCount);
        document.getElementById('game-goal-bar').style.width = `${(patchedCount / 4) * 100}%`;

        if (patchedCount >= 4) {
          setTimeout(() => finishMiniGame(true), 180);
        }
      }

      CRACK_SPOTS.forEach((spot) => {
        const crackEl = document.createElement('div');
        crackEl.dataset.sealed = 'false';
        crackEl.className =
          'cursor-pointer relative rounded-2xl bg-[#fee2e2]/95 hover:bg-[#fecaca] border-[3px] border-dashed border-[#dc2626] shadow-[0_4px_0_#231815] flex flex-col items-center justify-center p-3 transition-all';
        crackEl.innerHTML = `
          <div class="text-2xl sm:text-3xl led-blink-fast">⚡🚨</div>
          <div class="text-xs sm:text-sm font-extrabold text-[#991b1b] mt-1">${spot.label}</div>
          <div class="text-[11px] font-bold text-[#dc2626]">Перетащи или нажми сюда!</div>
        `;

        crackEl.ondragover = (e) => e.preventDefault();
        crackEl.ondrop = (e) => {
          e.preventDefault();
          const plateId = e.dataTransfer.getData('text/plain');
          const pEl = platesPool.querySelector(`[data-plate-id="${plateId}"]`);
          if (pEl && !pEl.disabled) {
            applyPatchToCrack(crackEl, pEl);
          }
        };

        crackEl.onclick = () => {
          const availablePlate =
            selectedPlateEl || platesPool.querySelector('button:not([disabled])');
          if (availablePlate) {
            applyPatchToCrack(crackEl, availablePlate);
          }
        };

        cracksGrid.appendChild(crackEl);
      });

      for (let i = 1; i <= 4; i++) {
        const plateBtn = document.createElement('button');
        plateBtn.type = 'button';
        plateBtn.draggable = true;
        plateBtn.dataset.plateId = String(i);
        plateBtn.className =
          'cursor-grab active:cursor-grabbing px-4 py-2.5 rounded-2xl bg-gradient-to-b from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] border-[3px] border-[#231815] shadow-[0_4px_0_#231815] flex items-center gap-2 font-extrabold text-xs sm:text-sm text-[#231815] transition transform hover:-translate-y-0.5';
        plateBtn.innerHTML = `
          <span class="text-lg">🧱</span>
          <span>Плита реголита #${i}</span>
        `;

        plateBtn.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', String(i));
          selectedPlateEl = plateBtn;
        });

        plateBtn.addEventListener('click', () => {
          playSound('tick');
          selectedPlateEl = plateBtn;

          const firstOpenCrack = cracksGrid.querySelector('[data-sealed="false"]');
          if (firstOpenCrack) {
            applyPatchToCrack(firstOpenCrack, plateBtn);
          }
        });

        platesPool.appendChild(plateBtn);
      }
    }

    function finishMiniGame(isWin) {
      stopAnyRunningMiniGame();

      const crisisObj = AIRLOCK_CRISES[gameState.currentCrisis];
      const optObj = crisisObj.options[gameState.selectedOption];

      document.getElementById('airlock-active-game-box').classList.add('hidden');
      const resModal = document.getElementById('airlock-result-modal');
      resModal.classList.remove('hidden');

      const iconEl = document.getElementById('res-icon');
      const titleEl = document.getElementById('res-title');
      const descEl = document.getElementById('res-desc');
      const badgesEl = document.getElementById('res-badges');

      if (isWin) {
        playSound('win'); gameState.lastWin = true;
        DuneBridge.mini(gameState.currentCrisis, optObj.minigameId, true, (typeof currentScore!=='undefined'?currentScore:0), typeof timeRemaining!=='undefined'?timeRemaining:0);
        DuneBridge.done(gameState.currentCrisis);
        gameState.life += optObj.lifeDelta;
        gameState.energy += optObj.energyDelta;
        gameState.shield += optObj.shieldDelta;

        if (optObj.minigameId === 7) {
          document.querySelectorAll('.ext-panel-sand').forEach((el) => {
            el.setAttribute('opacity', '0.08');
          });
        }

        updateResourceHUD({
          life: optObj.lifeDelta,
          energy: optObj.energyDelta,
          shield: optObj.shieldDelta
        });

        iconEl.textContent = '🎉';
        titleEl.textContent = 'Шлюз и база в безопасности!';
        descEl.textContent =
          optObj.minigameId === 7
            ? 'Солнечные панели очищены от марсианского песка за 10 секунд! База получила +25 ⚡ Энергии.'
            : 'Все трещины залатаны защитными плитами из реголита! Радиационный щит укреплён на +25 🛡️.';

        badgesEl.innerHTML = buildAirlockRewardBadges(optObj);
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
        descEl.textContent = 'Потеряно 1 сердечко (❤️), но ты можешь сразу попробовать ещё раз!';
        badgesEl.innerHTML = `
          <span class="px-3.5 py-1.5 rounded-xl bg-[#ffe4e6] border-2 border-[#231815] font-extrabold text-sm text-[#be123c]">
            -1 ❤️ Попытка
          </span>
        `;
      }
    }

    window.onload = () => {
      updateResourceHUD();
      DuneBridge.decorateRoom();
      MMCrisis.build('airlock-dilemma-card');
      MMCrisis.hideTabs();
      selectAirlockCrisis(MMCrisis.pick(['4A', '4B']));
      requestAnimationFrame(updateSurfaceAstronauts);
    };

    (function () {
      const _open = openTutorialForOption, _stop = stopAnyRunningMiniGame, _finish = finishMiniGame;
      const opt = () => AIRLOCK_CRISES[gameState.currentCrisis].options[gameState.selectedOption];
      const isNew = () => window.MM2 && MM2.has(opt().minigameId);
      openTutorialForOption = function (n) {
        gameState.selectedOption = n;
        if (!(window.MM2 && MM2.has(AIRLOCK_CRISES[gameState.currentCrisis].options[n].minigameId))) { MM2.tutorialReset && MM2.tutorialReset(); return _open(n); }
        ensureAudio(); playSound('tick');
        document.getElementById('airlock-dilemma-card') && document.getElementById('airlock-dilemma-card').classList.add('hidden');
        document.getElementById('airlock-result-modal').classList.add('hidden');
        document.getElementById('airlock-tutorial-modal').classList.remove('hidden');
        MM2.tutorial(AIRLOCK_CRISES[gameState.currentCrisis].options[n].minigameId);
      };
      stopAnyRunningMiniGame = function () { if (window.MM2) MM2.reset(); _stop(); };
      const _start = startSelectedMiniGame;
      startSelectedMiniGame = function () {
        if (!isNew()) { if (window.MM2) MM2.reset(); return _start(); }
        stopAnyRunningMiniGame(); ensureAudio();
        const id = opt().minigameId, T = MM2.meta[id].target;
        currentScore = 0; targetScore_set(T); const TT = MM2.meta[id].time || 10; timeRemaining = TT; miniGameRunning = true;
        document.getElementById('airlock-tutorial-modal').classList.add('hidden');
        const box = document.getElementById('airlock-active-game-box'); box.classList.remove('hidden');
        document.getElementById('game-timer-display').textContent = TT.toFixed(1) + 'с';
        document.getElementById('game-time-bar').style.width = '100%';
        box.querySelectorAll('[id^="arena-game-"]').forEach((a) => a.classList.add('hidden'));
        window.MM2_HOOKS = {
          running: () => miniGameRunning,
          finish: (w) => { if (miniGameRunning) finishMiniGame(w); },
          sync: (sc) => { currentScore = sc; },
          sfx: (k) => { try { playSound(k); } catch (e) {} }
        };
        MM2.run(id, box);
        let lastWhole = Math.ceil(TT);
        activeGameTimer = setInterval(() => {
          if (!miniGameRunning) return;
          timeRemaining = Math.max(0, timeRemaining - 0.1);
          document.getElementById('game-timer-display').textContent = timeRemaining.toFixed(1) + 'с';
          document.getElementById('game-time-bar').style.width = (timeRemaining / TT) * 100 + '%';
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

(function () {
  const M = { 7: ['4A', 1], 8: ['4A', 2], 15: ['4B', 1], 16: ['4B', 2] };
  const o = window.onload;
  window.onload = function () {
    if (o) o();
    const id = DuneBridge.arcade && DuneBridge.arcade(), m = M[id]; if (!m) return;
    selectAirlockCrisis(m[0]); openTutorialForOption(m[1]);
  };
})();
