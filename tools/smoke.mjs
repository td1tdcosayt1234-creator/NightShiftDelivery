// Dev tool: smoke-tests the game logic in Node.
// - boots the real game code on DOM stubs
// - loads levels via the public API
// - evaluates every achievement against maxed-out stats and fresh stats
//
// Usage:  node tools/smoke.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// ---- DOM/browser stubs (same as validate.mjs) ----
const noop = () => {};
const ctxStub = new Proxy({}, {
  get(target, prop) { return prop in target ? target[prop] : noop; },
  set(target, prop, value) { target[prop] = value; return true; }
});
function makeElement() {
  return {
    style: {}, dataset: {}, hidden: false, disabled: false,
    className: '', textContent: '', innerHTML: '', id: '',
    addEventListener: noop, removeEventListener: noop, setAttribute: noop,
    appendChild: noop, querySelector: () => ({ textContent: '' }), querySelectorAll: () => [],
    getContext: () => ctxStub,
    classList: { add: noop, remove: noop, contains: () => false }
  };
}
const elements = new Map();
globalThis.window = globalThis;
globalThis.document = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  createElement: () => makeElement(),
  querySelectorAll: () => []
};
globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
globalThis.requestAnimationFrame = () => 0;
globalThis.confirm = () => false;
globalThis.addEventListener = noop;
globalThis.removeEventListener = noop;
globalThis.getComputedStyle = () => ({ display: 'block' });
globalThis.CanvasRenderingContext2D = { prototype: {} };

require('../levels.js');
require('../achievements.js');
const realLog = console.log;
console.log = noop;
try { require('../game.js'); } finally { console.log = realLog; }

let failures = 0;
function expect(name, actual, wanted) {
  const ok = actual === wanted;
  if (!ok) { failures++; console.log(`FAIL ${name}: got ${JSON.stringify(actual)}, want ${JSON.stringify(wanted)}`); }
  else console.log(`ok   ${name}`);
}

const api = window.NightShiftDelivery;

// ---- level loading through the public API ----
api.loadLevel(0);
expect('getState after loadLevel(0).level', api.getState().level, 1);
expect('getState state', api.getState().state, 'playing');
api.loadLevel(34);
expect('getState final level', api.getState().level, 35);
expect('levelsValidated', api.levelsValidated, true);

// ---- achievement matrix ----
const ACH = window.ACHIEVEMENTS;
const fresh = {}; // empty stats
const maxed = {
  batteriesCollected: 35, totalBatteries: 150, levelsCompleted: 35, sessionLevels: 10,
  modeSwitches: 3, highestLevel: 35, fastestLevel: 9.9, deathlessStreak: 5,
  spikeDeathlessStreak: 5, droneDeathlessStreak: 5, gatesPassed: 50, starsCollected: 35,
  level35Complete: true, maxRetries: 10, levelsAttempted: 35,
  nightModeTime: 120, dayModeTime: 40,
  completedLevels: {}, starredLevels: {}, attemptedLevels: {}
};
for (let id = 1; id <= 35; id++) {
  maxed.completedLevels[id] = true;
  maxed.starredLevels[id] = true;
  maxed.attemptedLevels[id] = true;
}

// nightOwl / sunWorshipper are mutually exclusive — handled separately below.
for (const id in ACH) {
  if (id === 'nightOwl' || id === 'sunWorshipper') continue;
  const unlockedMax = window.checkAchievement(id, maxed);
  const unlockedFresh = window.checkAchievement(id, fresh);
  // every achievement unlocks on a fully-maxed save
  expect(`maxed unlocks ${id}`, unlockedMax, true);
  // none of them unlock on a fresh save
  expect(`fresh locked ${id}`, unlockedFresh, false);
}
expect('nightOwl when night dominates', window.checkAchievement('nightOwl', maxed), true);
expect('sunWorshipper locked when night dominates', window.checkAchievement('sunWorshipper', maxed), false);
const dayDominated = Object.assign({}, maxed, { nightModeTime: 40, dayModeTime: 120 });
expect('sunWorshipper when day dominates', window.checkAchievement('sunWorshipper', dayDominated), true);
expect('nightOwl locked when day dominates', window.checkAchievement('nightOwl', dayDominated), false);

console.log(failures === 0 ? 'SMOKE TEST PASSED' : `${failures} FAILURES`);
process.exitCode = failures === 0 ? 0 : 1;
