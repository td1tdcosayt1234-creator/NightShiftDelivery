(function () {
    'use strict';

    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    var modeButton = document.getElementById('modeButton');
    var restartButton = document.getElementById('restartButton');
    var pauseButton = document.getElementById('pauseButton');
    var soundButton = document.getElementById('soundButton');
    var modal = document.getElementById('modal');
    var modalTitle = document.getElementById('modalTitle');
    var modalText = document.getElementById('modalText');
    var modalButtons = document.getElementById('modalButtons');
    var levelGrid = document.getElementById('levelGrid');
    var liveStatus = document.getElementById('liveStatus');

    // Main Menu Elements
    var mainMenu = document.getElementById('mainMenu');
    var appContainer = document.getElementById('app');
    var playButton = document.getElementById('playButton');
    var achievementsButton = document.getElementById('achievementsButton');
    var settingsButton = document.getElementById('settingsButton');
    var exitButton = document.getElementById('exitButton');
    var robotCanvas = document.getElementById('robotCanvas');
    var robotCtx = robotCanvas ? robotCanvas.getContext('2d') : null;

    var WIDTH = 960;
    var HEIGHT = 540;
    var TILE = 54;
    var COLS = 10;
    var ROWS = 8;
    var BOARD_X = 210;
    var BOARD_Y = 76;
    var SAVE_KEY = 'night-shift-delivery-save-v2';

    var GameState = {
      PLAYING: 'playing',
      FALLING: 'falling',
      LEVEL_COMPLETE: 'level_complete',
      PAUSED: 'paused',
      GAME_COMPLETE: 'game_complete'
    };

    // Load levels from levels.js
    var LEVELS = window.LEVEL_DEFINITIONS || [];
    var ZONE_THEMES = window.ZONE_THEMES || {};


    var game = {
      state: GameState.PLAYING,
      levelIndex: 0,
      currentLevel: null,
      mode: 'day',
      player: { x: 0, y: 0, facing: 'right', stepAt: 0, bumpAt: 0 },
      batteries: [],
      collected: {},
      exit: { x: 0, y: 0 },
      mobs: [],
      gate: null,
      levelStartedAt: 0,
      pausedAt: 0,
      elapsedBeforePause: 0,
      unlockedLevel: 1,
      bestTimes: {},
      audioEnabled: true,
      fallAt: 0,
      transitionAt: 0,
      hintMoveVisible: true,
      hintModeVisible: true,
      // Achievement stats
      stats: {
        batteriesCollected: 0,
        totalBatteries: 0,
        levelsCompleted: 0,
        modeSwitches: 0,
        highestLevel: 1,
        fastestLevel: null,
        deathlessStreak: 0,
        sessionLevels: 0,
        spikeDeathlessStreak: 0,
        droneDeathlessStreak: 0,
        gatesPassed: 0,
        starsCollected: 0,
        level35Complete: false,
        zone1Stars: 0,
        zone2Stars: 0,
        zone3Stars: 0,
        zone4Stars: 0,
        zone5Stars: 0,
        dayModeTime: 0,
        nightModeTime: 0,
        maxRetries: 0,
        levelsAttempted: 0,
        currentRetries: 0,
        totalPlayTime: 0,
        sessionStartTime: 0
      },
      unlockedAchievements: {}
    };

    var rain = [];
    var swipeStart = null;
    var audioContext = null;
    var lastFrame = performance.now();

    // Polyfill for roundRect (older browsers)
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }

    function createRain() {
      var i;
      for (i = 0; i < 58; i += 1) {
        rain.push({
          x: (i * 83 + 17) % WIDTH,
          y: (i * 47 + 31) % HEIGHT,
          speed: 26 + (i % 5) * 9,
          size: 5 + (i % 4) * 3
        });
      }
    }

    function safeLoadSave() {
      var fallback = { version: 2, unlockedLevel: 1, bestTimes: {}, audioEnabled: true, stats: game.stats, unlockedAchievements: {} };
      try {
        var raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return fallback;
        var saved = JSON.parse(raw);
        if (!saved || saved.version !== 2) return fallback;
        return {
          version: 2,
          unlockedLevel: Math.max(1, Math.min(LEVELS.length, Number(saved.unlockedLevel) || 1)),
          bestTimes: saved.bestTimes && typeof saved.bestTimes === 'object' ? saved.bestTimes : {},
          audioEnabled: saved.audioEnabled !== false,
          stats: saved.stats || fallback.stats,
          unlockedAchievements: saved.unlockedAchievements || {}
        };
      } catch (error) {
        return fallback;
      }
    }

    function saveProgress() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          version: 2,
          unlockedLevel: game.unlockedLevel,
          bestTimes: game.bestTimes,
          audioEnabled: game.audioEnabled,
          stats: game.stats,
          unlockedAchievements: game.unlockedAchievements
        }));
      } catch (error) {
        // Storage is optional. Gameplay continues if it is unavailable.
      }
    }

    function announce(text) {
      liveStatus.textContent = '';
      window.setTimeout(function () { liveStatus.textContent = text; }, 10);
    }

    function findCells(levelData) {
      var batteries = [];
      var exit = null;
      var start = null;
      var y;
      var x;
      for (y = 0; y < ROWS; y += 1) {
        for (x = 0; x < COLS; x += 1) {
          var cell = levelData.map[y][x];
          if (cell === 'S') start = { x: x, y: y };
          if (cell === 'E') exit = { x: x, y: y };
          if (cell === 'B') batteries.push({ x: x, y: y, id: x + ',' + y });
        }
      }
      return { start: start, exit: exit, batteries: batteries };
    }

    function loadLevel(index) {
      game.levelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
      game.currentLevel = LEVELS[game.levelIndex];
      var found = findCells(game.currentLevel);
      game.mode = game.currentLevel.startMode;
      game.player.x = found.start.x;
      game.player.y = found.start.y;
      game.player.facing = 'right';
      game.player.stepAt = performance.now();
      game.player.bumpAt = 0;
      game.batteries = found.batteries;
      game.collected = {};
      game.exit = found.exit;
      game.mobs = game.currentLevel.mobs.map(function (mob) {
        return {
          x: mob.x,
          y: mob.y,
          axis: mob.axis,
          min: mob.min,
          max: mob.max,
          speed: mob.speed,
          offset: mob.offset || 0
        };
      });
      game.gate = game.currentLevel.gate;
      game.state = GameState.PLAYING;
      game.levelStartedAt = performance.now();
      game.elapsedBeforePause = 0;
      game.transitionAt = 0;
      game.fallAt = 0;
      game.diedThisRun = false;
      game.spikeDiedThisRun = false;
      game.droneDiedThisRun = false;
      trackAchievement('levelStart', { levelId: game.currentLevel.id });
      hideModal();
      updateControls();
      announce('Level ' + game.currentLevel.id + ': ' + game.currentLevel.name);
    }

    function tileAt(x, y) {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return '#';
      return game.currentLevel.map[y][x];
    }

    function collectedCount() {
      return Object.keys(game.collected).length;
    }

    function allBatteriesCollected() {
      return collectedCount() >= game.batteries.length;
    }

    function isWalkable(x, y, mode) {
      var cell = tileAt(x, y);
      if (cell === '#') return false;
      if (cell === 'D') return mode === 'day';
      if (cell === 'N') return mode === 'night';
      if (cell === 'T') return isGateOpen();
      if (cell === 'E') return allBatteriesCollected();
      return true;
    }

    function currentElapsed() {
      if (!game.currentLevel) return 0;
      var now = game.state === GameState.PAUSED ? game.pausedAt : performance.now();
      return Math.max(0, (now - game.levelStartedAt - game.elapsedBeforePause) / 1000);
    }

    function isGateOpen() {
      if (!game.gate) return true;
      var gateTime = (currentElapsed() * 1000 + game.gate.offset) % game.gate.period;
      return gateTime < game.gate.openFor;
    }

    function mobPosition(mob) {
      var span = mob.max - mob.min;
      if (span <= 0) return { x: mob.x, y: mob.y };
      var steps = Math.floor((currentElapsed() * 1000 + mob.offset) / mob.speed);
      var loop = span * 2;
      var point = steps % loop;
      var value = point <= span ? mob.min + point : mob.max - (point - span);
      return mob.axis === 'x' ? { x: value, y: mob.y } : { x: mob.x, y: value };
    }

    function hasMobAt(x, y) {
      return game.mobs.some(function (mob) {
        var position = mobPosition(mob);
        return position.x === x && position.y === y;
      });
    }

    function formatTime(seconds) {
      var tenths = Math.floor(seconds * 10) % 10;
      var whole = Math.floor(seconds);
      var minutes = Math.floor(whole / 60);
      var secs = String(whole % 60).padStart(2, '0');
      return String(minutes).padStart(2, '0') + ':' + secs + '.' + tenths;
    }

    function initAudio() {
      if (!game.audioEnabled) return;
      try {
        if (!audioContext) {
          var Ctx = window.AudioContext || window.webkitAudioContext;
          if (Ctx) audioContext = new Ctx();
        }
        // Browsers may leave the context suspended (autoplay policy, iOS Safari).
        if (audioContext && audioContext.state === 'suspended' && audioContext.resume) {
          audioContext.resume();
        }
      } catch (error) {
        audioContext = null;
      }
    }

    function tone(frequency, duration, type, volume, offset) {
      if (!game.audioEnabled) return;
      initAudio();
      if (!audioContext) return;
      try {
        var start = audioContext.currentTime + (offset || 0);
        var oscillator = audioContext.createOscillator();
        var gain = audioContext.createGain();
        oscillator.type = type || 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume || 0.05, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
      } catch (error) {
        // Sound is decorative; ignore browser audio errors.
      }
    }

    function playSound(name) {
      if (name === 'move') tone(430, 0.055, 'sine', 0.026);
      if (name === 'blocked') tone(145, 0.07, 'triangle', 0.022);
      if (name === 'switch') {
        tone(game.mode === 'day' ? 580 : 320, 0.09, 'sine', 0.045);
        tone(game.mode === 'day' ? 760 : 240, 0.11, 'sine', 0.03, 0.07);
      }
      if (name === 'pickup') {
        tone(620, 0.08, 'sine', 0.05);
        tone(840, 0.1, 'sine', 0.045, 0.07);
        tone(1060, 0.13, 'sine', 0.036, 0.14);
      }
      if (name === 'unlock') {
        tone(380, 0.12, 'sine', 0.045);
        tone(570, 0.18, 'sine', 0.045, 0.08);
      }
      if (name === 'fall') tone(150, 0.22, 'sawtooth', 0.024);
      if (name === 'complete') {
        tone(523, 0.13, 'sine', 0.045);
        tone(659, 0.13, 'sine', 0.04, 0.10);
        tone(784, 0.20, 'sine', 0.04, 0.20);
      }
    }

    function move(dx, dy) {
      initAudio();
      if (game.state !== GameState.PLAYING) return;
      game.hintMoveVisible = false;
      var nx = game.player.x + dx;
      var ny = game.player.y + dy;
      if (!isWalkable(nx, ny, game.mode)) {
        game.player.bumpAt = performance.now();
        playSound('blocked');
        return;
      }
      game.player.x = nx;
      game.player.y = ny;
      game.player.stepAt = performance.now();
      if (dx < 0) game.player.facing = 'left';
      if (dx > 0) game.player.facing = 'right';
      if (dy < 0) game.player.facing = 'up';
      if (dy > 0) game.player.facing = 'down';
      playSound('move');
      if (tileAt(nx, ny) === '^') {
        startFall('Spikes hit the courier', 'spike');
        return;
      }
      if (hasMobAt(nx, ny)) {
        startFall('A patrol drone caught the courier', 'drone');
        return;
      }
      if (tileAt(nx, ny) === 'T') {
        trackAchievement('gatePassed');
      }
      collectBatteryAt(nx, ny);
      if (nx === game.exit.x && ny === game.exit.y && allBatteriesCollected()) {
        completeLevel();
      }
    }

    function collectBatteryAt(x, y) {
      var id = x + ',' + y;
      if (!game.collected[id] && game.batteries.some(function (battery) { return battery.id === id; })) {
        game.collected[id] = true;
        playSound('pickup');
        trackAchievement('batteryCollected');
        announce('Battery collected. ' + collectedCount() + ' of ' + game.batteries.length + '.');
        if (allBatteriesCollected()) {
          playSound('unlock');
          announce('All batteries collected. Exit unlocked.');
        }
      }
    }

    function switchMode() {
      initAudio();
      if (game.state !== GameState.PLAYING) return;
      game.hintModeVisible = false;
      var nextMode = game.mode === 'day' ? 'night' : 'day';
      if (!isWalkable(game.player.x, game.player.y, nextMode)) {
        startFall('The phase path faded away', 'phase');
        return;
      }
      game.mode = nextMode;
      game.transitionAt = performance.now();
      playSound('switch');
      trackAchievement('modeSwitch');
      updateControls();
      announce(game.mode === 'day' ? 'Day mode.' : 'Night mode.');
    }

    function startFall(reason, cause) {
      if (game.state !== GameState.PLAYING) return;
      game.state = GameState.FALLING;
      game.fallAt = performance.now();
      game.diedThisRun = true;
      if (cause === 'spike') game.spikeDiedThisRun = true;
      if (cause === 'drone') game.droneDiedThisRun = true;
      playSound('fall');
      trackAchievement('death');
      announce((reason || 'Unsafe move') + '. Restarting level.');
      window.setTimeout(function () {
        if (game.state === GameState.FALLING) loadLevel(game.levelIndex);
      }, 420);
    }

    function checkActiveDangers() {
      if (game.state !== GameState.PLAYING) return;
      var standingTile = tileAt(game.player.x, game.player.y);
      if (standingTile === '^') {
        startFall('Spikes hit the courier', 'spike');
        return;
      }
      if (standingTile === 'T' && !isGateOpen()) {
        startFall('The timed gate closed', 'gate');
        return;
      }
      if (hasMobAt(game.player.x, game.player.y)) {
        startFall('A patrol drone caught the courier', 'drone');
      }
    }

    function restartLevel() {
      initAudio();
      if (game.state === GameState.PLAYING || game.state === GameState.PAUSED || game.state === GameState.FALLING) {
        loadLevel(game.levelIndex);
        announce('Level restarted.');
      }
    }

    function completeLevel() {
      if (game.state !== GameState.PLAYING) return;
      game.state = GameState.LEVEL_COMPLETE;
      // Quantize the time ONCE so the saved best, the modal display, the ★ badge
      // and the achievement stats all judge the exact same number.
      var time = Number(currentElapsed().toFixed(1));
      var id = String(game.currentLevel.id);
      var oldBest = Number(game.bestTimes[id]);
      var isBest = !oldBest || time < oldBest;
      var beatPar = time <= game.currentLevel.parTimeSeconds;

      if (isBest) game.bestTimes[id] = time;
      if (game.currentLevel.id < LEVELS.length) {
        game.unlockedLevel = Math.max(game.unlockedLevel, game.currentLevel.id + 1);
      }
      
      trackAchievement('levelComplete', { levelId: game.currentLevel.id, time: time });
      if (beatPar && (!oldBest || oldBest > game.currentLevel.parTimeSeconds)) {
        trackAchievement('starEarned', { levelId: game.currentLevel.id });
      }
      
      saveProgress();
      playSound('complete');
      if (game.currentLevel.id === LEVELS.length) {
        game.state = GameState.GAME_COMPLETE;
        showEndCard(time, isBest);
      } else {
        showCompletion(time, isBest);
      }
    }

    function button(label, click, secondary) {
      var element = document.createElement('button');
      element.className = 'modalButton' + (secondary ? ' secondary' : '');
      element.textContent = label;
      element.addEventListener('click', click);
      return element;
    }

    function clearModal() {
      modalTitle.textContent = '';
      modalText.textContent = '';
      modalButtons.innerHTML = '';
      levelGrid.innerHTML = '';
      levelGrid.hidden = true;
    }

    function showCompletion(time, isBest) {
      clearModal();
      modalTitle.textContent = 'DELIVERY COMPLETE';
      var target = game.currentLevel.parTimeSeconds;
      var beatPar = time <= target;
      modalText.innerHTML = 'Level time: <strong>' + formatTime(time) + '</strong><br>' +
        'Target: ' + formatTime(target) + (beatPar ? ' — beaten! ★' : '') + '<br>' +
        (isBest ? '✨ New best time!' : 'Best time: ' + formatTime(game.bestTimes[String(game.currentLevel.id)]));
      modalButtons.appendChild(button('NEXT LEVEL', function () {
        loadLevel(game.levelIndex + 1);
      }));
      modalButtons.appendChild(button('REPLAY', function () {
        loadLevel(game.levelIndex);
      }, true));
      modal.classList.remove('hidden');
    }

    function showEndCard(time, isBest) {
      clearModal();
      modalTitle.textContent = 'NIGHT SHIFT COMPLETE';
      modalText.innerHTML = 'Every delivery made.<br>Final time: <strong>' + formatTime(time) + '</strong>' +
        (isBest ? '<br>New best time!' : '');
      modalButtons.appendChild(button('PLAY AGAIN', function () {
        loadLevel(0);
      }));
      modalButtons.appendChild(button('LEVEL SELECT', showLevelSelect, true));
      modal.classList.remove('hidden');
    }

    function showPause() {
      if (game.state !== GameState.PLAYING) return;
      game.state = GameState.PAUSED;
      game.pausedAt = performance.now();
      clearModal();
      modalTitle.textContent = 'PAUSED';
      modalText.textContent = game.currentLevel.name;
      modalButtons.appendChild(button('▶ RESUME', resumeGame));
      modalButtons.appendChild(button('↻ RESTART', restartLevel, true));
      modalButtons.appendChild(button('📋 LEVEL SELECT', showLevelSelect, true));
      modalButtons.appendChild(button('🏠 MAIN MENU', function() {
        hideModal();
        showMainMenu();
      }, true));
      modal.classList.remove('hidden');
      pauseButton.textContent = '▶';
      pauseButton.setAttribute('aria-label', 'Resume game');
    }

    function resumeGame() {
      if (game.state !== GameState.PAUSED) return;
      game.elapsedBeforePause += performance.now() - game.pausedAt;
      game.state = GameState.PLAYING;
      hideModal();
      pauseButton.textContent = 'Ⅱ';
      pauseButton.setAttribute('aria-label', 'Pause game');
      announce('Game resumed.');
    }

    function showLevelSelect() {
      clearModal();
      modalTitle.textContent = 'CITY ROUTES';
      modalText.textContent = 'Choose an unlocked delivery.';
      levelGrid.hidden = false;
      
      var zones = [
        { name: 'ZONE 1: TRAINING', start: 1, end: 4 },
        { name: 'ZONE 2: HAZARDS', start: 5, end: 10 },
        { name: 'ZONE 3: TIMING', start: 11, end: 18 },
        { name: 'ZONE 4: CHAOS', start: 19, end: 26 },
        { name: 'ZONE 5: NIGHTMARE', start: 27, end: 35 }
      ];
      
      zones.forEach(function (zone) {
        var zoneLabel = document.createElement('div');
        zoneLabel.className = 'zoneLabel';
        zoneLabel.textContent = zone.name;
        levelGrid.appendChild(zoneLabel);
        
        LEVELS.forEach(function (levelData, index) {
          if (levelData.id >= zone.start && levelData.id <= zone.end) {
            var unlocked = levelData.id <= game.unlockedLevel;
            var entry = document.createElement('button');
            var best = Number(game.bestTimes[String(levelData.id)]);
            var starred = best && best <= levelData.parTimeSeconds;
            entry.className = 'levelButton' + (unlocked ? '' : ' locked') + 
                            (best ? ' done' : '') + (starred ? ' starred' : '');
            entry.disabled = !unlocked;
            entry.innerHTML = unlocked
              ? String(levelData.id) + 
                (starred ? '<span class="starBadge">★</span>' : '') +
                (best ? '<span class="bestTime">' + formatTime(best) + '</span>' : '')
              : '🔒';
            entry.setAttribute('aria-label', unlocked ? 'Play level ' + levelData.id + ': ' + levelData.name : 'Level ' + levelData.id + ' locked');
            if (unlocked) {
              entry.addEventListener('click', function () { loadLevel(index); });
            }
            levelGrid.appendChild(entry);
          }
        });
      });
      
      modalButtons.appendChild(button('RESUME', function () {
        if (game.state === GameState.PAUSED) resumeGame();
        else loadLevel(game.levelIndex);
      }, true));
      modal.classList.remove('hidden');
    }

    function hideModal() {
      clearModal();
      modal.classList.add('hidden');
      if (game.state !== GameState.PAUSED) {
        pauseButton.textContent = 'Ⅱ';
        pauseButton.setAttribute('aria-label', 'Pause game');
      }
    }

    function updateControls() {
      var night = game.mode === 'night';
      modeButton.dataset.mode = night ? 'night' : 'day';
      modeButton.textContent = night ? '☾ SWITCH TO DAY' : '☀ SWITCH TO NIGHT';
      modeButton.setAttribute('aria-label', night ? 'Switch to Day mode' : 'Switch to Night mode');
      soundButton.textContent = game.audioEnabled ? '♬' : '×';
      soundButton.setAttribute('aria-label', game.audioEnabled ? 'Mute sound' : 'Unmute sound');
    }

    function roundedRect(context, x, y, width, height, radius) {
      var r = Math.min(radius, width / 2, height / 2);
      context.beginPath();
      context.moveTo(x + r, y);
      context.arcTo(x + width, y, x + width, y + height, r);
      context.arcTo(x + width, y + height, x, y + height, r);
      context.arcTo(x, y + height, x, y, r);
      context.arcTo(x, y, x + width, y, r);
      context.closePath();
    }

    function drawBackground(time) {
      var night = game.mode === 'night';
      var gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, night ? '#100a2c' : '#101d46');
      gradient.addColorStop(1, night ? '#050513' : '#091126');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      var glow = ctx.createRadialGradient(WIDTH * .52, HEIGHT * .2, 5, WIDTH * .52, HEIGHT * .2, 360);
      glow.addColorStop(0, night ? 'rgba(183,67,255,.17)' : 'rgba(72,201,255,.17)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = night ? 'rgba(112,58,174,.25)' : 'rgba(55,142,190,.24)';
      var i;
      for (i = 0; i < 16; i += 1) {
        var width = 36 + (i % 5) * 18;
        var height = 38 + ((i * 19) % 100);
        var x = i * 68 - 30;
        ctx.fillRect(x, HEIGHT - 43 - height, width, height);
        ctx.fillStyle = night ? 'rgba(244,102,255,.20)' : 'rgba(100,220,255,.20)';
        ctx.fillRect(x + 9, HEIGHT - 34 - height, 4, 7);
        ctx.fillRect(x + width - 12, HEIGHT - 52 - height, 4, 7);
        ctx.fillStyle = night ? 'rgba(112,58,174,.25)' : 'rgba(55,142,190,.24)';
      }

      ctx.strokeStyle = night ? 'rgba(235,182,255,.21)' : 'rgba(172,236,255,.21)';
      ctx.lineWidth = 1.1;
      rain.forEach(function (drop) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.size);
        ctx.stroke();
      });

      var topGlow = night ? '#c355ff' : '#54d8ff';
      ctx.fillStyle = topGlow;
      ctx.globalAlpha = .11;
      ctx.fillRect(0, 55, WIDTH, 2);
      ctx.globalAlpha = 1;
      void time;
    }

    function drawIcon(type, x, y, size, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha === undefined ? 1 : alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = Math.max(1.6, size * .13);
      if (type === 'sun') {
        ctx.beginPath();
        ctx.arc(0, 0, size * .24, 0, Math.PI * 2);
        ctx.stroke();
        var i;
        for (i = 0; i < 8; i += 1) {
          var a = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * size * .38, Math.sin(a) * size * .38);
          ctx.lineTo(Math.cos(a) * size * .50, Math.sin(a) * size * .50);
          ctx.stroke();
        }
      } else if (type === 'moon') {
        ctx.beginPath();
        ctx.arc(-size * .05, 0, size * .32, Math.PI * .35, Math.PI * 1.65);
        ctx.stroke();
        ctx.fillStyle = nightColor();
        ctx.beginPath();
        ctx.arc(size * .10, -size * .06, size * .28, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'battery') {
        roundedRect(ctx, -size * .34, -size * .24, size * .68, size * .48, size * .06);
        ctx.stroke();
        ctx.fillRect(size * .34, -size * .10, size * .11, size * .20);
        ctx.fillRect(-size * .17, -size * .09, size * .28, size * .18);
      }
      ctx.restore();
    }

    function nightColor() {
      return game.mode === 'night' ? '#100a2c' : '#101d46';
    }

    function drawBoard(time) {
      var y;
      var x;
      roundedRect(ctx, BOARD_X - 13, BOARD_Y - 13, COLS * TILE + 26, ROWS * TILE + 26, 22);
      ctx.fillStyle = 'rgba(6,8,20,.70)';
      ctx.fill();
      ctx.strokeStyle = game.mode === 'night' ? 'rgba(219,121,255,.32)' : 'rgba(102,223,255,.32)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      for (y = 0; y < ROWS; y += 1) {
        for (x = 0; x < COLS; x += 1) {
          drawTile(x, y, time);
        }
      }
      drawBatteries(time);
      drawMobs(time);
      drawCourier(time);
    }

    function drawTile(gridX, gridY, time) {
      var cell = tileAt(gridX, gridY);
      var x = BOARD_X + gridX * TILE;
      var y = BOARD_Y + gridY * TILE;
      var active = isWalkable(gridX, gridY, game.mode) || cell === 'E';
      var pad = 2;

      if (cell === '#') {
        ctx.fillStyle = '#11152a';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#202743';
        roundedRect(ctx, x + 3, y + 3, TILE - 6, TILE - 6, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(190,207,255,.10)';
        ctx.fillRect(x + 6, y + 7, TILE - 12, 2);
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        ctx.fillRect(x + 3, y + TILE - 12, TILE - 6, 9);
        return;
      }

      var fill = '#26314a';
      var edge = '#465878';
      if (cell === 'D') {
        fill = game.mode === 'day' ? '#1c87bb' : '#172940';
        edge = game.mode === 'day' ? '#7feaff' : '#314462';
      } else if (cell === 'N') {
        fill = game.mode === 'night' ? '#7e42b7' : '#261d3f';
        edge = game.mode === 'night' ? '#f19aff' : '#3a3054';
      } else if (cell === 'S') {
        fill = '#226152';
        edge = '#9affcf';
      } else if (cell === 'E') {
        fill = allBatteriesCollected() ? '#286d4b' : '#78462b';
        edge = allBatteriesCollected() ? '#a6ffc7' : '#f4ad68';
      } else if (cell === '^') {
        fill = '#5d263a';
        edge = '#ff8397';
      } else if (cell === 'M') {
        fill = '#263650';
        edge = '#84baff';
      } else if (cell === 'T') {
        fill = isGateOpen() ? '#896a22' : '#4a3b23';
        edge = isGateOpen() ? '#ffe77b' : '#9f8650';
      }

      roundedRect(ctx, x + pad, y + pad, TILE - pad * 2, TILE - pad * 2, 8);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = edge;
      ctx.globalAlpha = (cell === 'D' || cell === 'N') && !active ? .36 : .85;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = 'rgba(255,255,255,.10)';
      roundedRect(ctx, x + 7, y + 7, TILE - 14, 7, 3);
      ctx.fill();

      if (cell === 'D') drawIcon('sun', x + TILE / 2, y + TILE / 2 + 4, 26, game.mode === 'day' ? '#d4fbff' : '#5a708e', game.mode === 'day' ? 1 : .55);
      if (cell === 'N') drawIcon('moon', x + TILE / 2, y + TILE / 2 + 3, 28, game.mode === 'night' ? '#ffe5ff' : '#655878', game.mode === 'night' ? 1 : .55);
      if (cell === '^') {
        // Animated glowing spikes
        var spikeGlow = 0.15 + Math.sin(time / 300) * 0.1;
        ctx.save();
        ctx.shadowColor = '#ff2d5a';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 2;
        
        // Base gradient for spikes
        var spikeGrad = ctx.createLinearGradient(x, y + 17, x, y + 41);
        spikeGrad.addColorStop(0, '#ff5577');
        spikeGrad.addColorStop(0.6, '#ff3d5f');
        spikeGrad.addColorStop(1, '#cc2a48');
        ctx.fillStyle = spikeGrad;
        
        // Draw sharp spikes with better shape
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 43);
        ctx.lineTo(x + 16, y + 14);
        ctx.lineTo(x + 22, y + 43);
        ctx.lineTo(x + 28, y + 16);
        ctx.lineTo(x + 34, y + 43);
        ctx.lineTo(x + 40, y + 14);
        ctx.lineTo(x + 46, y + 43);
        ctx.closePath();
        ctx.fill();
        
        // Add highlights on spike tips
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255, 180, 200, ' + (0.7 + spikeGlow) + ')';
        ctx.beginPath();
        ctx.arc(x + 16, y + 14, 2.5, 0, Math.PI * 2);
        ctx.arc(x + 28, y + 16, 2.5, 0, Math.PI * 2);
        ctx.arc(x + 40, y + 14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Warning stripes at base
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 200, 50, 0.4)';
        ctx.fillRect(x + 8, y + 44, 4, 3);
        ctx.fillRect(x + 20, y + 44, 4, 3);
        ctx.fillRect(x + 32, y + 44, 4, 3);
        ctx.fillRect(x + 44, y + 44, 4, 3);
        
        ctx.restore();
      }
      if (cell === 'M') {
        // Draw the rail in the direction drones actually move on this tile —
        // vertical patrols used to get a horizontal rail, which read as a bug.
        var horizRail = game.mobs.some(function (mob) {
          return mob.axis === 'x' && gridY === mob.y && gridX >= mob.min && gridX <= mob.max;
        });
        var vertRail = game.mobs.some(function (mob) {
          return mob.axis === 'y' && gridX === mob.x && gridY >= mob.min && gridY <= mob.max;
        });
        ctx.strokeStyle = '#82bcff';
        ctx.globalAlpha = .65;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (vertRail && !horizRail) {
          ctx.moveTo(x + TILE / 2, y + 9);
          ctx.lineTo(x + TILE / 2, y + TILE - 9);
        } else {
          ctx.moveTo(x + 9, y + TILE / 2);
          ctx.lineTo(x + TILE - 9, y + TILE / 2);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (cell === 'T') {
        ctx.fillStyle = isGateOpen() ? '#fff0a4' : '#b29b68';
        ctx.globalAlpha = isGateOpen() ? .95 : .55;
        ctx.fillRect(x + 16, y + 15, 5, 28);
        ctx.fillRect(x + 27, y + 11, 5, 32);
        ctx.fillRect(x + 38, y + 15, 5, 28);
        ctx.globalAlpha = 1;
      }
      if (cell === 'S') {
        ctx.strokeStyle = '#b7ffe0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 14, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (cell === 'E') {
        ctx.fillStyle = allBatteriesCollected() ? '#c9ffe0' : '#ffd2a1';
        roundedRect(ctx, x + 17, y + 15, 20, 27, 3);
        ctx.fill();
        ctx.fillStyle = fill;
        ctx.fillRect(x + 29, y + 29, 3, 3);
      }
    }

    function drawBatteries(time) {
      game.batteries.forEach(function (battery) {
        if (game.collected[battery.id]) return;
        var x = BOARD_X + battery.x * TILE + TILE / 2;
        var y = BOARD_Y + battery.y * TILE + TILE / 2 + Math.sin(time / 190 + battery.x) * 2;
        ctx.save();
        ctx.shadowColor = '#fff28c';
        ctx.shadowBlur = 14;
        drawIcon('battery', x, y, 27, '#fff68a', 1);
        ctx.restore();
      });
    }

    function drawMobs(time) {
      game.mobs.forEach(function (mob) {
        var point = mobPosition(mob);
        var x = BOARD_X + point.x * TILE + TILE / 2;
        var y = BOARD_Y + point.y * TILE + TILE / 2 + Math.sin(time / 120) * 1.5;
        ctx.save();
        ctx.translate(x, y);
        ctx.shadowColor = '#ff557d';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#d94068';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1b1c32';
        roundedRect(ctx, -9, -5, 18, 9, 4);
        ctx.fill();
        ctx.fillStyle = '#ffecf1';
        ctx.fillRect(-5, -2, 3, 3);
        ctx.fillRect(2, -2, 3, 3);
        ctx.restore();
      });
    }

    function drawCourier(time) {
      var x = BOARD_X + game.player.x * TILE + TILE / 2;
      var y = BOARD_Y + game.player.y * TILE + TILE / 2;
      var sinceStep = time - game.player.stepAt;
      var bob = sinceStep < 150 ? Math.sin((150 - sinceStep) / 22) * 2 : Math.sin(time / 270) * 1.2;
      var bump = Math.max(0, 1 - (time - game.player.bumpAt) / 130);
      if (bump > 0) {
        if (game.player.facing === 'left') x -= bump * 5;
        if (game.player.facing === 'right') x += bump * 5;
        if (game.player.facing === 'up') y -= bump * 5;
        if (game.player.facing === 'down') y += bump * 5;
      }
      if (game.state === GameState.FALLING) {
        var fall = Math.min(1, (time - game.fallAt) / 380);
        y += fall * 54;
        ctx.globalAlpha = 1 - fall;
      }
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.shadowColor = game.mode === 'night' ? '#e679ff' : '#61e4ff';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#dde5ee';
      roundedRect(ctx, -13, -13, 26, 25, 9);
      ctx.fill();
      ctx.fillStyle = '#252b43';
      roundedRect(ctx, -9, -8, 18, 11, 4);
      ctx.fill();
      ctx.fillStyle = '#80edff';
      ctx.fillRect(game.player.facing === 'left' ? -7 : 2, -5, 5, 4);
      ctx.fillStyle = '#ffab54';
      roundedRect(ctx, 8, 6, 10, 10, 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function drawHud(time) {
      var levelData = game.currentLevel;
      ctx.save();
      ctx.fillStyle = '#eef3ff';
      ctx.font = '800 20px system-ui, sans-serif';
      ctx.fillText('NIGHT SHIFT DELIVERY', 28, 34);
      ctx.fillStyle = '#b9c6e9';
      ctx.font = '700 14px system-ui, sans-serif';
      ctx.fillText('LEVEL ' + String(levelData.id).padStart(2, '0') + ' — ' + levelData.name.toUpperCase(), 360, 31);
      if (!game.levelsValidated) {
        ctx.fillStyle = '#ff8397';
        ctx.font = '700 12px system-ui, sans-serif';
        ctx.fillText('LEVEL CHECK FAILED', 360, 52);
      }

      drawIcon('battery', 695, 27, 20, '#fff58f', 1);
      ctx.fillStyle = '#f6f8ff';
      ctx.font = '800 15px system-ui, sans-serif';
      ctx.fillText(collectedCount() + ' / ' + game.batteries.length, 711, 32);

      roundedRect(ctx, 790, 12, 137, 32, 16);
      ctx.fillStyle = game.mode === 'night' ? 'rgba(181,76,238,.30)' : 'rgba(68,194,240,.25)';
      ctx.fill();
      ctx.strokeStyle = game.mode === 'night' ? '#df9bff' : '#9befff';
      ctx.globalAlpha = .8;
      ctx.stroke();
      ctx.globalAlpha = 1;
      drawIcon(game.mode === 'night' ? 'moon' : 'sun', 809, 28, 18, '#ffffff', 1);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 13px system-ui, sans-serif';
      ctx.fillText(game.mode === 'night' ? 'NIGHT' : 'DAY', 826, 32);

      ctx.fillStyle = 'rgba(235,242,255,.83)';
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.fillText('TIME ' + formatTime(currentElapsed()), 30, 530);
      ctx.fillText('TARGET ' + formatTime(levelData.parTimeSeconds), 856, 530);

      var showHint = game.currentLevel.id === 1 && (game.hintMoveVisible || game.hintModeVisible);
      if (showHint) {
        if (game.hintMoveVisible) {
          roundedRect(ctx, 36, 454, 164, 38, 10);
          ctx.fillStyle = 'rgba(15,20,48,.86)';
          ctx.fill();
          ctx.fillStyle = '#dce7ff';
          ctx.font = '700 13px system-ui, sans-serif';
          ctx.fillText('MOVE  ← ↑ ↓ → / WASD', 48, 478);
        }
        if (game.hintModeVisible) {
          roundedRect(ctx, 728, 454, 196, 38, 10);
          ctx.fillStyle = 'rgba(15,20,48,.86)';
          ctx.fill();
          ctx.fillStyle = '#dce7ff';
          ctx.font = '700 13px system-ui, sans-serif';
          ctx.fillText('SPACE = SWITCH CITY', 741, 478);
        }
      } else if (game.state === GameState.PLAYING) {
        ctx.fillStyle = 'rgba(224,232,255,.58)';
        ctx.font = '600 12px system-ui, sans-serif';
        ctx.fillText(levelData.hint, 360, 530);
      }

      var transition = Math.max(0, 1 - (time - game.transitionAt) / 220);
      if (transition > 0) {
        ctx.fillStyle = game.mode === 'night' ? 'rgba(205,94,255,' + (transition * .16) + ')' : 'rgba(116,230,255,' + (transition * .16) + ')';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }
      ctx.restore();
    }

    function updateRain(delta) {
      if (game.state === GameState.PAUSED) return;
      rain.forEach(function (drop) {
        drop.y += drop.speed * delta;
        drop.x -= drop.speed * .14 * delta;
        if (drop.y > HEIGHT + 20) {
          drop.y = -16;
          drop.x = (drop.x + 177) % WIDTH;
        }
        if (drop.x < -20) drop.x = WIDTH + 10;
      });
    }

    function render(time) {
      var delta = Math.min(.05, (time - lastFrame) / 1000);
      lastFrame = time;
      if (game.state === GameState.PLAYING) {
        if (game.mode === 'night') game.stats.nightModeTime += delta;
        else game.stats.dayModeTime += delta;
      }
      updateRain(delta);
      checkActiveDangers();
      drawBackground(time);
      drawBoard(time);
      drawHud(time);
      window.requestAnimationFrame(render);
    }

    function directionFromKey(key) {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') return [0, -1];
      if (key === 'ArrowDown' || key === 's' || key === 'S') return [0, 1];
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') return [-1, 0];
      if (key === 'ArrowRight' || key === 'd' || key === 'D') return [1, 0];
      return null;
    }

    window.addEventListener('keydown', function (event) {
      // Ignore game keys while the main menu is on screen.
      if (mainMenu && !mainMenu.classList.contains('hidden')) return;
      var direction = directionFromKey(event.key);
      if (direction) {
        event.preventDefault();
        move(direction[0], direction[1]);
        return;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        switchMode();
        return;
      }
      if (event.key === 'r' || event.key === 'R') {
        restartLevel();
        return;
      }
      if (event.key === 'p' || event.key === 'P') {
        if (game.state === GameState.PLAYING) showPause();
        else if (game.state === GameState.PAUSED) resumeGame();
        return;
      }
      if (event.key === 'm' || event.key === 'M') {
        toggleSound();
      }
    });

    document.querySelectorAll('.moveButton').forEach(function (element) {
      element.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        var direction = element.dataset.move;
        if (direction === 'up') move(0, -1);
        if (direction === 'down') move(0, 1);
        if (direction === 'left') move(-1, 0);
        if (direction === 'right') move(1, 0);
      });
    });

    modeButton.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      switchMode();
    });
    restartButton.addEventListener('click', restartLevel);
    pauseButton.addEventListener('click', function () {
      if (game.state === GameState.PLAYING) showPause();
      else if (game.state === GameState.PAUSED) resumeGame();
    });
    soundButton.addEventListener('click', toggleSound);

    function toggleSound() {
      game.audioEnabled = !game.audioEnabled;
      if (game.audioEnabled) {
        initAudio();
        tone(620, 0.07, 'sine', 0.04);
      }
      saveProgress();
      updateControls();
      announce(game.audioEnabled ? 'Sound on.' : 'Sound off.');
    }

    canvas.addEventListener('pointerdown', function (event) {
      swipeStart = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener('pointerup', function (event) {
      if (!swipeStart) return;
      var dx = event.clientX - swipeStart.x;
      var dy = event.clientY - swipeStart.y;
      swipeStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
      else move(0, dy > 0 ? 1 : -1);
    });
    canvas.addEventListener('pointercancel', function () { swipeStart = null; });

    function getWalkableForValidation(levelData, x, y, mode, mask, batteryPositions, exitPosition) {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
      var cell = levelData.map[y][x];
      if (cell === '#' || cell === '^') return false;
      if (cell === 'D') return mode === 'day';
      if (cell === 'N') return mode === 'night';
      if (cell === 'E') return mask === (1 << batteryPositions.length) - 1;
      return true;
    }

    function validateLevel(levelData) {
      var found = findCells(levelData);
      if (!found.start || !found.exit) return false;
      var batteryLookup = {};
      found.batteries.forEach(function (battery, index) { batteryLookup[battery.x + ',' + battery.y] = index; });
      var targetMask = (1 << found.batteries.length) - 1;
      var queue = [{ x: found.start.x, y: found.start.y, mode: levelData.startMode, mask: 0 }];
      var seen = {};
      while (queue.length) {
        var node = queue.shift();
        var key = node.x + ',' + node.y + ',' + node.mode + ',' + node.mask;
        if (seen[key]) continue;
        seen[key] = true;
        if (node.x === found.exit.x && node.y === found.exit.y && node.mask === targetMask) return true;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(function (dir) {
          var nx = node.x + dir[0];
          var ny = node.y + dir[1];
          if (!getWalkableForValidation(levelData, nx, ny, node.mode, node.mask, found.batteries, found.exit)) return;
          var nextMask = node.mask;
          var batteryIndex = batteryLookup[nx + ',' + ny];
          if (batteryIndex !== undefined) nextMask |= (1 << batteryIndex);
          queue.push({ x: nx, y: ny, mode: node.mode, mask: nextMask });
        });
        var nextMode = node.mode === 'day' ? 'night' : 'day';
        if (getWalkableForValidation(levelData, node.x, node.y, nextMode, node.mask, found.batteries, found.exit)) {
          queue.push({ x: node.x, y: node.y, mode: nextMode, mask: node.mask });
        }
      }
      return false;
    }

    function validateLevels() {
      return LEVELS.every(function (levelData) {
        return levelData.map.length === ROWS &&
          levelData.map.every(function (row) { return row.length === COLS; }) &&
          validateLevel(levelData);
      });
    }

    createRain();
    var save = safeLoadSave();
    game.unlockedLevel = save.unlockedLevel;
    game.bestTimes = save.bestTimes;
    game.audioEnabled = save.audioEnabled;
    game.stats = save.stats || game.stats;
    game.unlockedAchievements = save.unlockedAchievements || {};
    // Ensure stat fields added by later versions exist on old saves.
    game.stats.completedLevels = game.stats.completedLevels || {};
    game.stats.starredLevels = game.stats.starredLevels || {};
    game.stats.attemptedLevels = game.stats.attemptedLevels || {};
    game.stats.deathlessStreak = game.stats.deathlessStreak || 0;
    game.stats.spikeDeathlessStreak = game.stats.spikeDeathlessStreak || 0;
    game.stats.droneDeathlessStreak = game.stats.droneDeathlessStreak || 0;
    game.stats.nightModeTime = game.stats.nightModeTime || 0;
    game.stats.dayModeTime = game.stats.dayModeTime || 0;
    // Backfill every other numeric/flag field too — an undefined value would
    // leak NaN into Math.max() pairs and permanently break stat comparisons.
    game.stats.batteriesCollected = game.stats.batteriesCollected || 0;
    game.stats.totalBatteries = game.stats.totalBatteries || 0;
    game.stats.levelsCompleted = game.stats.levelsCompleted || 0;
    game.stats.modeSwitches = game.stats.modeSwitches || 0;
    game.stats.highestLevel = game.stats.highestLevel || 1;
    game.stats.fastestLevel = game.stats.fastestLevel || null;
    game.stats.gatesPassed = game.stats.gatesPassed || 0;
    game.stats.starsCollected = game.stats.starsCollected || 0;
    game.stats.level35Complete = game.stats.level35Complete === true;
    game.stats.maxRetries = game.stats.maxRetries || 0;
    game.stats.levelsAttempted = game.stats.levelsAttempted || 0;
    game.stats.totalPlayTime = game.stats.totalPlayTime || 0;
    game.stats.zone1Stars = game.stats.zone1Stars || 0;
    game.stats.zone2Stars = game.stats.zone2Stars || 0;
    game.stats.zone3Stars = game.stats.zone3Stars || 0;
    game.stats.zone4Stars = game.stats.zone4Stars || 0;
    game.stats.zone5Stars = game.stats.zone5Stars || 0;
    // Session-scoped stats must not carry over from the previous session.
    game.stats.sessionLevels = 0;
    game.stats.currentRetries = 0;
    game.stats.sessionStartTime = Date.now();
    game.levelsValidated = validateLevels();
    if (!game.levelsValidated) {
      console.warn('NightShiftDelivery: level validation failed. A map may be unreachable or impossible to finish.');
    }
    updateControls();
    
    // Show main menu on start
    showMainMenu();
    
    // Menu button handlers
    var renderLoopStarted = false;
    playButton.addEventListener('click', function() {
      hideMainMenu();
      // Start from last played level or level 0
      var startLevel = Math.max(0, Math.min(game.unlockedLevel - 1, LEVELS.length - 1));
      loadLevel(startLevel);
      // Only start one render loop, no matter how often Play is pressed.
      if (!renderLoopStarted) {
        renderLoopStarted = true;
        // Sync with the frame clock: the menu may have been open for a while
        // and a stale lastFrame would produce one huge first delta.
        lastFrame = performance.now();
        window.requestAnimationFrame(render);
      }
    });

    achievementsButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // The modal lives inside #app and the menu overlay sits on top of it —
      // swap the overlays first or the panel would render out of sight.
      openMainMenuOverlay();
      showAchievements();
    });

    settingsButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      openMainMenuOverlay();
      showSettings();
    });
    
    exitButton.addEventListener('click', function() {
      if (confirm('Exit Night Shift Delivery?')) {
        // Save before exit. Zero the session clock afterwards so the
        // beforeunload handler does not count this very stretch a second time.
        if (game.stats.sessionStartTime > 0) {
          game.stats.totalPlayTime += Math.floor((Date.now() - game.stats.sessionStartTime) / 1000);
          game.stats.sessionStartTime = 0;
        }
        saveProgress();
        window.close();
        // Tabs not opened by script cannot be closed via window.close().
        // Fall back to the main menu instead of a dead-looking app.
        window.setTimeout(function () {
          showMainMenu();
        }, 150);
      }
    });
    
    // Save play time on page unload
    window.addEventListener('beforeunload', function() {
      if (game.stats.sessionStartTime > 0) {
        var sessionTime = Math.floor((Date.now() - game.stats.sessionStartTime) / 1000);
        game.stats.totalPlayTime += sessionTime;
        saveProgress();
      }
    });

    // The level clock and the drones run on wall time, so leaving the tab
    // caused unfair deaths (gate closed / drone arrived while the player was
    // watching another tab). Auto-pause the moment the tab gets hidden.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && game.state === GameState.PLAYING && game.currentLevel) {
        showPause();
      }
    });

    // Main Menu Functions
    function drawMenuRobot() {
      if (!robotCtx) return;
      
      var time = performance.now();
      robotCtx.clearRect(0, 0, 200, 200);
      
      var cx = 100;
      var cy = 100;
      var bob = Math.sin(time / 500) * 5;
      
      // Shadow
      robotCtx.save();
      robotCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      robotCtx.beginPath();
      robotCtx.ellipse(cx, 170, 30, 10, 0, 0, Math.PI * 2);
      robotCtx.fill();
      
      // Robot body
      robotCtx.translate(cx, cy + bob);
      
      // Glow
      robotCtx.shadowColor = game.mode === 'night' ? '#e679ff' : '#61e4ff';
      robotCtx.shadowBlur = 20;
      
      // Main body
      robotCtx.fillStyle = '#dde5ee';
      robotCtx.beginPath();
      robotCtx.roundRect(-30, -30, 60, 55, 15);
      robotCtx.fill();
      
      // Visor
      robotCtx.shadowBlur = 10;
      robotCtx.fillStyle = '#252b43';
      robotCtx.beginPath();
      robotCtx.roundRect(-22, -18, 44, 25, 8);
      robotCtx.fill();
      
      // Eye glow
      robotCtx.shadowBlur = 15;
      robotCtx.fillStyle = '#80edff';
      robotCtx.fillRect(-15, -10, 12, 10);
      robotCtx.fillRect(3, -10, 12, 10);
      
      // Package
      robotCtx.shadowBlur = 8;
      robotCtx.fillStyle = '#ffab54';
      robotCtx.beginPath();
      robotCtx.roundRect(18, 12, 20, 20, 4);
      robotCtx.fill();
      
      // Package tape
      robotCtx.shadowBlur = 0;
      robotCtx.strokeStyle = '#ff8833';
      robotCtx.lineWidth = 2;
      robotCtx.beginPath();
      robotCtx.moveTo(18, 22);
      robotCtx.lineTo(38, 22);
      robotCtx.stroke();
      
      robotCtx.restore();
      
      // Animate continuously
      if (mainMenu && !mainMenu.classList.contains('hidden')) {
        requestAnimationFrame(drawMenuRobot);
      }
    }
    
    function updateMenuStats() {
      // Update play time
      var hours = Math.floor(game.stats.totalPlayTime / 3600);
      var minutes = Math.floor((game.stats.totalPlayTime % 3600) / 60);
      document.getElementById('totalPlayTime').textContent = hours + 'h ' + minutes + 'm';

      // Distinct completed levels (not cumulative completions)
      var completed = Object.keys(game.stats.completedLevels || {}).length;
      document.getElementById('levelsCompleted').textContent = completed + ' / ' + LEVELS.length;

      // Distinct starred levels
      var starred = Object.keys(game.stats.starredLevels || {}).length;
      document.getElementById('starsEarned').textContent = starred + ' / ' + LEVELS.length;

      // Update achievements
      var progress = window.getAchievementProgress(game.stats);
      document.getElementById('achievementCount').textContent = progress + '%';
    }
    
    function openMainMenuOverlay() {
      mainMenu.classList.add('hidden');
      appContainer.style.display = 'block';
    }

    function closeMainMenuOverlay() {
      hideModal();
      mainMenu.classList.remove('hidden');
      appContainer.style.display = 'none';
      drawMenuRobot();
    }

    function showMainMenu() {
      mainMenu.classList.remove('hidden');
      appContainer.style.display = 'none';
      updateMenuStats();
      drawMenuRobot();
      
      // Update play time
      if (game.stats.sessionStartTime > 0) {
        var sessionTime = Math.floor((Date.now() - game.stats.sessionStartTime) / 1000);
        game.stats.totalPlayTime += sessionTime;
      }
      game.stats.sessionStartTime = Date.now();
      saveProgress();
    }

    function hideMainMenu() {
      mainMenu.classList.add('hidden');
      appContainer.style.display = 'block';
      game.stats.sessionStartTime = Date.now();
    }

    function showAchievements() {
      clearModal();
      modalTitle.textContent = '🏆 ACHIEVEMENTS';
      
      var progress = window.getAchievementProgress(game.stats);
      var unlocked = window.getUnlockedAchievements(game.stats);
      
      modalText.innerHTML = '<div class="achievementProgress"><strong>Progress: ' + progress + '%</strong><div class="progressBar"><div class="progressFill" style="width:' + progress + '%">' + progress + '%</div></div></div>';
      
      var panel = document.createElement('div');
      panel.id = 'achievementPanel';
      
      for (var id in window.ACHIEVEMENTS) {
        var ach = window.ACHIEVEMENTS[id];
        var isUnlocked = window.checkAchievement(id, game.stats);
        var rarity = window.ACHIEVEMENT_RARITY[ach.rarity];
        
        var item = document.createElement('div');
        item.className = 'achievementItem' + (isUnlocked ? ' unlocked' : ' locked');
        if (isUnlocked) {
          item.style.borderColor = rarity.glow;
        }
        
        item.innerHTML = '<div class="achievementIcon">' + ach.icon + '</div>' +
          '<div class="achievementInfo"><h4 style="color:' + (isUnlocked ? rarity.color : '#888') + '">' + ach.name + '</h4>' +
          '<p>' + ach.description + '</p></div>';
        
        panel.appendChild(item);
      }
      
      modalText.appendChild(panel);
      modalButtons.appendChild(button('◀ BACK', closeMainMenuOverlay, true));
      modal.classList.remove('hidden');
    }

    function showSettings() {
      clearModal();
      modalTitle.textContent = '⚙ SETTINGS';
      
      var hours = Math.floor(game.stats.totalPlayTime / 3600);
      var minutes = Math.floor((game.stats.totalPlayTime % 3600) / 60);
      
      modalText.innerHTML = '<p><strong>Sound:</strong> ' + (game.audioEnabled ? 'ON ♬' : 'OFF ×') + '</p>' +
        '<p><strong>Play Time:</strong> ' + hours + 'h ' + minutes + 'm</p>' +
        '<p><strong>Best Times:</strong> ' + Object.keys(game.bestTimes).length + ' levels</p>' +
        '<p><strong>Highest Level:</strong> ' + game.unlockedLevel + '</p>' +
        '<p><strong>Achievements:</strong> ' + window.getAchievementProgress(game.stats) + '%</p>';
      
      modalButtons.appendChild(button(game.audioEnabled ? '🔇 MUTE SOUND' : '🔊 UNMUTE SOUND', function() {
        toggleSound();
        showSettings();
      }));
      modalButtons.appendChild(button('🗑️ RESET PROGRESS', function() {
        if (confirm('Reset all progress? This cannot be undone!')) {
          localStorage.removeItem(SAVE_KEY);
          location.reload();
        }
      }, true));
      modalButtons.appendChild(button('◀ BACK', closeMainMenuOverlay, true));
      modal.classList.remove('hidden');
    }

    // Track achievements
    function trackAchievement(event, data) {
      var stats = game.stats;

      switch(event) {
        case 'batteryCollected':
          stats.batteriesCollected++;
          stats.totalBatteries++;
          break;
        case 'levelComplete':
          stats.levelsCompleted++;
          stats.sessionLevels++;
          stats.highestLevel = Math.max(stats.highestLevel, data.levelId);
          if (data.time < (stats.fastestLevel == null ? 999 : stats.fastestLevel)) {
            stats.fastestLevel = data.time;
          }
          if (data.levelId === LEVELS.length) {
            stats.level35Complete = true;
          }
          stats.completedLevels = stats.completedLevels || {};
          stats.completedLevels[data.levelId] = true;
          stats.deathlessStreak++;
          var mapText = game.currentLevel.map.join('');
          if (mapText.indexOf('^') !== -1) {
            stats.spikeDeathlessStreak = game.spikeDiedThisRun ? 0 : stats.spikeDeathlessStreak + 1;
          }
          if (game.mobs.length > 0) {
            stats.droneDeathlessStreak = game.droneDiedThisRun ? 0 : stats.droneDeathlessStreak + 1;
          }
          break;
        case 'modeSwitch':
          stats.modeSwitches++;
          break;
        case 'gatePassed':
          stats.gatesPassed++;
          break;
        case 'death':
          stats.deathlessStreak = 0;
          stats.spikeDeathlessStreak = 0;
          stats.droneDeathlessStreak = 0;
          stats.currentRetries++;
          stats.maxRetries = Math.max(stats.maxRetries, stats.currentRetries);
          break;
        case 'levelStart':
          stats.levelsAttempted = Math.max(stats.levelsAttempted, data.levelId);
          // Only a *different* level clears the retry counter. Resetting on
          // every load made maxRetries impossible to build beyond 1 (the
          // automatic reload after every death also calls levelStart), which
          // left the 'persistent' achievement permanently unobtainable.
          if (game.lastStartedLevelId !== data.levelId) {
            stats.currentRetries = 0;
            game.lastStartedLevelId = data.levelId;
          }
          stats.attemptedLevels = stats.attemptedLevels || {};
          stats.attemptedLevels[data.levelId] = true;
          break;
        case 'starEarned':
          stats.starsCollected++;
          stats.starredLevels = stats.starredLevels || {};
          stats.starredLevels[data.levelId] = true;
          var zone = data.levelId <= 4 ? 1 : data.levelId <= 10 ? 2 : data.levelId <= 18 ? 3 : data.levelId <= 26 ? 4 : 5;
          stats['zone' + zone + 'Stars'] = (stats['zone' + zone + 'Stars'] || 0) + 1;
          break;
      }

      // Check for new achievements
      for (var id in window.ACHIEVEMENTS) {
        if (!game.unlockedAchievements[id] && window.checkAchievement(id, stats)) {
          game.unlockedAchievements[id] = true;
          showAchievementUnlocked(window.ACHIEVEMENTS[id]);
        }
      }

      saveProgress();
    }

    function showAchievementUnlocked(ach) {
      // Show achievement notification
      var notif = document.getElementById('achievementNotification');
      var icon = notif.querySelector('.icon');
      var title = document.getElementById('achNotifTitle');
      var desc = document.getElementById('achNotifDesc');
      
      icon.textContent = ach.icon;
      title.textContent = ach.name;
      desc.textContent = ach.description;
      
      // Show notification
      notif.classList.add('show');
      
      // Play sound and announce
      playSound('unlock');
      announce('Achievement unlocked: ' + ach.name);
      
      // Hide after 4 seconds — clear the pending timer from the previous
      // toast so a rapid second unlock does not hide it mid-flight.
      if (showAchievementUnlocked.timer) {
        window.clearTimeout(showAchievementUnlocked.timer);
      }
      showAchievementUnlocked.timer = window.setTimeout(function() {
        notif.classList.remove('show');
      }, 4000);
    }

    window.NightShiftDelivery = {
      levelsValidated: game.levelsValidated,
      validateLevels: validateLevels,
      loadLevel: loadLevel,
      getState: function () {
        return {
          level: game.currentLevel ? game.currentLevel.id : 0,
          mode: game.mode,
          batteries: collectedCount(),
          totalBatteries: game.batteries.length,
          state: game.state
        };
      }
    };
  }());

