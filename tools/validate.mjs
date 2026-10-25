// Dev tool: validates every level (row widths + solvability) using the same
// rules as game.js (spikes are walls, D/N tiles are mode-only, E needs all
// batteries, T counts as walkable for the static path).
//
// Usage:  node tools/validate.mjs
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// ---- minimal DOM/browser stubs so the game scripts can load in Node ----
const noop = () => {};
const ctxStub = new Proxy({}, {
  get(target, prop) { return prop in target ? target[prop] : noop; },
  set(target, prop, value) { target[prop] = value; return true; }
});
function makeElement() {
  const el = {
    style: {}, dataset: {}, hidden: false, disabled: false,
    className: '', textContent: '', innerHTML: '', id: '',
    addEventListener: noop, removeEventListener: noop, setAttribute: noop,
    appendChild: noop, querySelector: () => null, querySelectorAll: () => [],
    getContext: () => ctxStub,
    classList: { add: noop, remove: noop, contains: () => false }
  };
  return el;
}
const elements = new Map();
globalThis.window = globalThis;
globalThis.document = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  createElement: () => makeElement(),
  querySelectorAll: () => [],
  addEventListener: noop,
  removeEventListener: noop
};
globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
globalThis.requestAnimationFrame = () => 0;
globalThis.confirm = () => false;
globalThis.getComputedStyle = () => ({ display: 'block' });
globalThis.addEventListener = noop;
globalThis.removeEventListener = noop;
globalThis.CanvasRenderingContext2D = { prototype: {} };

require('../levels.js');
require('../achievements.js');
// game.js has some module-load debug logs; silence them for clean output.
const realLog = console.log;
console.log = noop;
try { require('../game.js'); } finally { console.log = realLog; }

const LEVELS = globalThis.LEVEL_DEFINITIONS;
const COLS = 10;
const ROWS = 8;

// ---- 1. structure audit ----
let structuralOk = true;
LEVELS.forEach((level) => {
  if (level.set?.gate) return;
  if (level.map.length !== ROWS) { console.log(`level ${level.id}: ${level.map.length} rows (want ${ROWS})`); structuralOk = false; }
  level.map.forEach((row, y) => {
    if (row.length !== COLS) { console.log(`level ${level.id} row ${y}: ${row.length} chars (${row})`); structuralOk = false; }
  });
});

// ---- 2. per-level solvability BFS (mirrors game.js validateLevel) ----
function validate(level) {
  let start = null; let exit = null; const batteries = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = level.map[y][x];
      if (c === 'S') start = { x, y };
      if (c === 'E') exit = { x, y };
      if (c === 'B') batteries.push(`${x},${y}`);
    }
  }
  if (!start || !exit) return 'missing S/E';
  const batteryIndex = new Map(batteries.map((k, i) => [k, i]));
  const target = (1 << batteries.length) - 1;
  const walkable = (x, y, mode, mask) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    const c = level.map[y][x];
    if (c === '#' || c === '^') return false;
    if (c === 'D') return mode === 'day';
    if (c === 'N') return mode === 'night';
    if (c === 'E') return mask === target;
    return true;
  };
  const seen = new Set();
  const queue = [{ x: start.x, y: start.y, mode: level.startMode, mask: 0 }];
  while (queue.length) {
    const node = queue.shift();
    const key = `${node.x},${node.y},${node.mode},${node.mask}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (node.x === exit.x && node.y === exit.y && node.mask === target) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = node.x + dx; const ny = node.y + dy;
      if (!walkable(nx, ny, node.mode, node.mask)) continue;
      let nextMask = node.mask;
      const bi = batteryIndex.get(`${nx},${ny}`);
      if (bi !== undefined) nextMask |= (1 << bi);
      queue.push({ x: nx, y: ny, mode: node.mode, mask: nextMask });
    }
    const nextMode = node.mode === 'day' ? 'night' : 'day';
    if (walkable(node.x, node.y, nextMode, node.mask)) {
      queue.push({ x: node.x, y: node.y, mode: nextMode, mask: node.mask });
    }
  }
  return 'unsolvable';
}

// ---- 3. sanity: gates exist where T tiles exist, mobs inside bounds ----
function sanity(level) {
  const issues = [];
  const hasT = level.map.some((row) => row.includes('T'));
  if (hasT && !level.gate) issues.push('has T tiles but no gate timing');
  if (!hasT && level.gate) issues.push('gate timing but no T tile');
  level.mobs.forEach((mob, i) => {
    if (mob.axis === 'x') {
      if (mob.min < 0 || mob.max > 9) issues.push(`mob ${i} x-range ${mob.min}..${mob.max} outside board`);
      if (mob.speed <= 0) issues.push(`mob ${i} bad speed`);
    } else if (mob.axis === 'y') {
      if (mob.min < 0 || mob.max > 7) issues.push(`mob ${i} y-range ${mob.min}..${mob.max} outside board`);
      if (mob.speed <= 0) issues.push(`mob ${i} bad speed`);
    } else issues.push(`mob ${i} unknown axis ${mob.axis}`);
    if (mob.min > mob.max) issues.push(`mob ${i} min>max`);
  });
  return issues;
}

console.log(`total levels: ${LEVELS.length}`);
let allOk = true;
for (const level of LEVELS) {
  const result = validate(level);
  const issues = sanity(level);
  if (result !== true || issues.length) {
    allOk = false;
    console.log(`level ${String(level.id).padStart(2, ' ')} (${level.name}): ${result === true ? 'reachable' : result} ${issues.length ? '| ' + issues.join('; ') : ''}`);
  }
}
console.log(`game.js validateLevels(): ${globalThis.NightShiftDelivery.levelsValidated}`);
console.log(allOk && structuralOk ? 'ALL LEVELS OK' : 'PROBLEMS FOUND — see above');
process.exitCode = allOk && structuralOk && globalThis.NightShiftDelivery.levelsValidated ? 0 : 1;
