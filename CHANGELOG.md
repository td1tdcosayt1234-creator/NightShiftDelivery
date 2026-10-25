# Changelog - Night Shift Delivery

## Version 2.0.2 - Bugfix Update 🧰

### Added
- **🛠 DEV button** on the board (top-left) — opens the level select in dev mode with every level unlocked, so each of the 35 levels can be loaded and tested with a single click. The live level is auto-paused behind the picker.

### Fixed
- **Achievements and Settings now actually open from the main menu** — the modal markup lives inside `#app`, which stayed `display:none` under the menu overlay, so both menu buttons looked dead. The menu now swaps out for the panel and returns via "◀ BACK".
- **"🔁 Never Give Up" is reachable again** — the retry counter was reset to 0 by *every* level load (including the automatic reload after each death), so `maxRetries` could never exceed 1. It now only resets when a different level starts.
- **★ badges and achievement stats always agree** — completion time is quantized once (`toFixed(1)`) before the star comparison, so the level-select badge can no longer show ★ while `starredLevels` (Perfect Zone(s), Star Collector, Absolute Perfection) records none.
- **Speed Demon recognizes instant completions** — a recorded best time of exactly `0` was treated as unset by the `fastestLevel || Infinity` check; the null-safe check also stops `undefined` from leaking into comparisons.
- **Tab switching no longer kills the courier** — the wall-clock level timer and drones kept running while the tab was hidden, causing unfair gate/drone deaths on return. The game now auto-pauses the moment the tab becomes hidden, and the render frame clock resyncs when Play starts.
- **Audio comes back on iOS Safari** — the AudioContext can start suspended under autoplay policy; `initAudio()` now resumes it whenever it is suspended.
- **Play time is no longer double counted** — the EXIT button and the `beforeunload` handler both charged the same wall-clock stretch; the session clock is zeroed after the exit accounting, and a failed `window.close()` now falls back to the main menu instead of a frozen-looking app.
- **Vertical drones draw vertical rails** — drone-rail markers (`M`) now pick their orientation from the patrol that actually covers the tile; vertical patrols used to render a horizontal rail.
- **Old saves upgrade safely** — every numeric/flag stat field is backfilled on load, so `undefined` can no longer leak `NaN` into `Math.max()` pairs and permanently corrupt stats.
- **Achievement toasts stack cleanly** — a second unlock no longer hides the first toast mid-animation (its 4 s hide timer is restarted per toast).
- **Dev tools**: `tools/validate.mjs` and `tools/smoke.mjs` DOM stubs updated so the smoke tests keep covering the new listeners used by game.js.

## Version 2.0.1 - Bugfix Update 🛠

### Fixed
- **All map rows are exactly 10 columns now** — 26 rows were 9 characters, which made the built-in level validation fail ("LEVEL CHECK FAILED") and left the rightmost column as a glitchy walkable void.
- **7 unsolvable levels repaired** (5, 6, 9, 12, 14, 15, 17) — missing corridors and gate connectors restored so every level can actually be finished.
- **Added the 17 missing Zone 4/5 levels (19–35)** that the menus, documentation and achievements already referenced — including "FINAL SHIFT" (12 ultra-fast drones, 300ms gate windows, 4 batteries, par 180s). All 35 levels are validated solvable on startup.
- **Modal markup added to index.html** (`#modal`, `#modalCard`, `#modalTitle`, `#modalText`, `#levelGrid`, `#modalButtons`) — pause, level select, delivery-complete, achievements and settings screens all crashed on a null modal before.
- **Achievements track distinct levels** (`completedLevels`, `starredLevels`, `attemptedLevels`) — "Delivery Master" can no longer be earned by replaying level 1 thirty-five times, and zone completions require finishing every level in that zone.
- **Fixed the zone star mapping** — Zone 2–5 stars were previously credited to the wrong zone, blocking the Perfect Zone achievements.
- **Fed the previously-dead achievement stats**: Day/Night time (Night Owl, Sun Worshipper), gate passes (Gate Crasher), and deathless / spike / drone streaks (Deathless, Spike Dancer, Ghost).
- **Stability**: one render loop no matter how often Play is pressed, main menu ignores game keys, timer stays frozen while paused, best-time/star display uses real distinct counts, and `speedDemon`/`finalShift` return proper booleans.
- **Dev tools**: `tools/validate.mjs` (row + solvability validator for all 35 levels) and `tools/smoke.mjs` (Node smoke test for the game API and achievement matrix).

