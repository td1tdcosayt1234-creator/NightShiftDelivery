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

    var WIDTH = 960;
    var HEIGHT = 540;
    var TILE = 54;
    var COLS = 10;
    var ROWS = 8;
    var BOARD_X = 210;
    var BOARD_Y = 76;
    var SAVE_KEY = 'night-shift-delivery-save-v1';

    var GameState = {
      PLAYING: 'playing',
      FALLING: 'falling',
      LEVEL_COMPLETE: 'level_complete',
      PAUSED: 'paused',
      GAME_COMPLETE: 'game_complete'
    };

    function level(id, name, startMode, map, parTimeSeconds, hint, options) {
      options = options || {};
      return {
        id: id,
        name: name,
        startMode: startMode,
        map: map,
        parTimeSeconds: parTimeSeconds,
        hint: hint,
        mobs: options.mobs || [],
        gate: options.gate || null
      };
    }

    // Difficulty ramp: learn, spikes, patrol drones, timed gates, then combinations.
    var LEVELS = [
      // 1–4: core Day/Night puzzle only.
      level(1, 'First Shift', 'day', [
        '##########',
        '#S.NB...E#',
        '##########',
        '##########',
        '##########',
        '##########',
        '##########',
        '##########'
      ], 14, 'Learn the purple Night path.'),
      level(2, 'Blue Route', 'night', [
        '##########',
        '#S.D.B..E#',
        '##########',
        '##########',
        '##########',
        '##########',
        '##########',
        '##########'
      ], 14, 'Blue paths appear in Day.'),
      level(3, 'Purple Shortcut', 'day', [
        '##########',
        '#S..D..B.#',
        '########N#',
        '#E.......#',
        '##########',
        '##########',
        '##########',
        '##########'
      ], 20, 'Switch only from stable floor.'),
      level(4, 'Double Take', 'day', [
        '##########',
        '#S.D....E#',
        '###.####N#',
        '#B......N#',
        '##########',
        '##########',
        '##########',
        '##########'
      ], 22, 'Take the battery, then find the Night lane.'),

      // 5–7: static spikes arrive.
      level(5, 'Spike Avenue', 'day', [
        '##########',
        '#S.D.B...#',
        '########N#',
        '#E.....B.#',
        '##^#######',
        '##########',
        '##########',
        '##########'
      ], 26, 'Spikes restart the delivery. Keep to the safe route.'),
      level(6, 'Sharp Turn', 'night', [
        '##########',
        '#S.N.B...#',
        '########D#',
        '#E.....B.#',
        '#####^####',
        '##########',
        '##########',
        '##########'
      ], 26, 'Danger tiles are red. Do not step on them.'),
      level(7, 'Last Safe Tile', 'day', [
        '##########',
        '#S.D.B...#',
        '########N#',
        '#E.B...D.#',
        '###^######',
        '##########',
        '##########',
        '##########'
      ], 34, 'Switching on a faded path is also dangerous.'),

      // 8–11: patrol drones make timing matter.
      level(8, 'Drone Crossing', 'night', [
        '##########',
        '#S.N.B...#',
        '########D#',
        '#E.B.M.N.#',
        '##########',
        '##########',
        '##########',
        '##########'
      ], 38, 'Wait for the patrol drone, then cross its rail.', {
        mobs: [{ x: 5, y: 3, axis: 'x', min: 4, max: 6, speed: 620, offset: 0 }]
      }),
      level(9, 'Parcel Patrol', 'day', [
        '##########',
        '#S.D.B...#',
        '########N#',
        '#E.B.MD..#',
        '##########',
        '##########',
        '##########',
        '##########'
      ], 40, 'Drones loop back and forth. There is no need to rush.', {
        mobs: [{ x: 5, y: 3, axis: 'x', min: 4, max: 5, speed: 570, offset: 220 }]
      }),
      level(10, 'Long Way Home', 'night', [
        '##########',
        '#S.N.B...#',
        '########D#',
        '#E.B.MN..#',
        '##########',
        '##########',
        '##########',
        '##########'
      ], 40, 'Watch the drone before taking the narrow lane.', {
        mobs: [{ x: 5, y: 3, axis: 'x', min: 4, max: 6, speed: 530, offset: 100 }]
      }),
      level(11, 'Sunset Circuit', 'day', [
        '##########',
        '#S.D.....#',
        '###.####N#',
        '#B..M...N#',
        '#######DB#',
        '#######E##',
        '##########',
        '##########'
      ], 48, 'The drone patrols an early route; the exit is lower down.', {
        mobs: [{ x: 4, y: 3, axis: 'x', min: 3, max: 5, speed: 500, offset: 130 }]
      }),

      // 12–14: blinking gates need patience.
      level(12, 'Signal Garden', 'night', [
        '##########',
        '#S.N.....#',
        '###.####D#',
        '#B...T..D#',
        '#######NB#',
        '#######E##',
        '##########',
        '##########'
      ], 52, 'Yellow gates open and close. Wait for the bright opening.', {
        gate: { period: 2400, openFor: 1320, offset: 0 }
      }),
      level(13, 'Three Stops', 'day', [
        '##########',
        '#S.D.B...#',
        '########N#',
        '#...B.TD.#',
        '####N#####',
        '#E..B....#',
        '###^######',
        '##########'
      ], 58, 'Gates, spikes, and phase paths must be read together.', {
        gate: { period: 2300, openFor: 1220, offset: 350 }
      }),
      level(14, 'Blue Before Dawn', 'night', [
        '##########',
        '#S.N.B...#',
        '########D#',
        '#...B.TN.#',
        '####D#####',
        '#E..B....#',
        '######^###',
        '##########'
      ], 58, 'Pause on safe floor, then choose the right moment.', {
        gate: { period: 2200, openFor: 1180, offset: 150 }
      }),

      // 15–18: all systems combine.
      level(15, 'Moonlit Detour', 'day', [
        '##########',
        '#S.D.B...#',
        '########N#',
        '#..B.M.D.#',
        '###N######',
        '#ETB.....#',
        '#####^####',
        '##########'
      ], 66, 'The final exit gate needs one well-timed crossing.', {
        mobs: [{ x: 5, y: 3, axis: 'x', min: 4, max: 6, speed: 500, offset: 0 }],
        gate: { period: 2150, openFor: 1120, offset: 340 }
      }),
      level(16, 'Battery Boulevard', 'night', [
        '##########',
        '#S.N.B...#',
        '########D#',
        '#..B.M.N.#',
        '###D######',
        '#ETB.....#',
        '#######^##',
        '##########'
      ], 66, 'Drones and gates are safer when you wait on solid floor.', {
        mobs: [{ x: 5, y: 3, axis: 'x', min: 4, max: 6, speed: 480, offset: 200 }],
        gate: { period: 2100, openFor: 1080, offset: 100 }
      }),
      level(17, 'Final Delivery', 'day', [
        '##########',
        '#S.D....B#',
        '#######N##',
        '#..B.MN..#',
        '###D######',
        '#ETB.....#',
        '######^###',
        '##########'
      ], 72, 'Read the whole route before crossing the drone rail.', {
        mobs: [{ x: 5, y: 3, axis: 'x', min: 4, max: 5, speed: 460, offset: 180 }],
        gate: { period: 2050, openFor: 1030, offset: 420 }
      }),
      level(18, 'Sunrise Terminal', 'night', [
        '##########',
        '#S.N....B#',
        '#######D##',
        '#..B.MD..#',
        '###N######',
        '#ETB.....#',
        '####^#####',
        '##########'
      ], 72, 'One final route: switch, wait, dodge, and deliver.', {
        mobs: [{ x: 5, y: 3, axis: 'x', min: 4, max: 5, speed: 440, offset: 70 }],
        gate: { period: 1980, openFor: 980, offset: 240 }
      })
    ];

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
      hintModeVisible: true
    };

    var rain = [];
    var swipeStart = null;
    var audioContext = null;
    var lastFrame = performance.now();

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
      var fallback = { version: 1, unlockedLevel: 1, bestTimes: {}, audioEnabled: true };
      try {
        var raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return fallback;
        var saved = JSON.parse(raw);
        if (!saved || saved.version !== 1) return fallback;
        return {
          version: 1,
          unlockedLevel: Math.max(1, Math.min(LEVELS.length, Number(saved.unlockedLevel) || 1)),
          bestTimes: saved.bestTimes && typeof saved.bestTimes === 'object' ? saved.bestTimes : {},
          audioEnabled: saved.audioEnabled !== false
        };
      } catch (error) {
        return fallback;
      }
    }

    function saveProgress() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          version: 1,
          unlockedLevel: game.unlockedLevel,
          bestTimes: game.bestTimes,
          audioEnabled: game.audioEnabled
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
      if (!game.audioEnabled || audioContext) return;
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioContext = new Ctx();
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
        startFall('Spikes hit the courier');
        return;
      }
      if (hasMobAt(nx, ny)) {
        startFall('A patrol drone caught the courier');
        return;
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
        startFall('The phase path faded away');
        return;
      }
      game.mode = nextMode;
      game.transitionAt = performance.now();
      playSound('switch');
      updateControls();
      announce(game.mode === 'day' ? 'Day mode.' : 'Night mode.');
    }

    function startFall(reason) {
      if (game.state !== GameState.PLAYING) return;
      game.state = GameState.FALLING;
      game.fallAt = performance.now();
      playSound('fall');
      announce((reason || 'Unsafe move') + '. Restarting level.');
      window.setTimeout(function () {
        if (game.state === GameState.FALLING) loadLevel(game.levelIndex);
      }, 420);
    }

    function checkActiveDangers() {
      if (game.state !== GameState.PLAYING) return;
      var standingTile = tileAt(game.player.x, game.player.y);
      if (standingTile === '^') {
        startFall('Spikes hit the courier');
        return;
      }
      if (standingTile === 'T' && !isGateOpen()) {
        startFall('The timed gate closed');
        return;
      }
      if (hasMobAt(game.player.x, game.player.y)) {
        startFall('A patrol drone caught the courier');
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
      var time = currentElapsed();
      var id = String(game.currentLevel.id);
      var oldBest = Number(game.bestTimes[id]);
      var isBest = !oldBest || time < oldBest;
      if (isBest) game.bestTimes[id] = Number(time.toFixed(1));
      if (game.currentLevel.id < LEVELS.length) {
        game.unlockedLevel = Math.max(game.unlockedLevel, game.currentLevel.id + 1);
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
      modalText.innerHTML = 'Level time: <strong>' + formatTime(time) + '</strong><br>' +
        'Target: ' + formatTime(target) + (time <= target ? ' — beaten!' : '') + '<br>' +
        (isBest ? 'New best time!' : 'Best time: ' + formatTime(game.bestTimes[String(game.currentLevel.id)]));
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
      modalButtons.appendChild(button('RESUME', resumeGame));
      modalButtons.appendChild(button('RESTART LEVEL', restartLevel, true));
      modalButtons.appendChild(button('LEVEL SELECT', showLevelSelect, true));
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
      LEVELS.forEach(function (levelData, index) {
        var unlocked = levelData.id <= game.unlockedLevel;
        var entry = document.createElement('button');
        var best = Number(game.bestTimes[String(levelData.id)]);
        entry.className = 'levelButton' + (unlocked ? '' : ' locked') + (best ? ' done' : '');
        entry.disabled = !unlocked;
        entry.innerHTML = unlocked
          ? String(levelData.id) + (best ? '<span class="bestTime">' + formatTime(best) + '</span>' : '')
          : '🔒';
        entry.setAttribute('aria-label', unlocked ? 'Play level ' + levelData.id + ': ' + levelData.name : 'Level ' + levelData.id + ' locked');
        if (unlocked) {
          entry.addEventListener('click', function () { loadLevel(index); });
        }
        levelGrid.appendChild(entry);
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
        ctx.fillStyle = '#ff7890';
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 41);
        ctx.lineTo(x + 22, y + 17);
        ctx.lineTo(x + 32, y + 41);
        ctx.lineTo(x + 42, y + 17);
        ctx.lineTo(x + 50, y + 41);
        ctx.closePath();
        ctx.fill();
      }
      if (cell === 'M') {
        ctx.strokeStyle = '#82bcff';
        ctx.globalAlpha = .65;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 9, y + TILE / 2);
        ctx.lineTo(x + TILE - 9, y + TILE / 2);
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
    game.levelsValidated = validateLevels();
    if (!game.levelsValidated) {
      console.warn('NightShiftDelivery: level validation failed. A map may be unreachable or impossible to finish.');
    }
    updateControls();
    loadLevel(0);
    window.requestAnimationFrame(render);

    window.NightShiftDelivery = {
      levelsValidated: game.levelsValidated,
      validateLevels: validateLevels,
      loadLevel: loadLevel,
      getState: function () {
        return {
          level: game.currentLevel.id,
          mode: game.mode,
          batteries: collectedCount(),
          totalBatteries: game.batteries.length,
          state: game.state
        };
      }
    };
  }());