## Version 2.0 - Major Expansion Update 🎮

### Added
- **17 new levels** (35 total, up from 18)
- **5 distinct zones** with progressive difficulty
- **Zone system** in level select UI
- **Star badges** for beating par times
- **Multiple battery mechanics** in advanced levels
- **Vertical drone movement** added (not just horizontal)
- **Up to 12 simultaneous drones** in nightmare levels
- **Ultra-fast timing challenges** in endgame

### Changed
- Level select grid: 6 columns → 8 columns
- Level select now scrollable with zone organization
- Drone speeds dramatically increased in later zones (620ms → 60ms)
- Gate opening windows reduced (1320ms → 300ms in final levels)
- Par times adjusted for difficulty
- Level progression now spans 5 distinct difficulty tiers

### Level Breakdown by Zone

#### Zone 1: Training (Levels 1-4)
- Core day/night mechanics
- No hazards, gentle learning curve

#### Zone 2: Hazards (Levels 5-10) 
- Spikes introduced (Level 5)
- First drone (Level 8)
- Vertical drone movement (Level 10)
- Basic combinations

#### Zone 3: Timing (Levels 11-18)
- Timed gates introduced (Level 12)
- Multiple drones with coordination
- All mechanics combined
- Original 18-level endpoint

#### Zone 4: Chaos (Levels 19-26) 🆕
- 3-6 drones per level
- Faster timing requirements  
- Dense spike formations
- Complex multi-hazard patterns
- Speed: 220-390ms drones
- Gates: 620-850ms windows

#### Zone 5: Nightmare (Levels 27-35) 🆕
- 8-12 drones per level
- Ultra-fast movement (60-210ms)
- Extremely short gate windows (300-580ms)
- Maximum spike density
- Multiple batteries (up to 4)
- Designed for expert players only
- Level 35: "FINAL SHIFT" - ultimate challenge

### Difficulty Scaling

**Early Game (1-10)**
- 0-2 drones
- Slow movement (530-620ms)
- Long gate windows (1180-2400ms)
- Few spikes
- Single battery

**Mid Game (11-18)**
- 1-2 drones
- Medium movement (400-500ms)
- Medium gates (880-1320ms)
- Moderate spikes
- 1-2 batteries

**Late Game (19-26)**
- 3-6 drones
- Fast movement (220-390ms)
- Short gates (620-850ms)
- Many spikes
- 2-3 batteries

**Endgame (27-35)**
- 8-12 drones
- Ultra-fast movement (60-210ms)
- Tiny gates (300-580ms)
- Extreme spike density
- 3-4 batteries

### Technical Improvements
- Zone-based level organization
- Improved level select UI with scrolling
- Better visual hierarchy for completed/starred levels
- Star badge system for par time achievements
- Extended save system for 35 levels

### Balance Changes
- Par times adjusted across all levels
- Difficulty curve smoothed across zones
- Late-game spike placement optimized
- Drone patrol patterns refined for fairness
- Gate timings carefully balanced

### Game Length
- Original: ~30-40 minutes to complete
- New: 2-3+ hours for full completion
- Significant replayability for star collection
- Challenge content for all skill levels

---

## Version 1.0 - Initial Release

### Features
- 18 handcrafted levels
- Day/Night switching mechanic
- Spikes, drones, and timed gates
- Touch and keyboard controls
- Progress saving
- Par time system
